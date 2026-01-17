# 🚀 Guia de Deploy - Arquitetura Assíncrona

## 📋 Pré-requisitos

- ✅ Supabase CLI instalado
- ✅ Projeto Supabase configurado
- ✅ Acesso ao banco de dados
- ✅ Variáveis de ambiente configuradas

## 🔧 Passo 1: Aplicar Migration

```bash
# Aplicar migration do sistema de jobs
supabase db push

# Ou aplicar migration específica
supabase migration up 20260117100000
```

**Verificar:**
```sql
-- Verificar se as tabelas foram criadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('analysis_jobs', 'job_queue', 'analysis_cache');

-- Verificar funções RPC
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('enqueue_job', 'get_next_job', 'complete_job', 'fail_job');
```

## 📤 Passo 2: Deploy Edge Functions

### 2.1 Deploy enqueue-analysis

```bash
cd supabase/functions
supabase functions deploy enqueue-analysis
```

**Testar:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/enqueue-analysis \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://example.com/food.jpg",
    "userId": "test-user-id",
    "jobType": "food_image",
    "userContext": {"userName": "Test User"},
    "mealType": "almoco"
  }'
```

**Resposta esperada (202 Accepted):**
```json
{
  "success": true,
  "job_id": "uuid-here",
  "status": "queued",
  "message": "Analisando sua foto... Você receberá uma notificação em breve! 📸✨",
  "estimated_time": "10 segundos"
}
```

### 2.2 Deploy process-analysis-worker

```bash
supabase functions deploy process-analysis-worker
```

**Testar:**
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/process-analysis-worker \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Resposta esperada:**
```json
{
  "success": true,
  "job_id": "uuid-here",
  "result": { ... }
}
```

## ⏰ Passo 3: Configurar Worker Automático

### Opção A: Supabase Cron (Recomendado)

```sql
-- Executar worker a cada 10 segundos
SELECT cron.schedule(
  'process-analysis-jobs',
  '*/10 * * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/process-analysis-worker',
    headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);

-- Verificar cron jobs
SELECT * FROM cron.job;

-- Verificar execuções
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Opção B: Worker Externo (Node.js)

Criar arquivo `worker.js`:

```javascript
const SUPABASE_URL = 'https://YOUR_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
const WORKER_INTERVAL = 10000; // 10 segundos

async function processJobs() {
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/process-analysis-worker`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Job ${data.job_id} processado`);
    } else {
      console.log('⏸️ Nenhum job disponível');
    }
  } catch (error) {
    console.error('❌ Erro ao processar jobs:', error);
  }
}

// Executar worker continuamente
setInterval(processJobs, WORKER_INTERVAL);
console.log(`🤖 Worker iniciado (intervalo: ${WORKER_INTERVAL}ms)`);
```

**Executar:**
```bash
node worker.js
```

**Ou com PM2 (produção):**
```bash
npm install -g pm2
pm2 start worker.js --name "analysis-worker"
pm2 save
pm2 startup
```

### Opção C: GitHub Actions (CI/CD)

Criar `.github/workflows/worker.yml`:

```yaml
name: Analysis Worker

on:
  schedule:
    - cron: '*/1 * * * *' # A cada minuto
  workflow_dispatch: # Manual trigger

jobs:
  process-jobs:
    runs-on: ubuntu-latest
    steps:
      - name: Process Analysis Jobs
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/process-analysis-worker \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

## 🔍 Passo 4: Verificar Funcionamento

### 4.1 Criar Job de Teste

```sql
-- Inserir job de teste
INSERT INTO analysis_jobs (user_id, job_type, input_data, status)
VALUES (
  'test-user-id',
  'food_image',
  '{"imageUrl": "https://example.com/food.jpg", "mealType": "almoco"}'::jsonb,
  'queued'
)
RETURNING id;

-- Enfileirar job
SELECT enqueue_job(
  'JOB_ID_AQUI'::uuid,
  5,
  NOW()
);
```

### 4.2 Verificar Processamento

```sql
-- Ver jobs na fila
SELECT * FROM job_queue ORDER BY priority DESC, scheduled_at ASC;

-- Ver status dos jobs
SELECT id, job_type, status, created_at, started_at, completed_at
FROM analysis_jobs
ORDER BY created_at DESC
LIMIT 10;

-- Ver jobs em processamento
SELECT * FROM analysis_jobs WHERE status = 'processing';

-- Ver jobs completos
SELECT * FROM analysis_jobs WHERE status = 'completed' ORDER BY completed_at DESC LIMIT 5;
```

### 4.3 Monitorar Logs

```bash
# Logs da edge function enqueue-analysis
supabase functions logs enqueue-analysis

# Logs da edge function process-analysis-worker
supabase functions logs process-analysis-worker
```

## 🎨 Passo 5: Integrar no Frontend

### 5.1 Atualizar Componente Existente

Exemplo: Atualizar `SofiaSimpleChat.tsx` para usar análise assíncrona:

```typescript
import { useAsyncAnalysis } from '@/hooks/useAsyncAnalysis';

