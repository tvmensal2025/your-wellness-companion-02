import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Leaf, Sun, Moon, Cloud, Droplets, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const MEALS = [
  { key: 'cafe', label: 'Café', emoji: '☕', color: 'from-amber-400 to-orange-500' },
  { key: 'almoco', label: 'Almoço', emoji: '🍽️', color: 'from-emerald-400 to-teal-500' },
  { key: 'lanche', label: 'Lanche', emoji: '🍎', color: 'from-pink-400 to-rose-500' },
  { key: 'jantar', label: 'Jantar', emoji: '🌙', color: 'from-indigo-400 to-purple-500' },
  { key: 'ceia', label: 'Ceia', emoji: '🌟', color: 'from-slate-400 to-slate-600' },
];

export const ZenNatureLayout: React.FC = () => {
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['cafe', 'almoco', 'jantar']);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'night'>('morning');
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleMeal = (key: string) => {
    setSelectedMeals(prev => 
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  const timeColors = {
    morning: 'from-amber-200 via-orange-300 to-rose-300',
    afternoon: 'from-cyan-300 via-blue-400 to-indigo-400',
    night: 'from-indigo-900 via-purple-900 to-slate-900'
  };

  return (
    <div className="relative min-h-[550px] rounded-3xl overflow-hidden">
      <motion.div 
        animate={{ opacity: 1 }}
        className={cn("absolute inset-0 bg-gradient-to-b transition-all duration-1000", timeColors[timeOfDay])}
      />
      
      <motion.div
        animate={{ 
          y: timeOfDay === 'night' ? 200 : 0,
          opacity: timeOfDay === 'night' ? 0 : 1
        }}
        className="absolute top-8 right-8"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 shadow-lg shadow-orange-400/50" />
      </motion.div>
      
      {timeOfDay === 'night' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-8 right-8"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg shadow-slate-300/30" />
        </motion.div>
      )}

      {timeOfDay === 'night' && (
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2 + Math.random() * 2 }}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 40}%` }}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 400 150" className="w-full">
          <path d="M0 150 L80 60 L160 120 L240 40 L320 100 L400 50 L400 150 Z" 
            fill={timeOfDay === 'night' ? '#1e293b' : '#166534'} />
          <path d="M0 150 L100 80 L200 130 L300 70 L400 110 L400 150 Z" 
            fill={timeOfDay === 'night' ? '#0f172a' : '#15803d'} />
        </svg>
      </div>

      {timeOfDay !== 'night' && (
        <>
          <motion.div
            animate={{ x: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 10 }}
            className="absolute top-16 left-10"
          >
            <Cloud className="w-12 h-12 text-white/60" />
          </motion.div>
          <motion.div
            animate={{ x: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 8 }}
            className="absolute top-24 right-20"
          >
            <Cloud className="w-8 h-8 text-white/40" />
          </motion.div>
        </>
      )}

      <div className="relative p-6 space-y-6 z-10">
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-block mb-2"
          >
            <Leaf className={cn(
              "w-10 h-10",
              timeOfDay === 'night' ? 'text-emerald-400' : 'text-emerald-700'
            )} />
          </motion.div>
          <h2 className={cn(
            "text-2xl font-light",
            timeOfDay === 'night' ? 'text-white' : 'text-slate-800'
          )}>
            Nutrição Natural
          </h2>
          <p className={cn(
            "text-sm",
            timeOfDay === 'night' ? 'text-slate-300' : 'text-slate-600'
          )}>
            Em harmonia com seu corpo
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {[
            { key: 'morning', icon: Sun, label: 'Manhã' },
            { key: 'afternoon', icon: Cloud, label: 'Tarde' },
            { key: 'night', icon: Moon, label: 'Noite' },
          ].map((time) => (
            <motion.button
              key={time.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeOfDay(time.key as any)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-3 rounded-2xl transition-all",
                timeOfDay === time.key
                  ? "bg-white/90 shadow-lg"
                  : "bg-white/30 backdrop-blur"
              )}
            >
              <time.icon className={cn(
                "w-5 h-5",
                timeOfDay === time.key ? "text-emerald-600" : "text-slate-600"
              )} />
              <span className={cn(
                "text-xs font-medium",
                timeOfDay === time.key ? "text-emerald-600" : "text-slate-600"
              )}>{time.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          {MEALS.map((meal) => {
            const isSelected = selectedMeals.includes(meal.key);
            return (
              <motion.button
                key={meal.key}
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleMeal(meal.key)}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={isSelected ? { height: 40 } : { height: 20 }}
                  className="w-1 bg-emerald-600 rounded-full origin-bottom"
                />
                <motion.div
                  animate={isSelected ? { scale: 1.2, rotate: [0, 5, -5, 0] } : { scale: 1 }}
                  transition={{ rotate: { repeat: Infinity, duration: 2 } }}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center -mt-2 transition-all",
                    isSelected 
                      ? "bg-white shadow-lg" 
                      : "bg-white/50"
                  )}
                >
                  <span className="text-2xl">{meal.emoji}</span>
                </motion.div>
                <span className={cn(
                  "text-xs mt-2 font-medium",
                  timeOfDay === 'night' ? 'text-white' : 'text-slate-700'
                )}>{meal.label}</span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-center items-end gap-3">
          {[1, 3, 7].map((days) => (
            <motion.button
              key={days}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: days * 0.2 }}
              >
                <Droplets className={cn(
                  "w-8 h-8",
                  timeOfDay === 'night' ? 'text-cyan-400' : 'text-cyan-600'
                )} />
              </motion.div>
              <span className={cn(
                "text-sm font-bold mt-1",
                timeOfDay === 'night' ? 'text-white' : 'text-slate-700'
              )}>{days}</span>
              <span className={cn(
                "text-[10px]",
                timeOfDay === 'night' ? 'text-slate-300' : 'text-slate-500'
              )}>{days === 1 ? 'dia' : 'dias'}</span>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsGenerating(true)}
          className={cn(
            "w-full py-4 rounded-2xl font-medium text-lg transition-all",
            "bg-white/90 backdrop-blur shadow-lg",
            timeOfDay === 'night' ? 'text-indigo-900' : 'text-emerald-800'
          )}
        >
          <Leaf className="w-5 h-5 inline mr-2" />
          Cultivar Cardápio
          <Sparkles className="w-4 h-4 inline ml-2" />
        </motion.button>
      </div>
    </div>
  );
};
