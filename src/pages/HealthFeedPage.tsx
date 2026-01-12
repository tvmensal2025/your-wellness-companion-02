import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/hooks/useUserProfile';
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
import { useUserProgressStats } from '@/hooks/useUserProgressStats';
import { StoriesSection } from '@/components/community/StoriesSection';
import { StoryViewer } from '@/components/community/StoryViewer';
import { CreateStoryModal } from '@/components/community/CreateStoryModal';
import { FeedPostCard } from '@/components/community/FeedPostCard';
import { RightSidebar } from '@/components/community/RightSidebar';
import { CommunityHeroHeader } from '@/components/community/CommunityHeroHeader';
import { SmartFeedButtons } from '@/components/community/SmartFeedToggle';
import { FloatingCreateButton } from '@/components/community/FloatingCreateButton';
import { MessageButton } from '@/components/community/MessageButton';
import { DirectMessagesModal } from '@/components/community/DirectMessagesModal';
import { NotificationBell } from '@/components/community/NotificationBell';
import { SharePostModal } from '@/components/community/SharePostModal';
import { UserProfileModal } from '@/components/community/UserProfileModal';
import { FollowingList } from '@/components/community/FollowingList';
import { FollowersList } from '@/components/community/FollowersList';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CommunityHealthSummary } from '@/components/community/CommunityHealthSummary';
import { RankingPodium } from '@/components/ranking/RankingPodium';
import { CurrentUserRankCard } from '@/components/ranking/CurrentUserRankCard';
import { RankingUserCard } from '@/components/ranking/RankingUserCard';
import { RankingStats } from '@/components/ranking/RankingStats';
import { RankingHeader } from '@/components/ranking/RankingHeader';
import { RankingSocialHeader } from '@/components/ranking/RankingSocialHeader';
import { ConnectionsTab } from '@/components/community/ConnectionsTab';
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
  const [showFollowersList, setShowFollowersList] = useState(false);

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
  const { stats: userProgressStats } = useUserProgressStats(user?.id || null);

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

  // Get current user stats - usando useMemo para estabilizar valores e evitar recálculos
  const currentUserStats = useMemo(() => {
    if (!user?.id) return { position: 0, points: 0, streak: 0, missions: 0 };
    
    // Buscar pelo user_id ao invés de email para garantir correspondência exata
    const userRank = ranking.find(r => r.user_id === user.id);
    
    // Se encontrou no ranking, usar esses dados
    if (userRank) {
      return {
        position: userRank.position || 0,
        points: userRank.total_points || 0,
        streak: userRank.streak_days || 0,
        missions: userRank.missions_completed || 0
      };
    }
    
    // Se não encontrar no ranking, usar dados do userProgressStats como fallback
    // E calcular posição estimada baseada nos pontos
    const userPoints = userProgressStats?.totalPoints || 0;
    let estimatedPosition = ranking.length + 1; // Assume última posição
    
    // Calcular posição real baseada nos pontos
    if (userPoints > 0 && ranking.length > 0) {
      const usersWithMorePoints = ranking.filter(r => r.total_points > userPoints).length;
      estimatedPosition = usersWithMorePoints + 1;
    }
    
    return {
      position: estimatedPosition,
      points: userPoints,
      streak: userProgressStats?.currentStreak || 0,
      missions: userProgressStats?.challengesCompleted || 0
    };
  }, [ranking, user?.id, userProgressStats?.totalPoints, userProgressStats?.currentStreak, userProgressStats?.challengesCompleted]);

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
    // Notification is already created in useFollow hook
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

  // Get current user's profile info from ranking
  const rankingProfile = useMemo(() => {
    const profile = ranking.find(r => r.user_id === user?.id);
    return profile;
  }, [ranking, user?.id]);

  // Get real profile data
  const { profileData: realProfile } = useUserProfile(user);

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

  // Mock data para novas seções
  const recentAchievements = useMemo(() => {
    return ranking.slice(0, 4).map((user, index) => ({
      id: `achievement-${user.user_id}`,
      userId: user.user_id,
      userName: user.user_name,
      userAvatar: user.avatar_url,
      type: (['weight_loss', 'streak', 'challenge', 'workout', 'nutrition'] as const)[index % 5],
      title: [
        'Perdeu 2kg esta semana!',
        `${user.streak_days} dias de sequência!`,
        'Completou desafio de água',
        'Treinou 5x esta semana',
        'Bateu meta de proteína'
      ][index % 5],
      value: ['-2kg', `🔥${user.streak_days}`, '✅ 100%', '5 treinos', '150g'][index % 5],
      timeAgo: ['2h', '5h', 'Ontem', '2 dias'][index % 4]
    }));
  }, [ranking]);

  const newMembers = useMemo(() => {
    return ranking.slice(-3).map(user => ({
      id: user.user_id,
      name: user.user_name,
      avatar: user.avatar_url,
      joinedAgo: 'Hoje'
    }));
  }, [ranking]);

  const handleMotivateUser = (userId: string, userName: string) => {
    // Criar notificação de motivação
    createNotification(userId, 'like', '💪 Te motivou!', 'Continue assim, você está arrasando!', 'motivation');
  };

  // Função para gerar bio/foco baseado no nível ou conteúdo (fallback)
  const generateUserBio = (userLevel: string, tags: string[], content: string): string => {
    // Prioridade 1: Tags do post
    if (tags.includes('treino') || content.toLowerCase().includes('treino')) {
      return 'Focado em treinos 💪';
    }
    if (tags.includes('nutrição') || tags.includes('dieta') || content.toLowerCase().includes('dieta')) {
      return 'Focado em nutrição 🥗';
    }
    if (tags.includes('emagrecimento') || content.toLowerCase().includes('emagrec')) {
      return 'Em busca do shape 🔥';
    }
    if (tags.includes('hipertrofia') || content.toLowerCase().includes('hipertrofia')) {
      return 'Focado em hipertrofia 💪';
    }
    if (tags.includes('corrida') || content.toLowerCase().includes('corrida')) {
      return 'Amante de corrida 🏃';
    }
    
    // Prioridade 2: Nível do usuário
    if (userLevel === 'Expert' || userLevel === 'Avançado') {
      return 'Atleta dedicado 🏆';
    }
    if (userLevel === 'Intermediário') {
      return 'Evoluindo sempre 📈';
    }
    
    // Default
    return 'Buscando saúde ✨';
  };

  // Map posts to card format
  const mappedPosts = filteredSmartPosts.map(post => {
    const userLevel = post.user_level || 'Membro';
    // Usa bio real do perfil, senão gera um automático
    const userBio = post.user_bio || generateUserBio(userLevel, post.tags || [], post.content);
    
    return {
      id: post.id,
      visibleUserId: post.user_id,
      userName: post.user_name || 'Usuário',
      userAvatar: post.user_avatar || '',
      userLevel,
      userBio,
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
    };
  });

  // Prioridade correta: perfil real > ranking > metadata > email
  const userName = realProfile?.fullName || rankingProfile?.user_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuário';
  const userAvatar = realProfile?.avatarUrl || rankingProfile?.avatar_url || user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-accent/5 dark:from-primary/10 dark:via-background dark:to-accent/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4 gap-2">
            <TabsList className="w-full max-w-xl bg-primary/10 border border-primary/20">
              <TabsTrigger value="feed" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
                Feed
              </TabsTrigger>
              <TabsTrigger value="following" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
                Seguindo
              </TabsTrigger>
              <TabsTrigger value="ranking" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
                Ranking
              </TabsTrigger>
              <TabsTrigger value="conexoes" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm">
                Conexões
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Feed Tab */}
          <TabsContent value="feed" className="mt-0">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Main Feed */}
              <div className="flex-1 lg:max-w-2xl">
                {/* Hero Header */}
                <CommunityHeroHeader
                  userName={userName}
                  userAvatar={userAvatar}
                  userPosition={currentUserStats.position}
                  totalPoints={currentUserStats.points}
                  streakDays={currentUserStats.streak}
                  missionsCompleted={currentUserStats.missions}
                  profileViews={userProgressStats?.followersCount || 0}
                  unreadMessages={totalUnread}
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
                  recentAchievements={recentAchievements}
                  newMembers={newMembers}
                  onMotivate={handleMotivateUser}
                  onViewProfile={(userId) => {
                    setSelectedProfileId(userId);
                    setProfileModalOpen(true);
                  }}
                />
              </div>
            </div>

            {/* Floating Create Button */}
            <FloatingCreateButton
              userName={userName}
              userAvatar={userAvatar}
              onCreatePost={handleCreatePost}
              onOpenStoryModal={() => setCreateStoryOpen(true)}
            />
          </TabsContent>

          {/* Following Tab */}
          <TabsContent value="following" className="mt-4">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Community Health Summary */}
              <CommunityHealthSummary />

              {/* Following List */}
              <FollowingList 
                onProfileClick={(userId) => {
                  setSelectedProfileId(userId);
                  setProfileModalOpen(true);
                }}
                onMessageClick={(userId) => {
                  setInitialDmUser(userId);
                  setDmModalOpen(true);
                }}
              />
            </div>
          </TabsContent>

          {/* Conexões Tab */}
          <TabsContent value="conexoes" className="mt-4">
            <ConnectionsTab
              currentUserId={user?.id}
              onProfileClick={(userId) => {
                setSelectedProfileId(userId);
                setProfileModalOpen(true);
              }}
              onMessageClick={(userId) => {
                setInitialDmUser(userId);
                setDmModalOpen(true);
              }}
            />
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="mt-4">
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Followers Modal */}
              <Dialog open={showFollowersList} onOpenChange={setShowFollowersList}>
                <DialogContent 
                  className="max-w-md p-0 bg-transparent border-none shadow-none" 
                  hideTitle 
                  accessibleTitle="Lista de Seguidores"
                >
                  <FollowersList
                    onProfileClick={(userId) => {
                      setSelectedProfileId(userId);
                      setProfileModalOpen(true);
                      setShowFollowersList(false);
                    }}
                    onMessageClick={(userId) => {
                      setInitialDmUser(userId);
                      setDmModalOpen(true);
                      setShowFollowersList(false);
                    }}
                    onClose={() => setShowFollowersList(false)}
                  />
                </DialogContent>
              </Dialog>

              {/* Social Header with Followers/Following */}
              <RankingSocialHeader
                userId={user?.id || null}
                userName={userName}
                avatarUrl={userAvatar}
                rankingPosition={currentUserStats.position}
                onFollowersClick={() => setShowFollowersList(!showFollowersList)}
                onFollowingClick={() => setActiveTab('following')}
              />

              {/* Header */}
              <RankingHeader />

              {/* Podium - Top 3 */}
              {!rankingLoading && filteredRanking.length >= 3 && (
                <RankingPodium 
                  topThree={filteredRanking.slice(0, 3)} 
                  currentUserId={user?.id}
                  onUserClick={(userId) => {
                    setSelectedProfileId(userId);
                    setProfileModalOpen(true);
                  }}
                />
              )}

              {/* Current User Position Card */}
              {!rankingLoading && user && currentUserStats.position > 0 && (
                <CurrentUserRankCard
                  position={currentUserStats.position}
                  userName={userName}
                  avatarUrl={userAvatar}
                  totalPoints={currentUserStats.points}
                  streak={currentUserStats.streak}
                  pointsToNextRank={
                    currentUserStats.position > 1 
                      ? (filteredRanking[currentUserStats.position - 2]?.total_points || 0) - currentUserStats.points
                      : 0
                  }
                  trend={currentUserStats.points > 100 ? 'up' : 'same'}
                  positionChange={0}
                />
              )}

              {/* Search */}
              <Card className="border-primary/20">
                <CardContent className="pt-4">
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
                  </div>
                </CardContent>
              </Card>

              {/* Empty State */}
              {!rankingLoading && filteredRanking.length === 0 && (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">Nenhum membro no ranking ainda.</p>
                </div>
              )}

              {/* Ranking List - Positions 4+ */}
              {!rankingLoading && filteredRanking.length > 3 && (
                <div className="space-y-3">
                  {filteredRanking.slice(3).map((rankingUser, index) => (
                    <RankingUserCard
                      key={rankingUser.user_id}
                      position={rankingUser.position}
                      userId={rankingUser.user_id}
                      userName={rankingUser.user_name}
                      avatarUrl={rankingUser.avatar_url}
                      totalPoints={rankingUser.total_points}
                      streak={rankingUser.streak_days}
                      missionsCompleted={rankingUser.missions_completed}
                      isCurrentUser={rankingUser.user_id === user?.id}
                      index={index}
                      challengesCompleted={rankingUser.completed_challenges || 0}
                      lastActivity={rankingUser.last_activity}
                      onProfileClick={(userId) => {
                        setSelectedProfileId(userId);
                        setProfileModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Stats */}
              {!rankingLoading && ranking.length > 0 && (
                <RankingStats
                  totalMembers={ranking.length}
                  totalMissions={ranking.reduce((sum, u) => sum + u.missions_completed, 0)}
                  totalPoints={ranking.reduce((sum, u) => sum + u.total_points, 0)}
                  avgStreak={Math.round(ranking.reduce((sum, u) => sum + u.streak_days, 0) / ranking.length)}
                />
              )}
            </div>
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