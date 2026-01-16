import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { checkVPSHealth, isVPSConfigured } from '@/lib/vpsApi';
import { 
  Brain, 
  DollarSign, 
  TrendingDown, 
  Activity, 
  Zap,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  HardDrive,
  Image,
  Server,
  Database,
  Cpu,
  FileText,
  Utensils,
  Stethoscope,
  MessageSquare,
  Camera,
  Scale,
  Bot,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar, CartesianGrid } from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AIUsageLog {
  id: string;
  provider: string;
  method: string;
  tokens_used: number | null;
  estimated_cost: number | null;
  response_time_ms: number | null;
  success: boolean | null;
  created_at: string;
  functionality: string | null;
  model_name: string | null;
  error_message: string | null;
}

interface DailyStats {
  date: string;
  total_calls: number;
  total_cost: number;
  total_tokens: number;
  providers: Record<string, { calls: number; cost: number }>;
}

interface ProviderStats {
  name: string;
  calls: number;
  cost: number;
  tokens: number;
  avgResponseTime: number;
  successRate: number;
  color: string;
  isFree: boolean;
}

const PROVIDER_COLORS: Record<string, { color: string; isFree: boolean; displayName: string }> = {
  'ollama': { color: '#22c55e', isFree: true, displayName: 'Ollama (Local)' },
  'yolo': { color: '#eab308', isFree: true, displayName: 'YOLO (Local)' },
  'gemini': { color: '#3b82f6', isFree: false, displayName: 'Google Gemini' },
  'openai': { color: '#ec4899', isFree: false, displayName: 'OpenAI GPT' },
  'lovable': { color: '#8b5cf6', isFree: false, displayName: 'Lovable AI' },
  'google': { color: '#4285f4', isFree: false, displayName: 'Google AI' },
};

const COST_PER_1K_TOKENS: Record<string, number> = {
  'ollama': 0,
  'yolo': 0,
  'gemini': 0.00025,
  'openai': 0.002,
  'lovable': 0.001,
  'google': 0.00025,
};

// Helper para identificar tipo de funcionalidade
const getFunctionalityInfo = (log: AIUsageLog): { 
  icon: React.ReactNode; 
  label: string; 
  type: 'image' | 'text' | 'exam' | 'food' | 'chat' | 'other';
  color: string;
} => {
  const method = log.method?.toLowerCase() || '';
  const functionality = log.functionality?.toLowerCase() || '';
  
  // Análise de exames médicos
  if (functionality.includes('exam') || functionality.includes('medical') || 
      method.includes('exam') || method.includes('medical') || method.includes('analyze-medical')) {
    return { 
      icon: <Stethoscope className="h-4 w-4" />, 
      label: 'Exame Médico', 
      type: 'exam',
      color: 'text-red-500 bg-red-50 border-red-200'
    };
  }
  
  // Análise de alimentos
  if (functionality.includes('food') || functionality.includes('nutrition') || 
      method.includes('food') || method.includes('sofia-image') || method.includes('analyze-food')) {
    return { 
      icon: <Utensils className="h-4 w-4" />, 
      label: 'Análise Alimento', 
      type: 'food',
      color: 'text-orange-500 bg-orange-50 border-orange-200'
    };
  }
  
  // YOLO detection
  if (log.provider?.toLowerCase() === 'yolo' || method.includes('yolo') || method.includes('detect')) {
    return { 
      icon: <Eye className="h-4 w-4" />, 
      label: 'Detecção YOLO', 
      type: 'image',
      color: 'text-yellow-500 bg-yellow-50 border-yellow-200'
    };
  }
  
  // Imagem genérica
  if (functionality.includes('image') || functionality.includes('vision') || 
      method.includes('image') || method.includes('vision') || method.includes('photo')) {
    return { 
      icon: <Camera className="h-4 w-4" />, 
      label: 'Análise Imagem', 
      type: 'image',
      color: 'text-blue-500 bg-blue-50 border-blue-200'
    };
  }
  
  // Chat/Conversa
  if (functionality.includes('chat') || functionality.includes('conversation') || 
      method.includes('chat') || method.includes('message')) {
    return { 
      icon: <MessageSquare className="h-4 w-4" />, 
      label: 'Chat', 
      type: 'chat',
      color: 'text-purple-500 bg-purple-50 border-purple-200'
    };
  }
  
  // Peso/Tracking
  if (functionality.includes('weight') || functionality.includes('tracking') || 
      method.includes('weight')) {
    return { 
      icon: <Scale className="h-4 w-4" />, 
      label: 'Tracking', 
      type: 'other',
      color: 'text-green-500 bg-green-50 border-green-200'
    };
  }
  
  // Texto genérico
  if (method.includes('text') || method.includes('generate') || method.includes('complete')) {
    return { 
      icon: <FileText className="h-4 w-4" />, 
      label: 'Texto', 
      type: 'text',
      color: 'text-gray-500 bg-gray-50 border-gray-200'
    };
  }
  
  // Default
  return { 
    icon: <Bot className="h-4 w-4" />, 
    label: 'IA', 
    type: 'other',
    color: 'text-gray-500 bg-gray-50 border-gray-200'
  };
};

