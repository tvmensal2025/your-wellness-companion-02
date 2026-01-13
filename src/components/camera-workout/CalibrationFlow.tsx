/**
 * 📐 CalibrationFlow - Fluxo de calibração guiado
 * Com animações e instruções claras para o usuário
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Check, 
  AlertCircle, 
  Sun, 
  Camera,
  X,
  Smartphone,
  Eye,
  Loader2,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import type { 
  CalibrationData, 
  ExerciseType,
} from '@/types/camera-workout';
import { EXERCISE_NAMES_PT } from '@/types/camera-workout';

interface CalibrationFlowProps {
  exerciseType: ExerciseType;
  onComplete: (calibration: CalibrationData) => void;
  onSkip?: () => void;
  onCancel?: () => void;
}

type CalibrationStep = 'intro' | 'permission' | 'positioning' | 'ready';

export function CalibrationFlow({
  exerciseType,
  onComplete,
  onSkip,
  onCancel,
}: CalibrationFlowProps) {
  const [step, setStep] = useState<CalibrationStep>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bodyDetected, setBodyDetected] = useState(false);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);

  // Refs para vídeo e stream
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionCountRef = useRef(0);
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      stopCamera();
    };
  }, []);

  // Parar câmera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Solicitar permissão e iniciar câmera
  const requestCameraPermission = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar suporte
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Câmera não suportada neste dispositivo');
        setIsLoading(false);
        return;
      }

      // Solicitar acesso à câmera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;

      // Aguardar o vídeo estar pronto
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Esperar o vídeo carregar
        await new Promise<void>((resolve, reject) => {
          if (!videoRef.current) {
            reject(new Error('Video ref not available'));
            return;
          }
          
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play()
              .then(() => resolve())
              .catch(reject);
          };
          
          // Timeout de segurança
          setTimeout(() => resolve(), 2000);
        });
      }

      setStep('positioning');
      setIsLoading(false);
      
      // Iniciar detecção simulada
      startPoseDetection();
      
    } catch (err) {
      console.error('Erro ao acessar câmera:', err);
      setError('Não foi possível acessar a câmera. Verifique as permissões.');
      setIsLoading(false);
    }
  }, []);

  // Detectar pose (simulado por enquanto)
  const startPoseDetection = useCallback(() => {
    detectionCountRef.current = 0;
    setDetectionProgress(0);
    setBodyDetected(false);

    // Simular detecção progressiva
    checkIntervalRef.current = setInterval(() => {
      detectionCountRef.current++;
      const progress = Math.min(100, detectionCountRef.current * 5);
      setDetectionProgress(progress);

      if (progress >= 100) {
        setBodyDetected(true);
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
        }
        // Ir para step ready após detectar
        setTimeout(() => setStep('ready'), 500);
      }
    }, 150);
  }, []);

  // Iniciar countdown e completar
  const startCountdownAndComplete = useCallback(() => {
    setShowCountdown(true);
    setCountdown(3);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          
          // IMPORTANTE: Parar a câmera ANTES de completar
          // O CameraWorkoutScreen vai iniciar sua própria câmera
          stopCamera();
          
          // Completar calibração
          const calibration: CalibrationData = {
            standingHeight: 170,
            shoulderWidth: 45,
            hipWidth: 35,
            naturalKneeAngle: 170,
            naturalHipAngle: 170,
            rangeOfMotion: {
              [exerciseType]: { min: 80, max: 170 }
            },
            thresholds: {
              repDownAngle: 90,
              repUpAngle: 160,
              safeZoneTolerance: 15
            },
            timestamp: new Date()
          };
          
          onComplete(calibration);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [exerciseType, onComplete, stopCamera]);

  // Pular calibração
  const handleSkip = useCallback(() => {
    stopCamera();
    const defaultCalibration: CalibrationData = {
      standingHeight: 170,
      shoulderWidth: 45,
      hipWidth: 35,
      naturalKneeAngle: 170,
      naturalHipAngle: 170,
      rangeOfMotion: {},
      thresholds: {
        repDownAngle: 90,
        repUpAngle: 160,
        safeZoneTolerance: 15
      },
      timestamp: new Date()
    };
    onComplete(defaultCalibration);
  }, [onComplete, stopCamera]);

  // Cancelar
  const handleCancel = useCallback(() => {
    stopCamera();
    onCancel?.();
  }, [onCancel, stopCamera]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Vídeo oculto que fica ativo durante todo o fluxo */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
      />

      <AnimatePresence mode="wait">
        {/* STEP 1: Introdução */}
        {step === 'intro' && (
          <IntroStep
            key="intro"
            exerciseType={exerciseType}
            onContinue={() => setStep('permission')}
            onSkip={handleSkip}
            onCancel={handleCancel}
          />
        )}

        {/* STEP 2: Permissão da câmera */}
        {step === 'permission' && (
          <PermissionStep
            key="permission"
            isLoading={isLoading}
            error={error}
            onRequestPermission={requestCameraPermission}
            onCancel={handleCancel}
          />
        )}

        {/* STEP 3: Posicionamento */}
        {step === 'positioning' && (
          <PositioningStep
            key="positioning"
            videoRef={videoRef}
            progress={detectionProgress}
            bodyDetected={bodyDetected}
            onCancel={handleCancel}
          />
        )}

        {/* STEP 4: Pronto para começar */}
        {step === 'ready' && (
          <ReadyStep
            key="ready"
            videoRef={videoRef}
            exerciseType={exerciseType}
            showCountdown={showCountdown}
            countdown={countdown}
            onStart={startCountdownAndComplete}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// STEP 1: Introdução
// ============================================
function IntroStep({
  exerciseType,
  onContinue,
  onSkip,
  onCancel
}: {
  exerciseType: ExerciseType;
  onContinue: () => void;
  onSkip?: () => void;
  onCancel?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="w-10" />
        <h1 className="text-lg font-semibold">Treino com Câmera</h1>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-white/70">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        {/* Ícone animado */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center">
            <Camera className="w-16 h-16 text-white" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 rounded-full border-4 border-emerald-400/30"
          />
        </motion.div>

        {/* Título */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{EXERCISE_NAMES_PT[exerciseType]}</h2>
          <p className="text-white/70">
            A câmera vai contar suas repetições automaticamente
          </p>
        </div>

        {/* Instruções */}
        <div className="space-y-4 w-full max-w-sm">
          <InstructionItem
            icon={<Smartphone className="w-5 h-5" />}
            text="Apoie o celular a ~2 metros de distância"
          />
          <InstructionItem
            icon={<User className="w-5 h-5" />}
            text="Fique de corpo inteiro na câmera"
          />
          <InstructionItem
            icon={<Sun className="w-5 h-5" />}
            text="Ambiente bem iluminado funciona melhor"
          />
        </div>
      </div>

      {/* Botões */}
      <div className="space-y-3 pt-6">
        <Button
          onClick={onContinue}
          size="lg"
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold h-14"
        >
          Configurar Câmera
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
        {onSkip && (
          <Button
            onClick={onSkip}
            variant="ghost"
            size="lg"
            className="w-full text-white/60 hover:text-white hover:bg-white/10"
          >
            Pular configuração
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// STEP 2: Permissão
// ============================================
function PermissionStep({
  isLoading,
  error,
  onRequestPermission,
  onCancel
}: {
  isLoading: boolean;
  error: string | null;
  onRequestPermission: () => void;
  onCancel?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col p-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="w-10" />
        <h1 className="text-lg font-semibold">Acesso à Câmera</h1>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-white/70">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
        <motion.div
          animate={isLoading ? { rotate: 360 } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
          ) : error ? (
            <AlertCircle className="w-12 h-12 text-red-400" />
          ) : (
            <Camera className="w-12 h-12 text-white" />
          )}
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold">
            {isLoading ? 'Conectando câmera...' : error ? 'Ops!' : 'Permissão necessária'}
          </h2>
          <p className="text-white/70 max-w-xs">
            {isLoading 
              ? 'Aguarde enquanto preparamos tudo'
              : error 
                ? error
                : 'Precisamos acessar sua câmera para detectar seus movimentos'
            }
          </p>
        </div>

        {error && (
          <Button
            onClick={onRequestPermission}
            variant="outline"
            className="border-white/30 text-white hover:bg-white/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Tentar novamente
          </Button>
        )}
      </div>

      {/* Botão */}
      {!isLoading && !error && (
        <div className="pt-6">
          <Button
            onClick={onRequestPermission}
            size="lg"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold h-14"
          >
            <Camera className="w-5 h-5 mr-2" />
            Permitir Câmera
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// STEP 3: Posicionamento
// ============================================
function PositioningStep({
  videoRef,
  progress,
  bodyDetected,
  onCancel
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  progress: number;
  bodyDetected: boolean;
  onCancel?: () => void;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Copiar stream do vídeo principal para o local
  useEffect(() => {
    if (videoRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = videoRef.current.srcObject;
      localVideoRef.current.play().catch(console.error);
    }
  }, [videoRef]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col relative"
    >
      {/* Vídeo da câmera */}
      <video
        ref={localVideoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Guia de posicionamento */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={bodyDetected ? { borderColor: '#22c55e' } : { borderColor: '#ffffff' }}
          className="w-48 h-72 border-4 border-dashed rounded-3xl relative"
        >
          {/* Ícone de pessoa */}
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <User className="w-32 h-48" />
          </div>
        </motion.div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-4">
        <div className="w-10" />
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
          <p className="text-sm font-medium">Posicione-se no quadro</p>
        </div>
        {onCancel && (
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-white/70 bg-black/30">
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Indicador de progresso */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/70 backdrop-blur-md rounded-2xl p-4 space-y-4"
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={bodyDetected ? {} : { scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                bodyDetected ? "bg-emerald-500" : "bg-white/20"
              )}
            >
              {bodyDetected ? (
                <Check className="w-5 h-5 text-white" />
              ) : (
                <Eye className="w-5 h-5 text-white" />
              )}
            </motion.div>
            <div className="flex-1">
              <p className="font-medium">
                {bodyDetected ? 'Corpo detectado!' : 'Detectando seu corpo...'}
              </p>
              <p className="text-sm text-white/60">
                {bodyDetected 
                  ? 'Tudo pronto para começar'
                  : 'Fique de corpo inteiro na câmera'
                }
              </p>
            </div>
          </div>

          <Progress value={progress} className="h-2 bg-white/20" />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ============================================
// STEP 4: Pronto
// ============================================
function ReadyStep({
  videoRef,
  exerciseType,
  showCountdown,
  countdown,
  onStart,
  onCancel
}: {
  videoRef: React.RefObject<HTMLVideoElement>;
  exerciseType: ExerciseType;
  showCountdown: boolean;
  countdown: number;
  onStart: () => void;
  onCancel?: () => void;
}) {
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Copiar stream do vídeo principal para o local
  useEffect(() => {
    if (videoRef.current && localVideoRef.current) {
      localVideoRef.current.srcObject = videoRef.current.srcObject;
      localVideoRef.current.play().catch(console.error);
    }
  }, [videoRef]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col relative"
    >
      {/* Vídeo da câmera */}
      <video
        ref={localVideoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
        autoPlay
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center p-4">
        <div className="w-10" />
        <div className="bg-emerald-500/90 backdrop-blur-sm rounded-full px-4 py-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <Check className="w-4 h-4" />
            Pronto!
          </p>
        </div>
        {onCancel && !showCountdown && (
          <Button variant="ghost" size="icon" onClick={onCancel} className="text-white/70 bg-black/30">
            <X className="w-5 h-5" />
          </Button>
        )}
        {showCountdown && <div className="w-10" />}
      </div>

      {/* Countdown ou botão */}
      <div className="flex-1 flex items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {showCountdown && (
            <motion.div
              key="countdown"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              className="text-center"
            >
              <motion.div
                key={countdown}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="w-32 h-32 rounded-full bg-emerald-500 flex items-center justify-center mb-4"
              >
                <span className="text-6xl font-bold">{countdown}</span>
              </motion.div>
              <p className="text-xl font-medium">Prepare-se!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Botão de iniciar */}
      {!showCountdown && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative z-10 p-6"
        >
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-4 space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-bold">{EXERCISE_NAMES_PT[exerciseType]}</h3>
              <p className="text-white/60">Câmera configurada com sucesso</p>
            </div>

            <Button
              onClick={onStart}
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold h-14 text-lg"
            >
              🏋️ Começar Treino
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================
// Componentes auxiliares
// ============================================
function InstructionItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 bg-white/10 rounded-xl p-3"
    >
      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
        {icon}
      </div>
      <p className="text-sm text-left flex-1">{text}</p>
    </motion.div>
  );
}
