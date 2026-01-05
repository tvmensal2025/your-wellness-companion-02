import React, { useRef, useState } from 'react';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera } from 'lucide-react';

interface SidebarProfileProps {
  fullName: string;
  email: string;
  avatarUrl: string;
  isExpanded: boolean;
  onAvatarUpload: (file: File) => Promise<string | null>;
  onProfileClick?: () => void;
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({
  fullName,
  email,
  avatarUrl,
  isExpanded,
  onAvatarUpload,
  onProfileClick,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await onAvatarUpload(file);
      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar foto",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex items-center gap-3 p-4">
      <div className="relative group">
        {/* Gradient ring around avatar */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-primary via-primary/50 to-primary/20 rounded-full opacity-75 group-hover:opacity-100 transition-opacity blur-sm" />
        
        <Avatar 
          className="relative h-11 w-11 cursor-pointer ring-2 ring-background shadow-lg hover:scale-105 transition-transform duration-200"
          onClick={onProfileClick}
        >
          <AvatarImage src={avatarUrl} alt={fullName} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/40 text-primary font-bold text-sm">
            {fullName ? getInitials(fullName) : <User className="w-5 h-5" />}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          disabled={isUploading}
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer backdrop-blur-sm"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-white drop-shadow-md" />
          )}
        </button>

        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-background shadow-sm" />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {isExpanded && (
        <div 
          className="flex-1 min-w-0 cursor-pointer group/text"
          onClick={onProfileClick}
        >
          <div className="font-semibold text-sm truncate text-foreground group-hover/text:text-primary transition-colors">
            {fullName || 'Usuário'}
          </div>
          <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
            <span className="truncate">{email}</span>
          </div>
        </div>
      )}

      {isExpanded && (
        <button 
          onClick={onProfileClick}
          className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      )}
    </div>
  );
};
