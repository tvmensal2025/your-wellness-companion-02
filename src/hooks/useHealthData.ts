/**
 * useHealthData Hook
 * Busca dados de saúde reais do Supabase para o dashboard do Dr. Vital
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserDataCache } from './useUserDataCache';

interface HealthData {
  score: number;
  scoreLabel: string;
  heartRate: number;
  bloodPressure: string;
  glucose: number;
  weight: number;
  bmi: number;
  observation: string;
  recommendation: string;
  source: string;
  lastExamDate: string | null;
  examsCount: number;
}

export function useHealthData() {
  const { data: userData } = useUserDataCache();
  const [healthData, setHealthData] = useState<HealthData>({
    score: 0,
    scoreLabel: 'Calculando...',
    heartRate: 0,
    bloodPressure: '--/--',
    glucose: 0,
    weight: 0,
    bmi: 0,
    observation: 'Carregando dados de saúde...',
    recommendation: '',
    source: '',
    lastExamDate: null,
    examsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = useCallback(async () => {
    const userId = userData.user?.id;
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Buscar última medição de peso
      const { data: weightData } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .single();

      // Buscar tracking diário mais recente
      const { data: trackingData } = await supabase
        .from('advanced_daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .order('tracking_date', { ascending: false })
        .limit(1)
        .single();

      // Buscar dados físicos
      const { data: physicalData } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Calcular IMC - usar peso do weight_measurements ou do tracking
      const weight = weightData?.peso_kg || trackingData?.weight_kg || 0;
      const heightM = (physicalData?.altura_cm || 170) / 100;
      const bmi = weight > 0 ? weight / (heightM * heightM) : 0;

      // Calcular score de saúde
      let score = 50;
      const observations: string[] = [];
      const recommendations: string[] = [];

      // Pontuação baseada no IMC
      if (bmi > 0) {
        if (bmi >= 18.5 && bmi < 25) {
          score += 20;
          observations.push('IMC dentro da faixa saudável');
        } else if (bmi >= 25 && bmi < 30) {
          score += 5;
          observations.push('IMC indica sobrepeso');
          recommendations.push('Considere ajustar alimentação e aumentar atividade física');
        } else if (bmi >= 30) {
          observations.push('IMC indica obesidade');
          recommendations.push('Consulte um profissional de saúde para orientação');
        } else {
          observations.push('IMC abaixo do ideal');
          recommendations.push('Considere aumentar ingestão calórica de forma saudável');
        }
      }

      // Pontuação baseada em tracking
      if (trackingData) {
        if (trackingData.water_ml && trackingData.water_ml >= 2000) score += 10;
        if (trackingData.sleep_hours && trackingData.sleep_hours >= 7) score += 10;
        if (trackingData.steps && trackingData.steps >= 8000) score += 10;
        if (trackingData.energy_level && trackingData.energy_level >= 7) score += 5;
        if (trackingData.stress_level && trackingData.stress_level <= 4) score += 5;
      }

      // Limitar score entre 0 e 100
      score = Math.max(0, Math.min(100, score));

      // Determinar label do score
      let scoreLabel = 'Calculando...';
      if (score >= 80) scoreLabel = 'Excelente! Continue assim!';
      else if (score >= 60) scoreLabel = 'Bom - Continue assim!';
      else if (score >= 40) scoreLabel = 'Regular - Pode melhorar';
      else scoreLabel = 'Atenção - Cuide-se mais';

      // Dados de pressão do tracking
      let bloodPressure = '--/--';
      let heartRate = 72;

      if (trackingData) {
        // Usar pressão do tracking se disponível
        if (trackingData.systolic_bp && trackingData.diastolic_bp) {
          bloodPressure = `${trackingData.systolic_bp}/${trackingData.diastolic_bp}`;
        }
        // Usar resting_heart_rate se disponível
        if (trackingData.resting_heart_rate) {
          heartRate = trackingData.resting_heart_rate;
        }
      }

      // Glicose do tracking (usar fasting_glucose se disponível)
      const glucose = (trackingData as any)?.fasting_glucose || 0;

      setHealthData({
        score,
        scoreLabel,
        heartRate,
        bloodPressure,
        glucose,
        weight: Math.round(weight * 10) / 10,
        bmi: Math.round(bmi * 10) / 10,
        observation: observations.length > 0 
          ? observations.join('. ') 
          : 'Registre mais dados para análises personalizadas.',
        recommendation: recommendations.length > 0 
          ? recommendations.join('. ') 
          : 'Continue mantendo hábitos saudáveis.',
        source: 'Análise baseada em seus dados',
        lastExamDate: null,
        examsCount: 0,
      });
    } catch (err: any) {
      console.error('Error fetching health data:', err);
      setError(err.message);
      
      // Fallback com dados do cache
      const heightM = (userData.physicalData?.altura_cm || 170) / 100;
      const weight = 0;
      const bmi = 0;
      
      setHealthData({
        score: 50,
        scoreLabel: 'Dados limitados',
        heartRate: 72,
        bloodPressure: '--/--',
        glucose: 0,
        weight: 0,
        bmi: 0,
        observation: 'Registre mais dados para análises personalizadas.',
        recommendation: 'Faça check-ups regulares.',
        source: '',
        lastExamDate: null,
        examsCount: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [userData.user?.id, userData.physicalData]);

  useEffect(() => {
    fetchHealthData();
  }, [fetchHealthData]);

  return { healthData, loading, error, refresh: fetchHealthData };
}

export default useHealthData;
