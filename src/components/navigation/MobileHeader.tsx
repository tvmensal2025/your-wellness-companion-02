import React, { useState } from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { OfflineIndicatorCompact } from '@/components/OfflineIndicator';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMenuStyleContext } from '@/contexts/MenuStyleContext';
import { CharacterId, getCharacterById } from '@/types/character-menu';
import { CharacterSelector } from '@/components/character-selector/CharacterSelector';
import { useTheme, THEME_PRESETS } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Palette, Check, Shuffle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion } from 'framer-motion';
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
  const [showColorSheet, setShowColorSheet] = useState(false);
  const {
    currentPreset,
    setPreset
  } = useTheme();
  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const handleCharacterSwitch = (characterId: CharacterId) => {
    setCharacter(characterId);
    setShowSelector(false);
  };
  const handleColorSelect = (presetId: typeof THEME_PRESETS[number]['id']) => {
    setPreset(presetId);
    setShowColorSheet(false);
  };
  return <>
      <header className="lg:hidden sticky top-0 z-40 bg-card/95 backdrop-blur-lg border-b border-border/50 overflow-visible" style={{
      paddingTop: 'env(safe-area-inset-top, 0px)'
    }}>
        <div className="flex items-center justify-between h-12 px-4 relative overflow-visible">
          {/* Left side - Offline Indicator + Theme Toggle + Color Picker */}
          <div className="flex items-center gap-1 shrink-0 z-10">
            <OfflineIndicatorCompact />
            <ThemeToggle variant="icon" className="h-8 w-8" />
            
            {/* Color Theme Button - Opens Sheet */}
            <Sheet open={showColorSheet} onOpenChange={setShowColorSheet}>
              <SheetTrigger asChild>
                <button className={cn("h-8 w-8 rounded-xl flex items-center justify-center", "hover:bg-primary/10 transition-colors touch-target")} aria-label="Escolher cor do app">
                  <Palette className="w-4 h-4 text-primary" />
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="rounded-t-3xl pb-8">
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-center flex items-center justify-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Cor do App
                  </SheetTitle>
                </SheetHeader>
                
                <div className="grid grid-cols-4 gap-4 px-2">
                  {THEME_PRESETS.map((preset, index) => <motion.button key={preset.id} initial={{
                  opacity: 0,
                  scale: 0.8
                }} animate={{
                  opacity: 1,
                  scale: 1
                }} transition={{
                  delay: index * 0.05
                }} onClick={() => handleColorSelect(preset.id)} className="flex flex-col items-center gap-2">
                      <div className={cn("w-14 h-14 rounded-2xl transition-all duration-200 flex items-center justify-center", `bg-gradient-to-br ${preset.gradient}`, "shadow-lg", currentPreset.id === preset.id ? "ring-3 ring-white ring-offset-2 ring-offset-background scale-105" : "opacity-80 hover:opacity-100 hover:scale-105")}>
                        {currentPreset.id === preset.id && <Check className="w-6 h-6 text-white drop-shadow-md" />}
                      </div>
                      <span className={cn("text-[10px] font-medium", currentPreset.id === preset.id ? "text-primary" : "text-muted-foreground")}>
                        {preset.name}
                      </span>
                    </motion.button>)}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Center - Title */}
          <div className="absolute left-1/2 -translate-x-1/2 max-w-[40%] z-0">
            <h1 className="text-xs font-medium text-center leading-tight truncate text-warning">
              {title}
            </h1>
          </div>
          
          {/* Right side - Character Switcher + Notifications + Avatar */}
          <div className="flex items-center gap-1 shrink-0 justify-end z-10 overflow-visible">
            {/* Character Switcher - Shuffle icon */}
            <button onClick={() => setShowSelector(true)} className={cn("h-8 w-8 rounded-xl flex items-center justify-center", "hover:bg-primary/10 transition-colors touch-target")} aria-label="Trocar personagem">
              <Shuffle className="w-4 h-4 text-primary" />
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