/**
 * User Profile Analyzer Service
 * Analisa o perfil completo do usuário para recomendações personalizadas de suplementos
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================
// TIPOS E INTERFACES
// ============================================

export interface HealthIssue {
  hasIssue: boolean;
  severity: number; // 0-10
  details?: string;
}

export interface UserHealthProfile {
  // Dados básicos
  userId: string;
  age: number;
  gender: 'masculino' | 'feminino';
  weight: number;
  height: number;
  bmi: number;
  
  // Objetivo principal
  primaryGoal: 'lose_weight' | 'gain_mass' | 'maintain' | 'health';
  
  // Problemas de saúde (da anamnese)
  healthIssues: {
    sleep: HealthIssue;
    stress: HealthIssue;
    energy: HealthIssue;
    digestion: HealthIssue;
    immunity: HealthIssue;
    focus: HealthIssue;
    pain: HealthIssue & { location?: string };
  };
  
  // Deficiências nutricionais detectadas
  nutritionalDeficiencies: string[];
  
  // Condições crônicas
  chronicConditions: string[];
  
  // Medicamentos em uso
  currentMedications: string[];
  
  // Alergias
  allergies: string[];
  
  // Dados extras para personalização
  activityLevel: string;
  sleepHours: number;
  waterIntake: number;
  mainChallenges: string[];
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Calcula idade a partir da data de nascimento
 */
