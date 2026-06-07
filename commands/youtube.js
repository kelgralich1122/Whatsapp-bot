/**
 * Command: play / ytv
 * Download YouTube audio or video
 */

import { downloadYouTube } from '../lib/apiClient.js';

export default {
  name: 'play',
  aliases: ['yta', 'ytaudio', 'song'],
  category: 'Media',
  description: 'Download YouTube audio (MP3)',
  usage: '.play <youtube url>',

  handler: async (sock, msg, { jid, fullArgs }) => {
    if (!fullArgs || (!fullArgs.includes('youtube.com') && !fullArgs.includes('youtu.be'))) {
      await sock.sendMessage(jid, {
        text: '❌ Please provide a valid YouTube URL.\n\n*Usage:* .play https://youtu.be/xxx',
      }, { quoted: msg });
      return;
    }

    await sock.sendMessage(jid, {
      text: '⏳ Downloading audio from YouTube...',
    }, { quoted: msg });

    const result = await downloadYouTube(fullArgs.trim(), 'audio');

    if (!result) {
      await sock.sendMessage(jid, {
        text: '❌ Failed to download. Please check the URL and try again.',
      }, { quoted: msg });
      return;
    }

    try {
      await sock.sendMessage(jid, {
        audio: { url: result.url },
        mimetype: 'audio/mpeg',
        ptt: false,
      }, { quoted: msg });
    } catch (err) {
      await sock.sendMessage(jid, {
        text: `❌ Failed to send audio: ${err.message}`,
      }, { quoted: msg });
    }
  },
};
