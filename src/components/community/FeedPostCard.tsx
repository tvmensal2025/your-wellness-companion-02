import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  MessageCircle,
  Share2,
  MoreHorizontal,
  MapPin,
  Trophy,
  TrendingUp,
  Send,
  Bookmark,
  ChevronDown,
  Pin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ReactionPicker, ReactionDisplay } from './ReactionPicker';
import { TextWithLinks } from './LinkPreview';
import { PollComponent, Poll } from './PollComponent';
import { MentionInput, renderTextWithMentions } from './MentionInput';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

interface PollOption {
  text: string;
  votes: number;
}

interface Post {
  id: string;
  userName: string;
  userAvatar?: string;
  userLevel: string;
  content: string;
  imageUrl?: string;
  location?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  isPinned?: boolean;
  achievementData?: {
    title: string;
    value: number;
    unit: string;
  };
  progressData?: {
    type: string;
    duration: string;
    calories: number;
  };
  commentsList?: {
    id: string;
    userName: string;
    userAvatar?: string;
    content: string;
    createdAt: string;
  }[];
}

interface FeedPostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
  onSave: (postId: string) => void;
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [reactions, setReactions] = useState<Record<string, number>>({});

  // Fetch poll if exists
  useEffect(() => {
    const fetchPoll = async () => {
      const { data } = await supabase
        .from('health_feed_polls')
        .select('*')
        .eq('post_id', post.id)
        .maybeSingle();
      
      if (data) {
        setPoll({
          id: data.id,
          post_id: data.post_id,
          question: data.question,
          options: data.options as unknown as PollOption[],
          ends_at: data.ends_at || undefined,
          created_at: data.created_at
        });
      }
    };
    fetchPoll();
  }, [post.id]);

  // Fetch reactions
  useEffect(() => {
    const fetchReactions = async () => {
      const { data } = await supabase
        .from('health_feed_reactions')
        .select('reaction_type')
        .eq('post_id', post.id);
      
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach(r => {
          counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1;
        });
        setReactions(counts);
      }
    };
    fetchReactions();
  }, [post.id]);

  const handleReaction = async (reactionType: string) => {
    setIsLiked(true);
    setLikesCount(prev => prev + 1);
    setReactions(prev => ({
      ...prev,
      [reactionType]: (prev[reactionType] || 0) + 1
    }));
    onLike(post.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave(post.id);
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onComment(post.id, newComment);
      setNewComment('');
      setMentions([]);
    }
  };

  const handleCommentChange = (value: string, newMentions: string[]) => {
    setNewComment(value);
    setMentions(newMentions);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  // Truncate content for collapsed view
  const maxLength = 80;
  const shouldTruncate = post.content.length > maxLength;
  const displayContent = !isExpanded && shouldTruncate 
    ? post.content.slice(0, maxLength) + '...' 
    : post.content;

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0) || likesCount;

  // Collapsed View
  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className="mb-2 overflow-hidden hover:shadow-md transition-all border-primary/20 bg-card cursor-pointer hover:bg-primary/5"
          onClick={() => setIsExpanded(true)}
        >
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9 flex-shrink-0">
                <AvatarImage src={post.userAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                  {post.userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-foreground text-sm">{post.userName}</span>
                  {post.isPinned && <Pin className="w-3 h-3 text-primary" />}
                  <span className="text-[10px] text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{displayContent}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <ReactionDisplay reactionsCount={reactions} />
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{post.comments}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Expanded View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-3 sm:mb-4 overflow-hidden hover:shadow-md transition-shadow border-primary/20 bg-card">
        {/* Pinned Badge */}
        {post.isPinned && (
          <div className="bg-primary/10 px-4 py-1.5 flex items-center gap-2 text-xs text-primary font-medium">
            <Pin className="w-3 h-3" />
            Post Fixado
          </div>
        )}

        {/* Header */}
        <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
          <div className="flex items-start justify-between">
            <div className="flex gap-2 sm:gap-3">
              <Avatar className="w-9 h-9 sm:w-10 sm:h-10">
                <AvatarImage src={post.userAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs sm:text-sm">
                  {post.userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  <span className="font-semibold text-foreground text-sm sm:text-base">{post.userName}</span>
                  <Badge variant="secondary" className="text-[10px] sm:text-xs bg-primary/10 text-primary">
                    {post.userLevel}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground">
                  <span>{formatTimeAgo(post.createdAt)}</span>
                  {post.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 sm:gap-1">
                        <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span className="truncate max-w-[100px] sm:max-w-none">{post.location}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 text-xs text-primary hover:bg-primary/10"
                onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
              >
                Recolher
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 text-primary hover:bg-primary/10">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSave}>
                    <Bookmark className="w-4 h-4 mr-2" />
                    {isSaved ? 'Remover dos salvos' : 'Salvar post'}
                  </DropdownMenuItem>
                  <DropdownMenuItem>Denunciar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
          {/* Content with link previews and mentions */}
          <div className="text-foreground leading-relaxed text-sm sm:text-base">
            <TextWithLinks text={post.content} showPreview />
          </div>

          {/* Achievement Card */}
          {post.achievementData && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 sm:p-4 rounded-xl border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                </div>
                <span className="font-semibold text-primary text-sm sm:text-base">Conquista Desbloqueada!</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {post.achievementData.value.toLocaleString()} {post.achievementData.unit}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">{post.achievementData.title}</p>
            </motion.div>
          )}

          {/* Progress Card */}
          {post.progressData && (
            <div className="bg-muted/50 p-3 sm:p-4 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                <span className="font-medium text-foreground text-sm">{post.progressData.type}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Duração</p>
                  <p className="font-semibold text-sm sm:text-base">{post.progressData.duration}</p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Calorias</p>
                  <p className="font-semibold text-sm sm:text-base">{post.progressData.calories} kcal</p>
                </div>
              </div>
            </div>
          )}

          {/* Poll */}
          {poll && (
            <PollComponent poll={poll} />
          )}

          {/* Media (Image or Video) */}
          {post.imageUrl && (
            (() => {
              const url = post.imageUrl.toLowerCase();
              const isVideo = url.includes('.mp4') || url.includes('.mov') || 
                             url.includes('.webm') || url.includes('.m4v');
              
              if (isVideo) {
                return (
                  <video
                    src={post.imageUrl}
                    className="w-full rounded-xl object-cover max-h-[300px] sm:max-h-[400px]"
                    controls
                    playsInline
                  />
                );
              }
              
              return (
                <motion.img
                  whileHover={{ scale: 1.02 }}
                  src={post.imageUrl}
                  alt="Post"
                  className="w-full rounded-xl object-cover max-h-[300px] sm:max-h-[400px] cursor-pointer"
                />
              );
            })()
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {post.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-[10px] sm:text-xs cursor-pointer hover:bg-primary/10 border-primary/30 text-primary"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats with Reactions */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground pt-1 sm:pt-2">
            <ReactionDisplay 
              reactionsCount={reactions}
              onClick={() => {}}
            />
            <div className="flex gap-3 sm:gap-4">
              {post.comments > 0 && (
                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="hover:underline"
                >
                  {post.comments} comentários
                </button>
              )}
              {post.shares > 0 && (
                <span className="hidden sm:inline">{post.shares} compartilhamentos</span>
              )}
            </div>
          </div>

          {/* Actions with ReactionPicker */}
          <div className="flex items-center justify-between border-t border-b border-border py-1">
            <ReactionPicker
              currentReaction={isLiked ? 'like' : undefined}
              onReact={handleReaction}
              reactionsCount={reactions}
            />
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-1 sm:gap-2 h-9 sm:h-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Comentar</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-1 sm:gap-2 h-9 sm:h-10 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => onShare(post.id)}
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Compartilhar</span>
            </Button>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                {/* Comment Input with Mentions */}
                <div className="flex gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <div className="flex-1">
                      <MentionInput
                        value={newComment}
                        onChange={handleCommentChange}
                        placeholder="Escreva um comentário... Use @ para mencionar"
                        rows={1}
                        className="rounded-full bg-muted/50"
                        maxLength={500}
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                {post.commentsList?.map((comment) => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.userAvatar} />
                      <AvatarFallback className="bg-muted text-xs">
                        {comment.userName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-muted/50 rounded-2xl px-3 py-2">
                        <span className="font-semibold text-sm">{comment.userName}</span>
                        <p className="text-sm text-foreground">
                          {renderTextWithMentions(comment.content)}
                        </p>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1 ml-3">
                        <button className="hover:underline">Curtir</button>
                        <button className="hover:underline">Responder</button>
                        <span>{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
};