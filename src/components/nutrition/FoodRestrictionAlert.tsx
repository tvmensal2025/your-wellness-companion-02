import React from 'react';
import { AlertTriangle, Ban, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FoodRestrictionAlertProps {
  foodName: string;
  restrictionType: 'forbidden' | 'problematic' | 'intolerance';
  onDismiss?: () => void;
  className?: string;
}

const alertConfig = {
  forbidden: {
    icon: Ban,
    title: 'Alimento Proibido',
    description: 'Este alimento está na sua lista de alimentos proibidos da anamnese.',
    variant: 'destructive' as const,
    bgClass: 'bg-destructive/10 border-destructive/50',
  },
  problematic: {
    icon: AlertTriangle,
    title: 'Atenção',
    description: 'Este alimento pode causar desconforto. Considere alternativas.',
    variant: 'default' as const,
    bgClass: 'bg-amber-500/10 border-amber-500/50',
  },
  intolerance: {
    icon: AlertCircle,
    title: 'Intolerância Detectada',
    description: 'Você registrou intolerância a este alimento.',
    variant: 'default' as const,
    bgClass: 'bg-orange-500/10 border-orange-500/50',
  },
};

export const FoodRestrictionAlert: React.FC<FoodRestrictionAlertProps> = ({
  foodName,
  restrictionType,
  onDismiss,
  className,
}) => {
  const config = alertConfig[restrictionType];
  const Icon = config.icon;

  return (
    <Alert className={cn(config.bgClass, 'animate-in slide-in-from-top-2', className)}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        {config.title}
        <Badge variant={config.variant === 'destructive' ? 'destructive' : 'outline'}>
          {foodName}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-1">
        {config.description}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-xs underline hover:no-underline"
          >
            Entendi
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default FoodRestrictionAlert;
