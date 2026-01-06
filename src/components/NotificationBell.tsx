import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  is_read?: boolean;
}

// Sofia tips to show as notifications
const sofiaTips = [
  { id: '1', title: 'Dica da Sofia', message: 'Beba água antes das refeições para aumentar a saciedade' },
  { id: '2', title: 'Dica da Sofia', message: 'Mantenha a consistência! Resultados vêm com o tempo' },
  { id: '3', title: 'Dica da Sofia', message: 'Registre seu peso no mesmo horário para maior precisão' },
  { id: '4', title: 'Dica da Sofia', message: 'Pequenos progressos diários geram grandes transformações' },
  { id: '5', title: 'Dica da Sofia', message: 'O sono é fundamental para o controle do peso' },
  { id: '6', title: 'Lembrete', message: 'Não esqueça de registrar sua refeição hoje!' },
  { id: '7', title: 'Motivação', message: 'Cada passo conta na sua jornada de saúde!' },
];

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Load a random Sofia tip as notification
    const randomTip = sofiaTips[Math.floor(Math.random() * sofiaTips.length)];
    const notification: Notification = {
      ...randomTip,
      created_at: new Date().toISOString(),
      is_read: false,
    };
    setNotifications([notification]);
    setUnreadCount(1);
  }, []);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, is_read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 hover:bg-primary/10 transition-colors">
          <Bell className={`h-5 w-5 transition-all duration-300 ${unreadCount > 0 ? 'animate-[bell-ring_1s_ease-in-out_infinite] text-primary' : 'text-muted-foreground'}`} />
          {unreadCount > 0 && (
            <>
              <Badge 
                variant="destructive" 
                className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] font-bold animate-pulse shadow-lg"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive animate-ping opacity-50" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden rounded-xl shadow-xl border-border/50">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Notificações</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} nova${unreadCount > 1 ? 's' : ''}` : 'Tudo em dia!'}
              </p>
            </div>
          </div>
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
              <Bell className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification, index) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer border-b border-border/30 last:border-0 focus:bg-primary/5 transition-colors ${
                  !notification.is_read ? 'bg-primary/5' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3 w-full">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.title.includes('Sofia') 
                      ? 'bg-gradient-to-br from-primary/20 to-primary/5' 
                      : notification.title.includes('Lembrete')
                        ? 'bg-gradient-to-br from-amber-500/20 to-amber-500/5'
                        : 'bg-gradient-to-br from-green-500/20 to-green-500/5'
                  }`}>
                    <span className="text-lg">
                      {notification.title.includes('Sofia') ? '💡' : notification.title.includes('Lembrete') ? '⏰' : '🎯'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-sm text-foreground">
                        {notification.title}
                      </h4>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1.5">
                      {formatDate(notification.created_at)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border/50 bg-muted/30">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-primary hover:text-primary hover:bg-primary/10 font-medium"
              onClick={() => {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
              }}
            >
              ✓ Marcar todas como lidas
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};