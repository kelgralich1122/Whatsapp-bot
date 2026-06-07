/**
 * Command: owner
 * Show bot owner info
 */

import config from '../config.js';

export default {
  name: 'owner',
  aliases: ['creator', 'dev'],
  category: 'Core',
  description: 'Show bot owner contact',
  usage: '.owner',

  handler: async (sock, msg, { jid }) => {
    const ownerNum = config.ownerNumber;

    if (!ownerNum) {
      await sock.sendMessage(jid, {
        text: '👤 Owner info not configured.',
      }, { quoted: msg });
      return;
    }

    const vcard =
      'BEGIN:VCARD\n' +
      'VERSION:3.0\n' +
      `FN:${config.botName} Owner\n` +
      `TEL;type=CELL;type=VOICE;waid=${ownerNum}:+${ownerNum}\n` +
      'END:VCARD';

    await sock.sendMessage(jid, {
      contacts: {
        displayName: `${config.botName} Owner`,
        contacts: [{ vcard }],
      },
    }, { quoted: msg });
  },
};
