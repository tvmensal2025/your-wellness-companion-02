import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { repairAuthSessionIfTooLarge } from '@/lib/auth-token-repair';
import { useUserDataCache, getUserDataFromCache } from '@/hooks/useUserDataCache';
import SimpleWeightForm from '@/components/weighing/SimpleWeightForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
// New clean components
import { AppleHealthHeroCard } from './AppleHealthHeroCard';
import { CleanEvolutionChart } from './CleanEvolutionChart';
import { QuickActionsGrid } from './QuickActionsGrid';
import { MotivationalMascot } from './MotivationalMascot';
import { SofiaTipsCard } from './SofiaTipsCard';

const DashboardOverview: React.FC = () => {
  const { measurements, stats, loading, fetchMeasurements } = useWeightMeasurement();
  const { data: userData, loading: userDataLoading } = useUserDataCache();
  
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const [waistCircumference, setWaistCircumference] = useState<number>(0);
  const [healthScore, setHealthScore] = useState<number>(0);
  const [targetWeight, setTargetWeight] = useState<number | undefined>();
  const [lastMeasurementDays, setLastMeasurementDays] = useState<number>(0);
  const initialFetchDoneRef = useRef(false);

  // Dados do cache centralizado - fallback para user_metadata se profile não estiver carregado
  const userName = userData.profile?.fullName || userData.user?.user_metadata?.full_name || '';
  const heightCm = userData.physicalData?.altura_cm || 170;
  const currentStreak = userData.points?.currentStreak || 0;
  const user = userData.user;
  const gender = userData.profile?.gender || userData.physicalData?.sexo || 'F';
  const birthDate = userData.profile?.birthDate;

  // Calcular idade baseado na data de nascimento
  const age = React.useMemo(() => {
    if (!birthDate) return 30; // fallback
    const today = new Date();
    const birth = new Date(birthDate);
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    return calculatedAge > 0 ? calculatedAge : 30;
  }, [birthDate]);

  // Buscar dados adicionais apenas uma vez (waist, targetWeight)
  useEffect(() => {
    if (initialFetchDoneRef.current || !user) return;
    initialFetchDoneRef.current = true;

    const fetchAdditionalData = async () => {
      // Repara token gigante antes das queries
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await repairAuthSessionIfTooLarge(session);
      }

      // Queries em paralelo
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

  // Calculate days since last measurement
  useEffect(() => {
    if (measurements && measurements.length > 0) {
      const lastDate = new Date(measurements[0].measurement_date || measurements[0].created_at);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setLastMeasurementDays(diffDays);
    }
  }, [measurements]);

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

      // Repara token gigante antes do insert (evita 520/CORS/Failed to fetch)
      if (session) {
        await repairAuthSessionIfTooLarge(session);
      }

      const { data: { session: latestSession } } = await supabase.auth.getSession();
      const userId = latestSession?.user?.id ?? sessionUser.id;

      // Calculate IMC
      const heightM = data.height / 100;
      const imc = data.weight / (heightM * heightM);

      // Calculate RCE (Waist-to-Height Ratio)
      const rce = data.waist / data.height;

      // Determine risco_metabolico based on IMC
      let riscoMetabolico = 'normal';
      if (imc < 18.5) riscoMetabolico = 'baixo_peso';
      else if (imc >= 25 && imc < 30) riscoMetabolico = 'sobrepeso';
      else if (imc >= 30 && imc < 35) riscoMetabolico = 'obesidade_grau1';
      else if (imc >= 35 && imc < 40) riscoMetabolico = 'obesidade_grau2';
      else if (imc >= 40) riscoMetabolico = 'obesidade_grau3';

      // Determine cardiometabolic risk
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

      toast.success('Peso registrado com sucesso!');
      setIsWeightModalOpen(false);
      fetchMeasurements(30, true);
    } catch (error: any) {
      console.error('Error saving weight:', error);
      const msg = typeof error?.message === 'string' ? error.message : '';
      toast.error(msg ? `Erro ao registrar peso: ${msg}` : 'Erro ao registrar peso');
    } finally {
      setIsSaving(false);
    }
  };

  const currentWeight = stats?.currentWeight || (measurements?.[0]?.peso_kg ? Number(measurements[0].peso_kg) : 0);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <div className="mx-auto max-w-3xl space-y-1.5 sm:space-y-2 px-1 sm:px-2 pb-20 sm:pb-28 pt-2 sm:pt-3">
        {/* 1. Apple Health Style Hero Card */}
        <AppleHealthHeroCard
          currentWeight={typeof currentWeight === 'number' ? currentWeight : parseFloat(String(currentWeight)) || 0}
          targetWeight={targetWeight}
          weightChange={weightChange()}
          healthScore={healthScore}
          currentStreak={currentStreak}
          userName={userName || 'Usuário'}
          height={heightCm}
          age={age}
          gender={gender || 'F'}
        />

        {/* 3. Clean Evolution Chart */}
        <CleanEvolutionChart
          measurements={measurements || []}
          loading={loading}
          onRegisterClick={() => setIsWeightModalOpen(true)}
        />

        {/* Quick Actions */}
        <QuickActionsGrid onWeightClick={() => setIsWeightModalOpen(true)} />

        {/* Sofia Tips - Dicas personalizadas */}
        <SofiaTipsCard />

        {/* Motivational Mascot */}
        <MotivationalMascot />

      </div>

      {/* Weight Modal */}
      <Dialog open={isWeightModalOpen} onOpenChange={setIsWeightModalOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>Registrar Peso</DialogTitle>
            <DialogDescription>
              Informe seu peso atual
            </DialogDescription>
          </DialogHeader>
          <SimpleWeightForm 
            onSubmit={handleWeightSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardOverview;
