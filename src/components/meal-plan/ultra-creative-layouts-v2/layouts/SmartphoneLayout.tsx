import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Signal, Wifi, Battery } from 'lucide-react';
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
];

export const SmartphoneLayout: React.FC = () => {
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['cafe', 'almoco', 'jantar']);
  const [batteryLevel] = useState(85);
  const [time] = useState(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

  const toggleMeal = (key: string) => {
    setSelectedMeals(prev => 
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  const totalCalories = selectedMeals.length * 450;

  return (
    <div className="relative min-h-[550px] rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800" />

      <div className="relative p-4 space-y-3">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm font-semibold">{time}</span>
          <div className="flex items-center gap-2">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <div className="flex items-center gap-1">
              <Battery className="w-5 h-5" />
              <span className="text-xs">{batteryLevel}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-lg">🥗</span>
              </div>
              <span className="font-semibold">Nutrição</span>
            </div>
            <span className="text-xs text-muted-foreground">Hoje</span>
          </div>

          <div className="flex justify-center mb-4">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-slate-200 dark:text-slate-700"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 352' }}
                  animate={{ strokeDasharray: `${(totalCalories / 2000) * 352} 352` }}
                  transition={{ duration: 1 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#14b8a6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{totalCalories}</span>
                <span className="text-xs text-muted-foreground">/ 2000 kcal</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {[
              { label: 'Prot', value: selectedMeals.length * 25, color: 'bg-orange-100 text-orange-700' },
              { label: 'Carb', value: selectedMeals.length * 50, color: 'bg-blue-100 text-blue-700' },
              { label: 'Gord', value: selectedMeals.length * 15, color: 'bg-yellow-100 text-yellow-700' },
            ].map((macro) => (
              <div key={macro.label} className={cn("px-3 py-1 rounded-full text-xs font-medium", macro.color)}>
                {macro.label}: {macro.value}g
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-lg">
          <h3 className="font-semibold mb-3">Refeições</h3>
          <div className="grid grid-cols-5 gap-2">
            {MEALS.map((meal) => {
              const isSelected = selectedMeals.includes(meal.key);
              return (
                <motion.button
                  key={meal.key}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleMeal(meal.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-2xl transition-all",
                    isSelected 
                      ? "bg-emerald-100 dark:bg-emerald-900/30" 
                      : "bg-slate-100 dark:bg-slate-700/50"
                  )}
                >
                  <span className="text-2xl">{meal.emoji}</span>
                  <span className={cn(
                    "text-[10px] font-medium",
                    isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                  )}>{meal.label}</span>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-emerald-500"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 shadow-lg">
          <h3 className="font-semibold mb-3">Duração do Plano</h3>
          <div className="flex gap-2">
            {[1, 3, 7].map((days) => (
              <motion.button
                key={days}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <span className="block text-lg font-bold">{days}</span>
                <span className="text-xs text-muted-foreground">{days === 1 ? 'dia' : 'dias'}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-colors"
        >
          Gerar Cardápio
        </motion.button>

        <div className="space-y-2">
          <h3 className="text-xs text-muted-foreground font-semibold px-2">RECENTES</h3>
          {MOCK_HISTORY.map((item) => (
            <div 
              key={item.id}
              className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <span className="text-lg">{item.emojis[0]}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Cardápio {item.type === 'weekly' ? 'Semanal' : 'Diário'}</p>
                <p className="text-xs text-muted-foreground">{item.calories} kcal • {item.date}</p>
              </div>
              <span className="text-xs text-muted-foreground">→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
