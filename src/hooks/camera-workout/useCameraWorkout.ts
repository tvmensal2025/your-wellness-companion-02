/**
 * 📷 useCameraWorkout Hook - Camera Workout System
 * Gerencia câmera, permissões e captura de frames
 * Validates: Requirements 1.1, 1.2, 1.3, 1.5
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { CameraConfig, CameraState, CameraStats } from '@/types/camera-workout';

const DEFAULT_CONFIG: CameraConfig = {
  resolution: 'medium',
  targetFPS: 15,
  facingMode: 'user',
  autoOptimize: true,
};

const RESOLUTION_MAP = {
  low: { width: 320, height: 240 },
  medium: { width: 640, height: 480 },
  high: { width: 1280, height: 720 },
};

interface UseCameraWorkoutReturn {
  // Estado
  state: CameraState;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  
  // Ações
  initialize: () => Promise<boolean>;
  startCapture: (config?: Partial<CameraConfig>) => Promise<void>;
  stopCapture: () => void;
  switchCamera: () => Promise<void>;
  captureFrame: () => ImageData | null;
  
  // Configuração
  config: CameraConfig;
  updateConfig: (config: Partial<CameraConfig>) => void;
}

export function useCameraWorkout(): UseCameraWorkoutReturn {
  const [state, setState] = useState<CameraState>({
    isInitialized: false,
    isCapturing: false,
    hasPermission: false,
    stats: {
      currentFPS: 0,
      resolution: { width: 0, height: 0 },
      batteryImpact: 'low',
      temperature: 0,
    },
  });

  const [config, setConfig] = useState<CameraConfig>(DEFAULT_CONFIG);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef(0);
  const lastFpsUpdateRef = useRef(Date.now());
  const animationFrameRef = useRef<number | null>(null);

  /**
   * Inicializa a câmera e solicita permissões
   */
  const initialize = useCallback(async (): Promise<boolean> => {
    try {
      // Verificar suporte
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setState(prev => ({
          ...prev,
          error: 'Câmera não suportada neste dispositivo',
        }));
        return false;
      }

      // Timeout de 2 segundos para inicialização
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout ao inicializar câmera')), 2000);
      });

      const permissionPromise = navigator.mediaDevices.getUserMedia({ video: true });

      try {
        const stream = await Promise.race([permissionPromise, timeoutPromise]);
        
        // Parar stream de teste
        stream.getTracks().forEach(track => track.stop());

        setState(prev => ({
          ...prev,
          isInitialized: true,
          hasPermission: true,
          error: undefined,
        }));

        return true;
      } catch (error) {
        if (error instanceof Error && error.message === 'Timeout ao inicializar câmera') {
          setState(prev => ({
            ...prev,
            error: 'Timeout ao inicializar câmera. Tente novamente.',
          }));
        } else {
          setState(prev => ({
            ...prev,
            hasPermission: false,
            error: 'Permissão de câmera negada',
          }));
        }
        return false;
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao inicializar câmera',
      }));
      return false;
    }
  }, []);

  /**
   * Inicia captura de vídeo
   */
  const startCapture = useCallback(async (customConfig?: Partial<CameraConfig>): Promise<void> => {
    const finalConfig = { ...config, ...customConfig };
    const resolution = RESOLUTION_MAP[finalConfig.resolution];

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: finalConfig.facingMode,
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
          frameRate: { ideal: finalConfig.targetFPS },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        // Obter resolução real
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();

        setState(prev => ({
          ...prev,
          isCapturing: true,
          stats: {
            ...prev.stats,
            resolution: {
              width: settings.width || resolution.width,
              height: settings.height || resolution.height,
            },
          },
        }));

        // Iniciar monitoramento de FPS
        startFpsMonitoring();
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Erro ao iniciar captura de vídeo',
      }));
    }
  }, [config]);

  /**
   * Para captura de vídeo
   */
  const stopCapture = useCallback((): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setState(prev => ({
      ...prev,
      isCapturing: false,
      stats: {
        ...prev.stats,
        currentFPS: 0,
      },
    }));
  }, []);

  /**
   * Alterna entre câmeras (frontal/traseira)
   */
  const switchCamera = useCallback(async (): Promise<void> => {
    const newFacingMode = config.facingMode === 'user' ? 'environment' : 'user';
    
    stopCapture();
    setConfig(prev => ({ ...prev, facingMode: newFacingMode }));
    
    // Pequeno delay para garantir que a câmera anterior foi liberada
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await startCapture({ facingMode: newFacingMode });
  }, [config.facingMode, stopCapture, startCapture]);

  /**
   * Captura um frame do vídeo
   */
  const captureFrame = useCallback((): ImageData | null => {
    if (!videoRef.current || !canvasRef.current) {
      return null;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx || video.readyState < 2) {
      return null;
    }

    // Ajustar tamanho do canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Desenhar frame
    ctx.drawImage(video, 0, 0);

    // Incrementar contador de frames
    frameCountRef.current++;

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }, []);

  /**
   * Monitora FPS
   */
  const startFpsMonitoring = useCallback(() => {
    const updateFps = () => {
      const now = Date.now();
      const elapsed = now - lastFpsUpdateRef.current;

      if (elapsed >= 1000) {
        const fps = (frameCountRef.current / elapsed) * 1000;
        
        setState(prev => ({
          ...prev,
          stats: {
            ...prev.stats,
            currentFPS: Math.round(fps),
            batteryImpact: fps > 25 ? 'high' : fps > 15 ? 'medium' : 'low',
          },
        }));

        frameCountRef.current = 0;
        lastFpsUpdateRef.current = now;
      }

      if (state.isCapturing) {
        animationFrameRef.current = requestAnimationFrame(updateFps);
      }
    };

    animationFrameRef.current = requestAnimationFrame(updateFps);
  }, [state.isCapturing]);

  /**
   * Atualiza configuração
   */
  const updateConfig = useCallback((newConfig: Partial<CameraConfig>): void => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  /**
   * Cleanup ao desmontar
   */
  useEffect(() => {
    return () => {
      stopCapture();
    };
  }, [stopCapture]);

  return {
    state,
    videoRef,
    canvasRef,
    initialize,
    startCapture,
    stopCapture,
    switchCamera,
    captureFrame,
    config,
    updateConfig,
  };
}
