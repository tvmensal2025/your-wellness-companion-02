import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Lightbulb, Heart, Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const sofiaTips = [
  {
    id: 1,
    category: 'Nutrição',
    icon: Heart,
    tip: 'Beba um copo de água antes das refeições para melhorar a digestão e controlar o apetite.',
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-500/10',
    textColor: 'text-rose-500'
  },
  {
    id: 2,
    category: 'Sono',
    icon: Brain,
    tip: 'Evite telas pelo menos 1 hora antes de dormir para melhorar a qualidade do sono.',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-500'
  },
  {
    id: 3,
    category: 'Exercício',
    icon: Sparkles,
    tip: 'Pequenas caminhadas após as refeições ajudam na digestão e no controle glicêmico.',
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-500'
  },
  {
    id: 4,
    category: 'Bem-estar',
    icon: Lightbulb,
    tip: 'Respire fundo 3 vezes antes de começar uma tarefa importante para aumentar o foco.',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-500'
  },
  {
    id: 5,
    category: 'Hidratação',
    icon: Heart,
    tip: 'Mantenha uma garrafa de água sempre visível - você beberá mais naturalmente.',
    color: 'from-cyan-500 to-blue-600',
    bgColor: 'bg-cyan-500/10',
    textColor: 'text-cyan-500'
  }
];

export const SofiaTipCard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTip, setCurrentTip] = useState(sofiaTips[0]);
  
  useEffect(() => {
    // Random tip on mount
    const randomIndex = Math.floor(Math.random() * sofiaTips.length);
    setCurrentTip(sofiaTips[randomIndex]);
    
    // Rotate tips every 30 seconds
    const interval = setInterval(() => {
      setCurrentTip(prev => {
        const currentIndex = sofiaTips.findIndex(t => t.id === prev.id);
        return sofiaTips[(currentIndex + 1) % sofiaTips.length];
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const TipIcon = currentTip.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 shadow-2xl h-full flex flex-col"
    >
      {/* Subtle gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-tr ${currentTip.color} opacity-5`} />
      
      {/* Animated glow */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br ${currentTip.color} blur-3xl`}
      />

      <div className="relative flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${currentTip.color} shadow-lg`}
          >
            <Sparkles className="h-5 w-5 text-white" />
          </motion.div>
          <div>
            <h3 className="text-sm font-semibold text-white">Sofia diz...</h3>
            <p className="text-[10px] text-slate-400">Sua assistente de saúde</p>
          </div>
        </div>

        {/* Tip Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTip.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Category badge */}
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${currentTip.bgColor} w-fit mb-3`}>
              <TipIcon className={`h-3 w-3 ${currentTip.textColor}`} />
              <span className={`text-[10px] font-medium ${currentTip.textColor}`}>
                {currentTip.category}
              </span>
            </div>

            {/* Tip text */}
            <p className="text-sm text-slate-300 leading-relaxed flex-1">
              {currentTip.tip}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Action button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/chat-sofia')}
          className={`mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r ${currentTip.color} text-white text-sm font-medium shadow-lg`}
        >
          <span>Conversar com Sofia</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        {/* Tip indicators */}
        <div className="flex justify-center gap-1.5 mt-3">
          {sofiaTips.map((tip, index) => (
            <button
              key={tip.id}
              onClick={() => setCurrentTip(tip)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                currentTip.id === tip.id 
                  ? `bg-gradient-to-r ${tip.color} w-4` 
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
