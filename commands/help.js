/**
 * Command: help
 * Show available commands
 */

import { getCommand } from '../lib/commandLoader.js';

export default {
  name: 'help',
  aliases: ['?'],
  category: 'Core',
  description: 'Show help menu',
  usage: '.help',

  handler: async (sock, msg, { jid, args }) => {
    const menuCmd = getCommand('menu');
    if (menuCmd) {
      return await menuCmd.handler(sock, msg, { jid, args });
    }
    await sock.sendMessage(jid, { text: '❌ Help menu not available.' }, { quoted: msg });
  },
};
