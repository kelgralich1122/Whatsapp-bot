/**
 * Command: remind
 * Automated reminders
 */

import fs from 'fs';

const DB_PATH = './data/db/reminders.json';

export default {
  name: 'remind',
  category: 'Utility',
  description: 'Set a reminder',
  usage: '.remind <message>',

  handler: async (sock, msg, { jid, fullArgs }) => {
    if (!fullArgs) return await sock.sendMessage(jid, { text: '❌ Usage: .remind Drink water' }, { quoted: msg });

    const reminders = fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) : [];
    reminders.push({ jid, message: fullArgs, time: new Date().toISOString() });
    fs.writeFileSync(DB_PATH, JSON.stringify(reminders, null, 2));

    await sock.sendMessage(jid, {
      text: `🔔 *Reminder Set:* ${fullArgs}`,
    }, { quoted: msg });
  },
};
