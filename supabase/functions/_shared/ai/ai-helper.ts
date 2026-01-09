/**
 * AI HELPER CENTRALIZADO COM FALLBACKS ROBUSTOS
 * 
 * Sistema centralizado para chamadas de IA com:
 * - Retry automático (3 tentativas)
 * - Fallback entre provedores (Lovable → OpenAI → Gemini)
 * - Rate limit handling
 * - Timeout configurável
 * - Respostas determinísticas de fallback
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
}

export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface AIOptions {
  messages: AIMessage[];
  maxTokens?: number;
  temperature?: number;
  tools?: AITool[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  timeout?: number;
  maxRetries?: number;
  fallbackResponse?: string;
}

export interface AIResponse {
  success: boolean;
  content: string | null;
  toolCalls?: any[];
  provider: string;
  error?: string;
  rateLimited?: boolean;
  paymentRequired?: boolean;
}

interface ProviderConfig {
  name: string;
  url: string;
  model: string;
  authHeader: string;
  getApiKey: () => string | undefined;
}

// Configurações de provedores com fallback
const PROVIDERS: ProviderConfig[] = [
  {
    name: 'lovable-gemini-3-flash',
    url: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    model: 'google/gemini-3-flash-preview',
    authHeader: 'Bearer',
    getApiKey: () => Deno.env.get('LOVABLE_API_KEY'),
  },
  {
    name: 'lovable-gemini-2.5-flash',
    url: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    model: 'google/gemini-2.5-flash',
    authHeader: 'Bearer',
    getApiKey: () => Deno.env.get('LOVABLE_API_KEY'),
  },
  {
    name: 'lovable-gpt5-mini',
    url: 'https://ai.gateway.lovable.dev/v1/chat/completions',
    model: 'openai/gpt-5-mini',
    authHeader: 'Bearer',
    getApiKey: () => Deno.env.get('LOVABLE_API_KEY'),
  },
  {
    name: 'openai-gpt4o',
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    authHeader: 'Bearer',
    getApiKey: () => Deno.env.get('OPENAI_API_KEY'),
  },
];

// Retry com exponential backoff
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  timeout: number = 30000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Se OK ou erro definitivo (não retry), retornar
      if (response.ok || response.status === 401 || response.status === 403) {
        return response;
      }
      
      // Rate limit - esperar e tentar novamente
      if (response.status === 429) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt), 10000);
        console.log(`[AI Helper] Rate limited. Aguardando ${waitTime}ms (tentativa ${attempt}/${maxRetries})`);
        await sleep(waitTime);
        continue;
      }
      
      // Payment required - não fazer retry
      if (response.status === 402) {
        return response;
      }
      
      // Outros erros - retry com backoff
      const waitTime = 1000 * attempt;
      console.log(`[AI Helper] Erro ${response.status}. Retry em ${waitTime}ms (${attempt}/${maxRetries})`);
      await sleep(waitTime);
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (lastError.name === 'AbortError') {
        console.log(`[AI Helper] Timeout. Retry ${attempt}/${maxRetries}`);
      } else {
        console.log(`[AI Helper] Erro: ${lastError.message}. Retry ${attempt}/${maxRetries}`);
      }
      
      if (attempt < maxRetries) {
        await sleep(1000 * attempt);
      }
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Chamada de IA com fallback automático entre provedores
 */
export async function callAIWithFallback(options: AIOptions): Promise<AIResponse> {
  const {
    messages,
    maxTokens = 1000,
    temperature = 0.7,
    tools,
    toolChoice,
    timeout = 30000,
    maxRetries = 3,
    fallbackResponse,
  } = options;

  console.log(`[AI Helper] Iniciando chamada com ${messages.length} mensagens`);

  for (const provider of PROVIDERS) {
    const apiKey = provider.getApiKey();
    if (!apiKey) {
      console.log(`[AI Helper] ${provider.name}: API key não configurada, pulando...`);
      continue;
    }

    try {
      console.log(`[AI Helper] Tentando ${provider.name}...`);

      const body: Record<string, any> = {
        model: provider.model,
        messages,
        max_tokens: maxTokens,
      };

      // Só adiciona temperature se não usar tools (alguns modelos não suportam)
      if (!tools && temperature !== undefined) {
        body.temperature = temperature;
      }

      if (tools && tools.length > 0) {
        body.tools = tools;
        body.tool_choice = toolChoice || 'auto';
        // Para modelos OpenAI, usar max_completion_tokens
        if (provider.model.startsWith('gpt-') || provider.model.includes('openai')) {
          body.max_completion_tokens = maxTokens;
          delete body.max_tokens;
        }
      }

      const response = await fetchWithRetry(
        provider.url,
        {
          method: 'POST',
          headers: {
            'Authorization': `${provider.authHeader} ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
        maxRetries,
        timeout
      );

      // Rate limit
      if (response.status === 429) {
        console.warn(`[AI Helper] ${provider.name}: Rate limited, tentando próximo provider...`);
        continue;
      }

      // Payment required
      if (response.status === 402) {
        console.warn(`[AI Helper] ${provider.name}: Payment required`);
        // Continuar para próximo provider
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[AI Helper] ${provider.name}: Erro ${response.status} - ${errorText}`);
        continue;
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const message = choice?.message;

      if (message) {
        console.log(`[AI Helper] ✅ Sucesso com ${provider.name}`);
        return {
          success: true,
          content: message.content,
          toolCalls: message.tool_calls,
          provider: provider.name,
        };
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[AI Helper] ${provider.name}: Exceção - ${errorMsg}`);
      continue;
    }
  }

  // Todos os provedores falharam - usar fallback determinístico
  console.warn(`[AI Helper] ⚠️ Todos os provedores falharam. Usando fallback.`);
  
  return {
    success: false,
    content: fallbackResponse || 'Desculpe, estou com dificuldades técnicas. Tente novamente em alguns instantes.',
    provider: 'fallback',
    error: 'All providers failed',
  };
}

/**
 * Chamada simples de IA (sem tools) com fallback
 */
export async function callAISimple(
  systemPrompt: string,
  userMessage: string,
  options?: Partial<AIOptions>
): Promise<AIResponse> {
  return callAIWithFallback({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    ...options,
  });
}

/**
 * Verifica saúde dos provedores de IA
 */
export async function checkAIHealth(): Promise<{
  lovable: boolean;
  openai: boolean;
}> {
  const results = { lovable: false, openai: false };
  
  try {
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');
    if (lovableKey) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-lite',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      results.lovable = response.ok || response.status === 429;
    }
  } catch {
    results.lovable = false;
  }
  
  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (openaiKey) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${openaiKey}` },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      results.openai = response.ok;
    }
  } catch {
    results.openai = false;
  }
  
  return results;
}
