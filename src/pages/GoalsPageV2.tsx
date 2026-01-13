import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Target, Trophy, Flame, TrendingUp, Filter } from 'lucide-react';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { ModernGoalCard } from '@/components/goals/ModernGoalCard';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GoalsPageV2() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const { toast } = useToast();

  // Buscar metas do usuário
  const { data: goals, isLoading, refetch } = useQuery({
    queryKey: ['user-goals-v2'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  // Buscar estatísticas gamificadas
  const { data: stats } = useQuery({
    queryKey: ['goal-stats-v2'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar metas
      const { data: goalsData, error: goalsError } = await supabase
        .from('user_goals')
        .select('status, streak_days, xp_earned')
        .eq('user_id', user.id);

      if (goalsError) throw goalsError;

      // Buscar nível do usuário
      const { data: levelData, error: levelError } = await supabase
        .from('user_goal_levels')
        .select('current_level, current_xp, total_xp, level_title')
        .eq('user_id', user.id)
        .single();

      // Se a tabela não existe (406), usar dados padrão
      const userLevel = (levelError && (levelError.message?.includes('406') || levelError.message?.includes('Not Acceptable'))) 
        ? { current_level: 1, current_xp: 0, total_xp: 0, level_title: 'Iniciante' }
        : levelData;

      const total = goalsData.length;
      const completed = goalsData.filter(g => g.status === 'concluida').length;
      const inProgress = goalsData.filter(g => g.status === 'em_progresso').length;
      const maxStreak = Math.max(...goalsData.map(g => g.streak_days || 0), 0);
      const totalXP = goalsData.reduce((sum, g) => sum + (g.xp_earned || 0), 0);
      const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;

      return {
        total,
        completed,
        inProgress,
        maxStreak,
        totalXP,
        successRate,
        level: levelData?.current_level || 1,
        levelTitle: levelData?.level_title || 'Iniciante'
      };
    }
  });

  // Filtrar metas
  const filteredGoals = selectedFilter 
    ? goals?.filter(goal => goal.status === selectedFilter)
    : goals;

  return (
    <div className="container mx-auto p-3 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🎯 Minhas Metas
          </h1>
          <p className="text-muted-foreground mt-1">
            Transforme objetivos em conquistas
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nova Meta</span>
          <span className="sm:hidden">Nova</span>
        </Button>
      </div>

      {/* Hero Stats - Compactos */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Metas Ativas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
                selectedFilter === null && "ring-2 ring-primary"
              )}
              onClick={() => setSelectedFilter(null)}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Target className="w-4 h-4 text-white" />
                  </div>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-medium">
                    Hoje
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-0.5">{stats.total}</div>
                <div className="text-xs text-gray-600">Metas Ativas</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Concluídas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105",
                selectedFilter === 'concluida' && "ring-2 ring-green-500"
              )}
              onClick={() => setSelectedFilter('concluida')}
            >
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-medium">
                    Mês
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-0.5">{stats.completed}</div>
                <div className="text-xs text-gray-600">Concluídas</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Streak */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Flame className="w-4 h-4 text-white" />
                  </div>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-medium">
                    Recorde
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-0.5">{stats.maxStreak}</div>
                <div className="text-xs text-gray-600">Dias Streak</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Taxa de Sucesso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium">
                    Geral
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-800 mb-0.5">{stats.successRate}%</div>
                <div className="text-xs text-gray-600">Taxa Sucesso</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant={selectedFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter(null)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Todas
        </Button>
        <Button
          variant={selectedFilter === 'em_progresso' ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter('em_progresso')}
        >
          Em Progresso
        </Button>
        <Button
          variant={selectedFilter === 'concluida' ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter('concluida')}
        >
          Concluídas
        </Button>
        <Button
          variant={selectedFilter === 'pendente' ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedFilter('pendente')}
        >
          Pendentes
        </Button>
      </div>

      {/* Lista de Metas */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-20 bg-muted rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredGoals && filteredGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGoals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ModernGoalCard 
                  goal={goal as any}
                  onUpdate={refetch}
                  onViewDetails={() => {
                    toast({
                      title: "Detalhes da Meta",
                      description: "Funcionalidade em desenvolvimento",
                    });
                  }}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {selectedFilter 
                  ? `Nenhuma meta ${selectedFilter === 'concluida' ? 'concluída' : selectedFilter === 'em_progresso' ? 'em progresso' : 'pendente'}`
                  : 'Nenhuma meta ainda'
                }
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {selectedFilter 
                  ? 'Tente selecionar outro filtro ou criar uma nova meta.'
                  : 'Crie sua primeira meta e comece sua jornada de transformação!'
                }
              </p>
              {selectedFilter && (
                <Button 
                  variant="outline"
                  onClick={() => setSelectedFilter(null)}
                  className="mb-2"
                >
                  Ver Todas as Metas
                </Button>
              )}
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Nova Meta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog de Criação */}
      <CreateGoalDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
          toast({
            title: "🎉 Meta criada!",
            description: "Sua meta foi submetida para aprovação administrativa.",
          });
        }}
      />
    </div>
  );
}
