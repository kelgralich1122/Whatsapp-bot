/**
 * ╔══════════════════════════════════════╗
 * ║    KEVOO BOT – COMMAND LOADER       ║
 * ╚══════════════════════════════════════╝
 * Auto-loads all command modules from /commands
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands = new Map();

/**
 * Load all .js command files from the commands directory
 */
export async function loadCommands() {
  const cmdDir = path.join(__dirname, '..', 'commands');

  if (!fs.existsSync(cmdDir)) {
    logger.warn('Commands directory not found, creating...');
    fs.mkdirSync(cmdDir, { recursive: true });
    return commands;
  }

  const files = fs.readdirSync(cmdDir).filter((f) => f.endsWith('.js'));

  for (const file of files) {
    try {
      const filePath = path.join(cmdDir, file);
      const fileUrl = pathToFileURL(filePath).href;
      const mod = await import(fileUrl);
      const cmd = mod.default || mod;

      if (!cmd.name || !cmd.handler) {
        logger.warn(`Skipping ${file}: missing name or handler`);
        continue;
      }

      // Register main command
      commands.set(cmd.name, cmd);

      // Register aliases
      if (Array.isArray(cmd.aliases)) {
        for (const alias of cmd.aliases) {
          commands.set(alias, cmd);
        }
      }

      logger.success(`Loaded command: ${cmd.name}` +
        (cmd.aliases?.length ? ` [${cmd.aliases.join(', ')}]` : ''));
    } catch (err) {
      logger.error(`Failed to load ${file}:`, err.message);
    }
  }

  logger.info(`Total commands loaded: ${commands.size}`);
  return commands;
}

/**
 * Get a command by name
 */
export function getCommand(name) {
  return commands.get(name) || null;
}

/**
 * Get all unique commands (no alias duplicates)
 */
export function getAllCommands() {
  const unique = new Map();
  for (const [, cmd] of commands) {
    unique.set(cmd.name, cmd);
  }
  return Array.from(unique.values());
}

export default { loadCommands, getCommand, getAllCommands };
