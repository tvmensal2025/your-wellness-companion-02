# 🤖 Documentação dos Sistemas de IA

**Última atualização:** 05 de Janeiro de 2026

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Sofia - Assistente Nutricional](#sofia---assistente-nutricional)
3. [Dr. Vital - Mentor de Saúde](#dr-vital---mentor-de-saúde)
4. [Configuração de IA](#configuração-de-ia)
5. [Modelos Suportados](#modelos-suportados)
6. [Base de Conhecimento](#base-de-conhecimento)

---

## 🎯 Visão Geral

O sistema Dr. Vita conta com duas IAs principais que trabalham em conjunto para fornecer acompanhamento de saúde personalizado:

| IA | Especialidade | Personalidade | Foco |
|----|---------------|---------------|------|
| **Sofia** | Nutrição | Carinhosa, empática | Alimentação, análise de refeições |
| **Dr. Vital** | Saúde geral | Profissional, acolhedor | Saúde integral, orientações médicas |

### Arquitetura de IA

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend React                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   ┌─────────────┐                 ┌─────────────────┐   │
│   │  SofiaChat  │                 │  DrVitalChat    │   │
│   └──────┬──────┘                 └────────┬────────┘   │
│          │                                  │            │
└──────────┼──────────────────────────────────┼────────────┘
           │                                  │
           ▼                                  ▼
┌──────────────────────┐      ┌───────────────────────────┐
│ sofia-enhanced-memory│      │     dr-vital-chat         │
├──────────────────────┤      ├───────────────────────────┤
│ • Contexto unificado │      │ • 20+ tabelas de dados    │
│ • Memória persistente│      │ • Memória de longo prazo  │
│ • Histórico conversas│      │ • Análise multidimensional│
└──────────┬───────────┘      └────────────┬──────────────┘
           │                               │
           └───────────┬───────────────────┘
                       ▼
         ┌─────────────────────────────┐
         │   _shared/user-complete-    │
         │      context.ts             │
         ├─────────────────────────────┤
         │ • Busca em 30+ tabelas      │
         │ • Calcula completude        │
         │ • Gera resumo textual       │
         └──────────────┬──────────────┘
                        ▼
         ┌─────────────────────────────┐
         │     Lovable AI Gateway      │
         ├─────────────────────────────┤
         │ • Gemini 2.5 Pro/Flash      │
         │ • GPT-5/Mini/Nano           │
         │ • Fallback automático       │
         └─────────────────────────────┘
```

---

## 💚 Sofia - Assistente Nutricional

### Identidade

**Nome:** Sofia  
**Papel:** Nutricionista virtual do Instituto dos Sonhos  
**Personalidade:**
- Super amorosa, carinhosa e empática
- Usa emojis naturalmente 💚
- Como uma amiga querida que se importa
- Demonstra alegria genuína ao ajudar

### Funcionalidades

#### 1. Chat Nutricional
- Responde dúvidas sobre alimentação
- Sugere melhorias nas refeições
- Incentiva hábitos saudáveis
- Respostas curtas (2-4 frases)

#### 2. Análise de Imagens
```typescript
// Entrada
{
  message: "Analise minha refeição",
  userId: "uuid",
  context: {
    imageUrl: "https://..."
  }
}

// Saída
{
  message: "Que refeição linda, amor! 💚 Vejo arroz integral...",
  analysis: {
    foods: ["arroz integral", "frango grelhado", "salada"],
    calories: 450,
    protein: 35,
    carbs: 45,
    fat: 12
  }
}
```

#### 3. Memória Persistente
- Lembra conversas anteriores
- Conhece histórico do usuário
- Personaliza respostas baseado em dados

### Edge Functions

| Function | Descrição |
|----------|-----------|
| `sofia-enhanced-memory` | Chat principal com memória |
| `sofia-image-analysis` | Análise de imagens |
| `sofia-deterministic` | Respostas padronizadas |

### Tabelas Utilizadas

```sql
-- Histórico de conversas
user_conversations (
  user_id, conversation_id, message_role,
  message_content, timestamp, analysis_type
)

-- Análises de comida
food_analysis (
  user_id, meal_type, foods_detected,
  total_calories, macros, image_url
)

-- Base de conhecimento
base_de_conhecimento_sofia (
  categoria, topico, conteudo, 
  referencias, tags, relevancia
)
```

### Exemplo de Interação

```
👤 Usuário: Bom dia Sofia! O que devo comer no café da manhã?

💚 Sofia: Bom dia, amor! 💚 Que alegria falar com você! 
Para o café, que tal ovos mexidos com pão integral e 
uma fruta? Tem proteína, fibras e energia pro seu dia! ✨
```

---

## 🏥 Dr. Vital - Mentor de Saúde

### Identidade

**Nome:** Dr. Vital  
**Papel:** Médico virtual especialista do Instituto dos Sonhos  
**Personalidade:**
- Profissional e acolhedor
- Linguagem simples e humana
- Não faz diagnósticos ou prescrições
- Orientações gerais de saúde

### Funcionalidades

#### 1. Consulta Virtual
- Análise completa do paciente
- Orientações personalizadas
- Identificação de padrões
- Sugestões de acompanhamento

#### 2. Dados do Paciente Acessados

```typescript
// Contexto completo disponível
{
  // Dados básicos
  profile: ProfileData,
  anamnesis: AnamnesisData,
  physicalData: PhysicalData,
  
  // Histórico e medições
  weight_trend: WeightMeasurement[],
  nutrition_tracking: NutritionRecord[],
  food_analysis: FoodAnalysis[],
  exercise_history: ExerciseRecord[],
  water_tracking: WaterRecord[],
  sleep_tracking: SleepRecord[],
  mood_tracking: MoodRecord[],
  
  // Metas e engajamento
  all_goals: Goal[],
  daily_responses: DailyResponse[],
  missions: Mission[],
  achievements: Achievement[],
  
  // Medicamentos e documentos
  prescriptions: Prescription[],
  supplements: Supplement[],
  medical_documents: MedicalDocument[],
  
  // Dispositivos
  heart_rate_data: HeartRateData[],
  google_fit_data: GoogleFitData[],
  
  // Análises
  weekly_analyses: WeeklyAnalysis[],
  
  // Memória
  long_term_memory: MemorySummary
}
```

#### 3. Relatórios Semanais

```typescript
// dr-vital-weekly-report
{
  period: "2026-01-01 a 2026-01-07",
  weight_analysis: {
    start: 85.2,
    end: 84.8,
    change: -0.4,
    trend: "descendo"
  },
  nutrition_score: 78,
  exercise_days: 5,
  sleep_average: 7.2,
  mood_average: 7.5,
  goals_progress: [
    { name: "Perder 5kg", progress: 40 }
  ],
  ai_insights: "Você está no caminho certo..."
}
```

### Edge Functions

| Function | Descrição |
|----------|-----------|
| `dr-vital-chat` | Chat principal |
| `dr-vital-enhanced` | Versão aprimorada |
| `dr-vital-weekly-report` | Relatórios semanais |

### Tabelas Utilizadas

```sql
-- Memória de longo prazo
dr_vital_memory (
  user_id, key, value, updated_at
)
-- Keys: long_term_summary, allergies, chronic_flags, preferences

-- Conversas
conversations (
  user_id, agent, title, last_message_at
)

conversation_messages (
  conversation_id, role, content, model
)

-- Análises semanais
weekly_analyses (
  user_id, period, analysis_data, ai_insights
)
```

### Exemplo de Interação

```
👤 Usuário: Como está minha evolução de peso?

🩺 Dr. Vital: Olá! Analisando seus dados dos últimos 30 dias, 
vejo que você perdeu 2.1kg, uma média saudável de 0.5kg/semana. 

Sua composição corporal também melhorou: a gordura corporal 
reduziu de 28% para 26.5%, enquanto a massa muscular se manteve.

Continue focando na hidratação (você tem tomado em média 1.8L/dia) 
e nos exercícios - suas 4 sessões semanais estão fazendo diferença!

Alguma dúvida sobre seu progresso?
```

---

## ⚙️ Configuração de IA

### Tabela ai_configurations

```sql
CREATE TABLE ai_configurations (
  id UUID PRIMARY KEY,
  functionality VARCHAR NOT NULL,  -- 'dr_vital_chat', 'chat_daily', etc.
  service VARCHAR DEFAULT 'lovable', -- 'lovable', 'openai', 'google'
  model VARCHAR DEFAULT 'google/gemini-2.5-flash',
  max_tokens INTEGER DEFAULT 1024,
  temperature NUMERIC DEFAULT 0.7,
  system_prompt TEXT,
  is_enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1,
  cost_per_request NUMERIC DEFAULT 0.01
);
```

### Funcionalidades Configuráveis

| functionality | Descrição | Modelo Padrão |
|---------------|-----------|---------------|
| `dr_vital_chat` | Chat Dr. Vital | gemini-2.5-pro |
| `chat_daily` | Chat Sofia | gemini-2.5-flash |
| `food_analysis` | Análise de alimentos | gemini-2.5-flash |
| `image_analysis` | Análise de imagens | gemini-2.5-pro |
| `weekly_report` | Relatórios semanais | gemini-2.5-flash |

---

## 🧠 Modelos Suportados

### Lovable AI (Principal)

| Modelo | Uso Recomendado | Tokens |
|--------|-----------------|--------|
| `google/gemini-2.5-pro` | Análises complexas, imagens | 8192 |
| `google/gemini-2.5-flash` | Chat rápido, respostas curtas | 4096 |
| `google/gemini-2.5-flash-lite` | Classificação, resumos | 2048 |
| `google/gemini-3-pro-preview` | Próxima geração | 8192 |
| `openai/gpt-5` | Raciocínio complexo | 8192 |
| `openai/gpt-5-mini` | Equilíbrio custo/qualidade | 4096 |
| `openai/gpt-5-nano` | Alta velocidade, tarefas simples | 2048 |

### Fallback Chain

```
Lovable AI → OpenAI → Google AI → Resposta Padrão
```

---

## 📚 Base de Conhecimento

### Protocolos Nutricionais (391 total)

| Categoria | Quantidade |
|-----------|------------|
| Combinações visuais | 20 |
| Sintomas com alimentos | 34 |
| Estados emocionais | 36 |
| Atividades físicas | 32 |
| Faixas etárias | 14 |
| Categorias de gênero | 4 |
| Objetivos fitness | 24 |
| Alimentos medicinais | 35 |
| Doenças com abordagem nutricional | 31 |
| Substituições inteligentes | 52 |
| Funcionalidades avançadas | 70+ |

### Tabelas de Conhecimento

```sql
-- Conhecimento da Sofia
base_de_conhecimento_sofia (
  id, categoria, topico, conteudo,
  referencias, tags, relevancia, is_active
)

-- Conhecimento da empresa
company_knowledge_base (
  id, category, title, content,
  tags, priority, is_active
)

-- Princípios ativos
active_principles (
  id, principle_name, category, description,
  food_sources, health_benefits, contraindications
)

-- Combinações ideais
combinacoes_ideais (
  id, alimento_principal, alimento_combinado,
  beneficio, sinergia_nutricional, referencias_cientificas
)
```

---

## 🔄 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                       COLETA DE DADOS                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Manual          Dispositivos          Análises             │
│  ┌─────┐         ┌─────────┐          ┌────────┐            │
│  │Forms│         │Google   │          │ Sofia  │            │
│  │Daily│         │  Fit    │          │ Image  │            │
│  │Check│         │ Xiaomi  │          │Analysis│            │
│  └──┬──┘         └────┬────┘          └───┬────┘            │
│     │                 │                    │                 │
└─────┼─────────────────┼────────────────────┼─────────────────┘
      │                 │                    │
      ▼                 ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    BANCO DE DADOS                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ profiles, user_anamnesis, weight_measurements,       │   │
│  │ nutrition_tracking, food_analysis, exercise_tracking,│   │
│  │ sleep_tracking, mood_tracking, google_fit_data, ...  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                 PROCESSAMENTO DE IA                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            user-complete-context.ts                  │    │
│  │  • Busca dados de 30+ tabelas                       │    │
│  │  • Calcula completude (0-100%)                      │    │
│  │  • Gera resumo contextual                           │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               System Prompt + Contexto               │    │
│  └──────────────────────┬──────────────────────────────┘    │
│                         ▼                                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Lovable AI Gateway                      │    │
│  │  Gemini 2.5 Pro → GPT-5 → Fallback                  │    │
│  └──────────────────────┬──────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   RESPOSTA PERSONALIZADA                     │
│  • Baseada em TODOS os dados do usuário                     │
│  • Considera histórico e tendências                         │
│  • Memória de conversas anteriores                          │
│  • Estilo e tom personalizados                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 Métricas e Monitoramento

### Logs de Uso

```sql
ai_usage_logs (
  id, user_id, service_name, model,
  prompt_tokens, completion_tokens, total_tokens,
  cost, created_at
)

ai_system_logs (
  id, user_id, service_name, operation,
  log_type, status, error_message,
  execution_time_ms, details
)
```

### Análise Emocional

```sql
chat_emotional_analysis (
  id, user_id, conversation_id, week_start,
  emotions_detected, sentiment_score,
  stress_level, energy_level, pain_level,
  goals_mentioned, concerns_mentioned
)
```

---

*Documentação gerada em 05/01/2026*
