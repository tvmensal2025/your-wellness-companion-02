import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Gem, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const MEALS = [
  { key: 'cafe', label: 'Café', emoji: '☕', color: 'from-amber-400 to-orange-500' },
  { key: 'almoco', label: 'Almoço', emoji: '🍽️', color: 'from-emerald-400 to-teal-500' },
  { key: 'lanche', label: 'Lanche', emoji: '🍎', color: 'from-pink-400 to-rose-500' },
  { key: 'jantar', label: 'Jantar', emoji: '🌙', color: 'from-indigo-400 to-purple-500' },
  { key: 'ceia', label: 'Ceia', emoji: '🌟', color: 'from-slate-400 to-slate-600' },
];

const MOCK_HISTORY = [
  { id: '1', date: 'Hoje', calories: 2150 },
  { id: '2', date: 'Ontem', calories: 1850 },
  { id: '3', date: '2 dias', calories: 9800 },
];

export const LuxuryLayout: React.FC = () => {
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['cafe', 'almoco', 'jantar']);
  const [selectedTier, setSelectedTier] = useState<'gold' | 'platinum' | 'diamond'>('platinum');

  const toggleMeal = (key: string) => {
    setSelectedMeals(prev => 
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  const tiers = {
    gold: { days: 1, color: 'from-amber-400 to-yellow-500', label: 'Gold', icon: '🥇' },
    platinum: { days: 3, color: 'from-slate-300 to-slate-400', label: 'Platinum', icon: '🥈' },
    diamond: { days: 7, color: 'from-cyan-300 to-blue-400', label: 'Diamond', icon: '💎' },
  };

  return (
    <div className="relative min-h-[550px] rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
      
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 2
          }}
          className="absolute w-1 h-1 bg-amber-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      <div className="relative p-6 space-y-6">
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="inline-block mb-2"
          >
            <Crown className="w-10 h-10 text-amber-400" />
          </motion.div>
          <h2 className="text-2xl font-light text-white tracking-wider">
            CARDÁPIO <span className="font-bold text-amber-400">PREMIUM</span>
          </h2>
          <p className="text-slate-400 text-sm tracking-widest">EXPERIÊNCIA EXCLUSIVA</p>
        </div>

        <div className="flex justify-center gap-3">
          {Object.entries(tiers).map(([key, tier]) => (
            <motion.button
              key={key}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedTier(key as any)}
              className={cn(
                "relative px-6 py-4 rounded-2xl transition-all",
                selectedTier === key
                  ? `bg-gradient-to-br ${tier.color} shadow-lg`
                  : "bg-slate-800/50 border border-slate-700"
              )}
            >
              <span className="text-2xl block mb-1">{tier.icon}</span>
              <span className={cn(
                "text-xs font-bold tracking-wider",
                selectedTier === key ? "text-black" : "text-slate-400"
              )}>{tier.label}</span>
              <span className={cn(
                "block text-[10px]",
                selectedTier === key ? "text-black/70" : "text-slate-500"
              )}>{tier.days} {tier.days === 1 ? 'dia' : 'dias'}</span>
              
              {selectedTier === key && (
                <motion.div
                  layoutId="tier-indicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-amber-400 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>

        <div className="space-y-2">
          <h3 className="text-amber-400/60 text-xs font-semibold tracking-widest text-center">
            SELECIONE SEU MENU
          </h3>
          <div className="space-y-2">
            {MEALS.map((meal, idx) => {
              const isSelected = selectedMeals.includes(meal.key);
              return (
                <motion.button
                  key={meal.key}
                  whileHover={{ x: 5 }}
                  onClick={() => toggleMeal(meal.key)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl transition-all",
                    isSelected 
                      ? "bg-gradient-to-r from-amber-500/20 to-transparent border border-amber-500/30" 
                      : "bg-slate-800/30 border border-slate-700/30"
                  )}
                >
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-light",
                    isSelected 
                      ? "bg-amber-500 text-black" 
                      : "bg-slate-700 text-slate-400"
                  )}>
                    {idx + 1}
                  </span>
                  
                  <span className="text-3xl">{meal.emoji}</span>
                  
                  <div className="flex-1 text-left">
                    <p className={cn(
                      "font-medium tracking-wide",
                      isSelected ? "text-amber-400" : "text-white"
                    )}>{meal.label}</p>
                    <p className="text-slate-500 text-xs">Curadoria especial</p>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Gem className="w-5 h-5 text-amber-400" />
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
          className="w-full py-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black font-bold text-lg rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-3"
        >
          <Crown className="w-5 h-5" />
          Criar Experiência {tiers[selectedTier].label}
          <Sparkles className="w-5 h-5" />
        </motion.button>

        <div>
          <h3 className="text-amber-400/60 text-xs font-semibold tracking-widest text-center mb-3">
            SUA COLEÇÃO EXCLUSIVA
          </h3>
          <div className="flex justify-center gap-3">
            {MOCK_HISTORY.map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ y: -5, rotate: 2 }}
                className="w-20 p-3 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-amber-500/20"
              >
                <div className="text-center">
                  <Trophy className="w-6 h-6 text-amber-400 mx-auto mb-1" />
                  <p className="text-white text-xs font-bold">{item.calories}</p>
                  <p className="text-amber-400/60 text-[10px]">{item.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
