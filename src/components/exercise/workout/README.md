# Exercise Workout Components

This directory contains the refactored components from `ActiveWorkoutModal.tsx` (originally 1,275 lines).

## Structure

```
workout/
├── hooks/              # Custom hooks for workout logic
├── WorkoutTimer.tsx    # Timer component for workout sessions
├── ExerciseDisplay.tsx # Display component for current exercise
├── ProgressTracker.tsx # Progress tracking component
└── index.tsx           # Main orchestrator component
```

## Purpose

This refactoring breaks down the large `ActiveWorkoutModal` component into smaller, focused components following the single responsibility principle.

## Components to Extract

1. **WorkoutTimer.tsx** - Handles workout timing and rest periods
2. **ExerciseDisplay.tsx** - Displays current exercise information
3. **ProgressTracker.tsx** - Tracks and displays workout progress

## Custom Hooks

The `hooks/` directory will contain:
- Workout state management logic
- Timer logic
- Progress tracking logic

## Requirements

This refactoring addresses:
- **Requirement 1.6**: Divide ActiveWorkoutModal.tsx into smaller components
- **Requirement 1.1**: Ensure no component exceeds 500 lines
- **Requirement 1.13**: Use @/ alias for imports
- **Requirement 1.14**: Maintain existing functionality without breaking changes

## Next Steps

1. Extract WorkoutTimer component
2. Extract ExerciseDisplay component
3. Extract ProgressTracker component
4. Create custom hooks for shared logic
5. Create main index.tsx orchestrator
6. Update imports in parent components
7. Test functionality
