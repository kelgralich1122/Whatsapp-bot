/**
 * Command: tiktok
 * Download TikTok videos without watermark
 */

import { downloadTikTok } from '../lib/apiClient.js';

export default {
  name: 'tiktok',
  aliases: ['tt', 'ttdl'],
  category: 'Media',
  description: 'Download TikTok video (no watermark)',
  usage: '.tiktok <url>',

  handler: async (sock, msg, { jid, fullArgs }) => {
    if (!fullArgs || !fullArgs.includes('tiktok.com')) {
      await sock.sendMessage(jid, {
        text: '❌ Please provide a valid TikTok URL.\n\n*Usage:* .tiktok https://vt.tiktok.com/xxx',
      }, { quoted: msg });
      return;
    }

    await sock.sendMessage(jid, {
      text: '⏳ Downloading TikTok video...',
    }, { quoted: msg });

    const result = await downloadTikTok(fullArgs.trim());

    if (!result) {
      await sock.sendMessage(jid, {
        text: '❌ Failed to download. The video may be private or the URL is invalid.',
      }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(jid, {
        video: { url: result.videoUrl },
        caption: `🎵 *${result.title}*\n👤 ${result.author}\n\n_Downloaded by KevooBot_ ⚡`,
        mimetype: 'video/mp4',
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to send video: ${err.message}`,
      }, { quoted: msg });
    }
  },
};
