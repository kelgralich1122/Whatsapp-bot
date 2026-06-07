/**
 * Command: runtime
 * Show detailed runtime info
 */

import os from 'os';
import { formatUptime } from '../lib/utils.js';

export default {
  name: 'runtime',
  aliases: ['uptime', 'info'],
  category: 'Core',
  description: 'Show runtime & system info',
  usage: '.runtime',

  handler: async (sock, msg, { jid }) => {
    const uptime = formatUptime(process.uptime() * 1000);
    const sysUptime = formatUptime(os.uptime() * 1000);
    const mem = process.memoryUsage();
    const totalMem = (os.totalmem() / 1024 / 1024).toFixed(0);
    const freeMem = (os.freemem() / 1024 / 1024).toFixed(0);

    await sock.sendMessage(jid, {
      text:
        `📊 *Runtime Info*\n\n` +
        `╭─── Bot ───\n` +
        `│ ⏱️ Uptime: ${uptime}\n` +
        `│ 💾 Heap: ${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
        `│ 📦 RSS: ${(mem.rss / 1024 / 1024).toFixed(2)} MB\n` +
        `│ ⚙️ Node: ${process.version}\n` +
        `╰────────────\n\n` +
        `╭─── System ───\n` +
        `│ 🖥️ Platform: ${os.platform()} ${os.arch()}\n` +
        `│ ⏱️ System Up: ${sysUptime}\n` +
        `│ 💾 RAM: ${freeMem}/${totalMem} MB free\n` +
        `│ 🧵 CPUs: ${os.cpus().length}\n` +
        `╰────────────`,
    }, { quoted: msg });
  },
};
