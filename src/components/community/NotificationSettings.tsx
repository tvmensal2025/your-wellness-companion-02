import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
  Share2,
  Trophy,
  Award,
  Mail,
  Smartphone,
  Moon,
  Save,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { NotificationPreferences } from '@/hooks/useNotifications';

interface NotificationSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: NotificationPreferences;
  onUpdatePreferences: (preferences: Partial<NotificationPreferences>) => void;
}

const notificationTypes = [
  { key: 'likes_enabled', label: 'Curtidas', description: 'Quando alguém curte seu post', icon: Heart, color: 'text-rose-500' },
  { key: 'comments_enabled', label: 'Comentários', description: 'Quando comentam em seus posts', icon: MessageCircle, color: 'text-blue-500' },
  { key: 'follows_enabled', label: 'Seguidores', description: 'Quando alguém começa a te seguir', icon: UserPlus, color: 'text-emerald-500' },
  { key: 'mentions_enabled', label: 'Menções', description: 'Quando você é mencionado', icon: AtSign, color: 'text-purple-500' },
  { key: 'shares_enabled', label: 'Compartilhamentos', description: 'Quando compartilham seu conteúdo', icon: Share2, color: 'text-orange-500' },
  { key: 'challenges_enabled', label: 'Desafios', description: 'Atualizações de desafios', icon: Trophy, color: 'text-amber-500' },
  { key: 'achievements_enabled', label: 'Conquistas', description: 'Novas conquistas desbloqueadas', icon: Award, color: 'text-yellow-500' },
  { key: 'direct_messages_enabled', label: 'Mensagens', description: 'Novas mensagens diretas', icon: MessageCircle, color: 'text-primary' },
];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  open,
  onOpenChange,
  preferences,
  onUpdatePreferences,
}) => {
  const handleToggle = (key: string, value: boolean) => {
    onUpdatePreferences({ [key]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Preferências de Notificação
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="p-6 space-y-6">
            {/* Notification Types */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Tipos de Notificação
              </h3>
              
              <div className="space-y-3">
                {notificationTypes.map((type, index) => {
                  const Icon = type.icon;
                  const isEnabled = preferences[type.key as keyof NotificationPreferences] as boolean;
                  
                  return (
                    <motion.div
                      key={type.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-background ${type.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <Label className="font-medium">{type.label}</Label>
                          <p className="text-xs text-muted-foreground">
                            {type.description}
                          </p>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleToggle(type.key, checked)}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Delivery Methods */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Métodos de Entrega
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-background text-primary">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className="font-medium">Push Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Receber notificações no dispositivo
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.push_notifications}
                    onCheckedChange={(checked) => handleToggle('push_notifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-background text-primary">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <Label className="font-medium">Email</Label>
                      <p className="text-xs text-muted-foreground">
                        Receber resumo por email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => handleToggle('email_notifications', checked)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Quiet Hours */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <Moon className="w-4 h-4" />
                Horário Silencioso
              </h3>
              <p className="text-xs text-muted-foreground">
                Pause as notificações durante determinados horários
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Início</Label>
                  <Input
                    type="time"
                    value={preferences.quiet_hours_start || ''}
                    onChange={(e) => handleToggle('quiet_hours_start', e.target.value as any)}
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Fim</Label>
                  <Input
                    type="time"
                    value={preferences.quiet_hours_end || ''}
                    onChange={(e) => handleToggle('quiet_hours_end', e.target.value as any)}
                    className="bg-muted/30"
                  />
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-0">
          <Button 
            className="w-full gap-2" 
            onClick={() => onOpenChange(false)}
          >
            <Save className="w-4 h-4" />
            Salvar Preferências
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
