// =====================================================
// WHAT-IF SIMULATOR COMPONENT
// =====================================================
// Simulador de cenários "E se..."
// Requirements: 3.3, 3.4
// =====================================================

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  RefreshCw,
  TrendingDown,
  TrendingUp,
  ArrowRight,
  Lightbulb,
  Scale,
  Moon,
  Dumbbell,
  Droplets,
  Brain,
} from 'lucide-react';
import { useWhatIfSimulator } from '@/hooks/dr-vital/useHealthOracle';
import type { WhatIfChange } from '@/types/dr-vital-revolution';

// =====================================================
// FACTOR CONFIG
// =====================================================

interface FactorConfig {
  key: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  icon: React.ReactNode;
  defaultValue: number;
  idealValue: number;
  description: string;
}

const FACTORS: FactorConfig[] = [
  {
    key: 'weight',
    label: 'Peso',
    unit: 'kg',
    min: 40,
    max: 150,
    step: 0.5,
    icon: <Scale className="w-4 h-4" />,
    defaultValue: 75,
    idealValue: 70,
    description: 'Seu peso corporal',
  },
  {
    key: 'sleepHours',
    label: 'Horas de Sono',
    unit: 'h',
    min: 4,
    max: 12,
    step: 0.5,
    icon: <Moon className="w-4 h-4" />,
    defaultValue: 6,
    idealValue: 8,
    description: 'Média de horas dormidas',
  },
  {
    key: 'exerciseMinutes',
    label: 'Exercício Semanal',
    unit: 'min',
    min: 0,
    max: 420,
    step: 15,
    icon: <Dumbbell className="w-4 h-4" />,
    defaultValue: 60,
    idealValue: 150,
    description: 'Minutos de exercício por semana',
  },
  {
    key: 'waterIntake',
    label: 'Água Diária',
    unit: 'L',
    min: 0.5,
    max: 4,
    step: 0.25,
    icon: <Droplets className="w-4 h-4" />,
    defaultValue: 1.5,
    idealValue: 2.5,
    description: 'Litros de água por dia',
  },
  {
    key: 'stressLevel',
    label: 'Nível de Estresse',
    unit: '/10',
    min: 1,
    max: 10,
    step: 1,
    icon: <Brain className="w-4 h-4" />,
    defaultValue: 6,
    idealValue: 3,
    description: 'Seu nível de estresse (menor é melhor)',
  },
];

// =====================================================
// FACTOR SLIDER
// =====================================================

interface FactorSliderProps {
  factor: FactorConfig;
  currentValue: number;
  newValue: number;
  onChange: (value: number) => void;
  onReset: () => void;
  isModified: boolean;
}

