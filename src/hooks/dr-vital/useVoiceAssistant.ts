// =====================================================
// USE VOICE ASSISTANT HOOK
// =====================================================
// Hook para reconhecimento de voz e TTS
// Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6
// =====================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import type { VoiceAssistantState, VoiceAssistantConfig } from '@/types/dr-vital-revolution';

// =====================================================
// TYPES
// =====================================================

interface UseVoiceAssistantOptions {
  onTranscript?: (transcript: string) => void;
  onFinalTranscript?: (transcript: string) => void;
  autoSend?: boolean;
  enableTTS?: boolean;
}

interface UseVoiceAssistantReturn {
  // State
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  isSupported: boolean;
  
  // Actions
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  speak: (text: string) => void;
  stopSpeaking: () => void;
  clearTranscript: () => void;
  
  // Config
  config: VoiceAssistantConfig;
  updateConfig: (updates: Partial<VoiceAssistantConfig>) => void;
}

// =====================================================
// BROWSER SUPPORT CHECK
// =====================================================

const isSpeechRecognitionSupported = () => {
  if (typeof window === 'undefined') return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
};

const isSpeechSynthesisSupported = () => {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
};

// =====================================================
// GET SPEECH RECOGNITION
// =====================================================

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: { transcript: string; confidence: number };
}

const getSpeechRecognition = (): (new () => SpeechRecognitionInstance) | null => {
  if (typeof window === 'undefined') return null;
  
  const win = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  };
  
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
};

// =====================================================
// MAIN HOOK
// =====================================================

export function useVoiceAssistant(options: UseVoiceAssistantOptions = {}): UseVoiceAssistantReturn {
  const { onTranscript, onFinalTranscript, autoSend = true, enableTTS = true } = options;

  // State
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Config
  const [config, setConfig] = useState<VoiceAssistantConfig>({
    language: 'pt-BR',
    autoSend,
    enableTTS,
    voiceSpeed: 1,
  });

  // Refs
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check support
  const isSupported = isSpeechRecognitionSupported();
  const isTTSSupported = isSpeechSynthesisSupported();

  // Initialize recognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = config.language;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          setConfidence(result[0].confidence);
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const currentTranscript = finalTranscript || interimTranscript;
      setTranscript(currentTranscript);
      
      if (onTranscript) {
        onTranscript(currentTranscript);
      }

      if (finalTranscript && onFinalTranscript) {
        onFinalTranscript(finalTranscript);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [isSupported, config.language, onTranscript, onFinalTranscript]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    
    setTranscript('');
    setError(null);
    setIsProcessing(true);
    
    try {
      recognitionRef.current.start();
    } catch (err) {
      setError('Erro ao iniciar reconhecimento de voz');
      setIsProcessing(false);
    }
  }, [isListening]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    
    recognitionRef.current.stop();
  }, [isListening]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Speak text (TTS)
  const speak = useCallback((text: string) => {
    if (!isTTSSupported || !config.enableTTS) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.language;
    utterance.rate = config.voiceSpeed;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isTTSSupported, config.enableTTS, config.language, config.voiceSpeed]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    if (!isTTSSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isTTSSupported]);

  // Clear transcript
  const clearTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
  }, []);

  // Update config
  const updateConfig = useCallback((updates: Partial<VoiceAssistantConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    // State
    isListening,
    isProcessing,
    isSpeaking,
    transcript,
    confidence,
    error,
    isSupported,
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    clearTranscript,
    
    // Config
    config,
    updateConfig,
  };
}

export default useVoiceAssistant;
