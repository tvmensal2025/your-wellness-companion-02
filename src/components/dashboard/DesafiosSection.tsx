// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Users, Calendar, Target, Dumbbell, Droplets, Brain, Apple, Moon, Scale, Timer, ArrowLeft, Star, Zap, CheckCircle, Plus, Flame, Crown, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { UpdateDesafioProgressModal } from '@/components/gamification/UpdateDesafioProgressModal';
import { User } from '@supabase/supabase-js';
import { VisualEffectsManager } from '@/components/gamification/VisualEffectsManager';
import { useCelebrationEffects } from '@/hooks/useCelebrationEffects';
interface Desafio {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  points_reward: number;
  badge_icon: string;
  badge_name: string;
  instructions: string;
  tips: string[];
  is_active: boolean;
  is_featured: boolean;
  is_group_challenge: boolean;
  daily_log_target: number;
  daily_log_unit: string;
  user_participation?: {
    id: string;
    progress: number;
    is_completed: boolean;
    started_at: string;
  };
  participants_count?: number;
  total_participants?: number;
}
interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  progress: number;
  points: number;
  position: number;
  badge?: string;
  is_current_user?: boolean;
}
interface DesafiosSectionProps {
  user: User | null;
}
const difficultyColors = {
  facil: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 dark:from-emerald-900 dark:to-green-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
  medio: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 dark:from-amber-900 dark:to-orange-900 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
  dificil: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900 dark:to-pink-900 dark:text-red-300 border border-red-200 dark:border-red-700'
};
const difficultyLabels = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil'
};

// Dados de exemplo para demonstração
const desafiosExemplo: Desafio[] = [{
  id: 'demo-1',
  title: 'Beber 2L de Água Diariamente',
  description: 'Mantenha-se hidratado bebendo pelo menos 2 litros de água por dia',
  category: 'Hidratação',
  difficulty: 'facil',
  duration_days: 30,
  points_reward: 50,
  badge_icon: '💧',
  badge_name: 'Hidratação Master',
  instructions: 'Beba água regularmente ao longo do dia. Use um aplicativo ou marque em uma garrafa para acompanhar.',
  tips: ['Tenha sempre uma garrafa de água por perto', 'Beba um copo ao acordar', 'Use apps para lembrar'],
  is_active: true,
  is_featured: true,
  is_group_challenge: false,
  daily_log_target: 2000,
  daily_log_unit: 'ml',
  user_participation: {
    id: 'part-1',
    progress: 1200,
    is_completed: false,
    started_at: new Date().toISOString()
  }
}, {
  id: 'demo-2',
  title: 'Caminhar 8000 Passos',
  description: 'Dê pelo menos 8000 passos todos os dias para manter-se ativo',
  category: 'Atividade Física',
  difficulty: 'medio',
  duration_days: 30,
  points_reward: 75,
  badge_icon: '🚶‍♂️',
  badge_name: 'Caminhador Dedicado',
  instructions: 'Use um contador de passos ou app no celular. Caminhe durante as ligações, use escadas.',
  tips: ['Estacione mais longe', 'Use escadas', 'Caminhe durante ligações'],
  is_active: true,
  is_featured: true,
  is_group_challenge: false,
  daily_log_target: 8000,
  daily_log_unit: 'passos',
  user_participation: {
    id: 'part-2',
    progress: 5500,
    is_completed: false,
    started_at: new Date().toISOString()
  }
}, {
  id: 'demo-3',
  title: 'Exercitar-se 30 Minutos',
  description: 'Faça pelo menos 30 minutos de exercício físico moderado',
  category: 'Atividade Física',
  difficulty: 'dificil',
  duration_days: 30,
  points_reward: 120,
  badge_icon: '💪',
  badge_name: 'Atleta Dedicado',
  instructions: 'Pode ser academia, corrida, natação, dança ou esportes. O importante é mover o corpo.',
  tips: ['Escolha atividade prazerosa', 'Comece gradualmente', 'Varie os exercícios'],
  is_active: true,
  is_featured: true,
  is_group_challenge: false,
  daily_log_target: 30,
  daily_log_unit: 'minutos',
  user_participation: {
    id: 'part-3',
    progress: 25,
    is_completed: false,
    started_at: new Date().toISOString()
  }
}, {
  id: 'demo-4',
  title: 'Meditar 10 Minutos',
  description: 'Pratique meditação ou mindfulness por 10 minutos diários',
  category: 'Bem-estar Mental',
  difficulty: 'facil',
  duration_days: 21,
  points_reward: 60,
  badge_icon: '🧘‍♀️',
  badge_name: 'Mente Zen',
  instructions: 'Use apps como Headspace, Calm ou pratique respiração profunda. Encontre um local tranquilo.',
  tips: ['Comece com 5 minutos', 'Use apps guiados', 'Pratique sempre no mesmo horário'],
  is_active: true,
  is_featured: false,
  is_group_challenge: false,
  daily_log_target: 10,
  daily_log_unit: 'minutos',
  user_participation: {
    id: 'part-4',
    progress: 10,
    is_completed: true,
    started_at: new Date().toISOString()
  }
}];

