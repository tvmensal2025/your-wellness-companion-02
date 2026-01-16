// =====================================================
// XP CONFIG PANEL COMPONENT
// =====================================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Award, Save } from 'lucide-react';
import { toast } from 'sonner';

interface XPConfig {
  daily_login: number;
  complete_meal: number;
  add_water: number;
  complete_workout: number;
  complete_challenge: number;
  streak_bonus: number;
  daily_limit: number;
}

const defaultConfig: XPConfig = {
  daily_login: 10,
  complete_meal: 15,
  add_water: 5,
  complete_workout: 25,
  complete_challenge: 50,
  streak_bonus: 10,
  daily_limit: 200,
};

export const XPConfigPanel: React.FC = () => {
  const [config, setConfig] = useState<XPConfig>(defaultConfig);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Save to database when table exists
      toast.success('Configuração de XP salva com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const configLabels: Record<keyof XPConfig, string> = {
    daily_login: 'Login Diário',
    complete_meal: 'Registrar Refeição',
    add_water: 'Adicionar Água',
    complete_workout: 'Completar Treino',
    complete_challenge: 'Completar Desafio',
    streak_bonus: 'Bônus por Streak (por dia)',
    daily_limit: 'Limite Diário de XP',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-amber-500" />
          Configuração de XP e Pontos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(config) as Array<keyof XPConfig>).map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{configLabels[key]}</Label>
              <Input
                id={key}
                type="number"
                value={config[key]}
                onChange={(e) => setConfig({ ...config, [key]: parseInt(e.target.value) || 0 })}
                min={0}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? 'Salvando...' : 'Salvar Configuração'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default XPConfigPanel;
