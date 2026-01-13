// =====================================================
// HEALTH ORACLE PANEL COMPONENT
// =====================================================
// Painel de previsões de saúde
// Requirements: 3.1, 3.2
// =====================================================

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Eye, 
  AlertTriangle, 
  TrendingDown,
  TrendingUp,
  ChevronRight,
  Lightbulb,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { useHealthOracle } from '@/hooks/dr-vital/useHealthOracle';
import type { HealthPrediction, RiskFactor } from '@/types/dr-vital-revolution';

// =====================================================
// RISK LEVEL INDICATOR
// =====================================================

interface RiskLevelIndicatorProps {
  probability: number;
  size?: 'sm' | 'md' | 'lg';
}

function RiskLevelIndicator({ probability, size = 'md' }: RiskLevelIndicatorProps) {
  const getColor = (prob: number) => {
    if (prob >= 60) return 'text-red-500 bg-red-500';
    if (prob >= 40) return 'text-orange-500 bg-orange-500';
    if (prob >= 20) return 'text-yellow-500 bg-yellow-500';
    return 'text-green-500 bg-green-500';
  };

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-20 h-20 text-2xl',
  };

  const colorClass = getColor(probability);

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-bold',
      sizeClasses[size],
      colorClass.split(' ')[0],
      'bg-current/10'
    )}>
      {probability}%
    </div>
  );
}

// =====================================================
// RISK FACTOR ITEM
// =====================================================

interface RiskFactorItemProps {
  factor: RiskFactor;
}

function RiskFactorItem({ factor }: RiskFactorItemProps) {
  const impactColors = {
    high: 'text-red-500 bg-red-500/10',
    medium: 'text-orange-500 bg-orange-500/10',
    low: 'text-yellow-500 bg-yellow-500/10',
  };

  const impactLabels = {
    high: 'Alto',
    medium: 'Médio',
    low: 'Baixo',
  };

  const progress = Math.min(100, (factor.currentValue / factor.idealValue) * 100);
  const isAboveIdeal = factor.currentValue > factor.idealValue;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{factor.name}</span>
          <span className={cn(
            'text-xs px-2 py-0.5 rounded-full',
            impactColors[factor.impact]
          )}>
            {impactLabels[factor.impact]}
          </span>
        </div>
        <div className="text-right text-sm">
          <span className={isAboveIdeal ? 'text-red-500' : 'text-foreground'}>
            {factor.currentValue}
          </span>
          <span className="text-muted-foreground"> / {factor.idealValue} {factor.unit}</span>
        </div>
      </div>
      
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full rounded-full transition-all',
            isAboveIdeal ? 'bg-red-500' : 'bg-green-500'
          )}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
        {/* Ideal marker */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-foreground"
          style={{ left: '100%', transform: 'translateX(-50%)' }}
        />
      </div>
    </div>
  );
}

// =====================================================
// PREDICTION CARD
// =====================================================

interface PredictionCardProps {
  prediction: HealthPrediction;
  onViewDetails?: () => void;
}

