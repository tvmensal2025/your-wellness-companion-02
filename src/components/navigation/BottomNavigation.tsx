import React from 'react';
import { Home, Activity, MessageCircle, TrendingUp, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BottomNavSection = 'dashboard' | 'missions' | 'sofia-nutricional' | 'progress' | 'profile';

interface BottomNavigationProps {
  activeSection: string;
  onSectionChange: (section: BottomNavSection) => void;
}

const navItems: { id: BottomNavSection; icon: React.ElementType; label: string }[] = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'missions', icon: Activity, label: 'Missões' },
  { id: 'sofia-nutricional', icon: MessageCircle, label: 'Sofia' },
  { id: 'progress', icon: TrendingUp, label: 'Progresso' },
  { id: 'profile', icon: User, label: 'Perfil' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card/95 backdrop-blur-lg border-t border-border/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center gap-1 flex-1 h-full min-w-0 transition-all duration-200 rounded-xl mx-0.5',
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
                  'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300',
                  isActive 
                    ? 'bg-primary/15 scale-110' 
                    : 'bg-transparent'
                )}
              >
                <Icon 
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive && 'text-primary'
                  )} 
                />
              </div>
              <span 
                className={cn(
                  'text-[10px] font-medium truncate max-w-full transition-all duration-200',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}
              >
                {item.label}
              </span>
              
              {/* Indicador ativo */}
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
