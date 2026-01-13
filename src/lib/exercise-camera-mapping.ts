/**
 * 📷 Mapeamento de Exercícios para Câmera
 * Relaciona exercícios do banco com tipos suportados pela câmera
 * ATUALIZADO: Baseado na lista real de exercícios do sistema
 */

import type { ExerciseType } from '@/types/camera-workout';

// Exercícios EXATOS que suportam câmera (baseado na lista do sistema)
const CAMERA_SUPPORTED_EXERCISES: Record<ExerciseType, string[]> = {
  squat: [
    // Academia
    'agachamento livre (academia)',
    'agachamento búlgaro (academia)',
    'agachamento frontal',
    'agachamento goblet',
    'agachamento hack',
    'leg press', // parcial - pode contar
    // Casa
    'agachamento livre',
    'agachamento búlgaro',
    'agachamento sumô',
    'pistol squat',
    'pistol assistido',
    'wall sit',
    'salto agachado',
  ],
  pushup: [
    // Casa
    'flexão tradicional',
    'flexão aberta',
    'flexão fechada',
    'flexão diamante',
    'flexão inclinada',
    'flexão explosiva',
    'flexão com palmas',
    'flexão arqueiro',
    'flexão hindu',
    'pike push up',
    'handstand push up (parede)',
    'isometria de flexão',
    'mergulho entre cadeiras',
    // Academia
    'mergulho nas paralelas',
  ],
  situp: [
    // Academia
    'abdominal na máquina',
    'abdominal no cabo',
    'elevação de pernas suspenso (academia)',
    'rotação russa com anilha',
    // Casa
    'abdominal infra',
    'abdominal v',
    'crunch',
    'elevação de pernas',
    'elevação pernas suspenso',
    'rotação russa',
    'core completo',
  ],
  plank: [
    // Academia
    'prancha (academia)',
    'elevação pélvica (academia)',
    'hip thrust com barra',
    // Casa
    'prancha',
    'prancha lateral',
    'elevação pélvica',
    'ponte unilateral',
    'hip thrust (sofá)',
    'glúteo quatro apoios',
    'coice de glúteo',
  ],
  lunge: [
    // Academia
    'afundo com halteres',
    'afundo búlgaro (academia)',
    'passada com barra',
    // Casa
    'afundo',
    'afundo reverso',
    'step up',
    'stiff unilateral',
    'stiff unilateral casa',
  ],
  jumping_jack: [
    // Não há polichinelo na lista, mas mantemos para futuro
    'polichinelo',
    'salto agachado', // também pode ser contado como jumping
  ]
};

/**
 * Normaliza string removendo acentos e convertendo para minúsculas
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

/**
 * Verifica se um exercício é compatível com a câmera
 * @returns O tipo de exercício da câmera ou null se não suportado
 */
export function getExerciseCameraType(exerciseName: string): ExerciseType | null {
  const nameNormalized = normalizeString(exerciseName);
  
  for (const [type, exercises] of Object.entries(CAMERA_SUPPORTED_EXERCISES)) {
    for (const exercise of exercises) {
      const exerciseNormalized = normalizeString(exercise);
      // Match exato ou parcial
      if (nameNormalized === exerciseNormalized || 
          nameNormalized.includes(exerciseNormalized) ||
          exerciseNormalized.includes(nameNormalized)) {
        return type as ExerciseType;
      }
    }
  }
  
  // Fallback: verificar por palavras-chave genéricas
  const keywords: Record<ExerciseType, string[]> = {
    squat: ['agachamento', 'squat', 'pistol', 'wall sit'],
    pushup: ['flexao', 'flexão', 'push up', 'mergulho'],
    situp: ['abdominal', 'crunch', 'rotacao russa'],
    plank: ['prancha', 'plank', 'elevacao pelvica', 'hip thrust', 'ponte'],
    lunge: ['afundo', 'lunge', 'step up', 'passada'],
    jumping_jack: ['polichinelo', 'jumping']
  };
  
  for (const [type, kws] of Object.entries(keywords)) {
    for (const kw of kws) {
      if (nameNormalized.includes(normalizeString(kw))) {
        return type as ExerciseType;
      }
    }
  }
  
  return null;
}

/**
 * Verifica se um exercício suporta contagem por câmera
 */
export function isCameraSupported(exerciseName: string): boolean {
  return getExerciseCameraType(exerciseName) !== null;
}

/**
 * Retorna informações sobre o suporte de câmera para um exercício
 */
export function getCameraInfo(exerciseName: string): {
  supported: boolean;
  type: ExerciseType | null;
  label: string;
} {
  const type = getExerciseCameraType(exerciseName);
  
  if (!type) {
    return { supported: false, type: null, label: '' };
  }
  
  const labels: Record<ExerciseType, string> = {
    squat: 'Agachamento',
    pushup: 'Flexão',
    situp: 'Abdominal',
    plank: 'Prancha',
    lunge: 'Avanço',
    jumping_jack: 'Polichinelo'
  };
  
  return { supported: true, type, label: labels[type] };
}

/**
 * Lista todos os exercícios suportados pela câmera
 */
export function getSupportedExercisesList(): string[] {
  const all: string[] = [];
  for (const exercises of Object.values(CAMERA_SUPPORTED_EXERCISES)) {
    all.push(...exercises);
  }
  return all;
}
