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
        <Button variant="ghost" size="icon" className="relative">
          <Bell className={`h-7 w-7 transition-all duration-300 ${unreadCount > 0 ? 'animate-[bell-ring_1s_ease-in-out_infinite] text-primary' : ''}`} />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center text-sm font-bold animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary animate-ping" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 border-b">
          <h3 className="font-semibold">Notificações</h3>
        </div>
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="p-3 cursor-pointer hover:bg-muted"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="w-full">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm line-clamp-1">
                      {notification.title}
                    </h4>
                    {!notification.is_read && (
                      <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        
        {notifications.length > 0 && (
          <div className="p-2 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full"
              onClick={() => {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
              }}
            >
              Marcar todas como lidas
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};