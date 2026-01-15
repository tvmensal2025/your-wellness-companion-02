/**
 * OLLAMA CLIENT - Cliente para chamadas ao Ollama local
 * 
 * Usado para mensagens simples e redundantes para economizar custos
 * Modelo: llama3.2:3b (rápido e eficiente em CPU)
 */

declare const Deno: {
  env: { get(key: string): string | undefined; };
};

const OLLAMA_URL = Deno.env.get('OLLAMA_URL') || 'https://yolo-service-ollama.0sw627.easypanel.host';

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_URL}/api/tags`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function generateOllamaChat(
  messages: OllamaChatMessage[],
  model: string = 'llama3.2:3b',
  options: { temperature?: number; maxTokens?: number; timeout?: number; } = {}
): Promise<string | null> {
  const { temperature = 0.7, maxTokens = 512, timeout = 30000 } = options;
  
  try {
    console.log(`🦙 Chamando Ollama (${model})...`);
    
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: { temperature, num_predict: maxTokens }
      }),
      signal: AbortSignal.timeout(timeout)
    });

    if (!response.ok) return null;
    const data = await response.json();
    
    if (data.message?.content) {
      console.log(`✅ Ollama respondeu em ${(data.total_duration || 0) / 1e9}s`);
      return data.message.content;
    }
    return null;
  } catch (error) {
    console.error('❌ Erro Ollama:', error);
    return null;
  }
}

export function isSimpleMessage(message: string): boolean {
  const msg = message.toLowerCase().trim();
  
  const simplePatterns = [
    /^(?:oi|olá|ola|hey|hi|hello|e\s*aí|eai|opa|fala)[\s!?.,]*$/i,
    /^(?:bom\s*dia|boa\s*tarde|boa\s*noite)[\s!?.,]*$/i,
    /^(?:tudo\s*bem|como\s*vai|como\s*está|beleza|suave)[\s!?.,]*$/i,
    /^(?:obrigad[oa]|valeu|thanks|vlw|brigad[oa])[\s!?.,]*$/i,
    /^(?:tchau|bye|até\s*mais|até\s*logo|flw|falou)[\s!?.,]*$/i,
    /^(?:ok|okay|certo|entendi|beleza|blz|show|top|massa)[\s!?.,]*$/i,
  ];
  
  for (const pattern of simplePatterns) {
    if (pattern.test(msg)) return true;
  }
  
  if (msg.length < 15 && !/\d/.test(msg)) return true;
  return false;
}

export function needsAdvancedAI(message: string): boolean {
  const msg = message.toLowerCase();
  
  const advancedPatterns = [
    /(?:comi|almocei|jantei|tomei|bebi)\s+.{10,}/i,
    /(?:quantas?\s*)?caloria/i,
    /(?:proteína|carboidrato|gordura|fibra|vitamina)/i,
    /(?:dieta|reeducação|emagrecimento)/i,
    /(?:exame|resultado|hemograma|glicose|colesterol)/i,
    /(?:pressão|diabetes|hipertensão)/i,
    /(?:sintoma|dor|mal\s*estar)/i,
  ];
  
  for (const pattern of advancedPatterns) {
    if (pattern.test(msg)) return true;
  }
  
  if (msg.length > 100) return true;
  return false;
}
