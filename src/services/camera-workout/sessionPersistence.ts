/**
 * Camera Workout Session Persistence
 * 
 * PLACEHOLDER: Database tables not yet created.
 * All operations return mock data or log to console.
 */

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

// In-memory storage for sessions (placeholder)
const inMemorySessions: Map<string, WorkoutSession> = new Map();

/**
 * Salva uma sessão de treino (placeholder - logs to console)
 */
export async function saveWorkoutSession(session: WorkoutSession): Promise<string | null> {
  try {
    const id = crypto.randomUUID();
    const sessionWithId = { ...session, id };
    inMemorySessions.set(id, sessionWithId);
    console.log('[Camera Workout] Session saved (in-memory):', id);
    return id;
  } catch (error) {
    console.error('Exception saving workout session:', error);
    offlineQueue.sessions.push(session);
    return null;
  }
}

/**
 * Salva eventos de repetições individuais (placeholder)
 */
export async function saveRepEvents(events: RepEvent[]): Promise<boolean> {
  if (events.length === 0) return true;

  try {
    console.log('[Camera Workout] Rep events saved (in-memory):', events.length);
    return true;
  } catch (error) {
    console.error('Exception saving rep events:', error);
    offlineQueue.repEvents.push(...events);
    return false;
  }
}

/**
 * Salva eventos de postura (placeholder)
 */
export async function savePostureEvents(events: PostureEvent[]): Promise<boolean> {
  if (events.length === 0) return true;

  try {
    console.log('[Camera Workout] Posture events saved (in-memory):', events.length);
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
    const existing = inMemorySessions.get(sessionId);
    if (existing) {
      inMemorySessions.set(sessionId, { ...existing, ...updates });
      console.log('[Camera Workout] Session updated (in-memory):', sessionId);
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
 * Busca sessões do usuário (placeholder)
 */
export async function getUserWorkoutSessions(
  userId: string,
  limit: number = 10
): Promise<WorkoutSession[]> {
  try {
    const sessions = Array.from(inMemorySessions.values())
      .filter(s => s.user_id === userId)
      .slice(0, limit);
    return sessions;
  } catch (error) {
    console.error('Exception fetching workout sessions:', error);
    return [];
  }
}

/**
 * Busca estatísticas de sessões do usuário (placeholder)
 */
export async function getUserWorkoutStats(userId: string): Promise<{
  totalSessions: number;
  totalReps: number;
  totalDuration: number;
  averageFormScore: number;
  totalCalories: number;
}> {
  try {
    const sessions = Array.from(inMemorySessions.values())
      .filter(s => s.user_id === userId);

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalReps: 0,
        totalDuration: 0,
        averageFormScore: 0,
        totalCalories: 0,
      };
    }

    const stats = sessions.reduce(
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
