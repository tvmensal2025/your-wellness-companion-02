import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  MapPin,
  Trophy,
  TrendingUp,
  Send,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(post.isSaved);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
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
    }
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow">
        {/* Header */}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.userAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {post.userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{post.userName}</span>
                  <Badge variant="secondary" className="text-xs">
                    {post.userLevel}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatTimeAgo(post.createdAt)}</span>
                  {post.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
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
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Content */}
          <p className="text-foreground leading-relaxed">{post.content}</p>

          {/* Achievement Card */}
          {post.achievementData && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-xl border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-primary">Conquista Desbloqueada!</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {post.achievementData.value.toLocaleString()} {post.achievementData.unit}
              </p>
              <p className="text-sm text-muted-foreground">{post.achievementData.title}</p>
            </motion.div>
          )}

          {/* Progress Card */}
          {post.progressData && (
            <div className="bg-muted/50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-foreground">{post.progressData.type}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Duração</p>
                  <p className="font-semibold">{post.progressData.duration}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Calorias</p>
                  <p className="font-semibold">{post.progressData.calories} kcal</p>
                </div>
              </div>
            </div>
          )}

          {/* Image */}
          {post.imageUrl && (
            <motion.img
              whileHover={{ scale: 1.02 }}
              src={post.imageUrl}
              alt="Post"
              className="w-full rounded-xl object-cover max-h-[400px] cursor-pointer"
            />
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs cursor-pointer hover:bg-primary/10"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              {likesCount > 0 && (
                <>
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                      <Heart className="w-3 h-3 text-white fill-white" />
                    </div>
                  </div>
                  <span>{likesCount}</span>
                </>
              )}
            </div>
            <div className="flex gap-4">
              {post.comments > 0 && (
                <button 
                  onClick={() => setShowComments(!showComments)}
                  className="hover:underline"
                >
                  {post.comments} comentários
                </button>
              )}
              {post.shares > 0 && (
                <span>{post.shares} compartilhamentos</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-b border-border py-1">
            <Button
              variant="ghost"
              size="sm"
              className={`flex-1 gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={handleLike}
            >
              <motion.div
                whileTap={{ scale: 1.4 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </motion.div>
              Curtir
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-2 text-muted-foreground"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="w-5 h-5" />
              Comentar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-2 text-muted-foreground"
              onClick={() => onShare(post.id)}
            >
              <Share2 className="w-5 h-5" />
              Compartilhar
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
                {/* Comment Input */}
                <div className="flex gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escreva um comentário..."
                      className="flex-1 rounded-full bg-muted/50"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    />
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
                        <p className="text-sm text-foreground">{comment.content}</p>
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
