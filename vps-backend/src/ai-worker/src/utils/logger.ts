const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const levels: Record<string, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

function shouldLog(level: string): boolean {
  return levels[level] <= levels[LOG_LEVEL];
}

export const logger = {
  error(message: string, ...args: any[]) {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },

  warn(message: string, ...args: any[]) {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },

  info(message: string, ...args: any[]) {
    if (shouldLog('info')) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },

  debug(message: string, ...args: any[]) {
    if (shouldLog('debug')) {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  }
};
