// ============================================
// TEMPLATES DE TREINO POR PERFIL
// Baseado em metodologias de canais profissionais
// ============================================

import { WorkoutTemplate, StructuredWorkoutProgram, WorkoutWeek, UserGender, AgeGroup, BodyFocus } from '@/types/workout-program';

// Helper para criar exercícios estruturados
const createExercise = (
  name: string,
  sets: number,
  reps: string,
  rest?: string,
  muscleGroup?: string
) => ({
  name,
  sets,
  reps,
  rest: rest || '60seg',
  muscleGroup
});

// ============================================
// TEMPLATE: Feminino + Casa + Glúteos + Iniciante
// Referência: Tay Training, Carol Borba
// ============================================
const femininoGluteosIniciante: StructuredWorkoutProgram = {
  title: '🍑 Glúteos em Casa',
  subtitle: 'Programa Feminino para Iniciantes',
  description: 'Treino focado em glúteos e pernas usando peso corporal. Baseado em metodologias de Tay Training e Carol Borba.',
  
  targetGender: 'feminino',
  targetAgeGroup: ['jovem', 'adulto'],
  targetLevel: ['sedentario', 'leve'],
  targetGoal: ['hipertrofia', 'emagrecer', 'condicionamento'],
  targetLocation: ['casa_sem'],
  
  duration: '4 semanas',
  frequency: '3x por semana',
  sessionTime: '25-35 minutos',
  referenceChannels: ['Tay Training', 'Carol Borba'],
  
  weeks: [
    {
      weekNumber: 1,
      theme: 'Ativação e Base',
      days: [
        {
          dayOfWeek: 'segunda',
          label: 'SEG - GLÚTEOS ATIVAÇÃO',
          focus: ['glúteos', 'quadríceps'],
          exercises: [
            createExercise('Ponte glútea', 3, '15', '45seg', 'glúteos'),
            createExercise('Agachamento sumo', 3, '12', '45seg', 'quadríceps'),
            createExercise('Elevação lateral de perna deitada', 3, '12 cada', '30seg', 'abdutores'),
            createExercise('Kickback no solo', 3, '12 cada', '30seg', 'glúteos'),
          ],
          duration: '25 minutos',
          intensity: 'leve'
        },
        {
          dayOfWeek: 'quarta',
          label: 'QUA - PERNAS COMPLETO',
          focus: ['quadríceps', 'posterior'],
          exercises: [
            createExercise('Agachamento livre', 3, '15', '45seg', 'quadríceps'),
            createExercise('Afundo alternado', 3, '10 cada', '45seg', 'quadríceps'),
            createExercise('Ponte unilateral', 3, '10 cada', '30seg', 'glúteos'),
            createExercise('Panturrilha no degrau', 3, '20', '30seg', 'panturrilha'),
          ],
          duration: '25 minutos',
          intensity: 'leve'
        },
        {
          dayOfWeek: 'sexta',
          label: 'SEX - GLÚTEOS INTENSO',
          focus: ['glúteos', 'core'],
          exercises: [
            createExercise('Ponte glútea com pausa', 3, '12', '45seg', 'glúteos'),
            createExercise('Agachamento sumô pulso', 3, '15', '45seg', 'glúteos'),
            createExercise('Fire hydrant', 3, '15 cada', '30seg', 'abdutores'),
            createExercise('Prancha', 3, '30seg', '30seg', 'core'),
          ],
          duration: '30 minutos',
          intensity: 'moderado'
        }
      ],
      tips: [
        'Foque na contração do glúteo, não na velocidade',
        'Aperte o glúteo no topo de cada movimento',
        'Respire: expire no esforço, inspire no retorno'
      ]
    },
    {
      weekNumber: 2,
      theme: 'Progressão de Volume',
      days: [
        {
          dayOfWeek: 'segunda',
          label: 'SEG - GLÚTEOS VOLUME',
          focus: ['glúteos', 'quadríceps'],
          exercises: [
            createExercise('Ponte glútea', 4, '15', '45seg', 'glúteos'),
            createExercise('Agachamento sumô', 4, '15', '45seg', 'quadríceps'),
            createExercise('Clamshell', 3, '15 cada', '30seg', 'abdutores'),
            createExercise('Kickback pulsando', 3, '12 cada', '30seg', 'glúteos'),
          ],
          duration: '30 minutos',
          intensity: 'moderado'
        },
        {
          dayOfWeek: 'quarta',
          label: 'QUA - LOWER BODY',
          focus: ['pernas', 'glúteos'],
          exercises: [
            createExercise('Agachamento profundo', 4, '12', '45seg', 'quadríceps'),
            createExercise('Afundo reverso', 3, '12 cada', '45seg', 'quadríceps'),
            createExercise('Elevação pélvica unilateral', 3, '12 cada', '30seg', 'glúteos'),
            createExercise('Step up na cadeira', 3, '10 cada', '45seg', 'quadríceps'),
          ],
          duration: '30 minutos',
          intensity: 'moderado'
        },
        {
          dayOfWeek: 'sexta',
          label: 'SEX - HIIT GLÚTEOS',
          focus: ['glúteos', 'cardio'],
          exercises: [
            createExercise('Agachamento jump leve', 3, '10', '30seg', 'quadríceps'),
            createExercise('Ponte explosiva', 3, '15', '30seg', 'glúteos'),
            createExercise('Afundo pulsando', 3, '10 cada', '30seg', 'quadríceps'),
            createExercise('Mountain climber', 3, '20', '30seg', 'core'),
          ],
          duration: '25 minutos',
          intensity: 'intenso'
        }
      ],
      tips: [
        'Aumente o tempo sob tensão segurando 2seg no topo',
        'Mantenha o core ativado em todos os exercícios',
        'Hidrate-se antes, durante e depois'
      ]
    }
  ]
};

