/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║          KEVOO BOT v2.0 - MEMORY SYSTEM                 ║
 * ║      Persistent Conversation & User Preferences          ║
 * ╚══════════════════════════════════════════════════════════╝
 */

import fs from 'fs';
import path from 'path';
import logger from './logger.js';
import { chatAI } from './apiClient.js';

const MEMORY_DIR = './data/memory';

// Ensure memory directory exists
function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

/**
 * Get memory for a specific user
 */
export function getMemory(jid) {
  ensureMemoryDir();
  const filePath = path.join(MEMORY_DIR, `${jid.replace(/[^0-9]/g, '')}.json`);

  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    logger.error(`Error reading memory for ${jid}:`, err.message);
  }

  // Default memory structure
  return {
    user_name: '',
    interests: [],
    active_projects: [],
    preferences: [],
    recent_topics: [],
    history_summary: '',
    msg_count: 0,
    last_updated: new Date().toISOString()
  };
}

/**
 * Save memory for a specific user
 */
export function saveMemory(jid, memory) {
  ensureMemoryDir();
  const filePath = path.join(MEMORY_DIR, `${jid.replace(/[^0-9]/g, '')}.json`);

  try {
    memory.last_updated = new Date().toISOString();
    fs.writeFileSync(filePath, JSON.stringify(memory, null, 2));
    return true;
  } catch (err) {
    logger.error(`Error saving memory for ${jid}:`, err.message);
    return false;
  }
}

/**
 * Update memory with new information
 */
export function updateMemory(jid, updates) {
  const memory = getMemory(jid);

  if (updates.user_name) memory.user_name = updates.user_name;

  if (updates.interest) {
    if (!memory.interests.includes(updates.interest)) {
      memory.interests.push(updates.interest);
    }
  }

  if (updates.project) {
    if (!memory.active_projects.includes(updates.project)) {
      memory.active_projects.push(updates.project);
    }
  }

  if (updates.preference) {
    if (!memory.preferences.includes(updates.preference)) {
      memory.preferences.push(updates.preference);
    }
  }

  if (updates.topic) {
    // Keep only last 10 topics
    memory.recent_topics.unshift(updates.topic);
    memory.recent_topics = [...new Set(memory.recent_topics)].slice(0, 10);
  }

  if (updates.summary) {
    memory.history_summary = updates.summary;
  }

  if (updates.incCount) {
    memory.msg_count = (memory.msg_count || 0) + 1;
  }

  return saveMemory(jid, memory);
}

/**
 * Extract facts from message using AI
 */
export async function extractFacts(jid, text) {
  const memory = getMemory(jid);

  // Optimization: Only extract if message is substantial and not on every message
  if (text.length < 15 || (memory.msg_count % 5 !== 0)) {
    return;
  }

  try {
    const systemPrompt = `You are a memory extraction unit. Analyze the user message and extract:
1. User Name (if provided)
2. Interests (topics they like)
3. Active Projects (things they are working on)
4. Preferences (how they like to communicate or specific needs)
5. Topic (main subject of the message)

Respond ONLY with a JSON object like:
{"user_name": "", "interests": [], "projects": [], "preferences": [], "topic": ""}
Leave empty or null if not found.`;

    const res = await chatAI(text, systemPrompt);
    const facts = JSON.parse(res.substring(res.indexOf('{'), res.lastIndexOf('}') + 1));

    if (facts) {
      if (facts.user_name) memory.user_name = facts.user_name;
      if (Array.isArray(facts.interests)) {
        facts.interests.forEach(i => { if(!memory.interests.includes(i)) memory.interests.push(i); });
      }
      if (Array.isArray(facts.projects)) {
        facts.projects.forEach(p => { if(!memory.active_projects.includes(p)) memory.active_projects.push(p); });
      }
      if (Array.isArray(facts.preferences)) {
        facts.preferences.forEach(p => { if(!memory.preferences.includes(p)) memory.preferences.push(p); });
      }
      if (facts.topic) {
        memory.recent_topics.unshift(facts.topic);
        memory.recent_topics = [...new Set(memory.recent_topics)].slice(0, 10);
      }
      saveMemory(jid, memory);
      logger.debug(`[MEMORY] Extracted facts for ${jid}`);
    }
  } catch (err) {
    logger.error('Fact extraction error:', err.message);
  }
}

/**
 * Get context string for AI
 */
export function getAIContext(jid) {
  const m = getMemory(jid);
  let context = 'Background info about this user:\n';

  if (m.user_name) context += `- Name: ${m.user_name}\n`;
  if (m.interests.length) context += `- Interests: ${m.interests.join(', ')}\n`;
  if (m.active_projects.length) context += `- Active Projects: ${m.active_projects.join(', ')}\n`;
  if (m.preferences.length) context += `- Preferences: ${m.preferences.join(', ')}\n`;
  if (m.recent_topics.length) context += `- Recent Topics: ${m.recent_topics.join(', ')}\n`;
  if (m.history_summary) context += `- Past Conversations Summary: ${m.history_summary}\n`;

  return context;
}

export default {
  getMemory,
  saveMemory,
  updateMemory,
  extractFacts,
  getAIContext
};
