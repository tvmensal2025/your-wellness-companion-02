import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Trash2,
  Eye,
  GitCompare
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Evaluation {
  id: string;
  user_id: string;
  evaluation_date: string;
  weight_kg: number;
  body_fat_percentage: number;
  lean_mass_kg: number;
  muscle_mass_kg: number;
  bmi: number;
  waist_to_height_ratio: number;
  waist_to_hip_ratio: number;
  risk_level: 'low' | 'moderate' | 'high';
}

interface EvaluationHistoryProps {
  evaluations: Evaluation[];
  selectedEvaluation: Evaluation | null;
  onEvaluationSelect: (evaluation: Evaluation) => void;
  onCompare: (evaluations: Evaluation[]) => void;
  onDelete?: (evaluationId: string) => void;
  timeRange: 'week' | 'month' | 'quarter';
  loading?: boolean;
}

export const EvaluationHistory: React.FC<EvaluationHistoryProps> = ({
  evaluations,
  selectedEvaluation,
  onEvaluationSelect,
  onCompare,
  onDelete,
  timeRange,
  loading = false
}) => {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low': return 'Baixo';
      case 'moderate': return 'Moderado';
      case 'high': return 'Alto';
      default: return 'N/A';
    }
  };

  const getTrend = (current: number, previous: number) => {
    if (!previous) return null;
    const diff = current - previous;
    const percentage = ((diff / previous) * 100).toFixed(1);
    
    if (diff > 0) {
      return { icon: TrendingUp, color: 'text-red-500', value: `+${percentage}%` };
    } else if (diff < 0) {
      return { icon: TrendingDown, color: 'text-green-500', value: `${percentage}%` };
    }
    return null;
  };

  const handleCompareToggle = (evaluationId: string) => {
    if (selectedForCompare.includes(evaluationId)) {
      setSelectedForCompare(selectedForCompare.filter(id => id !== evaluationId));
    } else if (selectedForCompare.length < 3) {
      setSelectedForCompare([...selectedForCompare, evaluationId]);
    }
  };

  const handleCompare = () => {
    const evaluationsToCompare = evaluations.filter(e => 
      selectedForCompare.includes(e.id)
    );
    onCompare(evaluationsToCompare);
    setCompareMode(false);
    setSelectedForCompare([]);
  };

  if (evaluations.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          Nenhuma avaliação encontrada para o período selecionado.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header com ações */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Histórico de Avaliações ({evaluations.length})
        </h3>
        <div className="flex gap-2">
          {compareMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setCompareMode(false);
                  setSelectedForCompare([]);
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleCompare}
                disabled={selectedForCompare.length < 2}
              >
                <GitCompare className="h-4 w-4 mr-2" />
                Comparar ({selectedForCompare.length})
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompareMode(true)}
              disabled={evaluations.length < 2}
            >
              <GitCompare className="h-4 w-4 mr-2" />
              Modo Comparação
            </Button>
          )}
        </div>
      </div>

      {/* Lista de avaliações */}
      <div className="space-y-3">
        {evaluations.map((evaluation, index) => {
          const previousEvaluation = evaluations[index + 1];
          const weightTrend = previousEvaluation 
            ? getTrend(evaluation.weight_kg, previousEvaluation.weight_kg)
            : null;
          const fatTrend = previousEvaluation
            ? getTrend(evaluation.body_fat_percentage, previousEvaluation.body_fat_percentage)
            : null;

          const isSelected = selectedEvaluation?.id === evaluation.id;
          const isSelectedForCompare = selectedForCompare.includes(evaluation.id);

          return (
            <Card 
              key={evaluation.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              } ${
                isSelectedForCompare ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => !compareMode && onEvaluationSelect(evaluation)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  {/* Info principal */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">
                        {format(new Date(evaluation.evaluation_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </span>
                      <Badge className={getRiskColor(evaluation.risk_level)}>
                        {getRiskLabel(evaluation.risk_level)}
                      </Badge>
                    </div>

                    {/* Métricas principais */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Peso</p>
                        <div className="flex items-center gap-1">
                          <p className="font-semibold">{evaluation.weight_kg.toFixed(1)} kg</p>
                          {weightTrend && (
                            <span className={`flex items-center text-xs ${weightTrend.color}`}>
                              <weightTrend.icon className="h-3 w-3" />
                              {weightTrend.value}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground">% Gordura</p>
                        <div className="flex items-center gap-1">
                          <p className="font-semibold">{evaluation.body_fat_percentage.toFixed(1)}%</p>
                          {fatTrend && (
                            <span className={`flex items-center text-xs ${fatTrend.color}`}>
                              <fatTrend.icon className="h-3 w-3" />
                              {fatTrend.value}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-muted-foreground">IMC</p>
                        <p className="font-semibold">{evaluation.bmi.toFixed(1)}</p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">Massa Magra</p>
                        <p className="font-semibold">{evaluation.lean_mass_kg.toFixed(1)} kg</p>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex flex-col gap-2 ml-4">
                    {compareMode ? (
                      <Button
                        variant={isSelectedForCompare ? "default" : "outline"}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompareToggle(evaluation.id);
                        }}
                        disabled={!isSelectedForCompare && selectedForCompare.length >= 3}
                      >
                        {isSelectedForCompare ? 'Selecionado' : 'Selecionar'}
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEvaluationSelect(evaluation);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Deseja realmente excluir esta avaliação?')) {
                                onDelete(evaluation.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info sobre comparação */}
      {compareMode && (
        <Alert>
          <AlertDescription>
            Selecione de 2 a 3 avaliações para comparar. Atualmente: {selectedForCompare.length} selecionadas.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
