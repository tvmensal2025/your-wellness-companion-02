import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Users, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WeightPrivacyToggleProps {
  userId: string;
  initialValue?: boolean;
  onToggle?: (value: boolean) => void;
}

export const WeightPrivacyToggle: React.FC<WeightPrivacyToggleProps> = ({
  userId,
  initialValue = true,
  onToggle,
}) => {
  const [showWeightResults, setShowWeightResults] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setShowWeightResults(initialValue);
  }, [initialValue]);

  const handleToggle = async (value: boolean) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ show_weight_results: value })
        .eq('user_id', userId);

      if (error) throw error;

      setShowWeightResults(value);
      onToggle?.(value);
      toast.success(value ? 'Resultados de peso visíveis para todos' : 'Resultados de peso ocultos');
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      toast.error('Erro ao atualizar configuração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${showWeightResults ? 'bg-green-500/20' : 'bg-muted/20'}`}>
                {showWeightResults ? (
                  <Users className="w-5 h-5 text-green-500" />
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <Label htmlFor="weight-privacy" className="font-semibold cursor-pointer">
                  Mostrar resultado de peso
                </Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {showWeightResults 
                    ? 'Outros podem ver seu progresso de peso'
                    : 'Apenas você pode ver seu progresso'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              <Switch
                id="weight-privacy"
                checked={showWeightResults}
                onCheckedChange={handleToggle}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
