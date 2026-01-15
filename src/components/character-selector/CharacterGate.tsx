/**
 * CharacterGate Component
 * Renderiza o app por trás e o CharacterSelector como overlay transparente
 * 
 * IMPORTANTE: O seletor só aparece em rotas protegidas (não em /auth)
 * CORREÇÃO: Verificação de rota + timeout de segurança para evitar tela branca
 */

import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useMenuStyleContext } from '@/contexts/MenuStyleContext';
import { CharacterSelector } from './CharacterSelector';
import { Leaf } from 'lucide-react';

interface CharacterGateProps {
  children: ReactNode;
}

// Rotas onde o seletor NÃO deve aparecer (inclui / para evitar tela branca no redirect)
const PUBLIC_ROUTES = ['/', '/auth', '/terms', '/termos', '/privacidade', '/auto-login', '/install', '/relatorio', '/community/post'];

// Loader CSS puro - sempre funciona
const CSSLoader = () => (
  <div className="fixed inset-0 bg-background/90 backdrop-blur-sm flex flex-col items-center justify-center z-50">
    <div className="relative w-16 h-16">
      {/* Círculo girando - CSS puro */}
      <div className="absolute inset-0 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
      {/* Folha central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Leaf className="w-6 h-6 text-primary animate-pulse" />
      </div>
    </div>
    <p className="mt-4 text-sm text-muted-foreground animate-pulse">Carregando...</p>
  </div>
);

export function CharacterGate({ children }: CharacterGateProps) {
  const location = useLocation();
  const { 
    selectedCharacter, 
    isLoading, 
    setCharacter,
    showSelector,
    setShowSelector 
  } = useMenuStyleContext();

  // Verificar se está em rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  // Determinar se deve mostrar o seletor (NUNCA bloqueia renderização)
  const shouldShowSelector = showSelector && !isPublicRoute && !isLoading;

  // SEMPRE renderiza children - loader apenas como overlay se necessário
  return (
    <>
      {/* App SEMPRE renderiza - nunca tela branca */}
      {children}
      
      {/* Loader como overlay apenas em rotas protegidas durante loading */}
      {isLoading && !isPublicRoute && <CSSLoader />}
      
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
