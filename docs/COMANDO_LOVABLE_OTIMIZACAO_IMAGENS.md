# 🎯 Comando Otimizado para Lovable - Análise de Imagens

## ⚠️ IMPORTANTE: Capacidades YOLO NÃO Utilizadas!

O serviço YOLO tem capacidades que NÃO estão sendo usadas:

| Capacidade | Endpoint | Status |
|------------|----------|--------|
| Detecção padrão | `/detect` | ✅ USADO |
| **Vocabulário Aberto (YOLOE)** | `/detect/prompt` | ❌ NÃO USADO |
| **Área para gramagem** | `area_px` no response | ❌ NÃO USADO |
| **Pose Estimation** | `/pose/analyze` | ❌ NÃO USADO |

## Contexto para Lovable

O sistema atual de análise de imagens funciona assim:
1. **detect-image-type** → Classifica se é FOOD, MEDICAL ou OTHER (usa OpenAI gpt-4o-mini)
2. **sofia-image-analysis** → Analisa alimentos (YOLO + Gemini 2.5 Pro + Tabela TACO)
3. **analyze-medical-exam** → Analisa exames médicos (YOLO padrão + Gemini 2.5 Pro)

---

## 📋 COMANDO PARA LOVABLE

```
Otimize o fluxo de análise de imagens usando TODAS as capacidades do YOLO disponíveis:

## FASE 1: YOLOE para Dr. Vital (CRÍTICO - NÃO ESTÁ SENDO USADO!)

O serviço YOLO tem endpoint /detect/prompt que permite detectar QUALQUER objeto via texto.
Atualmente o analyze-medical-exam usa /detect que só detecta 80 classes COCO genéricas.

TROCAR em analyze-medical-exam/index.ts:
- DE: chamada para /detect (classes COCO genéricas)
- PARA: chamada para /detect/prompt com prompts específicos

```typescript
// ANTES (errado)
const resp = await fetch(`${yoloServiceUrl}/detect`, {
  body: JSON.stringify({ image_url: imageUrl, confidence: 0.25 })
});

// DEPOIS (correto)
const resp = await fetch(`${yoloServiceUrl}/detect/prompt`, {
  body: JSON.stringify({
    image_url: imageUrl,
    prompts: ["documento", "tabela", "texto", "laudo médico", "exame de sangue", "resultado laboratorial", "gráfico", "código de barras"],
    confidence: 0.25,
    max_detections: 20
  })
});
```

Resposta do /detect/prompt inclui:
- is_document: boolean
- document_confidence: number
- detections: [{prompt, confidence, bbox}]

## FASE 2: Usar Área para Gramagem (CRÍTICO - NÃO ESTÁ SENDO USADO!)

O YOLO retorna area_px (área em pixels) para cada objeto detectado.
Atualmente o sofia-image-analysis IGNORA esse campo!

ADICIONAR em sofia-image-analysis/index.ts:

```typescript
// Mapeamento de área para gramas (calibrado)
const AREA_TO_GRAMS: Record<string, number> = {
  // Frutas
  'banana': 0.012,
  'maçã': 0.015,
  'laranja': 0.018,
  
  // Proteínas
  'frango': 0.008,
  'carne': 0.009,
  'peixe': 0.007,
  
  // Carboidratos
  'arroz': 0.005,
  'feijão': 0.006,
  'pizza': 0.008,
  
  // Salgados brasileiros
  'coxinha': 0.010,
  'pastel': 0.008,
};

function estimateGramsFromArea(className: string, areaPx: number): number {
  const factor = AREA_TO_GRAMS[className.toLowerCase()] || 0.007;
  return Math.round(areaPx * factor);
}

