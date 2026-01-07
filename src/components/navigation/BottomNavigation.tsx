import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BottomNavSection = string;

export interface BottomNavItem {
  id: string;
  icon: React.ElementType;
  label: string;
}

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

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-lg border-t border-border/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-14 px-2">
        {displayItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 transition-all duration-200 rounded-lg mx-0.5',
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
                    'w-4 h-4 transition-all duration-300',
                    isActive && 'text-primary'
                  )} 
                />
                {isActive && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span 
                className={cn(
                  'text-[9px] font-medium truncate max-w-full transition-all duration-200',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
        
        {/* Botão "Mais" sempre fixo no final */}
        <button
          onClick={() => onMoreClick?.()}
          className={cn(
            'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 transition-all duration-200 rounded-lg mx-0.5',
            'active:scale-95 touch-manipulation',
            'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Mais"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 bg-transparent">
            <MoreHorizontal className="w-4 h-4 transition-all duration-300" />
          </div>
          <span className="text-[9px] font-medium truncate max-w-full transition-all duration-200 opacity-70">
            Mais
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
