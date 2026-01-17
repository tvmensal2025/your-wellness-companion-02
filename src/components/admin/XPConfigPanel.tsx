import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Users, Award, Target, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PointsConfigPanel } from "./PointsConfigPanel";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  totalPoints: number;
  avgPointsPerUser: number;
  topUsers: Array<{
    user_id: string;
    full_name: string;
    total_points: number;
    level: number;
  }>;
}

export function XPConfigPanel() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Total de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Usuários com pontos
      const { data: pointsData } = await supabase
        .from('user_points')
        .select('user_id, total_points, level');

      // Usuários ativos (com atividade nos últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers } = await supabase
        .from('user_points')
        .select('*', { count: 'exact', head: true })
        .gte('last_activity_date', sevenDaysAgo.toISOString().split('T')[0]);

      // Top 10 usuários
      const { data: topUsersData } = await supabase
        .from('user_points')
        .select(`
          user_id,
          total_points,
          level,
          profiles!inner(full_name)
        `)
        .order('total_points', { ascending: false })
        .limit(10);

      const totalPoints = pointsData?.reduce((sum, u) => sum + (u.total_points || 0), 0) || 0;
      const avgPointsPerUser = pointsData?.length ? Math.round(totalPoints / pointsData.length) : 0;

      const topUsers = topUsersData?.map(u => ({
        user_id: u.user_id,
        full_name: (u.profiles as any)?.full_name || 'Usuário',
        total_points: u.total_points || 0,
        level: u.level || 1
      })) || [];

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalPoints,
        avgPointsPerUser,
        topUsers
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">
            <Award className="h-4 w-4 mr-2" />
            Configuração
          </TabsTrigger>
          <TabsTrigger value="stats">
            <TrendingUp className="h-4 w-4 mr-2" />
            Estatísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-6">
          <PointsConfigPanel />
        </TabsContent>

        <TabsContent value="stats" className="mt-6 space-y-4">
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Cards de Estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total de Usuários</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="text-3xl font-bold">{stats?.totalUsers || 0}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Usuários Ativos (7d)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <span className="text-3xl font-bold">{stats?.activeUsers || 0}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% do total
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Total de Pontos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-yellow-500" />
                      <span className="text-3xl font-bold">
                        {(stats?.totalPoints || 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardDescription>Média por Usuário</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-purple-500" />
                      <span className="text-3xl font-bold">
                        {(stats?.avgPointsPerUser || 0).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top 10 Usuários */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    Top 10 Usuários
                  </CardTitle>
                  <CardDescription>
                    Usuários com maior pontuação na plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.topUsers.map((user, index) => (
                      <div
                        key={user.user_id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Nível {user.level}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-base font-bold">
                          {user.total_points.toLocaleString('pt-BR')} pts
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Distribuição de Níveis */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Níveis</CardTitle>
                  <CardDescription>
                    Como os usuários estão distribuídos por nível
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => {
                      const usersAtLevel = stats?.topUsers.filter(u => u.level === level).length || 0;
                      const percentage = stats?.topUsers.length 
                        ? Math.round((usersAtLevel / stats.topUsers.length) * 100) 
                        : 0;
                      
                      return (
                        <div key={level} className="flex items-center gap-3">
                          <span className="text-sm font-medium w-16">Nível {level}</span>
                          <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500 flex items-center justify-end pr-2"
                              style={{ width: `${percentage}%` }}
                            >
                              {percentage > 0 && (
                                <span className="text-xs font-medium text-primary-foreground">
                                  {usersAtLevel}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
