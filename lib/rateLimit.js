/**
 * ╔══════════════════════════════════════╗
 * ║    KEVOO BOT – RATE LIMITER         ║
 * ╚══════════════════════════════════════╝
 * Per-user command rate limiting
 */

import config from '../config.js';
import logger from './logger.js';

const userHits = new Map();

/**
 * Check if user is rate-limited.
 * @param {string} jid - User JID
 * @returns {boolean} true if allowed, false if rate-limited
 */
export function isAllowed(jid) {
  const now = Date.now();
  const windowMs = config.rateLimitWindowMs;
  const maxHits = config.rateLimitMax;

  if (!userHits.has(jid)) {
    userHits.set(jid, []);
  }

  const hits = userHits.get(jid).filter((t) => now - t < windowMs);
  hits.push(now);
  userHits.set(jid, hits);

  if (hits.length > maxHits) {
    logger.warn(`Rate-limited: ${jid} (${hits.length}/${maxHits})`);
    return false;
  }

  return true;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [jid, hits] of userHits.entries()) {
    const fresh = hits.filter((t) => now - t < config.rateLimitWindowMs);
    if (fresh.length === 0) {
      userHits.delete(jid);
    } else {
      userHits.set(jid, fresh);
    }
  }
}, 5 * 60 * 1000);

export default { isAllowed };
