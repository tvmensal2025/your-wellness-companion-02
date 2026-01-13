/**
 * CharacterCard Component
 * Clique = seleciona e começa
 */

import { cn } from '@/lib/utils';
import { Character } from '@/types/character-menu';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  onSelect: (id: Character['id']) => void;
  index: number;
  variant?: 'story' | 'glass';
  isActive?: boolean;
}

export function CharacterCard({ 
  character, 
  onSelect, 
  index,
  variant = 'glass',
  isActive = true
}: CharacterCardProps) {
  
  // Variante Story (Mobile) - Personagem grande, clicável
  if (variant === 'story') {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: isActive ? 1 : 0.3, 
          scale: isActive ? 1 : 0.75 
        }}
        transition={{ duration: 0.3 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelect(character.id)}
        className="relative flex flex-col items-center w-full h-full focus:outline-none"
      >
        {/* Imagem do personagem */}
        <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
          <img
            src={character.imagePath}
            alt={character.name}
            className="h-full w-auto object-contain drop-shadow-2xl"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
            onError={(e) => {
              console.error('Erro ao carregar imagem:', character.imagePath);
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>

        {/* Nome embaixo */}
        <div className="mt-2 text-center flex-shrink-0">
          <h3 className="text-xl font-bold text-white">
            {character.name}
          </h3>
          <p className="text-sm text-white/60">
            {character.description}
          </p>
        </div>
      </motion.button>
    );
  }

  // Variante Glass (Desktop)
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onSelect(character.id)}
      className={cn(
        "relative flex flex-col items-center p-4 rounded-2xl",
        "bg-white/10 backdrop-blur-sm border border-white/20",
        "hover:bg-white/20 hover:border-white/30",
        "transition-all duration-300",
        "focus:outline-none focus:ring-2 focus:ring-white/30"
      )}
    >
      {/* Imagem */}
      <div className="relative w-full aspect-[3/4] mb-3">
        <img
          src={character.imagePath}
          alt={character.name}
          className="w-full h-full object-contain drop-shadow-lg"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />

        {/* Sparkle para "Experiência Completa" */}
        {character.id === 'complete' && (
          <div className="absolute top-2 left-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
        )}
      </div>

      {/* Nome */}
      <h3 className="text-base font-semibold text-white mb-0.5">
        {character.name}
      </h3>

      {/* Descrição */}
      <p className="text-xs text-white/50 text-center">
        {character.description}
      </p>
    </motion.button>
  );
}

export default CharacterCard;
