import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Image, Video, Smile, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FloatingCreateButtonProps {
  userName: string;
  userAvatar?: string;
  onCreatePost: (content: string, tags: string[]) => void;
}

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

export const FloatingCreateButton: React.FC<FloatingCreateButtonProps> = ({
  userName,
  userAvatar,
  onCreatePost
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleSubmit = () => {
    if (content.trim()) {
      onCreatePost(content, selectedTags);
      setContent('');
      setSelectedTags([]);
      setIsOpen(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            size="lg"
            className="rounded-full w-14 h-14 shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </motion.div>
      </motion.div>

      {/* Create Post Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>Criar Publicação</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`O que você está pensando, ${userName?.split(' ')[0]}?`}
              className="min-h-[120px] resize-none border-primary/20 focus-visible:ring-primary/30"
              autoFocus
            />

            {/* Tags */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Adicionar tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      selectedTags.includes(tag)
                        ? 'bg-primary hover:bg-primary/90'
                        : 'border-primary/30 hover:bg-primary/5'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:bg-emerald-50">
                  <Image className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                  <Video className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="text-amber-500 hover:bg-amber-50">
                  <Smile className="w-5 h-5" />
                </Button>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="rounded-full px-6 bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4 mr-2" />
                Publicar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
