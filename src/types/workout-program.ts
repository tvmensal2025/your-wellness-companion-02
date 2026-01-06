// ============================================
// TIPOS PARA SISTEMA DE TREINO INTELIGENTE
// Baseado em análise de canais profissionais:
// Leandro Twin, Renato Cariani, Laércio Refundini, 
// Sérgio Bertoluci, Tay Training, Carol Borba
// ============================================

// Gênero do usuário - afeta ênfase muscular
export type UserGender = 'feminino' | 'masculino' | 'nao_informar';

// Foco corporal preferido
export type BodyFocus = 
  | 'gluteos_pernas'    // Feminino comum
  | 'abdomen_core'      // Todos
  | 'bracos_ombros'     // Masculino comum
  | 'costas_postura'    // Todos - postura
  | 'peito'             // Masculino comum
  | 'corpo_equilibrado'; // Treino balanceado

// Faixa etária - afeta intensidade e exercícios
export type AgeGroup = 
  | 'jovem'      // 18-30 anos
  | 'adulto'     // 31-50 anos  
  | 'meia_idade' // 51-65 anos
  | 'senior';    // 66+ anos

// Condições especiais - requerem adaptações
export type SpecialCondition = 
  | 'nenhuma'
  | 'gestante'
  | 'pos_parto'
  | 'obesidade'
  | 'recuperacao_lesao';

// Biotipo corporal
export type Biotype = 'ectomorfo' | 'mesomorfo' | 'endomorfo' | 'nao_sei';

// Exercício individual com referência à biblioteca
export interface WorkoutExercise {
  libraryId?: string;          // UUID da tabela exercises_library
  name: string;                // Nome do exercício
  sets: number;                // Número de séries
  reps: string;                // Repetições (pode ser "10-12", "30seg", etc)
  rest?: string;               // Descanso entre séries
  technique?: WorkoutTechnique; // Técnica avançada opcional
  notes?: string;              // Observações
  videoUrl?: string;           // URL do vídeo de demonstração
  muscleGroup?: string;        // Grupo muscular principal
  equipment?: string;          // Equipamento necessário
}

// Técnicas avançadas de treino
export type WorkoutTechnique = 
  | 'drop_set'
  | 'rest_pause'
  | 'bi_set'
  | 'super_serie'
  | 'piramide_crescente'
  | 'piramide_decrescente'
  | '21s'
  | 'cluster_set'
  | 'isometria'
  | 'negativa';

// Dia de treino estruturado
export interface WorkoutDay {
  dayOfWeek: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
  label: string;               // Ex: "SEG - PEITO/TRÍCEPS"
  focus: string[];             // Grupos musculares: ['chest', 'triceps']
  warmup?: WorkoutExercise[];  // Aquecimento
  exercises: WorkoutExercise[];
  cooldown?: WorkoutExercise[]; // Alongamento/volta calma
  duration: string;            // Duração estimada
  intensity: 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
}

// Semana de treino
export interface WorkoutWeek {
  weekNumber: number;
  theme?: string;              // Ex: "Adaptação", "Volume", "Intensidade"
  days: WorkoutDay[];
  tips?: string[];             // Dicas da semana
  progressionNotes?: string;   // Notas de progressão
}

// Programa de treino completo
export interface StructuredWorkoutProgram {
  id?: string;
  title: string;
  subtitle: string;
  description: string;
  
  // Metadados
  targetGender: UserGender;
  targetAgeGroup: AgeGroup[];
  targetLevel: string[];       // ['iniciante', 'intermediario']
  targetGoal: string[];        // ['hipertrofia', 'emagrecer']
  targetLocation: string[];    // ['academia', 'casa_sem']
  
  // Configurações
  duration: string;            // "8 semanas"
  frequency: string;           // "4x por semana"
  sessionTime: string;         // "45-60 minutos"
  
  // Programa
  weeks: WorkoutWeek[];
  
  // Canais de referência
  referenceChannels?: string[];
  videoPlaylist?: string;
}

// Respostas do usuário expandidas
export interface ExtendedUserAnswers {
  // Perguntas originais
  level: string;
  experience: string;
  time: string;
  frequency: string;
  location: string;
  goal: string;
  limitation: string;
  
  // Novas perguntas
  gender: UserGender;
  bodyFocus: BodyFocus;
  ageGroup: AgeGroup;
  specialCondition: SpecialCondition;
  biotype?: Biotype;
}

// Perfil do usuário computado
export interface UserProfile {
  // Identificadores
  gender: UserGender;
  ageGroup: AgeGroup;
  level: string;
  location: string;
  goal: string;
  bodyFocus: BodyFocus;
  
  // Flags computadas
  isBeginnerFriendly: boolean;
  needsLowImpact: boolean;
  needsShortSessions: boolean;
  prefersFemaleEmphasis: boolean;
  prefersMaleEmphasis: boolean;
  hasMedicalRestrictions: boolean;
  
  // Ênfases musculares
  primaryMuscleGroups: string[];
  secondaryMuscleGroups: string[];
  avoidMuscleGroups: string[];
  
  // Preferências de canal
  preferredChannelStyle: 'tecnico' | 'motivacional' | 'suave' | 'intenso';
}

// Template de treino para matching
export interface WorkoutTemplate {
  id: string;
  name: string;
  
  // Critérios de matching
  matchCriteria: {
    genders: UserGender[];
    ageGroups: AgeGroup[];
    levels: string[];
    locations: string[];
    goals: string[];
    bodyFocus?: BodyFocus[];
  };
  
  // Score de prioridade (maior = melhor match)
  priority: number;
  
  // Programa
  program: StructuredWorkoutProgram;
}

// Exercício da biblioteca enriquecido
export interface EnrichedLibraryExercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  difficulty: string;
  
  // Novos campos
  genderEmphasis: 'female' | 'male' | 'neutral';
  ageAppropriate: AgeGroup[];
  youtubeUrl?: string;
  youtubeChannel?: string;
  youtubeQuality?: 'professional' | 'amateur';
  tags: string[];
  
  // Alternativas para limitações
  alternatives?: {
    forKnee?: string;      // ID do exercício alternativo
    forBack?: string;
    forShoulder?: string;
    forCardiac?: string;
  };
}

// Resposta da IA para geração de treino
export interface AIWorkoutGenerationRequest {
  userProfile: UserProfile;
  answers: ExtendedUserAnswers;
  availableExercises?: EnrichedLibraryExercise[];
}

export interface AIWorkoutGenerationResponse {
  success: boolean;
  program?: StructuredWorkoutProgram;
  error?: string;
  tokensUsed?: number;
}
