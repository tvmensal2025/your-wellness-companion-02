/**
 * AuthContext - Re-export do hook useAuth para compatibilidade
 * 
 * Este arquivo existe para manter compatibilidade com imports antigos
 * que usam @/contexts/AuthContext
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth as useAuthHook } from '@/hooks/useAuth';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuthHook();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  // Se não estiver dentro de um AuthProvider, usa o hook diretamente
  if (context === undefined) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useAuthHook();
  }
  
  return context;
}

// Re-export para compatibilidade
export { useAuth as default };
