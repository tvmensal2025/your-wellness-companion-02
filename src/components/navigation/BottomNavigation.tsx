import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BottomNavSection = string;

export interface BottomNavItem {
  id: string;
  icon: React.ElementType;
  label: string;
}

// Mapeamento de labels curtos para o bottom nav
const shortLabels: Record<string, string> = {
  'dashboard': 'Painel',
  'missions': 'Missões',
  'progress': 'Progresso',
  'goals': 'Metas',
  'courses': 'Cursos',
  'sessions': 'Sessões',
  'comunidade': 'Social',
  'challenges': 'Desafios',
  'saboteur-test': 'Teste',
  'sofia-nutricional': 'Sofia',
  'dr-vital': 'Dr.Vital',
  'exercise': 'Treino',
  'meal-plan': 'Cardápio',
  'weighing': 'Peso',
  'health-tracking': 'Saúde',
};

interface BottomNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onMoreClick?: () => void;
  visibleItems?: BottomNavItem[];
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeSection,
  onSectionChange,
  onMoreClick,
  visibleItems = [],
}) => {
  // Pegar os primeiros 4 itens visíveis + "Mais"
  const displayItems = visibleItems.slice(0, 4);

  const handleItemClick = (id: string) => {
    if (id === 'more' && onMoreClick) {
      onMoreClick();
    } else {
      onSectionChange(id);
    }
  };

  // Função para obter label curto
  const getShortLabel = (id: string, originalLabel: string): string => {
    return shortLabels[id] || (originalLabel.length > 8 ? originalLabel.slice(0, 7) + '…' : originalLabel);
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-lg border-t border-border/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 px-1">
        {displayItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const shortLabel = getShortLabel(item.id, item.label);
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 max-w-[72px] transition-all duration-200 rounded-lg',
                'active:scale-95 touch-manipulation',
                isActive
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <div 
                className={cn(
                  'relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300',
                  isActive
                    ? 'bg-primary/15 scale-105' 
                    : 'bg-transparent'
                )}
              >
                <Icon 
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive && 'text-primary'
                  )} 
                />
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span 
                className={cn(
                  'text-[9px] font-medium transition-all duration-200 truncate max-w-full px-0.5',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}
              >
                {shortLabel}
              </span>
            </button>
          );
        })}
        
        {/* Botão "Mais" sempre fixo no final */}
        <button
          onClick={() => onMoreClick?.()}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 max-w-[72px] transition-all duration-200 rounded-lg',
            'active:scale-95 touch-manipulation',
            'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Mais"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 bg-transparent">
            <MoreHorizontal className="w-5 h-5 transition-all duration-300" />
          </div>
          <span className="text-[9px] font-medium transition-all duration-200 opacity-70">
            Mais
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
