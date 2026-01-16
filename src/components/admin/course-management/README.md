# Course Management - Refactored

## Overview

This directory contains the refactored components extracted from `CourseManagementNew.tsx` (originally 1272 lines). The component has been split into smaller, focused components and hooks.

## Structure

```
course-management/
├── StatsCards.tsx           # Statistics dashboard cards
├── Breadcrumb.tsx           # Navigation breadcrumb component
├── OverviewTab.tsx          # Overview tab with quick actions
├── CoursesTab.tsx           # Courses listing and management
├── ModulesTab.tsx           # Modules listing and management
├── LessonsTab.tsx           # Lessons listing and management
├── hooks/
│   └── useCourseManagement.ts  # Main data fetching and state management hook
└── README.md                # This file
```

## Components

### StatsCards
Displays the statistics cards showing:
- Total Courses
- Total Modules
- Total Lessons
- Total Students

**Props:**
- `stats`: Stats object with counts

### Breadcrumb
Navigation breadcrumb showing the current location in the course hierarchy.

**Props:**
- `selectedCourse`: Currently selected course
- `selectedModule`: Currently selected module
- `onNavigateToOverview`: Callback for overview navigation
- `onNavigateToModules`: Callback for modules navigation
- `onNavigateToLessons`: Callback for lessons navigation

### OverviewTab
Overview dashboard with quick actions and statistics.

**Props:**
- `courses`: Array of courses
- `onCreateCourse`: Callback for creating a course
- `onCreateModule`: Callback for creating a module
- `onCreateLesson`: Callback for creating a lesson

### CoursesTab
Courses listing with grid layout and management actions.

**Props:**
- `courses`: Array of courses
- `loading`: Loading state
- `onCreateCourse`: Callback for creating a course
- `onEditCourse`: Callback for editing a course
- `onDeleteCourse`: Callback for deleting a course
- `onSelectCourse`: Callback for selecting a course

### ModulesTab
Modules listing for a selected course.

**Props:**
- `modules`: Array of modules
- `selectedCourse`: Currently selected course
- `loading`: Loading state
- `onCreateModule`: Callback for creating a module
- `onEditModule`: Callback for editing a module
- `onDeleteModule`: Callback for deleting a module
- `onSelectModule`: Callback for selecting a module
- `onBack`: Callback for going back

### LessonsTab
Lessons listing for a selected module.

**Props:**
- `lessons`: Array of lessons
- `selectedModule`: Currently selected module
- `loading`: Loading state
- `onCreateLesson`: Callback for creating a lesson
- `onEditLesson`: Callback for editing a lesson
- `onDeleteLesson`: Callback for deleting a lesson
- `onBack`: Callback for going back

## Hooks

### useCourseManagement
Main hook for managing course data and operations.

**Returns:**
- `courses`: Array of courses
- `modules`: Array of modules
- `lessons`: Array of lessons
- `loading`: Loading state
- `stats`: Statistics object
- `fetchStats()`: Function to refresh statistics
- `fetchCourses()`: Function to fetch courses
- `fetchModules(courseId)`: Function to fetch modules for a course
- `fetchLessons(moduleId)`: Function to fetch lessons for a module

## Usage

```tsx
import { useCourseManagement } from './hooks/useCourseManagement';
import { StatsCards } from './StatsCards';
import { Breadcrumb } from './Breadcrumb';

function CourseManagement() {
  const {
    courses,
    modules,
    lessons,
    loading,
    stats,
    fetchModules,
    fetchLessons
  } = useCourseManagement();

  return (
    <div>
      <StatsCards stats={stats} />
      <Breadcrumb
        selectedCourse={selectedCourse}
        selectedModule={selectedModule}
        onNavigateToOverview={() => {}}
        onNavigateToModules={() => {}}
        onNavigateToLessons={() => {}}
      />
      {/* Rest of the component */}
    </div>
  );
}
```

## Benefits

1. **Reduced Complexity**: Each component has a single responsibility
2. **Reusability**: Components can be used independently
3. **Testability**: Easier to test individual components
4. **Maintainability**: Smaller files are easier to understand and modify
5. **Performance**: Hook optimization with useCallback prevents unnecessary re-renders

## Requirements Satisfied

- ✅ Requirement 1.9: Divide CourseManagementNew into management components
- ✅ Component size < 500 lines per file
- ✅ Improved code organization
- ✅ Better separation of concerns

## Note

The original `CourseManagementNew.tsx` file remains intact. To use the refactored components, import them from this directory and integrate them into the main component gradually.
