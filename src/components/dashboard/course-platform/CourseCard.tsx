import { Play, BookOpen } from "lucide-react";
import { AdminEditControls } from "@/components/admin/AdminEditControls";

/**
 * Resource attached to a lesson
 */
export interface Resource {
  title: string;
  url: string;
  type?: string;
}

/**
 * Quiz question structure
 */
export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

/**
 * Quiz data containing questions
 */
export interface QuizData {
  questions: QuizQuestion[];
}

/**
 * Lesson within a course
 */
export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: number; // seconds for UI
  thumbnail_url?: string;
  video_url?: string;
  is_completed: boolean;
  resources?: Resource[];
  quiz_questions?: QuizData;
  course_id?: string;
  course_title?: string;
}

/**
 * Course structure
 */
export interface Course {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  category?: string;
  instructor_name?: string;
  lessons: Lesson[];
}

/**
 * Module structure
 */
export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index?: number;
}

/**
 * Card variant type
 */
export type CardVariant = 'course' | 'module' | 'lesson';

/**
 * Props for CourseCard component
 */
export interface CourseCardProps {
  /** The variant of card to render */
  variant: CardVariant;
  /** Course data (for course variant) */
  course?: Course;
  /** Module data (for module variant) */
  module?: Module;
  /** Lesson data (for lesson variant) */
  lesson?: Lesson;
  /** Parent course for module/lesson variants */
  parentCourse?: Course;
  /** Whether admin mode is enabled */
  adminModeEnabled?: boolean;
  /** Click handler */
  onClick: () => void;
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
 * CourseCard component - Renders a Netflix-style poster card for courses, modules, or lessons.
 * 
 * Features:
 * - Poster-style aspect ratio (2:3)
 * - Hover effects with scale and shadow
 * - Play button overlay on hover
 * - Info section that slides up on hover
 * - Admin edit controls when in admin mode
 * - Supports course, module, and lesson variants
 * 
 * @example
 * ```tsx
 * // Course card
 * <CourseCard
 *   variant="course"
 *   course={courseData}
 *   onClick={() => handleCourseClick(courseData)}
 *   adminModeEnabled={isAdmin}
 * />
 * 
 * // Lesson card
 * <CourseCard
 *   variant="lesson"
 *   lesson={lessonData}
 *   parentCourse={courseData}
 *   onClick={() => handleLessonClick(lessonData)}
 *   formatDuration={formatDuration}
 * />
 * ```
 */
export const CourseCard: React.FC<CourseCardProps> = ({
  variant,
  course,
  module,
  lesson,
  parentCourse,
  adminModeEnabled = false,
  onClick,
  onAdminSave,
  formatDuration = defaultFormatDuration,
}) => {
  // Determine what to render based on variant
  const renderCourseCard = () => {
    if (!course) return null;
    
    return (
      <div 
        className="group relative cursor-pointer"
        onClick={onClick}
      >
        {adminModeEnabled && onAdminSave && (
          <AdminEditControls 
            type="course" 
            course={course as Parameters<typeof AdminEditControls>[0]['course']}
            onSave={onAdminSave}
          />
        )}
        
        {/* Card Poster Style */}
        <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/10">
          {course.thumbnail_url ? (
            <img 
              src={course.thumbnail_url.replace('http://', 'https://')} 
              alt={course.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('bg-gradient-to-br', 'from-primary/30', 'to-primary/10');
              }}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <span className="text-4xl opacity-50">🎓</span>
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Icon on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="h-6 w-6 text-primary-foreground fill-primary-foreground ml-1" />
            </div>
          </div>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-xs font-semibold text-foreground line-clamp-2 drop-shadow-lg">
              {course.title}
            </h3>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Play className="h-2.5 w-2.5" />
              {course.lessons.length} aulas
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderModuleCard = () => {
    if (!module) return null;
    
    return (
      <div 
        className="group relative cursor-pointer"
        onClick={onClick}
      >
        {/* Card Poster Style */}
        <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/10">
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
            <span className="text-4xl opacity-50">📋</span>
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Icon on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="h-6 w-6 text-primary-foreground fill-primary-foreground ml-1" />
            </div>
          </div>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-xs font-semibold text-foreground line-clamp-2 drop-shadow-lg">
              {module.title}
            </h3>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-2.5 w-2.5" />
              {parentCourse?.title}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderLessonCard = () => {
    if (!lesson) return null;
    
    return (
      <div 
        className="group relative cursor-pointer"
        onClick={onClick}
      >
        {/* Card Poster Style */}
        <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-muted shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/10">
          {lesson.thumbnail_url && lesson.thumbnail_url !== '/placeholder.svg' ? (
            <img 
              src={lesson.thumbnail_url.replace('http://', 'https://')} 
              alt={lesson.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('bg-gradient-to-br', 'from-primary/30', 'to-primary/10');
              }}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
              <span className="text-4xl opacity-50">🎬</span>
            </div>
          )}
          
          {/* Duration Badge */}
          <div className="absolute top-2 right-2 bg-background/80 px-1.5 py-0.5 rounded text-[10px] text-foreground font-medium">
            {formatDuration(lesson.duration)}
          </div>
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play Icon on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center">
              <Play className="h-6 w-6 text-primary-foreground fill-primary-foreground ml-1" />
            </div>
          </div>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="text-xs font-semibold text-foreground line-clamp-2 drop-shadow-lg">
              {lesson.title}
            </h3>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <BookOpen className="h-2.5 w-2.5" />
              {lesson.course_title || parentCourse?.title}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Render based on variant
  switch (variant) {
    case 'course':
      return renderCourseCard();
    case 'module':
      return renderModuleCard();
    case 'lesson':
      return renderLessonCard();
    default:
      return null;
  }
};

export default CourseCard;
