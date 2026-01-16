# Exercise Onboarding Modal - Refactored Structure

## Overview

This directory contains the refactored Exercise Onboarding Modal, previously a monolithic 1,318-line component. The refactoring improves maintainability, testability, and code organization.

## Structure

```
onboarding/
├── index.tsx                      # Main orchestrator component (~300 lines)
├── hooks/
│   └── useOnboardingState.ts     # All state management logic
└── steps/
    ├── WelcomeStep.tsx           # Welcome screen
    ├── GoalsStep.tsx             # Level selection (question 1)
    ├── ExperienceStep.tsx        # Experience selection (question 2)
    └── EquipmentStep.tsx         # Equipment selection (question 5b)
```

## Components

### Main Orchestrator (`index.tsx`)

The main component that:
- Imports and uses the `useOnboardingState` hook for state management
- Imports all step components
- Renders the appropriate step based on current state
- Handles the Dialog wrapper and progress UI
- Coordinates navigation between steps

**Key Features:**
- Progress bar showing completion percentage
- Back button navigation
- Smooth transitions between steps
- Result screen with personalized recommendations

### State Management Hook (`hooks/useOnboardingState.ts`)

Custom hook that manages:
- All onboarding state (answers, step, history)
- Navigation functions (goToNextStep, goToPreviousStep)
- Answer handlers (handleAnswer, handleSingleSelect)
- Helper functions (getMaxDaysFromFrequency, getDefaultSplit)
- Save functions (handleSaveProgram, saveOnboardingAnswers)
- Profile data integration

### Step Components

#### WelcomeStep
- Initial welcome screen
- Displays program benefits
- Call-to-action to start the journey

#### GoalsStep (Question 1)
- User's current activity level selection
- Options: Sedentário, Leve, Moderado, Avançado

#### ExperienceStep (Question 2)
- User's experience with weight training
- Options: Nenhuma, Pouca, Moderada, Avançada

#### EquipmentStep (Question 5b)
- Available equipment at home
- Only shown if user selects "home" training
- Options: Basic furniture, Resistance bands, Complete home setup

## Inline Questions (Not Extracted)

The following questions remain inline in `index.tsx` as they are simpler and don't warrant separate components:

- **Question 3**: Time per workout
- **Question 3b**: Exercises per day
- **Question 4**: Frequency per week
- **Question 4b**: Day selector (uses DaySelector component)
- **Question 4c**: Day split assigner (uses DaySplitAssigner component)
- **Question 5**: Location (home or gym)
- **Question 6**: Goals (multiple selection)
- **Question 7**: Physical limitations
- **Question 8**: Body focus area
- **Question 9**: Special conditions
- **Result**: Personalized program display

## Usage

```typescript
import { ExerciseOnboardingModal } from '@/components/exercise/onboarding';

<ExerciseOnboardingModal 
  isOpen={isOpen}
  onClose={handleClose}
  user={user}
/>
```

## Benefits of Refactoring

1. **Maintainability**: Smaller, focused components are easier to understand and modify
2. **Testability**: Isolated components can be tested independently
3. **Reusability**: Step components can be reused in other contexts
4. **Separation of Concerns**: State management separated from UI rendering
5. **Code Organization**: Clear structure makes navigation easier
6. **Performance**: Potential for better code splitting and lazy loading

## Migration Notes

The old monolithic file (`src/components/exercise/ExerciseOnboardingModal.tsx`) has been deprecated and now re-exports from this new location for backwards compatibility. All imports have been updated to use the new path.

## Related Files

- `src/components/exercise/DaySelector.tsx` - Day selection component
- `src/components/exercise/DaySplitAssigner.tsx` - Training split assignment
- `src/hooks/useExerciseRecommendation.ts` - Recommendation generation logic
- `src/hooks/useExerciseProgram.ts` - Program saving logic
- `src/hooks/useExerciseProfileData.ts` - Profile data fetching

## Requirements Validated

This refactoring validates:
- **Requirement 1.3**: ExerciseOnboardingModal divided into step components
- **Requirement 1.13**: All imports use @/ alias pattern
- **Requirement 1.14**: Functionality maintained without breaking changes
