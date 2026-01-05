// Hook para gerar recomendações de treino baseadas nas respostas do usuário
// Prioridade: 1) Limitações físicas 2) Local 3) Objetivo 4) Nível
// TAMBÉM considera histórico de treinos para personalização

export interface UserAnswers {
  level: string;
  experience: string;
  time: string;
  frequency: string;
  location: string;
  goal: string;
  limitation: string;
}

export interface WeekPlanItem {
  week: number;
  activities: string[];
  days: string;
}

export interface ProgramRecommendation {
  title: string;
  subtitle: string;
  duration: string;
  frequency: string;
  time: string;
  description: string;
  weekPlan: WeekPlanItem[];
}

export interface WorkoutHistoryItem {
  id: string;
  workout_name?: string | null;
  exercises_completed?: any;
  duration_minutes?: number | null;
  created_at: string;
}

// Analisa histórico para ajustar dificuldade
export const analyzeWorkoutHistory = (history: WorkoutHistoryItem[]): {
  averageWorkoutsPerWeek: number;
  totalWorkouts: number;
  lastWorkoutDaysAgo: number;
  suggestedIntensityAdjustment: 'easier' | 'same' | 'harder';
} => {
  if (!history || history.length === 0) {
    return {
      averageWorkoutsPerWeek: 0,
      totalWorkouts: 0,
      lastWorkoutDaysAgo: 999,
      suggestedIntensityAdjustment: 'same'
    };
  }

  const now = new Date();
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const lastWorkout = new Date(sortedHistory[0].created_at);
  const lastWorkoutDaysAgo = Math.floor((now.getTime() - lastWorkout.getTime()) / (1000 * 60 * 60 * 24));

  // Calcular treinos por semana (últimas 4 semanas)
  const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  const recentWorkouts = sortedHistory.filter(w => new Date(w.created_at) >= fourWeeksAgo);
  const averageWorkoutsPerWeek = recentWorkouts.length / 4;

  // Sugestão de ajuste
  let suggestedIntensityAdjustment: 'easier' | 'same' | 'harder' = 'same';
  
  if (lastWorkoutDaysAgo > 14) {
    // Muito tempo sem treinar - diminuir intensidade
    suggestedIntensityAdjustment = 'easier';
  } else if (averageWorkoutsPerWeek >= 4 && lastWorkoutDaysAgo <= 3) {
    // Treina consistentemente - pode aumentar
    suggestedIntensityAdjustment = 'harder';
  }

  return {
    averageWorkoutsPerWeek,
    totalWorkouts: history.length,
    lastWorkoutDaysAgo,
    suggestedIntensityAdjustment
  };
};

// Adapta exercícios baseado na limitação do usuário
export const adaptExercisesForLimitation = (activities: string[], limitation: string): string[] => {
  if (limitation === 'nenhuma') return activities;
  
  return activities.map(activity => {
    if (limitation === 'joelho') {
      // Substituir TODOS os exercícios de impacto
      return activity
        .replace(/Agachamento(?! (isométrico|na parede|parcial))/gi, 'Agachamento parcial (sem ultrapassar 90°)')
        .replace(/Jump squat/gi, 'Agachamento isométrico na parede 30s')
        .replace(/Burpee(?! (sem salto|simplificado))/gi, 'Burpee sem salto (step back)')
        .replace(/Afundo(?! (reverso|controlado))/gi, 'Step lateral controlado')
        .replace(/Corrida/gi, 'Caminhada inclinada ou bike')
        .replace(/Pular corda/gi, 'Marcha estacionária')
        .replace(/Box jump/gi, 'Step up controlado')
        .replace(/Bulgarian split/gi, 'Hip thrust unilateral')
        .replace(/Salto|Saltando|Jump/gi, 'movimento controlado')
        .replace(/Leg press 45°/gi, 'Leg press horizontal (amplitude 90°)');
    }
    if (limitation === 'costas') {
      return activity
        .replace(/Levantamento terra/gi, 'Hip thrust no banco')
        .replace(/Stiff(?! (sentado))/gi, 'Ponte glútea elevada')
        .replace(/Remada curvada/gi, 'Remada apoiada no banco inclinado')
        .replace(/Good morning/gi, 'Bird dog alternado')
        .replace(/Abdominal(?! (isométrico|bike|infra|prancha))/gi, 'Dead bug')
        .replace(/Sit-up/gi, 'Prancha isométrica 30s')
        .replace(/Crunch/gi, 'Dead bug alternado')
        .replace(/Desenvolvimento(?! sentado)/gi, 'Desenvolvimento sentado com apoio');
    }
    if (limitation === 'ombro') {
      return activity
        .replace(/Desenvolvimento(?! (neutro|frontal leve))/gi, 'Elevação lateral leve 3x15')
        .replace(/Supino (reto|inclinado|declinado)/gi, 'Supino neutro com halteres (pegada neutra)')
        .replace(/Pull-up|Barra fixa/gi, 'Puxada com pegada neutra')
        .replace(/Mergulho/gi, 'Flexão com amplitude reduzida')
        .replace(/Arnold press/gi, 'Elevação frontal alternada');
    }
    if (limitation === 'cardiaco') {
      return activity
        .replace(/HIIT/gi, 'Treino contínuo moderado')
        .replace(/sprint/gi, 'ritmo moderado')
        .replace(/intenso|intensa|muito intensa/gi, 'moderado')
        .replace(/(\d+)min (sprint|intenso)/gi, '$1min moderado')
        + ' ⚠️ Monitorar FC (máx 120-140bpm)';
    }
    return activity;
  });
};

