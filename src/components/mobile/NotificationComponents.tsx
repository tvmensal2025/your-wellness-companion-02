import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, Check, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

// ============================================
// NOTIFICATION PERMISSION PROMPT
// ============================================

interface NotificationPermissionPromptProps {
  onComplete?: () => void;
  className?: string;
  title?: string;
  description?: string;
}

export const NotificationPermissionPrompt: React.FC<NotificationPermissionPromptProps> = ({
  onComplete,
  className,
  title = 'Ativar Notificações',
  description = 'Receba lembretes sobre suas metas, desafios e atualizações importantes.',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const { permission, requestPermission, isSupported } = usePushNotifications();
  const { shouldReduceMotion } = useReducedMotion();

  const handleEnable = async () => {
    await requestPermission();
    setIsVisible(false);
    onComplete?.();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onComplete?.();
  };

  if (!isSupported || permission === 'granted' || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={shouldReduceMotion ? {} : { opacity: 0, y: -20 }}
        className={cn('w-full', className)}
      >
        <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <CardDescription className="mt-2">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDismiss}
                className="flex-1"
              >
                Agora não
              </Button>
              <Button
                onClick={handleEnable}
                className="flex-1"
              >
                <Bell className="w-4 h-4 mr-2" />
                Ativar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

// ============================================
// NOTIFICATION SETTINGS CARD
// ============================================

interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface NotificationSettingsProps {
  categories?: NotificationCategory[];
  onCategoryChange?: (id: string, enabled: boolean) => void;
  className?: string;
}

const defaultCategories: NotificationCategory[] = [
  {
    id: 'reminders',
    label: 'Lembretes Diários',
    description: 'Receba lembretes sobre suas missões e objetivos',
    enabled: true,
  },
  {
    id: 'challenges',
    label: 'Desafios',
    description: 'Atualizações sobre seus desafios ativos',
    enabled: true,
  },
  {
    id: 'achievements',
    label: 'Conquistas',
    description: 'Saiba quando desbloquear novas conquistas',
    enabled: true,
  },
  {
    id: 'tips',
    label: 'Dicas de Saúde',
    description: 'Receba dicas personalizadas da Sofia',
    enabled: false,
  },
];

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  categories = defaultCategories,
  onCategoryChange,
  className,
}) => {
  const [localCategories, setLocalCategories] = useState(categories);
  const { permission, requestPermission, isSupported, isRegistered, register } = usePushNotifications();

  const isEnabled = permission === 'granted' && isRegistered;

  const handleMasterToggle = async () => {
    if (isEnabled) {
      // This would typically unregister from push notifications
      // For now, we just indicate they can manage in device settings
    } else {
      const granted = await requestPermission();
      if (granted) {
        await register();
      }
    }
  };

  const handleCategoryToggle = (id: string, enabled: boolean) => {
    setLocalCategories(prev =>
      prev.map(cat => cat.id === id ? { ...cat, enabled } : cat)
    );
    onCategoryChange?.(id, enabled);
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardContent className="py-6 text-center">
          <BellOff className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Notificações não são suportadas neste dispositivo
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Notificações</CardTitle>
              <CardDescription>
                {isEnabled ? 'Ativadas' : 'Desativadas'}
              </CardDescription>
            </div>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={handleMasterToggle}
          />
        </div>
      </CardHeader>

      <AnimatePresence>
        {isEnabled && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <CardContent className="pt-0 space-y-4">
              <div className="h-px bg-border" />
              
              {localCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{category.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <Switch
                    checked={category.enabled}
                    onCheckedChange={(enabled) => handleCategoryToggle(category.id, enabled)}
                  />
                </div>
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// ============================================
// NOTIFICATION BADGE
// ============================================

interface NotificationBadgeProps {
  count: number;
  className?: string;
  max?: number;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className,
  max = 99,
}) => {
  const { shouldReduceMotion } = useReducedMotion();

  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  return (
    <motion.span
      initial={shouldReduceMotion ? {} : { scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1',
        'flex items-center justify-center',
        'rounded-full bg-destructive text-destructive-foreground',
        'text-xs font-medium',
        className
      )}
    >
      {displayCount}
    </motion.span>
  );
};
