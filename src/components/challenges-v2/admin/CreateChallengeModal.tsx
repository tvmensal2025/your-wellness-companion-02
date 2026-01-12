// =====================================================
// ADMIN - CRIAR DESAFIO
// Modal para admin criar novos desafios
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Zap, Bell, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  CATEGORY_CONFIG, 
  DISPLAY_MODE_CONFIG,
  type ChallengeDisplayMode 
} from '@/types/challenges-v2';

interface CreateChallengeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateChallengeModal: React.FC<CreateChallengeModalProps> = ({
  open,
  onOpenChange,
}) => {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [challengeType, setChallengeType] = useState('exercicio');
  const [difficulty, setDifficulty] = useState('medium');
  const [displayMode, setDisplayMode] = useState<ChallengeDisplayMode>('normal');
  const [durationDays, setDurationDays] = useState(7);
  const [dailyTarget, setDailyTarget] = useState(1);
  const [dailyUnit, setDailyUnit] = useState('vezes');
  const [pointsReward, setPointsReward] = useState(100);
  const [xpReward, setXpReward] = useState(50);

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Título é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('challenges').insert({
        title: title.trim(),
        description: description.trim(),
        challenge_type: challengeType,
        difficulty,
        display_mode: displayMode,
        duration_days: durationDays,
        daily_log_target: dailyTarget,
        daily_log_unit: dailyUnit,
        points_reward: pointsReward,
        xp_reward: xpReward,
        is_active: true,
        featured_until: displayMode !== 'normal' 
          ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
          : null,
      });

      if (error) throw error;

      toast.success('Desafio criado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['challenges'] });
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar desafio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setChallengeType('exercicio');
    setDifficulty('medium');
    setDisplayMode('normal');
    setDurationDays(7);
    setDailyTarget(1);
    setDailyUnit('vezes');
    setPointsReward(100);
    setXpReward(50);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Criar Novo Desafio
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Desafio</Label>
            <Input
              id="title"
              placeholder="Ex: Beber 2L de água por dia"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva o desafio..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          {/* Display Mode - DESTAQUE */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              Onde aparece?
              <Info className="w-4 h-4 text-muted-foreground" />
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(DISPLAY_MODE_CONFIG) as [ChallengeDisplayMode, typeof DISPLAY_MODE_CONFIG[ChallengeDisplayMode]][]).map(([mode, config]) => (
                <motion.button
                  key={mode}
                  type="button"
                  className={cn(
                    "p-3 rounded-xl border-2 text-center transition-all",
                    displayMode === mode
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                  onClick={() => setDisplayMode(mode)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-2xl block mb-1">{config.emoji}</span>
                  <span className="text-sm font-medium block">{config.label}</span>
                  <span className="text-[10px] text-muted-foreground block">
                    {config.description}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tipo e Dificuldade */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={challengeType} onValueChange={setChallengeType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.emoji} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">⭐ Fácil</SelectItem>
                  <SelectItem value="medium">🎯 Médio</SelectItem>
                  <SelectItem value="hard">🔥 Difícil</SelectItem>
                  <SelectItem value="extreme">💀 Extremo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Duração e Meta */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Duração (dias)</Label>
              <Input
                type="number"
                min={1}
                max={365}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Meta diária</Label>
              <Input
                type="number"
                min={1}
                value={dailyTarget}
                onChange={(e) => setDailyTarget(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <Input
                placeholder="ml, passos, min..."
                value={dailyUnit}
                onChange={(e) => setDailyUnit(e.target.value)}
              />
            </div>
          </div>

          {/* Recompensas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pontos</Label>
              <Input
                type="number"
                min={0}
                value={pointsReward}
                onChange={(e) => setPointsReward(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>XP</Label>
              <Input
                type="number"
                min={0}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Preview do modo selecionado */}
          {displayMode !== 'normal' && (
            <div className={cn(
              "p-3 rounded-xl border",
              displayMode === 'featured' && "bg-blue-500/10 border-blue-500/30",
              displayMode === 'flash' && "bg-amber-500/10 border-amber-500/30"
            )}>
              <p className="text-sm flex items-center gap-2">
                {displayMode === 'featured' ? (
                  <>
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span>Este desafio aparecerá no <strong>sino de alertas</strong></span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Este será um <strong>desafio relâmpago</strong> com timer</span>
                  </>
                )}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Criando...' : 'Criar Desafio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChallengeModal;
