/**
 * Command: ytvideo
 * Download YouTube video (MP4)
 */

import { downloadYouTube } from '../lib/apiClient.js';

export default {
  name: 'ytvideo',
  aliases: ['ytv', 'video'],
  category: 'Media',
  description: 'Download YouTube video (MP4)',
  usage: '.ytvideo <youtube url>',

  handler: async (sock, msg, { jid, fullArgs }) => {
    if (!fullArgs || (!fullArgs.includes('youtube.com') && !fullArgs.includes('youtu.be'))) {
      await sock.sendMessage(jid, {
        text: '❌ Please provide a valid YouTube URL.\n\n*Usage:* .ytvideo https://youtu.be/xxx',
      }, { quoted: msg });
      return;
    }

    await sock.sendMessage(jid, {
      text: '⏳ Downloading video from YouTube...',
    }, { quoted: msg });

    const result = await downloadYouTube(fullArgs.trim(), 'video');

    if (!result) {
      await sock.sendMessage(jid, {
        text: '❌ Failed to download. Please check the URL and try again.',
      }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(jid, {
        video: { url: result.url },
        caption: '_Downloaded by KevooBot_ ⚡',
        mimetype: 'video/mp4',
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to send video: ${err.message}`,
      }, { quoted: msg });
    }
  },
};
