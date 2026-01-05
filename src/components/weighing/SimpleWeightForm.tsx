import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale } from 'lucide-react';

interface SimpleWeightFormData {
  weight: number;
  height: number;
  waist: number;
}

interface SimpleWeightFormProps {
  onSubmit?: (data: SimpleWeightFormData) => void;
}

const SimpleWeightForm: React.FC<SimpleWeightFormProps> = ({ onSubmit }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [waist, setWaist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const w = parseFloat(weight.replace(',', '.'));
    const h = parseFloat(height.replace(',', '.'));
    const wc = parseFloat(waist.replace(',', '.'));

    if (!w || isNaN(w) || w < 30 || w > 300) return;
    if (!h || isNaN(h) || h < 100 || h > 250) return;
    if (!wc || isNaN(wc) || wc < 40 || wc > 200) return;

    setIsSubmitting(true);

    try {
      await onSubmit?.({ weight: w, height: h, waist: wc });

      // Reset form (só após sucesso)
      setWeight('');
      setHeight('');
      setWaist('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="weight" className="text-foreground">
            Peso atual (kg)
          </Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            min="30"
            max="300"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ex: 70.5"
          />
        </div>

        <div>
          <Label htmlFor="height" className="text-foreground">
            Altura (cm)
          </Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            min="100"
            max="250"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Ex: 170"
          />
        </div>

        <div>
          <Label htmlFor="waist" className="text-foreground">
            Circunferência abdominal (cm)
          </Label>
          <Input
            id="waist"
            type="number"
            step="0.1"
            min="40"
            max="200"
            value={waist}
            onChange={(e) => setWaist(e.target.value)}
            placeholder="Ex: 90"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        <Scale className="w-4 h-4 mr-2" />
        {isSubmitting ? 'Registrando...' : 'Registrar Peso'}
      </Button>
    </form>
  );
};

export default SimpleWeightForm;
