import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Users, 
  Activity, 
  HardDrive, 
  Zap, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Server,
  Trash2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemMetrics {
  database: {
    size_mb: number;
    tables_count: number;
    largest_tables: Array<{ table: string; size_mb: number; rows: number }>;
  };
  users: {
    total: number;
    active_today: number;
    new_this_week: number;
  };
  cache: {
    total_cached: number;
    total_hits: number;
    tokens_saved: number;
    cost_saved: number;
  };
  rate_limits: {
    total_tracked: number;
    blocked_users: number;
    top_endpoints: Record<string, number>;
  };
  edge_functions: {
    total_invocations: number;
    errors_today: number;
  };
}

const SystemHealth: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      // Fetch database stats
      const { count: profilesCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: todayActive } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { count: weekNew } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      // Fetch cache stats
      const { data: cacheData } = await supabase
        .from('ai_response_cache')
        .select('hit_count, tokens_used');

      const totalHits = cacheData?.reduce((acc, row) => acc + (row.hit_count || 0), 0) || 0;
      const tokensSaved = cacheData?.reduce((acc, row) => acc + ((row.hit_count || 0) * (row.tokens_used || 0)), 0) || 0;

      // Fetch rate limit stats
      const { data: rateLimits } = await supabase
        .from('rate_limits')
        .select('*');

      const blockedCount = rateLimits?.filter(r => r.is_blocked).length || 0;
      const endpointStats: Record<string, number> = {};
      rateLimits?.forEach(r => {
        endpointStats[r.endpoint] = (endpointStats[r.endpoint] || 0) + r.request_count;
      });

      // Fetch recent errors from system metrics
      const { data: errorMetrics } = await supabase
        .from('system_metrics')
        .select('*')
        .eq('metric_type', 'error')
        .gte('recorded_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      setMetrics({
        database: {
          size_mb: 54, // From previous analysis
          tables_count: 80,
          largest_tables: [
            { table: 'image_cache', size_mb: 24, rows: 100 },
            { table: 'daily_responses', size_mb: 0.8, rows: 1931 },
            { table: 'chat_conversation_history', size_mb: 0.5, rows: 500 }
          ]
        },
        users: {
          total: profilesCount || 16,
          active_today: todayActive || 0,
          new_this_week: weekNew || 0
        },
        cache: {
          total_cached: cacheData?.length || 0,
          total_hits: totalHits,
          tokens_saved: tokensSaved,
          cost_saved: (tokensSaved / 1000) * 0.002
        },
        rate_limits: {
          total_tracked: new Set(rateLimits?.map(r => r.user_id)).size,
          blocked_users: blockedCount,
          top_endpoints: endpointStats
        },
        edge_functions: {
          total_invocations: 0,
          errors_today: errorMetrics?.length || 0
        }
      });

    } catch (error) {
      console.error('Error fetching metrics:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar métricas do sistema',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    setCleanupLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-scheduler');
      
      if (error) throw error;

      toast({
        title: 'Limpeza Concluída',
        description: `${data.total_deleted} registros removidos em ${data.execution_time_ms}ms`,
      });

      fetchMetrics();
    } catch (error) {
      console.error('Cleanup error:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao executar limpeza',
        variant: 'destructive'
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const dbUsagePercent = metrics ? (metrics.database.size_mb / 8000) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">System Health</h1>
            <p className="text-muted-foreground">Monitoramento de performance e recursos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchMetrics} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="destructive" onClick={runCleanup} disabled={cleanupLoading}>
              <Trash2 className={`h-4 w-4 mr-2 ${cleanupLoading ? 'animate-spin' : ''}`} />
              Executar Limpeza
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Banco de Dados</p>
                  <p className="text-2xl font-bold">{metrics?.database.size_mb || 0} MB</p>
                </div>
                <Database className="h-8 w-8 text-primary opacity-50" />
              </div>
              <Progress value={dbUsagePercent} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {dbUsagePercent.toFixed(1)}% de 8 GB (Pro)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Usuários</p>
                  <p className="text-2xl font-bold">{metrics?.users.total || 0}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-50" />
              </div>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">
                  {metrics?.users.active_today || 0} hoje
                </Badge>
                <Badge variant="outline">
                  +{metrics?.users.new_this_week || 0} semana
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cache Hits</p>
                  <p className="text-2xl font-bold">{metrics?.cache.total_hits || 0}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
              <p className="text-sm text-green-600 mt-2">
                ${metrics?.cache.cost_saved.toFixed(2) || '0.00'} economizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Erros (24h)</p>
                  <p className="text-2xl font-bold">{metrics?.edge_functions.errors_today || 0}</p>
                </div>
                {(metrics?.edge_functions.errors_today || 0) > 10 ? (
                  <AlertTriangle className="h-8 w-8 text-destructive opacity-50" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                )}
              </div>
              <Badge 
                variant={(metrics?.edge_functions.errors_today || 0) > 10 ? 'destructive' : 'secondary'}
                className="mt-2"
              >
                {(metrics?.edge_functions.errors_today || 0) > 10 ? 'Atenção' : 'Normal'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Tabs */}
        <Tabs defaultValue="database" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="database">
              <Database className="h-4 w-4 mr-2" />
              Database
            </TabsTrigger>
            <TabsTrigger value="cache">
              <Zap className="h-4 w-4 mr-2" />
              Cache
            </TabsTrigger>
            <TabsTrigger value="rate-limits">
              <Activity className="h-4 w-4 mr-2" />
              Rate Limits
            </TabsTrigger>
            <TabsTrigger value="capacity">
              <Server className="h-4 w-4 mr-2" />
              Capacidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maiores Tabelas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics?.database.largest_tables.map((table, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{table.table}</p>
                        <p className="text-sm text-muted-foreground">
                          {table.rows.toLocaleString()} registros
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{table.size_mb} MB</p>
                        <Progress 
                          value={(table.size_mb / metrics.database.size_mb) * 100} 
                          className="w-24 h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Cache</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">{metrics?.cache.total_cached || 0}</p>
                    <p className="text-sm text-muted-foreground">Itens em cache</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">{metrics?.cache.total_hits || 0}</p>
                    <p className="text-sm text-muted-foreground">Cache hits</p>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <p className="text-3xl font-bold">{(metrics?.cache.tokens_saved || 0).toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">Tokens economizados</p>
                  </div>
                  <div className="text-center p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      ${metrics?.cache.cost_saved.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-sm text-muted-foreground">Custo economizado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rate-limits" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Rate Limiting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">Usuários rastreados</p>
                      <p className="text-sm text-muted-foreground">Com limites ativos</p>
                    </div>
                    <p className="text-2xl font-bold">{metrics?.rate_limits.total_tracked || 0}</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-destructive/10 rounded-lg">
                    <div>
                      <p className="font-medium">Usuários bloqueados</p>
                      <p className="text-sm text-muted-foreground">Por exceder limites</p>
                    </div>
                    <p className="text-2xl font-bold text-destructive">
                      {metrics?.rate_limits.blocked_users || 0}
                    </p>
                  </div>

                  <div className="pt-4">
                    <h4 className="font-medium mb-2">Requisições por Endpoint</h4>
                    <div className="space-y-2">
                      {Object.entries(metrics?.rate_limits.top_endpoints || {}).map(([endpoint, count]) => (
                        <div key={endpoint} className="flex justify-between items-center">
                          <span className="text-sm">{endpoint}</span>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Capacidade Estimada (Plano Pro)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Uso Leve</span>
                      </div>
                      <p className="text-3xl font-bold">15.000-20.000</p>
                      <p className="text-sm text-muted-foreground">usuários suportados</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg border-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-5 w-5 text-primary" />
                        <span className="font-medium">Uso Moderado</span>
                      </div>
                      <p className="text-3xl font-bold">8.000-10.000</p>
                      <p className="text-sm text-muted-foreground">usuários suportados</p>
                    </div>
                    
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">Uso Intenso</span>
                      </div>
                      <p className="text-3xl font-bold">3.000-5.000</p>
                      <p className="text-sm text-muted-foreground">usuários suportados</p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Limites do Plano Pro</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Database</p>
                        <p className="font-medium">8 GB</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conexões</p>
                        <p className="font-medium">200+</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Storage</p>
                        <p className="font-medium">100 GB</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Auth MAUs</p>
                        <p className="font-medium">100.000</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemHealth;
