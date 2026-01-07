import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserPlus, UserCheck, TrendingDown, TrendingUp, Scale, MessageCircle, Lock, Sparkles, Clock, Users, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FollowerUser {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  weight_change?: number;
  show_weight_results?: boolean;
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

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url, show_weight_results')
        .in('user_id', followerIds);

      if (profilesError) throw profilesError;

      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('user_id, total_points')
        .in('user_id', followerIds);

      if (pointsError) throw pointsError;

      const usersShowingWeight = profiles?.filter(p => p.show_weight_results).map(p => p.user_id) || [];
      
      let weightChanges: Record<string, number> = {};
      
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
          }
        });
      }

      const combinedUsers: FollowerUser[] = (profiles || []).map(profile => ({
        id: profile.user_id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        show_weight_results: profile.show_weight_results,
        total_points: pointsData?.find(p => p.user_id === profile.user_id)?.total_points || 0,
        weight_change: weightChanges[profile.user_id],
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
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-primary/20 shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-lg">Seus Seguidores</h3>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        <div className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-4">Carregando seguidores...</p>
        </div>
      </motion.div>
    );
  }

  if (users.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-2xl border border-primary/20 shadow-2xl overflow-hidden"
      >
        <div className="p-5 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Seus Seguidores</h3>
                <p className="text-xs text-muted-foreground">0 pessoas te seguem</p>
              </div>
            </div>
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        <div className="p-8 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
          >
            <Users className="w-8 h-8 text-primary" />
          </motion.div>
          <h4 className="font-semibold text-lg mb-2">Nenhum seguidor ainda</h4>
          <p className="text-muted-foreground text-sm">Compartilhe sua jornada no feed para atrair seguidores!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <TooltipProvider>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-card rounded-2xl border border-primary/20 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Modal Header */}
        <div className="relative p-5 border-b border-primary/10 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                initial={{ rotate: -10 }}
                animate={{ rotate: 0 }}
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg"
              >
                <Users className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <div>
                <h3 className="font-bold text-lg">Seus Seguidores</h3>
                <p className="text-xs text-muted-foreground">{users.length} {users.length === 1 ? 'pessoa te segue' : 'pessoas te seguem'}</p>
              </div>
            </div>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-primary/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
          <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {users.map((follower, index) => {
              const userLevel = getUserLevel(follower.total_points);
              const followDuration = getFollowDuration(follower.followed_at);
              
              return (
                <motion.div
                  key={follower.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <Card 
                    className="group relative overflow-hidden border border-primary/10 bg-gradient-to-br from-card via-card to-primary/5 hover:to-primary/10 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                    onClick={() => onProfileClick(follower.user_id)}
                  >
                    {/* Mutual follow indicator */}
                    {follower.is_mutual && (
                      <div className="absolute top-2 right-2 z-20">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                              <UserCheck className="w-3 h-3 text-primary" />
                              <span className="text-[10px] font-medium text-primary">Mútuo</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>Vocês se seguem mutuamente</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                    
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-12 h-12 ring-2 ring-primary/20 shadow-md">
                            {normalizeAvatarUrl(follower.avatar_url) ? (
                              <AvatarImage 
                                src={normalizeAvatarUrl(follower.avatar_url) || ''} 
                                alt={follower.full_name || ''}
                                className="object-cover"
                                loading="lazy"
                              />
                            ) : null}
                            <AvatarFallback className={`bg-gradient-to-br ${userLevel.color} text-white font-bold`}>
                              {getInitials(follower.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="absolute -bottom-1 -right-1 z-20">
                            <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${userLevel.color} flex items-center justify-center shadow-lg border-2 border-background text-xs`}>
                              {userLevel.emoji}
                            </div>
                          </div>
                        </div>

                        {/* User info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {follower.full_name || 'Usuário'}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge 
                              variant="secondary"
                              className="text-xs bg-primary/15 text-primary border border-primary/20 font-medium px-2 py-0.5"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              {follower.total_points} pts
                            </Badge>
                            
                            {follower.show_weight_results ? (
                              follower.weight_change !== undefined ? (
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs flex items-center gap-1 font-medium px-2 py-0.5 ${
                                    follower.weight_change < 0 
                                      ? 'bg-green-500/10 text-green-700 border-green-500/30 dark:text-green-400' 
                                      : follower.weight_change > 0
                                        ? 'bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-400'
                                        : 'bg-muted/50 text-muted-foreground'
                                  }`}
                                >
                                  {follower.weight_change < 0 ? (
                                    <>
                                      <TrendingDown className="w-3 h-3" />
                                      -{Math.abs(follower.weight_change).toFixed(1)}kg
                                    </>
                                  ) : follower.weight_change > 0 ? (
                                    <>
                                      <TrendingUp className="w-3 h-3" />
                                      +{follower.weight_change.toFixed(1)}kg
                                    </>
                                  ) : (
                                    <>
                                      <Scale className="w-3 h-3" />
                                      Estável
                                    </>
                                  )}
                                </Badge>
                              ) : null
                            ) : (
                              <Badge 
                                variant="outline" 
                                className="text-xs flex items-center gap-1 bg-muted/30 text-muted-foreground border-muted/50 px-2 py-0.5"
                              >
                                <Lock className="w-3 h-3" />
                                Privado
                              </Badge>
                            )}
                          </div>

                          {followDuration && (
                            <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>Te segue há {followDuration}</span>
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-1.5">
                          {onMessageClick && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary"
                              onClick={(e) => handleMessage(e, follower.user_id)}
                            >
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant={isFollowing(follower.user_id) ? "outline" : "default"}
                            size="icon"
                            className={`h-8 w-8 rounded-full transition-all ${
                              isFollowing(follower.user_id)
                                ? 'bg-muted hover:bg-destructive/10 hover:text-destructive'
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </motion.div>
    </TooltipProvider>
  );
};

export default FollowersList;
