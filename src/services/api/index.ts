/**
 * 📦 API Services - Exports
 */

// User Service
export {
  fetchCompleteUserData,
  fetchUserProfile,
  fetchUserPhysicalData,
  updateUserProfile,
  updateUserPhysicalData,
  updateUserPreferences,
  checkIsAdmin,
  getCurrentUserId,
  type UserProfile,
  type UserPhysicalData,
  type UserPreferences,
  type CompleteUserData,
} from './userService';

// Gamification Service
export {
  fetchGamificationData,
  fetchUserPoints,
  fetchUserStreak,
  fetchUserAchievements,
  addPoints,
  incrementMissionsCompleted,
  incrementChallengesCompleted,
  updateStreak,
  calculateLevel,
  calculateXPToNextLevel,
  calculateLevelProgress,
  LEVEL_THRESHOLDS,
  type UserPoints,
  type GamificationData,
  type Achievement,
} from './gamificationService';

// Ranking Service
export {
  fetchRankingPaginated,
  fetchTopRanking,
  fetchUserPosition,
  fetchRankingWithContext,
  fetchRankingStats,
  type RankingUser,
  type PaginatedRanking,
  type UserRankingPosition,
} from './rankingService';

// Community Service
export {
  fetchFeedPage,
  fetchUserPosts,
  createPost,
  toggleLike,
  fetchFollowStats,
  checkIsFollowing,
  toggleFollow,
  type FeedPost,
  type FeedPage,
  type FollowStats,
} from './communityService';
