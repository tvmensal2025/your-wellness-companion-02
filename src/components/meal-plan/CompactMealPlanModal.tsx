/**
 * CompactMealPlanModal - Re-export for backward compatibility
 * 
 * This file re-exports from the refactored modular structure.
 * The actual implementation is in ./compact-meal-plan/
 * 
 * @see ./compact-meal-plan/index.tsx for the main implementation
 * @see ./compact-meal-plan/README.md for documentation
 */

// Re-export everything from the new modular structure
export { 
  CompactMealPlanModal,
  MealCard,
  MacrosDisplay,
  MealNavigation,
  PrintButton,
  useCompactMealPlanLogic,
} from './compact-meal-plan';

// Re-export types
export type { CompactMealPlanModalProps } from './compact-meal-plan';

// Default export for compatibility
export { default } from './compact-meal-plan';
