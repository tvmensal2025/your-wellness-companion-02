import { useCallback, useEffect, useState } from 'react';

// Types for haptic feedback
type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection';

interface HapticsAPI {
  impact: (style?: HapticStyle) => Promise<void>;
  notification: (type: 'success' | 'warning' | 'error') => Promise<void>;
  selection: () => Promise<void>;
  vibrate: (duration?: number) => Promise<void>;
  lightImpact: () => Promise<void>;
  mediumImpact: () => Promise<void>;
  heavyImpact: () => Promise<void>;
  isSupported: boolean;
}

/**
 * Hook for haptic feedback on mobile devices
 * Works with Capacitor Haptics plugin or falls back to Vibration API
 */
export const useHaptics = (): HapticsAPI => {
  const [isCapacitorAvailable, setIsCapacitorAvailable] = useState(false);
  const [haptics, setHaptics] = useState<any>(null);

  useEffect(() => {
    // Try to load Capacitor Haptics
    const loadCapacitorHaptics = async () => {
      try {
        const { Haptics } = await import('@capacitor/haptics');
        setHaptics(Haptics);
        setIsCapacitorAvailable(true);
      } catch {
        // Capacitor not available, will fallback to Vibration API
        setIsCapacitorAvailable(false);
      }
    };

    loadCapacitorHaptics();
  }, []);

  const isVibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;
  const isSupported = isCapacitorAvailable || isVibrationSupported;

  // Map style to vibration duration
  const getVibrationDuration = (style: HapticStyle): number => {
    switch (style) {
      case 'light':
      case 'selection':
        return 10;
      case 'medium':
        return 20;
      case 'heavy':
        return 40;
      case 'success':
        return 30;
      case 'warning':
        return 50;
      case 'error':
        return 100;
      default:
        return 20;
    }
  };

  // Impact feedback (taps, button presses)
  const impact = useCallback(async (style: HapticStyle = 'medium') => {
    if (!isSupported) return;

    try {
      if (isCapacitorAvailable && haptics) {
        const impactStyle = style === 'light' ? 'Light' 
          : style === 'heavy' ? 'Heavy' 
          : 'Medium';
        await haptics.impact({ style: impactStyle });
      } else if (isVibrationSupported) {
        navigator.vibrate(getVibrationDuration(style));
      }
    } catch (error) {
      console.debug('Haptic feedback not available:', error);
    }
  }, [isCapacitorAvailable, isVibrationSupported, haptics, isSupported]);

  // Shorthand methods
  const lightImpact = useCallback(async () => {
    await impact('light');
  }, [impact]);

  const mediumImpact = useCallback(async () => {
    await impact('medium');
  }, [impact]);

  const heavyImpact = useCallback(async () => {
    await impact('heavy');
  }, [impact]);

  // Notification feedback (success, warning, error)
  const notification = useCallback(async (type: 'success' | 'warning' | 'error') => {
    if (!isSupported) return;

    try {
      if (isCapacitorAvailable && haptics) {
        const notificationType = type === 'success' ? 'Success' 
          : type === 'warning' ? 'Warning' 
          : 'Error';
        await haptics.notification({ type: notificationType });
      } else if (isVibrationSupported) {
        const pattern = type === 'success' ? [20, 50, 20]
          : type === 'warning' ? [30, 30, 30, 30, 30]
          : [50, 50, 100];
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.debug('Haptic notification not available:', error);
    }
  }, [isCapacitorAvailable, isVibrationSupported, haptics, isSupported]);

  // Selection feedback (tab changes, toggles)
  const selection = useCallback(async () => {
    if (!isSupported) return;

    try {
      if (isCapacitorAvailable && haptics) {
        await haptics.selectionStart();
        await haptics.selectionEnd();
      } else if (isVibrationSupported) {
        navigator.vibrate(10);
      }
    } catch (error) {
      console.debug('Haptic selection not available:', error);
    }
  }, [isCapacitorAvailable, isVibrationSupported, haptics, isSupported]);

  // Custom vibration duration
  const vibrate = useCallback(async (duration: number = 20) => {
    if (!isSupported) return;

    try {
      if (isCapacitorAvailable && haptics) {
        await haptics.vibrate({ duration });
      } else if (isVibrationSupported) {
        navigator.vibrate(duration);
      }
    } catch (error) {
      console.debug('Vibration not available:', error);
    }
  }, [isCapacitorAvailable, isVibrationSupported, haptics, isSupported]);

  return {
    impact,
    notification,
    selection,
    vibrate,
    lightImpact,
    mediumImpact,
    heavyImpact,
    isSupported,
  };
};

export default useHaptics;
