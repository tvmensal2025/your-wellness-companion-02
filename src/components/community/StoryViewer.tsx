import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Eye, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GroupedStories, Story } from '@/hooks/useStories';

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  groupedStories: GroupedStories[];
  initialGroupIndex: number;
  onViewStory: (storyId: string) => void;
  onDeleteStory?: (storyId: string) => void;
}

export const StoryViewer: React.FC<StoryViewerProps> = ({
  isOpen,
  onClose,
  groupedStories,
  initialGroupIndex,
  onViewStory,
  onDeleteStory
}) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentGroup = groupedStories[currentGroupIndex];
  const currentStory = currentGroup?.stories[currentStoryIndex];

  // Reset indices when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentGroupIndex(initialGroupIndex);
      setCurrentStoryIndex(0);
      setProgress(0);
    }
  }, [isOpen, initialGroupIndex]);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory && !currentStory.is_viewed && !currentStory.is_own) {
      onViewStory(currentStory.id);
    }
  }, [currentStory, onViewStory]);

  // Auto-advance progress
  useEffect(() => {
    if (!isOpen || !currentStory) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, currentStory, currentGroupIndex, currentStoryIndex]);

  const handleNext = useCallback(() => {
    if (!currentGroup) return;

    if (currentStoryIndex < currentGroup.stories.length - 1) {
      // Next story in same group
      setCurrentStoryIndex(prev => prev + 1);
      setProgress(0);
    } else if (currentGroupIndex < groupedStories.length - 1) {
      // Next group
      setCurrentGroupIndex(prev => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      // End of stories
      onClose();
    }
  }, [currentGroup, currentStoryIndex, currentGroupIndex, groupedStories.length, onClose]);

  const handlePrevious = useCallback(() => {
    if (currentStoryIndex > 0) {
      // Previous story in same group
      setCurrentStoryIndex(prev => prev - 1);
      setProgress(0);
    } else if (currentGroupIndex > 0) {
      // Previous group (last story)
      const prevGroup = groupedStories[currentGroupIndex - 1];
      setCurrentGroupIndex(prev => prev - 1);
      setCurrentStoryIndex(prevGroup.stories.length - 1);
      setProgress(0);
    }
  }, [currentStoryIndex, currentGroupIndex, groupedStories]);

  const handleDelete = () => {
    if (currentStory && onDeleteStory) {
      onDeleteStory(currentStory.id);
      handleNext();
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const hours = Math.floor(diffInMinutes / 60);
    return `${hours}h`;
  };

  const formatName = (name: string) => {
    if (!name) return 'Usuário';
    return name.split(' ')[0].charAt(0).toUpperCase() + name.split(' ')[0].slice(1).toLowerCase();
  };

  if (!currentGroup || !currentStory) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md h-[90vh] p-0 bg-black border-none overflow-hidden">
        <div className="relative w-full h-full flex flex-col">
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
            {currentGroup.stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{
                    width: index < currentStoryIndex 
                      ? '100%' 
                      : index === currentStoryIndex 
                        ? `${progress}%` 
                        : '0%'
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-6 left-0 right-0 z-20 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-white">
                <AvatarImage src={currentGroup.user_avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {currentGroup.user_name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white font-semibold text-sm">
                  {formatName(currentGroup.user_name)}
                </p>
                <p className="text-white/70 text-xs">{formatTimeAgo(currentStory.created_at)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentStory.is_own && onDeleteStory && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Story Content */}
          <div className="flex-1 flex items-center justify-center bg-black">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStory.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full h-full flex items-center justify-center"
                style={{ backgroundColor: currentStory.background_color || '#000' }}
              >
                {currentStory.media_url ? (
                  currentStory.media_type === 'video' ? (
                    <video
                      src={currentStory.media_url}
                      className="max-w-full max-h-full object-contain"
                      autoPlay
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={currentStory.media_url}
                      alt="Story"
                      className="max-w-full max-h-full object-contain"
                    />
                  )
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-white text-2xl font-bold">{currentStory.text_content}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Areas */}
          <div
            className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
            onClick={handlePrevious}
          />
          <div
            className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer"
            onClick={handleNext}
          />

          {/* Navigation Arrows (visible on hover) */}
          {(currentGroupIndex > 0 || currentStoryIndex > 0) && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white hover:bg-white/20"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}
          {(currentGroupIndex < groupedStories.length - 1 || currentStoryIndex < currentGroup.stories.length - 1) && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 text-white/70 hover:text-white hover:bg-white/20"
              onClick={handleNext}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Footer - Views Count */}
          {currentStory.is_own && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 text-white/80">
              <Eye className="w-4 h-4" />
              <span className="text-sm">{currentStory.views_count} visualizações</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
