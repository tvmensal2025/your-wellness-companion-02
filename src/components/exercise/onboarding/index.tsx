import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Timer,
  AlertTriangle,
  Target,
  Heart,
  Flame,
  Star,
  Trophy,
  Dumbbell,
} from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { generateRecommendation, UserAnswers } from '@/hooks/useExerciseRecommendation';
import { DaySelector } from '../DaySelector';
import { DaySplitAssigner } from '../DaySplitAssigner';
import { WelcomeStep } from './steps/WelcomeStep';
import { GoalsStep } from './steps/GoalsStep';
import { ExperienceStep } from './steps/ExperienceStep';
import { EquipmentStep } from './steps/EquipmentStep';
import { useOnboardingState, Step } from './hooks/useOnboardingState';

export interface ExerciseOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

/**
 * Main orchestrator component for the Exercise Onboarding Modal
 * Refactored from a 1,318 line monolithic component into a modular structure
 * 
 * Structure:
 * - Uses useOnboardingState hook for all state management
 * - Renders appropriate step components based on current state
 * - Handles Dialog wrapper and progress UI
 * - Coordinates navigation between steps
 */
export const ExerciseOnboardingModal: React.FC<ExerciseOnboardingModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  // Use the custom hook for all state management
  const {
    step,
    stepHistory,
    answers,
    saving,
    isTransitioning,
    profileData,
    currentStep,
    totalSteps,
    progress,
    goToNextStep,
    goToPreviousStep,
    handleAnswer,
    handleSingleSelect,
    setAnswers,
    setStep,
    getMaxDaysFromFrequency,
    getDefaultSplit,
    handleSaveProgram,
    resetOnboarding,
    canGoBack,
  } = useOnboardingState(user);

  // Reusable back button component
  const BackButton = () => (
    canGoBack ? (
      <Button 
        variant="ghost" 
        size="sm"
        onClick={goToPreviousStep} 
        className="absolute top-0 left-0 gap-1 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar
      </Button>
    ) : null
  );

  // Question 3: Time per workout
  const renderQuestion3 = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Timer className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          Quanto tempo você tem por treino?
        </h3>
        <p className="text-muted-foreground">Seja realista com sua rotina</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: '10-15', icon: '⚡', title: '10-15 minutos', desc: 'Treino rápido e eficiente', color: 'from-green-500 to-emerald-500' },
          { value: '20-30', icon: '⏱️', title: '20-30 minutos', desc: 'Tempo ideal para iniciantes', color: 'from-blue-500 to-cyan-500' },
          { value: '30-45', icon: '🕐', title: '30-45 minutos', desc: 'Ótimo para resultados consistentes', color: 'from-purple-500 to-pink-500' },
          { value: '45-60', icon: '💪', title: '45-60+ minutos', desc: 'Treino completo e intenso', color: 'from-amber-500 to-yellow-500' },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.time === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSingleSelect('time', option.value, 'question3b')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{option.title}</h4>
                  <p className="text-sm opacity-80">{option.desc}</p>
                </div>
                {answers.time === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Question 3b: Exercises per day
  const renderQuestion3b = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Quantos exercícios por treino?
        </h3>
        <p className="text-sm text-muted-foreground">Escolha a intensidade ideal para você</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: '3-4', icon: '⚡', title: 'Treino Rápido', desc: '3-4 exercícios (~15min)', color: 'from-green-500 to-emerald-500' },
          { value: '5-6', icon: '🎯', title: 'Treino Padrão', desc: '5-6 exercícios (~25min)', color: 'from-blue-500 to-cyan-500' },
          { value: '7-8', icon: '🏋️', title: 'Treino Completo', desc: '7-8 exercícios (~35min)', color: 'from-purple-500 to-pink-500' },
          { value: '9-12', icon: '💪', title: 'Treino Avançado', desc: '9-12 exercícios (~45min)', color: 'from-amber-500 to-yellow-500' },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.exercisesPerDay === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSingleSelect('exercisesPerDay', option.value, 'question4')}
          >
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <span className="text-xl">{option.icon}</span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm">{option.title}</h4>
                  <p className="text-xs opacity-80">{option.desc}</p>
                </div>
                {answers.exercisesPerDay === option.value && <CheckCircle2 className="w-4 h-4 shrink-0" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Question 4: Frequency per week
  const renderQuestion4 = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Calendar className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Quantas vezes por semana pode treinar?
        </h3>
        <p className="text-muted-foreground">Consistência é mais importante que frequência alta</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: '2-3x', icon: '🌱', title: '2-3 vezes', desc: 'Ideal para começar', color: 'from-green-500 to-teal-500' },
          { value: '4-5x', icon: '🔥', title: '4-5 vezes', desc: 'Ótimo para resultados', color: 'from-amber-500 to-yellow-500' },
          { value: '6x', icon: '🏆', title: '6 vezes', desc: 'Para atletas dedicados', color: 'from-purple-500 to-pink-500' },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.frequency === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSingleSelect('frequency', option.value, 'question4b')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.icon}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{option.title}</h4>
                  <p className="text-sm opacity-80">{option.desc}</p>
                </div>
                {answers.frequency === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Question 4b: Day selector
  const renderQuestion4b = () => {
    const maxDays = getMaxDaysFromFrequency(answers.frequency);
    const canContinue = answers.selectedDays.length === maxDays;

    return (
      <div className="space-y-6 py-4 relative">
        <BackButton />
        <div className="text-center space-y-3 pt-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Calendar className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
            Quais dias você vai treinar?
          </h3>
          <p className="text-muted-foreground">
            Escolha os {maxDays} dias que melhor se encaixam na sua rotina
          </p>
        </div>

        <DaySelector
          selectedDays={answers.selectedDays}
          onChange={(days) => setAnswers(prev => ({ ...prev, selectedDays: days }))}
          maxDays={maxDays}
        />

        <Button
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white"
          disabled={!canContinue}
          onClick={() => goToNextStep('question4c')}
        >
          {canContinue ? (
            <>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            `Selecione ${maxDays - answers.selectedDays.length} dia(s)`
          )}
        </Button>
      </div>
    );
  };

  // Question 4c: Day split assigner
  const renderQuestion4c = () => {
    const daysCount = answers.selectedDays.length;
    const currentSplit = answers.trainingSplit || getDefaultSplit(daysCount);
    const allAssigned = answers.selectedDays.every(day => answers.dayAssignments[day]);

    const splitOptions = [
      { value: 'AB', label: 'AB', minDays: 2 },
      { value: 'ABC', label: 'ABC', minDays: 3 },
      { value: 'ABCD', label: 'ABCD', minDays: 4 },
      { value: 'ABCDE', label: 'ABCDE', minDays: 5 },
      { value: 'FULLBODY', label: 'Full Body', minDays: 1 },
    ].filter(opt => daysCount >= opt.minDays || opt.value === 'FULLBODY');

    return (
      <div className="space-y-5 py-4 relative">
        <BackButton />
        <div className="text-center space-y-2 pt-6">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
              <Calendar className="w-7 h-7 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Monte sua semana de treino
          </h3>
          <p className="text-sm text-muted-foreground">
            Escolha a divisão e atribua cada treino aos seus dias
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {splitOptions.map(opt => (
            <Button
              key={opt.value}
              variant={currentSplit === opt.value ? "default" : "outline"}
              size="sm"
              className={currentSplit === opt.value 
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" 
                : ""}
              onClick={() => {
                setAnswers(prev => ({ 
                  ...prev, 
                  trainingSplit: opt.value,
                  dayAssignments: {}
                }));
              }}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        <DaySplitAssigner
          selectedDays={answers.selectedDays}
          trainingSplit={currentSplit}
          dayAssignments={answers.dayAssignments}
          onChange={(assignments) => setAnswers(prev => ({ 
            ...prev, 
            dayAssignments: assignments,
            trainingSplit: currentSplit
          }))}
        />

        <Button
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
          disabled={!allAssigned}
          onClick={() => goToNextStep('question5')}
        >
          {allAssigned ? (
            <>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            `Atribua treinos a todos os ${daysCount} dias`
          )}
        </Button>
      </div>
    );
  };

  // Question 5: Location (home or gym)
  const renderQuestion5 = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Onde você vai treinar?
        </h3>
        <p className="text-muted-foreground">Escolha o local principal dos seus treinos</p>
      </div>

      <div className="grid gap-4">
        {[
          { 
            value: 'casa', 
            emoji: '🏠', 
            title: 'Em Casa', 
            desc: 'Treinos com peso corporal e itens de casa',
            details: 'Cadeira, escada, parede, toalha, garrafa',
            color: 'from-green-500 to-emerald-500',
            nextStep: 'question5b' as Step
          },
          { 
            value: 'academia', 
            emoji: '🏋️', 
            title: 'Na Academia', 
            desc: 'Treinos com equipamentos profissionais',
            details: 'Máquinas, barras, halteres, polias',
            color: 'from-purple-500 to-indigo-500',
            nextStep: 'question6' as Step
          },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.location === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSingleSelect('location', option.value, option.nextStep)}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{option.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{option.title}</h4>
                  <p className="text-sm opacity-90">{option.desc}</p>
                  <p className="text-xs opacity-70 mt-1">{option.details}</p>
                </div>
                {answers.location === option.value && <CheckCircle2 className="w-6 h-6" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <strong>Dica:</strong> Você pode mudar isso depois! Muitas pessoas 
              alternam entre casa e academia dependendo do dia.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Question 6: Goals (multiple selection)
  const renderQuestion6 = () => {
    const maxGoals = 2;
    const canContinue = answers.goals.length >= 1;

    const toggleGoal = (value: string) => {
      setAnswers(prev => {
        const currentGoals = prev.goals;
        if (currentGoals.includes(value)) {
          return { ...prev, goals: currentGoals.filter(g => g !== value) };
        } else if (currentGoals.length < maxGoals) {
          return { ...prev, goals: [...currentGoals, value] };
        }
        return prev;
      });
    };

    return (
      <div className="space-y-6 py-4 relative">
        <BackButton />
        <div className="text-center space-y-3 pt-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Quais são seus objetivos?
          </h3>
          <p className="text-muted-foreground">
            Selecione até {maxGoals} objetivos principais
          </p>
          {answers.goals.length > 0 && (
            <p className="text-sm text-emerald-600 font-medium">
              {answers.goals.length}/{maxGoals} selecionado(s)
            </p>
          )}
        </div>

        <div className="grid gap-3">
          {[
            { value: 'hipertrofia', emoji: '💪', title: 'Ganhar massa muscular', desc: 'Hipertrofia e força', color: 'from-purple-500 to-indigo-500' },
            { value: 'emagrecer', emoji: '🔥', title: 'Emagrecer', desc: 'Perder gordura e definir', color: 'from-amber-500 to-yellow-500' },
            { value: 'condicionamento', emoji: '🏃', title: 'Condicionamento físico', desc: 'Mais energia e disposição', color: 'from-blue-500 to-cyan-500' },
            { value: 'saude', emoji: '❤️', title: 'Melhorar saúde', desc: 'Prevenir doenças e viver melhor', color: 'from-green-500 to-teal-500' },
            { value: 'estresse', emoji: '🧘', title: 'Reduzir estresse', desc: 'Cuidar da saúde mental', color: 'from-pink-500 to-rose-500' },
          ].map(option => {
            const isSelected = answers.goals.includes(option.value);
            const isDisabled = !isSelected && answers.goals.length >= maxGoals;
            
            return (
              <Card 
                key={option.value}
                className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                  isSelected 
                    ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                    : isDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => !isDisabled && toggleGoal(option.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{option.emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-bold">{option.title}</h4>
                      <p className="text-sm opacity-80">{option.desc}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5" />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
          disabled={!canContinue}
          onClick={() => goToNextStep('question7')}
        >
          {canContinue ? (
            <>
              Continuar
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            'Selecione pelo menos 1 objetivo'
          )}
        </Button>
      </div>
    );
  };

  // Question 7: Physical limitations
  const renderQuestion7 = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
          Tem alguma limitação física?
        </h3>
        <p className="text-muted-foreground">Vamos adaptar os exercícios para você treinar com segurança</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: 'nenhuma', emoji: '✅', title: 'Nenhuma', desc: 'Estou pronto para começar!', color: 'from-green-500 to-emerald-500' },
          { value: 'joelho', emoji: '🦵', title: 'Dor nos joelhos', desc: 'Vamos evitar impacto e agachamentos profundos', color: 'from-amber-500 to-yellow-500' },
          { value: 'costas', emoji: '🔙', title: 'Dor nas costas', desc: 'Exercícios adaptados para proteger a coluna', color: 'from-blue-500 to-indigo-500' },
          { value: 'ombro', emoji: '💪', title: 'Dor nos ombros', desc: 'Movimentos seguros para articulação', color: 'from-purple-500 to-violet-500' },
          { value: 'cardiaco', emoji: '❤️', title: 'Problema cardíaco', desc: 'Intensidade controlada e monitorada', color: 'from-red-500 to-rose-500' },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.limitation === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSingleSelect('limitation', option.value, 'question8')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{option.title}</h4>
                  <p className="text-sm opacity-80">{option.desc}</p>
                </div>
                {answers.limitation === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Question 8: Body focus
  const renderQuestion8 = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Qual parte do corpo quer dar mais atenção?
        </h3>
        <p className="text-muted-foreground">Vamos priorizar essa área no seu treino</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: 'gluteos_pernas', emoji: '🍑', title: 'Glúteos e Pernas', desc: 'Fortalecer e definir membros inferiores', color: 'from-pink-500 to-rose-500' },
          { value: 'abdomen_core', emoji: '🎯', title: 'Abdômen e Core', desc: 'Barriga chapada e core forte', color: 'from-amber-500 to-yellow-500' },
          { value: 'bracos_ombros', emoji: '💪', title: 'Braços e Ombros', desc: 'Braços definidos e ombros largos', color: 'from-blue-500 to-cyan-500' },
          { value: 'costas_postura', emoji: '🔙', title: 'Costas e Postura', desc: 'Melhorar postura e costas definidas', color: 'from-green-500 to-emerald-500' },
          { value: 'peito', emoji: '🦾', title: 'Peito', desc: 'Peitoral desenvolvido e forte', color: 'from-indigo-500 to-purple-500' },
          { value: 'corpo_equilibrado', emoji: '⚖️', title: 'Corpo Todo Equilibrado', desc: 'Desenvolvimento harmonioso', color: 'from-purple-500 to-pink-500' },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.bodyFocus === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSingleSelect('bodyFocus', option.value, 'question9')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{option.title}</h4>
                  <p className="text-sm opacity-80">{option.desc}</p>
                </div>
                {answers.bodyFocus === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Question 9: Special condition
  const renderQuestion9 = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Heart className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Você está em alguma condição especial?
        </h3>
        <p className="text-muted-foreground">Vamos adaptar tudo para sua segurança</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: 'nenhuma', emoji: '✅', title: 'Nenhuma', desc: 'Estou pronto(a) para começar!', color: 'from-green-500 to-emerald-500' },
          { value: 'gestante', emoji: '🤰', title: 'Gestante', desc: 'Exercícios seguros para gravidez', color: 'from-pink-500 to-rose-500' },
          { value: 'pos_parto', emoji: '👶', title: 'Pós-parto', desc: 'Recuperação gradual e segura', color: 'from-purple-500 to-violet-500' },
          { value: 'obesidade', emoji: '🏋️', title: 'Obesidade (IMC 30+)', desc: 'Exercícios de baixo impacto', color: 'from-blue-500 to-indigo-500' },
          { value: 'recuperacao_lesao', emoji: '🩹', title: 'Recuperação de lesão', desc: 'Movimentos controlados e suaves', color: 'from-amber-500 to-yellow-500' },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.specialCondition === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSingleSelect('specialCondition', option.value, 'result')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{option.title}</h4>
                  <p className="text-sm opacity-80">{option.desc}</p>
                </div>
                {answers.specialCondition === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  // Result screen
  const renderResult = () => {
    const fullAnswers: UserAnswers = {
      ...answers,
      gender: profileData.gender,
      ageGroup: profileData.ageGroup
    };
    const recommendation = generateRecommendation(fullAnswers);
    
    return (
      <div className="space-y-6 py-4">
        {/* Main CTA button at the top */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="w-full max-w-md bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-6 text-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 mb-6"
            onClick={async () => {
              const success = await handleSaveProgram();
              if (success) {
                onClose();
              }
            }}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Salvando e Criando Treino...
              </>
            ) : (
              <>
                <Flame className="w-6 h-6 mr-3 animate-pulse" />
                🚀 Começar Hoje!
              </>
            )}
          </Button>
        </div>

        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl animate-pulse">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Star className="w-4 h-4 text-yellow-800" />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent sm:text-3xl">
              Seu Programa Personalizado!
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">Criado especialmente para você</p>
          </div>
        </div>

        {/* Limitation warning */}
        {answers.limitation !== 'nenhuma' && (
          <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-200">Exercícios adaptados</p>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Seu programa foi ajustado para sua limitação ({answers.limitation}). 
                    Exercícios de impacto ou risco foram substituídos por alternativas seguras.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 border-2 border-green-200 dark:border-green-800 shadow-2xl">
          <CardContent className="p-5 space-y-5 sm:p-8 sm:space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 sm:text-3xl">
                {recommendation.title}
              </h3>
              <p className="text-base text-green-700 dark:text-green-300 sm:text-xl">
                {recommendation.subtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-3 sm:gap-6 sm:pt-6">
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl sm:p-4">
                <div className="text-2xl font-bold text-green-600 mb-1 sm:text-3xl sm:mb-2 break-words">
                  {recommendation.duration}
                </div>
                <div className="text-xs text-muted-foreground font-medium sm:text-sm">Duração</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl sm:p-4">
                <div className="text-2xl font-bold text-emerald-600 mb-1 sm:text-3xl sm:mb-2 break-words">
                  {recommendation.frequency}
                </div>
                <div className="text-xs text-muted-foreground font-medium sm:text-sm">Frequência</div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-black/20 rounded-xl sm:p-4">
                <div className="text-2xl font-bold text-teal-600 mb-1 sm:text-3xl sm:mb-2 break-words">
                  {recommendation.time}
                </div>
                <div className="text-xs text-muted-foreground font-medium sm:text-sm">Por treino</div>
              </div>
            </div>

            <div className="text-center pt-3 sm:pt-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed sm:text-lg">
                {recommendation.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-center gap-3">
            <Calendar className="w-6 h-6 text-green-600" />
            <h4 className="text-2xl font-bold text-green-800 dark:text-green-200">Seu Plano Semanal</h4>
          </div>
          
          <div className="grid gap-4">
            {recommendation.weekPlan.map((week) => (
              <Card key={week.week} className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                        {week.week}
                      </div>
                      <span className="text-xl font-bold text-blue-800 dark:text-blue-200">Semana {week.week}</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {week.days}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {week.activities.map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-black/20 rounded-lg">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{activity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <Button 
            size="lg" 
            variant="outline"
            className="w-full border-2 border-gray-300 hover:border-gray-400 py-4 text-lg font-medium"
            onClick={resetOnboarding}
          >
            <ArrowLeft className="w-5 h-5 mr-3" />
            Refazer Questionário
          </Button>
        </div>
      </div>
    );
  };

  // Main render - orchestrates all steps
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
        <DialogHeader className="pb-6">
          {step !== 'welcome' && step !== 'result' && (
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="font-medium">Pergunta {currentStep} de {totalSteps}</span>
                <span className="font-bold text-lg">{Math.round(progress)}%</span>
              </div>
              <div className="relative">
                <Progress value={progress} className="h-3 bg-gray-200 dark:bg-gray-700" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20" />
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="min-h-[400px]">
          {/* Welcome step */}
          {step === 'welcome' && (
            <WelcomeStep onStart={() => setStep('question1')} />
          )}
          
          {/* Question 1: Level */}
          {step === 'question1' && (
            <GoalsStep
              level={answers.level}
              onAnswer={(value) => handleSingleSelect('level', value, 'question2')}
              onBack={goToPreviousStep}
              canGoBack={canGoBack}
            />
          )}
          
          {/* Question 2: Experience */}
          {step === 'question2' && (
            <ExperienceStep
              experience={answers.experience}
              onAnswer={(value) => handleSingleSelect('experience', value, 'question3')}
              onBack={goToPreviousStep}
              canGoBack={canGoBack}
            />
          )}
          
          {/* Question 3: Time per workout */}
          {step === 'question3' && renderQuestion3()}
          
          {/* Question 3b: Exercises per day */}
          {step === 'question3b' && renderQuestion3b()}
          
          {/* Question 4: Frequency */}
          {step === 'question4' && renderQuestion4()}
          
          {/* Question 4b: Day selector */}
          {step === 'question4b' && renderQuestion4b()}
          
          {/* Question 4c: Day split assigner */}
          {step === 'question4c' && renderQuestion4c()}
          
          {/* Question 5: Location */}
          {step === 'question5' && renderQuestion5()}
          
          {/* Question 5b: Equipment (only for home) */}
          {step === 'question5b' && (
            <EquipmentStep
              location={answers.location}
              onAnswer={(value) => handleSingleSelect('location', value, 'question6')}
              onBack={goToPreviousStep}
              canGoBack={canGoBack}
            />
          )}
          
          {/* Question 6: Goals */}
          {step === 'question6' && renderQuestion6()}
          
          {/* Question 7: Limitations */}
          {step === 'question7' && renderQuestion7()}
          
          {/* Question 8: Body focus */}
          {step === 'question8' && renderQuestion8()}
          
          {/* Question 9: Special condition */}
          {step === 'question9' && renderQuestion9()}
          
          {/* Result screen */}
          {step === 'result' && renderResult()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseOnboardingModal;
