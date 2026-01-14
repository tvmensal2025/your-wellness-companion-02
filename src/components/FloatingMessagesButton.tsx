import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Trophy, ArrowLeft, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveSection } from '@/contexts/ActiveSectionContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DirectMessagesInbox } from '@/components/community/DirectMessagesInbox';
import { ChatWindow } from '@/components/community/ChatWindow';
import { useDirectMessages, Conversation } from '@/hooks/useDirectMessages';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';

const HIDDEN_ROUTES = [
  '/login',
  '/auth',
  '/onboarding',
  '/professional-evaluation'
];

const HIDDEN_SECTIONS = ['comunidade'];

// Componente para chat de times
const TeamChatList: React.FC<{ onSelectTeam: (teamId: string, teamName: string) => void }> = ({ onSelectTeam }) => {
  const { user } = useAuth();
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchTeams = async () => {
      const { data } = await supabase
        .from('challenge_team_members')
        .select(`
          team_id,
          challenge_teams (
            id,
            name,
            avatar_url,
            team_color
          )
        `)
        .eq('user_id', user.id);
      
      if (data) {
        setTeams(data.map(d => d.challenge_teams).filter(Boolean));
      }
      setLoading(false);
    };

    fetchTeams();
  }, [user?.id]);

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Carregando times...</div>;
  }

  if (teams.length === 0) {
    return (
      <div className="p-8 text-center">
        <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-muted-foreground font-medium">Nenhum time ainda</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Participe de desafios em equipe!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[450px]">
      <div className="p-2 space-y-2">
        {teams.map((team: any) => (
          <Card
            key={team.id}
            className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelectTeam(team.id, team.name)}
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10" style={{ backgroundColor: team.team_color || '#6366f1' }}>
                {team.avatar_url ? (
                  <AvatarImage src={team.avatar_url} />
                ) : (
                  <AvatarFallback className="text-white">
                    {team.name?.charAt(0) || 'T'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{team.name}</p>
                <p className="text-xs text-muted-foreground">Toque para ver o chat</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

// Componente para chat de desafios
const ChallengeChatList: React.FC<{ onSelectChallenge: (challengeId: string, challengeName: string) => void }> = ({ onSelectChallenge }) => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchChallenges = async () => {
      const { data } = await supabase
        .from('challenge_participations')
        .select(`
          challenge_id,
          challenges (
            id,
            title,
            challenge_type,
            image_url
          )
        `)
        .eq('user_id', user.id)
        .eq('is_completed', false);
      
      if (data) {
        setChallenges(data.map(d => d.challenges).filter(Boolean));
      }
      setLoading(false);
    };

    fetchChallenges();
  }, [user?.id]);

  if (loading) {
    return <div className="p-4 text-center text-muted-foreground">Carregando desafios...</div>;
  }

  if (challenges.length === 0) {
    return (
      <div className="p-8 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
        <p className="text-muted-foreground font-medium">Nenhum desafio ativo</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Participe de desafios para conversar!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[450px]">
      <div className="p-2 space-y-2">
        {challenges.map((challenge: any) => (
          <Card
            key={challenge.id}
            className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => onSelectChallenge(challenge.id, challenge.title)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{challenge.title}</p>
                <p className="text-xs text-muted-foreground capitalize">{challenge.challenge_type}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

const FloatingMessagesButton: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { activeSection } = useActiveSection();
  const [unreadCount, setUnreadCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('individual');
  const [selectedParticipant, setSelectedParticipant] = useState<Conversation | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<{ id: string; name: string } | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<{ id: string; name: string } | null>(null);

  const {
    conversations,
    messages,
    totalUnread,
    activeConversation,
    fetchMessages,
    sendMessage,
    setActiveConversation,
  } = useDirectMessages();

  // Buscar contagem de mensagens não lidas
  useEffect(() => {
    if (!user?.id) return;

    const fetchUnreadCount = async () => {
      try {
        const { count, error } = await supabase
          .from('health_feed_direct_messages')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('is_read', false);

        if (!error && count !== null) {
          setUnreadCount(count);
        }
      } catch (err) {
        console.error('Erro ao buscar mensagens não lidas:', err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);

    const channel = supabase
      .channel('unread-messages-float')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'health_feed_direct_messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => fetchUnreadCount()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Reset ao fechar modal
  useEffect(() => {
    if (!modalOpen) {
      setSelectedParticipant(null);
      setSelectedTeam(null);
      setSelectedChallenge(null);
      setActiveConversation(null);
    }
  }, [modalOpen, setActiveConversation]);

  // Não exibir em páginas específicas
  if (HIDDEN_ROUTES.some(route => location.pathname.startsWith(route))) {
    return null;
  }

  if (HIDDEN_SECTIONS.includes(activeSection || '')) {
    return null;
  }

  if (!user) {
    return null;
  }

  const handleSelectConversation = async (participantId: string) => {
    await fetchMessages(participantId);
    const conv = conversations.find(c => c.participant_id === participantId);
    if (conv) {
      setSelectedParticipant(conv);
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .eq('user_id', participantId)
        .single();

      if (profile) {
        setSelectedParticipant({
          participant_id: profile.user_id,
          participant_name: profile.full_name || 'Usuário',
          participant_avatar: profile.avatar_url || undefined,
          last_message: '',
          last_message_time: new Date().toISOString(),
          unread_count: 0,
        });
      }
    }
  };

  const handleSendMessage = async (content: string) => {
    if (selectedParticipant) {
      await sendMessage(selectedParticipant.participant_id, content);
    }
  };

  const handleBack = () => {
    setSelectedParticipant(null);
    setSelectedTeam(null);
    setSelectedChallenge(null);
    setActiveConversation(null);
  };

  const renderContent = () => {
    // Chat individual aberto
    if (selectedParticipant) {
      return (
        <ChatWindow
          participantId={selectedParticipant.participant_id}
          participantName={selectedParticipant.participant_name}
          participantAvatar={selectedParticipant.participant_avatar}
          messages={messages}
          onSendMessage={handleSendMessage}
          onBack={handleBack}
          isOnline={selectedParticipant.is_online}
        />
      );
    }

    // Chat de time aberto
    if (selectedTeam) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Users className="w-5 h-5 text-indigo-500" />
            <span className="font-medium">{selectedTeam.name}</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Chat de time em desenvolvimento...</p>
          </div>
        </div>
      );
    }

    // Chat de desafio aberto
    if (selectedChallenge) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex items-center gap-3 p-4 border-b">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="font-medium">{selectedChallenge.name}</span>
          </div>
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Chat de desafio em desenvolvimento...</p>
          </div>
        </div>
      );
    }

    // Lista de conversas com abas
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="px-4 pt-4 pb-2 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Mensagens</h2>
            <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="individual" className="text-xs">
              <MessageCircle className="w-4 h-4 mr-1" />
              Individual
            </TabsTrigger>
            <TabsTrigger value="teams" className="text-xs">
              <Users className="w-4 h-4 mr-1" />
              Times
            </TabsTrigger>
            <TabsTrigger value="challenges" className="text-xs">
              <Trophy className="w-4 h-4 mr-1" />
              Desafios
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="individual" className="flex-1 m-0">
          <DirectMessagesInbox
            conversations={conversations}
            totalUnread={totalUnread}
            onSelectConversation={handleSelectConversation}
            onClose={() => setModalOpen(false)}
            selectedConversation={activeConversation}
          />
        </TabsContent>

        <TabsContent value="teams" className="flex-1 m-0">
          <TeamChatList onSelectTeam={(id, name) => setSelectedTeam({ id, name })} />
        </TabsContent>

        <TabsContent value="challenges" className="flex-1 m-0">
          <ChallengeChatList onSelectChallenge={(id, name) => setSelectedChallenge({ id, name })} />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <>
      {/* Botão Flutuante */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        className="fixed bottom-20 right-4 z-50 lg:bottom-6"
      >
        <Button
          onClick={() => setModalOpen(true)}
          size="sm"
          className="h-10 w-10 rounded-full bg-sky-400/70 hover:bg-sky-500/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
        >
          <MessageCircle className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1"
            >
              <Badge className="h-5 min-w-[20px] px-1.5 text-[10px] bg-red-500 text-white border-2 border-background">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Modal de Mensagens */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[400px] md:max-w-[450px] p-0 gap-0 h-[500px] max-h-[70vh] bg-sky-50/95 dark:bg-sky-950/90 backdrop-blur-xl border-sky-200/50 dark:border-sky-800/50">
          <DialogHeader className="sr-only">
            <DialogTitle>Mensagens</DialogTitle>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedParticipant?.participant_id || selectedTeam?.id || selectedChallenge?.id || 'list'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FloatingMessagesButton;
