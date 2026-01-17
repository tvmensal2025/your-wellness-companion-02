import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  saveWorkoutSession,
  updateWorkoutSession,
  saveRepEvents,
  savePostureEvents,
  syncOfflineData,
  type WorkoutSession,
  type RepEvent,
  type PostureEvent,
} from '@/services/camera-workout/sessionPersistence';
import { updateCameraWorkoutChallengeProgress } from '@/services/camera-workout/challengeIntegration';

interface UseWorkoutSessionReturn {
  sessionId: string | null;
  isActive: boolean;
  stats: {
    totalReps: number;
    duration: number;
    averageFormScore: number;
    caloriesBurned: number;
  };
  startSession: (exerciseType: string) => Promise<void>;
  endSession: () => Promise<void>;
  addRep: (repData: Omit<RepEvent, 'session_id'>) => void;
  addPostureEvent: (eventData: Omit<PostureEvent, 'session_id'>) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  isPaused: boolean;
}

export function useWorkoutSession(): UseWorkoutSessionReturn {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);
  
  const [stats, setStats] = useState({
    totalReps: 0,
    duration: 0,
    averageFormScore: 0,
    caloriesBurned: 0,
  });

  const repEventsQueue = useRef<RepEvent[]>([]);
  const postureEventsQueue = useRef<PostureEvent[]>([]);
  const formScores = useRef<number[]>([]);

  // Atualiza duração a cada segundo
  useEffect(() => {
    if (!isActive || isPaused || !startTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) - pausedTime;
      setStats(prev => ({ ...prev, duration: elapsed }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, startTime, pausedTime]);

  // Sync offline data quando online
  useEffect(() => {
    const handleOnline = () => {
      syncOfflineData();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const startSession = useCallback(async (exerciseType: string) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    const now = new Date();
    setStartTime(now);
    setIsActive(true);
    setIsPaused(false);
    setPausedTime(0);
    setStats({
      totalReps: 0,
      duration: 0,
      averageFormScore: 0,
      caloriesBurned: 0,
    });

    repEventsQueue.current = [];
    postureEventsQueue.current = [];
    formScores.current = [];

    // Cria sessão no banco
    const session: WorkoutSession = {
      user_id: user.id,
      exercise_type: exerciseType,
      started_at: now.toISOString(),
      total_reps: 0,
      total_duration_seconds: 0,
      average_form_score: 0,
    };

    const id = await saveWorkoutSession(session);
    setSessionId(id);
  }, [user]);

  const endSession = useCallback(async () => {
    if (!sessionId || !startTime || !user) return;

    const now = new Date();
    const totalDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000) - pausedTime;
    
    // Calcula média do form score
    const avgFormScore = formScores.current.length > 0
      ? formScores.current.reduce((a, b) => a + b, 0) / formScores.current.length
      : 0;

    // Estima calorias (aproximação: 0.5 cal por rep + 0.1 cal por segundo)
    const calories = Math.round(stats.totalReps * 0.5 + totalDuration * 0.1);

    // Atualiza sessão
    await updateWorkoutSession(sessionId, {
      ended_at: now.toISOString(),
      total_reps: stats.totalReps,
      total_duration_seconds: totalDuration,
      average_form_score: avgFormScore,
      calories_burned: calories,
    });

    // Salva eventos em batch
    if (repEventsQueue.current.length > 0) {
      await saveRepEvents(repEventsQueue.current);
    }
    if (postureEventsQueue.current.length > 0) {
      await savePostureEvents(postureEventsQueue.current);
    }

    // Update camera workout challenge progress
    try {
      await updateCameraWorkoutChallengeProgress(user.id, {
        totalReps: stats.totalReps,
        avgFormScore,
        exerciseType: 'squat', // TODO: Get from session data
      });
    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }

    setIsActive(false);
    setSessionId(null);
    setStartTime(null);
    setPausedTime(0);
    setStats(prev => ({
      ...prev,
      averageFormScore: avgFormScore,
      caloriesBurned: calories,
    }));
  }, [sessionId, startTime, pausedTime, stats.totalReps, user]);

  const addRep = useCallback((repData: Omit<RepEvent, 'session_id'>) => {
    if (!sessionId) return;

    const event: RepEvent = {
      ...repData,
      session_id: sessionId,
    };

    repEventsQueue.current.push(event);
    formScores.current.push(repData.form_score);

    setStats(prev => ({
      ...prev,
      totalReps: prev.totalReps + 1,
    }));

    // Salva em batch a cada 10 reps
    if (repEventsQueue.current.length >= 10) {
      const eventsToSave = [...repEventsQueue.current];
      repEventsQueue.current = [];
      saveRepEvents(eventsToSave);
    }
  }, [sessionId]);

  const addPostureEvent = useCallback((eventData: Omit<PostureEvent, 'session_id'>) => {
    if (!sessionId) return;

    const event: PostureEvent = {
      ...eventData,
      session_id: sessionId,
    };

    postureEventsQueue.current.push(event);

    // Salva em batch a cada 5 eventos
    if (postureEventsQueue.current.length >= 5) {
      const eventsToSave = [...postureEventsQueue.current];
      postureEventsQueue.current = [];
      savePostureEvents(eventsToSave);
    }
  }, [sessionId]);

  const pauseSession = useCallback(() => {
    if (!isActive || isPaused) return;
    setIsPaused(true);
  }, [isActive, isPaused]);

  const resumeSession = useCallback(() => {
    if (!isActive || !isPaused || !startTime) return;
    
    // Adiciona tempo pausado
    const now = new Date();
    const pauseDuration = Math.floor((now.getTime() - startTime.getTime()) / 1000) - stats.duration;
    setPausedTime(prev => prev + pauseDuration);
    
    setIsPaused(false);
  }, [isActive, isPaused, startTime, stats.duration]);

  return {
    sessionId,
    isActive,
    stats,
    startSession,
    endSession,
    addRep,
    addPostureEvent,
    pauseSession,
    resumeSession,
    isPaused,
  };
}
