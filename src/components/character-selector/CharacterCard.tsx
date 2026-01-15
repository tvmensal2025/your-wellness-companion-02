/**
 * CharacterCard Component
 * Clique = seleciona e começa
 */

import { cn } from '@/lib/utils';
import { Character, CharacterId } from '@/types/character-menu';
import { motion } from 'framer-motion';
import { Sparkles, Heart, Utensils, Dumbbell, Brain, Crown } from 'lucide-react';

interface CharacterCardProps {
  character: Character;
  onSelect: (id: Character['id']) => void;
  index: number;
  variant?: 'story' | 'glass';
  isActive?: boolean;
}

// Descrições detalhadas dos benefícios por personagem
const characterBenefits: Record<CharacterId, { icon: React.ReactNode; benefits: string[] }> = {
  health: {
    icon: <Heart className="w-5 h-5 text-red-400" />,
    benefits: [
      'Análise inteligente de exames médicos',
      'Acompanhamento de métricas de saúde',
      'Previsões e alertas personalizados'
    ]
  },
  nutrition: {
    icon: <Utensils className="w-5 h-5 text-green-400" />,
    benefits: [
      'Análise nutricional por foto com IA',
      'Planos alimentares personalizados',
      'Contador de calorias e macros'
    ]
  },
  exercise: {
    icon: <Dumbbell className="w-5 h-5 text-blue-400" />,
    benefits: [
      'Treinos guiados com progressão',
      'Timer inteligente de descanso',
      'Análise de postura por câmera'
    ]
  },
  coaching: {
    icon: <Brain className="w-5 h-5 text-purple-400" />,
    benefits: [
      'Sessões de desenvolvimento pessoal',
      'Identificação de sabotadores',
      'Missões diárias motivacionais'
    ]
  },
  complete: {
    icon: <Crown className="w-5 h-5 text-yellow-400" />,
    benefits: [
      'Acesso a TODAS as funcionalidades',
      'Integração completa entre módulos',
      'Experiência premium ilimitada'
    ]
  }
};

export function CharacterCard({ 
  character, 
  onSelect, 
  index,
  variant = 'glass',
  isActive = true
}: CharacterCardProps) {
  
  // Variante Story (Mobile) - Personagem grande, clicável
  if (variant === 'story') {
    const benefits = characterBenefits[character.id];
    
    // Cores por personagem
    const characterColors: Record<CharacterId, string> = {
      health: 'from-red-500/20 to-red-600/10 border-red-500/30',
      nutrition: 'from-green-500/20 to-green-600/10 border-green-500/30',
      exercise: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
      coaching: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
      complete: 'from-yellow-500/20 to-amber-600/10 border-yellow-500/30',
    };
    
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
        {/* Imagem do personagem - ocupa maior parte */}
        <div className="flex-[2.5] w-full flex items-end justify-center overflow-visible">
          <img
            src={character.imagePath}
            alt={character.name}
            className="w-auto object-contain drop-shadow-2xl"
            style={{ maxHeight: '110%', maxWidth: '150%' }}
            onError={(e) => {
              console.error('Erro ao carregar imagem:', character.imagePath);
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
        </div>

        {/* Card de info sobrepondo levemente */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isActive ? 1 : 0.5, y: isActive ? 0 : 10 }}
          transition={{ delay: 0.1 }}
          className={cn(
            "w-full -mt-8 rounded-3xl p-5 backdrop-blur-md border",
            "bg-gradient-to-b",
            characterColors[character.id]
          )}
        >
          {/* Nome com ícone */}
          <div className="flex items-center justify-center gap-2 mb-2">
            {benefits.icon}
            <h3 className="text-3xl font-bold text-white">
              {character.name}
            </h3>
          </div>
          
          {/* Descrição curta */}
          <p className="text-base text-white/70 text-center mb-4">
            {character.description}
          </p>
          
          {/* Lista de benefícios - só mostra quando ativo */}
          {isActive && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ delay: 0.2 }}
              className="space-y-2.5 pt-3 border-t border-white/10"
            >
              {benefits.benefits.map((benefit, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                  <span className="text-base text-white/90">{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </motion.button>
    );
  }

  // Variante Glass (Desktop)
  const benefits = characterBenefits[character.id];
  
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
      {/* Imagem - MAIOR */}
      <div className="relative w-full aspect-[3/4] mb-3">
        <img
          src={character.imagePath}
          alt={character.name}
          className="w-full h-full object-contain drop-shadow-lg scale-105"
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

      {/* Nome com ícone */}
      <div className="flex items-center gap-2 mb-1">
        {benefits.icon}
        <h3 className="text-lg font-semibold text-white">
          {character.name}
        </h3>
      </div>

      {/* Descrição */}
      <p className="text-sm text-white/60 text-center mb-3">
        {character.description}
      </p>

      {/* Benefícios */}
      <div className="w-full space-y-1.5">
        {benefits.benefits.map((benefit, idx) => (
          <div 
            key={idx}
            className="flex items-center gap-2 text-left"
          >
            <div className="w-1 h-1 rounded-full bg-green-400 flex-shrink-0" />
            <span className="text-xs text-white/70">{benefit}</span>
          </div>
        ))}
      </div>
    </motion.button>
  );
}

export default CharacterCard;
