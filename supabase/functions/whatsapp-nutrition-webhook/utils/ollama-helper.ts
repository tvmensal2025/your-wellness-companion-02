/**
 * OLLAMA HELPER - Helper para usar Ollama em mensagens simples
 * 
 * Economiza custos redirecionando mensagens simples para o Ollama local (GRÁTIS)
 * em vez de usar APIs pagas como Gemini/OpenAI.
 */

declare const Deno: {
  env: { get(key: string): string | undefined; };
};

const OLLAMA_URL = Deno.env.get('OLLAMA_URL') || 'https://yolo-service-ollama.0sw627.easypanel.host';

export interface OllamaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Verifica se o Ollama está disponível (timeout 3s)
 */
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

/**
 * Padrões expandidos para detectar mensagens simples que o Ollama pode responder
 */
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
    /^(?:bom\s*descanso|boa\s*noite|durma\s*bem|boa\s*semana)[\s!?.,]*$/i,
    /^(?:até\s*amanhã|até\s*depois|até\s*breve)[\s!?.,]*$/i,
    
    // Confirmações/Reações
    /^(?:ok|okay|certo|entendi|blz|show|top|massa|legal|nice)[\s!?.,]*$/i,
    /^(?:perfeito|ótimo|otimo|maravilha|excelente|incrível|maravilhoso)[\s!?.,]*$/i,
    /^(?:sim|não|nao|s|n|ss|nn|sss|yeah|yes|no)[\s!?.,]*$/i,
    /^(?:pode\s*ser|bora|vamos|isso|isso\s*aí)[\s!?.,]*$/i,
    
    // Conversas casuais (sem contexto nutricional)
    /^(?:como\s*você\s*está|como\s*vc\s*ta|tá\s*bem|ta\s*bem)[\s!?.,]*$/i,
    /^(?:qual\s*seu\s*nome|quem\s*é\s*você|quem\s*é\s*vc)[\s!?.,]*$/i,
    /^(?:o\s*que\s*você\s*faz|você\s*é\s*real|vc\s*é\s*real)[\s!?.,]*$/i,
    /^(?:haha|kkk|kkkk|rsrs|lol|hehe|hihi|😂|😁|😊|💚|❤️)[\s!?.,]*$/i,
    
    // Filler words
    /^(?:hmm|hum|ah|oh|ué|eita|nossa|uau|wow)[\s!?.,]*$/i,
    /^(?:sei|aham|uhum|tá|ta|hm)[\s!?.,]*$/i,
  ];
  
  for (const pattern of simplePatterns) {
    if (pattern.test(msg)) return true;
  }
  
  // Mensagens muito curtas sem números e sem palavras de comida
  // (provavelmente conversa casual)
  if (msg.length < 20 && !/\d/.test(msg)) {
    const foodKeywords = ['comi', 'bebi', 'almocei', 'jantei', 'tomei', 'café', 'lanche', 'refeição', 'caloria', 'peso', 'água'];
    const hasFoodKeyword = foodKeywords.some(kw => msg.includes(kw));
    if (!hasFoodKeyword) return true;
  }
  
  return false;
}

/**
 * Verifica se a mensagem precisa de IA avançada (Gemini/OpenAI)
 */
export function needsAdvancedAI(message: string): boolean {
  const msg = message.toLowerCase();
  
  const advancedPatterns = [
    // Comida e nutrição
    /(?:comi|almocei|jantei|tomei|bebi)\s+.{5,}/i,
    /(?:quantas?\s*)?caloria/i,
    /(?:proteína|carboidrato|gordura|fibra|vitamina|mineral)/i,
    /(?:dieta|reeducação|emagrecimento|engordar)/i,
    
    // Médico
    /(?:exame|resultado|hemograma|glicose|colesterol|triglicérides)/i,
    /(?:pressão|diabetes|hipertensão|anemia)/i,
    /(?:sintoma|dor|mal\s*estar|enjoo|tontura)/i,
    
    // Específico
    /(?:registrar|anotar|salvar|cadastrar)/i,
    /(?:meta|objetivo|progresso|histórico)/i,
  ];
  
  for (const pattern of advancedPatterns) {
    if (pattern.test(msg)) return true;
  }
  
  // Mensagens longas geralmente precisam de mais processamento
  if (msg.length > 80) return true;
  
  return false;
}

