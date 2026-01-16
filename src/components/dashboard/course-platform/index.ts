/**
 * Course Platform Components
 * 
 * This module exports all sub-components for the Netflix-style course platform.
 * The original CoursePlatformNetflix.tsx (~1560 lines) has been refactored into
 * smaller, focused components for better maintainability.
 * 
 * Components:
 * - CourseHeader: Hero banner and admin controls
 * - CourseGrid: Grid display for courses, modules, and lessons
 * - CourseCard: Individual card for course, module, or lesson
 * - CoursePlayer: Video player view with lesson navigation and actions
 * - CourseProgress: Progress tracking and lesson list sidebar
 */

// CourseHeader - Hero banner and admin controls
export { CourseHeader } from './CourseHeader';
export type { 
  CourseHeaderProps, 
  DashboardSettings, 
  DashboardViewMode 
} from './CourseHeader';

// CourseCard - Individual card component for courses, modules, and lessons
export { CourseCard } from './CourseCard';
export type {
  CourseCardProps,
  CardVariant,
  Course,
  Module,
  Lesson,
  Resource,
  QuizQuestion,
  QuizData,
} from './CourseCard';

// CourseGrid - Grid layout for displaying courses, modules, or lessons
export { CourseGrid } from './CourseGrid';
export type { CourseGridProps } from './CourseGrid';

// CourseProgress - Progress tracking and lesson list sidebar
export { CourseProgress } from './CourseProgress';
export type { CourseProgressProps } from './CourseProgress';

// CoursePlayer - Video player view with lesson navigation and actions
export { CoursePlayer } from './CoursePlayer';
export type { CoursePlayerProps } from './CoursePlayer';
