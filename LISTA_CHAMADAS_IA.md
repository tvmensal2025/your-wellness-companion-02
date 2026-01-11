# 📋 LISTA COMPLETA DE CHAMADAS DE IA - Instituto dos Sonhos

---

## 🥗 NUTRIÇÃO (Sofia)

| Edge Function | Modelo | Para que serve |
|--------------|--------|----------------|
| `sofia-image-analysis` | `gemini-2.5-flash` / `gemini-1.5-pro` | Analisar foto de refeição e identificar alimentos, calcular calorias |
| `sofia-enhanced-memory` | `gemini-3-flash-preview` | Chat com Sofia com memória de conversas anteriores |
| `sofia-text-analysis` | `gemini-2.5-flash-lite` | Analisar descrição textual de comida ("comi arroz com frango") |
| `sofia-deterministic` | **SEM IA** | Cálculos nutricionais determinísticos (tabela TACO) |
| `food-analysis` | `gemini-2.5-flash` | Análise completa de refeição com insights da Sofia |
| `enrich-food-data` | `gemini-2.5-flash` | Enriquecer dados nutricionais de alimentos detectados |
| `enrich-sofia-analysis` | `gemini-2.5-flash` | Aprofundar análise nutricional com contexto do usuário |
| `nutrition-ai-insights` | `gpt-4o` | Gerar insights semanais sobre padrões alimentares |
| `nutrition-planner` | `gemini-2.5-flash` | Criar plano alimentar personalizado |
| `generate-meal-plan-taco` | **SEM IA** | Gerar cardápio baseado em tabela TACO (determinístico) |
| `nutrition-calc` | **SEM IA** | Cálculos nutricionais puros |
| `nutrition-calc-deterministic` | **SEM IA** | Cálculos determinísticos de macros |
| `nutrition-daily-summary` | **SEM IA** | Resumo diário de nutrição (agregação de dados) |
| `confirm-food-analysis` | **SEM IA** | Confirmar análise de alimento pelo usuário |

---

## 🩺 MÉDICO (Dr. Vital)

| Edge Function | Modelo | Para que serve |
|--------------|--------|----------------|
| `analyze-medical-exam` | `gemini-2.5-pro` | Analisar foto de exame laboratorial (hemograma, glicemia, etc) |
| `dr-vital-chat` | `gemini-2.5-pro` | Chat médico com Dr. Vital para tirar dúvidas de saúde |
| `dr-vital-enhanced` | `gemini-2.5-flash` | Chat médico avançado com contexto expandido do paciente |
| `dr-vital-weekly-report` | `gemini-2.5-flash` | Gerar relatório semanal de saúde do paciente |
| `generate-medical-report` | `gemini-2.5-pro` | Criar relatório médico completo em HTML |
| `premium-medical-report` | `gemini-2.5-pro` | Relatório médico premium com análise aprofundada |
| `finalize-medical-document` | `gemini-2.5-flash` | Finalizar e formatar documento médico |
| `detect-image-type` | `gemini-2.5-flash` | Detectar se imagem é exame médico ou comida |

---

## 💬 CHAT UNIFICADO

| Edge Function | Modelo | Para que serve |
|--------------|--------|----------------|
| `unified-ai-assistant` | `gemini-2.5-flash` | Chat unificado que alterna entre Sofia e Dr. Vital automaticamente |
| `enhanced-gpt-chat` | `gpt-4o` | Chat GPT avançado para conversas complexas |
| `interpret-user-intent` | `gemini-2.5-flash` | Detectar intenção do usuário (quer falar de comida? saúde? exercício?) |

---

## 📱 WHATSAPP

