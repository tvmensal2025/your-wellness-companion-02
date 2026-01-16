/**
 * Tipos compartilhados para Exercise Components
 * Usados por: UnifiedTimer, ExerciseChallengeCard, ExerciseDetailModal, SavedProgramView, BuddyWorkoutCard
 */

// ============================================
// UnifiedTimer Types
// ============================================

export type TimerVariant = 'full' | 'compact' | 'inline' | 'mini';

export interface UnifiedTimerProps {
  seconds?: number;
  defaultSeconds?: number;
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
  className?: string;
  variant?: TimerVariant;
  showSkip?: boolean;
  showAdjustments?: boolean;
  showPresets?: boolean;
  showMotivation?: boolean;
  showProgress?: boolean;
  soundEnabled?: boolean;
  onCountdownBeep?: () => void;
  onFinishBeep?: () => void;
  nextExerciseName?: string;
  nextSetNumber?: number;
  totalSets?: number;
  externalSoundEnabled?: boolean;
}

export interface TimerLogic {
  seconds: number;
  isRunning: boolean;
  progress: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  adjustTime: (delta: number) => void;
  setPreset: (seconds: number) => void;
}

export interface TimerSoundLogic {
  soundEnabled: boolean;
  toggleSound: () => void;
  playCountdownBeep: () => void;
  playFinishBeep: () => void;
}

// ============================================
// ExerciseChallenge Types
// ============================================

export interface ChallengeExercise {
  value: string;
  label: string;
  emoji: string;
}

export interface ChallengeType {
  value: string;
  label: string;
  description: string;
}

export interface ChallengeLogic {
  selectedExercise: string;
  setSelectedExercise: (exercise: string) => void;
  selectedOpponent: string | null;
  setSelectedOpponent: (opponent: string | null) => void;
  challengeType: string;
  setChallengeType: (type: string) => void;
  targetReps: number;
  setTargetReps: (reps: number) => void;
  isCreating: boolean;
  createChallenge: () => Promise<void>;
  acceptChallenge: (challengeId: string) => Promise<void>;
  declineChallenge: (challengeId: string) => Promise<void>;
}

// ============================================
// ExerciseDetail Types
// ============================================

export type ExerciseStep = 'overview' | 'instructions' | 'execution';

export interface ExerciseDetailLogic {
  currentStep: ExerciseStep;
  setCurrentStep: (step: ExerciseStep) => void;
  timerSeconds: number;
  isTimerRunning: boolean;
  currentSet: number;
  totalSets: number;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  nextSet: () => void;
  previousSet: () => void;
}

export interface ExerciseFeedbackLogic {
  userFeedback: 'facil' | 'medio' | 'dificil' | null;
  feedbackSaving: boolean;
  saveFeedback: (feedback: 'facil' | 'medio' | 'dificil') => Promise<void>;
}

// ============================================
// SavedProgram Types
// ============================================

export interface ProgramDay {
  dayNumber: number;
  name: string;
  exercises: ProgramExercise[];
  isRestDay?: boolean;
}

export interface ProgramExercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  notes?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export interface SavedProgramLogic {
  selectedDay: number | null;
  setSelectedDay: (day: number | null) => void;
  expandedExercise: string | null;
  setExpandedExercise: (id: string | null) => void;
  isEditing: boolean;
  toggleEditing: () => void;
  programDays: ProgramDay[];
}

// ============================================
// BuddyWorkout Types
// ============================================

export type BuddyWorkoutStatus = 'idle' | 'inviting' | 'waiting' | 'active' | 'completed';

export interface BuddyInfo {
  id: string;
  name: string;
  avatarUrl?: string;
  level?: number;
}

export interface BuddyWorkoutLogic {
  selectedBuddy: BuddyInfo | null;
  setSelectedBuddy: (buddy: BuddyInfo | null) => void;
  workoutStatus: BuddyWorkoutStatus;
  sendInvite: () => Promise<void>;
  acceptInvite: (inviteId: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
  completeWorkout: () => Promise<void>;
  buddyProgress: number;
  myProgress: number;
}

// ============================================
// Shared Exercise Types
// ============================================

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroups: string[];
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  imageUrl?: string;
  instructions?: string[];
  tips?: string[];
}

export interface WorkoutSet {
  setNumber: number;
  reps: number;
  weight?: number;
  restSeconds: number;
  completed: boolean;
}

export interface ExerciseProgress {
  exerciseId: string;
  completedSets: number;
  totalSets: number;
  feedback?: 'facil' | 'medio' | 'dificil';
  completedAt?: Date;
}
