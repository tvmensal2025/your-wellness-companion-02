import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Heart,
  MessageCircle,
  Share2,
  Camera,
  MapPin,
  Trophy,
  TrendingUp,
  Plus,
  Search,
  Crown,
  Star,
  Flame,
  Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRanking } from '@/hooks/useRanking';

// Mock data para demonstração do feed (será substituído por dados reais futuramente)
const mockUsers = [
  {
    id: '1',
    name: 'Ana Silva',
    avatar: '',
    level: 'Iniciante',
    points: 150,
    badges: ['🏃‍♀️', '💧', '🎯'],
  },
  {
    id: '2',
    name: 'Carlos Santos',
    avatar: '',
    level: 'Intermediário',
    points: 420,
    badges: ['🔥', '💪', '🏆'],
  },
];

const mockPosts = [
  {
    id: '1',
    userId: '1',
    profiles: {
      full_name: 'Ana Silva',
      avatar_url: '',
      level: 'Iniciante',
    },
    content: 'Consegui completar minha meta de passos hoje! 10.000 passos ✅',
    post_type: 'achievement',
    media_urls: [],
    achievements_data: { steps: 10000, goal: 10000 },
    progress_data: null,
    location: 'São Paulo, SP',
    tags: ['passos', 'meta'],
    created_at: new Date().toISOString(),
    is_story: false,
    reactions: {
      likes: 12,
      comments: 3,
    },
  },
  {
    id: '2',
    userId: '2',
    profiles: {
      full_name: 'Carlos Santos',
      avatar_url: '',
      level: 'Intermediário',
    },
    content: 'Treino de hoje concluído! Focando na constância 💪',
    post_type: 'workout',
    media_urls: [],
    achievements_data: null,
    progress_data: { workout_duration: '45 min', calories: 320 },
    location: null,
    tags: ['treino', 'constância'],
    created_at: new Date().toISOString(),
    is_story: false,
    reactions: {
      likes: 8,
      comments: 5,
    },
  },
];

