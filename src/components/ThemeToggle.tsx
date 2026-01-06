import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'icon' | 'dropdown' | 'switch';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  variant = 'icon',
  className,
  showLabel = false
}) => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Simple icon toggle
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={cn(
          "h-10 w-10 rounded-xl hover:bg-primary/10 transition-colors touch-target",
          className
        )}
        aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-foreground" />
        ) : (
          <Moon className="h-5 w-5 text-foreground" />
        )}
      </Button>
    );
  }

  // Dropdown with options
  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl hover:bg-primary/10 transition-colors touch-target",
              className
            )}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-36">
          <DropdownMenuItem 
            onClick={() => setTheme('light')}
            className={cn(theme === 'light' && 'bg-accent')}
          >
            <Sun className="mr-2 h-4 w-4" />
            Claro
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme('dark')}
            className={cn(theme === 'dark' && 'bg-accent')}
          >
            <Moon className="mr-2 h-4 w-4" />
            Escuro
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme('system')}
            className={cn(theme === 'system' && 'bg-accent')}
          >
            <span className="mr-2 text-sm">💻</span>
            Sistema
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Switch style toggle
  if (variant === 'switch') {
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={cn(
          "relative flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50",
          "hover:bg-accent/50 transition-colors touch-target w-full",
          className
        )}
        aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      >
        <div className={cn(
          "relative h-7 w-14 rounded-full transition-colors duration-300",
          isDark ? "bg-primary" : "bg-muted"
        )}>
          <div className={cn(
            "absolute top-0.5 h-6 w-6 rounded-full bg-background shadow-md transition-transform duration-300",
            "flex items-center justify-center",
            isDark ? "translate-x-7" : "translate-x-0.5"
          )}>
            {isDark ? (
              <Moon className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Sun className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {showLabel && (
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium text-foreground">
              Modo {isDark ? 'Escuro' : 'Claro'}
            </span>
            <span className="text-xs text-muted-foreground">
              {isDark ? 'Tema escuro ativado' : 'Tema claro ativado'}
            </span>
          </div>
        )}
      </button>
    );
  }

  return null;
};

export default ThemeToggle;
