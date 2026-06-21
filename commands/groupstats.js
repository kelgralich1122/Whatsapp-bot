/**
 * Command: groupstats
 * Group stats
 */

import { getAllInteractions } from '../lib/interactionLogger.js';

export default {
  name: 'groupstats',
  category: 'Group',
  description: 'Display stats about group activity',
  usage: '.groupstats',

  handler: async (sock, msg, { jid }) => {
    if (!jid.endsWith('@g.us')) return await sock.sendMessage(jid, { text: '❌ This command only works in groups.' }, { quoted: msg });

    const interactions = getAllInteractions().filter(i => i.metadata?.jid === jid || i.sender?.includes(jid));

    // Simplistic stats
    const total = interactions.length;
    const commands = interactions.filter(i => i.type === 'command').length;

    let text = `📊 *Group Statistics*\n\n`;
    text += `📝 *Total Logged Interactions:* ${total}\n`;
    text += `🤖 *Commands Executed:* ${commands}\n`;
    text += `📅 *Tracking Since:* ${interactions[0]?.timestamp || 'N/A'}\n`;

    await sock.sendMessage(jid, { text }, { quoted: msg });
  },
};
