import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Heart, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ActiveUser {
  id: string;
  name: string;
  avatar?: string;
  activity: 'workout' | 'nutrition' | 'challenge' | 'online';
  activityLabel?: string;
  streak?: number;
}

interface ActiveUsersStatusProps {
  users: ActiveUser[];
  onMotivate?: (userId: string, userName: string) => void;
  onViewProfile?: (userId: string) => void;
}

const activityConfig = {
  workout: { 
    icon: Dumbbell, 
    color: 'text-orange-400', 
    bg: 'bg-orange-500/20',
    pulse: 'animate-pulse',
    label: 'Treinando agora'
  },
  nutrition: { 
    icon: Sparkles, 
    color: 'text-green-400', 
    bg: 'bg-green-500/20',
    pulse: '',
    label: 'Registrando refeição'
  },
  challenge: { 
    icon: Zap, 
    color: 'text-purple-400', 
    bg: 'bg-purple-500/20',
    pulse: 'animate-pulse',
    label: 'Em desafio'
  },
  online: { 
    icon: null, 
    color: 'text-green-400', 
    bg: 'bg-green-500',
    pulse: '',
    label: 'Online'
  },
};

export const ActiveUsersStatus: React.FC<ActiveUsersStatusProps> = ({
  users,
  onMotivate,
  onViewProfile,
}) => {
  const handleMotivate = (userId: string, userName: string) => {
    onMotivate?.(userId, userName);
    toast.success(`💪 Você motivou ${userName}!`, {
      description: 'Sua energia positiva foi enviada!'
    });
  };

  if (!users?.length) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <div className="relative">
            <Dumbbell className="w-4 h-4 text-orange-500" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          🏋️ Ativos Agora
          <Badge variant="secondary" className="ml-auto text-[10px]">
            {users.length} online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <AnimatePresence>
          {users.slice(0, 5).map((user, index) => {
            const config = activityConfig[user.activity];
            const IconComponent = config.icon;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 transition-colors group"
              >
                <div 
                  className="relative cursor-pointer"
                  onClick={() => onViewProfile?.(user.id)}
                >
                  <Avatar className="w-9 h-9 ring-2 ring-primary/20">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {/* Activity indicator */}
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center",
                    config.bg,
                    config.pulse
                  )}>
                    {IconComponent ? (
                      <IconComponent className={cn("w-2.5 h-2.5", config.color)} />
                    ) : (
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className={cn("text-[10px] truncate", config.color)}>
                    {user.activityLabel || config.label}
                  </p>
                </div>
                
                {user.streak && user.streak > 0 && (
                  <Badge variant="outline" className="text-[10px] border-orange-500/30 text-orange-500">
                    🔥 {user.streak}
                  </Badge>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-pink-500 hover:text-pink-600 hover:bg-pink-500/10"
                  onClick={() => handleMotivate(user.id, user.name)}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {users.length > 5 && (
          <p className="text-xs text-center text-muted-foreground pt-1">
            +{users.length - 5} mais ativos
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Botão de motivar standalone para usar em outros lugares
export const MotivateButton: React.FC<{
  userId: string;
  userName: string;
  onMotivate?: (userId: string, userName: string) => void;
  variant?: 'icon' | 'full';
  className?: string;
}> = ({ userId, userName, onMotivate, variant = 'icon', className }) => {
  const [isAnimating, setIsAnimating] = React.useState(false);

  const handleClick = () => {
    setIsAnimating(true);
    onMotivate?.(userId, userName);
    toast.success(`💪 Você motivou ${userName}!`);
    setTimeout(() => setIsAnimating(false), 500);
  };

  if (variant === 'full') {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "gap-2 border-pink-500/30 text-pink-500 hover:bg-pink-500/10 hover:text-pink-600",
          className
        )}
        onClick={handleClick}
      >
        <motion.div
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Heart className={cn("w-4 h-4", isAnimating && "fill-pink-500")} />
        </motion.div>
        Motivar
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-8 w-8 text-pink-500 hover:text-pink-600 hover:bg-pink-500/10",
        className
      )}
      onClick={handleClick}
    >
      <motion.div
        animate={isAnimating ? { scale: [1, 1.5, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart className={cn("w-4 h-4", isAnimating && "fill-pink-500")} />
      </motion.div>
    </Button>
  );
};
