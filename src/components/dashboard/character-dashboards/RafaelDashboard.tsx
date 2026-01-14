/**
 * Rafael Dashboard - Coaching & Desenvolvimento Pessoal
 * Design gamificado e atrativo para engajar usuários
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCoachingData } from '@/hooks/useCoachingData';
import { supabase } from '@/integrations/supabase/client';
import { useUserDataCache } from '@/hooks/useUserDataCache';
import { useDashboardNavigation } from '@/hooks/useDashboardNavigation';
import { Flame, Sparkles, Trophy, Star, Zap, Heart, Send, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface RafaelDashboardProps {
  className?: string;
}

export function RafaelDashboard({ className }: RafaelDashboardProps) {
  const { navigate } = useDashboardNavigation();
  const { coachingData, loading, refresh } = useCoachingData();
  const { data: userData } = useUserDataCache();
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const userName = userData.profile?.fullName?.split(' ')[0] || 'você';
  const missionProgress = coachingData.missionsTotal > 0 
    ? (coachingData.missionsCompleted / coachingData.missionsTotal) * 100 
    : 0;

  const handleSaveReflection = async () => {
    if (!reflection.trim()) return;
    const userId = userData.user?.id;
    if (!userId) return;
    
    setIsSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('daily_responses').insert({
        user_id: userId,
        question_id: 'daily-reflection',
        answer: reflection,
        section: 'reflection',
        date: today,
        points_earned: 10,
      });
      toast.success('Reflexão salva! +10 XP ✨');
      setReflection('');
      refresh();
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setIsSaving(false);
    }
  };

  // Jornadas interativas
  const journeys = [
    {
      id: 'autoconhecimento',
      emoji: '🧭',
      title: 'Jornada do Autoconhecimento',
      subtitle: 'Descubra quem você realmente é',
      progress: 35,
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-500/10',
      sessions: 3,
    },
    {
      id: 'emocional',
      emoji: '💎',
      title: 'Inteligência Emocional',
      subtitle: 'Domine suas emoções',
      progress: 20,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-500/10',
      sessions: 5,
    },
    {
      id: 'habitos',
      emoji: '🚀',
      title: 'Construtor de Hábitos',
      subtitle: 'Transforme sua rotina',
      progress: 0,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-500/10',
      sessions: 4,
      isNew: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-sky-500/30 border-t-sky-500 animate-spin" />
          <span className="absolute inset-0 flex items-center justify-center text-2xl">🧘</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 pb-4", className)}>
      {/* Hero Card - Saudação Personalizada */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-cyan-600 to-teal-500 p-5">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white/80 text-sm">Olá, {userName}! 👋</p>
              <h2 className="text-xl font-bold text-white">Sua jornada continua</h2>
            </div>
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5">
              <Flame className="w-4 h-4 text-orange-300" />
              <span className="text-white font-bold text-sm">{coachingData.streak}</span>
            </div>
          </div>

          {/* XP Progress */}
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white/80 text-xs">Nível Atual</p>
                  <p className="text-white font-bold">Explorador</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-xs">Próximo nível</p>
                <p className="text-white font-bold">350 XP</p>
              </div>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full transition-all duration-500"
                style={{ width: '65%' }}
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2">
            <QuickStat icon="📖" value={coachingData.sessionsCompleted} label="Sessões" />
            <QuickStat icon="💭" value={coachingData.recentReflections.length} label="Reflexões" />
            <QuickStat icon="🎯" value={`${coachingData.missionsCompleted}/${coachingData.missionsTotal}`} label="Missões" />
          </div>
        </div>
      </div>

      {/* Missão do Dia - Gamificada */}
      <button 
        onClick={() => navigate('/missions')}
        className="w-full text-left"
      >
        <div className="relative overflow-hidden bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 rounded-2xl p-4 group hover:border-violet-500/50 transition-all">
          <div className="absolute top-2 right-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
            </span>
          </div>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-2xl shadow-lg shadow-violet-500/30">
              🎯
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground">Missão do Dia</h3>
              <p className="text-sm text-muted-foreground">Complete para ganhar recompensas!</p>
            </div>
            <div className="flex items-center gap-1 bg-violet-500/20 px-2 py-1 rounded-lg">
              <Zap className="w-3 h-3 text-violet-400" />
              <span className="text-xs font-bold text-violet-300">+{coachingData.xpReward} XP</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium text-violet-400">{coachingData.missionsCompleted}/{coachingData.missionsTotal}</span>
            </div>
            <div className="h-3 bg-muted/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500 relative"
                style={{ width: `${missionProgress}%` }}
              >
                {missionProgress > 0 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center mt-3 text-sm text-violet-400 group-hover:text-violet-300 transition-colors">
            <span>Ver missões</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </button>

      {/* Jornadas - Cards Horizontais */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold flex items-center gap-2">
            <span className="text-lg">🗺️</span> Suas Jornadas
          </h3>
          <button 
            onClick={() => navigate('/sessions')}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1"
          >
            Ver todas <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory">
          {journeys.map((journey) => (
            <button
              key={journey.id}
              onClick={() => navigate('/sessions')}
              className="flex-shrink-0 w-[280px] snap-start"
            >
              <div className={cn(
                "relative overflow-hidden rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all hover:scale-[1.02]",
                journey.bgColor
              )}>
                {journey.isNew && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    NOVO
                  </div>
                )}
                
                <div className="flex items-start gap-3 mb-3">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center text-2xl shadow-lg",
                    journey.color
                  )}>
                    {journey.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{journey.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{journey.subtitle}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{journey.sessions} sessões</span>
                    <span className="font-medium">{journey.progress}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full bg-gradient-to-r", journey.color)}
                      style={{ width: `${journey.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Reflexão do Dia - Mais Convidativa */}
      <div className="relative overflow-hidden bg-gradient-to-br from-sky-900/50 to-cyan-900/30 border border-sky-500/20 rounded-2xl p-4">
        <div className="absolute top-0 right-0 text-6xl opacity-10 -translate-y-2 translate-x-2">💭</div>
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold">Momento de Reflexão</h3>
              <p className="text-xs text-muted-foreground">Ganhe +10 XP por cada reflexão</p>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-3 mb-3">
            <p className="text-sm text-sky-200 italic mb-2">
              "O autoconhecimento é a chave para todas as portas."
            </p>
            <p className="text-xs text-muted-foreground">— Rafael, seu coach</p>
          </div>

          <Textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="O que você aprendeu hoje sobre si mesmo? ✨"
            className="bg-white/5 border-sky-500/30 text-foreground placeholder:text-muted-foreground resize-none mb-3 focus:border-sky-400 min-h-[80px]"
            rows={3}
          />
          
          <Button
            onClick={handleSaveReflection}
            disabled={isSaving || !reflection.trim()}
            className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white shadow-lg shadow-sky-500/20"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSaving ? 'Salvando...' : 'Compartilhar Reflexão'}
          </Button>
        </div>
      </div>

      {/* Conquistas Recentes */}
      <div className="bg-muted/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold">Conquistas</h3>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-1">
          <AchievementBadge emoji="🌟" title="Primeiro Passo" unlocked />
          <AchievementBadge emoji="🔥" title="3 Dias Seguidos" unlocked={coachingData.streak >= 3} />
          <AchievementBadge emoji="💎" title="5 Reflexões" unlocked={coachingData.recentReflections.length >= 5} />
          <AchievementBadge emoji="🏆" title="Mestre" unlocked={false} />
        </div>
      </div>

      {/* CTA Final */}
      <button
        onClick={() => navigate('/sessions')}
        className="w-full relative overflow-hidden bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white rounded-2xl p-4 font-medium shadow-lg shadow-sky-500/30 hover:shadow-sky-500/40 transition-all hover:scale-[1.02] group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        <div className="relative flex items-center justify-center gap-2">
          <Heart className="w-5 h-5" />
          <span>Começar Sessão de Coaching</span>
        </div>
      </button>
    </div>
  );
}

function QuickStat({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 text-center">
      <span className="text-lg">{icon}</span>
      <p className="text-white font-bold text-sm">{value}</p>
      <p className="text-white/60 text-[10px]">{label}</p>
    </div>
  );
}

function AchievementBadge({ emoji, title, unlocked }: { emoji: string; title: string; unlocked: boolean }) {
  return (
    <div className={cn(
      "flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
      unlocked ? "opacity-100" : "opacity-40 grayscale"
    )}>
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center text-2xl",
        unlocked ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30" : "bg-muted/30"
      )}>
        {emoji}
      </div>
      <span className="text-[10px] text-center max-w-[60px] leading-tight">{title}</span>
    </div>
  );
}

export default RafaelDashboard;
