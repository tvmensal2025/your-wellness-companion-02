/**
 * GenericSessionExecutor - Executa qualquer tipo de sessão
 * 
 * Este componente renderiza sessões de forma genérica, suportando:
 * - Perguntas de texto
 * - Perguntas de múltipla escolha
 * - Perguntas de escala (1-5, 1-10)
 * - Perguntas sim/não
 * - Vídeos
 * - Instruções
 */

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronRight, ChevronLeft, CheckCircle, Clock, 
  BookOpen, X, Play, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { SessionCompleteFactory, SessionResultData } from './results/SessionCompleteFactory';

interface Session {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimated_time: number;
  content: any;
}

interface UserSession {
  id: string;
  session_id: string;
  status: string;
  progress: number;
  sessions: Session;
}

interface GenericSessionExecutorProps {
  isOpen: boolean;
  onClose: () => void;
  userSession: UserSession;
  userId: string;
  userName?: string;
  onComplete?: () => void;
}

// Tipos de perguntas suportados
type QuestionType = 'text' | 'multiple_choice' | 'scale' | 'yes_no' | 'emoji' | 'instruction' | 'video';

interface ParsedQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  videoUrl?: string;
  instruction?: string;
}

// Parser de conteúdo de sessão
const parseSessionContent = (content: any, title: string): ParsedQuestion[] => {
  const questions: ParsedQuestion[] = [];
  
  // Se content é null ou undefined, criar perguntas padrão baseadas no título
  if (!content) {
    return generateDefaultQuestions(title);
  }

  // Se content é string, tentar parsear como JSON
  let parsedContent = content;
  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      // Se não é JSON válido, usar como instrução
      questions.push({
        id: 'instruction_1',
        type: 'instruction',
        text: content
      });
      return questions.length > 0 ? questions : generateDefaultQuestions(title);
    }
  }

  // Processar diferentes formatos de conteúdo
  
  // Formato: { questions: [...] }
  if (parsedContent.questions && Array.isArray(parsedContent.questions)) {
    parsedContent.questions.forEach((q: any, i: number) => {
      questions.push(parseQuestion(q, i));
    });
  }
  
  // Formato: { systems: {...} } (Roda da Saúde)
  else if (parsedContent.systems) {
    const systems = Array.isArray(parsedContent.systems) 
      ? parsedContent.systems 
      : Object.values(parsedContent.systems);
    
    systems.forEach((system: any, sysIndex: number) => {
      const systemQuestions = system.questions || [];
      systemQuestions.forEach((q: any, qIndex: number) => {
        const questionText = typeof q === 'string' ? q : q.text || q.question;
        questions.push({
          id: `system_${sysIndex}_q_${qIndex}`,
          type: 'yes_no',
          text: questionText || `Pergunta ${qIndex + 1}`
        });
      });
    });
  }
  
  // Formato: { areas: [...] } (Roda da Vida)
  else if (parsedContent.areas && Array.isArray(parsedContent.areas)) {
    parsedContent.areas.forEach((area: any, i: number) => {
      const questionText = typeof area.question === 'string' 
        ? area.question 
        : area.question?.text || `Como você avalia sua área de ${area.name}?`;
      
      questions.push({
        id: area.id || `area_${i}`,
        type: 'emoji',
        text: questionText,
        options: area.emoji_options?.map((opt: any) => `${opt.emoji} ${opt.label}`) || 
          ['😟 Muito baixa', '😕 Baixa', '😐 Média', '🙂 Boa', '😄 Excelente']
      });
    });
  }
  
  // Formato: { intro, tasks, conclusion } (Sessão estruturada)
  else if (parsedContent.intro || parsedContent.tasks) {
    if (parsedContent.intro) {
      questions.push({
        id: 'intro',
        type: 'instruction',
        text: parsedContent.intro
      });
    }
    
    if (parsedContent.video_url) {
      questions.push({
        id: 'video',
        type: 'video',
        text: 'Assista ao vídeo',
        videoUrl: parsedContent.video_url
      });
    }
    
    if (parsedContent.tasks && Array.isArray(parsedContent.tasks)) {
      parsedContent.tasks.forEach((task: any, i: number) => {
        questions.push({
          id: `task_${i}`,
          type: 'text',
          text: task.question || task.title || task.description || `Tarefa ${i + 1}`
        });
      });
    }
    
    if (parsedContent.conclusion) {
      questions.push({
        id: 'conclusion',
        type: 'instruction',
        text: parsedContent.conclusion
      });
    }
  }
  
  // Formato: { instructions, follow_up_questions }
  else if (parsedContent.instructions || parsedContent.follow_up_questions) {
    if (parsedContent.instructions) {
      questions.push({
        id: 'instructions',
        type: 'instruction',
        text: parsedContent.instructions
      });
    }
    
    if (parsedContent.follow_up_questions && Array.isArray(parsedContent.follow_up_questions)) {
      parsedContent.follow_up_questions.forEach((q: string, i: number) => {
        questions.push({
          id: `followup_${i}`,
          type: 'text',
          text: q
        });
      });
    }
  }

  // Se não conseguiu extrair perguntas, gerar padrão
  return questions.length > 0 ? questions : generateDefaultQuestions(title);
};

