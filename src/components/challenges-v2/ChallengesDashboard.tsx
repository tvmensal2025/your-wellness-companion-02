// =====================================================
// 🏆 SISTEMA DE DESAFIOS V2 - DASHBOARD SIMPLIFICADO
// Foco: Desafios, Duelos, Times + Alertas compactos
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, Zap, Users, Target, Plus, Flame, 
  Swords, Bell
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Components
import { DuelCard } from './duels/DuelCard';
import { CreateDuelModal } from './duels/CreateDuelModal';
import { TeamCard } from './teams/TeamCard';
import { CreateTeamModal } from './teams/CreateTeamModal';
// TeamDetailView removed - team_battles table was empty
import { CompactAlerts } from './CompactAlerts';
import { CreateChallengeModal } from './admin/CreateChallengeModal';
import { useAdminMode } from '@/hooks/useAdminMode';
import { 
  useFlashChallenges, 
  useActiveEvents,
  useMyDuels,
  useMyTeams,
} from '@/hooks/challenges/useChallengesV2';
import { CATEGORY_CONFIG } from '@/types/challenges-v2';
import type { ChallengeTeam } from '@/types/challenges-v2';

// =====================================================
// HOOK PARA CARREGAR DESAFIOS DO BANCO
// =====================================================
function useChallengesFromDB(userId: string | undefined) {
  return useQuery({
    queryKey: ['challenges-db', userId],
    queryFn: async () => {
      const { data: challenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      let participations: any[] = [];
      if (userId) {
        const { data } = await supabase
          .from('challenge_participations')
          .select('*')
          .eq('user_id', userId);
        participations = data || [];
      }

      return { challenges: challenges || [], participations };
    },
    staleTime: 2 * 60 * 1000,
  });
}

// =====================================================
// MAIN COMPONENT
// =====================================================
export const ChallengesDashboard: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const { isAdmin } = useAdminMode(user);
  const [mainTab, setMainTab] = useState('desafios');
  const [challengeTab, setChallengeTab] = useState('ativos');
  const [showDuelModal, setShowDuelModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showCreateChallengeModal, setShowCreateChallengeModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<ChallengeTeam | null>(null);

  // Carregar dados
  const { data: dbData } = useChallengesFromDB(userId);
  const { data: flashChallenges } = useFlashChallenges();
  const { data: duels } = useMyDuels(userId);
  const { data: teams } = useMyTeams(userId);
  const { data: events } = useActiveEvents();

  const challenges = dbData?.challenges || [];
  const participations = dbData?.participations || [];
  const participationMap = new Map(participations.map(p => [p.challenge_id, p]));

  const myActiveChallenges = challenges.filter(c => {
    const p = participationMap.get(c.id);
    return p && !p.is_completed;
  });
  const myCompletedChallenges = challenges.filter(c => participationMap.get(c.id)?.is_completed);
  const availableChallenges = challenges.filter(c => !participationMap.has(c.id));

  const activeFlash = flashChallenges?.[0];
  const activeDuels = duels?.filter(d => ['active', 'pending'].includes(d.status)) || [];
  const activeEvent = events?.[0];

  // Contagem de alertas
  const alertCount = (activeFlash ? 1 : 0) + (activeEvent ? 1 : 0);

  return (
    <div className="space-y-4 pb-24">
      {/* Hero Header Simplificado */}
      <SimpleHeader 
        activeChallenges={myActiveChallenges.length}
        completedChallenges={myCompletedChallenges.length}
        alertCount={alertCount}
        flashChallenge={activeFlash}
        seasonalEvent={activeEvent}
      />

      {/* Main Navigation Tabs - SIMPLIFICADO (3 abas) */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl h-12">
          <TabsTrigger value="desafios" className="flex flex-col items-center gap-0.5 rounded-lg data-[state=active]:bg-background">
            <Target className="w-4 h-4" />
            <span className="text-[10px]">Desafios</span>
          </TabsTrigger>
          <TabsTrigger value="duelos" className="flex flex-col items-center gap-0.5 rounded-lg data-[state=active]:bg-background relative">
            <Swords className="w-4 h-4" />
            <span className="text-[10px]">Duelos</span>
            {activeDuels.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {activeDuels.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="times" className="flex flex-col items-center gap-0.5 rounded-lg data-[state=active]:bg-background">
            <Users className="w-4 h-4" />
            <span className="text-[10px]">Times</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB: DESAFIOS */}
        <TabsContent value="desafios" className="mt-4 space-y-4">
          {/* Header com botão admin */}
          {isAdmin && (
            <div className="flex justify-end">
              <Button 
                size="sm" 
                onClick={() => setShowCreateChallengeModal(true)}
                className="gap-1 bg-primary"
              >
                <Plus className="w-4 h-4" />
                Criar Desafio
              </Button>
            </div>
          )}

          <Tabs value={challengeTab} onValueChange={setChallengeTab}>
            <TabsList className="grid w-full grid-cols-3 h-10">
              <TabsTrigger value="ativos" className="text-xs">
                🎯 Ativos ({myActiveChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="novos" className="text-xs">
                ✨ Novos ({availableChallenges.length})
              </TabsTrigger>
              <TabsTrigger value="completos" className="text-xs">
                ✅ Completos ({myCompletedChallenges.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ativos" className="mt-4">
              {myActiveChallenges.length > 0 ? (
                <div className="space-y-3">
                  {myActiveChallenges.map((c, i) => (
                    <ChallengeCard key={c.id} challenge={c} participation={participationMap.get(c.id)} index={i} userId={userId} />
                  ))}
                </div>
              ) : (
                <EmptyState icon="🎯" title="Nenhum desafio ativo" description="Comece um novo desafio!" action={() => setChallengeTab('novos')} />
              )}
            </TabsContent>

            <TabsContent value="novos" className="mt-4">
              {availableChallenges.length > 0 ? (
                <div className="space-y-3">
                  {availableChallenges.map((c, i) => (
                    <ChallengeCard key={c.id} challenge={c} index={i} userId={userId} isAvailable />
                  ))}
                </div>
              ) : (
                <EmptyState icon="🎉" title="Você está em todos!" description="Parabéns por participar de todos os desafios" />
              )}
            </TabsContent>

            <TabsContent value="completos" className="mt-4">
              {myCompletedChallenges.length > 0 ? (
                <div className="space-y-3">
                  {myCompletedChallenges.map((c, i) => (
                    <ChallengeCard key={c.id} challenge={c} participation={participationMap.get(c.id)} index={i} userId={userId} isCompleted />
                  ))}
                </div>
              ) : (
                <EmptyState icon="🏆" title="Nenhum completado ainda" description="Complete seus desafios ativos!" />
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* TAB: DUELOS */}
        <TabsContent value="duelos" className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Swords className="w-5 h-5 text-purple-500" />
              Duelos 1v1
            </h2>
            <Button size="sm" onClick={() => setShowDuelModal(true)} className="gap-1 bg-purple-500 hover:bg-purple-600">
              <Plus className="w-4 h-4" />
              Desafiar
            </Button>
          </div>

          {activeDuels.length > 0 ? (
            <div className="space-y-3">
              {activeDuels.map(duel => (
                <DuelCard key={duel.id} duel={duel} currentUserId={userId!} />
              ))}
            </div>
          ) : (
            <EmptyState 
              icon="⚔️" 
              title="Nenhum duelo ativo" 
              description="Desafie um amigo para uma competição 1v1!"
              action={() => setShowDuelModal(true)}
              actionLabel="Criar Duelo"
            />
          )}

          {/* Histórico de Duelos */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Como funciona</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: '🎯', text: 'Escolha o tipo' },
                { icon: '👤', text: 'Desafie alguém' },
                { icon: '🏆', text: 'Vença e ganhe XP' },
              ].map((step, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-muted/30">
                  <span className="text-2xl">{step.icon}</span>
                  <p className="text-xs mt-1 text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* TAB: TIMES */}
        <TabsContent value="times" className="mt-4 space-y-4">
          {/* Se tem time selecionado, mostra detalhes */}
          {selectedTeam ? (
            <TeamDetailView 
              team={selectedTeam} 
              currentUserId={userId!}
              onBack={() => setSelectedTeam(null)}
            />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Meus Times
                </h2>
                <Button size="sm" onClick={() => setShowTeamModal(true)} className="gap-1 bg-blue-500 hover:bg-blue-600">
                  <Plus className="w-4 h-4" />
                  Criar Time
                </Button>
              </div>

              {(teams?.length || 0) > 0 ? (
                <div className="space-y-3">
                  {teams?.map(team => (
                    <div 
                      key={team.id} 
                      onClick={() => setSelectedTeam(team)}
                      className="cursor-pointer"
                    >
                      <TeamCard team={team} currentUserId={userId!} />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  icon="👥" 
                  title="Você não está em nenhum time" 
                  description="Crie um time ou entre em um existente!"
                  action={() => setShowTeamModal(true)}
                  actionLabel="Criar Time"
                />
              )}

              {/* Benefícios de Times */}
              <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <h3 className="font-semibold mb-2">🎯 Por que criar um time?</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Batalhas Time vs Time</li>
                  <li>• Chat exclusivo do time</li>
                  <li>• Desafios coletivos</li>
                  <li>• Recompensas compartilhadas</li>
                </ul>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateDuelModal open={showDuelModal} onOpenChange={setShowDuelModal} />
      <CreateTeamModal open={showTeamModal} onOpenChange={setShowTeamModal} />
      {isAdmin && (
        <CreateChallengeModal 
          open={showCreateChallengeModal} 
          onOpenChange={setShowCreateChallengeModal} 
        />
      )}
    </div>
  );
};

// =====================================================
// SIMPLE HEADER (com alertas compactos)
// =====================================================
interface SimpleHeaderProps {
  activeChallenges: number;
  completedChallenges: number;
  alertCount: number;
  flashChallenge?: any;
  seasonalEvent?: any;
}

const SimpleHeader: React.FC<SimpleHeaderProps> = ({ 
  activeChallenges, 
  completedChallenges,
  alertCount,
  flashChallenge,
  seasonalEvent
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-primary/20 via-background to-purple-500/10 border border-primary/20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Arena de Desafios
          </h1>
          <p className="text-muted-foreground text-sm">
            {activeChallenges} ativos • {completedChallenges} completados
          </p>
        </div>
        
        {/* Alertas Compactos (sino) */}
        {alertCount > 0 && (
          <CompactAlerts 
            flashChallenge={flashChallenge}
            seasonalEvent={seasonalEvent}
          />
        )}
      </div>

      {/* Stats Row Simplificado */}
      <div className="flex gap-3 mt-3">
        <StatBadge icon={<Target className="w-4 h-4 text-blue-500" />} value={activeChallenges} label="Ativos" />
        <StatBadge icon={<Flame className="w-4 h-4 text-orange-500" />} value={completedChallenges} label="Completos" />
        <StatBadge icon={<Zap className="w-4 h-4 text-yellow-500" />} value={completedChallenges * 50} label="XP Total" />
      </div>
    </div>
  );
};

const StatBadge: React.FC<{ icon: React.ReactNode; value: number | string; label: string }> = ({ icon, value, label }) => (
  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50">
    {icon}
    <div>
      <p className="font-bold text-sm">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  </div>
);

// =====================================================
// CHALLENGE CARD
// =====================================================
interface ChallengeCardProps {
  challenge: any;
  participation?: any;
  index: number;
  userId?: string;
  isAvailable?: boolean;
  isCompleted?: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({
  challenge, participation, index, userId, isAvailable, isCompleted
}) => {
  const [isJoining, setIsJoining] = useState(false);
  const [localProgress, setLocalProgress] = useState(participation?.progress || 0);

  const category = CATEGORY_CONFIG[challenge.challenge_type] || CATEGORY_CONFIG.exercicio;
  const target = challenge.daily_log_target || 100;
  const progress = participation?.progress || localProgress;
  const progressPercent = Math.min(100, Math.round((progress / target) * 100));

  const handleJoin = async () => {
    if (!userId) return;
    setIsJoining(true);
    try {
      await supabase.from('challenge_participations').upsert({
        user_id: userId,
        challenge_id: challenge.id,
        progress: 0,
        is_completed: false,
        started_at: new Date().toISOString(),
      }, { onConflict: 'user_id,challenge_id' });
      window.location.reload();
    } catch (error) {
      console.error('Erro ao participar do desafio:', error);
      // Toast não disponível neste componente, mas o erro é logado
    } finally {
      setIsJoining(false);
    }
  };

  const handleUpdate = async (amount: number) => {
    if (!userId || !participation) return;
    const newProgress = Math.min(progress + amount, target);
    setLocalProgress(newProgress);
    await supabase.from('challenge_participations').update({
      progress: newProgress,
      is_completed: newProgress >= target,
    }).eq('id', participation.id);
  };

  return (
    <motion.div
      className={cn(
        "rounded-2xl bg-card border overflow-hidden",
        isCompleted && "border-green-500/30 bg-green-500/5"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-xl", `bg-gradient-to-br ${category.color}`)}>
            {challenge.badge_icon || category.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold line-clamp-1">{challenge.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{challenge.description}</p>
          </div>
          {isCompleted && <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full">✓</span>}
        </div>

        {participation && !isAvailable && (
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{progress}/{target} {challenge.daily_log_unit || 'un'}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", isCompleted ? "bg-green-500" : `bg-gradient-to-r ${category.color}`)}
                animate={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="px-2 py-1 text-xs bg-muted rounded-full">{challenge.duration_days || 7} dias</span>
          <span className="px-2 py-1 text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full">⚡ {challenge.points_reward || 100} pts</span>
        </div>

        <div className="flex gap-2">
          {isAvailable ? (
            <Button className={cn("flex-1", `bg-gradient-to-r ${category.color}`)} onClick={handleJoin} disabled={isJoining}>
              {isJoining ? "..." : "Começar"}
            </Button>
          ) : isCompleted ? (
            <Button variant="outline" className="flex-1">🏆 Ver Conquista</Button>
          ) : (
            <>
              {getQuickAddOptions(challenge.challenge_type).map(amt => (
                <Button key={amt} variant="outline" size="sm" onClick={() => handleUpdate(amt)}>+{amt}</Button>
              ))}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// =====================================================
// EMPTY STATE
// =====================================================
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: () => void;
  actionLabel?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, actionLabel }) => (
  <div className="text-center py-12 px-4 rounded-2xl bg-muted/30 border border-dashed">
    <span className="text-5xl">{icon}</span>
    <h3 className="font-semibold mt-3 mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    {action && <Button onClick={action}>{actionLabel || 'Começar'}</Button>}
  </div>
);

// =====================================================
// HELPERS
// =====================================================
function getQuickAddOptions(type: string): number[] {
  const options: Record<string, number[]> = {
    hidratacao: [250, 500],
    passos: [1000, 2500],
    exercicio: [10, 30],
  };
  return options[type] || [1, 5];
}

export default ChallengesDashboard;
