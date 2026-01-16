/**
 * @deprecated This file has been refactored into a modular structure.
 * Please use the new path: @/components/exercise/onboarding
 * 
 * This file is kept for backwards compatibility and will be removed in a future version.
 * 
 * Refactoring details:
 * - Original file: 1,318 lines (monolithic)
 * - New structure: Modular components in src/components/exercise/onboarding/
 *   - index.tsx: Main orchestrator (~300 lines)
 *   - steps/WelcomeStep.tsx: Welcome screen
 *   - steps/GoalsStep.tsx: Level selection (question 1)
 *   - steps/ExperienceStep.tsx: Experience selection (question 2)
 *   - steps/EquipmentStep.tsx: Equipment selection (question 5b)
 *   - hooks/useOnboardingState.ts: All state management logic
 * 
 * Benefits of refactoring:
 * - Better maintainability (smaller, focused components)
 * - Easier testing (isolated components)
 * - Improved code reusability
 * - Clearer separation of concerns
 */

// Re-export from the new location for backwards compatibility
export { ExerciseOnboardingModal } from './onboarding';
export type { ExerciseOnboardingModalProps } from './onboarding';

// Note: This re-export ensures existing imports continue to work
// while allowing gradual migration to the new path
