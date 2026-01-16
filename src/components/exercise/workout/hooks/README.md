# Workout Custom Hooks

This directory contains custom hooks extracted from `ActiveWorkoutModal.tsx` to manage workout-related logic.

## Planned Hooks

### `useWorkoutTimer.ts`
Manages workout timer state and logic:
- Timer countdown
- Rest period management
- Auto-advance to next exercise
- Pause/resume functionality

### `useWorkoutState.ts`
Manages overall workout state:
- Current exercise tracking
- Set completion
- Workout progress
- Exercise history

### `useExerciseData.ts`
Manages exercise data fetching and caching:
- Load exercise details
- Fetch workout program
- Cache exercise information

## Design Principles

1. **Single Responsibility**: Each hook handles one aspect of workout logic
2. **Reusability**: Hooks can be used independently or combined
3. **Type Safety**: All hooks use TypeScript interfaces from `src/types/`
4. **Correct Dependencies**: All React hooks follow exhaustive-deps rules
5. **Error Handling**: Proper error handling with user feedback

## Usage Example

```typescript
import { useWorkoutTimer } from './hooks/useWorkoutTimer';
import { useWorkoutState } from './hooks/useWorkoutState';

const WorkoutComponent = () => {
  const { time, isRunning, start, pause, reset } = useWorkoutTimer();
  const { currentExercise, nextExercise, completeSet } = useWorkoutState();
  
  // Component logic...
};
```

## Requirements

- **Requirement 2.1**: All hooks must have correct dependencies
- **Requirement 2.2**: Use useCallback for functions in dependencies
- **Requirement 3.1**: Replace any types with specific TypeScript types
- **Requirement 9.4**: Follow React Hooks rules
