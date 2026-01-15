/**
 * CharacterGate Component
 * Renderiza o app por trás e o CharacterSelector como overlay transparente
 * 
 * IMPORTANTE: O seletor só aparece em rotas protegidas (não em /auth)
 * CORREÇÃO: Verificação de rota + timeout de segurança para evitar tela branca
 */

import { ReactNode, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useMenuStyleContext } from '@/contexts/MenuStyleContext';
import { CharacterSelector } from './CharacterSelector';

interface CharacterGateProps {
  children: ReactNode;
}

// Rotas onde o seletor NÃO deve aparecer (inclui / para evitar tela branca no redirect)
const PUBLIC_ROUTES = ['/', '/auth', '/terms', '/termos', '/privacidade', '/auto-login', '/install', '/relatorio', '/community/post'];

export function CharacterGate({ children }: CharacterGateProps) {
  const location = useLocation();
  const { 
    selectedCharacter, 
    isLoading, 
    setCharacter,
    showSelector,
    setShowSelector 
  } = useMenuStyleContext();
  
  // Estado de fallback para evitar tela branca
  const [forceShow, setForceShow] = useState(false);

  // Verificar se está em rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // Se loading demorar mais de 1.5s, força mostrar o app
  useEffect(() => {
    if (isLoading && !forceShow) {
      const timeout = setTimeout(() => {
        console.warn('[CharacterGate] Timeout de loading - forçando exibição');
        setForceShow(true);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, forceShow]);

  // Loading state com timeout de segurança - só se não for rota pública
  if (isLoading && !forceShow && !isPublicRoute) {
    return (
      <>
        {/* Sempre renderiza o conteúdo por baixo */}
        {children}
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </>
    );
  }

  // Determinar se deve mostrar o seletor
  // Só mostra se: showSelector=true E não estiver em rota pública
  const shouldShowSelector = showSelector && !isPublicRoute;

  return (
    <>
      {/* App sempre renderiza por trás */}
      {children}
      
      {/* Selector como overlay - só em rotas protegidas */}
      <AnimatePresence>
        {shouldShowSelector && (
          <CharacterSelector
            onSelect={(id) => {
              setCharacter(id);
              setShowSelector(false);
            }}
            isChanging={!!selectedCharacter}
            onCancel={selectedCharacter ? () => setShowSelector(false) : undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default CharacterGate;
