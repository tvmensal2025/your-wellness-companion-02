/**
 * FeatureGuard Component
 * Protege rotas/componentes baseado na visibilidade da feature
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useMenuStyleContextSafe } from '@/contexts/MenuStyleContext';

interface FeatureGuardProps {
  featureId: string;
  children: ReactNode;
  fallbackPath?: string;
  showMessage?: boolean;
}

export function FeatureGuard({ 
  featureId, 
  children, 
  fallbackPath = '/dashboard',
  showMessage = false 
}: FeatureGuardProps) {
  const menuStyle = useMenuStyleContextSafe();
  
  // Se não há contexto, permitir acesso (fallback)
  if (!menuStyle) {
    return <>{children}</>;
  }
  
  const isVisible = menuStyle.isFeatureVisible(featureId);
  
  if (!isVisible) {
    if (showMessage) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg 
              className="w-8 h-8 text-muted-foreground" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Funcionalidade não disponível
          </h2>
          <p className="text-muted-foreground mb-4">
            Esta funcionalidade não está disponível no seu estilo de experiência atual.
          </p>
          <button
            onClick={() => menuStyle.setShowSelector(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Trocar Experiência
          </button>
        </div>
      );
    }
    
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
}

export default FeatureGuard;