// Usar no mapeamento de objetos:
const mapped = objects.map(o => ({
  class_name: o.class_name,
  score: o.score,
  name: YOLO_CLASS_MAP[o.class_name] || '',
  estimated_grams: estimateGramsFromArea(o.class_name_pt, o.area) // NOVO!
}));
```

## FASE 3: Prompts para Alimentos Brasileiros

O YOLO padrão não detecta coxinha, pastel, pão de queijo, etc.
Usar /detect/prompt para alimentos brasileiros:

```typescript
async function tryYoloeAlimentosBrasileiros(imageUrl: string) {
  const resp = await fetch(`${yoloServiceUrl}/detect/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: imageUrl,
      prompts: [
        'coxinha', 'pastel', 'pão de queijo', 'brigadeiro',
        'açaí', 'tapioca', 'feijoada', 'moqueca', 'acarajé',
        'esfiha', 'quibe', 'empada', 'risole', 'torta salgada'
      ],
      confidence: 0.3
    })
  });
  
  if (!resp.ok) return null;
  return await resp.json();
}
```

## FASE 4: Cache de Resultados

Criar tabela analysis_cache com hash SHA-256 da imagem.

```sql
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_hash TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('food', 'medical', 'image_type')),
  result JSONB NOT NULL,
  model_used TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  hits INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  UNIQUE(image_hash, analysis_type)
);

CREATE INDEX idx_analysis_cache_hash ON analysis_cache(image_hash);
```

Criar helper em supabase/functions/_shared/utils/image-cache.ts:
- hashImage(base64: string): string usando SHA-256
- getCachedResult(hash, type): Promise<JSONB | null>
- setCachedResult(hash, type, result, model, timeMs): Promise<void>

## FASE 5: Modelo Adaptativo

- Se YOLO confidence >= 0.6: usar gemini-2.5-flash (mais barato)
- Se YOLO confidence < 0.6: usar gemini-2.5-pro (mais preciso)

```typescript
const model = yoloResult?.maxConfidence >= 0.6 
  ? 'google/gemini-2.5-flash' 
  : 'google/gemini-2.5-pro';
```

## FASE 6: Migrar detect-image-type para Lovable AI

Trocar OpenAI gpt-4o-mini por Lovable AI gemini-2.5-flash-lite.
Elimina dependência de OPENAI_API_KEY.

---

## ENDPOINTS YOLO DISPONÍVEIS (VPS)

URL Base: https://yolo-service-yolo-detection.0sw627.easypanel.host

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/health` | GET | Health check |
| `/detect` | POST | Detecção padrão (80 classes COCO) |
| `/detect/prompt` | POST | **Vocabulário aberto (QUALQUER objeto)** |
| `/detect/upload` | POST | Upload de arquivo |
| `/pose/analyze` | POST | Pose estimation (17 keypoints) |
| `/pose/session/{id}` | GET | Estado da sessão de pose |
| `/classes` | GET | Classes suportadas |
| `/benchmark` | GET | Benchmark do modelo |

## ARQUIVOS A MODIFICAR

1. supabase/functions/analyze-medical-exam/index.ts
   - Trocar /detect por /detect/prompt
   - Adicionar prompts para documentos médicos

2. supabase/functions/sofia-image-analysis/index.ts
   - Usar area_px para estimar gramas
   - Adicionar /detect/prompt para alimentos brasileiros

3. supabase/functions/detect-image-type/index.ts
   - Migrar de OpenAI para Lovable AI

4. supabase/functions/_shared/utils/image-cache.ts (CRIAR)
   - Hash SHA-256
   - Get/Set cache

5. Nova migration SQL para tabela analysis_cache

## VARIÁVEIS DE AMBIENTE

Adicionar ao env.example:
- SOFIA_FLASH_MODEL=google/gemini-2.5-flash
- SOFIA_PRO_MODEL=google/gemini-2.5-pro
- SOFIA_YOLO_CONFIDENCE_THRESHOLD=0.6
- MEDICAL_OCR_MODEL=google/gemini-2.5-flash
- MEDICAL_INTERPRETATION_MODEL=google/gemini-2.5-pro
- ENABLE_ANALYSIS_CACHE=true

## METAS DE SUCESSO

| Métrica | Antes | Depois | Melhoria |
|---------|-------|--------|----------|
| Precisão gramagem | Visual IA | Visual + Área | +15% |
| OCR exames | Gemini direto | YOLOE + Gemini | +20% |
| Detecção alimentos BR | 60% | 85% | +25% |
| Custo por análise | $0.005 | $0.002 | -60% |
| Latência média | 4-6s | 2-4s | -40% |
| Cache hit rate | 0% | 30% | Novo |

Implemente cada fase completamente antes de passar para a próxima.
Teste cada fase com imagens reais antes de prosseguir.
```

---

## 🔑 RESUMO DO COMANDO

Cole este comando na Lovable:

```
Otimize o fluxo de análise de imagens (alimentos e exames médicos) com estas 4 melhorias:

1. CACHE: Crie tabela analysis_cache com hash SHA-256 da imagem. Antes de processar, verifique cache. Se hit, retorne resultado salvo. Se miss, processe e salve.

2. MODELO ADAPTATIVO: 
   - Sofia (alimentos): Se YOLO confidence >= 0.6, use gemini-2.5-flash. Senão, use gemini-2.5-pro.
   - Dr. Vital (exames): Use gemini-2.5-flash para OCR, gemini-2.5-pro para interpretação.

3. MIGRAR detect-image-type: Troque OpenAI gpt-4o-mini por Lovable AI gemini-2.5-flash-lite. Elimina dependência de OPENAI_API_KEY.

4. VOTAÇÃO DE CONSENSO: Para valores numéricos críticos em exames (glicose, hemoglobina, etc), faça segunda chamada com modelo barato só para confirmar o número. Evita erros de OCR.

Arquivos: detect-image-type/index.ts, sofia-image-analysis/index.ts, enhanced-detection.ts, analyze-medical-exam/index.ts, nova migration SQL, novo helper image-cache.ts.

Meta: -60% custo, +30% velocidade (cache), +5% precisão em exames.
```
