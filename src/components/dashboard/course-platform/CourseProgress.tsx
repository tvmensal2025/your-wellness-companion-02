import { Progress } from "@/components/ui/progress";
import { Timer, Check, BookOpen } from "lucide-react";
import { Course, Lesson } from "./CourseCard";

/**
 * Props for the CourseProgress component
 */
export interface CourseProgressProps {
  /** The current course being viewed */
  course: Course;
  /** Set of completed lesson IDs */
  completedLessons: Set<string>;
  /** The currently selected lesson (optional) */
  selectedLesson?: Lesson | null;
  /** Variant for display style */
  variant?: 'compact' | 'full' | 'sidebar';
  /** Handler for lesson click in sidebar variant */
  onLessonClick?: (lesson: Lesson) => void;
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
 * CourseProgress component - Displays course progress information
 * in various formats (compact, full, or sidebar with lesson list).
 * 
 * Features:
 * - Progress percentage calculation
 * - Remaining time estimation
 * - Visual progress bar
 * - Lesson list with completion status (sidebar variant)
 * - Responsive design for mobile and desktop
 * 
 * @example
 * ```tsx
 * // Compact progress bar (for header)
 * <CourseProgress
 *   course={courseData}
 *   completedLessons={completedSet}
 *   variant="compact"
 * />
 * 
 * // Full progress display
 * <CourseProgress
 *   course={courseData}
 *   completedLessons={completedSet}
 *   variant="full"
 * />
 * 
 * // Sidebar with lesson list
 * <CourseProgress
 *   course={courseData}
 *   completedLessons={completedSet}
 *   selectedLesson={currentLesson}
 *   variant="sidebar"
 *   onLessonClick={handleLessonClick}
 * />
 * ```
 */
export const CourseProgress: React.FC<CourseProgressProps> = ({
  course,
  completedLessons,
  selectedLesson,
  variant = 'compact',
  onLessonClick,
  formatDuration = defaultFormatDuration,
}) => {
  /**
   * Calculate course progress percentage
   */
  const getProgressPercentage = (): number => {
    if (!course || course.lessons.length === 0) return 0;
    const completed = course.lessons.filter(l => completedLessons.has(l.id)).length;
    return Math.round((completed / course.lessons.length) * 100);
  };

  /**
   * Calculate remaining time in seconds
   */
  const getRemainingTime = (): number => {
    if (!course) return 0;
    const remainingLessons = course.lessons.filter(l => !completedLessons.has(l.id));
    return remainingLessons.reduce((acc, l) => acc + l.duration, 0);
  };

  /**
   * Get completed lessons count
   */
  const getCompletedCount = (): number => {
    return course.lessons.filter(l => completedLessons.has(l.id)).length;
  };

  const progress = getProgressPercentage();
  const remainingTime = getRemainingTime();
  const completedCount = getCompletedCount();

  /**
   * Render compact variant - minimal progress display
   */
  const renderCompact = () => (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{progress}%</span>
      <Progress value={progress} className="h-1.5 w-24" />
      {remainingTime > 0 && (
        <span className="flex items-center gap-1">
          <Timer className="h-3 w-3" />
          {formatRemainingTime(remainingTime)}
        </span>
      )}
    </div>
  );

  /**
   * Render full variant - detailed progress display
   */
  const renderFull = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progresso do Curso</span>
        <span className="font-medium text-foreground">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Check className="h-3 w-3 text-primary" />
          {completedCount}/{course.lessons.length} aulas concluídas
        </span>
        {remainingTime > 0 && (
          <span className="flex items-center gap-1">
            <Timer className="h-3 w-3" />
            {formatRemainingTime(remainingTime)} restantes
          </span>
        )}
      </div>
    </div>
  );

  /**
   * Render sidebar variant - lesson list with progress
   */
  const renderSidebar = () => (
    <div className="w-full xl:w-72 shrink-0">
      <div className="sticky top-4">
        {/* Mobile Progress */}
        <div className="sm:hidden mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{progress}%</span>
          <Progress value={progress} className="h-1.5 flex-1" />
          {remainingTime > 0 && (
            <span>{formatRemainingTime(remainingTime)}</span>
          )}
        </div>
        
        {/* Section Title */}
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
          <BookOpen className="h-4 w-4 text-primary" />
          Aulas ({course.lessons.length})
        </h3>
        
        {/* Lesson List */}
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {course.lessons.map((lesson, index) => {
            const isActive = selectedLesson?.id === lesson.id;
            const isCompleted = completedLessons.has(lesson.id);
            
            return (
              <div 
                key={lesson.id}
                className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                  isActive 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-card/60 hover:bg-muted/80'
                }`}
                onClick={() => onLessonClick?.(lesson)}
              >
                {/* Number/Check Icon */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  isCompleted 
                    ? isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-primary/20 text-primary'
                    : isActive 
                      ? 'bg-primary-foreground/20 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                </div>
                
                {/* Lesson Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-medium truncate ${
                    isActive ? 'text-primary-foreground' : 'text-foreground'
                  }`}>
                    {lesson.title}
                  </h4>
                  <span className={`text-[10px] ${
                    isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  }`}>
                    {formatDuration(lesson.duration)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render based on variant
  switch (variant) {
    case 'compact':
      return renderCompact();
    case 'full':
      return renderFull();
    case 'sidebar':
      return renderSidebar();
    default:
      return renderCompact();
  }
};

export default CourseProgress;
