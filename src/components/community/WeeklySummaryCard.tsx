import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Flame,
  Heart,
  MessageCircle,
  Share2,
  Trophy,
  Target,
  Sparkles,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { FeedPost } from '@/hooks/useFeedPosts';

interface WeeklySummaryCardProps {
  posts: FeedPost[];
  userPosts: FeedPost[];
  userName?: string;
}

export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({
  posts,
  userPosts,
  userName = "Você"
}) => {
  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // This week's posts
    const thisWeekPosts = userPosts.filter(p => 
      new Date(p.created_at) >= weekAgo
    );

    // Last week's posts (for comparison)
    const lastWeekPosts = userPosts.filter(p => {
      const date = new Date(p.created_at);
      return date >= twoWeeksAgo && date < weekAgo;
    });

    // Calculate stats
    const thisWeekLikes = thisWeekPosts.reduce((sum, p) => sum + p.likes_count, 0);
    const lastWeekLikes = lastWeekPosts.reduce((sum, p) => sum + p.likes_count, 0);
    const likesChange = lastWeekLikes > 0 
      ? ((thisWeekLikes - lastWeekLikes) / lastWeekLikes) * 100 
      : thisWeekLikes > 0 ? 100 : 0;

    const thisWeekComments = thisWeekPosts.reduce((sum, p) => sum + p.comments_count, 0);
    const lastWeekComments = lastWeekPosts.reduce((sum, p) => sum + p.comments_count, 0);
    const commentsChange = lastWeekComments > 0 
      ? ((thisWeekComments - lastWeekComments) / lastWeekComments) * 100 
      : thisWeekComments > 0 ? 100 : 0;

    const thisWeekShares = thisWeekPosts.reduce((sum, p) => sum + p.shares_count, 0);

    // Community stats
    const communityThisWeek = posts.filter(p => 
      new Date(p.created_at) >= weekAgo
    );
    const totalCommunityLikes = communityThisWeek.reduce((sum, p) => sum + p.likes_count, 0);
    const userPercentage = totalCommunityLikes > 0 
      ? (thisWeekLikes / totalCommunityLikes) * 100 
      : 0;

    // Engagement rate
    const engagementRate = thisWeekPosts.length > 0
      ? (thisWeekLikes + thisWeekComments + thisWeekShares) / thisWeekPosts.length
      : 0;

    // Best post
    const bestPost = thisWeekPosts.length > 0
      ? thisWeekPosts.reduce((best, post) => 
          (post.likes_count + post.comments_count) > (best.likes_count + best.comments_count) 
            ? post 
            : best
        )
      : null;

    return {
      postsCount: thisWeekPosts.length,
      likes: thisWeekLikes,
      likesChange,
      comments: thisWeekComments,
      commentsChange,
      shares: thisWeekShares,
      engagementRate,
      userPercentage,
      bestPost,
    };
  }, [posts, userPosts]);

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (change < 0) return <TrendingDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-emerald-500';
    if (change < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  return (
    <Card className="overflow-hidden border-primary/20">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            Resumo da Semana
          </div>
          <Badge variant="outline" className="text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            Últimos 7 dias
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center p-3 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/20"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Heart className="w-4 h-4 text-rose-500" />
              {getTrendIcon(stats.likesChange)}
            </div>
            <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {stats.likes}
            </p>
            <p className="text-xs text-muted-foreground">curtidas</p>
            <p className={`text-[10px] ${getTrendColor(stats.likesChange)}`}>
              {stats.likesChange > 0 ? '+' : ''}{stats.likesChange.toFixed(0)}%
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center p-3 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <MessageCircle className="w-4 h-4 text-blue-500" />
              {getTrendIcon(stats.commentsChange)}
            </div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {stats.comments}
            </p>
            <p className="text-xs text-muted-foreground">comentários</p>
            <p className={`text-[10px] ${getTrendColor(stats.commentsChange)}`}>
              {stats.commentsChange > 0 ? '+' : ''}{stats.commentsChange.toFixed(0)}%
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20"
          >
            <div className="flex items-center justify-center gap-1 mb-1">
              <Share2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.shares}
            </p>
            <p className="text-xs text-muted-foreground">compartilhamentos</p>
          </motion.div>
        </div>

        {/* Engagement Rate */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-3 rounded-xl bg-muted/30"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Taxa de Engajamento</span>
            </div>
            <span className="text-sm font-bold text-primary">
              {stats.engagementRate.toFixed(1)} interações/post
            </span>
          </div>
          <Progress 
            value={Math.min(stats.engagementRate * 10, 100)} 
            className="h-2"
          />
        </motion.div>

        {/* Community Position */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-3 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/10"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Sua participação na comunidade</p>
              <p className="text-xs text-muted-foreground">
                {stats.userPercentage.toFixed(1)}% das curtidas da semana
              </p>
            </div>
          </div>
        </motion.div>

        {/* Best Post */}
        {stats.bestPost && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100/30 dark:from-amber-950/30 dark:to-amber-900/10 border border-amber-200/50 dark:border-amber-800/30"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Melhor Post da Semana
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {stats.bestPost.content}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500" />
                {stats.bestPost.likes_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3 text-blue-500" />
                {stats.bestPost.comments_count}
              </span>
            </div>
          </motion.div>
        )}

        {/* Posts count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <span>Posts criados esta semana</span>
          <Badge variant="secondary">{stats.postsCount}</Badge>
        </div>
      </CardContent>
    </Card>
  );
};
