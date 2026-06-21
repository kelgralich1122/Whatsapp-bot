/**
 * Command: settings
 * Command permission system & settings
 */

import config from '../config.js';

export default {
  name: 'settings',
  category: 'Admin',
  description: 'View/Change bot settings',
  usage: '.settings',

  handler: async (sock, msg, { jid, sender, args }) => {
    const isOwner = sender?.replace(/[^0-9]/g, '') === config.ownerNumber.replace(/[^0-9]/g, '');
    if (!isOwner) return await sock.sendMessage(jid, { text: '❌ Admin only command.' }, { quoted: msg });

    let text = `⚙️ *Bot Settings*\n\n`;
    text += `🤖 *Bot Name:* ${config.botName}\n`;
    text += `📌 *Prefix:* ${config.prefix}\n`;
    text += `🔒 *Mode:* ${config.botMode}\n`;
    text += `📖 *Auto Read:* ${config.autoRead ? '✅' : '❌'}\n`;
    text += `🎭 *Auto React:* ${config.autoReact ? '✅' : '❌'}\n`;
    text += `⌨️ *Auto Typing:* ${config.autoTyping ? '✅' : '❌'}\n`;
    text += `🧠 *AI Enabled:* ${config.aiEnabled ? '✅' : '❌'}\n`;

    await sock.sendMessage(jid, { text }, { quoted: msg });
  },
};
