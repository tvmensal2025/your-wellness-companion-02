import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserMinus, User, TrendingDown, TrendingUp, Scale, MessageCircle, Lock, Sparkles, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { MiniWeightChart } from './MiniWeightChart';
import { AchievementBadges } from './AchievementBadges';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getUserAvatar } from '@/lib/avatar-utils';

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

interface FollowingUser {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  weight_change?: number;
  show_weight_results?: boolean;
  weightHistory?: WeightDataPoint[];
  recentAchievements?: Achievement[];
}

interface FollowingListProps {
  onProfileClick: (userId: string) => void;
  onMessageClick?: (userId: string) => void;
}

export const FollowingList: React.FC<FollowingListProps> = ({ onProfileClick, onMessageClick }) => {
  const { user } = useAuth();
  const { unfollowUser, following } = useFollow();
  const [users, setUsers] = useState<FollowingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFollowingUsers();
  }, [user, following]);

  const fetchFollowingUsers = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Get list of users I'm following
      const { data: followData, error: followError } = await supabase
        .from('health_feed_follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followError) throw followError;

      if (!followData || followData.length === 0) {
        setUsers([]);
        return;
      }

      const followingIds = followData.map(f => f.following_id);

      // Get profiles of followed users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, show_weight_results')
        .in('user_id', followingIds);

      if (profilesError) throw profilesError;

      // Get points from user_points
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('user_id, total_points')
        .in('user_id', followingIds);

      if (pointsError) throw pointsError;

      // Get weight data for users who allow it
      const usersShowingWeight = profiles?.filter(p => p.show_weight_results).map(p => p.user_id) || [];
      
      let weightChanges: Record<string, number> = {};
      let weightHistories: Record<string, WeightDataPoint[]> = {};
      
      if (usersShowingWeight.length > 0) {
        // Buscar últimas 15 medições para cada usuário
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
            // Calcular mudança de peso
            const first = weightData[0].peso_kg;
            const last = weightData[weightData.length - 1].peso_kg;
            weightChanges[userId] = last - first;

            // Preparar histórico para gráfico
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

      // Buscar conquistas dos usuários
      let achievementsByUser: Record<string, Achievement[]> = {};
      
      try {
        // Tentar buscar de user_achievements primeiro
        const { data: userAchievements } = await supabase
          .from('user_achievements')
          .select('id, user_id, achievement_name, achievement_type, description, earned_at')
          .in('user_id', followingIds)
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
                rarity: 'common' // Default, pode ser atualizado se houver campo
              });
            }
          });
        }

      } catch (error) {
        console.warn('Erro ao buscar conquistas:', error);
      }

      // Combine data
      const combinedUsers: FollowingUser[] = (profiles || []).map(profile => ({
        id: profile.user_id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        show_weight_results: profile.show_weight_results,
        total_points: pointsData?.find(p => p.user_id === profile.user_id)?.total_points || 0,
        weight_change: weightChanges[profile.user_id],
        weightHistory: weightHistories[profile.user_id] || undefined,
        recentAchievements: achievementsByUser[profile.user_id] || undefined
      }));

      setUsers(combinedUsers);
    } catch (error) {
      console.error('Error fetching following users:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleUnfollow = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    await unfollowUser(userId);
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

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-xl animate-pulse" />
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground mt-4 font-medium">Carregando conexões...</p>
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
            <User className="w-10 h-10 text-primary" />
          </motion.div>
          <h3 className="font-semibold text-xl mb-2">Você ainda não segue ninguém</h3>
          <p className="text-muted-foreground">Explore o feed e ranking para encontrar pessoas interessantes!</p>
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
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Seguindo ({users.length})</h3>
          </div>
        </div>

        {users.map((followedUser, index) => {
          const userLevel = getUserLevel(followedUser.total_points);
          
          return (
            <motion.div
              key={followedUser.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card 
                className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-primary/5 hover:to-primary/10 shadow-md hover:shadow-xl transition-all duration-500 cursor-pointer"
                onClick={() => onProfileClick(followedUser.user_id)}
              >
                {/* Animated border gradient */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/30 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ padding: '1px' }}>
                  <div className="w-full h-full bg-card rounded-lg" />
                </div>
                
                {/* Glow effect on hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                
                <CardContent className="p-5 relative z-10">
                  <div className="flex items-start gap-4">
                    {/* Enhanced Avatar with animated ring */}
                    <div className="relative flex-shrink-0">
                      {/* Animated gradient ring */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary/50 to-accent rounded-full opacity-60 group-hover:opacity-100 blur-sm transition-all duration-300 group-hover:animate-pulse" />
                      
                      {(() => {
                        const avatar = getUserAvatar(normalizeAvatarUrl(followedUser.avatar_url), followedUser.full_name || 'Usuário');
                        return (
                          <Avatar className="w-16 h-16 ring-2 ring-background shadow-lg relative z-10 group-hover:scale-105 transition-transform duration-300">
                            {avatar.type === 'emoji' ? (
                              <AvatarFallback className={`text-2xl bg-gradient-to-br ${userLevel.color}`}>
                                {avatar.value}
                              </AvatarFallback>
                            ) : (
                              <>
                                <AvatarImage 
                                  src={avatar.value} 
                                  alt={followedUser.full_name || ''}
                                  className="object-cover"
                                  loading="lazy"
                                />
                                <AvatarFallback className={`bg-gradient-to-br ${userLevel.color} text-white font-bold text-lg`}>
                                  {getInitials(followedUser.full_name)}
                                </AvatarFallback>
                              </>
                            )}
                          </Avatar>
                        );
                      })()}
                      
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
                          {followedUser.full_name || 'Usuário'}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Points badge with shimmer */}
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="relative overflow-hidden"
                        >
                          <Badge 
                            variant="secondary"
                            className="text-xs bg-primary/15 text-primary border border-primary/20 font-semibold px-3 py-1"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            {followedUser.total_points} pts
                          </Badge>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </motion.div>
                        
                        {/* Weight change badge */}
                        {followedUser.show_weight_results ? (
                          followedUser.weight_change !== undefined ? (
                            <Badge 
                              variant="outline" 
                              className={`text-xs flex items-center gap-1.5 font-semibold px-3 py-1 ${
                                followedUser.weight_change < 0 
                                  ? 'bg-green-500/10 text-green-700 border-green-500/30 dark:text-green-400 dark:bg-green-500/20' 
                                  : followedUser.weight_change > 0
                                    ? 'bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-400 dark:bg-orange-500/20'
                                    : 'bg-muted/50 text-muted-foreground border-muted'
                              }`}
                            >
                              {followedUser.weight_change < 0 ? (
                                <>
                                  <TrendingDown className="w-3.5 h-3.5" />
                                  -{Math.abs(followedUser.weight_change).toFixed(1)}kg 
                                  <span className="ml-0.5">🔥</span>
                                </>
                              ) : followedUser.weight_change > 0 ? (
                                <>
                                  <TrendingUp className="w-3.5 h-3.5" />
                                  +{followedUser.weight_change.toFixed(1)}kg
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
                      <div className="flex items-center gap-4 mt-3 flex-wrap">
                        {/* Mini Weight Chart */}
                        {followedUser.show_weight_results && followedUser.weightHistory && followedUser.weightHistory.length >= 1 && (
                          <motion.div 
                            className="w-36 bg-gradient-to-br from-muted/30 to-muted/10 rounded-lg p-2 border border-border/50"
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.02 }}
                          >
                            <MiniWeightChart data={followedUser.weightHistory} />
                          </motion.div>
                        )}
                        
                        {/* Achievement Badges */}
                        {followedUser.recentAchievements && followedUser.recentAchievements.length > 0 && (
                          <motion.div 
                            onClick={(e) => e.stopPropagation()}
                            whileHover={{ scale: 1.05 }}
                          >
                            <AchievementBadges achievements={followedUser.recentAchievements} />
                          </motion.div>
                        )}
                      </div>

                      {/* Subtle hover hint */}
                      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Clock className="w-3 h-3" />
                        Toque para ver perfil
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2">
                      {onMessageClick && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleMessage(e, followedUser.user_id)}
                              className="w-10 h-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200 group-hover:shadow-md"
                            >
                              <MessageCircle className="w-5 h-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">Enviar mensagem</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => handleUnfollow(e, followedUser.user_id)}
                            className="w-10 h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                          >
                            <UserMinus className="w-5 h-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="left">Deixar de seguir</TooltipContent>
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
