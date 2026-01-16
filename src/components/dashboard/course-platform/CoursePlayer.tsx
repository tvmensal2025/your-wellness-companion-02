import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Play, 
  Clock, 
  ArrowLeft,
  Download,
  Award,
  FileText,
  Check,
  ChevronLeft,
  ChevronRight,
  StickyNote,
} from "lucide-react";
import { AdminEditControls, AdminStatsPanel } from "@/components/admin/AdminEditControls";
import { getVideoEmbedUrl, detectVideoProvider } from "@/utils/videoUrlParser";
import { Course, Lesson, Resource } from "./CourseCard";
import { CourseProgress } from "./CourseProgress";

/**
 * Props for the CoursePlayer component
 */
export interface CoursePlayerProps {
  /** The current course being viewed */
  course: Course;
  /** The currently selected lesson */
  selectedLesson: Lesson;
  /** Set of completed lesson IDs */
  completedLessons: Set<string>;
  /** Notes for each lesson (keyed by lesson ID) */
  lessonNotes: Record<string, string>;
  /** Whether the current user is an admin */
  isAdmin?: boolean;
  /** Whether admin mode is currently enabled */
  adminModeEnabled?: boolean;
  /** Handler for navigating back to home */
  onBackToHome: () => void;
  /** Handler for lesson click (navigation) */
  onLessonClick: (lesson: Lesson) => void;
  /** Handler for toggling lesson completion */
  onToggleLessonComplete: (lessonId: string) => void;
  /** Handler for saving notes */
  onSaveNote: (lessonId: string, note: string) => void;
  /** Handler for admin save actions */
  onAdminSave?: (data: Record<string, unknown>) => Promise<void>;
  /** Function to format duration in seconds to display string */
  formatDuration?: (seconds: number) => string;
}

/**
 * Default duration formatter
 */
const defaultFormatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format remaining time in a human-readable format
 */
const formatRemainingTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
};

/**
 * CoursePlayer component - Netflix-style video player view for lessons.
 * 
 * Features:
 * - Embedded video player (YouTube, Vimeo, OneDrive support)
 * - Lesson navigation (previous/next)
 * - Lesson completion tracking
 * - Notes functionality
 * - Material downloads
 * - Quiz functionality
 * - Progress sidebar with lesson list
 * - Admin edit controls
 * 
 * @example
 * ```tsx
 * <CoursePlayer
 *   course={courseData}
 *   selectedLesson={currentLesson}
 *   completedLessons={completedSet}
 *   lessonNotes={notesMap}
 *   onBackToHome={handleBackToHome}
 *   onLessonClick={handleLessonClick}
 *   onToggleLessonComplete={handleToggleComplete}
 *   onSaveNote={handleSaveNote}
 * />
 * ```
 */
