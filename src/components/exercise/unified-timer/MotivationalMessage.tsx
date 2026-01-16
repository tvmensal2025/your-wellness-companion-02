import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export interface MotivationalMessageProps {
  isFeminine?: boolean;
}

interface Message {
  emoji: string;
  text: string;
}

// Mensagens motivacionais para o timer (neutras por padrão)
const getMotivationalMessages = (isFeminine?: boolean): Message[] => [
  { emoji: "💪", text: "Você está arrasando!" },
  { emoji: "🔥", text: "Cada série conta!" },
  { emoji: "⚡", text: "Força! Próxima série vem aí!" },
  { emoji: "🎯", text: "Foco no objetivo!" },
  { emoji: "💚", text: "Seu corpo agradece!" },
  { emoji: "🏆", text: isFeminine ? "Campeã em construção!" : "Campeão em construção!" },
  { emoji: "✨", text: "Mais forte a cada dia!" },
  { emoji: "🚀", text: "Não pare agora!" },
  { emoji: "🌟", text: "Você consegue!" },
  { emoji: "💥", text: "Energia total!" },
];

export const MotivationalMessage: React.FC<MotivationalMessageProps> = ({
  isFeminine,
}) => {
  // Mensagem motivacional aleatória (memoizada)
  const currentMessage = useMemo(() => {
    const messages = getMotivationalMessages(isFeminine);
    return messages[Math.floor(Math.random() * messages.length)];
  }, [isFeminine]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-3 py-2 px-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800"
    >
      <span className="text-lg mr-2">{currentMessage.emoji}</span>
      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
        {currentMessage.text}
      </span>
    </motion.div>
  );
};

// Export para uso externo se necessário
export { getMotivationalMessages };
