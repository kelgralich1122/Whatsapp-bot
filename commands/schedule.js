/**
 * Command: schedule
 * Smart scheduling engine
 */

import fs from 'fs';
import path from 'path';

const DB_PATH = './data/db/schedules.json';

function getSchedules() {
  if (!fs.existsSync(DB_PATH)) return [];
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveSchedules(schedules) {
  if (!fs.existsSync('./data/db')) fs.mkdirSync('./data/db', { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(schedules, null, 2));
}

export default {
  name: 'schedule',
  category: 'Utility',
  description: 'Smart scheduling engine',
  usage: '.schedule <details>',

  handler: async (sock, msg, { jid, fullArgs }) => {
    if (!fullArgs) {
      return await sock.sendMessage(jid, { text: '❌ Please provide details. Usage: .schedule Meeting at 3 PM' }, { quoted: msg });
    }

    const schedules = getSchedules();
    const newEntry = {
      id: Date.now(),
      jid,
      details: fullArgs,
      timestamp: new Date().toISOString()
    };

    schedules.push(newEntry);
    saveSchedules(schedules);

    await sock.sendMessage(jid, {
      text: `📅 *Scheduled:* ${fullArgs}\n\nI have added this to your schedule.`,
    }, { quoted: msg });
  },
};