// ============================================
// TEMPLATE: Masculino + Academia + Hipertrofia + Intermediário
// Referência: Leandro Twin, Laércio Refundini
// ============================================
const masculinoHipertrofiaIntermediario: StructuredWorkoutProgram = {
  title: '💪 Hipertrofia ABC',
  subtitle: 'Programa de Ganho Muscular',
  description: 'Treino ABC clássico para hipertrofia com foco em exercícios compostos. Baseado em Leandro Twin e Laércio Refundini.',
  
  targetGender: 'masculino',
  targetAgeGroup: ['jovem', 'adulto'],
  targetLevel: ['moderado', 'avancado'],
  targetGoal: ['hipertrofia'],
  targetLocation: ['academia'],
  
  duration: '8 semanas',
  frequency: '5x por semana',
  sessionTime: '60-75 minutos',
  referenceChannels: ['Leandro Twin', 'Laércio Refundini', 'Renato Cariani'],
  
  weeks: [
    {
      weekNumber: 1,
      theme: 'Base de Volume',
      days: [
        {
          dayOfWeek: 'segunda',
          label: 'SEG - PEITO/TRÍCEPS',
          focus: ['peito', 'tríceps'],
          exercises: [
            createExercise('Supino reto barra', 4, '10', '90seg', 'peito'),
            createExercise('Supino inclinado halteres', 4, '12', '75seg', 'peito'),
            createExercise('Crucifixo máquina', 3, '12', '60seg', 'peito'),
            createExercise('Crossover baixo', 3, '15', '60seg', 'peito'),
            createExercise('Tríceps pulley corda', 4, '12', '60seg', 'tríceps'),
            createExercise('Tríceps francês', 3, '12', '60seg', 'tríceps'),
          ],
          duration: '60 minutos',
          intensity: 'intenso'
        },
        {
          dayOfWeek: 'terca',
          label: 'TER - COSTAS/BÍCEPS',
          focus: ['costas', 'bíceps'],
          exercises: [
            createExercise('Barra fixa', 4, '8-10', '90seg', 'dorsais'),
            createExercise('Remada curvada', 4, '10', '90seg', 'dorsais'),
            createExercise('Puxada frontal', 3, '12', '75seg', 'dorsais'),
            createExercise('Remada baixa', 3, '12', '75seg', 'dorsais'),
            createExercise('Rosca direta barra', 4, '10', '60seg', 'bíceps'),
            createExercise('Rosca martelo', 3, '12', '60seg', 'bíceps'),
          ],
          duration: '60 minutos',
          intensity: 'intenso'
        },
        {
          dayOfWeek: 'quarta',
          label: 'QUA - PERNAS',
          focus: ['quadríceps', 'posterior', 'glúteos'],
          exercises: [
            createExercise('Agachamento livre', 4, '10', '120seg', 'quadríceps'),
            createExercise('Leg press 45°', 4, '12', '90seg', 'quadríceps'),
            createExercise('Hack machine', 3, '12', '75seg', 'quadríceps'),
            createExercise('Stiff', 4, '10', '90seg', 'posterior'),
            createExercise('Mesa flexora', 3, '12', '60seg', 'posterior'),
            createExercise('Panturrilha em pé', 4, '15', '45seg', 'panturrilha'),
          ],
          duration: '70 minutos',
          intensity: 'muito_intenso'
        },
        {
          dayOfWeek: 'quinta',
          label: 'QUI - OMBROS/TRAPÉZIO',
          focus: ['ombros', 'trapézio'],
          exercises: [
            createExercise('Desenvolvimento máquina', 4, '10', '75seg', 'ombros'),
            createExercise('Elevação lateral', 4, '12', '60seg', 'ombros'),
            createExercise('Elevação frontal alternada', 3, '12', '60seg', 'ombros'),
            createExercise('Crucifixo inverso', 3, '15', '60seg', 'ombros'),
            createExercise('Encolhimento barra', 4, '12', '60seg', 'trapézio'),
          ],
          duration: '55 minutos',
          intensity: 'intenso'
        },
        {
          dayOfWeek: 'sexta',
          label: 'SEX - FULL BODY PUMP',
          focus: ['corpo todo'],
          exercises: [
            createExercise('Supino reto', 3, '15', '60seg', 'peito'),
            createExercise('Puxada frontal', 3, '15', '60seg', 'costas'),
            createExercise('Leg press', 3, '20', '60seg', 'pernas'),
            createExercise('Desenvolvimento', 3, '15', '60seg', 'ombros'),
            createExercise('Rosca + Tríceps (bi-set)', 3, '12+12', '60seg', 'braços'),
            createExercise('Abdominal', 4, '20', '45seg', 'core'),
          ],
          duration: '50 minutos',
          intensity: 'moderado'
        }
      ],
      tips: [
        'Progressão de carga: aumente 2.5-5kg quando completar todas as reps',
        'Descanse 48h entre treinos do mesmo grupo muscular',
        'Consumir proteína pós-treino (0.4g/kg)'
      ]
    }
  ]
};