// Gerar perguntas padrão baseadas no título
const generateDefaultQuestions = (title: string): ParsedQuestion[] => {
  const titleLower = title.toLowerCase();
  
  // Perguntas padrão baseadas em palavras-chave do título
  const defaultQuestions: ParsedQuestion[] = [
    {
      id: 'intro',
      type: 'instruction',
      text: `Bem-vindo à sessão "${title}"! Vamos começar sua jornada de autoconhecimento. Responda às perguntas com sinceridade para obter os melhores insights.`
    }
  ];

  if (titleLower.includes('saúde') || titleLower.includes('saude') || titleLower.includes('health')) {
    defaultQuestions.push(
      { id: 'q1', type: 'scale', text: 'Como você avalia sua saúde geral hoje? (1-10)', scaleMin: 1, scaleMax: 10 },
      { id: 'q2', type: 'yes_no', text: 'Você praticou alguma atividade física esta semana?' },
      { id: 'q3', type: 'scale', text: 'Qual seu nível de energia hoje? (1-10)', scaleMin: 1, scaleMax: 10 },
      { id: 'q4', type: 'text', text: 'O que você poderia fazer para melhorar sua saúde?' }
    );
  } else if (titleLower.includes('sono') || titleLower.includes('sleep')) {
    defaultQuestions.push(
      { id: 'q1', type: 'scale', text: 'Como foi a qualidade do seu sono? (1-10)', scaleMin: 1, scaleMax: 10 },
      { id: 'q2', type: 'multiple_choice', text: 'Quantas horas você dormiu?', options: ['Menos de 5h', '5-6h', '6-7h', '7-8h', 'Mais de 8h'] },
      { id: 'q3', type: 'yes_no', text: 'Você acordou descansado?' },
      { id: 'q4', type: 'text', text: 'O que pode estar afetando seu sono?' }
    );
  } else if (titleLower.includes('alimenta') || titleLower.includes('nutri') || titleLower.includes('comida')) {
    defaultQuestions.push(
      { id: 'q1', type: 'scale', text: 'Como você avalia sua alimentação hoje? (1-10)', scaleMin: 1, scaleMax: 10 },
      { id: 'q2', type: 'yes_no', text: 'Você bebeu pelo menos 2 litros de água?' },
      { id: 'q3', type: 'multiple_choice', text: 'Quantas refeições você fez?', options: ['1-2', '3-4', '5-6', 'Mais de 6'] },
      { id: 'q4', type: 'text', text: 'O que você poderia melhorar na sua alimentação?' }
    );
  } else if (titleLower.includes('exercício') || titleLower.includes('atividade') || titleLower.includes('físic')) {
    defaultQuestions.push(
      { id: 'q1', type: 'yes_no', text: 'Você se exercitou hoje?' },
      { id: 'q2', type: 'multiple_choice', text: 'Que tipo de exercício você fez?', options: ['Caminhada', 'Corrida', 'Musculação', 'Yoga/Pilates', 'Outro', 'Nenhum'] },
      { id: 'q3', type: 'scale', text: 'Qual foi a intensidade? (1-10)', scaleMin: 1, scaleMax: 10 },
      { id: 'q4', type: 'text', text: 'Como você se sentiu após o exercício?' }
    );
  } else if (titleLower.includes('emocional') || titleLower.includes('mental') || titleLower.includes('humor')) {
    defaultQuestions.push(
      { id: 'q1', type: 'emoji', text: 'Como está seu humor hoje?', options: ['😢 Muito triste', '😔 Triste', '😐 Neutro', '🙂 Bem', '😄 Muito bem'] },
      { id: 'q2', type: 'scale', text: 'Qual seu nível de estresse? (1-10)', scaleMin: 1, scaleMax: 10 },
      { id: 'q3', type: 'yes_no', text: 'Você teve momentos de ansiedade hoje?' },
      { id: 'q4', type: 'text', text: 'O que te fez sentir bem hoje?' }
    );
  } else {
    // Perguntas genéricas
    defaultQuestions.push(
      { id: 'q1', type: 'emoji', text: 'Como você está se sentindo agora?', options: ['😟 Mal', '😕 Regular', '😐 Ok', '🙂 Bem', '😄 Ótimo'] },
      { id: 'q2', type: 'scale', text: 'Qual seu nível de motivação? (1-10)', scaleMin: 1, scaleMax: 10 },
      { id: 'q3', type: 'text', text: 'O que você espera alcançar com esta sessão?' },
      { id: 'q4', type: 'text', text: 'Qual é seu maior desafio atualmente?' }
    );
  }

  defaultQuestions.push({
    id: 'conclusion',
    type: 'instruction',
    text: '🎉 Parabéns por completar esta sessão! Suas respostas foram registradas e você receberá uma análise personalizada.'
  });

  return defaultQuestions;
};

