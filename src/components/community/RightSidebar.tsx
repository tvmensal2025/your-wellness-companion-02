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
  Star,
  UserPlus,
  Calendar,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { TrendingTopics } from './TrendingTopics';
import { SuggestedPosts } from './SuggestedPosts';
import { WeeklySummaryCard } from './WeeklySummaryCard';
import { FeedPost } from '@/hooks/useFeedPosts';

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

interface TrendingTopic {
  tag: string;
  count: number;
  engagement: number;
  recentPosts: number;
  trendScore: number;
}

interface RightSidebarProps {
  topUsers: RankingUser[];
  suggestedUsers: SuggestedUser[];
  upcomingEvents: Event[];
  onFollowUser: (userId: string) => void;
  // New Phase 4 props
  trendingTopics?: TrendingTopic[];
  onTopicClick?: (tag: string) => void;
  suggestedPosts?: FeedPost[];
  onPostClick?: (postId: string) => void;
  allPosts?: FeedPost[];
  userPosts?: FeedPost[];
  showWeeklySummary?: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  topUsers,
  suggestedUsers,
  upcomingEvents,
  onFollowUser,
  trendingTopics = [],
  onTopicClick = () => {},
  suggestedPosts = [],
  onPostClick = () => {},
  allPosts = [],
  userPosts = [],
  showWeeklySummary = true,
}) => {
  const getPositionIcon = (position: number) => {
    if (position === 1) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (position === 2) return <Trophy className="w-4 h-4 text-gray-400" />;
    if (position === 3) return <Trophy className="w-4 h-4 text-amber-600" />;
    return <span className="text-xs font-bold text-muted-foreground">#{position}</span>;
  };

  return (
    <div className="w-80 space-y-4 sticky top-4">
      {/* Weekly Summary Card */}
      {showWeeklySummary && userPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WeeklySummaryCard 
            posts={allPosts} 
            userPosts={userPosts} 
          />
        </motion.div>
      )}

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TrendingTopics 
            topics={trendingTopics} 
            onTopicClick={onTopicClick} 
          />
        </motion.div>
      )}

      {/* Suggested Posts */}
      {suggestedPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <SuggestedPosts 
            posts={suggestedPosts} 
            onPostClick={onPostClick}
            title="Recomendados"
            reason="Baseado no seu engajamento"
          />
        </motion.div>
      )}

      {/* Top 5 Ranking */}
      <Card className="border-blue-200/50 dark:border-blue-800/50 bg-white dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-400">
            <Trophy className="w-5 h-5" />
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
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
            >
              <div className="w-6 flex items-center justify-center">
                {getPositionIcon(user.position)}
              </div>
              <div className="relative">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-600">
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
      <Card className="border-blue-200/50 dark:border-blue-800/50 bg-white dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-400">
            <Users className="w-5 h-5" />
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
                <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600">
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
                className="h-8 rounded-full border-blue-300 dark:border-blue-700 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
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
      <Card className="border-blue-200/50 dark:border-blue-800/50 bg-white dark:bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base text-blue-700 dark:text-blue-400">
            <Calendar className="w-5 h-5" />
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
              className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors cursor-pointer border border-blue-200/30 dark:border-blue-800/30"
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
          <Button variant="ghost" size="sm" className="w-full text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950">
            Ver todos os eventos
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50 dark:border-blue-800/50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-sm">Sua Evolução</p>
              <p className="text-xs text-muted-foreground">Esta semana</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 bg-white/70 dark:bg-background/50 rounded-lg">
              <p className="text-lg font-bold text-blue-600">+15%</p>
              <p className="text-xs text-muted-foreground">Engajamento</p>
            </div>
            <div className="text-center p-2 bg-white/70 dark:bg-background/50 rounded-lg">
              <p className="text-lg font-bold text-emerald-600">+230</p>
              <p className="text-xs text-muted-foreground">Pontos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