// ============================================
// TEMPLATE: Senior + Casa + Saúde + Sedentário
// Referência: Dra Lili Aranda
// ============================================
const seniorSaudeIniciante: StructuredWorkoutProgram = {
  title: '🌟 Saúde Ativa 60+',
  subtitle: 'Programa Suave para Iniciantes',
  description: 'Treino de baixo impacto focado em mobilidade, equilíbrio e fortalecimento. Baseado em Dra Lili Aranda.',
  
  targetGender: 'nao_informar',
  targetAgeGroup: ['meia_idade', 'senior'],
  targetLevel: ['sedentario', 'leve'],
  targetGoal: ['saude', 'condicionamento'],
  targetLocation: ['casa_sem', 'casa_com'],
  
  duration: '6 semanas',
  frequency: '3x por semana',
  sessionTime: '15-25 minutos',
  referenceChannels: ['Dra Lili Aranda'],
  
  weeks: [
    {
      weekNumber: 1,
      theme: 'Despertar o Corpo',
      days: [
        {
          dayOfWeek: 'segunda',
          label: 'SEG - MOBILIDADE',
          focus: ['mobilidade', 'equilíbrio'],
          exercises: [
            createExercise('Marcha no lugar', 1, '2min', 'contínuo', 'cardio'),
            createExercise('Rotação de ombros', 2, '10 cada direção', '30seg', 'ombros'),
            createExercise('Inclinação lateral', 2, '8 cada lado', '30seg', 'oblíquos'),
            createExercise('Elevação de joelho apoiado', 2, '10 cada', '30seg', 'quadril'),
          ],
          duration: '15 minutos',
          intensity: 'leve'
        },
        {
          dayOfWeek: 'quarta',
          label: 'QUA - FORTALECIMENTO LEVE',
          focus: ['força', 'equilíbrio'],
          exercises: [
            createExercise('Sentar e levantar da cadeira', 2, '10', '60seg', 'pernas'),
            createExercise('Flexão na parede', 2, '10', '45seg', 'peito'),
            createExercise('Elevação lateral sentado', 2, '10', '45seg', 'ombros'),
            createExercise('Ponte glútea', 2, '10', '45seg', 'glúteos'),
          ],
          duration: '18 minutos',
          intensity: 'leve'
        },
        {
          dayOfWeek: 'sexta',
          label: 'SEX - EQUILÍBRIO E ALONGAMENTO',
          focus: ['equilíbrio', 'flexibilidade'],
          exercises: [
            createExercise('Ficar em um pé só (apoio)', 2, '15seg cada', '30seg', 'equilíbrio'),
            createExercise('Alongamento panturrilha', 2, '30seg cada', '15seg', 'panturrilha'),
            createExercise('Alongamento quadríceps apoiado', 2, '30seg cada', '15seg', 'quadríceps'),
            createExercise('Respiração profunda', 1, '10 respirações', 'contínuo', 'relaxamento'),
          ],
          duration: '15 minutos',
          intensity: 'leve'
        }
      ],
      tips: [
        'Sempre tenha uma cadeira ou parede por perto para apoio',
        'Respeite seu ritmo - não há pressa',
        'Pare imediatamente se sentir dor ou tontura'
      ]
    }
  ]
};

