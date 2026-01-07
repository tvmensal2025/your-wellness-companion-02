import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SimpleWeightFormData {
  weight: number;
  waist: number;
}

interface SimpleWeightFormProps {
  onSubmit?: (data: SimpleWeightFormData & { height: number }) => void;
}

const SimpleWeightForm: React.FC<SimpleWeightFormProps> = ({ onSubmit }) => {
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  const [userHeight, setUserHeight] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar altura do usuário do sistema
  useEffect(() => {
    const fetchUserHeight = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('dados_físicos_do_usuário')
        .select('altura_cm')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data?.altura_cm) {
        setUserHeight(data.altura_cm);
      } else {
        // Fallback: buscar do profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('height')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile?.height) {
          setUserHeight(profile.height);
        }
      }
    };

    fetchUserHeight();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const w = parseFloat(weight.replace(',', '.'));
    const wc = parseFloat(waist.replace(',', '.'));

    if (!w || isNaN(w) || w < 30 || w > 300) return;
    if (!wc || isNaN(wc) || wc < 40 || wc > 200) return;

    // Usar altura do sistema ou um valor padrão
    const height = userHeight || 170;

    setIsSubmitting(true);

    try {
      await onSubmit?.({ weight: w, waist: wc, height });

      // Reset form (só após sucesso)
      setWeight('');
      setWaist('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {userHeight && (
        <p className="text-xs text-muted-foreground">
          📏 Altura registrada no sistema: {userHeight} cm
        </p>
      )}

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
