// =====================================================
// VPS API MONITOR COMPONENT
// =====================================================

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Server, 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface ApiCall {
  id: string;
  provider: string;
  method: string;
  functionality?: string;
  response_time_ms: number;
  success: boolean;
  error_message?: string;
  tokens_used?: number;
  estimated_cost?: number;
  created_at: string;
}

interface VpsStats {
  totalCalls: number;
  successRate: number;
  avgResponseTime: number;
  totalCost: number;
  callsByProvider: Record<string, number>;
}

export const VPSApiMonitor: React.FC = () => {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [stats, setStats] = useState<VpsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch recent API calls
      const { data: calls, error } = await supabase
        .from('ai_usage_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const mappedCalls: ApiCall[] = (calls || []).map((c: any) => ({
        id: c.id,
        provider: c.provider,
        method: c.method,
        functionality: c.functionality,
        response_time_ms: c.response_time_ms || 0,
        success: c.success,
        error_message: c.error_message,
        tokens_used: c.tokens_used,
        estimated_cost: c.estimated_cost,
        created_at: c.created_at,
      }));

      setApiCalls(mappedCalls);

      // Calculate stats
      const totalCalls = mappedCalls.length;
      const successfulCalls = mappedCalls.filter(c => c.success).length;
      const successRate = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;
      const avgResponseTime = totalCalls > 0 
        ? mappedCalls.reduce((sum, c) => sum + c.response_time_ms, 0) / totalCalls 
        : 0;
      const totalCost = mappedCalls.reduce((sum, c) => sum + (c.estimated_cost || 0), 0);
      
      const callsByProvider: Record<string, number> = {};
      mappedCalls.forEach(c => {
        callsByProvider[c.provider] = (callsByProvider[c.provider] || 0) + 1;
      });

      setStats({
        totalCalls,
        successRate,
        avgResponseTime,
        totalCost,
        callsByProvider,
      });
    } catch (error) {
      console.error('Error fetching VPS data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getProviderColor = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'bg-emerald-500/10 text-emerald-500';
      case 'google':
        return 'bg-blue-500/10 text-blue-500';
      case 'anthropic':
        return 'bg-orange-500/10 text-orange-500';
      case 'yolo':
        return 'bg-purple-500/10 text-purple-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-muted-foreground">Total Chamadas</span>
            </div>
            <p className="text-2xl font-bold">{stats?.totalCalls || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-muted-foreground">Taxa Sucesso</span>
            </div>
            <p className="text-2xl font-bold">{stats?.successRate.toFixed(1) || 0}%</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-muted-foreground">Tempo Médio</span>
            </div>
            <p className="text-2xl font-bold">{stats?.avgResponseTime.toFixed(0) || 0}ms</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-muted-foreground">Custo Total</span>
            </div>
            <p className="text-2xl font-bold">${stats?.totalCost.toFixed(3) || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Provider Distribution */}
      {stats?.callsByProvider && Object.keys(stats.callsByProvider).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Server className="w-4 h-4" />
              Chamadas por Provider
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.callsByProvider).map(([provider, count]) => (
                <Badge 
                  key={provider} 
                  variant="outline"
                  className={cn("text-xs", getProviderColor(provider))}
                >
                  {provider}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Calls */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Chamadas Recentes</CardTitle>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={fetchData}
              disabled={refreshing}
            >
              <RefreshCw className={cn("w-4 h-4 mr-1", refreshing && "animate-spin")} />
              Atualizar
            </Button>
          </div>
          <CardDescription>
            Últimas {apiCalls.length} chamadas de API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2">
              {apiCalls.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma chamada registrada
                </p>
              ) : (
                apiCalls.map((call) => (
                  <div 
                    key={call.id} 
                    className={cn(
                      "p-3 rounded-lg border",
                      call.success 
                        ? "bg-muted/30 border-border/50" 
                        : "bg-red-500/5 border-red-500/20"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {call.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        )}
                        <Badge 
                          variant="outline" 
                          className={cn("text-[10px]", getProviderColor(call.provider))}
                        >
                          {call.provider}
                        </Badge>
                        <span className="text-xs font-medium">{call.method}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(call.created_at).toLocaleString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {call.response_time_ms}ms
                      </span>
                      {call.tokens_used && (
                        <span>🪙 {call.tokens_used} tokens</span>
                      )}
                      {call.estimated_cost && (
                        <span>💰 ${call.estimated_cost.toFixed(4)}</span>
                      )}
                      {call.functionality && (
                        <span className="text-primary">{call.functionality}</span>
                      )}
                    </div>
                    
                    {call.error_message && (
                      <p className="text-[10px] text-red-500 mt-1 truncate">
                        {call.error_message}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default VPSApiMonitor;
