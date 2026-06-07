/**
 * ╔══════════════════════════════════════╗
 * ║       KEVOO BOT – LOGGER            ║
 * ╚══════════════════════════════════════╝
 * Timestamped log system with levels
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function formatMsg(level, color, ...args) {
  const ts = `${COLORS.gray}[${timestamp()}]${COLORS.reset}`;
  const tag = `${color}[${level}]${COLORS.reset}`;
  console.log(ts, tag, ...args);
}

const logger = {
  info: (...args) => formatMsg('INFO', COLORS.green, ...args),
  warn: (...args) => formatMsg('WARN', COLORS.yellow, ...args),
  error: (...args) => formatMsg('ERROR', COLORS.red, ...args),
  debug: (...args) => formatMsg('DEBUG', COLORS.cyan, ...args),
  cmd: (...args) => formatMsg('CMD', COLORS.magenta, ...args),
  success: (...args) => formatMsg('✓', COLORS.green, ...args),
  bot: (...args) => formatMsg('BOT', COLORS.blue, ...args),
};

export default logger;
