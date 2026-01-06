import React from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { OfflineIndicatorCompact } from '@/components/OfflineIndicator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MobileHeaderProps {
  title: string;
  onAvatarClick?: () => void;
  avatarUrl?: string;
  userName?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onAvatarClick,
  avatarUrl,
  userName,
}) => {
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header 
      className="lg:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border/50"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center h-12 px-3">
        {/* Offline Indicator */}
        <div className="shrink-0">
          <OfflineIndicatorCompact />
        </div>
        
        {/* Title - Centered */}
        <div className="flex-1 flex items-center justify-center min-w-0 px-1 max-w-[55%]">
          <h1 className="text-xs font-medium text-foreground/80 text-center leading-tight truncate">
            {title}
          </h1>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-3 shrink-0 justify-end">
          <NotificationBell />
          
          {/* Avatar */}
          <button
            onClick={onAvatarClick}
            className="h-9 w-9 rounded-full transition-all touch-manipulation active:scale-95"
            aria-label="Abrir perfil"
          >
            <Avatar className="h-9 w-9 bg-muted">
              {avatarUrl && avatarUrl.trim() ? (
                <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {getInitials(userName)}
              </AvatarFallback>
            </Avatar>
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
