/**
 * ╔══════════════════════════════════════╗
 * ║       KEVOO BOT – UTILITIES         ║
 * ╚══════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import config from '../config.js';

/**
 * Extract text body from any message type
 */
export function extractMessageText(msg) {
  try {
    const m = msg.message;
    if (!m) return '';

    // Handle viewOnce
    const inner = m.viewOnceMessage?.message ||
                  m.viewOnceMessageV2?.message ||
                  m.viewOnceMessageV2Extension?.message ||
                  m;

    return (
      inner.conversation ||
      inner.extendedTextMessage?.text ||
      inner.imageMessage?.caption ||
      inner.videoMessage?.caption ||
      inner.documentMessage?.caption ||
      inner.buttonsResponseMessage?.selectedButtonId ||
      inner.listResponseMessage?.singleSelectReply?.selectedRowId ||
      inner.templateButtonReplyMessage?.selectedId ||
      ''
    );
  } catch {
    return '';
  }
}

/**
 * Parse command from text
 */
export function parseCommand(text) {
  const prefix = config.prefix;
  const trimmed = text.trim();

  if (!trimmed.startsWith(prefix)) {
    return { isCmd: false, command: '', args: [], fullArgs: '' };
  }

  const withoutPrefix = trimmed.slice(prefix.length).trim();
  const parts = withoutPrefix.split(/\s+/);
  const command = (parts.shift() || '').toLowerCase();
  const args = parts;
  const fullArgs = parts.join(' ');

  return { isCmd: true, command, args, fullArgs };
}

/**
 * Get a random element from an array
 */
export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Delay helper
 */
export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ensure temp directory exists
 */
export function ensureTempDir() {
  const dir = config.tempDir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

/**
 * Clean temp files older than 5 minutes
 */
export function cleanTemp() {
  try {
    const dir = config.tempDir;
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    const now = Date.now();
    for (const file of files) {
      const fp = path.join(dir, file);
      const stat = fs.statSync(fp);
      if (now - stat.mtimeMs > 5 * 60 * 1000) {
        fs.unlinkSync(fp);
      }
    }
  } catch {
    // ignore
  }
}

/**
 * Format uptime
 */
export function formatUptime(ms) {
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}

/**
 * Sanitize user input (strip control chars, limit length)
 */
export function sanitize(input, maxLen = 2000) {
  if (typeof input !== 'string') return '';
  // Strip zero-width and control chars
  return input
    .replace(/[\u0000-\u001F\u200B-\u200D\uFEFF]/g, '')
    .slice(0, maxLen)
    .trim();
}

/**
 * Check if JID is a group
 */
export function isGroup(jid) {
  return jid?.endsWith('@g.us') || false;
}

/**
 * Get sender JID from message key
 */
export function getSender(msg) {
  return msg.key.participant || msg.key.remoteJid || '';
}

// Run temp cleaner every 3 minutes
setInterval(cleanTemp, 3 * 60 * 1000);
