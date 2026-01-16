// ============================================
// 📱 BUDDY MODALS
// Modais de provocações, desafios e estatísticas
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Weight, Trophy, Flame, Zap, Calendar, Dumbbell, Activity, ChevronRight, MessageCircle, Swords } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { PROVOCATIONS, CHALLENGE_TEMPLATES } from './constants';
import { OnlineIndicator } from './BuddyProgress';
import type { BuddyStats } from './hooks/useBuddyWorkoutLogic';

// ============================================
// STAT ITEM
// ============================================

const StatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}> = ({ icon, label, value, trend, color = 'text-muted-foreground' }) => (
  <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
    <div className={cn("p-1.5 rounded-md bg-background", color)}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground truncate">{label}</p>
      <div className="flex items-center gap-1">
        <span className="font-bold text-sm">{value}</span>
        {trend === 'up' && <TrendingUp className="w-3 h-3 text-emerald-500" />}
        {trend === 'down' && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
      </div>
    </div>
  </div>
);

// ============================================
// PROVOCATIONS MODAL
// ============================================

interface ProvocationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSendProvocation?: (type: string, message: string) => void;
}

export const ProvocationsModal: React.FC<ProvocationsModalProps> = ({
  open,
  onOpenChange,
  onSendProvocation,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-500" />
            Mandar Mensagem
          </DialogTitle>
          <DialogDescription>
            Motive ou provoque seu parceiro! 😈
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
          {PROVOCATIONS.map((prov) => (
            <Button
              key={prov.id}
              variant="outline"
              className="justify-start h-auto py-3 px-4"
              onClick={() => {
                onSendProvocation?.(prov.type, prov.message);
                onOpenChange(false);
              }}
            >
              <span className="text-2xl mr-3">{prov.emoji}</span>
              <span className="text-sm text-left">{prov.message}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// CHALLENGES MODAL
// ============================================

interface ChallengesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buddyName: string;
  onCreateChallenge?: () => void;
}

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  open,
  onOpenChange,
  buddyName,
  onCreateChallenge,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-orange-500" />
            Criar Desafio
          </DialogTitle>
          <DialogDescription>
            Desafie {buddyName} para uma competição!
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3">
          {CHALLENGE_TEMPLATES.map((challenge) => (
            <Card
              key={challenge.type}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => {
                onCreateChallenge?.();
                onOpenChange(false);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{challenge.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold">{challenge.title}</h4>
                    <p className="text-xs text-muted-foreground">{challenge.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ============================================
// BUDDY STATS MODAL
// ============================================

interface BuddyStatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buddy: BuddyStats;
}

export const BuddyStatsModal: React.FC<BuddyStatsModalProps> = ({
  open,
  onOpenChange,
  buddy,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-32px)] max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Evolução de {buddy.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Avatar e status */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
            <div className="relative">
              <Avatar className="w-16 h-16 border-4 border-purple-500">
                <AvatarImage src={buddy.avatarUrl} />
                <AvatarFallback className="text-xl">{buddy.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <OnlineIndicator isOnline={buddy.isOnline} />
            </div>
            <div>
              <h3 className="font-bold text-lg">{buddy.name}</h3>
              <p className="text-sm text-muted-foreground">
                {buddy.isOnline ? '🟢 Online agora' : '⚪ Offline'}
              </p>
              <p className="text-xs text-muted-foreground">
                Último treino: {buddy.lastWorkoutDate}
              </p>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-3">
            <StatItem
              icon={<Dumbbell className="w-4 h-4 text-blue-500" />}
              label="Treinos esta semana"
              value={buddy.workoutsThisWeek}
              color="text-blue-500"
            />
            <StatItem
              icon={<Calendar className="w-4 h-4 text-purple-500" />}
              label="Treinos no mês"
              value={buddy.workoutsThisMonth}
              color="text-purple-500"
            />
            <StatItem
              icon={<Flame className="w-4 h-4 text-orange-500" />}
              label="Dias seguidos"
              value={`${buddy.consecutiveDays} dias`}
              color="text-orange-500"
            />
            <StatItem
              icon={<Zap className="w-4 h-4 text-amber-500" />}
              label="Pontos semanais"
              value={buddy.weeklyPoints.toLocaleString()}
              color="text-amber-500"
            />
            {buddy.currentWeight && (
              <StatItem
                icon={<Weight className="w-4 h-4 text-emerald-500" />}
                label="Peso atual"
                value={`${buddy.currentWeight} kg`}
                trend={buddy.weightChange && buddy.weightChange < 0 ? 'down' : 'up'}
                color="text-emerald-500"
              />
            )}
            <StatItem
              icon={<Trophy className="w-4 h-4 text-yellow-500" />}
              label="Desafios vencidos"
              value={`${buddy.challengesWon}/${buddy.challengesWon + buddy.challengesLost}`}
              color="text-yellow-500"
            />
          </div>

          {/* Último treino */}
          {buddy.lastWorkoutType && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <p className="text-sm">
                <span className="font-medium">Último treino:</span>{' '}
                {buddy.lastWorkoutType}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