export const CoursePlayer: React.FC<CoursePlayerProps> = ({
  course,
  selectedLesson,
  completedLessons,
  lessonNotes,
  isAdmin = false,
  adminModeEnabled = false,
  onBackToHome,
  onLessonClick,
  onToggleLessonComplete,
  onSaveNote,
  onAdminSave,
  formatDuration = defaultFormatDuration,
}) => {
  const { toast } = useToast();
  
  // Modal states
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  
  // Quiz states
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  // Notes state
  const [currentNote, setCurrentNote] = useState('');

  /**
   * Get current lesson index in the course
   */
  const getCurrentLessonIndex = (): number => {
    return course.lessons.findIndex(l => l.id === selectedLesson.id);
  };

  /**
   * Navigate to previous lesson
   */
  const goToPreviousLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex > 0) {
      onLessonClick(course.lessons[currentIndex - 1]);
    }
  };

  /**
   * Navigate to next lesson
   */
  const goToNextLesson = () => {
    const currentIndex = getCurrentLessonIndex();
    if (currentIndex < course.lessons.length - 1) {
      onLessonClick(course.lessons[currentIndex + 1]);
    }
  };

  /**
   * Check if there's a previous lesson
   */
  const hasPreviousLesson = (): boolean => getCurrentLessonIndex() > 0;

  /**
   * Check if there's a next lesson
   */
  const hasNextLesson = (): boolean => getCurrentLessonIndex() < course.lessons.length - 1;

  /**
   * Calculate course progress percentage
   */
  const getCourseProgress = (): number => {
    if (course.lessons.length === 0) return 0;
    const completed = course.lessons.filter(l => completedLessons.has(l.id)).length;
    return Math.round((completed / course.lessons.length) * 100);
  };

  /**
   * Calculate remaining time in seconds
   */
  const getRemainingTime = (): number => {
    const remainingLessons = course.lessons.filter(l => !completedLessons.has(l.id));
    return remainingLessons.reduce((acc, l) => acc + l.duration, 0);
  };

  /**
   * Handle saving notes
   */
  const handleSaveNote = () => {
    onSaveNote(selectedLesson.id, currentNote);
    setShowNotesModal(false);
    toast({
      title: "📝 Anotação salva!",
      description: "Suas anotações foram salvas com sucesso.",
    });
  };

  /**
   * Handle quiz submission
   */
  const handleQuizSubmit = () => {
    const questions = selectedLesson.quiz_questions?.questions || [];
    let correct = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[i] === q.correct) correct++;
    });
    setQuizScore(correct);
    setQuizSubmitted(true);
  };

  /**
   * Open notes modal with current note
   */
  const openNotesModal = () => {
    setCurrentNote(lessonNotes[selectedLesson.id] || '');
    setShowNotesModal(true);
  };

  /**
   * Open quiz modal and reset state
   */
  const openQuizModal = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
    setShowQuizModal(true);
  };

  const currentIndex = getCurrentLessonIndex();
  const progress = getCourseProgress();
  const remainingTime = getRemainingTime();
  const isLessonCompleted = completedLessons.has(selectedLesson.id);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Admin Controls */}
      {isAdmin && adminModeEnabled && (
        <>
          <AdminStatsPanel />
          <AdminEditControls 
            type="lesson" 
            lesson={selectedLesson as Parameters<typeof AdminEditControls>[0]['lesson']}
            onSave={onAdminSave}
          />
        </>
      )}

      {/* Compact Header */}
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBackToHome}
            className="text-muted-foreground hover:text-foreground hover:bg-muted -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          {/* Desktop Progress */}
          <div className="hidden sm:block">
            <CourseProgress
              course={course}
              completedLessons={completedLessons}
              variant="compact"
              formatDuration={formatDuration}
            />
          </div>
        </div>
      </div>

      {/* Player Layout */}
      <div className="px-4 sm:px-8 md:px-12 lg:px-16 pb-24">
        <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
          
          {/* Main Player */}
          <div className="flex-1">
            {/* Video Container */}
            <div className="relative rounded-xl overflow-hidden shadow-xl ring-1 ring-border">
              {(() => {
                const videoUrl = selectedLesson.video_url;
                const provider = detectVideoProvider(videoUrl);
                const embedUrl = getVideoEmbedUrl(videoUrl);
                const isOneDrive = provider.type === 'onedrive';
                
                return (
                  <>
                    <div className="relative w-full aspect-video bg-muted">
                      <iframe
                        src={embedUrl}
                        className="w-full h-full border-0"
                        title={selectedLesson.title}
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; web-share"
                      />
                    </div>
                    {isOneDrive && (
                      <div className="absolute bottom-3 right-3">
                        <Button
                          asChild
                          size="sm"
                          className="bg-primary/90 hover:bg-primary text-primary-foreground text-xs"
                        >
                          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                            <Play className="h-3 w-3 mr-1 fill-primary-foreground" />
                            OneDrive
                          </a>
                        </Button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            
            {/* Info + Actions */}
            <div className="mt-4">
              {/* Title and Navigation */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">
                    {selectedLesson.title}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <span className="text-primary font-medium">{course.title}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(selectedLesson.duration)}
                    </span>
                    <span>•</span>
                    <span>Aula {currentIndex + 1}/{course.lessons.length}</span>
                  </div>
                </div>
                
                {/* Compact Navigation */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToPreviousLesson}
                    disabled={!hasPreviousLesson()}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={goToNextLesson}
                    disabled={!hasNextLesson()}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Description */}
              {selectedLesson.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {selectedLesson.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Mark as Complete */}
                <Button 
                  variant={isLessonCompleted ? "default" : "outline"}
                  size="sm"
                  onClick={() => onToggleLessonComplete(selectedLesson.id)}
                  className={isLessonCompleted 
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground h-8 text-xs" 
                    : "border-border hover:bg-muted text-foreground h-8 text-xs"
                  }
                >
                  <Check className="h-3 w-3 mr-1" />
                  {isLessonCompleted ? 'Concluída' : 'Concluir'}
                </Button>
                
                {/* Notes */}
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-muted text-foreground h-8 text-xs"
                  onClick={openNotesModal}
                >
                  <StickyNote className="h-3 w-3 mr-1" />
                  Notas
                  {lessonNotes[selectedLesson.id] && (
                    <span className="ml-1 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </Button>
                
                {/* Material - Only if available */}
                {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted text-foreground h-8 text-xs"
                    onClick={() => setShowMaterialModal(true)}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Material ({selectedLesson.resources.length})
                  </Button>
                )}

                {/* Quiz - Only if available */}
                {selectedLesson.quiz_questions?.questions?.length > 0 && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-border hover:bg-muted text-foreground h-8 text-xs"
                    onClick={openQuizModal}
                  >
                    <Award className="h-3 w-3 mr-1" />
                    Quiz ({selectedLesson.quiz_questions.questions.length})
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Lesson List Sidebar */}
          <CourseProgress
            course={course}
            completedLessons={completedLessons}
            selectedLesson={selectedLesson}
            variant="sidebar"
            onLessonClick={onLessonClick}
            formatDuration={formatDuration}
          />
        </div>
      </div>

      {/* Material Modal */}
      <MaterialModal
        open={showMaterialModal}
        onOpenChange={setShowMaterialModal}
        resources={selectedLesson.resources}
      />

      {/* Quiz Modal */}
      <QuizModal
        open={showQuizModal}
        onOpenChange={setShowQuizModal}
        lessonTitle={selectedLesson.title}
        questions={selectedLesson.quiz_questions?.questions || []}
        answers={quizAnswers}
        onAnswerChange={(qIndex, value) => setQuizAnswers({...quizAnswers, [qIndex]: value})}
        submitted={quizSubmitted}
        score={quizScore}
        onSubmit={handleQuizSubmit}
        onRetry={() => {
          setQuizAnswers({});
          setQuizSubmitted(false);
        }}
      />

      {/* Notes Modal */}
      <NotesModal
        open={showNotesModal}
        onOpenChange={setShowNotesModal}
        lessonTitle={selectedLesson.title}
        note={currentNote}
        onNoteChange={setCurrentNote}
        onSave={handleSaveNote}
      />
    </div>
  );
};

/**
 * Props for MaterialModal component
 */
interface MaterialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resources?: Resource[];
}

/**
 * MaterialModal - Modal for displaying downloadable materials
 */
const MaterialModal: React.FC<MaterialModalProps> = ({
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
interface QuizModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonTitle: string;
  questions: Array<{
    question: string;
    options: string[];
    correct: number;
  }>;
  answers: Record<number, number>;
  onAnswerChange: (questionIndex: number, value: number) => void;
  submitted: boolean;
  score: number;
  onSubmit: () => void;
  onRetry: () => void;
}

/**
 * QuizModal - Modal for quiz functionality
 */
const QuizModal: React.FC<QuizModalProps> = ({
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
interface NotesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonTitle: string;
  note: string;
  onNoteChange: (note: string) => void;
  onSave: () => void;
}

/**
 * NotesModal - Modal for lesson notes
 */
const NotesModal: React.FC<NotesModalProps> = ({
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

export default CoursePlayer;
