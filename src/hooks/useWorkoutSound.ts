import { useCallback, useState, useRef, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface UseWorkoutSoundOptions {
  enabled?: boolean;
}

// Sons profissionais e agradáveis
const SOUND_PROFILES = {
  // Countdown: beep curto e claro
  countdown: { frequency: 660, duration: 0.1, volume: 0.5, type: 'sine' as OscillatorType },
  // Start: dois tons ascendentes (motivacional)
  start: { frequency: 523, duration: 0.12, volume: 0.5, type: 'sine' as OscillatorType },
  // Pause: tom suave descendente
  pause: { frequency: 440, duration: 0.15, volume: 0.35, type: 'sine' as OscillatorType },
  // Finish: acorde de vitória
  finish: { frequency: 784, duration: 0.2, volume: 0.55, type: 'sine' as OscillatorType },
  // Set complete: satisfatório
  setComplete: { frequency: 587, duration: 0.1, volume: 0.45, type: 'triangle' as OscillatorType },
  // Rest warning: alerta suave
  restWarning: { frequency: 880, duration: 0.08, volume: 0.4, type: 'sine' as OscillatorType },
};

export const useWorkoutSound = (options: UseWorkoutSoundOptions = {}) => {
  const [soundEnabled, setSoundEnabled] = useState(options.enabled ?? true);
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastPlayTimeRef = useRef<number>(0);

  // Inicializar AudioContext (com resume para iOS)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  // Debounce de 30ms para evitar sons sobrepostos
  const canPlaySound = useCallback(() => {
    const now = Date.now();
    if (now - lastPlayTimeRef.current < 30) return false;
    lastPlayTimeRef.current = now;
    return true;
  }, []);

  // Som base com envelope ADSR melhorado
  const playBeep = useCallback((
    frequency = 800, 
    duration = 0.2, 
    volume = 0.5,
    type: OscillatorType = 'sine'
  ) => {
    if (!soundEnabled || !canPlaySound()) return;
    
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      const now = audioContext.currentTime;
      
      // Envelope ADSR suave
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(volume, now + 0.008); // Attack rápido
      gainNode.gain.setValueAtTime(volume * 0.9, now + duration * 0.2); // Decay
      gainNode.gain.setValueAtTime(volume * 0.8, now + duration * 0.6); // Sustain
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release
      
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (err) {
      console.log('Audio not available:', err);
    }
  }, [soundEnabled, getAudioContext, canPlaySound]);

  // Som de início (dois tons ascendentes - motivacional)
  const playStartBeep = useCallback(() => {
    const { duration, volume, type } = SOUND_PROFILES.start;
    playBeep(523, duration, volume * 0.8, type); // C5
    setTimeout(() => playBeep(659, duration, volume, type), 100); // E5
  }, [playBeep]);

  // Som de pausa (tom descendente suave)
  const playPauseBeep = useCallback(() => {
    const { frequency, duration, volume, type } = SOUND_PROFILES.pause;
    playBeep(frequency, duration, volume, type);
  }, [playBeep]);

  // Som de countdown (últimos segundos - beep claro)
  const playCountdownBeep = useCallback((secondsLeft?: number) => {
    const { duration, volume, type } = SOUND_PROFILES.countdown;
    // Tom mais alto no último segundo
    const freq = secondsLeft === 1 ? 880 : 660;
    playBeep(freq, duration, volume, type);
  }, [playBeep]);

  // Som de finalização (acorde de vitória C-E-G)
  const playFinishBeep = useCallback(() => {
    const { duration, volume, type } = SOUND_PROFILES.finish;
    playBeep(523, duration * 0.8, volume * 0.7, type); // C5
    setTimeout(() => playBeep(659, duration * 0.8, volume * 0.8, type), 80); // E5
    setTimeout(() => playBeep(784, duration * 1.2, volume, type), 160); // G5
  }, [playBeep]);

  // Som de série concluída (satisfatório)
  const playSetCompleteBeep = useCallback(() => {
    const { frequency, duration, volume, type } = SOUND_PROFILES.setComplete;
    playBeep(frequency, duration, volume, type);
    setTimeout(() => playBeep(frequency * 1.2, duration * 1.1, volume * 1.05, type), 70);
  }, [playBeep]);

  // Som de aviso de descanso acabando
  const playRestWarningBeep = useCallback(() => {
    const { frequency, duration, volume, type } = SOUND_PROFILES.restWarning;
    playBeep(frequency, duration, volume, type);
  }, [playBeep]);

  // Vibração via Capacitor com fallback
  const vibrate = useCallback(async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!soundEnabled) return;
    
    try {
      await Haptics.impact({ style });
    } catch (err) {
      // Fallback para vibration API do navegador
      if ('vibrate' in navigator) {
        const duration = style === ImpactStyle.Light ? 30 : style === ImpactStyle.Heavy ? 150 : 80;
        navigator.vibrate(duration);
      }
    }
  }, [soundEnabled]);

  // Padrão de vibração customizado
  const vibratePattern = useCallback(async (pattern: number[]) => {
    if (!soundEnabled) return;
    
    try {
      // Capacitor não suporta padrões, usar fallback
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (err) {
      console.log('Vibration not available');
    }
  }, [soundEnabled]);

  const vibrateLight = useCallback(() => vibrate(ImpactStyle.Light), [vibrate]);
  const vibrateMedium = useCallback(() => vibrate(ImpactStyle.Medium), [vibrate]);
  const vibrateHeavy = useCallback(() => vibrate(ImpactStyle.Heavy), [vibrate]);

  // Vibração de sucesso (padrão satisfatório)
  const vibrateSuccess = useCallback(() => {
    vibratePattern([50, 30, 80]);
  }, [vibratePattern]);

  // Vibração de countdown
  const vibrateCountdown = useCallback(() => {
    vibratePattern([30]);
  }, [vibratePattern]);

  // Limpar AudioContext ao desmontar
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound: () => setSoundEnabled(prev => !prev),
    playBeep,
    playStartBeep,
    playPauseBeep,
    playCountdownBeep,
    playFinishBeep,
    playSetCompleteBeep,
    playRestWarningBeep,
    vibrateLight,
    vibrateMedium,
    vibrateHeavy,
    vibrateSuccess,
    vibrateCountdown,
    vibratePattern,
  };
};

export default useWorkoutSound;
