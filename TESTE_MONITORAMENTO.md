# 🧪 TESTE DO SISTEMA DE MONITORAMENTO

> Guia rápido para testar o sistema de monitoramento em tempo real

---

## 🚀 PASSO 1: Aplicar Migration

```bash
# Aplicar a migration do sistema de monitoramento
npx supabase db push

# Ou se estiver usando Supabase CLI local:
supabase db push
```

**Resultado esperado:**
```
✅ Migration 20260117120000_create_performance_monitoring.sql aplicada
✅ Tabelas criadas: performance_metrics, service_health_checks, critical_errors
✅ Views criadas: metrics_hourly, services_status, feature_performance_24h
✅ Functions criadas: log_performance_metric, log_health_check, etc
```

---

## 🔍 PASSO 2: Verificar Tabelas

No Supabase Dashboard → SQL Editor:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'performance_metrics',
  'service_health_checks',
  'critical_errors'
);

-- Deve retornar 3 linhas
```

---

## 👤 PASSO 3: Acessar o Painel Admin

1. **Fazer login como admin**
   - URL: `http://localhost:5173/admin` (ou seu domínio)
   - Usar credenciais de admin

2. **Verificar menu**
   - Deve aparecer: **"📊 Performance Monitoring"**
   - Logo após "Dashboard Admin"

3. **Clicar em Performance Monitoring**
   - Deve abrir o dashboard
   - Inicialmente vazio (sem métricas ainda)

---

## 📊 PASSO 4: Gerar Métricas de Teste

### Opção A: Usar Sofia (Análise de Alimentos)

1. Ir para **Sofia** ou **Dashboard**
2. Fazer upload de uma imagem de comida
3. Aguardar análise completar
4. Voltar para **Performance Monitoring**
5. Deve aparecer:
   - Métrica em "sofia" → "analyze_food"
   - Tempo de execução
   - Status de sucesso

### Opção B: Usar Camera Workout

1. Ir para **Exercícios** → **Camera Workout**
2. Iniciar um workout
3. Fazer alguns reps
4. Finalizar workout
5. Voltar para **Performance Monitoring**
6. Deve aparecer:
   - Métrica em "camera_workout" → "workout_session"
   - FPS, latência, score

### Opção C: Inserir Métricas Manualmente (SQL)

No Supabase SQL Editor:

```sql
-- Inserir métrica de teste
INSERT INTO performance_metrics (
  feature,
  action,
  duration_ms,
  success,
  metadata
) VALUES (
  'sofia',
  'analyze_food',
  1500,
  true,
  '{"foods_detected": 3, "calories": 450}'::jsonb
);

-- Inserir health check
INSERT INTO service_health_checks (
  service_name,
  status,
  response_time_ms
) VALUES (
  'yolo',
  'healthy',
  120
);

-- Inserir erro crítico
INSERT INTO critical_errors (
  feature,
  error_type,
  error_message,
  resolved
) VALUES (
  'sofia',
  'NetworkError',
  'Failed to connect to YOLO service',
  false
);
```

---

## ✅ PASSO 5: Verificar Dashboard

### Aba: Visão Geral

**Deve mostrar:**
- ✅ Total de Requisições: > 0
- ✅ Taxa de Sucesso: ~100%
- ✅ Tempo Médio: valor em ms
- ✅ Serviços Ativos: X/Y

**Gráficos:**
- ✅ Requisições por Hora (área chart)
- ✅ Requisições por Feature (bar chart)
- ✅ Tempo de Resposta (bar chart)

### Aba: Por Feature

**Deve mostrar:**
- ✅ Card para cada feature (sofia, camera_workout, etc)
- ✅ Total de requisições
- ✅ Tempo médio, P50, P95, P99
- ✅ Taxa de sucesso

### Aba: Serviços

**Deve mostrar:**
- ✅ Status de cada serviço
- ✅ Badge: healthy (verde), degraded (amarelo), down (vermelho)
- ✅ Tempo de resposta
- ✅ Última verificação

### Aba: Erros

**Deve mostrar:**
- ✅ Lista de erros críticos não resolvidos
- ✅ Detalhes do erro
- ✅ Botão "Marcar como resolvido"

---

## 🧪 PASSO 6: Testar Funcionalidades

### 1. Auto-Refresh (30 segundos)

1. Deixar dashboard aberto
2. Em outra aba, fazer uma análise Sofia
3. Aguardar 30 segundos
4. Dashboard deve atualizar automaticamente

### 2. Refresh Manual

1. Clicar no botão **"Atualizar"**
2. Deve mostrar loading
3. Dados devem atualizar

### 3. Filtro de Tempo

1. Mudar de "Últimas 24h" para "Última hora"
2. Gráficos devem atualizar
3. Métricas devem recalcular

### 4. Resolver Erro

1. Na aba "Erros", clicar em **"Marcar como resolvido"**
2. Erro deve desaparecer da lista
3. Toast de sucesso deve aparecer

---

## 🔬 PASSO 7: Testar Health Checks

### Verificar YOLO

```typescript
// No console do navegador (F12)
import { yoloMonitoring } from '@/lib/monitoring';

const status = await yoloMonitoring.checkHealth();
console.log('YOLO Status:', status);
// Deve retornar: 'healthy', 'degraded' ou 'down'
```

### Verificar no Dashboard

1. Ir para aba **"Serviços"**
2. Procurar card **"yolo"**
3. Deve mostrar:
   - Status: healthy (se YOLO estiver online)
   - Tempo de resposta: ~100-200ms
   - Última verificação: timestamp recente

