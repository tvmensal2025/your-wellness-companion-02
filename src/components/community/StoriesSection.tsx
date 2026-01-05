import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface Story {
  id: string;
  userName: string;
  userAvatar: string;
  hasNewStory: boolean;
  isViewed: boolean;
}

interface StoriesSectionProps {
  stories: Story[];
  currentUserName: string;
  currentUserAvatar?: string;
}

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  stories,
  currentUserName,
  currentUserAvatar
}) => {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-4 mb-4">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add Story Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1 cursor-pointer min-w-[72px]"
        >
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-dashed border-primary/50">
              <AvatarImage src={currentUserAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {currentUserName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-4 h-4 text-primary-foreground" />
            </div>
          </div>
          <span className="text-xs text-muted-foreground font-medium">Seu story</span>
        </motion.div>

        {/* Stories */}
        {stories.map((story, index) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-1 cursor-pointer min-w-[72px]"
          >
            <div className={`p-[2px] rounded-full ${
              story.hasNewStory && !story.isViewed 
                ? 'bg-gradient-to-br from-primary via-purple-500 to-pink-500' 
                : 'bg-muted'
            }`}>
              <Avatar className="w-[60px] h-[60px] border-2 border-background">
                <AvatarImage src={story.userAvatar} />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {story.userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className={`text-xs font-medium truncate max-w-[72px] ${
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
