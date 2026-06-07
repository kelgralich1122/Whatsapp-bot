/**
 * Command: instagram
 * Download Instagram reels/posts
 */

import { downloadInstagram } from '../lib/apiClient.js';

export default {
  name: 'instagram',
  aliases: ['ig', 'igdl', 'insta', 'reel'],
  category: 'Media',
  description: 'Download Instagram reels/posts',
  usage: '.ig <instagram url>',

  handler: async (sock, msg, { jid, fullArgs }) => {
    if (!fullArgs || !fullArgs.includes('instagram.com')) {
      await sock.sendMessage(jid, {
        text: '❌ Please provide a valid Instagram URL.\n\n*Usage:* .ig https://www.instagram.com/reel/xxx',
      }, { quoted: msg });
      return;
    }

    await sock.sendMessage(jid, {
      text: '⏳ Downloading from Instagram...',
    }, { quoted: msg });

    const result = await downloadInstagram(fullArgs.trim());

    if (!result) {
      await sock.sendMessage(jid, {
        text: '❌ Failed to download. The post may be private or the URL is invalid.',
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
      // Try as image if video fails
      try {
        await sock.sendMessage(jid, {
          image: { url: result.url },
          caption: '_Downloaded by KevooBot_ ⚡',
        }, { quoted: msg });
      } catch (err2) {
        await sock.sendMessage(jid, {
          text: `❌ Failed to send media: ${err2.message}`,
        }, { quoted: msg });
      }
    }
  },
};
