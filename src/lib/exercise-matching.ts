/**
 * Utilitários para matching de exercícios entre programa salvo e biblioteca
 * Prioridade: 1) ID exato 2) Nome exato 3) Muscle group 4) Palavras-chave
 */

import { normalizeKey, parseActivityTitle } from './exercise-format';
import type { Exercise } from '@/hooks/useExercisesLibrary';

export interface MatchResult {
  exercises: Exercise[];
  matchedCount: number;
  totalActivities: number;
}

// Mapeamento de termos comuns para muscle_groups da biblioteca
// IMPORTANTE: Os valores devem corresponder EXATAMENTE aos muscle_group na tabela exercises_library
const MUSCLE_GROUP_ALIASES: Record<string, string[]> = {
  // Grupos principais - valores exatos da tabela exercises_library
  pernas: ['pernas', 'perna', 'leg', 'legs', 'quadriceps', 'posterior', 'panturrilha', 'coxa', 'coxas'],
  peito: ['peito', 'peitoral', 'chest', 'supino', 'flexao', 'push', 'pectorais'],
  costas: ['costas', 'costa', 'dorsal', 'back', 'remada', 'pull', 'puxada', 'lat'],
  ombros: ['ombros', 'ombro', 'deltoides', 'deltoide', 'shoulder', 'desenvolvimento', 'elevacao lateral'],
  biceps: ['biceps', 'braco', 'bracos', 'rosca', 'curl'],
  triceps: ['triceps', 'extensao', 'mergulho', 'frances', 'tricep'],
  gluteos: ['gluteos', 'gluteo', 'glute', 'hip thrust', 'ponte', 'bumbum', 'empinar'],
  abdomen: ['abdomen', 'abdominal', 'core', 'prancha', 'plank', 'abs', 'barriga', 'obliquos'],
  funcional: ['funcional', 'full body', 'circuito', 'cardio', 'hiit', 'burpee', 'treino completo', 'corpo todo'],
  mobilidade: ['mobilidade', 'alongamento', 'flexibilidade', 'stretch', 'yoga', 'aquecimento'],
  // Aliases adicionais que mapeiam para grupos principais
  quadriceps: ['quadriceps', 'agachamento', 'squat', 'leg press', 'extensora'],
  posterior: ['posterior', 'isquiotibiais', 'stiff', 'leg curl', 'flexora'],
  panturrilha: ['panturrilha', 'calves', 'calf', 'gêmeos'],
  trapezio: ['trapezio', 'encolhimento', 'shrug'],
  bracos: ['bracos', 'braco', 'arm', 'arms'], // Grupo específico na biblioteca
};

// Mapeamento de aliases para o muscle_group real na biblioteca
const ALIAS_TO_REAL_GROUP: Record<string, string> = {
  quadriceps: 'pernas',
  posterior: 'pernas',
  panturrilha: 'pernas',
  trapezio: 'costas',
  bracos: 'bracos', // existe como grupo próprio
  biceps: 'bracos',
  triceps: 'bracos',
};

// Palavras de ação que indicam exercícios específicos
const EXERCISE_KEYWORDS: Record<string, string[]> = {
  agachamento: ['pernas', 'quadriceps', 'gluteos'],
  supino: ['peito'],
  remada: ['costas'],
  desenvolvimento: ['ombros'],
  rosca: ['biceps'],
  triceps: ['triceps'],
  prancha: ['abdomen', 'core', 'funcional'],
  burpee: ['funcional', 'cardio'],
  stiff: ['posterior', 'gluteos'],
  afundo: ['pernas', 'gluteos'],
  flexao: ['peito', 'triceps'],
  elevacao: ['ombros'],
};

/**
 * Resolve muscle groups a partir de uma atividade textual
 * Retorna os grupos musculares REAIS que existem na tabela exercises_library
 */
export function resolveMuscleGroupFromActivity(activity: string): string[] {
  const key = normalizeKey(activity);
  const groups = new Set<string>();

  // 1. Busca direta nos aliases
  for (const [muscleGroup, aliases] of Object.entries(MUSCLE_GROUP_ALIASES)) {
    if (aliases.some(alias => key.includes(alias) || alias.includes(key))) {
      // Converter para grupo real se necessário
      const realGroup = ALIAS_TO_REAL_GROUP[muscleGroup] || muscleGroup;
      groups.add(realGroup);
    }
  }

  // 2. Busca por palavras de exercícios
  for (const [keyword, targetGroups] of Object.entries(EXERCISE_KEYWORDS)) {
    if (key.includes(keyword)) {
      targetGroups.forEach(g => {
        const realGroup = ALIAS_TO_REAL_GROUP[g] || g;
        groups.add(realGroup);
      });
    }
  }

  // 3. Fallback para "funcional" se nenhum match
  if (groups.size === 0) {
    groups.add('funcional');
  }

  return Array.from(groups);
}

/**
 * Match exercícios da biblioteca com base nas atividades do programa
 */
