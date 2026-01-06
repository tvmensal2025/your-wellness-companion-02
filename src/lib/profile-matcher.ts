// ============================================
// PROFILE MATCHER
// Combina respostas do usuário com perfil ideal
// e seleciona o melhor template de treino
// ============================================

import { 
  ExtendedUserAnswers, 
  UserProfile, 
  BodyFocus, 
  UserGender, 
  AgeGroup 
} from '@/types/workout-program';

// Mapeia respostas para grupos musculares primários
const bodyFocusToMuscles: Record<BodyFocus, { primary: string[], secondary: string[] }> = {
  gluteos_pernas: {
    primary: ['glúteos', 'quadríceps', 'posterior', 'panturrilha'],
    secondary: ['core', 'lombar']
  },
  abdomen_core: {
    primary: ['abdômen', 'oblíquos', 'lombar', 'transverso'],
    secondary: ['quadril', 'costas']
  },
  bracos_ombros: {
    primary: ['bíceps', 'tríceps', 'ombros', 'antebraço'],
    secondary: ['peito', 'costas']
  },
  costas_postura: {
    primary: ['dorsais', 'trapézio', 'romboides', 'eretores'],
    secondary: ['core', 'ombros']
  },
  peito: {
    primary: ['peito', 'tríceps', 'ombros anteriores'],
    secondary: ['core', 'bíceps']
  },
  corpo_equilibrado: {
    primary: ['peito', 'costas', 'pernas', 'ombros'],
    secondary: ['bíceps', 'tríceps', 'core']
  }
};

// Mapeia gênero para ênfase padrão
const getDefaultBodyFocus = (gender: UserGender): BodyFocus => {
  switch (gender) {
    case 'feminino':
      return 'gluteos_pernas';
    case 'masculino':
      return 'peito';
    default:
      return 'corpo_equilibrado';
  }
};

// Mapeia limitações para grupos a evitar
const limitationToAvoidGroups: Record<string, string[]> = {
  joelho: ['agachamento profundo', 'impacto', 'saltos', 'corrida'],
  costas: ['levantamento terra', 'boa morning', 'abdominais tradicionais'],
  ombro: ['desenvolvimento atrás', 'supino inclinado pesado', 'mergulho profundo'],
  cardiaco: ['hiit extremo', 'sprint', 'alta intensidade prolongada'],
  nenhuma: []
};

// Estilo de canal baseado no perfil
const getPreferredChannelStyle = (answers: ExtendedUserAnswers): 'tecnico' | 'motivacional' | 'suave' | 'intenso' => {
  const { gender, ageGroup, level, goal } = answers;
  
  // Idosos ou sedentários: estilo suave (Dra Lili)
  if (ageGroup === 'senior' || level === 'sedentario') {
    return 'suave';
  }
  
  // Hipertrofia avançada: técnico (Leandro Twin)
  if (goal === 'hipertrofia' && (level === 'avancado' || level === 'moderado')) {
    return 'tecnico';
  }
  
  // Feminino com foco estético: motivacional (Tay Training, Carol Borba)
  if (gender === 'feminino' && (goal === 'emagrecer' || answers.bodyFocus === 'gluteos_pernas')) {
    return 'motivacional';
  }
  
  // Masculino intermediário+: intenso (Cariani)
  if (gender === 'masculino' && level !== 'sedentario' && level !== 'leve') {
    return 'intenso';
  }
  
  return 'motivacional';
};

// Gera perfil completo do usuário
export const generateUserProfile = (answers: ExtendedUserAnswers): UserProfile => {
  const bodyFocus = answers.bodyFocus || getDefaultBodyFocus(answers.gender);
  const muscleMapping = bodyFocusToMuscles[bodyFocus];
  
  const profile: UserProfile = {
    // Identificadores básicos
    gender: answers.gender || 'nao_informar',
    ageGroup: answers.ageGroup || 'adulto',
    level: answers.level,
    location: answers.location,
    goal: answers.goal,
    bodyFocus,
    
    // Flags computadas
    isBeginnerFriendly: 
      answers.level === 'sedentario' || 
      answers.level === 'leve' || 
      answers.experience === 'nenhuma' ||
      answers.experience === 'pouca',
    
    needsLowImpact: 
      answers.limitation === 'joelho' || 
      answers.limitation === 'cardiaco' ||
      answers.ageGroup === 'senior' ||
      answers.specialCondition === 'gestante' ||
      answers.specialCondition === 'obesidade',
    
    needsShortSessions: 
      answers.time === '10-15' || 
      answers.time === '20-30' ||
      answers.ageGroup === 'senior',
    
    prefersFemaleEmphasis: answers.gender === 'feminino',
    prefersMaleEmphasis: answers.gender === 'masculino',
    
    hasMedicalRestrictions: 
      answers.limitation !== 'nenhuma' ||
      answers.specialCondition !== 'nenhuma',
    
    // Grupos musculares
    primaryMuscleGroups: muscleMapping.primary,
    secondaryMuscleGroups: muscleMapping.secondary,
    avoidMuscleGroups: limitationToAvoidGroups[answers.limitation] || [],
    
    // Preferência de canal
    preferredChannelStyle: getPreferredChannelStyle(answers)
  };
  
  return profile;
};

