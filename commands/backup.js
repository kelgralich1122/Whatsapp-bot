/**
 * Command: backup
 * Auto backup system
 */

import fs from 'fs';
import path from 'path';
import config from '../config.js';
import logger from '../lib/logger.js';

export default {
  name: 'backup',
  category: 'Admin',
  description: 'Backup bot data',
  usage: '.backup',

  handler: async (sock, msg, { jid, sender }) => {
    const isOwner = sender?.replace(/[^0-9]/g, '') === config.ownerNumber.replace(/[^0-9]/g, '');
    if (!isOwner) return await sock.sendMessage(jid, { text: '❌ Admin only command.' }, { quoted: msg });

    const backupId = Date.now();
    const backupDir = `./backups/${backupId}`;

    try {
      if (!fs.existsSync('./backups')) fs.mkdirSync('./backups');
      fs.mkdirSync(backupDir);

      const dirsToBackup = ['./data/memory', './data/db', './logs'];

      for (const src of dirsToBackup) {
        if (fs.existsSync(src)) {
          const dest = path.join(backupDir, path.basename(src));
          fs.mkdirSync(dest, { recursive: true });

          const files = fs.readdirSync(src);
          for (const file of files) {
            const srcFile = path.join(src, file);
            if (fs.lstatSync(srcFile).isFile()) {
              fs.copyFileSync(srcFile, path.join(dest, file));
            }
          }
        }
      }

      await sock.sendMessage(jid, {
        text: `✅ *Backup Complete*\n\nID: \`${backupId}\`\nLocation: \`${backupDir}\``,
      }, { quoted: msg });

    } catch (err) {
      logger.error('Backup failed:', err.message);
      await sock.sendMessage(jid, { text: `❌ Backup failed: ${err.message}` }, { quoted: msg });
    }
  },
};