// ============================================
// PROGRAMAS POR LOCAL E OBJETIVO
// ============================================

const generateSedentarioProgram = (answers: UserAnswers): ProgramRecommendation => {
  const hasLimitation = answers.limitation !== 'nenhuma';
  
  let weekPlan: WeekPlanItem[];
  
  if (answers.limitation === 'joelho') {
    weekPlan = [
      {
        week: 1,
        activities: [
          '🚶 Caminhada Suave 10min: Ritmo leve sem impacto (3.5km/h) em superfície plana',
          '🧘 Alongamento Gentil 5min: Panturrilha apoiado 30s cada → Quadríceps com apoio 20s cada → Ombros 30s'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Qua, Sex, Sáb'
      },
      {
        week: 2,
        activities: [
          '🚶 Caminhada Progressiva 12min: Aquecimento 3min → Moderada 6min → Desaquecimento 3min',
          '💪 Exercícios Sem Impacto 8min: Ponte glútea 15x → Elevação de pernas deitado 10x cada → Prancha 20s → Abdução de quadril deitado 10x cada'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Qua, Sex, Sáb'
      },
      {
        week: 3,
        activities: [
          '🚶 Caminhada 15min: Com variação de ritmo (leve/moderado)',
          '💪 Circuito Articular 10min: Ponte glútea 20x → Agachamento na parede 20s → Panturrilha no step 15x → Prancha 30s'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Ter, Qui, Sáb'
      },
      {
        week: 4,
        activities: [
          '🚶 Caminhada 20min: Alternando 2min leve / 2min moderado',
          '💪 Fortalecimento 12min: Agachamento parcial (não ultrapassa 90°) 12x → Ponte unilateral 8x cada → Step lateral 10x cada → Prancha 45s'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Ter, Qui, Sáb'
      }
    ];
  } else if (answers.limitation === 'costas') {
    weekPlan = [
      {
        week: 1,
        activities: [
          '🚶 Caminhada com Postura 10min: Foco em manter coluna neutra, passos curtos',
          '🧘 Alongamento para Coluna 8min: Cat-cow 10x → Child pose 30s → Joelho ao peito 30s cada'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Qua, Sex, Sáb'
      },
      {
        week: 2,
        activities: [
          '🚶 Caminhada 12min: Postura ereta, sem inclinar o tronco',
          '💪 Fortalecimento Core 8min: Dead bug 10x cada → Bird dog 8x cada → Prancha frontal 20s → Ponte glútea 15x'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Qua, Sex, Sáb'
      },
      {
        week: 3,
        activities: [
          '🚶 Caminhada 15min: Com foco em respiração e postura',
          '💪 Estabilização 10min: Dead bug progressivo 12x → Bird dog com pausa 10x → Prancha 30s → Ponte com elevação alternada 10x'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Ter, Qui, Sáb'
      },
      {
        week: 4,
        activities: [
          '🚶 Caminhada 20min: Ritmo moderado mantendo postura',
          '💪 Circuito Protetor 12min: Agachamento com apoio 12x → Dead bug 15x cada → Bird dog 12x cada → Prancha lateral 20s cada'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Ter, Qui, Sáb'
      }
    ];
  } else if (answers.limitation === 'cardiaco') {
    weekPlan = [
      {
        week: 1,
        activities: [
          '🚶 Caminhada Leve 8min: Ritmo muito suave (3km/h) ⚠️ Monitorar FC (máx 100-110bpm)',
          '🧘 Respiração 5min: Respiração diafragmática 3min → Alongamento suave 2min'
        ],
        days: 'Seg, Qua, Sex'
      },
      {
        week: 2,
        activities: [
          '🚶 Caminhada Controlada 10min: Manter FC entre 100-115bpm',
          '🧘 Relaxamento 6min: Respiração guiada → Alongamento completo'
        ],
        days: 'Seg, Qua, Sex'
      },
      {
        week: 3,
        activities: [
          '🚶 Caminhada 12min: FC controlada (110-120bpm máx)',
          '💪 Exercícios Leves 6min: Marcha no lugar 1min → Elevação de braços 10x → Agachamento parcial 8x'
        ],
        days: 'Seg, Qua, Sex'
      },
      {
        week: 4,
        activities: [
          '🚶 Caminhada 15min: FC máx 120-130bpm',
          '💪 Circuito Suave 8min: Caminhada no lugar 2min → Exercícios de braço 2min → Agachamento leve 8x → Alongamento 3min'
        ],
        days: 'Seg, Qua, Sex'
      }
    ];
  } else {
    // Sem limitação
    weekPlan = [
      {
        week: 1,
        activities: [
          '🏃‍♂️ Caminhada Estruturada 10min: Aquecimento 2min (4km/h) → Moderada 5min (5km/h) → Intensa 2min (6km/h) → Desaquecimento 1min',
          '🧘‍♀️ Alongamento Dinâmico 5min: Panturrilha 30s cada → Quadríceps 30s cada → Isquiotibiais 30s cada → Ombros 30s'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Qua, Sex, Sáb'
      },
      {
        week: 2,
        activities: [
          '🏃‍♂️ Caminhada Progressiva 15min: Aquecimento 3min → Moderada 4min → Intensa 4min → Moderada 3min → Desaquecimento 1min',
          '💪 Circuito Funcional 5min: Agachamento 10-12x → Flexão na Parede 8-10x → Elevação de Pernas 10x cada → Prancha 15-20s'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Qua, Sex, Sáb'
      },
      {
        week: 3,
        activities: [
          '🏃‍♂️ Caminhada Intervalos 20min: Aquecimento 3min → Alterna 3min moderada / 3min intensa → Desaquecimento 2min',
          '💪 Circuito Intermediário 10min: Agachamento 12-15x → Flexão Inclinada 10-12x → Ponte Glúteo 15-20x → Prancha Lateral 15s cada'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Ter, Qui, Sáb'
      },
      {
        week: 4,
        activities: [
          '🏃‍♂️ Caminhada HIIT 25min: Aquecimento 3min → Alterna intensidades → Desaquecimento 3min',
          '💪 Circuito Avançado 15min: Agachamento com Salto 10-12x → Flexão Tradicional 8-12x → Ponte Unilateral 10x cada → Prancha 30-45s'
        ],
        days: answers.frequency === '2-3x' ? 'Seg, Qua, Sex' : 'Seg, Ter, Qui, Sáb'
      }
    ];
  }

  return {
    title: hasLimitation ? '🛋️ Início Adaptado' : '🛋️ Do Sofá ao Movimento',
    subtitle: hasLimitation ? `Programa Especial - Proteção ${answers.limitation}` : 'Programa Super Iniciante',
    duration: '4 semanas',
    frequency: answers.frequency === '2-3x' ? '3x por semana' : '4x por semana',
    time: '10-20 minutos',
    description: hasLimitation 
      ? `Programa adaptado para sua limitação (${answers.limitation}). Todos os exercícios foram selecionados para treinar com segurança.`
      : 'Comece devagar e construa o hábito! Programa especialmente desenhado para quem está começando do zero.',
    weekPlan
  };
};

const generateCasaSemEquipamentosProgram = (answers: UserAnswers): ProgramRecommendation => {
  const weekPlan: WeekPlanItem[] = [
    {
      week: 1,
      activities: [
        'SEG - PERNAS: Agachamento livre 3x15 | Subida no banco/cadeira 3x10 cada | Afundo alternado 3x12 | Panturrilha na escada 3x20',
        'TER - PEITO/TRÍCEPS: Flexão na parede 3x12 | Mergulho na cadeira 3x10 | Flexão inclinada (mãos na mesa) 3x10 | Prancha 3x30seg',
        'QUI - COSTAS/BÍCEPS: Remada na mesa 3x12 | Superman no chão 3x15 | Rosca isométrica na mesa 3x20seg | Prancha reversa 3x20seg',
        'SEX - FULL BODY: Circuito 3x: Agachamento 15x + Flexão 10x + Subida banco 10x cada + Abdominal 15x'
      ],
      days: 'Seg, Ter, Qui, Sex'
    },
    {
      week: 2,
      activities: [
        'SEG - PERNAS AVANÇADO: Agachamento búlgaro 3x12 | Agachamento sumô 3x15 | Step lateral 3x10 cada | Ponte glúteo elevada 3x15',
        'TER - UPPER INTENSO: Flexão declinada 3x10 | Mergulho profundo 3x12 | Flexão diamante 3x8 | Prancha lateral 3x25seg',
        'QUI - PULL/OMBRO: Remada invertida 3x15 | Elevação Y na parede 3x12 | Face pull com toalha 3x15 | Prancha comando 3x10',
        'SEX - CARDIO/CORE: Escada 5min | Burpees 3x10 | Mountain climber 3x20 | Abdominal bike 3x30'
      ],
      days: 'Seg, Ter, Qui, Sex'
    },
    {
      week: 3,
      activities: [
        'SEG - PERNAS POWER: Jump squat 3x12 | Afundo caminhando 3x15 cada | Panturrilha unilateral 3x15 | Agachamento isométrico 3x30seg',
        'TER - PUSH AVANÇADO: Flexão archer 3x8 cada | Mergulho pés elevados 3x12 | Flexão explosiva 3x8 | Prancha toca ombro 3x20',
        'QUI - PULL FORÇA: Remada australiana 3x12 | Pullover com toalha 3x15 | Remada unilateral 3x12 cada | Hollow hold 3x30seg',
        'SEX - HIIT: Circuito 4x: Burpees 10x + Escada 20x + Flexão 10x + Jump squat 10x (desc 30seg)'
      ],
      days: 'Seg, Ter, Qui, Sex'
    },
    {
      week: 4,
      activities: [
        'SEG - LEGS CHALLENGE: Pistol squat assistido 3x6 | Afundo búlgaro saltando 3x10 | Agachamento parede 3x45seg',
        'TER - UPPER CHALLENGE: Flexão pseudo planche 3x8 | Dips profundo 3x15 | Pike push up 3x12 | L-sit 3x20seg',
        'QUI - CORE/PULL: Typewriter pull 3x6 cada | Dragon flag negativa 3x5 | Hollow rocks 3x15',
        'SEX - FINAL TEST: 100 burpees + 100 agachamentos + 100 flexões + 100 abdominais (menor tempo)'
      ],
      days: 'Seg, Ter, Qui, Sex'
    }
  ];

  return {
    title: '🏠 Treino em Casa - Peso Corporal',
    subtitle: 'Use Móveis: Mesa, Cadeira, Escada',
    duration: '8 semanas',
    frequency: answers.frequency === '2-3x' ? '3x por semana' : '4x por semana',
    time: answers.time === '10-15' ? '25 minutos' : '40 minutos',
    description: 'Transforme sua casa em academia! Use cadeiras, mesa, escada e parede para resultados reais.',
    weekPlan: weekPlan.map(week => ({
      ...week,
      activities: adaptExercisesForLimitation(week.activities, answers.limitation)
    }))
  };
};

const generateCasaComEquipamentosProgram = (answers: UserAnswers): ProgramRecommendation => {
  const weekPlan: WeekPlanItem[] = [
    {
      week: 1,
      activities: [
        'SEG - PEITO/TRÍCEPS: Supino halter 4x12 | Supino inclinado 3x12 | Crucifixo 3x15 | Tríceps francês 3x12 | Tríceps kickback 3x15',
        'TER - COSTAS/BÍCEPS: Remada curvada 4x12 | Remada unilateral 3x12 cada | Pull down elástico 3x15 | Rosca alternada 4x12 | Rosca martelo 3x12',
        'QUA - PERNAS: Agachamento búlgaro c/ halter 4x12 | Goblet squat 4x15 | Stiff 4x12 | Afundo 3x15 | Panturrilha 4x20',
        'QUI - OMBRO/CORE: Desenvolvimento 4x12 | Arnold press 3x12 | Elevação lateral 4x15 | Encolhimento 3x15 | Prancha 4x60seg',
        'SEX - FULL BODY: Agachamento 4x10 | Supino 4x10 | Remada 4x10 | Desenvolvimento 3x10 | Abdominal 4x15'
      ],
      days: 'Seg, Ter, Qua, Qui, Sex'
    },
    {
      week: 2,
      activities: [
        'SEG - PEITO VOLUME: Supino 5x12 | Supino declinado 3x12 | Fly elástico 4x15 | Tríceps overhead 4x12 | Mergulho 3x12',
        'TER - COSTAS DENSIDADE: Remada supinada 4x10 | Remada pronada 4x10 | Serrote 3x12 | Rosca 21s 3x | Rosca inversa 3x15',
        'QUA - PERNAS METABÓLICO: Goblet squat 4x20 | Afundo reverso 4x15 | Stiff unilateral 3x12 | Panturrilha 5x25',
        'QUI - OMBRO ACESSÓRIOS: Elevação lateral drop 3x | Face pull 4x15 | Crucifixo inverso 4x15 | Prancha lateral 3x45seg',
        'SEX - PUMP: Circuito 5x: Agachamento 20x + Supino 15x + Remada 15x + Desenvolvimento 12x (60seg desc)'
      ],
      days: 'Seg, Ter, Qua, Qui, Sex'
    },
    {
      week: 3,
      activities: [
        'SEG - PEITO INTENSO: Supino rest-pause 4x | Supino inclinado cluster 3x | Fly drop set 3x | Tríceps superset 4x12+12',
        'TER - COSTAS ESPESSURA: Remada Pendlay 4x10 | Pull pesado 4x10 | Shrug 4x15 | Rosca concentrada 4x10',
        'QUA - PERNAS FORÇA: Agachamento 5x10 | Bulgarian split pausa 4x10 | Stiff 5x10 | Panturrilha explosiva 5x15',
        'QUI - DELTS ESTABILIDADE: Military press 5x8 | Elevação superset 3x12+12 | Face pull pesado 4x12 | Core 4min',
        'SEX - ENDURANCE: 60min treino metabólico: 3x20-25 reps carga leve, 30seg descanso'
      ],
      days: 'Seg, Ter, Qua, Qui, Sex'
    },
    {
      week: 4,
      activities: [
        'DELOAD WEEK: Reduzir 40% carga, manter volume',
        'Foco em técnica perfeita e amplitude',
        'Recuperação ativa e mobilidade',
        'Preparação para próximo ciclo'
      ],
      days: 'Seg, Ter, Qua, Qui, Sex'
    }
  ];

  return {
    title: '🏠 Home Gym Completo',
    subtitle: 'Halteres, Elásticos, Banco e Barra',
    duration: '10 semanas',
    frequency: answers.frequency === '2-3x' ? '3x por semana' : '5x por semana',
    time: '50-65 minutos',
    description: 'Programa profissional usando equipamentos em casa. Resultados comparáveis à academia!',
    weekPlan: weekPlan.map(week => ({
      ...week,
      activities: adaptExercisesForLimitation(week.activities, answers.limitation)
    }))
  };
};

const generateAcademiaProgram = (answers: UserAnswers): ProgramRecommendation => {
  // Escolher programa baseado no OBJETIVO
  if (answers.goal === 'hipertrofia') {
    return generateAcademiaHipertrofia(answers);
  }
  if (answers.goal === 'emagrecer' || answers.goal === 'emagrecimento') {
    return generateAcademiaEmagrecimento(answers);
  }
  if (answers.goal === 'estresse') {
    return generateAcademiaAntiEstresse(answers);
  }
  // Default: condicionamento/saúde
  return generateAcademiaCondicionamento(answers);
};

const generateAcademiaHipertrofia = (answers: UserAnswers): ProgramRecommendation => {
  const weekPlan: WeekPlanItem[] = [
    {
      week: 1,
      activities: [
        'SEG - PEITO/TRÍCEPS: Supino reto 4x10 | Supino inclinado 3x12 | Crucifixo 3x12 | Crossover 3x15 | Tríceps pulley 3x12 | Tríceps francês 3x12',
        'TER - COSTAS/BÍCEPS: Barra fixa 4x8-10 | Puxada frontal 3x12 | Remada curvada 4x10 | Pullover 3x12 | Rosca direta 3x12 | Rosca martelo 3x12',
        'QUA - PERNAS: Agachamento livre 4x12 | Leg press 4x15 | Hack 3x12 | Extensora 3x15 | Flexora 3x15 | Stiff 3x12 | Panturrilha 4x20',
        'QUI - OMBRO/TRAPÉZIO: Desenvolvimento 4x10 | Elevação lateral 4x12 | Elevação frontal 3x12 | Crucifixo inverso 3x15 | Encolhimento 4x15',
        'SEX - FULL BODY: Supino 3x15 | Leg press 3x20 | Puxada 3x15 | Agachamento 3x15 | Desenvolvimento 3x15 | Abdominal 4x20'
      ],
      days: 'Seg, Ter, Qua, Qui, Sex'
    },
    {
      week: 2,
      activities: [
        'SEG - PEITO/TRÍCEPS: Supino reto 4x8 (+5% carga) | Supino declinado 3x10 | Crucifixo inclinado 3x12 | Tríceps testa 4x10 | Mergulho 3x12',
        'TER - COSTAS/BÍCEPS: Levantamento terra 4x8 | Barra fixa peso 3x8 | Remada T 4x10 | Rosca scott 3x10 | Rosca inversa 3x12',
        'QUA - PERNAS: Agachamento frontal 4x10 | Leg press unilateral 3x12 | Afundo caminhando 3x15 | Mesa flexora 3x12 | Panturrilha pé 4x20',
        'QUI - OMBRO/CORE: Arnold press 4x10 | Elevação lateral cabo 4x12 | Face pull 4x15 | Prancha 4x60seg | Russian twist 4x30',
        'SEX - INTENSIDADE: Drop sets todos grupos - peito 3x | costas 3x | pernas 3x | ombros 3x'
      ],
      days: 'Seg, Ter, Qua, Qui, Sex'
    },
    {
      week: 3,
      activities: [
        'SEG - PEITO/FORÇA: Supino 5x5 (80% 1RM) | Supino inclinado 4x8 | Crucifixo 3x10 | Tríceps francês 4x8',
        'TER - COSTAS/VOLUME: Barra fixa até falha 5x | Puxada neutra 4x10 | Remada baixa 4x10 | Rosca 21s 3x',
        'QUA - PERNAS/EXPLOSÃO: Agachamento 4x10 | Leg press explosivo 4x12 | Bulgarian split 3x12 | Stiff romeno 4x10',
        'QUI - OMBRO/HIPERTROFIA: Desenvolvimento Smith 4x10 | Elevação lateral drop 3x | Pássaro 4x15',
        'SEX - PUMP: Circuito 4x: Supino 15x + Leg press 20x + Remada 15x + Desenvolvimento 12x (60seg desc)'
      ],
      days: 'Seg, Ter, Qua, Qui, Sex'
    },
    {
      week: 4,
      activities: [
        'DELOAD WEEK: Reduzir 30% carga, manter volume',
        'Recuperação ativa, treinos mais leves',
        'Foco em técnica e conexão mente-músculo',
        'Preparação para novo ciclo de progressão'
      ],
      days: 'Seg, Ter, Qua, Qui, Sex'
    }
  ];

  return {
    title: '🏋️ Academia - Hipertrofia ABC',
    subtitle: 'Ganho de Massa Muscular',
    duration: '12 semanas',
    frequency: answers.frequency === '2-3x' ? '3x por semana' : '5x por semana',
    time: '60-75 minutos',
    description: 'Treino ABC focado em hipertrofia com volume alto e técnica perfeita. Ideal para ganho de massa muscular.',
    weekPlan: weekPlan.map(week => ({
      ...week,
      activities: adaptExercisesForLimitation(week.activities, answers.limitation)
    }))
  };
};

const generateAcademiaEmagrecimento = (answers: UserAnswers): ProgramRecommendation => {
  const weekPlan: WeekPlanItem[] = [
    {
      week: 1,
      activities: [
        'SEG - UPPER + HIIT: Supino 3x15 | Remada 3x15 | Desenvolvimento 3x15 | + HIIT Esteira 20min (30seg sprint/30seg caminhada)',
        'TER - LOWER + CARDIO: Agachamento 4x20 | Leg press 3x25 | Stiff 3x15 | Extensora 3x20 | + Bike 15min moderado',
        'QUA - CIRCUITO: 5 rounds: Burpees 15x + Kettlebell swing 20x + Battle rope 30seg + Box jump 12x + Prancha 45seg (60seg desc)',
        'QUI - UPPER METABÓLICO: Supino inclinado 3x15 | Barra fixa 3x10 | Arnold press 3x15 | Remada 3x15 | + Assault bike 15min',
        'SEX - HIIT TOTAL: 30min HIIT transport | Circuito: Agachamento jump 20x + Flexão 15x + Mountain climber 30x + Russian twist 30x'
      ],
      days: 'Seg, Ter, Qua, Qui, Sex'
    },
    {
      week: 2,
      activities: [
        'SEG - PUSH + HIIT: Supino 4x12 | Desenvolvimento 3x12 | Crossover 3x15 | Tríceps 3x15 | + Remo 15min intervalado',
        'TER - PULL + CARDIO: Levantamento terra 4x12 | Puxada 4x12 | Remada baixa 3x15 | Rosca 3x15 | + Escada 10min',
        'QUA - LEGS + PLIOMÉTRICO: Agachamento 4x15 | Afundo caminhando 3x20 | Jump squat 4x15 | Stiff 3x15 | + Jump rope 10min',
        'QUI - FULL BODY FORÇA: Supino 4x10 | Agachamento 4x10 | Barra fixa 4x10 | Desenvolvimento 3x10 | + Bike sprint 20min',
        'SEX - CARDIO CHALLENGE: 45min steady state (Z2) + 5 sprints de 1min'
      ],
      days: 'Seg, Ter, Qua, Qui, Sex'
    }
  ];

  return {
    title: '🔥 Academia - Emagrecimento HIIT',
    subtitle: 'Queima de Gordura e Definição',
    duration: '10 semanas',
    frequency: answers.frequency === '2-3x' ? '3x por semana' : '5x por semana',
    time: '50-65 minutos',
    description: 'Programa intenso com musculação + HIIT para máxima queima calórica e preservação muscular.',
    weekPlan: weekPlan.map(week => ({
      ...week,
      activities: adaptExercisesForLimitation(week.activities, answers.limitation)
    }))
  };
};

const generateAcademiaCondicionamento = (answers: UserAnswers): ProgramRecommendation => {
  const weekPlan: WeekPlanItem[] = [
    {
      week: 1,
      activities: [
        'SEG - PEITO/TRÍCEPS: Supino reto 4x10 | Supino inclinado 3x12 | Crucifixo 3x12 | Tríceps pulley 3x12 | Tríceps francês 3x12',
        'QUA - COSTAS/BÍCEPS: Barra fixa 4x8 | Puxada frontal 3x12 | Remada curvada 4x10 | Rosca direta 3x12 | Rosca martelo 3x12',
        'QUI - PERNAS: Agachamento livre 4x12 | Leg press 4x15 | Stiff 3x12 | Extensora 3x15 | Flexora 3x15 | Panturrilha 4x20',
        'SEX - OMBRO/CORE: Desenvolvimento 4x10 | Elevação lateral 3x12 | Elevação frontal 3x12 | Prancha 4x45seg | Russian twist 3x30'
      ],
      days: 'Seg, Qua, Qui, Sex'
    },
    {
      week: 2,
      activities: [
        'SEG - PEITO/FORÇA: Supino 5x8 | Supino declinado 3x10 | Crossover 3x15 | Tríceps corda 4x12 | Mergulho 3x12',
        'QUA - COSTAS/VOLUME: Levantamento terra 4x10 | Puxada aberta 4x10 | Remada T 3x12 | Rosca scott 3x12',
        'QUI - PERNAS/EXPLOSÃO: Agachamento 4x10 | Leg press unilateral 3x12 | Afundo caminhando 3x15 | Bulgarian 3x12',
        'SEX - OMBRO/ESTABILIDADE: Arnold press 4x10 | Elevação lateral cabo 4x12 | Face pull 4x15 | Prancha lateral 3x30seg'
      ],
      days: 'Seg, Qua, Qui, Sex'
    }
  ];

  return {
    title: '🏋️ Academia - Condicionamento Geral',
    subtitle: 'Desenvolvimento Físico Completo',
    duration: '8 semanas',
    frequency: answers.frequency === '2-3x' ? '3x por semana' : '4x por semana',
    time: '55-70 minutos',
    description: 'Treino balanceado para ganho de força, hipertrofia moderada e condicionamento cardiovascular.',
    weekPlan: weekPlan.map(week => ({
      ...week,
      activities: adaptExercisesForLimitation(week.activities, answers.limitation)
    }))
  };
};

const generateAcademiaAntiEstresse = (answers: UserAnswers): ProgramRecommendation => {
  const weekPlan: WeekPlanItem[] = [
    {
      week: 1,
      activities: [
        'SEG - CORPO INTEIRO + RELAXAMENTO: Aquecimento bike 10min | Supino 3x12 | Remada 3x12 | Agachamento 3x12 | Alongamento 15min',
        'QUA - CARDIO + YOGA: 20min esteira moderada | 20min alongamento/yoga | Respiração diafragmática 5min',
        'SEX - FUNCIONAL LEVE: Kettlebell swing 3x15 | TRX row 3x12 | Goblet squat 3x15 | Prancha 3x45seg | Foam roller 10min'
      ],
      days: 'Seg, Qua, Sex'
    },
    {
      week: 2,
      activities: [
        'SEG - MUSCULAÇÃO MODERADA: Supino 3x15 | Puxada 3x15 | Leg press 3x15 | Elevação lateral 3x15 | Abdominal 3x20',
        'QUA - CARDIO REGENERATIVO: 30min bike ou elíptico (conversar possível) | Foam roller 15min',
        'SEX - CIRCUITO RELAXANTE: 3x: Agachamento 12x + Flexão 10x + Remada TRX 12x + Prancha 30seg | Yoga 15min'
      ],
      days: 'Seg, Qua, Sex'
    }
  ];

  return {
    title: '🧘 Academia - Anti-Estresse',
    subtitle: 'Equilíbrio Corpo e Mente',
    duration: '8 semanas',
    frequency: '3x por semana',
    time: '45-60 minutos',
    description: 'Programa focado em reduzir estresse através de exercícios moderados, alongamento e técnicas de relaxamento.',
    weekPlan: weekPlan.map(week => ({
      ...week,
      activities: adaptExercisesForLimitation(week.activities, answers.limitation)
    }))
  };
};

const generateDefaultProgram = (answers: UserAnswers): ProgramRecommendation => {
  const weekPlan: WeekPlanItem[] = [
    { week: 1, activities: ['Caminhada leve 15min'], days: 'Seg-Sex' },
    { week: 2, activities: ['Caminhada moderada 20min'], days: 'Seg-Sex' },
    { week: 3, activities: ['Caminhada 25min + ritmo variado'], days: 'Seg-Sex' },
    { week: 4, activities: ['Caminhada 30min'], days: 'Seg-Sex' }
  ];

  return {
    title: '🏃 Programa de Caminhada',
    subtitle: 'Construindo Resistência',
    duration: '4 semanas',
    frequency: answers.frequency === '2-3x' ? '3x por semana' : '5x por semana',
    time: '20-30 minutos',
    description: 'Aumente gradualmente sua resistência com caminhadas progressivas.',
    weekPlan: weekPlan.map(week => ({
      ...week,
      activities: adaptExercisesForLimitation(week.activities, answers.limitation)
    }))
  };
};

// ============================================
// FUNÇÃO PRINCIPAL DE RECOMENDAÇÃO
// ============================================
export const generateRecommendation = (answers: UserAnswers): ProgramRecommendation => {
  console.log('🎯 Gerando recomendação com:', {
    level: answers.level,
    goal: answers.goal,
    location: answers.location,
    limitation: answers.limitation,
    frequency: answers.frequency
  });

  // PRIORIDADE 1: Sedentário sempre recebe programa especial de início
  if (answers.level === 'sedentario') {
    console.log('📋 Programa: Sedentário');
    return generateSedentarioProgram(answers);
  }

  // PRIORIDADE 2: Verificar LOCAL
  if (answers.location === 'academia') {
    console.log('📋 Programa: Academia');
    return generateAcademiaProgram(answers);
  }

  if (answers.location === 'casa_com') {
    console.log('📋 Programa: Casa com Equipamentos');
    return generateCasaComEquipamentosProgram(answers);
  }

  if (answers.location === 'casa_sem' || answers.location === 'outdoor') {
    console.log('📋 Programa: Casa sem Equipamentos / Outdoor');
    return generateCasaSemEquipamentosProgram(answers);
  }

  // FALLBACK
  console.log('📋 Programa: Default');
  return generateDefaultProgram(answers);
};
