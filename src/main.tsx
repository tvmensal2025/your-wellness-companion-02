import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Handler global para erros não tratados
// - ignora apenas erros realmente inofensivos
// - em erros de carregamento de chunks (comum em mobile/cache), força um reload 1x

const transientReloadErrors = [
  'ChunkLoadError',
  'Loading chunk',
  'dynamically imported module',
  'Network request failed',
  'Load failed',
];

const ignoredErrors = [
  'removeChild',
  'not a child of this node',
  'NotFoundError',
  'ResizeObserver loop',
  'Script error',
];

const RELOAD_ONCE_KEY = '__reload_once__';

const maybeReloadOnTransientError = (msg: string) => {
  if (!transientReloadErrors.some((e) => msg.includes(e))) return false;

  try {
    if (sessionStorage.getItem(RELOAD_ONCE_KEY)) return false;
    sessionStorage.setItem(RELOAD_ONCE_KEY, '1');
  } catch {
    // se sessionStorage falhar (modo privado), segue para reload mesmo assim
  }

  console.warn('Erro transitório detectado, recarregando a página:', msg);
  window.location.reload();
  return true;
};

window.onerror = (message, source, lineno, colno, error) => {
  const msg = String(message || error?.message || '');

  if (maybeReloadOnTransientError(msg)) {
    return true;
  }

  if (ignoredErrors.some((e) => msg.includes(e))) {
    console.warn('Erro global ignorado:', msg);
    return true;
  }

  return false;
};

window.addEventListener('error', (event) => {
  const msg = String(event.message || event.error?.message || '');

  if (maybeReloadOnTransientError(msg)) {
    event.preventDefault();
    return;
  }

  if (ignoredErrors.some((e) => msg.includes(e))) {
    event.preventDefault();
    console.warn('Erro de evento ignorado:', msg);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = String((event as any).reason?.message || (event as any).reason || '');

  if (maybeReloadOnTransientError(msg)) {
    event.preventDefault();
    return;
  }

  if (ignoredErrors.some((e) => msg.includes(e))) {
    event.preventDefault();
    console.warn('Promise rejeitada ignorada:', msg);
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