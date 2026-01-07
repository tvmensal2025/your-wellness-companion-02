import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Hash, Flame, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface TrendingTopic {
  tag: string;
  count: number;
  engagement: number;
  recentPosts: number;
  trendScore: number;
}

interface TrendingTopicsProps {
  topics: TrendingTopic[];
  onTopicClick: (tag: string) => void;
  compact?: boolean;
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({
  topics,
  onTopicClick,
  compact = false,
}) => {
  const getTrendIcon = (index: number) => {
    if (index === 0) return <Flame className="w-4 h-4 text-orange-500" />;
    if (index < 3) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    return <ArrowUpRight className="w-3 h-3 text-muted-foreground" />;
  };

  const getTrendBadge = (topic: TrendingTopic) => {
    if (topic.recentPosts >= 5) {
      return (
        <Badge variant="secondary" className="text-[10px] bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
          🔥 Hot
        </Badge>
      );
    }
    if (topic.engagement >= 50) {
      return (
        <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
          📈 Viral
        </Badge>
      );
    }
    return null;
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {topics.slice(0, 5).map((topic, index) => (
          <motion.div
            key={topic.tag}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary/10 hover:border-primary transition-colors px-3 py-1"
              onClick={() => onTopicClick(topic.tag)}
            >
              <Hash className="w-3 h-3 mr-1" />
              {topic.tag}
              <span className="ml-1.5 text-muted-foreground">
                {topic.count}
              </span>
            </Badge>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <TrendingUp className="w-4 h-4 text-primary" />
          </div>
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {topics.slice(0, 8).map((topic, index) => (
          <motion.div
            key={topic.tag}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors group"
            onClick={() => onTopicClick(topic.tag)}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              {getTrendIcon(index)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm group-hover:text-primary transition-colors">
                  #{topic.tag}
                </span>
                {getTrendBadge(topic)}
              </div>
              <p className="text-xs text-muted-foreground">
                {topic.count} posts · {topic.engagement} interações
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-medium text-primary">
                #{index + 1}
              </span>
            </div>
          </motion.div>
        ))}

        {topics.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum tópico em alta ainda</p>
            <p className="text-xs">Seja o primeiro a criar uma tendência!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
