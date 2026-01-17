# 📊 GUIA DE INSTRUMENTAÇÃO - EDGE FUNCTIONS

> Como adicionar monitoramento em todas as edge functions de forma organizada

---

## 🎯 OBJETIVO

Instrumentar TODAS as edge functions para capturar:
- ✅ Tempo de execução
- ✅ Taxa de sucesso/falha
- ✅ Erros com stack trace
- ✅ Metadata customizada (foods detectados, calorias, etc)
- ✅ User ID (quando disponível)

---

## 📁 ARQUIVOS CRIADOS

### 1. Sistema de Monitoramento
```
supabase/functions/_shared/
├── monitoring.ts                 ✅ Sistema centralizado
└── monitoring-wrapper.ts         ✅ Wrapper simples
```

---

## 🔧 COMO INSTRUMENTAR

### Método 1: Wrapper Automático (Recomendado)

**Uso:** Envolver o handler principal

```typescript
// ANTES
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  // ... seu código ...
  return new Response(JSON.stringify({ success: true }));
});
```

```typescript
// DEPOIS
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { monitoredHandler } from '../_shared/monitoring-wrapper.ts';

serve(monitoredHandler(
  'sofia-image-analysis',  // Nome da function
  'sofia',                 // Feature
  async (req) => {
    // ... seu código ...
    return new Response(JSON.stringify({ success: true }));
  }
));
```

**Pronto!** Métricas são registradas automaticamente.

---

### Método 2: Tracking Manual (Para Casos Específicos)

**Uso:** Quando precisa de mais controle

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { trackMetric } from '../_shared/monitoring-wrapper.ts';

serve(async (req) => {
  const start = performance.now();
  
  try {
    // ... seu código ...
    
    const duration_ms = Math.round(performance.now() - start);
    
    // Registrar métrica de sucesso
    await trackMetric(
      'sofia-image-analysis',
      'sofia',
      duration_ms,
      true,
      {
        userId: 'user-123',
        metadata: {
          foods_detected: 3,
          calories: 450,
          yolo_used: true
        }
      }
    );
    
    return new Response(JSON.stringify({ success: true }));
    
  } catch (error) {
    const duration_ms = Math.round(performance.now() - start);
    
    // Registrar métrica de erro
    await trackMetric(
      'sofia-image-analysis',
      'sofia',
      duration_ms,
      false,
      {
        error: error.message,
        userId: 'user-123'
      }
    );
    
    throw error;
  }
});
```

---

### Método 3: Helpers Específicos (Para Features Comuns)

**Uso:** Para WhatsApp, Dr. Vital, Sofia, etc

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { whatsappMonitoring } from '../_shared/monitoring.ts';

serve(async (req) => {
  const start = performance.now();
  
  try {
    // ... processar mensagem WhatsApp ...
    
    const duration_ms = Math.round(performance.now() - start);
    
    // Usar helper específico
    await whatsappMonitoring.trackMessage(
      'whatsapp-nutrition-webhook',
      duration_ms,
      true,
      {
        message_type: 'image',
        premium: true,
        phone: '+5511999999999'
      }
    );
    
    return new Response(JSON.stringify({ success: true }));
    
  } catch (error) {
    // ... tratar erro ...
  }
});
```

---

## 📋 EDGE FUNCTIONS PRIORITÁRIAS

### 🔴 ALTA PRIORIDADE (Instrumentar Primeiro)

#### 1. WhatsApp
```
✅ whatsapp-nutrition-webhook       - Webhook principal
✅ whatsapp-ai-assistant            - Assistente IA
✅ whatsapp-medical-handler         - Handler de exames
⚠️ whatsapp-send-interactive        - Envio de mensagens
⚠️ whatsapp-weekly-report           - Relatório semanal
```

#### 2. Dr. Vital (Análise de Exames)
```
✅ analyze-medical-exam             - Análise principal
⚠️ generate-medical-report          - Geração de relatório
⚠️ generate-medical-pdf             - Geração de PDF
⚠️ dr-vital-weekly-report           - Relatório semanal
⚠️ dr-vital-chat                    - Chat com Dr. Vital
```

