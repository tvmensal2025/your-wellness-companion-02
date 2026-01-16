// ============================================
// X1 CHALLENGE MANAGEMENT - ADMIN PANEL
// Gestão de desafios X1 (duelos entre usuários)
// ============================================

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fromTable } from '@/lib/supabase-helpers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Swords,
  Trophy,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Medal,
  Target,
  Activity,
  Eye,
  RefreshCw,
} from 'lucide-react';

// ============================================
// TYPES
// ============================================

interface X1Challenge {
  id: string;
  challenger_id: string;
  challenged_id: string;
  exercise_name: string;
  exercise_emoji: string;
  challenge_type: 'max_reps' | 'first_to' | 'timed' | 'custom';
  custom_type_description?: string;
  target_value?: number;
  duration_seconds: number;
  challenger_progress: number;
  challenged_progress: number;
  status: 'pending' | 'accepted' | 'active' | 'completed' | 'declined' | 'expired';
  winner_id?: string;
  created_at: string;
  accepted_at?: string;
  started_at?: string;
  completed_at?: string;
  expires_at: string;
  // Joined data
  challenger?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  challenged?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
  winner?: {
    id: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface X1Stats {
  total: number;
  pending: number;
  active: number;
  completed: number;
  declined: number;
  expired: number;
  uniqueParticipants: number;
  avgDuration: number;
  mostPopularExercise: string;
  topChallenger: { name: string; count: number } | null;
  topWinner: { name: string; wins: number } | null;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function X1ChallengeManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedChallenge, setSelectedChallenge] = useState<X1Challenge | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch all X1 challenges
  const { data: challenges = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-x1-challenges'],
    queryFn: async (): Promise<X1Challenge[]> => {
      const { data, error } = await (fromTable('exercise_challenges') as any)
        .select(`
          *,
          challenger:profiles!challenger_id(id, full_name, avatar_url),
          challenged:profiles!challenged_id(id, full_name, avatar_url),
          winner:profiles!winner_id(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching X1 challenges:', error);
        return [];
      }

      return data || [];
    },
    staleTime: 30 * 1000,
  });

  // Calculate stats
  const stats: X1Stats = React.useMemo(() => {
    const uniqueUsers = new Set<string>();
    const exerciseCounts: Record<string, number> = {};
    const challengerCounts: Record<string, { name: string; count: number }> = {};
    const winnerCounts: Record<string, { name: string; wins: number }> = {};
    let totalDuration = 0;
    let completedCount = 0;

    challenges.forEach((c) => {
      uniqueUsers.add(c.challenger_id);
      uniqueUsers.add(c.challenged_id);

      // Exercise popularity
      exerciseCounts[c.exercise_name] = (exerciseCounts[c.exercise_name] || 0) + 1;

      // Top challenger
      if (c.challenger?.full_name) {
        if (!challengerCounts[c.challenger_id]) {
          challengerCounts[c.challenger_id] = { name: c.challenger.full_name, count: 0 };
        }
        challengerCounts[c.challenger_id].count++;
      }

      // Top winner
      if (c.winner_id && c.winner?.full_name) {
        if (!winnerCounts[c.winner_id]) {
          winnerCounts[c.winner_id] = { name: c.winner.full_name, wins: 0 };
        }
        winnerCounts[c.winner_id].wins++;
      }

      // Duration
      if (c.status === 'completed' && c.started_at && c.completed_at) {
        const duration = new Date(c.completed_at).getTime() - new Date(c.started_at).getTime();
        totalDuration += duration;
        completedCount++;
      }
    });

    const mostPopular = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0];
    const topChallenger = Object.values(challengerCounts).sort((a, b) => b.count - a.count)[0];
    const topWinner = Object.values(winnerCounts).sort((a, b) => b.wins - a.wins)[0];

    return {
      total: challenges.length,
      pending: challenges.filter((c) => c.status === 'pending').length,
      active: challenges.filter((c) => c.status === 'active' || c.status === 'accepted').length,
      completed: challenges.filter((c) => c.status === 'completed').length,
      declined: challenges.filter((c) => c.status === 'declined').length,
      expired: challenges.filter((c) => c.status === 'expired').length,
      uniqueParticipants: uniqueUsers.size,
      avgDuration: completedCount > 0 ? Math.round(totalDuration / completedCount / 1000) : 0,
      mostPopularExercise: mostPopular?.[0] || 'N/A',
      topChallenger: topChallenger || null,
      topWinner: topWinner || null,
    };
  }, [challenges]);

  // Filter challenges
  const filteredChallenges = React.useMemo(() => {
    return challenges.filter((c) => {
      const matchesSearch =
        searchTerm === '' ||
        c.exercise_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.challenger?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.challenged?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesType = typeFilter === 'all' || c.challenge_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [challenges, searchTerm, statusFilter, typeFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3" />, label: 'Pendente' },
      accepted: { color: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-3 h-3" />, label: 'Aceito' },
      active: { color: 'bg-green-100 text-green-800', icon: <Activity className="w-3 h-3" />, label: 'Ativo' },
      completed: { color: 'bg-purple-100 text-purple-800', icon: <Trophy className="w-3 h-3" />, label: 'Completo' },
      declined: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3" />, label: 'Recusado' },
      expired: { color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-3 h-3" />, label: 'Expirado' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getChallengeTypeLabel = (type: string, customDesc?: string) => {
    if (type === 'custom' && customDesc) return customDesc;
    const types: Record<string, string> = {
      max_reps: 'Máx. Repetições',
      first_to: 'Primeiro a Chegar',
      timed: 'Tempo Fixo',
      custom: 'Personalizado',
    };
    return types[type] || type;
  };

  const openDetail = (challenge: X1Challenge) => {
    setSelectedChallenge(challenge);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Swords className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando desafios X1...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Swords className="h-6 w-6 text-orange-500" />
            Desafios X1 (Duelos)
          </h2>
          <p className="text-muted-foreground">
            Gerencie todos os desafios X1 entre usuários
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Swords className="h-4 w-4 text-orange-500" />
              Total de Duelos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.uniqueParticipants} participantes únicos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-500" />
              Ativos Agora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.pending} aguardando resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy className="h-4 w-4 text-purple-500" />
              Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.declined} recusados, {stats.expired} expirados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-500" />
              Exercício Popular
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600 truncate">
              {stats.mostPopularExercise}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Duração média: {stats.avgDuration}s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      {(stats.topChallenger || stats.topWinner) && (
        <div className="grid gap-4 md:grid-cols-2">
          {stats.topChallenger && (
            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Swords className="h-4 w-4 text-orange-500" />
                  Maior Desafiador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⚔️</div>
                  <div>
                    <p className="font-bold text-lg">{stats.topChallenger.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.topChallenger.count} desafios criados
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.topWinner && (
            <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Medal className="h-4 w-4 text-yellow-500" />
                  Maior Vencedor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <p className="font-bold text-lg">{stats.topWinner.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.topWinner.wins} vitórias
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por exercício ou usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="accepted">Aceitos</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="completed">Completados</SelectItem>
            <SelectItem value="declined">Recusados</SelectItem>
            <SelectItem value="expired">Expirados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <Target className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="max_reps">Máx. Repetições</SelectItem>
            <SelectItem value="first_to">Primeiro a Chegar</SelectItem>
            <SelectItem value="timed">Tempo Fixo</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Challenges Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exercício</TableHead>
                <TableHead>Desafiador</TableHead>
                <TableHead>Desafiado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Vencedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChallenges.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <Swords className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Nenhum desafio encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredChallenges.map((challenge) => (
                  <TableRow key={challenge.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{challenge.exercise_emoji}</span>
                        <span className="font-medium">{challenge.exercise_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={challenge.challenger?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {challenge.challenger?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[100px]">
                          {challenge.challenger?.full_name || 'Usuário'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={challenge.challenged?.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {challenge.challenged?.full_name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm truncate max-w-[100px]">
                          {challenge.challenged?.full_name || 'Usuário'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getChallengeTypeLabel(challenge.challenge_type, challenge.custom_type_description)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <span className="text-orange-500 font-medium">{challenge.challenger_progress}</span>
                        <span className="text-muted-foreground mx-1">vs</span>
                        <span className="text-blue-500 font-medium">{challenge.challenged_progress}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(challenge.status)}</TableCell>
                    <TableCell>
                      {challenge.winner ? (
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm truncate max-w-[80px]">
                            {challenge.winner.full_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(challenge.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(challenge)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-orange-500" />
              Detalhes do Desafio
            </DialogTitle>
          </DialogHeader>

          {selectedChallenge && (
            <div className="space-y-4">
              {/* Exercise Info */}
              <div className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedChallenge.exercise_emoji}</span>
                  <div>
                    <h3 className="font-bold text-lg">{selectedChallenge.exercise_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getChallengeTypeLabel(
                        selectedChallenge.challenge_type,
                        selectedChallenge.custom_type_description
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-orange-500/10 rounded-lg text-center">
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src={selectedChallenge.challenger?.avatar_url} />
                    <AvatarFallback>
                      {selectedChallenge.challenger?.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm">
                    {selectedChallenge.challenger?.full_name}
                  </p>
                  <p className="text-2xl font-bold text-orange-500">
                    {selectedChallenge.challenger_progress}
                  </p>
                  <p className="text-xs text-muted-foreground">Desafiador</p>
                </div>

                <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarImage src={selectedChallenge.challenged?.avatar_url} />
                    <AvatarFallback>
                      {selectedChallenge.challenged?.full_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm">
                    {selectedChallenge.challenged?.full_name}
                  </p>
                  <p className="text-2xl font-bold text-blue-500">
                    {selectedChallenge.challenged_progress}
                  </p>
                  <p className="text-xs text-muted-foreground">Desafiado</p>
                </div>
              </div>

              {/* Winner */}
              {selectedChallenge.winner && (
                <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-xl text-center">
                  <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Vencedor</p>
                  <p className="font-bold text-lg">{selectedChallenge.winner.full_name}</p>
                </div>
              )}

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(selectedChallenge.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duração:</span>
                  <span>{selectedChallenge.duration_seconds}s</span>
                </div>
                {selectedChallenge.target_value && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meta:</span>
                    <span>{selectedChallenge.target_value}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span>
                    {new Date(selectedChallenge.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                {selectedChallenge.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Finalizado em:</span>
                    <span>
                      {new Date(selectedChallenge.completed_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
