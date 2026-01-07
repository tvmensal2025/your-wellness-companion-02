import React from 'react';
import { motion } from 'framer-motion';
import { Star, Eye, Clock, Crown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GroupedStories, Story } from '@/hooks/useStories';
import { StoryCategoryBadge } from './StoryTimeIndicator';

interface FeaturedStoriesSectionProps {
  groupedStories: GroupedStories[];
  onStoryClick: (groupIndex: number) => void;
  minViews?: number;
}

const formatName = (name: string) => {
  if (!name) return 'Membro';
  const firstName = name.split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

const calculateTimeRemaining = (expiresAt: string) => {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();
  
  if (diffMs <= 0) return null;
  
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${minutes}min`;
};

// Story Card for Featured Section
const FeaturedStoryCard: React.FC<{
  story: Story;
  userName: string;
  userAvatar?: string;
  onClick: () => void;
  rank: number;
}> = ({ story, userName, userAvatar, onClick, rank }) => {
  const timeRemaining = calculateTimeRemaining(story.expires_at);
  const category = (story as any).category || 'geral';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative min-w-[140px] sm:min-w-[160px] h-[200px] sm:h-[220px] rounded-xl overflow-hidden cursor-pointer shadow-lg group"
    >
      {/* Background */}
      {story.media_type === 'text' ? (
        <div 
          className="absolute inset-0"
          style={{ backgroundColor: story.background_color || '#6366f1' }}
        />
      ) : (
        <img 
          src={story.media_url} 
          alt="Story"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Rank Badge */}
      {rank <= 3 && (
        <div className="absolute top-2 left-2">
          <Badge className={`
            ${rank === 1 ? 'bg-yellow-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700'} 
            text-white border-0 text-[10px] flex items-center gap-1
          `}>
            <Crown className="w-3 h-3" />
            #{rank}
          </Badge>
        </div>
      )}

      {/* Time Remaining */}
      {timeRemaining && (
        <div className="absolute top-2 right-2">
          <Badge 
            variant="secondary" 
            className="bg-black/40 text-white border-0 backdrop-blur-sm text-[10px] flex items-center gap-1"
          >
            <Clock className="w-2.5 h-2.5" />
            {timeRemaining}
          </Badge>
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-10 left-2">
        <StoryCategoryBadge category={category} />
      </div>

      {/* Text Preview for Text Stories */}
      {story.media_type === 'text' && story.text_content && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <p className="text-white text-sm font-medium text-center line-clamp-4">
            {story.text_content}
          </p>
        </div>
      )}

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="w-7 h-7 border-2 border-white/50">
            <AvatarImage src={userAvatar} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {userName?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-white text-xs font-medium truncate">
            {formatName(userName)}
          </span>
        </div>

        {/* Views Count */}
        <div className="flex items-center gap-1 text-white/80">
          <Eye className="w-3 h-3" />
          <span className="text-[10px] font-medium">{story.views_count} visualizações</span>
        </div>
      </div>

      {/* Featured Star */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Star className="w-8 h-8 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
      </div>
    </motion.div>
  );
};

export const FeaturedStoriesSection: React.FC<FeaturedStoriesSectionProps> = ({
  groupedStories,
  onStoryClick,
  minViews = 3,
}) => {
  // Flatten all stories and filter by views, then sort by views count
  const featuredStories = groupedStories
    .flatMap(group => 
      group.stories.map(story => ({
        story,
        userName: group.user_name,
        userAvatar: group.user_avatar,
        groupIndex: groupedStories.findIndex(g => g.user_id === group.user_id)
      }))
    )
    .filter(item => item.story.views_count >= minViews)
    .sort((a, b) => b.story.views_count - a.story.views_count)
    .slice(0, 6); // Max 6 featured stories

  if (featuredStories.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <h3 className="text-sm font-semibold text-foreground">Stories em Destaque</h3>
        <Badge variant="secondary" className="text-[10px]">
          {featuredStories.length} populares
        </Badge>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {featuredStories.map((item, index) => (
          <FeaturedStoryCard
            key={item.story.id}
            story={item.story}
            userName={item.userName}
            userAvatar={item.userAvatar}
            onClick={() => onStoryClick(item.groupIndex)}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
};
