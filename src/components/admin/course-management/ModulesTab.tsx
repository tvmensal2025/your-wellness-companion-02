import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Eye, Trash2, BookMarked, Video, ArrowLeft } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  course_id: string;
  order_index: number;
  is_active: boolean;
  lessons_count?: number;
}

interface Course {
  id: string;
  title: string;
}

interface ModulesTabProps {
  modules: Module[];
  selectedCourse: Course | null;
  loading: boolean;
  onCreateModule: () => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (moduleId: string) => void;
  onSelectModule: (module: Module) => void;
  onBack: () => void;
}

export const ModulesTab: React.FC<ModulesTabProps> = ({
  modules,
  selectedCourse,
  loading,
  onCreateModule,
  onEditModule,
  onDeleteModule,
  onSelectModule,
  onBack
}) => {
  if (!selectedCourse) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Selecione um curso</h3>
          <p className="text-muted-foreground">
            Escolha um curso para visualizar seus módulos
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
          <h3 className="text-xl font-semibold">📚 Módulos de: {selectedCourse.title}</h3>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={onCreateModule}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Módulo
        </Button>
      </div>

      {modules.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum módulo cadastrado</h3>
            <p className="text-muted-foreground mb-4">
              Comece criando o primeiro módulo deste curso
            </p>
            <Button onClick={onCreateModule}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Módulo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {modules.map((module) => (
            <Card 
              key={module.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onSelectModule(module)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono">
                        #{module.order_index}
                      </Badge>
                      <div>
                        <h4 className="font-semibold">{module.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {module.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Video className="h-4 w-4" />
                      <span>{module.lessons_count || 0} aulas</span>
                    </div>

                    <Badge variant={module.is_active ? "default" : "secondary"}>
                      {module.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>

                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditModule(module);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectModule(module);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Tem certeza que deseja excluir este módulo?')) {
                            onDeleteModule(module.id);
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
