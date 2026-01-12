/**
 * WhatsApp Provider Panel
 * Admin component for toggling between Evolution and Whapi providers
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, MessageSquare, Zap, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useWhatsAppProviderConfig,
  useWhatsAppProviderStats,
  useWhatsAppHealthCheck,
  WhatsAppProvider,
} from '@/hooks/useWhatsAppProviderConfig';

// ============================================
// Provider Card Component
// ============================================

interface ProviderCardProps {
  provider: WhatsAppProvider;
  name: string;
  description: string;
  isActive: boolean;
  healthStatus?: 'healthy' | 'unhealthy' | 'unknown';
  lastHealthCheck?: string;
  onActivate: () => void;
  isToggling: boolean;
  onCheckHealth: () => void;
  isCheckingHealth: boolean;
}


function ProviderCard({
  provider,
  name,
  description,
  isActive,
  healthStatus,
  lastHealthCheck,
  onActivate,
  isToggling,
  onCheckHealth,
  isCheckingHealth,
}: ProviderCardProps) {
  const { data: stats, isLoading: statsLoading } = useWhatsAppProviderStats(provider);
  
  const getHealthIcon = () => {
    switch (healthStatus) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'unhealthy':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getHealthBadge = () => {
    switch (healthStatus) {
      case 'healthy':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Conectado</Badge>;
      case 'unhealthy':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Desconectado</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Desconhecido</Badge>;
    }
  };
  
  return (
    <Card className={cn(
      "relative transition-all duration-200",
      isActive && "ring-2 ring-primary border-primary"
    )}>
      {isActive && (
        <div className="absolute -top-2 -right-2">
          <Badge className="bg-primary">Ativo</Badge>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {provider === 'evolution' ? (
              <MessageSquare className="h-5 w-5 text-blue-500" />
            ) : (
              <Zap className="h-5 w-5 text-purple-500" />
            )}
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          {getHealthBadge()}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Mensagens (24h)</p>
            <p className="text-lg font-semibold">
              {statsLoading ? '...' : stats?.messagesLast24h || 0}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Taxa de Sucesso</p>
            <p className="text-lg font-semibold">
              {statsLoading ? '...' : `${stats?.successRate.toFixed(1) || 100}%`}
            </p>
          </div>
        </div>
        
        {/* Health Check */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {getHealthIcon()}
            <span className="text-muted-foreground">
              {lastHealthCheck 
                ? `Verificado: ${new Date(lastHealthCheck).toLocaleTimeString('pt-BR')}`
                : 'Não verificado'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCheckHealth}
            disabled={isCheckingHealth}
          >
            {isCheckingHealth ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {/* Activate Button */}
        {!isActive && (
          <Button
            className="w-full"
            onClick={onActivate}
            disabled={isToggling}
          >
            {isToggling ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ativando...
              </>
            ) : (
              'Ativar este Provider'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}


// ============================================
// Main Panel Component
// ============================================

export function WhatsAppProviderPanel() {
  const { config, isLoading, toggleProvider, isToggling, refetch } = useWhatsAppProviderConfig();
  const { checkHealth, isChecking } = useWhatsAppHealthCheck();
  const [checkingProvider, setCheckingProvider] = useState<WhatsAppProvider | null>(null);
  
  const handleCheckHealth = (provider: WhatsAppProvider) => {
    setCheckingProvider(provider);
    checkHealth(provider, {
      onSettled: () => setCheckingProvider(null),
    });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">WhatsApp Provider</h3>
          <p className="text-sm text-muted-foreground">
            Alterne entre Evolution API e Whapi Cloud
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>
      
      {/* Provider Toggle Info */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            <div className="text-sm">
              <p className="font-medium">Apenas um provider pode estar ativo por vez</p>
              <p className="text-muted-foreground">
                Ao ativar um provider, o outro será automaticamente desativado.
                Mensagens em fila serão processadas pelo novo provider.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Provider Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <ProviderCard
          provider="evolution"
          name="Evolution API"
          description="Self-hosted, maior controle, sem botões nativos"
          isActive={config?.activeProvider === 'evolution'}
          healthStatus={config?.evolutionHealthStatus}
          lastHealthCheck={config?.evolutionLastHealthCheck}
          onActivate={() => toggleProvider('evolution')}
          isToggling={isToggling}
          onCheckHealth={() => handleCheckHealth('evolution')}
          isCheckingHealth={isChecking && checkingProvider === 'evolution'}
        />
        
        <ProviderCard
          provider="whapi"
          name="Whapi Cloud"
          description="Cloud, botões interativos, carrossel, listas"
          isActive={config?.activeProvider === 'whapi'}
          healthStatus={config?.whapiHealthStatus}
          lastHealthCheck={config?.whapiLastHealthCheck}
          onActivate={() => toggleProvider('whapi')}
          isToggling={isToggling}
          onCheckHealth={() => handleCheckHealth('whapi')}
          isCheckingHealth={isChecking && checkingProvider === 'whapi'}
        />
      </div>
      
      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comparação de Recursos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="font-medium">Recurso</div>
            <div className="font-medium text-center">Evolution</div>
            <div className="font-medium text-center">Whapi</div>
            
            <div>Texto</div>
            <div className="text-center text-green-500">✓</div>
            <div className="text-center text-green-500">✓</div>
            
            <div>Imagens</div>
            <div className="text-center text-green-500">✓</div>
            <div className="text-center text-green-500">✓</div>
            
            <div>Documentos</div>
            <div className="text-center text-green-500">✓</div>
            <div className="text-center text-green-500">✓</div>
            
            <div>Botões Interativos</div>
            <div className="text-center text-yellow-500">Texto</div>
            <div className="text-center text-green-500">✓ Nativo</div>
            
            <div>Listas</div>
            <div className="text-center text-yellow-500">Texto</div>
            <div className="text-center text-green-500">✓ Nativo</div>
            
            <div>Carrossel</div>
            <div className="text-center text-red-500">✗</div>
            <div className="text-center text-green-500">✓</div>
            
            <div>Self-hosted</div>
            <div className="text-center text-green-500">✓</div>
            <div className="text-center text-red-500">✗</div>
            
            <div>Custo</div>
            <div className="text-center">Servidor</div>
            <div className="text-center">Por msg</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WhatsAppProviderPanel;
