/**
 * Alex Dashboard - Layout Original com Peso/Evolução
 * Mostra: Hero Card, Gráfico de Evolução, Registrar Peso, Dicas Dr. Vital
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { useUserDataCache } from '@/hooks/useUserDataCache';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import SimpleWeightForm from '@/components/weighing/SimpleWeightForm';
import { AppleHealthHeroCard } from '../AppleHealthHeroCard';
import { CleanEvolutionChart } from '../CleanEvolutionChart';
import { QuickActionsGrid } from '../QuickActionsGrid';
import { SofiaTipsCard } from '../SofiaTipsCard';

interface AlexDashboardProps {
  className?: string;
}

export function AlexDashboard({ className }: AlexDashboardProps) {
  const { measurements, stats, loading, fetchMeasurements } = useWeightMeasurement();
  const { data: userData, loading: userDataLoading } = useUserDataCache();
  
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [waistCircumference, setWaistCircumference] = useState<number>(0);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [targetWeight, setTargetWeight] = useState<number | undefined>();
  const initialFetchDoneRef = useRef(false);

  // Dados do cache centralizado
  const userName = userData.profile?.fullName 
    || userData.user?.user_metadata?.full_name 
    || userData.user?.email?.split('@')[0] 
    || 'Usuário';
  const heightCm = userData.physicalData?.altura_cm || 170;
  const currentStreak = userData.points?.currentStreak || 0;
  const user = userData.user;
  const gender = userData.profile?.gender || userData.physicalData?.sexo || 'F';
  const birthDate = userData.profile?.birthDate;

  // Calcular idade
  const age = useMemo(() => {
    if (!birthDate) return 30;
    const today = new Date();
    const birth = new Date(birthDate);
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    return calculatedAge > 0 ? calculatedAge : 30;
  }, [birthDate]);

  // Buscar dados adicionais
  useEffect(() => {
    if (initialFetchDoneRef.current || !user) return;
    initialFetchDoneRef.current = true;

    const fetchAdditionalData = async () => {
      const [trackingResult, goalResult] = await Promise.all([
        supabase
          .from('advanced_daily_tracking')
          .select('waist_cm')
          .eq('user_id', user.id)
          .order('tracking_date', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('user_goals')
          .select('target_value')
          .eq('user_id', user.id)
          .eq('goal_type', 'weight')
          .eq('status', 'active')
          .limit(1)
          .maybeSingle()
      ]);

      if (trackingResult.data?.waist_cm) setWaistCircumference(trackingResult.data.waist_cm);
      if (goalResult.data?.target_value) setTargetWeight(goalResult.data.target_value);
    };

    fetchAdditionalData();
  }, [user]);

  // Calculate Health Score
  useEffect(() => {
    let score = 50;
    
    if (measurements && measurements.length >= 2) {
      const current = Number(measurements[0]?.peso_kg) || 0;
      const previous = Number(measurements[1]?.peso_kg) || 0;
      if (current < previous) score += 15;
      else if (current > previous + 1) score -= 10;
    }
    
    if (waistCircumference && heightCm) {
      const ratio = waistCircumference / heightCm;
      if (ratio < 0.5) score += 25;
      else if (ratio < 0.55) score += 10;
      else if (ratio >= 0.6) score -= 15;
    }
    
    if (measurements && measurements.length >= 3) score += 10;
    if (currentStreak >= 7) score += 10;
    else if (currentStreak >= 3) score += 5;
    
    setHealthScore(Math.max(0, Math.min(100, score)));
  }, [measurements, waistCircumference, heightCm, currentStreak]);

  const weightChange = () => {
    if (measurements && measurements.length >= 2) {
      const current = Number(measurements[0]?.peso_kg) || 0;
      const previous = Number(measurements[1]?.peso_kg) || 0;
      return current - previous;
    }
    return 0;
  };

  const handleWeightSubmit = async (data: { weight: number; height: number; waist: number }) => {
    setIsSaving(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const sessionUser = session?.user ?? null;

      if (!sessionUser) {
        toast.error('Você precisa estar logado para registrar peso');
        return;
      }

      const userId = sessionUser.id;
      const heightM = data.height / 100;
      const imc = data.weight / (heightM * heightM);
      const rce = data.waist / data.height;

      let riscoMetabolico = 'normal';
      if (imc < 18.5) riscoMetabolico = 'baixo_peso';
      else if (imc >= 25 && imc < 30) riscoMetabolico = 'sobrepeso';
      else if (imc >= 30 && imc < 35) riscoMetabolico = 'obesidade_grau1';
      else if (imc >= 35 && imc < 40) riscoMetabolico = 'obesidade_grau2';
      else if (imc >= 40) riscoMetabolico = 'obesidade_grau3';

      let riscoCardiometabolico = 'BAIXO';
      if (rce >= 0.5 && rce < 0.55) riscoCardiometabolico = 'MODERADO';
      else if (rce >= 0.55 && rce < 0.6) riscoCardiometabolico = 'ALTO';
      else if (rce >= 0.6) riscoCardiometabolico = 'MUITO ALTO';

      const { error } = await supabase.from('weight_measurements').insert({
        user_id: userId,
        peso_kg: data.weight,
        circunferencia_abdominal_cm: data.waist,
        imc: parseFloat(imc.toFixed(2)),
        risco_metabolico: riscoMetabolico,
        risco_cardiometabolico: riscoCardiometabolico,
        device_type: 'manual',
        measurement_date: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Peso registrado com sucesso! 🎉');
      setIsWeightModalOpen(false);
      fetchMeasurements(30, true);
    } catch (error: any) {
      console.error('Error saving weight:', error);
      toast.error('Erro ao registrar peso');
    } finally {
      setIsSaving(false);
    }
  };

  const currentWeight = stats?.currentWeight || (measurements?.[0]?.peso_kg ? Number(measurements[0].peso_kg) : 0);

  // Não bloquear renderização - mostrar conteúdo imediatamente

  return (
    <>
      {/* Container principal - altura exata até o menu */}
      <div className={cn("flex flex-col h-[calc(100dvh-130px)]", className)}>
        {/* 1. Hero Card - flex-1 para ocupar espaço proporcional */}
        <div className="flex-1 min-h-0">
          <AppleHealthHeroCard
            currentWeight={typeof currentWeight === 'number' ? currentWeight : parseFloat(String(currentWeight)) || 0}
            targetWeight={targetWeight}
            weightChange={weightChange()}
            healthScore={healthScore}
            currentStreak={currentStreak}
            userName={userName}
            height={heightCm}
            age={age}
            gender={gender || 'F'}
          />
        </div>

        {/* 2. Gráfico de Evolução - flex-1 para ocupar espaço proporcional */}
        <div className="flex-1 min-h-0 mt-2">
          <CleanEvolutionChart
            measurements={measurements || []}
            loading={loading}
            onRegisterClick={() => setIsWeightModalOpen(true)}
          />
        </div>

        {/* 3. Botão Registrar Peso - fixo, colado no menu */}
        <div className="flex-shrink-0 mt-2">
          <QuickActionsGrid onWeightClick={() => setIsWeightModalOpen(true)} />
        </div>
      </div>

      {/* 4. Dicas do Dr. Vital - FORA do container, aparece ABAIXO do menu com scroll */}
      <div className="mt-2 pb-4">
        <SofiaTipsCard />
      </div>

      {/* Modal de Peso */}
      <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Peso</DialogTitle>
            <DialogDescription>
              Informe seu peso atual
            </DialogDescription>
          </DialogHeader>
          <SimpleWeightForm onSubmit={handleWeightSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AlexDashboard;
