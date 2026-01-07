import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserMinus, User, TrendingDown, TrendingUp, Scale, MessageCircle, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface FollowingUser {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  total_points: number;
  weight_change?: number;
  show_weight_results?: boolean;
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
      
      if (usersShowingWeight.length > 0) {
        const { data: weightData } = await supabase
          .from('weight_measurements')
          .select('user_id, peso_kg, measurement_date')
          .in('user_id', usersShowingWeight)
          .order('measurement_date', { ascending: true });

        if (weightData) {
          // Calculate weight change for each user
          const userWeights: Record<string, { first: number; last: number }> = {};
          
          weightData.forEach(w => {
            if (!userWeights[w.user_id]) {
              userWeights[w.user_id] = { first: w.peso_kg, last: w.peso_kg };
            } else {
              userWeights[w.user_id].last = w.peso_kg;
            }
          });

          Object.entries(userWeights).forEach(([userId, weights]) => {
            weightChanges[userId] = weights.last - weights.first;
          });
        }
      }

      // Combine data
      const combinedUsers: FollowingUser[] = (profiles || []).map(profile => ({
        id: profile.user_id,
        user_id: profile.user_id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        show_weight_results: profile.show_weight_results,
        total_points: pointsData?.find(p => p.user_id === profile.user_id)?.total_points || 0,
        weight_change: weightChanges[profile.user_id]
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

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Você ainda não segue ninguém</h3>
          <p className="text-muted-foreground">Explore o feed e ranking para encontrar pessoas interessantes!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Seguindo ({users.length})</h3>
      </div>

      {users.map((followedUser, index) => (
        <motion.div
          key={followedUser.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card 
            className="border-primary/20 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 cursor-pointer group overflow-hidden"
            onClick={() => onProfileClick(followedUser.user_id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Avatar with enhanced styling */}
                <div className="relative">
                  <Avatar className="w-14 h-14 ring-2 ring-primary/30 shadow-md group-hover:ring-primary/50 transition-all">
                    {followedUser.avatar_url ? (
                      <AvatarImage src={followedUser.avatar_url} alt={followedUser.full_name || ''} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-accent/30 text-primary font-semibold text-lg">
                      {getInitials(followedUser.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Online indicator or badge could go here */}
                </div>

                {/* User info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors text-base">
                    {followedUser.full_name || 'Usuário'}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    {/* Points badge */}
                    <Badge 
                      variant="secondary" 
                      className="text-xs bg-primary/10 text-primary border-0 font-medium"
                    >
                      ⭐ {followedUser.total_points} pts
                    </Badge>
                    
                    {/* Weight change badge - motivational */}
                    {followedUser.show_weight_results && followedUser.weight_change !== undefined ? (
                      <Badge 
                        variant="outline" 
                        className={`text-xs flex items-center gap-1 font-medium ${
                          followedUser.weight_change < 0 
                            ? 'bg-green-500/10 text-green-600 border-green-500/30 dark:text-green-400' 
                            : followedUser.weight_change > 0
                              ? 'bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400'
                              : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {followedUser.weight_change < 0 ? (
                          <>
                            <TrendingDown className="w-3 h-3" />
                            -{Math.abs(followedUser.weight_change).toFixed(1)}kg 🔥
                          </>
                        ) : followedUser.weight_change > 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3" />
                            +{followedUser.weight_change.toFixed(1)}kg
                          </>
                        ) : (
                          <>
                            <Scale className="w-3 h-3" />
                            Estável
                          </>
                        )}
                      </Badge>
                    ) : (
                      <Badge 
                        variant="outline" 
                        className="text-xs flex items-center gap-1 bg-muted/50 text-muted-foreground border-muted"
                      >
                        <Lock className="w-3 h-3" />
                        Privado
                      </Badge>
                    )}
                  </div>

                  {/* Subtle CTA */}
                  <p className="text-[10px] text-muted-foreground mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Toque para ver perfil completo
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1">
                  {onMessageClick && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMessage(e, followedUser.user_id)}
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleUnfollow(e, followedUser.user_id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
