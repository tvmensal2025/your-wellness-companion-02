import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Image, 
  Video, 
  Smile, 
  MapPin, 
  Trophy,
  X,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CreatePostCardProps {
  userName: string;
  userAvatar?: string;
  onCreatePost: (content: string, tags: string[]) => void;
}

export const CreatePostCard: React.FC<CreatePostCardProps> = ({
  userName,
  userAvatar,
  onCreatePost
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tags = [
    '🏃 Corrida',
    '💪 Treino',
    '🥗 Alimentação',
    '💧 Hidratação',
    '😴 Sono',
    '🧘 Meditação',
    '🎯 Meta',
    '🏆 Conquista'
  ];

  const handleSubmit = () => {
    if (content.trim()) {
      onCreatePost(content, selectedTags);
      setContent('');
      setSelectedTags([]);
      setIsExpanded(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Card className="mb-4 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {userName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            {!isExpanded ? (
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => setIsExpanded(true)}
                className="w-full px-4 py-3 bg-muted/50 rounded-full cursor-pointer hover:bg-muted transition-colors"
              >
                <span className="text-muted-foreground">
                  O que você está pensando, {userName?.split(' ')[0]}?
                </span>
              </motion.div>
            ) : (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="relative">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={`O que você está pensando, ${userName?.split(' ')[0]}?`}
                      className="min-h-[120px] resize-none border-none bg-transparent focus-visible:ring-0 text-base"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => setIsExpanded(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-border" />

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50">
                        <Image className="w-5 h-5 mr-1" />
                        <span className="hidden sm:inline">Foto</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Video className="w-5 h-5 mr-1" />
                        <span className="hidden sm:inline">Vídeo</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-600 hover:bg-amber-50">
                        <Smile className="w-5 h-5 mr-1" />
                        <span className="hidden sm:inline">Sentimento</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                        <MapPin className="w-5 h-5 mr-1" />
                        <span className="hidden sm:inline">Local</span>
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSubmit}
                      disabled={!content.trim()}
                      className="rounded-full px-6"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Publicar
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Quick Actions when collapsed */}
        {!isExpanded && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-emerald-600">
              <Image className="w-5 h-5 mr-2" />
              Foto
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-red-500">
              <Video className="w-5 h-5 mr-2" />
              Vídeo
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-amber-500">
              <Trophy className="w-5 h-5 mr-2" />
              Conquista
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