function SofiaSimpleChat() {
  const { user } = useAuth();
  const {
    enqueueAnalysis,
    status,
    result,
    progress
  } = useAsyncAnalysis(user?.id, {
    onComplete: (result) => {
      // Processar resultado
      console.log('Análise completa:', result);
    }
  });

  const handleImageUpload = async (imageUrl: string) => {
    await enqueueAnalysis(
      'food_image',
      imageUrl,
      { userName: user?.email?.split('@')[0] },
      'almoco'
    );
  };

  return (
    <div>
      {/* UI existente */}
      
      {status === 'processing' && (
        <div>
          <p>Processando... {Math.round(progress)}%</p>
          <Progress value={progress} />
        </div>
      )}
      
      {status === 'completed' && result && (
        <div>
          <p>Análise completa!</p>
          {/* Mostrar resultado */}
        </div>
      )}
    </div>
  );
}
```

### 5.2 Testar no Navegador

1. Abrir aplicação
2. Fazer upload de imagem
3. Verificar resposta imediata
4. Ver progresso em tempo real
5. Receber notificação quando completo

## 📊 Passo 6: Monitoramento em Produção

### 6.1 Dashboard de Métricas

Criar view para dashboard:

```sql
CREATE OR REPLACE VIEW job_dashboard AS
SELECT 
  -- Estatísticas gerais
  COUNT(*) FILTER (WHERE status = 'queued') as jobs_queued,
  COUNT(*) FILTER (WHERE status = 'processing') as jobs_processing,
  COUNT(*) FILTER (WHERE status = 'completed') as jobs_completed,
  COUNT(*) FILTER (WHERE status = 'failed') as jobs_failed,
  
  -- Tempo médio de processamento
  AVG(actual_duration_seconds) FILTER (WHERE status = 'completed') as avg_duration,
  
  -- Taxa de sucesso
  ROUND(
    COUNT(*) FILTER (WHERE status = 'completed') * 100.0 / 
    NULLIF(COUNT(*) FILTER (WHERE status IN ('completed', 'failed')), 0),
    2
  ) as success_rate,
  
  -- Jobs nas últimas 24h
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as jobs_24h
FROM analysis_jobs;

-- Consultar dashboard
SELECT * FROM job_dashboard;
```

### 6.2 Alertas

Configurar alertas para:

- ❌ Taxa de falha > 10%
- ⏰ Tempo médio > 20 segundos
- 📊 Fila com > 100 jobs
- 🔒 Jobs travados > 5 minutos

```sql
-- Jobs travados (locked há mais de 5 minutos)
SELECT jq.*, aj.job_type, aj.input_data
FROM job_queue jq
JOIN analysis_jobs aj ON aj.id = jq.job_id
WHERE jq.locked_at IS NOT NULL
  AND jq.lock_expires_at < NOW()
ORDER BY jq.locked_at;

-- Liberar jobs travados
UPDATE job_queue
SET locked_at = NULL, locked_by = NULL, lock_expires_at = NULL
WHERE lock_expires_at < NOW();
```

## 🧹 Passo 7: Limpeza e Manutenção

### 7.1 Limpar Cache Expirado

```sql
-- Executar manualmente
SELECT cleanup_expired_cache();

-- Ou agendar com cron
SELECT cron.schedule(
  'cleanup-cache',
  '0 * * * *', -- A cada hora
  $$SELECT cleanup_expired_cache();$$
);
```

### 7.2 Arquivar Jobs Antigos

```sql
-- Criar tabela de arquivo
CREATE TABLE analysis_jobs_archive (LIKE analysis_jobs INCLUDING ALL);

-- Arquivar jobs completos com mais de 30 dias
INSERT INTO analysis_jobs_archive
SELECT * FROM analysis_jobs
WHERE status IN ('completed', 'failed')
  AND completed_at < NOW() - INTERVAL '30 days';

-- Deletar jobs arquivados
DELETE FROM analysis_jobs
WHERE status IN ('completed', 'failed')
  AND completed_at < NOW() - INTERVAL '30 days';
```

## ✅ Checklist de Deploy

- [ ] Migration aplicada
- [ ] Edge functions deployadas
- [ ] Worker automático configurado
- [ ] Teste de enfileiramento funcionando
- [ ] Teste de processamento funcionando
- [ ] Realtime funcionando no frontend
- [ ] Monitoramento configurado
- [ ] Alertas configurados
- [ ] Limpeza automática configurada
- [ ] Documentação atualizada

## 🐛 Troubleshooting

### Problema: Jobs não são processados

**Solução:**
1. Verificar se worker está rodando
2. Verificar logs do worker
3. Verificar se há jobs na fila: `SELECT * FROM job_queue;`
4. Verificar se há jobs travados

### Problema: Realtime não funciona

**Solução:**
1. Verificar se Realtime está habilitado no Supabase
2. Verificar RLS policies na tabela `analysis_jobs`
3. Verificar se usuário tem permissão para ver seus jobs
4. Verificar logs do navegador

### Problema: Cache não funciona

**Solução:**
1. Verificar se tabela `analysis_cache` existe
2. Verificar se cache está sendo salvo após processamento
3. Verificar TTL do cache
4. Limpar cache expirado: `SELECT cleanup_expired_cache();`

## 📚 Recursos Adicionais

- [Documentação Completa](./ASYNC_ARCHITECTURE_IMPLEMENTATION.md)
- [Análise da Arquitetura Atual](./ANALISE_ARQUITETURA_ATUAL.md)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)

---

**Última atualização:** 2026-01-17  
**Status:** ✅ Pronto para deploy
