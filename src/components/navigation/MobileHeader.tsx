import React from 'react';
import { Menu, MoreVertical, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/NotificationBell';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface MobileHeaderProps {
  title: string;
  onMenuClick: () => void;
  onSettingsClick?: () => void;
  showMoreMenu?: boolean;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onMenuClick,
  onSettingsClick,
  showMoreMenu = true,
}) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header 
      className="lg:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border/50"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center h-14 px-3">
        {/* Menu Button */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onMenuClick} 
          className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl hover:bg-primary/10 transition-colors shrink-0 touch-target"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* Title */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-2">
          <h1 className="text-base font-semibold text-foreground text-center leading-tight truncate">
            {title}
          </h1>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* Theme Toggle */}
          <ThemeToggle variant="icon" />
          
          <NotificationBell />
          
          {showMoreMenu && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-11 w-11 min-h-[44px] min-w-[44px] rounded-xl hover:bg-primary/10 touch-target"
                  aria-label="Mais opções"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {onSettingsClick && (
                  <>
                    <DropdownMenuItem onClick={onSettingsClick}>
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
