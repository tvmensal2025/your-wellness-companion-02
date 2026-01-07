import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bell, Clock, Calendar, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
}

const defaultSettings: WhatsAppSettings = {
  whatsapp_enabled: true,
  whatsapp_daily_motivation: true,
  whatsapp_daily_time: '07:00',
  whatsapp_weekly_report: true,
  whatsapp_weekly_day: 5,
  whatsapp_reminders: true,
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
  { value: '12:00', label: '12:00' },
  { value: '18:00', label: '18:00' },
  { value: '20:00', label: '20:00' },
];

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
      // Query without type checking - columns may not exist yet
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
            <CardContent className="pt-0 space-y-6">
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
                    Telefone cadastrado: {userPhone}
                  </p>
                </div>
              )}

              {/* Mensagem Motivacional Diária */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Mensagem Motivacional Diária
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receba uma mensagem personalizada do Dr. Vital todas as manhãs
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
                      <SelectTrigger className="w-32">
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

              {/* Relatório Semanal */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Relatório Semanal
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Receba um resumo completo da sua semana com análise do Dr. Vital
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
                      <SelectTrigger className="w-40">
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

              {/* Lembretes Inteligentes */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Lembretes Inteligentes
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Lembretes sobre água, peso, missões e streak em risco
                  </p>
                </div>
                <Switch
                  checked={settings.whatsapp_reminders}
                  onCheckedChange={(checked) => saveSettings({ whatsapp_reminders: checked })}
                  disabled={saving}
                />
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