export default function HealthFeedPage() {
  const [newPost, setNewPost] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortMode, setSortMode] = useState<'position' | 'points' | 'missions' | 'streak'>('position');

  const { ranking, loading } = useRanking();

  const popularTags = [
    '🏃‍♀️ Corrida',
    '💪 Musculação',
    '🧘‍♀️ Meditação',
    '💧 Hidratação',
    '🥗 Alimentação',
    '😴 Sono',
  ];

  const sortedRanking = useMemo(() => {
    const base = [...ranking];

    switch (sortMode) {
      case 'points':
        return base.sort((a, b) => b.total_points - a.total_points);
      case 'missions':
        return base.sort((a, b) => b.missions_completed - a.missions_completed);
      case 'streak':
        return base.sort((a, b) => b.streak_days - a.streak_days);
      case 'position':
      default:
        return base.sort((a, b) => a.position - b.position);
    }
  }, [ranking, sortMode]);

  const filteredRanking = useMemo(() => {
    if (!searchTerm.trim()) return sortedRanking;
    const term = searchTerm.toLowerCase();
    return sortedRanking.filter((user) => user.user_name.toLowerCase().includes(term));
  }, [sortedRanking, searchTerm]);

  const topUser = filteredRanking[0];

  const totalMembers = ranking.length;
  const totalMissions = ranking.reduce((sum, user) => sum + user.missions_completed, 0);
  const totalPoints = ranking.reduce((sum, user) => sum + user.total_points, 0);

  const handleCreatePost = () => {
    if (!newPost.trim()) return;

    // Aqui será feita a criação real do post na comunidade
    console.log('Criando post:', { content: newPost, tags: selectedTags });
    setNewPost('');
    setSelectedTags([]);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Hero Comunidade */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-4"
        >
          <header className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Comunidade</h1>
              <p className="text-sm text-muted-foreground">
                Top 10 membros mais engajados da plataforma
              </p>
            </div>
            <Button variant="outline" size="icon" className="rounded-full">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </header>

          <div className="h-px bg-border" />

          <Card className="border-none shadow-sm bg-card/80 backdrop-blur-sm">
            <CardContent className="pt-4 space-y-4">
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
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <Tabs value={sortMode} onValueChange={(value) => setSortMode(value as typeof sortMode)}>
                <TabsList className="w-full justify-start bg-transparent p-0 gap-2">
                  <TabsTrigger
                    value="position"
                    className="flex-1 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Posição
                  </TabsTrigger>
                  <TabsTrigger value="points" className="flex-1 rounded-xl">
                    Pontos
                  </TabsTrigger>
                  <TabsTrigger value="missions" className="flex-1 rounded-xl">
                    Missões
                  </TabsTrigger>
                  <TabsTrigger value="streak" className="flex-1 rounded-xl">
                    Sequência
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="mt-2">
                {loading || !topUser ? (
                  <div className="h-16 rounded-2xl bg-muted/40 animate-pulse" />
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl bg-background shadow-sm px-4 py-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-full border border-yellow-400/70 text-yellow-500">
                      <Crown className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                          {topUser.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{topUser.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            #{topUser.position} no ranking geral
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{topUser.total_points}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3 text-primary" />
                          <span>{topUser.missions_completed}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-500" />
                          <span>{topUser.streak_days}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="rounded-2xl bg-muted/40 px-3 py-3 text-center">
                  <p className="text-lg font-bold text-primary">{totalMembers}</p>
                  <p className="text-[11px] text-muted-foreground">Membros</p>
                </div>
                <div className="rounded-2xl bg-muted/40 px-3 py-3 text-center">
                  <p className="text-lg font-bold text-emerald-600">{totalMissions}</p>
                  <p className="text-[11px] text-muted-foreground">Missões</p>
                </div>
                <div className="rounded-2xl bg-muted/40 px-3 py-3 text-center">
                  <p className="text-lg font-bold text-amber-600">{totalPoints.toLocaleString()}</p>
                  <p className="text-[11px] text-muted-foreground">Pontos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Criar Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Compartilhar Progresso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="O que você conquistou hoje? Compartilhe sua jornada..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="min-h-[100px]"
              />

              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer transition-all"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2 justify-between">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Camera className="w-4 h-4 mr-2" />
                    Foto
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    Local
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trophy className="w-4 h-4 mr-2" />
                    Conquista
                  </Button>
                </div>
                <Button onClick={handleCreatePost} disabled={!newPost.trim()}>
                  Publicar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Usuários ativos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Usuários Ativos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {mockUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col items-center min-w-[80px] sm:min-w-[100px] text-center"
                  >
                    <Avatar className="w-16 h-16 mb-2 border-2 border-primary/20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                    <span className="text-xs text-muted-foreground">{user.level}</span>
                    <div className="flex gap-1 mt-1">
                      {user.badges.map((badge, i) => (
                        <span key={i} className="text-xs">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feed de posts */}
        <div className="space-y-6">
          {mockPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={post.profiles.avatar_url} />
                      <AvatarFallback>
                        {post.profiles.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{post.profiles.full_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {post.profiles.level}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                        {post.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {post.location}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>{post.content}</p>

                  {post.achievements_data && (
                    <div className="bg-primary/5 p-3 rounded-lg border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy className="w-4 h-4 text-primary" />
                        <span className="font-medium text-primary">Conquista Desbloqueada!</span>
                      </div>
                      <p className="text-sm">
                        Meta de passos atingida:{' '}
                        {post.achievements_data.steps?.toLocaleString()} passos
                      </p>
                    </div>
                  )}

                  {post.progress_data && (
                    <div className="bg-secondary/20 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-secondary" />
                        <span className="font-medium">Progresso do Treino</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Duração:</span>
                          <span className="ml-2 font-medium">
                            {post.progress_data.workout_duration}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Calorias:</span>
                          <span className="ml-2 font-medium">{post.progress_data.calories} kcal</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2 border-t">
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      <span>{post.reactions.likes}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.reactions.comments}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <Share2 className="w-4 h-4" />
                      Compartilhar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
