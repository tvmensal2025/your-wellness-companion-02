import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Star, Map, Mountain } from 'lucide-react';
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

export const AdventureMapLayout: React.FC = () => {
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['cafe', 'almoco', 'jantar']);
  const [currentLocation, setCurrentLocation] = useState(0);
  const [isExploring, setIsExploring] = useState(false);

  const toggleMeal = (key: string) => {
    setSelectedMeals(prev => 
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  const locations = [
    { name: 'Floresta do Café', emoji: '🌲', meal: 'cafe' },
    { name: 'Vale do Almoço', emoji: '🏔️', meal: 'almoco' },
    { name: 'Oásis do Lanche', emoji: '🏝️', meal: 'lanche' },
    { name: 'Castelo do Jantar', emoji: '🏰', meal: 'jantar' },
    { name: 'Templo da Ceia', emoji: '⛩️', meal: 'ceia' },
  ];

  return (
    <div className="relative min-h-[550px] rounded-3xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none' stroke='%23d97706' stroke-width='0.5' stroke-dasharray='5,5'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }} />

      <div className="relative p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center shadow-lg"
            >
              <Compass className="w-7 h-7 text-amber-100" />
            </motion.div>
            <div>
              <h2 className="text-amber-900 font-bold text-lg">Mapa Nutricional</h2>
              <p className="text-amber-700 text-xs">Explore territórios saudáveis</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-200/50 rounded-full">
            <Star className="w-4 h-4 text-amber-600" />
            <span className="text-amber-800 font-bold text-sm">{selectedMeals.length * 100} XP</span>
          </div>
        </div>

        <div className="relative bg-amber-50/50 rounded-2xl p-4 border-2 border-amber-300/50">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 200">
            <path 
              d="M30 170 Q80 140 100 100 T180 80 T250 50 T280 30" 
              fill="none" 
              stroke="#d97706" 
              strokeWidth="3" 
              strokeDasharray="8,8"
              opacity="0.5"
            />
          </svg>

          <div className="relative h-48">
            {locations.map((loc, idx) => {
              const isSelected = selectedMeals.includes(loc.meal);
              const positions = [
                { left: '5%', top: '70%' },
                { left: '25%', top: '40%' },
                { left: '50%', top: '50%' },
                { left: '70%', top: '25%' },
                { left: '85%', top: '10%' },
              ];
              
              return (
                <motion.button
                  key={loc.meal}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    toggleMeal(loc.meal);
                    setCurrentLocation(idx);
                  }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={positions[idx]}
                >
                  <motion.div
                    animate={isSelected ? { y: [0, -5, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="relative flex flex-col items-center"
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all",
                      isSelected 
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 ring-4 ring-amber-300" 
                        : "bg-white/80"
                    )}>
                      <span className="text-2xl">{loc.emoji}</span>
                    </div>
                    
                    <span className={cn(
                      "text-[10px] font-bold mt-1 whitespace-nowrap px-2 py-0.5 rounded-full",
                      isSelected 
                        ? "bg-amber-600 text-white" 
                        : "bg-white/80 text-amber-800"
                    )}>
                      {loc.name.split(' ')[0]}
                    </span>
                    
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2"
                      >
                        <span className="text-lg">🚩</span>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.button>
              );
            })}

            <motion.div
              animate={{ 
                x: isExploring ? [0, 20, -10, 30, 0] : 0,
                y: isExploring ? [0, -10, 5, -15, 0] : 0
              }}
              transition={{ duration: 2, repeat: isExploring ? Infinity : 0 }}
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <span className="text-3xl">🧭</span>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { days: 1, label: 'Expedição', icon: '🥾' },
            { days: 3, label: 'Aventura', icon: '⛺' },
            { days: 7, label: 'Épica', icon: '🏕️' },
          ].map((journey) => (
            <motion.button
              key={journey.days}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1 p-3 bg-white/80 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-colors"
            >
              <span className="text-2xl">{journey.icon}</span>
              <span className="text-amber-900 font-bold text-sm">{journey.days} {journey.days === 1 ? 'dia' : 'dias'}</span>
              <span className="text-amber-600 text-[10px]">{journey.label}</span>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsExploring(!isExploring)}
          className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold rounded-2xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2"
        >
          <Map className="w-5 h-5" />
          {isExploring ? 'Explorando...' : 'Iniciar Expedição'}
          <Mountain className="w-5 h-5" />
        </motion.button>

        <div>
          <h3 className="text-amber-800 text-sm font-semibold mb-2 flex items-center gap-2">
            <span>💎</span> Tesouros Encontrados
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {MOCK_HISTORY.map((item) => (
              <div 
                key={item.id}
                className="flex-shrink-0 w-20 p-2 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl border border-amber-300"
              >
                <div className="text-center">
                  <span className="text-2xl">📜</span>
                  <p className="text-amber-900 text-xs font-bold mt-1">{item.calories}</p>
                  <p className="text-amber-600 text-[10px]">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
