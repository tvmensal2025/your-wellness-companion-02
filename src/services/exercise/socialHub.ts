// ============================================
// 👥 SOCIAL HUB SERVICE
// Sistema social para treinos em grupo e comunidade
// ============================================

import { supabase } from '@/integrations/supabase/client';
import { fromTable } from '@/lib/supabase-helpers';

// Local types for social system
interface WorkoutGroup {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  isPublic: boolean;
  memberCount: number;
  maxMembers: number;
  isActive: boolean;
  createdAt: Date;
}

interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  joinedAt: Date;
  userName?: string;
  avatarUrl?: string;
}

interface TeamChallenge {
  id: string;
  groupId: string;
  title: string;
  description: string;
  goalType: string;
  goalValue: number;
  currentProgress: number;
  startDate: Date;
  endDate: Date;
  isCompleted: boolean;
}

interface WorkoutBuddy {
  userId: string;
  userName: string;
  avatarUrl?: string;
  level: number;
  compatibilityScore: number;
  commonGoals: string[];
  preferredSchedule?: string[];
}

interface LiveWorkoutSession {
  id: string;
  hostUserId: string;
  hostName?: string;
  groupId?: string;
  status: string;
  participantCount: number;
  startedAt: Date;
}

interface Encouragement {
  id: string;
  fromUserId: string;
  fromUserName?: string;
  toUserId: string;
  type: string;
  message?: string;
  createdAt: Date;
}

// Competition types
interface CompetitionPrize {
  rank: number;
  reward?: string;
  value?: number;
  type?: string;
  description?: string;
}

interface Competition {
  id: string;
  name: string;
  description: string;
  type: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  status: string;
  goalType: string;
  goalValue?: number;
  currentParticipants?: number;
  [key: string]: any;
}

interface CompetitionParticipation {
  id: string;
  competitionId: string;
  competition?: Competition;
  currentProgress: number;
  currentRank: number;
  pointsEarned: number;
  joinedAt: Date;
}

interface CompetitionLeaderboardEntry {
  rank: number;
  oderId?: string;
  userId?: string;
  userName: string;
  avatarUrl?: string;
  progress: number;
  pointsEarned: number;
  teamId?: string;
}

interface Tournament {
  id: string;
  name: string;
  description: string;
  bracketSize: number;
  startDate: Date;
  status: string;
  matchDurationDays?: number;
  [key: string]: any;
}

interface TournamentBracket {
  rounds: TournamentRound[];
  tournamentId?: string;
  [key: string]: any;
}

interface TournamentRound {
  roundNumber: number;
  matches: TournamentMatch[];
  roundName?: string;
  [key: string]: any;
}

interface TournamentMatch {
  id: string;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  status: string;
  matchNumber?: number;
  [key: string]: any;
}

interface SeasonalEvent {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  rewards: any[];
}

interface CommunityEvent {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  type?: string;
  eventType?: string;
  startDate?: Date;
  endDate?: Date;
  eventDate?: Date;
  participantCount?: number;
  currentParticipants?: number;
  [key: string]: any;
}

// ============================================
// CONSTANTS
// ============================================

const BUDDY_MATCHING_WEIGHTS = {
  goalSimilarity: 0.3,
  levelProximity: 0.25,
  scheduleSimilarity: 0.25,
  locationProximity: 0.2,
};

const GROUP_LIMITS = {
  maxMembers: 50,
  maxAdmins: 5,
  minMembersForChallenge: 2,
};

// ============================================
// SOCIAL HUB CLASS
// ============================================

export class SocialHub {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // ============================================
  // GROUP MANAGEMENT
  // ============================================

