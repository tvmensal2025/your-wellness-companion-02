import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Users
} from 'lucide-react';
import { useExerciseProgram } from '@/hooks/useExerciseProgram';
import { User } from '@supabase/supabase-js';
import { parseWeekPlan } from '@/utils/workoutParser';

interface ExerciseOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

type Step = 'welcome' | 'question1' | 'question2' | 'question3' | 'question4' | 'question5' | 'result';

interface Answers {
  level: string;
  time: string;
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
    time: '',
    location: '',
    goal: '',
    limitation: '',
  });
  const [saving, setSaving] = useState(false);
  const { saveProgram } = useExerciseProgram(user?.id);

  const totalSteps = 5;
  const currentStep = step === 'welcome' ? 0 : 
                     step === 'question1' ? 1 :
                     step === 'question2' ? 2 :
                     step === 'question3' ? 3 :
                     step === 'question4' ? 4 :
                     step === 'question5' ? 5 : 6;

  const progress = (currentStep / (totalSteps + 1)) * 100;

  const handleAnswer = (question: keyof Answers, value: string) => {
    setAnswers({ ...answers, [question]: value });
  };

  const generateRecommendation = () => {
    // Lógica de recomendação baseada nas respostas
    
    // PROGRAMA PARA SEDENTÁRIOS
    if (answers.level === 'sedentario') {
      return {
        title: '🛋️ Do Sofá ao Movimento',
        subtitle: 'Programa Super Iniciante',
        duration: '4 semanas',
        frequency: '3-5x por semana',
        time: '10-20 minutos',
        description: 'Comece devagar e construa o hábito! Este programa foi especialmente desenhado para quem está começando do zero.',
        weekPlan: [
          { 
            week: 1, 
            activities: [
              '🏃‍♂️ Caminhada Estruturada 10min: Aquecimento 2min (4km/h) → Moderada 5min (5km/h) → Intensa 2min (6km/h) → Desaquecimento 1min (4km/h)',
              '🧘‍♀️ Alongamento Dinâmico 5min: Panturrilha 30s cada perna → Quadríceps 30s cada perna → Isquiotibiais 30s cada perna → Ombros 30s → Coluna 30s'
            ], 
            days: 'Seg, Qua, Sex' 
          },
          { 
            week: 2, 
            activities: [
              '🏃‍♂️ Caminhada Progressiva 15min: Aquecimento 3min (4km/h) → Moderada 4min (5km/h) → Intensa 4min (6km/h) → Moderada 3min (5km/h) → Desaquecimento 1min (4km/h)',
              '💪 Circuito Funcional Leve 5min: Agachamento Livre 10-12x → Flexão na Parede 8-10x → Elevação de Pernas 10x cada → Prancha 15-20s → Caminhada no Lugar 1min'
            ], 
            days: 'Seg, Qua, Sex' 
          },
          { 
            week: 3, 
            activities: [
              '🏃‍♂️ Caminhada com Intervalos 20min: Aquecimento 3min → Moderada 3min → Intensa 3min → Moderada 3min → Intensa 3min → Moderada 3min → Desaquecimento 2min',
              '💪 Circuito Funcional Intermediário 10min: Agachamento com Braços 12-15x → Flexão Inclinada 10-12x → Ponte Glúteo 15-20x → Prancha Lateral 15-20s cada → Burpee Simplificado 5-8x'
            ], 
            days: 'Seg, Qua, Sex, Sáb' 
          },
          { 
            week: 4, 
            activities: [
              '🏃‍♂️ Caminhada HIIT 25min: Aquecimento 3min → Moderada 3min → Intensa 3min → Moderada 2min → Muito Intensa 3min → Moderada 2min → Intensa 3min → Moderada 3min → Desaquecimento 3min',
              '💪 Circuito Funcional Avançado 15min: Agachamento com Salto 10-12x → Flexão Tradicional 8-12x → Ponte com Elevação 10x cada perna → Prancha Completa 30-45s → Burpee Completo 5-8x'
            ], 
            days: 'Seg, Qua, Sex, Sáb' 
          }
        ]
      };
    }
    
    // PROGRAMA ACADEMIA - PERSONALIZADO POR OBJETIVO
    if (answers.location === 'academia') {
      // HIPERTROFIA (ganhar massa)
      if (answers.goal === 'condicionamento') {
        return {
          title: '🏋️ Academia - Hipertrofia ABC',
          subtitle: 'Ganho de Massa Muscular',
          duration: '12 semanas',
          frequency: '5x por semana',
          time: '60-75 minutos',
          description: 'Treino ABC focado em hipertrofia com volume alto e técnica perfeita. Ideal para ganho de massa muscular.',
          weekPlan: [
            { 
              week: 1, 
              activities: [
                'SEG - PEITO/TRÍCEPS: Aquecimento articular 5min | Supino reto 4x10 (60-70% 1RM) | Supino inclinado halter 3x12 | Crucifixo 3x12 | Crossover 3x15 | Tríceps pulley 3x12 | Tríceps francês 3x12 | Tríceps corda 3x15 | Alongamento 5min',
                'TER - COSTAS/BÍCEPS: Barra fixa 4x8-10 | Puxada frontal 3x12 | Remada curvada 4x10 | Remada cavalinho 3x12 | Pullover 3x12 | Rosca direta 3x12 | Rosca alternada 3x12 | Rosca martelo 3x12',
                'QUA - PERNAS: Aquecimento bike 5min | Agachamento livre 4x12 | Leg press 45° 4x15 | Hack machine 3x12 | Cadeira extensora 3x15 | Cadeira flexora 3x15 | Stiff 3x12 | Panturrilha sentado 4x20',
                'QUI - OMBRO/TRAPÉZIO: Desenvolvimento barra 4x10 | Desenvolvimento halter 3x12 | Elevação lateral 4x12 | Elevação frontal 3x12 | Crucifixo inverso 3x15 | Encolhimento barra 4x15 | Face pull 3x15',
                'SEX - FULL BODY METABÓLICO: Supino 3x15 | Leg press 3x20 | Puxada 3x15 | Agachamento livre 3x15 | Desenvolvimento 3x15 | Rosca 3x15 | Tríceps 3x15 | Abdominal 4x20'
              ], 
              days: 'Seg, Ter, Qua, Qui, Sex' 
            },
            { 
              week: 2, 
              activities: [
                'SEG - PEITO/TRÍCEPS: Supino reto 4x8 (carga +5%) | Supino declinado 3x10 | Crucifixo inclinado 3x12 | Peck deck 3x15 | Flexão c/ peso 3x15 | Tríceps testa 4x10 | Mergulho 3x12 | Kickback 3x15',
                'TER - COSTAS/BÍCEPS: Levantamento terra 4x8 | Barra fixa c/ peso 3x8 | Remada T 4x10 | Serrote 3x12 | Pull down 3x15 | Rosca scott 3x10 | Rosca inversa 3x12 | Rosca cabo 3x15',
                'QUA - PERNAS: Agachamento frontal 4x10 | Leg press unilateral 3x12 | Afundo caminhando 3x15 | Cadeira adutora 3x15 | Cadeira abdutora 3x15 | Mesa flexora 3x12 | Panturrilha em pé 4x20 | Panturrilha leg press 3x25',
                'QUI - OMBRO/CORE: Arnold press 4x10 | Elevação lateral cabo 4x12 | Remada alta 3x12 | Crucifixo inverso halter 3x15 | Face pull 4x15 | Prancha 4x60seg | Russian twist 4x30 | Abdominal infra 4x20',
                'SEX - INTENSIDADE: Drop sets peito 3x | Drop sets costas 3x | Drop sets pernas 3x | Drop sets ombros 3x'
              ], 
              days: 'Seg, Ter, Qua, Qui, Sex' 
            },
            { 
              week: 3, 
              activities: [
                'SEG - PEITO/FORÇA: Supino reto 5x5 (80% 1RM) | Supino inclinado 4x8 | Crucifixo 3x10 | Flexão c/ pausa 3x15 | Tríceps francês 4x8 | Tríceps pulley 3x12 | Close grip bench 3x10',
                'TER - COSTAS/VOLUME: Barra fixa 5 séries até falha | Puxada pegada neutra 4x10 | Remada baixa 4x10 | Remada unilateral 3x12 | Shrug halter 4x15 | Rosca 21s 3 séries | Rosca concentrada 3x10',
                'QUA - PERNAS/EXPLOSÃO: Agachamento 4x10 | Leg press explosivo 4x12 | Jump squat 3x15 | Bulgarian split 3x12 | Stiff romeno 4x10 | Cadeira flexora 3x15 | Panturrilha + jump 4x15+10',
                'QUI - OMBRO/HIPERTROFIA: Desenvolvimento Smith 4x10 | Elevação lateral drop set 3x | Elevação frontal disco 3x12 | Pássaro 4x15 | Desenvolvimento pegada fechada 3x12 | Rotação externa 3x15',
                'SEX - PUMP TOTAL: Circuito 4 rounds: Supino 15x + Leg press 20x + Remada 15x + Desenvolvimento 12x + Rosca 15x + Tríceps 15x (descanso 60seg entre rounds)'
              ], 
              days: 'Seg, Ter, Qua, Qui, Sex' 
            },
            { 
              week: 4, 
              activities: [
                'DELOAD WEEK (reduzir 30% da carga, manter volume): Recuperação ativa, treinos mais leves mantendo a técnica perfeita',
                'Todas as cargas reduzidas em 30%',
                'Foco em amplitude completa e conexão mente-músculo',
                'Preparação para novo ciclo de progressão'
              ], 
              days: 'Seg, Ter, Qua, Qui, Sex' 
            },
          ]
        };
      }
      
      // EMAGRECIMENTO
      if (answers.goal === 'emagrecer') {
        return {
          title: '🔥 Academia - Emagrecimento HIIT',
          subtitle: 'Queima de Gordura e Definição',
          duration: '10 semanas',
          frequency: '5x por semana',
          time: '50-65 minutos',
          description: 'Programa intenso com musculação + HIIT para máxima queima calórica e preservação muscular.',
          weekPlan: [
            { 
              week: 1, 
              activities: [
                'SEG - UPPER + HIIT: Supino 3x15 | Remada 3x15 | Desenvolvimento 3x15 | Puxada 3x15 | + HIIT Esteira: 20min (30seg sprint/30seg caminhada)',
                'TER - LOWER + CARDIO: Agachamento 4x20 | Leg press 3x25 | Stiff 3x15 | Cadeira extensora 3x20 | Panturrilha 4x25 | + Bike 15min moderado',
                'QUA - FULL BODY CIRCUITO: 5 rounds: Burpees 15x + Kettlebell swing 20x + Battle rope 30seg + Box jump 12x + Prancha 45seg (descanso 60seg)',
                'QUI - UPPER + METABÓLICO: Supino inclinado 3x15 | Barra fixa 3x10 | Arnold press 3x15 | Remada curvada 3x15 | + Assault bike 15min',
                'SEX - HIIT TOTAL: 30min HIIT no transport | Circuito 4x: Agachamento jump 20x + Flexão 15x + Mountain climber 30x + Russian twist 30x'
              ], 
              days: 'Seg, Ter, Qua, Qui, Sex' 
            },
            { 
              week: 2, 
              activities: [
                'SEG - PUSH + HIIT: Supino 4x12 | Desenvolvimento 3x12 | Crossover 3x15 | Tríceps 3x15 | + Remo 15min (intervalos 2min rápido/1min lento)',
                'TER - PULL + CARDIO: Levantamento terra 4x12 | Puxada 4x12 | Remada baixa 3x15 | Face pull 3x15 | Rosca 3x15 | + Escada 10min',
                'QUA - LEGS + PLIOMÉTRICO: Agachamento 4x15 | Afundo caminhando 3x20 | Jump squat 4x15 | Cadeira flexora 3x15 | Stiff 3x15 | + Jump rope 10min',
                'QUI - FULL BODY FORÇA: Supino 4x10 | Agachamento 4x10 | Barra fixa 4x10 | Desenvolvimento 3x10 | Stiff 4x10 | + Bike sprint 20min',
                'SEX - CARDIO CHALLENGE: 45min steady state (Z2) + 5 sprints de 1min'
              ], 
              days: 'Seg, Ter, Qua, Qui, Sex' 
            },
          ]
        };
      }
      
      // PADRÃO (condicionamento geral)
      return {
        title: '🏋️ Academia - ABC Completo',
        subtitle: 'Desenvolvimento Físico Geral',
        duration: '8 semanas',
        frequency: '4x por semana',
        time: '55-70 minutos',
        description: 'Treino balanceado para ganho de força, hipertrofia moderada e condicionamento cardiovascular.',
        weekPlan: [
          { 
            week: 1, 
            activities: [
              'SEG - PEITO/TRÍCEPS: Supino reto 4x10 | Supino inclinado halter 3x12 | Crucifixo 3x12 | Tríceps pulley 3x12 | Tríceps francês 3x12 | Abdominal 3x20 https://www.youtube.com/watch?v=rT7DgCr-3pg',
              'QUA - COSTAS/BÍCEPS: Barra fixa 4x8 | Puxada frontal 3x12 | Remada curvada 4x10 | Remada baixa 3x12 | Rosca direta 3x12 | Rosca martelo 3x12 https://www.youtube.com/watch?v=apzFT8P9A5c',
              'QUI - PERNAS: Agachamento livre 4x12 | Leg press 4x15 | Stiff 3x12 | Cadeira extensora 3x15 | Cadeira flexora 3x15 | Panturrilha 4x20 https://www.youtube.com/watch?v=1xMaFs0L3ao',
              'SEX - OMBRO/CORE: Desenvolvimento 4x10 | Elevação lateral 3x12 | Elevação frontal 3x12 | Crucifixo inverso 3x15 | Prancha 4x45seg | Russian twist 3x30 https://www.youtube.com/watch?v=qEwKCR5JCog'
            ], 
            days: 'Seg, Qua, Qui, Sex' 
          },
          { 
            week: 2, 
            activities: [
              'SEG - PEITO/FORÇA: Supino reto 5x8 | Supino declinado 3x10 | Crossover 3x15 | Tríceps corda 4x12 | Mergulho 3x12 | Abdominal bicicleta 3x30 https://www.youtube.com/watch?v=rT7DgCr-3pg',
              'QUA - COSTAS/VOLUME: Levantamento terra 4x10 | Puxada pegada aberta 4x10 | Remada T 3x12 | Serrote 3x12 | Rosca scott 3x12 | Rosca inversa 3x15 https://www.youtube.com/watch?v=apzFT8P9A5c',
              'QUI - PERNAS/EXPLOSÃO: Agachamento 4x10 | Leg press unilateral 3x12 | Afundo caminhando 3x15 | Bulgarian split 3x12 | Mesa flexora 3x15 | Panturrilha saltando 4x15 https://www.youtube.com/watch?v=1xMaFs0L3ao',
              'SEX - OMBRO/ESTABILIDADE: Arnold press 4x10 | Elevação lateral cabo 4x12 | Face pull 4x15 | Rotação externa 3x15 | Prancha lateral 3x30seg | Hollow hold 3x30seg https://www.youtube.com/watch?v=qEwKCR5JCog'
            ], 
            days: 'Seg, Qua, Qui, Sex' 
          },
        ]
      };
    }
    
    // PROGRAMA CASA SEM EQUIPAMENTOS (USANDO MÓVEIS)
    if (answers.location === 'casa_sem') {
      return {
        title: '🏠 Treino em Casa - Usando Móveis',
        subtitle: 'Mesa, Cadeira, Banco, Escada e Parede',
        duration: '8 semanas',
        frequency: '4x por semana',
        time: answers.time === '10-15' ? '25 minutos' : '40 minutos',
        description: 'Transforme sua casa em uma academia! Use cadeiras, mesa, escada, banco e parede para treinar.',
        weekPlan: [
          { 
            week: 1, 
            activities: [
              'SEG - PERNAS: Agachamento (pés na largura do ombro) 3x15 | Subida no banco 3x10 cada perna | Afundo usando cadeira 3x12 cada | Panturrilha na escada 3x20 https://www.youtube.com/watch?v=Z2F0b0c5xV8',
              'TER - PEITO/TRÍCEPS: Flexão na parede 3x12 | Mergulho na cadeira (tríceps) 3x10 | Flexão inclinada (mãos na mesa) 3x10 | Prancha 3x30seg https://www.youtube.com/watch?v=IODxDxX7oi4',
              'QUI - COSTAS/BÍCEPS: Remada na mesa (corpo sob mesa, puxa) 3x12 | Superman (no chão) 3x15 | Rosca de bíceps isométrica na mesa 3x20seg | Prancha reversa 3x20seg https://www.youtube.com/watch?v=7Qqsmc5vK40',
              'SEX - FULL BODY: Circuito 3x: Agachamento 15x + Flexão mesa 10x + Subida banco 10x cada + Abdominal 15x https://www.youtube.com/watch?v=UItWltVZZmE'
            ], 
            days: 'Seg, Ter, Qui, Sex' 
          },
          { 
            week: 2, 
            activities: [
              'SEG - PERNAS: Agachamento búlgaro (pé traseiro na cadeira) 3x12 | Agachamento sumô 3x15 | Subida lateral na escada 3x10 cada | Ponte glúteo (pés no banco) 3x15 https://www.youtube.com/watch?v=2C-uNgKwPLE',
              'TER - PEITO/TRÍCEPS: Flexão declinada (pés no banco) 3x10 | Mergulho entre 2 cadeiras 3x12 | Flexão diamante 3x8 | Prancha lateral 3x25seg cada https://www.youtube.com/watch?v=IODxDxX7oi4',
              'QUI - COSTAS/OMBRO: Remada invertida mesa 3x15 | Elevação Y na parede 3x12 | Face pull na toalha/porta 3x15 | Prancha comando 3x10 https://www.youtube.com/watch?v=8Q5QG9nbRMI',
              'SEX - CARDIO/CORE: Subir e descer escada 5min | Burpees 3x10 | Mountain climber 3x20 | Abdominal bike 3x30 | Prancha 3x45seg https://www.youtube.com/watch?v=ml6cT4AZdqI'
            ], 
            days: 'Seg, Ter, Qui, Sex' 
          },
          { 
            week: 3, 
            activities: [
              'SEG - PERNAS INTENSO: Agachamento pistol (assist na parede) 3x6 cada | Jump squat 3x12 | Afundo caminhando 3x15 cada | Panturrilha unilateral escada 3x15 https://www.youtube.com/watch?v=aclHkVaku9U',
              'TER - PEITO/TRÍCEPS INTENSO: Flexão archer (alternada) 3x8 cada | Mergulho declinado (pés elevados) 3x12 | Flexão explosiva 3x8 | Prancha toca ombro 3x20 https://www.youtube.com/watch?v=IODxDxX7oi4',
              'QUI - COSTAS/FORÇA: Remada australiana (pés elevados) 3x12 | Pullover com toalha 3x15 | Remada unilateral mesa 3x12 cada | Hollow hold 3x30seg https://www.youtube.com/watch?v=GZpWaKW9nDU',
              'SEX - HIIT: Circuito 4x: Burpees 10x + Escada corrida 20x + Flexão 10x + Jump squat 10x + Prancha 30seg (desc 30seg) https://www.youtube.com/watch?v=ml6cT4AZdqI'
            ], 
            days: 'Seg, Ter, Qui, Sex' 
          },
          { 
            week: 4, 
            activities: [
              'SEG - PERNAS AVANÇADO: Pistol squat completo 3x8 | Afundo búlgaro saltando 3x10 | Agachamento isométrico parede 3x45seg | Single leg deadlift 3x12 https://www.youtube.com/watch?v=aclHkVaku9U',
              'TER - UPPER AVANÇADO: Flexão pseudo planche 3x8 | Dips bancada profundo 3x15 | Pike push up 3x12 | L-sit na cadeira 3x20seg https://www.youtube.com/watch?v=IODxDxX7oi4',
              'QUI - PULL/CORE: Typewriter pull (na mesa) 3x6 cada | Face pull avançado 3x15 | Hollow body rocks 3x15 | Dragon flag negativa 3x5 https://www.youtube.com/watch?v=GZpWaKW9nDU',
              'SEX - CHALLENGE: 100 burpees + 100 agachamentos + 100 flexões + 100 abdominais (menor tempo possível) https://www.youtube.com/watch?v=ml6cT4AZdqI'
            ], 
            days: 'Seg, Ter, Qui, Sex' 
          },
        ]
      };
    }
    
    // PROGRAMA CASA COM EQUIPAMENTOS
    if (answers.location === 'casa_com') {
      return {
        title: '🏠 Treino em Casa - Home Gym',
        subtitle: 'Halteres, Elásticos, Banco e Barra',
        duration: '10 semanas',
        frequency: '5x por semana',
        time: '50-65 minutos',
        description: 'Programa profissional usando equipamentos em casa. Resultados comparáveis à academia!',
        weekPlan: [
          { 
            week: 1, 
            activities: [
              'SEG - PEITO/TRÍCEPS: Aquecimento 5min | Supino halter no banco 4x12 | Supino inclinado (banco inclinado) 3x12 | Crucifixo 3x15 | Pullover 3x12 | Tríceps francês 3x12 | Tríceps kickback 3x15 | Flexão diamante 3x10',
              'TER - COSTAS/BÍCEPS: Remada curvada halter 4x12 | Remada unilateral 3x12 cada | Pullover pegada fechada 3x15 | Elástico pull down 3x15 | Rosca alternada 4x12 | Rosca martelo 3x12 | Rosca concentrada 3x12',
              'QUA - PERNAS: Agachamento búlgaro (halter) 4x12 | Goblet squat 4x15 | Stiff romeno 4x12 | Afundo caminhando c/ halter 3x15 | Agachamento sumô 3x15 | Panturrilha unilateral 4x20',
              'QUI - OMBRO/CORE: Desenvolvimento sentado 4x12 | Arnold press 3x12 | Elevação lateral 4x15 | Elevação frontal 3x12 | Remada alta 3x15 | Encolhimento 3x15 | Prancha 4x60seg | Abdominal c/ halter 3x20',
              'SEX - FULL BODY/FORÇA: Agachamento halter 4x10 | Supino 4x10 | Remada 4x10 | Desenvolvimento 3x10 | Stiff 4x10 | Abdominal complexo 4x15'
            ], 
            days: 'Seg, Ter, Qua, Qui, Sex' 
          },
          { 
            week: 2, 
            activities: [
              'SEG - PEITO/VOLUME: Supino reto 5x12 | Supino declinado (banco) 3x12 | Fly c/ elástico 4x15 | Press close grip 3x12 | Tríceps overhead 4x12 | Mergulho cadeira c/ halter 3x12',
              'TER - COSTAS/DENSIDADE: Remada supinada 4x10 | Remada pronada 4x10 | Serrote halter 3x12 | Pull elástico variado 3x15 | Rosca scott apoiado 4x12 | Rosca 21s 3 séries | Rosca inversa 3x15',
              'QUA - PERNAS/METABÓLICO: Goblet squat 4x20 | Jump squat c/ halter leve 3x15 | Afundo reverso 4x15 | Stiff unilateral 3x12 | Cadeira extensora elástico 4x20 | Panturrilha 5x25',
              'QUI - OMBRO/ACESSÓRIOS: Desenvolvimento barra (se tiver) 4x10 | Elevação lateral drop set 3x12+10+8 | Face pull 4x15 | Crucifixo inverso 4x15 | Rotação externa 3x15 | Prancha lateral 3x45seg',
              'SEX - PUMP TOTAL: Circuito 5 rounds: Agachamento 20x + Supino 15x + Remada 15x + Desenvolvimento 12x + Rosca 15x + Tríceps 15x (60seg descanso)'
            ], 
            days: 'Seg, Ter, Qua, Qui, Sex' 
          },
          { 
            week: 3, 
            activities: [
              'SEG - PEITO/INTENSIDADE: Supino rest-pause 4 séries | Supino inclinado cluster 3 séries | Fly drop set 3x | Tríceps superset (francês+pulley) 4x12+12',
              'TER - COSTAS/ESPESSURA: Levantamento terra halter 5x8 | Remada Pendlay 4x10 | Pull elástico pesado 4x10 | Shrug halter 4x15 | Rosca cabo 21s 3x | Rosca concentrada 4x10',
              'QUA - PERNAS/FORÇA: Agachamento halter 5x10 | Bulgarian split c/ pausa 4x10 | Stiff 5x10 | Afundo walking 4x20 total | Good morning 3x12 | Panturrilha explosiva 5x15',
              'QUI - DELTS/STABILITY: Military press 5x8 | Elevação lateral+frontal superset 3x12+12 | Face pull pesado 4x12 | Pássaro 4x15 | Prancha complexa 4min total',
              'SEX - ENDURANCE: 60min treino metabólico: Todos exercícios 3x20-25 reps com carga leve, descanso curto 30seg'
            ], 
            days: 'Seg, Ter, Qua, Qui, Sex' 
          },
          { 
            week: 4, 
            activities: [
              'DELOAD: Reduzir 40% carga, manter volume | Foco em técnica perfeita | Recuperação ativa | Mobilidade e flexibilidade',
              'Todos os exercícios com 40% menos carga',
              'Amplitude máxima',
              'Preparar corpo para novo ciclo'
            ], 
            days: 'Seg, Ter, Qua, Qui, Sex' 
          },
        ]
      };
    }
    
    // PROGRAMA PADRÃO (CAMINHADA)
    return {
      title: '🏃 Programa de Caminhada',
      subtitle: 'Construindo resistência',
      duration: '4 semanas',
      frequency: '5x por semana',
      time: '20-30 minutos',
      description: 'Aumente gradualmente sua resistência com caminhadas progressivas.',
      weekPlan: [
        { week: 1, activities: ['Caminhada leve 15min'], days: 'Seg-Sex' },
        { week: 2, activities: ['Caminhada moderada 20min'], days: 'Seg-Sex' },
        { week: 3, activities: ['Caminhada 25min + ritmo variado'], days: 'Seg-Sex' },
        { week: 4, activities: ['Caminhada 30min'], days: 'Seg-Sex' },
      ]
    };
  };

  const renderWelcome = () => (
    <div className="text-center py-8 space-y-8">
      {/* Hero Section com animação */}
      <div className="relative">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center animate-pulse shadow-2xl">
              <Sparkles className="w-16 h-16 text-white animate-spin" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <Star className="w-5 h-5 text-yellow-800" />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
            Bem-vindo ao seu Início Saudável! 👋
          </h2>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            "Nunca é tarde para começar. Cada passo conta!"
          </p>
        </div>
      </div>

      {/* Card de apresentação melhorado */}
      <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950 border-2 border-orange-200 dark:border-orange-800 shadow-xl">
        <CardContent className="p-8 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold text-orange-800 dark:text-orange-200">
              Programa Personalizado
            </h3>
          </div>
          
          <p className="font-medium text-center text-gray-700 dark:text-gray-300">
            Vamos descobrir o melhor programa para você!
          </p>
          <p className="text-sm text-muted-foreground text-center">
            Responda 5 perguntas rápidas e criaremos um plano personalizado para o seu nível
          </p>
          
          <div className="flex justify-center gap-4 pt-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Timer className="w-4 h-4 mr-1" />
              2 minutos
            </Badge>
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              <Users className="w-4 h-4 mr-1" />
              Personalizado
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Botão principal com animação */}
      <div className="pt-4">
        <Button 
          size="lg" 
          className="w-full max-w-md bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-bold py-6 text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105"
          onClick={() => setStep('question1')}
        >
          <Zap className="w-6 h-6 mr-3 animate-pulse" />
          Começar minha jornada
          <ArrowRight className="ml-3 w-6 h-6" />
        </Button>
      </div>
    </div>
  );

  const renderQuestion1 = () => (
    <div className="space-y-8 py-6">
      {/* Header da pergunta */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Qual é o seu nível atual?
        </h3>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Seja honesto! Isso nos ajuda a criar o melhor plano para você
        </p>
      </div>

      {/* Opções melhoradas */}
      <div className="grid gap-4">
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            answers.level === 'sedentario' 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl scale-105' 
              : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950 dark:hover:to-red-950'
          }`}
          onClick={() => {
            handleAnswer('level', 'sedentario');
            setTimeout(() => setStep('question2'), 300);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">🛋️</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-1">Sedentário</h4>
                <p className="text-sm opacity-90">Não faço atividades físicas regularmente</p>
              </div>
              {answers.level === 'sedentario' && (
                <CheckCircle2 className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            answers.level === 'leve' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl scale-105' 
              : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950 dark:hover:to-emerald-950'
          }`}
          onClick={() => {
            handleAnswer('level', 'leve');
            setTimeout(() => setStep('question2'), 300);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">🚶</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-1">Caminho às vezes</h4>
                <p className="text-sm opacity-90">Faço caminhadas ocasionais</p>
              </div>
              {answers.level === 'leve' && (
                <CheckCircle2 className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            answers.level === 'moderado' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-2xl scale-105' 
              : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950'
          }`}
          onClick={() => {
            handleAnswer('level', 'moderado');
            setTimeout(() => setStep('question2'), 300);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">🏃</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-1">Faço alguma atividade leve</h4>
                <p className="text-sm opacity-90">Já tenho algum condicionamento básico</p>
              </div>
              {answers.level === 'moderado' && (
                <CheckCircle2 className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQuestion2 = () => (
    <div className="space-y-8 py-6">
      {/* Header da pergunta */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Timer className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
          Quanto tempo você tem por dia?
        </h3>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Seja realista com sua rotina
        </p>
      </div>

      {/* Opções melhoradas */}
      <div className="grid gap-4">
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            answers.time === '10-15' 
              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl scale-105' 
              : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-950 dark:hover:to-emerald-950'
          }`}
          onClick={() => {
            handleAnswer('time', '10-15');
            setTimeout(() => setStep('question3'), 300);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-1">10-15 minutos</h4>
                <p className="text-sm opacity-90">Perfeito para começar</p>
              </div>
              {answers.time === '10-15' && (
                <CheckCircle2 className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            answers.time === '20-30' 
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-2xl scale-105' 
              : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950 dark:hover:to-cyan-950'
          }`}
          onClick={() => {
            handleAnswer('time', '20-30');
            setTimeout(() => setStep('question3'), 300);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-1">20-30 minutos</h4>
                <p className="text-sm opacity-90">Tempo ideal</p>
              </div>
              {answers.time === '20-30' && (
                <CheckCircle2 className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            answers.time === '30-45' 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl scale-105' 
              : 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950 dark:hover:to-pink-950'
          }`}
          onClick={() => {
            handleAnswer('time', '30-45');
            setTimeout(() => setStep('question3'), 300);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-1">30-45 minutos</h4>
                <p className="text-sm opacity-90">Ótimo para resultados rápidos</p>
              </div>
              {answers.time === '30-45' && (
                <CheckCircle2 className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQuestion3 = () => (
    <div className="space-y-8 py-6">
      {/* Header da pergunta */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Home className="w-8 h-8 text-white" />
          </div>
        </div>
        <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Onde prefere treinar?
        </h3>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Escolha o ambiente mais confortável para você
        </p>
      </div>

      {/* Opções melhoradas */}
      <div className="grid gap-4">
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            answers.location === 'casa_sem' 
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl scale-105' 
              : 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-950 dark:hover:to-red-950'
          }`}
          onClick={() => {
            handleAnswer('location', 'casa_sem');
            setTimeout(() => setStep('question4'), 300);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">🏠</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-1">Em casa (sem equipamento)</h4>
                <p className="text-sm opacity-90">Apenas você e seu peso corporal</p>
              </div>
              {answers.location === 'casa_sem' && (
                <CheckCircle2 className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
            answers.location === 'academia' 
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-2xl scale-105' 
              : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-950 dark:hover:to-purple-950'
          }`}
          onClick={() => {
            handleAnswer('location', 'academia');
            setTimeout(() => setStep('question4'), 300);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-2xl">🏋️</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold mb-1">Academia</h4>
                <p className="text-sm opacity-90">Tenho acesso a equipamentos completos</p>
              </div>
              {answers.location === 'academia' && (
                <CheckCircle2 className="w-6 h-6 text-white animate-pulse" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderQuestion4 = () => (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Qual é o seu objetivo principal?</h3>
        <p className="text-muted-foreground">Vamos focar no que é mais importante para você</p>
      </div>

      <div className="grid gap-3">
        <Button
          variant={answers.goal === 'condicionamento' ? 'default' : 'outline'}
          className="h-auto p-4 justify-start"
          onClick={() => {
            handleAnswer('goal', 'condicionamento');
            setTimeout(() => setStep('question5'), 300);
          }}
        >
          <Target className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">💪 Ganhar condicionamento</div>
            <p className="text-sm text-muted-foreground">Ter mais energia e disposição</p>
          </div>
        </Button>

        <Button
          variant={answers.goal === 'emagrecer' ? 'default' : 'outline'}
          className="h-auto p-4 justify-start"
          onClick={() => {
            handleAnswer('goal', 'emagrecer');
            setTimeout(() => setStep('question5'), 300);
          }}
        >
          <Target className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">🔥 Emagrecer</div>
            <p className="text-sm text-muted-foreground">Perder peso de forma saudável</p>
          </div>
        </Button>

        <Button
          variant={answers.goal === 'estresse' ? 'default' : 'outline'}
          className="h-auto p-4 justify-start"
          onClick={() => {
            handleAnswer('goal', 'estresse');
            setTimeout(() => setStep('question5'), 300);
          }}
        >
          <Target className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">🧘 Reduzir estresse</div>
            <p className="text-sm text-muted-foreground">Cuidar da saúde mental</p>
          </div>
        </Button>

        <Button
          variant={answers.goal === 'saude' ? 'default' : 'outline'}
          className="h-auto p-4 justify-start"
          onClick={() => {
            handleAnswer('goal', 'saude');
            setTimeout(() => setStep('question5'), 300);
          }}
        >
          <Heart className="w-5 h-5 mr-3" />
          <div className="text-left">
            <div className="font-semibold">❤️ Melhorar saúde</div>
            <p className="text-sm text-muted-foreground">Prevenir doenças e viver melhor</p>
          </div>
        </Button>
      </div>
    </div>
  );

  const renderQuestion5 = () => (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Tem alguma limitação?</h3>
        <p className="text-muted-foreground">Vamos adaptar os exercícios para você</p>
      </div>

      <div className="grid gap-3">
        <Button
          variant={answers.limitation === 'joelho' ? 'default' : 'outline'}
          className="h-auto p-4 justify-start"
          onClick={() => {
            handleAnswer('limitation', 'joelho');
            setTimeout(() => setStep('result'), 300);
          }}
        >
          <div className="text-left">
            <div className="font-semibold">🦵 Dor nos joelhos</div>
            <p className="text-sm text-muted-foreground">Vamos evitar impacto</p>
          </div>
        </Button>

        <Button
          variant={answers.limitation === 'costas' ? 'default' : 'outline'}
          className="h-auto p-4 justify-start"
          onClick={() => {
            handleAnswer('limitation', 'costas');
            setTimeout(() => setStep('result'), 300);
          }}
        >
          <div className="text-left">
            <div className="font-semibold">🔙 Dor nas costas</div>
            <p className="text-sm text-muted-foreground">Exercícios adaptados</p>
          </div>
        </Button>

        <Button
          variant={answers.limitation === 'cardiaco' ? 'default' : 'outline'}
          className="h-auto p-4 justify-start"
          onClick={() => {
            handleAnswer('limitation', 'cardiaco');
            setTimeout(() => setStep('result'), 300);
          }}
        >
          <div className="text-left">
            <div className="font-semibold">🏥 Problema cardíaco</div>
            <p className="text-sm text-muted-foreground">Intensidade controlada</p>
          </div>
        </Button>

        <Button
          variant={answers.limitation === 'nenhuma' ? 'default' : 'outline'}
          className="h-auto p-4 justify-start"
          onClick={() => {
            handleAnswer('limitation', 'nenhuma');
            setTimeout(() => setStep('result'), 300);
          }}
        >
          <CheckCircle2 className="w-5 h-5 mr-3 text-green-500" />
          <div className="text-left">
            <div className="font-semibold">✅ Nenhuma</div>
            <p className="text-sm text-muted-foreground">Estou pronto para começar!</p>
          </div>
        </Button>
      </div>
    </div>
  );

  const renderResult = () => {
    const recommendation = generateRecommendation();
    
    return (
      <div className="space-y-8 py-6">
        {/* Hero Section do resultado */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 flex items-center justify-center shadow-2xl animate-pulse">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                <Star className="w-5 h-5 text-yellow-800" />
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Seu Programa Personalizado!
            </h2>
            <p className="text-xl text-muted-foreground">Criado especialmente para você</p>
          </div>
        </div>

        {/* Card principal do programa */}
        <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 border-2 border-green-200 dark:border-green-800 shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-bold text-green-800 dark:text-green-200">{recommendation.title}</h3>
              <p className="text-xl text-green-700 dark:text-green-300">{recommendation.subtitle}</p>
            </div>

            {/* Métricas do programa */}
            <div className="grid grid-cols-3 gap-6 pt-6">
              <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                <div className="text-3xl font-bold text-green-600 mb-2">{recommendation.duration}</div>
                <div className="text-sm text-muted-foreground font-medium">Duração</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                <div className="text-3xl font-bold text-emerald-600 mb-2">{recommendation.frequency}</div>
                <div className="text-sm text-muted-foreground font-medium">Frequência</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-black/20 rounded-xl">
                <div className="text-3xl font-bold text-teal-600 mb-2">{recommendation.time}</div>
                <div className="text-sm text-muted-foreground font-medium">Por treino</div>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{recommendation.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Plano semanal melhorado */}
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

        {/* Botões de ação melhorados */}
        <div className="space-y-4 pt-6">
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white font-bold py-6 text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:scale-105"
            onClick={async () => {
              setSaving(true);
              
              // Parsear o weekPlan para adicionar estrutura detalhada
              const parsedWeekPlan = parseWeekPlan(recommendation.weekPlan);
              
              await saveProgram({
                ...recommendation,
                weekPlan: parsedWeekPlan,
                level: answers.level,
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
          {step === 'result' && renderResult()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
