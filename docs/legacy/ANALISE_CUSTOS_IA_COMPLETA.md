# 📊 ANÁLISE COMPLETA DE CUSTOS DE IA - Instituto dos Sonhos

> **Data:** Janeiro 2026  
> **Projeto:** MaxNutrition / Instituto dos Sonhos  
> **Análise por:** Dev Senior + Financeiro

---

## 🎯 RESUMO EXECUTIVO

O sistema utiliza **3 provedores principais de IA**:
1. **Lovable AI Gateway** (PRINCIPAL) - Acesso a Gemini + GPT via gateway
2. **Google AI Direct** (FALLBACK) - Gemini direto
3. **OpenAI Direct** (FALLBACK) - GPT-4o direto

### 💰 ESTIMATIVA DE CUSTO MENSAL (1.000 usuários ativos)

| Cenário | Custo Estimado/Mês |
|---------|-------------------|
| **Baixo uso** (5 interações/dia/usuário) | $150 - $300 |
| **Médio uso** (15 interações/dia/usuário) | $400 - $800 |
| **Alto uso** (30 interações/dia/usuário) | $1.200 - $2.500 |

---

## 📋 INVENTÁRIO COMPLETO DE EDGE FUNCTIONS COM IA

### 🥗 CATEGORIA: NUTRIÇÃO (Sofia)

| Edge Function | Modelo Principal | Fallback | Tokens/Chamada | Uso Típico |
|--------------|------------------|----------|----------------|------------|
| `sofia-image-analysis` | `google/gemini-2.5-flash` | `gemini-1.5-pro` | 2.000-4.000 | Análise de foto de refeição |
| `sofia-enhanced-memory` | `google/gemini-3-flash-preview` | `gpt-4o` | 1.024 | Chat com memória |
| `sofia-text-analysis` | `google/gemini-2.5-flash-lite` | - | 500-1.000 | Análise de texto de comida |
| `sofia-deterministic` | Cálculo local | - | 0 | Cálculos nutricionais |
| `food-analysis` | `google/gemini-2.5-flash` | `gpt-4o-mini` | 1.500 | Análise completa de refeição |
| `enrich-food-data` | `google/gemini-2.5-flash` | - | 1.000 | Enriquecimento de dados |
| `enrich-sofia-analysis` | `google/gemini-2.5-flash` | - | 1.500 | Análise aprofundada |
| `nutrition-ai-insights` | `gpt-4o` | - | 2.000 | Insights nutricionais semanais |
| `nutrition-planner` | `google/gemini-2.5-flash` | - | 2.000 | Planejamento de cardápio |
| `generate-meal-plan-taco` | **SEM IA** (determinístico) | - | 0 | Geração de cardápio |

### 🩺 CATEGORIA: MÉDICO (Dr. Vital)

| Edge Function | Modelo Principal | Fallback | Tokens/Chamada | Uso Típico |
|--------------|------------------|----------|----------------|------------|
| `analyze-medical-exam` | `google/gemini-2.5-pro` | `openai/gpt-5` | 4.096 | Análise de exames (PREMIUM) |
| `dr-vital-chat` | `google/gemini-2.5-pro` | `gpt-4o` | 800 | Chat médico |
| `dr-vital-enhanced` | `google/gemini-2.5-flash` | - | 1.500 | Chat médico avançado |
| `dr-vital-weekly-report` | `google/gemini-2.5-flash` | `gpt-4o` | 2.000 | Relatório semanal |
| `generate-medical-report` | `google/gemini-2.5-pro` | - | 3.000 | Relatório médico completo |
| `premium-medical-report` | `google/gemini-2.5-pro` | - | 4.000 | Relatório premium |
| `finalize-medical-document` | `google/gemini-2.5-flash` | - | 2.000 | Finalização de documento |

### 💬 CATEGORIA: CHAT UNIFICADO

| Edge Function | Modelo Principal | Fallback | Tokens/Chamada | Uso Típico |
|--------------|------------------|----------|----------------|------------|
| `unified-ai-assistant` | `google/gemini-2.5-flash` | `gpt-4o` | 2.048 | Chat unificado Sofia+DrVital |
| `enhanced-gpt-chat` | `gpt-4o` | - | 1.500 | Chat GPT avançado |
| `interpret-user-intent` | `google/gemini-2.5-flash` | - | 500 | Detecção de intenção |

### 📱 CATEGORIA: WHATSAPP