  async createGroup(
    name: string,
    description: string,
    isPublic: boolean = true,
    maxMembers: number = GROUP_LIMITS.maxMembers
  ): Promise<WorkoutGroup> {
    const { data, error } = await (fromTable('exercise_workout_groups') as any)
      .insert({
        name,
        description,
        created_by: this.userId,
        is_public: isPublic,
        max_members: Math.min(maxMembers, GROUP_LIMITS.maxMembers),
      })
      .select()
      .single();

    if (error) throw error;

    // Adicionar criador como admin
    await (fromTable('exercise_group_members') as any).insert({
      group_id: data.id,
      user_id: this.userId,
      role: 'admin',
    });

    return this.mapGroup(data);
  }

  async getMyGroups(): Promise<WorkoutGroup[]> {
    const { data } = await (fromTable('exercise_group_members') as any)
      .select(`
        group:exercise_workout_groups(*)
      `)
      .eq('user_id', this.userId);

    return (data || [])
      .filter((d: any) => d.group)
      .map((d: any) => this.mapGroup(d.group));
  }

  async getPublicGroups(limit: number = 20): Promise<WorkoutGroup[]> {
    const { data } = await (fromTable('exercise_workout_groups') as any)
      .select('*')
      .eq('is_public', true)
      .eq('is_active', true)
      .order('member_count', { ascending: false })
      .limit(limit);

    return (data || []).map((g: any) => this.mapGroup(g));
  }

  async joinGroup(groupId: string): Promise<GroupMember> {
    // Verificar se grupo existe e tem vaga
    const { data: group } = await (fromTable('exercise_workout_groups') as any)
      .select('member_count, max_members, is_public')
      .eq('id', groupId)
      .maybeSingle();

    if (!group) throw new Error('Grupo não encontrado');
    if (group.member_count >= group.max_members) throw new Error('Grupo cheio');

    const { data, error } = await (fromTable('exercise_group_members') as any)
      .insert({
        group_id: groupId,
        user_id: this.userId,
        role: 'member',
      })
      .select()
      .single();

    if (error) throw error;

    // Atualizar contador via direct update
    await (fromTable('exercise_workout_groups') as any)
      .update({ member_count: (group.member_count || 0) + 1 })
      .eq('id', groupId);

    return {
      id: data.id,
      groupId: data.group_id,
      userId: data.user_id,
      role: data.role,
      joinedAt: new Date(data.joined_at),
    };
  }

  async leaveGroup(groupId: string): Promise<void> {
    await (fromTable('exercise_group_members') as any)
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', this.userId);

    // Decrement member count via direct query
    const { data: group } = await (fromTable('exercise_workout_groups') as any)
      .select('member_count')
      .eq('id', groupId)
      .maybeSingle();
    
    if (group) {
      await (fromTable('exercise_workout_groups') as any)
        .update({ member_count: Math.max(0, (group.member_count || 1) - 1) })
        .eq('id', groupId);
    }
  }

  async getGroupMembers(groupId: string): Promise<GroupMember[]> {
    const { data } = await (fromTable('exercise_group_members') as any)
      .select(`
        *,
        profile:profiles(full_name, avatar_url)
      `)
      .eq('group_id', groupId)
      .order('joined_at');

    return (data || []).map((m: any) => ({
      id: m.id,
      groupId: m.group_id,
      userId: m.user_id,
      role: m.role,
      joinedAt: new Date(m.joined_at),
      userName: (m.profile as { full_name?: string })?.full_name,
      avatarUrl: (m.profile as { avatar_url?: string })?.avatar_url,
    }));
  }

  private mapGroup(data: Record<string, unknown>): WorkoutGroup {
    return {
      id: data.id as string,
      name: data.name as string,
      description: data.description as string,
      createdBy: data.created_by as string,
      isPublic: data.is_public as boolean,
      memberCount: data.member_count as number,
      maxMembers: data.max_members as number,
      isActive: data.is_active as boolean,
      createdAt: new Date(data.created_at as string),
    };
  }

  // ============================================
  // LIVE WORKOUT SESSIONS
  // ============================================

