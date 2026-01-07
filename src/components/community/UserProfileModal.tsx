import React, { useEffect, useState } from 'react';
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
  X,
  Sparkles,
  Star,
  Gem,
  Sprout,
  Target,
  Globe,
  Instagram,
  Dumbbell,
  Apple,
  Moon,
  Brain,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCommunityProfile, CommunityUserPost } from '@/hooks/useCommunityProfile';
import { useUserProgressStats } from '@/hooks/useUserProgressStats';
import { InviteToChallengeModal } from './InviteToChallengeModal';
import { WeightProgressCard } from '@/components/profile/WeightProgressCard';
import { ChallengesCompletedCard } from '@/components/profile/ChallengesCompletedCard';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Interest configuration
const interestConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  'treino': { label: 'Treino', icon: <Dumbbell className="w-3 h-3" />, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  'nutricao': { label: 'Nutrição', icon: <Apple className="w-3 h-3" />, color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  'sono': { label: 'Sono', icon: <Moon className="w-3 h-3" />, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  'mental': { label: 'Saúde Mental', icon: <Brain className="w-3 h-3" />, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  'peso': { label: 'Perda de Peso', icon: <Flame className="w-3 h-3" />, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  'metas': { label: 'Metas', icon: <Target className="w-3 h-3" />, color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
};

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  isFollowing: boolean;
  onFollow: () => void;
  onMessage: () => void;
  isOwnProfile: boolean;
}

// Level configuration with colors and icons
const levelConfig: Record<string, { color: string; bgColor: string; icon: React.ReactNode; gradient: string }> = {
  'Iniciante': {
    color: 'text-slate-600 dark:text-slate-400',
    bgColor: 'bg-slate-100 dark:bg-slate-800',
    icon: <Sprout className="w-3.5 h-3.5" />,
    gradient: 'from-slate-400 to-slate-500',
  },
  'Intermediário': {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: <Star className="w-3.5 h-3.5" />,
    gradient: 'from-blue-400 to-blue-600',
  },
  'Avançado': {
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    icon: <Gem className="w-3.5 h-3.5" />,
    gradient: 'from-purple-400 to-purple-600',
  },
  'Expert': {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: <Trophy className="w-3.5 h-3.5" />,
    gradient: 'from-amber-400 to-amber-600',
  },
};

// Avatar Lightbox Component
const AvatarLightbox: React.FC<{
  open: boolean;
  onClose: () => void;
  imageUrl?: string;
  fallback: string;
}> = ({ open, onClose, imageUrl, fallback }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-12 right-0 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>
          
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Avatar"
              className="w-72 h-72 sm:w-80 sm:h-80 rounded-full object-cover border-4 border-white/20 shadow-2xl"
            />
          ) : (
            <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center border-4 border-white/20 shadow-2xl">
              <span className="text-8xl font-bold text-primary-foreground">
                {fallback}
              </span>
            </div>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

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
  const { stats: progressStats } = useUserProgressStats(userId);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchProfile(userId);
    } else {
      clearProfile();
      setLightboxOpen(false);
      setInviteModalOpen(false);
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

  const getLevelConfig = (level: string) => {
    return levelConfig[level] || levelConfig['Iniciante'];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] p-0 overflow-hidden border-0 bg-transparent shadow-none">
          <ScrollArea className="max-h-[90vh]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-20 bg-background rounded-2xl"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </motion.div>
            ) : profile ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-background rounded-2xl overflow-hidden shadow-2xl"
              >
                {/* Animated Banner */}
                <div className="relative h-28 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-accent opacity-90" />
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6IiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
                  <motion.div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -bottom-5 -left-5 w-32 h-32 rounded-full bg-white/10"
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.1, 0.2] }}
                    transition={{ duration: 5, repeat: Infinity }}
                  />
                  <Sparkles className="absolute top-4 right-4 w-5 h-5 text-white/40" />
                </div>

                <DialogHeader className="px-6 pt-0 pb-4">
                  {/* Avatar - positioned to overlap banner */}
                  <div className="relative -mt-14 mb-3 flex justify-center">
                    <motion.button
                      onClick={() => setLightboxOpen(true)}
                      className="relative group cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-br ${getLevelConfig(profile.level).gradient} opacity-70 blur group-hover:opacity-100 transition-opacity`} />
                      <Avatar className="relative w-24 h-24 border-4 border-background shadow-xl">
                        <AvatarImage src={profile.avatar} className="object-cover" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-3xl font-bold">
                          {profile.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium transition-opacity">
                          Ver foto
                        </span>
                      </div>
                    </motion.button>
                  </div>

                  {/* Name and Level */}
                  <div className="text-center">
                    <DialogTitle className="text-xl font-bold">
                      {profile.name}
                    </DialogTitle>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Badge 
                        variant="secondary" 
                        className={`${getLevelConfig(profile.level).bgColor} ${getLevelConfig(profile.level).color} border-0 font-semibold`}
                      >
                        {getLevelConfig(profile.level).icon}
                        <span className="ml-1">{profile.level}</span>
                      </Badge>
                    </div>
                    
                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm text-muted-foreground mt-3 px-4 italic">
                        "{profile.bio}"
                      </p>
                    )}
                    
                    {/* Links */}
                    <div className="flex items-center justify-center gap-3 mt-2 text-xs">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Membro desde {formatJoinDate(profile.joinedAt)}
                      </span>
                      {profile.website_url && (
                        <a 
                          href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3 h-3" />
                          Website
                        </a>
                      )}
                      {profile.instagram_handle && (
                        <a 
                          href={`https://instagram.com/${profile.instagram_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-pink-500 hover:underline flex items-center gap-1"
                        >
                          <Instagram className="w-3 h-3" />
                          @{profile.instagram_handle}
                        </a>
                      )}
                    </div>
                    
                    {/* Interests */}
                    {profile.interests && profile.interests.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5 mt-3 px-4">
                        {profile.interests.map((interest) => {
                          const config = interestConfig[interest];
                          if (!config) return null;
                          return (
                            <span 
                              key={interest}
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${config.color}`}
                            >
                              {config.icon}
                              {config.label}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </DialogHeader>

                {/* Stats Cards */}
                <div className="px-6 pb-4">
                  <div className="grid grid-cols-4 gap-2">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10"
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-bold text-lg block">{profile.postsCount}</span>
                      <span className="text-[10px] text-muted-foreground">Posts</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10"
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-bold text-lg block">{profile.followersCount}</span>
                      <span className="text-[10px] text-muted-foreground">Seguidores</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 rounded-xl bg-muted/50 border border-border"
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="font-bold text-lg block">{profile.followingCount}</span>
                      <span className="text-[10px] text-muted-foreground">Seguindo</span>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className="text-center p-3 rounded-xl bg-orange-500/10 border border-orange-500/20"
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                      </div>
                      <span className="font-bold text-lg block">{profile.streak}</span>
                      <span className="text-[10px] text-muted-foreground">Streak</span>
                    </motion.div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="space-y-2 px-6 pb-4">
                    <div className="flex gap-2">
                      <Button
                        variant={isFollowing ? 'outline' : 'default'}
                        size="sm"
                        className="flex-1 rounded-xl"
                        onClick={onFollow}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="w-4 h-4 mr-2" />
                            Seguindo
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4 mr-2" />
                            Seguir
                          </>
                        )}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 rounded-xl"
                        onClick={onMessage}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Mensagem
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl border-primary/30 text-primary hover:bg-primary/10"
                      onClick={() => setInviteModalOpen(true)}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Convidar para Desafio
                    </Button>
                  </div>
                )}

                {/* Progress Stats Cards */}
                {progressStats && (
                  <div className="px-6 space-y-3">
                    <WeightProgressCard
                      currentWeight={progressStats.currentWeight}
                      targetWeight={progressStats.targetWeight}
                      initialWeight={null}
                      weightLoss={progressStats.weightLoss}
                      weightProgress={progressStats.weightProgress}
                    />
                    <ChallengesCompletedCard
                      challengesCompleted={progressStats.challengesCompleted}
                      activeChallenges={progressStats.activeChallenges}
                      activeGoals={0}
                      completedGoals={0}
                      currentStreak={progressStats.currentStreak}
                      bestStreak={progressStats.bestStreak}
                    />
                  </div>
                )}

                {/* Divider */}
                <div className="px-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>

                {/* Posts */}
                <ScrollArea className="h-[260px]">
                  <div className="p-4 space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2 px-2">
                      <FileText className="w-4 h-4 text-primary" />
                      Posts de {profile.name.split(' ')[0]}
                    </h4>
                    
                    {userPosts.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground text-sm">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/50 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground/50" />
                        </div>
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
              <div className="p-8 text-center text-muted-foreground bg-background rounded-2xl">
                Perfil não encontrado
              </div>
            )}
          </AnimatePresence>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Avatar Lightbox */}
      <AvatarLightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        imageUrl={profile?.avatar}
        fallback={profile?.name?.charAt(0).toUpperCase() || 'U'}
      />

      {/* Invite to Challenge Modal */}
      {userId && profile && (
        <InviteToChallengeModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          inviteeId={userId}
          inviteeName={profile.name}
        />
      )}
    </>
  );
};

// Mini post card for profile
const PostCard: React.FC<{ post: CommunityUserPost; formatDate: (date: string) => string }> = ({ post, formatDate }) => (
  <motion.div
    whileHover={{ scale: 1.01 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
  >
    <Card className="p-3 hover:bg-muted/50 transition-all hover:shadow-md border-primary/10">
      <p className="text-sm line-clamp-2 mb-2">{post.content}</p>
      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt="Post"
          className="w-full h-28 object-cover rounded-lg mb-2"
        />
      )}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-pink-500">
            <Heart className="w-3 h-3 fill-current" />
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
            <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  </motion.div>
);
