/**
 * CharacterSelector Component
 * Overlay transparente sobre o app
 * Clique no personagem = seleciona e começa
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { characters, CharacterId, Character } from '@/types/character-menu';
import { CharacterCard } from './CharacterCard';
import { Logo } from '@/components/ui/logo';
import { getCharactersSortedByPopularity } from '@/utils/characterPreference';

interface CharacterSelectorProps {
  onSelect: (characterId: CharacterId) => void;
  isChanging?: boolean;
  onCancel?: () => void;
}

export function CharacterSelector({ 
  onSelect, 
  isChanging = false,
  onCancel 
}: CharacterSelectorProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(true); // Começa como mobile para evitar flash
  
  // Personagens ordenados pelo mais escolhido primeiro
  const [sortedCharacters, setSortedCharacters] = useState<Character[]>(characters);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Ordenar personagens pelo mais escolhido
  useEffect(() => {
    const sorted = getCharactersSortedByPopularity();
    setSortedCharacters(sorted);
  }, []);

  // Clique no personagem = seleciona e começa direto
  const handleSelect = (id: CharacterId) => {
    setIsConfirming(true);
    setTimeout(() => {
      onSelect(id);
    }, 300);
  };

  const goToSlide = (index: number) => {
    const newIndex = Math.max(0, Math.min(index, sortedCharacters.length - 1));
    setCurrentIndex(newIndex);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Threshold maior = precisa arrastar mais para mudar
    const threshold = 100;
    // Também considera velocidade do swipe
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    if ((offset < -threshold || velocity < -500) && currentIndex < sortedCharacters.length - 1) {
      goToSlide(currentIndex + 1);
    } else if ((offset > threshold || velocity > 500) && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
      >
        {/* Overlay leve - blur suave */}
        <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4">
          <Logo className="h-8" />
          {isChanging && onCancel && (
            <button
              onClick={onCancel}
              className="text-white/70 hover:text-white transition-colors font-medium"
            >
              Cancelar
            </button>
          )}
        </div>

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col overflow-hidden">

          {/* Mobile: Carousel simples e centralizado */}
          {isMobile ? (
            <div className="flex-1 flex flex-col pb-2">
              {/* Carousel Container */}
              <div className="flex-1 flex items-center overflow-hidden">
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={handleDragEnd}
                  className="flex cursor-grab active:cursor-grabbing"
                  style={{ 
                    touchAction: 'pan-y',
                    paddingLeft: 'calc(50vw - 145px)',
                    paddingRight: 'calc(50vw - 145px)',
                  }}
                  animate={{ x: -currentIndex * 310 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {sortedCharacters.map((character, index) => (
                    <motion.div 
                      key={character.id}
                      className="flex-shrink-0 w-[290px] mx-[10px]"
                      animate={{
                        scale: currentIndex === index ? 1 : 0.85,
                        opacity: currentIndex === index ? 1 : 0.4,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="h-[70vh] min-h-[500px] max-h-[650px] flex flex-col">
                        <CharacterCard
                          character={character}
                          onSelect={handleSelect}
                          index={index}
                          variant="story"
                          isActive={currentIndex === index}
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Dots com cores do personagem */}
              <div className="flex gap-3 justify-center py-3">
                {sortedCharacters.map((char, index) => {
                  const dotColors: Record<CharacterId, string> = {
                    health: 'bg-red-400',
                    nutrition: 'bg-green-400',
                    exercise: 'bg-blue-400',
                    coaching: 'bg-purple-400',
                    complete: 'bg-yellow-400',
                  };
                  return (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={cn(
                        "h-3 rounded-full transition-all duration-300",
                        currentIndex === index 
                          ? `w-10 ${dotColors[char.id]}` 
                          : "w-3 bg-white/30 hover:bg-white/50"
                      )}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            /* Desktop: Grid */
            <div className="flex-1 overflow-auto p-4 md:p-8 flex items-center">
              <div className="max-w-5xl mx-auto w-full">
                <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
                  {sortedCharacters.map((character, index) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      onSelect={handleSelect}
                      index={index}
                      variant="glass"
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading transition */}
        <AnimatePresence>
          {isConfirming && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background z-60 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="w-12 h-12 border-2 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Preparando...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}

export default CharacterSelector;
