/**
 * Índice centralizado de componentes de gamificação
 * Use: import { BadgeSystem, LevelSystem } from '@/components/gamification';
 */

// Core Components
export { BadgeSystem } from './BadgeSystem';
export { LevelSystem } from './LevelSystem';
export { ProgressRing } from './ProgressRing';
export { StreakCounter } from './StreakCounter';
export { DailyChallenge } from './DailyChallenge';
export { CountdownTimer } from './CountdownTimer';

// Dashboard
export { GamifiedDashboard } from './GamifiedDashboard';

// Effects
export { AchievementPopup } from './AchievementPopup';
export { CelebrationEffect } from './CelebrationEffect';
export { ConfettiAnimation } from './ConfettiAnimation';
export { BalloonFireworksEffect } from './BalloonFireworksEffect';

// Cards
export { EnhancedGoalCard } from './EnhancedGoalCard';
export { FlashChallengeCard } from './FlashChallengeCard';
export { LiveRankingCard } from './LiveRankingCard';
export { RealRankingCard } from './RealRankingCard';
export { ProgressStreakDisplay } from './ProgressStreakDisplay';

// Modals
export { UpdateChallengeProgressModal } from './UpdateChallengeProgressModal';

// Types
export type { GameBadge } from './BadgeSystem';
export type { DailyChallenge as DailyChallengeType } from './DailyChallenge';