export function matchExercisesFromActivities(
  activities: string[],
  library: Exercise[],
  options: {
    maxPerActivity?: number;
    preferWithVideo?: boolean;
    minExercises?: number;
  } = {}
): MatchResult {
  const { maxPerActivity = 3, preferWithVideo = true, minExercises = 5 } = options;
  
  const result: Exercise[] = [];
  const usedIds = new Set<string>();
  let matchedCount = 0;

  // Indexar biblioteca
  const indexed = library.map(ex => ({
    ex,
    nameKey: normalizeKey(ex.name),
    muscleKey: normalizeKey(ex.muscle_group || ''),
  }));

  for (const activity of activities) {
    const activityName = parseActivityTitle(activity);
    const key = normalizeKey(activityName);
    if (!key) continue;

    const muscleGroups = resolveMuscleGroupFromActivity(activityName);
    let addedForActivity = 0;

    // Fase 1: Match exato por nome
    const exactMatch = indexed.find(
      i => !usedIds.has(i.ex.id) && i.nameKey === key
    );
    if (exactMatch) {
      usedIds.add(exactMatch.ex.id);
      result.push(exactMatch.ex);
      addedForActivity++;
      matchedCount++;
    }

    // Fase 2: Match por muscle_group
    if (addedForActivity < maxPerActivity) {
      // Ordenar por preferência de vídeo
      const candidates = indexed
        .filter(i => !usedIds.has(i.ex.id) && muscleGroups.includes(i.muscleKey))
        .sort((a, b) => {
          if (preferWithVideo) {
            const aHasVideo = !!a.ex.youtube_url;
            const bHasVideo = !!b.ex.youtube_url;
            if (aHasVideo !== bHasVideo) return bHasVideo ? 1 : -1;
          }
          return 0;
        });

      for (const candidate of candidates) {
        if (addedForActivity >= maxPerActivity) break;
        usedIds.add(candidate.ex.id);
        result.push(candidate.ex);
        addedForActivity++;
        if (addedForActivity === 1) matchedCount++;
      }
    }

    // Fase 3: Match por palavras-chave no nome do exercício
    if (addedForActivity < maxPerActivity) {
      const words = key.split(' ').filter(w => w.length > 3);
      const keywordMatches = indexed
        .filter(i => !usedIds.has(i.ex.id))
        .filter(i => words.some(w => i.nameKey.includes(w)))
        .sort((a, b) => {
          if (preferWithVideo) {
            const aHasVideo = !!a.ex.youtube_url;
            const bHasVideo = !!b.ex.youtube_url;
            if (aHasVideo !== bHasVideo) return bHasVideo ? 1 : -1;
          }
          return 0;
        });

      for (const match of keywordMatches) {
        if (addedForActivity >= maxPerActivity) break;
        usedIds.add(match.ex.id);
        result.push(match.ex);
        addedForActivity++;
        if (addedForActivity === 1) matchedCount++;
      }
    }
  }

  // FALLBACK: Se não encontrou exercícios suficientes, adicionar exercícios aleatórios
  if (result.length < minExercises) {
    const remaining = indexed
      .filter(i => !usedIds.has(i.ex.id))
      .sort((a, b) => {
        if (preferWithVideo) {
          const aHasVideo = !!a.ex.youtube_url;
          const bHasVideo = !!b.ex.youtube_url;
          if (aHasVideo !== bHasVideo) return bHasVideo ? 1 : -1;
        }
        // Priorizar exercícios "funcional" e "full body"
        const aIsFunctional = a.muscleKey.includes('funcional') || a.nameKey.includes('funcional');
        const bIsFunctional = b.muscleKey.includes('funcional') || b.nameKey.includes('funcional');
        if (aIsFunctional !== bIsFunctional) return bIsFunctional ? 1 : -1;
        return 0;
      });

    for (const item of remaining) {
      if (result.length >= minExercises) break;
      usedIds.add(item.ex.id);
      result.push(item.ex);
    }
  }

  return {
    exercises: result,
    matchedCount,
    totalActivities: activities.length,
  };
}

/**
 * Busca exercícios por muscle group diretamente
 */
export function getExercisesByMuscleGroup(
  library: Exercise[],
  muscleGroup: string,
  limit: number = 3,
  preferWithVideo: boolean = true
): Exercise[] {
  const key = normalizeKey(muscleGroup);
  const resolvedGroups = resolveMuscleGroupFromActivity(muscleGroup);

  return library
    .filter(ex => {
      const exKey = normalizeKey(ex.muscle_group || '');
      return resolvedGroups.includes(exKey) || exKey.includes(key) || key.includes(exKey);
    })
    .sort((a, b) => {
      if (preferWithVideo) {
        const aHasVideo = !!a.youtube_url;
        const bHasVideo = !!b.youtube_url;
        if (aHasVideo !== bHasVideo) return bHasVideo ? 1 : -1;
      }
      return 0;
    })
    .slice(0, limit);
}
