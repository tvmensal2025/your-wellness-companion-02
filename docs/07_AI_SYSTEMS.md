# 🤖 Sistemas de Inteligência Artificial

> Documentação gerada em: 2026-01-16
> Sistemas: Sofia, Dr. Vital, YOLO Integration

---

## 📊 Visão Geral

| Sistema | Função | Modelos | Edge Function |
|---------|--------|---------|---------------|
| **Sofia** | Nutricionista IA | YOLO + Gemini | `sofia-image-analysis` |
| **Dr. Vital** | Médico IA | Gemini + OCR | `analyze-medical-exam` |
| **Chat IA** | Conversação | Gemini/GPT | `dr-vital-chat` |
| **Detecção** | Objetos | YOLO v8 | Serviço externo |

---

## 🥗 Sofia - Nutricionista IA

### Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         SOFIA SYSTEM                            │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ SofiaChat.tsx │  │ ImageAnalysis │  │ FoodHistory   │       │
│  └───────┬───────┘  └───────┬───────┘  └───────────────┘       │
│          │                  │                                   │
│          └──────────────────┴───────────────────────────────────┤
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EDGE FUNCTION                               │
│                 sofia-image-analysis                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Receber imagem (URL ou Base64)                       │   │
│  │ 2. Verificar cache (analysis_cache)                     │   │
│  │ 3. Se cache hit → retornar resultado                    │   │
│  │ 4. Se cache miss → processar                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                   │
└─────────────────────────────┼───────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│      YOLO SERVICE       │     │     GEMINI API          │
│  Detecção de objetos    │     │  Análise nutricional    │
│  - Identifica alimentos │     │  - Calcula porções      │
│  - Bounding boxes       │     │  - Estima calorias      │
│  - Confidence scores    │     │  - Macros detalhados    │
└────────────┬────────────┘     └────────────┬────────────┘
             │                               │
             └───────────────┬───────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE                                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │  food_history   │  │ analysis_cache  │  │  sofia_memory   │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo Detalhado de Análise

```
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 1: Usuário envia foto de refeição                          │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 2: Edge Function recebe request                            │
│ {                                                                │
│   imageUrl: "https://storage.../meal.jpg",                       │
│   userId: "uuid",                                                │
│   analysisType: "food"                                           │
│ }                                                                │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 3: Gerar hash da imagem                                    │
│ const imageHash = await hashImage(imageBase64);                  │
│ // hash: "abc123def456..."                                       │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│ PASSO 4: Verificar cache                                         │
│ SELECT * FROM analysis_cache                                     │
│ WHERE image_hash = 'abc123...' AND analysis_type = 'food'        │
└──────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              │                               │
              ▼ CACHE HIT                     ▼ CACHE MISS
┌─────────────────────────┐     ┌─────────────────────────────────┐
│ Retornar resultado      │     │ PASSO 5: Chamar YOLO            │
│ cached: true            │     │ POST yolo-service/detect        │
│ ~100ms                  │     │ { image_url: "..." }            │
└─────────────────────────┘     └──────────────┬──────────────────┘
                                               │
                                               ▼
                              ┌──────────────────────────────────┐
                              │ RESPOSTA YOLO:                   │
                              │ {                                │
                              │   detections: [                  │
                              │     { class: "rice",             │
                              │       confidence: 0.92,          │
                              │       bbox: [x1,y1,x2,y2] },     │
                              │     { class: "chicken",          │
                              │       confidence: 0.88 },        │
                              │     { class: "salad",            │
                              │       confidence: 0.85 }         │
                              │   ]                              │
                              │ }                                │
                              └──────────────┬───────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────────┐
                              │ PASSO 6: Refinar com Gemini      │
                              │                                  │
                              │ Prompt:                          │
                              │ "Analise esta imagem de refeição │
                              │  YOLO detectou: rice, chicken,   │
                              │  salad. Estime porções e valores │
                              │  nutricionais detalhados."       │
                              └──────────────┬───────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────────┐
                              │ RESPOSTA GEMINI:                 │
                              │ {                                │
                              │   foods: [                       │
                              │     { name: "Arroz branco",      │
                              │       quantity: "150g",          │
                              │       calories: 195,             │
                              │       protein: 4.5,              │
                              │       carbs: 43,                 │
                              │       fat: 0.5 },                │
                              │     { name: "Frango grelhado",   │
                              │       quantity: "120g",          │
                              │       calories: 198,             │
                              │       protein: 37,               │
                              │       carbs: 0,                  │
                              │       fat: 5.2 },                │
                              │     ...                          │
                              │   ],                             │
                              │   totalCalories: 493,            │
                              │   suggestions: [...]             │
                              │ }                                │
                              └──────────────┬───────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────────┐
                              │ PASSO 7: Salvar no cache         │
                              │ INSERT INTO analysis_cache       │
                              │ (image_hash, analysis_type,      │
                              │  result, model_used, ...)        │
                              └──────────────┬───────────────────┘
                                             │
                                             ▼
                              ┌──────────────────────────────────┐
                              │ PASSO 8: Retornar resultado      │
                              │ { success: true, data: {...} }   │
                              └──────────────────────────────────┘
```