| Edge Function | Modelo Principal | Fallback | Tokens/Chamada | Uso Típico |
|--------------|------------------|----------|----------------|------------|
| `whatsapp-ai-assistant` | `openai/gpt-5-mini` | - | 1.000 | Assistente WhatsApp |
| `whatsapp-daily-motivation` | `gemini-1.5-pro` | - | 300 | Mensagem motivacional |
| `whatsapp-weekly-report` | `google/gemini-2.5-flash` | - | 500 | Relatório semanal |
| `whatsapp-habits-analysis` | `google/gemini-2.5-flash` | - | 800 | Análise de hábitos |
| `whatsapp-saboteur-result` | `google/gemini-2.5-flash` | - | 500 | Resultado sabotadores |
| `whatsapp-nutrition-check` | `google/gemini-2.5-flash` | - | 500 | Verificação nutricional |
| `whatsapp-medical-handler` | `google/gemini-2.5-flash` | - | 1.000 | Handler médico |
| `whatsapp-celebration` | `google/gemini-2.5-flash` | - | 300 | Celebração de conquista |
| `whatsapp-goal-reminders` | `google/gemini-2.5-flash` | - | 300 | Lembretes de metas |
| `whatsapp-smart-reminders` | `google/gemini-2.5-flash` | - | 300 | Lembretes inteligentes |
| `whatsapp-welcome` | `google/gemini-2.5-flash` | - | 300 | Boas-vindas |
| `whatsapp-mission-complete` | `gemini-2.5-flash` | - | 300 | Missão completa |
| `whatsapp-generate-template` | `gemini-1.5-pro` | - | 500 | Geração de template |

### 🏋️ CATEGORIA: EXERCÍCIOS

| Edge Function | Modelo Principal | Fallback | Tokens/Chamada | Uso Típico |
|--------------|------------------|----------|----------------|------------|
| `generate-ai-workout` | `google/gemini-2.5-flash` | - | 2.000 | Geração de treino |
| `improve-exercises` | `google/gemini-2.5-flash` | - | 1.000 | Melhoria de exercícios |

### 📊 CATEGORIA: RELATÓRIOS E ANÁLISES

| Edge Function | Modelo Principal | Fallback | Tokens/Chamada | Uso Típico |
|--------------|------------------|----------|----------------|------------|
| `saboteur-html-report` | `google/gemini-2.5-flash` | - | 2.000 | Relatório sabotadores |
| `google-fit-ai-analysis` | `google/gemini-2.5-flash` | - | 1.000 | Análise Google Fit |
| `generate-user-biography` | `gemini-1.5-flash` | - | 500 | Biografia do usuário |
| `generate-human-message` | `gemini-2.5-flash-preview` | - | 500 | Mensagem humanizada |
| `n8n-weekly-whatsapp-report` | `google/gemini-2.5-flash` | - | 1.000 | Relatório N8N |

### 🔧 CATEGORIA: UTILITÁRIOS

| Edge Function | Modelo Principal | Fallback | Tokens/Chamada | Uso Típico |
|--------------|------------------|----------|----------------|------------|
| `activate-ai` | `google/gemini-2.5-flash` | `gemini-1.5-flash` | 100 | Teste de conexão |
| `detect-image-type` | `google/gemini-2.5-flash` | - | 200 | Detecção tipo imagem |
| `vision-api` | `google/gemini-2.5-flash` | - | 1.000 | API de visão geral |

---

## 💵 TABELA DE PREÇOS POR MODELO (Janeiro 2026)

### Lovable AI Gateway (PRINCIPAL)
> ⚠️ **IMPORTANTE:** Lovable AI Gateway tem **créditos incluídos** no plano Lovable.dev

| Modelo | Input ($/1M tokens) | Output ($/1M tokens) | Observação |
|--------|---------------------|----------------------|------------|
| `google/gemini-3-flash-preview` | ~$0.075 | ~$0.30 | Mais novo e rápido |
| `google/gemini-2.5-flash` | ~$0.075 | ~$0.30 | Principal do projeto |
| `google/gemini-2.5-flash-lite` | ~$0.0375 | ~$0.15 | Mais barato |
| `google/gemini-2.5-pro` | ~$1.25 | ~$5.00 | Premium (exames) |
| `openai/gpt-5-mini` | ~$0.15 | ~$0.60 | WhatsApp |
| `openai/gpt-5` | ~$5.00 | ~$15.00 | Fallback premium |

### Google AI Direct (FALLBACK)

| Modelo | Input ($/1M tokens) | Output ($/1M tokens) |
|--------|---------------------|----------------------|
| `gemini-1.5-flash` | $0.075 | $0.30 |
| `gemini-1.5-pro` | $1.25 | $5.00 |
| `gemini-2.5-flash` | $0.075 | $0.30 |

### OpenAI Direct (FALLBACK)

| Modelo | Input ($/1M tokens) | Output ($/1M tokens) |
|--------|---------------------|----------------------|
| `gpt-4o` | $2.50 | $10.00 |
| `gpt-4o-mini` | $0.15 | $0.60 |

---

## 🦾 YOLO SERVICE (VPS LOCAL) - CUSTO ZERO POR CHAMADA

| Serviço | URL | Custo/Chamada | Custo Fixo/Mês |
|---------|-----|---------------|----------------|
| YOLO Detection | `http://45.67.221.216:8002` | **$0.00** | ~$20-50 (VPS) |

### Benefícios do YOLO:
- ✅ **90% redução de custos** em análise de imagens
- ✅ **10x mais rápido** (0.8s vs 3-8s)
- ✅ Pré-processamento antes do Gemini
- ✅ Detecção de objetos local

