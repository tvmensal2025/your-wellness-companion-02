// =====================================================
// VOICE INPUT BUTTON COMPONENT
// =====================================================
// Botão de entrada de voz com feedback visual
// Requirements: 6.1, 6.2
// =====================================================

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { useVoiceAssistant } from '@/hooks/dr-vital/useVoiceAssistant';

// =====================================================
// AUDIO VISUALIZER
// =====================================================

function AudioVisualizer({ isActive }: { isActive: boolean }) {
  const bars = 5;
  
  return (
    <div className="flex items-center justify-center gap-0.5 h-4">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary rounded-full"
          animate={isActive ? {
            height: [4, 16, 4],
          } : { height: 4 }}
          transition={{
            duration: 0.4,
            delay: i * 0.1,
            repeat: isActive ? Infinity : 0,
          }}
        />
      ))}
    </div>
  );
}

// =====================================================
// TRANSCRIPT DISPLAY
// =====================================================

interface TranscriptDisplayProps {
  transcript: string;
  confidence: number;
  isVisible: boolean;
}

function TranscriptDisplay({ transcript, confidence, isVisible }: TranscriptDisplayProps) {
  return (
    <AnimatePresence>
      {isVisible && transcript && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-full mb-2 left-0 right-0 p-3 rounded-lg bg-card border shadow-lg"
        >
          <p className="text-sm">{transcript}</p>
          {confidence > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Confiança: {Math.round(confidence * 100)}%
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface VoiceInputButtonProps {
  onTranscript?: (transcript: string) => void;
  onSubmit?: (transcript: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTranscript?: boolean;
  autoSubmit?: boolean;
  autoSubmitDelay?: number;
}

export function VoiceInputButton({
  onTranscript,
  onSubmit,
  className,
  size = 'md',
  showTranscript = true,
  autoSubmit = true,
  autoSubmitDelay = 1500,
}: VoiceInputButtonProps) {
  const [lastTranscript, setLastTranscript] = useState('');
  const [submitTimer, setSubmitTimer] = useState<NodeJS.Timeout | null>(null);

  const {
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    confidence,
    error,
    isSupported,
    toggleListening,
    stopListening,
    clearTranscript,
  } = useVoiceAssistant({
    onTranscript: (t) => {
      setLastTranscript(t);
      onTranscript?.(t);
      
      // Reset auto-submit timer
      if (submitTimer) {
        clearTimeout(submitTimer);
      }
    },
    onFinalTranscript: (t) => {
      if (autoSubmit && onSubmit) {
        // Set timer for auto-submit
        const timer = setTimeout(() => {
          onSubmit(t);
          stopListening();
          clearTranscript();
        }, autoSubmitDelay);
        setSubmitTimer(timer);
      }
    },
  });

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (submitTimer) {
        clearTimeout(submitTimer);
      }
    };
  }, [submitTimer]);

  const sizeConfig = {
    sm: { button: 'h-8 w-8', icon: 'w-4 h-4' },
    md: { button: 'h-10 w-10', icon: 'w-5 h-5' },
    lg: { button: 'h-12 w-12', icon: 'w-6 h-6' },
  };

  const config = sizeConfig[size];

  if (!isSupported) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        className={cn(config.button, className)}
        title="Reconhecimento de voz não suportado"
      >
        <MicOff className={cn(config.icon, 'text-muted-foreground')} />
      </Button>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Transcript Display */}
      {showTranscript && (
        <TranscriptDisplay
          transcript={lastTranscript}
          confidence={confidence}
          isVisible={isListening}
        />
      )}

      {/* Main Button */}
      <motion.div
        animate={isListening ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 1, repeat: isListening ? Infinity : 0 }}
      >
        <Button
          variant={isListening ? 'default' : 'outline'}
          size="icon"
          onClick={toggleListening}
          disabled={isProcessing && !isListening}
          className={cn(
            config.button,
            'relative overflow-hidden',
            isListening && 'bg-primary text-primary-foreground',
            error && 'border-red-500'
          )}
          title={isListening ? 'Parar gravação' : 'Iniciar gravação de voz'}
        >
          {/* Pulse ring when listening */}
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full bg-primary"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}

          {/* Icon */}
          <span className="relative z-10">
            {error ? (
              <AlertCircle className={cn(config.icon, 'text-red-500')} />
            ) : isListening ? (
              <AudioVisualizer isActive={true} />
            ) : isSpeaking ? (
              <Volume2 className={config.icon} />
            ) : (
              <Mic className={config.icon} />
            )}
          </span>
        </Button>
      </motion.div>

      {/* Error tooltip */}
      {error && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <p className="text-xs text-red-500 bg-background px-2 py-1 rounded shadow">
            {error === 'not-allowed' ? 'Permissão negada' : 'Erro de reconhecimento'}
          </p>
        </div>
      )}
    </div>
  );
}

export default VoiceInputButton;
