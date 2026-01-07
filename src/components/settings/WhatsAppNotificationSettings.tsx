import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bell, Clock, Calendar, Send, CheckCircle, AlertCircle, Loader2, Droplets, Target, Trophy, ListChecks, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface WhatsAppSettings {
  whatsapp_enabled: boolean;
  whatsapp_daily_motivation: boolean;
  whatsapp_daily_time: string;
  whatsapp_weekly_report: boolean;
  whatsapp_weekly_day: number;
  whatsapp_reminders: boolean;
  // Novas configurações
  whatsapp_water_enabled: boolean;
  whatsapp_water_times: string[];
  whatsapp_mission_enabled: boolean;
  whatsapp_mission_time: string;
  whatsapp_goals_enabled: boolean;
  whatsapp_goals_time: string;
  whatsapp_challenges_enabled: boolean;
  whatsapp_challenges_time: string;
}

const defaultSettings: WhatsAppSettings = {
  whatsapp_enabled: true,
  whatsapp_daily_motivation: true,
  whatsapp_daily_time: '07:00',
  whatsapp_weekly_report: true,
  whatsapp_weekly_day: 5,
  whatsapp_reminders: true,
  // Novos defaults
  whatsapp_water_enabled: true,
  whatsapp_water_times: ['09:00', '12:00', '15:00', '18:00'],
  whatsapp_mission_enabled: true,
  whatsapp_mission_time: '08:00',
  whatsapp_goals_enabled: true,
  whatsapp_goals_time: '19:00',
  whatsapp_challenges_enabled: true,
  whatsapp_challenges_time: '10:00',
};

const weekDays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
];

const timeOptions = [
  { value: '06:00', label: '06:00' },
  { value: '07:00', label: '07:00' },
  { value: '08:00', label: '08:00' },
  { value: '09:00', label: '09:00' },
  { value: '10:00', label: '10:00' },
  { value: '11:00', label: '11:00' },
  { value: '12:00', label: '12:00' },
  { value: '13:00', label: '13:00' },
  { value: '14:00', label: '14:00' },
  { value: '15:00', label: '15:00' },
  { value: '16:00', label: '16:00' },
  { value: '17:00', label: '17:00' },
  { value: '18:00', label: '18:00' },
  { value: '19:00', label: '19:00' },
  { value: '20:00', label: '20:00' },
  { value: '21:00', label: '21:00' },
];

const waterTimeOptions = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];