### Tabelas Envolvidas

| Tabela | Função |
|--------|--------|
| `food_history` | Histórico de refeições do usuário |
| `analysis_cache` | Cache de análises de imagem |
| `sofia_memory` | Memória contextual por usuário |
| `sofia_learning` | Aprendizado sobre preferências |

### Cache de Análise

```typescript
// Estrutura do cache
interface AnalysisCache {
  id: string;
  image_hash: string;        // Hash MD5 da imagem
  analysis_type: 'food' | 'exam';
  result: FoodAnalysisResult;
  model_used: string;        // "gemini-1.5-flash"
  processing_time_ms: number;
  yolo_confidence: number;
  hits: number;              // Contagem de acessos
  last_hit_at: Date;
  created_at: Date;
}

// Funções de cache (image-cache.ts)
async function hashImage(base64: string): Promise<string>;
async function getCachedResult(hash: string, type: string): Promise<Result | null>;
async function setCachedResult(hash: string, type: string, result: any): Promise<void>;
function isCacheEnabled(): boolean;
```

### Prompts Sofia

```typescript
// Prompt de análise de imagem
const FOOD_ANALYSIS_PROMPT = `
Você é Sofia, nutricionista especializada em análise de refeições.

CONTEXTO DO USUÁRIO:
- Nome: {userName}
- Objetivo: {userGoal}
- Restrições: {restrictions}

DETECÇÕES YOLO:
{yoloDetections}

TAREFA:
Analise a imagem e forneça:
1. Lista de alimentos com porções estimadas
2. Valores nutricionais por item
3. Totais de calorias, proteínas, carboidratos e gorduras
4. Sugestões personalizadas baseadas no objetivo do usuário

FORMATO DE RESPOSTA:
JSON válido conforme schema FoodAnalysisResult
`;
```

---

## 🏥 Dr. Vital - Médico IA

### Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                       DR. VITAL SYSTEM                          │
└─────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐       │
│  │ DrVitalChat   │  │ ExamUpload    │  │ ReportView    │       │
│  └───────┬───────┘  └───────┬───────┘  └───────────────┘       │
│          │                  │                                   │
│          └──────────────────┴───────────────────────────────────┤
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EDGE FUNCTIONS                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ analyze-medical-exam     → OCR + Extração de dados      │   │
│  │ dr-vital-chat            → Chat contextual              │   │
│  │ generate-medical-pdf     → Geração de relatório PDF     │   │
│  │ dr-vital-weekly-report   → Relatório semanal            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GEMINI API                                 │
│  - Extração de texto (OCR via Vision)                          │
│  - Interpretação de resultados                                  │
│  - Geração de recomendações                                     │
│  - Chat médico contextual                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE                                   │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │medical_exam_analyses│  │ medical_pdf_reports │              │
│  └─────────────────────┘  └─────────────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de Análise de Exame

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. Upload de PDF/Imagem do exame                                 │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. Armazenar no Storage                                          │
│    Bucket: medical-exams                                         │
│    Path: {userId}/{examId}.pdf                                   │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. analyze-medical-exam Edge Function                            │
│                                                                  │
│    a) Converter PDF para imagens (se necessário)                 │
│    b) Enviar para Gemini Vision                                  │
│    c) Extrair texto e dados estruturados                         │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. Estruturação dos dados                                        │
│                                                                  │
│    extractedData: {                                              │
│      "Hemoglobina": { value: "14.2", unit: "g/dL",              │
│                       reference: "12.0-16.0",                   │
│                       status: "normal" },                       │
│      "Glicose": { value: "126", unit: "mg/dL",                  │
│                   reference: "70-99",                           │
│                   status: "attention" },                        │
│      ...                                                        │
│    }                                                            │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. Interpretação com IA                                          │
│                                                                  │
│    - Análise de cada indicador                                   │
│    - Correlação entre resultados                                 │
│    - Identificação de padrões                                    │
│    - Geração de recomendações                                    │
└──────────────────────────────┬───────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. Salvar em medical_exam_analyses                               │
│                                                                  │
│    - extracted_text                                              │
│    - extracted_data (JSONB)                                      │
│    - ai_interpretation                                           │
│    - recommendations                                             │
│    - risk_level                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Indicadores de Saúde

