import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import {
  UserPlus,
  UserMinus,
  MessageCircle,
  FileText,
  Users,
  Flame,
  Trophy,
  Calendar,
  Heart,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunityProfile, CommunityUserPost } from '@/hooks/useCommunityProfile';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  isFollowing: boolean;
  onFollow: () => void;
  onMessage: () => void;
  isOwnProfile: boolean;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  open,
  onOpenChange,
  userId,
  isFollowing,
  onFollow,
  onMessage,
  isOwnProfile,
}) => {
  const { loading, profile, userPosts, fetchProfile, clearProfile } = useCommunityProfile();

  useEffect(() => {
    if (open && userId) {
      fetchProfile(userId);
    } else {
      clearProfile();
    }
  }, [open, userId, fetchProfile, clearProfile]);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR });
    } catch {
      return 'recentemente';
    }
  };

  const formatJoinDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'membro';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-20"
            >
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </motion.div>
          ) : profile ? (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* Header with gradient background */}
              <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 p-6 pb-4">
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                      <AvatarImage src={profile.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                        {profile.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <DialogTitle className="text-xl font-bold truncate">
                        {profile.name}
                      </DialogTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <Trophy className="w-3 h-3 mr-1" />
                          {profile.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          #{profile.position}
                        </Badge>
                      </div>
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {profile.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </DialogHeader>

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant={isFollowing ? 'outline' : 'default'}
                      size="sm"
                      className="flex-1"
                      onClick={onFollow}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="w-4 h-4 mr-2" />
                          Deixar de seguir
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Seguir
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={onMessage}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Mensagem
                    </Button>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 px-6 py-4 border-b">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-bold text-lg">{profile.postsCount}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Posts</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-bold text-lg">{profile.followersCount}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Seguidores</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-lg">{profile.followingCount}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Seguindo</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="font-bold text-lg">{profile.streak}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Dias</span>
                </div>
              </div>

              {/* Joined date */}
              <div className="px-6 py-2 border-b flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span>Membro desde {formatJoinDate(profile.joinedAt)}</span>
              </div>

              {/* Posts */}
              <ScrollArea className="h-[280px]">
                <div className="p-4 space-y-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Posts de {profile.name.split(' ')[0]}
                  </h4>
                  
                  {userPosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Nenhum post ainda
                    </div>
                  ) : (
                    userPosts.map((post) => (
                      <PostCard key={post.id} post={post} formatDate={formatDate} />
                    ))
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Perfil não encontrado
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

// Mini post card for profile
const PostCard: React.FC<{ post: CommunityUserPost; formatDate: (date: string) => string }> = ({ post, formatDate }) => (
  <Card className="p-3 hover:bg-muted/50 transition-colors">
    <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
    {post.imageUrl && (
      <img
        src={post.imageUrl}
        alt="Post"
        className="w-full h-24 object-cover rounded-lg mb-2"
      />
    )}
    <div className="flex items-center justify-between text-xs text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          {post.likes}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          {post.comments}
        </span>
      </div>
      <span>{formatDate(post.createdAt)}</span>
    </div>
    {post.tags.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-2">
        {post.tags.slice(0, 3).map((tag) => (
          <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0">
            #{tag}
          </Badge>
        ))}
      </div>
    )}
  </Card>
);
