import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, RefreshCw, TrendingUp, Award, Users, Zap } from "lucide-react";
import { usePointsConfig } from "@/hooks/usePointsConfig";
import { cn } from "@/lib/utils";

export function PointsConfigPanel() {
  const { configs, isLoading, updateConfig, bulkUpdate, isSaving, getByCategory } = usePointsConfig();
  const [editedConfigs, setEditedConfigs] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState("missao");

  const categories = [
    { id: "missao", name: "Missões", icon: Award, color: "text-blue-500" },
    { id: "social", name: "Social", icon: Users, color: "text-green-500" },
    { id: "interacao", name: "Interação", icon: Zap, color: "text-purple-500" },
    { id: "desafio", name: "Desafios", icon: TrendingUp, color: "text-orange-500" },
    { id: "educacao", name: "Educação", icon: Award, color: "text-indigo-500" },
    { id: "exercicio", name: "Exercício", icon: TrendingUp, color: "text-red-500" },
    { id: "nutricao", name: "Nutrição", icon: Award, color: "text-emerald-500" },
    { id: "tracking", name: "Tracking", icon: TrendingUp, color: "text-cyan-500" },
    { id: "saude", name: "Saúde", icon: Award, color: "text-pink-500" },
    { id: "bonus", name: "Bônus", icon: Award, color: "text-yellow-500" },
    { id: "especial", name: "Especial", icon: Zap, color: "text-violet-500" },
  ];

  const handleChange = (id: string, field: string, value: any) => {
    setEditedConfigs(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSave = async (id: string) => {
    if (editedConfigs[id]) {
      await updateConfig({ id, ...editedConfigs[id] });
      setEditedConfigs(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleSaveAll = async () => {
    const updates = Object.entries(editedConfigs).map(([id, changes]) => ({
      id,
      ...changes
    }));
    
    if (updates.length > 0) {
      await bulkUpdate(updates);
      setEditedConfigs({});
    }
  };

  const getConfigValue = (config: any, field: string) => {
    return editedConfigs[config.id]?.[field] ?? config[field];
  };

  const hasChanges = Object.keys(editedConfigs).length > 0;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Sistema de Pontuação
              </CardTitle>
              <CardDescription>
                Configure os pontos e XP para cada ação na plataforma
              </CardDescription>
            </div>
            {hasChanges && (
              <Button onClick={handleSaveAll} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Todas ({Object.keys(editedConfigs).length})
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-1">
              {categories.map(cat => {
                const Icon = cat.icon;
                const categoryConfigs = getByCategory(cat.id);
                return (
                  <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-2">
                    <Icon className={cn("h-4 w-4", cat.color)} />
                    <span className="hidden sm:inline">{cat.name}</span>
                    <Badge variant="secondary" className="ml-1">
                      {categoryConfigs.length}
                    </Badge>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="space-y-4 mt-4">
                {getByCategory(category.id).map(config => {
                  const hasEdit = !!editedConfigs[config.id];
                  return (
                    <Card key={config.id} className={cn(
                      "transition-all",
                      hasEdit && "ring-2 ring-primary"
                    )}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                          {/* Info */}
                          <div className="md:col-span-4 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{config.icon}</span>
                              <div>
                                <h4 className="font-semibold">{config.action_name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {config.description}
                                </p>
                                <code className="text-xs text-muted-foreground">
                                  {config.action_type}
                                </code>
                              </div>
                            </div>
                          </div>

                          {/* Pontos */}
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor={`points-${config.id}`}>Pontos</Label>
                            <Input
                              id={`points-${config.id}`}
                              type="number"
                              value={getConfigValue(config, 'points')}
                              onChange={(e) => handleChange(config.id, 'points', parseInt(e.target.value) || 0)}
                              className="w-full"
                            />
                          </div>

                          {/* Multiplicador */}
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor={`multiplier-${config.id}`}>Multiplicador</Label>
                            <Input
                              id={`multiplier-${config.id}`}
                              type="number"
                              step="0.1"
                              value={getConfigValue(config, 'multiplier')}
                              onChange={(e) => handleChange(config.id, 'multiplier', parseFloat(e.target.value) || 1)}
                              className="w-full"
                            />
                          </div>

                          {/* Limite Diário */}
                          <div className="md:col-span-2 space-y-2">
                            <Label htmlFor={`max-${config.id}`}>Máx/Dia</Label>
                            <Input
                              id={`max-${config.id}`}
                              type="number"
                              placeholder="Ilimitado"
                              value={getConfigValue(config, 'max_daily') || ''}
                              onChange={(e) => handleChange(config.id, 'max_daily', e.target.value ? parseInt(e.target.value) : null)}
                              className="w-full"
                            />
                          </div>

                          {/* Ativo + Ações */}
                          <div className="md:col-span-2 flex items-center justify-between gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id={`active-${config.id}`}
                                checked={getConfigValue(config, 'is_active')}
                                onCheckedChange={(checked) => handleChange(config.id, 'is_active', checked)}
                              />
                              <Label htmlFor={`active-${config.id}`} className="text-sm">
                                Ativo
                              </Label>
                            </div>
                            {hasEdit && (
                              <Button
                                size="sm"
                                onClick={() => handleSave(config.id)}
                                disabled={isSaving}
                              >
                                <Save className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Total Calculado */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Pontos Finais:</span>
                            <Badge variant="outline" className="text-base font-bold">
                              {Math.round(getConfigValue(config, 'points') * getConfigValue(config, 'multiplier'))} pts
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumo do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map(cat => {
              const categoryConfigs = getByCategory(cat.id);
              const totalPoints = categoryConfigs
                .filter(c => c.is_active)
                .reduce((sum, c) => sum + (c.points * c.multiplier), 0);
              const Icon = cat.icon;
              
              return (
                <div key={cat.id} className="text-center space-y-2">
                  <Icon className={cn("h-6 w-6 mx-auto", cat.color)} />
                  <div>
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-2xl font-bold">{Math.round(totalPoints)}</p>
                    <p className="text-xs text-muted-foreground">
                      {categoryConfigs.filter(c => c.is_active).length} ações
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