export const WhatsAppNotificationSettings: React.FC<{ className?: string }> = ({ className }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<WhatsAppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSend, setTestingSend] = useState(false);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
      loadUserPhone();
    }
  }, [user?.id]);

  const loadUserPhone = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('phone')
      .eq('user_id', user?.id)
      .single();
    
    setUserPhone(data?.phone || null);
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const d = data as any;
        setSettings({
          whatsapp_enabled: d.whatsapp_enabled ?? true,
          whatsapp_daily_motivation: d.whatsapp_daily_motivation ?? true,
          whatsapp_daily_time: d.whatsapp_daily_time ?? '07:00',
          whatsapp_weekly_report: d.whatsapp_weekly_report ?? true,
          whatsapp_weekly_day: d.whatsapp_weekly_day ?? 5,
          whatsapp_reminders: d.whatsapp_reminders ?? true,
          // Novos campos
          whatsapp_water_enabled: d.whatsapp_water_enabled ?? true,
          whatsapp_water_times: d.whatsapp_water_times ?? ['09:00', '12:00', '15:00', '18:00'],
          whatsapp_mission_enabled: d.whatsapp_mission_enabled ?? true,
          whatsapp_mission_time: d.whatsapp_mission_time?.substring(0, 5) ?? '08:00',
          whatsapp_goals_enabled: d.whatsapp_goals_enabled ?? true,
          whatsapp_goals_time: d.whatsapp_goals_time?.substring(0, 5) ?? '19:00',
          whatsapp_challenges_enabled: d.whatsapp_challenges_enabled ?? true,
          whatsapp_challenges_time: d.whatsapp_challenges_time?.substring(0, 5) ?? '10:00',
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: Partial<WhatsAppSettings>) => {
    setSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: user?.id,
          ...updatedSettings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success('Configurações salvas!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const toggleWaterTime = (time: string) => {
    const currentTimes = settings.whatsapp_water_times || [];
    let newTimes: string[];
    
    if (currentTimes.includes(time)) {
      newTimes = currentTimes.filter(t => t !== time);
    } else {
      newTimes = [...currentTimes, time].sort();
    }
    
    saveSettings({ whatsapp_water_times: newTimes });
  };

  const testWhatsAppMessage = async () => {
    if (!userPhone) {
      toast.error('Você precisa ter um telefone cadastrado para testar');
      return;
    }

    setTestingSend(true);
    try {
      const { error } = await supabase.functions.invoke('evolution-send-message', {
        body: {
          action: 'sendText',
          phone: userPhone,
          message: `🧪 *Teste de WhatsApp*\n\nOlá! Esta é uma mensagem de teste do Mission Health.\n\nSe você recebeu esta mensagem, suas notificações por WhatsApp estão configuradas corretamente! ✅\n\n_Equipe Mission Health_ 💚`,
          userId: user?.id,
          messageType: 'test',
        }
      });

      if (error) throw error;

      toast.success('Mensagem de teste enviada! Verifique seu WhatsApp.');
    } catch (error) {
      console.error('Erro ao enviar teste:', error);
      toast.error('Erro ao enviar mensagem de teste');
    } finally {
      setTestingSend(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-green-500/10">
              <MessageCircle className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <CardTitle className="text-base">Notificações WhatsApp</CardTitle>
              <CardDescription>
                {settings.whatsapp_enabled ? 'Ativadas' : 'Desativadas'}
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={settings.whatsapp_enabled}
            onCheckedChange={(checked) => saveSettings({ whatsapp_enabled: checked })}
            disabled={saving}
          />
        </div>
      </CardHeader>

      <AnimatePresence>
        {settings.whatsapp_enabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="pt-0 space-y-5 max-h-[60vh] overflow-y-auto">
              <div className="h-px bg-border" />

              {/* Status do telefone */}
              {!userPhone && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <p className="text-sm text-amber-700 dark:text-amber-400">
                    Você precisa cadastrar seu telefone no perfil para receber notificações.
                  </p>
                </div>
              )}

              {userPhone && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Telefone: {userPhone}
                  </p>
                </div>
              )}

              {/* Mensagem Motivacional Diária */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      Motivação Diária
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Mensagem personalizada do Dr. Vital
                    </p>
                  </div>
                  <Switch
                    checked={settings.whatsapp_daily_motivation}
                    onCheckedChange={(checked) => saveSettings({ whatsapp_daily_motivation: checked })}
                    disabled={saving}
                  />
                </div>

                {settings.whatsapp_daily_motivation && (
                  <div className="ml-6 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Select
                      value={settings.whatsapp_daily_time}
                      onValueChange={(value) => saveSettings({ whatsapp_daily_time: value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="h-px bg-border/50" />

              {/* Lembretes de Água */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      Lembretes de Água
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Lembretes para beber água durante o dia
                    </p>
                  </div>
                  <Switch
                    checked={settings.whatsapp_water_enabled}
                    onCheckedChange={(checked) => saveSettings({ whatsapp_water_enabled: checked })}
                    disabled={saving}
                  />
                </div>

                {settings.whatsapp_water_enabled && (
                  <div className="ml-6 space-y-2">
                    <p className="text-xs text-muted-foreground">Selecione os horários:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {waterTimeOptions.map((time) => {
                        const isSelected = settings.whatsapp_water_times?.includes(time);
                        return (
                          <Badge
                            key={time}
                            variant={isSelected ? 'default' : 'outline'}
                            className={`cursor-pointer transition-all text-xs px-2 py-0.5 ${
                              isSelected 
                                ? 'bg-blue-500 hover:bg-blue-600' 
                                : 'hover:bg-blue-500/10'
                            }`}
                            onClick={() => toggleWaterTime(time)}
                          >
                            {time}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px bg-border/50" />

              {/* Missão do Dia */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-orange-500" />
                      Missão do Dia
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Lembrete para completar sua missão
                    </p>
                  </div>
                  <Switch
                    checked={settings.whatsapp_mission_enabled}
                    onCheckedChange={(checked) => saveSettings({ whatsapp_mission_enabled: checked })}
                    disabled={saving}
                  />
                </div>

                {settings.whatsapp_mission_enabled && (
                  <div className="ml-6 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Select
                      value={settings.whatsapp_mission_time}
                      onValueChange={(value) => saveSettings({ whatsapp_mission_time: value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="h-px bg-border/50" />

              {/* Metas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-500" />
                      Lembretes de Metas
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Acompanhamento do progresso das metas
                    </p>
                  </div>
                  <Switch
                    checked={settings.whatsapp_goals_enabled}
                    onCheckedChange={(checked) => saveSettings({ whatsapp_goals_enabled: checked })}
                    disabled={saving}
                  />
                </div>

                {settings.whatsapp_goals_enabled && (
                  <div className="ml-6 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Select
                      value={settings.whatsapp_goals_time}
                      onValueChange={(value) => saveSettings({ whatsapp_goals_time: value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="h-px bg-border/50" />

              {/* Desafios */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Lembretes de Desafios
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Atualizações sobre desafios ativos
                    </p>
                  </div>
                  <Switch
                    checked={settings.whatsapp_challenges_enabled}
                    onCheckedChange={(checked) => saveSettings({ whatsapp_challenges_enabled: checked })}
                    disabled={saving}
                  />
                </div>

                {settings.whatsapp_challenges_enabled && (
                  <div className="ml-6 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <Select
                      value={settings.whatsapp_challenges_time}
                      onValueChange={(value) => saveSettings({ whatsapp_challenges_time: value })}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-24 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time.value} value={time.value}>
                            {time.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="h-px bg-border/50" />

              {/* Relatório Semanal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-500" />
                      Relatório Semanal
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Resumo completo da sua semana
                    </p>
                  </div>
                  <Switch
                    checked={settings.whatsapp_weekly_report}
                    onCheckedChange={(checked) => saveSettings({ whatsapp_weekly_report: checked })}
                    disabled={saving}
                  />
                </div>

                {settings.whatsapp_weekly_report && (
                  <div className="ml-6 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <Select
                      value={String(settings.whatsapp_weekly_day)}
                      onValueChange={(value) => saveSettings({ whatsapp_weekly_day: parseInt(value) })}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-36 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day) => (
                          <SelectItem key={day.value} value={String(day.value)}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="h-px bg-border" />

              {/* Botão de Teste */}
              <Button
                onClick={testWhatsAppMessage}
                disabled={testingSend || !userPhone}
                variant="outline"
                className="w-full"
              >
                {testingSend ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem de Teste
                  </>
                )}
              </Button>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default WhatsAppNotificationSettings;
