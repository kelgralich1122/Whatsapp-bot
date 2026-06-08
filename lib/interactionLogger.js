/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          KEVOO BOT v2.0 - INTERACTION LOGGER            ║
 * ║              Database & Logging System                  ║
 * ╚══════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import logger from './logger.js';

const LOGS_DIR = './logs';
const INTERACTIONS_FILE = path.join(LOGS_DIR, 'interactions.json');

// Ensure logs directory exists
function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

/**
 * Log interaction to database
 */
export function logInteraction(data) {
  ensureLogsDir();

  const interaction = {
    timestamp: new Date().toISOString(),
    sender: data.sender || 'unknown',
    type: data.type || 'message', // message, automation, relationship
    action: data.action || '',
    content: data.content || '',
    metadata: data.metadata || {},
  };

  try {
    let interactions = [];
    
    if (fs.existsSync(INTERACTIONS_FILE)) {
      const fileContent = fs.readFileSync(INTERACTIONS_FILE, 'utf8');
      interactions = JSON.parse(fileContent || '[]');
    }

    interactions.push(interaction);

    // Keep only last 10,000 interactions to avoid file bloat
    if (interactions.length > 10000) {
      interactions = interactions.slice(-10000);
    }

    fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify(interactions, null, 2));
    logger.debug(`✓ Logged interaction: ${data.action}`);
  } catch (err) {
    logger.error('Error logging interaction:', err.message);
  }
}

/**
 * Get all interactions
 */
export function getAllInteractions() {
  ensureLogsDir();

  try {
    if (fs.existsSync(INTERACTIONS_FILE)) {
      const fileContent = fs.readFileSync(INTERACTIONS_FILE, 'utf8');
      return JSON.parse(fileContent || '[]');
    }
  } catch (err) {
    logger.error('Error reading interactions:', err.message);
  }

  return [];
}

/**
 * Get interactions by sender
 */
export function getInteractionsBySender(sender) {
  const allInteractions = getAllInteractions();
  return allInteractions.filter(i => i.sender === sender);
}

/**
 * Get interactions by type
 */
export function getInteractionsByType(type) {
  const allInteractions = getAllInteractions();
  return allInteractions.filter(i => i.type === type);
}

/**
 * Clear old interactions (older than X days)
 */
export function clearOldInteractions(daysOld = 30) {
  ensureLogsDir();

  try {
    let interactions = getAllInteractions();
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - daysOld * 24 * 60 * 60 * 1000);

    interactions = interactions.filter(
      i => new Date(i.timestamp) > cutoffDate
    );

    fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify(interactions, null, 2));
    logger.info(`✓ Cleared interactions older than ${daysOld} days`);
  } catch (err) {
    logger.error('Error clearing interactions:', err.message);
  }
}

export default {
  logInteraction,
  getAllInteractions,
  getInteractionsBySender,
  getInteractionsByType,
  clearOldInteractions,
};
