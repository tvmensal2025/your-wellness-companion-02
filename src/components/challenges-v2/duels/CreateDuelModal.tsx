// =====================================================
// CREATE DUEL MODAL - MODAL PARA CRIAR DUELO
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Search, Clock, Trophy, Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCreateDuel } from '@/hooks/challenges/useChallengesV2';
import { CATEGORY_CONFIG } from '@/types/challenges-v2';

interface CreateDuelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DUEL_TYPES = [
  { value: 'steps', label: 'Passos', emoji: '👟', unit: 'passos', defaultTarget: 10000 },
  { value: 'water', label: 'Hidratação', emoji: '💧', unit: 'ml', defaultTarget: 2000 },
  { value: 'exercise', label: 'Exercício', emoji: '🏃', unit: 'min', defaultTarget: 30 },
  { value: 'calories', label: 'Calorias', emoji: '🔥', unit: 'kcal', defaultTarget: 500 },
];

const DURATION_OPTIONS = [
  { value: 24, label: '24 horas' },
  { value: 48, label: '48 horas' },
  { value: 72, label: '3 dias' },
  { value: 168, label: '1 semana' },
];

export const CreateDuelModal: React.FC<CreateDuelModalProps> = ({
  open,
  onOpenChange,
}) => {
  const createDuel = useCreateDuel();
  
  const [step, setStep] = useState<'type' | 'opponent' | 'confirm'>('type');
  const [duelType, setDuelType] = useState('steps');
  const [targetValue, setTargetValue] = useState(10000);
  const [duration, setDuration] = useState(24);
  const [opponentId, setOpponentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedType = DUEL_TYPES.find(t => t.value === duelType)!;

  const handleCreate = async () => {
    if (!opponentId) return;

    await createDuel.mutateAsync({
      opponent_id: opponentId,
      challenge_type: duelType,
      target_value: targetValue,
      unit: selectedType.unit,
      duration_hours: duration,
      xp_reward: 200,
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setStep('type');
    setDuelType('steps');
    setTargetValue(10000);
    setDuration(24);
    setOpponentId('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-500" />
            Criar Duelo
          </DialogTitle>
          <DialogDescription>
            Desafie um amigo para uma competição 1v1
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Step 1: Choose Type */}
          {step === 'type' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <Label>Tipo de Desafio</Label>
              <div className="grid grid-cols-2 gap-3">
                {DUEL_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setDuelType(type.value);
                      setTargetValue(type.defaultTarget);
                    }}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-left",
                      duelType === type.value
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-border hover:border-purple-500/50"
                    )}
                  >
                    <span className="text-2xl">{type.emoji}</span>
                    <p className="font-medium mt-1">{type.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Meta: {type.defaultTarget.toLocaleString()} {type.unit}
                    </p>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Meta</Label>
                <Input
                  type="number"
                  value={targetValue}
                  onChange={(e) => setTargetValue(parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  {selectedType.unit}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Duração</Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full" onClick={() => setStep('opponent')}>
                Próximo: Escolher Oponente
              </Button>
            </motion.div>
          )}

          {/* Step 2: Choose Opponent */}
          {step === 'opponent' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar amigo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Friends list - TODO: Integrar com lista real de amigos */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <p className="text-xs text-muted-foreground text-center py-4">
                  🚧 Em breve: Lista de amigos da comunidade
                </p>
                {/* Placeholder para demonstração */}
                {['Usuário Demo 1', 'Usuário Demo 2'].map((name, i) => (
                  <button
                    key={i}
                    onClick={() => setOpponentId(`demo-user-${i}`)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                      opponentId === `demo-user-${i}`
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-border hover:border-purple-500/50"
                    )}
                  >
                    <Avatar>
                      <AvatarFallback>{name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">Demo</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('type')} className="flex-1">
                  Voltar
                </Button>
                <Button 
                  onClick={() => setStep('confirm')} 
                  disabled={!opponentId}
                  className="flex-1"
                >
                  Próximo
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <h4 className="font-bold mb-3 text-center">Resumo do Duelo</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{selectedType.emoji} {selectedType.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Meta:</span>
                    <span className="font-medium">{targetValue.toLocaleString()} {selectedType.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração:</span>
                    <span className="font-medium">{DURATION_OPTIONS.find(d => d.value === duration)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prêmio:</span>
                    <span className="font-medium text-yellow-500">200 XP</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('opponent')} className="flex-1">
                  Voltar
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={createDuel.isPending}
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                >
                  {createDuel.isPending ? 'Criando...' : '⚔️ Criar Duelo'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDuelModal;
