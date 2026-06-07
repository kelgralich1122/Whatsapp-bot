/**
 * ╔══════════════════════════════════════╗
 * ║       KEVOO BOT – CONFIG            ║
 * ╚══════════════════════════════════════╝
 * Central configuration loaded from .env
 */

import 'dotenv/config';

const config = {
  // ─── Bot Identity ──────────────────────────────
  botName: process.env.BOT_NAME || 'KevooBot',
  prefix: process.env.PREFIX || '.',
  ownerNumber: process.env.OWNER_NUMBER || '',
  botMode: process.env.BOT_MODE || 'public', // 'public' | 'private'

  // ─── Auto Features ─────────────────────────────
  autoRead: process.env.AUTO_READ === 'true',
  autoReact: process.env.AUTO_REACT === 'true',
  autoTyping: process.env.AUTO_TYPING === 'true',

  // ─── AI ────────────────────────────────────────
  aiEnabled: process.env.AI_ENABLED === 'true',
  groqApiKey: process.env.GROQ_API_KEY || '',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',

  // ─── Rate Limiting ─────────────────────────────
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 15,
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,

  // ─── Session ───────────────────────────────────
  sessionDir: process.env.SESSION_DIR || 'auth_session',

  // ─── APIs ──────────────────────────────────────
  apis: {
    tiklydown: 'https://api.tiklydown.eu.org',
    cobalt: 'https://api.cobalt.tools',                // yt/ig/tiktok fallback
    allOrigins: 'https://api.allorigins.win',
    openMeteo: 'https://api.open-meteo.com/v1/forecast',
    groq: 'https://api.groq.com/openai/v1/chat/completions',
    openRouter: 'https://openrouter.ai/api/v1/chat/completions',
  },

  // ─── Reaction Emojis ───────────────────────────
  reactEmojis: ['⚡', '🔥', '✨', '💫', '🌟', '💯', '🎯', '🚀', '💎', '🫡'],

  // ─── Temp directory ────────────────────────────
  tempDir: './temp',
};

export default config;
