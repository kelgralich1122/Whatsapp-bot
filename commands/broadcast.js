/**
 * Command: broadcast
 * Broadcast messaging
 */

import config from '../config.js';
import logger from '../lib/logger.js';

export default {
  name: 'broadcast',
  aliases: ['bc'],
  category: 'Admin',
  description: 'Send message to all groups',
  usage: '.broadcast <message>',

  handler: async (sock, msg, { jid, sender, fullArgs }) => {
    const isOwner = sender?.replace(/[^0-9]/g, '') === config.ownerNumber.replace(/[^0-9]/g, '');
    if (!isOwner) return await sock.sendMessage(jid, { text: '❌ Admin only command.' }, { quoted: msg });

    if (!fullArgs) return await sock.sendMessage(jid, { text: '❌ Provide message.' }, { quoted: msg });

    const groups = Object.keys(await sock.groupFetchAllParticipating());

    await sock.sendMessage(jid, { text: `🚀 Sending broadcast to ${groups.length} groups...` }, { quoted: msg });

    for (const gJid of groups) {
      try {
        await sock.sendMessage(gJid, { text: `📢 *BROADCAST*\n\n${fullArgs}` });
        await new Promise(r => setTimeout(r, 1000)); // Rate limit
      } catch (err) {
        logger.error(`Broadcast failed for ${gJid}:`, err.message);
      }
    }

    await sock.sendMessage(jid, { text: '✅ Broadcast complete.' }, { quoted: msg });
  },
};
