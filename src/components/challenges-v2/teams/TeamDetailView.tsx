// =====================================================
// TEAM DETAIL VIEW COMPONENT
// =====================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Users, 
  Trophy, 
  Star, 
  Crown, 
  Swords,
  TrendingUp,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Team {
  id: string;
  name: string;
  description?: string;
  leader_id: string;
  avatar_emoji?: string;
  color?: string;
  total_xp: number;
  challenges_completed: number;
  current_rank?: number;
  invite_code?: string;
  max_members?: number;
}

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  contribution_xp: number;
  joined_at: string;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface TeamDetailViewProps {
  team: Team;
  currentUserId: string;
  onBack: () => void;
}

export const TeamDetailView: React.FC<TeamDetailViewProps> = ({
  team,
  currentUserId,
  onBack,
}) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [team.id]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('challenge_team_members')
        .select(`
          id,
          user_id,
          role,
          contribution_xp,
          joined_at
        `)
        .eq('team_id', team.id)
        .order('contribution_xp', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = (data || []).map(m => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      setMembers((data || []).map(m => ({
        ...m,
        profile: profilesMap.get(m.user_id) || null,
      })));
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = () => {
    if (team.invite_code) {
      navigator.clipboard.writeText(team.invite_code);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isLeader = team.leader_id === currentUserId;
  const totalContribution = members.reduce((sum, m) => sum + (m.contribution_xp || 0), 0);

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'leader':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'co-leader':
        return <Star className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Back */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: team.color || '#6366f1' }}
          >
            {team.avatar_emoji || '⚔️'}
          </div>
          <div>
            <h2 className="font-bold text-lg">{team.name}</h2>
            <p className="text-xs text-muted-foreground">
              {members.length}/{team.max_members || 10} membros
            </p>
          </div>
        </div>
        {team.current_rank && (
          <Badge variant="secondary" className="text-xs">
            #{team.current_rank}
          </Badge>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-3 text-center">
            <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <p className="text-xl font-bold">{team.total_xp}</p>
            <p className="text-[10px] text-muted-foreground">XP Total</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-3 text-center">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <p className="text-xl font-bold">{team.challenges_completed}</p>
            <p className="text-[10px] text-muted-foreground">Desafios</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <p className="text-xl font-bold">{members.length}</p>
            <p className="text-[10px] text-muted-foreground">Membros</p>
          </CardContent>
        </Card>
      </div>

      {/* Invite Code */}
      {isLeader && team.invite_code && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Código de Convite</p>
                <p className="font-mono font-bold text-lg">{team.invite_code}</p>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={copyInviteCode}
                className="gap-1"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      {team.description && (
        <Card>
          <CardContent className="p-3">
            <p className="text-sm text-muted-foreground">{team.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="w-4 h-4" />
            Membros do Time
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              Nenhum membro encontrado
            </p>
          ) : (
            members.map((member, index) => {
              const contributionPercent = totalContribution > 0 
                ? (member.contribution_xp / totalContribution) * 100 
                : 0;
              
              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg",
                    member.user_id === currentUserId 
                      ? "bg-primary/10 border border-primary/20" 
                      : "bg-muted/50"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={member.profile?.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(member.profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    {index === 0 && (
                      <div className="absolute -top-1 -right-1">
                        <Crown className="w-4 h-4 text-yellow-500" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">
                        {member.profile?.full_name || 'Membro'}
                      </p>
                      {getRoleIcon(member.role)}
                      {member.user_id === currentUserId && (
                        <Badge variant="outline" className="text-[8px] h-4">Você</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress 
                        value={contributionPercent} 
                        className="h-1.5 flex-1" 
                      />
                      <span className="text-[10px] text-muted-foreground w-16 text-right">
                        {member.contribution_xp} XP
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamDetailView;