```typescript
interface HealthIndicator {
  name: string;           // "Hemoglobina"
  value: string;          // "14.2"
  unit: string;           // "g/dL"
  referenceRange: string; // "12.0-16.0"
  status: 'normal' | 'attention' | 'critical';
  interpretation: string;
  recommendation?: string;
}

// Status baseado em:
// - normal: dentro da faixa de referência
// - attention: levemente fora, monitorar
// - critical: significativamente fora, ação necessária
```

### Prompts Dr. Vital

```typescript
// Prompt de análise de exame
const MEDICAL_EXAM_PROMPT = `
Você é Dr. Vital, especialista em análise de exames laboratoriais.

EXAME RECEBIDO:
Tipo: {examType}
Data: {examDate}

TEXTO EXTRAÍDO:
{extractedText}

TAREFA:
1. Identifique todos os indicadores de saúde
2. Compare com valores de referência
3. Classifique status (normal/attention/critical)
4. Forneça interpretação clara para leigo
5. Gere recomendações práticas
6. Identifique correlações entre indicadores

IMPORTANTE:
- Use linguagem acessível
- Não faça diagnósticos definitivos
- Recomende consulta médica quando apropriado
- Seja empático e tranquilizador

FORMATO: JSON conforme schema MedicalAnalysis
`;

// Prompt de chat
const DR_VITAL_CHAT_PROMPT = `
Você é Dr. Vital, médico virtual especializado em saúde preventiva.

CONTEXTO DO PACIENTE:
- Histórico de exames: {examHistory}
- Último exame analisado: {lastExam}
- Indicadores de atenção: {attentionIndicators}

HISTÓRICO DA CONVERSA:
{chatHistory}

MENSAGEM DO PACIENTE:
{userMessage}

DIRETRIZES:
1. Responda de forma empática e profissional
2. Baseie-se nos dados do paciente quando relevante
3. Não faça diagnósticos - sugira consulta médica quando necessário
4. Ofereça informações educativas sobre saúde
5. Seja claro e evite jargão médico excessivo
`;
```

---

## 🔍 YOLO Service

### Arquitetura do Serviço

```
┌─────────────────────────────────────────────────────────────────┐
│                      YOLO SERVICE                               │
│                   (EasyPanel Deployment)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  URL: https://yolo-service-yolo-detection.{host}.easypanel.host │
│                                                                 │
│  Endpoints:                                                     │
│  - POST /detect          → Detecção de objetos                  │
│  - GET  /health          → Health check                         │
│  - GET  /models          → Modelos disponíveis                  │
└─────────────────────────────────────────────────────────────────┘
```

### Request/Response

```typescript
// Request
interface YoloDetectRequest {
  image_url: string;
  confidence_threshold?: number; // default: 0.5
  model?: string;                // default: "yolov8n"
}

// Response
interface YoloDetectResponse {
  success: boolean;
  detections: YoloDetection[];
  processing_time_ms: number;
  model_used: string;
}

interface YoloDetection {
  class: string;           // "apple", "rice", "chicken"
  confidence: number;      // 0.0 - 1.0
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
  area: number;           // área em pixels
}
```

### Classes Detectáveis (Alimentos)

O modelo YOLO foi treinado para detectar categorias de alimentos comuns:

