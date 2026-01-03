import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { supabase } from './integrations/supabase/client-fixed'

// Expor supabase no window apenas para debug manual
if (typeof window !== 'undefined') {
  ;(window as any).supabase = supabase;
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
