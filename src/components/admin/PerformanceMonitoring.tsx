/**
 * 📊 PAINEL DE MONITORAMENTO DE PERFORMANCE
 * 
 * Dashboard completo com métricas em tempo real:
 * - Performance por feature
 * - Health checks de serviços
 * - Erros críticos
 * - Gráficos e estatísticas
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Eye,
  Camera,
  Brain,
  Stethoscope,
  MessageSquare,
  Target,
  Server,
  Database,
  Shield
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { format, subHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================
// TIPOS
// ============================================

interface FeaturePerformance {
  feature: string;
  total_requests: number;
  successful_requests: number;
  avg_duration_ms: number;
  success_rate: number;
  p50_duration_ms: number;
  p95_duration_ms: number;
  p99_duration_ms: number;
}

interface ServiceStatus {
  service_name: string;
  status: 'healthy' | 'degraded' | 'down';
  response_time_ms: number;
  last_check: string;
  error_message?: string;
}

interface CriticalError {
  id: string;
  feature: string;
  error_type: string;
  error_message: string;
  created_at: string;
  resolved: boolean;
  user_id?: string;
}

interface HourlyMetric {
  hour: string;
  feature: string;
  action: string;
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  avg_duration_ms: number;
  success_rate: number;
}

// ============================================
// CONSTANTES
// ============================================

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  yolo: <Eye className="w-4 h-4" />,
  sofia: <Brain className="w-4 h-4" />,
  camera_workout: <Camera className="w-4 h-4" />,
  dr_vital: <Stethoscope className="w-4 h-4" />,
  whatsapp: <MessageSquare className="w-4 h-4" />,
  challenges: <Target className="w-4 h-4" />,
  database: <Database className="w-4 h-4" />,
  auth: <Shield className="w-4 h-4" />,
  other: <Activity className="w-4 h-4" />
};

const FEATURE_COLORS: Record<string, string> = {
  yolo: '#22c55e',
  sofia: '#3b82f6',
  camera_workout: '#f59e0b',
  dr_vital: '#ec4899',
  whatsapp: '#8b5cf6',
  challenges: '#06b6d4',
  database: '#64748b',
  auth: '#ef4444',
  other: '#6b7280'
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export const PerformanceMonitoring: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('24h');
  const { toast } = useToast();

  // Estados
  const [featurePerformance, setFeaturePerformance] = useState<FeaturePerformance[]>([]);
  const [servicesStatus, setServicesStatus] = useState<ServiceStatus[]>([]);
  const [criticalErrors, setCriticalErrors] = useState<CriticalError[]>([]);
  const [hourlyMetrics, setHourlyMetrics] = useState<HourlyMetric[]>([]);

  // ============================================
  // CARREGAR DADOS
  // ============================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      // Carregar em paralelo
      const [perfData, statusData, errorsData, metricsData] = await Promise.all([
        // Performance por feature
        supabase
          .from('feature_performance_24h')
          .select('*')
          .order('total_requests', { ascending: false }),

        // Status dos serviços
        supabase
          .from('services_status')
          .select('*'),

        // Erros críticos não resolvidos
        supabase
          .from('critical_errors')
          .select('*')
          .eq('resolved', false)
          .order('created_at', { ascending: false })
          .limit(20),

        // Métricas horárias
        supabase
          .from('metrics_hourly')
          .select('*')
          .order('hour', { ascending: false })
          .limit(24)
      ]);

      if (perfData.data) setFeaturePerformance(perfData.data);
      if (statusData.data) setServicesStatus(statusData.data);
      if (errorsData.data) setCriticalErrors(errorsData.data);
      if (metricsData.data) setHourlyMetrics(metricsData.data);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar as métricas',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast({
      title: 'Dados atualizados',
      description: 'Métricas atualizadas com sucesso'
    });
  };

  const handleResolveError = async (errorId: string) => {
    try {
      const { error } = await supabase.rpc('resolve_critical_error', {
        p_error_id: errorId
      });

      if (error) throw error;

      toast({
        title: 'Erro resolvido',
        description: 'Erro marcado como resolvido'
      });

      await loadData();
    } catch (error) {
      toast({
        title: 'Erro ao resolver',
        description: 'Não foi possível marcar o erro como resolvido',
        variant: 'destructive'
      });
    }
  };

  // ============================================
  // CÁLCULOS
  // ============================================

  const totalRequests = featurePerformance.reduce((sum, f) => sum + f.total_requests, 0);
  const avgSuccessRate = featurePerformance.length > 0
    ? featurePerformance.reduce((sum, f) => sum + f.success_rate, 0) / featurePerformance.length
    : 0;
  const avgResponseTime = featurePerformance.length > 0
    ? featurePerformance.reduce((sum, f) => sum + f.avg_duration_ms, 0) / featurePerformance.length
    : 0;

  const healthyServices = servicesStatus.filter(s => s.status === 'healthy').length;
  const totalServices = servicesStatus.length;

  // Dados para gráficos
  const performanceChartData = featurePerformance.map(f => ({
    name: f.feature,
    requests: f.total_requests,
    success_rate: f.success_rate,
    avg_ms: Math.round(f.avg_duration_ms)
  }));

  const timelineData = hourlyMetrics
    .slice(0, 24)
    .reverse()
    .map(m => ({
      time: format(new Date(m.hour), 'HH:mm', { locale: ptBR }),
      requests: m.total_calls,
      success: m.successful_calls,
      failed: m.failed_calls,
      avg_ms: Math.round(m.avg_duration_ms)
    }));

  // ============================================
  // RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real de todas as features
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última hora</SelectItem>
              <SelectItem value="6h">Últimas 6h</SelectItem>
              <SelectItem value="24h">Últimas 24h</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Requisições</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {avgSuccessRate >= 95 ? (
                <span className="text-green-500 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Excelente
                </span>
              ) : (
                <span className="text-yellow-500 flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" /> Atenção
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgResponseTime)}ms</div>
            <p className="text-xs text-muted-foreground">
              {avgResponseTime < 1000 ? (
                <span className="text-green-500 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> Rápido
                </span>
              ) : (
                <span className="text-yellow-500">Pode melhorar</span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Serviços Ativos</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthyServices}/{totalServices}
            </div>
            <p className="text-xs text-muted-foreground">
              {healthyServices === totalServices ? (
                <span className="text-green-500">Todos operacionais</span>
              ) : (
                <span className="text-red-500">{totalServices - healthyServices} com problemas</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="features">Por Feature</TabsTrigger>
          <TabsTrigger value="services">Serviços</TabsTrigger>
          <TabsTrigger value="errors">
            Erros
            {criticalErrors.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {criticalErrors.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Requisições por Hora</CardTitle>
              <CardDescription>Últimas 24 horas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="success"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    name="Sucesso"
                  />
                  <Area
                    type="monotone"
                    dataKey="failed"
                    stackId="1"
                    stroke="#ef4444"
                    fill="#ef4444"
                    name="Falhas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Requisições por Feature</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="requests" fill="#3b82f6" name="Requisições" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tempo de Resposta Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="avg_ms" fill="#f59e0b" name="Tempo (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Por Feature */}
        <TabsContent value="features" className="space-y-4">
          <div className="grid gap-4">
            {featurePerformance.map((feature) => (
              <Card key={feature.feature}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {FEATURE_ICONS[feature.feature] || FEATURE_ICONS.other}
                      <CardTitle className="text-lg capitalize">
                        {feature.feature.replace('_', ' ')}
                      </CardTitle>
                    </div>
                    <Badge
                      variant={feature.success_rate >= 95 ? 'default' : 'destructive'}
                    >
                      {feature.success_rate.toFixed(1)}% sucesso
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{feature.total_requests}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Média</p>
                      <p className="text-2xl font-bold">{Math.round(feature.avg_duration_ms)}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">P50</p>
                      <p className="text-2xl font-bold">{Math.round(feature.p50_duration_ms)}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">P95</p>
                      <p className="text-2xl font-bold">{Math.round(feature.p95_duration_ms)}ms</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">P99</p>
                      <p className="text-2xl font-bold">{Math.round(feature.p99_duration_ms)}ms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Serviços */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {servicesStatus.map((service) => (
              <Card key={service.service_name}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">
                      {service.service_name}
                    </CardTitle>
                    <Badge
                      variant={
                        service.status === 'healthy'
                          ? 'default'
                          : service.status === 'degraded'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {service.status === 'healthy' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {service.status === 'degraded' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {service.status === 'down' && <XCircle className="w-3 h-3 mr-1" />}
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Tempo de resposta</span>
                      <span className="font-medium">{service.response_time_ms}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Última verificação</span>
                      <span className="font-medium">
                        {format(new Date(service.last_check), 'HH:mm:ss', { locale: ptBR })}
                      </span>
                    </div>
                    {service.error_message && (
                      <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                        {service.error_message}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Erros */}
        <TabsContent value="errors" className="space-y-4">
          {criticalErrors.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-lg font-medium">Nenhum erro crítico</p>
                <p className="text-sm text-muted-foreground">Sistema operando normalmente</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {criticalErrors.map((error) => (
                <Card key={error.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        <div>
                          <CardTitle className="text-lg">{error.error_type}</CardTitle>
                          <CardDescription className="capitalize">
                            {error.feature.replace('_', ' ')}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResolveError(error.id)}
                      >
                        Marcar como resolvido
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="p-3 bg-muted rounded font-mono text-sm">
                        {error.error_message}
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>
                          {format(new Date(error.created_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR
                          })}
                        </span>
                        {error.user_id && <span>User ID: {error.user_id.slice(0, 8)}...</span>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
