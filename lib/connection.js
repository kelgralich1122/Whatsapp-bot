/**
 * ╔══════════════════════════════════════╗
 * ║    KEVOO BOT – CONNECTION HANDLER   ║
 * ╚══════════════════════════════════════╝
 * Manages WhatsApp connection with Baileys
 */

import makeWASocket, {
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  fetchLatestBaileysVersion,
  DisconnectReason,
  Browsers,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import NodeCache from 'node-cache';
import P from 'pino';
import QRCode from 'qrcode-terminal';
import config from '../config.js';
import logger from './logger.js';

// Silent pino logger for Baileys internals
const baileysLogger = P({ level: 'silent' });

// Message retry cache
const msgRetryCounterCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

/**
 * Start the WhatsApp socket connection
 * @param {Function} onReady - Callback when connected (receives sock)
 * @returns {Promise<object>} socket instance
 */
export async function startConnection(onReady) {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  logger.info(`Using WA v${version.join('.')} (latest: ${isLatest})`);

  const sock = makeWASocket({
    version,
    logger: baileysLogger,
    printQRInTerminal: true,
    browser: Browsers.ubuntu('KevooBot'),
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, baileysLogger),
    },
    msgRetryCounterCache,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
    defaultQueryTimeoutMs: 60_000,
    connectTimeoutMs: 60_000,
    keepAliveIntervalMs: 30_000,
    retryRequestDelayMs: 500,
    maxMsgRetryCount: 5,
    getMessage: async () => undefined,
  });

  // ─── Connection Events ────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n');
      console.log('╔════════════════════════════════════╗');
      console.log('║   📱 SCAN THIS QR CODE WITH WHATSAPP   ║');
      console.log('╚════════════════════════════════════╝');
      console.log('');
      
      // Generate QR code in terminal
      QRCode.generate(qr, { small: true });
      
      console.log('');
      console.log('Steps:');
      console.log('1️⃣  Open WhatsApp on your phone');
      console.log('2️⃣  Go to Settings → Linked Devices → Link a Device');
      console.log('3️⃣  Scan the QR code above');
      console.log('');
    }

    if (connection === 'open') {
      logger.success('✅ Connected to WhatsApp!');
      logger.bot(`Bot Name: ${config.botName}`);
      logger.bot(`Prefix: ${config.prefix}`);
      logger.bot(`Mode: ${config.botMode}`);
      if (onReady) onReady(sock);
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output?.statusCode
        : (lastDisconnect?.error)?.output?.statusCode;

      const reason = statusCode || 0;

      logger.warn(`Connection closed. Code: ${reason}`);

      if (reason === DisconnectReason.loggedOut) {
        logger.error('🚫 Logged out! Delete session folder and re-scan QR.');
        process.exit(1);
      }

      if (reason === DisconnectReason.restartRequired) {
        logger.info('🔄 Restart required, reconnecting...');
        await startConnection(onReady);
        return;
      }

      if (reason === DisconnectReason.timedOut) {
        logger.info('⏳ Timed out, reconnecting...');
        await startConnection(onReady);
        return;
      }

      // Generic reconnect for all other cases
      logger.info('🔄 Reconnecting in 3 seconds...');
      setTimeout(async () => {
        try {
          await startConnection(onReady);
        } catch (err) {
          logger.error('Reconnect failed:', err.message);
          process.exit(1);
        }
      }, 3000);
    }
  });

  // ─── Save credentials on update ───────────────────
  sock.ev.on('creds.update', saveCreds);

  return sock;
}

export default { startConnection };
