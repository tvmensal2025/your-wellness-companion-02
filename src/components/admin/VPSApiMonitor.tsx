/**
 * VPS API Monitor - Painel de Chamadas API Node.js
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { checkVPSHealth } from '@/lib/vpsApi';
import { WhatsAppButtonMapping } from './WhatsAppButtonMapping';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Server, 
  Database,
  MessageSquare,
  HardDrive,
  Bell,
  Activity,
  Zap,
  Timer,
  AlertTriangle,
  Network
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Definição de todos os endpoints VPS
const VPS_ENDPOINTS = [
  // Health
  { category: 'Health', method: 'GET', path: '/health', description: 'Status básico' },
  { category: 'Health', method: 'GET', path: '/health/detailed', description: 'Status detalhado' },
  { category: 'Health', method: 'GET', path: '/health/metrics', description: 'Métricas do sistema' },
  
  // Storage
  { category: 'Storage', method: 'POST', path: '/storage/upload/:folder', description: 'Upload de arquivo' },
  { category: 'Storage', method: 'GET', path: '/storage/list/:folder', description: 'Listar arquivos' },
  { category: 'Storage', method: 'GET', path: '/storage/:folder/:filename', description: 'Obter arquivo' },
  { category: 'Storage', method: 'DELETE', path: '/storage/:folder/:filename', description: 'Deletar arquivo' },
  
  // WhatsApp
  { category: 'WhatsApp', method: 'POST', path: '/whatsapp/send', description: 'Enviar mensagem' },
  { category: 'WhatsApp', method: 'POST', path: '/whatsapp/buttons', description: 'Enviar com botões' },
  { category: 'WhatsApp', method: 'POST', path: '/whatsapp/image', description: 'Enviar imagem' },
  { category: 'WhatsApp', method: 'POST', path: '/whatsapp/template', description: 'Enviar template' },
  { category: 'WhatsApp', method: 'POST', path: '/whatsapp/webhook', description: 'Webhook entrada' },
  
  // Tracking
  { category: 'Tracking', method: 'POST', path: '/tracking/weight', description: 'Registrar peso' },
  { category: 'Tracking', method: 'GET', path: '/tracking/weight/:userId', description: 'Histórico peso' },
  { category: 'Tracking', method: 'POST', path: '/tracking/water', description: 'Registrar água' },
  { category: 'Tracking', method: 'GET', path: '/tracking/water/:userId', description: 'Água do dia' },
  { category: 'Tracking', method: 'POST', path: '/tracking/mood', description: 'Registrar humor' },
  { category: 'Tracking', method: 'GET', path: '/tracking/summary/:userId', description: 'Resumo diário' },
  
  // Notify
  { category: 'Notify', method: 'POST', path: '/notify/send', description: 'Enviar notificação' },
  { category: 'Notify', method: 'POST', path: '/notify/process', description: 'Processar fila' },
  { category: 'Notify', method: 'GET', path: '/notify/pending/:userId', description: 'Pendentes' },
  { category: 'Notify', method: 'POST', path: '/notify/broadcast', description: 'Broadcast' },
  { category: 'Notify', method: 'GET', path: '/notify/status', description: 'Status cron' },
  
  // YOLO (FastAPI)
  { category: 'YOLO', method: 'POST', path: '/yolo/detect', description: 'Detectar objetos' },
  { category: 'YOLO', method: 'GET', path: '/yolo/health', description: 'Status YOLO' },
];

// Cron Jobs do VPS
const CRON_JOBS = [
  { name: 'Notificações', schedule: '*/5 * * * *', description: 'Processa fila de notificações', icon: Bell },
  { name: 'Água', schedule: '0 9,12,15,18 * * *', description: 'Lembrete de hidratação', icon: Activity },
  { name: 'Peso', schedule: '0 8 * * 1', description: 'Lembrete semanal de peso', icon: Database },
  { name: 'Bom Dia', schedule: '0 7 * * *', description: 'Briefing matinal', icon: Zap },
  { name: 'Resumo', schedule: '0 21 * * *', description: 'Resumo diário', icon: MessageSquare },
];

interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number | null;
  success: boolean;
  response_time_ms: number | null;
  error_message: string | null;
  created_at: string;
}

interface VPSHealth {
  status: string;
  uptime: number;
  checks: {
    server: { status: string };
    minio: { status: string; bucket?: string };
    supabase: { status: string };
    whatsapp: { status: string; provider?: string };
  };
}

