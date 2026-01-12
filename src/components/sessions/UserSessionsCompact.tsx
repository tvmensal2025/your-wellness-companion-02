import React, { useState, useEffect, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, PlayCircle, BookOpen, 
  ChevronRight, Flame, ArrowRight, Star,
  Lock, Timer, Trophy
} from 'lucide-react';

interface Session {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimated_time: number;
}

interface UserSession {
  id: string;
  session_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  is_locked: boolean;
  sessions: Session;
}

interface Props {
  user: User | null;
  onStartSession?: (sessionId: string) => void;
}

// Mini Progress Ring
const MiniRing = ({ progress, size = 44 }: { progress: number; size?: number }) => {
  const r = (size - 6) / 2;
  const c = r * 2 * Math.PI;
  const offset = c - (progress / 100) * c;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={3} className="stroke-muted/30" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={3} strokeLinecap="round"
        className="stroke-primary" strokeDasharray={c} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  );
};

// Compact Header with Stats
const CompactHeader = ({ stats, total }: { stats: { pending: number; inProgress: number; completed: number }; total: number }) => {
  const pct = total > 0 ? Math.round((stats.completed / total) * 100) : 0;
  
  return (
    <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl">
      <div className="relative">
        <MiniRing progress={pct} size={56} />
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{pct}%</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-foreground">Progresso</span>
          {stats.completed > 0 && <Flame className="w-4 h-4 text-orange-500" />}
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-amber-500" />{stats.pending}</span>
          <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3 text-blue-500" />{stats.inProgress}</span>
          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" />{stats.completed}</span>
        </div>
      </div>
      {stats.pending > 0 && (
        <Badge className="bg-primary/20 text-primary border-0">{stats.pending} pendentes</Badge>
      )}
    </div>
  );
};

// Next Session Banner (compact)
const NextBanner = ({ session, onStart }: { session: UserSession; onStart: () => void }) => {
  const isProgress = session.status === 'in_progress';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white"
    >
      <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs opacity-80">{isProgress ? 'Continuar' : 'Próxima'}</p>
        <p className="font-semibold text-sm truncate">{session.sessions.title}</p>
      </div>
      <Button size="sm" onClick={onStart} className="bg-white text-emerald-600 hover:bg-white/90 rounded-lg h-9 px-4">
        <ArrowRight className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

// Filter Pills (minimal)
const Filters = ({ active, onChange, counts }: { active: string; onChange: (v: string) => void; counts: any }) => (
  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
    {[
      { key: 'all', label: 'Todas', count: counts.pending + counts.inProgress + counts.completed },
      { key: 'pending', label: 'Pendentes', count: counts.pending },
      { key: 'in_progress', label: 'Em Progresso', count: counts.inProgress },
      { key: 'completed', label: 'Completas', count: counts.completed },
    ].map(f => (
      <button
        key={f.key}
        onClick={() => onChange(f.key)}
        className={cn(
          "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
          active === f.key 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted/50 text-muted-foreground hover:bg-muted"
        )}
      >
        {f.label} ({f.count})
      </button>
    ))}
  </div>
);

// Session Row (list style)
const SessionRow = ({ session, onStart, index }: { session: UserSession; onStart: () => void; index: number }) => {
  const statusColors = {
    pending: { bg: 'bg-amber-500', ring: 'ring-amber-500/20' },
    in_progress: { bg: 'bg-blue-500', ring: 'ring-blue-500/20' },
    completed: { bg: 'bg-emerald-500', ring: 'ring-emerald-500/20' },
    cancelled: { bg: 'bg-gray-400', ring: 'ring-gray-400/20' },
  };
  const colors = statusColors[session.status] || statusColors.pending;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={!session.is_locked && session.status !== 'completed' ? onStart : undefined}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-all",
        "bg-card hover:bg-muted/50 border border-border/50",
        !session.is_locked && session.status !== 'completed' && "cursor-pointer active:scale-[0.98]",
        session.is_locked && "opacity-50"
      )}
    >
      {/* Status indicator */}
      <div className={cn("w-2 h-2 rounded-full flex-shrink-0", colors.bg)} />
      
      {/* Icon */}
      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ring-2", colors.ring, "bg-muted/50")}>
        {session.is_locked ? (
          <Lock className="w-4 h-4 text-muted-foreground" />
        ) : session.status === 'completed' ? (
          <CheckCircle className="w-4 h-4 text-emerald-500" />
        ) : (
          <BookOpen className="w-4 h-4 text-foreground/70" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-foreground truncate">{session.sessions.title}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5">
            <Timer className="w-3 h-3" />
            {session.sessions.estimated_time || 15}min
          </span>
          <span>•</span>
          <span>{session.progress}%</span>
        </div>
      </div>

      {/* Progress or Action */}
      {session.status === 'completed' ? (
        <Trophy className="w-4 h-4 text-amber-500" />
      ) : !session.is_locked ? (
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      ) : null}
    </motion.div>
  );
};

// Main Component
export default function UserSessionsCompact({ user, onStartSession }: Props) {
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
        .select(`*, sessions (id, title, description, type, difficulty, estimated_time)`)
        .eq('user_id', user?.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      setSessions((data || []).map((s: any) => ({
        ...s,
        status: s.status === 'assigned' ? 'pending' : s.status,
        is_locked: s.is_locked || false,
      })));
    } catch (e) {
      toast({ title: "Erro", description: "Falha ao carregar", variant: "destructive" });
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
    return sessions.find(s => s.status === 'in_progress' && !s.is_locked) 
      || sessions.find(s => s.status === 'pending' && !s.is_locked) 
      || null;
  }, [sessions]);

  const filtered = useMemo(() => {
    if (filter === 'all') return sessions;
    return sessions.filter(s => s.status === filter);
  }, [sessions, filter]);

  const handleStart = async (id: string) => {
    const s = sessions.find(x => x.id === id);
    if (!s || s.is_locked) return;

    if (s.status === 'pending') {
      await supabase.from('user_sessions').update({ status: 'in_progress', started_at: new Date().toISOString() }).eq('id', id);
    }
    onStartSession?.(id);
    loadSessions();
    toast({ title: "🚀 Vamos lá!", description: s.sessions.title });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-muted-foreground">Faça login para ver suas sessões</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {/* Compact Header */}
      <CompactHeader stats={stats} total={sessions.length} />

      {/* Next Session Banner */}
      <AnimatePresence>
        {nextSession && (
          <NextBanner session={nextSession} onStart={() => handleStart(nextSession.id)} />
        )}
      </AnimatePresence>

      {/* Filters */}
      <Filters active={filter} onChange={setFilter} counts={stats} />

      {/* Sessions List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            {filter === 'completed' ? '🎯 Complete sua primeira sessão!' : 'Nenhuma sessão encontrada'}
          </div>
        ) : (
          filtered.map((s, i) => (
            <SessionRow key={s.id} session={s} index={i} onStart={() => handleStart(s.id)} />
          ))
        )}
      </div>

      {/* All completed celebration */}
      {stats.pending === 0 && stats.inProgress === 0 && stats.completed > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-2xl"
        >
          <Trophy className="w-10 h-10 mx-auto mb-2 text-amber-500" />
          <p className="font-semibold text-foreground">Parabéns! 🎉</p>
          <p className="text-sm text-muted-foreground">Todas as {stats.completed} sessões completas!</p>
        </motion.div>
      )}
    </div>
  );
}
