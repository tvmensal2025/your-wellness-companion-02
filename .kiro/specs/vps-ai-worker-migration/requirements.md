# VPS AI Worker Migration - Requirements

## 📋 Executive Summary

Migrar o processamento pesado de IA (YOLO + Ollama/Gemini + parsing) das Supabase Edge Functions síncronas para workers dedicados na VPS (24GB RAM / 200GB NVMe), mantendo as Edge Functions apenas como gateway rápido (validação + enfileiramento + 202 response).

## 🎯 Business Goals

1. **Eliminar timeouts** - Edge Functions síncronas dão timeout em processamentos > 30s
2. **Reduzir custos** - VPS dedicada é mais econômica que serverless para workloads pesados
3. **Melhorar UX** - Usuário recebe resposta imediata (202) e acompanha progresso
4. **Escalar melhor** - Workers na VPS podem processar múltiplos jobs em paralelo
5. **Zero downtime** - Migração gradual com feature flags e fallback automático

## 🏗️ Current Architecture (Problems)

### Fluxo Atual (Síncrono - PROBLEMÁTICO)

```
┌─────────────┐
│  Frontend   │
│   (React)   │
└──────┬──────┘
       │ POST /functions/sofia-image-analysis
       │ (aguarda 5-30s bloqueado)
       ▼
┌─────────────────────────────────────┐
│   Supabase Edge Function           │
│   (Deno/Serverless)                 │
│                                     │
│   1. Valida input                   │
│   2. Chama YOLO (VPS) - 2-5s       │
│   3. Chama Gemini/Ollama - 3-15s   │
│   4. Processa resultado - 1-3s     │
│   5. Salva no banco - 1s           │
│   6. Retorna 200 + resultado       │
│                                     │
│   ⚠️ TIMEOUT se > 30s              │
│   ⚠️ Usuário bloqueado esperando   │
│   ⚠️ Não pode cancelar             │
└─────────────────────────────────────┘
```

### Edge Functions Críticas (Processamento Pesado)

| Edge Function | Tempo Médio | Timeout Risk | Chamadas/dia | Prioridade |
|---------------|-------------|--------------|--------------|------------|
| `sofia-image-analysis` | 8-15s | 🔴 Alto | ~500 | P0 |
| `analyze-medical-exam` | 10-25s | 🔴 Alto | ~200 | P0 |
| `unified-ai-assistant` | 5-12s | 🟡 Médio | ~1000 | P1 |
| `whatsapp-ai-assistant` | 3-8s | 🟡 Médio | ~800 | P1 |
| `dr-vital-enhanced` | 6-15s | 🟡 Médio | ~300 | P1 |
| `generate-meal-plan-taco` | 8-20s | 🔴 Alto | ~150 | P2 |
| `whatsapp-nutrition-webhook` | 5-15s | 🟡 Médio | ~600 | P2 |
| `google-fit-ai-analysis` | 4-10s | 🟡 Médio | ~100 | P3 |

**Total**: ~3650 chamadas/dia que podem dar timeout

### Frontend Components Afetados (14 chamadas síncronas)

| Componente | Edge Function | Arquivo | Linha |
|------------|---------------|---------|-------|
| QuickPhotoCapture | sofia-image-analysis | `src/components/nutrition/QuickPhotoCapture.tsx` | 51 |
| FoodAnalysisSystem | sofia-image-analysis | `src/components/FoodAnalysisSystem.tsx` | 329 |
| HealthChatBot | sofia-enhanced-memory | `src/components/HealthChatBot.tsx` | 329 |
| HealthChatBot (image) | sofia-image-analysis | `src/components/HealthChatBot.tsx` | 395 |
| MedicalDocumentsSection | analyze-medical-exam | `src/components/dashboard/MedicalDocumentsSection.tsx` | 551 |
| MedicalDocumentsSection | finalize-medical-document | `src/components/dashboard/MedicalDocumentsSection.tsx` | 257 |
| DrVitalChat | dr-vital-enhanced | `src/components/dashboard/DrVitalChat.tsx` | 159 |
| MealPlanGeneratorModal | generate-meal-plan-taco | `src/components/nutrition-tracking/MealPlanGeneratorModal.tsx` | 271 |
| SofiaConfirmationModal | sofia-deterministic | `src/components/sofia/SofiaConfirmationModal.tsx` | 326 |
| PremiumExamUploader | finalize-medical-document | `src/components/sofia/PremiumExamUploader.tsx` | 45 |
| AIHealthAnalysis | google-fit-ai-analysis | `src/components/google-fit/AIHealthAnalysis.tsx` | 61 |
| SofiaVoiceChat | sofia-image-analysis | `src/components/sofia/SofiaVoiceChat.tsx` | 188 |
| SofiaIntegratedChat | gpt-chat | `src/components/sofia/SofiaIntegratedChat.tsx` | 186 |
| WhatsApp Webhook | whatsapp-nutrition-webhook | `supabase/functions/whatsapp-nutrition-webhook/index.ts` | - |