function FactorSlider({ 
  factor, 
  currentValue, 
  newValue, 
  onChange, 
  onReset,
  isModified,
}: FactorSliderProps) {
  const improvement = factor.key === 'stressLevel' 
    ? currentValue - newValue 
    : newValue - currentValue;
  const isImproving = improvement > 0;

  return (
    <div className={cn(
      'p-4 rounded-lg border transition-colors',
      isModified ? 'border-primary bg-primary/5' : 'border-border bg-card'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-primary">{factor.icon}</span>
          <span className="font-medium">{factor.label}</span>
        </div>
        {isModified && (
          <Button variant="ghost" size="sm" onClick={onReset} className="h-6 px-2">
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>

      <Slider
        value={[newValue]}
        min={factor.min}
        max={factor.max}
        step={factor.step}
        onValueChange={([v]) => onChange(v)}
        className="mb-3"
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Atual:</span>
          <span>{currentValue}{factor.unit}</span>
        </div>
        
        {isModified && (
          <>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-1">
              <span className={isImproving ? 'text-green-500' : 'text-red-500'}>
                {newValue}{factor.unit}
              </span>
              {isImproving ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          </>
        )}
        
        {!isModified && (
          <span className="text-muted-foreground text-xs">
            Ideal: {factor.idealValue}{factor.unit}
          </span>
        )}
      </div>
    </div>
  );
}

// =====================================================
// SIMULATION RESULT
// =====================================================

interface SimulationResultProps {
  improvementPercentage: number;
  insights: string[];
  isLoading: boolean;
}

function SimulationResult({ improvementPercentage, insights, isLoading }: SimulationResultProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-20 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = improvementPercentage > 0;

  return (
    <Card className={cn(
      'overflow-hidden',
      isPositive ? 'border-green-500/50' : 'border-orange-500/50'
    )}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Resultado da Simulação</h3>
          <div className={cn(
            'flex items-center gap-2 text-lg font-bold',
            isPositive ? 'text-green-500' : 'text-orange-500'
          )}>
            {isPositive ? (
              <TrendingDown className="w-5 h-5" />
            ) : (
              <TrendingUp className="w-5 h-5" />
            )}
            {Math.abs(improvementPercentage).toFixed(1)}%
            <span className="text-sm font-normal text-muted-foreground">
              {isPositive ? 'redução de risco' : 'aumento de risco'}
            </span>
          </div>
        </div>

        {insights.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              Insights
            </h4>
            <ul className="space-y-1">
              {insights.map((insight, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface WhatIfSimulatorProps {
  className?: string;
  initialValues?: Record<string, number>;
}

export function WhatIfSimulator({ className, initialValues }: WhatIfSimulatorProps) {
  const {
    changes,
    result,
    addChange,
    removeChange,
    reset,
    simulate,
    isSimulating,
    hasChanges,
    improvementPercentage,
    insights,
  } = useWhatIfSimulator();

  // Local state for slider values
  const [values, setValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    FACTORS.forEach(f => {
      initial[f.key] = initialValues?.[f.key] ?? f.defaultValue;
    });
    return initial;
  });

  const [currentValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    FACTORS.forEach(f => {
      initial[f.key] = initialValues?.[f.key] ?? f.defaultValue;
    });
    return initial;
  });

  const handleChange = useCallback((factor: string, newValue: number) => {
    setValues(prev => ({ ...prev, [factor]: newValue }));
    addChange(factor, currentValues[factor], newValue);
  }, [addChange, currentValues]);

  const handleReset = useCallback((factor: string) => {
    setValues(prev => ({ ...prev, [factor]: currentValues[factor] }));
    removeChange(factor);
  }, [removeChange, currentValues]);

  const handleResetAll = useCallback(() => {
    setValues(currentValues);
    reset();
  }, [reset, currentValues]);

  const modifiedFactors = FACTORS.filter(f => values[f.key] !== currentValues[f.key]);

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Simulador "E se..."
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ajuste os valores para ver como mudanças afetariam seus riscos de saúde
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Factor Sliders */}
        <div className="space-y-4">
          {FACTORS.map(factor => (
            <FactorSlider
              key={factor.key}
              factor={factor}
              currentValue={currentValues[factor.key]}
              newValue={values[factor.key]}
              onChange={(v) => handleChange(factor.key, v)}
              onReset={() => handleReset(factor.key)}
              isModified={values[factor.key] !== currentValues[factor.key]}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={simulate}
            disabled={!hasChanges || isSimulating}
            className="flex-1"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Simulando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Simular Cenário
              </>
            )}
          </Button>
          
          {hasChanges && (
            <Button variant="outline" onClick={handleResetAll}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Modified Summary */}
        {modifiedFactors.length > 0 && !result && (
          <div className="p-3 rounded-lg bg-muted/50 text-sm">
            <span className="text-muted-foreground">
              {modifiedFactors.length} {modifiedFactors.length === 1 ? 'fator modificado' : 'fatores modificados'}:
            </span>
            <span className="ml-2">
              {modifiedFactors.map(f => f.label).join(', ')}
            </span>
          </div>
        )}

        {/* Result */}
        {result && (
          <SimulationResult
            improvementPercentage={improvementPercentage}
            insights={insights}
            isLoading={isSimulating}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default WhatIfSimulator;
