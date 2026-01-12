// =====================================================
// CREATE TEAM MODAL - MODAL PARA CRIAR TIME
// =====================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Palette, Lock, Globe } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useCreateTeam } from '@/hooks/challenges/useChallengesV2';

interface CreateTeamModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TEAM_EMOJIS = ['👥', '🔥', '⚡', '🚀', '💪', '🏆', '⭐', '🎯', '🦁', '🐺', '🦅', '🐉'];
const TEAM_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444', 
  '#F97316', '#EAB308', '#22C55E', '#14B8A6'
];

export const CreateTeamModal: React.FC<CreateTeamModalProps> = ({
  open,
  onOpenChange,
}) => {
  const createTeam = useCreateTeam();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('👥');
  const [color, setColor] = useState('#3B82F6');
  const [isPublic, setIsPublic] = useState(true);

  const handleCreate = async () => {
    if (!name.trim()) return;

    await createTeam.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
      avatar_emoji: emoji,
      color,
      is_public: isPublic,
    });

    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setEmoji('👥');
    setColor('#3B82F6');
    setIsPublic(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Criar Time
          </DialogTitle>
          <DialogDescription>
            Crie um time para competir em desafios coletivos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Preview */}
          <div className="flex justify-center">
            <motion.div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
              style={{ backgroundColor: `${color}30` }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {emoji}
            </motion.div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Nome do Time</Label>
            <Input
              placeholder="Ex: Equipe Fênix"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Descrição (opcional)</Label>
            <Textarea
              placeholder="Descreva seu time..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              rows={2}
            />
          </div>

          {/* Emoji Selection */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="flex flex-wrap gap-2">
              {TEAM_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all",
                    emoji === e
                      ? "bg-primary/20 ring-2 ring-primary"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Cor do Time
            </Label>
            <div className="flex flex-wrap gap-2">
              {TEAM_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all",
                    color === c && "ring-2 ring-offset-2 ring-offset-background"
                  )}
                  style={{ 
                    backgroundColor: c, 
                    ['--tw-ring-color' as string]: c 
                  }}
                />
              ))}
            </div>
          </div>

          {/* Privacy */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
            <div className="flex items-center gap-2">
              {isPublic ? (
                <Globe className="w-4 h-4 text-green-500" />
              ) : (
                <Lock className="w-4 h-4 text-yellow-500" />
              )}
              <div>
                <p className="text-sm font-medium">
                  {isPublic ? 'Time Público' : 'Time Privado'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isPublic 
                    ? 'Qualquer pessoa pode solicitar entrada'
                    : 'Apenas por convite'}
                </p>
              </div>
            </div>
            <Switch checked={isPublic} onCheckedChange={setIsPublic} />
          </div>

          {/* Create Button */}
          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={!name.trim() || createTeam.isPending}
            style={{ backgroundColor: color }}
          >
            {createTeam.isPending ? 'Criando...' : '👥 Criar Time'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTeamModal;
