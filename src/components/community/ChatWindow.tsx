import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  Send, 
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Check,
  CheckCheck,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DirectMessage } from '@/hooks/useDirectMessages';
import { useAuth } from '@/hooks/useAuth';

interface ChatWindowProps {
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  messages: DirectMessage[];
  onSendMessage: (content: string) => void;
  onBack: () => void;
  isTyping?: boolean;
  isOnline?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  participantId,
  participantName,
  participantAvatar,
  messages,
  onSendMessage,
  onBack,
  isTyping = false,
  isOnline = false,
}) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return format(date, 'HH:mm');
    if (isYesterday(date)) return `Ontem ${format(date, 'HH:mm')}`;
    return format(date, 'dd/MM HH:mm');
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {} as Record<string, DirectMessage[]>);

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isYesterday(date)) return 'Ontem';
    return format(date, "d 'de' MMMM", { locale: ptBR });
  };

  return (
    <Card className="h-full flex flex-col border-primary/20">
      {/* Header */}
      <CardHeader className="p-3 border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={onBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={participantAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {participantName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <Circle className="absolute bottom-0 right-0 w-3 h-3 fill-emerald-500 text-emerald-500 border-2 border-background rounded-full" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{participantName}</p>
            <p className="text-xs text-muted-foreground">
              {isTyping ? (
                <span className="text-primary">Digitando...</span>
              ) : isOnline ? (
                'Online'
              ) : (
                'Offline'
              )}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Phone className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Video className="w-5 h-5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-[350px] p-4" ref={scrollRef}>
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date}>
              {/* Date separator */}
              <div className="flex items-center justify-center my-4">
                <div className="bg-muted px-3 py-1 rounded-full">
                  <span className="text-xs text-muted-foreground">
                    {formatDateHeader(date)}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <AnimatePresence>
                {msgs.map((msg, index) => {
                  const isMine = msg.sender_id === user?.id;
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className={`flex mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isMine && (
                        <Avatar className="w-8 h-8 mr-2 mt-1">
                          <AvatarImage src={msg.sender_avatar} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {msg.sender_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={`max-w-[70%] ${isMine ? 'order-1' : ''}`}>
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isMine
                              ? 'bg-primary text-primary-foreground rounded-br-md'
                              : 'bg-muted rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                          <span className="text-[10px] text-muted-foreground">
                            {formatMessageDate(msg.created_at)}
                          </span>
                          {isMine && (
                            msg.is_read 
                              ? <CheckCheck className="w-3 h-3 text-primary" />
                              : <Check className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 ml-10"
            >
              <div className="flex gap-1 bg-muted px-4 py-2 rounded-full">
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                />
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                />
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Avatar className="w-16 h-16 mb-4">
                <AvatarImage src={participantAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {participantName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <p className="font-medium">{participantName}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Inicie uma conversa!
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Input */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <Smile className="w-5 h-5 text-muted-foreground" />
          </Button>
          
          <Input
            ref={inputRef}
            placeholder="Digite uma mensagem..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1 bg-background border-muted-foreground/20"
          />
          
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!newMessage.trim()}
            className="flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
