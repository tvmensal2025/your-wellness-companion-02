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
    // Saudações
    /^(?:oi|olá|ola|hey|hi|hello|e\s*aí|eai|opa|fala|alo|alô)[\s!?.,]*$/i,
    /^(?:bom\s*dia|boa\s*tarde|boa\s*noite)[\s!?.,]*$/i,
    /^(?:bom\s*dia|boa\s*tarde|boa\s*noite)\s+(?:sofia|doutor|dr)[\s!?.,]*$/i,
    
    // Bem-estar
    /^(?:tudo\s*bem|como\s*vai|como\s*está|beleza|suave|de\s*boa)[\s!?.,]*$/i,
    /^(?:e\s*você|e\s*vc|e\s*tu|e\s*aí)[\s!?.,]*$/i,
    /^(?:tudo\s*ótimo|tudo\s*otimo|muito\s*bem|super\s*bem|estou\s*bem)[\s!?.,]*$/i,
    /^(?:bem|mal|mais\s*ou\s*menos|normal)[\s!?.,]*$/i,
    
    // Agradecimentos
    /^(?:obrigad[oa]|valeu|thanks|vlw|brigad[oa]|tmj|tmjj)[\s!?.,]*$/i,
    /^(?:muito\s*obrigad[oa]|agradeço|grat[oa])[\s!?.,]*$/i,
    /^(?:obrigad[oa]\s*sofia|valeu\s*sofia)[\s!?.,]*$/i,
    
    // Despedidas
    /^(?:tchau|bye|até\s*mais|até\s*logo|flw|falou|xau)[\s!?.,]*$/i,
    /^(?:bom\s*descanso|durma\s*bem|boa\s*semana)[\s!?.,]*$/i,
    /^(?:até\s*amanhã|até\s*depois|até\s*breve)[\s!?.,]*$/i,
    
    // Confirmações/Reações
    /^(?:ok|okay|certo|entendi|blz|show|top|massa|legal|nice)[\s!?.,]*$/i,
    /^(?:perfeito|ótimo|otimo|maravilha|excelente|incrível)[\s!?.,]*$/i,
    /^(?:sim|não|nao|s|n|ss|nn|sss|yeah|yes|no)[\s!?.,]*$/i,
    /^(?:pode\s*ser|bora|vamos|isso|isso\s*aí)[\s!?.,]*$/i,
    
    // Conversas casuais
    /^(?:como\s*você\s*está|como\s*vc\s*ta|tá\s*bem|ta\s*bem)[\s!?.,]*$/i,
    /^(?:qual\s*seu\s*nome|quem\s*é\s*você|quem\s*é\s*vc)[\s!?.,]*$/i,
    /^(?:haha|kkk|kkkk|rsrs|lol|hehe|hihi|😂|😁|😊|💚|❤️)[\s!?.,]*$/i,
    
    // Filler words
    /^(?:hmm|hum|ah|oh|ué|eita|nossa|uau|wow)[\s!?.,]*$/i,
    /^(?:sei|aham|uhum|tá|ta|hm)[\s!?.,]*$/i,
  ];
  
  for (const pattern of simplePatterns) {
    if (pattern.test(msg)) return true;
  }
  
  // Mensagens muito curtas sem números e sem palavras de comida
  if (msg.length < 20 && !/\d/.test(msg)) {
    const foodKeywords = ['comi', 'bebi', 'almocei', 'jantei', 'tomei', 'café', 'lanche', 'refeição', 'caloria', 'peso', 'água'];
    const hasFoodKeyword = foodKeywords.some(kw => msg.includes(kw));
    if (!hasFoodKeyword) return true;
  }
  
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
