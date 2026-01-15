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

// Função para remover o loader inicial do HTML
const removeInitialLoader = () => {
  const loader = document.getElementById('initial-loader');
  if (loader) {
    loader.style.opacity = '0';
    loader.style.transition = 'opacity 0.3s ease-out';
    setTimeout(() => loader.remove(), 300);
  }
};

// Timeout de segurança - remove loader após 10s mesmo se algo falhar
const safetyTimeout = setTimeout(() => {
  console.warn('[App] Safety timeout - removendo loader inicial');
  removeInitialLoader();
}, 10000);

try {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  // Remove loader inicial após React montar (com pequeno delay para transição suave)
  setTimeout(() => {
    clearTimeout(safetyTimeout);
    removeInitialLoader();
  }, 100);
} catch (error) {
  console.error('Erro ao renderizar aplicação:', error);
  clearTimeout(safetyTimeout);
  
  // Fallback: tentar renderizar sem StrictMode
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    setTimeout(removeInitialLoader, 100);
  } catch (fallbackError) {
    console.error('Erro crítico ao renderizar:', fallbackError);
    // Mostrar mensagem de erro no loader
    const loader = document.getElementById('initial-loader');
    if (loader) {
      loader.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
          <h2 style="color: #f87171; margin-bottom: 8px;">Erro ao carregar</h2>
          <p style="color: #94a3b8; margin-bottom: 16px;">Tente recarregar a página</p>
          <button onclick="location.reload()" style="
            padding: 12px 24px;
            background: #22c55e;
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
          ">Recarregar</button>
        </div>
      `;
    }
  }
}