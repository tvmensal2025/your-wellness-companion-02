// ============================================
// 🤝 USE BUDDY WORKOUT LOGIC
// Lógica de treino em dupla e convites
// ============================================

import { useState, useMemo } from 'react';
import { useFeatureTutorial } from '../../FeatureTutorialPopup';

// ============================================
// TYPES
// ============================================

export interface BuddyStats {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline?: boolean;
  workoutsThisWeek: number;
  workoutsThisMonth: number;
  totalWorkouts: number;
  consecutiveDays: number;
  currentWeight?: number;
  weightChange?: number;
  weeklyPoints: number;
  monthlyPoints: number;
  lastWorkoutDate?: string;
  lastWorkoutType?: string;
  challengesWon: number;
  challengesLost: number;
}

export interface ActiveChallenge {
  id: string;
  type: 'weight_increase' | 'more_workouts' | 'more_reps' | 'consistency';
  title: string;
  description: string;
  createdBy: 'user' | 'buddy';
  targetValue: number;
  userProgress: number;
  buddyProgress: number;
  endsAt: Date;
  prize?: string;
}

// ============================================
// MOCK DATA
// ============================================

const MOCK_BUDDY: BuddyStats = {
  id: 'mock',
  name: 'Carlos',
  isOnline: true,
  workoutsThisWeek: 4,
  workoutsThisMonth: 15,
  totalWorkouts: 89,
  consecutiveDays: 7,
  currentWeight: 78.5,
  weightChange: -2.3,
  weeklyPoints: 1250,
  monthlyPoints: 4800,
  lastWorkoutDate: 'Hoje',
  lastWorkoutType: 'Peito e Tríceps',
  challengesWon: 5,
  challengesLost: 3,
};

const MOCK_USER_STATS: BuddyStats = {
  id: 'user',
  name: 'Você',
  workoutsThisWeek: 3,
  workoutsThisMonth: 12,
  totalWorkouts: 67,
  consecutiveDays: 5,
  currentWeight: 82.0,
  weightChange: -1.5,
  weeklyPoints: 980,
  monthlyPoints: 3900,
  challengesWon: 3,
  challengesLost: 5,
};

// ============================================
// HOOK
// ============================================

interface UseBuddyWorkoutLogicProps {
  buddy?: BuddyStats;
  userStats?: BuddyStats;
}

export function useBuddyWorkoutLogic({ buddy, userStats }: UseBuddyWorkoutLogicProps) {
  // Modal states
  const [showProvocations, setShowProvocations] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [showBuddyStats, setShowBuddyStats] = useState(false);
  
  // Tutorial
  const tutorial = useFeatureTutorial('parceiro_treino');

  // Use mock data if not provided
  const currentBuddy = buddy || MOCK_BUDDY;
  const currentUserStats = userStats || MOCK_USER_STATS;

  // Competition status
  const userIsWinning = currentUserStats.weeklyPoints > currentBuddy.weeklyPoints;
  const pointsDiff = Math.abs(currentUserStats.weeklyPoints - currentBuddy.weeklyPoints);

  // Has buddy
  const hasBuddy = !!buddy || true; // Always true with mock

  return {
    // Data
    currentBuddy,
    currentUserStats,
    userIsWinning,
    pointsDiff,
    hasBuddy,
    
    // Modal states
    showProvocations,
    showChallenges,
    showBuddyStats,
    
    // Actions
    setShowProvocations,
    setShowChallenges,
    setShowBuddyStats,
    
    // Tutorial
    tutorial,
  };
}

export type BuddyWorkoutLogicReturn = ReturnType<typeof useBuddyWorkoutLogic>;
