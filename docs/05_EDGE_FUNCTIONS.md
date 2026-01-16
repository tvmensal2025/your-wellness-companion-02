# ⚡ Edge Functions - API Backend

> Documentação gerada em: 2026-01-16
> Total de Edge Functions: 89

---

## 📊 Visão Geral

| Categoria | Quantidade | Descrição |
|-----------|------------|-----------|
| IA/Análise | 15 | Sofia, Dr. Vital, YOLO |
| WhatsApp | 15 | Webhooks e automações |
| Google Fit | 5 | Sincronização e OAuth |
| Nutrição | 8 | Cálculos e planos |
| Médico | 6 | Exames e relatórios |
| Notificações | 4 | Email e push |
| Utilidades | 36 | Cache, upload, etc |

---

## 🤖 IA/Análise

### sofia-image-analysis
Análise de imagens de alimentos usando YOLO + Gemini.

```
POST /functions/v1/sofia-image-analysis
```

**Headers:**
```
Authorization: Bearer <user_token>
Content-Type: application/json
```

**Request Body:**
```typescript
interface SofiaImageAnalysisRequest {
  imageUrl: string;           // URL da imagem
  imageBase64?: string;       // OU base64 da imagem
  analysisType?: 'food' | 'meal' | 'product';
  userId?: string;            // Opcional, extraído do token
}
```

**Response:**
```typescript
interface SofiaImageAnalysisResponse {
  success: boolean;
  data: {
    foods: FoodItem[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    totalFiber: number;
    confidence: number;
    yoloDetections?: YoloDetection[];
    geminiAnalysis?: string;
    processingTime: number;
  };
  cached?: boolean;
}

interface FoodItem {
  name: string;
  quantity: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  confidence: number;
}
```

**Exemplo:**
```bash
curl -X POST \
  https://ciszqtlaacrhfwsqnvjr.supabase.co/functions/v1/sofia-image-analysis \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://storage.example.com/meal.jpg"}'
```

---

### analyze-medical-exam
Análise de exames médicos com OCR + IA.

```
POST /functions/v1/analyze-medical-exam
```

**Request Body:**
```typescript
interface AnalyzeMedicalExamRequest {
  fileUrl: string;            // URL do arquivo (PDF/imagem)
  examType: string;           // Tipo do exame
  userId: string;
}
```

**Response:**
```typescript
interface AnalyzeMedicalExamResponse {
  success: boolean;
  data: {
    examId: string;
    extractedText: string;
    extractedData: Record<string, any>;
    interpretation: string;
    recommendations: string[];
    healthIndicators: HealthIndicator[];
    riskLevel: 'low' | 'medium' | 'high';
    processingStatus: string;
  };
}

interface HealthIndicator {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'attention' | 'critical';
}
```

---

### dr-vital-chat
Chat com Dr. Vital (IA médica).

```
POST /functions/v1/dr-vital-chat
```

**Request Body:**
```typescript
interface DrVitalChatRequest {
  message: string;
  userId: string;
  conversationId?: string;
  examContext?: {
    examId: string;
    examType: string;
    extractedData: Record<string, any>;
  };
}
```

**Response:**
```typescript
interface DrVitalChatResponse {
  success: boolean;
  data: {
    response: string;
    conversationId: string;
    suggestions?: string[];
    followUpQuestions?: string[];
  };
}
```

---

### food-analysis
Análise nutricional de texto.

```
POST /functions/v1/food-analysis
```

**Request Body:**
```typescript
interface FoodAnalysisRequest {
  foodDescription: string;    // "2 ovos fritos com bacon"
  userId?: string;
}
```

**Response:**
```typescript
interface FoodAnalysisResponse {
  success: boolean;
  data: {
    foods: FoodItem[];
    totalNutrition: NutritionSummary;
    suggestions: string[];
  };
}
```

---

### nutrition-calc
Cálculo nutricional determinístico.

```
POST /functions/v1/nutrition-calc
```

**Request Body:**
```typescript
interface NutritionCalcRequest {
  foods: {
    name: string;
    quantity: number;
    unit: string;
  }[];
}
```

**Response:**
```typescript
interface NutritionCalcResponse {
  success: boolean;
  data: {
    items: CalculatedFood[];
    totals: NutritionTotals;
  };
}
```

---

### nutrition-daily-summary
Resumo nutricional diário.

```
GET /functions/v1/nutrition-daily-summary?userId={userId}&date={YYYY-MM-DD}
```

**Response:**
```typescript
interface NutritionDailySummaryResponse {
  success: boolean;
  data: {
    date: string;
    meals: Meal[];
    totals: NutritionTotals;
    goals: NutritionGoals;
    progress: NutritionProgress;
    aiInsights: string;
  };
}
```

---

## 📱 WhatsApp

