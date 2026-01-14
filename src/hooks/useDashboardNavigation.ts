/**
 * Hook para navegação dentro do dashboard
 * Usa setActiveSection do contexto ao invés de navigate() do router
 * Isso permite que os dashboards de personagens naveguem corretamente
 */

import { useCallback } from 'react';
import { useActiveSection } from '@/contexts/ActiveSectionContext';

// Mapeamento de rotas para seções do dashboard
const routeToSection: Record<string, string> = {
  '/sofia-nutricional': 'sofia-nutricional',
  '/dr-vital': 'dr-vital',
  '/exercicios': 'exercicios',
  '/sessions': 'sessions',
  '/progress': 'progress',
  '/missions': 'missions',
  '/goals': 'goals',
  '/challenges': 'challenges',
  '/comunidade': 'comunidade',
  '/courses': 'courses',
  '/subscriptions': 'subscriptions',
  '/profile': 'profile',
  '/sofia': 'sofia',
  '/saboteur-test': 'saboteur-test',
};

export function useDashboardNavigation() {
  const { setActiveSection } = useActiveSection();

  const navigate = useCallback((route: string) => {
    // Remove leading slash if present and map to section
    const cleanRoute = route.startsWith('/') ? route : `/${route}`;
    const section = routeToSection[cleanRoute];
    
    if (section) {
      setActiveSection(section);
    } else {
      // Fallback: tenta usar a rota como seção diretamente
      const fallbackSection = cleanRoute.replace('/', '');
      setActiveSection(fallbackSection);
    }
  }, [setActiveSection]);

  return { navigate };
}

export default useDashboardNavigation;
