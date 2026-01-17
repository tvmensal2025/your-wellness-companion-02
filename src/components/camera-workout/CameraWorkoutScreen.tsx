/**
 * 🎥 CameraWorkoutScreen - Tela principal de treino com câmera
 * CONTAGEM AUTOMÁTICA baseada em pose estimation via YOLO
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  CameraOff, 
  RotateCcw, 
  Play, 
  Pause, 
  Square,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Zap,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RepCounterDisplay } from './RepCounterDisplay';
import { FormFeedbackToast } from './FormFeedbackToast';
import { SkeletonOverlay } from './SkeletonOverlay';
import { DebugOverlay } from './DebugOverlay';
import { usePoseEstimation } from '@/hooks/camera-workout/usePoseEstimation';
import type { 
  ExerciseType, 
  WorkoutScreenState,
  CalibrationData,
  Keypoint,
} from '@/types/camera-workout';
import { EXERCISE_NAMES_PT } from '@/types/camera-workout';

interface CameraWorkoutScreenProps {
  exerciseType: ExerciseType;
  targetReps?: number;
  onComplete?: (stats: WorkoutStats) => void;
  onCancel?: () => void;
  calibration?: CalibrationData;
}

interface WorkoutStats {
  totalReps: number;
  validReps: number;
  partialReps: number;
  avgFormScore: number;
  durationSeconds: number;
}

export function CameraWorkoutScreen({
  exerciseType,
  targetReps = 10,
  onComplete,
  onCancel,
  calibration,
}: CameraWorkoutScreenProps) {
  // Estado da tela
  const [screenState, setScreenState] = useState<WorkoutScreenState>('initializing');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'tip' | 'warning' | 'celebration'>('tip');
  
  // Estado de contagem AUTOMÁTICA
  const [repCount, setRepCount] = useState(0);
  const [partialReps, setPartialReps] = useState(0);
  const [formScore, setFormScore] = useState(85);
  const [currentFPS, setCurrentFPS] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<'up' | 'down' | 'transition' | 'rest'>('up');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [isValidRep, setIsValidRep] = useState(false);
  const [detectionActive, setDetectionActive] = useState(false);

  // ✅ NOVOS ESTADOS PARA ESCALABILIDADE (Patch v1.0.0)
  const [currentKeypoints, setCurrentKeypoints] = useState<Keypoint[]>([]);
  const [currentAngles, setCurrentAngles] = useState<Record<string, number>>({});
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [showDebug, setShowDebug] = useState(false);
  const [feedbackQueue, setFeedbackQueue] = useState<Array<{
    message: string;
    type: 'tip' | 'warning' | 'celebration';
    timestamp: number;
  }>>([]);
  const lastRequestTimeRef = useRef<number>(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastRepCountRef = useRef(0);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());

  // Hook de pose estimation (YOLO)
  const sessionId = useRef(`workout-${Date.now()}`).current;
  const poseEstimation = usePoseEstimation({
    exerciseType,
    sessionId,
    calibration,
    mode: 'server',
  });

  // Ref para acessar poseEstimation no callback sem recriar
  const poseEstimationRef = useRef(poseEstimation);
  poseEstimationRef.current = poseEstimation;

  /**
   * Inicialização - câmera + YOLO
   */
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const initCamera = async (): Promise<boolean> => {
      try {
        console.log('📷 Iniciando câmera...');
        
        // Verificar se já existe um stream ativo e pará-lo
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }

        // Pequeno delay para garantir que a câmera anterior foi liberada
        await new Promise(resolve => setTimeout(resolve, 300));

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          return false;
        }

        streamRef.current = stream;
        console.log('📷 Stream obtido:', stream.getVideoTracks()[0]?.label);

        if (videoRef.current) {
          const video = videoRef.current;
          video.srcObject = stream;
          
          // Aguardar vídeo estar pronto com timeout mais robusto
          await new Promise<void>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              console.warn('⚠️ Timeout aguardando vídeo, continuando...');
              resolve();
            }, 3000);

            const handleLoadedData = () => {
              clearTimeout(timeoutId);
              video.removeEventListener('loadeddata', handleLoadedData);
              console.log('📷 Vídeo carregado:', video.videoWidth, 'x', video.videoHeight);
              resolve();
            };
            
            // Se já tem dados, resolve imediatamente
            if (video.readyState >= 2) {
              clearTimeout(timeoutId);
              console.log('📷 Vídeo já pronto:', video.videoWidth, 'x', video.videoHeight);
              resolve();
            } else {
              video.addEventListener('loadeddata', handleLoadedData);
            }
          });
          
          // Garantir que o vídeo está tocando
          try {
            video.muted = true; // Sempre muted para autoplay funcionar
            await video.play();
            console.log('📷 Vídeo tocando!');
          } catch (playErr) {
            console.error('❌ Erro ao tocar vídeo:', playErr);
            throw playErr;
          }
        }

        return true;
      } catch (err) {
        console.error('❌ Erro ao inicializar câmera:', err);
        return false;
      }
    };

    const init = async () => {
      setScreenState('initializing');
      
      try {
        // Tentar inicializar câmera com retries
        let cameraSuccess = false;
        while (!cameraSuccess && retryCount < maxRetries && mounted) {
          cameraSuccess = await initCamera();
          if (!cameraSuccess) {
            retryCount++;
            console.log(`📷 Tentativa ${retryCount}/${maxRetries}...`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        if (!mounted) return;

        if (!cameraSuccess) {
          console.error('❌ Falha ao inicializar câmera após', maxRetries, 'tentativas');
          setScreenState('error');
          return;
        }

        // 2. Inicializar YOLO-Pose
        console.log('🦾 Inicializando YOLO-Pose...');
        const yoloReady = await poseEstimation.initialize();
        console.log('🦾 YOLO-Pose pronto:', yoloReady);

        if (!mounted) return;

        setScreenState('ready');
        console.log('✅ Tudo pronto!');
      } catch (err) {
        console.error('❌ Erro ao inicializar:', err);
        if (mounted) {
          setScreenState('error');
        }
      }
    };

    init();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
      poseEstimation.endSession();
    };
  }, [exerciseType, calibration]);

  /**
   * Completa o treino
   */
  const completeWorkout = useCallback(() => {
    setScreenState('completed');
    setDetectionActive(false);

    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

    const workoutStats: WorkoutStats = {
      totalReps: repCount,
      validReps: repCount,
      partialReps: partialReps,
      avgFormScore: formScore,
      durationSeconds: duration,
    };

    onComplete?.(workoutStats);
  }, [repCount, partialReps, formScore, onComplete]);

  /**
   * Captura frame do vídeo e envia para YOLO
   */
  const captureAndAnalyzeFrame = useCallback(async () => {
    // 🛡️ RATE LIMITING: Máximo 15 FPS (Patch v1.0.0)
    const now = Date.now();
    const timeSinceLastRequest = now - (lastRequestTimeRef.current || 0);
    const minInterval = 1000 / 10;  // Otimizado: 10 FPS (+50% capacidade) // 66ms = 15 FPS
    
    if (timeSinceLastRequest < minInterval) {
      return; // Pular frame
    }
    lastRequestTimeRef.current = now;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      console.warn('⚠️ Refs não disponíveis - video:', !!video, 'canvas:', !!canvas);
      return;
    }
    
    // Usar ref para verificar estado atual
    if (screenState !== 'counting') {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.warn('⚠️ Canvas context não disponível');
      return;
    }

    // Verificar se o vídeo tem dimensões válidas
    if (!video.videoWidth || !video.videoHeight) {
      console.warn('⚠️ Vídeo sem dimensões válidas:', video.videoWidth, 'x', video.videoHeight, 'readyState:', video.readyState);
      return;
    }

    // Verificar se o vídeo está pausado
    if (video.paused) {
      console.warn('⚠️ Vídeo pausado, tentando retomar...');
      try {
        await video.play();
      } catch (e) {
        console.error('❌ Erro ao retomar vídeo:', e);
      }
      return;
    }

    // Usar ref para acessar poseEstimation atual
    const pose = poseEstimationRef.current;
    
    // Verificar se YOLO está pronto
    if (!pose.isReady) {
      console.warn('⚠️ YOLO não está pronto ainda');
      return;
    }

    // Se já está processando, pular este frame
    if (pose.isProcessing) {
      return;
    }

    try {
      // Desenhar frame no canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Obter ImageData
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Enviar para YOLO-Pose
      const result = await pose.detectPose(imageData);

      if (result) {
        console.log('🦾 YOLO Result:', {
          success: result.success,
          keypoints: result.keypoints?.length,
          rep_count: result.rep_count,
          phase: result.current_phase,
          is_valid_rep: result.is_valid_rep,
          angles: result.angles
        });

        if (result.success) {
          // USAR CONTAGEM DO SERVIDOR YOLO (já faz a detecção de reps)
          setCurrentPhase(result.current_phase as any || 'up');
          setPhaseProgress(result.phase_progress || 0);
          setIsValidRep(result.is_valid_rep || false);
          setPartialReps(result.partial_reps || 0);

          // CONTAGEM AUTOMÁTICA - usar rep_count do servidor
          if (result.rep_count > lastRepCountRef.current) {
            lastRepCountRef.current = result.rep_count;
            setRepCount(result.rep_count);

            // Feedback de celebração
            setCurrentFeedback(`🔥 Rep ${result.rep_count}! Muito bom!`);
            setFeedbackType('celebration');

            // Vibração haptic se disponível
            if (navigator.vibrate && soundEnabled) {
              navigator.vibrate(100);
            }

            // Verificar se completou
            if (result.rep_count >= targetReps) {
              setTimeout(() => completeWorkout(), 500);
            }
          }

          // Usar form hints do servidor se disponíveis
          if (result.form_hints && result.form_hints.length > 0) {
            const hint = result.form_hints[0];
            if (hint.message && !currentFeedback) {
              setCurrentFeedback(hint.message);
              setFeedbackType('tip');
            }
          }

          // Mostrar warnings do servidor
          if (result.warnings && result.warnings.length > 0 && !currentFeedback) {
            setCurrentFeedback(result.warnings[0]);
            setFeedbackType('warning');
          }
        } else {
          console.warn('⚠️ YOLO retornou success=false');
        }
      }
    } catch (err) {
      console.error('❌ Erro ao capturar/analisar frame:', err);
    }

    // Atualizar FPS
    frameCountRef.current++;
    const now = Date.now();
    if (now - lastFpsUpdateRef.current >= 1000) {
      setCurrentFPS(frameCountRef.current);
      frameCountRef.current = 0;
      lastFpsUpdateRef.current = now;
    }
  }, [screenState, targetReps, soundEnabled, currentFeedback, completeWorkout]);

  /**
   * Loop de detecção automática
   */
  useEffect(() => {
    if (screenState === 'counting' && detectionActive) {
      // Processar frames a ~15 FPS para não sobrecarregar
      frameIntervalRef.current = setInterval(captureAndAnalyzeFrame, 66);
    } else {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    }

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  },  [screenState, detectionActive, captureAndAnalyzeFrame]);

  /**
   * ✅ SISTEMA DE FILA DE FEEDBACK (Patch v1.0.0)
   * Processa fila de feedback (mostra 1 por vez, 3s cada)
   */
  useEffect(() => {
    if (feedbackQueue.length === 0 || currentFeedback) return;
    
    const nextFeedback = feedbackQueue[0];
    const age = Date.now() - nextFeedback.timestamp;
    
    // Expirar feedbacks antigos (>10s)
    if (age > 10000) {
      setFeedbackQueue(prev => prev.slice(1));
      return;
    }
    
    // Mostrar próximo feedback
    setCurrentFeedback(nextFeedback.message);
    setFeedbackType(nextFeedback.type);
    
    // Auto-dismiss após 3s
    const timer = setTimeout(() => {
      setCurrentFeedback(null);
      setFeedbackQueue(prev => prev.slice(1));
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [feedbackQueue, currentFeedback]);

  /**
   * Inicia o treino com CONTAGEM AUTOMÁTICA
   */
  const startWorkout = useCallback(() => {
    setScreenState('counting');
    startTimeRef.current = Date.now();
    setRepCount(0);
    setPartialReps(0);
    lastRepCountRef.current = 0;

    // Ativar detecção automática
    setDetectionActive(true);

    setCurrentFeedback('🎯 Detecção ativa! Faça o movimento e a contagem será automática');
    setFeedbackType('tip');
  }, []);

  /**
   * Pausa o treino
   */
  const pauseWorkout = useCallback(() => {
    setScreenState('paused');
    setDetectionActive(false);
  }, []);

  /**
   * Retoma o treino
   */
  const resumeWorkout = useCallback(() => {
    setScreenState('counting');
    setDetectionActive(true);
  }, []);

  /**
   * Cancela o treino
   */
  const cancelWorkout = useCallback(() => {
    setDetectionActive(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    poseEstimation.endSession();
    onCancel?.();
  }, [onCancel, poseEstimation]);

  /**
   * Alterna câmera frontal/traseira
   */
  const switchCamera = useCallback(async () => {
    if (!streamRef.current) return;
    
    // Parar stream atual
    streamRef.current.getTracks().forEach(track => track.stop());
    
    // Determinar novo facingMode
    const currentTrack = streamRef.current.getVideoTracks()[0];
    const currentFacing = currentTrack?.getSettings().facingMode;
    const newFacing = currentFacing === 'user' ? 'environment' : 'user';
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacing },
        audio: false,
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Erro ao trocar câmera:', err);
    }
  }, []);

  /**
   * Toggle fullscreen
   */
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  /**
   * Dismiss feedback
   */
  const dismissFeedback = useCallback(() => {
    setCurrentFeedback(null);
  }, []);

  // Renderização baseada no estado
  const renderContent = () => {
    switch (screenState) {
      case 'initializing':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            <p className="text-muted-foreground">Preparando câmera...</p>
          </div>
        );

      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-4 text-center">
            <CameraOff className="h-16 w-16 text-destructive" />
            <h3 className="text-lg font-semibold">Erro ao inicializar</h3>
            <p className="text-muted-foreground">
              Não foi possível acessar a câmera
            </p>
            <Button onClick={() => window.location.reload()}>
              Tentar novamente
            </Button>
          </div>
        );

      case 'ready':
      case 'counting':
      case 'paused':
        return (
          <>
            {/* Indicador de fase do movimento */}
            {screenState === 'counting' && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-background/80 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    currentPhase === 'down' ? "bg-yellow-500 animate-pulse" : "bg-green-500"
                  )} />
                  <span className="text-sm font-medium">
                    {currentPhase === 'down' ? 'Descendo...' : 'Posição inicial'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(phaseProgress)}%
                  </span>
                </div>
              </div>
            )}

            {/* Contador de reps */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
              <RepCounterDisplay
                currentReps={repCount}
                targetReps={targetReps}
                isValidRep={isValidRep}
                partialReps={partialReps}
                formScore={formScore}
              />
            </div>

            {/* Feedback toast */}
            {currentFeedback && (
              <FormFeedbackToast
                message={currentFeedback}
                type={feedbackType}
                onDismiss={dismissFeedback}
              />
            )}

            {/* Indicador de detecção ativa */}
            {screenState === 'counting' && detectionActive && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-green-500/90 backdrop-blur rounded-full px-4 py-2 flex items-center gap-2 animate-pulse">
                  <Target className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-white">
                    Detecção automática ativa
                  </span>
                  <span className="text-xs text-white/80">
                    {currentFPS} FPS
                  </span>
                </div>
              </div>
            )}

            {/* Controles */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4 z-20">
              {screenState === 'ready' && (
                <Button
                  size="lg"
                  onClick={startWorkout}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Iniciar Treino
                </Button>
              )}

              {screenState === 'counting' && (
                <>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={pauseWorkout}
                  >
                    <Pause className="mr-2 h-5 w-5" />
                    Pausar
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={cancelWorkout}
                  >
                    <Square className="mr-2 h-5 w-5" />
                    Encerrar
                  </Button>
                </>
              )}

              {screenState === 'paused' && (
                <>
                  <Button
                    size="lg"
                    onClick={resumeWorkout}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Continuar
                  </Button>
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={cancelWorkout}
                  >
                    <Square className="mr-2 h-5 w-5" />
                    Encerrar
                  </Button>
                </>
              )}
            </div>

            {/* Barra de ferramentas */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
              <Button
                size="icon"
                variant="secondary"
                onClick={switchCamera}
                className="bg-background/80 backdrop-blur"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              
              <Button
                size="icon"
                variant="secondary"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="bg-background/80 backdrop-blur"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>

              <Button
                size="icon"
                variant="secondary"
                onClick={() => setShowSkeleton(!showSkeleton)}
                className={cn(
                  "bg-background/80 backdrop-blur",
                  showSkeleton && "ring-2 ring-primary"
                )}
                title={showSkeleton ? "Ocultar Esqueleto" : "Mostrar Esqueleto"}
              >
                <Target className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="secondary"
                onClick={toggleFullscreen}
                className="bg-background/80 backdrop-blur"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>

            {/* Info do exercício */}
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur rounded-lg px-3 py-2 z-20">
              <p className="text-sm font-medium">{EXERCISE_NAMES_PT[exerciseType]}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-500" />
                Contagem automática
              </p>
            </div>
          </>
        );

      case 'completed':
        return (
          <div className="flex flex-col items-center justify-center h-full gap-6 p-4 text-center">
            <div className="text-6xl">🎉</div>
            <h2 className="text-2xl font-bold">Treino Completo!</h2>
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">
                  {repCount}
                </p>
                <p className="text-sm text-muted-foreground">Repetições</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-3xl font-bold text-primary">
                  {formScore}%
                </p>
                <p className="text-sm text-muted-foreground">Forma</p>
              </Card>
            </div>
            <Button onClick={cancelWorkout} className="mt-4">
              Finalizar
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full bg-black overflow-hidden",
        isFullscreen ? "fixed inset-0 z-50" : ""
      )}
    >
      {/* Vídeo SEMPRE renderizado para manter a ref estável */}
      <video
        ref={videoRef}
        className={cn(
          "absolute inset-0 w-full h-full object-cover",
          screenState === 'initializing' || screenState === 'error' || screenState === 'completed' 
            ? "hidden" 
            : ""
        )}
        playsInline
        muted
        autoPlay
        style={{ 
          minWidth: '100%', 
          minHeight: '100%',
          transform: 'scaleX(-1)', // Espelhar para selfie
        }}
      />
      
      {/* Canvas SEMPRE renderizado para captura de frames */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* ✅ SKELETON OVERLAY - Feedback visual (Patch v1.0.0) */}
      {showSkeleton && currentKeypoints.length > 0 && 
       (screenState === 'counting' || screenState === 'paused') && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <SkeletonOverlay
            keypoints={currentKeypoints}
            formScore={formScore}
            showLabels={false}
            animate={true}
          />
        </div>
      )}
      
      {renderContent()}
    </div>
  );
}