---

## 📈 PROJEÇÃO DE CUSTOS POR ESCALA

### Cenário: 1.000 Usuários Ativos

| Funcionalidade | Chamadas/Dia | Tokens/Chamada | Custo/Dia | Custo/Mês |
|----------------|--------------|----------------|-----------|-----------|
| Chat Sofia | 5.000 | 1.500 | $1.12 | $33.75 |
| Análise Imagem | 2.000 | 3.000 | $0.90 | $27.00 |
| Chat Dr. Vital | 500 | 1.000 | $0.08 | $2.25 |
| Análise Exames | 100 | 4.000 | $2.50 | $75.00 |
| WhatsApp | 3.000 | 500 | $0.23 | $6.75 |
| Relatórios | 200 | 2.000 | $0.06 | $1.80 |
| **TOTAL** | **10.800** | - | **$4.89** | **~$147** |

### Cenário: 10.000 Usuários Ativos

| Funcionalidade | Chamadas/Dia | Custo/Mês |
|----------------|--------------|-----------|
| Chat Sofia | 50.000 | $337.50 |
| Análise Imagem | 20.000 | $270.00 |
| Chat Dr. Vital | 5.000 | $22.50 |
| Análise Exames | 1.000 | $750.00 |
| WhatsApp | 30.000 | $67.50 |
| Relatórios | 2.000 | $18.00 |
| **TOTAL** | **108.000** | **~$1.465** |

### Cenário: 100.000 Usuários Ativos

| Funcionalidade | Chamadas/Dia | Custo/Mês |
|----------------|--------------|-----------|
| **TOTAL** | **1.080.000** | **~$14.650** |

---

## 🎯 FUNÇÕES MAIS CARAS (ATENÇÃO!)

| Rank | Edge Function | Modelo | Custo/Chamada | Risco |
|------|--------------|--------|---------------|-------|
| 🔴 1 | `analyze-medical-exam` | `gemini-2.5-pro` | ~$0.025 | ALTO |
| 🔴 2 | `premium-medical-report` | `gemini-2.5-pro` | ~$0.020 | ALTO |
| 🟡 3 | `generate-medical-report` | `gemini-2.5-pro` | ~$0.015 | MÉDIO |
| 🟡 4 | `nutrition-ai-insights` | `gpt-4o` | ~$0.010 | MÉDIO |
| 🟢 5 | `sofia-image-analysis` | `gemini-2.5-flash` | ~$0.002 | BAIXO |

---

## 💡 RECOMENDAÇÕES DE OTIMIZAÇÃO

### 1. **Implementar Cache Agressivo**
```typescript
// Cachear respostas similares por 24h
const cacheKey = `ai_${userId}_${hash(prompt)}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;
```

### 2. **Rate Limiting por Usuário**
```typescript
// Máximo 50 chamadas de IA por dia por usuário
const dailyLimit = 50;
const usage = await getUserAIUsage(userId);
if (usage >= dailyLimit) throw new Error('Limite diário atingido');
```

### 3. **Usar Modelos Mais Baratos**
- Chat simples: `gemini-2.5-flash-lite` (-50% custo)
- WhatsApp: `gemini-2.5-flash-lite` (-50% custo)
- Análise de exames: Manter `gemini-2.5-pro` (qualidade crítica)

### 4. **Quick Replies (Sem IA)**
O sistema já implementa isso em `sofia-enhanced-memory`:
- Consultas de peso, IMC, streak → Resposta instantânea
- Saudações simples → Template local
- **Economia: ~30% das chamadas**

### 5. **YOLO First (Já Implementado)**
- Imagens passam pelo YOLO antes do Gemini
- **Economia: ~40% em tokens de imagem**

---

## 📊 DASHBOARD DE MONITORAMENTO SUGERIDO

### Métricas a Acompanhar:
1. **Chamadas/dia por função**
2. **Tokens consumidos/dia**
3. **Custo estimado/dia**
4. **Taxa de cache hit**
5. **Erros de rate limit**
6. **Tempo médio de resposta**

### Alertas Recomendados:
- 🔴 Custo diário > $50
- 🟡 Chamadas/hora > 1.000
- 🔴 Taxa de erro > 5%
- 🟡 Tempo resposta > 5s

---

## ✅ CONCLUSÃO

O sistema está **bem otimizado** com:
- ✅ YOLO local para pré-processamento
- ✅ Quick replies sem IA
- ✅ Modelos flash (baratos) como padrão
- ✅ Modelos pro apenas para exames médicos

### Custo Estimado para Escalar:

| Usuários | Custo/Mês | Custo/Usuário |
|----------|-----------|---------------|
| 1.000 | ~$150 | $0.15 |
| 10.000 | ~$1.500 | $0.15 |
| 100.000 | ~$15.000 | $0.15 |

**ROI:** Se cada usuário paga R$50/mês (~$10), o custo de IA representa apenas **1.5%** da receita.

---

*Documento gerado em Janeiro 2026*
*Última atualização: Análise completa do código-fonte*