#### 3. Sofia (Análise de Alimentos)
```
✅ sofia-image-analysis             - Análise de imagem
✅ sofia-text-analysis              - Análise de texto
✅ sofia-deterministic              - Cálculo determinístico
⚠️ enrich-sofia-analysis            - Enriquecimento
⚠️ confirm-food-analysis            - Confirmação
```

#### 4. YOLO
```
✅ detect-image-type                - Detecção de tipo
⚠️ vision-api                       - API de visão
```

---

### 🟡 MÉDIA PRIORIDADE

#### 5. Google Fit
```
⚠️ google-fit-sync                  - Sincronização
⚠️ google-fit-hourly-sync           - Sync horária
⚠️ google-fit-ai-analysis           - Análise IA
⚠️ google-fit-callback              - Callback OAuth
```

#### 6. Pagamentos
```
⚠️ create-asaas-payment             - Criar pagamento
⚠️ create-checkout                  - Criar checkout
⚠️ check-subscription               - Verificar assinatura
```

#### 7. Notificações
```
⚠️ whatsapp-daily-motivation        - Motivação diária
⚠️ whatsapp-goal-reminders          - Lembretes de metas
⚠️ whatsapp-smart-reminders         - Lembretes inteligentes
⚠️ goal-notifications               - Notificações de metas
```

---

### 🟢 BAIXA PRIORIDADE

#### 8. Relatórios
```
⚠️ generate-coaching-report         - Relatório de coaching
⚠️ nutrition-daily-summary          - Resumo diário
⚠️ whatsapp-habits-analysis         - Análise de hábitos
```

#### 9. Outros
```
⚠️ generate-meal-plan-taco          - Plano alimentar
⚠️ nutrition-planner                - Planejador nutricional
⚠️ generate-ai-workout              - Treino IA
```

---

## 🎯 FEATURES DISPONÍVEIS

Use estas features ao instrumentar:

```typescript
type EdgeFunctionFeature = 
  | 'whatsapp'          // Mensagens WhatsApp
  | 'sofia'             // Análise de alimentos
  | 'dr_vital'          // Análise de exames
  | 'yolo'              // Detecção de objetos
  | 'gemini'            // IA Gemini
  | 'medical_exam'      // Exames médicos
  | 'food_analysis'     // Análise de alimentos
  | 'google_fit'        // Google Fit
  | 'payment'           // Pagamentos
  | 'notification'      // Notificações
  | 'report'            // Relatórios
  | 'other';            // Outros
```

---

## 📊 METADATA RECOMENDADA

### WhatsApp
```typescript
{
  message_type: 'text' | 'image' | 'audio' | 'button',
  premium: boolean,
  phone: string,
  has_media: boolean
}
```

### Dr. Vital
```typescript
{
  exam_type: string,
  yolo_used: boolean,
  gemini_used: boolean,
  pages: number,
  confidence: number
}
```

### Sofia
```typescript
{
  foods_detected: number,
  yolo_used: boolean,
  gemini_used: boolean,
  calories: number,
  analysis_type: 'image' | 'text'
}
```

### Google Fit
```typescript
{
  data_points: number,
  sync_type: 'manual' | 'automatic',
  data_types: string[]
}
```

### Pagamentos
```typescript
{
  amount: number,
  payment_method: string,
  subscription_plan: string
}
```

---

## 🚀 PLANO DE INSTRUMENTAÇÃO

### Fase 1: Críticas (Esta Semana)
```bash
# 1. WhatsApp
supabase/functions/whatsapp-nutrition-webhook/index.ts
supabase/functions/whatsapp-ai-assistant/index.ts
supabase/functions/whatsapp-medical-handler/index.ts

# 2. Dr. Vital
supabase/functions/analyze-medical-exam/index.ts
supabase/functions/generate-medical-report/index.ts

# 3. Sofia
supabase/functions/sofia-image-analysis/index.ts
supabase/functions/sofia-text-analysis/index.ts
```

