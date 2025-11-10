// Função para parsear texto de treino e transformar em estrutura detalhada

interface Exercise {
  name: string;
  sets?: string;
  reps?: string;
  rest?: string;
  weight?: string;
  notes?: string;
  completed?: boolean;
}

interface DayWorkout {
  day: string;
  focus: string;
  exercises: Exercise[];
}

interface Workout {
  name: string;
  description?: string;
  duration_minutes?: number;
  intensity?: string;
  exercises: Exercise[];
  warmup?: string;
  cooldown?: string;
  tips: string[];
  structure?: string;
}

export function parseWorkoutActivity(activityText: string): Workout {
  // Exemplo: "SEG - PEITO/TRÍCEPS: Supino reto 4x10 | Supino inclinado 3x12 ..."
  
  const exercises: Exercise[] = [];
  let name = '';
  let description = '';
  let duration_minutes = 60;
  
  // Extrair dia e grupo muscular
  const dayMatch = activityText.match(/^([A-Z]{3})\s*-\s*([^:]+):/);
  if (dayMatch) {
    name = `${dayMatch[1]} - ${dayMatch[2].trim()}`;
    description = `Treino de ${dayMatch[2].trim()}`;
  } else {
    name = activityText.substring(0, 50);
    description = activityText;
  }
  
  // Separar por pipe "|" para obter exercícios
  const parts = activityText.split('|').map(p => p.trim());
  
  parts.forEach((part, idx) => {
    if (idx === 0 && dayMatch) {
      // Primeira parte após o ":" contém o primeiro exercício
      part = part.split(':')[1]?.trim() || '';
    }
    
    if (!part || part.length < 3) return;
    
    // Padrões para identificar exercícios
    // Exemplo: "Supino reto 4x10"
    // Exemplo: "Supino reto 4x10 (60-70% 1RM)"
    // Exemplo: "Aquecimento 5min"
    
    const setsRepsMatch = part.match(/^(.+?)\s+(\d+)x(\d+(?:-\d+)?)/);
    const timeMatch = part.match(/^(.+?)\s+(\d+)min/);
    const isometricMatch = part.match(/^(.+?)\s+(\d+)x(\d+)seg/);
    
    if (setsRepsMatch) {
      const [_, exerciseName, sets, reps] = setsRepsMatch;
      const notesMatch = part.match(/\(([^)]+)\)/);
      
      exercises.push({
        name: exerciseName.trim(),
        sets: sets,
        reps: reps,
        rest: '60-90s',
        notes: notesMatch ? notesMatch[1] : undefined,
        completed: false
      });
    } else if (isometricMatch) {
      const [_, exerciseName, sets, seconds] = isometricMatch;
      exercises.push({
        name: exerciseName.trim(),
        sets: sets,
        reps: `${seconds} segundos`,
        rest: '45-60s',
        completed: false
      });
    } else if (timeMatch) {
      const [_, exerciseName, minutes] = timeMatch;
      // Aquecimento/cooldown
      if (exerciseName.toLowerCase().includes('aquecimento')) {
        duration_minutes += parseInt(minutes);
      }
    } else if (part.length > 10) {
      // Exercício sem formato padrão - adicionar como texto
      exercises.push({
        name: part.trim(),
        reps: 'Conforme programa',
        notes: 'Ver descrição completa',
        completed: false
      });
    }
  });
  
  // Se não encontrou exercícios estruturados, criar um exercício com o texto completo
  if (exercises.length === 0 && activityText.length > 20) {
    exercises.push({
      name: 'Treino Completo',
      reps: 'Ver estrutura',
      notes: activityText,
      completed: false
    });
  }
  
  return {
    name,
    description,
    duration_minutes,
    intensity: 'moderada',
    exercises,
    warmup: 'Aquecimento articular de 5-10 minutos',
    cooldown: 'Alongamento de 5 minutos',
    tips: [
      'Mantenha boa postura durante todo o exercício',
      'Hidrate-se adequadamente',
      'Respeite os intervalos de descanso',
      'Se sentir dor, pare imediatamente'
    ],
    structure: activityText
  };
}

export function parseWeekPlan(weekPlan: any[]): any[] {
  if (!weekPlan || weekPlan.length === 0) return [];
  
  return weekPlan.map((week) => {
    if (!week.activities || week.activities.length === 0) {
      return week;
    }
    
    const workouts = week.activities.map((activity: string) => 
      parseWorkoutActivity(activity)
    );
    
    return {
      ...week,
      workouts
    };
  });
}

// Função para transformar weeks em formato de weekPlan para ExerciseDetailView
export function transformWeeksToWeekPlan(weeks: any[]): DayWorkout[] {
  if (!weeks || !Array.isArray(weeks) || weeks.length === 0) {
    return [];
  }

  const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
  const weekPlan: DayWorkout[] = [];

  // Pegar a primeira semana (semana 1) para montar o plano semanal
  const firstWeek = weeks[0];
  
  if (!firstWeek.activities || !Array.isArray(firstWeek.activities)) {
    return [];
  }

  firstWeek.activities.forEach((activity: string, index: number) => {
    const workout = parseWorkoutActivity(activity);
    
    // Extrair o dia da semana do activity text (ex: "SEG - PEITO")
    const dayMatch = activity.match(/^([A-Z]{3})\s*-\s*([^:]+):/);
    let dayName = dayNames[index] || `Dia ${index + 1}`;
    let focus = workout.description || 'Treino completo';

    if (dayMatch) {
      const dayAbbr = dayMatch[1];
      const muscleGroup = dayMatch[2].trim();
      
      // Mapear abreviações para nomes completos
      const dayMap: { [key: string]: string } = {
        'SEG': 'Segunda-feira',
        'TER': 'Terça-feira',
        'QUA': 'Quarta-feira',
        'QUI': 'Quinta-feira',
        'SEX': 'Sexta-feira',
        'SAB': 'Sábado',
        'DOM': 'Domingo'
      };
      
      dayName = dayMap[dayAbbr] || dayName;
      focus = muscleGroup;
    }

    weekPlan.push({
      day: dayName,
      focus: focus,
      exercises: workout.exercises
    });
  });

  return weekPlan;
}
