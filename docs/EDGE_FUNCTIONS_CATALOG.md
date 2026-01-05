# 📚 Catálogo Completo de Edge Functions

**Última atualização:** 05 de Janeiro de 2026  
**Total de Functions:** 53 Edge Functions

---

## 🎯 Índice por Categoria

1. [IAs e Assistentes Virtuais](#ias-e-assistentes-virtuais) (8 functions)
2. [Análise Nutricional](#análise-nutricional) (10 functions)
3. [Google Fit Integration](#google-fit-integration) (6 functions)
4. [Documentos Médicos](#documentos-médicos) (6 functions)
5. [Pagamentos e Assinaturas](#pagamentos-e-assinaturas) (3 functions)
6. [Notificações e Comunicação](#notificações-e-comunicação) (3 functions)
7. [Autenticação e Usuários](#autenticação-e-usuários) (5 functions)
8. [Integrações Externas](#integrações-externas) (3 functions)
9. [Configuração e Manutenção](#configuração-e-manutenção) (9 functions)

---

## 🤖 IAs e Assistentes Virtuais

### `dr-vital-chat`
**Descrição:** Chat principal do Dr. Vital - assistente médico virtual com acesso completo aos dados do paciente.

**Entrada:**
```typescript
{
  message: string;
  userId: string;
}
```

**Funcionalidades:**
- Carrega dados completos do usuário (20+ tabelas)
- Memória persistente de longo prazo
- Configurações de IA dinâmicas do banco
- Suporte a Lovable AI, OpenAI, Google AI

**Tabelas Acessadas:** profiles, user_anamnesis, user_physical_data, weight_measurements, nutrition_tracking, food_analysis, exercise_tracking, water_tracking, sleep_tracking, mood_tracking, user_goals, daily_responses, daily_mission_sessions, user_achievements, prescriptions, user_supplements, medical_documents, heart_rate_data, weekly_analyses, dr_vital_memory, conversations, conversation_messages

---

### `dr-vital-enhanced`
**Descrição:** Versão aprimorada do Dr. Vital com análises mais profundas e relatórios detalhados.

**Funcionalidades:**
- Análise multidimensional de saúde
- Correlação entre diferentes métricas
- Insights personalizados baseados em tendências
- Recomendações específicas por perfil

---

### `dr-vital-weekly-report`
**Descrição:** Gera relatórios semanais de saúde automatizados.

**Funcionalidades:**
- Compilação semanal de dados
- Análise de tendências
- Insights de IA sobre progresso
- Envio por email opcional

---

### `sofia-enhanced-memory`
**Descrição:** Sofia - assistente nutricional com memória persistente e contexto completo.

**Entrada:**
```typescript
{
  message: string;
  userId: string;
  context?: {
    imageUrl?: string;
  }
}
```

**Funcionalidades:**
- Contexto unificado de todas as tabelas
- Memória de conversas anteriores
- Personalidade carinhosa e empática
- Suporte a análise de imagens

**Módulo Compartilhado:** `_shared/user-complete-context.ts`

---

### `sofia-image-analysis`
**Descrição:** Análise de imagens de refeições com IA.

**Funcionalidades:**
- Identificação de alimentos
- Estimativa nutricional visual
- Sugestões de melhorias
- Integração com food_analysis

---

### `sofia-deterministic`
**Descrição:** Versão determinística da Sofia para respostas consistentes.

**Funcionalidades:**
- Respostas padronizadas para perguntas frequentes
- Menor uso de tokens
- Fallback quando IA principal indisponível

---

### `enhanced-gpt-chat`
**Descrição:** Chat genérico com GPT para funcionalidades auxiliares.

---

### `generate-user-biography`
**Descrição:** Gera biografia personalizada do usuário baseada em seus dados.

---

## 🍎 Análise Nutricional

### `food-analysis`
**Descrição:** Análise nutricional de alimentos e refeições.

**Entrada:**
```typescript
{
  userId: string;
  mealType: string;
  foods: string[];
  imageUrl?: string;
}
```

**Funcionalidades:**
- Cálculo de macronutrientes
- Identificação de alimentos por texto ou imagem
- Sugestões de substituições
- Registro no histórico

---

### `confirm-food-analysis`
**Descrição:** Confirmação e ajuste de análises nutricionais pelo usuário.

---

### `enrich-food-data`
**Descrição:** Enriquece dados de alimentos com informações nutricionais detalhadas.

---

### `enrich-sofia-analysis`
**Descrição:** Enriquece análises da Sofia com dados adicionais.

---

### `nutrition-calc`
**Descrição:** Calculadora nutricional com IA.

---

### `nutrition-calc-deterministic`
**Descrição:** Calculadora nutricional determinística (sem IA).

**Funcionalidades:**
- Cálculos baseados em tabelas nutricionais
- Resultados consistentes
- Menor latência

---

### `nutrition-ai-insights`
**Descrição:** Insights de IA sobre padrões nutricionais.

---

### `nutrition-alias-admin`
**Descrição:** Administração de aliases de alimentos para normalização.

**Entrada:**
```typescript
{
  food_id: string;
  aliases: string[];
}
```

---

### `nutrition-planner`
**Descrição:** Planejador de refeições com IA.

---

### `generate-meal-plan-taco`
**Descrição:** Gerador de planos alimentares usando tabela TACO.

---

## 📱 Google Fit Integration

### `google-fit-token`
**Descrição:** Gerencia tokens OAuth do Google Fit.

**Funcionalidades:**
- Troca de código por tokens
- Armazenamento seguro
- Validação de escopos

---

### `google-fit-callback`
**Descrição:** Callback OAuth para autenticação Google Fit.

**Fluxo:**
1. Recebe código de autorização
2. Troca por access_token e refresh_token
3. Salva na tabela google_fit_tokens
4. Redireciona para app

---

### `google-fit-sync`
**Descrição:** Sincronização principal de dados do Google Fit.

**Dados Sincronizados:**
- Passos, distância, calorias
- Frequência cardíaca (média, min, max, repouso)
- Sono (duração, estágios, eficiência)
- Peso, altura, IMC, gordura corporal
- Exercícios, hidratação
- Saturação de oxigênio

**Tabela Destino:** google_fit_data

---

### `google-fit-hourly-sync`
**Descrição:** Sincronização automática horária para todos os usuários.

---

### `google-fit-ai-analysis`
**Descrição:** Análise de IA sobre dados do Google Fit.

---

### `add-google-fit-columns`
**Descrição:** Utilitário para adicionar colunas do Google Fit nas tabelas.

---

## 🏥 Documentos Médicos

### `analyze-medical-exam`
**Descrição:** Análise de exames médicos com IA.

**Entrada:**
```typescript
{
  documentId: string;
  userId: string;
  documentType: string;
}
```

---

### `generate-medical-report`
**Descrição:** Geração de relatórios médicos personalizados.

---

### `premium-medical-report`
**Descrição:** Relatórios médicos premium com análises aprofundadas.

---

### `finalize-medical-document`
**Descrição:** Finalização e processamento de documentos médicos.

---

### `cleanup-medical-images`
**Descrição:** Limpeza de imagens médicas temporárias.

---

### `fix-stuck-documents`
**Descrição:** Correção de documentos travados em processamento.

---

## 💳 Pagamentos e Assinaturas

### `create-checkout`
**Descrição:** Cria sessão de checkout Stripe.

**Entrada:**
```typescript
{
  planId: string; // 'basico', 'avancado', 'premium'
}
```

**Planos:**
- Básico: price_xxx
- Avançado: price_yyy
- Premium: price_zzz

---

### `customer-portal`
**Descrição:** Portal do cliente Stripe para gerenciar assinatura.

---

### `check-subscription`
**Descrição:** Verifica status da assinatura do usuário.

---

### `create-asaas-payment`
**Descrição:** Integração com gateway ASAAS (alternativo).

---

## 📧 Notificações e Comunicação

### `send-email`
**Descrição:** Envio de emails via Resend.

**Entrada:**
```typescript
{
  to: string;
  subject: string;
  message: string;
  button_text?: string;
  button_url?: string;
}
```

---

### `goal-notifications`
**Descrição:** Notificações de metas e convites.

---

### `n8n-weekly-whatsapp-report`
**Descrição:** Integração com n8n para relatórios WhatsApp.

---

## 👤 Autenticação e Usuários

### `fix-handle-new-user`
**Descrição:** Trigger de criação de perfil para novos usuários.

**Funcionalidade:**
Cria registro na tabela `profiles` quando um novo usuário se registra, copiando dados de `raw_user_meta_data`.

---

### `create-sirlene`
**Descrição:** Utilitário para criar usuário específico.

---

### `repair-auth-metadata`
**Descrição:** Repara metadados de autenticação corrompidos.

---

### `check-user-data-completeness`
**Descrição:** Verifica completude dos dados do usuário.

---

### `check-gender-issue`
**Descrição:** Verifica inconsistências de gênero nos dados.

---

## 🔗 Integrações Externas

### `mealie-real`
**Descrição:** Integração real com servidor Mealie para receitas.

**Funcionalidades:**
- Busca receitas do Mealie
- Filtragem por restrições alimentares
- Cache de 5 minutos
- Mapeamento de nutrição

**Variáveis de Ambiente:**
- `MEALIE_BASE_URL`
- `MEALIE_API_TOKEN`

---

### `seed-standard-recipes`
**Descrição:** Popula banco com receitas padrão.

---

### `improve-exercises`
**Descrição:** Melhora descrições de exercícios com IA.

---

## ⚙️ Configuração e Manutenção

### `activate-ai`
**Descrição:** Ativa configurações de IA.

---

### `apply-robust-base`
**Descrição:** Aplica configuração base robusta.

---

### `fix-ai-configurations`
**Descrição:** Corrige configurações de IA no banco.

---

### `fix-storage`
**Descrição:** Corrige configurações de storage/buckets.

---

### `fix-storage-rls`
**Descrição:** Corrige políticas RLS do storage.

---

### `saboteur-html-report`
**Descrição:** Gera relatório HTML de sabotadores.

---

## 📁 Módulo Compartilhado

### `_shared/`

**Arquivos:**
- `user-complete-context.ts` - Contexto unificado do usuário
- `cors.ts` - Headers CORS padrão
- `supabase.ts` - Cliente Supabase compartilhado

---

## 🔐 Variáveis de Ambiente Requeridas

| Variável | Descrição | Functions |
|----------|-----------|-----------|
| `SUPABASE_URL` | URL do projeto Supabase | Todas |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de serviço | Todas |
| `LOVABLE_API_KEY` | API Key Lovable AI | IAs |
| `OPENAI_API_KEY` | API Key OpenAI (fallback) | IAs |
| `GOOGLE_AI_API_KEY` | API Key Google AI (fallback) | IAs |
| `GOOGLE_FIT_CLIENT_ID` | Client ID Google Fit | Google Fit |
| `GOOGLE_FIT_CLIENT_SECRET` | Client Secret Google Fit | Google Fit |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe | Pagamentos |
| `RESEND_API_KEY` | API Key Resend | Emails |
| `MEALIE_BASE_URL` | URL servidor Mealie | Mealie |
| `MEALIE_API_TOKEN` | Token API Mealie | Mealie |

---

## 📊 Estatísticas

- **Total:** 53 Edge Functions
- **Ativas em Produção:** 53
- **Usando Lovable AI:** 8
- **Com Fallback OpenAI:** 8
- **Integrações Externas:** 5 (Google Fit, Stripe, Resend, Mealie, n8n)

---

*Documentação gerada automaticamente em 05/01/2026*