| Edge Function | Modelo | Para que serve |
|--------------|--------|----------------|
| `whatsapp-ai-assistant` | `gpt-5-mini` | Assistente principal do WhatsApp (entende áudio transcrito) |
| `whatsapp-daily-motivation` | `gemini-1.5-pro` | Enviar mensagem motivacional diária personalizada |
| `whatsapp-weekly-report` | `gemini-2.5-flash` | Enviar relatório semanal via WhatsApp |
| `whatsapp-habits-analysis` | `gemini-2.5-flash` | Analisar hábitos do usuário e dar feedback |
| `whatsapp-saboteur-result` | `gemini-2.5-flash` | Enviar resultado do teste de sabotadores |
| `whatsapp-nutrition-check` | `gemini-2.5-flash` | Verificar e comentar sobre nutrição do dia |
| `whatsapp-nutrition-webhook` | `gemini-2.5-flash` | Processar webhook de nutrição |
| `whatsapp-medical-handler` | `gemini-2.5-flash` | Processar fotos de exames via WhatsApp |
| `whatsapp-celebration` | `gemini-2.5-flash` | Celebrar conquistas do usuário |
| `whatsapp-goal-reminders` | `gemini-2.5-flash` | Lembrar usuário sobre suas metas |
| `whatsapp-smart-reminders` | `gemini-2.5-flash` | Lembretes inteligentes baseados em contexto |
| `whatsapp-welcome` | `gemini-2.5-flash` | Mensagem de boas-vindas personalizada |
| `whatsapp-mission-complete` | `gemini-2.5-flash` | Parabenizar por completar missão do dia |
| `whatsapp-generate-template` | `gemini-1.5-pro` | Gerar templates de mensagem |

---

## 🏋️ EXERCÍCIOS

| Edge Function | Modelo | Para que serve |
|--------------|--------|----------------|
| `generate-ai-workout` | `gemini-2.5-flash` | Gerar programa de treino personalizado (4 semanas) |
| `improve-exercises` | `gemini-2.5-flash` | Melhorar descrição e instruções de exercícios |

---

## 📊 RELATÓRIOS E ANÁLISES

| Edge Function | Modelo | Para que serve |
|--------------|--------|----------------|
| `saboteur-html-report` | `gemini-2.5-flash` | Gerar relatório de sabotadores internos em HTML |
| `google-fit-ai-analysis` | `gemini-2.5-flash` | Analisar dados do Google Fit e dar insights |
| `generate-user-biography` | `gemini-1.5-flash` | Criar biografia motivacional do usuário |
| `generate-human-message` | `gemini-2.5-flash-preview` | Gerar mensagens humanizadas para notificações |
| `n8n-weekly-whatsapp-report` | `gemini-2.5-flash` | Relatório semanal via N8N automation |

---

## 🔧 UTILITÁRIOS

| Edge Function | Modelo | Para que serve |
|--------------|--------|----------------|
| `activate-ai` | `gemini-2.5-flash` | Testar se conexões de IA estão funcionando |
| `vision-api` | `gemini-2.5-flash` | API genérica de visão computacional |

---

## 🦾 YOLO (VPS LOCAL - Pré-processamento)

| Serviço | Para que serve |
|---------|----------------|
| `YOLO Detection` (`45.67.221.216:8002`) | Detectar objetos em imagens ANTES de enviar para Gemini (identifica pratos, copos, alimentos) |

**Fluxo:** Imagem → YOLO detecta objetos → Gemini refina com contexto YOLO

---

## 📋 RESUMO POR PROVEDOR

### Lovable AI Gateway (Principal)
- `google/gemini-3-flash-preview` - Chat rápido
- `google/gemini-2.5-flash` - Uso geral (maioria das funções)
- `google/gemini-2.5-flash-lite` - Tarefas simples
- `google/gemini-2.5-pro` - Análise de exames médicos (qualidade crítica)
- `openai/gpt-5-mini` - WhatsApp (melhor compreensão de voz)

### Google AI Direct (Fallback)
- `gemini-1.5-flash` - Fallback rápido
- `gemini-1.5-pro` - Fallback premium

### OpenAI Direct (Fallback)
- `gpt-4o` - Fallback para chat complexo
- `gpt-4o-mini` - Fallback econômico

---

## 🔄 FUNÇÕES SEM IA (Determinísticas)

| Edge Function | O que faz |
|--------------|-----------|
| `sofia-deterministic` | Cálculos nutricionais via tabela TACO |
| `generate-meal-plan-taco` | Cardápio baseado em regras |
| `nutrition-calc` | Cálculos de macros |
| `nutrition-calc-deterministic` | Cálculos determinísticos |
| `nutrition-daily-summary` | Agregação de dados |
| `confirm-food-analysis` | Confirmação do usuário |
| `rate-limiter` | Controle de requisições |
| `cache-manager` | Gerenciamento de cache |

---

*Total: ~40 edge functions com IA + ~10 determinísticas*
