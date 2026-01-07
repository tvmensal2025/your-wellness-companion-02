import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DirectMessagesInbox } from './DirectMessagesInbox';
import { ChatWindow } from './ChatWindow';
import { useDirectMessages, Conversation } from '@/hooks/useDirectMessages';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface DirectMessagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialConversation?: string | null;
}

export const DirectMessagesModal: React.FC<DirectMessagesModalProps> = ({
  open,
  onOpenChange,
  initialConversation,
}) => {
  const {
    conversations,
    messages,
    loading,
    totalUnread,
    activeConversation,
    fetchMessages,
    sendMessage,
    setActiveConversation,
  } = useDirectMessages();

  const [selectedParticipant, setSelectedParticipant] = useState<Conversation | null>(null);

  // Handle initial conversation
  useEffect(() => {
    if (open && initialConversation) {
      handleSelectConversation(initialConversation);
    }
  }, [open, initialConversation]);

  // Reset when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedParticipant(null);
      setActiveConversation(null);
    }
  }, [open, setActiveConversation]);

  const handleSelectConversation = async (participantId: string) => {
    await fetchMessages(participantId);
    
    // Find participant info
    const conv = conversations.find(c => c.participant_id === participantId);
    if (conv) {
      setSelectedParticipant(conv);
    } else {
      // Fetch participant info if not in conversations
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
    setActiveConversation(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] md:max-w-[600px] p-0 gap-0 h-[600px] max-h-[80vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>Mensagens Diretas</DialogTitle>
        </DialogHeader>
        
        <AnimatePresence mode="wait">
          {selectedParticipant ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full"
            >
              <ChatWindow
                participantId={selectedParticipant.participant_id}
                participantName={selectedParticipant.participant_name}
                participantAvatar={selectedParticipant.participant_avatar}
                messages={messages}
                onSendMessage={handleSendMessage}
                onBack={handleBack}
                isOnline={selectedParticipant.is_online}
              />
            </motion.div>
          ) : (
            <motion.div
              key="inbox"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <DirectMessagesInbox
                conversations={conversations}
                totalUnread={totalUnread}
                onSelectConversation={handleSelectConversation}
                onClose={() => onOpenChange(false)}
                selectedConversation={activeConversation}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