const calculateAge = (birthDate: string | null): number => {
  if (!birthDate) return 30; // Default
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

/**
 * Calcula IMC
 */
const calculateBMI = (weight: number, heightCm: number): number => {
  const heightM = heightCm / 100;
  return weight / (heightM * heightM);
};

/**
 * Mapeia objetivo da anamnese para tipo padronizado
 */
const mapGoalToType = (goal: string | null): UserHealthProfile['primaryGoal'] => {
  if (!goal) return 'health';
  const g = goal.toLowerCase();
  if (g.includes('emagrec') || g.includes('perder') || g.includes('peso')) return 'lose_weight';
  if (g.includes('ganhar') || g.includes('massa') || g.includes('muscul')) return 'gain_mass';
  if (g.includes('manter') || g.includes('manuten')) return 'maintain';
  return 'health';
};

/**
 * Extrai problemas de saúde da anamnese
 */
export const extractHealthIssues = (anamnesis: any): UserHealthProfile['healthIssues'] => {
  const defaultIssue: HealthIssue = { hasIssue: false, severity: 0 };
  
  if (!anamnesis) {
    return {
      sleep: defaultIssue,
      stress: defaultIssue,
      energy: defaultIssue,
      digestion: defaultIssue,
      immunity: defaultIssue,
      focus: defaultIssue,
      pain: { ...defaultIssue, location: undefined }
    };
  }

  // Sono - baseado em sleep_quality_score (1-10, menor = pior)
  const sleepScore = anamnesis.sleep_quality_score || 7;
  const sleepIssue: HealthIssue = {
    hasIssue: sleepScore < 6,
    severity: Math.max(0, 10 - sleepScore),
    details: anamnesis.sleep_issues || undefined
  };

  // Estresse - baseado em daily_stress_level (1-10, maior = pior)
  const stressLevel = typeof anamnesis.daily_stress_level === 'number' 
    ? anamnesis.daily_stress_level 
    : parseInt(anamnesis.daily_stress_level || '5');
  const stressIssue: HealthIssue = {
    hasIssue: stressLevel > 6,
    severity: stressLevel,
    details: anamnesis.stress_triggers || undefined
  };

  // Energia - baseado em energy_level ou inferido
  const energyLevel = anamnesis.energy_level || 5;
  const energyIssue: HealthIssue = {
    hasIssue: energyLevel < 5,
    severity: Math.max(0, 10 - energyLevel),
    details: anamnesis.fatigue_causes || undefined
  };

  // Digestão - baseado em digestive_issues
  const hasDigestiveIssues = anamnesis.digestive_issues && 
    (Array.isArray(anamnesis.digestive_issues) ? anamnesis.digestive_issues.length > 0 : true);
  const digestionIssue: HealthIssue = {
    hasIssue: hasDigestiveIssues,
    severity: hasDigestiveIssues ? 6 : 0,
    details: Array.isArray(anamnesis.digestive_issues) 
      ? anamnesis.digestive_issues.join(', ') 
      : anamnesis.digestive_issues
  };

  // Imunidade - baseado em frequency_of_illness
  const illnessFrequency = anamnesis.frequency_of_illness || 'raramente';
  const immunityIssue: HealthIssue = {
    hasIssue: illnessFrequency.toLowerCase().includes('frequent'),
    severity: illnessFrequency.toLowerCase().includes('frequent') ? 7 : 3,
    details: undefined
  };

  // Foco/Concentração - baseado em concentration_issues
  const hasFocusIssues = anamnesis.concentration_issues || anamnesis.brain_fog;
  const focusIssue: HealthIssue = {
    hasIssue: !!hasFocusIssues,
    severity: hasFocusIssues ? 6 : 0,
    details: anamnesis.concentration_issues || undefined
  };

  // Dor - baseado em chronic_pain ou pain_areas
  const hasPain = anamnesis.chronic_pain || anamnesis.pain_areas;
  const painIssue: HealthIssue & { location?: string } = {
    hasIssue: !!hasPain,
    severity: hasPain ? 6 : 0,
    details: undefined,
    location: Array.isArray(anamnesis.pain_areas) 
      ? anamnesis.pain_areas.join(', ') 
      : anamnesis.pain_areas
  };

  return {
    sleep: sleepIssue,
    stress: stressIssue,
    energy: energyIssue,
    digestion: digestionIssue,
    immunity: immunityIssue,
    focus: focusIssue,
    pain: painIssue
  };
};

/**
 * Detecta deficiências nutricionais baseadas no histórico alimentar
 */
export const detectNutritionalDeficiencies = (foodHistory: any[]): string[] => {
  const deficiencies: string[] = [];
  
  if (!foodHistory || foodHistory.length === 0) {
    return deficiencies;
  }

  // Calcular médias dos últimos 7 dias
  const recentMeals = foodHistory.slice(0, 7);
  const avgProtein = recentMeals.reduce((sum, m) => sum + (m.total_protein || m.protein_g || 0), 0) / recentMeals.length;
  const avgFiber = recentMeals.reduce((sum, m) => sum + (m.fiber_g || 0), 0) / recentMeals.length;
  const avgCalories = recentMeals.reduce((sum, m) => sum + (m.total_calories || m.calories || 0), 0) / recentMeals.length;

  // Verificar deficiências
  if (avgProtein < 50) deficiencies.push('proteina');
  if (avgFiber < 15) deficiencies.push('fibras');
  if (avgCalories < 1200) deficiencies.push('calorias_baixas');

  // Verificar se há variedade de alimentos (simplificado)
  const allFoods = foodHistory.flatMap(m => m.foods_detected || []);
  const uniqueFoods = new Set(allFoods.map((f: any) => typeof f === 'string' ? f.toLowerCase() : f?.name?.toLowerCase()));
  
  // Verificar grupos alimentares
  const hasFruits = [...uniqueFoods].some(f => 
    f?.includes('fruta') || f?.includes('maçã') || f?.includes('banana') || f?.includes('laranja')
  );
  const hasVegetables = [...uniqueFoods].some(f => 
    f?.includes('salada') || f?.includes('legume') || f?.includes('verdura') || f?.includes('brócolis')
  );
  const hasFish = [...uniqueFoods].some(f => 
    f?.includes('peixe') || f?.includes('salmão') || f?.includes('atum')
  );

  if (!hasFruits) deficiencies.push('vitaminas_frutas');
  if (!hasVegetables) deficiencies.push('vitaminas_vegetais');
  if (!hasFish) deficiencies.push('omega3');

  return deficiencies;
};


// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

/**
 * Analisa o perfil completo do usuário para recomendações
 */
export const analyzeUserProfile = async (userId: string): Promise<UserHealthProfile | null> => {
  try {
    // 1. Buscar dados em paralelo
    const [
      { data: anamnesis },
      { data: physicalData },
      { data: profile },
      { data: nutritionalGoals },
      { data: foodHistory },
      { data: weightData }
    ] = await Promise.all([
      supabase.from('user_anamnesis').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('user_physical_data').select('*').eq('user_id', userId).maybeSingle(),
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('nutritional_goals').select('*').eq('user_id', userId).eq('status', 'active').maybeSingle(),
      supabase.from('sofia_food_analysis').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabase.from('weight_measurements').select('weight_kg').eq('user_id', userId).order('measurement_date', { ascending: false }).limit(1)
    ]);

    // 2. Extrair dados básicos
    const weight = (weightData as any)?.[0]?.weight_kg || (anamnesis as any)?.current_weight || 70;
    const height = physicalData?.altura_cm || (anamnesis as any)?.height_cm || 170;
    const age = physicalData?.idade || calculateAge(profile?.birth_date);
    const gender = (physicalData?.sexo?.toLowerCase() || 'masculino') as 'masculino' | 'feminino';

    // 3. Extrair problemas de saúde
    const healthIssues = extractHealthIssues(anamnesis);

    // 4. Detectar deficiências nutricionais
    const nutritionalDeficiencies = detectNutritionalDeficiencies(foodHistory || []);

    // 5. Extrair condições crônicas
    const chronicConditions: string[] = [];
    if (anamnesis?.chronic_diseases) {
      if (Array.isArray(anamnesis.chronic_diseases)) {
        chronicConditions.push(...anamnesis.chronic_diseases.map((d: any) => String(d)));
      } else if (typeof anamnesis.chronic_diseases === 'string') {
        chronicConditions.push(anamnesis.chronic_diseases);
      }
    }

    // 6. Extrair medicamentos
    const currentMedications: string[] = [];
    if (anamnesis?.current_medications) {
      if (Array.isArray(anamnesis.current_medications)) {
        currentMedications.push(...anamnesis.current_medications.map((m: any) => String(m)));
      } else if (typeof anamnesis.current_medications === 'string') {
        currentMedications.push(anamnesis.current_medications);
      }
    }

    // 7. Extrair alergias (campo food_allergies na anamnese)
    const allergies: string[] = [];
    const anamnesisAllergies = (anamnesis as any)?.food_allergies || (anamnesis as any)?.allergies;
    if (anamnesisAllergies) {
      if (Array.isArray(anamnesisAllergies)) {
        allergies.push(...anamnesisAllergies.map((a: any) => String(a)));
      } else if (typeof anamnesisAllergies === 'string') {
        allergies.push(anamnesisAllergies);
      }
    }

    // 8. Determinar objetivo principal
    const primaryGoal = mapGoalToType(
      nutritionalGoals?.goal_type || 
      anamnesis?.main_treatment_goals || 
      anamnesis?.ideal_weight_goal
    );

    // 9. Extrair desafios principais
    const mainChallenges: string[] = [];
    if (anamnesis?.biggest_weight_loss_challenge) {
      mainChallenges.push(anamnesis.biggest_weight_loss_challenge);
    }
    if (anamnesis?.main_treatment_goals) {
      mainChallenges.push(anamnesis.main_treatment_goals);
    }

    // 10. Montar perfil completo
    const userProfile: UserHealthProfile = {
      userId,
      age,
      gender,
      weight,
      height,
      bmi: calculateBMI(weight, height),
      primaryGoal,
      healthIssues,
      nutritionalDeficiencies,
      chronicConditions,
      currentMedications,
      allergies,
      activityLevel: physicalData?.nivel_atividade || anamnesis?.physical_activity_frequency || 'moderado',
      sleepHours: (anamnesis as any)?.sleep_hours || anamnesis?.sleep_quality_score || 7,
      waterIntake: anamnesis?.water_intake || 2000,
      mainChallenges
    };

    return userProfile;

  } catch (error) {
    console.error('[UserProfileAnalyzer] Erro ao analisar perfil:', error);
    return null;
  }
};

/**
 * Verifica se o usuário tem anamnese preenchida
 */
export const hasCompletedAnamnesis = async (userId: string): Promise<boolean> => {
  try {
    const { data } = await supabase
      .from('user_anamnesis')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    return !!data;
  } catch {
    return false;
  }
};

/**
 * Retorna os principais problemas do usuário ordenados por severidade
 */
export const getTopHealthIssues = (profile: UserHealthProfile, limit: number = 3): string[] => {
  const issues: { name: string; severity: number }[] = [];

  if (profile.healthIssues.sleep.hasIssue) {
    issues.push({ name: 'sono', severity: profile.healthIssues.sleep.severity });
  }
  if (profile.healthIssues.stress.hasIssue) {
    issues.push({ name: 'estresse', severity: profile.healthIssues.stress.severity });
  }
  if (profile.healthIssues.energy.hasIssue) {
    issues.push({ name: 'energia', severity: profile.healthIssues.energy.severity });
  }
  if (profile.healthIssues.digestion.hasIssue) {
    issues.push({ name: 'digestão', severity: profile.healthIssues.digestion.severity });
  }
  if (profile.healthIssues.immunity.hasIssue) {
    issues.push({ name: 'imunidade', severity: profile.healthIssues.immunity.severity });
  }
  if (profile.healthIssues.focus.hasIssue) {
    issues.push({ name: 'foco', severity: profile.healthIssues.focus.severity });
  }
  if (profile.healthIssues.pain.hasIssue) {
    issues.push({ name: 'dor', severity: profile.healthIssues.pain.severity });
  }

  return issues
    .sort((a, b) => b.severity - a.severity)
    .slice(0, limit)
    .map(i => i.name);
};

export default {
  analyzeUserProfile,
  extractHealthIssues,
  detectNutritionalDeficiencies,
  hasCompletedAnamnesis,
  getTopHealthIssues
};
