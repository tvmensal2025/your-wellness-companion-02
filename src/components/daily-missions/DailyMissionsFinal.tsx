import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Trophy, Star, Sparkles } from 'lucide-react';
import { useDailyMissionsFinal } from '@/hooks/useDailyMissionsFinal';
import { getSectionTitleFinal } from '@/data/daily-questions-final';
import { DailyQuestion } from '@/types/daily-missions';
import { MissionCompletePage } from './MissionCompletePage';

interface DailyMissionsFinalProps {
  user: User | null;
}

export const DailyMissionsFinal: React.FC<DailyMissionsFinalProps> = ({ user }) => {
  const [textInput, setTextInput] = useState('');
  const {
    currentQuestion,
    currentQuestionIndex,
    progress,
    answers,
    isLoading,
    isCompleted,
    session,
    handleScaleAnswer,
    handleMultipleChoice,
    handleYesNo,
    handleTextInput,
    handleStarRating,
    goToPreviousQuestion,
    allQuestions
  } = useDailyMissionsFinal({ user });

  const renderQuestion = (question: DailyQuestion) => {
    // Verificação de segurança para evitar erros
    if (!question || !question.type) {
      console.error('Pergunta inválida:', question);
      return <div className="p-4 text-red-500">Erro: pergunta não encontrada</div>;
    }

    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {question.scale?.labels?.map((label, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <Button
                    variant={answers[question.id] === index + 1 ? "default" : "outline"}
                    className={`w-16 h-16 sm:w-20 sm:h-20 p-0 rounded-2xl transition-all duration-200 ${
                      answers[question.id] === index + 1 
                        ? 'bg-gradient-to-br from-primary to-emerald-600 text-white shadow-xl scale-110 border-0' 
                        : 'bg-white dark:bg-gray-800 hover:scale-105 hover:shadow-lg border-2 hover:border-primary/50'
                    }`}
                    onClick={() => handleScaleAnswer(index + 1)}
                    disabled={isLoading}
                  >
                    {question.scale?.emojis ? (
                      <span className="text-3xl sm:text-4xl">{question.scale.emojis[index]}</span>
                    ) : (
                      <span className="text-2xl sm:text-3xl font-bold">{index + 1}</span>
                    )}
                  </Button>
                  <span className={`text-base sm:text-lg flex-1 font-medium transition-colors ${
                    answers[question.id] === index + 1 ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'star_scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant={answers[question.id] === star ? "default" : "outline"}
                  className={`w-14 h-14 sm:w-16 sm:h-16 p-0 rounded-2xl transition-all duration-200 ${
                    answers[question.id] === star 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-xl scale-110 border-0' 
                      : 'bg-white dark:bg-gray-800 hover:scale-105 hover:shadow-lg border-2 hover:border-amber-400'
                  }`}
                  onClick={() => {
                    console.log(`Estrela ${star} clicada`);
                    handleStarRating(star);
                  }}
                  disabled={isLoading}
                >
                  <Star className={`h-6 w-6 sm:h-8 sm:w-8 ${answers[question.id] === star ? 'fill-current' : ''}`} />
                </Button>
              ))}
            </div>
            <p className="text-center text-base sm:text-lg text-muted-foreground">
              {question.scale?.labels && answers[question.id] 
                ? question.scale.labels[(answers[question.id] as number) - 1] 
                : 'Selecione uma avaliação'}
            </p>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant={answers[question.id] === option ? "default" : "outline"}
                className={`w-full justify-start text-left h-12 sm:h-14 text-sm sm:text-base font-medium transition-all duration-200 ${
                  answers[question.id] === option 
                    ? 'bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg scale-[1.02] border-0' 
                    : 'bg-white dark:bg-gray-800 hover:bg-primary/5 hover:border-primary/50 hover:scale-[1.01] border-2'
                }`}
                onClick={() => handleMultipleChoice(option)}
                disabled={isLoading}
              >
                {answers[question.id] === option && <CheckCircle className="mr-2 h-4 w-4 animate-scale-in" />}
                <span>{option}</span>
              </Button>
            ))}
          </div>
        );

      case 'yes_no':
        return (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={answers[question.id] === 'Sim' ? "default" : "outline"}
              className={`h-16 sm:h-20 text-lg font-bold transition-all duration-200 ${
                answers[question.id] === 'Sim' 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl scale-105 border-0' 
                  : 'bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 hover:border-green-400 hover:scale-105 border-2'
              }`}
              onClick={() => handleYesNo(true)}
              disabled={isLoading}
            >
              <div className="flex flex-col items-center gap-1">
                {answers[question.id] === 'Sim' && <CheckCircle className="h-6 w-6 animate-scale-in" />}
                <span>✓ Sim</span>
              </div>
            </Button>
            <Button
              variant={answers[question.id] === 'Não' ? "default" : "outline"}
              className={`h-16 sm:h-20 text-lg font-bold transition-all duration-200 ${
                answers[question.id] === 'Não' 
                  ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl scale-105 border-0' 
                  : 'bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-gray-700 hover:border-red-400 hover:scale-105 border-2'
              }`}
              onClick={() => handleYesNo(false)}
              disabled={isLoading}
            >
              <div className="flex flex-col items-center gap-1">
                {answers[question.id] === 'Não' && <CheckCircle className="h-6 w-6 animate-scale-in" />}
                <span>✗ Não</span>
              </div>
            </Button>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder={question.placeholder || "Digite sua resposta..."}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
            <Button
              onClick={() => {
                if (textInput.trim()) {
                  handleTextInput(textInput);
                  setTextInput('');
                }
              }}
              disabled={!textInput.trim() || isLoading}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-primary to-emerald-600"
            >
              <span className="text-base sm:text-lg">Continuar</span>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // Se já completou hoje
  if (isCompleted && session) {
    const totalPoints = session.total_points;

    return (
      <MissionCompletePage
        answers={answers}
        totalPoints={totalPoints}
        questions={allQuestions}
        onContinue={() => window.location.href = '/sofia-nutricional'}
        userId={user?.id}
        streakDays={session?.streak_days || 1}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-6 text-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 p-2 sm:p-3">
      <div className="max-w-2xl mx-auto">
        {/* Header Limpo */}
        <div className="text-center mb-3 sm:mb-4 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary to-teal-500 text-white px-3 py-1 rounded-full mb-2 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-medium text-xs">Missão do Dia</span>
          </div>
          
          <h1 className="text-xl sm:text-2xl font-bold mb-1 text-foreground px-2">
            Continue sua Jornada! 🌟
          </h1>
          
          <p className="text-sm text-muted-foreground mb-2">
            Pergunta <span className="font-bold text-primary">{currentQuestionIndex + 1}</span> de <span className="font-bold">{allQuestions.length}</span>
          </p>
          
          {/* Barra de Progresso Suave */}
          <div className="relative max-w-md mx-auto px-2">
            <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-teal-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs">
              <span className="text-muted-foreground">{progress.toFixed(0)}%</span>
              <span className="text-primary font-medium">{allQuestions.length - currentQuestionIndex} restantes</span>
            </div>
          </div>
        </div>

        {/* Card da Pergunta - Limpo */}
        <Card className="mb-3 border shadow-sm bg-white/80 backdrop-blur-sm animate-scale-in rounded-2xl">
          <CardHeader className="border-b border-muted/30 pb-3 px-4 sm:px-5">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <Badge className="bg-primary/10 text-primary border-0 px-2 py-0.5 text-xs font-medium rounded-full">
                {getSectionTitleFinal(currentQuestion.section)}
              </Badge>
              <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                <Trophy className="h-3 w-3" />
                <span className="text-xs font-semibold">{currentQuestion.points} pts</span>
              </div>
            </div>
            <CardTitle className="text-lg sm:text-xl font-semibold leading-snug text-foreground">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-4 pb-5 px-4 sm:px-5">
            {renderQuestion(currentQuestion)}
            
            {isLoading && (
              <div className="mt-3 flex items-center justify-center gap-2 text-primary animate-pulse">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="text-xs font-medium ml-1">Salvando...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navegação Simples */}
        <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm rounded-xl p-2 shadow-sm">
          <Button
            variant="ghost"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className="h-9 px-3 font-medium text-sm hover:bg-muted/50 rounded-lg"
          >
            ← Anterior
          </Button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full">
            <span className="text-xs font-semibold text-primary">
              {currentQuestionIndex + 1} / {allQuestions.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 