## 🎯 Target Architecture (Solution)

### Fluxo Novo (Assíncrono - SOLUÇÃO)

```
┌─────────────┐
│  Frontend   │
│   (React)   │
└──────┬──────┘
       │ POST /functions/enqueue-analysis
       │ (retorna em 100-200ms)
       ▼
┌─────────────────────────────────────┐
│   Supabase Edge Function           │
│   (Gateway Rápido)                  │
│                                     │
│   1. Valida input (50ms)            │
│   2. Cria job no banco (50ms)       │
│   3. Retorna 202 + job_id (100ms)   │
│                                     │
│   ✅ Sempre rápido                  │
│   ✅ Nunca dá timeout               │
└─────────────────────────────────────┘
       │
       │ Job criado no banco
       ▼
┌─────────────────────────────────────┐
│   VPS AI Worker                     │
│   (Node.js/Express)                 │
│                                     │
│   Loop contínuo:                    │
│   1. Busca jobs pending (1s)        │
│   2. Marca processing               │
│   3. Chama YOLO (local VPS) - 2s    │
│   4. Chama Ollama/Gemini - 5s       │
│   5. Processa resultado - 2s        │
│   6. Salva result no banco          │
│   7. Marca completed                │
│                                     │
│   ✅ Sem limite de tempo            │
│   ✅ Retry automático               │
│   ✅ Processamento paralelo         │
└─────────────────────────────────────┘
       │
       │ Job completed
       ▼
┌─────────────────────────────────────┐
│   Frontend                          │
│   (Polling ou Realtime)             │
│                                     │
│   - Polling: GET /jobs/:id (2s)     │
│   - Realtime: Postgres changes      │
│   - Mostra loading state            │
│   - Permite cancelar                │
│   - Retry manual se falhar          │
└─────────────────────────────────────┘
```

## 📊 User Stories

### US-1: Como usuário, quero analisar foto de alimento sem timeout
**Acceptance Criteria:**
- [ ] AC-1.1: Ao enviar foto, recebo resposta em < 500ms com job_id
- [ ] AC-1.2: Vejo loading state com progresso estimado
- [ ] AC-1.3: Posso cancelar análise em andamento
- [ ] AC-1.4: Se falhar, posso tentar novamente
- [ ] AC-1.5: Resultado aparece automaticamente quando pronto
- [ ] AC-1.6: Se worker estiver offline, usa fluxo síncrono antigo (fallback)

### US-2: Como desenvolvedor, quero migrar gradualmente sem quebrar nada
**Acceptance Criteria:**
- [ ] AC-2.1: Feature flags por tipo de análise (sofia, exams, unified)
- [ ] AC-2.2: Fallback automático se worker indisponível
- [ ] AC-2.3: Rollback instantâneo desligando flags
- [ ] AC-2.4: Logs detalhados de cada etapa
- [ ] AC-2.5: Métricas de latência (gateway vs worker vs total)

### US-3: Como admin, quero monitorar saúde do sistema
**Acceptance Criteria:**
- [ ] AC-3.1: Dashboard mostra jobs pending/processing/completed/failed
- [ ] AC-3.2: Alertas se fila > 50 jobs ou worker offline > 5min
- [ ] AC-3.3: Métricas de throughput (jobs/min)
- [ ] AC-3.4: Tempo médio de processamento por tipo
- [ ] AC-3.5: Taxa de erro e retry

### US-4: Como sistema, quero processar jobs com prioridade e retry
**Acceptance Criteria:**
- [ ] AC-4.1: Jobs premium têm prioridade alta
- [ ] AC-4.2: Retry automático até 3x com backoff exponencial
- [ ] AC-4.3: Jobs stuck > 5min são marcados como failed
- [ ] AC-4.4: Cache de resultados para inputs idênticos
- [ ] AC-4.5: Rate limiting por usuário (max 10 jobs simultâneos)

## 🗄️ Database Schema

### Tabela: `analysis_jobs`

