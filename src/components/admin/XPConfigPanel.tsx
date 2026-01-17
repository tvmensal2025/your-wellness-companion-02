import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
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
  
  const [config, setConfig] = useState<XPConfig>({
    daily_mission_xp: 50,
    weekly_challenge_xp: 200,
    monthly_challenge_xp: 1000,
    workout_completion_xp: 100,
    meal_log_xp: 25,
    daily_points_limit: 500,
    xp_to_points_ratio: 10,
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate save - in future, save to database
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    toast({
      title: "Configuração salva",
      description: "As configurações de XP foram atualizadas com sucesso.",
    });
  };

  const handleChange = (key: keyof XPConfig, value: string) => {
    const numValue = parseInt(value) || 0;
    setConfig(prev => ({ ...prev, [key]: numValue }));
  };

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
            disabled={saving}
          >
            {saving ? (
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
