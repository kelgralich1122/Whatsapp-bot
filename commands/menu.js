/**
 * Command: menu
 * Display all available commands grouped by category
 */

import config from '../config.js';
import { getAllCommands } from '../lib/commandLoader.js';
import { formatUptime } from '../lib/utils.js';

export default {
  name: 'menu',
  aliases: ['help', 'commands', 'h'],
  category: 'Core',
  description: 'Show all available commands',
  usage: '.menu',

  handler: async (sock, msg, { jid }) => {
    const commands = getAllCommands();
    const uptime = formatUptime(process.uptime() * 1000);

    // Group by category
    const categories = {};
    for (const cmd of commands) {
      const cat = cmd.category || 'Misc';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(cmd);
    }

    let menu =
      `╔══════════════════════╗\n` +
      `║   *${config.botName}*   ║\n` +
      `╚══════════════════════╝\n\n` +
      `⏱️ Uptime: ${uptime}\n` +
      `📌 Prefix: *${config.prefix}*\n` +
      `🤖 Mode: ${config.botMode}\n\n`;

    for (const [category, cmds] of Object.entries(categories).sort()) {
      menu += `┌─── *${category}* ───\n`;
      for (const cmd of cmds) {
        const aliases = cmd.aliases?.length ? ` _(${cmd.aliases.join(', ')})_` : '';
        menu += `│ ${config.prefix}${cmd.name}${aliases}\n`;
        if (cmd.description) {
          menu += `│   ↳ ${cmd.description}\n`;
        }
      }
      menu += `└────────────\n\n`;
    }

    menu += `_Type ${config.prefix}<command> for usage info_\n`;
    menu += `_Powered by ${config.botName} ⚡_`;

    await sock.sendMessage(jid, { text: menu }, { quoted: msg });
  },
};
