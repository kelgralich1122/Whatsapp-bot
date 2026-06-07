/**
 * Command: ai
 * Chat with AI in groups or DMs
 */

import { chatAI } from '../lib/apiClient.js';

export default {
  name: 'ai',
  aliases: ['ask', 'gpt', 'chat'],
  category: 'AI',
  description: 'Ask the AI anything',
  usage: '.ai <your question>',

  handler: async (sock, msg, { jid, fullArgs }) => {
    if (!fullArgs) {
      await sock.sendMessage(jid, {
        text: '❓ What would you like to ask?\n\n*Usage:* .ai What is the capital of France?',
      }, { quoted: msg });
      return;
    }

    await sock.sendMessage(jid, {
      text: '🧠 Thinking...',
    }, { quoted: msg });

    const reply = await chatAI(fullArgs);

    await sock.sendMessage(jid, {
      text: `🤖 *AI Response:*\n\n${reply}`,
    }, { quoted: msg });
  },
};