/**
 * Constrói o prompt da Sofia para mensagens simples
 */
function buildSofiaSimplePrompt(userName: string): string {
  return `Você é Sofia 🥗, nutricionista virtual carinhosa do MaxNutrition.

REGRAS IMPORTANTES:
- Seja BREVE (máximo 2-3 linhas)
- Seja carinhosa, acolhedora e empática
- Use 1-2 emojis no máximo
- SEMPRE termine com assinatura: _Sofia 💚_
- NÃO dê conselhos médicos ou nutricionais complexos
- Para perguntas sobre comida/calorias, diga que precisa de mais detalhes
- Responda de forma natural e humana

Nome do usuário: ${userName}

EXEMPLOS DE RESPOSTAS:
Usuário: "Oi"
Resposta: "Olá ${userName}! 💚 Como posso te ajudar hoje?

_Sofia 💚_"

Usuário: "Bom dia"
Resposta: "Bom dia, ${userName}! ☀️ Espero que tenha um dia maravilhoso!

_Sofia 💚_"

Usuário: "Obrigado"
Resposta: "Por nada, ${userName}! 😊 Estou sempre aqui pra você!

_Sofia 💚_"

Usuário: "Tudo bem?"
Resposta: "Tudo ótimo por aqui! 💚 E você, como está?

_Sofia 💚_"

Usuário: "Tchau"
Resposta: "Tchau ${userName}! 👋 Cuide-se bem! Qualquer coisa é só chamar!

_Sofia 💚_"`;
}

/**
 * Tenta responder uma mensagem simples usando Ollama (GRÁTIS)
 * Retorna null se falhar ou não for apropriado
 */
export async function tryOllamaForSimpleMessage(
  message: string, 
  user: { full_name?: string; id?: string }
): Promise<{ response: string; source: 'ollama' } | null> {
  // Verificar se é mensagem simples
  if (!isSimpleMessage(message)) {
    console.log('[Ollama] Mensagem não é simples, pulando...');
    return null;
  }
  
  // Verificar se precisa de IA avançada
  if (needsAdvancedAI(message)) {
    console.log('[Ollama] Mensagem precisa de IA avançada, pulando...');
    return null;
  }
  
  try {
    // Verificar disponibilidade do Ollama
    const available = await isOllamaAvailable();
    if (!available) {
      console.log('[Ollama] Serviço não disponível, pulando...');
      return null;
    }
    
    const userName = user.full_name?.split(' ')[0] || 'querido(a)';
    const systemPrompt = buildSofiaSimplePrompt(userName);
    
    console.log(`[Ollama] 🦙 Processando mensagem simples para ${userName}...`);
    
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        stream: false,
        options: { 
          temperature: 0.8, 
          num_predict: 256 
        }
      }),
      signal: AbortSignal.timeout(15000) // 15s timeout
    });
    
    if (!response.ok) {
      console.log('[Ollama] Resposta não OK:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    if (data.message?.content) {
      const responseText = data.message.content;
      const duration = (data.total_duration || 0) / 1e9;
      console.log(`[Ollama] ✅ Resposta gerada em ${duration.toFixed(2)}s (GRÁTIS!)`);
      
      return { 
        response: responseText, 
        source: 'ollama' 
      };
    }
    
    return null;
  } catch (error) {
    console.error('[Ollama] Erro:', error);
    return null;
  }
}

/**
 * Log de economia de custos para métricas
 */
export function logOllamaSaving(userId: string): void {
  // Custo médio de uma mensagem Gemini Flash-Lite: ~R$ 0,002
  console.log(`[Ollama] 💰 Economia: R$ 0,002 para usuário ${userId}`);
}
