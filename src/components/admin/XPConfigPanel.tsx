import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";

interface XPConfig {
  daily_mission_xp: number;
  weekly_challenge_xp: number;
  monthly_challenge_xp: number;
  workout_completion_xp: number;
  meal_log_xp: number;
  daily_points_limit: number;
  xp_to_points_ratio: number;
}

export function XPConfigPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [config, setConfig] = useState<XPConfig>({
    daily_mission_xp: 50,
    weekly_challenge_xp: 200,
    monthly_challenge_xp: 1000,
    workout_completion_xp: 100,
    meal_log_xp: 25,
    daily_points_limit: 500,
    xp_to_points_ratio: 10,
  });

  // Query para buscar configuração atual
  const { data: currentConfig, isLoading } = useQuery({
    queryKey: ['xp-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .eq('key', 'xp_config')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      if (data?.value) {
        setConfig(data.value as XPConfig);
        return data.value as XPConfig;
      }
      
      return config;
    },
  });

  // Mutation para salvar configuração
  const saveMutation = useMutation({
    mutationFn: async (newConfig: XPConfig) => {
      const { error } = await supabase
        .from('system_config')
        .upsert({
          key: 'xp_config',
          value: newConfig,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['xp-config'] });
      toast({
        title: "Configuração salva",
        description: "As configurações de XP foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(config);
  };

  const handleChange = (key: keyof XPConfig, value: string) => {
    const numValue = parseInt(value) || 0;
    setConfig(prev => ({ ...prev, [key]: numValue }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de XP e Pontos</CardTitle>
        <CardDescription>
          Configure os valores de XP e pontos para diferentes ações no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="daily_mission_xp">XP por Missão Diária</Label>
            <Input
              id="daily_mission_xp"
              type="number"
              value={config.daily_mission_xp}
              onChange={(e) => handleChange('daily_mission_xp', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weekly_challenge_xp">XP por Desafio Semanal</Label>
            <Input
              id="weekly_challenge_xp"
              type="number"
              value={config.weekly_challenge_xp}
              onChange={(e) => handleChange('weekly_challenge_xp', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monthly_challenge_xp">XP por Desafio Mensal</Label>
            <Input
              id="monthly_challenge_xp"
              type="number"
              value={config.monthly_challenge_xp}
              onChange={(e) => handleChange('monthly_challenge_xp', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workout_completion_xp">XP por Treino Completo</Label>
            <Input
              id="workout_completion_xp"
              type="number"
              value={config.workout_completion_xp}
              onChange={(e) => handleChange('workout_completion_xp', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal_log_xp">XP por Registro de Refeição</Label>
            <Input
              id="meal_log_xp"
              type="number"
              value={config.meal_log_xp}
              onChange={(e) => handleChange('meal_log_xp', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="daily_points_limit">Limite Diário de Pontos</Label>
            <Input
              id="daily_points_limit"
              type="number"
              value={config.daily_points_limit}
              onChange={(e) => handleChange('daily_points_limit', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="xp_to_points_ratio">Razão XP para Pontos (XP por 1 ponto)</Label>
            <Input
              id="xp_to_points_ratio"
              type="number"
              value={config.xp_to_points_ratio}
              onChange={(e) => handleChange('xp_to_points_ratio', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
