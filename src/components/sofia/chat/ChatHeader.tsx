import React from 'react';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import sofiaAvatar from '@/assets/sofia-avatar.png';

interface ChatHeaderProps {
  onHomeClick: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onHomeClick }) => {
  return (
    <div className="flex items-center gap-4 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-[#075E54] to-[#128C7E] shadow-lg z-10 flex-shrink-0">
      {/* Botão Home para Dashboard */}
      <Button
        variant="ghost"
        size="icon"
        className="text-white hover:bg-white/10 h-10 w-10 flex-shrink-0"
        onClick={onHomeClick}
      >
        <Home className="w-5 h-5" />
      </Button>
      
      {/* Avatar com status online */}
      <div className="relative flex-shrink-0">
        <img 
          src={sofiaAvatar} 
          alt="Sofia"
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/30 shadow-md"
        />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#25D366] rounded-full border-2 border-[#075E54]" />
      </div>
      
      {/* Info do contato */}
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-white text-lg sm:text-xl truncate">Sofia</h1>
        <p className="text-sm text-[#a8d8d5] truncate">online</p>
      </div>
    </div>
  );
};
