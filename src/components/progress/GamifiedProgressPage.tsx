import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useGoogleFitData } from '@/hooks/useGoogleFitData';
import { useGamificationUnified } from '@/hooks/useGamificationUnified';
import { useSocialRanking } from '@/hooks/useSocialRanking';
import { useUserGender } from '@/hooks/useUserGender';
import { supabase } from '@/integrations/supabase/client';
import { SocialRankingCard } from './SocialRankingCard';
import { AchievementUnlocked } from './AchievementUnlocked';
import { DailyRewardChest } from './DailyRewardChest';
import { 
  Flame, Trophy, Target, Zap, Crown,
  TrendingUp, TrendingDown, Footprints, Moon,
  Sparkles, Gift, ChevronRight,
  Award, Swords, RefreshCw
} from 'lucide-react';

// ============================================================================
// CONSTANTES
// ============================================================================

const LEVEL_NAMES_MASC: Record<number, string> = {
  1: 'Iniciante', 2: 'Aprendiz', 3: 'Guerreiro', 4: 'Veterano',
  5: 'Elite', 6: 'Campeão', 7: 'Mestre', 8: 'Grão-Mestre',
  9: 'Lenda', 10: 'Imortal', 11: 'Divino', 12: 'Transcendente'
};

const LEVEL_NAMES_FEM: Record<number, string> = {
  1: 'Iniciante', 2: 'Aprendiz', 3: 'Guerreira', 4: 'Veterana',
  5: 'Elite', 6: 'Campeã', 7: 'Mestra', 8: 'Grã-Mestra',
  9: 'Lenda', 10: 'Imortal', 11: 'Divina', 12: 'Transcendente'
};

const LEVEL_COLORS: Record<number, string> = {
  1: 'from-slate-400 to-slate-500', 2: 'from-emerald-400 to-emerald-600',
  3: 'from-blue-400 to-blue-600', 4: 'from-purple-400 to-purple-600',
  5: 'from-amber-400 to-amber-600', 6: 'from-rose-400 to-rose-600',
  7: 'from-cyan-400 to-cyan-600', 8: 'from-fuchsia-400 to-fuchsia-600',
  9: 'from-orange-400 to-red-600', 10: 'from-yellow-300 to-yellow-500',
  11: 'from-indigo-400 to-purple-600', 12: 'from-pink-400 to-rose-600'
};

const MOTIVATIONAL_PHRASES = [
  'Hoje é dia de superar limites!',
  'Cada passo conta. Bora!',
  'Você está mais forte que ontem!',
  'A consistência vence o talento.',
  'Seu corpo agradece cada movimento.',
  'Foco no progresso, não na perfeição.'
];

// ============================================================================
// TIPOS
// ============================================================================

interface DailyMission {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  target: number;
  current: number;
  xp: number;
  completed: boolean;
  color: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const GamifiedProgressPage: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [user, setUser] = useState<any>(null);
  const [unlockedAchievement, setUnlockedAchievement] = useState<any>(null);
  const [canClaimChest, setCanClaimChest] = useState(true);
  
  const { data: fitData, isConnected, syncData, loading: fitLoading } = useGoogleFitData();
  const { gamificationData, isLoading: gamLoading } = useGamificationUnified(userId || undefined);
  const { rankingData } = useSocialRanking(userId || undefined);
  const { gender, loading: genderLoading } = useUserGender(user);
  
  // Determinar se é feminino (memoizado para evitar recálculos)
  const isFeminine = useMemo(() => {
    return gender === 'feminino' || gender === 'female' || gender === 'f';
  }, [gender]);
  
  // Selecionar nomes de nível baseado no gênero (memoizado)
  const LEVEL_NAMES = useMemo(() => {
    return isFeminine ? LEVEL_NAMES_FEM : LEVEL_NAMES_MASC;
  }, [isFeminine]);

