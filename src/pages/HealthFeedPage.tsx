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
  Bell,
  Settings,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRanking } from '@/hooks/useRanking';
import { StoriesSection } from '@/components/community/StoriesSection';
import { CreatePostCard } from '@/components/community/CreatePostCard';
import { FeedPostCard } from '@/components/community/FeedPostCard';
import { RightSidebar } from '@/components/community/RightSidebar';

// Removidos dados fictícios - apenas dados reais serão exibidos
type Post = {
  id: string;
  userName: string;
  userAvatar: string;
  userLevel: string;
  content: string;
  location?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  achievementData?: { title: string; value: number; unit: string };
  progressData?: { type: string; duration: string; calories: number };
  commentsList: { id: string; userName: string; userAvatar?: string; content: string; createdAt: string }[];
};

export default function HealthFeedPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [sortMode, setSortMode] = useState<'position' | 'points' | 'missions' | 'streak'>('position');
  const [posts, setPosts] = useState<Post[]>([]);

  const { ranking, loading } = useRanking();

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
  const totalMembers = ranking.length;
  const totalMissions = ranking.reduce((sum, user) => sum + user.missions_completed, 0);
  const totalPoints = ranking.reduce((sum, user) => sum + user.total_points, 0);

  const handleCreatePost = (content: string, tags: string[]) => {
    const newPost: Post = {
      id: Date.now().toString(),
      userName: 'Você',
      userAvatar: '',
      userLevel: 'Iniciante',
      content,
      location: undefined,
      tags,
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isSaved: false,
      createdAt: new Date().toISOString(),
      achievementData: undefined,
      progressData: undefined,
      commentsList: []
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleComment = (postId: string, comment: string) => {
    setPosts(prev => prev.map(p => 
      p.id === postId ? { 
        ...p, 
        comments: p.comments + 1,
        commentsList: [...(p.commentsList || []), {
          id: Date.now().toString(),
          userName: 'Você',
          content: comment,
          createdAt: new Date().toISOString()
        }]
      } : p
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-background to-blue-50/30 dark:from-blue-950/20 dark:via-background dark:to-blue-950/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 sm:mb-6"
        >
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400">Comunidade</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Conecte-se, compartilhe e inspire outros
            </p>
          </div>
        </motion.header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
          <TabsList className="w-full max-w-md bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
            <TabsTrigger value="feed" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Feed</TabsTrigger>
            <TabsTrigger value="ranking" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Ranking</TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="mt-4 sm:mt-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Main Feed */}
              <div className="flex-1 lg:max-w-2xl">
                {/* Create Post */}
                <CreatePostCard
                  userName="Você"
                  onCreatePost={handleCreatePost}
                />

                {/* Feed Posts */}
                <div className="space-y-3 sm:space-y-4">
                  {posts.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">Nenhuma publicação ainda. Seja o primeiro a compartilhar!</p>
                    </Card>
                  ) : (
                    posts.map((post) => (
                      <FeedPostCard
                        key={post.id}
                        post={post}
                        onLike={handleLike}
                        onComment={handleComment}
                        onShare={() => {}}
                        onSave={() => {}}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Ranking Tab */}
          <TabsContent value="ranking" className="mt-6">
            <Card className="max-w-2xl mx-auto">
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
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>

                <Tabs value={sortMode} onValueChange={(v) => setSortMode(v as typeof sortMode)}>
                  <TabsList className="w-full justify-start bg-transparent p-0 gap-1 sm:gap-2 flex-wrap">
                    <TabsTrigger value="position" className="flex-1 min-w-[70px] text-xs sm:text-sm rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                      Posição
                    </TabsTrigger>
                    <TabsTrigger value="points" className="flex-1 min-w-[70px] text-xs sm:text-sm rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">Pontos</TabsTrigger>
                    <TabsTrigger value="missions" className="flex-1 min-w-[70px] text-xs sm:text-sm rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">Missões</TabsTrigger>
                    <TabsTrigger value="streak" className="flex-1 min-w-[70px] text-xs sm:text-sm rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white">Sequência</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Top User Card */}
                {!loading && topUser && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-2xl bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-800/50 shadow-sm px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg flex-shrink-0">
                        <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-blue-400/50 flex-shrink-0">
                        <AvatarFallback className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold">
                          {topUser.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate text-sm sm:text-base">{topUser.user_name}</p>
                        <p className="text-xs text-muted-foreground">Líder do ranking</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm ml-11 sm:ml-0">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                        <span className="font-semibold">{topUser.total_points}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
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
                {!loading && filteredRanking.length === 0 && (
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
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-muted-foreground">
                        {user.position}
                      </div>
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.user_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user.user_name}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          {user.total_points}
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          {user.streak_days}d
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4">
                  <div className="rounded-xl bg-blue-500/10 p-2 sm:p-4 text-center">
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">{totalMembers}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Membros</p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-2 sm:p-4 text-center">
                    <p className="text-lg sm:text-2xl font-bold text-emerald-600">{totalMissions}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Missões</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 p-2 sm:p-4 text-center">
                    <p className="text-lg sm:text-2xl font-bold text-amber-600">{totalPoints.toLocaleString()}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Pontos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
