import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama-web:11434';
const MODEL = 'llama2';
const TIMEOUT = 30000;

interface OllamaResponse {
  response: string;
  model: string;
  done: boolean;
}

export const ollamaClient = {
  async chat(message: string, context?: any): Promise<OllamaResponse> {
    try {
      console.log('🦙 Calling Ollama...');

      const response = await axios.post(
        `${OLLAMA_URL}/api/generate`,
        {
          model: MODEL,
          prompt: message,
          context: context || {},
          stream: false
        },
        {
          timeout: TIMEOUT,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      console.log('✅ Ollama success');
      return {
        response: response.data.response,
        model: MODEL,
        done: response.data.done
      };

    } catch (error: any) {
      console.error('❌ Ollama error:', error.message);
      throw new Error(`Ollama failed: ${error.message}`);
    }
  }
};