| Categoria | Exemplos |
|-----------|----------|
| Frutas | apple, banana, orange, grape |
| Proteínas | chicken, beef, fish, egg |
| Carboidratos | rice, bread, pasta, potato |
| Vegetais | broccoli, carrot, salad, tomato |
| Bebidas | coffee, juice, water |
| Sobremesas | cake, ice cream, cookie |

### Fallback para Gemini

Se YOLO falhar ou retornar confidence baixa:

```typescript
// Lógica de fallback
async function analyzeImage(imageUrl: string) {
  // Tentar YOLO primeiro
  try {
    const yoloResult = await callYoloService(imageUrl);
    
    // Se confidence média > 0.7, usar YOLO
    const avgConfidence = calculateAverageConfidence(yoloResult.detections);
    if (avgConfidence >= 0.7) {
      return refineWithGemini(imageUrl, yoloResult);
    }
  } catch (error) {
    console.log('YOLO failed, falling back to Gemini');
  }
  
  // Fallback: análise completa com Gemini
  return analyzeWithGeminiOnly(imageUrl);
}
```

---

## 💾 Sistema de Cache de IA

### Arquitetura de Cache

```
┌─────────────────────────────────────────────────────────────────┐
│                     CACHE LAYER                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│analysis_cache │     │ai_response_   │     │ image_cache   │
│               │     │    cache      │     │               │
│ - image_hash  │     │ - query_hash  │     │ - storage_path│
│ - result      │     │ - response    │     │ - base64_data │
│ - hits        │     │ - ttl_hours   │     │ - access_count│
└───────────────┘     └───────────────┘     └───────────────┘
```

### Estratégia de Cache

| Tipo | TTL | Quando usar |
|------|-----|-------------|
| Image Analysis | 7 dias | Fotos de alimentos |
| Chat Response | 1 hora | Perguntas frequentes |
| Medical Exam | 30 dias | Análises de exames |
| Image Data | 24 horas | Imagens base64 |

### Benefícios Esperados

| Métrica | Sem Cache | Com Cache |
|---------|-----------|-----------|
| Tempo resposta (hit) | 3-5s | 100-150ms |
| Custo YOLO | 100% | ~40% |
| Custo Gemini | 100% | ~40% |
| Taxa de hit | 0% | ~60% |

---

## 📊 Métricas e Monitoramento

### Tabela de Logs

```sql
-- ai_usage_logs
SELECT 
  provider,
  model_name,
  functionality,
  COUNT(*) as calls,
  AVG(response_time_ms) as avg_time,
  SUM(tokens_used) as total_tokens,
  SUM(estimated_cost) as total_cost,
  SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*) as success_rate
FROM ai_usage_logs
WHERE created_at > now() - interval '7 days'
GROUP BY provider, model_name, functionality
ORDER BY calls DESC;
```

### Dashboard de IA (Admin)

Métricas exibidas:
- Chamadas por dia/semana
- Tempo médio de resposta
- Taxa de cache hit
- Custo estimado
- Erros por tipo
- Top funcionalidades

---

## 🔧 Configuração de IA

### ai_configurations

```typescript
interface AIConfiguration {
  id: string;
  functionality: string;      // "food_analysis", "medical_chat"
  service: string;            // "gemini", "openai"
  model: string;              // "gemini-1.5-flash"
  temperature: number;        // 0.0 - 1.0
  max_tokens: number;
  system_prompt: string;
  personality: string;        // "professional", "friendly"
  is_enabled: boolean;
  priority: number;
  created_at: Date;
  updated_at: Date;
}
```

### Modelos Suportados

| Provider | Modelo | Uso Recomendado |
|----------|--------|-----------------|
| Google | gemini-1.5-flash | Análise rápida |
| Google | gemini-1.5-pro | Análise complexa |
| OpenAI | gpt-4-turbo | Chat avançado |
| OpenAI | gpt-3.5-turbo | Chat simples |

---

## 📝 Próximos Passos

- Consulte `05_EDGE_FUNCTIONS.md` para detalhes de implementação
- Consulte `08_GAMIFICATION.md` para XP ganho com análises
- Consulte `09_ENVIRONMENT_VARS.md` para configuração de APIs
