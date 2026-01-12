// =====================================================
// TEAM DETAIL VIEW - VISÃO COMPLETA DO TIME
// Chat, Membros, Batalhas, Desafios Coletivos
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, MessageCircle, Swords, Trophy, Settings, 
  Crown, UserPlus, Copy, Check, ArrowLeft, Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TeamBattleCard, type TeamBattle } from './TeamBattleCard';
import { CreateTeamBattleModal } from './CreateTeamBattleModal';
import type { ChallengeTeam, TeamMember } from '@/types/challenges-v2';

interface TeamDetailViewProps {
  team: ChallengeTeam;
  currentUserId: string;
  onBack: () => void;
}

export const TeamDetailView: React.FC<TeamDetailViewProps> = ({
  team,
  currentUserId,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [showBattleModal, setShowBattleModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const isLeader = team.leader_id === currentUserId;

  // Buscar membros do time
  const { data: members } = useQuery({
    queryKey: ['team-members', team.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_team_members')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('team_id', team.id)
        .order('contribution_xp', { ascending: false });

      if (error) {
        console.warn('Error fetching members:', error);
        return [];
      }
      return data as (TeamMember & { profile: { full_name: string; avatar_url?: string } })[];
    },
  });

  // Buscar batalhas do time
  const { data: battles } = useQuery({
    queryKey: ['team-battles', team.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_battles')
        .select(`
          *,
          team_a:challenge_teams!team_battles_team_a_id_fkey(id, name, avatar_emoji, color),
          team_b:challenge_teams!team_battles_team_b_id_fkey(id, name, avatar_emoji, color)
        `)
        .or(`team_a_id.eq.${team.id},team_b_id.eq.${team.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error fetching battles:', error);
        return [];
      }
      return data as TeamBattle[];
    },
  });

  // Buscar mensagens do chat
  const { data: chatMessages, refetch: refetchChat } = useQuery({
    queryKey: ['team-chat', team.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_chat_messages')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('team_id', team.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error fetching chat:', error);
        return [];
      }
      return data?.reverse() || [];
    },
    refetchInterval: 5000, // Atualizar a cada 5s
  });

  const handleCopyCode = () => {
    if (team.invite_code) {
      navigator.clipboard.writeText(team.invite_code);
      setCopiedCode(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const { error } = await supabase
      .from('team_chat_messages')
      .insert({
        team_id: team.id,
        user_id: currentUserId,
        message: chatMessage.trim(),
      });

    if (error) {
      toast.error('Erro ao enviar mensagem');
      return;
    }

    setChatMessage('');
    refetchChat();
  };

  const activeBattles = battles?.filter(b => b.status === 'active') || [];
  const pendingBattles = battles?.filter(b => b.status === 'pending') || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${team.color}30` }}
        >
          {team.avatar_emoji}
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-lg">{team.name}</h2>
          <p className="text-sm text-muted-foreground">
            {members?.length || 0} membros • {team.total_xp || 0} XP
          </p>
        </div>
        {isLeader && (
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Código de Convite */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50">
        <UserPlus className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm flex-1">
          Código: <strong>{team.invite_code || '???'}</strong>
        </span>
        <Button variant="ghost" size="sm" onClick={handleCopyCode}>
          {copiedCode ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat" className="gap-1">
            <MessageCircle className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="battles" className="gap-1 relative">
            <Swords className="w-4 h-4" />
            Batalhas
            {(activeBattles.length + pendingBattles.length) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {activeBattles.length + pendingBattles.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-1">
            <Users className="w-4 h-4" />
            Membros
          </TabsTrigger>
        </TabsList>

        {/* TAB: CHAT */}
        <TabsContent value="chat" className="mt-4">
          <div className="flex flex-col h-[400px] rounded-xl border bg-card">
            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma mensagem ainda</p>
                  <p className="text-xs">Seja o primeiro a falar!</p>
                </div>
              ) : (
                chatMessages?.map((msg: any) => {
                  const isMe = msg.user_id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-2",
                        isMe && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={msg.profile?.avatar_url} />
                        <AvatarFallback>
                          {msg.profile?.full_name?.[0] || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "max-w-[70%] p-3 rounded-2xl",
                        isMe 
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      )}>
                        {!isMe && (
                          <p className="text-xs font-medium mb-1 opacity-70">
                            {msg.profile?.full_name}
                          </p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={!chatMessage.trim()}>
                Enviar
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB: BATALHAS */}
        <TabsContent value="battles" className="mt-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Batalhas Time vs Time</h3>
            <Button 
              size="sm" 
              onClick={() => setShowBattleModal(true)}
              className="gap-1 bg-purple-500 hover:bg-purple-600"
            >
              <Swords className="w-4 h-4" />
              Desafiar
            </Button>
          </div>

          {/* Batalhas Ativas */}
          {activeBattles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">🔥 Em andamento</h4>
              {activeBattles.map(battle => (
                <TeamBattleCard 
                  key={battle.id} 
                  battle={battle} 
                  currentTeamId={team.id}
                />
              ))}
            </div>
          )}

          {/* Batalhas Pendentes */}
          {pendingBattles.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm text-muted-foreground">⏳ Aguardando</h4>
              {pendingBattles.map(battle => (
                <TeamBattleCard 
                  key={battle.id} 
                  battle={battle} 
                  currentTeamId={team.id}
                />
              ))}
            </div>
          )}

          {activeBattles.length === 0 && pendingBattles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Swords className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma batalha ativa</p>
              <p className="text-xs">Desafie outro time!</p>
            </div>
          )}
        </TabsContent>

        {/* TAB: MEMBROS */}
        <TabsContent value="members" className="mt-4 space-y-3">
          {members?.map((member, index) => (
            <motion.div
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="relative">
                <Avatar>
                  <AvatarImage src={member.profile?.avatar_url} />
                  <AvatarFallback>
                    {member.profile?.full_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                {member.role === 'leader' && (
                  <Crown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {member.profile?.full_name || 'Membro'}
                  {member.user_id === currentUserId && (
                    <span className="text-xs text-primary ml-2">(você)</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {member.role === 'leader' ? '👑 Líder' : 
                   member.role === 'co-leader' ? '⭐ Co-líder' : '👤 Membro'}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm" style={{ color: team.color }}>
                  {member.contribution_xp || 0}
                </p>
                <p className="text-[10px] text-muted-foreground">XP</p>
              </div>
            </motion.div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Modal Criar Batalha */}
      <CreateTeamBattleModal
        open={showBattleModal}
        onOpenChange={setShowBattleModal}
        myTeam={{
          id: team.id,
          name: team.name,
          avatar_emoji: team.avatar_emoji,
          color: team.color,
        }}
      />
    </div>
  );
};

export default TeamDetailView;
