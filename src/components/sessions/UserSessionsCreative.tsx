import React, { useState, useEffect, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, PlayCircle, BookOpen, 
  ChevronRight, Trophy, Flame, Sparkles, 
  ArrowRight, Star, Zap, Heart, Brain,
  Target, Rocket, Crown, Gift, Lock,
  Calendar, Timer, TrendingUp, Award
} from 'lucide-react';

// Types
interface Session {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimated_time: number;
  content: any;
}

interface UserSession {
  id: string;
  session_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  progress: number;
  cycle_number: number;
  is_locked: boolean;
  next_available_date?: string;
  sessions: Session;
}

interface Props {
  user: User | null;
  onStartSession?: (sessionId: string) => void;
}

// Animated Ring Progress
const RingProgress = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8,
  color = "stroke-primary"
}: { 
  progress: number; 
  size?: number; 
  strokeWidth?: number;
  color?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="stroke-muted/30"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <motion.circle
          className={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.span 
            className="text-3xl font-bold text-foreground"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      </div>
    </div>
  );
};

// Streak Fire Animation
const StreakFire = ({ days }: { days: number }) => (
  <motion.div 
    className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full px-4 py-2"
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", delay: 0.3 }}
  >
    <motion.div
      animate={{ 
        scale: [1, 1.2, 1],
        rotate: [0, -5, 5, 0]
      }}
      transition={{ 
        duration: 0.5, 
        repeat: Infinity, 
        repeatDelay: 2 
      }}
    >
      <Flame className="w-5 h-5 text-orange-500" />
    </motion.div>
    <span className="font-bold text-orange-500">{days} dias</span>
  </motion.div>
);

