/**
 * Sistema de seleção inteligente de vídeos do YouTube
 * Seleciona canais baseado no perfil do usuário
 */

export interface VideoSelectionCriteria {
  gender: 'feminino' | 'masculino' | 'outro' | 'nao_informar';
  ageGroup: 'young' | 'adult' | 'middle' | 'senior';
  location: 'casa' | 'academia';
  level: 'sedentario' | 'iniciante' | 'intermediario' | 'avancado';
  specialCondition?: 'gestante' | 'pos_parto' | 'obesidade' | 'lesao' | 'idoso';
}

export interface PreferredChannels {
  primary: string[];
  secondary: string[];
}

// Mapeamento de canais por categoria
export const YOUTUBE_CHANNELS = {
  // Academia - Técnico/Científico
  LEANDRO_TWIN: 'Leandro Twin',
  LAERCIO_REFUNDINI: 'Laércio Refundini',
  RENATO_CARIANI: 'Renato Cariani',
  GROWTH_TV: 'Growth TV',
  
  // Feminino - Glúteos/Funcional
  TAY_TRAINING: 'Tay Training',
  CAROL_BORBA: 'Carol Borba',
  
  // Casa - Masculino
  SERGIO_BERTOLUCI: 'Sérgio Bertoluci',
  
  // Idosos
  AURELIO_ALFIERI: 'Aurélio Alfieri',
  DRA_LILI_ARANDA: 'Dra Lili Aranda',
  
  // Gestantes
  GIZELE_MONTEIRO: 'Gizele Monteiro',
  
  // HIIT/Cardio
  CHASE_BRASIL: 'CHASE Brasil',
  
  // Geral
  TREINO_MESTRE: 'Treino Mestre',
} as const;

/**
 * Retorna os canais preferidos baseado no perfil do usuário
 */
export function getPreferredChannels(criteria: VideoSelectionCriteria): PreferredChannels {
  // Gestante tem prioridade máxima
  if (criteria.specialCondition === 'gestante') {
    return {
      primary: [YOUTUBE_CHANNELS.GIZELE_MONTEIRO, YOUTUBE_CHANNELS.CAROL_BORBA],
      secondary: [YOUTUBE_CHANNELS.TAY_TRAINING],
    };
  }
  
  // Idosos
  if (criteria.ageGroup === 'senior' || criteria.specialCondition === 'idoso') {
    return {
      primary: [YOUTUBE_CHANNELS.AURELIO_ALFIERI, YOUTUBE_CHANNELS.DRA_LILI_ARANDA],
      secondary: [YOUTUBE_CHANNELS.CAROL_BORBA],
    };
  }
  
  // Sedentários e iniciantes
  if (criteria.level === 'sedentario') {
    return {
      primary: [YOUTUBE_CHANNELS.DRA_LILI_ARANDA, YOUTUBE_CHANNELS.AURELIO_ALFIERI],
      secondary: [YOUTUBE_CHANNELS.LAERCIO_REFUNDINI],
    };
  }
  
  // Feminino
  if (criteria.gender === 'feminino') {
    if (criteria.location === 'casa') {
      return {
        primary: [YOUTUBE_CHANNELS.CAROL_BORBA, YOUTUBE_CHANNELS.TAY_TRAINING],
        secondary: [YOUTUBE_CHANNELS.CHASE_BRASIL],
      };
    }
    // Academia
    return {
      primary: [YOUTUBE_CHANNELS.TAY_TRAINING, YOUTUBE_CHANNELS.CAROL_BORBA],
      secondary: [YOUTUBE_CHANNELS.LEANDRO_TWIN],
    };
  }
  
  // Masculino
  if (criteria.gender === 'masculino') {
    if (criteria.location === 'casa') {
      return {
        primary: [YOUTUBE_CHANNELS.SERGIO_BERTOLUCI, YOUTUBE_CHANNELS.CHASE_BRASIL],
        secondary: [YOUTUBE_CHANNELS.LEANDRO_TWIN],
      };
    }
    
    // Academia - avançado
    if (criteria.level === 'avancado') {
      return {
        primary: [YOUTUBE_CHANNELS.RENATO_CARIANI, YOUTUBE_CHANNELS.GROWTH_TV],
        secondary: [YOUTUBE_CHANNELS.LEANDRO_TWIN],
      };
    }
    
    // Academia - iniciante/intermediário
    return {
      primary: [YOUTUBE_CHANNELS.LEANDRO_TWIN, YOUTUBE_CHANNELS.LAERCIO_REFUNDINI],
      secondary: [YOUTUBE_CHANNELS.RENATO_CARIANI],
    };
  }
  
  // Padrão (outros/não informar)
  if (criteria.location === 'casa') {
    return {
      primary: [YOUTUBE_CHANNELS.CHASE_BRASIL, YOUTUBE_CHANNELS.CAROL_BORBA],
      secondary: [YOUTUBE_CHANNELS.SERGIO_BERTOLUCI],
    };
  }
  
  return {
    primary: [YOUTUBE_CHANNELS.LEANDRO_TWIN, YOUTUBE_CHANNELS.LAERCIO_REFUNDINI],
    secondary: [YOUTUBE_CHANNELS.TAY_TRAINING],
  };
}

