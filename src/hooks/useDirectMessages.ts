import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface DirectMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  sender_avatar?: string;
  receiver_name?: string;
  receiver_avatar?: string;
}

export interface Conversation {
  participant_id: string;
  participant_name: string;
  participant_avatar?: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  is_online?: boolean;
}

export function useDirectMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get all messages where user is sender or receiver
      const { data: messagesData, error } = await supabase
        .from('health_feed_direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group by conversation partner
      const conversationsMap = new Map<string, {
        messages: DirectMessage[];
        unreadCount: number;
      }>();

      messagesData?.forEach(msg => {
        const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
        
        if (!conversationsMap.has(partnerId)) {
          conversationsMap.set(partnerId, { messages: [], unreadCount: 0 });
        }
        
        const conv = conversationsMap.get(partnerId)!;
        conv.messages.push(msg as DirectMessage);
        
        if (!msg.is_read && msg.receiver_id === user.id) {
          conv.unreadCount++;
        }
      });

      // Get partner profiles
      const partnerIds = Array.from(conversationsMap.keys());
      
      if (partnerIds.length === 0) {
        setConversations([]);
        setTotalUnread(0);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', partnerIds);

      const profilesMap = new Map(
        profiles?.map(p => [p.user_id, p]) || []
      );

      // Build conversations list
      const convList: Conversation[] = [];
      let unreadTotal = 0;

      conversationsMap.forEach((data, partnerId) => {
        const profile = profilesMap.get(partnerId);
        const lastMsg = data.messages[0];
        
        unreadTotal += data.unreadCount;

        convList.push({
          participant_id: partnerId,
          participant_name: profile?.full_name || 'Usuário',
          participant_avatar: profile?.avatar_url || undefined,
          last_message: lastMsg.content,
          last_message_time: lastMsg.created_at || '',
          unread_count: data.unreadCount,
        });
      });

      // Sort by last message time
      convList.sort((a, b) => 
        new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      );

      setConversations(convList);
      setTotalUnread(unreadTotal);
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (partnerId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setActiveConversation(partnerId);

      const { data, error } = await supabase
        .from('health_feed_direct_messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get profiles
      const userIds = [...new Set(data?.map(m => m.sender_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      const profilesMap = new Map(
        profiles?.map(p => [p.user_id, p]) || []
      );

      const enrichedMessages: DirectMessage[] = (data || []).map(msg => {
        const senderProfile = profilesMap.get(msg.sender_id);
        return {
          ...msg,
          is_read: msg.is_read ?? false,
          sender_name: senderProfile?.full_name || 'Usuário',
          sender_avatar: senderProfile?.avatar_url || undefined,
        };
      });

      setMessages(enrichedMessages);

      // Mark messages as read
      await markAsRead(partnerId);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Send a message
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!user) {
      toast.error('Você precisa estar logado para enviar mensagens');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('health_feed_direct_messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          is_read: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Get sender profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      const newMessage: DirectMessage = {
        ...data,
        is_read: data.is_read ?? false,
        sender_name: profile?.full_name || 'Você',
        sender_avatar: profile?.avatar_url || undefined,
      };

      setMessages(prev => [...prev, newMessage]);

      // Update conversation list
      fetchConversations();

      return newMessage;
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error('Erro ao enviar mensagem');
      return null;
    }
  }, [user, fetchConversations]);

  // Mark messages as read
  const markAsRead = useCallback(async (partnerId: string) => {
    if (!user) return;

    try {
      await supabase
        .from('health_feed_direct_messages')
        .update({ is_read: true })
        .eq('sender_id', partnerId)
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      // Update local state
      setConversations(prev => 
        prev.map(c => 
          c.participant_id === partnerId 
            ? { ...c, unread_count: 0 } 
            : c
        )
      );

      setTotalUnread(prev => {
        const conv = conversations.find(c => c.participant_id === partnerId);
        return Math.max(0, prev - (conv?.unread_count || 0));
      });
    } catch (err: any) {
      console.error('Error marking messages as read:', err);
    }
  }, [user, conversations]);

  // Share a post via DM
  const sharePost = useCallback(async (receiverId: string, postId: string, postContent: string) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return null;
    }

    const shareMessage = `📎 Compartilhou um post:\n\n"${postContent.substring(0, 100)}${postContent.length > 100 ? '...' : ''}"\n\n[Ver post: ${postId}]`;
    
    return sendMessage(receiverId, shareMessage);
  }, [user, sendMessage]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchConversations();

    const channel = supabase
      .channel('dm_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'health_feed_direct_messages',
          filter: `receiver_id=eq.${user.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as DirectMessage;
          
          // Get sender profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', newMsg.sender_id)
            .single();

          const enrichedMsg: DirectMessage = {
            ...newMsg,
            is_read: newMsg.is_read ?? false,
            sender_name: profile?.full_name || 'Usuário',
            sender_avatar: profile?.avatar_url || undefined,
          };

          // If viewing this conversation, add message
          if (activeConversation === newMsg.sender_id) {
            setMessages(prev => [...prev, enrichedMsg]);
            markAsRead(newMsg.sender_id);
          } else {
            // Show notification
            toast.info(`Nova mensagem de ${enrichedMsg.sender_name}`);
          }

          // Refresh conversations
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConversation, fetchConversations, markAsRead]);

  return {
    conversations,
    messages,
    loading,
    totalUnread,
    activeConversation,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markAsRead,
    sharePost,
    setActiveConversation,
  };
}
