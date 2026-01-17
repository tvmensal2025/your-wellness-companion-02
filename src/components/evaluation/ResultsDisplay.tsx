import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Save,
  FileText,
  Heart
} from 'lucide-react';

interface CalculatedMetrics {
  bodyFatPercentage: number;
  fatMass: number;
  leanMass: number;
  muscleMass: number;
  bmi: number;
  bmr: number;
  waistToHeightRatio: number;
  waistToHipRatio: number;
  muscleToFatRatio: number;
  riskLevel: 'low' | 'moderate' | 'high';
}

interface ResultsDisplayProps {
  metrics: CalculatedMetrics | null;
  onSave: () => void;
  onExportPDF: () => void;
  loading?: boolean;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  metrics,
  onSave,
  onExportPDF,
  loading = false
}) => {
  if (!metrics) {
    return (
      <Alert>
        <AlertDescription>
          Preencha as medidas e clique em "Calcular Métricas" para ver os resultados.
        </AlertDescription>
      </Alert>
    );
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-500';
      case 'moderate': return 'text-yellow-500';
      case 'high': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-5 w-5" />;
      case 'moderate': return <AlertTriangle className="h-5 w-5" />;
      case 'high': return <AlertTriangle className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Nível de Risco */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Nível de Risco
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`flex items-center gap-2 ${getRiskColor(metrics.riskLevel)}`}>
            {getRiskIcon(metrics.riskLevel)}
            <span className="text-lg font-semibold capitalize">
              {metrics.riskLevel === 'low' && 'Baixo'}
              {metrics.riskLevel === 'moderate' && 'Moderado'}
              {metrics.riskLevel === 'high' && 'Alto'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">IMC</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.bmi.toFixed(1)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">% Gordura</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.bodyFatPercentage.toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Massa Magra</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{metrics.leanMass.toFixed(1)} kg</p>
          </CardContent>
        </Card>
      </div>

      {/* Métricas Secundárias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Métricas Detalhadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Massa Gorda</p>
              <p className="text-lg font-semibold">{metrics.fatMass.toFixed(1)} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Massa Muscular</p>
              <p className="text-lg font-semibold">{metrics.muscleMass.toFixed(1)} kg</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">TMB</p>
              <p className="text-lg font-semibold">{metrics.bmr.toFixed(0)} kcal</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Razão Cintura/Altura</p>
              <p className="text-lg font-semibold">{metrics.waistToHeightRatio.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Razão Cintura/Quadril</p>
              <p className="text-lg font-semibold">{metrics.waistToHipRatio.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Razão Músculo/Gordura</p>
              <p className="text-lg font-semibold">{metrics.muscleToFatRatio.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações */}
      <div className="flex gap-4">
        <Button onClick={onSave} disabled={loading} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          Salvar Avaliação
        </Button>
        <Button onClick={onExportPDF} disabled={loading} variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};