// Parser de pergunta individual
const parseQuestion = (q: any, index: number): ParsedQuestion => {
  if (typeof q === 'string') {
    return { id: `q_${index}`, type: 'text', text: q };
  }
  
  const questionText = q.text || q.question || q.title || `Pergunta ${index + 1}`;
  const questionType = q.type || 'text';
  
  return {
    id: q.id || `q_${index}`,
    type: questionType as QuestionType,
    text: questionText,
    options: q.options || q.choices,
    scaleMin: q.scaleMin || q.min || 1,
    scaleMax: q.scaleMax || q.max || 10,
    videoUrl: q.videoUrl || q.video_url,
    instruction: q.instruction
  };
};

export const GenericSessionExecutor: React.FC<GenericSessionExecutorProps> = ({
  isOpen,
  onClose,
  userSession,
  userId,
  userName,
  onComplete
}) => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parsear perguntas do conteúdo da sessão
  const questions = useMemo(() => {
    return parseSessionContent(
      userSession.sessions.content, 
      userSession.sessions.title
    );
  }, [userSession.sessions.content, userSession.sessions.title]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  // Verificar se pode avançar
  const canProceed = () => {
    if (!currentQuestion) return false;
    if (currentQuestion.type === 'instruction' || currentQuestion.type === 'video') return true;
    return responses[currentQuestion.id] !== undefined && responses[currentQuestion.id] !== '';
  };

  // Salvar resposta
  const handleResponse = (value: any) => {
    if (!currentQuestion) return;
    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  // Avançar para próxima pergunta
  const handleNext = async () => {
    if (isLastQuestion) {
      await completeSession();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  // Voltar para pergunta anterior
  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Completar sessão
  const completeSession = async () => {
    setIsSubmitting(true);
    try {
      // Atualizar status da sessão
      await supabase
        .from('user_sessions')
        .update({
          status: 'completed',
          progress: 100,
          completed_at: new Date().toISOString()
        })
        .eq('id', userSession.id);

      // Salvar respostas
      const today = new Date().toISOString().split('T')[0];
      for (const [questionId, answer] of Object.entries(responses)) {
        await supabase
          .from('daily_responses')
          .insert({
            user_id: userId,
            date: today,
            section: userSession.sessions.type || 'generic_session',
            question_id: `${userSession.session_id}_${questionId}`,
            answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
            text_response: JSON.stringify({ questionId, answer }),
            points_earned: 10
          });
      }

      setIsCompleted(true);
      toast({
        title: "🎉 Sessão Completa!",
        description: "Suas respostas foram salvas com sucesso."
      });
    } catch (error) {
      console.error('Erro ao completar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar suas respostas.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fechar e notificar
  const handleClose = () => {
    if (isCompleted && onComplete) {
      onComplete();
    }
    onClose();
  };

  // Renderizar input baseado no tipo de pergunta
  const renderQuestionInput = () => {
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'instruction':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg text-foreground leading-relaxed whitespace-pre-wrap">
              {currentQuestion.text}
            </p>
          </motion.div>
        );

      case 'video':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="aspect-video rounded-xl overflow-hidden bg-black">
              {currentQuestion.videoUrl ? (
                <iframe
                  src={currentQuestion.videoUrl}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Play className="w-12 h-12" />
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'text':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Textarea
              value={responses[currentQuestion.id] || ''}
              onChange={(e) => handleResponse(e.target.value)}
              placeholder="Digite sua resposta..."
              className="min-h-[120px] text-base"
            />
          </motion.div>
        );

      case 'multiple_choice':
      case 'emoji':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {currentQuestion.options?.map((option, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleResponse(option)}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all",
                  "border-2 hover:border-primary/50",
                  responses[currentQuestion.id] === option
                    ? "border-primary bg-primary/10"
                    : "border-border bg-card"
                )}
              >
                <span className="text-base">{option}</span>
              </motion.button>
            ))}
          </motion.div>
        );

      case 'scale':
        const min = currentQuestion.scaleMin || 1;
        const max = currentQuestion.scaleMax || 10;
        const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Baixo</span>
              <span>Alto</span>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {values.map((value) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleResponse(value)}
                  className={cn(
                    "w-10 h-10 rounded-full font-bold transition-all",
                    responses[currentQuestion.id] === value
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  )}
                >
                  {value}
                </motion.button>
              ))}
            </div>
          </motion.div>
        );

      case 'yes_no':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleResponse('Sim')}
              className={cn(
                "flex-1 max-w-[150px] p-4 rounded-xl flex flex-col items-center gap-2 transition-all",
                "border-2",
                responses[currentQuestion.id] === 'Sim'
                  ? "border-green-500 bg-green-500/10"
                  : "border-border hover:border-green-500/50"
              )}
            >
              <ThumbsUp className="w-8 h-8 text-green-500" />
              <span className="font-medium">Sim</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleResponse('Não')}
              className={cn(
                "flex-1 max-w-[150px] p-4 rounded-xl flex flex-col items-center gap-2 transition-all",
                "border-2",
                responses[currentQuestion.id] === 'Não'
                  ? "border-red-500 bg-red-500/10"
                  : "border-border hover:border-red-500/50"
              )}
            >
              <ThumbsDown className="w-8 h-8 text-red-500" />
              <span className="font-medium">Não</span>
            </motion.button>
          </motion.div>
        );

      default:
        return (
          <Textarea
            value={responses[currentQuestion.id] || ''}
            onChange={(e) => handleResponse(e.target.value)}
            placeholder="Digite sua resposta..."
            className="min-h-[120px]"
          />
        );
    }
  };

  // Se completou, mostrar resultados
  if (isCompleted) {
    const resultData: SessionResultData = {
      sessionId: userSession.session_id,
      sessionTitle: userSession.sessions.title,
      sessionType: userSession.sessions.type || 'generic',
      userId,
      userName,
      responses,
      completedAt: new Date().toISOString(),
      totalPoints: Object.keys(responses).length * 10
    };

    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
          <SessionCompleteFactory
            data={resultData}
            onContinue={handleClose}
            showWhatsAppShare={true}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DialogHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg line-clamp-1">
                  {userSession.sessions.title}
                </DialogTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{userSession.sessions.estimated_time || 15} min</span>
                  <span>•</span>
                  <span>{currentIndex + 1} de {questions.length}</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress */}
          <Progress value={progress} className="h-2 mt-3" />
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 px-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Question */}
              {currentQuestion && currentQuestion.type !== 'instruction' && currentQuestion.type !== 'video' && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {currentQuestion.text}
                  </h3>
                </div>
              )}

              {/* Input */}
              {renderQuestionInput()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentIndex === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              'Salvando...'
            ) : isLastQuestion ? (
              <>
                Concluir
                <CheckCircle className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                Próximo
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GenericSessionExecutor;
