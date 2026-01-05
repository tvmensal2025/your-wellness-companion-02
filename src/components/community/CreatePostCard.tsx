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
    <Card className="mb-3 sm:mb-4 overflow-hidden border-blue-200/50 dark:border-blue-800/50 bg-white dark:bg-card">
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 font-semibold text-xs sm:text-sm">
              {userName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            {!isExpanded ? (
              <motion.div
                whileHover={{ scale: 1.01 }}
                onClick={() => setIsExpanded(true)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-blue-50 dark:bg-blue-950/30 rounded-full cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-blue-200/50 dark:border-blue-800/50"
              >
                <span className="text-muted-foreground text-sm">
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
                      className="min-h-[100px] sm:min-h-[120px] resize-none border-none bg-transparent focus-visible:ring-0 text-sm sm:text-base"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-8 w-8"
                      onClick={() => setIsExpanded(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                        className={`cursor-pointer transition-all hover:scale-105 text-xs ${
                          selectedTags.includes(tag) 
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : 'border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950'
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-blue-200/50 dark:bg-blue-800/50" />

                  {/* Actions */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex gap-0.5 sm:gap-1">
                      <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 px-2 sm:px-3">
                        <Image className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
                        <span className="hidden sm:inline text-xs">Foto</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2 sm:px-3">
                        <Video className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
                        <span className="hidden sm:inline text-xs">Vídeo</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 h-8 px-2 sm:px-3">
                        <Smile className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-1" />
                        <span className="hidden sm:inline text-xs">Sentimento</span>
                      </Button>
                    </div>
                    <Button 
                      onClick={handleSubmit}
                      disabled={!content.trim()}
                      className="rounded-full px-4 sm:px-6 h-8 sm:h-9 bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm"
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
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
          <div className="flex items-center justify-between mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-blue-200/50 dark:border-blue-800/50">
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 h-9">
              <Image className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Foto</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 h-9">
              <Video className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Vídeo</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 h-9">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Conquista</span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
