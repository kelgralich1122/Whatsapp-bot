/**
 * Command: promote
 * Business promotion campaigns
 */

import config from '../config.js';
import logger from '../lib/logger.js';

export default {
  name: 'promote',
  category: 'Business',
  description: 'Business promotion campaigns',
  usage: '.promote <details>',

  handler: async (sock, msg, { jid, sender, fullArgs }) => {
    const isOwner = sender?.replace(/[^0-9]/g, '') === config.ownerNumber.replace(/[^0-9]/g, '');
    if (!isOwner) return await sock.sendMessage(jid, { text: '❌ Admin only command.' }, { quoted: msg });

    if (!fullArgs) return await sock.sendMessage(jid, { text: '❌ Provide promotion details.' }, { quoted: msg });

    // Implementation: Send to all participating groups
    const groups = Object.keys(await sock.groupFetchAllParticipating());
    await sock.sendMessage(jid, { text: `📢 Promoting to ${groups.length} groups...` }, { quoted: msg });

    for (const gJid of groups) {
      try {
        await sock.sendMessage(gJid, {
          text: `✨ *PROMOTION* ✨\n\n${fullArgs}\n\n_Powered by KevooBot_`
        });
        await new Promise(r => setTimeout(r, 1000));
      } catch (err) {
        logger.error(`Promotion failed for ${gJid}:`, err.message);
      }
    }

    await sock.sendMessage(jid, { text: '✅ Promotion campaign complete.' }, { quoted: msg });
  },
};
