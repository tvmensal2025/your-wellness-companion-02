import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, UserMinus, User, TrendingDown, TrendingUp, Scale } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFollow } from '@/hooks/useFollow';
import { toast } from 'sonner';

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
}

export const FollowingList: React.FC<FollowingListProps> = ({ onProfileClick }) => {
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

  const handleUnfollow = async (userId: string) => {
    await unfollowUser(userId);
  };

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground mt-2">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
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

      {users.map((followedUser) => (
        <Card key={followedUser.id} className="border-primary/20 hover:border-primary/40 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <button onClick={() => onProfileClick(followedUser.user_id)}>
                <Avatar className="w-12 h-12 ring-2 ring-primary/20">
                  {followedUser.avatar_url ? (
                    <AvatarImage src={followedUser.avatar_url} alt={followedUser.full_name || ''} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(followedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
              </button>

              <div className="flex-1 min-w-0">
                <button 
                  onClick={() => onProfileClick(followedUser.user_id)}
                  className="text-left"
                >
                  <p className="font-medium truncate hover:text-primary transition-colors">
                    {followedUser.full_name || 'Usuário'}
                  </p>
                </button>
                
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {followedUser.total_points} pts
                  </Badge>
                  
                  {followedUser.show_weight_results && followedUser.weight_change !== undefined && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs flex items-center gap-1 ${
                        followedUser.weight_change < 0 
                          ? 'text-green-600 border-green-600/30' 
                          : followedUser.weight_change > 0
                            ? 'text-orange-600 border-orange-600/30'
                            : 'text-muted-foreground'
                      }`}
                    >
                      <Scale className="w-3 h-3" />
                      {followedUser.weight_change < 0 ? (
                        <>
                          <TrendingDown className="w-3 h-3" />
                          {Math.abs(followedUser.weight_change).toFixed(1)}kg
                        </>
                      ) : followedUser.weight_change > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          +{followedUser.weight_change.toFixed(1)}kg
                        </>
                      ) : (
                        'Estável'
                      )}
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleUnfollow(followedUser.user_id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <UserMinus className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
