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
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      {/* Cover Section - Enhanced Facebook Style */}
      <div className="relative h-80 bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-cyan-950/30 border-b shadow-lg overflow-hidden">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0icmdiYSgwLDAsMCwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-4 border-white dark:border-gray-700 shadow-2xl flex items-center justify-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Users className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                Comunidade HealthFeed
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <Users className="w-4 h-4" />
                </span>
                {ranking.length} membros ativos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Facebook Layout */}
      <div className="container mx-auto px-4 -mt-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Community Info */}
          <div className="lg:col-span-4 space-y-4">
            {/* About Card */}
            <Card className="shadow-lg border-emerald-100 dark:border-emerald-900/30 overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                <CardTitle className="text-lg font-bold">Sobre esta comunidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Conecte-se com outros membros, compartilhe suas conquistas e inspire a comunidade!
                </p>
                
                <Separator className="my-4" />
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-950/30 dark:hover:to-teal-950/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-emerald-700 dark:text-emerald-400">{ranking.length}</div>
                      <div className="text-xs text-muted-foreground font-medium">Membros ativos</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-950/30 dark:hover:to-emerald-950/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-green-700 dark:text-green-400">
                        {ranking.reduce((sum, user) => sum + user.missions_completed, 0)}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">Missões completadas</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 hover:from-yellow-100 hover:to-amber-100 dark:hover:from-yellow-950/30 dark:hover:to-amber-950/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-md">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-yellow-700 dark:text-yellow-400">
                        {ranking.reduce((sum, user) => sum + user.total_points, 0).toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">Pontos acumulados</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 hover:from-orange-100 hover:to-red-100 dark:hover:from-orange-950/30 dark:hover:to-red-950/30 transition-all">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-orange-700 dark:text-orange-400">
                        {Math.max(...ranking.map(user => user.streak_days), 0)}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">Maior sequência (dias)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Position Card */}
            {currentUserRank && (
              <Card className="shadow-xl border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/30 dark:via-teal-950/20 dark:to-cyan-950/20 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-full blur-3xl -z-0"></div>
                <CardHeader className="relative z-10">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    Sua Posição
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-md opacity-50"></div>
                      <Avatar className="relative h-20 w-20 border-4 border-white dark:border-gray-800 shadow-xl ring-2 ring-emerald-500/30">
                        <AvatarImage src={currentUserRank.avatar_url} alt={currentUserRank.user_name} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-2xl">
                          {currentUserRank.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-xl text-emerald-900 dark:text-emerald-100">{currentUserRank.user_name}</div>
                      <div className="flex items-center gap-2 text-sm mt-1">
                        <div className="flex items-center gap-1 px-2 py-1 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                          {getPositionIcon(currentUserRank.position)}
                          <span className="font-bold text-emerald-700 dark:text-emerald-400">#{currentUserRank.position}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm">
                      <div className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{currentUserRank.total_points.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground font-medium">Pontos</div>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm">
                      <div className="text-xl font-bold text-green-700 dark:text-green-400">{currentUserRank.missions_completed}</div>
                      <div className="text-xs text-muted-foreground font-medium">Missões</div>
                    </div>
                    <div className="text-center p-3 bg-white dark:bg-gray-800/50 rounded-xl shadow-sm">
                      <div className="text-xl font-bold text-orange-700 dark:text-orange-400">{currentUserRank.streak_days}</div>
                      <div className="text-xs text-muted-foreground font-medium">Sequência</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Achievements */}
            <Card className="shadow-lg border-amber-100 dark:border-amber-900/30 overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  Destaques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-4">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-200 to-amber-200 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 rounded-xl border border-yellow-200 dark:border-yellow-900/30 shadow-sm hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-yellow-700 dark:text-yellow-400 mb-1">🏆 LÍDER ABSOLUTO</div>
                      <div className="font-bold text-base truncate text-yellow-900 dark:text-yellow-100">{ranking[0]?.user_name || '-'}</div>
                      <div className="text-xs text-yellow-700 dark:text-yellow-400 font-medium">{ranking[0]?.total_points.toLocaleString() || 0} pontos</div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-200 to-red-200 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl border border-orange-200 dark:border-orange-900/30 shadow-sm hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
                      <Flame className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-1">🔥 MAIOR SEQUÊNCIA</div>
                      <div className="font-bold text-base truncate text-orange-900 dark:text-orange-100">
                        {ranking.reduce((max, user) => 
                          user.streak_days > max.streak_days ? user : max, 
                          { user_name: '-', streak_days: 0 }
                        ).user_name}
                      </div>
                      <div className="text-xs text-orange-700 dark:text-orange-400 font-medium">
                        {Math.max(...ranking.map(user => user.streak_days), 0)} dias consecutivos
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-emerald-200 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200 dark:border-green-900/30 shadow-sm hover:shadow-md transition-all">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">⚡ MAIS ATIVO</div>
                      <div className="font-bold text-base truncate text-green-900 dark:text-green-100">
                        {ranking.reduce((max, user) => 
                          user.missions_completed > max.missions_completed ? user : max, 
                          { user_name: '-', missions_completed: 0 }
                        ).user_name}
                      </div>
                      <div className="text-xs text-green-700 dark:text-green-400 font-medium">
                        {Math.max(...ranking.map(user => user.missions_completed), 0)} missões completadas
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed Area */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search and Filters */}
            <Card className="shadow-md border-emerald-100 dark:border-emerald-900/30">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                      <Input
                        placeholder="Buscar membros..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12 border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="default"
                      onClick={() => setShowTop(showTop === 10 ? 50 : 10)}
                      className="border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 font-medium"
                    >
                      {showTop === 10 ? 'Ver mais' : 'Ver menos'}
                    </Button>
                    
                    <Button 
                      variant="default"
                      size="default" 
                      onClick={refetch}
                      className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-md"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ranking Feed */}
            <Card className="shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-cyan-950/20 border-b">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  Ranking da Comunidade
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1 font-medium">
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
