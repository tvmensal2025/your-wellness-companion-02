import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { 
  Dumbbell, Plus, Edit, Trash2, Search, Home, Building2, 
  Play, ExternalLink, Youtube, Save, X, Eye, GripVertical
} from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description: string | null;
  location: 'casa' | 'academia' | 'ambos';
  difficulty: 'facil' | 'medio' | 'dificil';
  muscle_group: string | null;
  equipment_needed: string[] | null;
  youtube_url: string | null;
  image_url: string | null;
  instructions: string[] | null;
  tips: string | null;
  sets: string | null;
  reps: string | null;
  rest_time: string | null;
  is_active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

type LocationType = 'casa' | 'academia' | 'ambos';
type DifficultyType = 'facil' | 'medio' | 'dificil';

interface FormData {
  name: string;
  description: string;
  location: LocationType;
  difficulty: DifficultyType;
  muscle_group: string;
  equipment_needed: string;
  youtube_url: string;
  image_url: string;
  instructions: string;
  tips: string;
  sets: string;
  reps: string;
  rest_time: string;
  is_active: boolean;
}

const defaultFormData: FormData = {
  name: '',
  description: '',
  location: 'casa',
  difficulty: 'medio',
  muscle_group: '',
  equipment_needed: '',
  youtube_url: '',
  image_url: '',
  instructions: '',
  tips: '',
  sets: '3-4',
  reps: '10-12',
  rest_time: '60s',
  is_active: true,
};