  async startLiveSession(groupId?: string): Promise<LiveWorkoutSession> {
    const { data, error } = await (fromTable('exercise_live_sessions') as any)
      .insert({
        host_user_id: this.userId,
        group_id: groupId,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      hostUserId: data.host_user_id,
      groupId: data.group_id,
      status: data.status,
      participantCount: 1,
      startedAt: new Date(data.started_at),
    };
  }

  async joinLiveSession(sessionId: string): Promise<void> {
    await (fromTable('exercise_live_session_participants') as any).insert({
      session_id: sessionId,
      user_id: this.userId,
    });

    // Increment participant count directly
    const { data: session } = await (fromTable('exercise_live_sessions') as any)
      .select('participant_count')
      .eq('id', sessionId)
      .maybeSingle();
    
    if (session) {
      await (fromTable('exercise_live_sessions') as any)
        .update({ participant_count: (session.participant_count || 0) + 1 })
        .eq('id', sessionId);
    }
  }

  async leaveLiveSession(sessionId: string): Promise<void> {
    await (fromTable('exercise_live_session_participants') as any)
      .delete()
      .eq('session_id', sessionId)
      .eq('user_id', this.userId);

    // Decrement participant count directly
    const { data: session } = await (fromTable('exercise_live_sessions') as any)
      .select('participant_count')
      .eq('id', sessionId)
      .maybeSingle();
    
    if (session) {
      await (fromTable('exercise_live_sessions') as any)
        .update({ participant_count: Math.max(0, (session.participant_count || 1) - 1) })
        .eq('id', sessionId);
    }
  }

  async endLiveSession(sessionId: string): Promise<void> {
    await (fromTable('exercise_live_sessions') as any)
      .update({ 
        status: 'ended',
        ended_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('host_user_id', this.userId);
  }

  async getActiveSessions(groupId?: string): Promise<LiveWorkoutSession[]> {
    let query = (fromTable('exercise_live_sessions') as any)
      .select(`
        *,
        host:profiles!host_user_id(full_name, avatar_url)
      `)
      .eq('status', 'active');

    if (groupId) {
      query = query.eq('group_id', groupId);
    }

    const { data } = await query.order('started_at', { ascending: false });

    return (data || []).map((s: any) => ({
      id: s.id,
      hostUserId: s.host_user_id,
      hostName: (s.host as { full_name?: string })?.full_name,
      groupId: s.group_id,
      status: s.status,
      participantCount: s.participant_count,
      startedAt: new Date(s.started_at),
    }));
  }

  // ============================================
  // ENCOURAGEMENT SYSTEM
  // ============================================

  async sendEncouragement(
    toUserId: string,
    type: 'cheer' | 'high_five' | 'motivation' | 'celebration',
    message?: string
  ): Promise<Encouragement> {
    const { data, error } = await (fromTable('exercise_encouragements') as any)
      .insert({
        from_user_id: this.userId,
        to_user_id: toUserId,
        encouragement_type: type,
        message,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      fromUserId: data.from_user_id,
      toUserId: data.to_user_id,
      type: data.encouragement_type,
      message: data.message,
      createdAt: new Date(data.created_at),
    };
  }

  async getMyEncouragements(limit: number = 20): Promise<Encouragement[]> {
    const { data } = await (fromTable('exercise_encouragements') as any)
      .select(`
        *,
        from_user:profiles!from_user_id(full_name, avatar_url)
      `)
      .eq('to_user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return (data || []).map((e: any) => ({
      id: e.id,
      fromUserId: e.from_user_id,
      fromUserName: (e.from_user as { full_name?: string })?.full_name,
      toUserId: e.to_user_id,
      type: e.encouragement_type,
      message: e.message,
      createdAt: new Date(e.created_at),
    }));
  }

  // ============================================
  // TEAM CHALLENGES
  // ============================================

  async createTeamChallenge(
    groupId: string,
    title: string,
    description: string,
    goalType: string,
    goalValue: number,
    endDate: Date
  ): Promise<TeamChallenge> {
    const { data, error } = await (fromTable('exercise_team_challenges') as any)
      .insert({
        group_id: groupId,
        created_by: this.userId,
        title,
        description,
        goal_type: goalType,
        goal_value: goalValue,
        end_date: endDate.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      groupId: data.group_id,
      title: data.title,
      description: data.description,
      goalType: data.goal_type,
      goalValue: data.goal_value,
      currentProgress: 0,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      isCompleted: false,
    };
  }

  async getGroupChallenges(groupId: string): Promise<TeamChallenge[]> {
    const { data } = await (fromTable('exercise_team_challenges') as any)
      .select('*')
      .eq('group_id', groupId)
      .order('end_date')
      .limit(50);

    return (data || []).map((c: any) => ({
      id: c.id,
      groupId: c.group_id,
      title: c.title,
      description: c.description,
      goalType: c.goal_type,
      goalValue: c.goal_value,
      currentProgress: c.current_progress,
      startDate: new Date(c.start_date),
      endDate: new Date(c.end_date),
      isCompleted: c.is_completed,
    }));
  }

  async contributeToChallenge(
    challengeId: string,
    contribution: number
  ): Promise<void> {
    // Registrar contribuição individual
    await (fromTable('exercise_challenge_contributions') as any).insert({
      challenge_id: challengeId,
      user_id: this.userId,
      contribution_value: contribution,
    });

    // Atualizar progresso total via direct update
    const { data: challenge } = await (fromTable('exercise_team_challenges') as any)
      .select('current_progress')
      .eq('id', challengeId)
      .maybeSingle();
    
    if (challenge) {
      await (fromTable('exercise_team_challenges') as any)
        .update({ current_progress: (challenge.current_progress || 0) + contribution })
        .eq('id', challengeId);
    }
  }

  // ============================================
  // BUDDY MATCHING
  // ============================================

  async findWorkoutBuddies(limit: number = 10): Promise<WorkoutBuddy[]> {
    // Buscar perfil do usuário atual from profiles
    const { data: myProfile } = await (fromTable('profiles') as any)
      .select('*')
      .eq('user_id', this.userId)
      .maybeSingle();

    // Buscar candidatos from profiles with user_points for level
    const { data: candidates } = await (fromTable('profiles') as any)
      .select(`
        *,
        points:user_points(level, total_points)
      `)
      .neq('user_id', this.userId)
      .limit(50);

    if (!candidates || candidates.length === 0) return [];

    // Calcular compatibilidade
    const scored = (candidates as any[]).map(candidate => ({
      candidate,
      score: this.calculateBuddyScore(myProfile, candidate),
    }));

    // Ordenar por score e retornar top matches
    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(s => ({
      userId: s.candidate.user_id,
      userName: s.candidate.full_name || 'Usuário',
      avatarUrl: s.candidate.avatar_url,
      level: (s.candidate.points as { level?: number })?.level || 1,
      compatibilityScore: s.score,
      commonGoals: this.findCommonGoals(myProfile, s.candidate),
      preferredSchedule: [],
    }));
  }

  private calculateBuddyScore(
    myProfile: Record<string, unknown> | null,
    candidate: Record<string, unknown>
  ): number {
    if (!myProfile) return 0.5;

    let score = 0;

    // Similaridade de objetivos
    const myGoals = (myProfile.fitness_goals as string[]) || [];
    const theirGoals = (candidate.fitness_goals as string[]) || [];
    const commonGoals = myGoals.filter(g => theirGoals.includes(g));
    score += (commonGoals.length / Math.max(myGoals.length, 1)) * BUDDY_MATCHING_WEIGHTS.goalSimilarity;

    // Proximidade de nível
    const myLevel = (myProfile.experience_level as number) || 1;
    const theirLevel = (candidate.experience_level as number) || 1;
    const levelDiff = Math.abs(myLevel - theirLevel);
    score += Math.max(0, 1 - levelDiff / 10) * BUDDY_MATCHING_WEIGHTS.levelProximity;

    // Similaridade de horário
    const mySchedule = (myProfile.preferred_schedule as string[]) || [];
    const theirSchedule = (candidate.preferred_schedule as string[]) || [];
    const commonSchedule = mySchedule.filter(s => theirSchedule.includes(s));
    score += (commonSchedule.length / Math.max(mySchedule.length, 1)) * BUDDY_MATCHING_WEIGHTS.scheduleSimilarity;

    // Proximidade de localização (simplificado)
    const sameCity = myProfile.city === candidate.city;
    score += (sameCity ? 1 : 0.3) * BUDDY_MATCHING_WEIGHTS.locationProximity;

    return Math.min(1, score);
  }

  private findCommonGoals(
    myProfile: Record<string, unknown> | null,
    candidate: Record<string, unknown>
  ): string[] {
    if (!myProfile) return [];
    const myGoals = (myProfile.fitness_goals as string[]) || [];
    const theirGoals = (candidate.fitness_goals as string[]) || [];
    return myGoals.filter(g => theirGoals.includes(g));
  }

  async sendBuddyRequest(toUserId: string, message?: string): Promise<void> {
    await (fromTable('exercise_buddy_requests') as any).insert({
      from_user_id: this.userId,
      to_user_id: toUserId,
      message,
      status: 'pending',
    });
  }

  async respondToBuddyRequest(
    requestId: string,
    accept: boolean
  ): Promise<void> {
    await (fromTable('exercise_buddy_requests') as any)
      .update({ 
        status: accept ? 'accepted' : 'rejected',
        responded_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (accept) {
      // Criar conexão de buddy
      const { data: request } = await (fromTable('exercise_buddy_requests') as any)
        .select('from_user_id')
        .eq('id', requestId)
        .single();

      if (request) {
        await (fromTable('exercise_buddy_connections') as any).insert({
          user_id_1: this.userId,
          user_id_2: (request as any).from_user_id,
        });
      }
    }
  }

  async getMyBuddies(): Promise<WorkoutBuddy[]> {
    const { data } = await (fromTable('exercise_buddy_connections') as any)
      .select(`
        *,
        buddy1:profiles!user_id_1(id, full_name, avatar_url),
        buddy2:profiles!user_id_2(id, full_name, avatar_url)
      `)
      .or(`user_id_1.eq.${this.userId},user_id_2.eq.${this.userId}`);

    return ((data || []) as any[]).map(conn => {
      const buddy = (conn.buddy1 as { id: string })?.id === this.userId 
        ? conn.buddy2 
        : conn.buddy1;
      
      return {
        userId: (buddy as { id: string })?.id,
        userName: (buddy as { full_name?: string })?.full_name || 'Usuário',
        avatarUrl: (buddy as { avatar_url?: string })?.avatar_url,
        level: 1,
        compatibilityScore: 1,
        commonGoals: [],
        connectedSince: conn.connected_at ? new Date(conn.connected_at) : undefined,
      };
    });
  }

  // ============================================
  // COMPETITION & TOURNAMENT SYSTEM
  // ============================================

  async createCompetition(params: {
    name: string;
    description: string;
    type: 'individual' | 'team' | 'bracket';
    startDate: Date;
    endDate: Date;
    maxParticipants?: number;
    entryFee?: number;
    prizes?: CompetitionPrize[];
    rules?: string[];
    goalType: 'points' | 'workouts' | 'minutes' | 'calories';
    goalValue?: number;
  }): Promise<Competition> {
    const { data, error } = await (supabase as any)
      .from('exercise_competitions')
      .insert({
        name: params.name,
        description: params.description,
        competition_type: params.type,
        start_date: params.startDate.toISOString(),
        end_date: params.endDate.toISOString(),
        max_participants: params.maxParticipants || 100,
        entry_fee_points: params.entryFee || 0,
        prizes: params.prizes,
        rules: params.rules,
        goal_type: params.goalType,
        goal_value: params.goalValue,
        created_by: this.userId,
        status: 'upcoming',
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapCompetition(data);
  }

  async getActiveCompetitions(): Promise<Competition[]> {
    const { data } = await (supabase as any)
      .from('exercise_competitions')
      .select('*')
      .in('status', ['upcoming', 'active'])
      .order('start_date', { ascending: true })
      .limit(50);

    return (data || []).map((c: Record<string, unknown>) => this.mapCompetition(c));
  }

  async getMyCompetitions(): Promise<CompetitionParticipation[]> {
    const { data } = await (supabase as any)
      .from('exercise_competition_participants')
      .select(`
        *,
        competition:exercise_competitions(*)
      `)
      .eq('user_id', this.userId)
      .limit(100);

    return (data || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      competitionId: p.competition_id as string,
      competition: p.competition ? this.mapCompetition(p.competition as Record<string, unknown>) : undefined,
      currentProgress: p.current_progress as number,
      currentRank: p.current_rank as number,
      pointsEarned: p.points_earned as number,
      joinedAt: new Date(p.joined_at as string),
    }));
  }

  async joinCompetition(competitionId: string, teamId?: string): Promise<void> {
    // Verificar se competição está aberta
    const { data: competition } = await (supabase as any)
      .from('exercise_competitions')
      .select('status, max_participants, entry_fee_points')
      .eq('id', competitionId)
      .maybeSingle();

    if (!competition || competition.status !== 'upcoming') {
      throw new Error('Competição não está aberta para inscrições');
    }

    // Verificar número de participantes
    const { count } = await (supabase as any)
      .from('exercise_competition_participants')
      .select('*', { count: 'exact', head: true })
      .eq('competition_id', competitionId);

    if (count >= competition.max_participants) {
      throw new Error('Competição está cheia');
    }

    // Deduzir taxa de entrada se houver - usando user_points
    if (competition.entry_fee_points > 0) {
      const { data: points } = await supabase
        .from('user_points')
        .select('total_points')
        .eq('user_id', this.userId)
        .maybeSingle();

      if (!points || (points.total_points || 0) < competition.entry_fee_points) {
        throw new Error('Pontos insuficientes para taxa de entrada');
      }

      await supabase
        .from('user_points')
        .update({ 
          total_points: (points.total_points || 0) - competition.entry_fee_points 
        })
        .eq('user_id', this.userId);
    }

    // Inscrever participante
    await (supabase as any).from('exercise_competition_participants').insert({
      competition_id: competitionId,
      user_id: this.userId,
      team_id: teamId,
      current_progress: 0,
      current_rank: 0,
    });
  }

  async getCompetitionLeaderboard(
    competitionId: string,
    limit: number = 50
  ): Promise<CompetitionLeaderboardEntry[]> {
    const { data } = await (supabase as any)
      .from('exercise_competition_participants')
      .select(`
        *,
        profile:profiles(full_name, avatar_url)
      `)
      .eq('competition_id', competitionId)
      .order('current_progress', { ascending: false })
      .limit(limit);

    return (data || []).map((entry: Record<string, unknown>, index: number) => ({
      rank: index + 1,
      oderId: entry.user_id as string,
      userName: (entry.profile as { full_name?: string })?.full_name || 'Usuário',
      avatarUrl: (entry.profile as { avatar_url?: string })?.avatar_url,
      progress: entry.current_progress as number,
      pointsEarned: entry.points_earned as number,
      teamId: entry.team_id as string | undefined,
    }));
  }

  // Tournament bracket system
  async createTournament(params: {
    name: string;
    description: string;
    bracketSize: 8 | 16 | 32 | 64;
    startDate: Date;
    matchDurationDays: number;
    prizes?: CompetitionPrize[];
  }): Promise<Tournament> {
    const { data, error } = await (supabase as any)
      .from('exercise_tournaments')
      .insert({
        name: params.name,
        description: params.description,
        bracket_size: params.bracketSize,
        start_date: params.startDate.toISOString(),
        match_duration_days: params.matchDurationDays,
        prizes: params.prizes,
        created_by: this.userId,
        status: 'registration',
        current_round: 0,
      })
      .select()
      .single();

    if (error) throw error;

    return this.mapTournament(data);
  }

  async getTournamentBracket(tournamentId: string): Promise<TournamentBracket> {
    const { data: tournament } = await (supabase as any)
      .from('exercise_tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single();

    const { data: matches } = await (supabase as any)
      .from('exercise_tournament_matches')
      .select(`
        *,
        player1:profiles!player1_id(full_name, avatar_url),
        player2:profiles!player2_id(full_name, avatar_url)
      `)
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: true })
      .order('match_number', { ascending: true });

    const rounds: TournamentRound[] = [];
    const matchesByRound = new Map<number, TournamentMatch[]>();

    (matches || []).forEach((m: Record<string, unknown>) => {
      const round = m.round as number;
      if (!matchesByRound.has(round)) {
        matchesByRound.set(round, []);
      }
      matchesByRound.get(round)!.push({
        id: m.id as string,
        matchNumber: m.match_number as number,
        player1Id: m.player1_id as string,
        player1Name: (m.player1 as { full_name?: string })?.full_name,
        player1Score: m.player1_score as number,
        player2Id: m.player2_id as string,
        player2Name: (m.player2 as { full_name?: string })?.full_name,
        player2Score: m.player2_score as number,
        winnerId: m.winner_id as string | undefined,
        status: m.status as 'pending' | 'active' | 'completed',
        startDate: m.start_date ? new Date(m.start_date as string) : undefined,
        endDate: m.end_date ? new Date(m.end_date as string) : undefined,
      });
    });

    matchesByRound.forEach((roundMatches, roundNumber) => {
      rounds.push({
        roundNumber,
        roundName: this.getRoundName(roundNumber, tournament?.bracket_size || 8),
        matches: roundMatches,
      });
    });

    return {
      tournamentId,
      tournamentName: tournament?.name || '',
      bracketSize: tournament?.bracket_size || 8,
      currentRound: tournament?.current_round || 0,
      status: tournament?.status || 'registration',
      rounds,
    };
  }

  private getRoundName(round: number, bracketSize: number): string {
    const totalRounds = Math.log2(bracketSize);
    const roundsFromFinal = totalRounds - round;
    
    if (roundsFromFinal === 0) return 'Final';
    if (roundsFromFinal === 1) return 'Semifinal';
    if (roundsFromFinal === 2) return 'Quartas de Final';
    if (roundsFromFinal === 3) return 'Oitavas de Final';
    return `Rodada ${round + 1}`;
  }

  // Seasonal events
  async getSeasonalEvents(): Promise<SeasonalEvent[]> {
    const now = new Date().toISOString();
    
    const { data } = await (supabase as any)
      .from('exercise_seasonal_events')
      .select('*')
      .lte('start_date', now)
      .gte('end_date', now)
      .eq('is_active', true)
      .limit(20);

    return (data || []).map((e: Record<string, unknown>) => ({
      id: e.id as string,
      name: e.name as string,
      description: e.description as string,
      theme: e.theme as string,
      startDate: new Date(e.start_date as string),
      endDate: new Date(e.end_date as string),
      specialRewards: e.special_rewards as Record<string, unknown>,
      challenges: e.challenges as string[],
      leaderboardId: e.leaderboard_id as string,
    }));
  }

  async joinSeasonalEvent(eventId: string): Promise<void> {
    await (supabase as any).from('exercise_seasonal_event_participants').insert({
      event_id: eventId,
      user_id: this.userId,
      progress: 0,
    });
  }

  // Community events
  async createCommunityEvent(params: {
    title: string;
    description: string;
    eventDate: Date;
    eventType: 'workout' | 'challenge' | 'meetup' | 'webinar';
    maxParticipants?: number;
    isVirtual: boolean;
    location?: string;
    meetingLink?: string;
  }): Promise<CommunityEvent> {
    const { data, error } = await (supabase as any)
      .from('exercise_community_events')
      .insert({
        title: params.title,
        description: params.description,
        event_date: params.eventDate.toISOString(),
        event_type: params.eventType,
        max_participants: params.maxParticipants,
        is_virtual: params.isVirtual,
        location: params.location,
        meeting_link: params.meetingLink,
        created_by: this.userId,
        status: 'upcoming',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      eventDate: new Date(data.event_date),
      eventType: data.event_type,
      maxParticipants: data.max_participants,
      currentParticipants: 0,
      isVirtual: data.is_virtual,
      location: data.location,
      meetingLink: data.meeting_link,
      createdBy: data.created_by,
      status: data.status,
    };
  }

  async getUpcomingCommunityEvents(limit: number = 10): Promise<CommunityEvent[]> {
    const now = new Date().toISOString();
    
    const { data } = await (supabase as any)
      .from('exercise_community_events')
      .select(`
        *,
        participant_count:exercise_community_event_participants(count)
      `)
      .gte('event_date', now)
      .eq('status', 'upcoming')
      .order('event_date', { ascending: true })
      .limit(limit);

    return (data || []).map((e: Record<string, unknown>) => ({
      id: e.id as string,
      title: e.title as string,
      description: e.description as string,
      eventDate: new Date(e.event_date as string),
      eventType: e.event_type as 'workout' | 'challenge' | 'meetup' | 'webinar',
      maxParticipants: e.max_participants as number | undefined,
      currentParticipants: (e.participant_count as { count: number }[])?.[0]?.count || 0,
      isVirtual: e.is_virtual as boolean,
      location: e.location as string | undefined,
      meetingLink: e.meeting_link as string | undefined,
      createdBy: e.created_by as string,
      status: e.status as 'upcoming' | 'active' | 'completed' | 'cancelled',
    }));
  }

  async joinCommunityEvent(eventId: string): Promise<void> {
    await (supabase as any).from('exercise_community_event_participants').insert({
      event_id: eventId,
      user_id: this.userId,
    });
  }

  // Helper mappers
  private mapCompetition(data: Record<string, unknown>): Competition {
    return {
      id: data.id as string,
      name: data.name as string,
      description: data.description as string,
      type: data.competition_type as 'individual' | 'team' | 'bracket',
      startDate: new Date(data.start_date as string),
      endDate: new Date(data.end_date as string),
      maxParticipants: data.max_participants as number,
      currentParticipants: data.current_participants as number || 0,
      entryFeePoints: data.entry_fee_points as number,
      prizes: data.prizes as CompetitionPrize[],
      rules: data.rules as string[],
      goalType: data.goal_type as 'points' | 'workouts' | 'minutes' | 'calories',
      goalValue: data.goal_value as number | undefined,
      status: data.status as 'upcoming' | 'active' | 'completed' | 'cancelled',
      createdBy: data.created_by as string,
    };
  }

  private mapTournament(data: Record<string, unknown>): Tournament {
    return {
      id: data.id as string,
      name: data.name as string,
      description: data.description as string,
      bracketSize: data.bracket_size as 8 | 16 | 32 | 64,
      startDate: new Date(data.start_date as string),
      matchDurationDays: data.match_duration_days as number,
      prizes: data.prizes as CompetitionPrize[],
      currentRound: data.current_round as number,
      status: data.status as 'registration' | 'active' | 'completed',
      createdBy: data.created_by as string,
    };
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createSocialHub(userId: string): SocialHub {
  return new SocialHub(userId);
}

export default SocialHub;
