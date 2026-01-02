import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Trophy, Star, Droplets, Moon } from 'lucide-react';
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
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl scale-110 border-0' 
                        : 'bg-white dark:bg-gray-800 hover:scale-105 hover:shadow-lg border-2 hover:border-purple-400'
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
                    answers[question.id] === index + 1 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-700 dark:text-gray-300'
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
                  className={`w-14 h-14 sm:w-16 sm:h-16 p-0 question-button ${
                    answers[question.id] === star ? 'question-button-purple' : 'question-button-outline'
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
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-[1.02] border-0' 
                    : 'bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700 hover:border-purple-300 hover:scale-[1.01] border-2'
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
                  ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl scale-105 border-0' 
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
              className="w-full question-button question-button-purple h-12 sm:h-14"
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-2 sm:p-3">
      <div className="max-w-3xl mx-auto">
        {/* Header com Design Premium */}
        <div className="text-center mb-3 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full mb-2 shadow-lg">
            <Trophy className="h-4 w-4" />
            <span className="font-semibold text-sm">Missão do Dia</span>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Continue sua Jornada
          </h1>
          
          <p className="text-base text-muted-foreground mb-2">
            Pergunta <span className="font-bold text-purple-600">{currentQuestionIndex + 1}</span> de <span className="font-bold">{allQuestions.length}</span>
          </p>
          
          {/* Barra de Progresso Premium */}
          <div className="relative">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="flex justify-between mt-1 text-xs font-medium">
              <span className="text-muted-foreground">{progress.toFixed(0)}% completo</span>
              <span className="text-purple-600">{allQuestions.length - currentQuestionIndex} restantes</span>
            </div>
          </div>
        </div>

        {/* Question Card Premium */}
        <Card className="mb-3 border-0 shadow-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm animate-scale-in">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 border-0 px-3 py-1 text-xs font-semibold">
                {getSectionTitleFinal(currentQuestion.section)}
              </Badge>
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full">
                <Trophy className="h-3 w-3" />
                <span className="text-xs font-bold">{currentQuestion.points} pontos</span>
              </div>
              {currentQuestion.tracking && (
                <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-0 text-xs">
                  📊 Tracking
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold leading-tight text-gray-900 dark:text-white">
              {currentQuestion.question}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-3 pb-4">
            {renderQuestion(currentQuestion)}
            
            {isLoading && (
              <div className="mt-3 flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400 animate-pulse">
                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                <span className="text-xs font-medium ml-1">Salvando resposta...</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Premium */}
        <div className="flex justify-between items-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            disabled={currentQuestionIndex === 0}
            className="h-10 px-4 font-semibold border-2 hover:scale-105 transition-all duration-200 text-sm"
          >
            ← Anterior
          </Button>
          
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
              {currentQuestionIndex + 1} / {allQuestions.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 