import { geminiClient } from '../clients/geminiClient.js';

interface MealPlanInput {
  userId: string;
  targetCalories: number;
  dietType?: string;
  restrictions?: string[];
  preferences?: string[];
}

export async function mealPlanHandler(input: MealPlanInput): Promise<any> {
  console.log('📋 Processing meal plan generation...');

  try {
    const prompt = `Você é a Sofia, nutricionista da MaxNutrition.

Crie um plano alimentar de 7 dias com:
- Meta calórica: ${input.targetCalories} kcal/dia
- Tipo de dieta: ${input.dietType || 'balanceada'}
- Restrições: ${input.restrictions?.join(', ') || 'nenhuma'}
- Preferências: ${input.preferences?.join(', ') || 'nenhuma'}

Para cada dia, forneça:
- Café da manhã
- Lanche da manhã
- Almoço
- Lanche da tarde
- Jantar
- Ceia (opcional)

Para cada refeição, inclua:
- Nome do prato
- Ingredientes
- Modo de preparo resumido
- Calorias aproximadas
- Macronutrientes

Responda em JSON com esta estrutura:
{
  "days": [
    {
      "day": 1,
      "meals": [
        {
          "type": "breakfast",
          "name": "...",
          "ingredients": ["..."],
          "preparation": "...",
          "calories": 0,
          "protein": 0,
          "carbs": 0,
          "fat": 0
        }
      ],
      "totalCalories": 0
    }
  ],
  "weeklyTotals": {"calories": 0, "protein": 0, "carbs": 0, "fat": 0},
  "tips": ["..."]
}`;

    const geminiResult = await geminiClient.chat(prompt);

    return {
      success: true,
      mealPlan: geminiResult.response,
      targetCalories: input.targetCalories,
      dietType: input.dietType,
      processed_at: new Date().toISOString()
    };

  } catch (error: any) {
    console.error('Meal plan handler error:', error);
    throw new Error(`Failed to generate meal plan: ${error.message}`);
  }
}
