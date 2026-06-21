/**
 * Command: summary
 * Auto summaries of conversation
 */

import { chatAI } from '../lib/apiClient.js';
import { getAllInteractions } from '../lib/interactionLogger.js';

export default {
  name: 'summary',
  category: 'AI',
  description: 'AI-generated summary of recent chat',
  usage: '.summary',

  handler: async (sock, msg, { jid, sender }) => {
    const interactions = getAllInteractions().filter(i => i.sender === (sender || jid)).slice(-20);

    if (interactions.length === 0) {
      return await sock.sendMessage(jid, { text: '❌ No recent conversation found to summarize.' }, { quoted: msg });
    }

    const conversation = interactions.map(i => `${i.timestamp} - ${i.content}`).join('\n');
    const prompt = `Summarize the following recent conversation briefly:\n\n${conversation}`;

    await sock.sendMessage(jid, { text: '⌛ Generating summary...' }, { quoted: msg });

    const summary = await chatAI(prompt, "You are a conversation summarizer. Be concise.");

    await sock.sendMessage(jid, {
      text: `📝 *Chat Summary:*\n\n${summary}`,
    }, { quoted: msg });
  },
};
