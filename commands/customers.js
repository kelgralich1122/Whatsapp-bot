/**
 * Command: customers
 * Customer management
 */

import fs from 'fs';

const DB_PATH = './data/db/customers.json';

export default {
  name: 'customers',
  category: 'Business',
  description: 'Manage customers',
  usage: '.customers <add/list> <details>',

  handler: async (sock, msg, { jid, args }) => {
    const action = args[0]?.toLowerCase();
    const customers = fs.existsSync(DB_PATH) ? JSON.parse(fs.readFileSync(DB_PATH, 'utf8')) : [];

    if (action === 'add') {
      const details = args.slice(1).join(' ');
      if (!details) return await sock.sendMessage(jid, { text: '❌ Provide details.' }, { quoted: msg });
      customers.push({ details, jid, added: new Date().toISOString() });
      fs.writeFileSync(DB_PATH, JSON.stringify(customers, null, 2));
      return await sock.sendMessage(jid, { text: '✅ Customer added.' }, { quoted: msg });
    }

    if (customers.length === 0) return await sock.sendMessage(jid, { text: '👥 No customers found.' }, { quoted: msg });

    let text = `👥 *Customer List*\n\n`;
    customers.forEach((c, i) => {
      text += `${i + 1}. ${c.details}\n`;
    });

    await sock.sendMessage(jid, { text }, { quoted: msg });
  },
};