```sql
CREATE TABLE analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Tipo de análise
  type TEXT NOT NULL CHECK (type IN (
    'sofia_image',
    'sofia_text', 
    'medical_exam',
    'unified_assistant',
    'meal_plan',
    'whatsapp_message'
  )),
  
  -- Input (JSONB para flexibilidade)
  input JSONB NOT NULL,
  -- Exemplo: { "imageUrl": "...", "mealType": "lunch", "userId": "..." }
  
  -- Status e controle
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
  )),
  
  priority INTEGER NOT NULL DEFAULT 5, -- 1=highest, 10=lowest
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  
  -- Resultado
  result JSONB, -- Resultado completo da análise
  error TEXT, -- Mensagem de erro se falhou
  
  -- Metadados
  processing_time_ms INTEGER, -- Tempo total de processamento
  worker_id TEXT, -- ID do worker que processou
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ, -- Quando começou a processar
  completed_at TIMESTAMPTZ, -- Quando terminou
  
  -- Índices
  INDEX idx_jobs_status_priority (status, priority, created_at),
  INDEX idx_jobs_user_created (user_id, created_at DESC),
  INDEX idx_jobs_type_status (type, status)
);

-- RLS Policies
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Usuários só veem seus próprios jobs
CREATE POLICY "Users can view own jobs"
  ON analysis_jobs FOR SELECT
  USING (auth.uid() = user_id);

-- Service role pode tudo (Edge Functions e Worker)
CREATE POLICY "Service role full access"
  ON analysis_jobs FOR ALL
  USING (auth.role() = 'service_role');
```

### Tabela: `analysis_cache`

```sql
CREATE TABLE analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Cache key (hash do input)
  cache_key TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL,
  
  -- Resultado cacheado
  response JSONB NOT NULL,
  
  -- Estatísticas
  hit_count INTEGER NOT NULL DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  
  -- Expiração
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  INDEX idx_cache_key (cache_key),
  INDEX idx_cache_expires (expires_at)
);

-- Limpar cache expirado automaticamente
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM analysis_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

## 🔧 VPS Services (EasyPanel)

### Serviços Atuais na VPS

| Serviço | URL | Status | Uso |
|---------|-----|--------|-----|
| YOLO Detection | `yolo-service-yolo-detection.0sw627.easypanel.host` | ✅ Ativo | Detecção de objetos |
| Ollama Web | `yolo-service-ollama.0sw627.easypanel.host` | ✅ Ativo | LLM local gratuito |
| Media API (MinIO) | `media-api.easypanel.host` | ✅ Ativo | Storage de imagens |

### Novo Serviço: AI Worker

```yaml
# easypanel-ai-worker.yml
name: ai-worker
image: node:20-alpine
command: npm start
env:
  - NODE_ENV=production
  - PORT=3001
  - SUPABASE_URL=${SUPABASE_URL}
  - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
  - YOLO_URL=http://yolo-service:8000
  - OLLAMA_URL=http://ollama-web:11434
  - GEMINI_API_KEY=${GEMINI_API_KEY}
  - WORKER_CONCURRENCY=5
  - WORKER_POLL_INTERVAL_MS=1000
  - WORKER_ID=ai-worker-1
resources:
  memory: 4GB
  cpu: 2
healthcheck:
  path: /health
  interval: 30s
```

## 🚀 Feature Flags

### Environment Variables (Frontend)

```env
# Feature Flags - Async Processing
VITE_USE_ASYNC_SOFIA=false          # Sofia image/text analysis
VITE_USE_ASYNC_EXAMS=false          # Medical exam analysis
VITE_USE_ASYNC_UNIFIED=false        # Unified AI assistant
VITE_USE_ASYNC_MEAL_PLAN=false      # Meal plan generation
VITE_USE_ASYNC_WHATSAPP=false       # WhatsApp AI responses

# Worker Configuration
VITE_AI_WORKER_URL=https://ai-worker.easypanel.host
VITE_AI_WORKER_TIMEOUT_MS=30000     # Timeout para fallback
VITE_AI_WORKER_POLL_INTERVAL_MS=2000 # Polling interval
```

### Environment Variables (VPS Worker)

```env
# Supabase
SUPABASE_URL=https://ciszqtlaacrhfwsqnvjr.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# AI Services (URLs internas do EasyPanel)
YOLO_URL=http://yolo-service:8000
OLLAMA_URL=http://ollama-web:11434
GEMINI_API_KEY=<gemini-key>

# Worker Config
WORKER_ID=ai-worker-1
WORKER_CONCURRENCY=5                # Jobs simultâneos
WORKER_POLL_INTERVAL_MS=1000        # Polling interval
WORKER_MAX_RETRIES=3
WORKER_RETRY_DELAY_MS=2000
WORKER_STUCK_JOB_TIMEOUT_MS=300000  # 5min

# Cache
ENABLE_CACHE=true
CACHE_TTL_HOURS=24

