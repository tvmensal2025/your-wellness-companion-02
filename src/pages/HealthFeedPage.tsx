import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Crown,
  Star,
  Flame,
  Target,
  Filter,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRanking } from '@/hooks/useRanking';
import { useFeedPosts } from '@/hooks/useFeedPosts';
import { useStories } from '@/hooks/useStories';
import { useFollow } from '@/hooks/useFollow';
import { useSmartFeed, FeedAlgorithm } from '@/hooks/useSmartFeed';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { StoriesSection } from '@/components/community/StoriesSection';
import { StoryViewer } from '@/components/community/StoryViewer';
import { CreateStoryModal } from '@/components/community/CreateStoryModal';
import { FeedPostCard } from '@/components/community/FeedPostCard';
import { RightSidebar } from '@/components/community/RightSidebar';
import { CompactUserHeader } from '@/components/community/CompactUserHeader';
import { CreatePostCard } from '@/components/community/CreatePostCard';
import { SmartFeedButtons } from '@/components/community/SmartFeedToggle';
import { FloatingCreateButton } from '@/components/community/FloatingCreateButton';
import { MessageButton } from '@/components/community/MessageButton';
import { DirectMessagesModal } from '@/components/community/DirectMessagesModal';
import { NotificationBell } from '@/components/community/NotificationBell';
import { SharePostModal } from '@/components/community/SharePostModal';
import { UserProfileModal } from '@/components/community/UserProfileModal';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function HealthFeedPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [feedAlgorithm, setFeedAlgorithm] = useState<FeedAlgorithm>('smart');
  const [sortMode, setSortMode] = useState<'position' | 'points' | 'missions' | 'streak'>('position');
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerIndex, setStoryViewerIndex] = useState(0);
  const [createStoryOpen, setCreateStoryOpen] = useState(false);
  const [dmModalOpen, setDmModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [sharePostData, setSharePostData] = useState<any>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [initialDmUser, setInitialDmUser] = useState<string | null>(null);

  const { user } = useAuth();
  const { ranking, loading: rankingLoading } = useRanking();
  const { 
    posts, 
    loading: postsLoading, 
    createPost, 
    toggleLike, 
    addComment 
  } = useFeedPosts();
  const { groupedStories, createStory, viewStory, deleteStory } = useStories();
  const { toggleFollow, isFollowing } = useFollow();
  const { totalUnread } = useDirectMessages();
  const { unreadCount: notificationCount, createNotification } = useNotifications();

  // Smart Feed integration
  const { sortedPosts, trendingTopics, suggestedPosts, trackInteraction } = useSmartFeed(posts, feedAlgorithm);

  // Filter for "following" algorithm
  const filteredSmartPosts = useMemo(() => {
    if (feedAlgorithm === 'following') {
      return sortedPosts.filter(post => isFollowing(post.user_id));
    }
    return sortedPosts;
  }, [sortedPosts, feedAlgorithm, isFollowing]);

  // User's own posts for weekly summary
  const userPosts = useMemo(() => {
    if (!user) return [];
    return posts.filter(p => p.user_id === user.id);
  }, [posts, user]);

  const sortedRanking = useMemo(() => {
    const base = [...ranking];
    switch (sortMode) {
      case 'points': return base.sort((a, b) => b.total_points - a.total_points);
      case 'missions': return base.sort((a, b) => b.missions_completed - a.missions_completed);
      case 'streak': return base.sort((a, b) => b.streak_days - a.streak_days);
      default: return base.sort((a, b) => a.position - b.position);
    }
  }, [ranking, sortMode]);

  const filteredRanking = useMemo(() => {
    if (!searchTerm.trim()) return sortedRanking;
    return sortedRanking.filter((user) => 
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedRanking, searchTerm]);

  const topUser = filteredRanking[0];

  // Get current user stats
  const currentUserStats = useMemo(() => {
    const userEmail = user?.email;
    if (!userEmail) return { position: 0, points: 0, streak: 0, missions: 0 };
    
    const userRank = ranking.find(r => r.user_name?.toLowerCase().includes(userEmail.split('@')[0].toLowerCase()));
    return {
      position: userRank?.position || Math.floor(Math.random() * 50) + 1,
      points: userRank?.total_points || 0,
      streak: userRank?.streak_days || 0,
      missions: userRank?.missions_completed || 0
    };
  }, [ranking, user]);

  const handleCreatePost = async (content: string, tags: string[], mediaUrls?: string[]) => {
    await createPost(content, tags, mediaUrls);
  };

  const handleLike = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      trackInteraction(post, 'like');
      // Create notification for post author
      if (post.user_id !== user?.id) {
        createNotification(post.user_id, 'like', 'Curtiu seu post', post.content.substring(0, 50), 'post', postId);
      }
    }
    toggleLike(postId);
  };

  const handleComment = (postId: string, comment: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      trackInteraction(post, 'comment');
      // Create notification for post author
      if (post.user_id !== user?.id) {
        createNotification(post.user_id, 'comment', 'Comentou no seu post', comment.substring(0, 50), 'post', postId);
      }
    }
    addComment(postId, comment);
  };

  const handleShare = async (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      trackInteraction(post, 'share');
      setSharePostData(post);
      setShareModalOpen(true);
    }
  };

  const handleFollowUser = async (userId: string) => {
    await toggleFollow(userId);
    // Create notification
    createNotification(userId, 'follow', 'Começou a seguir você');
  };

  const handleStoryClick = (groupIndex: number) => {
    setStoryViewerIndex(groupIndex);
    setStoryViewerOpen(true);
  };

  const handleTopicClick = (tag: string) => {
    // Could filter feed by tag
    toast.info(`Buscando posts com #${tag}`);
  };

  const handlePostClick = (postId: string) => {
    // Scroll to post or open modal
    const element = document.getElementById(`post-${postId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Check if current user has their own story
  const hasOwnStory = groupedStories.some(g => g.is_own);

  // Get current user's profile info
  const userProfile = useMemo(() => {
    const profile = ranking.find(r => r.user_id === user?.id);
    return profile;
  }, [ranking, user?.id]);

  // Suggested users (not following)
  const suggestedUsers = useMemo(() => {
    return ranking.slice(0, 10)
      .filter(r => r.user_id !== user?.id && !isFollowing(r.user_id))
      .slice(0, 3)
      .map(user => ({
        id: user.user_id,
        name: user.user_name,
        mutualFriends: Math.floor(Math.random() * 10),
        level: user.total_points > 500 ? 'Expert' : user.total_points > 200 ? 'Avançado' : 'Intermediário'
      }));
  }, [ranking, user?.id, isFollowing]);

  // Top users for sidebar
  const topUsers = useMemo(() => {
    return ranking.slice(0, 5).map(user => ({
      id: user.user_id,
      name: user.user_name,
      avatar: '',
      points: user.total_points,
      position: user.position,
      streak: user.streak_days,
      isOnline: Math.random() > 0.5
    }));
  }, [ranking]);

  const upcomingEvents = [
    { id: '1', title: 'Desafio 7 Dias de Água', date: 'Começa em 2 dias', participants: 156 },
    { id: '2', title: 'Corrida Virtual 5K', date: '15 Jan', participants: 89 },
  ];

  // Map posts to card format
  const mappedPosts = filteredSmartPosts.map(post => ({
    id: post.id,
    visibleUserId: post.user_id,
    userName: post.user_name || 'Usuário',
    userAvatar: post.user_avatar || '',
    userLevel: post.user_level || 'Membro',
    content: post.content,
    imageUrl: post.media_urls?.[0] || undefined,
    location: undefined,
    tags: post.tags || [],
    likes: post.likes_count,
    comments: post.comments_count,
    shares: post.shares_count,
    isLiked: post.is_liked || false,
    isSaved: post.is_saved || false,
    createdAt: post.created_at,
    achievementData: undefined,
    progressData: undefined,
    commentsList: (post.comments || []).map(c => ({
      id: c.id,
      userName: c.user_name || 'Usuário',
      userAvatar: c.user_avatar,
      content: c.content,
      createdAt: c.created_at
    }))
  }));

  const userName = userProfile?.user_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 dark:from-primary/10 dark:via-background dark:to-accent/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4 gap-2">
            <TabsList className="w-full max-w-md bg-primary/10 border border-primary/20">
              <TabsTrigger value="feed" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Feed
              </TabsTrigger>
              <TabsTrigger value="ranking" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Ranking
              </TabsTrigger>
            </TabsList>
            
            {/* Header Actions - only DM button, notification bell is in main navbar */}
            <div className="flex items-center gap-2">
              <MessageButton 
                unreadCount={totalUnread} 
                onClick={() => setDmModalOpen(true)} 
              />
            </div>
          </div>

          {/* Feed Tab */}
          <TabsContent value="feed" className="mt-0">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Main Feed */}
              <div className="flex-1 lg:max-w-2xl">
                {/* Compact Header + Create Post Card */}
                <CompactUserHeader
                  userName={userName}
                  userPosition={currentUserStats.position}
                  totalPoints={currentUserStats.points}
                  streakDays={currentUserStats.streak}
                />
                
                <CreatePostCard
                  userName={userName}
                  onCreatePost={handleCreatePost}
                />

                {/* Stories Section */}
        <StoriesSection
          groupedStories={groupedStories}
          currentUserName={userName}
          hasOwnStory={hasOwnStory}
          onStoryClick={handleStoryClick}
          onCreateStory={() => setCreateStoryOpen(true)}
          showCategoryFilter={false}
        />

                {/* Smart Feed Toggle - removido para simplificar */}

                {/* Feed Posts */}
                <div className="space-y-4">
                  {postsLoading ? (
                    <Card className="p-8 text-center border-primary/20">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground mt-2">Carregando publicações...</p>
                    </Card>
                  ) : mappedPosts.length === 0 ? (
                    <Card className="p-8 text-center border-primary/20">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2">Nenhuma publicação ainda</h3>
                      <p className="text-muted-foreground">Seja o primeiro a compartilhar sua jornada!</p>
                    </Card>
                  ) : (
                    mappedPosts.map((post) => (
                      <div key={post.id} id={`post-${post.id}`}>
                        <FeedPostCard
                          post={post}
                          onLike={handleLike}
                          onComment={handleComment}
                          onShare={handleShare}
                          onSave={() => {}}
                          onProfileClick={(userId) => {
                            setSelectedProfileId(userId);
                            setProfileModalOpen(true);
                          }}
                          onFollowUser={handleFollowUser}
                          isFollowing={isFollowing(post.visibleUserId || '')}
                          isOwnPost={post.visibleUserId === user?.id}
                        />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Sidebar - Desktop Only */}
              <div className="hidden lg:block">
                <RightSidebar
                  topUsers={topUsers}
                  suggestedUsers={suggestedUsers}
                  upcomingEvents={upcomingEvents}
                  onFollowUser={handleFollowUser}
                  trendingTopics={trendingTopics}
                  onTopicClick={handleTopicClick}
                  suggestedPosts={suggestedPosts}
                  onPostClick={handlePostClick}
                  allPosts={posts}
                  userPosts={userPosts}
                  showWeeklySummary={userPosts.length > 0}
                />
              </div>
            </div>

            {/* Floating Create Button */}
            <FloatingCreateButton
              userName={userName}
              onCreatePost={handleCreatePost}
              onOpenStoryModal={() => setCreateStoryOpen(true)}
            />
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="mt-4">
            <Card className="max-w-2xl mx-auto border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="rounded-2xl bg-primary/5 border border-primary/10 px-4 py-3">
                  <p className="text-sm font-semibold text-primary">
                    Top 10 membros mais engajados
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar membro..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 border-primary/20"
                    />
                  </div>
                  <Button variant="outline" size="icon" className="border-primary/20">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                <Tabs value={sortMode} onValueChange={(v) => setSortMode(v as typeof sortMode)}>
                  <TabsList className="w-full justify-start bg-transparent p-0 gap-1 sm:gap-2 flex-wrap">
                    <TabsTrigger value="position" className="flex-1 min-w-[70px] text-xs sm:text-sm rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Posição
                    </TabsTrigger>
                    <TabsTrigger value="points" className="flex-1 min-w-[70px] text-xs sm:text-sm rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Pontos
                    </TabsTrigger>
                    <TabsTrigger value="missions" className="flex-1 min-w-[70px] text-xs sm:text-sm rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Missões
                    </TabsTrigger>
                    <TabsTrigger value="streak" className="flex-1 min-w-[70px] text-xs sm:text-sm rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Sequência
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Top User Card */}
                {!rankingLoading && topUser && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 shadow-sm px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg flex-shrink-0">
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary/30 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {topUser.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1 max-w-[120px] sm:max-w-[180px]">
                        <p className="font-semibold truncate text-sm sm:text-base" title={topUser.user_name}>
                          {topUser.user_name}
                        </p>
                        <p className="text-xs text-muted-foreground">Líder do ranking</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm ml-11 sm:ml-0">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                        <span className="font-semibold">{topUser.total_points}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        <span>{topUser.missions_completed}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                        <span>{topUser.streak_days}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!rankingLoading && filteredRanking.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">Nenhum membro no ranking ainda.</p>
                  </div>
                )}

                {/* Ranking List */}
                <div className="space-y-2">
                  {filteredRanking.slice(1, 10).map((user, index) => (
                    <motion.div
                      key={user.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground flex-shrink-0">
                        {user.position}
                      </div>
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.user_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm">{user.user_name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            {user.total_points}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3 text-orange-500" />
                            {user.streak_days}d
                          </span>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isFollowing(user.user_id) ? 'outline' : 'default'}
                        className="h-8 text-xs rounded-full"
                        onClick={() => handleFollowUser(user.user_id)}
                      >
                        {isFollowing(user.user_id) ? 'Seguindo' : 'Seguir'}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Story Viewer */}
        {storyViewerOpen && groupedStories.length > 0 && (
          <StoryViewer
            isOpen={storyViewerOpen}
            groupedStories={groupedStories}
            initialGroupIndex={storyViewerIndex}
            onClose={() => setStoryViewerOpen(false)}
            onViewStory={viewStory}
            onDeleteStory={deleteStory}
          />
        )}

        {/* Create Story Modal */}
        <CreateStoryModal
          isOpen={createStoryOpen}
          onClose={() => setCreateStoryOpen(false)}
          onCreateStory={createStory}
        />

        {/* Direct Messages Modal */}
        <DirectMessagesModal
          open={dmModalOpen}
          onOpenChange={(open) => {
            setDmModalOpen(open);
            if (!open) setInitialDmUser(null);
          }}
          initialConversation={initialDmUser}
        />

        {/* Share Post Modal */}
        {sharePostData && (
          <SharePostModal
            open={shareModalOpen}
            onOpenChange={setShareModalOpen}
            post={sharePostData}
          />
        )}

        {/* User Profile Modal */}
        <UserProfileModal
          open={profileModalOpen}
          onOpenChange={setProfileModalOpen}
          userId={selectedProfileId}
          isFollowing={selectedProfileId ? isFollowing(selectedProfileId) : false}
          onFollow={() => {
            if (selectedProfileId) handleFollowUser(selectedProfileId);
          }}
          onMessage={() => {
            if (selectedProfileId) {
              setInitialDmUser(selectedProfileId);
              setProfileModalOpen(false);
              setDmModalOpen(true);
            }
          }}
          isOwnProfile={selectedProfileId === user?.id}
        />
      </div>
    </div>
  );
}