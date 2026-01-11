import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music, Waves, Leaf, Sun, Moon, Cloud, Droplets,
  Palette, Brush, Sparkles, Heart, Star, Zap,
  Film, Camera, Play, Pause, SkipForward,
  Map, Compass, Mountain, TreePine, Tent,
  Smartphone, Wifi, Battery, Signal,
  Crown, Gem, Trophy, Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ============================================
// DADOS MOCK
// ============================================
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

// ============================================
// LAYOUT 6: SPOTIFY / MUSIC PLAYER 🎵
// ============================================
export const MusicPlayerLayout: React.FC = () => {
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['cafe', 'almoco', 'jantar']);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(35);
  const [currentTrack, setCurrentTrack] = useState(0);

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
      {/* Fundo gradiente Spotify */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-slate-900 to-black" />
      
      {/* Ondas sonoras animadas */}
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
        {/* Album Art */}
        <div className="flex justify-center">
          <motion.div
            animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="relative w-48 h-48"
          >
            {/* Disco de vinil */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-slate-700 to-slate-800">
                <div className="absolute inset-0 rounded-full" style={{
                  background: 'repeating-radial-gradient(circle at center, transparent 0px, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
                }} />
              </div>
              {/* Centro do disco */}
              <div className="absolute inset-[35%] rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <span className="text-3xl">🥗</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Info da "música" */}
        <div className="text-center">
          <h2 className="text-white text-xl font-bold">Cardápio Semanal</h2>
          <p className="text-emerald-400 text-sm">Sofia Nutricional • 7 dias</p>
        </div>

        {/* Barra de progresso */}
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

        {/* Controles de player */}
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

        {/* Playlist (Refeições) */}
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

        {/* Botão Gerar */}
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

// ============================================
// LAYOUT 7: NATUREZA / ZEN 🌿
// ============================================
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
      {/* Céu gradiente */}
      <motion.div 
        animate={{ opacity: 1 }}
        className={cn("absolute inset-0 bg-gradient-to-b transition-all duration-1000", timeColors[timeOfDay])}
      />
      
      {/* Sol/Lua */}
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

      {/* Estrelas (noite) */}
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

      {/* Montanhas */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 400 150" className="w-full">
          <path d="M0 150 L80 60 L160 120 L240 40 L320 100 L400 50 L400 150 Z" 
            fill={timeOfDay === 'night' ? '#1e293b' : '#166534'} />
          <path d="M0 150 L100 80 L200 130 L300 70 L400 110 L400 150 Z" 
            fill={timeOfDay === 'night' ? '#0f172a' : '#15803d'} />
        </svg>
      </div>

      {/* Nuvens */}
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
        {/* Header Zen */}
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

        {/* Seletor de Período */}
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

        {/* Refeições como Flores/Plantas */}
        <div className="flex justify-center gap-4">
          {MEALS.map((meal, idx) => {
            const isSelected = selectedMeals.includes(meal.key);
            return (
              <motion.button
                key={meal.key}
                whileHover={{ y: -10 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleMeal(meal.key)}
                className="flex flex-col items-center"
              >
                {/* Caule */}
                <motion.div
                  animate={isSelected ? { height: 40 } : { height: 20 }}
                  className="w-1 bg-emerald-600 rounded-full origin-bottom"
                />
                {/* Flor/Fruto */}
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

        {/* Dias como Gotas de Água */}
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

        {/* Botão Gerar */}
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


// ============================================
// LAYOUT 8: CINEMA / NETFLIX 🎬
// ============================================
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
      {/* Fundo estilo Netflix */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      
      {/* Banner Principal */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900 via-red-800 to-black" />
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 10 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="text-8xl opacity-30">🍽️</span>
        </motion.div>
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        
        {/* Info do "filme" */}
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
        {/* Botões de ação */}
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

        {/* Sinopse */}
        <p className="text-slate-400 text-sm">
          Uma jornada épica através de refeições balanceadas. Selecione os episódios que deseja incluir na sua temporada.
        </p>

        {/* Episódios (Refeições) */}
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
                  {/* Thumbnail */}
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
                    {/* Duração */}
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/80 text-white text-[10px] rounded">
                      {20 + idx * 5}min
                    </span>
                  </div>
                  
                  {/* Info */}
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
                  
                  {/* Check */}
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

        {/* Seletor de Temporada (Dias) */}
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

        {/* Botão Gerar */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md flex items-center justify-center gap-2 transition-colors"
        >
          <Film className="w-5 h-5" />
          Produzir Temporada
        </motion.button>

        {/* Mais como este */}
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


// ============================================
// LAYOUT 9: MAPA DE AVENTURA 🗺️
// ============================================
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
      {/* Fundo de mapa antigo */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50 to-orange-100" />
      <div className="absolute inset-0 opacity-30" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none' stroke='%23d97706' stroke-width='0.5' stroke-dasharray='5,5'/%3E%3C/svg%3E")`,
        backgroundSize: '100px 100px'
      }} />

      <div className="relative p-6 space-y-4">
        {/* Header com Bússola */}
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

        {/* Mapa com Caminho */}
        <div className="relative bg-amber-50/50 rounded-2xl p-4 border-2 border-amber-300/50">
          {/* Caminho pontilhado */}
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

          {/* Locais no mapa */}
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
                    className={cn(
                      "relative flex flex-col items-center",
                    )}
                  >
                    {/* Marcador */}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all",
                      isSelected 
                        ? "bg-gradient-to-br from-amber-500 to-orange-600 ring-4 ring-amber-300" 
                        : "bg-white/80"
                    )}>
                      <span className="text-2xl">{loc.emoji}</span>
                    </div>
                    
                    {/* Nome */}
                    <span className={cn(
                      "text-[10px] font-bold mt-1 whitespace-nowrap px-2 py-0.5 rounded-full",
                      isSelected 
                        ? "bg-amber-600 text-white" 
                        : "bg-white/80 text-amber-800"
                    )}>
                      {loc.name.split(' ')[0]}
                    </span>
                    
                    {/* Bandeira se selecionado */}
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

            {/* Personagem explorador */}
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

        {/* Seletor de Jornada (Dias) */}
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

        {/* Botão Explorar */}
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

        {/* Tesouros Encontrados (Histórico) */}
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


// ============================================
// LAYOUT 10: SMARTPHONE / iOS WIDGET 📱
// ============================================
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
      {/* Fundo iOS */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800" />

      <div className="relative p-4 space-y-3">
        {/* Status Bar iOS */}
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

        {/* Widget Principal */}
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

          {/* Círculo de Progresso */}
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

          {/* Macros em Pills */}
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

        {/* Widget de Refeições */}
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

        {/* Widget de Dias */}
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

        {/* Botão Gerar (estilo iOS) */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-2xl transition-colors"
        >
          Gerar Cardápio
        </motion.button>

        {/* Histórico como Notificações */}
        <div className="space-y-2">
          <h3 className="text-xs text-muted-foreground font-semibold px-2">RECENTES</h3>
          {MOCK_HISTORY.slice(0, 2).map((item) => (
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


// ============================================
// LAYOUT 11: LUXO / PREMIUM 💎
// ============================================
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
      {/* Fundo luxuoso */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-black" />
      
      {/* Padrão dourado */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fbbf24' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }} />

      {/* Brilhos */}
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
        {/* Header Premium */}
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

        {/* Seletor de Tier */}
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

        {/* Menu de Refeições Luxuoso */}
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
                  {/* Número elegante */}
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-light",
                    isSelected 
                      ? "bg-amber-500 text-black" 
                      : "bg-slate-700 text-slate-400"
                  )}>
                    {idx + 1}
                  </span>
                  
                  {/* Emoji */}
                  <span className="text-3xl">{meal.emoji}</span>
                  
                  {/* Info */}
                  <div className="flex-1 text-left">
                    <p className={cn(
                      "font-medium tracking-wide",
                      isSelected ? "text-amber-400" : "text-white"
                    )}>{meal.label}</p>
                    <p className="text-slate-500 text-xs">Curadoria especial</p>
                  </div>
                  
                  {/* Indicador */}
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

        {/* Botão Premium */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-black font-bold text-lg rounded-xl shadow-lg shadow-amber-500/30 flex items-center justify-center gap-3"
        >
          <Crown className="w-5 h-5" />
          Criar Experiência {tiers[selectedTier].label}
          <Sparkles className="w-5 h-5" />
        </motion.button>

        {/* Coleção Exclusiva (Histórico) */}
        <div>
          <h3 className="text-amber-400/60 text-xs font-semibold tracking-widest text-center mb-3">
            SUA COLEÇÃO EXCLUSIVA
          </h3>
          <div className="flex justify-center gap-3">
            {MOCK_HISTORY.map((item, idx) => (
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


// ============================================
// COMPONENTE DE PREVIEW V2
// ============================================
export const UltraCreativeLayoutsPreviewV2: React.FC = () => {
  const [activeLayout, setActiveLayout] = useState(0);
  
  const layouts = [
    { name: 'Spotify', component: MusicPlayerLayout, emoji: '🎵' },
    { name: 'Zen', component: ZenNatureLayout, emoji: '🌿' },
    { name: 'Cinema', component: CinemaLayout, emoji: '🎬' },
    { name: 'Aventura', component: AdventureMapLayout, emoji: '🗺️' },
    { name: 'iOS', component: SmartphoneLayout, emoji: '📱' },
    { name: 'Luxo', component: LuxuryLayout, emoji: '💎' },
  ];
  
  const ActiveComponent = layouts[activeLayout].component;
  
  return (
    <div className="space-y-4 p-4 bg-background min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-1">🎨 Layouts V2 - Mais Criativos!</h1>
        <p className="text-muted-foreground text-sm">6 novos estilos premium</p>
      </div>
      
      {/* Seletor */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {layouts.map((layout, idx) => (
          <Button
            key={layout.name}
            variant={activeLayout === idx ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveLayout(idx)}
            className="flex-shrink-0"
          >
            <span className="mr-1">{layout.emoji}</span>
            {layout.name}
          </Button>
        ))}
      </div>
      
      {/* Preview */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLayout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default UltraCreativeLayoutsPreviewV2;
