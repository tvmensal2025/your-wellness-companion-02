import { yoloClient } from '../clients/yoloClient.js';
import { geminiClient } from '../clients/geminiClient.js';

interface MedicalExamInput {
  imageUrl: string;
  examType?: string;
  userId?: string;
}

export async function medicalExamHandler(input: MedicalExamInput): Promise<any> {
  console.log('🏥 Processing medical exam analysis...');

  try {
    // 1. Call YOLO for text region detection
    const yoloResult = await yoloClient.detect(input.imageUrl);
    
    console.log(`YOLO detected ${yoloResult.detections?.length || 0} regions`);

    // 2. Call Gemini for medical analysis
    const prompt = `Você é o Dr. Vital, médico especialista da MaxNutrition.

Analise este exame médico e forneça:
1. Tipo de exame identificado
2. Valores encontrados
3. Interpretação dos resultados
4. Alertas (se houver valores fora do normal)
5. Recomendações

YOLO detectou regiões: ${JSON.stringify(yoloResult.detections || [])}

Tipo de exame: ${input.examType || 'não especificado'}

IMPORTANTE: Esta é uma análise preliminar. Sempre consulte um médico para interpretação definitiva.

Responda em JSON com esta estrutura:
{
  "examType": "...",
  "values": [{"parameter": "...", "value": "...", "unit": "...", "status": "normal/alert"}],
  "interpretation": "...",
  "alerts": ["..."],
  "recommendations": ["..."]
}`;

    const geminiResult = await geminiClient.analyze(prompt, input.imageUrl);

    // 3. Format result
    return {
      success: true,
      analysis: geminiResult,
      yolo_detections: yoloResult.detections,
      exam_type: input.examType,
      processed_at: new Date().toISOString(),
      disclaimer: 'Esta é uma análise preliminar. Consulte sempre um médico.'
    };

  } catch (error: any) {
    console.error('Medical exam handler error:', error);
    throw new Error(`Failed to analyze exam: ${error.message}`);
  }
}