export function VPSApiMonitor() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [vpsHealth, setVpsHealth] = useState<VPSHealth | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    success: 0,
    failed: 0,
    avgTime: 0,
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vps_api_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const typedLogs = (data || []) as ApiLog[];
      setLogs(typedLogs);

      // Calcular estatísticas
      const successCount = typedLogs.filter(l => l.success).length;
      const totalTime = typedLogs.reduce((sum, l) => sum + (l.response_time_ms || 0), 0);
      
      setStats({
        total: typedLogs.length,
        success: successCount,
        failed: typedLogs.length - successCount,
        avgTime: typedLogs.length > 0 ? Math.round(totalTime / typedLogs.length) : 0,
      });
    } catch (error) {
      console.error('Erro ao buscar logs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVPSHealth = useCallback(async () => {
    try {
      const health = await checkVPSHealth();
      setVpsHealth(health as VPSHealth);
    } catch (error) {
      console.error('Erro ao verificar VPS:', error);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchVPSHealth();
  }, [fetchLogs, fetchVPSHealth]);

  // Agrupar endpoints por categoria
  const categories = [...new Set(VPS_ENDPOINTS.map(e => e.category))];
  const filteredEndpoints = activeCategory === 'all' 
    ? VPS_ENDPOINTS 
    : VPS_ENDPOINTS.filter(e => e.category === activeCategory);

  // Estatísticas por categoria
  const categoryStats = categories.map(cat => {
    const catLogs = logs.filter(l => {
      const endpoint = VPS_ENDPOINTS.find(e => l.endpoint?.includes(e.path.split(':')[0]));
      return endpoint?.category === cat;
    });
    return {
      category: cat,
      count: catLogs.length,
      success: catLogs.filter(l => l.success).length,
    };
  });

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'POST': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'PUT': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Health': return <Server className="h-4 w-4" />;
      case 'Storage': return <HardDrive className="h-4 w-4" />;
      case 'WhatsApp': return <MessageSquare className="h-4 w-4" />;
      case 'Tracking': return <Activity className="h-4 w-4" />;
      case 'Notify': return <Bell className="h-4 w-4" />;
      case 'YOLO': return <Zap className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com status VPS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${vpsHealth?.status === 'healthy' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
            <Server className={`h-5 w-5 ${vpsHealth?.status === 'healthy' ? 'text-green-600' : 'text-yellow-600'}`} />
          </div>
          <div>
            <h3 className="font-semibold">VPS Node.js (media-api)</h3>
            <p className="text-sm text-muted-foreground">
              Status: <Badge variant={vpsHealth?.status === 'healthy' ? 'default' : 'secondary'}>
                {vpsHealth?.status || 'Verificando...'}
              </Badge>
              {vpsHealth?.uptime && (
                <span className="ml-2">
                  Uptime: {Math.floor(vpsHealth.uptime / 3600)}h {Math.floor((vpsHealth.uptime % 3600) / 60)}m
                </span>
              )}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchLogs(); fetchVPSHealth(); }} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total Chamadas</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Sucesso</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.success}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Falhas</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">{stats.failed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Tempo Médio</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.avgTime}ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Status dos serviços */}
      {vpsHealth?.checks && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status dos Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(vpsHealth.checks).map(([name, check]) => (
                <div key={name} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  {check.status === 'ok' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : check.status === 'not_configured' ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm capitalize">{name}</span>
                  {(check as { provider?: string }).provider && (
                    <Badge variant="outline" className="text-xs ml-auto">
                      {(check as { provider?: string }).provider}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="endpoints">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">📡 Endpoints</TabsTrigger>
          <TabsTrigger value="buttons">🔘 Botões</TabsTrigger>
          <TabsTrigger value="logs">📋 Histórico</TabsTrigger>
          <TabsTrigger value="cron">⏰ Cron Jobs</TabsTrigger>
        </TabsList>

        {/* Tab: Endpoints */}
        <TabsContent value="endpoints" className="space-y-4">
          {/* Filtro por categoria */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              Todos ({VPS_ENDPOINTS.length})
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className="gap-1"
              >
                {getCategoryIcon(cat)}
                {cat} ({VPS_ENDPOINTS.filter(e => e.category === cat).length})
              </Button>
            ))}
          </div>

          {/* Lista de endpoints */}
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredEndpoints.map((endpoint, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 hover:bg-muted/50">
                    <Badge className={`font-mono text-xs ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm flex-1 font-mono">{endpoint.path}</code>
                    <span className="text-sm text-muted-foreground">{endpoint.description}</span>
                    <Badge variant="outline" className="text-xs">
                      {endpoint.category}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats por categoria */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categoryStats.map(stat => (
              <Card key={stat.category}>
                <CardContent className="p-3 text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {getCategoryIcon(stat.category)}
                    <span className="text-sm font-medium">{stat.category}</span>
                  </div>
                  <p className="text-lg font-bold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">
                    {stat.success}/{stat.count} ok
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Botões WhatsApp */}
        <TabsContent value="buttons">
          <WhatsAppButtonMapping />
        </TabsContent>
        {/* Tab: Logs */}
        <TabsContent value="logs">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Últimas {logs.length} chamadas
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {logs.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhuma chamada registrada ainda</p>
                      <p className="text-sm">As chamadas serão logadas automaticamente</p>
                    </div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="flex items-center gap-3 p-3 hover:bg-muted/50">
                        <span className="text-xs text-muted-foreground w-14">
                          {format(new Date(log.created_at), 'HH:mm:ss')}
                        </span>
                        <Badge className={`font-mono text-xs ${getMethodColor(log.method)}`}>
                          {log.method}
                        </Badge>
                        <code className="text-sm flex-1 font-mono truncate">{log.endpoint}</code>
                        {log.success ? (
                          <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            {log.status_code || 200}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            {log.status_code || 'Erro'}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {log.response_time_ms}ms
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Cron Jobs */}
        <TabsContent value="cron">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Timer className="h-4 w-4" />
                Jobs Agendados no VPS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CRON_JOBS.map((job, idx) => {
                  const Icon = job.icon;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{job.name}</p>
                        <p className="text-sm text-muted-foreground">{job.description}</p>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">
                        {job.schedule}
                      </Badge>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 Os jobs são executados pelo node-cron no servidor VPS. 
                  O processador de notificações checa a tabela <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">notification_queue_unified</code> a cada 5 minutos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default VPSApiMonitor;
