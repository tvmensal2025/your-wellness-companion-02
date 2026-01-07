import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Trophy, Flame, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface Story {
  id: string;
  userName: string;
  userAvatar: string;
  hasNewStory: boolean;
  isViewed: boolean;
  storyType?: 'achievement' | 'streak' | 'goal' | 'normal';
}

interface StoriesSectionProps {
  stories: Story[];
  currentUserName: string;
  currentUserAvatar?: string;
}

const getStoryTypeIcon = (type?: string) => {
  switch (type) {
    case 'achievement':
      return <Trophy className="w-2.5 h-2.5 text-yellow-500" />;
    case 'streak':
      return <Flame className="w-2.5 h-2.5 text-orange-500" />;
    case 'goal':
      return <Target className="w-2.5 h-2.5 text-primary" />;
    default:
      return null;
  }
};

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  currentUserName,
  currentUserAvatar
}) => {
  return (
    <div className="bg-gradient-to-r from-primary/5 via-background to-accent/5 dark:from-primary/10 dark:via-background dark:to-accent/10 rounded-2xl border border-primary/20 shadow-sm p-3 sm:p-4 mb-4">
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add Story Button */}
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1.5 cursor-pointer min-w-[64px] sm:min-w-[76px]"
        >
          <div className="relative">
            <div className="p-[2px] rounded-full bg-gradient-to-br from-primary/30 to-primary/10">
              <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-dashed border-primary/50">
                <AvatarImage src={currentUserAvatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {currentUserName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <motion.div 
              whileHover={{ scale: 1.2 }}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg ring-2 ring-background"
            >
              <Plus className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          </div>
          <span className="text-[10px] sm:text-xs text-primary font-medium">Seu story</span>
        </motion.div>

        {/* Stories */}
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1.5 cursor-pointer min-w-[64px] sm:min-w-[76px]"
          >
            <div className="relative">
              <div className={`p-[2.5px] rounded-full ${
                story.hasNewStory && !story.isViewed 
                  ? 'bg-gradient-to-br from-primary via-primary/80 to-accent animate-pulse' 
                  : 'bg-muted-foreground/30'
              }`}>
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-[3px] border-background">
                  <AvatarImage src={story.userAvatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {story.userName?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {story.storyType && story.storyType !== 'normal' && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-background rounded-full flex items-center justify-center shadow-sm ring-1 ring-border">
                  {getStoryTypeIcon(story.storyType)}
                </div>
              )}
            </div>
            <span className={`text-[10px] sm:text-xs font-medium truncate max-w-[64px] sm:max-w-[76px] ${
              story.isViewed ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {story.userName.split(' ')[0]}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
