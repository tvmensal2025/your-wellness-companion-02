import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Trash2, Video, Clock, ArrowLeft } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string;
  module_id: string;
  order_index: number;
  duration_minutes: number;
  video_url?: string;
  is_free: boolean;
}

interface Module {
  id: string;
  title: string;
}

interface LessonsTabProps {
  lessons: Lesson[];
  selectedModule: Module | null;
  loading: boolean;
  onCreateLesson: () => void;
  onEditLesson: (lesson: Lesson) => void;
  onDeleteLesson: (lessonId: string) => void;
  onBack: () => void;
}

export const LessonsTab: React.FC<LessonsTabProps> = ({
  lessons,
  selectedModule,
  loading,
  onCreateLesson,
  onEditLesson,
  onDeleteLesson,
  onBack
}) => {
  if (!selectedModule) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Selecione um módulo</h3>
          <p className="text-muted-foreground">
            Escolha um módulo para visualizar suas aulas
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar
          </Button>
          <h3 className="text-xl font-semibold">🎥 Aulas de: {selectedModule.title}</h3>
        </div>
        <Button 
          className="bg-purple-600 hover:bg-purple-700"
          onClick={onCreateLesson}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Aula
        </Button>
      </div>

      {lessons.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma aula cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando a primeira aula deste módulo
            </p>
            <Button onClick={onCreateLesson}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeira Aula
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => (
            <Card 
              key={lesson.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        #{lesson.order_index}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {lesson.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{lesson.duration_minutes}min</span>
                    </div>

                    {lesson.video_url && (
                      <Badge variant="outline" className="bg-blue-50">
                        <Video className="h-3 w-3 mr-1" />
                        Vídeo
                      </Badge>
                    )}

                    <Badge variant={lesson.is_free ? "default" : "secondary"}>
                      {lesson.is_free ? 'Gratuita' : 'Premium'}
                    </Badge>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditLesson(lesson)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (lesson.video_url) {
                            window.open(lesson.video_url, '_blank');
                          }
                        }}
                        disabled={!lesson.video_url}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja excluir esta aula?')) {
                            onDeleteLesson(lesson.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
