import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './lib/sentry'

// Inicializa Sentry para monitoramento de erros em produção
initSentry();

// Handler global para erros não tratados - evita mensagens de erro na UI
const ignoredErrors = [
  'removeChild',
  'not a child of this node',
  'NotFoundError',
  'ResizeObserver loop',
  'Script error',
  'ChunkLoadError',
  'Loading chunk',
  'dynamically imported module',
  'Cannot read properties of null',
  'Cannot read properties of undefined',
  'Failed to execute',
  'Network request failed',
  'Load failed'
];

window.onerror = (message, source, lineno, colno, error) => {
  const msg = String(message || error?.message || '');
  if (ignoredErrors.some(e => msg.includes(e))) {
    console.warn('Erro global ignorado:', msg);
    return true; // Previne exibição do erro
  }
  return false;
};

window.addEventListener('error', (event) => {
  const msg = String(event.message || event.error?.message || '');
  if (ignoredErrors.some(e => msg.includes(e))) {
    event.preventDefault();
    console.warn('Erro de evento ignorado:', msg);
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason?.message || event.reason || '');
  if (ignoredErrors.some(e => msg.includes(e))) {
    event.preventDefault();
    console.warn('Promise rejeitada ignorada:', msg);
    return;
  }
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);