export function AICostDashboard() {
  const [logs, setLogs] = useState<AIUsageLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // VPS/Infrastructure stats
  const [vpsStats, setVpsStats] = useState<{
    status: string;
    uptime: number;
    memory: { rss: number; heapUsed: number };
    storageUploads: number;
    storageSizeBytes: number;
    yoloCalls: number;
    yoloSavings: number;
  } | null>(null);
  const [vpsLoading, setVpsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const days = parseInt(period);
      const startDate = startOfDay(subDays(new Date(), days));
      
      // Fetch usage logs
      const { data: logsData, error: logsError } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false })
        .limit(500);

      if (logsError) throw logsError;

      const typedLogs = (logsData || []) as AIUsageLog[];
      setLogs(typedLogs);

      // Calculate provider stats
      const providerMap = new Map<string, {
        calls: number;
        cost: number;
        tokens: number;
        responseTime: number[];
        successes: number;
      }>();

      typedLogs.forEach(log => {
        const provider = log.provider?.toLowerCase() || 'unknown';
        const existing = providerMap.get(provider) || {
          calls: 0,
          cost: 0,
          tokens: 0,
          responseTime: [],
          successes: 0,
        };

        existing.calls++;
        existing.cost += log.estimated_cost || 0;
        existing.tokens += log.tokens_used || 0;
        if (log.response_time_ms) existing.responseTime.push(log.response_time_ms);
        if (log.success) existing.successes++;

        providerMap.set(provider, existing);
      });

      const stats: ProviderStats[] = [];
      providerMap.forEach((data, provider) => {
        const config = PROVIDER_COLORS[provider] || { color: '#6b7280', isFree: false, displayName: provider };
        stats.push({
          name: config.displayName,
          calls: data.calls,
          cost: data.cost,
          tokens: data.tokens,
          avgResponseTime: data.responseTime.length > 0 
            ? Math.round(data.responseTime.reduce((a, b) => a + b, 0) / data.responseTime.length)
            : 0,
          successRate: data.calls > 0 ? Math.round((data.successes / data.calls) * 100) : 0,
          color: config.color,
          isFree: config.isFree,
        });
      });

      setProviderStats(stats.sort((a, b) => b.calls - a.calls));

      // Calculate daily stats
      const dailyMap = new Map<string, DailyStats>();
      
      for (let i = days; i >= 0; i--) {
        const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyMap.set(date, {
          date,
          total_calls: 0,
          total_cost: 0,
          total_tokens: 0,
          providers: {},
        });
      }

      typedLogs.forEach(log => {
        const date = format(new Date(log.created_at), 'yyyy-MM-dd');
        const existing = dailyMap.get(date);
        if (existing) {
          existing.total_calls++;
          existing.total_cost += log.estimated_cost || 0;
          existing.total_tokens += log.tokens_used || 0;
          
          const provider = log.provider?.toLowerCase() || 'unknown';
          if (!existing.providers[provider]) {
            existing.providers[provider] = { calls: 0, cost: 0 };
          }
          existing.providers[provider].calls++;
          existing.providers[provider].cost += log.estimated_cost || 0;
        }
      });

      setDailyStats(Array.from(dailyMap.values()));

    } catch (error) {
      console.error('Error fetching AI usage data:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch VPS stats
  const fetchVPSStats = useCallback(async () => {
    if (!isVPSConfigured()) return;
    
    setVpsLoading(true);
    try {
      const health = await checkVPSHealth();
      
      // Count YOLO calls from logs
      const yoloCalls = logs.filter(l => l.provider?.toLowerCase() === 'yolo').length;
      // Estimate savings: YOLO is free, Gemini Vision would cost ~$0.0025 per image
      const yoloSavings = yoloCalls * 0.0025;
      
      // Count storage uploads from logs (approximate)
      const storageUploads = logs.filter(l => 
        l.method?.includes('upload') || l.functionality?.includes('storage')
      ).length;
      
      setVpsStats({
        status: health.status,
        uptime: health.uptime,
        memory: health.memory || { rss: 0, heapUsed: 0 },
        storageUploads,
        storageSizeBytes: 0, // Would need MinIO API to get actual size
        yoloCalls,
        yoloSavings,
      });
    } catch (error) {
      console.error('Error fetching VPS stats:', error);
    } finally {
      setVpsLoading(false);
    }
  }, [logs]);

  useEffect(() => {
    if (logs.length > 0) {
      fetchVPSStats();
    }
  }, [logs, fetchVPSStats]);

  // Calculate totals
  const totals = {
    calls: logs.length,
    cost: logs.reduce((sum, log) => sum + (log.estimated_cost || 0), 0),
    tokens: logs.reduce((sum, log) => sum + (log.tokens_used || 0), 0),
    avgResponseTime: logs.length > 0
      ? Math.round(logs.reduce((sum, log) => sum + (log.response_time_ms || 0), 0) / logs.length)
      : 0,
    successRate: logs.length > 0
      ? Math.round((logs.filter(l => l.success).length / logs.length) * 100)
      : 0,
  };

  // Calculate savings from free providers
  const freeCalls = providerStats.filter(p => p.isFree).reduce((sum, p) => sum + p.calls, 0);
  const estimatedSavings = freeCalls * 0.002; // Assuming average cost per call if using paid provider

  const pieData = providerStats.map(p => ({
    name: p.name,
    value: p.calls,
    color: p.color,
  }));

  const lineData = dailyStats.map(day => ({
    date: format(new Date(day.date), 'dd/MM', { locale: ptBR }),
    custo: day.total_cost,
    chamadas: day.total_calls,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Dashboard de Custos de IA
          </h2>
          <p className="text-muted-foreground">
            Monitoramento de uso e custos dos provedores de IA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="14">Últimos 14 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Total de Chamadas</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totals.calls.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Custo Total</span>
            </div>
            <p className="text-2xl font-bold mt-2">${totals.cost.toFixed(4)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">Economia</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-emerald-600">${estimatedSavings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{freeCalls} chamadas gratuitas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Tempo Médio</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totals.avgResponseTime}ms</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Taxa de Sucesso</span>
            </div>
            <p className="text-2xl font-bold mt-2">{totals.successRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="providers">Por Provedor</TabsTrigger>
          <TabsTrigger value="infrastructure">Infraestrutura</TabsTrigger>
          <TabsTrigger value="logs">Logs Detalhados</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuição por Provedor</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Histórico de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                {lineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="custo" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={{ fill: '#8b5cf6' }}
                        name="Custo ($)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="chamadas" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6' }}
                        name="Chamadas"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                    Nenhum dado disponível
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Provider Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {providerStats.map(provider => (
              <Card key={provider.name} className="relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-1 h-full" 
                  style={{ backgroundColor: provider.color }}
                />
                <CardContent className="p-4 pl-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{provider.name}</span>
                    {provider.isFree && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Gratuito
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Chamadas</p>
                      <p className="font-semibold">{provider.calls}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Custo</p>
                      <p className="font-semibold">${provider.cost.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tempo médio</p>
                      <p className="font-semibold">{provider.avgResponseTime}ms</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sucesso</p>
                      <p className="font-semibold">{provider.successRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Provedores</CardTitle>
              <CardDescription>
                Análise detalhada de cada provedor de IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              {providerStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={providerStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" width={120} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calls" fill="#3b82f6" name="Chamadas" />
                    <Bar dataKey="tokens" fill="#8b5cf6" name="Tokens (÷1000)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-4">
          {/* VPS Status */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-muted-foreground">VPS Backend</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  {vpsStats?.status === 'ok' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-lg font-bold text-green-600">Online</span>
                    </>
                  ) : vpsStats?.status === 'degraded' ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <span className="text-lg font-bold text-yellow-600">Parcial</span>
                    </>
                  ) : vpsStats?.uptime && vpsStats.uptime > 0 ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-lg font-bold text-green-600">Online</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-lg font-bold text-red-600">Offline</span>
                    </>
                  )}
                </div>
                {vpsStats?.uptime && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Uptime: {Math.floor(vpsStats.uptime / 3600)}h {Math.floor((vpsStats.uptime % 3600) / 60)}m
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-muted-foreground">MinIO Storage</span>
                </div>
                <p className="text-2xl font-bold mt-2">{vpsStats?.storageUploads || 0}</p>
                <p className="text-xs text-muted-foreground">Uploads no período</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-muted-foreground">YOLO Detecções</span>
                </div>
                <p className="text-2xl font-bold mt-2">{vpsStats?.yoloCalls || 0}</p>
                <p className="text-xs text-muted-foreground">Imagens processadas</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-muted-foreground">Economia YOLO</span>
                </div>
                <p className="text-2xl font-bold mt-2 text-emerald-600">
                  ${vpsStats?.yoloSavings?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-muted-foreground">vs Gemini Vision</p>
              </CardContent>
            </Card>
          </div>

          {/* Infrastructure Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Serviços VPS
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Server className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Media API</p>
                      <p className="text-xs text-muted-foreground">Express + MinIO</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Ativo
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <HardDrive className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">MinIO Storage</p>
                      <p className="text-xs text-muted-foreground">Bucket: images</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Ativo
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Cpu className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">YOLO Detection</p>
                      <p className="text-xs text-muted-foreground">Detecção de objetos</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Ativo
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Economia Total
                </CardTitle>
                <CardDescription>
                  Comparação com serviços pagos equivalentes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">YOLO vs Gemini Vision</span>
                    <Badge className="bg-emerald-600">Gratuito</Badge>
                  </div>
                  <p className="text-3xl font-bold text-emerald-600">
                    ${vpsStats?.yoloSavings?.toFixed(2) || '0.00'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {vpsStats?.yoloCalls || 0} detecções × $0.0025/imagem
                  </p>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">MinIO vs Supabase Storage</span>
                    <Badge className="bg-blue-600">Gratuito</Badge>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    ${((vpsStats?.storageUploads || 0) * 0.001).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {vpsStats?.storageUploads || 0} uploads × $0.001/upload
                  </p>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Ollama vs OpenAI</span>
                    <Badge className="bg-purple-600">Gratuito</Badge>
                  </div>
                  <p className="text-3xl font-bold text-purple-600">
                    ${(providerStats.find(p => p.name.includes('Ollama'))?.calls || 0) * 0.002}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {providerStats.find(p => p.name.includes('Ollama'))?.calls || 0} chamadas × $0.002/chamada
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Memory Usage */}
          {vpsStats?.memory && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uso de Memória VPS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">RSS (Total)</p>
                    <p className="text-xl font-bold">
                      {(vpsStats.memory.rss / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Heap Usado</p>
                    <p className="text-xl font-bold">
                      {(vpsStats.memory.heapUsed / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Chamadas Detalhados</CardTitle>
              <CardDescription>
                Últimas {logs.length} chamadas de IA registradas com detalhes completos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary by type */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                {[
                  { type: 'exam', label: 'Exames', icon: <Stethoscope className="h-4 w-4" />, color: 'text-red-500' },
                  { type: 'food', label: 'Alimentos', icon: <Utensils className="h-4 w-4" />, color: 'text-orange-500' },
                  { type: 'image', label: 'Imagens', icon: <Camera className="h-4 w-4" />, color: 'text-blue-500' },
                  { type: 'chat', label: 'Chat', icon: <MessageSquare className="h-4 w-4" />, color: 'text-purple-500' },
                ].map(({ type, label, icon, color }) => {
                  const count = logs.filter(l => getFunctionalityInfo(l).type === type).length;
                  const cost = logs
                    .filter(l => getFunctionalityInfo(l).type === type)
                    .reduce((sum, l) => sum + (l.estimated_cost || 0), 0);
                  return (
                    <div key={type} className="p-2 bg-muted/50 rounded-lg">
                      <div className={`flex items-center gap-1 ${color}`}>
                        {icon}
                        <span className="text-xs font-medium">{label}</span>
                      </div>
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">${cost.toFixed(4)}</p>
                    </div>
                  );
                })}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Provedor</th>
                      <th className="text-left p-2">Funcionalidade</th>
                      <th className="text-left p-2">Tokens</th>
                      <th className="text-left p-2">Custo</th>
                      <th className="text-left p-2">Tempo</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 100).map(log => {
                      const funcInfo = getFunctionalityInfo(log);
                      return (
                        <tr key={log.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
                          </td>
                          <td className="p-2">
                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${funcInfo.color}`}>
                              {funcInfo.icon}
                              <span>{funcInfo.label}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <Badge 
                              variant="outline"
                              style={{ 
                                borderColor: PROVIDER_COLORS[log.provider?.toLowerCase()]?.color || '#6b7280',
                                color: PROVIDER_COLORS[log.provider?.toLowerCase()]?.color || '#6b7280'
                              }}
                            >
                              {log.provider}
                            </Badge>
                          </td>
                          <td className="p-2">
                            <div className="max-w-[200px]">
                              <p className="font-mono text-xs truncate" title={log.method}>
                                {log.method || '-'}
                              </p>
                              {log.functionality && (
                                <p className="text-xs text-muted-foreground truncate" title={log.functionality}>
                                  {log.functionality}
                                </p>
                              )}
                              {log.model_name && (
                                <p className="text-xs text-blue-500 truncate" title={log.model_name}>
                                  {log.model_name}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-2 font-mono">
                            {log.tokens_used?.toLocaleString() || '-'}
                          </td>
                          <td className="p-2">
                            <span className={log.estimated_cost && log.estimated_cost > 0 ? 'text-amber-600 font-medium' : 'text-emerald-600'}>
                              ${log.estimated_cost?.toFixed(6) || '0.00'}
                            </span>
                          </td>
                          <td className="p-2 whitespace-nowrap">
                            {log.response_time_ms ? (
                              <span className={log.response_time_ms > 5000 ? 'text-red-500' : log.response_time_ms > 2000 ? 'text-amber-500' : 'text-green-500'}>
                                {log.response_time_ms}ms
                              </span>
                            ) : '-'}
                          </td>
                          <td className="p-2">
                            {log.success ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <div className="flex items-center gap-1">
                                <XCircle className="h-4 w-4 text-red-500" />
                                {log.error_message && (
                                  <span className="text-xs text-red-500 max-w-[100px] truncate" title={log.error_message}>
                                    {log.error_message}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-muted-foreground">
                          Nenhum log de IA registrado no período selecionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {logs.length > 100 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Mostrando 100 de {logs.length} registros
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AICostDashboard;
