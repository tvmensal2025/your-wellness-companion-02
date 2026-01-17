import { supabase } from '@/integrations/supabase/client';

export interface WorkoutSession {
  id?: string;
  user_id: string;
  exercise_type: string;
  started_at: string;
  ended_at?: string;
  total_reps: number;
  total_duration_seconds: number;
  average_form_score: number;
  calories_burned?: number;
}

export interface RepEvent {
  session_id: string;
  rep_number: number;
  timestamp: string;
  form_score: number;
  is_partial: boolean;
  knee_angle?: number;
  hip_angle?: number;
}

export interface PostureEvent {
  session_id: string;
  timestamp: string;
  issue_type: string;
  severity: 'low' | 'medium' | 'high';
  feedback_message: string;
}

// Queue offline para sync posterior
const offlineQueue: {
  sessions: WorkoutSession[];
  repEvents: RepEvent[];
  postureEvents: PostureEvent[];
} = {
  sessions: [],
  repEvents: [],
  postureEvents: [],
};

/**
 * Salva uma sessão de treino no banco de dados
 */
export async function saveWorkoutSession(session: WorkoutSession): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('camera_workout_sessions')
      .insert([session])
      .select('id')
      .single();

    if (error) {
      console.error('Error saving workout session:', error);
      // Adiciona à fila offline
      offlineQueue.sessions.push(session);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Exception saving workout session:', error);
    offlineQueue.sessions.push(session);
    return null;
  }
}

/**
 * Salva eventos de repetições individuais
 */
export async function saveRepEvents(events: RepEvent[]): Promise<boolean> {
  if (events.length === 0) return true;

  try {
    const { error } = await supabase
      .from('camera_rep_events')
      .insert(events);

    if (error) {
      console.error('Error saving rep events:', error);
      offlineQueue.repEvents.push(...events);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception saving rep events:', error);
    offlineQueue.repEvents.push(...events);
    return false;
  }
}

/**
 * Salva eventos de postura
 */
export async function savePostureEvents(events: PostureEvent[]): Promise<boolean> {
  if (events.length === 0) return true;

  try {
    const { error } = await supabase
      .from('camera_posture_events')
      .insert(events);

    if (error) {
      console.error('Error saving posture events:', error);
      offlineQueue.postureEvents.push(...events);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception saving posture events:', error);
    offlineQueue.postureEvents.push(...events);
    return false;
  }
}

/**
 * Atualiza uma sessão existente (quando finalizada)
 */
export async function updateWorkoutSession(
  sessionId: string,
  updates: Partial<WorkoutSession>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('camera_workout_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      console.error('Error updating workout session:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Exception updating workout session:', error);
    return false;
  }
}

/**
 * Sincroniza dados offline quando a conexão é restaurada
 */
export async function syncOfflineData(): Promise<void> {
  // Sync sessions
  if (offlineQueue.sessions.length > 0) {
    const sessions = [...offlineQueue.sessions];
    offlineQueue.sessions = [];

    for (const session of sessions) {
      await saveWorkoutSession(session);
    }
  }

  // Sync rep events
  if (offlineQueue.repEvents.length > 0) {
    const events = [...offlineQueue.repEvents];
    offlineQueue.repEvents = [];
    await saveRepEvents(events);
  }

  // Sync posture events
  if (offlineQueue.postureEvents.length > 0) {
    const events = [...offlineQueue.postureEvents];
    offlineQueue.postureEvents = [];
    await savePostureEvents(events);
  }
}

/**
 * Retorna o tamanho da fila offline
 */
export function getOfflineQueueSize(): number {
  return (
    offlineQueue.sessions.length +
    offlineQueue.repEvents.length +
    offlineQueue.postureEvents.length
  );
}

/**
 * Busca sessões do usuário
 */
export async function getUserWorkoutSessions(
  userId: string,
  limit: number = 10
): Promise<WorkoutSession[]> {
  try {
    const { data, error } = await supabase
      .from('camera_workout_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching workout sessions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Exception fetching workout sessions:', error);
    return [];
  }
}

/**
 * Busca estatísticas de sessões do usuário
 */
export async function getUserWorkoutStats(userId: string): Promise<{
  totalSessions: number;
  totalReps: number;
  totalDuration: number;
  averageFormScore: number;
  totalCalories: number;
}> {
  try {
    const { data, error } = await supabase
      .from('camera_workout_sessions')
      .select('total_reps, total_duration_seconds, average_form_score, calories_burned')
      .eq('user_id', userId);

    if (error || !data) {
      return {
        totalSessions: 0,
        totalReps: 0,
        totalDuration: 0,
        averageFormScore: 0,
        totalCalories: 0,
      };
    }

    const stats = data.reduce(
      (acc, session) => ({
        totalSessions: acc.totalSessions + 1,
        totalReps: acc.totalReps + (session.total_reps || 0),
        totalDuration: acc.totalDuration + (session.total_duration_seconds || 0),
        averageFormScore: acc.averageFormScore + (session.average_form_score || 0),
        totalCalories: acc.totalCalories + (session.calories_burned || 0),
      }),
      {
        totalSessions: 0,
        totalReps: 0,
        totalDuration: 0,
        averageFormScore: 0,
        totalCalories: 0,
      }
    );

    // Calcula média do form score
    if (stats.totalSessions > 0) {
      stats.averageFormScore = stats.averageFormScore / stats.totalSessions;
    }

    return stats;
  } catch (error) {
    console.error('Exception fetching workout stats:', error);
    return {
      totalSessions: 0,
      totalReps: 0,
      totalDuration: 0,
      averageFormScore: 0,
      totalCalories: 0,
    };
  }
}