  // Verificar se já resgatou o baú hoje
  useEffect(() => {
    const lastClaim = localStorage.getItem('daily_chest_claimed');
    if (lastClaim) {
      const lastDate = new Date(lastClaim).toDateString();
      const today = new Date().toDateString();
      setCanClaimChest(lastDate !== today);
    }
  }, []);

  const handleChestClaim = (reward: any) => {
    localStorage.setItem('daily_chest_claimed', new Date().toISOString());
    setCanClaimChest(false);
    // Aqui poderia salvar no Supabase também
    console.log('Recompensa recebida:', reward);
  };

  // Buscar usuário - APENAS UMA VEZ no mount
  useEffect(() => {
    let isMounted = true;
    
    const getUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!isMounted || !authUser) return;
        
        setUserId(authUser.id);
        setUser(authUser);
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', authUser.id)
          .single();
        
        if (isMounted && profile?.full_name) {
          setUserName(profile.full_name.split(' ')[0]);
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };
    
    getUser();
    
    return () => {
      isMounted = false;
    };
  }, []); // Removido isFeminine da dependência - causava loop infinito
  
  // Atualizar nome padrão quando gênero mudar (separado do fetch)
  useEffect(() => {
    if (!userName && !genderLoading) {
      setUserName(isFeminine ? 'Campeã' : 'Campeão');
    }
  }, [isFeminine, genderLoading, userName]);

  // Dados de hoje
  const todayData = useMemo(() => {
    if (!fitData?.length) return null;
    const today = new Date().toISOString().split('T')[0];
    return fitData.find(d => d.date === today) || fitData[fitData.length - 1];
  }, [fitData]);

  // Dados de ontem para comparação
  const yesterdayData = useMemo(() => {
    if (!fitData?.length) return null;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    return fitData.find(d => d.date === yesterday);
  }, [fitData]);

  // Calcular streak real
  const streak = gamificationData?.currentStreak || 0;
  const level = gamificationData?.currentLevel || 1;
  const currentXP = gamificationData?.currentXP || 0;
  const xpToNext = gamificationData?.xpToNextLevel || 1000;
  const totalXP = gamificationData?.totalXP || 0;

  // Missões diárias baseadas em dados reais (adaptadas por gênero)
  const dailyMissions: DailyMission[] = useMemo(() => {
    const steps = todayData?.steps || 0;
    const calories = todayData?.calories || 0;
    const sleep = todayData?.sleep_hours || 0;
    const activeMin = todayData?.active_minutes || 0;

    return [
      {
        id: 'steps',
        title: 'Caminhante',
        description: 'Caminhe 5.000 passos',
        icon: Footprints,
        target: 5000,
        current: steps,
        xp: 50,
        completed: steps >= 5000,
        color: 'text-emerald-500'
      },
      {
        id: 'calories',
        title: isFeminine ? 'Queimadora' : 'Queimador',
        description: 'Queime 300 kcal ativas',
        icon: Flame,
        target: 300,
        current: calories,
        xp: 40,
        completed: calories >= 300,
        color: 'text-orange-500'
      },
      {
        id: 'sleep',
        title: isFeminine ? 'Dorminhoca' : 'Dorminhoco',
        description: 'Durma 7+ horas',
        icon: Moon,
        target: 7,
        current: sleep,
        xp: 30,
        completed: sleep >= 7,
        color: 'text-indigo-500'
      },
      {
        id: 'active',
        title: isFeminine ? 'Ativa' : 'Ativo',
        description: '30 min de atividade',
        icon: Zap,
        target: 30,
        current: activeMin,
        xp: 35,
        completed: activeMin >= 30,
        color: 'text-yellow-500'
      }
    ];
  }, [todayData, isFeminine]);

  const completedMissions = dailyMissions.filter(m => m.completed).length;
  const totalMissionXP = dailyMissions.reduce((sum, m) => sum + (m.completed ? m.xp : 0), 0);

  // Batalha do dia: Hoje vs Ontem
  const battleData = useMemo(() => {
    const todaySteps = todayData?.steps || 0;
    const yesterdaySteps = yesterdayData?.steps || 0;
    const diff = todaySteps - yesterdaySteps;
    const winning = diff >= 0;
    return { todaySteps, yesterdaySteps, diff, winning };
  }, [todayData, yesterdayData]);

  // Saudação baseada na hora (memoizada sem dependências - calcula uma vez)
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return '🌅 Bom dia';
    if (hour < 18) return '☀️ Boa tarde';
    return '🌙 Boa noite';
  }, []);

  // Frase motivacional (memoizada - calcula uma vez por render)
  const motivationalPhrase = useMemo(() => {
    const phrases = [
      'Hoje é dia de superar limites!',
      'Cada passo conta. Bora!',
      'Você está mais forte que ontem!',
      'A consistência vence o talento.',
      'Seu corpo agradece cada movimento.',
      'Foco no progresso, não na perfeição.'
    ];
    // Usar data do dia para ter frase consistente durante o dia
    const dayIndex = new Date().getDate() % phrases.length;
    return phrases[dayIndex];
  }, []);

  // Loading state
  if (fitLoading || gamLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-24">
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        
        {/* Header Motivacional */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <h1 className="text-2xl font-bold">
            {greeting}, <span className="text-primary">{userName}</span>!
          </h1>
          <p className="text-muted-foreground text-sm">{motivationalPhrase}</p>
        </motion.div>

        {/* Card de Nível e XP */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className={cn("p-4 bg-gradient-to-r text-white", LEVEL_COLORS[Math.min(level, 12)])}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs opacity-80">Nível {level}</p>
                    <p className="font-bold text-lg">{LEVEL_NAMES[Math.min(level, 12)] || 'Lenda'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{totalXP.toLocaleString()}</p>
                  <p className="text-xs opacity-80">XP Total</p>
                </div>
              </div>
              
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Próximo nível</span>
                  <span>{currentXP}/{xpToNext} XP</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentXP / xpToNext) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Streak Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={cn(
            "border-0 shadow-lg overflow-hidden",
            streak >= 7 ? "bg-gradient-to-r from-orange-500/10 to-red-500/10" : ""
          )}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={streak >= 3 ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    className={cn(
                      "p-2.5 rounded-xl",
                      streak >= 7 ? "bg-gradient-to-br from-orange-500 to-red-500" : "bg-muted"
                    )}
                  >
                    <Flame className={cn("w-6 h-6", streak >= 7 ? "text-white" : "text-orange-500")} />
                  </motion.div>
                  <div>
                    <p className="text-sm text-muted-foreground">Sequência</p>
                    <p className="text-2xl font-bold">{streak} dias</p>
                  </div>
                </div>
                
                {/* Streak visual */}
                <div className="flex gap-1">
                  {[...Array(7)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className={cn(
                        "w-3 h-3 rounded-full",
                        i < streak ? "bg-orange-500" : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
              
              {streak >= 5 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-orange-600 mt-2 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  {streak >= 7 
                    ? "🔥 Você está em chamas! Sequência épica!" 
                    : `Mais ${7 - streak} dias para o badge '${isFeminine ? 'Fênix' : 'Fênix'}'!`}
                </motion.p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Baú Diário */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          <DailyRewardChest
            canClaim={canClaimChest}
            streak={streak}
            onClaim={handleChestClaim}
          />
        </motion.div>

        {/* Batalha do Dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Swords className="w-5 h-5 text-primary" />
                <span className="font-semibold">Batalha do Dia</span>
                <Badge variant="outline" className="ml-auto">
                  {battleData.winning ? '🏆 Vencendo!' : '⚔️ Lutando'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 text-center p-3 rounded-xl bg-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">HOJE</p>
                  <p className="text-2xl font-bold text-primary">
                    {battleData.todaySteps.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">passos</p>
                </div>
                
                <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-muted-foreground">VS</span>
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium mt-1",
                      battleData.winning ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {battleData.winning ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(battleData.diff).toLocaleString()}
                  </motion.div>
                </div>
                
                <div className="flex-1 text-center p-3 rounded-xl bg-muted">
                  <p className="text-xs text-muted-foreground mb-1">ONTEM</p>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {battleData.yesterdaySteps.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">passos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Missões Diárias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Missões do Dia</span>
                </div>
                <Badge className={cn(
                  completedMissions === dailyMissions.length 
                    ? "bg-emerald-500" 
                    : "bg-primary"
                )}>
                  {completedMissions}/{dailyMissions.length}
                </Badge>
              </div>

              <div className="space-y-3">
                {dailyMissions.map((mission, index) => (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={cn(
                      "p-3 rounded-xl border transition-all",
                      mission.completed 
                        ? "bg-emerald-500/10 border-emerald-500/30" 
                        : "bg-card border-border"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        mission.completed ? "bg-emerald-500/20" : "bg-muted"
                      )}>
                        <mission.icon className={cn(
                          "w-5 h-5",
                          mission.completed ? "text-emerald-500" : mission.color
                        )} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "font-medium text-sm",
                            mission.completed && "line-through text-muted-foreground"
                          )}>
                            {mission.title}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            +{mission.xp} XP
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{mission.description}</p>
                        
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{mission.current.toLocaleString()}/{mission.target.toLocaleString()}</span>
                            <span>{Math.min(100, Math.round((mission.current / mission.target) * 100))}%</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (mission.current / mission.target) * 100)} 
                            className="h-1.5"
                          />
                        </div>
                      </div>
                      
                      {mission.completed && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-emerald-500"
                        >
                          <Award className="w-5 h-5" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {completedMissions === dailyMissions.length && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-center"
                >
                  <p className="text-sm font-medium text-emerald-600">
                    🎉 Todas as missões completas! +{totalMissionXP} XP
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Conquistas Recentes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="font-semibold">Conquistas</span>
                </div>
                <Button variant="ghost" size="sm" className="text-xs">
                  Ver todas <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2">
                {gamificationData?.badges?.slice(0, 4).map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className={cn(
                      "flex-shrink-0 p-3 rounded-xl text-center min-w-[80px]",
                      badge.earned 
                        ? "bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/30" 
                        : "bg-muted/50 opacity-50"
                    )}
                  >
                    <div className="text-2xl mb-1">
                      {badge.icon === 'target' && '🎯'}
                      {badge.icon === 'flame' && '🔥'}
                      {badge.icon === 'crown' && '👑'}
                      {badge.icon === 'gem' && '💎'}
                    </div>
                    <p className="text-xs font-medium truncate">{badge.name}</p>
                    {!badge.earned && badge.progress !== undefined && (
                      <p className="text-[10px] text-muted-foreground">
                        {badge.progress}/{badge.maxProgress}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botão de Sincronizar */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              variant="outline"
              className="w-full"
              onClick={() => syncData()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sincronizar Google Fit
            </Button>
          </motion.div>
        )}

        {/* CTA para conectar Google Fit */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <h3 className="font-bold mb-1">Desbloqueie todo o potencial!</h3>
                <p className="text-sm opacity-80 mb-3">
                  Conecte o Google Fit para missões automáticas e dados reais
                </p>
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => window.location.href = '/google-fit-oauth'}
                >
                  Conectar Google Fit
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Ranking Social */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <SocialRankingCard 
            users={rankingData}
            currentUserId={userId || undefined}
            title="Ranking Semanal"
          />
        </motion.div>

        {/* Dica do Dia */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Gift className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium text-sm mb-1">💡 Dica do Dia</p>
                  <p className="text-xs text-muted-foreground">
                    Complete todas as missões diárias por 7 dias seguidos para desbloquear 
                    o badge exclusivo "{isFeminine ? 'Guerreira Consistente' : 'Guerreiro Consistente'}" e ganhar 500 XP bônus!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      {/* Modal de Conquista Desbloqueada */}
      <AnimatePresence>
        {unlockedAchievement && (
          <AchievementUnlocked
            achievement={unlockedAchievement}
            onClose={() => setUnlockedAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamifiedProgressPage;
