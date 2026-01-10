/**
 * Logger centralizado para controle de logs em produção
 * Em produção, logs são desabilitados para melhor performance
 */

const IS_PRODUCTION = import.meta.env.PROD;
const IS_DEBUG = import.meta.env.VITE_DEBUG === 'true';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  level: LogLevel;
  prefix: string;
}

const config: LoggerConfig = {
  enabled: !IS_PRODUCTION || IS_DEBUG,
  level: IS_PRODUCTION ? 'error' : 'debug',
  prefix: '[MaxNutrition]',
};

const levels: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled) return false;
  return levels[level] >= levels[config.level];
};

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.log(config.prefix, '[DEBUG]', ...args);
    }
  },
  
  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      console.info(config.prefix, '[INFO]', ...args);
    }
  },
  
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn(config.prefix, '[WARN]', ...args);
    }
  },
  
  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error(config.prefix, '[ERROR]', ...args);
    }
  },
  
  // Para métricas de performance (sempre logado em dev)
  perf: (label: string, startTime: number) => {
    if (!IS_PRODUCTION) {
      const duration = performance.now() - startTime;
      console.log(config.prefix, `[PERF] ${label}: ${duration.toFixed(2)}ms`);
    }
  },
};

export default logger;
