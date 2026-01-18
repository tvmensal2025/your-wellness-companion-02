import { yoloClient } from '../clients/yoloClient.js';
import { geminiClient } from '../clients/geminiClient.js';

interface SofiaImageInput {
  imageUrl: string;
  mealType?: string;
  userId?: string;
}

export async function sofiaImageHandler(input: SofiaImageInput): Promise<any> {
  console.log('🍽️ Processing Sofia image analysis...');

  try {
    // 1. Call YOLO for object detection
    const yoloResult = await yoloClient.detect(input.imageUrl);
    
    console.log(`YOLO detected ${yoloResult.detections?.length || 0} objects`);

    // 2. Call Gemini with YOLO context
    const prompt = `Você é a Sofia, nutricionista da MaxNutrition.

Analise esta imagem de alimento e forneça:
1. Lista de alimentos identificados
2. Porções estimadas
3. Calorias totais
4. Macronutrientes (proteínas, carboidratos, gorduras)
5. Avaliação nutricional (saudável/moderado/atenção)
6. Dicas personalizadas

YOLO detectou: ${JSON.stringify(yoloResult.detections || [])}

Tipo de refeição: ${input.mealType || 'não especificado'}

Responda em JSON com esta estrutura:
{
  "foods": [{"name": "...", "portion": "...", "calories": 0}],
  "totals": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
  "healthScore": 0-100,
  "assessment": "...",
  "tips": ["..."]
}`;

    const geminiResult = await geminiClient.analyze(prompt, input.imageUrl);

    // 3. Format result
    return {
      success: true,
      analysis: geminiResult,
      yolo_detections: yoloResult.detections,
      meal_type: input.mealType,
      processed_at: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('Sofia image handler error:', error);
    throw new Error(`Failed to analyze image: ${error.message}`);
  }
}
