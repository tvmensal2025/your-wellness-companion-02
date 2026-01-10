/**
 * Sentry Error Monitoring Integration
 * 
 * Configuração:
 * 1. Adicionar VITE_SENTRY_DSN no .env
 * 2. Chamar initSentry() no main.tsx
 */

import * as Sentry from "@sentry/react";

/**
 * Inicializa o Sentry para monitoramento de erros em produção
 */
export const initSentry = () => {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info('[Sentry] DSN não configurado. Monitoramento desabilitado em dev.');
    }
    return;
  }

  if (import.meta.env.DEV) {
    console.info('[Sentry] Modo desenvolvimento - monitoramento desabilitado.');
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE || 'production',
    release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    
    // Performance Monitoring
    tracesSampleRate: 0.1, // 10% das transações
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% das sessões
    replaysOnErrorSampleRate: 1.0, // 100% das sessões com erro
    
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filtrar erros conhecidos que não precisam de tracking
    beforeSend(event, hint) {
      const error = hint.originalException;
      
      // Ignorar erros de DOM que não afetam funcionalidade
      if (error instanceof Error) {
        if (error.message?.includes('removeChild') ||
            error.message?.includes('not a child of this node') ||
            error.name === 'NotFoundError' ||
            error.message?.includes('ResizeObserver loop') ||
            error.message?.includes('Script error')) {
          return null;
        }
      }
      
      return event;
    },
    
    // Ignorar URLs de terceiros
    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });

  console.info('[Sentry] Monitoramento de erros inicializado.');
};

/**
 * Captura uma exceção manualmente
 */
export const captureException = (error: Error, context?: Record<string, unknown>) => {
  if (import.meta.env.DEV) {
    console.error('[Sentry] Erro capturado (dev):', error, context);
    return;
  }

  Sentry.captureException(error, { extra: context });
};

/**
 * Captura uma mensagem de log
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (import.meta.env.DEV) {
    console.log(`[Sentry] ${level.toUpperCase()}: ${message}`);
    return;
  }

  Sentry.captureMessage(message, level);
};

/**
 * Define contexto do usuário para erros
 */
export const setUser = (user: { id: string; email?: string; username?: string } | null) => {
  Sentry.setUser(user);
};

/**
 * Adiciona breadcrumb para rastreamento
 */
export const addBreadcrumb = (breadcrumb: {
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}) => {
  Sentry.addBreadcrumb(breadcrumb);
};

/**
 * Adiciona tag para filtrar erros
 */
export const setTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * Wrapper para funções async com captura de erro
 */
export const withErrorCapture = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureException(error as Error, { context, args: JSON.stringify(args) });
      throw error;
    }
  }) as T;
};

export default {
  initSentry,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  setTag,
  withErrorCapture,
};
