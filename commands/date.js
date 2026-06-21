/**
 * Command: date
 * Display current date
 */

export default {
  name: 'date',
  category: 'Utility',
  description: 'Current date',
  usage: '.date',

  handler: async (sock, msg, { jid }) => {
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    await sock.sendMessage(jid, {
      text: `📅 Current Date: *${date}*`,
    }, { quoted: msg });
  },
};
