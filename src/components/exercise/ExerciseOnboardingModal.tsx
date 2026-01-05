import React, { useState } from 'react';
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
  Users,
  AlertTriangle
} from 'lucide-react';
import { useExerciseProgram } from '@/hooks/useExerciseProgram';
import { User } from '@supabase/supabase-js';
import { parseWeekPlan } from '@/utils/workoutParser';
import { generateRecommendation, UserAnswers } from '@/hooks/useExerciseRecommendation';

interface ExerciseOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

type Step = 'welcome' | 'question1' | 'question2' | 'question3' | 'question4' | 'question5' | 'question6' | 'question7' | 'result';

interface Answers {
  level: string;
  experience: string;
  time: string;
  frequency: string;
  location: string;
  goal: string;
  limitation: string;
}

export const ExerciseOnboardingModal: React.FC<ExerciseOnboardingModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [step, setStep] = useState<Step>('welcome');
  const [answers, setAnswers] = useState<Answers>({
    level: '',
    experience: '',
    time: '',
    frequency: '',
    location: '',
    goal: '',
    limitation: '',
  });
  const [saving, setSaving] = useState(false);
  const { saveProgram } = useExerciseProgram(user?.id);

  const totalSteps = 7;
  const currentStep = step === 'welcome' ? 0 : 
                     step === 'question1' ? 1 :
                     step === 'question2' ? 2 :
                     step === 'question3' ? 3 :
                     step === 'question4' ? 4 :
                     step === 'question5' ? 5 :
                     step === 'question6' ? 6 :
                     step === 'question7' ? 7 : 8;

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
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center animate-pulse shadow-2xl">
              <Sparkles className="w-10 h-10 md:w-16 md:h-16 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 md:w-8 md:h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-800" />
            </div>
          </div>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
            Bem-vindo ao seu Início Saudável! 👋
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-md mx-auto">
            "Nunca é tarde para começar. Cada passo conta!"
          </p>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950 border-2 border-orange-200 dark:border-orange-800 shadow-xl">
        <CardContent className="p-4 md:p-8 space-y-3 md:space-y-4">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-4">
            <Trophy className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
            <h3 className="text-lg md:text-xl font-bold text-orange-800 dark:text-orange-200">
              Programa Personalizado
            </h3>
          </div>
          
          <p className="font-medium text-center text-gray-700 dark:text-gray-300 text-sm md:text-base">
            Vamos descobrir o melhor programa para você!
          </p>
          <p className="text-xs md:text-sm text-muted-foreground text-center">
            Responda 7 perguntas rápidas e criaremos um plano personalizado para o seu nível
          </p>
          
          <div className="flex justify-center gap-3 md:gap-4 pt-1 md:pt-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-[11px] md:text-xs px-2 py-1">
              <Timer className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              3 minutos
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800 text-[11px] md:text-xs px-2 py-1">
              <Users className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Personalizado
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 md:pt-4">
        <Button 
          size="lg" 
          className="w-full max-w-md bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold py-4 md:py-6 text-base md:text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
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
    <div className="space-y-6 py-4">
      <div className="text-center space-y-3">
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
          { value: 'sedentario', emoji: '🛋️', title: 'Sedentário', desc: 'Não faço atividades físicas regularmente', color: 'from-orange-500 to-red-500' },
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
              setTimeout(() => setStep('question2'), 300);
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
    <div className="space-y-6 py-4">
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Qual sua experiência com musculação?
        </h3>
        <p className="text-muted-foreground">Isso nos ajuda a definir a complexidade dos exercícios</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: 'nenhuma', emoji: '🌱', title: 'Nenhuma', desc: 'Nunca treinei com pesos', color: 'from-green-500 to-teal-500' },
          { value: 'pouca', emoji: '📚', title: 'Pouca', desc: 'Já fiz algumas vezes mas parei', color: 'from-blue-500 to-cyan-500' },
          { value: 'moderada', emoji: '🎯', title: 'Moderada', desc: 'Conheço os exercícios básicos', color: 'from-purple-500 to-indigo-500' },
          { value: 'avancada', emoji: '🏆', title: 'Avançada', desc: 'Domino técnicas e periodização', color: 'from-orange-500 to-red-500' },
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
              setTimeout(() => setStep('question3'), 300);
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
    <div className="space-y-6 py-4">
      <div className="text-center space-y-3">
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
          { value: '45-60', icon: '💪', title: '45-60+ minutos', desc: 'Treino completo e intenso', color: 'from-orange-500 to-red-500' },
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
              setTimeout(() => setStep('question4'), 300);
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

  const renderQuestion4 = () => (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-3">
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
          { value: '4-5x', icon: '🔥', title: '4-5 vezes', desc: 'Ótimo para resultados', color: 'from-orange-500 to-red-500' },
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
              setTimeout(() => setStep('question5'), 300);
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

  const renderQuestion5 = () => (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Home className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Onde prefere treinar?
        </h3>
        <p className="text-muted-foreground">Escolha o ambiente mais confortável para você</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: 'casa_sem', emoji: '🏠', title: 'Casa (sem equipamentos)', desc: 'Usando móveis: cadeira, mesa, escada, parede', color: 'from-green-500 to-emerald-500' },
          { value: 'casa_com', emoji: '🏋️‍♂️', title: 'Casa (com equipamentos)', desc: 'Halteres, elásticos, banco, barra', color: 'from-blue-500 to-cyan-500' },
          { value: 'academia', emoji: '💪', title: 'Academia', desc: 'Acesso a equipamentos completos', color: 'from-purple-500 to-pink-500' },
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
              setTimeout(() => setStep('question6'), 300);
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
    </div>
  );

  const renderQuestion6 = () => (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent">
          Qual é o seu objetivo principal?
        </h3>
        <p className="text-muted-foreground">Vamos focar no que é mais importante para você</p>
      </div>

      <div className="grid gap-3">
        {[
          { value: 'hipertrofia', emoji: '💪', title: 'Ganhar massa muscular', desc: 'Hipertrofia e força', color: 'from-purple-500 to-indigo-500' },
          { value: 'emagrecer', emoji: '🔥', title: 'Emagrecer', desc: 'Perder gordura e definir', color: 'from-orange-500 to-red-500' },
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
              setTimeout(() => setStep('question7'), 300);
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
    <div className="space-y-6 py-4">
      <div className="text-center space-y-3">
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
          { value: 'joelho', emoji: '🦵', title: 'Dor nos joelhos', desc: 'Vamos evitar impacto e agachamentos profundos', color: 'from-orange-500 to-amber-500' },
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
              setTimeout(() => setStep('result'), 300);
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

  const renderResult = () => {
    // Usar a função importada do hook com as respostas atuais
    const recommendation = generateRecommendation(answers as UserAnswers);
    return (
      <div className="space-y-6 py-4">
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
            className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-6 text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
            onClick={async () => {
              setSaving(true);
              
              const parsedWeekPlan = parseWeekPlan(recommendation.weekPlan);
              
              await saveProgram({
                ...recommendation,
                weekPlan: parsedWeekPlan,
                level: answers.level,
                experience: answers.experience,
                location: answers.location,
                goal: answers.goal,
                limitation: answers.limitation
              });
              setSaving(false);
              onClose();
            }}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                Salvando...
              </>
            ) : (
              <>
                <Flame className="w-6 h-6 mr-3 animate-pulse" />
                Começar Hoje!
              </>
            )}
          </Button>
          
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
          {step === 'question4' && renderQuestion4()}
          {step === 'question5' && renderQuestion5()}
          {step === 'question6' && renderQuestion6()}
          {step === 'question7' && renderQuestion7()}
          {step === 'result' && renderResult()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
