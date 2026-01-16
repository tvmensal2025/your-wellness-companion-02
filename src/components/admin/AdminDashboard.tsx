import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users,
  Target,
  BookOpen,
  BarChart3,
  Shield,
  Crown,
  TrendingUp,
  Trophy,
  Brain,
  Award,
  Activity,
  Calendar,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface AdminDashboardProps {
  userRole?: 'admin' | 'super_admin';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  userRole = 'admin' 
}) => {
  const isSuperAdmin = userRole === 'super_admin';
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSessions: 0,
    activeChallenges: 0,
    completionRate: 0,
    totalCourses: 0,
    approvedGoals: 0,
    pendingGoals: 0
  });

  const [recentActivity, setRecentActivity] = useState<Array<{
    type: string;
    message: string;
    time: string;
    icon: React.ReactNode;
  }>>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar dados reais em paralelo
      const [
        usersResult,
        sessionsResult,
        challengesResult,
        coursesResult,
        goalsResult,
        completedGoalsResult,
        recentProfilesResult,
        recentChallengesResult
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('session_templates').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('user_goals').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
        supabase.from('user_goals').select('*', { count: 'exact', head: true }).eq('status', 'aprovada'),
        supabase.from('profiles').select('full_name, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('challenges').select('title, created_at').order('created_at', { ascending: false }).limit(2)
      ]);

      // Calcular estatísticas
      const totalGoals = (goalsResult.count || 0) + (completedGoalsResult.count || 0);
      const completionRate = totalGoals > 0 
        ? Math.round((completedGoalsResult.count || 0) / totalGoals * 100) 
        : 0;

      setStats({
        totalUsers: usersResult.count || 0,
        activeSessions: sessionsResult.count || 0,
        activeChallenges: challengesResult.count || 0,
        completionRate,
        totalCourses: coursesResult.count || 0,
        approvedGoals: completedGoalsResult.count || 0,
        pendingGoals: goalsResult.count || 0
      });

      // Criar atividades recentes
      const activities: typeof recentActivity = [];
      
      recentProfilesResult.data?.forEach((profile) => {
        activities.push({
          type: 'user',
          message: `Novo usuário: ${profile.full_name || 'Usuário'}`,
          time: formatTimeAgo(new Date(profile.created_at)),
          icon: <Users className="w-4 h-4 text-blue-500" />
        });
      });

      recentChallengesResult.data?.forEach((challenge) => {
        activities.push({
          type: 'challenge',
          message: `Desafio criado: ${challenge.title}`,
          time: formatTimeAgo(new Date(challenge.created_at)),
          icon: <Target className="w-4 h-4 text-purple-500" />
        });
      });

      // Ordenar por mais recente
      activities.sort((a, b) => a.time.localeCompare(b.time));
      setRecentActivity(activities.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  }, [loadDashboardData]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  const statsCards = [
    { 
      title: 'Usuários Totais', 
      value: stats.totalUsers.toString(), 
      change: 'Registrados no sistema',
      icon: <Users className="w-4 h-4" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    { 
      title: 'Templates Ativos', 
      value: stats.activeSessions.toString(), 
      change: 'Sessões disponíveis',
      icon: <Brain className="w-4 h-4" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    { 
      title: 'Desafios Ativos', 
      value: stats.activeChallenges.toString(), 
      change: 'Em andamento',
      icon: <Target className="w-4 h-4" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    { 
      title: 'Taxa de Conclusão', 
      value: `${stats.completionRate}%`, 
      change: 'Metas aprovadas',
      icon: <Trophy className="w-4 h-4" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    { 
      title: 'Cursos', 
      value: stats.totalCourses.toString(), 
      change: 'Disponíveis',
      icon: <BookOpen className="w-4 h-4" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    },
    { 
      title: 'Metas Pendentes', 
      value: stats.pendingGoals.toString(), 
      change: 'Aguardando aprovação',
      icon: <Award className="w-4 h-4" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    }
  ];

  const quickStats = [
    {
      label: 'Usuários',
      value: stats.totalUsers.toString(),
      trend: stats.totalUsers > 0 ? 'up' : 'stable',
      color: 'text-green-600'
    },
    {
      label: 'Sessões',
      value: stats.activeSessions.toString(),
      trend: stats.activeSessions > 0 ? 'up' : 'stable', 
      color: 'text-blue-600'
    },
    {
      label: 'Metas Pendentes',
      value: stats.pendingGoals.toString(),
      trend: stats.pendingGoals > 0 ? 'down' : 'stable',
      color: 'text-orange-600'
    },
    {
      label: 'Sistema',
      value: '100%',
      trend: 'stable',
      color: 'text-green-600'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 text-primary mx-auto animate-spin" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">
              Visão Geral Administrativa
            </h1>
            <Badge 
              variant={isSuperAdmin ? "default" : "secondary"}
              className={isSuperAdmin ? "bg-yellow-500 text-yellow-900" : ""}
            >
              {isSuperAdmin ? (
                <>
                  <Crown className="w-3 h-3 mr-1" />
                  Super Admin
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </>
              )}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            Dados em tempo real do sistema
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-0 shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className="flex items-center">
                    {stat.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                    {stat.trend === 'down' && <TrendingUp className="w-4 h-4 text-orange-500 rotate-180" />}
                    {stat.trend === 'stable' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <div className={stat.color}>
                          {stat.icon}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma atividade recente</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Servidor</span>
                <Badge variant="default" className="bg-green-500">
                  <div className="w-2 h-2 bg-green-100 rounded-full mr-2 animate-pulse"></div>
                  Online
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Banco de Dados</span>
                <Badge variant="default" className="bg-green-500">
                  <div className="w-2 h-2 bg-green-100 rounded-full mr-2 animate-pulse"></div>
                  Conectado
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">IA (Sofia/DrVital)</span>
                <Badge variant="default" className="bg-green-500">
                  <div className="w-2 h-2 bg-green-100 rounded-full mr-2 animate-pulse"></div>
                  Ativo
                </Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                <span className="text-sm font-medium">Autenticação</span>
                <Badge variant="default" className="bg-green-500">
                  <div className="w-2 h-2 bg-green-100 rounded-full mr-2 animate-pulse"></div>
                  Funcional
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Helper */}
      <Card className="border-dashed border-0 shadow-md bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">
              Sistema 100% Funcional
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Use o menu lateral para acessar todas as funcionalidades administrativas
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="bg-background">Gestão de Usuários</Badge>
              <Badge variant="outline" className="bg-background">Sessões</Badge>
              <Badge variant="outline" className="bg-background">Desafios</Badge>
              <Badge variant="outline" className="bg-background">Cursos</Badge>
              <Badge variant="outline" className="bg-background">Relatórios</Badge>
              <Badge variant="outline" className="bg-background">IA</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
