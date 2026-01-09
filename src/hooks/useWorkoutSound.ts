import { useCallback, useState, useRef, useEffect } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface UseWorkoutSoundOptions {
  enabled?: boolean;
}

export const useWorkoutSound = (options: UseWorkoutSoundOptions = {}) => {
  const [soundEnabled, setSoundEnabled] = useState(options.enabled ?? true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Inicializar AudioContext apenas uma vez
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Som de apito (beep)
  const playBeep = useCallback((frequency = 800, duration = 0.3, volume = 0.5) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = getAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (err) {
      console.log('Audio not available:', err);
    }
  }, [soundEnabled, getAudioContext]);

  // Beep de início (tom mais alto)
  const playStartBeep = useCallback(() => {
    playBeep(880, 0.2, 0.6);
  }, [playBeep]);

  // Beep de pausa (tom mais baixo)
  const playPauseBeep = useCallback(() => {
    playBeep(440, 0.3, 0.4);
  }, [playBeep]);

  // Beep de contagem regressiva (últimos 10s)
  const playCountdownBeep = useCallback(() => {
    playBeep(600, 0.1, 0.3);
  }, [playBeep]);

  // Beep final (tom duplo)
  const playFinishBeep = useCallback(() => {
    playBeep(1000, 0.15, 0.6);
    setTimeout(() => playBeep(1200, 0.3, 0.6), 150);
  }, [playBeep]);

  // Beep de série concluída
  const playSetCompleteBeep = useCallback(() => {
    playBeep(700, 0.1, 0.4);
    setTimeout(() => playBeep(900, 0.15, 0.5), 100);
  }, [playBeep]);

  // Vibração via Capacitor
  const vibrate = useCallback(async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (!soundEnabled) return;
    
    try {
      await Haptics.impact({ style });
    } catch (err) {
      // Fallback para vibration API do navegador
      if ('vibrate' in navigator) {
        const duration = style === ImpactStyle.Light ? 50 : style === ImpactStyle.Heavy ? 200 : 100;
        navigator.vibrate(duration);
      }
    }
  }, [soundEnabled]);

  // Vibração leve
  const vibrateLight = useCallback(() => vibrate(ImpactStyle.Light), [vibrate]);

  // Vibração média
  const vibrateMedium = useCallback(() => vibrate(ImpactStyle.Medium), [vibrate]);

  // Vibração forte
  const vibrateHeavy = useCallback(() => vibrate(ImpactStyle.Heavy), [vibrate]);

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
    vibrateLight,
    vibrateMedium,
    vibrateHeavy,
  };
};

export default useWorkoutSound;
