/**
 * 📷 CameraWorkoutModal - Modal para treino com câmera
 * Abre a câmera já configurada para o exercício selecionado
 */

import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  X, 
  Play, 
  AlertTriangle,
  Smartphone,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { ExerciseType, CalibrationData } from '@/types/camera-workout';
import { EXERCISE_NAMES_PT } from '@/types/camera-workout';
import { CameraWorkoutScreen } from '@/components/camera-workout/CameraWorkoutScreen';
import { CalibrationFlow } from '@/components/camera-workout/CalibrationFlow';

interface WorkoutStats {
  totalReps: number;
  validReps: number;
  partialReps: number;
  avgFormScore: number;
  durationSeconds: number;
}

interface CameraWorkoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseName: string;
  exerciseType: ExerciseType;
  targetReps?: number;
  targetSets?: number;
  onComplete?: (reps: number, formScore: number) => void;
}

type ModalStep = 'intro' | 'calibration' | 'workout' | 'complete';

export function CameraWorkoutModal({
  open,
  onOpenChange,
  exerciseName,
  exerciseType,
  targetReps = 12,
  targetSets = 3,
  onComplete
}: CameraWorkoutModalProps) {
  const [step, setStep] = useState<ModalStep>('intro');
  const [calibration, setCalibration] = useState<CalibrationData | null>(null);
  const [completedReps, setCompletedReps] = useState(0);
  const [formScore, setFormScore] = useState(0);

  const handleClose = useCallback(() => {
    setStep('intro');
    setCalibration(null);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleCalibrationComplete = useCallback((data: CalibrationData) => {
    setCalibration(data);
    setStep('workout');
  }, []);

  const handleCalibrationSkip = useCallback(() => {
    // Usar calibração padrão
    const defaultCalibration: CalibrationData = {
      standingHeight: 170,
      shoulderWidth: 45,
      hipWidth: 35,
      naturalKneeAngle: 180,
      naturalHipAngle: 180,
      rangeOfMotion: {},
      thresholds: {
        repDownAngle: 90,
        repUpAngle: 160,
        safeZoneTolerance: 15
      },
      timestamp: new Date()
    };
    setCalibration(defaultCalibration);
    setStep('workout');
  }, []);

  const handleWorkoutComplete = useCallback((stats: WorkoutStats) => {
    setCompletedReps(stats.totalReps);
    setFormScore(Math.round(stats.avgFormScore));
    setStep('complete');
    onComplete?.(stats.totalReps, Math.round(stats.avgFormScore));
  }, [onComplete]);

  const handleStartAgain = useCallback(() => {
    setStep('calibration');
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-full h-[100dvh] p-0 gap-0 bg-background">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <IntroStep
              key="intro"
              exerciseName={exerciseName}
              exerciseType={exerciseType}
              targetReps={targetReps}
              onStart={() => setStep('calibration')}
              onClose={handleClose}
            />
          )}

          {step === 'calibration' && (
            <motion.div
              key="calibration"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <CalibrationFlow
                exerciseType={exerciseType}
                onComplete={handleCalibrationComplete}
                onSkip={handleCalibrationSkip}
              />
            </motion.div>
          )}

          {step === 'workout' && calibration && (
            <motion.div
              key="workout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <CameraWorkoutScreen
                exerciseType={exerciseType}
                targetReps={targetReps}
                calibration={calibration}
                onComplete={handleWorkoutComplete}
                onCancel={handleClose}
              />
            </motion.div>
          )}

          {step === 'complete' && (
            <CompleteStep
              key="complete"
              exerciseName={exerciseName}
              completedReps={completedReps}
              targetReps={targetReps}
              formScore={formScore}
              onClose={handleClose}
              onStartAgain={handleStartAgain}
            />
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Tela de introdução
function IntroStep({
  exerciseName,
  exerciseType,
  targetReps,
  onStart,
  onClose
}: {
  exerciseName: string;
  exerciseType: ExerciseType;
  targetReps: number;
  onStart: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white p-4"
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <Badge className="bg-white/20 border-0 text-white">
          <Camera className="w-3 h-3 mr-1" />
          Treino com Câmera
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Camera className="w-12 h-12" />
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{exerciseName}</h1>
          <p className="text-white/80">
            {EXERCISE_NAMES_PT[exerciseType]} • {targetReps} repetições
          </p>
        </div>

        <Card className="bg-white/10 border-white/20 max-w-sm">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Como funciona
            </h3>
            <ul className="text-sm text-white/90 space-y-2 text-left">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>A câmera detecta seus movimentos em tempo real</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Conta suas repetições automaticamente</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Dá feedback sobre sua forma em tempo real</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-amber-500/20 border-amber-400/30 max-w-sm">
          <CardContent className="p-3 flex items-start gap-2">
            <Smartphone className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-left">
              Posicione o celular a ~2m de distância, de forma que seu corpo inteiro apareça na câmera
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Button
        onClick={onStart}
        size="lg"
        className="w-full bg-white text-emerald-600 hover:bg-white/90 font-semibold"
      >
        <Play className="w-5 h-5 mr-2" fill="currentColor" />
        Começar Calibração
      </Button>
    </motion.div>
  );
}

// Tela de conclusão
function CompleteStep({
  exerciseName,
  completedReps,
  targetReps,
  formScore,
  onClose,
  onStartAgain
}: {
  exerciseName: string;
  completedReps: number;
  targetReps: number;
  formScore: number;
  onClose: () => void;
  onStartAgain: () => void;
}) {
  const percentage = Math.round((completedReps / targetReps) * 100);
  const isGoalMet = completedReps >= targetReps;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="h-full flex flex-col bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white p-4"
    >
      {/* Header */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className={cn(
            "w-28 h-28 rounded-full flex items-center justify-center",
            isGoalMet ? "bg-emerald-400" : "bg-amber-400"
          )}
        >
          {isGoalMet ? (
            <CheckCircle2 className="w-14 h-14 text-white" />
          ) : (
            <AlertTriangle className="w-14 h-14 text-white" />
          )}
        </motion.div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {isGoalMet ? 'Parabéns! 🎉' : 'Bom trabalho!'}
          </h1>
          <p className="text-white/80">{exerciseName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{completedReps}</p>
              <p className="text-xs text-white/70">Repetições</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold">{formScore}%</p>
              <p className="text-xs text-white/70">Forma</p>
            </CardContent>
          </Card>
        </div>

        <Badge 
          className={cn(
            "text-sm px-4 py-2",
            isGoalMet 
              ? "bg-emerald-400/30 text-white border-emerald-400/50" 
              : "bg-amber-400/30 text-white border-amber-400/50"
          )}
        >
          {percentage}% da meta ({targetReps} reps)
        </Badge>
      </div>

      {/* Footer */}
      <div className="space-y-3">
        <Button
          onClick={onStartAgain}
          variant="outline"
          size="lg"
          className="w-full border-white/30 text-white hover:bg-white/10"
        >
          <Play className="w-5 h-5 mr-2" />
          Fazer Mais Uma Série
        </Button>
        <Button
          onClick={onClose}
          size="lg"
          className="w-full bg-white text-emerald-600 hover:bg-white/90 font-semibold"
        >
          Concluir
        </Button>
      </div>
    </motion.div>
  );
}