function PredictionCard({ prediction, onViewDetails }: PredictionCardProps) {
  const timeframeLabels = {
    '3_months': '3 meses',
    '6_months': '6 meses',
    '1_year': '1 ano',
  };

  const riskTypeLabels: Record<string, string> = {
    diabetes_type2: 'Diabetes Tipo 2',
    hypertension: 'Hipertensão',
    cardiovascular: 'Doença Cardiovascular',
    obesity: 'Obesidade',
    metabolic_syndrome: 'Síndrome Metabólica',
  };

  const getRiskLevel = (prob: number) => {
    if (prob >= 60) return { label: 'Alto', color: 'text-red-500', bg: 'bg-red-500/10' };
    if (prob >= 40) return { label: 'Moderado', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    if (prob >= 20) return { label: 'Baixo', color: 'text-yellow-500', bg: 'bg-yellow-500/10' };
    return { label: 'Mínimo', color: 'text-green-500', bg: 'bg-green-500/10' };
  };

  const riskLevel = getRiskLevel(prediction.probability);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-4">
          <RiskLevelIndicator probability={prediction.probability} />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold">
              {riskTypeLabels[prediction.riskType] || prediction.riskType}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium',
                riskLevel.bg,
                riskLevel.color
              )}>
                Risco {riskLevel.label}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {timeframeLabels[prediction.timeframe]}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        {prediction.factors.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Fatores de Risco</h4>
            {prediction.factors.slice(0, 3).map((factor, index) => (
              <RiskFactorItem key={index} factor={factor} />
            ))}
          </div>
        )}

        {/* Recommendations */}
        {prediction.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Lightbulb className="w-4 h-4" />
              Recomendações
            </h4>
            <ul className="space-y-1">
              {prediction.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* View Details */}
        {onViewDetails && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full"
            onClick={onViewDetails}
          >
            Ver detalhes
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface HealthOraclePanelProps {
  className?: string;
  compact?: boolean;
}

export function HealthOraclePanel({ className, compact = false }: HealthOraclePanelProps) {
  const {
    predictions,
    highRiskPredictions,
    moderateRiskPredictions,
    lowRiskPredictions,
    overallRiskLevel,
    isLoading,
    isRecalculating,
    recalculate,
    error,
  } = useHealthOracle();

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
            <div className="h-32 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium">Erro ao carregar previsões</h3>
          <p className="text-sm text-muted-foreground">
            Não foi possível calcular suas previsões de saúde.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => recalculate()}
          >
            Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium">Nenhuma previsão disponível</h3>
          <p className="text-sm text-muted-foreground">
            Continue registrando seus dados para receber previsões personalizadas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const overallRiskColors = {
    high: 'text-red-500 bg-red-500/10',
    moderate: 'text-orange-500 bg-orange-500/10',
    low: 'text-yellow-500 bg-yellow-500/10',
    minimal: 'text-green-500 bg-green-500/10',
    unknown: 'text-muted-foreground bg-muted',
  };

  const overallRiskLabels = {
    high: 'Alto',
    moderate: 'Moderado',
    low: 'Baixo',
    minimal: 'Mínimo',
    unknown: 'Desconhecido',
  };

  if (compact) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Health Oracle</p>
                <p className="text-xs text-muted-foreground">
                  {predictions.length} previsões ativas
                </p>
              </div>
            </div>
            <span className={cn(
              'text-sm px-3 py-1 rounded-full font-medium',
              overallRiskColors[overallRiskLevel]
            )}>
              Risco {overallRiskLabels[overallRiskLevel]}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-primary" />
            Health Oracle
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => recalculate()}
            disabled={isRecalculating}
          >
            <RefreshCw className={cn('w-4 h-4', isRecalculating && 'animate-spin')} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Risk Summary */}
        <div className={cn(
          'p-4 rounded-lg',
          overallRiskColors[overallRiskLevel]
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Risco Geral</p>
              <p className="text-2xl font-bold">
                {overallRiskLabels[overallRiskLevel]}
              </p>
            </div>
            {overallRiskLevel === 'high' || overallRiskLevel === 'moderate' ? (
              <TrendingUp className="w-8 h-8 opacity-50" />
            ) : (
              <TrendingDown className="w-8 h-8 opacity-50" />
            )}
          </div>
        </div>

        {/* High Risk Predictions */}
        {highRiskPredictions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              Atenção Necessária ({highRiskPredictions.length})
            </h4>
            {highRiskPredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        )}

        {/* Moderate Risk Predictions */}
        {moderateRiskPredictions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-orange-500">
              Risco Moderado ({moderateRiskPredictions.length})
            </h4>
            {moderateRiskPredictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        )}

        {/* Low Risk Predictions */}
        {lowRiskPredictions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-green-500">
              Risco Baixo ({lowRiskPredictions.length})
            </h4>
            {lowRiskPredictions.slice(0, 2).map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        )}

        {/* Last Updated */}
        {predictions[0]?.calculatedAt && (
          <p className="text-xs text-muted-foreground text-center">
            Atualizado em {new Date(predictions[0].calculatedAt).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default HealthOraclePanel;
