import React from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { OfflineIndicatorCompact } from '@/components/OfflineIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageButton } from '@/components/community/MessageButton';

interface MobileHeaderProps {
  title: string;
  onAvatarClick?: () => void;
  avatarUrl?: string;
  userName?: string;
  unreadMessages?: number;
  onMessageClick?: () => void;
  userId?: string;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onAvatarClick,
  avatarUrl,
  userName,
  unreadMessages = 0,
  onMessageClick,
  userId,
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
      <div className="flex items-center justify-between h-12 px-3 relative">
        {/* Left side - Offline Indicator + Theme Toggle */}
        <div className="flex items-center gap-2 shrink-0 z-10">
          <OfflineIndicatorCompact />
          <ThemeToggle variant="icon" className="h-8 w-8" />
        </div>
        
        {/* Title - Centered with absolute positioning */}
        <div className="absolute left-1/2 -translate-x-1/2 max-w-[50%] z-0">
          <h1 className="text-xs font-medium text-foreground/80 text-center leading-tight truncate">
            {title}
          </h1>
        </div>
        
        {/* Right side - Messages + Notifications + Avatar */}
        <div className="flex items-center gap-1 shrink-0 justify-end z-10 overflow-visible">
          {onMessageClick && (
            <MessageButton 
              unreadCount={unreadMessages} 
              onClick={onMessageClick}
              className="h-8 w-8"
            />
          )}
          <NotificationBell userId={userId} />
          
          {/* Avatar */}
          <button
            onClick={onAvatarClick}
            className="h-10 w-10 rounded-full transition-all touch-manipulation active:scale-95"
            aria-label="Abrir perfil"
          >
            <Avatar className="h-10 w-10 bg-muted ring-2 ring-primary/20">
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