// ============================================
// TEMPLATE: Feminino + Academia + Emagrecimento
// Referência: Carol Borba, CHASE Brasil
// ============================================
const femininoEmagrecimentoAcademia: StructuredWorkoutProgram = {
  title: '🔥 Queima Total',
  subtitle: 'Programa de Emagrecimento Feminino',
  description: 'Combinação de musculação e HIIT para máxima queima calórica. Baseado em Carol Borba e CHASE Brasil.',
  
  targetGender: 'feminino',
  targetAgeGroup: ['jovem', 'adulto'],
  targetLevel: ['leve', 'moderado'],
  targetGoal: ['emagrecer'],
  targetLocation: ['academia'],
  
  duration: '8 semanas',
  frequency: '4x por semana',
  sessionTime: '45-55 minutos',
  referenceChannels: ['Carol Borba', 'CHASE Brasil'],
  
  weeks: [
    {
      weekNumber: 1,
      theme: 'Adaptação Metabólica',
      days: [
        {
          dayOfWeek: 'segunda',
          label: 'SEG - UPPER + HIIT',
          focus: ['peito', 'costas', 'cardio'],
          exercises: [
            createExercise('Supino máquina', 3, '15', '45seg', 'peito'),
            createExercise('Remada baixa', 3, '15', '45seg', 'costas'),
            createExercise('Puxada frontal', 3, '15', '45seg', 'costas'),
            createExercise('Desenvolvimento', 3, '12', '45seg', 'ombros'),
            createExercise('HIIT Esteira: 30seg sprint / 30seg caminhada', 1, '15min', 'intervalado', 'cardio'),
          ],
          duration: '50 minutos',
          intensity: 'intenso'
        },
        {
          dayOfWeek: 'terca',
          label: 'TER - LOWER + CARDIO',
          focus: ['pernas', 'glúteos', 'cardio'],
          exercises: [
            createExercise('Agachamento smith', 4, '15', '60seg', 'quadríceps'),
            createExercise('Leg press', 3, '20', '60seg', 'quadríceps'),
            createExercise('Cadeira abdutora', 3, '15', '45seg', 'abdutores'),
            createExercise('Stiff', 3, '12', '60seg', 'posterior'),
            createExercise('Bike moderada', 1, '15min', 'contínuo', 'cardio'),
          ],
          duration: '55 minutos',
          intensity: 'intenso'
        },
        {
          dayOfWeek: 'quinta',
          label: 'QUI - CIRCUITO METABÓLICO',
          focus: ['corpo todo'],
          exercises: [
            createExercise('Burpees', 4, '10', '30seg', 'corpo todo'),
            createExercise('Kettlebell swing', 4, '15', '30seg', 'posterior'),
            createExercise('Mountain climber', 4, '20', '30seg', 'core'),
            createExercise('Agachamento jump', 4, '12', '30seg', 'pernas'),
            createExercise('Prancha', 4, '30seg', '30seg', 'core'),
          ],
          duration: '35 minutos',
          intensity: 'muito_intenso'
        },
        {
          dayOfWeek: 'sexta',
          label: 'SEX - GLÚTEOS + CARDIO',
          focus: ['glúteos', 'cardio'],
          exercises: [
            createExercise('Hip thrust', 4, '12', '60seg', 'glúteos'),
            createExercise('Afundo caminhando', 3, '15 cada', '60seg', 'glúteos'),
            createExercise('Cadeira abdutora pesada', 3, '12', '45seg', 'abdutores'),
            createExercise('Elevação pélvica unilateral', 3, '12 cada', '45seg', 'glúteos'),
            createExercise('Escada 15min intervalado', 1, '15min', 'intervalado', 'cardio'),
          ],
          duration: '50 minutos',
          intensity: 'intenso'
        }
      ],
      tips: [
        'Mantenha a intensidade alta para maximizar a queima',
        'Hidrate-se muito - mínimo 2L de água por dia',
        'Combine com déficit calórico moderado (300-500kcal)'
      ]
    }
  ]
};

