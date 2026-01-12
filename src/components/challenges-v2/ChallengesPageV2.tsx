// =====================================================
// CHALLENGES PAGE V2 - PÁGINA PRINCIPAL DE DESAFIOS
// =====================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Users, Trophy, Zap, 
  Filter, Search, Plus, Swords 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

// Hooks
import {
  useIndividualChallenges,
  useMyParticipations,
  useFlashChallenges,
  useMyDuels,
  useUserLeague,
  useMyTeams,
  useActiveEvents,
} from '@/hooks/challenges/useChallengesV2';

// Components
import { ChallengesDashboard } from './ChallengesDashboard';
import { IndividualChallengeCard } from './individual/IndividualChallengeCard';
import { FlashChallengeBanner } from './flash/FlashChallengeBanner';
import { DuelCard } from './duels/DuelCard';
import { LeagueCard } from './leagues/LeagueCard';
import { LeagueBadge } from './leagues/LeagueBadge';
import { TeamCard } from './teams/TeamCard';
import { SeasonalEventBanner } from './events/SeasonalEventBanner';

type TabValue = 'meus' | 'explorar' | 'ranking' | 'times';

export const ChallengesPageV2: React.FC = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const [activeTab, setActiveTab] = useState<TabValue>('meus');
  const [searchTerm, setSearchTerm] = useState('');

  // Data fetching
  const { data: challenges, isLoading: loadingChallenges } = useIndividualChallenges(userId);
  const { data: participations } = useMyParticipations(userId);
  const { data: flashChallenges } = useFlashChallenges();
  const { data: duels } = useMyDuels(userId);
  const { data: league } = useUserLeague(userId);
  const { data: teams } = useMyTeams(userId);
  const { data: events } = useActiveEvents();

  // Filter challenges
  const filteredChallenges = challenges?.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get participation for a challenge
  const getParticipation = (challengeId: string) => 
    participations?.find(p => p.challenge_id === challengeId);

  // Stats
  const activeCount = participations?.filter(p => !p.is_completed).length || 0;
  const completedCount = participations?.filter(p => p.is_completed).length || 0;
  const totalPoints = participations?.reduce((acc, p) => 
    acc + (p.is_completed ? (p.challenge?.xp_reward || 0) : 0), 0) || 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold">Desafios</h1>
            <p className="text-sm text-muted-foreground">
              {activeCount} ativos • {completedCount} completados
            </p>
          </div>
          {league && <LeagueBadge league={league} />}
        </div>

        {/* Stats Bar */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          <StatBadge icon={<Target className="w-4 h-4" />} value={activeCount} label="Ativos" color="blue" />
          <StatBadge icon={<Trophy className="w-4 h-4" />} value={completedCount} label="Completos" color="green" />
          <StatBadge icon={<Zap className="w-4 h-4" />} value={totalPoints} label="XP Total" color="yellow" />
          <StatBadge icon={<Swords className="w-4 h-4" />} value={duels?.length || 0} label="Duelos" color="purple" />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="px-4 pt-4">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="meus" className="gap-1">
            <Target className="w-4 h-4" />
            Meus
          </TabsTrigger>
          <TabsTrigger value="explorar" className="gap-1">
            <Search className="w-4 h-4" />
            Explorar
          </TabsTrigger>
          <TabsTrigger value="ranking" className="gap-1">
            <Trophy className="w-4 h-4" />
            Ranking
          </TabsTrigger>
          <TabsTrigger value="times" className="gap-1">
            <Users className="w-4 h-4" />
            Times
          </TabsTrigger>
        </TabsList>

        {/* Tab: Meus Desafios */}
        <TabsContent value="meus" className="space-y-6 mt-0">
          <ChallengesDashboard />
        </TabsContent>

        {/* Tab: Explorar */}
        <TabsContent value="explorar" className="space-y-4 mt-0">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar desafios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Flash Challenge */}
          {flashChallenges?.[0] && (
            <FlashChallengeBanner challenge={flashChallenges[0]} />
          )}

          {/* Event Banner */}
          {events?.[0] && (
            <SeasonalEventBanner event={events[0]} />
          )}

          {/* Challenge List */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Target className="w-4 h-4" />
              Desafios Disponíveis
            </h3>
            
            {loadingChallenges ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-40 bg-muted/50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChallenges?.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <IndividualChallengeCard
                      challenge={challenge}
                      participation={getParticipation(challenge.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Ranking */}
        <TabsContent value="ranking" className="space-y-4 mt-0">
          {league && userId && (
            <LeagueCard 
              userLeague={league} 
              currentUserId={userId}
            />
          )}

          {/* Duels Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Swords className="w-4 h-4" />
                Duelos
              </h3>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="w-4 h-4" />
                Novo Duelo
              </Button>
            </div>

            {duels && duels.length > 0 ? (
              duels.map(duel => (
                <DuelCard 
                  key={duel.id} 
                  duel={duel} 
                  currentUserId={userId!} 
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Swords className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum duelo ativo</p>
                <p className="text-sm">Desafie um amigo!</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Tab: Times */}
        <TabsContent value="times" className="space-y-4 mt-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Seus Times</h3>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Criar Time
            </Button>
          </div>

          {teams && teams.length > 0 ? (
            teams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                currentUserId={userId!}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Você não está em nenhum time</p>
              <p className="text-sm mb-4">Crie ou entre em um time para desafios coletivos!</p>
              <Button>Criar Meu Time</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Stat Badge Component
interface StatBadgeProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

const StatBadge: React.FC<StatBadgeProps> = ({ icon, value, label, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    green: 'bg-green-500/10 text-green-500 border-green-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  };

  return (
    <div className={cn(
      "flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0",
      colorClasses[color]
    )}>
      {icon}
      <div>
        <p className="font-bold text-sm">{value.toLocaleString()}</p>
        <p className="text-xs opacity-70">{label}</p>
      </div>
    </div>
  );
};

export default ChallengesPageV2;
