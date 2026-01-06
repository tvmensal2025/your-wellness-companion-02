import React from 'react';
import { Home, Activity, MessageCircle, TrendingUp, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BottomNavSection = 'dashboard' | 'missions' | 'sofia-nutricional' | 'progress' | 'more';

interface BottomNavigationProps {
  activeSection: string;
  onSectionChange: (section: BottomNavSection) => void;
  onMoreClick?: () => void;
}

const navItems: { id: BottomNavSection; icon: React.ElementType; label: string }[] = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'missions', icon: Activity, label: 'Missões' },
  { id: 'sofia-nutricional', icon: MessageCircle, label: 'Sofia' },
  { id: 'progress', icon: TrendingUp, label: 'Progresso' },
  { id: 'more', icon: MoreHorizontal, label: 'Mais' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeSection,
  onSectionChange,
  onMoreClick,
}) => {
  const handleItemClick = (id: BottomNavSection) => {
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
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          const isMore = item.id === 'more';
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full min-w-0 transition-all duration-200 rounded-lg mx-0.5',
                'active:scale-95 touch-manipulation',
                isActive && !isMore
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              )}
              aria-label={item.label}
              aria-current={isActive && !isMore ? 'page' : undefined}
            >
              <div 
                className={cn(
                  'relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300',
                  isActive && !isMore
                    ? 'bg-primary/15 scale-105' 
                    : 'bg-transparent'
                )}
              >
                <Icon 
                  className={cn(
                    'w-4 h-4 transition-all duration-300',
                    isActive && !isMore && 'text-primary'
                  )} 
                />
                {/* Active Indicator */}
                {isActive && !isMore && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span 
                className={cn(
                  'text-[9px] font-medium truncate max-w-full transition-all duration-200',
                  isActive && !isMore ? 'opacity-100' : 'opacity-70'
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
