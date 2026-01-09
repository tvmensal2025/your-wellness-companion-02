import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dumbbell } from 'lucide-react';

interface WeightInputPopupProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  onSave: (weight: number | null) => void;
}

export const WeightInputPopup: React.FC<WeightInputPopupProps> = ({
  isOpen,
  onClose,
  exerciseName,
  onSave,
}) => {
  const [weight, setWeight] = useState('');

  const handleSave = () => {
    const weightValue = parseFloat(weight);
    onSave(isNaN(weightValue) ? null : weightValue);
    setWeight('');
    onClose();
  };

  const handleSkip = () => {
    onSave(null);
    setWeight('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-xs p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Dumbbell className="w-5 h-5 text-orange-500" />
            Registrar Peso (Opcional)
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Quanto peso você usou em <strong>{exerciseName}</strong>?
          </p>
          
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              inputMode="decimal"
              placeholder="Ex: 20"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="flex-1"
            />
            <span className="text-muted-foreground font-medium">kg</span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleSkip}
            >
              Pular
            </Button>
            <Button 
              className="flex-1 bg-orange-500 hover:bg-orange-600"
              onClick={handleSave}
              disabled={!weight}
            >
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
