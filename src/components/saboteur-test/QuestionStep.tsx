import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Brain } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  category: string;
}

interface QuestionStepProps {
  question: Question;
  currentQuestion: number;
  totalQuestions: number;
  selectedAnswer: number | undefined;
  onAnswerChange: (value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
}

export const QuestionStep: React.FC<QuestionStepProps> = ({
  question,
  currentQuestion,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
  onNext,
  onPrevious,
  canGoNext
}) => {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Teste de Sabotadores Internos
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            Questão {currentQuestion + 1} de {totalQuestions}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{question.text}</h3>
          
          <RadioGroup
            value={selectedAnswer?.toString()}
            onValueChange={(value) => onAnswerChange(parseInt(value))}
            className="space-y-3"
          >
            {[
              { value: 1, label: 'Discordo totalmente' },
              { value: 2, label: 'Discordo' },
              { value: 3, label: 'Neutro' },
              { value: 4, label: 'Concordo' },
              { value: 5, label: 'Concordo totalmente' }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                <Label htmlFor={`option-${option.value}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <Button
            onClick={onNext}
            disabled={!canGoNext}
          >
            {currentQuestion === totalQuestions - 1 ? 'Finalizar' : 'Próxima'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
