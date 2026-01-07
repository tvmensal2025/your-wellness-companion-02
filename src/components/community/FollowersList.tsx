import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, UserCheck, User, TrendingDown, TrendingUp, Scale, MessageCircle, Lock, Sparkles, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MiniWeightChart } from './MiniWeightChart';
import { AchievementBadges } from './AchievementBadges';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeightDataPoint {
  date: string;
  peso_kg: number;
}

interface Achievement {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  description?: string;
  earned_at?: string;
}

interface FollowerUser {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  weight_change?: number;
  show_weight_results?: boolean;
  weightHistory?: WeightDataPoint[];
  recentAchievements?: Achievement[];
  followed_at?: string;
  is_mutual?: boolean;
}

interface FollowersListProps {
  onProfileClick: (userId: string) => void;
  onMessageClick?: (userId: string) => void;
  onClose?: () => void;
}

export const FollowersList: React.FC<FollowersListProps> = ({ onProfileClick, onMessageClick, onClose }) => {
  const { user } = useAuth();
  const { followUser, unfollowUser, isFollowing, following } = useFollow();
  const [users, setUsers] = useState<FollowerUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowers();
  }, [user, following]);

  const fetchFollowers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get list of users who follow ME
      const { data: followData, error: followError } = await supabase
        .from('health_feed_follows')
        .select('follower_id, created_at')
        .eq('following_id', user.id);

      if (followError) throw followError;

      if (!followData || followData.length === 0) {
        setUsers([]);
        return;
      }

      const followerIds = followData.map(f => f.follower_id);
      const followDates: Record<string, string> = {};
      followData.forEach(f => {
        followDates[f.follower_id] = f.created_at;
      });

      // Get profiles of followers
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, show_weight_results')
        .in('user_id', followerIds);

      if (profilesError) throw profilesError;

      // Get points from user_points
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('user_id, total_points')
        .in('user_id', followerIds);

      if (pointsError) throw pointsError;

      // Get weight data for users who allow it
      const usersShowingWeight = profiles?.filter(p => p.show_weight_results).map(p => p.user_id) || [];
      
      let weightChanges: Record<string, number> = {};
      let weightHistories: Record<string, WeightDataPoint[]> = {};
      
      if (usersShowingWeight.length > 0) {
        const weightPromises = usersShowingWeight.map(async (userId) => {
          const { data: weightData } = await supabase
            .from('weight_measurements')
            .select('user_id, peso_kg, measurement_date')
            .eq('user_id', userId)
            .order('measurement_date', { ascending: true })
            .limit(15);

          return { userId, weightData: weightData || [] };
        });

        const weightResults = await Promise.all(weightPromises);
        
        weightResults.forEach(({ userId, weightData }) => {
          if (weightData && weightData.length > 0) {
            const first = weightData[0].peso_kg;
            const last = weightData[weightData.length - 1].peso_kg;
            weightChanges[userId] = last - first;

            weightHistories[userId] = weightData.map(w => ({
              date: new Date(w.measurement_date).toLocaleDateString('pt-BR', { 
                month: 'short', 
                day: 'numeric' 
              }),
              peso_kg: w.peso_kg
            }));
          }
        });
      }

      // Fetch achievements
      let achievementsByUser: Record<string, Achievement[]> = {};
      
      try {
        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('id, user_id, achievement_name, achievement_type, description, earned_at')
          .in('user_id', followerIds)
          .order('earned_at', { ascending: false })
          .limit(50);

        if (userAchievements) {
          userAchievements.forEach((ach) => {
            if (!achievementsByUser[ach.user_id]) {
              achievementsByUser[ach.user_id] = [];
            }
            if (achievementsByUser[ach.user_id].length < 3) {
              achievementsByUser[ach.user_id].push({
                id: ach.id,
                name: ach.achievement_name || ach.achievement_type || 'Conquista',
                description: ach.description || undefined,
                earned_at: ach.earned_at || undefined,
                rarity: 'common'
              });
            }
          });
        }
      } catch (error) {
        console.warn('Erro ao buscar conquistas:', error);
      }

      // Combine data
      const combinedUsers: FollowerUser[] = (profiles || []).map(profile => ({
        id: profile.user_id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        show_weight_results: profile.show_weight_results,
        total_points: pointsData?.find(p => p.user_id === profile.user_id)?.total_points || 0,
        weight_change: weightChanges[profile.user_id],
        weightHistory: weightHistories[profile.user_id] || undefined,
        recentAchievements: achievementsByUser[profile.user_id] || undefined,
        followed_at: followDates[profile.user_id],
        is_mutual: isFollowing(profile.user_id)
      }));

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching followers:', error);
      toast.error('Erro ao carregar seguidores');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowBack = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    if (isFollowing(userId)) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
  };

  const handleMessage = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    onMessageClick?.(userId);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const normalizeAvatarUrl = (url: string | null | undefined): string | null => {
    if (!url || !url.trim()) return null;
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ciszqtlaacrhfwsqnvjr.supabase.co';
    
    if (url.startsWith('/storage/')) {
      return `${supabaseUrl}${url}`;
    }
    
    if (!url.includes('storage')) {
      return `${supabaseUrl}/storage/v1/object/public/avatars/${url}`;
    }
    
    return url;
  };

  const getUserLevel = (points: number) => {
    if (points >= 1000) return { level: 'Diamante', color: 'from-primary to-primary/70', emoji: '💎' };
    if (points >= 500) return { level: 'Ouro', color: 'from-primary/90 to-primary/60', emoji: '🥇' };
    if (points >= 200) return { level: 'Prata', color: 'from-muted-foreground to-muted-foreground/70', emoji: '🥈' };
    return { level: 'Bronze', color: 'from-secondary to-secondary/70', emoji: '🥉' };
  };

  const getFollowDuration = (followedAt?: string) => {
    if (!followedAt) return null;
    return formatDistanceToNow(new Date(followedAt), { addSuffix: false, locale: ptBR });
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground mt-4 font-medium">Carregando seguidores...</p>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-8 text-center relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shadow-lg"
          >
            <Users className="w-10 h-10 text-primary" />
          </motion.div>
          <h3 className="font-semibold text-xl mb-2">Nenhum seguidor ainda</h3>
          <p className="text-muted-foreground">Compartilhe sua jornada no feed para atrair seguidores!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Seguidores ({users.length})</h3>
          </div>
        </div>

        {users.map((follower, index) => {
          const userLevel = getUserLevel(follower.total_points);
          const followDuration = getFollowDuration(follower.followed_at);
          
          return (
            <motion.div
              key={follower.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card 
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 hover:to-primary/10 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer"
                onClick={() => onProfileClick(follower.user_id)}
              >
                {/* Animated border gradient */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ padding: '1px' }}>
                  <div className="w-full h-full bg-card rounded-lg" />
                </div>
                
                {/* Glow effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                
                {/* Mutual follow indicator */}
                {follower.is_mutual && (
                  <div className="absolute top-2 right-2 z-20">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                          <UserCheck className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-medium text-primary">Mútuo</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>Vocês se seguem mutuamente</TooltipContent>
                    </Tooltip>
                  </div>
                )}
                
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-start gap-4">
                    {/* Enhanced Avatar with animated ring */}
                    <div className="relative flex-shrink-0">
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/50 to-accent rounded-full opacity-60 group-hover:opacity-100 blur-sm transition-all duration-300 group-hover:animate-pulse" />
                      
                      <Avatar className="w-16 h-16 ring-2 ring-background shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-300">
                        {normalizeAvatarUrl(follower.avatar_url) ? (
                          <AvatarImage 
                            src={normalizeAvatarUrl(follower.avatar_url) || ''} 
                            alt={follower.full_name || ''}
                            className="object-cover"
                            loading="lazy"
                          />
                        ) : null}
                        <AvatarFallback className={`bg-gradient-to-br ${userLevel.color} text-white font-bold text-lg`}>
                          {getInitials(follower.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Level indicator */}
                      <div className="absolute -bottom-1 -right-1 z-20">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${userLevel.color} flex items-center justify-center shadow-lg border-2 border-background text-xs`}>
                              {userLevel.emoji}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            Nível {userLevel.level}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    {/* User info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors text-lg">
                          {follower.full_name || 'Usuário'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Points badge */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative overflow-hidden"
                        >
                          <Badge 
                            variant="secondary"
                            className="text-xs bg-primary/15 text-primary border border-primary/20 font-semibold px-3 py-1"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            {follower.total_points} pts
                          </Badge>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </motion.div>
                        
                        {/* Weight change badge */}
                        {follower.show_weight_results ? (
                          follower.weight_change !== undefined ? (
                            <Badge 
                              variant="outline" 
                              className={`text-xs flex items-center gap-1.5 font-semibold px-3 py-1 ${
                                follower.weight_change < 0 
                                  ? 'bg-green-500/10 text-green-700 border-green-500/30 dark:text-green-400 dark:bg-green-500/20' 
                                  : follower.weight_change > 0
                                    ? 'bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-400 dark:bg-orange-500/20'
                                    : 'bg-muted/50 text-muted-foreground border-muted'
                              }`}
                            >
                              {follower.weight_change < 0 ? (
                                <>
                                  <TrendingDown className="w-3.5 h-3.5" />
                                  -{Math.abs(follower.weight_change).toFixed(1)}kg 
                                  <span className="ml-0.5">🔥</span>
                                </>
                              ) : follower.weight_change > 0 ? (
                                <>
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  +{follower.weight_change.toFixed(1)}kg
                                </>
                              ) : (
                                <>
                                  <Scale className="w-3.5 h-3.5" />
                                  Estável
                                </>
                              )}
                            </Badge>
                          ) : (
                            <Badge 
                              variant="outline" 
                              className="text-xs flex items-center gap-1.5 bg-primary/10 text-primary border-primary/30 px-3 py-1"
                            >
                              <Scale className="w-3.5 h-3.5" />
                              Sem medições
                            </Badge>
                          )
                        ) : (
                          <Badge 
                            variant="outline" 
                            className="text-xs flex items-center gap-1.5 bg-muted/30 text-muted-foreground border-muted/50 px-3 py-1"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Privado
                          </Badge>
                        )}
                      </div>

                      {/* Mini Chart and Achievements row */}
                      {(follower.weightHistory || follower.recentAchievements) && (
                        <div className="mt-3 flex items-center gap-3">
                          {follower.weightHistory && follower.weightHistory.length > 1 && (
                            <MiniWeightChart 
                              data={follower.weightHistory}
                            />
                          )}
                          
                          {follower.recentAchievements && follower.recentAchievements.length > 0 && (
                            <AchievementBadges achievements={follower.recentAchievements} />
                          )}
                        </div>
                      )}

                      {/* Follow duration */}
                      {followDuration && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>Te segue há {followDuration}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2">
                      {onMessageClick && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
                              onClick={(e) => handleMessage(e, follower.user_id)}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Enviar mensagem</TooltipContent>
                        </Tooltip>
                      )}
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isFollowing(follower.user_id) ? "outline" : "default"}
                            size="icon"
                            className={`h-9 w-9 rounded-full transition-all ${
                              isFollowing(follower.user_id)
                                ? 'bg-muted hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                                : 'bg-primary hover:bg-primary/90'
                            }`}
                            onClick={(e) => handleFollowBack(e, follower.user_id)}
                          >
                            {isFollowing(follower.user_id) ? (
                              <UserCheck className="w-4 h-4" />
                            ) : (
                              <UserPlus className="w-4 h-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isFollowing(follower.user_id) ? 'Deixar de seguir' : 'Seguir de volta'}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </TooltipProvider>
  );
};
