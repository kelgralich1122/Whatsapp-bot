/**
 * Command: owner
 * Display bot creator and developer information
 */

import { OWNER_INFO } from '../lib/relationshipMode.js';

export default {
  name: 'owner',
  aliases: ['creator', 'dev', 'developer'],
  category: 'Info',
  description: 'Show bot creator and developer info',
  usage: '.owner',

  handler: async (sock, msg, { jid }) => {
    await sock.sendMessage(jid, {
      text: OWNER_INFO.description,
    }, { quoted: msg });
  },
};
