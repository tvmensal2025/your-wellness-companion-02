import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'sofia';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  scrollAreaRef 
}) => {
  return (
    <div className="flex-1 relative overflow-hidden min-h-0" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23128C7E' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      backgroundColor: '#0a100e'
    }}>
      <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
        <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 relative z-10 pb-4">
          {messages.map(message => {
            const time = message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const isUser = message.type === 'user';
            return (
              <motion.div 
                key={message.id} 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`relative max-w-[85%] sm:max-w-[75%] ${
                  isUser 
                    ? 'bg-[#005C4B] rounded-2xl rounded-tr-md' 
                    : 'bg-[#1F2C33] rounded-2xl rounded-tl-md'
                } px-4 py-2.5 sm:px-4 sm:py-3 shadow-lg`}>
                  {/* Seta do balão */}
                  <div className={`absolute top-0 ${
                    isUser 
                      ? 'right-0 -mr-2 border-l-[8px] border-l-[#005C4B] border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent' 
                      : 'left-0 -ml-2 border-r-[8px] border-r-[#1F2C33] border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent'
                  }`} style={{ width: 0, height: 0 }} />
                  
                  {message.imageUrl && (
                    <img 
                      src={message.imageUrl} 
                      alt="Imagem enviada" 
                      className="max-w-[240px] sm:max-w-[280px] h-auto rounded-lg mb-2 object-cover" 
                    />
                  )}
                  <p className="whitespace-pre-wrap text-[15px] sm:text-base leading-relaxed break-words text-white/95">{message.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-[11px] sm:text-xs text-white/50">{time}</span>
                    {isUser && <CheckCheck className="w-4 h-4 text-[#53BDEB]" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-[#1F2C33] rounded-2xl rounded-tl-md px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-[#25D366] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