/**
 * Verifica se um canal é preferido para o perfil do usuário
 */
export function isPreferredChannel(
  channel: string | null | undefined,
  criteria: VideoSelectionCriteria
): boolean {
  if (!channel) return false;
  
  const preferred = getPreferredChannels(criteria);
  const allPreferred = [...preferred.primary, ...preferred.secondary];
  
  return allPreferred.some(
    (preferredChannel) => channel.toLowerCase().includes(preferredChannel.toLowerCase())
  );
}

/**
 * Ordena exercícios priorizando canais preferidos
 */
export function sortExercisesByPreferredChannel<T extends { youtube_channel?: string | null }>(
  exercises: T[],
  criteria: VideoSelectionCriteria
): T[] {
  const preferred = getPreferredChannels(criteria);
  
  return [...exercises].sort((a, b) => {
    const aChannel = a.youtube_channel?.toLowerCase() || '';
    const bChannel = b.youtube_channel?.toLowerCase() || '';
    
    // Verificar se está nos canais primários
    const aInPrimary = preferred.primary.some((c) => aChannel.includes(c.toLowerCase()));
    const bInPrimary = preferred.primary.some((c) => bChannel.includes(c.toLowerCase()));
    
    if (aInPrimary && !bInPrimary) return -1;
    if (!aInPrimary && bInPrimary) return 1;
    
    // Verificar se está nos canais secundários
    const aInSecondary = preferred.secondary.some((c) => aChannel.includes(c.toLowerCase()));
    const bInSecondary = preferred.secondary.some((c) => bChannel.includes(c.toLowerCase()));
    
    if (aInSecondary && !bInSecondary) return -1;
    if (!aInSecondary && bInSecondary) return 1;
    
    return 0;
  });
}

/**
 * Filtra exercícios por condição especial
 */
export function filterExercisesByCondition<T extends { special_condition?: string | null }>(
  exercises: T[],
  condition: string | null | undefined
): T[] {
  if (!condition) {
    // Remove exercícios com condições especiais se usuário não tem condição
    return exercises.filter((e) => !e.special_condition);
  }
  
  // Inclui exercícios sem condição + exercícios com a condição do usuário
  return exercises.filter(
    (e) => !e.special_condition || e.special_condition === condition
  );
}

/**
 * Filtra exercícios por faixa etária
 */
export function filterExercisesByAge<T extends { age_appropriate?: string[] | null }>(
  exercises: T[],
  ageGroup: VideoSelectionCriteria['ageGroup']
): T[] {
  return exercises.filter((e) => {
    // Se não tem restrição de idade, inclui
    if (!e.age_appropriate || e.age_appropriate.length === 0) return true;
    
    // Verifica se a faixa etária está incluída
    return e.age_appropriate.includes(ageGroup);
  });
}

/**
 * Filtra exercícios por foco de gênero
 */
export function filterExercisesByGender<T extends { gender_focus?: string | null }>(
  exercises: T[],
  gender: VideoSelectionCriteria['gender']
): T[] {
  return exercises.filter((e) => {
    // Se não tem foco de gênero (neutral) ou é null, inclui para todos
    if (!e.gender_focus || e.gender_focus === 'neutral') return true;
    
    // Se é feminino e o exercício é focado em feminino
    if (gender === 'feminino' && e.gender_focus === 'female') return true;
    
    // Se é masculino e o exercício é focado em masculino
    if (gender === 'masculino' && e.gender_focus === 'male') return true;
    
    // Se é outro/não informar, inclui todos
    if (gender === 'outro' || gender === 'nao_informar') return true;
    
    return false;
  });
}

/**
 * Aplica todos os filtros e ordenação baseado no perfil do usuário
 */
export function getPersonalizedExercises<
  T extends {
    youtube_channel?: string | null;
    special_condition?: string | null;
    age_appropriate?: string[] | null;
    gender_focus?: string | null;
  }
>(exercises: T[], criteria: VideoSelectionCriteria): T[] {
  let filtered = [...exercises];
  
  // 1. Filtrar por condição especial
  filtered = filterExercisesByCondition(filtered, criteria.specialCondition);
  
  // 2. Filtrar por idade
  filtered = filterExercisesByAge(filtered, criteria.ageGroup);
  
  // 3. Filtrar por gênero
  filtered = filterExercisesByGender(filtered, criteria.gender);
  
  // 4. Ordenar por canal preferido
  filtered = sortExercisesByPreferredChannel(filtered, criteria);
  
  return filtered;
}
