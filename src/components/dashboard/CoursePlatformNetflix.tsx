/**
 * CoursePlatformNetflix - Netflix-style Course Platform
 * 
 * REFACTORED VERSION - This file now acts as a thin orchestrator that delegates
 * to smaller, focused sub-components.
 * 
 * Original file: 1,561 lines
 * Refactored: ~200 lines (orchestrator) + 7 focused components
 * 
 * Sub-components:
 * - CourseHeader: Hero banner and admin controls
 * - CourseGrid: Responsive grid for courses/modules/lessons
 * - CourseCard: Individual card component
 * - CoursePlayer: Video player view
 * - CourseProgress: Progress sidebar
 * - CoursePlayerModals: Quiz, Material, Notes modals
 * - useCourseData: Custom hook with all business logic
 */

import { User } from "@supabase/supabase-js";
import { useAdminMode } from "@/hooks/useAdminMode";
import { CourseHeader } from "./course-platform/CourseHeader";
import { CourseGrid } from "./course-platform/CourseGrid";
import { CoursePlayer } from "./course-platform/CoursePlayer";
import { useCourseData } from "./course-platform/hooks/useCourseData";

interface CoursePlatformNetflixProps {
  user: User | null;
}

/**
 * Main course platform component - Netflix-style interface
 * 
 * Features:
 * - Three view modes: home (catalog), course (lessons), player (video)
 * - Admin mode with edit controls
 * - Progress tracking and notes
 * - Quiz and material downloads
 * - Responsive design
 */
const CoursePlatformNetflix = ({ user }: CoursePlatformNetflixProps) => {
  // Admin mode hook
  const { isAdmin, adminModeEnabled, toggleAdminMode } = useAdminMode(user);
  
  // All course data and business logic
  const {
    currentView,
    dashboardViewMode,
    setDashboardViewMode,
    selectedCourse,
    selectedLesson,
    loading,
    dbCourses,
    dbModules,
    allLessons,
    bannerSettings,
    completedLessons,
    lessonNotes,
    handleCourseClick,
    handleModuleClick,
    handleDirectLessonClick,
    handleLessonClick,
    handleBackToHome,
    toggleLessonComplete,
    saveNote,
    handleSaveEdit,
    saveViewMode,
    getCourseProgress,
    getRemainingTime,
  } = useCourseData(user);

  // Format duration helper
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // HOME VIEW - Course catalog
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Header with banner and admin controls */}
        <CourseHeader
          isAdmin={isAdmin}
          adminModeEnabled={adminModeEnabled}
          toggleAdminMode={toggleAdminMode}
          dashboardViewMode={dashboardViewMode}
          setDashboardViewMode={setDashboardViewMode}
          saveViewMode={saveViewMode}
          bannerSettings={bannerSettings}
          onSaveBannerEdit={handleSaveEdit}
        />

        {/* Course/Module/Lesson grid */}
        <CourseGrid
          viewMode={dashboardViewMode}
          courses={dbCourses}
          modules={dbModules}
          lessons={allLessons}
          adminModeEnabled={adminModeEnabled}
          onCourseClick={handleCourseClick}
          onModuleClick={handleModuleClick}
          onLessonClick={handleDirectLessonClick}
          onAdminSave={handleSaveEdit}
          formatDuration={formatDuration}
        />
      </div>
    );
  }

  // PLAYER VIEW - Video player with lesson sidebar
  if (currentView === 'player' && selectedLesson && selectedCourse) {
    return (
      <CoursePlayer
        course={selectedCourse}
        selectedLesson={selectedLesson}
        completedLessons={completedLessons}
        lessonNotes={lessonNotes}
        isAdmin={isAdmin}
        adminModeEnabled={adminModeEnabled}
        onBackToHome={handleBackToHome}
        onLessonClick={handleLessonClick}
        onToggleLessonComplete={toggleLessonComplete}
        onSaveNote={saveNote}
        onAdminSave={handleSaveEdit}
        formatDuration={formatDuration}
      />
    );
  }

  // Fallback - should not reach here
  return null;
};

export default CoursePlatformNetflix;
