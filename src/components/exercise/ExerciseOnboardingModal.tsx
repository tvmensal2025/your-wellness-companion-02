import React, { useState, useEffect } from 'react';
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
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Home, 
  Clock, 
  Target, 
  Heart,
  CheckCircle2,
  Calendar,
  Zap,
  Activity,
  Dumbbell,
  Flame,
  Star,
  Trophy,
  Timer,
  AlertTriangle
} from 'lucide-react';
import { useExerciseProgram } from '@/hooks/useExerciseProgram';
import { useToast } from '@/hooks/use-toast';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { parseWeekPlan } from '@/utils/workoutParser';
import { generateRecommendation, UserAnswers } from '@/hooks/useExerciseRecommendation';
import { useExerciseProfileData } from '@/hooks/useExerciseProfileData';
import { DaySelector } from './DaySelector';

interface ExerciseOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

// Removido: question8 (gênero) e question10 (idade) - buscamos do perfil do usuário
// Adicionado: question4b (seleção de dias), question3b (quantidade de exercícios)
// question5 agora pergunta ONDE vai treinar (Casa ou Academia)
// question5b pergunta equipamentos disponíveis (se casa)
type Step = 'welcome' | 'question1' | 'question2' | 'question3' | 'question3b' | 'question4' | 'question4b' | 'question5' | 'question5b' | 'question6' | 'question7' | 'question8' | 'question9' | 'result';

interface Answers {
  level: string;
  experience: string;
  time: string;
  frequency: string;
  location: string;
  goal: string;
  limitation: string;
  // Novas perguntas (gênero e idade vêm do perfil)
  bodyFocus: string;
  specialCondition: string;
  // Novas perguntas de dias e divisão
  selectedDays: string[];
  trainingSplit: string;
  // Nova: quantidade de exercícios por treino
  exercisesPerDay: string;
}