---

## 📈 PASSO 8: Validar Queries

No Supabase SQL Editor:

```sql
-- Ver métricas horárias
SELECT * FROM metrics_hourly
ORDER BY hour DESC
LIMIT 10;

-- Ver status dos serviços
SELECT * FROM services_status;

-- Ver performance por feature
SELECT * FROM feature_performance_24h;

-- Ver top erros
SELECT * FROM top_errors_24h;

-- Contar métricas
SELECT 
  feature,
  COUNT(*) as total,
  AVG(duration_ms) as avg_ms,
  COUNT(*) FILTER (WHERE success = true) as successful
FROM performance_metrics
GROUP BY feature
ORDER BY total DESC;
```

---

## 🚨 PASSO 9: Testar Captura de Erros

### Erro Não Tratado

```javascript
// No console do navegador
throw new Error('Teste de erro não tratado');

// Aguardar alguns segundos
// Verificar aba "Erros" no dashboard
// Deve aparecer o erro capturado
```

### Promise Rejeitada

```javascript
// No console do navegador
Promise.reject('Teste de promise rejeitada');

// Aguardar alguns segundos
// Verificar aba "Erros" no dashboard
```

---

## 🎯 PASSO 10: Cenários Reais

### Cenário 1: Usuário Faz Análise de Alimento

**Ações:**
1. Upload de imagem
2. Análise completa
3. Resultado exibido

**Métricas Esperadas:**
- ✅ `sofia` → `analyze_food`
- ✅ Duration: 1000-3000ms
- ✅ Success: true
- ✅ Metadata: foods_detected, calories, yolo_used

### Cenário 2: Usuário Faz Workout

**Ações:**
1. Iniciar camera workout
2. Fazer 10 reps
3. Finalizar workout

**Métricas Esperadas:**
- ✅ `camera_workout` → `workout_session`
- ✅ Duration: tempo total do workout
- ✅ Metadata: exercise, reps, score, yolo_latency
- ✅ Múltiplas métricas de `pose_detection`

### Cenário 3: YOLO Fora do Ar

**Simular:**
```sql
-- Inserir health check com status down
INSERT INTO service_health_checks (
  service_name,
  status,
  error_message
) VALUES (
  'yolo',
  'down',
  'Connection timeout'
);
```

**Resultado Esperado:**
- ✅ Card "yolo" com badge vermelho "down"
- ✅ Mensagem de erro exibida
- ✅ Alerta visual no dashboard

---

## 📊 MÉTRICAS DE SUCESSO

### Dashboard deve mostrar:

| Métrica | Valor Esperado |
|---------|----------------|
| Total de Requisições | > 0 |
| Taxa de Sucesso | ≥ 95% |
| Tempo Médio | < 2000ms |
| Serviços Ativos | 100% |
| Erros Críticos | 0 (ou poucos) |

### Gráficos devem:
- ✅ Renderizar sem erros
- ✅ Mostrar dados reais
- ✅ Atualizar automaticamente
- ✅ Responder a filtros

---

## 🐛 TROUBLESHOOTING

### Problema: Dashboard vazio

**Verificar:**
```sql
-- Tem métricas no banco?
SELECT COUNT(*) FROM performance_metrics;

-- Tem dados nas views?
SELECT COUNT(*) FROM feature_performance_24h;
```

**Solução:**
- Gerar métricas de teste (Passo 4)
- Verificar RLS policies
- Verificar se é admin

### Problema: Erro ao carregar dados

**Verificar:**
- Console do navegador (F12)
- Network tab (requisições falhando?)
- Supabase logs

**Solução:**
- Verificar se migration foi aplicada
- Verificar permissões de admin
- Verificar conexão com Supabase

### Problema: Métricas não aparecem em tempo real

**Verificar:**
- Auto-refresh está ativo? (30s)
- Clicar em "Atualizar" manualmente
- Verificar se métricas foram inseridas

---

## ✅ CHECKLIST FINAL

- [ ] Migration aplicada com sucesso
- [ ] Tabelas criadas no banco
- [ ] Menu "Performance Monitoring" aparece no admin
- [ ] Dashboard abre sem erros
- [ ] Cards de overview mostram dados
- [ ] Gráficos renderizam
- [ ] Aba "Por Feature" funciona
- [ ] Aba "Serviços" funciona
- [ ] Aba "Erros" funciona
- [ ] Auto-refresh funciona (30s)
- [ ] Refresh manual funciona
- [ ] Filtro de tempo funciona
- [ ] Resolver erro funciona
- [ ] Métricas são registradas automaticamente
- [ ] Health checks funcionam
- [ ] Erros são capturados automaticamente

---

## 🎉 PRÓXIMOS PASSOS

Após validar que tudo funciona:

1. **Instrumentar mais features:**
   - Dr. Vital (edge function)
   - WhatsApp webhook
   - Challenges
   - Sessions

2. **Configurar alertas:**
   - Email quando serviço cai
   - Slack quando erro crítico
   - Dashboard externo (Grafana?)

3. **Otimizar performance:**
   - Usar métricas para identificar gargalos
   - Implementar caches onde necessário
   - Validar melhorias com dados reais

4. **Monitorar custos:**
   - Integrar com AICostDashboard
   - Alertar quando custo > threshold
   - Otimizar uso de APIs pagas

---

**Boa sorte! 🚀**

Se tudo funcionar, você terá visibilidade total do seu app em produção! 📊
