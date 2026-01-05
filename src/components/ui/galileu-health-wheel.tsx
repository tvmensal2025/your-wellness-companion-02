import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HealthWheel } from '@/components/ui/health-wheel';
import { SymptomEvolutionChart } from '@/components/ui/symptom-evolution-chart';

interface HealthSystemData {
  systemName: string;
  score: number;
  color: string;
  icon: string;
  symptomsCount: number;
  symptoms: string[];
}

interface EvolutionData {
  month: string;
  totalScore: number;
  [key: string]: number | string;
}

interface GalileuHealthWheelProps {
  data: HealthSystemData[];
  totalScore: number;
  evolutionData?: EvolutionData[];
  title?: string;
  className?: string;
  size?: number;
  showHealthWheel?: boolean;
  showEvolutionChart?: boolean;
}

export const GalileuHealthWheel: React.FC<GalileuHealthWheelProps> = ({
  data,
  totalScore,
  evolutionData = [],
  title = "Mapeamento de Sintomas",
  className = "",
  size = 450,
  showHealthWheel = true,
  showEvolutionChart = true
}) => {
  // Função para gerar feedback simples baseado no score
  const getSimpleFeedback = (systemName: string, score: number) => {
    if (score < 4) {
      return `Requer atenção imediata. Considere buscar apoio profissional.`;
    }
    if (score < 7) {
      return `Progresso possível com pequenos ajustes no dia a dia.`;
    }
    return `Parabéns! Continue mantendo os bons hábitos.`;
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Layout responsivo em grid */}
      <div className="space-y-6">
        
        {/* Roda da Vida/Saúde */}
        {showHealthWheel && (
          <div className="w-full">
            <HealthWheel 
              data={data} 
              totalScore={totalScore} 
              title={title}
              size={size}
            />
          </div>
        )}

        {/* Evolução dos Sintomas */}
        <div className="w-full">
          <SymptomEvolutionChart />
        </div>

        {/* Gráfico de Evolução Mensal */}
        {showEvolutionChart && (
          <Card className="bg-gray-900 text-white border-gray-700">
            <CardHeader className="text-center p-4">
              <CardTitle className="text-white text-lg flex items-center justify-center gap-2">
                📈 Evolução Mensal
              </CardTitle>
              <p className="text-xs text-gray-400">
                Acompanhe sua evolução ao longo do tempo
              </p>
            </CardHeader>
            <CardContent className="p-4">
              {evolutionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={evolutionData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9CA3AF"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={10}
                      domain={[0, 10]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="totalScore" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Score Total"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                    {data.slice(0, 3).map((system) => (
                      <Line
                        key={system.systemName}
                        type="monotone"
                        dataKey={system.systemName.toLowerCase().replace(/ /g, '_')}
                        stroke={system.color}
                        strokeWidth={2}
                        name={system.systemName}
                        dot={{ fill: system.color, strokeWidth: 1, r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart 
                    data={[
                      { month: 'Jan', totalScore: Math.round(Number(totalScore) || 0) * 0.7 },
                      { month: 'Fev', totalScore: Math.round(Number(totalScore) || 0) * 0.8 },
                      { month: 'Mar', totalScore: Math.round(Number(totalScore) || 0) * 0.9 },
                      { month: 'Abr', totalScore: Math.round(Number(totalScore) || 0) },
                    ]}
                    margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9CA3AF"
                      fontSize={10}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={10}
                      domain={[0, 10]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="totalScore" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Score Total"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                      strokeDasharray="5,5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {evolutionData.length === 0 && (
                <div className="text-center mt-2 p-3 bg-gray-800 rounded-lg">
                  <p className="text-gray-400 text-xs">
                    📊 Faça mais avaliações para ver sua evolução real
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GalileuHealthWheel;