/**
 * Command: memory
 * AI conversation memory management
 */

import { getMemory, saveMemory } from '../lib/memory.js';

export default {
  name: 'memory',
  category: 'AI',
  description: 'View what the bot remembers about you',
  usage: '.memory',

  handler: async (sock, msg, { jid, sender }) => {
    const memory = getMemory(sender || jid);

    let text = `🧠 *Memory for @${(sender || jid).split('@')[0]}*\n\n`;
    text += `👤 *Name:* ${memory.user_name || 'Not set'}\n`;
    text += `🎯 *Interests:* ${memory.interests.join(', ') || 'None yet'}\n`;
    text += `🚀 *Projects:* ${memory.active_projects.join(', ') || 'None yet'}\n`;
    text += `⚙️ *Preferences:* ${memory.preferences.join(', ') || 'None yet'}\n`;
    text += `💬 *Recent Topics:* ${memory.recent_topics.slice(0, 5).join(', ') || 'None yet'}\n`;

    await sock.sendMessage(jid, {
      text,
      mentions: [sender || jid]
    }, { quoted: msg });
  },
};