// Desafios Públicos/Comunitários
const desafiosPublicosExemplo: Desafio[] = [{
  id: 'publico-1',
  title: '💧 Hidratação em Grupo - Janeiro 2025',
  description: 'Desafio comunitário: Vamos todos beber 2.5L de água por dia durante todo janeiro!',
  category: 'Hidratação',
  difficulty: 'facil',
  duration_days: 31,
  points_reward: 150,
  badge_icon: '💧',
  badge_name: 'Hidratação Comunitária',
  instructions: 'Junte-se à comunidade e mantenha-se hidratado. Registre seu progresso diário!',
  tips: ['Beba um copo ao acordar', 'Use uma garrafa marcada', 'Apoie outros participantes'],
  is_active: true,
  is_featured: true,
  is_group_challenge: true,
  daily_log_target: 2500,
  daily_log_unit: 'ml',
  participants_count: 847,
  total_participants: 1000,
  user_participation: {
    id: 'pub-part-1',
    progress: 2100,
    is_completed: false,
    started_at: new Date().toISOString()
  }
}, {
  id: 'publico-2',
  title: '🚶‍♀️ Caminhada Matinal Coletiva',
  description: 'Desafio: 30 minutos de caminhada toda manhã. Vamos começar o dia com energia!',
  category: 'Atividade Física',
  difficulty: 'facil',
  duration_days: 21,
  points_reward: 200,
  badge_icon: '🚶‍♀️',
  badge_name: 'Caminhador Matinal',
  instructions: 'Caminhe 30 minutos todas as manhãs e compartilhe sua energia com a comunidade!',
  tips: ['Acorde 30min mais cedo', 'Convide um amigo', 'Ouça música ou podcast'],
  is_active: true,
  is_featured: true,
  is_group_challenge: true,
  daily_log_target: 30,
  daily_log_unit: 'minutos',
  participants_count: 623,
  total_participants: 800,
  user_participation: {
    id: 'pub-part-2',
    progress: 25,
    is_completed: false,
    started_at: new Date().toISOString()
  }
}, {
  id: 'publico-3',
  title: '💪 Guerreiros do Treino',
  description: 'Desafio hardcore: 1 hora de exercício intenso por dia. Apenas para guerreiros!',
  category: 'Atividade Física',
  difficulty: 'dificil',
  duration_days: 30,
  points_reward: 300,
  badge_icon: '💪',
  badge_name: 'Guerreiro Fitness',
  instructions: 'Treino intenso de 1 hora. Compartilhe seus resultados e motive outros guerreiros!',
  tips: ['Varie os exercícios', 'Respeite o descanso', 'Hidrate-se bem'],
  is_active: true,
  is_featured: true,
  is_group_challenge: true,
  daily_log_target: 60,
  daily_log_unit: 'minutos',
  participants_count: 234,
  total_participants: 500,
  user_participation: {
    id: 'pub-part-3',
    progress: 45,
    is_completed: false,
    started_at: new Date().toISOString()
  }
}];

