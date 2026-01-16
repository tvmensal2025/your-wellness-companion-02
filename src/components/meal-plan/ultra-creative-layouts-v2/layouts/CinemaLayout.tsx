import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Film, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const MEALS = [
  { key: 'cafe', label: 'Café', emoji: '☕', color: 'from-amber-400 to-orange-500' },
  { key: 'almoco', label: 'Almoço', emoji: '🍽️', color: 'from-emerald-400 to-teal-500' },
  { key: 'lanche', label: 'Lanche', emoji: '🍎', color: 'from-pink-400 to-rose-500' },
  { key: 'jantar', label: 'Jantar', emoji: '🌙', color: 'from-indigo-400 to-purple-500' },
  { key: 'ceia', label: 'Ceia', emoji: '🌟', color: 'from-slate-400 to-slate-600' },
];

const MOCK_HISTORY = [
  { id: '1', date: 'Hoje', calories: 2150, type: 'weekly', emojis: ['☕', '🍽️', '🍎', '🌙'] },
  { id: '2', date: 'Ontem', calories: 1850, type: 'daily', emojis: ['☕', '🍽️', '🌙'] },
  { id: '3', date: '2 dias', calories: 9800, type: 'weekly', emojis: ['☕', '🍽️', '🍎', '🌙', '🌟'] },
];

export const CinemaLayout: React.FC = () => {
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['cafe', 'almoco', 'jantar']);
  const [hoveredMeal, setHoveredMeal] = useState<string | null>(null);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);

  const toggleMeal = (key: string) => {
    setSelectedMeals(prev => 
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  return (
    <div className="relative min-h-[550px] rounded-3xl overflow-hidden bg-black">
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-black" />
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 10 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-8xl opacity-30">🍽️</span>
        </motion.div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded">TOP 10</span>
            <span className="text-slate-400 text-xs">Nº 1 em Nutrição Hoje</span>
          </div>
          <h2 className="text-white text-2xl font-bold">Cardápio: A Saga</h2>
          <p className="text-slate-300 text-sm">2024 • 7 episódios • Saúde</p>
        </div>
      </div>

      <div className="relative p-4 space-y-4">
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsTrailerPlaying(!isTrailerPlaying)}
            className="flex-1 py-3 bg-white text-black font-bold rounded-md flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" fill="black" />
            {isTrailerPlaying ? 'Pausar' : 'Assistir'}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 bg-slate-700/80 text-white font-bold rounded-md"
          >
            + Minha Lista
          </motion.button>
        </div>

        <p className="text-slate-400 text-sm">
          Uma jornada épica através de refeições balanceadas. Selecione os episódios que deseja incluir na sua temporada.
        </p>

        <div className="space-y-2">
          <h3 className="text-white font-semibold">Episódios</h3>
          <div className="space-y-2">
            {MEALS.map((meal, idx) => {
              const isSelected = selectedMeals.includes(meal.key);
              const isHovered = hoveredMeal === meal.key;
              
              return (
                <motion.button
                  key={meal.key}
                  onHoverStart={() => setHoveredMeal(meal.key)}
                  onHoverEnd={() => setHoveredMeal(null)}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => toggleMeal(meal.key)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                    isSelected ? "bg-slate-800" : "bg-slate-900/50",
                    isHovered && "ring-1 ring-slate-600"
                  )}
                >
                  <div className={cn(
                    "w-28 h-16 rounded-md flex items-center justify-center relative overflow-hidden",
                    `bg-gradient-to-br ${meal.color}`
                  )}>
                    <span className="text-3xl">{meal.emoji}</span>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center"
                      >
                        <Play className="w-8 h-8 text-white" fill="white" />
                      </motion.div>
                    )}
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] rounded">
                      {20 + idx * 5}min
                    </span>
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-sm">{idx + 1}.</span>
                      <span className={cn(
                        "font-medium",
                        isSelected ? "text-white" : "text-slate-300"
                      )}>{meal.label}</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">
                      {300 + idx * 150} kcal • Proteína, Carboidratos
                    </p>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center"
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-sm">Temporada:</span>
          <div className="flex gap-1">
            {[
              { days: 1, label: 'Piloto' },
              { days: 3, label: 'Mini-série' },
              { days: 7, label: 'Completa' },
            ].map((season) => (
              <button
                key={season.days}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded transition-colors"
              >
                {season.label}
              </button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          <Film className="w-5 h-5" />
          Produzir Temporada
        </motion.button>

        <div>
          <h3 className="text-slate-400 text-xs font-semibold mb-2">MAIS COMO ESTE</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {MOCK_HISTORY.map((item) => (
              <div 
                key={item.id}
                className="flex-shrink-0 w-24 aspect-[2/3] bg-gradient-to-br from-slate-800 to-slate-900 rounded-md overflow-hidden"
              >
                <div className="h-full flex flex-col items-center justify-center p-2">
                  <div className="flex gap-0.5 mb-2">
                    {item.emojis.slice(0, 2).map((e, i) => (
                      <span key={i} className="text-lg">{e}</span>
                    ))}
                  </div>
                  <span className="text-white text-xs font-bold">{item.calories}</span>
                  <span className="text-slate-500 text-[10px]">{item.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
