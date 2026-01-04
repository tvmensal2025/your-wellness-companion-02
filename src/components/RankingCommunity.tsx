import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useRanking } from '@/hooks/useRanking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Trophy, Crown, Target, Star, Medal, Search, 
  Flame, Users, MessageCircle
} from 'lucide-react';

interface RankingCommunityProps {
  user: User | null;
}

type SortOption = 'position' | 'points' | 'missions' | 'streak';

export default function RankingCommunity({ user }: RankingCommunityProps) {
  const { ranking, loading, error, refetch } = useRanking();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('position');

  useEffect(() => {
    refetch();
  }, []);

  const getRankBadge = (position: number) => {
    if (position === 1) {
      return (
        <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center border-2 border-yellow-300">
          <Crown className="w-5 h-5 text-yellow-600" />
        </div>
      );
    }
    if (position === 2) {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
          <Medal className="w-5 h-5 text-gray-500" />
        </div>
      );
    }
    if (position === 3) {
      return (
        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center border-2 border-amber-300">
          <Medal className="w-5 h-5 text-amber-600" />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-sm font-bold text-gray-600">{position}</span>
      </div>
    );
  };

  const filteredAndSortedRanking = React.useMemo(() => {
    let filtered = ranking.filter(user => 
      searchQuery === '' || 
      user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.total_points - a.total_points;
        case 'missions':
          return b.missions_completed - a.missions_completed;
        case 'streak':
          return b.streak_days - a.streak_days;
        default:
          return a.position - b.position;
      }
    });

    return sorted.slice(0, 10);
  }, [ranking, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando ranking...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={refetch} variant="outline">Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Título */}
        <div className="mb-4">
          <div className="bg-emerald-50 rounded-lg px-4 py-3 border border-emerald-200">
            <h2 className="text-base font-semibold text-gray-900">
              Top 10 membros mais engajados
            </h2>
          </div>
        </div>

        {/* Busca */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar membro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Filtros Compactos */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Button
            variant={sortBy === 'position' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('position')}
            className="h-8 text-xs"
          >
            Posição
          </Button>
          <Button
            variant={sortBy === 'points' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('points')}
            className="h-8 text-xs"
          >
            Pontos
          </Button>
          <Button
            variant={sortBy === 'missions' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('missions')}
            className="h-8 text-xs"
          >
            Missões
          </Button>
          <Button
            variant={sortBy === 'streak' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('streak')}
            className="h-8 text-xs"
          >
            Sequência
          </Button>
        </div>

        {/* Lista de Ranking - Layout Limpo */}
        <Card className="shadow-sm border-0">
          <CardContent className="p-0">
            {filteredAndSortedRanking.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'Nenhum membro encontrado' : 'Nenhum membro no ranking ainda'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredAndSortedRanking.map((rankUser) => {
                  const isCurrentUser = rankUser.user_id === user?.id;
                  
                  return (
                    <div
                      key={rankUser.user_id}
                      className={`px-4 py-3 hover:bg-gray-50 transition-colors ${
                        isCurrentUser ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Posição */}
                        <div className="flex-shrink-0 w-10">
                          {getRankBadge(rankUser.position)}
                        </div>

                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={rankUser.avatar_url} alt={rankUser.user_name} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">
                              {rankUser.user_name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Nome */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {rankUser.user_name}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-blue-600 font-normal">(Você)</span>
                            )}
                          </p>
                        </div>

                        {/* Streak Badge */}
                        {rankUser.streak_days > 7 && (
                          <Badge 
                            variant="secondary" 
                            className="bg-orange-100 text-orange-700 border-0 text-xs px-2 py-0.5"
                          >
                            <Flame className="w-3 h-3 mr-1" />
                            {rankUser.streak_days}
                          </Badge>
                        )}

                        {/* Pontos */}
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-semibold text-sm w-12 text-right">{rankUser.total_points.toLocaleString()}</span>
                        </div>

                        {/* Missões */}
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Target className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-sm w-8 text-right">{rankUser.missions_completed}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estatísticas */}
        {ranking.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mt-6">
            <Card className="text-center border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-xl font-bold text-emerald-600">
                  {ranking.length}
                </div>
                <div className="text-xs text-gray-500 mt-1">Membros</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-xl font-bold text-green-600">
                  {ranking.reduce((sum, u) => sum + u.missions_completed, 0)}
                </div>
                <div className="text-xs text-gray-500 mt-1">Missões</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="text-xl font-bold text-yellow-600">
                  {ranking.reduce((sum, u) => sum + u.total_points, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 mt-1">Pontos</div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="rounded-full w-14 h-14 shadow-lg bg-purple-600 hover:bg-purple-700"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
