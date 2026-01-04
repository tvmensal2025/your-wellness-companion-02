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
    <div className="flex items-center gap-3 p-4 border-b">
      <div className="relative group">
        <Avatar 
          className="h-10 w-10 cursor-pointer ring-2 ring-border hover:ring-primary transition-all"
          onClick={onProfileClick}
        >
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {fullName ? getInitials(fullName) : <User className="w-5 h-5" />}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          {isUploading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-white" />
          )}
        </button>

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
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onProfileClick}
        >
          <div className="font-semibold text-sm truncate text-foreground">
            {fullName || 'Usuário'}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            {email}
          </div>
        </div>
      )}
    </div>
  );
};
