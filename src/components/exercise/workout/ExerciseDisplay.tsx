import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Info,
  Lightbulb,
  Youtube,
  ChevronUp,
  ChevronDown,
  Play,
  Dumbbell,
  Clock,
  BarChart3
} from 'lucide-react';
import { Exercise } from '@/hooks/useExercisesLibrary';
import { cn } from '@/lib/utils';

interface ExerciseDisplayProps {
  exercise: Exercise;
  onStart: () => void;
  onShowEvolution: () => void;
}

// Extrair ID do YouTube
const extractYouTubeId = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
};

export const ExerciseDisplay: React.FC<ExerciseDisplayProps> = ({
  exercise,
  onStart,
  onShowEvolution
}) => {
  const [showDetailedInstructions, setShowDetailedInstructions] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const youtubeId = useMemo(() => 
    extractYouTubeId(exercise?.youtube_url), 
    [exercise?.youtube_url]
  );

  const parseRestTime = (restTime: string | number | null | undefined): number => {
    if (!restTime) return 60;
    if (typeof restTime === 'number') return restTime > 0 ? restTime : 60;
    const match = String(restTime).match(/(\d+)/);
    const parsed = match ? parseInt(match[1]) : 60;
    return parsed > 0 ? parsed : 60;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold">{exercise.name}</h2>
          {/* Botão de evolução */}
          <button
            type="button"
            onClick={onShowEvolution}
            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 mt-1"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Ver evolução
          </button>
        </div>
        <Badge variant="outline" className="text-xs">
          🏠 {exercise.location === 'gym' ? 'Academia' : 'Em Casa'}
        </Badge>
      </div>

      {/* Descrição RESUMIDA */}
      {exercise.description && (
        <p className="text-xs text-muted-foreground line-clamp-1">
          {exercise.description.slice(0, 50)}...
          <button 
            onClick={() => setShowDetailedInstructions(true)}
            className="text-primary ml-1 font-medium"
          >
            Ver mais
          </button>
        </p>
      )}

      {/* Player de Vídeo - Collapsible */}
      {youtubeId && (
        <div className="rounded-lg overflow-hidden border border-border/50">
          <button
            type="button"
            onClick={() => setShowVideo(!showVideo)}
            className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Youtube className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium">Ver vídeo do exercício</span>
            </div>
            {showVideo ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
          
          <AnimatePresence>
            {showVideo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="aspect-video">
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title={`Vídeo: ${exercise.name}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Stats Cards: Séries, Repetições, Descanso */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border border-border/50">
          <CardContent className="p-2 text-center">
            <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <p className="text-lg font-bold">{exercise.sets || '3'}</p>
            <p className="text-[10px] text-muted-foreground">Séries</p>
          </CardContent>
        </Card>
        <Card className="border border-border/50">
          <CardContent className="p-2 text-center">
            <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <Dumbbell className="w-3 h-3 text-emerald-500" />
            </div>
            <p className="text-lg font-bold">{exercise.reps || '12'}</p>
            <p className="text-[10px] text-muted-foreground">Repetições</p>
          </CardContent>
        </Card>
        <Card className="border border-border/50">
          <CardContent className="p-2 text-center">
            <div className="w-6 h-6 mx-auto mb-1 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
              <Clock className="w-3 h-3 text-emerald-500" />
            </div>
            <p className="text-lg font-bold">{parseRestTime(exercise.rest_time)}s</p>
            <p className="text-[10px] text-muted-foreground">Descanso</p>
          </CardContent>
        </Card>
      </div>

      {/* Dificuldade */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Dificuldade</span>
        <Badge 
          variant="outline" 
          className={cn(
            "capitalize",
            (exercise.difficulty === 'easy' || exercise.difficulty === 'facil') && "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
            (exercise.difficulty === 'intermediate' || exercise.difficulty === 'medio') && "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
            (exercise.difficulty === 'hard' || exercise.difficulty === 'dificil') && "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
          )}
        >
          {(exercise.difficulty === 'easy' || exercise.difficulty === 'facil') ? 'Fácil' : 
           (exercise.difficulty === 'intermediate' || exercise.difficulty === 'medio') ? 'Intermediário' : 
           (exercise.difficulty === 'hard' || exercise.difficulty === 'dificil') ? 'Difícil' : 'Normal'}
        </Badge>
      </div>

      {/* Botões: Instruções e Começar */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={() => setShowDetailedInstructions(!showDetailedInstructions)}
          className="gap-2"
        >
          <Info className="w-4 h-4" />
          Instruções
        </Button>
        
        <Button
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white gap-2"
          onClick={onStart}
        >
          <Play className="w-4 h-4" />
          Começar
        </Button>
      </div>

      {/* Instruções expandidas */}
      <AnimatePresence>
        {showDetailedInstructions && exercise.instructions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border border-border/50 bg-muted/30">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">Como fazer</span>
                </div>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  {exercise.instructions.map((step, i) => (
                    <li key={i} className="leading-relaxed">{step}</li>
                  ))}
                </ol>
                {exercise.tips && (
                  <div className="pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      <span className="font-medium text-sm">Dica do Personal</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{exercise.tips}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
