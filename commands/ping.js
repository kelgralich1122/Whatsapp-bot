/**
 * Command: ping
 * Check if bot is alive + response latency
 */

import { formatUptime } from '../lib/utils.js';

export default {
  name: 'ping',
  aliases: ['p', 'speed'],
  category: 'Core',
  description: 'Check bot response time and uptime',
  usage: '.ping',

  handler: async (sock, msg, { jid }) => {
    const start = Date.now();
    const uptime = formatUptime(process.uptime() * 1000);
    const latency = Date.now() - start;
    const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);

    await sock.sendMessage(jid, {
      text:
        `🏓 *Pong!*\n\n` +
        `⚡ Latency: ${latency}ms\n` +
        `⏱️ Uptime: ${uptime}\n` +
        `💾 Memory: ${mem} MB\n` +
        `📡 Status: Online`,
    }, { quoted: msg });
  },
};
