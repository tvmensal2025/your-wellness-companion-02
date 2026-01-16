import { useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useExerciseProgram } from '@/hooks/useExerciseProgram';
import { supabase } from '@/integrations/supabase/client';
import { parseWeekPlan } from '@/utils/workoutParser';
import { generateRecommendation, UserAnswers } from '@/hooks/useExerciseRecommendation';
import { useExerciseProfileData } from '@/hooks/useExerciseProfileData';

// Step types for the onboarding flow
export type Step = 'welcome' | 'question1' | 'question2' | 'question3' | 'question3b' | 'question4' | 'question4b' | 'question4c' | 'question5' | 'question5b' | 'question6' | 'question7' | 'question8' | 'question9' | 'result';

// User answers interface
interface Answers {
  level: string;
  experience: string;
  time: string;
  frequency: string;
  location: string;
  goals: string[]; // Array for multiple goals (max 2)
  limitation: string;
  bodyFocus: string;
  specialCondition: string;
  selectedDays: string[];
  trainingSplit: string;
  exercisesPerDay: string;
  dayAssignments: Record<string, string>;
}

// Initial state for answers
const initialAnswers: Answers = {
  level: '',
  experience: '',
  time: '',
  frequency: '',
  location: '',
  goals: [],
  limitation: '',
  bodyFocus: '',
  specialCondition: '',
  selectedDays: [],
  trainingSplit: '',
  exercisesPerDay: '',
  dayAssignments: {},
};

/**
 * Custom hook to manage onboarding state and logic
 * Extracts all state management from ExerciseOnboardingModal
 */
export const useOnboardingState = (user?: User | null) => {
  // State management
  const [step, setStep] = useState<Step>('welcome');
  const [stepHistory, setStepHistory] = useState<Step[]>([]);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [saving, setSaving] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Hooks
  const { saveProgram } = useExerciseProgram(user?.id);
  const { toast } = useToast();
  const { profileData, isLoading: profileLoading } = useExerciseProfileData(user?.id);

  // Progress calculation
  const totalSteps = 10;
  const currentStep = step === 'welcome' ? 0 : 
                     step === 'question1' ? 1 :
                     step === 'question2' ? 2 :
                     step === 'question3' ? 3 :
                     step === 'question3b' ? 4 :
                     step === 'question4' ? 5 :
                     step === 'question4b' ? 6 :
                     step === 'question4c' ? 7 :
                     step === 'question5' ? 8 :
                     step === 'question5b' ? 8 :
                     step === 'question6' ? 9 :
                     step === 'question7' ? 10 :
                     step === 'question8' ? 10 :
                     step === 'question9' ? 10 : 11;

  const progress = (currentStep / (totalSteps + 1)) * 100;

  // Navigation functions
  const goToNextStep = useCallback((nextStep: Step) => {
    setStepHistory(prev => [...prev, step]);
    setStep(nextStep);
  }, [step]);

  const goToPreviousStep = useCallback(() => {
    if (stepHistory.length > 0) {
      const prevStep = stepHistory[stepHistory.length - 1];
      setStepHistory(prev => prev.slice(0, -1));
      setStep(prevStep);
    }
  }, [stepHistory]);

  // Answer handlers
  const handleAnswer = useCallback((question: keyof Answers, value: string | string[] | Record<string, string>) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  }, []);

  const handleSingleSelect = useCallback((question: keyof Answers, value: string, nextStep: Step) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    handleAnswer(question, value);
    setTimeout(() => {
      goToNextStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, handleAnswer, goToNextStep]);

  // Helper functions
  const getMaxDaysFromFrequency = useCallback((freq: string): number => {
    if (freq === '2-3x') return 3;
    if (freq === '4-5x') return 5;
    if (freq === '6x') return 6;
    return 3;
  }, []);

  const getDefaultSplit = useCallback((daysCount: number): string => {
    if (daysCount <= 2) return 'AB';
    if (daysCount === 3) return 'ABC';
    if (daysCount === 4) return 'ABCD';
    if (daysCount >= 5) return 'ABCDE';
    return 'ABC';
  }, []);

  // Save onboarding answers to profile
  const saveOnboardingAnswers = useCallback(async (): Promise<boolean> => {
    if (!user?.id) {
      console.warn('⚠️ Usuário não logado, pulando salvamento de preferências');
      return true;
    }

    try {
      console.log('💾 Tentando salvar respostas do onboarding no perfil...');
      
      const exercisePreferences = {
        level: answers.level,
        experience: answers.experience,
        time: answers.time,
        frequency: answers.frequency,
        location: answers.location,
        goals: answers.goals,
        limitation: answers.limitation,
        bodyFocus: answers.bodyFocus,
        specialCondition: answers.specialCondition,
        selectedDays: answers.selectedDays,
        trainingSplit: answers.trainingSplit,
        exercisesPerDay: answers.exercisesPerDay,
        dayAssignments: answers.dayAssignments,
        completedAt: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: {
            exercise: exercisePreferences
          }
        } as any)
        .eq('user_id', user.id);

      if (error) {
        console.warn('⚠️ Não foi possível salvar preferências (coluna pode não existir):', error.message);
        return true;
      }

      console.log('✅ Preferências de exercício salvas com sucesso!');
      return true;
    } catch (error) {
      console.warn('⚠️ Erro ao salvar preferências (ignorando):', error);
      return true;
    }
  }, [user?.id, answers]);

  // Save program and complete onboarding
  const handleSaveProgram = useCallback(async () => {
    setSaving(true);
    
    // 1. Save onboarding answers to profile
    const preferencesSaved = await saveOnboardingAnswers();
    if (!preferencesSaved) {
      setSaving(false);
      return false;
    }
    
    // 2. Generate recommendation
    const fullAnswers: UserAnswers = {
      ...answers,
      gender: profileData.gender,
      ageGroup: profileData.ageGroup
    };
    const recommendation = generateRecommendation(fullAnswers);
    
    // 3. Save exercise program
    const parsedWeekPlan = parseWeekPlan(recommendation.weekPlan);
    
    const programSaved = await saveProgram({
      ...recommendation,
      weekPlan: parsedWeekPlan,
      level: answers.level,
      experience: answers.experience,
      location: answers.location,
      goal: answers.goals[0] || '',
      limitation: answers.limitation
    });
    
    setSaving(false);
    
    if (programSaved) {
      toast({
        title: "🎉 Tudo Pronto!",
        description: "Suas preferências foram salvas e seu treino personalizado foi criado!",
        duration: 5000
      });
      return true;
    }
    
    return false;
  }, [answers, profileData, saveOnboardingAnswers, saveProgram, toast]);

  // Reset to welcome screen
  const resetOnboarding = useCallback(() => {
    setStep('welcome');
    setStepHistory([]);
    setAnswers(initialAnswers);
    setSaving(false);
    setIsTransitioning(false);
  }, []);

  return {
    // State
    step,
    stepHistory,
    answers,
    saving,
    isTransitioning,
    profileData,
    profileLoading,
    
    // Progress
    currentStep,
    totalSteps,
    progress,
    
    // Navigation
    goToNextStep,
    goToPreviousStep,
    setStep,
    
    // Answer handlers
    handleAnswer,
    handleSingleSelect,
    setAnswers,
    
    // Helper functions
    getMaxDaysFromFrequency,
    getDefaultSplit,
    
    // Save functions
    handleSaveProgram,
    resetOnboarding,
    
    // Computed values
    canGoBack: stepHistory.length > 0,
  };
};
