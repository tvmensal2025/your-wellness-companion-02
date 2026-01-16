import React from 'react';
import { Button } from '@/components/ui/button';
import { BarChart3, BookOpen, List } from 'lucide-react';

interface Course {
  id: string;
  title: string;
}

interface Module {
  id: string;
  title: string;
}

interface BreadcrumbProps {
  selectedCourse: Course | null;
  selectedModule: Module | null;
  onNavigateToOverview: () => void;
  onNavigateToModules: () => void;
  onNavigateToLessons: () => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  selectedCourse,
  selectedModule,
  onNavigateToOverview,
  onNavigateToModules,
  onNavigateToLessons
}) => {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={onNavigateToOverview}
        className="hover:text-foreground"
      >
        <BarChart3 className="h-4 w-4 mr-1" />
        Visão Geral
      </Button>
      {selectedCourse && (
        <>
          <span>/</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateToModules}
            className="hover:text-foreground"
          >
            <BookOpen className="h-4 w-4 mr-1" />
            {selectedCourse.title}
          </Button>
        </>
      )}
      {selectedModule && (
        <>
          <span>/</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNavigateToLessons}
            className="hover:text-foreground"
          >
            <List className="h-4 w-4 mr-1" />
            {selectedModule.title}
          </Button>
        </>
      )}
    </div>
  );
};
