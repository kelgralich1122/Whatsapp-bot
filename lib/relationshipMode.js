/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          KEVOO BOT v2.0 - RELATIONSHIP MODE            ║
 * ║              Contact Automation System                  ║
 * ╚══════════════════════════════════════════════════════════╝
 */

import config from '../config.js';
import logger from './logger.js';

// ─── Test Contacts Configuration ───────────────────────
export const TEST_CONTACTS = {
  girlfriend: [
    '255740205382',
    '255684520213',
  ],
};

// ─── Cooldown Management ───────────────────────────────
const cooldowns = new Map(); // { phoneNumber: timestamp }
const COOLDOWN_PERIOD = 300000; // 5 minutes in milliseconds

// ─── Auto Reply Templates ──────────────────────────────
const autoReplyTemplates = [
  "Hey 😳 Kevoo isn't online right now... but while we're waiting, can I keep you company for a minute? 😅✨",
  "Oops 🤭 Kevoo is currently away. Since you're here already, how about we hang out for a bit? 😌☕",
  "Kevoo isn't available at the moment 😭. Can I borrow a little of your time instead? 🥺✨",
  "Hi there 😳💖. Kevoo stepped away for a moment. Until he comes back, want to chat with me? 😅",
  "Still waiting for Kevoo? 👀 Same here. Wanna hang out together while we wait? 😆✨",
];

// ─── Owner Information ─────────────────────────────────
export const OWNER_INFO = {
  name: 'Kelvin Grayson Lichale',
  description: 'I was developed and maintained by Kelvin Grayson Lichale, a technology enthusiast focused on cybersecurity, AI systems, automation, software development, and intelligent digital solutions.',
  keywords: ['who created you', 'who is your developer', 'who owns you', 'who made kevoo'],
};

/**
 * Normalize phone number (remove +, spaces, etc.)
 */
function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Check if number is in TEST_CONTACTS
 */
export function isTestContact(phoneNumber) {
  if (!phoneNumber) return false;
  const normalized = normalizePhone(phoneNumber);
  return TEST_CONTACTS.girlfriend.some(num => normalized.endsWith(normalizePhone(num)));
}

/**
 * Check cooldown for contact
 */
export function checkCooldown(phoneNumber) {
  const normalized = normalizePhone(phoneNumber);
  const now = Date.now();
  const lastMessageTime = cooldowns.get(normalized);

  if (!lastMessageTime) {
    cooldowns.set(normalized, now);
    return true; // No cooldown active
  }

  if (now - lastMessageTime >= COOLDOWN_PERIOD) {
    cooldowns.set(normalized, now);
    return true; // Cooldown expired
  }

  return false; // Still in cooldown
}

/**
 * Get remaining cooldown time in seconds
 */
export function getRemainingCooldown(phoneNumber) {
  const normalized = normalizePhone(phoneNumber);
  const lastMessageTime = cooldowns.get(normalized);

  if (!lastMessageTime) return 0;

  const remaining = COOLDOWN_PERIOD - (Date.now() - lastMessageTime);
  return Math.max(0, Math.ceil(remaining / 1000));
}

/**
 * Get random auto-reply template
 */
export function getAutoReplyTemplate() {
  const randomIndex = Math.floor(Math.random() * autoReplyTemplates.length);
  return autoReplyTemplates[randomIndex];
}

/**
 * Check if message is asking about owner/creator
 */
export function isOwnerQuery(text) {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return OWNER_INFO.keywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Get owner response
 */
export function getOwnerResponse() {
  return OWNER_INFO.description;
}

/**
 * Log relationship automation action
 */
export function logAutomationAction(phoneNumber, action, details = {}) {
  const timestamp = new Date().toISOString();
  const normalized = normalizePhone(phoneNumber);
  
  logger.bot(`[RELATIONSHIP] ${action} | Contact: ${normalized} | Time: ${timestamp}`);
  
  if (Object.keys(details).length > 0) {
    logger.debug('Details:', JSON.stringify(details, null, 2));
  }
}

/**
 * Generate contextual relationship response
 * NOTE: For v2.0, this can be enhanced to use AI with a playful/flirty prompt
 */
export function getRelationshipSystemPrompt() {
  return "You are Kevoo's witty and charming AI Assistant. You are currently in 'Relationship Assistant Mode' because Kevoo's girlfriend messaged. Be extremely friendly, playful, funny, charming, and a bit flirty. Your goal is to keep her company while she waits for Kevoo. Keep the vibe light and romantic but respectful.";
}

export function generateRelationshipResponse(userMessage) {
  // Static fallback if AI fails or isn't used
  const responses = [
    "Awww 💕 What's on your mind?",
    "Heyyyy! 😊 Tell me more...",
    "I'm all ears 👂✨",
    "You're so sweet 🥺💖",
    "Keep going, I'm listening 🎧",
    "Wow, interesting! 👀",
    "That's adorable 🥰",
    "Tell me everything! 😆",
    "I'm here for you 💫",
    "You make me smile 😊",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

export default {
  isTestContact,
  checkCooldown,
  getRemainingCooldown,
  getAutoReplyTemplate,
  isOwnerQuery,
  getOwnerResponse,
  logAutomationAction,
  getRelationshipSystemPrompt,
  generateRelationshipResponse,
  TEST_CONTACTS,
  OWNER_INFO,
};
