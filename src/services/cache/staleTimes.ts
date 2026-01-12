/**
 * ⏱️ Stale Times Centralizados
 * 
 * Define quanto tempo cada tipo de dado fica "fresco" no cache.
 * Dados que mudam frequentemente = stale time curto
 * Dados estáveis = stale time longo
 */

export const STALE_TIMES = {
  // ═══════════════════════════════════════════════════════════
  // 🔄 TEMPO REAL (< 1 min)
  // ═══════════════════════════════════════════════════════════
  realtime: 0,                    // Sempre buscar novo
  feed: 30 * 1000,                // 30 segundos - feed atualiza frequente
  notifications: 30 * 1000,       // 30 segundos
  
  // ═══════════════════════════════════════════════════════════
  // 📊 MÉDIO (1-5 min)
  // ═══════════════════════════════════════════════════════════
  ranking: 2 * 60 * 1000,         // 2 minutos - ranking
  challenges: 2 * 60 * 1000,      // 2 minutos
  dailyMissions: 1 * 60 * 1000,   // 1 minuto - missões mudam ao completar
  
  // ═══════════════════════════════════════════════════════════
  // 👤 USUÁRIO (5-10 min)
  // ═══════════════════════════════════════════════════════════
  currentUser: 5 * 60 * 1000,     // 5 minutos - dados do usuário atual
  gamification: 5 * 60 * 1000,    // 5 minutos - pontos, streak, level
  profile: 5 * 60 * 1000,         // 5 minutos - perfil de outros
  
  // ═══════════════════════════════════════════════════════════
  // 📈 HISTÓRICO (10-30 min)
  // ═══════════════════════════════════════════════════════════
  nutritionHistory: 10 * 60 * 1000,  // 10 minutos
  exerciseHistory: 10 * 60 * 1000,   // 10 minutos
  weightHistory: 15 * 60 * 1000,     // 15 minutos
  
  // ═══════════════════════════════════════════════════════════
  // 🔒 ESTÁTICO (30+ min)
  // ═══════════════════════════════════════════════════════════
  preferences: 30 * 60 * 1000,    // 30 minutos - preferências raramente mudam
  isAdmin: 60 * 60 * 1000,        // 1 hora - status admin é estável
  staticData: Infinity,           // Nunca expira - dados estáticos
} as const;

/**
 * ⏱️ GC Times (Garbage Collection)
 * 
 * Quanto tempo manter dados em memória após ficarem inativos.
 * Geralmente 2-3x o stale time.
 */
export const GC_TIMES = {
  short: 5 * 60 * 1000,           // 5 minutos
  medium: 30 * 60 * 1000,         // 30 minutos
  long: 60 * 60 * 1000,           // 1 hora
  veryLong: 24 * 60 * 60 * 1000,  // 24 horas
} as const;

/**
 * 🔄 Refetch Intervals
 * 
 * Para dados que precisam de polling automático.
 */
export const REFETCH_INTERVALS = {
  realtime: 10 * 1000,            // 10 segundos
  frequent: 30 * 1000,            // 30 segundos
  normal: 60 * 1000,              // 1 minuto
  slow: 5 * 60 * 1000,            // 5 minutos
  disabled: false,                // Sem polling
} as const;
