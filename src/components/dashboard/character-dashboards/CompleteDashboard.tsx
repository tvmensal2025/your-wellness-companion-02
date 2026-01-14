/**
 * Complete Dashboard - Hub Unificado
 * Dashboard com mini-cards de todos os personagens e ações rápidas
 * Usa dados REAIS do Supabase
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { useUserDataCache } from '@/hooks/useUserDataCache';
import { useNutritionData } from '@/hooks/useNutritionData';
import { useExerciseData } from '@/hooks/useExerciseData';
import { useHealthData } from '@/hooks/useHealthData';
import { useCoachingData } from '@/hooks/useCoachingData';
import { useMenuStyleContext } from '@/contexts/MenuStyleContext';
import { useDashboardNavigation } from '@/hooks/useDashboardNavigation';
import { Camera, Stethoscope, Dumbbell, Target, ChevronRight, Flame, Loader2 } from 'lucide-react';

interface CompleteDashboardProps {
  className?: string;
}

export function CompleteDashboard({ className }: CompleteDashboardProps) {
  const { navigate } = useDashboardNavigation();
  const { data: userData } = useUserDataCache();
  const { nutritionData, loading: nutritionLoading } = useNutritionData();
  const { exerciseData, loading: exerciseLoading } = useExerciseData();
  const { healthData, loading: healthLoading } = useHealthData();
  const { coachingData, loading: coachingLoading } = useCoachingData();
  const { setShowSelector } = useMenuStyleContext();

  const loading = nutritionLoading || exerciseLoading || healthLoading || coachingLoading;

  // Dados resumidos reais
  const summaryData = {
    healthScore: healthData.score,
    calories: nutritionData.caloriesConsumed,
    workoutMinutes: exerciseData.totalMinutes,
    streak: Math.max(
      nutritionData.streak,
      exerciseData.streak,
      coachingData.streak
    ),
  };

  // Mensagens dinâmicas baseadas nos dados reais
  const getHealthMessage = () => {
    if (healthData.score >= 70) return '"Seus indicadores estão ótimos! 📊"';
    if (healthData.score >= 50) return '"Continue cuidando da sua saúde! 💪"';
    return '"Vamos melhorar seus indicadores? 🎯"';
  };

  const getNutritionMessage = () => {
    if (nutritionData.mealsCompleted === 0) return '"Hora de registrar sua primeira refeição! 📸"';
    if (nutritionData.mealsCompleted < 4) return `"${4 - nutritionData.mealsCompleted} refeições restantes hoje! 🍽️"`;
    return '"Todas as refeições registradas! 🎉"';
  };

  const getExerciseMessage = () => {
    if (exerciseData.workoutsThisMonth === 0) return '"Vamos começar a treinar? 💪"';
    if (exerciseData.records.length > 0) return `"Novo recorde: ${exerciseData.records[0].name}! 🏆"`;
    return `"${exerciseData.workoutsThisMonth} treinos este mês! 🔥"`;
  };

  const getCoachingMessage = () => {
    if (coachingData.missionsCompleted === coachingData.missionsTotal) return '"Missões do dia completas! ✨"';
    return `"${coachingData.missionsTotal - coachingData.missionsCompleted} missões pendentes! 🎯"`;
  };

  const characterCards = [
    {
      id: 'health',
      name: 'Dr. Vital',
      avatar: '👨‍⚕️',
      avatarBg: 'bg-blue-500/20',
      borderColor: 'border-l-blue-500',
      message: getHealthMessage(),
      route: '/dr-vital',
    },
    {
      id: 'nutrition',
      name: 'Sofia',
      avatar: '👩‍🍳',
      avatarBg: 'bg-emerald-500/20',
      borderColor: 'border-l-emerald-500',
      message: getNutritionMessage(),
      route: '/sofia-nutricional',
    },
    {
      id: 'exercise',
      name: 'Alex',
      avatar: '🏋️',
      avatarBg: 'bg-teal-500/20',
      borderColor: 'border-l-teal-500',
      message: getExerciseMessage(),
      route: '/exercicios',
    },
    {
      id: 'coaching',
      name: 'Rafael',
      avatar: '🧘',
      avatarBg: 'bg-sky-500/20',
      borderColor: 'border-l-sky-500',
      message: getCoachingMessage(),
      route: '/sessions',
    },
  ];

  const quickActions = [
    { icon: <Camera className="w-6 h-6" />, label: 'Analisar Foto', route: '/sofia-nutricional' },
    { icon: <Stethoscope className="w-6 h-6" />, label: 'Ver Exames', route: '/dr-vital' },
    { icon: <Dumbbell className="w-6 h-6" />, label: 'Treinar', route: '/exercicios' },
    { icon: <Target className="w-6 h-6" />, label: 'Missões', route: '/missions' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 pb-4", className)}>
      {/* Hub Header */}
      <div className="text-center mb-2">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          ✨ Seu Hub Personalizado
        </h3>
        <p className="text-xs text-muted-foreground">
          Todas as funcionalidades em um só lugar
        </p>
      </div>

      {/* Character Mini Cards */}
      <div className="space-y-2">
        {characterCards.map((char) => (
          <button
            key={char.id}
            onClick={() => navigate(char.route)}
            className={cn(
              "w-full bg-muted/30 rounded-xl p-3 flex items-center gap-3 border-l-4 hover:bg-muted/40 transition-all hover:translate-x-1",
              char.borderColor
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-xl",
              char.avatarBg
            )}>
              {char.avatar}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-[10px] text-muted-foreground">{char.name} diz:</div>
              <div className="text-sm truncate">{char.message}</div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
          </button>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => navigate(action.route)}
            className="bg-muted/30 rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-muted/40 transition-colors"
          >
            <div className="text-muted-foreground">{action.icon}</div>
            <span className="text-xs">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Overall Stats */}
      <div className="bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-2xl p-4">
        <h4 className="text-sm font-medium mb-3">📊 Resumo Geral</h4>
        <div className="grid grid-cols-4 gap-2">
          <StatItem 
            value={summaryData.healthScore} 
            label="Saúde" 
            color={summaryData.healthScore >= 70 ? 'text-emerald-400' : 'text-purple-400'}
          />
          <StatItem 
            value={summaryData.calories > 0 ? summaryData.calories.toLocaleString() : '0'} 
            label="Calorias" 
          />
          <StatItem 
            value={summaryData.workoutMinutes > 0 ? `${summaryData.workoutMinutes}m` : '0m'} 
            label="Treino" 
          />
          <StatItem 
            value={
              <span className="flex items-center justify-center gap-0.5">
                {summaryData.streak}
                <Flame className="w-3 h-3 text-orange-500" />
              </span>
            } 
            label="Dias" 
          />
        </div>
      </div>

      {/* Change Character Button */}
      <button
        onClick={() => setShowSelector(true)}
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 flex items-center justify-center gap-2 font-medium hover:opacity-90 transition-opacity"
      >
        🎭 Trocar Personagem
      </button>
    </div>
  );
}

interface StatItemProps {
  value: React.ReactNode;
  label: string;
  color?: string;
}

function StatItem({ value, label, color = 'text-purple-400' }: StatItemProps) {
  return (
    <div className="text-center">
      <div className={cn("text-lg font-bold", color)}>{value}</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
}

export default CompleteDashboard;
