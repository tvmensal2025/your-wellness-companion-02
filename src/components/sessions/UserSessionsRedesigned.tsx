import React, { useState, useEffect, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, PlayCircle, BookOpen, 
  Target, ChevronRight, Trophy, Flame,
  Lock, Filter, Sparkles, ArrowRight,
  Calendar, Timer, Star, Zap
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

interface UserSessionsRedesignedProps {
  user: User | null;
  onStartSession?: (sessionId: string) => void;
}

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';

// Compact Stats Bar Component
const StatsBar = ({ stats }: { stats: { pending: number; inProgress: number; completed: number } }) => {
  const total = stats.pending + stats.inProgress + stats.completed;
  
  return (
    <div className="flex items-center justify-between bg-card/50 backdrop-blur-sm rounded-2xl p-4 border border-border/50">
      <StatItem 
        icon={Clock} 
        value={stats.pending} 
        label="Pendentes" 
        color="text-amber-500" 
        bgColor="bg-amber-500/10"
      />
      <div className="w-px h-8 bg-border/50" />
      <StatItem 
        icon={PlayCircle} 
        value={stats.inProgress} 
        label="Em Progresso" 
        color="text-blue-500" 
        bgColor="bg-blue-500/10"
      />
      <div className="w-px h-8 bg-border/50" />
      <StatItem 
        icon={CheckCircle} 
        value={stats.completed} 
        label="Completas" 
        color="text-emerald-500" 
        bgColor="bg-emerald-500/10"
      />
      {total > 0 && (
        <>
          <div className="w-px h-8 bg-border/50" />
          <div className="text-center px-3">
            <div className="text-lg font-bold text-foreground">{Math.round((stats.completed / total) * 100)}%</div>
            <div className="text-xs text-muted-foreground">Conclusão</div>
          </div>
        </>
      )}
    </div>
  );
};

const StatItem = ({ 
  icon: Icon, 
  value, 
  label, 
  color, 
  bgColor 
}: { 
  icon: any; 
  value: number; 
  label: string; 
  color: string; 
  bgColor: string;
}) => (
  <div className="flex items-center gap-3 px-3">
    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", bgColor)}>
      <Icon className={cn("w-5 h-5", color)} />
    </div>
    <div>
      <div className="text-xl font-bold text-foreground">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  </div>
);

// Next Session Hero Card
const NextSessionCard = ({ 
  session, 
  onStart 
}: { 
  session: UserSession | null; 
  onStart: () => void;
}) => {
  if (!session) return null;

  const isInProgress = session.status === 'in_progress';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-6 text-primary-foreground shadow-xl"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium opacity-90">
            {isInProgress ? 'Continue de onde parou' : 'Próxima Sessão'}
          </span>
        </div>
        
        <h3 className="text-xl font-bold mb-2 line-clamp-2">
          {session.sessions.title}
        </h3>
        
        <div className="flex items-center gap-4 mb-4 text-sm opacity-80">
          <span className="flex items-center gap-1">
            <Timer className="w-4 h-4" />
            {session.sessions.estimated_time || 15} min
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            {session.sessions.difficulty || 'Iniciante'}
          </span>
        </div>
        
        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso</span>
            <span className="font-bold">{session.progress}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${session.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
        
        <Button 
          onClick={onStart}
          size="lg"
          className="w-full bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
        >
          {isInProgress ? 'Continuar' : 'Iniciar Sessão'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};

// Filter Pills
const FilterPills = ({ 
  activeFilter, 
  onFilterChange, 
  counts 
}: { 
  activeFilter: FilterType; 
  onFilterChange: (filter: FilterType) => void;
  counts: { pending: number; inProgress: number; completed: number };
}) => {
  const filters: { key: FilterType; label: string; count: number }[] = [
    { key: 'all', label: 'Todas', count: counts.pending + counts.inProgress + counts.completed },
    { key: 'pending', label: 'Pendentes', count: counts.pending },
    { key: 'in_progress', label: 'Em Progresso', count: counts.inProgress },
    { key: 'completed', label: 'Completas', count: counts.completed },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
          className={cn(
            "rounded-full whitespace-nowrap transition-all",
            activeFilter === filter.key && "shadow-md"
          )}
        >
          {filter.label}
          <Badge 
            variant="secondary" 
            className={cn(
              "ml-2 h-5 min-w-5 rounded-full text-xs",
              activeFilter === filter.key 
                ? "bg-primary-foreground/20 text-primary-foreground" 
                : "bg-muted"
            )}
          >
            {filter.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};

// Session Card Component
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
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-800',
      icon: Clock,
      iconColor: 'text-amber-500',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
      badgeText: 'Pendente'
    },
    in_progress: {
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      border: 'border-blue-200 dark:border-blue-800',
      icon: PlayCircle,
      iconColor: 'text-blue-500',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      badgeText: 'Em Progresso'
    },
    completed: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
      badgeText: 'Completa'
    },
    cancelled: {
      bg: 'bg-gray-50 dark:bg-gray-950/30',
      border: 'border-gray-200 dark:border-gray-800',
      icon: Lock,
      iconColor: 'text-gray-500',
      badge: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
      badgeText: 'Cancelada'
    }
  };

  const config = statusConfig[session.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card 
        className={cn(
          "group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border",
          config.bg,
          config.border,
          session.is_locked && "opacity-60"
        )}
        onClick={!session.is_locked ? onStart : undefined}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              config.bg
            )}>
              <StatusIcon className={cn("w-5 h-5", config.iconColor)} />
            </div>
            <Badge className={cn("text-xs", config.badge)}>
              {session.is_locked ? (
                <><Lock className="w-3 h-3 mr-1" /> Bloqueada</>
              ) : (
                config.badgeText
              )}
            </Badge>
          </div>

          {/* Title */}
          <h4 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {session.sessions.title}
          </h4>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Timer className="w-3 h-3" />
              {session.sessions.estimated_time || 15}min
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3" />
              {session.sessions.difficulty || 'Iniciante'}
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium text-foreground">{session.progress}%</span>
            </div>
            <Progress value={session.progress} className="h-1.5" />
          </div>

          {/* Locked info */}
          {session.is_locked && session.next_available_date && (
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
              <Calendar className="w-3 h-3" />
              Disponível em {new Date(session.next_available_date).toLocaleDateString('pt-BR')}
            </div>
          )}

          {/* Action hint */}
          {!session.is_locked && session.status !== 'completed' && (
            <div className="mt-3 flex items-center justify-end text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {session.status === 'in_progress' ? 'Continuar' : 'Iniciar'}
              <ChevronRight className="w-4 h-4" />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Empty State
const EmptyState = ({ filter }: { filter: FilterType }) => {
  const messages = {
    all: {
      icon: BookOpen,
      title: 'Nenhuma sessão disponível',
      description: 'Suas sessões aparecerão aqui quando forem atribuídas.'
    },
    pending: {
      icon: Trophy,
      title: '🎉 Todas as sessões iniciadas!',
      description: 'Você não tem sessões pendentes. Continue as que estão em progresso!'
    },
    in_progress: {
      icon: Sparkles,
      title: 'Nenhuma sessão em andamento',
      description: 'Inicie uma sessão pendente para começar.'
    },
    completed: {
      icon: Target,
      title: 'Nenhuma sessão completa ainda',
      description: 'Complete suas primeiras sessões para ver seu progresso aqui.'
    }
  };

  const config = messages[filter];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-12"
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-muted flex items-center justify-center">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{config.title}</h3>
      <p className="text-muted-foreground text-sm max-w-sm mx-auto">{config.description}</p>
    </motion.div>
  );
};

// Celebration Card (when all completed)
const CelebrationCard = ({ completedCount }: { completedCount: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-6 text-white text-center shadow-xl"
  >
    <div className="w-16 h-16 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
      <Trophy className="w-8 h-8" />
    </div>
    <h3 className="text-xl font-bold mb-2">Parabéns! 🎉</h3>
    <p className="opacity-90 mb-4">
      Você completou todas as {completedCount} sessões disponíveis!
    </p>
    <div className="flex items-center justify-center gap-2 text-sm bg-white/20 rounded-full py-2 px-4 inline-flex">
      <Flame className="w-4 h-4" />
      <span>Continue assim!</span>
    </div>
  </motion.div>
);


// Main Component
export default function UserSessionsRedesigned({ user, onStartSession }: UserSessionsRedesignedProps) {
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { toast } = useToast();

  // Load sessions
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          sessions (
            id, title, description, type, difficulty, 
            estimated_time, content
          )
        `)
        .eq('user_id', user?.id)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      const processedSessions = (data || []).map((session: any) => ({
        ...session,
        status: session.status === 'assigned' ? 'pending' : session.status,
        cycle_number: session.cycle_number || 1,
        is_locked: session.is_locked || false,
        next_available_date: session.next_available_date || null,
      })) as UserSession[];

      setSessions(processedSessions);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas sessões",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => ({
    pending: sessions.filter(s => s.status === 'pending').length,
    inProgress: sessions.filter(s => s.status === 'in_progress').length,
    completed: sessions.filter(s => s.status === 'completed').length,
  }), [sessions]);

  // Get next session to continue/start
  const nextSession = useMemo(() => {
    // Priority: in_progress > pending
    const inProgress = sessions.find(s => s.status === 'in_progress' && !s.is_locked);
    if (inProgress) return inProgress;
    
    const pending = sessions.find(s => s.status === 'pending' && !s.is_locked);
    return pending || null;
  }, [sessions]);

  // Filter sessions
  const filteredSessions = useMemo(() => {
    if (activeFilter === 'all') return sessions;
    return sessions.filter(s => s.status === activeFilter);
  }, [sessions, activeFilter]);

  // Handle start session
  const handleStartSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || session.is_locked) return;

    try {
      // Update status to in_progress if pending
      if (session.status === 'pending') {
        await supabase
          .from('user_sessions')
          .update({
            status: 'in_progress',
            started_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      }

      // Call external handler if provided
      if (onStartSession) {
        onStartSession(sessionId);
      }

      // Reload sessions
      loadSessions();

      toast({
        title: session.status === 'pending' ? "Sessão Iniciada! 🚀" : "Continuando sessão...",
        description: session.sessions.title
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a sessão",
        variant: "destructive"
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground">Carregando sessões...</p>
        </div>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-muted flex items-center justify-center">
            <Lock className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Login necessário</h3>
          <p className="text-muted-foreground text-sm">
            Faça login para acessar suas sessões
          </p>
        </div>
      </div>
    );
  }

  const allCompleted = stats.pending === 0 && stats.inProgress === 0 && stats.completed > 0;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Minhas Sessões</h1>
        <p className="text-muted-foreground text-sm">
          {stats.pending > 0 
            ? `${stats.pending} pendente${stats.pending > 1 ? 's' : ''} • ${stats.inProgress} em andamento`
            : stats.inProgress > 0 
              ? `${stats.inProgress} em andamento`
              : `${stats.completed} sessões completas`
          }
        </p>
      </div>

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Celebration or Next Session */}
      <AnimatePresence mode="wait">
        {allCompleted ? (
          <CelebrationCard key="celebration" completedCount={stats.completed} />
        ) : nextSession ? (
          <NextSessionCard 
            key="next-session"
            session={nextSession} 
            onStart={() => handleStartSession(nextSession.id)} 
          />
        ) : null}
      </AnimatePresence>

      {/* Filter Pills */}
      <FilterPills 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter}
        counts={stats}
      />

      {/* Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <EmptyState filter={activeFilter} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              index={index}
              onStart={() => handleStartSession(session.id)}
            />
          ))}
        </div>
      )}

      {/* Quick Stats Footer */}
      {sessions.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-20 left-4 right-4 z-40"
        >
          <div className="bg-card/95 backdrop-blur-lg rounded-2xl shadow-xl border border-border/50 p-3 flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {Math.round((stats.completed / sessions.length) * 100)}% concluído
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.completed} de {sessions.length} sessões
                </div>
              </div>
            </div>
            {nextSession && (
              <Button 
                size="sm" 
                onClick={() => handleStartSession(nextSession.id)}
                className="rounded-xl"
              >
                Continuar
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
