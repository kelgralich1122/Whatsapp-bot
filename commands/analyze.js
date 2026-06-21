/**
 * Command: analyze
 * AI message analysis
 */

import { chatAI } from '../lib/apiClient.js';
import { getMemory } from '../lib/memory.js';

export default {
  name: 'analyze',
  category: 'AI',
  description: 'AI analysis of your communication style',
  usage: '.analyze',

  handler: async (sock, msg, { jid, sender }) => {
    const memory = getMemory(sender || jid);
    const topics = memory.recent_topics.join(', ');

    if (!topics) return await sock.sendMessage(jid, { text: '❌ Not enough data to analyze yet.' }, { quoted: msg });

    const prompt = `Analyze the following communication topics and describe the user's communication style and interests:\n\n${topics}`;

    await sock.sendMessage(jid, { text: '🔍 Analyzing...' }, { quoted: msg });
    const analysis = await chatAI(prompt, "You are a communication analyst. Be insightful but brief.");

    await sock.sendMessage(jid, {
      text: `🔬 *Analysis Result:*\n\n${analysis}`,
    }, { quoted: msg });
  },
};
