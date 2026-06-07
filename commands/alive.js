/**
 * Command: alive
 * Bot status check with flair
 */

import config from '../config.js';
import { formatUptime } from '../lib/utils.js';

export default {
  name: 'alive',
  aliases: ['bot', 'status'],
  category: 'Core',
  description: 'Check if the bot is alive',
  usage: '.alive',

  handler: async (sock, msg, { jid }) => {
    const uptime = formatUptime(process.uptime() * 1000);
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    await sock.sendMessage(jid, {
      text:
        `🤖 *${config.botName} is Alive!*\n\n` +
        `╭─── Status ───\n` +
        `│ ⏱️ Uptime: ${uptime}\n` +
        `│ 💾 Memory: ${mem} MB\n` +
        `│ 📌 Prefix: ${config.prefix}\n` +
        `│ 🌐 Mode: ${config.botMode}\n` +
        `│ 🧠 AI: ${config.aiEnabled ? 'Enabled' : 'Disabled'}\n` +
        `╰────────────\n\n` +
        `_Always at your service!_ ⚡`,
    }, { quoted: msg });
  },
};