### whatsapp-webhook-unified
Webhook unificado para mensagens WhatsApp.

```
POST /functions/v1/whatsapp-webhook-unified
```

**Request Body (Evolution API):**
```typescript
interface WhatsAppWebhookRequest {
  event: string;
  instance: string;
  data: {
    key: {
      remoteJid: string;
      fromMe: boolean;
      id: string;
    };
    message: {
      conversation?: string;
      imageMessage?: {
        url: string;
        mimetype: string;
      };
    };
  };
}
```

**Processamento:**
1. Identifica tipo de mensagem (texto, imagem, áudio)
2. Busca usuário pelo número de telefone
3. Se imagem: analisa com Sofia
4. Se texto: processa com IA
5. Envia resposta via Evolution API

---

### whatsapp-weekly-report
Envia relatório semanal via WhatsApp.

```
POST /functions/v1/whatsapp-weekly-report
```

**Request Body:**
```typescript
interface WeeklyReportRequest {
  userId: string;
  phoneNumber: string;
}
```

---

### whatsapp-daily-motivation
Envia mensagem motivacional diária.

```
POST /functions/v1/whatsapp-daily-motivation
```

**Request Body:**
```typescript
interface DailyMotivationRequest {
  userId: string;
  phoneNumber: string;
  messageType?: 'motivation' | 'reminder' | 'tip';
}
```

---

### whatsapp-goal-reminders
Lembretes de metas via WhatsApp.

```
POST /functions/v1/whatsapp-goal-reminders
```

---

## 🏃 Google Fit

### google-fit-sync
Sincroniza dados do Google Fit.

```
POST /functions/v1/google-fit-sync
```

**Request Body:**
```typescript
interface GoogleFitSyncRequest {
  userId: string;
  startDate?: string;   // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD
  dataTypes?: string[]; // ['steps', 'calories', 'heart_rate', 'sleep']
}
```

**Response:**
```typescript
interface GoogleFitSyncResponse {
  success: boolean;
  data: {
    syncedDays: number;
    lastSyncAt: string;
    summary: {
      steps: number;
      calories: number;
      activeMinutes: number;
      sleepHours: number;
    };
  };
}
```

---

### google-fit-callback
Callback OAuth do Google Fit.

```
GET /functions/v1/google-fit-callback?code={code}&state={userId}
```

---

### google-fit-token
Gerenciamento de tokens.

```
POST /functions/v1/google-fit-token
```

**Request Body:**
```typescript
interface GoogleFitTokenRequest {
  action: 'refresh' | 'revoke';
  userId: string;
}
```

---

### google-fit-ai-analysis
Análise IA dos dados do Google Fit.

```
POST /functions/v1/google-fit-ai-analysis
```

**Request Body:**
```typescript
interface GoogleFitAIAnalysisRequest {
  userId: string;
  period: 'day' | 'week' | 'month';
}
```

**Response:**
```typescript
interface GoogleFitAIAnalysisResponse {
  success: boolean;
  data: {
    insights: string[];
    recommendations: string[];
    trends: {
      metric: string;
      trend: 'improving' | 'stable' | 'declining';
      change: number;
    }[];
    score: number;
  };
}
```

---

## 🥗 Nutrição

### generate-meal-plan-taco
Gera plano alimentar usando tabela TACO.

```
POST /functions/v1/generate-meal-plan-taco
```

**Request Body:**
```typescript
interface GenerateMealPlanRequest {
  userId: string;
  preferences: {
    calories: number;
    mealsPerDay: number;
    dietaryRestrictions: string[];
    preferences: string[];
    budget?: 'low' | 'medium' | 'high';
  };
  duration: number; // dias
}
```

**Response:**
```typescript
interface GenerateMealPlanResponse {
  success: boolean;
  data: {
    planId: string;
    days: MealPlanDay[];
    shoppingList: ShoppingItem[];
    nutritionSummary: NutritionSummary;
  };
}
```

---

### nutrition-planner
Planejador nutricional.

```
POST /functions/v1/nutrition-planner
```

---

### enrich-food-data
Enriquece dados de alimentos.

```
POST /functions/v1/enrich-food-data
```

**Request Body:**
```typescript
interface EnrichFoodDataRequest {
  foodName: string;
  portion?: string;
}
```

**Response:**
```typescript
interface EnrichFoodDataResponse {
  success: boolean;
  data: {
    name: string;
    aliases: string[];
    category: string;
    nutrition: NutritionInfo;
    commonPortions: Portion[];
    healthTips: string[];
  };
}
```

---

## 📄 Médico/Relatórios

### generate-medical-pdf
Gera PDF de relatório médico.

```
POST /functions/v1/generate-medical-pdf
```

