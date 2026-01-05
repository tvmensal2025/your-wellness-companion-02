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
    <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50 shadow-sm p-3 sm:p-4 mb-3 sm:mb-4">
      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add Story Button */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-1 cursor-pointer min-w-[60px] sm:min-w-[72px]"
        >
          <div className="relative">
            <Avatar className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-dashed border-blue-400">
              <AvatarImage src={currentUserAvatar} />
              <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600">
                {currentUserName?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
          <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">Seu story</span>
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
            className="flex flex-col items-center gap-1 cursor-pointer min-w-[60px] sm:min-w-[72px]"
          >
            <div className={`p-[2px] rounded-full ${
              story.hasNewStory && !story.isViewed 
                ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700' 
                : 'bg-gray-300 dark:bg-gray-700'
            }`}>
              <Avatar className="w-[48px] h-[48px] sm:w-[60px] sm:h-[60px] border-2 border-background">
                <AvatarImage src={story.userAvatar} />
                <AvatarFallback className="bg-blue-50 dark:bg-blue-950 text-blue-600">
                  {story.userName?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <span className={`text-[10px] sm:text-xs font-medium truncate max-w-[60px] sm:max-w-[72px] ${
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
