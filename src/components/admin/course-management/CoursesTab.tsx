import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Trash2, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty_level: string;
  duration_minutes: number;
  instructor_name: string;
  is_premium: boolean;
  is_published: boolean;
  thumbnail_url?: string;
  modules_count?: number;
  lessons_count?: number;
}

interface CoursesTabProps {
  courses: Course[];
  loading: boolean;
  onCreateCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onSelectCourse: (course: Course) => void;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
    case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'Iniciante';
    case 'intermediate': return 'Intermediário';
    case 'advanced': return 'Avançado';
    default: return difficulty;
  }
};

export const CoursesTab: React.FC<CoursesTabProps> = ({
  courses,
  loading,
  onCreateCourse,
  onEditCourse,
  onDeleteCourse,
  onSelectCourse
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">📚 Gestão de Cursos</h3>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={onCreateCourse}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro curso
            </p>
            <Button onClick={onCreateCourse}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Curso
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => onSelectCourse(course)}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold line-clamp-1">{course.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {course.description}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn("text-xs", getDifficultyColor(course.difficulty_level))}>
                      {getDifficultyLabel(course.difficulty_level)}
                    </Badge>
                    {course.is_premium && (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        Premium
                      </Badge>
                    )}
                    <Badge variant={course.is_published ? "default" : "secondary"}>
                      {course.is_published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.modules_count || 0} módulos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration_minutes || 0}min</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCourse(course);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCourse(course);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Tem certeza que deseja excluir este curso?')) {
                          onDeleteCourse(course.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
