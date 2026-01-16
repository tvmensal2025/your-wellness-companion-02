import { useState, useCallback } from 'react';

export interface UseTimerSoundProps {
  enabled?: boolean;
  externalEnabled?: boolean;
  onCountdownBeep?: () => void;
  onFinishBeep?: () => void;
  variant?: 'full' | 'compact' | 'inline' | 'mini';
}

export interface UseTimerSoundReturn {
  soundEnabled: boolean;
  toggleSound: () => void;
  playCountdownBeep: (remaining: number) => void;
  playFinishBeep: () => void;
  vibrate: (pattern?: number | number[]) => void;
}

export const useTimerSound = ({
  enabled = true,
  externalEnabled,
  onCountdownBeep,
  onFinishBeep,
  variant = 'full',
}: UseTimerSoundProps): UseTimerSoundReturn => {
  const [localSoundEnabled, setLocalSoundEnabled] = useState(enabled);
  
  // Controle de som (externo ou local)
  const soundEnabled = externalEnabled !== undefined ? externalEnabled : localSoundEnabled;

  // Toggle som
  const toggleSound = useCallback(() => {
    setLocalSoundEnabled(prev => !prev);
  }, []);

  // Tocar beep local
  const playLocalBeep = useCallback((frequency = 800, duration = 0.15) => {
    if (!soundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
    } catch (err) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  // Vibrar dispositivo
  const vibrate = useCallback((pattern: number | number[] = 100) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Beep de countdown (últimos 3 segundos)
  const playCountdownBeep = useCallback((remaining: number) => {
    if (onCountdownBeep) {
      onCountdownBeep();
    } else {
      const duration = variant === 'mini' ? 0.08 : 0.1;
      playLocalBeep(remaining === 1 ? 880 : 660, duration);
    }
    vibrate(variant === 'mini' ? 40 : 50);
  }, [onCountdownBeep, playLocalBeep, vibrate, variant]);

  // Beep de finalização
  const playFinishBeep = useCallback(() => {
    if (onFinishBeep) {
      onFinishBeep();
    } else {
      // Acorde de vitória
      playLocalBeep(523, 0.15);
      setTimeout(() => playLocalBeep(659, 0.15), 100);
      setTimeout(() => playLocalBeep(784, 0.2), 200);
    }
    vibrate([100, 50, 100, 50, 200]);
  }, [onFinishBeep, playLocalBeep, vibrate]);

  return {
    soundEnabled,
    toggleSound,
    playCountdownBeep,
    playFinishBeep,
    vibrate,
  };
};
