import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Music, Play, Pause, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

const MEALS = [
  { key: 'cafe', label: 'Café', emoji: '☕', color: 'from-amber-400 to-orange-500' },
  { key: 'almoco', label: 'Almoço', emoji: '🍽️', color: 'from-emerald-400 to-teal-500' },
  { key: 'lanche', label: 'Lanche', emoji: '🍎', color: 'from-pink-400 to-rose-500' },
  { key: 'jantar', label: 'Jantar', emoji: '🌙', color: 'from-indigo-400 to-purple-500' },
  { key: 'ceia', label: 'Ceia', emoji: '🌟', color: 'from-slate-400 to-slate-600' },
];

export const MusicPlayerLayout: React.FC = () => {
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['cafe', 'almoco', 'jantar']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);

  const toggleMeal = (key: string) => {
    setSelectedMeals(prev => 
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  return (
    <div className="relative min-h-[550px] rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-slate-900 to-black" />
      
      <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 opacity-20">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            animate={isPlaying ? { 
              height: [20, Math.random() * 80 + 20, 20] 
            } : { height: 20 }}
            transition={{ 
              repeat: Infinity, 
              duration: 0.5 + Math.random() * 0.5,
              delay: i * 0.02
            }}
            className="w-1.5 bg-emerald-500 rounded-full"
          />
        ))}
      </div>

      <div className="relative p-6 space-y-6">
        <div className="flex justify-center">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="relative w-48 h-48"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-slate-700 to-slate-800">
                <div className="absolute inset-0 rounded-full" style={{
                  background: 'repeating-radial-gradient(circle at center, transparent 0px, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                }} />
              </div>
              <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <span className="text-3xl">🥗</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center">
          <h2 className="text-white text-xl font-bold">Cardápio Semanal</h2>
          <p className="text-emerald-400 text-sm">Sofia Nutricional • 7 dias</p>
        </div>

        <div className="space-y-2">
          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${progress}%` }}
              className="h-full bg-emerald-500 rounded-full"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>Dia {Math.ceil(progress / 14.3)}</span>
            <span>7 dias</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <SkipForward className="w-6 h-6 rotate-180" />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-7 h-7 text-black" />
            ) : (
              <Play className="w-7 h-7 text-black ml-1" />
            )}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <SkipForward className="w-6 h-6" />
          </motion.button>
        </div>

        <div className="space-y-2">
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Playlist do Dia</h3>
          <div className="space-y-1">
            {MEALS.map((meal, idx) => {
              const isSelected = selectedMeals.includes(meal.key);
              return (
                <motion.button
                  key={meal.key}
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                  onClick={() => toggleMeal(meal.key)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                    isSelected && "bg-white/5"
                  )}
                >
                  <span className="text-2xl">{meal.emoji}</span>
                  <div className="flex-1 text-left">
                    <p className={cn(
                      "font-medium",
                      isSelected ? "text-emerald-400" : "text-white"
                    )}>{meal.label}</p>
                    <p className="text-xs text-slate-500">~{300 + idx * 150} kcal</p>
                  </div>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex gap-0.5"
                    >
                      {[1,2,3].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: [8, 16, 8] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-1 bg-emerald-500 rounded-full"
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg transition-colors"
        >
          <Music className="w-5 h-5 inline mr-2" />
          Criar Playlist Nutricional
        </motion.button>
      </div>
    </div>
  );
};
