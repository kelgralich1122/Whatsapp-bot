/**
 * ╔══════════════════════════════════════╗
 * ║  KEVOO BOT – MESSAGE HANDLER        ║
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

  // ─── AI Chat (no-prefix mode) ───────────────────
  if (config.aiEnabled && !isGroup(jid)) {
    // Only respond to DMs with AI if enabled
    try {
      if (config.autoTyping) {
        await sock.sendPresenceUpdate('composing', jid);
      }

      const userJid = sender || jid;
      if (!isAllowed(userJid)) return;

      const reply = await chatAI(text);
      await sock.sendMessage(jid, { text: reply }, { quoted: msg });

      if (config.autoTyping) {
        await sock.sendPresenceUpdate('paused', jid);
      }
    } catch (err) {
      logger.error('AI chat error:', err.message);
    }
  }
}

export default { initMessageHandler };
