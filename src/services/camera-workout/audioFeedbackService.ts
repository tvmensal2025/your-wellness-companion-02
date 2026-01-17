/**
 * Audio Feedback Service
 * 
 * Provides voice feedback for camera workout sessions.
 * Uses Web Speech API for text-to-speech.
 */

export interface AudioFeedbackConfig {
  enabled: boolean;
  volume: number; // 0-1
  rate: number; // 0.5-2
  pitch: number; // 0-2
  language: string;
}

class AudioFeedbackService {
  private synthesis: SpeechSynthesis | null = null;
  private config: AudioFeedbackConfig = {
    enabled: true,
    volume: 0.8,
    rate: 1.0,
    pitch: 1.0,
    language: 'pt-BR',
  };
  private lastSpokenTime = 0;
  private minSpeechInterval = 2000; // Minimum 2 seconds between speeches

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
    }
  }

  /**
   * Check if audio feedback is available
   */
  isAvailable(): boolean {
    return this.synthesis !== null;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<AudioFeedbackConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): AudioFeedbackConfig {
    return { ...this.config };
  }

  /**
   * Speak text with rate limiting
   */
  private speak(text: string, priority: 'high' | 'normal' = 'normal'): void {
    if (!this.synthesis || !this.config.enabled) return;

    const now = Date.now();
    const timeSinceLastSpeech = now - this.lastSpokenTime;

    // Rate limiting (except for high priority)
    if (priority === 'normal' && timeSinceLastSpeech < this.minSpeechInterval) {
      return;
    }

    // Cancel any ongoing speech for high priority
    if (priority === 'high') {
      this.synthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = this.config.language;
    utterance.volume = this.config.volume;
    utterance.rate = this.config.rate;
    utterance.pitch = this.config.pitch;

    this.synthesis.speak(utterance);
    this.lastSpokenTime = now;
  }

  /**
   * Announce rep count
   */
  announceRep(count: number): void {
    this.speak(`${count}`, 'high');
  }

  /**
   * Announce milestone
   */
  announceMilestone(count: number): void {
    const messages = [
      `${count} repetições! Continue assim!`,
      `Ótimo trabalho! ${count} reps!`,
      `Você está indo bem! ${count}!`,
    ];
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.speak(message, 'high');
  }

  /**
   * Provide form feedback
   */
  provideFormFeedback(feedback: string): void {
    this.speak(feedback, 'normal');
  }

  /**
   * Announce session start
   */
  announceStart(exerciseName: string): void {
    this.speak(`Iniciando ${exerciseName}. Vamos lá!`, 'high');
  }

  /**
   * Announce session pause
   */
  announcePause(): void {
    this.speak('Pausado', 'high');
  }

  /**
   * Announce session resume
   */
  announceResume(): void {
    this.speak('Continuando', 'high');
  }

  /**
   * Announce session end
   */
  announceEnd(totalReps: number): void {
    this.speak(`Treino finalizado! ${totalReps} repetições no total. Parabéns!`, 'high');
  }

  /**
   * Announce calibration instructions
   */
  announceCalibration(step: number, totalSteps: number, instruction: string): void {
    this.speak(`Passo ${step} de ${totalSteps}. ${instruction}`, 'high');
  }

  /**
   * Announce countdown
   */
  announceCountdown(seconds: number): void {
    if (seconds <= 3) {
      this.speak(`${seconds}`, 'high');
    }
  }

  /**
   * Announce error or warning
   */
  announceAlert(message: string): void {
    this.speak(message, 'high');
  }

  /**
   * Stop all speech
   */
  stop(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Test audio feedback
   */
  test(): void {
    this.speak('Teste de áudio. Se você está ouvindo isso, o áudio está funcionando.', 'high');
  }
}

// Singleton instance
export const audioFeedbackService = new AudioFeedbackService();
