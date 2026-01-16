// ============================================
// 📋 EXERCISE OVERVIEW
// Visão geral do exercício com vídeo e stats
// ============================================

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Home, Building2, Info, Play, Repeat, Target } from 'lucide-react';
import { VideoBlock } from './VideoBlock';

interface ExerciseOverviewProps {
  name: string;
  description: string;
  location: 'casa' | 'academia';
  videoId: string | null;
  sets: string;
  reps: string;
  rest: string;
  difficulty: { label: string; tone: string };
  difficultyRaw: string;
  onStartExecution: () => void;
  onGoToInstructions: () => void;
}

export const ExerciseOverview: React.FC<ExerciseOverviewProps> = ({
  name,
  description,
  location,
  videoId,
  sets,
  reps,
  rest,
  difficulty,
  difficultyRaw,
  onStartExecution,
  onGoToInstructions,
}) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-bold text-foreground leading-tight">{name}</h2>
          <Badge 
            variant="outline" 
            className="shrink-0 gap-1.5 px-3 py-1.5 bg-background border-border"
          >
            {location === 'casa' ? <Home className="w-3.5 h-3.5" /> : <Building2 className="w-3.5 h-3.5" />}
            {location === 'casa' ? 'Em Casa' : 'Academia'}
          </Badge>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {/* Vídeo */}
      <VideoBlock videoId={videoId} name={name} />

      {/* Stats em cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border bg-background">
          <CardContent className="p-3 text-center">
            <Repeat className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <div className="text-lg font-bold">{sets}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Séries</div>
          </CardContent>
        </Card>
        <Card className="border bg-background">
          <CardContent className="p-3 text-center">
            <Target className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <div className="text-lg font-bold">{reps}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Repetições</div>
          </CardContent>
        </Card>
        <Card className="border bg-background">
          <CardContent className="p-3 text-center">
            <Clock className="w-5 h-5 mx-auto mb-1 text-emerald-500" />
            <div className="text-lg font-bold">{rest}</div>
            <div className="text-[10px] text-muted-foreground font-medium">Descanso</div>
          </CardContent>
        </Card>
      </div>

      {/* Dificuldade */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Dificuldade</span>
        <span className="font-medium">{difficulty.label || difficultyRaw || 'Intermediário'}</span>
      </div>

      {/* Botões - Instruções e Começar */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          className="flex-1 h-12"
          onClick={onGoToInstructions}
        >
          <Info className="w-4 h-4 mr-2" />
          Instruções
        </Button>
        <Button
          className="flex-1 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          onClick={onStartExecution}
        >
          <Play className="w-4 h-4 mr-2" />
          Começar
        </Button>
      </div>
    </div>
  );
};
