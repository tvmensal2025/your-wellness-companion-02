import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Heart, MessageCircle, ChevronRight, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { FeedPost } from '@/hooks/useFeedPosts';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SuggestedPostsProps {
  posts: FeedPost[];
  onPostClick: (postId: string) => void;
  title?: string;
  reason?: string;
}

export const SuggestedPosts: React.FC<SuggestedPostsProps> = ({
  posts,
  onPostClick,
  title = "Para Você",
  reason = "Baseado nos seus interesses",
}) => {
  if (posts.length === 0) return null;

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-primary to-primary/50">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <span>{title}</span>
            <p className="text-xs font-normal text-muted-foreground mt-0.5">
              {reason}
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        {posts.slice(0, 3).map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => onPostClick(post.id)}
          >
            <div className="flex gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-primary/10">
              <Avatar className="w-10 h-10 ring-2 ring-primary/10">
                <AvatarImage src={post.user_avatar} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {post.user_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">
                    {post.user_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    · {formatDistanceToNow(new Date(post.created_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {post.content}
                </p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags.slice(0, 2).map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {post.likes_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {post.comments_count}
                  </span>
                </div>
              </div>

              {post.media_urls && post.media_urls.length > 0 && (
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={post.media_urls[0]} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {posts.length > 3 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-primary hover:bg-primary/5"
          >
            Ver mais sugestões
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

// Compact inline version for feed
export const SuggestedPostInline: React.FC<{ 
  post: FeedPost; 
  onPostClick: (postId: string) => void;
}> = ({ post, onPostClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative"
    >
      <div className="absolute -top-2 left-4 z-10">
        <Badge className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-[10px] px-2 shadow-sm">
          <Lightbulb className="w-3 h-3 mr-1" />
          Sugestão
        </Badge>
      </div>
      
      <Card 
        className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onPostClick(post.id)}
      >
        <CardContent className="p-4 pt-5">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.user_avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {post.user_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{post.user_name}</p>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {post.content}
              </p>
              
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {post.likes_count}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {post.comments_count}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
