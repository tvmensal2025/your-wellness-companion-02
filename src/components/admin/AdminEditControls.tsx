import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Upload, 
  Edit, 
  Trash2, 
  Video, 
  FileText, 
  Award, 
  BarChart3,
  Users,
  TrendingUp,
  Trophy,
  Play,
  Save,
  X
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  category: string;
  instructor_name: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail_url: string;
  video_url: string;
  is_completed: boolean;
}

interface AdminEditControlsProps {
  course?: Course;
  lesson?: Lesson;
  onSave: (data: any) => void;
  type: 'banner' | 'course' | 'lesson' | 'quiz';
}

export const AdminEditControls = ({ course, lesson, onSave, type }: AdminEditControlsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const handleSave = async () => {
    onSave(editData);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Skip admin logs for now to avoid build errors
    } catch (e) {
      // silencioso para não quebrar UX
      console.error('admin_logs insert failed', e);
    }
    setIsEditing(false);
    setEditData({});
  };

  if (type === 'banner') {
    return (
      <div className="absolute top-4 right-4 z-20">
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Edit className="h-4 w-4 mr-2" />
                Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Editar Banner</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Título do Banner</Label>
                  <Input 
                    placeholder="Ex: PLATAFORMA DOS SONHOS"
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="bg-muted border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Este título aparecerá sobre a imagem de fundo
                  </p>
                </div>
                <div>
                  <Label className="text-foreground">Subtítulo</Label>
                  <Input 
                    placeholder="Ex: Transforme sua vida com nossos cursos"
                    onChange={(e) => setEditData({...editData, subtitle: e.target.value})}
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <Label className="text-foreground">URL da Imagem do Banner</Label>
                  <Input 
                    placeholder="Cole o link da imagem aqui"
                    onChange={(e) => setEditData({...editData, banner_url: e.target.value})}
                    className="bg-muted border-border"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    📱 Mobile: <strong>750 x 500px</strong> | 💻 Desktop: <strong>1920 x 800px</strong>
                    <br />
                    💡 Use uma imagem SEM texto para melhor resultado
                  </p>
                </div>
                <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
            <Video className="h-4 w-4 mr-2" />
            Trocar Vídeo
          </Button>
        </div>
      </div>
    );
  }

  if (type === 'course') {
    return (
      <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
        <div className="flex flex-col gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Settings className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Editar Curso: {course?.title}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground">Título do Curso</Label>
                    <Input 
                      defaultValue={course?.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="bg-muted border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Descrição</Label>
                    <Textarea 
                      defaultValue={course?.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      className="bg-muted border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Categoria</Label>
                    <Input 
                      defaultValue={course?.category}
                      onChange={(e) => setEditData({...editData, category: e.target.value})}
                      className="bg-muted border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Instrutor</Label>
                    <Input 
                      defaultValue={course?.instructor_name}
                      onChange={(e) => setEditData({...editData, instructor: e.target.value})}
                      className="bg-muted border-border"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground">URL da Capa (Poster)</Label>
                    <Input 
                      placeholder="Cole o link da imagem aqui"
                      defaultValue={course?.thumbnail_url}
                      onChange={(e) => setEditData({...editData, thumbnail_url: e.target.value})}
                      className="bg-muted border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      📱 Mobile: <strong>400 x 600px</strong> | 💻 Desktop: <strong>600 x 900px</strong>
                    </p>
                  </div>
                  <div className="p-4 border border-border rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2 text-foreground">Estatísticas do Curso</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">👥 Alunos ativos:</span>
                        <span className="font-semibold text-foreground">1,247</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">📈 Progresso médio:</span>
                        <span className="font-semibold text-foreground">67%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">🏆 Certificados:</span>
                        <span className="font-semibold text-foreground">892</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover Curso
                </Button>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  if (type === 'lesson') {
    return (
      <div className="absolute top-4 right-4 z-20">
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Edit className="h-4 w-4 mr-2" />
                Editar Aula
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Editar Aula: {lesson?.title}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground">Título da Aula</Label>
                    <Input 
                      defaultValue={lesson?.title}
                      onChange={(e) => setEditData({...editData, title: e.target.value})}
                      className="bg-muted border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Descrição</Label>
                    <Textarea 
                      defaultValue={lesson?.description}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      className="bg-muted border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">URL do Vídeo</Label>
                    <Input 
                      defaultValue={lesson?.video_url}
                      onChange={(e) => setEditData({...editData, videoUrl: e.target.value})}
                      className="bg-muted border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">URL da Thumbnail</Label>
                    <Input 
                      placeholder="Cole o link da imagem aqui"
                      defaultValue={lesson?.thumbnail_url}
                      onChange={(e) => setEditData({...editData, thumbnail_url: e.target.value})}
                      className="bg-muted border-border"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      📱 Mobile: <strong>400 x 600px</strong> | 💻 Desktop: <strong>600 x 900px</strong>
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground">Duração (segundos)</Label>
                    <Input 
                      type="number"
                      defaultValue={lesson?.duration}
                      onChange={(e) => setEditData({...editData, duration: parseInt(e.target.value)})}
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label className="text-foreground">Aula Premium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch />
                    <Label className="text-foreground">Possui Quiz</Label>
                  </div>
                  <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                    <Award className="h-4 w-4 mr-2" />
                    Configurar Quiz
                  </Button>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Aula
                </Button>
                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
            <Video className="h-4 w-4 mr-2" />
            Trocar Vídeo
          </Button>
          
          <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white">
            <Award className="h-4 w-4 mr-2" />
            Quiz
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

// Componente para estatísticas em tempo real
export const AdminStatsPanel = () => {
  return (
    <Card className="fixed bottom-20 right-4 w-72 bg-card/95 backdrop-blur-lg border-border text-foreground z-40 shadow-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm text-foreground">
          <BarChart3 className="h-4 w-4 text-primary" />
          Estatísticas em Tempo Real
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2.5 pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Alunos ativos:</span>
          </div>
          <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">1,247</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Progresso médio:</span>
          </div>
          <Badge className="bg-green-500/20 text-green-500 border-green-500/30">67%</Badge>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-muted-foreground">Certificados:</span>
          </div>
          <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30">892</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para toggle entre módulos, cursos e aulas
export const AdminViewToggle = ({ 
  viewMode, 
  onToggle,
  onSave 
}: { 
  viewMode: 'courses' | 'modules' | 'lessons', 
  onToggle: (mode: 'courses' | 'modules' | 'lessons') => void,
  onSave?: (mode: 'courses' | 'modules' | 'lessons') => void
}) => {
  const handleChange = async (mode: 'courses' | 'modules' | 'lessons') => {
    onToggle(mode);
    
    // Salvar no banco de dados
    if (onSave) {
      onSave(mode);
    }
  };

  return (
    <Card className="bg-card/95 backdrop-blur-lg border-border text-foreground shadow-lg mb-4">
      <CardContent className="p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Label className="text-xs font-medium text-muted-foreground">Exibir para usuários:</Label>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={viewMode === 'courses' ? 'default' : 'outline'}
              onClick={() => handleChange('courses')}
              className={viewMode === 'courses' ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              📚 Cursos
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'modules' ? 'default' : 'outline'}
              onClick={() => handleChange('modules')}
              className={viewMode === 'modules' ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              📋 Módulos
            </Button>
            <Button 
              size="sm" 
              variant={viewMode === 'lessons' ? 'default' : 'outline'}
              onClick={() => handleChange('lessons')}
              className={viewMode === 'lessons' ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              🎬 Aulas
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 