import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  Crown, 
  Flame,
  Target,
  Star,
  UserPlus,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  position: number;
  streak: number;
  isOnline?: boolean;
}

interface SuggestedUser {
  id: string;
  name: string;
  avatar?: string;
  mutualFriends: number;
  level: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
  participants: number;
}

interface RightSidebarProps {
  topUsers: RankingUser[];
  suggestedUsers: SuggestedUser[];
  upcomingEvents: Event[];
  onFollowUser: (userId: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  topUsers,
  suggestedUsers,
  upcomingEvents,
  onFollowUser
}) => {
  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (position === 2) return <Trophy className="w-4 h-4 text-gray-400" />;
    if (position === 3) return <Trophy className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs font-bold text-muted-foreground">#{position}</span>;
  };

  return (
    <div className="w-80 space-y-4 sticky top-4">
      {/* Top 5 Ranking */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-5 h-5 text-primary" />
            Top 5 da Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topUsers.slice(0, 5).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="w-6 flex items-center justify-center">
                {getPositionIcon(user.position)}
              </div>
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {user.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {user.isOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    {user.points.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    {user.streak}d
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-primary" />
            Pessoas que você pode conhecer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-muted">
                  {user.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.mutualFriends} amigos em comum
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="h-8 rounded-full"
                onClick={() => onFollowUser(user.id)}
              >
                <UserPlus className="w-3 h-3 mr-1" />
                Seguir
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-5 h-5 text-primary" />
            Próximos Eventos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {upcomingEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <p className="font-medium text-sm">{event.title}</p>
              <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                <span>{event.date}</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.participants} participantes
                </span>
              </div>
            </motion.div>
          ))}
          <Button variant="ghost" size="sm" className="w-full">
            Ver todos os eventos
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Sua Evolução</p>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <p className="text-lg font-bold text-primary">+15%</p>
              <p className="text-xs text-muted-foreground">Engajamento</p>
            </div>
            <div className="text-center p-2 bg-background/50 rounded-lg">
              <p className="text-lg font-bold text-emerald-600">+230</p>
              <p className="text-xs text-muted-foreground">Pontos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