### Fase 2: Importantes (Próxima Semana)
```bash
# 4. Google Fit
supabase/functions/google-fit-sync/index.ts
supabase/functions/google-fit-hourly-sync/index.ts

# 5. Pagamentos
supabase/functions/create-asaas-payment/index.ts
supabase/functions/check-subscription/index.ts

# 6. Notificações
supabase/functions/whatsapp-daily-motivation/index.ts
supabase/functions/whatsapp-goal-reminders/index.ts
```

### Fase 3: Restantes (Quando Possível)
```bash
# Todas as outras edge functions
```

---

## 📝 TEMPLATE DE INSTRUMENTAÇÃO

### Template Completo

```typescript
/**
 * 📊 [NOME DA FUNCTION]
 * 
 * Descrição: [O que faz]
 * Feature: [whatsapp|sofia|dr_vital|etc]
 * Instrumentado: ✅ Sim
 */

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { monitoredHandler } from '../_shared/monitoring-wrapper.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(monitoredHandler(
  'nome-da-function',  // Nome da function
  'feature',           // Feature (whatsapp, sofia, etc)
  async (req) => {
    // CORS
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Seu código aqui
      const body = await req.json();
      
      // ... lógica ...
      
      return new Response(
        JSON.stringify({ success: true, data: result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      console.error('[Function] Erro:', error);
      
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  }
));
```

---

## ✅ CHECKLIST DE INSTRUMENTAÇÃO

Para cada edge function:

- [ ] Importar `monitoredHandler` ou helpers
- [ ] Envolver handler principal
- [ ] Definir nome da function
- [ ] Definir feature correta
- [ ] Adicionar metadata relevante (opcional)
- [ ] Testar localmente
- [ ] Deploy
- [ ] Verificar no dashboard

---

## 🧪 COMO TESTAR

### 1. Testar Localmente
```bash
# Executar edge function localmente
supabase functions serve nome-da-function

# Fazer request de teste
curl -X POST http://localhost:54321/functions/v1/nome-da-function \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

### 2. Verificar Logs
```bash
# Ver logs da function
supabase functions logs nome-da-function
```

### 3. Verificar Dashboard
```
Admin → Performance Monitoring → Por Feature
```

---

## 📚 EXEMPLOS PRÁTICOS

### Exemplo 1: WhatsApp Webhook

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { monitoredHandler } from '../_shared/monitoring-wrapper.ts';

serve(monitoredHandler(
  'whatsapp-nutrition-webhook',
  'whatsapp',
  async (req) => {
    const body = await req.json();
    
    // Processar mensagem
    const result = await processMessage(body);
    
    return new Response(JSON.stringify(result));
  }
));
```

### Exemplo 2: Dr. Vital

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { monitoredHandler } from '../_shared/monitoring-wrapper.ts';

serve(monitoredHandler(
  'analyze-medical-exam',
  'dr_vital',
  async (req) => {
    const { imageUrl, userId } = await req.json();
    
    // Analisar exame
    const analysis = await analyzeExam(imageUrl);
    
    return new Response(JSON.stringify(analysis));
  }
));
```

### Exemplo 3: Sofia

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { monitoredHandler } from '../_shared/monitoring-wrapper.ts';

serve(monitoredHandler(
  'sofia-image-analysis',
  'sofia',
  async (req) => {
    const { imageUrl, userId } = await req.json();
    
    // Analisar alimento
    const analysis = await analyzeFood(imageUrl);
    
    return new Response(JSON.stringify(analysis));
  }
));
```

---

## 🎯 RESULTADO ESPERADO

Após instrumentar todas as edge functions, você terá:

✅ **Dashboard completo** com métricas de TODAS as functions  
✅ **Visibilidade total** de tempo de execução  
✅ **Taxa de sucesso** de cada function  
✅ **Erros capturados** automaticamente  
✅ **Metadata customizada** para análise  
✅ **User tracking** quando disponível  

---

## 📞 SUPORTE

Dúvidas sobre instrumentação?
1. Ver exemplos acima
2. Consultar `src/lib/monitoring.ts` (frontend)
3. Consultar `supabase/functions/_shared/monitoring.ts` (backend)

---

**Próximo passo:** Instrumentar as edge functions prioritárias! 🚀