export const ExerciseLibraryManagement = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'casa' | 'academia'>('casa');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState(defaultFormData);
  const { toast } = useToast();

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .order('order_index')
        .order('name');

      if (error) throw error;
      setExercises((data as Exercise[]) || []);
    } catch (error) {
      console.error('Error fetching exercises:', error);
      toast({
        title: 'Erro ao carregar exercícios',
        description: 'Tente novamente mais tarde',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (saving) return;
    setSaving(true);

    try {
      const equipmentArray = formData.equipment_needed
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      const instructionsArray = formData.instructions
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean);

      const exerciseData = {
        name: formData.name,
        description: formData.description || null,
        location: formData.location,
        difficulty: formData.difficulty,
        muscle_group: formData.muscle_group || null,
        equipment_needed: equipmentArray.length > 0 ? equipmentArray : null,
        youtube_url: formData.youtube_url || null,
        image_url: formData.image_url || null,
        instructions: instructionsArray.length > 0 ? instructionsArray : null,
        tips: formData.tips || null,
        sets: formData.sets || null,
        reps: formData.reps || null,
        rest_time: formData.rest_time || null,
        is_active: formData.is_active,
      };

      if (editingExercise) {
        const { error } = await supabase
          .from('exercises_library')
          .update(exerciseData)
          .eq('id', editingExercise.id);

        if (error) throw error;
        toast({ title: 'Exercício atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('exercises_library')
          .insert([exerciseData]);

        if (error) throw error;
        toast({ title: 'Exercício criado com sucesso!' });
      }

      setIsModalOpen(false);
      resetForm();
      await fetchExercises();
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o exercício',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description || '',
      location: exercise.location,
      difficulty: exercise.difficulty,
      muscle_group: exercise.muscle_group || '',
      equipment_needed: exercise.equipment_needed?.join(', ') || '',
      youtube_url: exercise.youtube_url || '',
      image_url: exercise.image_url || '',
      instructions: exercise.instructions?.join('\n') || '',
      tips: exercise.tips || '',
      sets: exercise.sets || '3-4',
      reps: exercise.reps || '10-12',
      rest_time: exercise.rest_time || '60s',
      is_active: exercise.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este exercício?')) return;

    try {
      const { error } = await supabase
        .from('exercises_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Exercício deletado com sucesso!' });
      fetchExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      toast({
        title: 'Erro ao deletar',
        description: 'Não foi possível deletar o exercício',
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (exercise: Exercise) => {
    try {
      const { error } = await supabase
        .from('exercises_library')
        .update({ is_active: !exercise.is_active })
        .eq('id', exercise.id);

      if (error) throw error;
      toast({ 
        title: exercise.is_active ? 'Exercício desativado' : 'Exercício ativado' 
      });
      fetchExercises();
    } catch (error) {
      console.error('Error toggling exercise:', error);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingExercise(null);
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ex.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ex.muscle_group?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = activeTab === 'casa' 
      ? (ex.location === 'casa' || ex.location === 'ambos')
      : (ex.location === 'academia' || ex.location === 'ambos');
    return matchesSearch && matchesLocation;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'medio': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'dificil': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMuscleGroupColor = (group: string) => {
    const colors: Record<string, string> = {
      'Pernas': 'bg-blue-500/10 text-blue-600',
      'Peito': 'bg-red-500/10 text-red-600',
      'Costas': 'bg-purple-500/10 text-purple-600',
      'Ombros': 'bg-orange-500/10 text-orange-600',
      'Bíceps': 'bg-pink-500/10 text-pink-600',
      'Tríceps': 'bg-indigo-500/10 text-indigo-600',
      'Panturrilha': 'bg-teal-500/10 text-teal-600',
    };
    return colors[group] || 'bg-muted text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            Biblioteca de Exercícios
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie todos os exercícios com vídeos do YouTube
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Home className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {exercises.filter(e => e.location === 'casa' || e.location === 'ambos').length}
                </p>
                <p className="text-xs text-muted-foreground">Em Casa</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {exercises.filter(e => e.location === 'academia' || e.location === 'ambos').length}
                </p>
                <p className="text-xs text-muted-foreground">Academia</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Youtube className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {exercises.filter(e => e.youtube_url).length}
                </p>
                <p className="text-xs text-muted-foreground">Com Vídeo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Dumbbell className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {exercises.filter(e => e.is_active).length}
                </p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'casa' | 'academia')}>
              <TabsList>
                <TabsTrigger value="casa" className="gap-2">
                  <Home className="h-4 w-4" />
                  Em Casa ({exercises.filter(e => e.location === 'casa' || e.location === 'ambos').length})
                </TabsTrigger>
                <TabsTrigger value="academia" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Academia ({exercises.filter(e => e.location === 'academia' || e.location === 'ambos').length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar exercícios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <Card 
            key={exercise.id} 
            className={`hover:shadow-lg transition-all ${!exercise.is_active ? 'opacity-50' : ''}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{exercise.name}</CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {exercise.description}
                  </p>
                </div>
                <Switch
                  checked={exercise.is_active}
                  onCheckedChange={() => toggleActive(exercise)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Preview */}
              {exercise.youtube_url && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group">
                  <iframe
                    src={getYoutubeEmbedUrl(exercise.youtube_url) || ''}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
                {exercise.muscle_group && (
                  <Badge variant="secondary" className={getMuscleGroupColor(exercise.muscle_group)}>
                    {exercise.muscle_group}
                  </Badge>
                )}
                {exercise.location === 'ambos' && (
                  <Badge variant="outline" className="gap-1">
                    <Home className="h-3 w-3" />
                    <Building2 className="h-3 w-3" />
                  </Badge>
                )}
              </div>

              {/* Sets/Reps/Rest */}
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-semibold text-xs text-muted-foreground">Séries</div>
                  <div className="font-bold">{exercise.sets || '-'}</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-semibold text-xs text-muted-foreground">Reps</div>
                  <div className="font-bold">{exercise.reps || '-'}</div>
                </div>
                <div className="text-center p-2 bg-muted/50 rounded">
                  <div className="font-semibold text-xs text-muted-foreground">Descanso</div>
                  <div className="font-bold">{exercise.rest_time || '-'}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(exercise)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                {exercise.youtube_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(exercise.youtube_url!, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(exercise.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Tente uma busca diferente' : 'Comece adicionando seu primeiro exercício'}
            </p>
            <Button onClick={() => { resetForm(); setIsModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Exercício
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal de Criar/Editar */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do exercício. O vídeo do YouTube será incorporado automaticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome e Local */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Exercício *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Agachamento na cadeira"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value: 'casa' | 'academia' | 'ambos') => 
                    setFormData(prev => ({ ...prev, location: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">
                      <span className="flex items-center gap-2">
                        <Home className="h-4 w-4" /> Em Casa
                      </span>
                    </SelectItem>
                    <SelectItem value="academia">
                      <span className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" /> Academia
                      </span>
                    </SelectItem>
                    <SelectItem value="ambos">
                      <span className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        <Building2 className="h-4 w-4" /> Ambos
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição do exercício"
              />
            </div>

            {/* YouTube URL */}
            <div className="space-y-2">
              <Label htmlFor="youtube_url" className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-600" />
                URL do Vídeo (YouTube)
              </Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => setFormData(prev => ({ ...prev, youtube_url: e.target.value }))}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {formData.youtube_url && getYoutubeEmbedUrl(formData.youtube_url) && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden mt-2">
                  <iframe
                    src={getYoutubeEmbedUrl(formData.youtube_url) || ''}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            {/* Dificuldade e Grupo Muscular */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: 'facil' | 'medio' | 'dificil') => 
                    setFormData(prev => ({ ...prev, difficulty: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="facil">Fácil</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="dificil">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="muscle_group">Grupo Muscular</Label>
                <Select
                  value={formData.muscle_group || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, muscle_group: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pernas">Pernas</SelectItem>
                    <SelectItem value="Peito">Peito</SelectItem>
                    <SelectItem value="Costas">Costas</SelectItem>
                    <SelectItem value="Ombros">Ombros</SelectItem>
                    <SelectItem value="Bíceps">Bíceps</SelectItem>
                    <SelectItem value="Tríceps">Tríceps</SelectItem>
                    <SelectItem value="Panturrilha">Panturrilha</SelectItem>
                    <SelectItem value="Core">Core/Abdômen</SelectItem>
                    <SelectItem value="Full Body">Full Body</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sets, Reps, Rest */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets">Séries</Label>
                <Input
                  id="sets"
                  value={formData.sets}
                  onChange={(e) => setFormData(prev => ({ ...prev, sets: e.target.value }))}
                  placeholder="3-4"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps">Repetições</Label>
                <Input
                  id="reps"
                  value={formData.reps}
                  onChange={(e) => setFormData(prev => ({ ...prev, reps: e.target.value }))}
                  placeholder="10-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rest_time">Descanso</Label>
                <Input
                  id="rest_time"
                  value={formData.rest_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, rest_time: e.target.value }))}
                  placeholder="60s"
                />
              </div>
            </div>

            {/* Instruções */}
            <div className="space-y-2">
              <Label htmlFor="instructions">Instruções (uma por linha)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder="1. Primeiro passo&#10;2. Segundo passo&#10;3. Terceiro passo"
                rows={5}
              />
            </div>

            {/* Dicas */}
            <div className="space-y-2">
              <Label htmlFor="tips">Dicas</Label>
              <Textarea
                id="tips"
                value={formData.tips}
                onChange={(e) => setFormData(prev => ({ ...prev, tips: e.target.value }))}
                placeholder="Dicas importantes para execução correta"
                rows={2}
              />
            </div>

            {/* Equipamentos */}
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipamentos (separados por vírgula)</Label>
              <Input
                id="equipment"
                value={formData.equipment_needed}
                onChange={(e) => setFormData(prev => ({ ...prev, equipment_needed: e.target.value }))}
                placeholder="Halteres, Banco, Barra"
              />
            </div>

            {/* Ativo */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label>Exercício Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Exercícios inativos não aparecem para os usuários
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2" disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : (editingExercise ? 'Salvar Alterações' : 'Criar Exercício')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
