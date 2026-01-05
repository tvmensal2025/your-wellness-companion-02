import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Brain, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Target,
  Shield,
  AlertTriangle,
  Sparkles,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface CustomSaboteur {
  id: string;
  saboteur_name: string;
  description: string | null;
  category: string | null;
  common_triggers: string[] | null;
  behavioral_patterns: string[] | null;
  physical_symptoms: string[] | null;
  mental_patterns: string[] | null;
  coping_strategies: string[] | null;
  related_saboteurs: string[] | null;
  severity_levels: unknown;
  is_active: boolean | null;
  created_at: string | null;
}

export const SaboteurManagement = () => {
  const [customSaboteurs, setCustomSaboteurs] = useState<CustomSaboteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSaboteur, setEditingSaboteur] = useState<CustomSaboteur | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  
  const [newSaboteur, setNewSaboteur] = useState({
    saboteur_name: '',
    description: '',
    category: 'comportamental',
    common_triggers: '',
    behavioral_patterns: '',
    coping_strategies: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadCustomSaboteurs();
  }, []);

  const loadCustomSaboteurs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_saboteurs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomSaboteurs(data || []);

      const activeCount = data?.filter(s => s.is_active).length || 0;
      setStats({
        total: data?.length || 0,
        active: activeCount,
        inactive: (data?.length || 0) - activeCount
      });

    } catch (error) {
      console.error('Error loading custom saboteurs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os sabotadores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSaboteur = async () => {
    if (!newSaboteur.saboteur_name.trim()) {
      toast({
        title: "Erro",
        description: "O nome do sabotador é obrigatório",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('custom_saboteurs')
        .insert([{
          saboteur_name: newSaboteur.saboteur_name,
          description: newSaboteur.description || null,
          category: newSaboteur.category || null,
          common_triggers: newSaboteur.common_triggers ? newSaboteur.common_triggers.split(',').map(s => s.trim()) : null,
          behavioral_patterns: newSaboteur.behavioral_patterns ? newSaboteur.behavioral_patterns.split(',').map(s => s.trim()) : null,
          coping_strategies: newSaboteur.coping_strategies ? newSaboteur.coping_strategies.split(',').map(s => s.trim()) : null,
          is_active: true
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso! ✅",
        description: "Sabotador personalizado criado com sucesso",
      });

      setShowCreateModal(false);
      setNewSaboteur({
        saboteur_name: '',
        description: '',
        category: 'comportamental',
        common_triggers: '',
        behavioral_patterns: '',
        coping_strategies: ''
      });
      loadCustomSaboteurs();
    } catch (error) {
      console.error('Error creating saboteur:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o sabotador",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSaboteur = async (saboteurId: string) => {
    try {
      const { error } = await supabase
        .from('custom_saboteurs')
        .delete()
        .eq('id', saboteurId);

      if (error) throw error;

      toast({
        title: "Sucesso! ✅",
        description: "Sabotador removido com sucesso",
      });

      loadCustomSaboteurs();
    } catch (error) {
      console.error('Error deleting saboteur:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o sabotador",
        variant: "destructive"
      });
    }
  };

  const handleToggleSaboteur = async (saboteurId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('custom_saboteurs')
        .update({ is_active: !currentStatus })
        .eq('id', saboteurId);

      if (error) throw error;

      toast({
        title: "Sucesso! ✅",
        description: `Sabotador ${currentStatus ? 'desativado' : 'ativado'} com sucesso`,
      });

      loadCustomSaboteurs();
    } catch (error) {
      console.error('Error toggling saboteur:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSaboteur = async () => {
    if (!editingSaboteur) return;

    try {
      const { error } = await supabase
        .from('custom_saboteurs')
        .update({
          saboteur_name: editingSaboteur.saboteur_name,
          description: editingSaboteur.description,
          category: editingSaboteur.category
        })
        .eq('id', editingSaboteur.id);

      if (error) throw error;

      toast({
        title: "Sucesso! ✅",
        description: "Sabotador atualizado com sucesso",
      });

      setEditingSaboteur(null);
      loadCustomSaboteurs();
    } catch (error) {
      console.error('Error updating saboteur:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o sabotador",
        variant: "destructive"
      });
    }
  };

  const categories = [
    { value: 'comportamental', label: 'Comportamental', color: 'bg-blue-500' },
    { value: 'emocional', label: 'Emocional', color: 'bg-purple-500' },
    { value: 'cognitivo', label: 'Cognitivo', color: 'bg-green-500' },
    { value: 'social', label: 'Social', color: 'bg-orange-500' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Carregando sabotadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="h-8 w-8 text-primary" />
            Gestão de Sabotadores
          </h2>
          <p className="text-muted-foreground mt-1">
            Crie e gerencie sabotadores personalizados baseados nos padrões dos usuários
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/20 text-primary border-primary/30">
            <Shield className="h-3 w-3 mr-1" />
            Sistema Ativo
          </Badge>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Criar Sabotador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Criar Sabotador Personalizado
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Sabotador *</Label>
                  <Input
                    id="name"
                    value={newSaboteur.saboteur_name}
                    onChange={(e) => setNewSaboteur(prev => ({ ...prev, saboteur_name: e.target.value }))}
                    placeholder="Ex: O Procrastinador Ansioso"
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <select
                    id="category"
                    value={newSaboteur.category}
                    onChange={(e) => setNewSaboteur(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newSaboteur.description}
                    onChange={(e) => setNewSaboteur(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva as características principais..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="triggers">Gatilhos Comuns (separados por vírgula)</Label>
                  <Input
                    id="triggers"
                    value={newSaboteur.common_triggers}
                    onChange={(e) => setNewSaboteur(prev => ({ ...prev, common_triggers: e.target.value }))}
                    placeholder="Ex: estresse, prazo apertado, cobrança"
                  />
                </div>

                <div>
                  <Label htmlFor="patterns">Padrões Comportamentais (separados por vírgula)</Label>
                  <Input
                    id="patterns"
                    value={newSaboteur.behavioral_patterns}
                    onChange={(e) => setNewSaboteur(prev => ({ ...prev, behavioral_patterns: e.target.value }))}
                    placeholder="Ex: evitar tarefas, buscar distrações"
                  />
                </div>

                <div>
                  <Label htmlFor="strategies">Estratégias de Enfrentamento (separadas por vírgula)</Label>
                  <Input
                    id="strategies"
                    value={newSaboteur.coping_strategies}
                    onChange={(e) => setNewSaboteur(prev => ({ ...prev, coping_strategies: e.target.value }))}
                    placeholder="Ex: técnica pomodoro, dividir tarefas"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSaboteur}>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Sabotador
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Sabotadores</CardTitle>
              <Brain className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Sabotadores personalizados</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/10 to-green-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.active}</div>
              <p className="text-xs text-muted-foreground">Em uso ativamente</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-500">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">Temporariamente pausados</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Lista de Sabotadores */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Sabotadores Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customSaboteurs.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12 bg-muted/30 rounded-lg"
            >
              <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <div className="text-muted-foreground mb-2 text-lg font-medium">
                Nenhum sabotador personalizado criado
              </div>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                Crie sabotadores baseados nos padrões comportamentais específicos dos seus usuários
              </p>
              <Button 
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Sabotador
              </Button>
            </motion.div>
          ) : (
            customSaboteurs.map((saboteur, index) => (
              <motion.div
                key={saboteur.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${saboteur.is_active ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  <div>
                    <h4 className="font-semibold text-foreground">{saboteur.saboteur_name}</h4>
                    <p className="text-sm text-muted-foreground max-w-md truncate">
                      {saboteur.description || 'Sem descrição'}
                    </p>
                    {saboteur.category && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {categories.find(c => c.value === saboteur.category)?.label || saboteur.category}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={saboteur.is_active ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"}>
                    {saboteur.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                  
                  <Switch
                    checked={saboteur.is_active || false}
                    onCheckedChange={() => handleToggleSaboteur(saboteur.id, saboteur.is_active || false)}
                  />
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => setEditingSaboteur(saboteur)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteSaboteur(saboteur.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={!!editingSaboteur} onOpenChange={(open) => !open && setEditingSaboteur(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Editar Sabotador
            </DialogTitle>
          </DialogHeader>
          {editingSaboteur && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome do Sabotador</Label>
                <Input
                  id="edit-name"
                  value={editingSaboteur.saboteur_name}
                  onChange={(e) => setEditingSaboteur(prev => prev ? { ...prev, saboteur_name: e.target.value } : null)}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <select
                  id="edit-category"
                  value={editingSaboteur.category || 'comportamental'}
                  onChange={(e) => setEditingSaboteur(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full p-2 border rounded-md bg-background"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={editingSaboteur.description || ''}
                  onChange={(e) => setEditingSaboteur(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setEditingSaboteur(null)}>
                  Cancelar
                </Button>
                <Button onClick={handleUpdateSaboteur}>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SaboteurManagement;