export const ExerciseOnboardingModal: React.FC<ExerciseOnboardingModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [step, setStep] = useState<Step>('welcome');
  const [stepHistory, setStepHistory] = useState<Step[]>([]);
  const [answers, setAnswers] = useState<Answers>({
    level: '',
    experience: '',
    time: '',
    frequency: '',
    location: '',
    goal: '',
    limitation: '',
    bodyFocus: '',
    specialCondition: '',
    selectedDays: [],
    trainingSplit: '',
    exercisesPerDay: '',
  });
  const [saving, setSaving] = useState(false);
  const { saveProgram } = useExerciseProgram(user?.id);
  const { toast } = useToast();
  
  // Buscar gênero e idade do perfil do usuário
  const { profileData, isLoading: profileLoading } = useExerciseProfileData(user?.id);

  // Função para avançar salvando histórico
  const goToNextStep = (nextStep: Step) => {
    setStepHistory(prev => [...prev, step]);
    setStep(nextStep);
  };

  // Função para voltar à pergunta anterior
  const goToPreviousStep = () => {
    if (stepHistory.length > 0) {
      const prevStep = stepHistory[stepHistory.length - 1];
      setStepHistory(prev => prev.slice(0, -1));
      setStep(prevStep);
    }
  };

  // Botão de voltar reutilizável
  const BackButton = () => (
    stepHistory.length > 0 ? (
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

  // 9 perguntas agora (removemos gênero e idade)
  const totalSteps = 9;
  const currentStep = step === 'welcome' ? 0 : 
                     step === 'question1' ? 1 :
                     step === 'question2' ? 2 :
                     step === 'question3' ? 3 :
                     step === 'question4' ? 4 :
                     step === 'question5' ? 5 :
                     step === 'question6' ? 6 :
                     step === 'question7' ? 7 :
                     step === 'question8' ? 8 :
                     step === 'question9' ? 9 : 10;

  const progress = (currentStep / (totalSteps + 1)) * 100;

  const handleAnswer = (question: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [question]: value }));
  };

  // Função de recomendação agora vem do hook useExerciseRecommendation

  const renderWelcome = () => (
    <div className="text-center py-6 space-y-6 md:py-8 md:space-y-8">
      <div className="relative">
        <div className="flex justify-center mb-4 md:mb-6">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 flex items-center justify-center animate-pulse shadow-2xl">
              <Sparkles className="w-10 h-10 md:w-16 md:h-16 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-800" />
            </div>
          </div>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Bem-vindo ao seu Início Saudável! 👋
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-md mx-auto">
            "Nunca é tarde para começar. Cada passo conta!"
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl">
        <CardContent className="p-4 md:p-8 space-y-3 md:space-y-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-emerald-600" />
            <h3 className="text-lg md:text-xl font-bold text-emerald-800 dark:text-emerald-200">
              Programa Personalizado
            </h3>
          </div>
          
          <p className="font-medium text-center text-gray-700 dark:text-gray-300 text-sm md:text-base">
            Vamos descobrir o melhor programa para você!
          </p>
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            Responda algumas perguntas rápidas e criaremos um plano 100% personalizado
          </p>
          
          <div className="flex justify-center gap-3 md:gap-4 pt-1 md:pt-2">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-[11px] md:text-xs px-2 py-1">
              <Timer className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              3 minutos
            </Badge>
            <Badge variant="secondary" className="bg-teal-100 text-teal-800 text-[11px] md:text-xs px-2 py-1">
              <Star className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Personalizado
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 md:pt-4">
        <Button 
          size="lg" 
          className="w-full max-w-md bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold py-4 md:py-6 text-base md:text-lg shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105"
          onClick={() => setStep('question1')}
        >
          <Zap className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3 animate-pulse" />
          Começar minha jornada
          <ArrowRight className="ml-2 md:ml-3 w-5 h-5 md:w-6 md:h-6" />
        </Button>
      </div>
    </div>
  );

  const renderQuestion1 = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Qual é o seu nível atual?
        </h3>
        <p className="text-muted-foreground">Seja honesto! Isso nos ajuda a criar o melhor plano para você</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: 'sedentario', emoji: '🛋️', title: 'Sedentário', desc: 'Não faço atividades físicas regularmente', color: 'from-slate-500 to-gray-500' },
          { value: 'leve', emoji: '🚶', title: 'Caminho às vezes', desc: 'Faço caminhadas ocasionais', color: 'from-green-500 to-emerald-500' },
          { value: 'moderado', emoji: '🏃', title: 'Faço alguma atividade', desc: 'Já tenho algum condicionamento básico', color: 'from-blue-500 to-purple-500' },
          { value: 'avancado', emoji: '💪', title: 'Treino regularmente', desc: 'Já tenho experiência com exercícios', color: 'from-purple-500 to-pink-500' },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.level === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => {
              handleAnswer('level', option.value);
              setTimeout(() => goToNextStep('question2'), 300);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{option.title}</h4>
                  <p className="text-sm opacity-80">{option.desc}</p>
                </div>
                {answers.level === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderQuestion2 = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
          Qual sua experiência com musculação?
        </h3>
        <p className="text-muted-foreground">Isso nos ajuda a definir a complexidade dos exercícios</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: 'nenhuma', emoji: '🌱', title: 'Nenhuma', desc: 'Nunca treinei com pesos', color: 'from-green-500 to-teal-500' },
          { value: 'pouca', emoji: '📚', title: 'Pouca', desc: 'Já fiz algumas vezes mas parei', color: 'from-blue-500 to-cyan-500' },
          { value: 'moderada', emoji: '🎯', title: 'Moderada', desc: 'Conheço os exercícios básicos', color: 'from-purple-500 to-indigo-500' },
          { value: 'avancada', emoji: '🏆', title: 'Avançada', desc: 'Domino técnicas e periodização', color: 'from-amber-500 to-yellow-500' },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.experience === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => {
              handleAnswer('experience', option.value);
              setTimeout(() => goToNextStep('question3'), 300);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{option.title}</h4>
                  <p className="text-sm opacity-80">{option.desc}</p>
                </div>
                {answers.experience === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

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
            onClick={() => {
              handleAnswer('time', option.value);
              setTimeout(() => goToNextStep('question3b'), 300);
            }}
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

  // PERGUNTA 3B: Quantos exercícios por treino
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
            onClick={() => {
              handleAnswer('exercisesPerDay', option.value);
              setTimeout(() => goToNextStep('question4'), 300);
            }}
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
            onClick={() => {
              handleAnswer('frequency', option.value);
              setTimeout(() => goToNextStep('question4b'), 300);
            }}
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

  // PERGUNTA 4B: Seleção de dias da semana
  const getMaxDaysFromFrequency = (freq: string): number => {
    if (freq === '2-3x') return 3;
    if (freq === '4-5x') return 5;
    if (freq === '6x') return 6;
    return 3;
  };

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
          onClick={() => goToNextStep('question5')}
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

  // PERGUNTA 5: Onde vai treinar? (Casa ou Academia)
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
            onClick={() => {
              handleAnswer('location', option.value);
              setTimeout(() => goToNextStep(option.nextStep), 300);
            }}
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

      {/* Dica */}
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

  // PERGUNTA 5B: Equipamentos disponíveis em casa (só aparece se escolheu casa)
  const renderQuestion5b = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Home className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Quais itens você tem em casa?
        </h3>
        <p className="text-sm text-muted-foreground">Isso nos ajuda a personalizar seus exercícios</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: 'casa_basico', emoji: '🏠', title: 'Apenas móveis de casa', desc: 'Cadeira, mesa, escada, parede, toalha', color: 'from-green-500 to-emerald-500' },
          { value: 'casa_elastico', emoji: '🎯', title: 'Tenho elástico de exercício', desc: 'Móveis + elástico/faixa de resistência', color: 'from-blue-500 to-cyan-500' },
          { value: 'casa_completo', emoji: '💪', title: 'Tenho alguns equipamentos', desc: 'Elástico + mochila com peso + barra de porta', color: 'from-purple-500 to-pink-500' },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.location === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => {
              handleAnswer('location', option.value);
              setTimeout(() => goToNextStep('question6'), 300);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{option.title}</h4>
                  <p className="text-sm opacity-80">{option.desc}</p>
                </div>
                {answers.location === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dica sobre equipamentos */}
      <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 border-amber-200">
        <CardContent className="p-3">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Dica:</strong> Você pode usar garrafas de água como peso, 
              uma mochila com livros, ou uma toalha para exercícios de resistência!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQuestion6 = () => (
    <div className="space-y-6 py-4 relative">
      <BackButton />
      <div className="text-center space-y-3 pt-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Qual é o seu objetivo principal?
        </h3>
        <p className="text-muted-foreground">Vamos focar no que é mais importante para você</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: 'hipertrofia', emoji: '💪', title: 'Ganhar massa muscular', desc: 'Hipertrofia e força', color: 'from-purple-500 to-indigo-500' },
          { value: 'emagrecer', emoji: '🔥', title: 'Emagrecer', desc: 'Perder gordura e definir', color: 'from-amber-500 to-yellow-500' },
          { value: 'condicionamento', emoji: '🏃', title: 'Condicionamento físico', desc: 'Mais energia e disposição', color: 'from-blue-500 to-cyan-500' },
          { value: 'saude', emoji: '❤️', title: 'Melhorar saúde', desc: 'Prevenir doenças e viver melhor', color: 'from-green-500 to-teal-500' },
          { value: 'estresse', emoji: '🧘', title: 'Reduzir estresse', desc: 'Cuidar da saúde mental', color: 'from-pink-500 to-rose-500' },
        ].map(option => (
          <Card 
            key={option.value}
            className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
              answers.goal === option.value 
                ? `bg-gradient-to-r ${option.color} text-white shadow-2xl` 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => {
              handleAnswer('goal', option.value);
              setTimeout(() => goToNextStep('question7'), 300);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-2xl">{option.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-bold">{option.title}</h4>
                  <p className="text-sm opacity-80">{option.desc}</p>
                </div>
                {answers.goal === option.value && <CheckCircle2 className="w-5 h-5" />}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

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
            onClick={() => {
              handleAnswer('limitation', option.value);
              setTimeout(() => goToNextStep('question8'), 300);
            }}
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

  // PERGUNTA 8: Foco Corporal (era pergunta 9)
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
            onClick={() => {
              handleAnswer('bodyFocus', option.value);
              setTimeout(() => goToNextStep('question9'), 300);
            }}
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

  // PERGUNTA 9: Condição Especial (era pergunta 11)
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
            onClick={() => {
              handleAnswer('specialCondition', option.value);
              setTimeout(() => goToNextStep('result'), 300);
            }}
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

  // Função para salvar respostas do onboarding no perfil do usuário
  const saveOnboardingAnswers = async () => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para salvar suas preferências",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log('💾 Salvando respostas do onboarding no perfil...');
      
      const exercisePreferences = {
        level: answers.level,
        experience: answers.experience,
        time: answers.time,
        frequency: answers.frequency,
        location: answers.location,
        goal: answers.goal,
        limitation: answers.limitation,
        bodyFocus: answers.bodyFocus,
        specialCondition: answers.specialCondition,
        selectedDays: answers.selectedDays,
        trainingSplit: answers.trainingSplit,
        exercisesPerDay: answers.exercisesPerDay,
        completedAt: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: {
            exercise: exercisePreferences
          }
        } as any)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao salvar preferências:', error);
        toast({
          title: "Erro ao salvar preferências",
          description: "Não foi possível salvar suas respostas. Tente novamente.",
          variant: "destructive"
        });
        return false;
      }

      console.log('✅ Preferências de exercício salvas com sucesso!');
      toast({
        title: "Preferências Salvas! ✅",
        description: "Suas respostas foram salvas automaticamente",
        duration: 3000
      });
      return true;
    } catch (error) {
      console.error('❌ Erro inesperado ao salvar preferências:', error);
      toast({
        title: "Erro inesperado",
        description: "Algo deu errado ao salvar suas preferências",
        variant: "destructive"
      });
      return false;
    }
  };

  const renderResult = () => {
    // Combinar respostas do onboarding com dados do perfil (gênero e idade)
    const fullAnswers: UserAnswers = {
      ...answers,
      gender: profileData.gender,
      ageGroup: profileData.ageGroup
    };
    const recommendation = generateRecommendation(fullAnswers);
    
    return (
      <div className="space-y-6 py-4">
        {/* BOTÃO COMEÇAR NO TOPO - DESTAQUE PRINCIPAL */}
        <div className="text-center">
          <Button 
            size="lg" 
            className="w-full max-w-md bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-6 text-xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105 mb-6"
            onClick={async () => {
              setSaving(true);
              
              // 1. Salvar respostas do onboarding no perfil
              const preferencesSaved = await saveOnboardingAnswers();
              if (!preferencesSaved) {
                setSaving(false);
                return;
              }
              
              // 2. Salvar programa de exercícios
              const parsedWeekPlan = parseWeekPlan(recommendation.weekPlan);
              
              const programSaved = await saveProgram({
                ...recommendation,
                weekPlan: parsedWeekPlan,
                level: answers.level,
                experience: answers.experience,
                location: answers.location,
                goal: answers.goal,
                limitation: answers.limitation
              });
              
              setSaving(false);
              
              if (programSaved) {
                // Mostrar sucesso final
                toast({
                  title: "🎉 Tudo Pronto!",
                  description: "Suas preferências foram salvas e seu treino personalizado foi criado!",
                  duration: 5000
                });
                
                // Fechar modal e mostrar sucesso
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

        {/* Aviso de limitação */}
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
            {recommendation.weekPlan.map((week, index) => (
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
            onClick={() => setStep('welcome')}
          >
            <ArrowRight className="w-5 h-5 mr-3 rotate-180" />
            Refazer Questionário
          </Button>
        </div>
      </div>
    );
  };

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
          {step === 'welcome' && renderWelcome()}
          {step === 'question1' && renderQuestion1()}
          {step === 'question2' && renderQuestion2()}
          {step === 'question3' && renderQuestion3()}
          {step === 'question3b' && renderQuestion3b()}
          {step === 'question4' && renderQuestion4()}
          {step === 'question4b' && renderQuestion4b()}
          {step === 'question5' && renderQuestion5()}
          {step === 'question5b' && renderQuestion5b()}
          {step === 'question6' && renderQuestion6()}
          {step === 'question7' && renderQuestion7()}
          {step === 'question8' && renderQuestion8()}
          {step === 'question9' && renderQuestion9()}
          {step === 'result' && renderResult()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