**Request Body:**
```typescript
interface GenerateMedicalPDFRequest {
  analysisId: string;
  userId: string;
  includeCharts?: boolean;
  includeRecommendations?: boolean;
}
```

**Response:**
```typescript
interface GenerateMedicalPDFResponse {
  success: boolean;
  data: {
    pdfUrl: string;
    expiresAt: string;
  };
}
```

---

### generate-medical-report
Gera relatório médico completo.

```
POST /functions/v1/generate-medical-report
```

---

### premium-medical-report
Relatório médico premium (detalhado).

```
POST /functions/v1/premium-medical-report
```

---

### dr-vital-weekly-report
Relatório semanal do Dr. Vital.

```
POST /functions/v1/dr-vital-weekly-report
```

---

## 📧 Notificações

### send-email
Envio de emails via Resend.

```
POST /functions/v1/send-email
```

**Request Body:**
```typescript
interface SendEmailRequest {
  to: string;
  subject: string;
  html?: string;
  template?: string;
  templateData?: Record<string, any>;
}
```

---

### goal-notifications
Notificações de metas.

```
POST /functions/v1/goal-notifications
```

**Request Body:**
```typescript
interface GoalNotificationRequest {
  userId: string;
  notificationType: 'reminder' | 'achievement' | 'warning';
  goalId?: string;
}
```

---

## 🔧 Utilidades

### media-upload
Upload de mídia para Storage.

```
POST /functions/v1/media-upload
```

**Request Body (multipart/form-data):**
```
file: File
bucket: string
path?: string
```

**Response:**
```typescript
interface MediaUploadResponse {
  success: boolean;
  data: {
    url: string;
    path: string;
    size: number;
    mimeType: string;
  };
}
```

---

### cache-manager
Gerenciamento de cache.

```
POST /functions/v1/cache-manager
```

**Request Body:**
```typescript
interface CacheManagerRequest {
  action: 'get' | 'set' | 'delete' | 'clear';
  key?: string;
  value?: any;
  ttl?: number; // segundos
}
```

---

### rate-limiter
Rate limiting para APIs.

```
POST /functions/v1/rate-limiter
```

**Request Body:**
```typescript
interface RateLimiterRequest {
  key: string;
  limit: number;
  window: number; // segundos
}
```

**Response:**
```typescript
interface RateLimiterResponse {
  allowed: boolean;
  remaining: number;
  resetAt: string;
}
```

---

### detect-image-type
Detecta tipo de imagem (comida, exame, etc).

```
POST /functions/v1/detect-image-type
```

**Request Body:**
```typescript
interface DetectImageTypeRequest {
  imageUrl: string;
}
```

**Response:**
```typescript
interface DetectImageTypeResponse {
  success: boolean;
  data: {
    type: 'food' | 'medical_exam' | 'document' | 'other';
    confidence: number;
    suggestedAction: string;
  };
}
```

---

## 🔌 Integrações Externas

### YOLO Service
Serviço de detecção de objetos.

**URL:** `https://yolo-service-yolo-detection.{host}.easypanel.host`

**Endpoint:** `POST /detect`

**Request:**
```typescript
interface YoloRequest {
  image_url: string;
  confidence_threshold?: number;
}
```

**Response:**
```typescript
interface YoloResponse {
  detections: {
    class: string;
    confidence: number;
    bbox: [number, number, number, number];
  }[];
  processing_time: number;
}
```

---

### Gemini API
Usado para análise de texto e imagem.

**Configuração no código:**
```typescript
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const result = await model.generateContent([
  { text: prompt },
  { inlineData: { mimeType: "image/jpeg", data: base64 } }
]);
```

---

### Evolution API (WhatsApp)
API para envio de mensagens WhatsApp.

**URL:** Configurado via N8N_WHATSAPP_WEBHOOK

**Endpoint:** `POST /message/sendText/{instance}`

**Request:**
```typescript
interface EvolutionSendTextRequest {
  number: string;
  text: string;
}
```

---

## 📐 Padrões de Edge Functions

### Estrutura Básica

```typescript
// supabase/functions/my-function/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Criar cliente Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Parse request body
    const body = await req.json();

    // Lógica da função
    const result = await processRequest(body, supabase);

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|----------|-----------|-------------|
| `SUPABASE_URL` | URL do Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role | Sim |
| `GOOGLE_AI_API_KEY` | Chave Gemini | Para IA |
| `YOLO_SERVICE_URL` | URL do YOLO | Para detecção |
| `N8N_WHATSAPP_WEBHOOK` | Webhook WhatsApp | Para WhatsApp |
| `RESEND_API_KEY` | Chave Resend | Para emails |

---

## 📝 Próximos Passos

- Consulte `07_AI_SYSTEMS.md` para detalhes do fluxo de IA
- Consulte `09_ENVIRONMENT_VARS.md` para configuração completa
