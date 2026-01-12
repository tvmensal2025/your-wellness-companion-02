// =====================================================
// HOOK PRINCIPAL - SISTEMA DE DESAFIOS V2
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type {
  IndividualChallenge,
  IndividualParticipation,
  FlashChallenge,
  ChallengeDuel,
  UserLeague,
  ChallengeTeam,
  SeasonalEvent,
  UserPowerup,
} from '@/types/challenges-v2';

// Cache keys centralizados
export const CHALLENGE_KEYS = {
  all: ['challenges-v2'] as const,
  individual: (userId: string) => [...CHALLENGE_KEYS.all, 'individual', userId] as const,
  participations: (userId: string) => [...CHALLENGE_KEYS.all, 'participations', userId] as const,
  flash: () => [...CHALLENGE_KEYS.all, 'flash'] as const,
  duels: (userId: string) => [...CHALLENGE_KEYS.all, 'duels', userId] as const,
  league: (userId: string) => [...CHALLENGE_KEYS.all, 'league', userId] as const,
  leagueRanking: (league: string) => [...CHALLENGE_KEYS.all, 'ranking', league] as const,
  teams: (userId: string) => [...CHALLENGE_KEYS.all, 'teams', userId] as const,
  events: () => [...CHALLENGE_KEYS.all, 'events'] as const,
  powerups: (userId: string) => [...CHALLENGE_KEYS.all, 'powerups', userId] as const,
};

