/**
 * Character Menu Types
 * Sistema de seleção de personagens para filtrar funcionalidades do app
 */

export type CharacterId = 'health' | 'nutrition' | 'exercise' | 'coaching' | 'complete';

export interface Character {
  id: CharacterId;
  name: string;
  description: string;
  imagePath: string;
  features: string[];
  menuItems: string[]; // IDs dos menus habilitados
}

// IDs dos menus do app (correspondem aos IDs em CompleteDashboardPage)
export const menuIds = {
  dashboard: 'dashboard',
  missions: 'missions',
  progress: 'progress',
  goals: 'goals',
  courses: 'courses',
  sessions: 'sessions',
  comunidade: 'comunidade',
  challenges: 'challenges',
  saboteurTest: 'saboteur-test',
  sofiaNutricional: 'sofia-nutricional',
  drVital: 'dr-vital',
  exercicios: 'exercicios',
  subscriptions: 'subscriptions',
} as const;

// Menus COMPARTILHADOS (aparecem em TODOS os personagens - SEM missions e sessions)
export const sharedMenus = [
  menuIds.dashboard,
  menuIds.goals,
  menuIds.comunidade,
  menuIds.challenges,
  menuIds.subscriptions,
] as const;

// Menus por personagem
export const characterMenus: Record<CharacterId, readonly string[]> = {
  // Dr. Vital: Foco em saúde
  health: [
    ...sharedMenus,
    menuIds.drVital,
  ],
  // Sofia: Foco em nutrição
  nutrition: [
    ...sharedMenus,
    menuIds.sofiaNutricional,
  ],
  // Alex: Foco em exercícios
  exercise: [
    ...sharedMenus,
    menuIds.progress,
    menuIds.exercicios,
  ],
  // Rafael: Foco em coaching/missões/sessões
  coaching: [
    ...sharedMenus,
    menuIds.missions,
    menuIds.sessions,
    menuIds.saboteurTest,
  ],
  // Completo: TUDO liberado
  complete: [
    menuIds.dashboard,
    menuIds.missions,
    menuIds.progress,
    menuIds.goals,
    menuIds.courses,
    menuIds.sessions,
    menuIds.comunidade,
    menuIds.challenges,
    menuIds.saboteurTest,
    menuIds.sofiaNutricional,
    menuIds.drVital,
    menuIds.exercicios,
    menuIds.subscriptions,
  ],
};

// Registry de features por categoria (mantido para compatibilidade)
export const featureRegistry = {
  health: [
    'health-timeline',
    'exam-analysis',
    'health-metrics',
    'health-predictions',
    'dr-vital-chat',
    'health-score',
    'dr-vital'
  ],
  nutrition: [
    'food-analysis',
    'meal-plan',
    'sofia-chat',
    'supplements',
    'nutrition-tracking',
    'calorie-counter',
    'sofia'
  ],
  exercise: [
    'workouts',
    'rest-timer',
    'progression',
    'camera-workout',
    'exercise-gamification',
    'social-hub',
    'exercise',
    'progress'
  ],
  coaching: [
    'missions',
    'sessions',
    'saboteur-test',
    'daily-reflection',
    'life-wheel',
    'coaching-reports'
  ],
  shared: [
    'dashboard',
    'profile',
    'settings',
    'goals',
    'community',
    'challenges',
    'notifications'
  ]
} as const;

// Placeholder temporário até ter as imagens reais
const placeholderImage = '/images/instituto-logo.png';

// Dados dos personagens
export const characters: Character[] = [
  {
    id: 'health',
    name: 'Dr. Vital',
    description: 'Foco em saúde e exames',
    imagePath: placeholderImage,
    features: [...featureRegistry.health, ...featureRegistry.shared],
    menuItems: [...characterMenus.health]
  },
  {
    id: 'nutrition',
    name: 'Sofia',
    description: 'Foco em nutrição e alimentação',
    imagePath: placeholderImage,
    features: [...featureRegistry.nutrition, ...featureRegistry.shared],
    menuItems: [...characterMenus.nutrition]
  },
  {
    id: 'exercise',
    name: 'Alex',
    description: 'Foco em exercícios e treinos',
    imagePath: placeholderImage,
    features: [...featureRegistry.exercise, ...featureRegistry.shared],
    menuItems: [...characterMenus.exercise]
  },
  {
    id: 'coaching',
    name: 'Rafael',
    description: 'Seu treinador de desenvolvimento pessoal',
    imagePath: placeholderImage,
    features: [...featureRegistry.coaching, ...featureRegistry.shared],
    menuItems: [...characterMenus.coaching]
  },
  {
    id: 'complete',
    name: 'Experiência Completa',
    description: 'Todas as funcionalidades',
    imagePath: placeholderImage,
    features: [
      ...featureRegistry.health,
      ...featureRegistry.nutrition,
      ...featureRegistry.exercise,
      ...featureRegistry.coaching,
      ...featureRegistry.shared
    ],
    menuItems: [...characterMenus.complete]
  }
];

// IDs válidos para validação
export const validCharacterIds: CharacterId[] = ['health', 'nutrition', 'exercise', 'coaching', 'complete'];

// Função helper para verificar se um ID é válido
export function isValidCharacterId(id: string): id is CharacterId {
  return validCharacterIds.includes(id as CharacterId);
}

// Obter personagem por ID
export function getCharacterById(id: CharacterId): Character | undefined {
  return characters.find(c => c.id === id);
}

// Verificar se um menu está habilitado para um personagem
export function isMenuEnabledForCharacter(characterId: CharacterId | null, menuId: string): boolean {
  if (!characterId) return true; // Se não há personagem, mostrar tudo
  if (characterId === 'complete') return true; // Completo tem tudo
  
  const menus = characterMenus[characterId];
  return menus.includes(menuId);
}

// Obter lista de menus habilitados para um personagem
export function getEnabledMenus(characterId: CharacterId): readonly string[] {
  return characterMenus[characterId] || characterMenus.complete;
}

// Obter lista de menus desabilitados para um personagem
export function getDisabledMenus(characterId: CharacterId): string[] {
  const allMenus = Object.values(menuIds);
  const enabledMenus = characterMenus[characterId];
  return allMenus.filter(menu => !enabledMenus.includes(menu));
}
