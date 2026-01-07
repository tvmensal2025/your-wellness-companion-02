import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageButtonProps {
  unreadCount: number;
  onClick: () => void;
  variant?: 'icon' | 'full';
  className?: string;
}

export const MessageButton: React.FC<MessageButtonProps> = ({
  unreadCount,
  onClick,
  variant = 'icon',
  className = '',
}) => {
  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`relative ${className}`}
        onClick={onClick}
      >
        <MessageCircle className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          </motion.div>
        )}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className={`gap-2 ${className}`}
      onClick={onClick}
    >
      <MessageCircle className="w-4 h-4" />
      Mensagens
      {unreadCount > 0 && (
        <Badge className="ml-1 h-5 min-w-[20px] px-1.5 text-[10px] bg-primary text-primary-foreground">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  );
};
