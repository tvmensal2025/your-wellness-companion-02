// =====================================================
// CREATE TEAM BATTLE MODAL - DESAFIAR OUTRO TIME
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, Users, Search, Zap, Clock } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CATEGORY_CONFIG } from '@/types/challenges-v2';

interface CreateTeamBattleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  myTeam: {
    id: string;
    name: string;
    avatar_emoji: string;
    color: string;
  };
}

export const CreateTeamBattleModal: React.FC<CreateTeamBattleModalProps> = ({
  open,
  onOpenChange,
  myTeam,
}) => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [challengeType, setChallengeType] = useState('exercicio');
  const [targetValue, setTargetValue] = useState(1000);
  const [unit, setUnit] = useState('pontos');
  const [durationDays, setDurationDays] = useState(7);
  const [xpReward, setXpReward] = useState(500);

  // Buscar times disponíveis
  const { data: availableTeams, isLoading } = useQuery({
    queryKey: ['available-teams', searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('challenge_teams')
        .select('*, member_count:challenge_team_members(count)')
        .neq('id', myTeam.id)
        .eq('is_public', true)
        .limit(10);

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('Error fetching teams:', error);
        return [];
      }
      return data || [];
    },
    enabled: open,
  });

  // Criar batalha
  const createBattle = useMutation({
    mutationFn: async () => {
      if (!selectedTeam) throw new Error('Selecione um time');

      const endsAt = new Date();
      endsAt.setDate(endsAt.getDate() + durationDays);

      const { data, error } = await supabase
        .from('team_battles')
        .insert({
          team_a_id: myTeam.id,
          team_b_id: selectedTeam.id,
          challenge_type: challengeType,
          target_value: targetValue,
          unit,
          team_a_progress: 0,
          team_b_progress: 0,
          status: 'pending',
          xp_reward: xpReward,
          starts_at: new Date().toISOString(),
          ends_at: endsAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('⚔️ Desafio enviado!', {
        description: `Aguardando ${selectedTeam.name} aceitar`,
      });
      queryClient.invalidateQueries({ queryKey: ['team-battles'] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error('Erro ao criar batalha', {
        description: error.message,
      });
    },
  });

  const resetForm = () => {
    setSelectedTeam(null);
    setSearchQuery('');
    setChallengeType('exercicio');
    setTargetValue(1000);
    setUnit('pontos');
    setDurationDays(7);
    setXpReward(500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-500" />
            Desafiar Time
          </DialogTitle>
          <DialogDescription>
            Desafie outro time para uma batalha épica!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Meu Time */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/30">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
              style={{ backgroundColor: `${myTeam.color}30` }}
            >
              {myTeam.avatar_emoji}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Seu time</p>
              <p className="font-bold">{myTeam.name}</p>
            </div>
          </div>

          {/* VS */}
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">VS</span>
            </div>
          </div>

          {/* Buscar Time Oponente */}
          <div className="space-y-2">
            <Label>Escolher Oponente</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar time..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lista de Times */}
            <div className="max-h-40 overflow-y-auto space-y-2">
              {isLoading ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Carregando...
                </p>
              ) : availableTeams?.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Nenhum time encontrado
                </p>
              ) : (
                availableTeams?.map((team: any) => (
                  <motion.button
                    key={team.id}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                      selectedTeam?.id === team.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setSelectedTeam(team)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${team.color}30` }}
                    >
                      {team.avatar_emoji}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">{team.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {team.member_count?.[0]?.count || 0} membros
                      </p>
                    </div>
                    {selectedTeam?.id === team.id && (
                      <span className="text-primary">✓</span>
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </div>

          {/* Configurações da Batalha */}
          <div className="space-y-4 p-4 rounded-xl bg-muted/30">
            <h4 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              Configurar Batalha
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
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
                <Label>Duração</Label>
                <Select 
                  value={durationDays.toString()} 
                  onValueChange={(v) => setDurationDays(Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 dias</SelectItem>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Meta Total</Label>
                <Input
                  type="number"
                  min={100}
                  value={targetValue}
                  onChange={(e) => setTargetValue(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input
                  placeholder="pontos, passos, ml..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>XP para o vencedor</Label>
              <Input
                type="number"
                min={100}
                value={xpReward}
                onChange={(e) => setXpReward(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Botão Criar */}
          <Button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            onClick={() => createBattle.mutate()}
            disabled={!selectedTeam || createBattle.isPending}
          >
            {createBattle.isPending ? 'Enviando...' : '⚔️ Desafiar Time'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamBattleModal;