// Dados do Ranking
const rankingExemplo: RankingUser[] = [{
  id: 'user-1',
  name: 'Ana Silva',
  avatar: '👩‍💼',
  progress: 95,
  points: 2847,
  position: 1,
  badge: '👑',
  is_current_user: false
}, {
  id: 'user-2',
  name: 'Carlos Santos',
  avatar: '👨‍💻',
  progress: 92,
  points: 2756,
  position: 2,
  badge: '🥈',
  is_current_user: false
}, {
  id: 'user-3',
  name: 'Maria Oliveira',
  avatar: '👩‍🔬',
  progress: 89,
  points: 2654,
  position: 3,
  badge: '🥉',
  is_current_user: false
}, {
  id: 'user-4',
  name: 'Você',
  avatar: '😊',
  progress: 86,
  points: 2543,
  position: 4,
  badge: '⭐',
  is_current_user: true
}, {
  id: 'user-5',
  name: 'João Pereira',
  avatar: '👨‍🎓',
  progress: 83,
  points: 2432,
  position: 5,
  badge: '🎯',
  is_current_user: false
}];
const DesafiosSection: React.FC<DesafiosSectionProps> = ({
  user
}) => {
  // Validador simples de UUID (v1–v5)
  const isValidUUID = (value: string | undefined | null): boolean => {
    if (!value || typeof value !== 'string') return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  };
  const [selectedDesafio, setSelectedDesafio] = useState<Desafio | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [desafiosPublicos, setDesafiosPublicos] = useState<Desafio[]>([]);
  const [rankingData, setRankingData] = useState<RankingUser[]>([]);
  const [selectedTab, setSelectedTab] = useState('individuais');
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const {
    toast
  } = useToast();
  const {
    triggerCelebration
  } = useCelebrationEffects();

  // Mapeia categorias de exibição para categorias válidas no banco
  const mapCategoryToDb = (label: string | undefined | null): string => {
    const normalized = (label || '').toLowerCase();
    if (normalized.includes('hidrata')) return 'hidratacao';
    if (normalized.includes('atividade') || normalized.includes('exerc')) return 'exercicio';
    if (normalized.includes('mente') || normalized.includes('medita') || normalized.includes('mind')) return 'mindfulness';
    if (normalized.includes('nutri')) return 'nutricao';
    if (normalized.includes('sono')) return 'sono';
    if (normalized.includes('medi') && !normalized.includes('medita')) return 'medicao';
    return 'especial';
  };

  // Garante que um desafio de demonstração exista no banco e retorna o UUID real
  // Se não puder criar no banco (RLS/403), retorna null para operar localmente
  const ensureRealChallenge = async (desafio: Desafio): Promise<string | null> => {
    if (isValidUUID(desafio.id)) return desafio.id;

    // Inserir desafio real no banco baseado nos dados do card
    const insertPayload = {
      title: desafio.title,
      description: desafio.description,
      challenge_type: mapCategoryToDb(desafio.category), // Usar challenge_type em vez de category
      difficulty: desafio.difficulty,
      duration_days: desafio.duration_days,
      points_reward: desafio.points_reward,
      badge_icon: desafio.badge_icon,
      badge_name: desafio.badge_name,
      instructions: desafio.instructions,
      tips: desafio.tips,
      is_active: true,
      is_featured: !!desafio.is_featured,
      is_group_challenge: !!desafio.is_group_challenge,
      daily_log_target: desafio.daily_log_target,
      daily_log_unit: desafio.daily_log_unit,
      daily_log_type: 'numeric' // Adicionar campo obrigatório
    } as const;

    const { data: created, error: insertError } = await supabase
      .from('challenges')
      .insert(insertPayload)
      .select()
      .single();

    if (insertError || !created?.id) {
      const message = String((insertError as any)?.message || '').toLowerCase();
      const code = (insertError as any)?.code;
      const status = (insertError as any)?.status;
      const rlsBlocked = code === '42501' || status === 403 || message.includes('row-level security') || message.includes('forbidden');
      console.warn('Falha ao criar desafio real no banco:', insertError);
      if (rlsBlocked) return null;
      throw new Error('Não foi possível criar o desafio real.');
    }

    const newId = created.id as string;

    // Atualizar arrays locais substituindo o id antigo pelo novo
    setDesafios(prev => prev.map(d => d.id === desafio.id ? { ...d, id: newId } : d));
    setDesafiosPublicos(prev => prev.map(d => d.id === desafio.id ? { ...d, id: newId } : d));

    return newId;
  };

  // Função utilitária para obter ou criar participação
  const getOrCreateParticipation = async (challengeId: string) => {
    // Verificar se já existe participação

    // Verificar se já existe participação
      const { data: existingParticipation, error: checkError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user?.id)
        .eq('challenge_id', challengeId)
        .maybeSingle();

      if (checkError) {
        throw new Error('Erro ao verificar participação: ' + checkError.message);
      }

      if (!existingParticipation) {
        // Participação não existe, criar uma nova
        const { data: newParticipation, error: insertError } = await supabase
          .from('challenge_participations')
          .insert({
            user_id: user?.id,
            challenge_id: challengeId,
            progress: 0,
            is_completed: false,
            started_at: new Date().toISOString()
          })
          .select()
          .single();
        if (insertError) {
          throw new Error('Erro ao criar participação: ' + insertError.message);
        }
        return newParticipation;
      }

      // Participação já existe
      return existingParticipation;
  };
  useEffect(() => {
    if (user?.id && !dataLoaded) {
      carregarDados();
    }
  }, [user?.id, dataLoaded]);
  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados dos desafios...');
      // Carregar desafios usando supabase client

      // 1. Carregar desafios individuais (não são de grupo)
      const {
        data: desafiosData,
        error: desafiosError
      } = await supabase.from('challenges').select(`
          *,
          challenge_participations(
            id,
            user_id,
            progress,
            is_completed,
            started_at
          )
        `).eq('is_active', true).eq('is_group_challenge', false);
      if (desafiosError) {
        console.error('Erro ao carregar desafios individuais:', desafiosError);
      }

      // 2. Carregar desafios públicos (de grupo)
      const {
        data: desafiosPublicosData,
        error: desafiosPublicosError
      } = await supabase.from('challenges').select(`
          *,
          challenge_participations(
            id,
            user_id,
            progress,
            is_completed,
            started_at
          )
        `).eq('is_active', true).eq('is_group_challenge', true);
      if (desafiosPublicosError) {
        console.error('Erro ao carregar desafios públicos:', desafiosPublicosError);
      }

      // 3. Carregar ranking real de usuários (agrega participações por usuário)
      const {
        data: participations,
        error: rankingError
      } = await supabase.from('challenge_participations').select(`
          user_id,
          progress,
          is_completed,
          challenges(points_reward)
        `);
      if (rankingError) {
        console.error('Erro ao carregar ranking:', rankingError);
      }

      // Agregar pontos por usuário com base no progresso (% * points_reward)
      const pointsByUser = new Map<string, { totalPoints: number; completedCount: number }>();
      (participations || []).forEach((p: any) => {
        const reward = p?.challenges?.points_reward ?? 0;
        const progress = typeof p?.progress === 'number' ? p.progress : 0; // 0..100
        const earned = Math.round((progress / 100) * reward);
        const current = pointsByUser.get(p.user_id) || { totalPoints: 0, completedCount: 0 };
        current.totalPoints += Number.isFinite(earned) ? earned : 0;
        if (p.is_completed) current.completedCount += 1;
        pointsByUser.set(p.user_id, current);
      });

      // Buscar perfis para nomes/avatars somente dos usuários presentes no ranking
      const rankingUserIds = Array.from(pointsByUser.keys());
      let profilesMap = new Map<string, any>();
      if (rankingUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .in('user_id', rankingUserIds);
        (profiles || []).forEach((p) => profilesMap.set(p.user_id, p));
      }

      // Processar dados dos desafios individuais
      const desafiosProcessados = desafiosData?.map(desafio => {
        const userParticipation = desafio.challenge_participations?.find(p => p.user_id === user?.id) || null;
        return {
          id: desafio.id,
          title: desafio.title,
          description: desafio.description,
          category: desafio.category,
          difficulty: desafio.difficulty,
          duration_days: desafio.duration_days,
          points_reward: desafio.points_reward,
          badge_icon: desafio.badge_icon || '🏆',
          badge_name: desafio.badge_name,
          instructions: desafio.instructions,
          tips: desafio.tips || [],
          is_active: desafio.is_active,
          is_featured: desafio.is_featured,
          is_group_challenge: desafio.is_group_challenge,
          daily_log_target: desafio.daily_log_target,
          daily_log_unit: desafio.daily_log_unit,
          user_participation: userParticipation ? {
            id: userParticipation.id,
            progress: userParticipation.progress,
            is_completed: userParticipation.is_completed,
            started_at: userParticipation.started_at
          } : undefined
        };
      }) || [];

      // Processar dados dos desafios públicos
      const desafiosPublicosProcessados = desafiosPublicosData?.map(desafio => {
        const userParticipation = desafio.challenge_participations?.find(p => p.user_id === user?.id) || null;
        return {
          id: desafio.id,
          title: desafio.title,
          description: desafio.description,
          category: desafio.category,
          difficulty: desafio.difficulty,
          duration_days: desafio.duration_days,
          points_reward: desafio.points_reward,
          badge_icon: desafio.badge_icon || '🏆',
          badge_name: desafio.badge_name,
          instructions: desafio.instructions,
          tips: desafio.tips || [],
          is_active: desafio.is_active,
          is_featured: desafio.is_featured,
          is_group_challenge: desafio.is_group_challenge,
          daily_log_target: desafio.daily_log_target,
          daily_log_unit: desafio.daily_log_unit,
          participants_count: desafio.challenge_participations?.length || 0,
          total_participants: 1000,
          // Valor padrão, pode ser ajustado
          user_participation: userParticipation ? {
            id: userParticipation.id,
            progress: userParticipation.progress,
            is_completed: userParticipation.is_completed,
            started_at: userParticipation.started_at
          } : undefined
        };
      }) || [];

      // Processar dados do ranking (sem profiles)
      // Transformar em lista ordenada por pontos
      const rankingProcessado = rankingUserIds
        .map((uid) => {
          const profile = profilesMap.get(uid);
          const stats = pointsByUser.get(uid)!;
          return {
            id: uid,
            name: profile?.full_name || `Usuário ${uid.slice(0, 8)}`,
            avatar: '😊',
            progress: Math.min(100, Math.round(stats.totalPoints)), // apenas para a barra visual
            points: stats.totalPoints,
            position: 0,
            badge: '⭐',
            is_current_user: uid === user?.id
          };
        })
        .sort((a, b) => b.points - a.points)
        .map((u, index) => ({ ...u, position: index + 1, badge: index < 3 ? ['👑', '🥈', '🥉'][index] : '⭐' }));

      // Se não há dados reais, usar exemplos
      if (desafiosProcessados.length === 0) {
        console.log('⚠️ Usando dados de exemplo - nenhum desafio encontrado no banco');
        setDesafios(desafiosExemplo);
        setDesafiosPublicos(desafiosPublicosExemplo);
        setRankingData(rankingExemplo);
      } else {
        console.log(`✅ Carregados ${desafiosProcessados.length} desafios individuais`);
        console.log(`✅ Carregados ${desafiosPublicosProcessados.length} desafios públicos`);
        console.log(`✅ Carregados ${rankingProcessado.length} usuários no ranking`);
        setDesafios(desafiosProcessados);
        setDesafiosPublicos(desafiosPublicosProcessados);
        setRankingData(rankingProcessado);
      }
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os desafios.",
        variant: "destructive"
      });
      // Fallback para dados de exemplo
      setDesafios(desafiosExemplo);
      setDesafiosPublicos(desafiosPublicosExemplo);
      setRankingData(rankingExemplo);
    } finally {
      setLoading(false);
      setDataLoaded(true);
    }
  };
  const handleDesafioClick = async (desafio: Desafio) => {
    try {
      // Garantir que o desafio exista com UUID no banco
      const realChallengeId = await ensureRealChallenge(desafio);

      // Se não for possível criar no banco (RLS), operar localmente
      if (!realChallengeId) {
        const localDesafio: Desafio = {
          ...desafio,
          user_participation: desafio.user_participation ?? {
            id: 'local-temp',
            progress: 0,
            is_completed: false,
            started_at: new Date().toISOString()
          }
        };
        setSelectedDesafio(localDesafio);
        setShowModal(true);
        toast({ title: 'Modo demonstração', description: 'Sem permissão para criar no banco. Editando localmente.' });
        return;
      }

      // Se não tem participação OU o ID é mock (não-UUID), criar/obter do banco
      const hasValidParticipation = !!desafio.user_participation && isValidUUID(desafio.user_participation.id);
      if (!desafio.user_participation || !hasValidParticipation) {
        try {
          const participacao = await getOrCreateParticipation(realChallengeId);

          // Atualizar desafio com a participação
          const desafioComParticipacao = {
            ...desafio,
            id: realChallengeId,
            user_participation: {
              id: participacao.id,
              progress: participacao.progress,
              is_completed: participacao.is_completed,
              started_at: participacao.started_at
            }
          };
          setSelectedDesafio(desafioComParticipacao);
        } catch (error) {
          console.error('Erro ao obter/criar participação:', error);
          toast({
            title: "Erro",
            description: "Não foi possível iniciar o desafio.",
            variant: "destructive"
          });
          return;
        }
      } else {
        setSelectedDesafio({ ...desafio, id: realChallengeId });
      }
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao abrir desafio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o desafio.",
        variant: "destructive"
      });
    }
  };
  const handleProgressUpdate = async (newProgress: number) => {
    if (selectedDesafio && selectedDesafio.user_participation) {
      try {
        // Se o desafio não possui UUID (modo local), apenas atualizar estado e encerrar
        if (!isValidUUID(selectedDesafio.id)) {
          setDesafios(prev => prev.map(desafio => desafio.id === selectedDesafio.id ? {
            ...desafio,
            user_participation: {
              ...desafio.user_participation!,
              progress: newProgress,
              is_completed: newProgress >= desafio.daily_log_target
            }
          } : desafio));

          setDesafiosPublicos(prev => prev.map(desafio => desafio.id === selectedDesafio.id ? {
            ...desafio,
            user_participation: desafio.user_participation ? {
              ...desafio.user_participation,
              progress: newProgress,
              is_completed: newProgress >= desafio.daily_log_target
            } : undefined
          } : desafio));

        if (newProgress >= selectedDesafio.daily_log_target) {
          triggerCelebration('🎉 Desafio Completo! 🎉');
          toast({ title: 'Parabéns! 🏆', description: `Você completou o desafio "${selectedDesafio.title}"! (local)` });
        } else {
          toast({ title: 'Progresso Atualizado! 📊', description: 'Seu progresso foi salvo localmente.' });
        }
        setShowModal(false);
        return;
      }
        // Garantir um ID de participação válido; se for mock, criar/obter
        let participationId = selectedDesafio.user_participation.id;
        if (!isValidUUID(participationId)) {
          const participacao = await getOrCreateParticipation(selectedDesafio.id);
          participationId = participacao.id;
          // Sincronizar no estado atual do modal/seleção
          setSelectedDesafio(prev => prev ? ({
            ...prev,
            user_participation: {
              ...prev.user_participation!,
              id: participacao.id,
              started_at: participacao.started_at
            }
          }) : prev);
        }

        // Atualizar progresso no banco
        const { error } = await supabase
          .from('challenge_participations')
          .update({
            progress: Math.round(newProgress),
            is_completed: newProgress >= selectedDesafio.daily_log_target,
            updated_at: new Date().toISOString()
          })
          .eq('id', participationId);
        if (error) {
          console.error('Erro ao atualizar progresso:', error);
          // Se for erro de UUID (22P02) ou similar, aplicar fallback para estado local
          const isUuidError = (error as any)?.code === '22P02' || String((error as any)?.message || '').toLowerCase().includes('invalid input syntax for type uuid');
          if (!isUuidError) {
            toast({
              title: "Erro",
              description: "Não foi possível atualizar o progresso.",
              variant: "destructive"
            });
            return;
          }
        }

        // Atualizar desafios individuais
        setDesafios(prev => prev.map(desafio => desafio.id === selectedDesafio.id ? {
          ...desafio,
          user_participation: {
            ...desafio.user_participation!,
            progress: newProgress,
            is_completed: newProgress >= desafio.daily_log_target
          }
        } : desafio));

        // Atualizar desafios públicos
        setDesafiosPublicos(prev => prev.map(desafio => desafio.id === selectedDesafio.id ? {
          ...desafio,
          user_participation: desafio.user_participation ? {
            ...desafio.user_participation,
            progress: newProgress,
            is_completed: newProgress >= desafio.daily_log_target
          } : undefined
        } : desafio));

        // Celebrar se completou
        if (newProgress >= selectedDesafio.daily_log_target) {
          triggerCelebration('🎉 Desafio Completo! 🎉');
          toast({
            title: "Parabéns! 🏆",
            description: `Você completou o desafio "${selectedDesafio.title}"!`
          });
        } else {
          toast({
            title: "Progresso Atualizado! 📊",
            description: `Seu progresso foi salvo com sucesso.`
          });
        }
      } catch (error) {
        console.error('Erro ao atualizar progresso:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o progresso.",
          variant: "destructive"
        });
      }
    }
    setShowModal(false);
  };
  const handleStartIndividualChallenge = async (desafio: Desafio) => {
    try {
      const realChallengeId = await ensureRealChallenge(desafio);
      if (!realChallengeId) {
        // Modo local: marcar participação mock e abrir modal
        setDesafios(prev => prev.map(d => d.id === desafio.id ? {
          ...d,
          user_participation: {
            id: 'local-temp',
            progress: 0,
            is_completed: false,
            started_at: new Date().toISOString()
          }
        } : d));
        toast({ title: 'Modo demonstração', description: 'Sem permissão para criar no banco. Registrando localmente.' });
        setSelectedDesafio({
          ...desafio,
          user_participation: {
            id: 'local-temp',
            progress: 0,
            is_completed: false,
            started_at: new Date().toISOString()
          }
        });
        setShowModal(true);
        return;
      }
      const participacao = await getOrCreateParticipation(realChallengeId);

      // Atualizar estado local
      setDesafios(prev => prev.map(d => d.id === desafio.id ? {
        ...d,
        id: realChallengeId,
        user_participation: {
          id: participacao.id,
          progress: 0,
          is_completed: false,
          started_at: participacao.started_at
        }
      } : d));
      toast({
        title: "Desafio Iniciado! 🚀",
        description: `Você começou o desafio "${desafio.title}"!`
      });

      // Abrir modal para atualizar progresso
      setSelectedDesafio({
        ...desafio,
        id: realChallengeId,
        user_participation: {
          id: participacao.id,
          progress: 0,
          is_completed: false,
          started_at: participacao.started_at
        }
      });
      setShowModal(true);
    } catch (error) {
      console.error('Erro ao iniciar desafio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o desafio.",
        variant: "destructive"
      });
    }
  };
  const handleJoinPublicChallenge = async (desafio: Desafio) => {
    try {
      const realChallengeId = await ensureRealChallenge(desafio);
      if (!realChallengeId) {
        // Modo local: marcar participação mock
        setDesafiosPublicos(prev => prev.map(d => d.id === desafio.id ? {
          ...d,
          user_participation: {
            id: 'local-temp',
            progress: 0,
            is_completed: false,
            started_at: new Date().toISOString()
          },
          participants_count: (d.participants_count || 0) + 1
        } : d));
        toast({ title: 'Modo demonstração', description: 'Sem permissão para criar no banco. Participação registrada localmente.' });
        return;
      }
      const participacao = await getOrCreateParticipation(realChallengeId);

      // Atualizar estado local
      setDesafiosPublicos(prev => prev.map(d => d.id === desafio.id ? {
        ...d,
        id: realChallengeId,
        user_participation: {
          id: participacao.id,
          progress: 0,
          is_completed: false,
          started_at: participacao.started_at
        },
        participants_count: (d.participants_count || 0) + 1
      } : d));
      toast({
        title: "Parabéns! 🎉",
        description: `Você entrou no desafio "${desafio.title}"!`
      });
    } catch (error) {
      console.error('Erro ao participar do desafio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível participar do desafio.",
        variant: "destructive"
      });
    }
  };
  const renderDesafioCard = (desafio: Desafio, isPublic = false) => {
    const progress = desafio.user_participation ? desafio.user_participation.progress / desafio.daily_log_target * 100 : 0;
    const isCompleted = desafio.user_participation?.is_completed || false;
    const isParticipating = !!desafio.user_participation;
    return <motion.div key={desafio.id} initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.3
    }}>
        <Card className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 ${isCompleted ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 shadow-emerald-200 dark:shadow-emerald-900' : isPublic ? 'border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 shadow-purple-200 dark:shadow-purple-900' : 'border-blue-200 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 hover:border-blue-300 shadow-blue-100 dark:shadow-slate-800'}`} onClick={() => isParticipating ? handleDesafioClick(desafio) : undefined}>
          <CardHeader className="pb-3 bg-cyan-50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{desafio.badge_icon}</span>
                {isPublic && <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-300 border border-purple-200 dark:border-purple-700 shadow-sm">
                    <Users className="w-3 h-3 mr-1" />
                    {desafio.participants_count || 0}
                  </Badge>}
              </div>
              <Badge className={difficultyColors[desafio.difficulty as keyof typeof difficultyColors]}>
                {difficultyLabels[desafio.difficulty as keyof typeof difficultyLabels]}
              </Badge>
            </div>
            <CardTitle className="leading-tight text-slate-900 text-lg">{desafio.title}</CardTitle>
            <CardDescription className="text-sm">
              {desafio.description}
            </CardDescription>
            {isPublic && <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Users className="w-3 h-3" />
                <span>{desafio.participants_count}/{desafio.total_participants} participantes</span>
              </div>}
          </CardHeader>

          <CardContent className="space-y-4 bg-cyan-50">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>🎯 {desafio.daily_log_target} {desafio.daily_log_unit}/dia</span>
              <span>⏱️ {desafio.duration_days} dias</span>
            </div>

            {isParticipating && <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">
                  {desafio.user_participation!.progress} / {desafio.daily_log_target} {desafio.daily_log_unit}
                </div>
              </div>}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>{desafio.points_reward} pontos</span>
              </div>
              
              {!isParticipating ? <Button size="sm" onClick={e => {
              e.stopPropagation();
              if (isPublic) {
                handleJoinPublicChallenge(desafio);
              } else {
                handleStartIndividualChallenge(desafio);
              }
            }} className={`touch-manipulation transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg ${isPublic ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white' : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white'}`}>
                  {isPublic ? '✨ Participar' : '🚀 Iniciar'}
                </Button> : isCompleted ? <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md border border-emerald-400">
                  ✅ Completo
                </Badge> : <Button size="sm" onClick={e => {
              e.stopPropagation();
              handleDesafioClick(desafio);
            }} className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 text-white touch-manipulation transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg">
                  📊 Atualizar
                </Button>}
            </div>
          </CardContent>
        </Card>
      </motion.div>;
  };
  if (loading) {
    return <Card className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p>Carregando desafios...</p>
        </div>
      </Card>;
  }
  return <div className="space-y-4">

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="individuais" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Desafios</span>
            <span className="sm:hidden">Meus</span>
          </TabsTrigger>
          <TabsTrigger value="publicos" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Públicos</span>
            <span className="sm:hidden">Grupo</span>
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>Ranking</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individuais" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {desafios.map(desafio => renderDesafioCard(desafio, false))}
          </div>
        </TabsContent>

        <TabsContent value="publicos" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {desafiosPublicos.map(desafio => renderDesafioCard(desafio, true))}
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Ranking dos Desafios
              </CardTitle>
              <CardDescription className="text-sm">
                Competição saudável entre todos os participantes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                {rankingData.map((user, index) => {
                  const getRankIcon = (position: number) => {
                    if (position === 1) {
                      return <Crown className="w-5 h-5 text-yellow-600" />;
                    }
                    if (position === 2) {
                      return <Medal className="w-5 h-5 text-gray-400" />;
                    }
                    if (position === 3) {
                      return <Medal className="w-5 h-5 text-amber-600" />;
                    }
                    return (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-600">{position}</span>
                      </div>
                    );
                  };

                  return (
                    <div
                      key={user.id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                        user.is_current_user ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Posição */}
                        <div className="flex-shrink-0 w-10">
                          {user.position <= 3 ? (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              user.position === 1 ? 'bg-yellow-100' :
                              user.position === 2 ? 'bg-gray-100' :
                              'bg-amber-100'
                            }`}>
                              {getRankIcon(user.position)}
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-600">{user.position}</span>
                            </div>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="h-10 w-10 flex-shrink-0">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
                            {user.avatar || user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        {/* Nome e Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-medium text-sm truncate ${
                              user.is_current_user ? 'text-blue-700' : 'text-gray-900'
                            }`}>
                              {user.name}
                            </span>
                            {user.is_current_user && (
                              <Badge variant="default" className="text-xs px-1.5 py-0">Você</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span>{user.progress}% concluído</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {user.points.toLocaleString()} pontos
                            </span>
                          </div>
                          <Progress value={user.progress} className="h-1.5 mt-2" />
                        </div>

                        {/* Badge de Posição */}
                        <div className="flex-shrink-0">
                          <Badge
                            variant="secondary"
                            className={`${
                              user.position === 1 ? 'bg-yellow-100 text-yellow-700' :
                              user.position === 2 ? 'bg-gray-100 text-gray-700' :
                              user.position === 3 ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}
                          >
                            #{user.position}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Progresso */}
      {selectedDesafio && <UpdateDesafioProgressModal desafio={selectedDesafio} isOpen={showModal} onClose={() => setShowModal(false)} onProgressUpdate={handleProgressUpdate} />}

      {/* Efeitos visuais */}
      <VisualEffectsManager trigger={desafios.some(d => d.user_participation?.is_completed)} />
    </div>;
};
export default DesafiosSection;