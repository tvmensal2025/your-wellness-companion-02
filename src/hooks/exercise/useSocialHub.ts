// ============================================
// 👥 SOCIAL HUB HOOK
// Hook para funcionalidades sociais
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSocialHub } from '@/services/exercise/socialHub';
import type {
  Competition,
  CompetitionPrize,
  Tournament,
  CommunityEvent,
} from '@/types/advanced-exercise-system';

export function useSocialHub(userId: string | undefined) {
  const queryClient = useQueryClient();
  const enabled = !!userId;

  // Meus grupos
  const { data: myGroups, isLoading: isLoadingGroups } = useQuery({
    queryKey: ['social-my-groups', userId],
    queryFn: async () => {
      if (!userId) return [];
      const hub = createSocialHub(userId);
      return hub.getMyGroups();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Grupos públicos
  const { data: publicGroups } = useQuery({
    queryKey: ['social-public-groups'],
    queryFn: async () => {
      if (!userId) return [];
      const hub = createSocialHub(userId);
      return hub.getPublicGroups();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Sessões ao vivo
  const { data: liveSessions } = useQuery({
    queryKey: ['social-live-sessions'],
    queryFn: async () => {
      if (!userId) return [];
      const hub = createSocialHub(userId);
      return hub.getActiveSessions();
    },
    enabled,
    staleTime: 30 * 1000, // Atualiza frequentemente
  });

  // Meus encorajamentos
  const { data: encouragements } = useQuery({
    queryKey: ['social-encouragements', userId],
    queryFn: async () => {
      if (!userId) return [];
      const hub = createSocialHub(userId);
      return hub.getMyEncouragements();
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  // Meus buddies
  const { data: buddies } = useQuery({
    queryKey: ['social-buddies', userId],
    queryFn: async () => {
      if (!userId) return [];
      const hub = createSocialHub(userId);
      return hub.getMyBuddies();
    },
    enabled,
    staleTime: 10 * 60 * 1000,
  });

  // ============================================
  // COMPETITIONS & TOURNAMENTS
  // ============================================

  // Competições ativas
  const { data: activeCompetitions, isLoading: isLoadingCompetitions } = useQuery({
    queryKey: ['social-competitions-active'],
    queryFn: async () => {
      if (!userId) return [];
      const hub = createSocialHub(userId);
      return hub.getActiveCompetitions();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Minhas competições
  const { data: myCompetitions } = useQuery({
    queryKey: ['social-my-competitions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const hub = createSocialHub(userId);
      return hub.getMyCompetitions();
    },
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  // Eventos sazonais
  const { data: seasonalEvents } = useQuery({
    queryKey: ['social-seasonal-events'],
    queryFn: async () => {
      if (!userId) return [];
      const hub = createSocialHub(userId);
      return hub.getSeasonalEvents();
    },
    enabled,
    staleTime: 30 * 60 * 1000,
  });

  // Eventos da comunidade
  const { data: communityEvents } = useQuery({
    queryKey: ['social-community-events'],
    queryFn: async () => {
      if (!userId) return [];
      const hub = createSocialHub(userId);
      return hub.getUpcomingCommunityEvents();
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Criar grupo
  const createGroup = useMutation({
    mutationFn: async ({
      name,
      description,
      isPublic,
    }: {
      name: string;
      description: string;
      isPublic?: boolean;
    }) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.createGroup(name, description, isPublic);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-my-groups', userId] });
    },
  });

  // Entrar em grupo
  const joinGroup = useMutation({
    mutationFn: async (groupId: string) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.joinGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-my-groups', userId] });
    },
  });

  // Sair de grupo
  const leaveGroup = useMutation({
    mutationFn: async (groupId: string) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.leaveGroup(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-my-groups', userId] });
    },
  });

  // Iniciar sessão ao vivo
  const startLiveSession = useMutation({
    mutationFn: async (groupId?: string) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.startLiveSession(groupId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-live-sessions'] });
    },
  });

  // Enviar encorajamento
  const sendEncouragement = useMutation({
    mutationFn: async ({
      toUserId,
      type,
      message,
    }: {
      toUserId: string;
      type: 'cheer' | 'high_five' | 'motivation' | 'celebration';
      message?: string;
    }) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.sendEncouragement(toUserId, type, message);
    },
  });

  // Buscar buddies compatíveis
  const findBuddies = useMutation({
    mutationFn: async (limit?: number) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.findWorkoutBuddies(limit);
    },
  });

  // Enviar pedido de buddy
  const sendBuddyRequest = useMutation({
    mutationFn: async ({ toUserId, message }: { toUserId: string; message?: string }) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.sendBuddyRequest(toUserId, message);
    },
  });

  // ============================================
  // COMPETITION MUTATIONS
  // ============================================

  // Criar competição
  const createCompetition = useMutation({
    mutationFn: async (params: {
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
    }) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.createCompetition(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-competitions-active'] });
    },
  });

  // Entrar em competição
  const joinCompetition = useMutation({
    mutationFn: async ({ competitionId, teamId }: { competitionId: string; teamId?: string }) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.joinCompetition(competitionId, teamId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-my-competitions', userId] });
      queryClient.invalidateQueries({ queryKey: ['social-competitions-active'] });
    },
  });

  // Buscar leaderboard de competição
  const getCompetitionLeaderboard = async (competitionId: string, limit?: number) => {
    if (!userId) return [];
    const hub = createSocialHub(userId);
    return hub.getCompetitionLeaderboard(competitionId, limit);
  };

  // Criar torneio
  const createTournament = useMutation({
    mutationFn: async (params: {
      name: string;
      description: string;
      bracketSize: 8 | 16 | 32 | 64;
      startDate: Date;
      matchDurationDays: number;
      prizes?: CompetitionPrize[];
    }) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.createTournament(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-competitions-active'] });
    },
  });

  // Buscar bracket de torneio
  const getTournamentBracket = async (tournamentId: string) => {
    if (!userId) return null;
    const hub = createSocialHub(userId);
    return hub.getTournamentBracket(tournamentId);
  };

  // Entrar em evento sazonal
  const joinSeasonalEvent = useMutation({
    mutationFn: async (eventId: string) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.joinSeasonalEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-seasonal-events'] });
    },
  });

  // Criar evento da comunidade
  const createCommunityEvent = useMutation({
    mutationFn: async (params: {
      title: string;
      description: string;
      eventDate: Date;
      eventType: 'workout' | 'challenge' | 'meetup' | 'webinar';
      maxParticipants?: number;
      isVirtual: boolean;
      location?: string;
      meetingLink?: string;
    }) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.createCommunityEvent(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-community-events'] });
    },
  });

  // Entrar em evento da comunidade
  const joinCommunityEvent = useMutation({
    mutationFn: async (eventId: string) => {
      if (!userId) throw new Error('User ID required');
      const hub = createSocialHub(userId);
      return hub.joinCommunityEvent(eventId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-community-events'] });
    },
  });

  return {
    // Groups
    myGroups,
    publicGroups,
    liveSessions,
    encouragements,
    buddies,
    createGroup,
    joinGroup,
    leaveGroup,
    startLiveSession,
    sendEncouragement,
    findBuddies,
    sendBuddyRequest,

    // Competitions & Tournaments
    activeCompetitions,
    myCompetitions,
    seasonalEvents,
    communityEvents,
    createCompetition,
    joinCompetition,
    getCompetitionLeaderboard,
    createTournament,
    getTournamentBracket,
    joinSeasonalEvent,
    createCommunityEvent,
    joinCommunityEvent,

    // Loading states
    isLoading: isLoadingGroups,
    isLoadingCompetitions,
  };
}

export default useSocialHub;
