import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, Ruler, Calculator } from 'lucide-react';

interface Measurements {
  weight: number;
  abdominalCircumference: number;
  waistCircumference: number;
  hipCircumference: number;
  triceps?: number;
  suprailiac?: number;
  thigh?: number;
  chest?: number;
  abdomen?: number;
}

interface MetricsFormProps {
  measurements: Measurements;
  onMeasurementsChange: (measurements: Measurements) => void;
  onCalculate: () => void;
  disabled?: boolean;
}

export const MetricsForm: React.FC<MetricsFormProps> = ({
  measurements,
  onMeasurementsChange,
  onCalculate,
  disabled = false
}) => {
  const handleChange = (field: keyof Measurements, value: string) => {
    const numValue = parseFloat(value) || 0;
    onMeasurementsChange({
      ...measurements,
      [field]: numValue
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Medidas Corporais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Peso */}
          <div className="space-y-2">
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              value={measurements.weight || ''}
              onChange={(e) => handleChange('weight', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Circunferência Abdominal */}
          <div className="space-y-2">
            <Label htmlFor="abdominal">Circunferência Abdominal (cm)</Label>
            <Input
              id="abdominal"
              type="number"
              step="0.1"
              value={measurements.abdominalCircumference || ''}
              onChange={(e) => handleChange('abdominalCircumference', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Circunferência da Cintura */}
          <div className="space-y-2">
            <Label htmlFor="waist">Circunferência da Cintura (cm)</Label>
            <Input
              id="waist"
              type="number"
              step="0.1"
              value={measurements.waistCircumference || ''}
              onChange={(e) => handleChange('waistCircumference', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Circunferência do Quadril */}
          <div className="space-y-2">
            <Label htmlFor="hip">Circunferência do Quadril (cm)</Label>
            <Input
              id="hip"
              type="number"
              step="0.1"
              value={measurements.hipCircumference || ''}
              onChange={(e) => handleChange('hipCircumference', e.target.value)}
              disabled={disabled}
            />
          </div>

          {/* Dobras Cutâneas (Opcional) */}
          <div className="col-span-full">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Dobras Cutâneas (Opcional)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="triceps">Tríceps (mm)</Label>
                <Input
                  id="triceps"
                  type="number"
                  step="0.1"
                  value={measurements.triceps || ''}
                  onChange={(e) => handleChange('triceps', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suprailiac">Suprailíaca (mm)</Label>
                <Input
                  id="suprailiac"
                  type="number"
                  step="0.1"
                  value={measurements.suprailiac || ''}
                  onChange={(e) => handleChange('suprailiac', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thigh">Coxa (mm)</Label>
                <Input
                  id="thigh"
                  type="number"
                  step="0.1"
                  value={measurements.thigh || ''}
                  onChange={(e) => handleChange('thigh', e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botão Calcular */}
        <div className="mt-6">
          <Button 
            onClick={onCalculate} 
            disabled={disabled || measurements.weight === 0}
            className="w-full"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calcular Métricas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
