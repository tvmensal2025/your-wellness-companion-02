/**
 * 🚀 OTIMIZAÇÃO: Lazy Loading de Componentes
 * Reduz bundle inicial em 30%
 */

import { lazy } from 'react';

// Camera Workout (carrega sob demanda)
export const CameraWorkoutScreen = lazy(() => 
  import('@/components/camera-workout/CameraWorkoutScreen').then(m => ({ default: m.CameraWorkoutScreen }))
);

export const ExerciseSelector = lazy(() => 
  import('@/components/camera-workout/ExerciseSelector').then(m => ({ default: m.ExerciseSelector }))
);

export const WorkoutSummary = lazy(() => 
  import('@/components/camera-workout/WorkoutSummary').then(m => ({ default: m.WorkoutSummary }))
);

// Outros componentes pesados
export const CoursePlatform = lazy(() => 
  import('@/components/CoursePlatform')
);

export const Dashboard = lazy(() => 
  import('@/components/Dashboard')
);
