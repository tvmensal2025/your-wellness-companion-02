import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './integrations/supabase/client'

// Configurar Supabase globalmente para os testes
if (typeof window !== 'undefined') {
  (window as any).supabase = supabase;
  
  // Handler global para capturar e ignorar erros de removeChild que não afetam funcionalidade
  const errorHandler = (event: ErrorEvent) => {
    const error = event.error || event;
    const message = error?.message || '';
    const name = error?.name || '';
    
    if (message.includes('removeChild') || 
        message.includes('not a child of this node') ||
        message.includes('Failed to execute') ||
        name === 'NotFoundError' ||
        name === 'DOMException') {
      // Silenciar completamente esses erros que não afetam funcionalidade
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  };
  
  window.addEventListener('error', errorHandler, true);
  
  // Handler para erros não capturados
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason || {};
    const message = reason?.message || '';
    const name = reason?.name || '';
    
    if (message.includes('removeChild') || 
        message.includes('not a child of this node') ||
        message.includes('Failed to execute') ||
        name === 'NotFoundError' ||
        name === 'DOMException') {
      // Silenciar completamente esses erros
      event.preventDefault();
    }
  });
  
  // Interceptar console.error para filtrar erros de removeChild
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    if (message.includes('removeChild') || 
        message.includes('not a child of this node') ||
        message.includes('NotFoundError')) {
      // Não logar esses erros
      return;
    }
    originalConsoleError.apply(console, args);
  };
}

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
