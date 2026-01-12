/**
 * 📦 Community Hooks - Exports
 */

export { 
  useRankingPaginated,
  useTopRanking,
  useRankingWithContext,
  useUserRankingPosition,
  useRankingStats,
  // Compatibilidade (deprecated)
  useRanking,
  useRealRanking,
  useTopUsers,
} from './useRankingPaginated';

export {
  useFeedInfinite,
  // Compatibilidade (deprecated)
  useFeedPosts,
  useSmartFeed,
} from './useFeedInfinite';
