/**
 * Command: sticker
 * Convert image/video to WhatsApp sticker
 */

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { ensureTempDir } from '../lib/utils.js';
import logger from '../lib/logger.js';

export default {
  name: 'sticker',
  aliases: ['s', 'stk'],
  category: 'Tools',
  description: 'Convert image/video to sticker',
  usage: '.sticker (reply to or send with image)',

  handler: async (sock, msg, { jid }) => {
    const message = msg.message;

    // Check for image in direct message or quoted message
    const imgMsg =
      message?.imageMessage ||
      message?.videoMessage ||
      message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage ||
      message?.extendedTextMessage?.contextInfo?.quotedMessage?.videoMessage;

    if (!imgMsg) {
      await sock.sendMessage(jid, {
        text: '❌ Send or reply to an image/video with *.sticker*',
      }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(jid, { text: '⏳ Creating sticker...' }, { quoted: msg });

      // Build the proper message structure for downloadMediaMessage
      let downloadMsg = msg;

      // If it's a quoted message, reconstruct
      const quotedMsg = message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (quotedMsg) {
        downloadMsg = {
          key: {
            ...msg.key,
            id: message?.extendedTextMessage?.contextInfo?.stanzaId,
            participant: message?.extendedTextMessage?.contextInfo?.participant,
          },
          message: quotedMsg,
        };
      }

      const buffer = await downloadMediaMessage(downloadMsg, 'buffer', {});

      await sock.sendMessage(jid, {
        sticker: buffer,
      }, { quoted: msg });
    } catch (err) {
      logger.error('Sticker creation failed:', err.message);
      await sock.sendMessage(jid, {
        text: `❌ Failed to create sticker: ${err.message}`,
      }, { quoted: msg });
    }
  },
};
