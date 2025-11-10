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
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Plus, Edit, Trash2, Upload, Video, Image as ImageIcon, Search, Eye } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  description: string;
  location: 'casa' | 'academia' | 'ambos';
  difficulty: 'facil' | 'medio' | 'dificil';
  muscle_group: string;
  equipment_needed: string[];
  video_url?: string;
  image_url?: string;
  instructions?: any;
  tips?: string[];
  sets?: string;
  reps?: string;
  rest_time?: string;
  is_active: boolean;
}

export const ExerciseManagement = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: 'casa' as 'casa' | 'academia' | 'ambos',
    difficulty: 'medio' as 'facil' | 'medio' | 'dificil',
    muscle_group: '',
    equipment_needed: '',
    video_url: '',
    image_url: '',
    instructions: '',
    tips: '',
    sets: '3-4',
    reps: '10-12',
    rest_time: '60s',
    is_active: true,
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      setExercises((data as any) || []);
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

  const handleMediaUpload = async (file: File, type: 'video' | 'image') => {
    try {
      setUploadingMedia(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('exercise-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('exercise-media')
        .getPublicUrl(filePath);

      if (type === 'video') {
        setFormData(prev => ({ ...prev, video_url: publicUrl }));
      } else {
        setFormData(prev => ({ ...prev, image_url: publicUrl }));
      }

      toast({
        title: 'Upload concluído',
        description: `${type === 'video' ? 'Vídeo' : 'Imagem'} enviado com sucesso!`,
      });
    } catch (error) {
      console.error('Error uploading media:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o arquivo',
        variant: 'destructive',
      });
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const equipmentArray = formData.equipment_needed
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      const tipsArray = formData.tips
        .split('\n')
        .map(item => item.trim())
        .filter(Boolean);

      let instructionsJson = null;
      if (formData.instructions) {
        try {
          instructionsJson = JSON.parse(formData.instructions);
        } catch {
          const passos = formData.instructions
            .split('\n')
            .map(item => item.trim())
            .filter(Boolean);
          instructionsJson = { passos };
        }
      }

      const exerciseData = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        difficulty: formData.difficulty,
        muscle_group: formData.muscle_group,
        equipment_needed: equipmentArray,
        video_url: formData.video_url || null,
        image_url: formData.image_url || null,
        instructions: instructionsJson,
        tips: tipsArray,
        sets: formData.sets,
        reps: formData.reps,
        rest_time: formData.rest_time,
        is_active: formData.is_active,
      };

      if (editingExercise) {
        const { error } = await supabase
          .from('exercises')
          .update(exerciseData)
          .eq('id', editingExercise.id);

        if (error) throw error;

        toast({
          title: 'Exercício atualizado',
          description: 'As alterações foram salvas com sucesso',
        });
      } else {
        const { error } = await supabase
          .from('exercises')
          .insert([exerciseData]);

        if (error) throw error;

        toast({
          title: 'Exercício criado',
          description: 'Novo exercício adicionado com sucesso',
        });
      }

      setIsModalOpen(false);
      resetForm();
      fetchExercises();
    } catch (error) {
      console.error('Error saving exercise:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o exercício',
        variant: 'destructive',
      });
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
      video_url: exercise.video_url || '',
      image_url: exercise.image_url || '',
      instructions: JSON.stringify(exercise.instructions, null, 2) || '',
      tips: exercise.tips?.join('\n') || '',
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
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Exercício deletado',
        description: 'O exercício foi removido com sucesso',
      });

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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: 'casa',
      difficulty: 'medio',
      muscle_group: '',
      equipment_needed: '',
      video_url: '',
      image_url: '',
      instructions: '',
      tips: '',
      sets: '3-4',
      reps: '10-12',
      rest_time: '60s',
      is_active: true,
    });
    setEditingExercise(null);
  };

  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ex.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = filterLocation === 'all' || ex.location === filterLocation || ex.location === 'ambos';
    return matchesSearch && matchesLocation;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationIcon = (location: string) => {
    switch (location) {
      case 'casa': return '🏠';
      case 'academia': return '🏋️';
      case 'ambos': return '🏠🏋️';
      default: return '📍';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Dumbbell className="h-8 w-8 text-primary" />
            Gestão de Exercícios
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerencie a biblioteca completa de exercícios com vídeos e imagens
          </p>
        </div>
        <Button onClick={() => {
          resetForm();
          setIsModalOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Exercício
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar exercícios..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterLocation} onValueChange={setFilterLocation}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Local" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os locais</SelectItem>
                <SelectItem value="casa">Casa</SelectItem>
                <SelectItem value="academia">Academia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Exercise Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <Card key={exercise.id} className="hover:shadow-lg transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{getLocationIcon(exercise.location)}</span>
                    {exercise.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {exercise.description}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Media Preview */}
              {(exercise.video_url || exercise.image_url) && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                  {exercise.video_url ? (
                    <video 
                      src={exercise.video_url} 
                      className="w-full h-full object-cover"
                      controls
                    />
                  ) : exercise.image_url ? (
                    <img 
                      src={exercise.image_url} 
                      alt={exercise.name}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
              )}

              {/* Info Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge className={getDifficultyColor(exercise.difficulty)}>
                  {exercise.difficulty}
                </Badge>
                {exercise.muscle_group && (
                  <Badge variant="outline">{exercise.muscle_group}</Badge>
                )}
                {exercise.video_url && (
                  <Badge variant="secondary" className="gap-1">
                    <Video className="h-3 w-3" />
                    Vídeo
                  </Badge>
                )}
                {exercise.image_url && (
                  <Badge variant="secondary" className="gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Imagem
                  </Badge>
                )}
              </div>

              {/* Exercise Details */}
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

              {/* Equipment */}
              {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
                <div className="text-sm">
                  <span className="font-semibold">Equipamento:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {exercise.equipment_needed.map((eq, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {eq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleEdit(exercise)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
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
          </CardContent>
        </Card>
      )}

      {/* Modal de Criar/Editar */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        setIsModalOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
            </DialogTitle>
            <DialogDescription>
              Preencha os detalhes do exercício e adicione vídeo ou imagem para facilitar o entendimento
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nome */}
            <div>
              <Label htmlFor="name">Nome do Exercício *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Agachamento na cadeira"
                required
              />
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição breve do exercício"
                rows={2}
              />
            </div>

            {/* Location, Difficulty, Muscle Group */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="location">Local *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, location: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casa">🏠 Casa</SelectItem>
                    <SelectItem value="academia">🏋️ Academia</SelectItem>
                    <SelectItem value="ambos">🏠🏋️ Ambos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="difficulty">Dificuldade *</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, difficulty: value }))}
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

              <div>
                <Label htmlFor="muscle_group">Grupo Muscular</Label>
                <Input
                  id="muscle_group"
                  value={formData.muscle_group}
                  onChange={(e) => setFormData(prev => ({ ...prev, muscle_group: e.target.value }))}
                  placeholder="Ex: Pernas, Peito"
                />
              </div>
            </div>

            {/* Sets, Reps, Rest */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sets">Séries</Label>
                <Input
                  id="sets"
                  value={formData.sets}
                  onChange={(e) => setFormData(prev => ({ ...prev, sets: e.target.value }))}
                  placeholder="Ex: 3-4"
                />
              </div>

              <div>
                <Label htmlFor="reps">Repetições</Label>
                <Input
                  id="reps"
                  value={formData.reps}
                  onChange={(e) => setFormData(prev => ({ ...prev, reps: e.target.value }))}
                  placeholder="Ex: 10-12"
                />
              </div>

              <div>
                <Label htmlFor="rest_time">Descanso</Label>
                <Input
                  id="rest_time"
                  value={formData.rest_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, rest_time: e.target.value }))}
                  placeholder="Ex: 60s"
                />
              </div>
            </div>

            {/* Equipment */}
            <div>
              <Label htmlFor="equipment">Equipamentos (separados por vírgula)</Label>
              <Input
                id="equipment"
                value={formData.equipment_needed}
                onChange={(e) => setFormData(prev => ({ ...prev, equipment_needed: e.target.value }))}
                placeholder="Ex: Cadeira, Mesa, Elástico"
              />
            </div>

            {/* Media Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Vídeo do Exercício</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleMediaUpload(file, 'video');
                      }}
                      disabled={uploadingMedia}
                      className="flex-1"
                    />
                  </div>
                  {formData.video_url && (
                    <div className="relative">
                      <video 
                        src={formData.video_url} 
                        className="w-full h-32 object-cover rounded"
                        controls
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Imagem do Exercício</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleMediaUpload(file, 'image');
                    }}
                    disabled={uploadingMedia}
                  />
                  {formData.image_url && (
                    <img 
                      src={formData.image_url} 
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <Label htmlFor="instructions">Instruções (JSON ou lista separada por linha)</Label>
              <Textarea
                id="instructions"
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                placeholder='{"passos": ["Passo 1", "Passo 2"]} ou uma linha por passo'
                rows={4}
              />
            </div>

            {/* Tips */}
            <div>
              <Label htmlFor="tips">Dicas (uma por linha)</Label>
              <Textarea
                id="tips"
                value={formData.tips}
                onChange={(e) => setFormData(prev => ({ ...prev, tips: e.target.value }))}
                placeholder="Dica 1&#10;Dica 2&#10;Dica 3"
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={uploadingMedia}>
                {uploadingMedia ? 'Enviando...' : editingExercise ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
