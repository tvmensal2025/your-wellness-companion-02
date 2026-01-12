import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Target, 
  Users, 
  Flame, 
  TrendingUp,
  Sparkles,
  Clock,
  ChevronRight,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: 'weight_loss' | 'streak' | 'challenge' | 'workout' | 'nutrition';
  title: string;
  value: string;
  timeAgo: string;
}

interface ActiveChallenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  daysLeft: number;
  progress?: number;
  icon: string;
}

interface NewMember {
  id: string;
  name: string;
  avatar?: string;
  joinedAgo: string;
}

interface CommunityHighlightsProps {
  recentAchievements?: Achievement[];
  activeChallenge?: ActiveChallenge;
  newMembers?: NewMember[];
  onMotivate?: (userId: string) => void;
  onJoinChallenge?: (challengeId: string) => void;
  onViewProfile?: (userId: string) => void;
}

const achievementIcons = {
  weight_loss: { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/20' },
  streak: { icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  challenge: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  workout: { icon: Target, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  nutrition: { icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/20' },
};

export const RecentAchievements: React.FC<{
  achievements: Achievement[];
  onMotivate?: (userId: string) => void;
  onViewProfile?: (userId: string) => void;
}> = ({ achievements, onMotivate, onViewProfile }) => {
  if (!achievements?.length) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          🏆 Conquistas Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {achievements.slice(0, 4).map((achievement, index) => {
          const iconConfig = achievementIcons[achievement.type];
          const IconComponent = iconConfig.icon;
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
              onClick={() => onViewProfile?.(achievement.userId)}
            >
              <div className="relative">
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarImage src={achievement.userAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {achievement.userName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center",
                  iconConfig.bg
                )}>
                  <IconComponent className={cn("w-3 h-3", iconConfig.color)} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{achievement.userName}</p>
                <p className="text-xs text-muted-foreground truncate">{achievement.title}</p>
              </div>
              
              <div className="text-right">
                <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                  {achievement.value}
                </Badge>
                <p className="text-[10px] text-muted-foreground mt-0.5">{achievement.timeAgo}</p>
              </div>
              
              {onMotivate && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-pink-500 hover:text-pink-600 hover:bg-pink-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMotivate(achievement.userId);
                  }}
                >
                  <Heart className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export const WeeklyChallenge: React.FC<{
  challenge: ActiveChallenge;
  onJoin?: (challengeId: string) => void;
}> = ({ challenge, onJoin }) => {
  if (!challenge) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-accent/10 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          📊 Desafio da Semana
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl">
              {challenge.icon}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-sm">{challenge.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{challenge.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{challenge.participants} participantes</span>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{challenge.daysLeft} dias restantes</span>
            </div>
          </div>
          
          {challenge.progress !== undefined && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Seu progresso</span>
                <span className="font-medium text-primary">{challenge.progress}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${challenge.progress}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                />
              </div>
            </div>
          )}
          
          <Button 
            className="w-full gap-2" 
            size="sm"
            onClick={() => onJoin?.(challenge.id)}
          >
            {challenge.progress !== undefined ? 'Ver Detalhes' : 'Participar'}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export const NewMembersWelcome: React.FC<{
  members: NewMember[];
  onViewProfile?: (userId: string) => void;
}> = ({ members, onViewProfile }) => {
  if (!members?.length) return null;

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-500" />
          👥 Novos Membros
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Avatar 
                  className="w-9 h-9 border-2 border-background cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  onClick={() => onViewProfile?.(member.id)}
                >
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {member.name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{members[0]?.name}</span>
              {members.length > 1 && ` e mais ${members.length - 1}`} entraram recentemente
            </p>
          </div>
          <Button variant="outline" size="sm" className="text-xs h-7">
            👋 Boas-vindas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente combinado para usar na sidebar ou feed
export const CommunityHighlights: React.FC<CommunityHighlightsProps> = ({
  recentAchievements = [],
  activeChallenge,
  newMembers = [],
  onMotivate,
  onJoinChallenge,
  onViewProfile,
}) => {
  return (
    <div className="space-y-4">
      {activeChallenge && (
        <WeeklyChallenge challenge={activeChallenge} onJoin={onJoinChallenge} />
      )}
      
      {recentAchievements.length > 0 && (
        <RecentAchievements 
          achievements={recentAchievements} 
          onMotivate={onMotivate}
          onViewProfile={onViewProfile}
        />
      )}
      
      {newMembers.length > 0 && (
        <NewMembersWelcome members={newMembers} onViewProfile={onViewProfile} />
      )}
    </div>
  );
};
