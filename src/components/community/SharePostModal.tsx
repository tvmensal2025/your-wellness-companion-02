import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Send, 
  Check,
  Share2,
  Copy,
  Link2,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { toast } from 'sonner';
import { FeedPost } from '@/hooks/useFeedPosts';

interface SharePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: FeedPost | null;
}

interface ShareableUser {
  user_id: string;
  full_name: string;
  avatar_url?: string;
  selected?: boolean;
}

export const SharePostModal: React.FC<SharePostModalProps> = ({
  open,
  onOpenChange,
  post,
}) => {
  const { user } = useAuth();
  const { sharePost } = useDirectMessages();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<ShareableUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch users to share with
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user || !open) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('user_id, full_name, avatar_url')
          .neq('user_id', user.id)
          .limit(50);

        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, open]);

  // Filter users based on search
  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleShare = async () => {
    if (!post || selectedUsers.size === 0) return;

    setSending(true);
    try {
      const promises = Array.from(selectedUsers).map(userId =>
        sharePost(userId, post.id, post.content)
      );

      await Promise.all(promises);
      
      toast.success(`Post compartilhado com ${selectedUsers.size} pessoa(s)!`);
      onOpenChange(false);
      setSelectedUsers(new Set());
    } catch (err) {
      console.error('Error sharing post:', err);
      toast.error('Erro ao compartilhar post');
    } finally {
      setSending(false);
    }
  };

  const copyLink = () => {
    if (!post) return;
    const link = `${window.location.origin}/community/post/${post.id}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-primary" />
            Compartilhar Post
          </DialogTitle>
        </DialogHeader>

        {/* Post Preview */}
        {post && (
          <div className="p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={post.user_avatar} />
                <AvatarFallback>{post.user_name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">{post.user_name}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {post.content}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1 gap-2"
            onClick={copyLink}
          >
            <Link2 className="w-4 h-4" />
            Copiar Link
          </Button>
        </div>

        {/* Search Users */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pessoas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Users List */}
        <ScrollArea className="h-[250px] -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredUsers.map((u, index) => {
                const isSelected = selectedUsers.has(u.user_id);
                
                return (
                  <motion.div
                    key={u.user_id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => toggleUser(u.user_id)}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={u.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {u.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <span className="flex-1 font-medium">{u.full_name}</span>
                    
                    <div 
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isSelected 
                          ? 'bg-primary border-primary' 
                          : 'border-muted-foreground/30'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </ScrollArea>

        {/* Send Button */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            {selectedUsers.size > 0 && (
              <span>{selectedUsers.size} selecionado(s)</span>
            )}
          </div>
          <Button 
            onClick={handleShare}
            disabled={selectedUsers.size === 0 || sending}
            className="gap-2"
          >
            {sending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
