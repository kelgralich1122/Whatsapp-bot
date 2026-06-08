/**
 * ╔══════════════════════════════════════╗
 * ║  KEVOO BOT – MESSAGE HANDLER        ║
 * ║     v2.0 with Relationship Mode     ║
 * ╚══════════════════════════════════════╝
 * Processes incoming messages, routes to commands
 */

import config from '../config.js';
import logger from './logger.js';
import { getCommand } from './commandLoader.js';
import { isAllowed } from './rateLimit.js';
import { chatAI } from './apiClient.js';
import {
  extractMessageText,
  parseCommand,
  randomPick,
  sanitize,
  isGroup,
  getSender,
  delay,
} from './utils.js';
import {
  isTestContact,
  checkCooldown,
  getAutoReplyTemplate,
  isOwnerQuery,
  getOwnerResponse,
  generateRelationshipResponse,
  logAutomationAction,
} from './relationshipMode.js';
import { logInteraction } from './interactionLogger.js';

// Debounce map to prevent duplicate processing
const processedMessages = new Set();
const DEBOUNCE_TTL = 10_000; // 10 seconds

/**
 * Initialize message handler on the socket
 */
export function initMessageHandler(sock) {
  sock.ev.on('messages.upsert', async (upsert) => {
    try {
      if (upsert.type !== 'notify') return;

      for (const msg of upsert.messages) {
        // Don't process if no message content
        if (!msg.message) continue;

        // Skip status broadcasts
        if (msg.key.remoteJid === 'status@broadcast') continue;

        // Skip if from self
        if (msg.key.fromMe) continue;

        // Skip newsletter messages
        if (msg.key.remoteJid?.endsWith('@newsletter')) continue;

        // Debounce: skip duplicate message IDs
        const msgId = msg.key.id;
        if (processedMessages.has(msgId)) continue;
        processedMessages.add(msgId);
        setTimeout(() => processedMessages.delete(msgId), DEBOUNCE_TTL);

        // Process in background - don't block the event loop
        handleMessage(sock, msg).catch((err) => {
          logger.error('Unhandled message error:', err.message);
        });
      }
    } catch (err) {
      logger.error('messages.upsert error:', err.message);
    }
  });

  logger.success('Message handler initialized');
}

/**
 * Handle a single incoming message
 */
async function handleMessage(sock, msg) {
  const jid = msg.key.remoteJid;
  const sender = getSender(msg);
  const rawText = extractMessageText(msg);
  const text = sanitize(rawText);

  if (!text || !jid) return;

  // ─── Auto Read ──────────────────────────────────
  if (config.autoRead) {
    try {
      await sock.readMessages([msg.key]);
    } catch {
      // silently fail
    }
  }

  // ─── Auto React ─────────────────────────────────
  if (config.autoReact) {
    try {
      const emoji = randomPick(config.reactEmojis);
      await sock.sendMessage(jid, {
        react: { text: emoji, key: msg.key },
      });
    } catch {
      // silently fail
    }
  }

  // ─── Relationship Assistant Mode ────────────────
  // Check if message is from girlfriend/test contact
  if (isTestContact(sender)) {
    logger.bot('💕 [RELATIONSHIP MODE] Message from girlfriend detected!');

    // Check cooldown to avoid spam
    if (!checkCooldown(sender)) {
      logger.warn('⏳ Girlfriend in cooldown period, skipping auto-reply');
      logInteraction({
        sender,
        type: 'relationship',
        action: 'cooldown_active',
        metadata: { reason: 'spam_prevention' },
      });
      // Still process other features
    } else {
      // Send playful auto-reply
      const autoReply = getAutoReplyTemplate();
      await sock.sendMessage(jid, {
        text: autoReply,
      }, { quoted: msg });

      logAutomationAction(sender, 'AUTO_REPLY_SENT', {
        template: autoReply,
        timestamp: new Date().toISOString(),
      });

      logInteraction({
        sender,
        type: 'relationship',
        action: 'auto_reply_sent',
        content: autoReply,
      });
    }
  }

  // ─── Private mode check ─────────────────────────
  if (config.botMode === 'private') {
    const senderNum = (sender || jid).replace(/[^0-9]/g, '');
    const ownerNum = config.ownerNumber.replace(/[^0-9]/g, '');
    if (senderNum !== ownerNum) return;
  }

  // ─── Parse Command ─────────────────────────────
  const { isCmd, command, args, fullArgs } = parseCommand(text);

  if (isCmd) {
    // Rate limit check
    const userJid = sender || jid;
    if (!isAllowed(userJid)) {
      await sock.sendMessage(jid, {
        text: '⚠️ Slow down! You\'re sending commands too fast.',
      }, { quoted: msg });
      return;
    }

    // Show typing indicator
    if (config.autoTyping) {
      try {
        await sock.sendPresenceUpdate('composing', jid);
      } catch { /* ignore */ }
    }

    // Find and execute command
    const cmd = getCommand(command);
    if (cmd) {
      logger.cmd(
        `${command} | from: ${sender || jid} | group: ${isGroup(jid)} | args: ${fullArgs || '(none)'}`
      );

      try {
        await cmd.handler(sock, msg, { args, fullArgs, command, sender, jid });

        // Log command execution
        logInteraction({
          sender,
          type: 'command',
          action: command,
          content: fullArgs || '(no args)',
        });
      } catch (err) {
        logger.error(`Command "${command}" error:`, err.message);
        await sock.sendMessage(jid, {
          text: `❌ Error executing *${command}*:\n${err.message}`,
        }, { quoted: msg });
      }
    } else {
      // Unknown command
      await sock.sendMessage(jid, {
        text: `❓ Unknown command: *${config.prefix}${command}*\nType *${config.prefix}menu* to see available commands.`,
      }, { quoted: msg });
    }

    // Stop typing
    if (config.autoTyping) {
      try {
        await sock.sendPresenceUpdate('paused', jid);
      } catch { /* ignore */ }
    }

    return;
  }

  // ─── Check for Owner Query ──────────────────────
  if (isOwnerQuery(text)) {
    const ownerResponse = getOwnerResponse();
    await sock.sendMessage(jid, {
      text: ownerResponse,
    }, { quoted: msg });

    logInteraction({
      sender,
      type: 'query',
      action: 'owner_query',
      content: text,
    });

    return;
  }

  // ─── AI Chat (no-prefix mode) ───────────────────
  if (config.aiEnabled && !isGroup(jid)) {
    // Only respond to DMs with AI if enabled
    try {
      if (config.autoTyping) {
        await sock.sendPresenceUpdate('composing', jid);
      }

      const userJid = sender || jid;
      if (!isAllowed(userJid)) return;

      let reply;

      // Use relationship response if from girlfriend
      if (isTestContact(sender)) {
        reply = generateRelationshipResponse(text);
        logger.bot('💕 Using relationship response mode');
      } else {
        reply = await chatAI(text);
      }

      await sock.sendMessage(jid, { text: reply }, { quoted: msg });

      logInteraction({
        sender,
        type: 'ai_chat',
        action: 'response_sent',
        content: text,
        metadata: { isRelationshipMode: isTestContact(sender) },
      });

      if (config.autoTyping) {
        await sock.sendPresenceUpdate('paused', jid);
      }
    } catch (err) {
      logger.error('AI chat error:', err.message);
    }
  }
}

export default { initMessageHandler };