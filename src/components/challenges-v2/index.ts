// =====================================================
// SISTEMA DE DESAFIOS V2 - EXPORTS
// =====================================================

// Componentes principais
export { ChallengesPageV2, default as ChallengesPageV2Default } from './ChallengesPageV2';
export { ChallengesDashboard, default as ChallengesDashboardDefault } from './ChallengesDashboard';

// Jornadas
export { JourneyCard, default as JourneyCardDefault } from './journey/JourneyCard';
export { JourneyMap, default as JourneyMapDefault } from './journey/JourneyMap';

// Desafios Individuais
export { IndividualChallengeCard, default as IndividualChallengeCardDefault } from './individual/IndividualChallengeCard';
export { ChallengeProgressModal, default as ChallengeProgressModalDefault } from './individual/ChallengeProgressModal';

// Flash Challenges
export { FlashChallengeBanner, default as FlashChallengeBannerDefault } from './flash/FlashChallengeBanner';

// Duelos
export { DuelCard, default as DuelCardDefault } from './duels/DuelCard';
export { CreateDuelModal, default as CreateDuelModalDefault } from './duels/CreateDuelModal';
export { DuelVsDisplay, default as DuelVsDisplayDefault } from './duels/DuelVsDisplay';

// Ligas
export { LeagueCard, default as LeagueCardDefault } from './leagues/LeagueCard';
export { LeagueRanking, default as LeagueRankingDefault } from './leagues/LeagueRanking';
export { LeagueBadge, default as LeagueBadgeDefault } from './leagues/LeagueBadge';

// Times
export { TeamCard, default as TeamCardDefault } from './teams/TeamCard';
export { CreateTeamModal, default as CreateTeamModalDefault } from './teams/CreateTeamModal';

// Eventos
export { SeasonalEventBanner, default as SeasonalEventBannerDefault } from './events/SeasonalEventBanner';
export { EventChallengeList, default as EventChallengeListDefault } from './events/EventChallengeList';

// Power-ups
export { PowerupInventory, default as PowerupInventoryDefault } from './powerups/PowerupInventory';
export { PowerupCard, default as PowerupCardDefault } from './powerups/PowerupCard';

// Conquistas
export { AchievementCard, default as AchievementCardDefault } from './achievements/AchievementCard';
export { RecentAchievements, default as RecentAchievementsDefault } from './achievements/RecentAchievements';

// Types re-export
export type {
  LeagueTier,
  PowerupType,
  DuelStatus,
  ChallengeMode,
  IndividualChallenge,
  IndividualParticipation,
  ChallengeDuel,
  ChallengeTeam,
  UserLeague,
  SeasonalEvent,
  FlashChallenge,
  UserPowerup,
} from '@/types/challenges-v2';
