import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initSentry } from './lib/sentry'

// Inicializa Sentry para monitoramento de erros em produção
initSentry();

// Handler global para erros não tratados - evita mensagens de erro na UI
// IMPORTANTE: NÃO ignorar ChunkLoadError - precisa mostrar UI de reload
const ignoredErrors = [
  'removeChild',
  'not a child of this node',
  'NotFoundError',
  'ResizeObserver loop',
  'Script error',
  'Cannot read properties of null',
  'Cannot read properties of undefined',
  'Failed to execute'
];

// Erros que indicam versão desatualizada - tratados pelo ChunkErrorHandler
const chunkErrors = [
  'ChunkLoadError',
  'Loading chunk',
  'dynamically imported module',
  'Failed to fetch dynamically imported module',
  'Network request failed',
  'Load failed'
];

window.onerror = (message, source, lineno, colno, error) => {
  const msg = String(message || error?.message || '');
  
  // Erros de chunk - não suprimir, deixar ChunkErrorHandler tratar
  if (chunkErrors.some(e => msg.includes(e))) {
    console.error('[App] Chunk error detectado:', msg);
    return false; // Deixa propagar para o handler
  }
  
  if (ignoredErrors.some(e => msg.includes(e))) {
    console.warn('Erro global ignorado:', msg);
    return true;
  }
  return false;
};

window.addEventListener('error', (event) => {
  const msg = String(event.message || event.error?.message || '');
  
  // Erros de chunk - não suprimir
  if (chunkErrors.some(e => msg.includes(e))) {
    console.error('[App] Chunk event error:', msg);
    return; // Deixa propagar
  }
  
  if (ignoredErrors.some(e => msg.includes(e))) {
    event.preventDefault();
    console.warn('Erro de evento ignorado:', msg);
    return;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  const msg = String(event.reason?.message || event.reason || '');
  
  // Erros de chunk - não suprimir
  if (chunkErrors.some(e => msg.includes(e))) {
    console.error('[App] Chunk rejection:', msg);
    return; // Deixa propagar
  }
  
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

// Limpar qualquer conteúdo existente para evitar conflitos
rootElement.innerHTML = '';

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Erro ao renderizar aplicação:', error);
  // Fallback: tentar renderizar sem StrictMode
  const root = createRoot(rootElement);
  root.render(<App />);
}