/**
 * 🎮 XP Configuration Panel
 * 
 * Painel admin para configurar valores de XP/pontos.
 * Usa a tabela points_configuration do banco.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Search,
  Filter,
  History,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface XPConfigRow {
  id: string;
  action_type: string;
  action_name: string;
  points: number;
  base_xp?: number;
  description: string | null;
  icon: string | null;
  category: string | null;
  multiplier: number;
  max_daily: number | null;
  is_active: boolean;
  sort_order?: number;
}

interface EditingState {
  [key: string]: {
    points?: number;
    base_xp?: number;
    max_daily?: number | null;
    is_active?: boolean;
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  missao: 'bg-blue-500/20 text-blue-400',
  social: 'bg-purple-500/20 text-purple-400',
  interacao: 'bg-green-500/20 text-green-400',
  desafio: 'bg-orange-500/20 text-orange-400',
  bonus: 'bg-yellow-500/20 text-yellow-400',
  exercicio: 'bg-red-500/20 text-red-400',
  saude: 'bg-teal-500/20 text-teal-400',
};

export function XPConfigPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState>({});
  const [showAuditLog, setShowAuditLog] = useState(false);

  // Buscar configurações
  const { data: configs, isLoading, refetch } = useQuery({
    queryKey: ['xp-configs-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_configuration')
        .select('*')
        .order('sort_order')
        .order('action_name');

      if (error) throw error;
      return data as XPConfigRow[];
    },
  });

  // Buscar log de auditoria
  const { data: auditLog } = useQuery({
    queryKey: ['xp-audit-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('xp_config_audit_log')
        .select('*, profiles:changed_by(full_name)')
        .order('changed_at', { ascending: false })
        .limit(50);

      if (error) return [];
      return data;
    },
    enabled: showAuditLog,
  });

  // Mutation para salvar alterações
  const saveMutation = useMutation({
    mutationFn: async ({ actionType, updates }: { 
      actionType: string; 
      updates: Partial<XPConfigRow>;
    }) => {
      const { error } = await supabase
        .from('points_configuration')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('action_type', actionType);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: 'Configuração salva',
        description: `${variables.actionType} atualizado com sucesso.`,
      });
      
      // Limpar estado de edição
      setEditing(prev => {
        const next = { ...prev };
        delete next[variables.actionType];
        return next;
      });
      
      queryClient.invalidateQueries({ queryKey: ['xp-configs-admin'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Filtrar configs
  const filteredConfigs = configs?.filter(config => {
    const matchesSearch = !searchTerm || 
      config.action_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      config.action_type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !categoryFilter || config.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Categorias únicas
  const categories = [...new Set(configs?.map(c => c.category).filter(Boolean))];

  // Handlers
  const handleEdit = (actionType: string, field: string, value: number | boolean | null) => {
    setEditing(prev => ({
      ...prev,
      [actionType]: {
        ...prev[actionType],
        [field]: value,
      },
    }));
  };

  const handleSave = (config: XPConfigRow) => {
    const updates = editing[config.action_type];
    if (!updates) return;

    // Validações
    if (updates.points !== undefined && (updates.points < 0 || updates.points > 10000)) {
      toast({
        title: 'Valor inválido',
        description: 'Pontos devem ser entre 0 e 10.000',
        variant: 'destructive',
      });
      return;
    }

    if (updates.base_xp !== undefined && (updates.base_xp < 0 || updates.base_xp > 10000)) {
      toast({
        title: 'Valor inválido',
        description: 'XP deve ser entre 0 e 10.000',
        variant: 'destructive',
      });
      return;
    }

    if (updates.max_daily !== undefined && updates.max_daily !== null && 
        (updates.max_daily < 1 || updates.max_daily > 1000)) {
      toast({
        title: 'Valor inválido',
        description: 'Limite diário deve ser entre 1 e 1.000',
        variant: 'destructive',
      });
      return;
    }

    saveMutation.mutate({ actionType: config.action_type, updates });
  };

  const hasChanges = (actionType: string) => {
    return !!editing[actionType] && Object.keys(editing[actionType]).length > 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Carregando configurações...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração de XP e Pontos
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAuditLog(!showAuditLog)}
              >
                <History className="h-4 w-4 mr-1" />
                Histórico
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Filtros */}
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={categoryFilter === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(null)}
              >
                Todas
              </Button>
              {categories.map(cat => (
                <Button
                  key={cat}
                  variant={categoryFilter === cat ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCategoryFilter(cat === categoryFilter ? null : cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Aviso */}
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span className="text-yellow-600 dark:text-yellow-400">
              Alterações afetam imediatamente todos os usuários. Histórico é mantido para auditoria.
            </span>
          </div>

          {/* Tabela de configurações */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Ação</th>
                  <th className="text-center p-3 font-medium w-20">XP</th>
                  <th className="text-center p-3 font-medium w-20">Pontos</th>
                  <th className="text-center p-3 font-medium w-24">Limite/dia</th>
                  <th className="text-center p-3 font-medium w-20">Ativo</th>
                  <th className="text-center p-3 font-medium w-20">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredConfigs?.map(config => {
                  const editState = editing[config.action_type] || {};
                  const currentXP = editState.base_xp ?? config.base_xp ?? config.points;
                  const currentPoints = editState.points ?? config.points;
                  const currentMaxDaily = editState.max_daily !== undefined 
                    ? editState.max_daily 
                    : config.max_daily;
                  const currentActive = editState.is_active ?? config.is_active;

                  return (
                    <tr 
                      key={config.id}
                      className={cn(
                        'hover:bg-muted/30 transition-colors',
                        hasChanges(config.action_type) && 'bg-primary/5'
                      )}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{config.icon || '🎯'}</span>
                          <div>
                            <div className="font-medium">{config.action_name}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-2">
                              <code className="bg-muted px-1 rounded">{config.action_type}</code>
                              {config.category && (
                                <Badge 
                                  variant="secondary" 
                                  className={cn('text-xs', CATEGORY_COLORS[config.category])}
                                >
                                  {config.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-3">
                        <Input
                          type="number"
                          value={currentXP}
                          onChange={(e) => handleEdit(
                            config.action_type, 
                            'base_xp', 
                            parseInt(e.target.value) || 0
                          )}
                          className="w-20 text-center h-8"
                          min={0}
                          max={10000}
                        />
                      </td>
                      
                      <td className="p-3">
                        <Input
                          type="number"
                          value={currentPoints}
                          onChange={(e) => handleEdit(
                            config.action_type, 
                            'points', 
                            parseInt(e.target.value) || 0
                          )}
                          className="w-20 text-center h-8"
                          min={0}
                          max={10000}
                        />
                      </td>
                      
                      <td className="p-3">
                        <Input
                          type="number"
                          value={currentMaxDaily ?? ''}
                          onChange={(e) => handleEdit(
                            config.action_type, 
                            'max_daily', 
                            e.target.value ? parseInt(e.target.value) : null
                          )}
                          className="w-24 text-center h-8"
                          placeholder="∞"
                          min={1}
                          max={1000}
                        />
                      </td>
                      
                      <td className="p-3 text-center">
                        <Switch
                          checked={currentActive}
                          onCheckedChange={(checked) => handleEdit(
                            config.action_type, 
                            'is_active', 
                            checked
                          )}
                        />
                      </td>
                      
                      <td className="p-3 text-center">
                        {hasChanges(config.action_type) && (
                          <Button
                            size="sm"
                            onClick={() => handleSave(config)}
                            disabled={saveMutation.isPending}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Salvar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredConfigs?.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma configuração encontrada.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log de Auditoria */}
      {showAuditLog && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico de Alterações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {auditLog && auditLog.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {auditLog.map((log: any) => (
                  <div 
                    key={log.id}
                    className="flex items-center justify-between p-2 bg-muted/30 rounded text-sm"
                  >
                    <div>
                      <span className="font-medium">{log.action_type}</span>
                      <span className="text-muted-foreground mx-2">→</span>
                      <span>{log.field_changed}:</span>
                      <span className="text-red-400 mx-1">{log.old_value}</span>
                      <span>→</span>
                      <span className="text-green-400 mx-1">{log.new_value}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.changed_at).toLocaleString('pt-BR')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                Nenhuma alteração registrada.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default XPConfigPanel;
