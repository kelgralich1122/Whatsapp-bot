/**
 * Command: owner
 * Display bot creator and developer information
 */

import { getOwnerResponse, logAutomationAction } from '../lib/relationshipMode.js';
import { logInteraction } from '../lib/interactionLogger.js';

export default {
  name: 'owner',
  aliases: ['creator', 'dev', 'developer'],
  category: 'Info',
  description: 'Show bot creator and developer info',
  usage: '.owner',

  handler: async (sock, msg, { jid, sender }) => {
    const response = getOwnerResponse();

    await sock.sendMessage(jid, {
      text: response,
    }, { quoted: msg });

    // Log the interaction
    logInteraction({
      sender,
      type: 'command',
      action: 'owner_info_requested',
      content: 'User requested owner/developer information',
      metadata: { jid },
    });

    logAutomationAction(sender, 'OWNER_COMMAND_EXECUTED', {
      requester: sender,
      timestamp: new Date().toISOString(),
    });
  },
};