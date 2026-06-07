/**
 * Command: search
 * Search the web via DuckDuckGo
 */

import { duckSearch } from '../lib/apiClient.js';

export default {
  name: 'search',
  aliases: ['google', 'ddg', 'lookup'],
  category: 'Tools',
  description: 'Search the web',
  usage: '.search <query>',

  handler: async (sock, msg, { jid, fullArgs }) => {
    if (!fullArgs) {
      await sock.sendMessage(jid, {
        text: '❓ What do you want to search for?\n\n*Usage:* .search Node.js',
      }, { quoted: msg });
      return;
    }

    const result = await duckSearch(fullArgs);

    if (!result) {
      await sock.sendMessage(jid, {
        text: '🔍 No results found. Try a different search term.',
      }, { quoted: msg });
      return;
    }

    await sock.sendMessage(jid, {
      text:
        `🔍 *Search Results*\n\n` +
        `${result.answer}\n\n` +
        (result.source ? `📎 Source: ${result.source}\n` : '') +
        (result.url ? `🔗 ${result.url}` : ''),
    }, { quoted: msg });
  },
};
