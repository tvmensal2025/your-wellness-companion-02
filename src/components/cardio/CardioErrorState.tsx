/**
 * CardioErrorState Component
 * Estados de erro reutilizáveis para componentes cardio
 * 
 * Validates: Requirements 5.3, 1.3
 */

import React from 'react';
import { WifiOff, RefreshCw, AlertCircle, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type CardioErrorType = 
  | 'not_connected' 
  | 'token_expired' 
  | 'sync_failed' 
  | 'no_data'
  | 'generic';

interface CardioErrorStateProps {
  type: CardioErrorType;
  message?: string;
  onRetry?: () => void;
  onConnect?: () => void;
  className?: string;
}

const ERROR_CONFIG: Record<CardioErrorType, {
  icon: React.ElementType;
  title: string;
  description: string;
  action: 'connect' | 'retry' | 'wait' | 'none';
  iconColor: string;
}> = {
  not_connected: {
    icon: WifiOff,
    title: 'Google Fit não conectado',
    description: 'Conecte o Google Fit para ver seus dados cardíacos',
    action: 'connect',
    iconColor: 'text-muted-foreground',
  },
  token_expired: {
    icon: AlertCircle,
    title: 'Sessão expirada',
    description: 'Reconecte o Google Fit para continuar',
    action: 'connect',
    iconColor: 'text-amber-500',
  },
  sync_failed: {
    icon: RefreshCw,
    title: 'Erro ao sincronizar',
    description: 'Não foi possível obter os dados. Tente novamente.',
    action: 'retry',
    iconColor: 'text-red-500',
  },
  no_data: {
    icon: AlertCircle,
    title: 'Sem dados cardíacos',
    description: 'Use seu smartwatch para registrar dados de frequência cardíaca',
    action: 'wait',
    iconColor: 'text-blue-500',
  },
  generic: {
    icon: AlertCircle,
    title: 'Erro',
    description: 'Ocorreu um erro inesperado',
    action: 'retry',
    iconColor: 'text-red-500',
  },
};

export function CardioErrorState({
  type,
  message,
  onRetry,
  onConnect,
  className,
}: CardioErrorStateProps) {
  const config = ERROR_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className={cn(
      "bg-muted/30 rounded-2xl p-6 border border-border text-center",
      className
    )}>
      <Icon className={cn("w-10 h-10 mx-auto mb-3", config.iconColor)} />
      
      <h4 className="font-medium text-foreground mb-1">
        {config.title}
      </h4>
      
      <p className="text-sm text-muted-foreground mb-4">
        {message || config.description}
      </p>

      {config.action === 'connect' && onConnect && (
        <Button 
          onClick={onConnect}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Link className="w-4 h-4" />
          Conectar Google Fit
        </Button>
      )}

      {config.action === 'retry' && onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </Button>
      )}

      {config.action === 'wait' && (
        <p className="text-xs text-muted-foreground">
          Os dados aparecerão automaticamente quando disponíveis
        </p>
      )}
    </div>
  );
}

/**
 * Determina o tipo de erro baseado na mensagem
 */
export function getErrorType(error: string | null): CardioErrorType {
  if (!error) return 'generic';
  
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes('conecte') || errorLower.includes('não conectado')) {
    return 'not_connected';
  }
  
  if (errorLower.includes('expirad') || errorLower.includes('token')) {
    return 'token_expired';
  }
  
  if (errorLower.includes('sincroniz') || errorLower.includes('sync')) {
    return 'sync_failed';
  }
  
  if (errorLower.includes('nenhum dado') || errorLower.includes('não encontrado')) {
    return 'no_data';
  }
  
  return 'generic';
}

export default CardioErrorState;