# Monitoring
ENABLE_METRICS=true
LOG_LEVEL=info
```

## 📈 Success Metrics

### Performance Targets

| Métrica | Atual | Target | Melhoria |
|---------|-------|--------|----------|
| Gateway latency (p95) | N/A | < 200ms | - |
| Worker completion (p95) | N/A | < 15s | - |
| Total time (p95) | 15-30s | < 20s | -33% |
| Timeout rate | 5-10% | < 0.1% | -98% |
| User satisfaction | 3.5/5 | 4.5/5 | +28% |

### Cost Targets

| Item | Atual | Target | Economia |
|------|-------|--------|----------|
| Supabase Edge invocations | ~3650/dia | ~3650/dia | $0 |
| Supabase Edge duration | ~50k CPU-s/dia | ~5k CPU-s/dia | -90% |
| VPS cost | $0 | $0 | $0 |
| **Total monthly** | ~$15 | ~$2 | **-87%** |

## 🔒 Security & Compliance

### Authentication

- [ ] Edge Functions: Validam JWT do usuário (auth.uid())
- [ ] VPS Worker: Usa SERVICE_ROLE_KEY (nunca exposto ao frontend)
- [ ] Frontend: Nunca tem acesso a SERVICE_ROLE_KEY

### Data Privacy

- [ ] Jobs contêm apenas referências (URLs), não dados sensíveis
- [ ] RLS garante que usuários só veem seus próprios jobs
- [ ] Cache usa hash do input (não armazena dados sensíveis)
- [ ] Logs não contêm PII

### Rate Limiting

- [ ] Por usuário: max 10 jobs simultâneos
- [ ] Por IP: max 50 requests/min no gateway
- [ ] Worker: max 5 jobs simultâneos (configurável)

## 🧪 Testing Strategy

### Unit Tests

- [ ] Gateway: validação de input, criação de job
- [ ] Worker: processamento de cada tipo de job
- [ ] Cache: hit/miss, expiração

### Integration Tests

- [ ] Fluxo completo: enqueue → process → complete
- [ ] Fallback: worker offline → usa fluxo síncrono
- [ ] Retry: job falha → retry automático
- [ ] Cancel: usuário cancela → job marcado cancelled

### Load Tests (K6)

```javascript
// Test 1: Gateway throughput
// Target: 100 req/s, p95 < 200ms

// Test 2: Worker throughput  
// Target: 5 jobs/s, p95 completion < 15s

// Test 3: End-to-end
// Target: 50 concurrent users, p95 total < 20s
```

### Chaos Tests

- [ ] Worker crash durante processamento
- [ ] Banco de dados lento (> 1s)
- [ ] YOLO/Ollama indisponível
- [ ] Gemini rate limit

## 📝 Migration Plan (High-Level)

### Phase 1: Infrastructure (Week 1)
- [ ] Criar tabelas `analysis_jobs` e `analysis_cache`
- [ ] Implementar VPS AI Worker (Node.js)
- [ ] Deploy no EasyPanel
- [ ] Testes de integração

### Phase 2: Gateway (Week 1-2)
- [ ] Refatorar Edge Functions para gateway mode
- [ ] Implementar feature flags
- [ ] Implementar fallback síncrono
- [ ] Testes unitários

### Phase 3: Frontend (Week 2)
- [ ] Criar hook `useAsyncAnalysis`
- [ ] Migrar 1 componente (POC): QuickPhotoCapture
- [ ] Implementar polling/realtime
- [ ] Testes E2E

### Phase 4: Rollout (Week 3)
- [ ] Habilitar async para 10% usuários (canary)
- [ ] Monitorar métricas por 48h
- [ ] Habilitar para 50% usuários
- [ ] Monitorar métricas por 48h
- [ ] Habilitar para 100% usuários

### Phase 5: Cleanup (Week 4)
- [ ] Remover código síncrono antigo
- [ ] Remover feature flags
- [ ] Documentação final
- [ ] Post-mortem

## 🚨 Rollback Plan

### Trigger Conditions

- Error rate > 5%
- Worker offline > 10min
- User complaints > 10/hour
- P95 latency > 30s

### Rollback Steps

1. Desligar feature flags (1 min)
2. Verificar fluxo síncrono funcionando (5 min)
3. Investigar causa raiz (30 min)
4. Fix e redeploy (variável)

## 📚 Documentation

### Developer Docs

- [ ] Architecture diagram (Mermaid)
- [ ] API reference (Gateway + Worker)
- [ ] Database schema
- [ ] Deployment guide (EasyPanel)
- [ ] Troubleshooting guide

### User Docs

- [ ] FAQ: "Por que minha análise está demorando?"
- [ ] Tutorial: Como cancelar análise
- [ ] Status page: Worker health

## ✅ Definition of Done

- [ ] Todos os acceptance criteria atendidos
- [ ] Testes passando (unit + integration + E2E)
- [ ] Load tests validados (K6)
- [ ] Documentação completa
- [ ] Code review aprovado
- [ ] Deploy em produção
- [ ] Monitoramento ativo
- [ ] Zero regressões reportadas em 7 dias

---

**Última atualização**: 2026-01-17
**Autor**: Kiro AI Assistant
**Status**: Draft → Aguardando aprovação
