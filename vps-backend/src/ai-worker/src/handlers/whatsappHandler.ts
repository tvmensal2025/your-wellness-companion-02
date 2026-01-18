import { geminiClient } from '../clients/geminiClient.js';

interface WhatsAppInput {
  message: string;
  from: string;
  context?: any;
}

export async function whatsappHandler(input: WhatsAppInput): Promise<any> {
  console.log('💬 Processing WhatsApp message...');

  try {
    const prompt = `Você é a Sofia, nutricionista da MaxNutrition, respondendo via WhatsApp.

Mensagem do usuário: ${input.message}

Contexto: ${JSON.stringify(input.context || {})}

Responda de forma:
- Breve e direta (WhatsApp)
- Amigável e acolhedora
- Com emojis quando apropriado
- Máximo 2-3 parágrafos

Se for uma pergunta sobre nutrição, forneça informações úteis.
Se for uma foto de alimento, peça para enviar via app para análise completa.`;

    const geminiResult = await geminiClient.chat(prompt);

    return {
      success: true,
      response: geminiResult.response,
      from: input.from,
      processed_at: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('WhatsApp handler error:', error);
    throw new Error(`Failed to process WhatsApp message: ${error.message}`);
  }
}