// Hero Progress Card - Estilo Duolingo/Headspace
const HeroProgressCard = ({ 
  stats, 
  totalSessions 
}: { 
  stats: { pending: number; inProgress: number; completed: number };
  totalSessions: number;
}) => {
  const completionRate = totalSessions > 0 ? (stats.completed / totalSessions) * 100 : 0;
  const streakDays = 7; // TODO: Calcular do banco

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-6 text-white"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-yellow-400/10 rounded-full blur-xl" />
      
      {/* Floating particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          style={{
            top: `${20 + i * 15}%`,
            left: `${10 + i * 20}%`,
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}

      <div className="relative z-10">
        {/* Header with streak */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <motion.h2 
              className="text-2xl font-bold mb-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Sua Jornada ✨
            </motion.h2>
            <p className="text-white/70 text-sm">Continue evoluindo!</p>
          </div>
          <StreakFire days={streakDays} />
        </div>

        {/* Main progress ring */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <RingProgress 
              progress={completionRate} 
              size={140} 
              strokeWidth={10}
              color="stroke-white"
            />
            {completionRate >= 100 && (
              <motion.div
                className="absolute -top-2 -right-2"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 1 }}
              >
                <Crown className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatPill 
            icon={Clock} 
            value={stats.pending} 
            label="Pendentes" 
            color="bg-amber-400/20 text-amber-300"
            delay={0.1}
          />
          <StatPill 
            icon={PlayCircle} 
            value={stats.inProgress} 
            label="Em Progresso" 
            color="bg-blue-400/20 text-blue-300"
            delay={0.2}
          />
          <StatPill 
            icon={CheckCircle} 
            value={stats.completed} 
            label="Completas" 
            color="bg-emerald-400/20 text-emerald-300"
            delay={0.3}
          />
        </div>
      </div>
    </motion.div>
  );
};

const StatPill = ({ 
  icon: Icon, 
  value, 
  label, 
  color,
  delay 
}: { 
  icon: any; 
  value: number; 
  label: string; 
  color: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className={cn("rounded-2xl p-3 text-center", color)}
  >
    <Icon className="w-5 h-5 mx-auto mb-1" />
    <div className="text-xl font-bold">{value}</div>
    <div className="text-xs opacity-80">{label}</div>
  </motion.div>
);

// Next Session Card - Estilo Netflix/Spotify
const NextSessionHero = ({ 
  session, 
  onStart 
}: { 
  session: UserSession; 
  onStart: () => void;
}) => {
  const isInProgress = session.status === 'in_progress';
  
  // Ícones baseados no tipo de sessão
  const getSessionIcon = () => {
    const type = session.sessions.type?.toLowerCase() || '';
    if (type.includes('health') || type.includes('saude')) return Heart;
    if (type.includes('mind') || type.includes('mental')) return Brain;
    if (type.includes('goal') || type.includes('meta')) return Target;
    return BookOpen;
  };
  
  const SessionIcon = getSessionIcon();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Gradient background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      
      {/* Animated glow */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ transform: 'translate(-50%, -50%)' }}
      />

      <div className="relative z-10 p-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4"
        >
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span className="text-sm font-medium text-white">
            {isInProgress ? 'Continue de onde parou' : 'Próxima sessão'}
          </span>
        </motion.div>

        {/* Content */}
        <div className="flex gap-4">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.3 }}
            className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
          >
            <SessionIcon className="w-8 h-8 text-white" />
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
              {session.sessions.title}
            </h3>
            <div className="flex items-center gap-3 text-white/80 text-sm mb-3">
              <span className="flex items-center gap-1">
                <Timer className="w-4 h-4" />
                {session.sessions.estimated_time || 15} min
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {session.sessions.difficulty || 'Iniciante'}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-white/80 mb-1">
                <span>Progresso</span>
                <span className="font-bold text-white">{session.progress}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${session.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="w-full bg-white text-emerald-600 hover:bg-white/90 font-bold text-lg h-14 rounded-2xl shadow-lg shadow-black/20"
          >
            <Rocket className="w-5 h-5 mr-2" />
            {isInProgress ? 'Continuar Jornada' : 'Começar Agora'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Session Card - Estilo Card Game
const SessionCard = ({ 
  session, 
  onStart,
  index
}: { 
  session: UserSession; 
  onStart: () => void;
  index: number;
}) => {
  const statusConfig = {
    pending: {
      gradient: 'from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40',
      border: 'border-amber-200/50 dark:border-amber-700/50',
      iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
      badgeText: '⏳ Pendente',
      glow: 'group-hover:shadow-amber-500/20'
    },
    in_progress: {
      gradient: 'from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40',
      border: 'border-blue-200/50 dark:border-blue-700/50',
      iconBg: 'bg-gradient-to-br from-blue-400 to-indigo-500',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      badgeText: '▶️ Em Progresso',
      glow: 'group-hover:shadow-blue-500/20'
    },
    completed: {
      gradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40',
      border: 'border-emerald-200/50 dark:border-emerald-700/50',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
      badgeText: '✅ Completa',
      glow: 'group-hover:shadow-emerald-500/20'
    },
    cancelled: {
      gradient: 'from-gray-50 to-slate-50 dark:from-gray-950/40 dark:to-slate-950/40',
      border: 'border-gray-200/50 dark:border-gray-700/50',
      iconBg: 'bg-gradient-to-br from-gray-400 to-slate-500',
      badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
      badgeText: '🔒 Bloqueada',
      glow: ''
    }
  };

  const config = statusConfig[session.status] || statusConfig.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className={cn(
          "group cursor-pointer overflow-hidden border-2 transition-all duration-300",
          "hover:shadow-2xl",
          `bg-gradient-to-br ${config.gradient}`,
          config.border,
          config.glow,
          session.is_locked && "opacity-60 cursor-not-allowed"
        )}
        onClick={!session.is_locked ? onStart : undefined}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <motion.div 
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                config.iconBg
              )}
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <BookOpen className="w-6 h-6 text-white" />
            </motion.div>
            <Badge className={cn("text-xs font-medium", config.badge)}>
              {session.is_locked ? '🔒 Bloqueada' : config.badgeText}
            </Badge>
          </div>

          {/* Title */}
          <h4 className="font-bold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {session.sessions.title}
          </h4>

          {/* Meta */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1">
              <Timer className="w-3 h-3" />
              {session.sessions.estimated_time || 15}min
            </span>
            <span className="flex items-center gap-1 bg-muted/50 rounded-full px-2 py-1">
              <Star className="w-3 h-3" />
              {session.sessions.difficulty || 'Iniciante'}
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-bold text-foreground">{session.progress}%</span>
            </div>
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", config.iconBg)}
                initial={{ width: 0 }}
                animate={{ width: `${session.progress}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              />
            </div>
          </div>

          {/* Locked info */}
          {session.is_locked && session.next_available_date && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
              <Calendar className="w-3 h-3" />
              Disponível em {new Date(session.next_available_date).toLocaleDateString('pt-BR')}
            </div>
          )}

          {/* Hover action */}
          {!session.is_locked && session.status !== 'completed' && (
            <motion.div 
              className="mt-3 flex items-center justify-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ y: 10 }}
              whileHover={{ y: 0 }}
            >
              {session.status === 'in_progress' ? 'Continuar' : 'Iniciar'}
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}

          {/* Completed badge */}
          {session.status === 'completed' && (
            <motion.div 
              className="mt-3 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.5 }}
            >
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <Award className="w-4 h-4" />
                <span className="text-xs font-medium">Concluída!</span>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Celebration Component
const AllCompletedCelebration = ({ count, isFeminine }: { count: number; isFeminine?: boolean }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 p-8 text-white text-center"
  >
    {/* Confetti effect */}
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-3 h-3 rounded-full"
        style={{
          background: ['#fff', '#ffd700', '#ff69b4', '#00ff00'][i % 4],
          left: `${Math.random() * 100}%`,
          top: '-10%',
        }}
        animate={{
          y: ['0%', '120%'],
          rotate: [0, 360],
          opacity: [1, 0],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}

    <motion.div
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, -5, 5, 0]
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-200 drop-shadow-lg" />
    </motion.div>
    
    <h2 className="text-3xl font-bold mb-2">🎉 Incrível!</h2>
    <p className="text-lg opacity-90 mb-4">
      Você completou todas as {count} sessões!
    </p>
    
    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
      <Crown className="w-5 h-5 text-yellow-300" />
      <span className="font-bold">{isFeminine ? 'Mestra das Sessões' : 'Mestre das Sessões'}</span>
    </div>
  </motion.div>
);

// Filter Tabs
const FilterTabs = ({ 
  active, 
  onChange, 
  counts 
}: { 
  active: string; 
  onChange: (v: string) => void;
  counts: { pending: number; inProgress: number; completed: number };
}) => {
  const tabs = [
    { key: 'all', label: 'Todas', count: counts.pending + counts.inProgress + counts.completed, icon: BookOpen },
    { key: 'pending', label: 'Pendentes', count: counts.pending, icon: Clock },
    { key: 'in_progress', label: 'Em Progresso', count: counts.inProgress, icon: PlayCircle },
    { key: 'completed', label: 'Completas', count: counts.completed, icon: CheckCircle },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        
        return (
          <motion.button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition-all",
              isActive 
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            <span className={cn(
              "px-2 py-0.5 rounded-full text-xs font-bold",
              isActive ? "bg-white/20" : "bg-muted"
            )}>
              {tab.count}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};


// Main Component
export default function UserSessionsCreative({ user, onStartSession }: Props) {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`*, sessions (id, title, description, type, difficulty, estimated_time, content)`)
        .eq('user_id', user?.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      const processed = (data || []).map((s: any) => ({
        ...s,
        status: s.status === 'assigned' ? 'pending' : s.status,
        cycle_number: s.cycle_number || 1,
        is_locked: s.is_locked || false,
      })) as UserSession[];

      setSessions(processed);
    } catch (error) {
      console.error('Erro:', error);
      toast({ title: "Erro", description: "Não foi possível carregar sessões", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => ({
    pending: sessions.filter(s => s.status === 'pending').length,
    inProgress: sessions.filter(s => s.status === 'in_progress').length,
    completed: sessions.filter(s => s.status === 'completed').length,
  }), [sessions]);

  const nextSession = useMemo(() => {
    const inProgress = sessions.find(s => s.status === 'in_progress' && !s.is_locked);
    if (inProgress) return inProgress;
    return sessions.find(s => s.status === 'pending' && !s.is_locked) || null;
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    if (filter === 'all') return sessions;
    return sessions.filter(s => s.status === filter);
  }, [sessions, filter]);

  const handleStart = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.is_locked) return;

    try {
      if (session.status === 'pending') {
        await supabase
          .from('user_sessions')
          .update({ status: 'in_progress', started_at: new Date().toISOString() })
          .eq('id', sessionId);
      }

      onStartSession?.(sessionId);
      loadSessions();
      
      toast({
        title: session.status === 'pending' ? "🚀 Sessão Iniciada!" : "▶️ Continuando...",
        description: session.sessions.title
      });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível iniciar", variant: "destructive" });
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 mx-auto mb-4 rounded-full border-4 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-muted-foreground">Carregando suas sessões...</p>
        </motion.div>
      </div>
    );
  }

  // No user
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Lock className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-bold mb-2">Login Necessário</h3>
          <p className="text-muted-foreground">Faça login para ver suas sessões</p>
        </motion.div>
      </div>
    );
  }

  const allCompleted = stats.pending === 0 && stats.inProgress === 0 && stats.completed > 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Hero Progress */}
      <HeroProgressCard stats={stats} totalSessions={sessions.length} />

      {/* Celebration or Next Session */}
      <AnimatePresence mode="wait">
        {allCompleted ? (
          <AllCompletedCelebration key="celebration" count={stats.completed} />
        ) : nextSession ? (
          <NextSessionHero 
            key="next"
            session={nextSession} 
            onStart={() => handleStart(nextSession.id)} 
          />
        ) : null}
      </AnimatePresence>

      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-foreground">Todas as Sessões</h3>
        <Badge variant="secondary" className="text-xs">
          {sessions.length} total
        </Badge>
      </div>

      {/* Filter Tabs */}
      <FilterTabs active={filter} onChange={setFilter} counts={stats} />

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma sessão aqui</h3>
          <p className="text-muted-foreground text-sm">
            {filter === 'pending' && 'Você iniciou todas! 🎉'}
            {filter === 'in_progress' && 'Nenhuma em andamento'}
            {filter === 'completed' && 'Complete sua primeira sessão!'}
            {filter === 'all' && 'Suas sessões aparecerão aqui'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredSessions.map((session, i) => (
            <SessionCard
              key={session.id}
              session={session}
              index={i}
              onStart={() => handleStart(session.id)}
            />
          ))}
        </div>
      )}

      {/* Floating Progress */}
      {sessions.length > 0 && !allCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 left-4 right-4 z-40 max-w-lg mx-auto"
        >
          <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 p-4 flex items-center gap-4">
            <div className="relative">
              <RingProgress 
                progress={(stats.completed / sessions.length) * 100} 
                size={56} 
                strokeWidth={5}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground">
                {stats.completed} de {sessions.length} completas
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.pending > 0 ? `${stats.pending} aguardando você!` : 'Continue assim!'}
              </div>
            </div>
            {nextSession && (
              <Button 
                size="sm" 
                onClick={() => handleStart(nextSession.id)}
                className="rounded-xl shadow-lg"
              >
                <Zap className="w-4 h-4 mr-1" />
                Ir
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
