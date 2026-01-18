import { ollamaClient } from '../clients/ollamaClient.js';
import { geminiClient } from '../clients/geminiClient.js';

interface UnifiedAssistantInput {
  message: string;
  context?: any;
  userId?: string;
}

export async function unifiedAssistantHandler(input: UnifiedAssistantInput): Promise<any> {
  console.log('🤖 Processing unified assistant request...');

  try {
    // Try Ollama first (local, free)
    try {
      const ollamaResult = await ollamaClient.chat(input.message, input.context);
      
      return {
        success: true,
        response: ollamaResult.response,
        model: 'ollama',
        processed_at: new Date().toISOString()
      };
    } catch (ollamaError) {
      console.warn('Ollama failed, falling back to Gemini:', ollamaError);
    }

    // Fallback to Gemini
    const prompt = `Você é um assistente de saúde e bem-estar da MaxNutrition.

Mensagem do usuário: ${input.message}

Contexto adicional: ${JSON.stringify(input.context || {})}

Responda de forma clara, amigável e útil.`;

    const geminiResult = await geminiClient.chat(prompt);

    return {
      success: true,
      response: geminiResult.response,
      model: 'gemini',
      processed_at: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('Unified assistant handler error:', error);
    throw new Error(`Failed to process message: ${error.message}`);
  }
}
