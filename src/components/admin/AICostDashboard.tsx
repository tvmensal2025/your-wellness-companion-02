import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
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
  Sparkles
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

export function AICostDashboard() {
  const [logs, setLogs] = useState<AIUsageLog[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7');
  const [selectedTab, setSelectedTab] = useState('overview');

  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, [period]);

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="providers">Por Provedor</TabsTrigger>
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

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Chamadas</CardTitle>
              <CardDescription>
                Últimas {logs.length} chamadas de IA registradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Data</th>
                      <th className="text-left p-2">Provedor</th>
                      <th className="text-left p-2">Método</th>
                      <th className="text-left p-2">Tokens</th>
                      <th className="text-left p-2">Custo</th>
                      <th className="text-left p-2">Tempo</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.slice(0, 50).map(log => (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 text-muted-foreground">
                          {format(new Date(log.created_at), "dd/MM HH:mm", { locale: ptBR })}
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
                        <td className="p-2 font-mono text-xs">{log.method}</td>
                        <td className="p-2">{log.tokens_used?.toLocaleString() || '-'}</td>
                        <td className="p-2">${log.estimated_cost?.toFixed(6) || '0.00'}</td>
                        <td className="p-2">{log.response_time_ms ? `${log.response_time_ms}ms` : '-'}</td>
                        <td className="p-2">
                          {log.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </td>
                      </tr>
                    ))}
                    {logs.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                          Nenhum log de IA registrado no período selecionado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AICostDashboard;
