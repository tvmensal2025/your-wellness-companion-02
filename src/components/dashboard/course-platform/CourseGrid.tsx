import { Badge } from "@/components/ui/badge";
import { Play, BookOpen } from "lucide-react";
import { CourseCard, Course, Module, Lesson } from "./CourseCard";
import { DashboardViewMode } from "./CourseHeader";

/**
 * Props for the CourseGrid component
 */
export interface CourseGridProps {
  /** Current view mode (courses, modules, or lessons) */
  viewMode: DashboardViewMode;
  /** Array of courses to display */
  courses: Course[];
  /** Array of modules to display */
  modules: Module[];
  /** Array of all lessons to display */
  lessons: Lesson[];
  /** Whether admin mode is enabled */
  adminModeEnabled?: boolean;
  /** Handler for course click */
  onCourseClick: (course: Course) => void;
  /** Handler for module click */
  onModuleClick: (module: Module) => void;
  /** Handler for lesson click */
  onLessonClick: (lesson: Lesson, courseId: string) => void;
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
 * CourseGrid component - Displays a responsive grid of courses, modules, or lessons
 * in a Netflix-style catalog layout.
 * 
 * Features:
 * - Responsive grid layout (2-6 columns based on screen size)
 * - Supports three view modes: courses, modules, lessons
 * - Section title with item count badge for admins
 * - Empty state handling for each view mode
 * - Delegates card rendering to CourseCard component
 * 
 * @example
 * ```tsx
 * <CourseGrid
 *   viewMode="courses"
 *   courses={coursesData}
 *   modules={modulesData}
 *   lessons={lessonsData}
 *   adminModeEnabled={isAdmin}
 *   onCourseClick={handleCourseClick}
 *   onModuleClick={handleModuleClick}
 *   onLessonClick={handleLessonClick}
 * />
 * ```
 */
export const CourseGrid: React.FC<CourseGridProps> = ({
  viewMode,
  courses,
  modules,
  lessons,
  adminModeEnabled = false,
  onCourseClick,
  onModuleClick,
  onLessonClick,
  onAdminSave,
  formatDuration = defaultFormatDuration,
}) => {
  /**
   * Get the section title based on view mode
   */
  const getSectionTitle = (): string => {
    switch (viewMode) {
      case 'courses':
        return 'Nossos Cursos';
      case 'modules':
        return 'Módulos Disponíveis';
      case 'lessons':
        return 'Todas as Aulas';
      default:
        return '';
    }
  };

  /**
   * Get the item count based on view mode
   */
  const getItemCount = (): number => {
    switch (viewMode) {
      case 'courses':
        return courses.length;
      case 'modules':
        return modules.length;
      case 'lessons':
        return lessons.length;
      default:
        return 0;
    }
  };

  /**
   * Get the count label based on view mode
   */
  const getCountLabel = (): string => {
    switch (viewMode) {
      case 'courses':
        return `${getItemCount()} cursos`;
      case 'modules':
        return `${getItemCount()} módulos`;
      case 'lessons':
        return `${getItemCount()} aulas`;
      default:
        return '';
    }
  };

  /**
   * Find parent course for a module
   */
  const findCourseForModule = (module: Module): Course | undefined => {
    return courses.find(c => c.id === module.course_id);
  };

  /**
   * Render courses grid
   */
  const renderCoursesGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          variant="course"
          course={course}
          adminModeEnabled={adminModeEnabled}
          onClick={() => onCourseClick(course)}
          onAdminSave={onAdminSave}
        />
      ))}
    </div>
  );

  /**
   * Render modules grid
   */
  const renderModulesGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {modules.map((module) => {
        const parentCourse = findCourseForModule(module);
        return (
          <CourseCard
            key={module.id}
            variant="module"
            module={module}
            parentCourse={parentCourse}
            onClick={() => onModuleClick(module)}
          />
        );
      })}
      
      {modules.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum módulo disponível</p>
        </div>
      )}
    </div>
  );

  /**
   * Render lessons grid
   */
  const renderLessonsGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {lessons.map((lesson) => (
        <CourseCard
          key={lesson.id}
          variant="lesson"
          lesson={lesson}
          onClick={() => onLessonClick(lesson, lesson.course_id || '')}
          formatDuration={formatDuration}
        />
      ))}
      
      {lessons.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhuma aula disponível</p>
        </div>
      )}
    </div>
  );

  /**
   * Render the appropriate grid based on view mode
   */
  const renderGrid = () => {
    switch (viewMode) {
      case 'courses':
        return renderCoursesGrid();
      case 'modules':
        return renderModulesGrid();
      case 'lessons':
        return renderLessonsGrid();
      default:
        return null;
    }
  };

  return (
    <div className="relative z-20 -mt-8 sm:-mt-12 px-4 sm:px-8 md:px-12 lg:px-16 pb-24">
      {/* Section Title */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
          {getSectionTitle()}
        </h2>
        {adminModeEnabled && (
          <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30">
            {getCountLabel()}
          </Badge>
        )}
      </div>

      {/* Grid Content */}
      {renderGrid()}
    </div>
  );
};

export default CourseGrid;
