import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Trophy, MessageCircle, Target, Camera, Gift } from 'lucide-react';
import { usePointsConfig, PointsConfig } from '@/hooks/usePointsConfig';

const CATEGORY_CONFIG: Record<string, { title: string; icon: React.ReactNode; color: string }> = {
  missao: { title: 'Missões e Sessões', icon: <Target className="h-5 w-5" />, color: 'bg-blue-500' },
  social: { title: 'Interações Sociais', icon: <MessageCircle className="h-5 w-5" />, color: 'bg-green-500' },
  desafio: { title: 'Desafios e Metas', icon: <Trophy className="h-5 w-5" />, color: 'bg-purple-500' },
  interacao: { title: 'Registros e Fotos', icon: <Camera className="h-5 w-5" />, color: 'bg-orange-500' },
  bonus: { title: 'Bônus Especiais', icon: <Gift className="h-5 w-5" />, color: 'bg-yellow-500' },
};

export const PointsConfiguration: React.FC = () => {
  const { configs, isLoading, bulkUpdate, isSaving } = usePointsConfig();
  const [localConfigs, setLocalConfigs] = useState<PointsConfig[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (configs.length > 0) {
      setLocalConfigs(configs);
    }
  }, [configs]);

  const handlePointsChange = (id: string, points: number) => {
    setLocalConfigs(prev => prev.map(c => c.id === id ? { ...c, points } : c));
    setHasChanges(true);
  };

  const handleActiveChange = (id: string, is_active: boolean) => {
    setLocalConfigs(prev => prev.map(c => c.id === id ? { ...c, is_active } : c));
    setHasChanges(true);
  };

  const handleMaxDailyChange = (id: string, max_daily: number | null) => {
    setLocalConfigs(prev => prev.map(c => c.id === id ? { ...c, max_daily } : c));
    setHasChanges(true);
  };

  const handleSave = () => {
    const changes = localConfigs
      .filter(local => {
        const original = configs.find(c => c.id === local.id);
        return original && (
          original.points !== local.points ||
          original.is_active !== local.is_active ||
          original.max_daily !== local.max_daily
        );
      })
      .map(c => ({
        id: c.id,
        points: c.points,
        is_active: c.is_active,
        max_daily: c.max_daily,
      }));

    if (changes.length > 0) {
      bulkUpdate(changes);
      setHasChanges(false);
    }
  };

  const groupedConfigs = localConfigs.reduce((acc, config) => {
    const category = config.category || 'outros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(config);
    return acc;
  }, {} as Record<string, PointsConfig[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuração de Pontuação</h2>
          <p className="text-muted-foreground">
            Configure os pontos para cada ação do sistema
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || isSaving}
          className="gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Alterações
        </Button>
      </div>

      {Object.entries(CATEGORY_CONFIG).map(([categoryKey, categoryInfo]) => {
        const categoryConfigs = groupedConfigs[categoryKey] || [];
        if (categoryConfigs.length === 0) return null;

        return (
          <Card key={categoryKey}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg text-white ${categoryInfo.color}`}>
                  {categoryInfo.icon}
                </div>
                <div>
                  <CardTitle className="text-lg">{categoryInfo.title}</CardTitle>
                  <CardDescription>
                    {categoryConfigs.length} ações configuradas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryConfigs.map(config => (
                  <div 
                    key={config.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
                      config.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'
                    }`}
                  >
                    <span className="text-2xl w-10 text-center">{config.icon}</span>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{config.action_name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {config.description}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.points}
                          onChange={(e) => handlePointsChange(config.id, parseInt(e.target.value) || 0)}
                          className="w-20 text-center"
                          min={0}
                        />
                        <Badge variant="secondary">pts</Badge>
                      </div>

                      {config.max_daily !== null && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Máx/dia:</span>
                          <Input
                            type="number"
                            value={config.max_daily || ''}
                            onChange={(e) => handleMaxDailyChange(
                              config.id, 
                              e.target.value ? parseInt(e.target.value) : null
                            )}
                            className="w-16 text-center"
                            min={1}
                          />
                        </div>
                      )}

                      <Switch
                        checked={config.is_active}
                        onCheckedChange={(checked) => handleActiveChange(config.id, checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
