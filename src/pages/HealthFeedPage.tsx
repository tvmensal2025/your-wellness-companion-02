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

// Mock data
const mockStories = [
  { id: '1', userName: 'Ana Silva', userAvatar: '', hasNewStory: true, isViewed: false },
  { id: '2', userName: 'Carlos Santos', userAvatar: '', hasNewStory: true, isViewed: false },
  { id: '3', userName: 'Maria Oliveira', userAvatar: '', hasNewStory: true, isViewed: true },
  { id: '4', userName: 'João Pedro', userAvatar: '', hasNewStory: false, isViewed: true },
  { id: '5', userName: 'Fernanda Costa', userAvatar: '', hasNewStory: true, isViewed: false },
];

const mockPosts = [
  {
    id: '1',
    userName: 'Ana Silva',
    userAvatar: '',
    userLevel: 'Iniciante',
    content: 'Consegui completar minha meta de passos hoje! 10.000 passos ✅ Estou muito feliz com meu progresso!',
    location: 'São Paulo, SP',
    tags: ['passos', 'meta', 'saúde'],
    likes: 24,
    comments: 5,
    shares: 2,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    achievementData: {
      title: 'Meta de Passos Atingida',
      value: 10000,
      unit: 'passos'
    },
    commentsList: [
      { id: 'c1', userName: 'Carlos Santos', content: 'Parabéns! Continue assim! 💪', createdAt: new Date().toISOString() },
      { id: 'c2', userName: 'Maria Oliveira', content: 'Inspirador demais!', createdAt: new Date().toISOString() },
    ]
  },
  {
    id: '2',
    userName: 'Carlos Santos',
    userAvatar: '',
    userLevel: 'Intermediário',
    content: 'Treino de hoje concluído! Focando na constância 💪 O segredo é não desistir, mesmo nos dias difíceis.',
    tags: ['treino', 'constância', 'academia'],
    likes: 42,
    comments: 8,
    shares: 5,
    isLiked: true,
    isSaved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    progressData: {
      type: 'Treino de Força',
      duration: '45 min',
      calories: 320
    },
    commentsList: []
  },
  {
    id: '3',
    userName: 'Maria Oliveira',
    userAvatar: '',
    userLevel: 'Avançado',
    content: '7 dias de meditação completos! 🧘‍♀️ A paz interior está começando a fazer diferença no meu dia a dia.',
    location: 'Rio de Janeiro, RJ',
    tags: ['meditação', 'mindfulness', 'sequência'],
    likes: 56,
    comments: 12,
    shares: 8,
    isLiked: false,
    isSaved: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    achievementData: {
      title: 'Sequência de Meditação',
      value: 7,
      unit: 'dias consecutivos'
    },
    commentsList: []
  },
];

const mockTopUsers = [
  { id: '1', name: 'Rafael Dias', points: 2450, position: 1, streak: 15, isOnline: true },
  { id: '2', name: 'Juliana Lima', points: 2120, position: 2, streak: 12, isOnline: true },
  { id: '3', name: 'Pedro Henrique', points: 1890, position: 3, streak: 10, isOnline: false },
  { id: '4', name: 'Camila Rocha', points: 1750, position: 4, streak: 8, isOnline: true },
  { id: '5', name: 'Lucas Mendes', points: 1680, position: 5, streak: 7, isOnline: false },
];

const mockSuggestedUsers = [
  { id: '1', name: 'Beatriz Santos', mutualFriends: 5, level: 'Intermediário' },
  { id: '2', name: 'Gabriel Costa', mutualFriends: 3, level: 'Avançado' },
  { id: '3', name: 'Larissa Pereira', mutualFriends: 8, level: 'Iniciante' },
];

const mockEvents = [
  { id: '1', title: 'Desafio de Hidratação', date: 'Começa amanhã', participants: 124 },
  { id: '2', title: 'Corrida Virtual 5K', date: 'Em 3 dias', participants: 89 },
  { id: '3', title: 'Semana do Sono', date: 'Próxima semana', participants: 256 },
];

export default function HealthFeedPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [sortMode, setSortMode] = useState<'position' | 'points' | 'missions' | 'streak'>('position');
  const [posts, setPosts] = useState(mockPosts);

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
    const newPost = {
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
      commentsList: [] as { id: string; userName: string; userAvatar?: string; content: string; createdAt: string }[]
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
          {/* Removido - sino e configurações já existem no header principal */}
        </motion.header>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4 sm:mb-6">
          <TabsList className="w-full max-w-md bg-blue-100/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
            <TabsTrigger value="feed" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Feed</TabsTrigger>
            <TabsTrigger value="ranking" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Ranking</TabsTrigger>
            <TabsTrigger value="discover" className="flex-1 data-[state=active]:bg-blue-600 data-[state=active]:text-white">Descobrir</TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed" className="mt-4 sm:mt-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Main Feed */}
              <div className="flex-1 lg:max-w-2xl">
                {/* Stories */}
                <StoriesSection
                  stories={mockStories}
                  currentUserName="Você"
                />

                {/* Create Post */}
                <CreatePostCard
                  userName="Você"
                  onCreatePost={handleCreatePost}
                />

                {/* Feed Posts */}
                <div className="space-y-3 sm:space-y-4">
                  {posts.map((post) => (
                    <FeedPostCard
                      key={post.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={() => {}}
                      onSave={() => {}}
                    />
                  ))}
                </div>
              </div>

              {/* Right Sidebar - Hidden on mobile */}
              <div className="hidden lg:block">
                <RightSidebar
                  topUsers={mockTopUsers}
                  suggestedUsers={mockSuggestedUsers}
                  upcomingEvents={mockEvents}
                  onFollowUser={() => {}}
                />
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
                  <TabsList className="w-full justify-start bg-transparent p-0 gap-2">
                    <TabsTrigger value="position" className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      Posição
                    </TabsTrigger>
                    <TabsTrigger value="points" className="flex-1 rounded-xl">Pontos</TabsTrigger>
                    <TabsTrigger value="missions" className="flex-1 rounded-xl">Missões</TabsTrigger>
                    <TabsTrigger value="streak" className="flex-1 rounded-xl">Sequência</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Top User Card */}
                {!loading && topUser && (
                  <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30 border border-yellow-200/50 dark:border-yellow-800/50 shadow-sm px-4 py-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Avatar className="w-12 h-12 border-2 border-yellow-400/50">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {topUser.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{topUser.user_name}</p>
                        <p className="text-xs text-muted-foreground">Líder do ranking</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="font-semibold">{topUser.total_points}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-primary" />
                          <span>{topUser.missions_completed}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-4 h-4 text-orange-500" />
                          <span>{topUser.streak_days}</span>
                        </div>
                      </div>
                    </div>
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
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="rounded-xl bg-primary/5 p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{totalMembers}</p>
                    <p className="text-xs text-muted-foreground">Membros</p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{totalMissions}</p>
                    <p className="text-xs text-muted-foreground">Missões</p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-600">{totalPoints.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Pontos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="mt-6">
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Descubra Novos Membros</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {mockSuggestedUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                        <Avatar className="w-14 h-14">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {user.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.mutualFriends} amigos em comum • {user.level}
                          </p>
                        </div>
                        <Button variant="default" size="sm" className="rounded-full">
                          Seguir
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
