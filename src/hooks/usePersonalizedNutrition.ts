import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  calculateTDEE, 
  calculateNutritionalGoals, 
  calculateBMR,
  NutritionObjective,
  type PhysicalData 
} from '@/utils/macro-calculator';

export interface PersonalizedNutritionData {
  // Dados físicos
  peso_kg: number;
  altura_cm: number;
  idade: number;
  sexo: string;
  nivel_atividade: string;
  circunferencia_abdominal?: number;
  
  // Cálculos metabólicos
  bmr: number;
  tdee: number;
  
  // Metas personalizadas
  objective: NutritionObjective;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  target_fiber: number;
  
  // Consumo do dia
  consumed_calories: number;
  consumed_protein: number;
  consumed_carbs: number;
  consumed_fat: number;
  
  // Refeições
  meals_logged: number;
  streak: number;
}

export const usePersonalizedNutrition = (userId: string | undefined) => {
  const enabled = !!userId;

  return useQuery({
    queryKey: ['personalized-nutrition', userId],
    queryFn: async (): Promise<PersonalizedNutritionData | null> => {
      if (!userId) return null;

      // 1. Buscar dados físicos
      const { data: physical } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // 2. Buscar peso mais recente
      const { data: weightData } = await supabase
        .from('weight_measurements')
        .select('weight_kg')
        .eq('user_id', userId)
        .order('measurement_date', { ascending: false })
        .limit(1);

      // 3. Buscar metas nutricionais
      const { data: goalsData } = await supabase
        .from('nutritional_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      // 4. Buscar refeições de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: todayMeals } = await supabase
        .from('sofia_food_analysis')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`)
        .limit(50);

      // Extrair valores com fallbacks
      const peso = (weightData as any)?.[0]?.weight_kg || (physical as any)?.peso_atual_kg || 70;
      const altura = physical?.altura_cm || 170;
      const idade = physical?.idade || 30;
      const sexo = physical?.sexo || 'Masculino';
      const nivel_atividade = physical?.nivel_atividade || 'Moderado';

      // Montar dados físicos para cálculo
      const physicalData: PhysicalData = {
        peso_kg: peso,
        altura_cm: altura,
        idade: idade,
        sexo: sexo,
        nivel_atividade: nivel_atividade
      };

      // Calcular metabolismo
      const bmr = calculateBMR(peso, altura, idade, sexo);
      const tdee = calculateTDEE(physicalData);

      // Determinar objetivo
      const objective = ((goalsData as any)?.objective as NutritionObjective) || NutritionObjective.MAINTAIN;

      // Calcular metas personalizadas
      const calculatedGoals = calculateNutritionalGoals(objective, physicalData);

      // Usar metas salvas ou calculadas
      const target_calories = (goalsData as any)?.target_calories || calculatedGoals.calories;
      const target_protein = (goalsData as any)?.target_protein_g || calculatedGoals.protein;
      const target_carbs = (goalsData as any)?.target_carbs_g || calculatedGoals.carbs;
      const target_fat = (goalsData as any)?.target_fats_g || calculatedGoals.fat;
      const target_fiber = (goalsData as any)?.target_fiber_g || calculatedGoals.fiber;

      // Calcular consumo do dia
      const consumed_calories = todayMeals?.reduce((sum, m: any) => 
        sum + (m.total_calories || m.calories || 0), 0) || 0;
      const consumed_protein = todayMeals?.reduce((sum, m: any) => 
        sum + (m.total_protein || m.total_proteins || 0), 0) || 0;
      const consumed_carbs = todayMeals?.reduce((sum, m: any) => 
        sum + (m.total_carbs || 0), 0) || 0;
      const consumed_fat = todayMeals?.reduce((sum, m: any) => 
        sum + (m.total_fat || m.total_fats || m.fats || 0), 0) || 0;

      // Calcular streak (simplificado)
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const { data: dayMeals } = await supabase
          .from('sofia_food_analysis')
          .select('id')
          .eq('user_id', userId)
          .gte('created_at', `${dateStr}T00:00:00`)
          .lte('created_at', `${dateStr}T23:59:59`)
          .limit(1);

        if (dayMeals && dayMeals.length > 0) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      return {
        peso_kg: peso,
        altura_cm: altura,
        idade: idade,
        sexo: sexo,
        nivel_atividade: nivel_atividade,
        bmr,
        tdee,
        objective,
        target_calories,
        target_protein,
        target_carbs,
        target_fat,
        target_fiber,
        consumed_calories,
        consumed_protein,
        consumed_carbs,
        consumed_fat,
        meals_logged: todayMeals?.length || 0,
        streak
      };
    },
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true
  });
};

export default usePersonalizedNutrition;
