# 🔗 Documentação de Integrações

**Última atualização:** 05 de Janeiro de 2026

---

## 📋 Índice

1. [Google Fit](#google-fit)
2. [Mealie (Receitas)](#mealie-receitas)
3. [Stripe (Pagamentos)](#stripe-pagamentos)
4. [Resend (Emails)](#resend-emails)
5. [n8n (Automações)](#n8n-automações)
6. [Xiaomi Scale](#xiaomi-scale)
7. [Lovable AI](#lovable-ai)

---

## 📱 Google Fit

### Visão Geral

Integração completa com Google Fit para sincronização automática de dados de saúde e atividade física.

### Configuração

#### 1. Credenciais Google Cloud Console

```env
GOOGLE_FIT_CLIENT_ID=seu_client_id.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=seu_client_secret
```

#### 2. Escopos Necessários

```
https://www.googleapis.com/auth/fitness.activity.read
https://www.googleapis.com/auth/fitness.body.read
https://www.googleapis.com/auth/fitness.heart_rate.read
https://www.googleapis.com/auth/fitness.location.read
https://www.googleapis.com/auth/fitness.nutrition.read
https://www.googleapis.com/auth/fitness.oxygen_saturation.read
https://www.googleapis.com/auth/fitness.sleep.read
```

### Fluxo de Autenticação

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐
│   Usuário   │────▶│ Google OAuth │────▶│ google-fit-   │
│ clica       │     │   Consent    │     │   callback    │
│ "Conectar"  │     └──────────────┘     └───────┬───────┘
└─────────────┘                                  │
                                                 ▼
                                    ┌────────────────────┐
                                    │ google_fit_tokens  │
                                    │ (access_token,     │
                                    │  refresh_token)    │
                                    └────────────────────┘
```

### Edge Functions

| Function | Descrição |
|----------|-----------|
| `google-fit-token` | Gerencia tokens OAuth |
| `google-fit-callback` | Callback de autenticação |
| `google-fit-sync` | Sincronização de dados |
| `google-fit-hourly-sync` | Sync automática horária |
| `google-fit-ai-analysis` | Análise IA dos dados |

### Dados Sincronizados

```typescript
interface GoogleFitData {
  // Atividade
  steps: number;
  caloriesActive: number;
  caloriesTotal: number;
  distance: number;
  activeMinutes: number;
  
  // Cardiovascular
  heartRateAvg: number;
  heartRateMin: number;
  heartRateMax: number;
  restingHeartRate: number;
  heartMinutes: number;
  
  // Sono
  sleepDuration: number;
  sleepEfficiency: number;
  sleepStages: {
    light: number;
    deep: number;
    rem: number;
    awake: number;
  };
  
  // Corpo
  weight: number;
  height: number;
  bmi: number;
  bodyFat: number;
  muscleMass: number;
  
  // Hidratação/Nutrição
  hydration: number;
  waterIntake: number;
  nutritionCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  
  // Oxigenação
  oxygenSaturation: number;
  respiratoryRate: number;
}
```

### Tabela de Dados

```sql
CREATE TABLE google_fit_data (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  date DATE NOT NULL,
  
  -- Atividade
  steps INTEGER,
  calories INTEGER,
  distance_meters INTEGER,
  active_minutes INTEGER,
  
  -- Cardiovascular
  heart_rate_avg INTEGER,
  heart_rate_min INTEGER,
  heart_rate_max INTEGER,
  heart_rate_resting INTEGER,
  
  -- Sono
  sleep_hours NUMERIC,
  sleep_efficiency NUMERIC,
  sleep_stages JSONB,
  
  -- Corpo
  weight_kg NUMERIC,
  height_cm INTEGER,
  bmi NUMERIC,
  body_fat_percentage NUMERIC,
  muscle_mass_kg NUMERIC,
  
  -- Metadados
  sync_timestamp TIMESTAMPTZ,
  data_quality INTEGER,
  raw_data JSONB,
  
  UNIQUE(user_id, date)
);
```

### Uso no Frontend

```typescript
// Componente GoogleFitConnect
import { supabase } from '@/integrations/supabase/client';

const connectGoogleFit = async () => {
  const { data } = await supabase.functions.invoke('google-fit-token', {
    body: { action: 'get_auth_url' }
  });
  window.location.href = data.authUrl;
};

const syncData = async () => {
  const { data } = await supabase.functions.invoke('google-fit-sync', {
    body: { 
      action: 'sync',
      date_range: {
        startDate: '2026-01-01',
        endDate: '2026-01-05'
      }
    }
  });
};
```

---

## 🍽️ Mealie (Receitas)

### Visão Geral

Integração com servidor Mealie para gerenciamento de receitas e planejamento de refeições.

### Configuração

```env
MEALIE_BASE_URL=https://seu-mealie.dominio.com
MEALIE_API_TOKEN=seu_token_mealie
```

### Edge Function: mealie-real

#### Funcionalidades

1. **Busca de Receitas**
   - Cache de 5 minutos
   - Busca detalhes completos
   - Mapeamento nutricional

2. **Filtragem por Restrições**
   ```typescript
   const restrictions = ['gluten', 'lactose', 'vegetariano'];
   // Remove receitas com ingredientes proibidos
   ```

3. **Filtragem por Preferências**
   ```typescript
   const preferences = ['frango', 'arroz', 'proteina'];
   // Prioriza receitas com ingredientes preferidos
   ```

### Mapeamentos

#### Restrições Alimentares

| Restrição | Ingredientes Excluídos |
|-----------|------------------------|
| `gluten` | trigo, pão, macarrão, aveia, farinha |
| `lactose` | leite, queijo, iogurte, manteiga |
| `vegetariano` | carne, peixe, frango, porco |
| `vegano` | + ovo, mel, laticínios |

#### Tipos de Refeição

| Mealie | Sistema |
|--------|---------|
| café da manhã | cafe_manha |
| almoço | almoco |
| lanche | lanche |
| jantar | jantar |
| ceia | ceia |

### Estrutura de Receita

```typescript
interface MealieRecipe {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  tags: string[];
  ingredientes: {
    nome: string;
    quantidade: string;
    observacao: string;
  }[];
  preparo: string;
  preparo_compacto: string;
  nutricao: {
    calorias: number;
    proteinas: number;
    carboidratos: number;
    gorduras: number;
    fibras: number;
    sodio: number;
  };
  tempo_preparo: string;
  tempo_total: string;
  porcoes: string;
  image: string;
  source: 'mealie_real';
}
```

### Uso

```typescript
const { data } = await supabase.functions.invoke('mealie-real', {
  body: {
    action: 'generate_meal_plan',
    mealType: 'almoco',
    restrictions: ['gluten'],
    preferences: ['frango', 'arroz'],
    targetCalories: 500
  }
});
```

---

## 💳 Stripe (Pagamentos)

### Visão Geral

Integração com Stripe para assinaturas e pagamentos.

### Configuração

```env
STRIPE_SECRET_KEY=sk_live_xxx
# ou sk_test_xxx para testes
```

### Planos Disponíveis

| Plano | Price ID | Preço |
|-------|----------|-------|
| Básico | price_basic | R$ 29,90/mês |
| Avançado | price_advanced | R$ 59,90/mês |
| Premium | price_premium | R$ 99,90/mês |

### Edge Functions

#### create-checkout

```typescript
// Criar sessão de checkout
const { data } = await supabase.functions.invoke('create-checkout', {
  body: { planId: 'avancado' }
});

// Redirecionar para Stripe
window.location.href = data.url;
```

#### customer-portal

```typescript
// Abrir portal do cliente
const { data } = await supabase.functions.invoke('customer-portal');
window.location.href = data.url;
```

#### check-subscription

```typescript
// Verificar status
const { data } = await supabase.functions.invoke('check-subscription');
console.log(data.status); // 'active', 'canceled', 'past_due'
```

### Webhooks

```
POST /functions/v1/stripe-webhook
- checkout.session.completed
- customer.subscription.updated
- customer.subscription.deleted
- invoice.payment_succeeded
- invoice.payment_failed
```

---

## 📧 Resend (Emails)

### Visão Geral

Envio de emails transacionais via Resend.

### Configuração

```env
RESEND_API_KEY=re_xxx
```

### Edge Function: send-email

```typescript
interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  button_text?: string;
  button_url?: string;
  logo_url?: string;
  sender_name?: string;
}

// Exemplo de uso
await supabase.functions.invoke('send-email', {
  body: {
    to: 'usuario@email.com',
    subject: 'Seu relatório semanal',
    message: 'Confira seu progresso!',
    button_text: 'Ver Relatório',
    button_url: 'https://app.drvita.com/relatorio'
  }
});
```

### Templates

O email é renderizado com template HTML responsivo incluindo:
- Logo da empresa
- Mensagem formatada
- Botão CTA opcional
- Footer com informações

---

## ⚡ n8n (Automações)

### Visão Geral

Integração com n8n para automações e webhooks.

### Tabelas

```sql
-- Configuração de webhooks
n8n_webhooks (
  id, name, url, event_type, is_active
)

-- Logs de execução
n8n_webhook_logs (
  id, webhook_id, status, response, created_at
)
```

### Eventos Suportados

| Evento | Descrição |
|--------|-----------|
| `weekly_whatsapp_report` | Relatório semanal WhatsApp |
| `session_assignment` | Atribuição de sessões |
| `goal_completed` | Meta concluída |
| `weight_milestone` | Marco de peso |

### Edge Function: n8n-weekly-whatsapp-report

Gera mensagem formatada para WhatsApp e envia via webhook n8n.

```typescript
// Formato da mensagem
const message = `
📊 *Relatório Semanal - ${userName}*

📈 Peso: ${weight}kg (${weightChange})
💪 Exercícios: ${exerciseDays} dias
😴 Sono: ${sleepAvg}h/noite
🎯 Metas: ${goalsCompleted}/${goalsTotal}

${aiInsights}
`;
```

---

## ⚖️ Xiaomi Scale

### Visão Geral

Integração com balanças Xiaomi para dados de bioimpedância.

### Dados Capturados

```typescript
interface XiaomiScaleData {
  peso_kg: number;
  imc: number;
  gordura_corporal_percent: number;
  massa_muscular_kg: number;
  agua_corporal_percent: number;
  massa_ossea_kg: number;
  taxa_metabolica_basal: number;
  gordura_visceral: number;
  idade_corporal: number;
  proteina_percent: number;
  circunferencia_abdominal_cm: number;
  risco_cardiometabolico: string;
}
```

### Tabela

```sql
weight_measurements (
  id UUID PRIMARY KEY,
  user_id UUID,
  peso_kg NUMERIC,
  imc NUMERIC,
  gordura_corporal_percent NUMERIC,
  massa_muscular_kg NUMERIC,
  agua_corporal_percent NUMERIC,
  massa_ossea_kg NUMERIC,
  taxa_metabolica_basal INTEGER,
  gordura_visceral INTEGER,
  idade_corporal INTEGER,
  circunferencia_abdominal_cm NUMERIC,
  risco_cardiometabolico TEXT,
  measurement_date DATE,
  created_at TIMESTAMPTZ
)
```

### Documentação Detalhada

Ver: [XIAOMI_SCALE_INTEGRATION.md](./XIAOMI_SCALE_INTEGRATION.md)

---

## 🤖 Lovable AI

### Visão Geral

Gateway de IA da Lovable para acesso a múltiplos modelos sem necessidade de API keys externas.

### Endpoint

```
https://ai.gateway.lovable.dev/v1/chat/completions
```

### Autenticação

```typescript
headers: {
  'Authorization': `Bearer ${LOVABLE_API_KEY}`,
  'Content-Type': 'application/json'
}
```

### Modelos Disponíveis

| Modelo | Descrição | Uso |
|--------|-----------|-----|
| `google/gemini-2.5-pro` | Melhor qualidade Gemini | Análises complexas |
| `google/gemini-2.5-flash` | Rápido e eficiente | Chat diário |
| `google/gemini-2.5-flash-lite` | Mais rápido/barato | Classificação |
| `google/gemini-3-pro-preview` | Próxima geração | Testes |
| `google/gemini-3-pro-image-preview` | Geração de imagens | Imagens |
| `openai/gpt-5` | Melhor OpenAI | Raciocínio complexo |
| `openai/gpt-5-mini` | Equilíbrio | Uso geral |
| `openai/gpt-5-nano` | Mais rápido | Alto volume |

### Exemplo de Uso

```typescript
const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'google/gemini-2.5-flash',
    messages: [
      { role: 'system', content: 'Você é Sofia...' },
      { role: 'user', content: 'Olá!' }
    ],
    temperature: 0.7,
    max_tokens: 1024
  })
});

const data = await response.json();
const message = data.choices[0].message.content;
```

### Fallback Chain

```typescript
// Ordem de tentativa
const providers = [
  'lovable', // Lovable AI Gateway
  'openai',  // OpenAI direto
  'google'   // Google AI direto
];

for (const provider of providers) {
  try {
    const response = await callProvider(provider);
    if (response) return response;
  } catch (error) {
    console.log(`${provider} falhou, tentando próximo...`);
  }
}

return fallbackResponse;
```

---

## 📊 Status das Integrações

| Integração | Status | Última Sync |
|------------|--------|-------------|
| Google Fit | ✅ Ativo | Horária |
| Mealie | ✅ Ativo | Sob demanda |
| Stripe | ✅ Ativo | Tempo real |
| Resend | ✅ Ativo | Sob demanda |
| n8n | ✅ Ativo | Configurável |
| Xiaomi Scale | ✅ Ativo | Manual |
| Lovable AI | ✅ Ativo | Tempo real |

---

*Documentação gerada em 05/01/2026*
