/**
 * 🔑 Cache Keys Centralizados
 * 
 * Todas as chaves de cache do React Query em um único lugar.
 * Isso garante consistência e facilita invalidação.
 */

export const CACHE_KEYS = {
  // ═══════════════════════════════════════════════════════════
  // 👤 USUÁRIO ATUAL
  // ═══════════════════════════════════════════════════════════
  currentUser: (userId: string) => ['user', 'current', userId] as const,
  userProfile: (userId: string) => ['user', 'profile', userId] as const,
  userPhysicalData: (userId: string) => ['user', 'physical', userId] as const,
  userPreferences: (userId: string) => ['user', 'preferences', userId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 🎮 GAMIFICAÇÃO
  // ═══════════════════════════════════════════════════════════
  gamification: (userId: string) => ['gamification', userId] as const,
  userPoints: (userId: string) => ['gamification', 'points', userId] as const,
  userStreak: (userId: string) => ['gamification', 'streak', userId] as const,
  userLevel: (userId: string) => ['gamification', 'level', userId] as const,
  userAchievements: (userId: string) => ['gamification', 'achievements', userId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 🏆 RANKING
  // ═══════════════════════════════════════════════════════════
  ranking: () => ['ranking'] as const,
  rankingPaginated: (page: number, limit: number) => ['ranking', 'page', page, limit] as const,
  rankingTop: (limit: number) => ['ranking', 'top', limit] as const,
  userPosition: (userId: string) => ['ranking', 'position', userId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 📱 COMUNIDADE / FEED
  // ═══════════════════════════════════════════════════════════
  feed: () => ['feed'] as const,
  feedInfinite: () => ['feed', 'infinite'] as const,
  feedPage: (page: number) => ['feed', 'page', page] as const,
  feedPost: (postId: string) => ['feed', 'post', postId] as const,
  feedComments: (postId: string) => ['feed', 'comments', postId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 👥 PERFIL DE OUTROS USUÁRIOS
  // ═══════════════════════════════════════════════════════════
  profile: (userId: string) => ['profile', userId] as const,
  profileStats: (userId: string) => ['profile', 'stats', userId] as const,
  profilePosts: (userId: string) => ['profile', 'posts', userId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 🤝 FOLLOWS
  // ═══════════════════════════════════════════════════════════
  followers: (userId: string) => ['follows', 'followers', userId] as const,
  following: (userId: string) => ['follows', 'following', userId] as const,
  followStatus: (followerId: string, followingId: string) => 
    ['follows', 'status', followerId, followingId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 🎯 DESAFIOS
  // ═══════════════════════════════════════════════════════════
  challenges: () => ['challenges'] as const,
  challengeActive: () => ['challenges', 'active'] as const,
  challengeParticipation: (userId: string, challengeId: string) => 
    ['challenges', 'participation', userId, challengeId] as const,
  userChallenges: (userId: string) => ['challenges', 'user', userId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 📊 MISSÕES DIÁRIAS
  // ═══════════════════════════════════════════════════════════
  dailyMissions: (userId: string, date: string) => ['missions', userId, date] as const,
  missionProgress: (userId: string) => ['missions', 'progress', userId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 🍎 NUTRIÇÃO
  // ═══════════════════════════════════════════════════════════
  nutritionToday: (userId: string) => ['nutrition', 'today', userId] as const,
  nutritionHistory: (userId: string) => ['nutrition', 'history', userId] as const,
  mealPlan: (userId: string) => ['nutrition', 'mealplan', userId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 🏋️ EXERCÍCIOS
  // ═══════════════════════════════════════════════════════════
  exerciseProgram: (userId: string) => ['exercise', 'program', userId] as const,
  exerciseProgress: (userId: string) => ['exercise', 'progress', userId] as const,
  exerciseHistory: (userId: string) => ['exercise', 'history', userId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 📈 TRACKING
  // ═══════════════════════════════════════════════════════════
  dailyTracking: (userId: string, date: string) => ['tracking', 'daily', userId, date] as const,
  weightHistory: (userId: string) => ['tracking', 'weight', userId] as const,
  healthScore: (userId: string) => ['tracking', 'health-score', userId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 🔔 NOTIFICAÇÕES
  // ═══════════════════════════════════════════════════════════
  notifications: (userId: string) => ['notifications', userId] as const,
  unreadCount: (userId: string) => ['notifications', 'unread', userId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 💬 MENSAGENS
  // ═══════════════════════════════════════════════════════════
  conversations: (userId: string) => ['messages', 'conversations', userId] as const,
  messages: (conversationId: string) => ['messages', 'thread', conversationId] as const,
  
  // ═══════════════════════════════════════════════════════════
  // 🛡️ ADMIN
  // ═══════════════════════════════════════════════════════════
  isAdmin: (userId: string) => ['admin', 'check', userId] as const,
  adminStats: () => ['admin', 'stats'] as const,
} as const;

// Tipo para extrair chaves
export type CacheKey = ReturnType<typeof CACHE_KEYS[keyof typeof CACHE_KEYS]>;
