import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Search, 
  Circle,
  Check,
  CheckCheck,
  ArrowLeft,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Conversation } from '@/hooks/useDirectMessages';

// Função para normalizar URLs de avatar
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

interface DirectMessagesInboxProps {
  conversations: Conversation[];
  totalUnread: number;
  onSelectConversation: (participantId: string) => void;
  onClose?: () => void;
  selectedConversation?: string | null;
}

export const DirectMessagesInbox: React.FC<DirectMessagesInboxProps> = ({
  conversations,
  totalUnread,
  onSelectConversation,
  onClose,
  selectedConversation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.participant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col border-primary/20">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            Mensagens
            {totalUnread > 0 && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                {totalUnread}
              </Badge>
            )}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/50 border-0"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[400px]">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground font-medium">
                {searchQuery ? 'Nenhuma conversa encontrada' : 'Nenhuma mensagem ainda'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {searchQuery ? 'Tente outro termo de busca' : 'Inicie uma conversa com alguém!'}
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredConversations.map((conv, index) => (
                <motion.div
                  key={conv.participant_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b border-muted/50 ${
                    selectedConversation === conv.participant_id
                      ? 'bg-primary/5'
                      : 'hover:bg-muted/30'
                  }`}
                  onClick={() => onSelectConversation(conv.participant_id)}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={normalizeAvatarUrl(conv.participant_avatar) || ''} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conv.participant_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {conv.is_online && (
                      <Circle className="absolute bottom-0 right-0 w-3.5 h-3.5 fill-emerald-500 text-emerald-500 border-2 border-background rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`font-medium truncate ${conv.unread_count > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {conv.participant_name}
                      </p>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                        {formatDistanceToNow(new Date(conv.last_message_time), {
                          addSuffix: false,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`text-sm truncate flex-1 ${
                        conv.unread_count > 0 
                          ? 'text-foreground font-medium' 
                          : 'text-muted-foreground'
                      }`}>
                        {conv.last_message}
                      </p>
                      {conv.unread_count > 0 ? (
                        <Badge className="bg-primary text-primary-foreground text-[10px] min-w-[20px] h-5 justify-center">
                          {conv.unread_count}
                        </Badge>
                      ) : (
                        <CheckCheck className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
