// =====================================================
// USE PROFESSIONAL EVALUATION HOOK
// =====================================================

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserForEvaluation {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Evaluation {
  id: string;
  user_id: string;
  evaluator_id: string;
  evaluation_type: string;
  evaluation_data: any;
  notes?: string;
  created_at: string;
}

interface CalculatedMetrics {
  bmi: number;
  bmiClassification: string;
  tmb: number;
  tdee: number;
  bodyFatEstimate?: number;
  idealWeight?: { min: number; max: number };
}

export function useProfessionalEvaluation() {
  const [users, setUsers] = useState<UserForEvaluation[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, avatar_url, created_at')
        .order('full_name', { ascending: true });

      if (fetchError) throw fetchError;
      
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUserEvaluations = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      
      // Load from user_physical_data as base for evaluations
      const { data: physicalData, error: physError } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (physError) throw physError;

      // Load weight history
      const { data: weightData, error: weightError } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('measurement_date', { ascending: false })
        .limit(30);

      if (weightError) throw weightError;

      // Map to evaluation format
      const mappedEvaluations: Evaluation[] = (physicalData || []).map((pd: any) => ({
        id: pd.id,
        user_id: pd.user_id,
        evaluator_id: pd.user_id, // Self-reported
        evaluation_type: 'physical_data',
        evaluation_data: {
          ...pd,
          weight_history: weightData?.filter((w: any) => w.user_id === pd.user_id) || []
        },
        notes: pd.notes || null,
        created_at: pd.created_at,
      }));

      setEvaluations(mappedEvaluations);
    } catch (err) {
      console.error('Error loading evaluations:', err);
      setError('Erro ao carregar avaliações');
    } finally {
      setLoading(false);
    }
  }, []);

  const saveEvaluation = useCallback(async (data: {
    user_id: string;
    evaluation_type: string;
    evaluation_data: any;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      
      // Save as physical data update
      const { error } = await supabase
        .from('user_physical_data')
        .upsert({
          user_id: data.user_id,
          ...data.evaluation_data,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;

      toast.success('Avaliação salva com sucesso');
      await loadUserEvaluations(data.user_id);
    } catch (err) {
      console.error('Error saving evaluation:', err);
      toast.error('Erro ao salvar avaliação');
    } finally {
      setLoading(false);
    }
  }, [loadUserEvaluations]);

  const calculateMetricsFromHook = useCallback((data: {
    peso_kg: number;
    altura_cm: number;
    idade?: number;
    sexo?: string;
    nivel_atividade?: string;
  }): CalculatedMetrics => {
    const { peso_kg, altura_cm, idade = 30, sexo = 'masculino', nivel_atividade = 'moderado' } = data;
    
    const alturaM = altura_cm / 100;
    const bmi = peso_kg / (alturaM * alturaM);
    
    let bmiClassification = 'Normal';
    if (bmi < 18.5) bmiClassification = 'Abaixo do peso';
    else if (bmi >= 25 && bmi < 30) bmiClassification = 'Sobrepeso';
    else if (bmi >= 30) bmiClassification = 'Obesidade';

    // TMB (Mifflin-St Jeor)
    let tmb: number;
    if (sexo === 'masculino' || sexo === 'male') {
      tmb = 10 * peso_kg + 6.25 * altura_cm - 5 * idade + 5;
    } else {
      tmb = 10 * peso_kg + 6.25 * altura_cm - 5 * idade - 161;
    }

    // Activity multiplier
    const activityMultipliers: Record<string, number> = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      ativo: 1.725,
      muito_ativo: 1.9,
    };
    const multiplier = activityMultipliers[nivel_atividade] || 1.55;
    const tdee = tmb * multiplier;

    // Ideal weight range (BMI 18.5-24.9)
    const minIdeal = 18.5 * alturaM * alturaM;
    const maxIdeal = 24.9 * alturaM * alturaM;

    return {
      bmi: Math.round(bmi * 10) / 10,
      bmiClassification,
      tmb: Math.round(tmb),
      tdee: Math.round(tdee),
      idealWeight: {
        min: Math.round(minIdeal * 10) / 10,
        max: Math.round(maxIdeal * 10) / 10,
      },
    };
  }, []);

  return {
    users,
    evaluations,
    loading,
    error,
    loadUsers,
    loadUserEvaluations,
    saveEvaluation,
    calculateMetricsFromHook,
  };
}

export default useProfessionalEvaluation;
