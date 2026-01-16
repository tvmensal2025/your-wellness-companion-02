import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Download,
  Award,
  FileText,
  StickyNote,
} from "lucide-react";
import { Resource } from "./CourseCard";

/**
 * Props for MaterialModal component
 */
export interface MaterialModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Handler for open state change */
  onOpenChange: (open: boolean) => void;
  /** Array of resources to display */
  resources?: Resource[];
}

/**
 * MaterialModal - Modal for displaying downloadable materials
 * 
 * Features:
 * - List of downloadable resources
 * - File type indicators
 * - Download toast notifications
 * - Empty state handling
 * 
 * @example
 * ```tsx
 * <MaterialModal
 *   open={showMaterial}
 *   onOpenChange={setShowMaterial}
 *   resources={lesson.resources}
 * />
 * ```
 */
export const MaterialModal: React.FC<MaterialModalProps> = ({
  open,
  onOpenChange,
  resources,
}) => {
  const { toast } = useToast();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Material de Apoio
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-4">
          {resources?.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              onClick={() => {
                toast({
                  title: "Download iniciado",
                  description: `Baixando ${resource.title}...`,
                });
              }}
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{resource.title}</p>
                <p className="text-xs text-muted-foreground">{resource.type || 'Arquivo'}</p>
              </div>
              <Download className="h-4 w-4 text-muted-foreground" />
            </a>
          ))}
          {(!resources || resources.length === 0) && (
            <p className="text-center text-muted-foreground py-4">
              Nenhum material disponível para esta aula.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Props for QuizModal component
 */
export interface QuizModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Handler for open state change */
  onOpenChange: (open: boolean) => void;
  /** Title of the lesson for display */
  lessonTitle: string;
  /** Array of quiz questions */
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
  /** Current answers (keyed by question index) */
  answers: Record<number, number>;
  /** Handler for answer changes */
  onAnswerChange: (questionIndex: number, value: number) => void;
  /** Whether the quiz has been submitted */
  submitted: boolean;
  /** Current score after submission */
  score: number;
  /** Handler for quiz submission */
  onSubmit: () => void;
  /** Handler for retry */
  onRetry: () => void;
}

/**
 * QuizModal - Modal for quiz functionality
 * 
 * Features:
 * - Multiple choice questions
 * - Score calculation and display
 * - Pass/fail feedback
 * - Retry functionality
 * 
 * @example
 * ```tsx
 * <QuizModal
 *   open={showQuiz}
 *   onOpenChange={setShowQuiz}
 *   lessonTitle="Lesson 1"
 *   questions={quizQuestions}
 *   answers={userAnswers}
 *   onAnswerChange={handleAnswerChange}
 *   submitted={isSubmitted}
 *   score={quizScore}
 *   onSubmit={handleSubmit}
 *   onRetry={handleRetry}
 * />
 * ```
 */
export const QuizModal: React.FC<QuizModalProps> = ({
  open,
  onOpenChange,
  lessonTitle,
  questions,
  answers,
  onAnswerChange,
  submitted,
  score,
  onSubmit,
  onRetry,
}) => {
  const allAnswered = Object.keys(answers).length === questions.length;
  const passingScore = questions.length * 0.7;
  const passed = score >= passingScore;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Quiz: {lessonTitle}
          </DialogTitle>
        </DialogHeader>
        
        {!submitted ? (
          <div className="space-y-6 mt-4">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="bg-muted rounded-lg p-4">
                <p className="font-medium text-foreground mb-3">
                  {qIndex + 1}. {q.question}
                </p>
                <RadioGroup
                  value={answers[qIndex]?.toString()}
                  onValueChange={(value) => onAnswerChange(qIndex, parseInt(value))}
                >
                  {q.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center space-x-2 py-2">
                      <RadioGroupItem 
                        value={oIndex.toString()} 
                        id={`q${qIndex}-o${oIndex}`}
                        className="border-muted-foreground text-primary"
                      />
                      <Label 
                        htmlFor={`q${qIndex}-o${oIndex}`} 
                        className="text-muted-foreground cursor-pointer"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}
            
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={onSubmit}
              disabled={!allAnswered}
            >
              Enviar Respostas
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
              passed ? 'bg-primary/20' : 'bg-amber-500/20'
            }`}>
              <Award className={`h-10 w-10 ${passed ? 'text-primary' : 'text-amber-500'}`} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              {score} / {questions.length}
            </h3>
            <p className="text-muted-foreground mb-6">
              {passed 
                ? 'Parabéns! Você foi muito bem!' 
                : 'Continue estudando e tente novamente!'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button 
                variant="outline" 
                className="border-border text-foreground hover:bg-muted"
                onClick={onRetry}
              >
                Tentar Novamente
              </Button>
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onOpenChange(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Props for NotesModal component
 */
export interface NotesModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Handler for open state change */
  onOpenChange: (open: boolean) => void;
  /** Title of the lesson for display */
  lessonTitle: string;
  /** Current note content */
  note: string;
  /** Handler for note changes */
  onNoteChange: (note: string) => void;
  /** Handler for saving the note */
  onSave: () => void;
}

/**
 * NotesModal - Modal for lesson notes
 * 
 * Features:
 * - Text area for note input
 * - Save and cancel actions
 * - Lesson title display
 * 
 * @example
 * ```tsx
 * <NotesModal
 *   open={showNotes}
 *   onOpenChange={setShowNotes}
 *   lessonTitle="Lesson 1"
 *   note={currentNote}
 *   onNoteChange={setCurrentNote}
 *   onSave={handleSaveNote}
 * />
 * ```
 */
export const NotesModal: React.FC<NotesModalProps> = ({
  open,
  onOpenChange,
  lessonTitle,
  note,
  onNoteChange,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            Anotações: {lessonTitle}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Textarea
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Escreva suas anotações sobre esta aula..."
            className="min-h-[200px] bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none"
          />
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              className="border-border text-foreground hover:bg-muted"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={onSave}
            >
              Salvar Anotação
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default {
  MaterialModal,
  QuizModal,
  NotesModal,
};