// Calcula score de compatibilidade entre perfil e template
export const calculateMatchScore = (
  profile: UserProfile,
  templateCriteria: {
    genders: UserGender[];
    ageGroups: AgeGroup[];
    levels: string[];
    locations: string[];
    goals: string[];
    bodyFocus?: BodyFocus[];
  }
): number => {
  let score = 0;
  
  // Gênero match (+30 pontos)
  if (templateCriteria.genders.includes(profile.gender) || 
      templateCriteria.genders.includes('nao_informar')) {
    score += 30;
  }
  
  // Idade match (+25 pontos)
  if (templateCriteria.ageGroups.includes(profile.ageGroup)) {
    score += 25;
  }
  
  // Nível match (+20 pontos)
  if (templateCriteria.levels.includes(profile.level)) {
    score += 20;
  }
  
  // Local match (+15 pontos)
  if (templateCriteria.locations.includes(profile.location)) {
    score += 15;
  }
  
  // Objetivo match (+10 pontos)
  if (templateCriteria.goals.includes(profile.goal)) {
    score += 10;
  }
  
  // Body focus match (+10 pontos extra)
  if (templateCriteria.bodyFocus?.includes(profile.bodyFocus)) {
    score += 10;
  }
  
  return score;
};

// Sugere canais de referência baseado no perfil
export const getSuggestedChannels = (profile: UserProfile): string[] => {
  const channels: string[] = [];
  
  // Baseado no estilo preferido
  switch (profile.preferredChannelStyle) {
    case 'tecnico':
      channels.push('Leandro Twin', 'Laércio Refundini');
      break;
    case 'motivacional':
      if (profile.prefersFemaleEmphasis) {
        channels.push('Tay Training', 'Carol Borba');
      } else {
        channels.push('Renato Cariani');
      }
      break;
    case 'suave':
      channels.push('Dra Lili Aranda', 'CHASE Brasil');
      break;
    case 'intenso':
      channels.push('Renato Cariani', 'Growth TV');
      break;
  }
  
  // Adicionais baseados em local
  if (profile.location === 'casa_sem' || profile.location === 'casa_com') {
    channels.push('Sérgio Bertoluci');
  }
  
  // Adicionais baseados em objetivo
  if (profile.goal === 'emagrecer' && profile.prefersFemaleEmphasis) {
    channels.push('Carol Borba');
  }
  
  return [...new Set(channels)]; // Remove duplicatas
};

// Adapta exercícios baseado no perfil
export const adaptExercisesForProfile = (
  exercises: string[],
  profile: UserProfile
): string[] => {
  let adapted = [...exercises];
  
  // Adaptações para baixo impacto
  if (profile.needsLowImpact) {
    adapted = adapted.map(ex => 
      ex
        .replace(/salto|jump|pular/gi, 'controlado')
        .replace(/corrida|sprint/gi, 'caminhada')
        .replace(/burpee(?! sem salto)/gi, 'burpee sem salto')
    );
  }
  
  // Adaptações para sessões curtas
  if (profile.needsShortSessions) {
    adapted = adapted.map(ex =>
      ex
        .replace(/4x(\d+)/gi, '3x$1')
        .replace(/5x(\d+)/gi, '3x$1')
        .replace(/60min/gi, '30min')
        .replace(/45min/gi, '25min')
    );
  }
  
  return adapted;
};

// Sugere intensidade baseada no perfil
export const getSuggestedIntensity = (profile: UserProfile): 'leve' | 'moderado' | 'intenso' | 'muito_intenso' => {
  if (profile.ageGroup === 'senior' || profile.hasMedicalRestrictions) {
    return 'leve';
  }
  
  if (profile.isBeginnerFriendly) {
    return 'moderado';
  }
  
  if (profile.goal === 'hipertrofia' || profile.goal === 'emagrecer') {
    return 'intenso';
  }
  
  return 'moderado';
};
