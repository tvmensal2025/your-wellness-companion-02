import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useRanking } from '@/hooks/useRanking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, Crown, Award, Target, Calendar, TrendingUp, Users, Flame, 
  Star, Medal, Search, Activity, Zap
} from 'lucide-react';

interface RankingCommunityProps {
  user: User | null;
}

export default function RankingCommunity({ user }: RankingCommunityProps) {
  const { ranking, loading, error, refetch } = useRanking();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTop, setShowTop] = useState(10);

  useEffect(() => {
    refetch();
  }, []);

  const currentUserRank = ranking.find(r => r.user_id === user?.id);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const filteredRanking = ranking
    .filter(user => 
      searchQuery === '' || 
      user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, showTop);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Carregando Ranking</h3>
            <p className="text-muted-foreground">Calculando posições dos usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Erro ao carregar ranking</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={refetch} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Cover Section - Facebook Style */}
      <div className="relative h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 border-b">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40"></div>
        <div className="container mx-auto px-4 h-full flex items-end pb-8">
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 rounded-full bg-card border-4 border-background shadow-xl flex items-center justify-center">
              <Users className="w-16 h-16 text-primary" />
            </div>
            <div className="text-foreground drop-shadow-lg">
              <h1 className="text-4xl font-bold mb-2">Comunidade HealthFeed</h1>
              <p className="text-lg text-muted-foreground">{ranking.length} membros ativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Facebook Layout */}
      <div className="container mx-auto px-4 -mt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Community Info */}
          <div className="lg:col-span-4 space-y-4">
            {/* About Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sobre esta comunidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Conecte-se com outros membros, compartilhe suas conquistas e inspire a comunidade!
                </p>
                
                <Separator />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{ranking.length}</div>
                      <div className="text-xs text-muted-foreground">Membros ativos</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {ranking.reduce((sum, user) => sum + user.missions_completed, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Missões completadas</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {ranking.reduce((sum, user) => sum + user.total_points, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">Pontos acumulados</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="font-semibold">
                        {Math.max(...ranking.map(user => user.streak_days), 0)}
                      </div>
                      <div className="text-xs text-muted-foreground">Maior sequência (dias)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Position Card */}
            {currentUserRank && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Sua Posição
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary">
                      <AvatarImage src={currentUserRank.avatar_url} alt={currentUserRank.user_name} />
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
                        {currentUserRank.user_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{currentUserRank.user_name}</div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getPositionIcon(currentUserRank.position)}
                        <span className="font-bold text-primary">#{currentUserRank.position}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">{currentUserRank.total_points.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Pontos</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{currentUserRank.missions_completed}</div>
                      <div className="text-xs text-muted-foreground">Missões</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{currentUserRank.streak_days}</div>
                      <div className="text-xs text-muted-foreground">Sequência</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Destaques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <Crown className="w-8 h-8 text-yellow-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-yellow-700 dark:text-yellow-400 mb-1">🏆 Líder</div>
                    <div className="font-semibold truncate">{ranking[0]?.user_name || '-'}</div>
                    <div className="text-xs text-muted-foreground">{ranking[0]?.total_points.toLocaleString() || 0} pts</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <Flame className="w-8 h-8 text-orange-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">🔥 Sequência</div>
                    <div className="font-semibold truncate">
                      {ranking.reduce((max, user) => 
                        user.streak_days > max.streak_days ? user : max, 
                        { user_name: '-', streak_days: 0 }
                      ).user_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.max(...ranking.map(user => user.streak_days), 0)} dias
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <Zap className="w-8 h-8 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-green-700 dark:text-green-400 mb-1">⚡ Mais Ativo</div>
                    <div className="font-semibold truncate">
                      {ranking.reduce((max, user) => 
                        user.missions_completed > max.missions_completed ? user : max, 
                        { user_name: '-', missions_completed: 0 }
                      ).user_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.max(...ranking.map(user => user.missions_completed), 0)} missões
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed Area */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search and Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Buscar membros..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTop(showTop === 10 ? 50 : 10)}
                    >
                      {showTop === 10 ? 'Ver mais' : 'Ver menos'}
                    </Button>
                    
                    <Button variant="outline" size="sm" onClick={refetch}>
                      <Activity className="w-4 h-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ranking Feed */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Ranking da Comunidade
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Top {showTop} membros mais engajados
                </p>
              </CardHeader>
              <CardContent>
                {filteredRanking.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum membro encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? 'Tente uma busca diferente.' : 'Complete missões para aparecer no ranking!'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredRanking.map((rankUser, index) => {
                      const isCurrentUser = rankUser.user_id === user?.id;
                      
                      return (
                        <div key={rankUser.user_id}>
                          <div 
                            className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                              isCurrentUser 
                                ? 'bg-primary/5 border-2 border-primary/30 shadow-sm' 
                                : 'hover:bg-muted/50 border border-transparent'
                            }`}
                          >
                            {/* Position Badge */}
                            <div className="flex-shrink-0">
                              {rankUser.position <= 3 ? (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  rankUser.position === 1 ? 'bg-yellow-100 dark:bg-yellow-950/30' :
                                  rankUser.position === 2 ? 'bg-gray-100 dark:bg-gray-800' :
                                  'bg-amber-100 dark:bg-amber-950/30'
                                }`}>
                                  {getPositionIcon(rankUser.position)}
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                  <span className="text-lg font-bold text-muted-foreground">
                                    {rankUser.position}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            {/* Avatar */}
                            <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                              <AvatarImage src={rankUser.avatar_url} alt={rankUser.user_name} />
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                                {rankUser.user_name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            
                            {/* User Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-base truncate">
                                  {rankUser.user_name}
                                </span>
                                {isCurrentUser && (
                                  <Badge variant="default" className="text-xs">Você</Badge>
                                )}
                                {rankUser.streak_days > 7 && (
                                  <Badge variant="secondary" className="text-xs bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400">
                                    <Flame className="w-3 h-3 mr-1" />
                                    {rankUser.streak_days}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <Star className="w-3.5 h-3.5 text-yellow-600" />
                                  <span className="font-medium">{rankUser.total_points.toLocaleString()}</span>
                                  <span className="hidden sm:inline">pts</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Target className="w-3.5 h-3.5 text-green-600" />
                                  <span className="font-medium">{rankUser.missions_completed}</span>
                                  <span className="hidden sm:inline">missões</span>
                                </span>
                                {rankUser.last_activity && (
                                  <span className="flex items-center gap-1.5 text-xs">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(rankUser.last_activity).toLocaleDateString('pt-BR', { 
                                      day: 'numeric', 
                                      month: 'short' 
                                    })}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="hidden md:flex flex-col items-end gap-1">
                              <div className="text-sm font-semibold text-primary">
                                #{rankUser.position}
                              </div>
                              {rankUser.position <= 3 && (
                                <div className="text-xs text-muted-foreground">
                                  Top 3
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {index < filteredRanking.length - 1 && (
                            <Separator className="my-1" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
