import { useMemo, useState, useCallback } from 'react';
import { FeedPost } from '@/hooks/useFeedPosts';
import { useAuth } from '@/hooks/useAuth';

export type FeedAlgorithm = 'smart' | 'recent' | 'trending' | 'following';

interface RelevanceFactors {
  recency: number;
  engagement: number;
  userAffinity: number;
  contentQuality: number;
  trendingBoost: number;
}

export function useSmartFeed(posts: FeedPost[], algorithm: FeedAlgorithm = 'smart') {
  const { user } = useAuth();
  const [userInterests, setUserInterests] = useState<string[]>([]);

  // Calculate post age in hours
  const getPostAgeHours = useCallback((createdAt: string) => {
    const now = new Date();
    const postDate = new Date(createdAt);
    return (now.getTime() - postDate.getTime()) / (1000 * 60 * 60);
  }, []);

  // Calculate relevance score for a post
  const calculateRelevanceScore = useCallback((post: FeedPost): number => {
    const ageHours = getPostAgeHours(post.created_at);
    
    // Recency factor (decays over time, half-life of 24 hours)
    const recencyScore = Math.exp(-ageHours / 24) * 100;
    
    // Engagement factor
    const totalEngagement = post.likes_count + (post.comments_count * 2) + (post.shares_count * 3);
    const engagementScore = Math.min(totalEngagement * 5, 100);
    
    // Content quality (has media, longer content, has tags)
    let qualityScore = 0;
    if (post.media_urls && post.media_urls.length > 0) qualityScore += 30;
    if (post.content && post.content.length > 100) qualityScore += 20;
    if (post.tags && post.tags.length > 0) qualityScore += 20;
    qualityScore = Math.min(qualityScore, 70);
    
    // User interaction boost (if user liked this post)
    const userBoost = post.is_liked ? 20 : 0;
    
    // Trending boost (high engagement in short time)
    const engagementRate = ageHours > 0 ? totalEngagement / ageHours : totalEngagement;
    const trendingBoost = Math.min(engagementRate * 10, 50);
    
    // Interest matching
    let interestScore = 0;
    if (post.tags && userInterests.length > 0) {
      const matchingTags = post.tags.filter(tag => 
        userInterests.some(interest => 
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      );
      interestScore = (matchingTags.length / userInterests.length) * 30;
    }

    // Weight factors
    const weights: RelevanceFactors = {
      recency: 0.25,
      engagement: 0.25,
      userAffinity: 0.15,
      contentQuality: 0.15,
      trendingBoost: 0.20,
    };

    return (
      recencyScore * weights.recency +
      engagementScore * weights.engagement +
      (userBoost + interestScore) * weights.userAffinity +
      qualityScore * weights.contentQuality +
      trendingBoost * weights.trendingBoost
    );
  }, [getPostAgeHours, userInterests]);

  // Sort posts based on selected algorithm
  const sortedPosts = useMemo(() => {
    const postsWithScores = posts.map(post => ({
      ...post,
      relevanceScore: calculateRelevanceScore(post),
    }));

    switch (algorithm) {
      case 'smart':
        return postsWithScores.sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      case 'recent':
        return postsWithScores.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      case 'trending':
        return postsWithScores.sort((a, b) => {
          const aEngagement = a.likes_count + a.comments_count * 2 + a.shares_count * 3;
          const bEngagement = b.likes_count + b.comments_count * 2 + b.shares_count * 3;
          const aAge = getPostAgeHours(a.created_at);
          const bAge = getPostAgeHours(b.created_at);
          const aRate = aAge > 0 ? aEngagement / aAge : aEngagement;
          const bRate = bAge > 0 ? bEngagement / bAge : bEngagement;
          return bRate - aRate;
        });
      
      case 'following':
        // In a real app, filter by followed users
        return postsWithScores.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      
      default:
        return postsWithScores;
    }
  }, [posts, algorithm, calculateRelevanceScore, getPostAgeHours]);

  // Extract trending topics from posts
  const trendingTopics = useMemo(() => {
    const tagCounts: Record<string, { count: number; engagement: number; recentPosts: number }> = {};
    const now = new Date();
    const last24h = 24 * 60 * 60 * 1000;

    posts.forEach(post => {
      const postAge = now.getTime() - new Date(post.created_at).getTime();
      const isRecent = postAge < last24h;
      
      post.tags?.forEach(tag => {
        if (!tagCounts[tag]) {
          tagCounts[tag] = { count: 0, engagement: 0, recentPosts: 0 };
        }
        tagCounts[tag].count++;
        tagCounts[tag].engagement += post.likes_count + post.comments_count;
        if (isRecent) tagCounts[tag].recentPosts++;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, stats]) => ({
        tag,
        count: stats.count,
        engagement: stats.engagement,
        recentPosts: stats.recentPosts,
        trendScore: stats.recentPosts * 2 + stats.engagement * 0.5 + stats.count,
      }))
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 10);
  }, [posts]);

  // Get suggested posts based on user interests
  const suggestedPosts = useMemo(() => {
    if (userInterests.length === 0) {
      // If no interests, suggest high-engagement posts
      return sortedPosts
        .filter(post => post.likes_count + post.comments_count >= 5)
        .slice(0, 5);
    }

    return sortedPosts
      .filter(post => 
        post.tags?.some(tag => 
          userInterests.some(interest => 
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        )
      )
      .slice(0, 5);
  }, [sortedPosts, userInterests]);

  // Update user interests based on interactions
  const trackInteraction = useCallback((post: FeedPost, type: 'view' | 'like' | 'comment' | 'share') => {
    if (post.tags && post.tags.length > 0) {
      const weight = type === 'like' ? 2 : type === 'comment' ? 3 : type === 'share' ? 4 : 1;
      
      setUserInterests(prev => {
        const newInterests = [...prev];
        post.tags?.forEach(tag => {
          for (let i = 0; i < weight; i++) {
            if (!newInterests.includes(tag)) {
              newInterests.push(tag);
            }
          }
        });
        // Keep only last 20 interests
        return newInterests.slice(-20);
      });
    }
  }, []);

  return {
    sortedPosts,
    trendingTopics,
    suggestedPosts,
    trackInteraction,
    userInterests,
  };
}