// ============================================
// LISTA DE TODOS OS TEMPLATES
// ============================================
export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: 'feminino-gluteos-iniciante',
    name: 'Glúteos em Casa - Iniciante Feminino',
    matchCriteria: {
      genders: ['feminino'],
      ageGroups: ['jovem', 'adulto'],
      levels: ['sedentario', 'leve'],
      locations: ['casa_sem'],
      goals: ['hipertrofia', 'emagrecer', 'condicionamento', 'saude'],
      bodyFocus: ['gluteos_pernas', 'corpo_equilibrado']
    },
    priority: 90,
    program: femininoGluteosIniciante
  },
  {
    id: 'masculino-hipertrofia-intermediario',
    name: 'Hipertrofia ABC - Masculino Intermediário',
    matchCriteria: {
      genders: ['masculino', 'nao_informar'],
      ageGroups: ['jovem', 'adulto'],
      levels: ['moderado', 'avancado'],
      locations: ['academia'],
      goals: ['hipertrofia'],
      bodyFocus: ['peito', 'bracos_ombros', 'corpo_equilibrado']
    },
    priority: 95,
    program: masculinoHipertrofiaIntermediario
  },
  {
    id: 'senior-saude-iniciante',
    name: 'Saúde Ativa 60+ - Senior',
    matchCriteria: {
      genders: ['feminino', 'masculino', 'nao_informar'],
      ageGroups: ['meia_idade', 'senior'],
      levels: ['sedentario', 'leve'],
      locations: ['casa_sem', 'casa_com'],
      goals: ['saude', 'condicionamento'],
      bodyFocus: ['corpo_equilibrado']
    },
    priority: 100,
    program: seniorSaudeIniciante
  },
  {
    id: 'feminino-emagrecimento-academia',
    name: 'Queima Total - Feminino Academia',
    matchCriteria: {
      genders: ['feminino'],
      ageGroups: ['jovem', 'adulto'],
      levels: ['leve', 'moderado'],
      locations: ['academia'],
      goals: ['emagrecer'],
      bodyFocus: ['gluteos_pernas', 'abdomen_core', 'corpo_equilibrado']
    },
    priority: 92,
    program: femininoEmagrecimentoAcademia
  }
];

// Função para encontrar o melhor template
export const findBestTemplate = (
  profile: import('@/types/workout-program').UserProfile
): WorkoutTemplate | null => {
  const { calculateMatchScore } = require('@/lib/profile-matcher');
  
  let bestMatch: WorkoutTemplate | null = null;
  let bestScore = 0;
  
  for (const template of workoutTemplates) {
    const score = calculateMatchScore(profile, template.matchCriteria);
    const totalScore = score + template.priority;
    
    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMatch = template;
    }
  }
  
  return bestMatch;
};
