import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { GroupedStories, Story } from '@/hooks/useStories';

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
  if (!name) return 'Membro';
  const firstName = name.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

// Story Preview Component - shows thumbnail/background instead of avatar
const StoryPreview: React.FC<{ story: Story; size?: string }> = ({ story, size = 'w-14 h-14 sm:w-16 sm:h-16' }) => {
  if (story.media_type === 'text') {
    // Text story: show background color with text preview
    return (
      <div 
        className={`${size} rounded-full flex items-center justify-center overflow-hidden`}
        style={{ backgroundColor: story.background_color || '#6366f1' }}
      >
        <span className="text-white text-[8px] sm:text-[9px] font-medium text-center px-1 leading-tight line-clamp-2">
          {story.text_content?.slice(0, 20) || ''}
        </span>
      </div>
    );
  }
  
  // Image/Video story: show thumbnail
  if (story.media_url) {
    return (
      <img 
        src={story.media_url} 
        alt="Story preview"
        className={`${size} rounded-full object-cover`}
      />
    );
  }

  // Fallback
  return (
    <div className={`${size} rounded-full bg-muted flex items-center justify-center`}>
      <span className="text-muted-foreground text-xs">?</span>
    </div>
  );
};

export const StoriesSection: React.FC<StoriesSectionProps> = ({
  groupedStories,
  currentUserName,
  currentUserAvatar,
  hasOwnStory,
  onStoryClick,
  onCreateStory
}) => {
  // Find the index of own story group to open viewer
  const ownGroupIndex = groupedStories.findIndex(g => g.is_own);
  const hasOwn = ownGroupIndex >= 0;
  const ownGroup = hasOwn ? groupedStories[ownGroupIndex] : null;
  const ownLatestStory = ownGroup?.stories[0];

  const handleOwnStoryClick = () => {
    if (hasOwn) {
      // Open story viewer for own stories
      onStoryClick(ownGroupIndex);
    } else {
      // No stories yet, open create modal
      onCreateStory();
    }
  };

  const handleAddStoryClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    onCreateStory();
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 via-background to-accent/5 dark:from-primary/10 dark:via-background dark:to-accent/10 rounded-2xl border border-primary/20 shadow-sm p-3 sm:p-4 mb-4">
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {/* Own Story / Add Story Button */}
        <motion.div
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOwnStoryClick}
          className="flex flex-col items-center gap-1.5 cursor-pointer min-w-[64px] sm:min-w-[76px]"
        >
          <div className="relative">
            <div className={`p-[2px] rounded-full ${hasOwn ? 'bg-gradient-to-br from-primary via-primary/80 to-accent' : 'bg-gradient-to-br from-primary/30 to-primary/10'}`}>
              <div className={`rounded-full overflow-hidden ${hasOwn ? 'border-[3px] border-background' : 'border-2 border-dashed border-primary/50'}`}>
                {hasOwn && ownLatestStory ? (
                  <StoryPreview story={ownLatestStory} />
                ) : (
                  <Avatar className="w-14 h-14 sm:w-16 sm:h-16">
                    <AvatarImage src={currentUserAvatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {currentUserName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
            <motion.div 
              whileHover={{ scale: 1.2 }}
              onClick={handleAddStoryClick}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg ring-2 ring-background cursor-pointer"
            >
              <Plus className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          </div>
          <span className="text-[10px] sm:text-xs text-primary font-medium">{hasOwn ? 'Seu story' : 'Criar story'}</span>
        </motion.div>

        {/* Stories */}
        {groupedStories.filter(g => !g.is_own).map((group, index) => {
          const latestStory = group.stories[0];
          return (
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
                  <div className="rounded-full overflow-hidden border-[3px] border-background">
                    {latestStory ? (
                      <StoryPreview story={latestStory} />
                    ) : (
                      <Avatar className="w-14 h-14 sm:w-16 sm:h-16">
                        <AvatarImage src={group.user_avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {group.user_name?.charAt(0)?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
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
          );
        })}
      </div>
    </div>
  );
};
