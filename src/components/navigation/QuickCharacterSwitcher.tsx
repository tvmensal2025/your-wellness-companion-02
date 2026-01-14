/**
 * QuickCharacterSwitcher
 * Dropdown rápido para trocar de personagem no header
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { characters, CharacterId, Character } from '@/types/character-menu';
import { Check, ChevronDown } from 'lucide-react';

interface QuickCharacterSwitcherProps {
  currentCharacterId: CharacterId | null;
  onSwitch: (characterId: CharacterId) => void;
  className?: string;
}

// Cores por personagem
const characterColors: Record<CharacterId, string> = {
  health: 'ring-red-500/50 bg-red-500/10',
  nutrition: 'ring-green-500/50 bg-green-500/10',
  exercise: 'ring-blue-500/50 bg-blue-500/10',
  coaching: 'ring-purple-500/50 bg-purple-500/10',
  complete: 'ring-yellow-500/50 bg-yellow-500/10',
};

const characterBgColors: Record<CharacterId, string> = {
  health: 'bg-red-500/20 hover:bg-red-500/30',
  nutrition: 'bg-green-500/20 hover:bg-green-500/30',
  exercise: 'bg-blue-500/20 hover:bg-blue-500/30',
  coaching: 'bg-purple-500/20 hover:bg-purple-500/30',
  complete: 'bg-yellow-500/20 hover:bg-yellow-500/30',
};

export const QuickCharacterSwitcher: React.FC<QuickCharacterSwitcherProps> = ({
  currentCharacterId,
  onSwitch,
  className
}) => {
  const [open, setOpen] = useState(false);
  
  const currentCharacter = characters.find(c => c.id === currentCharacterId);

  const handleSelect = (id: CharacterId) => {
    if (id !== currentCharacterId) {
      onSwitch(id);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full transition-all",
            "ring-2 ring-inset",
            currentCharacterId ? characterColors[currentCharacterId] : 'ring-muted bg-muted/50',
            "hover:opacity-90 active:scale-95",
            className
          )}
          aria-label="Trocar personagem"
        >
          {currentCharacter ? (
            <>
              <img
                src={currentCharacter.imagePath}
                alt={currentCharacter.name}
                className="w-6 h-6 rounded-full object-cover"
              />
              <ChevronDown className={cn(
                "w-3 h-3 text-muted-foreground transition-transform",
                open && "rotate-180"
              )} />
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs">?</span>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-56 p-2 z-[100]"
        align="end"
        sideOffset={12}
        collisionPadding={16}
      >
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground px-2 pb-1">
            Trocar personagem
          </p>
          
          {characters.map((character) => (
            <button
              key={character.id}
              onClick={() => handleSelect(character.id)}
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-all",
                "hover:bg-accent",
                currentCharacterId === character.id && characterBgColors[character.id]
              )}
            >
              <img
                src={character.imagePath}
                alt={character.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-border"
              />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">{character.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {character.description}
                </p>
              </div>
              {currentCharacterId === character.id && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default QuickCharacterSwitcher;
