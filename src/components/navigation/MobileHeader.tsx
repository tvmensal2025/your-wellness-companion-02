import React, { useState } from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { OfflineIndicatorCompact } from '@/components/OfflineIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMenuStyleContext } from '@/contexts/MenuStyleContext';
import { CharacterId, getCharacterById } from '@/types/character-menu';
import { CharacterSelector } from '@/components/character-selector/CharacterSelector';
interface MobileHeaderProps {
  title: string;
  onAvatarClick?: () => void;
  avatarUrl?: string;
  userName?: string;
  userId?: string;
}
export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  onAvatarClick,
  avatarUrl,
  userName,
  userId
}) => {
  const {
    selectedCharacter,
    setCharacter
  } = useMenuStyleContext();
  const [showSelector, setShowSelector] = useState(false);
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const handleCharacterSwitch = (characterId: CharacterId) => {
    setCharacter(characterId);
    setShowSelector(false);
  };
  return <>
      <header className="lg:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border/50 overflow-visible" style={{
      paddingTop: 'env(safe-area-inset-top, 0px)'
    }}>
        <div className="flex items-center justify-between h-12 px-4 relative overflow-visible">
          {/* Left side - Offline Indicator + Theme Toggle */}
          <div className="flex items-center gap-2 shrink-0 z-10">
            <OfflineIndicatorCompact />
            <ThemeToggle variant="icon" className="h-8 w-8" />
          </div>
          
          {/* Center - Title */}
          <div className="absolute left-1/2 -translate-x-1/2 max-w-[40%] z-0">
            <h1 className="text-xs font-medium text-center leading-tight truncate text-destructive">
              {title}
            </h1>
          </div>
          
          {/* Right side - Character Switcher + Notifications + Avatar */}
          <div className="flex items-center gap-0 shrink-0 justify-end z-10 overflow-visible">
            {/* Character Switcher - Small image button */}
            <button onClick={() => setShowSelector(true)} className="w-20 h-20 transition-all active:scale-95 flex-shrink-0 -mr-2" aria-label="Trocar personagem">
              <img src="/images/personagens-icon.png" alt="Trocar personagem" className="w-full h-full object-contain" />
            </button>
            
            <NotificationBell userId={userId} />
            
            {/* Avatar */}
            <button onClick={onAvatarClick} className="h-10 w-10 rounded-full transition-all touch-manipulation active:scale-95 flex-shrink-0" aria-label="Abrir perfil">
              <Avatar className="h-10 w-10 bg-muted ring-2 ring-primary/30 shadow-lg">
                {avatarUrl && avatarUrl.trim() ? <AvatarImage src={avatarUrl} alt={userName} className="object-cover" /> : null}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>
        </div>
      </header>

      {/* Character Selector Fullscreen */}
      {showSelector && <CharacterSelector onSelect={handleCharacterSwitch} isChanging={true} onCancel={() => setShowSelector(false)} />}
    </>;
};
export default MobileHeader;