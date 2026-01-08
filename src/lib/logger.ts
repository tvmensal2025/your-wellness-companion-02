/**
 * Sistema de logging condicional
 * Apenas exibe logs em ambiente de desenvolvimento
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: isDev ? console.log.bind(console) : () => {},
  info: isDev ? console.info.bind(console) : () => {},
  warn: isDev ? console.warn.bind(console) : () => {},
  error: console.error.bind(console), // Sempre mostrar erros
  debug: isDev ? console.debug.bind(console) : () => {},
  table: isDev ? console.table.bind(console) : () => {},
  group: isDev ? console.group.bind(console) : () => {},
  groupEnd: isDev ? console.groupEnd.bind(console) : () => {},
  time: isDev ? console.time.bind(console) : () => {},
  timeEnd: isDev ? console.timeEnd.bind(console) : () => {},
};

// Atalho para uso mais simples
export const log = logger.log;
export const logError = logger.error;
export const logWarn = logger.warn;
export const logDebug = logger.debug;
