/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║                                                          ║
 * ║   ██╗  ██╗███████╗██╗   ██╗ ██████╗  ██████╗            ║
 * ║   ██║ ██╔╝██╔════╝██║   ██║██╔═══██╗██╔═══██╗           ║
 * ║   █████╔╝ █████╗  ██║   ██║██║   ██║██║   ██║           ║
 * ║   ██╔═██╗ ██╔══╝  ╚██╗ ██╔╝██║   ██║██║   ██║           ║
 * ║   ██║  ██╗███████╗ ╚████╔╝ ╚██████╔╝╚██████╔╝           ║
 * ║   ╚═╝  ╚═╝╚══════╝  ╚═══╝   ╚═════╝  ╚═════╝           ║
 * ║                                                          ║
 * ║            WhatsApp Bot for Termux                       ║
 * ║            Production-Ready v2.0                         ║
 * ║                                                          ║
 * ╚══════════════════════════════════════════════════════════╝
 */

import 'dotenv/config';
import fs from 'fs';
import config from './config.js';
import logger from './lib/logger.js';
import { startConnection } from './lib/connection.js';
import { loadCommands } from './lib/commandLoader.js';
import { initMessageHandler } from './lib/messageHandler.js';
import { ensureTempDir } from './lib/utils.js';

// ─── Startup Validation ──────────────────────────────────
function validateSetup() {
  // Check .env exists
  if (!fs.existsSync('.env')) {
    logger.warn('.env file not found! Copying from .env.example...');
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env');
      logger.info('.env created from template. Edit it with your settings.');
    } else {
      logger.error('No .env or .env.example found!');
      process.exit(1);
    }
  }

  // Ensure temp dir
  ensureTempDir();

  // Warn about missing API keys
  if (!config.groqApiKey || config.groqApiKey === 'your_groq_api_key_here') {
    logger.warn('GROQ_API_KEY not set – AI chat via Groq will be disabled');
  }
  if (!config.openRouterApiKey || config.openRouterApiKey === 'your_openrouter_api_key_here') {
    logger.warn('OPENROUTER_API_KEY not set – AI fallback via OpenRouter will be disabled');
  }
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log('');
  console.log('  ╔═══════════════════════════════╗');
  console.log('  ║       KEVOO BOT v2.0          ║');
  console.log('  ║   WhatsApp Bot for Termux     ║');
  console.log('  ╚═══════════════════════════════╝');
  console.log('');

  // Step 1: Validate setup
  validateSetup();

  // Step 2: Load commands
  logger.info('Loading commands...');
  await loadCommands();

  // Step 3: Connect to WhatsApp
  logger.info('Connecting to WhatsApp...');
  const sock = await startConnection((connectedSock) => {
    // Step 4: Initialize message handler once connected
    initMessageHandler(connectedSock);
    logger.success('🚀 KevooBot is fully operational!');
  });
}

// ─── Global Error Handlers ───────────────────────────────
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err.message);
  logger.error(err.stack || '');
  // Don't exit – keep the bot alive
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason?.message || reason);
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM. Shutting down gracefully...');
  process.exit(0);
});

// ─── Start the bot ───────────────────────────────────────
main().catch((err) => {
  logger.error('Fatal startup error:', err.message);
  logger.error(err.stack || '');
  process.exit(1);
});
