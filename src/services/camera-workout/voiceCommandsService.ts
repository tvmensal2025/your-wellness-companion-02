/**
 * Voice Commands Service
 * 
 * Enables voice control for camera workout sessions.
 * Uses Web Speech API for speech recognition.
 */

export type VoiceCommand = 'pause' | 'resume' | 'stop' | 'start' | 'help';

export interface VoiceCommandConfig {
  enabled: boolean;
  language: string;
  continuous: boolean;
}

class VoiceCommandsService {
  private recognition: any = null; // SpeechRecognition
  private config: VoiceCommandConfig = {
    enabled: false,
    language: 'pt-BR',
    continuous: true,
  };
  private commandCallbacks: Map<VoiceCommand, (() => void)[]> = new Map();
  private isListening = false;

  // Command patterns in Portuguese
  private commandPatterns: Record<VoiceCommand, RegExp[]> = {
    pause: [
      /pausar/i,
      /pausa/i,
      /para/i,
      /parar/i,
    ],
    resume: [
      /continuar/i,
      /continua/i,
      /retomar/i,
      /voltar/i,
    ],
    stop: [
      /encerrar/i,
      /terminar/i,
      /finalizar/i,
      /sair/i,
    ],
    start: [
      /começar/i,
      /iniciar/i,
      /começe/i,
      /inicie/i,
    ],
    help: [
      /ajuda/i,
      /socorro/i,
      /comandos/i,
    ],
  };

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
    }
  }

  /**
   * Setup speech recognition
   */
  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.lang = this.config.language;
    this.recognition.continuous = this.config.continuous;
    this.recognition.interimResults = false;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      console.log('Voice command heard:', transcript);
      this.processTranscript(transcript);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech') {
        // Restart if no speech detected
        if (this.isListening) {
          this.recognition.start();
        }
      }
    };

    this.recognition.onend = () => {
      // Restart if still enabled
      if (this.isListening && this.config.enabled) {
        try {
          this.recognition.start();
        } catch (error) {
          console.error('Error restarting recognition:', error);
        }
      }
    };
  }

  /**
   * Process transcript and match commands
   */
  private processTranscript(transcript: string): void {
    for (const [command, patterns] of Object.entries(this.commandPatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(transcript)) {
          this.executeCommand(command as VoiceCommand);
          return;
        }
      }
    }
  }

  /**
   * Execute command
   */
  private executeCommand(command: VoiceCommand): void {
    console.log('Executing voice command:', command);
    const callbacks = this.commandCallbacks.get(command);
    if (callbacks) {
      callbacks.forEach(callback => callback());
    }
  }

  /**
   * Check if voice commands are available
   */
  isAvailable(): boolean {
    return this.recognition !== null;
  }

  /**
   * Start listening for commands
   */
  start(): void {
    if (!this.recognition || !this.config.enabled) return;

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('Voice commands started');
    } catch (error) {
      console.error('Error starting voice commands:', error);
    }
  }

  /**
   * Stop listening for commands
   */
  stop(): void {
    if (!this.recognition) return;

    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('Voice commands stopped');
    } catch (error) {
      console.error('Error stopping voice commands:', error);
    }
  }

  /**
   * Register command callback
   */
  onCommand(command: VoiceCommand, callback: () => void): () => void {
    if (!this.commandCallbacks.has(command)) {
      this.commandCallbacks.set(command, []);
    }
    this.commandCallbacks.get(command)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.commandCallbacks.get(command);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VoiceCommandConfig>): void {
    const wasEnabled = this.config.enabled;
    this.config = { ...this.config, ...config };

    if (this.recognition) {
      this.recognition.lang = this.config.language;
      this.recognition.continuous = this.config.continuous;
    }

    // Start/stop based on enabled state
    if (this.config.enabled && !wasEnabled) {
      this.start();
    } else if (!this.config.enabled && wasEnabled) {
      this.stop();
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): VoiceCommandConfig {
    return { ...this.config };
  }

  /**
   * Get available commands
   */
  getAvailableCommands(): string[] {
    return [
      'Pausar / Pausa / Para',
      'Continuar / Retomar / Voltar',
      'Encerrar / Terminar / Finalizar',
      'Começar / Iniciar',
      'Ajuda / Comandos',
    ];
  }
}

// Singleton instance
export const voiceCommandsService = new VoiceCommandsService();
