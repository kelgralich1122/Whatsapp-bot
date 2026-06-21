/**
 * Command: time
 * Display current time
 */

export default {
  name: 'time',
  category: 'Utility',
  description: 'Current time',
  usage: '.time',

  handler: async (sock, msg, { jid }) => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: true });
    await sock.sendMessage(jid, {
      text: `🕒 Current Time: *${time}*`,
    }, { quoted: msg });
  },
};
