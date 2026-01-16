import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, BookMarked, Video, Plus, BarChart3, Star } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  category: string;
  is_published: boolean;
  is_premium: boolean;
}

interface OverviewTabProps {
  courses: Course[];
  onCreateCourse: () => void;
  onCreateModule: () => void;
  onCreateLesson: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  courses,
  onCreateCourse,
  onCreateModule,
  onCreateLesson
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            className="w-full justify-start bg-blue-600 hover:bg-blue-700"
            onClick={onCreateCourse}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Curso
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={onCreateModule}
            disabled={courses.length === 0}
          >
            <BookMarked className="h-4 w-4 mr-2" />
            Novo Módulo
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={onCreateLesson}
            disabled={courses.length === 0}
          >
            <Video className="h-4 w-4 mr-2" />
            Nova Aula
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Estatísticas Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Cursos Publicados:</span>
              <span className="font-semibold">{courses.filter(c => c.is_published).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Rascunhos:</span>
              <span className="font-semibold">{courses.filter(c => !c.is_published).length}</span>
            </div>
            <div className="flex justify-between">
              <span>Cursos Premium:</span>
              <span className="font-semibold">{courses.filter(c => c.is_premium).length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Últimos Cursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {courses.slice(0, 3).map((course) => (
              <div key={course.id} className="text-sm">
                <div className="font-medium truncate">{course.title}</div>
                <div className="text-muted-foreground text-xs">{course.category}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
