import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Trophy, Flame, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { GroupedStories } from '@/hooks/useStories';

interface StoriesSectionProps {
  groupedStories: GroupedStories[];
  currentUserName: string;
  currentUserAvatar?: string;
  hasOwnStory: boolean;
  onStoryClick: (groupIndex: number) => void;
  onCreateStory: () => void;
}

const getStoryTypeIcon = (hasUnviewed: boolean) => {
  if (hasUnviewed) {
    return <Flame className="w-2.5 h-2.5 text-orange-500" />;
  }
  return null;
};

const formatName = (name: string) => {
  if (!name) return 'Usuário';
  const firstName = name.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  groupedStories,
  currentUserName,
  currentUserAvatar,
  hasOwnStory,
  onStoryClick,
  onCreateStory
}) => {
  return (
    <div className="bg-gradient-to-r from-primary/5 via-background to-accent/5 dark:from-primary/10 dark:via-background dark:to-accent/10 rounded-2xl border border-primary/20 shadow-sm p-3 sm:p-4 mb-4">
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Add Story Button */}
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCreateStory}
          className="flex flex-col items-center gap-1.5 cursor-pointer min-w-[64px] sm:min-w-[76px]"
        >
          <div className="relative">
            <div className={`p-[2px] rounded-full ${hasOwnStory ? 'bg-gradient-to-br from-primary via-primary/80 to-accent' : 'bg-gradient-to-br from-primary/30 to-primary/10'}`}>
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
        {groupedStories.filter(g => !g.is_own).map((group, index) => (
          <motion.div
            key={group.user_id}
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStoryClick(groupedStories.findIndex(g => g.user_id === group.user_id))}
            className="flex flex-col items-center gap-1.5 cursor-pointer min-w-[64px] sm:min-w-[76px]"
          >
            <div className="relative">
              <div className={`p-[2.5px] rounded-full ${
                group.has_unviewed 
                  ? 'bg-gradient-to-br from-primary via-primary/80 to-accent' 
                  : 'bg-muted-foreground/30'
              }`}>
                <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-[3px] border-background">
                  <AvatarImage src={group.user_avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {group.user_name?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              {group.has_unviewed && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-background rounded-full flex items-center justify-center shadow-sm ring-1 ring-border">
                  {getStoryTypeIcon(true)}
                </div>
              )}
            </div>
            <span className={`text-[10px] sm:text-xs font-medium truncate max-w-[64px] sm:max-w-[76px] ${
              !group.has_unviewed ? 'text-muted-foreground' : 'text-foreground'
            }`}>
              {formatName(group.user_name)}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