// =====================================================
// DESAFIOS INDIVIDUAIS
// =====================================================
export function useIndividualChallenges(userId: string | undefined) {
  return useQuery({
    queryKey: CHALLENGE_KEYS.individual(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as IndividualChallenge[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyParticipations(userId: string | undefined) {
  return useQuery({
    queryKey: CHALLENGE_KEYS.participations(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('challenge_participations')
        .select(`
          *,
          challenges (*)
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false });
      
      if (error) throw error;
      
      // Mapear 'challenges' (plural do Supabase) para 'challenge' (singular esperado pelo tipo)
      return (data || []).map(item => ({
        ...item,
        challenge: item.challenges, // Supabase retorna 'challenges' no join
      })) as IndividualParticipation[];
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

// =====================================================
// DESAFIOS RELÂMPAGO
// =====================================================
export function useFlashChallenges() {
  return useQuery({
    queryKey: CHALLENGE_KEYS.flash(),
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('flash_challenges')
          .select('*')
          .eq('is_active', true)
          .gte('ends_at', new Date().toISOString())
          .order('ends_at', { ascending: true });
        
        if (error) {
          console.warn('Flash challenges table may not exist:', error.message);
          return [];
        }
        return data as FlashChallenge[];
      } catch (e) {
        console.warn('Error fetching flash challenges:', e);
        return [];
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// =====================================================
// DUELOS
// =====================================================
export function useMyDuels(userId: string | undefined) {
  return useQuery({
    queryKey: CHALLENGE_KEYS.duels(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('challenge_duels')
          .select(`
            *,
            challenger:profiles!challenge_duels_challenger_id_fkey(full_name, avatar_url),
            opponent:profiles!challenge_duels_opponent_id_fkey(full_name, avatar_url)
          `)
          .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
          .in('status', ['pending', 'active'])
          .order('created_at', { ascending: false });
        
        if (error) {
          console.warn('Duels table may not exist:', error.message);
          return [];
        }
        return (data || []) as unknown as ChallengeDuel[];
      } catch (e) {
        console.warn('Error fetching duels:', e);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 30 * 1000,
  });
}

export function useCreateDuel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (params: {
      opponent_id: string;
      challenge_type: string;
      target_value: number;
      unit: string;
      duration_hours: number;
      xp_reward?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      
      const ends_at = new Date();
      ends_at.setHours(ends_at.getHours() + params.duration_hours);
      
      const { data, error } = await supabase
        .from('challenge_duels')
        .insert({
          challenger_id: user.id,
          opponent_id: params.opponent_id,
          challenge_type: params.challenge_type,
          target_value: params.target_value,
          unit: params.unit,
          xp_reward: params.xp_reward || 200,
          status: 'pending',
          ends_at: ends_at.toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CHALLENGE_KEYS.duels('') });
      toast({
        title: '⚔️ Duelo Criado!',
        description: 'Aguardando aceitação do oponente',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar duelo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateDuelProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      duel_id: string;
      progress: number;
      is_challenger: boolean;
    }) => {
      const field = params.is_challenger ? 'challenger_progress' : 'opponent_progress';
      
      const { error } = await supabase
        .from('challenge_duels')
        .update({ [field]: params.progress, updated_at: new Date().toISOString() })
        .eq('id', params.duel_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHALLENGE_KEYS.duels('') });
    },
  });
}

// =====================================================
// SISTEMA DE LIGAS
// =====================================================
export function useUserLeague(userId: string | undefined) {
  return useQuery({
    queryKey: CHALLENGE_KEYS.league(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      
      try {
        const weekStart = getWeekStart();
        
        const { data, error } = await supabase
          .from('user_leagues')
          .select('*')
          .eq('user_id', userId)
          .eq('week_start', weekStart)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          // Tabela pode não existir - retornar liga padrão
          console.warn('User leagues table may not exist:', error.message);
          return {
            id: 'default',
            user_id: userId,
            current_league: 'bronze' as const,
            weekly_xp: 0,
            rank_position: undefined,
            highest_league: 'bronze' as const,
            weeks_in_current_league: 0,
            total_promotions: 0,
            total_demotions: 0,
            week_start: weekStart,
          } as UserLeague;
        }
        
        // Se não existe, tentar criar entrada padrão
        if (!data) {
          try {
            const { data: newLeague, error: insertError } = await supabase
              .from('user_leagues')
              .insert({
                user_id: userId,
                current_league: 'bronze',
                weekly_xp: 0,
                week_start: weekStart,
              })
              .select()
              .single();
            
            if (insertError) {
              console.warn('Could not create league entry:', insertError.message);
              // Retornar liga padrão mesmo assim
              return {
                id: 'default',
                user_id: userId,
                current_league: 'bronze' as const,
                weekly_xp: 0,
                rank_position: undefined,
                highest_league: 'bronze' as const,
                weeks_in_current_league: 0,
                total_promotions: 0,
                total_demotions: 0,
                week_start: weekStart,
              } as UserLeague;
            }
            return newLeague as UserLeague;
          } catch (e) {
            // Retornar liga padrão
            return {
              id: 'default',
              user_id: userId,
              current_league: 'bronze' as const,
              weekly_xp: 0,
              rank_position: undefined,
              highest_league: 'bronze' as const,
              weeks_in_current_league: 0,
              total_promotions: 0,
              total_demotions: 0,
              week_start: weekStart,
            } as UserLeague;
          }
        }
        
        return data as UserLeague;
      } catch (e) {
        console.warn('Error fetching user league:', e);
        // Retornar liga padrão em caso de erro
        return {
          id: 'default',
          user_id: userId,
          current_league: 'bronze' as const,
          weekly_xp: 0,
          rank_position: undefined,
          highest_league: 'bronze' as const,
          weeks_in_current_league: 0,
          total_promotions: 0,
          total_demotions: 0,
          week_start: getWeekStart(),
        } as UserLeague;
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useLeagueRanking(league: string) {
  return useQuery({
    queryKey: CHALLENGE_KEYS.leagueRanking(league),
    queryFn: async () => {
      const weekStart = getWeekStart();
      
      const { data, error } = await supabase
        .from('user_leagues')
        .select(`
          *,
          profiles:user_id (full_name, avatar_url)
        `)
        .eq('current_league', league as any)
        .eq('week_start', weekStart)
        .order('weekly_xp', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000,
  });
}

// Helper para obter início da semana
function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split('T')[0];
}

// =====================================================
// TIMES
// =====================================================
export function useMyTeams(userId: string | undefined) {
  return useQuery({
    queryKey: CHALLENGE_KEYS.teams(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('challenge_team_members')
          .select(`
            *,
            team:challenge_teams (*)
          `)
          .eq('user_id', userId);
        
        if (error) {
          console.warn('Teams table may not exist:', error.message);
          return [];
        }
        return data?.map(m => m.team) as ChallengeTeam[];
      } catch (e) {
        console.warn('Error fetching teams:', e);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (params: {
      name: string;
      description?: string;
      avatar_emoji?: string;
      color?: string;
      is_public?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      
      // Gerar código de convite
      const invite_code = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { data: team, error: teamError } = await supabase
        .from('challenge_teams')
        .insert({
          ...params,
          leader_id: user.id,
          invite_code,
        })
        .select()
        .single();
      
      if (teamError) throw teamError;
      
      // Adicionar líder como membro
      const { error: memberError } = await supabase
        .from('challenge_team_members')
        .insert({
          team_id: team.id,
          user_id: user.id,
          role: 'leader',
        });
      
      if (memberError) throw memberError;
      
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHALLENGE_KEYS.teams('') });
      toast({
        title: '👥 Time Criado!',
        description: 'Convide seus amigos para participar',
      });
    },
  });
}

// =====================================================
// EVENTOS SAZONAIS
// =====================================================
export function useActiveEvents() {
  return useQuery({
    queryKey: CHALLENGE_KEYS.events(),
    queryFn: async () => {
      try {
        const now = new Date().toISOString();
        
        const { data, error } = await supabase
          .from('seasonal_events')
          .select('*')
          .eq('is_active', true)
          .lte('starts_at', now)
          .gte('ends_at', now)
          .order('ends_at', { ascending: true });
        
        if (error) {
          console.warn('Events table may not exist:', error.message);
          return [];
        }
        return (data || []) as unknown as SeasonalEvent[];
      } catch (e) {
        console.warn('Error fetching events:', e);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

// =====================================================
// POWER-UPS
// =====================================================
export function useMyPowerups(userId: string | undefined) {
  return useQuery({
    queryKey: CHALLENGE_KEYS.powerups(userId || ''),
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const { data, error } = await supabase
          .from('user_powerups')
          .select('*')
          .eq('user_id', userId)
          .gt('quantity', 0);
        
        if (error) {
          console.warn('Powerups table may not exist:', error.message);
          return [];
        }
        return data as UserPowerup[];
      } catch (e) {
        console.warn('Error fetching powerups:', e);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useUsePowerup() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (params: {
      powerup_type: string;
      challenge_id?: string;
      duel_id?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      
      // Decrementar quantidade usando update simples
      const { data: currentPowerup, error: fetchError } = await supabase
        .from('user_powerups')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('powerup_type', params.powerup_type as any)
        .gt('quantity', 0)
        .single();
      
      if (fetchError || !currentPowerup) throw new Error('Power-up não disponível');
      
      const { error: updateError } = await supabase
        .from('user_powerups')
        .update({ quantity: currentPowerup.quantity - 1 })
        .eq('user_id', user.id)
        .eq('powerup_type', params.powerup_type as any);
      
      if (updateError) throw updateError;
      
      // Registrar uso (ignorar erros pois a tabela pode não existir)
      try {
        await (supabase as any)
          .from('powerup_usage_log')
          .insert({
            user_id: user.id,
            powerup_type: params.powerup_type,
            used_on_challenge_id: params.challenge_id,
            used_on_duel_id: params.duel_id,
          });
      } catch (e) {
        console.warn('Erro ao registrar uso:', e);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHALLENGE_KEYS.powerups('') });
      toast({
        title: '✨ Power-up Ativado!',
        description: 'Efeito aplicado com sucesso',
      });
    },
  });
}

// =====================================================
// PARTICIPAÇÃO EM DESAFIOS
// =====================================================
export function useJoinChallenge() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      
      // Buscar info do desafio
      const { data: challenge } = await supabase
        .from('challenges')
        .select('target_value')
        .eq('id', challengeId)
        .single();
      
      const { data, error } = await supabase
        .from('challenge_participations')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          progress: 0,
          target_value: challenge?.target_value || 100,
          current_streak: 0,
          best_streak: 0,
          combo_multiplier: 1.0,
          combo_days: 0,
          is_completed: false,
          started_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,challenge_id',
          ignoreDuplicates: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHALLENGE_KEYS.participations('') });
      toast({
        title: '🎯 Desafio Iniciado!',
        description: 'Boa sorte na sua jornada!',
      });
    },
  });
}

export function useUpdateProgress() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (params: {
      participation_id: string;
      new_progress: number;
      is_daily_completion?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');
      
      // Buscar participação atual
      const { data: current } = await supabase
        .from('challenge_participations')
        .select('*, challenges(*)')
        .eq('id', params.participation_id)
        .single();
      
      if (!current) throw new Error('Participação não encontrada');
      
      // Calcular novo combo se completou o dia
      let newComboMultiplier = current.combo_multiplier || 1.0;
      let newComboDays = current.combo_days || 0;
      
      if (params.is_daily_completion) {
        newComboDays += 1;
        newComboMultiplier = Math.min(1.0 + (newComboDays * 0.25), 3.0);
      }
      
      // Verificar se completou
      const isCompleted = params.new_progress >= (current.target_value || 100);
      
      const { error } = await supabase
        .from('challenge_participations')
        .update({
          progress: params.new_progress,
          combo_multiplier: newComboMultiplier,
          combo_days: newComboDays,
          current_streak: params.is_daily_completion ? (current.current_streak || 0) + 1 : current.current_streak,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.participation_id);
      
      if (error) throw error;
      
      // Se completou, adicionar XP à liga
      if (isCompleted && current.challenges?.xp_reward) {
        const xpWithCombo = Math.round(current.challenges.xp_reward * newComboMultiplier);
        await supabase.rpc('update_league_weekly_xp', {
          p_user_id: user.id,
          p_xp_amount: xpWithCombo,
        });
      }
      
      return { isCompleted, newComboMultiplier };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: CHALLENGE_KEYS.participations('') });
      queryClient.invalidateQueries({ queryKey: CHALLENGE_KEYS.league('') });
      
      if (result.isCompleted) {
        toast({
          title: '🎉 Desafio Completado!',
          description: `Combo: ${result.newComboMultiplier}x XP`,
        });
      }
    },
  });
}
