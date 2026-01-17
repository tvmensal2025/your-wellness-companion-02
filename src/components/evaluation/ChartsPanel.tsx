import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart,
  Activity
} from 'lucide-react';
import ReactApexChart from 'react-apexcharts';
import { EvaluationComparison } from '@/components/charts/EvaluationComparison';
import MuscleCompositionPanel from '@/components/charts/MuscleCompositionPanel';
import RiskGauge from '@/components/charts/RiskGauge';
import CompositionDonut from '@/components/charts/CompositionDonut';

interface ChartDataPoint {
  date: string;
  weight: number;
  bodyFat: number;
  leanMass: number;
  muscleMass: number;
  bmi: number;
  waistRatio: number;
}

interface Evaluation {
  id: string;
  evaluation_date: string;
  weight_kg: number;
  body_fat_percentage: number;
  lean_mass_kg: number;
  muscle_mass_kg: number;
  fat_mass_kg: number;
  bmi: number;
  risk_level: 'low' | 'moderate' | 'high';
}

interface ChartsPanelProps {
  chartData: ChartDataPoint[];
  selectedEvaluation: Evaluation | null;
  showComparison: boolean;
  evaluationsToCompare?: Evaluation[];
}

export const ChartsPanel: React.FC<ChartsPanelProps> = ({
  chartData,
  selectedEvaluation,
  showComparison,
  evaluationsToCompare = []
}) => {
  if (chartData.length === 0 && !selectedEvaluation) {
    return (
      <Alert>
        <AlertDescription>
          Nenhum dado disponível para exibir gráficos. Realize uma avaliação primeiro.
        </AlertDescription>
      </Alert>
    );
  }

  // Configuração do gráfico de evolução de peso
  const weightChartOptions = {
    chart: {
      type: 'line' as const,
      toolbar: { show: true },
      background: 'transparent'
    },
    theme: {
      mode: 'dark' as const
    },
    stroke: {
      curve: 'smooth' as const,
      width: 3
    },
    xaxis: {
      categories: chartData.map(d => d.date),
      labels: {
        style: {
          colors: '#94a3b8'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8'
        },
        formatter: (value: number) => `${value.toFixed(1)} kg`
      }
    },
    colors: ['#22c55e'],
    grid: {
      borderColor: '#334155'
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const weightChartSeries = [{
    name: 'Peso',
    data: chartData.map(d => d.weight)
  }];

  // Configuração do gráfico de composição corporal
  const compositionChartOptions = {
    chart: {
      type: 'line' as const,
      toolbar: { show: true },
      background: 'transparent'
    },
    theme: {
      mode: 'dark' as const
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    xaxis: {
      categories: chartData.map(d => d.date),
      labels: {
        style: {
          colors: '#94a3b8'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8'
        }
      }
    },
    colors: ['#ef4444', '#22c55e', '#3b82f6'],
    grid: {
      borderColor: '#334155'
    },
    legend: {
      labels: {
        colors: '#94a3b8'
      }
    },
    tooltip: {
      theme: 'dark'
    }
  };

  const compositionChartSeries = [
    {
      name: '% Gordura',
      data: chartData.map(d => d.bodyFat)
    },
    {
      name: 'Massa Magra (kg)',
      data: chartData.map(d => d.leanMass)
    },
    {
      name: 'Massa Muscular (kg)',
      data: chartData.map(d => d.muscleMass)
    }
  ];

  // Configuração do gráfico de IMC
  const bmiChartOptions = {
    chart: {
      type: 'area' as const,
      toolbar: { show: true },
      background: 'transparent'
    },
    theme: {
      mode: 'dark' as const
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3
      }
    },
    xaxis: {
      categories: chartData.map(d => d.date),
      labels: {
        style: {
          colors: '#94a3b8'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#94a3b8'
        }
      }
    },
    colors: ['#f59e0b'],
    grid: {
      borderColor: '#334155'
    },
    tooltip: {
      theme: 'dark'
    },
    annotations: {
      yaxis: [
        {
          y: 18.5,
          borderColor: '#3b82f6',
          label: {
            text: 'Abaixo do peso',
            style: {
              color: '#fff',
              background: '#3b82f6'
            }
          }
        },
        {
          y: 25,
          borderColor: '#22c55e',
          label: {
            text: 'Peso normal',
            style: {
              color: '#fff',
              background: '#22c55e'
            }
          }
        },
        {
          y: 30,
          borderColor: '#f59e0b',
          label: {
            text: 'Sobrepeso',
            style: {
              color: '#fff',
              background: '#f59e0b'
            }
          }
        }
      ]
    }
  };

  const bmiChartSeries = [{
    name: 'IMC',
    data: chartData.map(d => d.bmi)
  }];

  return (
    <div className="space-y-6">
      {/* Comparação de avaliações */}
      {showComparison && evaluationsToCompare.length >= 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Comparação de Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EvaluationComparison evaluations={evaluationsToCompare} />
          </CardContent>
        </Card>
      )}

      {/* Avaliação atual - Composição e Risco */}
      {selectedEvaluation && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Composição Corporal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CompositionDonut
                fatMass={selectedEvaluation.fat_mass_kg}
                muscleMass={selectedEvaluation.muscle_mass_kg}
                leanMass={selectedEvaluation.lean_mass_kg}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Nível de Risco
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RiskGauge
                riskLevel={selectedEvaluation.risk_level}
                bmi={selectedEvaluation.bmi}
                waistToHeightRatio={selectedEvaluation.body_fat_percentage / 100}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos de evolução */}
      {chartData.length > 0 && (
        <Tabs defaultValue="weight" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="weight">
              <TrendingUp className="h-4 w-4 mr-2" />
              Peso
            </TabsTrigger>
            <TabsTrigger value="composition">
              <BarChart3 className="h-4 w-4 mr-2" />
              Composição
            </TabsTrigger>
            <TabsTrigger value="bmi">
              <Activity className="h-4 w-4 mr-2" />
              IMC
            </TabsTrigger>
          </TabsList>

          <TabsContent value="weight">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Peso</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={weightChartOptions}
                  series={weightChartSeries}
                  type="line"
                  height={350}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="composition">
            <Card>
              <CardHeader>
                <CardTitle>Evolução da Composição Corporal</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={compositionChartOptions}
                  series={compositionChartSeries}
                  type="line"
                  height={350}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bmi">
            <Card>
              <CardHeader>
                <CardTitle>Evolução do IMC</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={bmiChartOptions}
                  series={bmiChartSeries}
                  type="area"
                  height={350}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Painel de composição muscular */}
      {selectedEvaluation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Análise Muscular Detalhada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MuscleCompositionPanel
              muscleMass={selectedEvaluation.muscle_mass_kg}
              fatMass={selectedEvaluation.fat_mass_kg}
              leanMass={selectedEvaluation.lean_mass_kg}
              weight={selectedEvaluation.weight_kg}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
