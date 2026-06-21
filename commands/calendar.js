/**
 * Command: calendar
 * Calendar integration
 */

import fs from 'fs';

const DB_PATH = './data/db/schedules.json';

export default {
  name: 'calendar',
  category: 'Utility',
  description: 'View your scheduled tasks',
  usage: '.calendar',

  handler: async (sock, msg, { jid }) => {
    const schedules = fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) : [];
    const mySchedules = schedules.filter(s => s.jid === jid);

    if (mySchedules.length === 0) {
      return await sock.sendMessage(jid, { text: '📅 Your calendar is empty.' }, { quoted: msg });
    }

    let text = `📅 *Your Calendar*\n\n`;
    mySchedules.forEach((s, i) => {
      text += `${i + 1}. ${s.details} (_${new Date(s.timestamp).toLocaleDateString()}_)\n`;
    });

    await sock.sendMessage(jid, { text }, { quoted: msg });
  },
};
