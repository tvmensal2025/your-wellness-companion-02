# 📊 SISTEMA DE MONITORAMENTO COMPLETO

> **Criado:** 2026-01-17  
> **Status:** ✅ Implementado e Funcional  
> **Localização:** Painel Admin → Performance Monitoring

---

## 🎯 O QUE É?

Sistema completo de monitoramento em tempo real que permite visualizar **TUDO** que acontece no app:
- Performance de cada feature
- Latência de serviços externos (YOLO, Gemini, etc)
- Erros críticos
- Métricas de usuários
- Health checks automáticos

---

## 📍 ONDE ACESSAR?

### No Painel Admin:

1. Faça login como admin
2. Acesse: **Admin → 📊 Performance Monitoring**
3. Você verá 4 abas:
   - **Visão Geral**: Gráficos e resumo
   - **Por Feature**: Detalhes de cada funcionalidade
   - **Serviços**: Status de YOLO, Supabase, etc
   - **Erros**: Erros críticos não resolvidos

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabelas Criadas:

#### 1. `performance_metrics`
Armazena todas as métricas de performance:
```sql
- feature: 'yolo', 'sofia', 'camera_workout', etc
- action: 'detect', 'analyze', 'workout_complete', etc
- duration_ms: Tempo de execução
- success: true/false
- error_message: Mensagem de erro (se houver)
- metadata: Dados extras em JSON
- user_id: ID do usuário (opcional)
```

**Retenção:** 7 dias (limpeza automática)

#### 2. `service_health_checks`
Health checks de serviços externos:
```sql
- service_name: 'yolo', 'supabase', 'gemini', etc
- status: 'healthy', 'degraded', 'down'
- response_time_ms: Tempo de resposta
- error_message: Erro (se houver)
```

**Retenção:** 7 dias

#### 3. `critical_errors`
Erros críticos que requerem atenção:
```sql
- feature: Feature onde ocorreu o erro
- error_type: Tipo do erro
- error_message: Mensagem
- stack_trace: Stack trace completo
- resolved: true/false
- resolved_at: Quando foi resolvido
- resolved_by: Quem resolveu
```

**Retenção:** 30 dias (apenas erros resolvidos)

### Views Criadas:

#### `metrics_hourly`
Métricas agregadas por hora (últimas 24h):
- Total de chamadas
- Taxa de sucesso
- Tempo médio/min/max
- Por feature e action

#### `services_status`
Status atual de todos os serviços (última verificação)

#### `feature_performance_24h`
Performance por feature nas últimas 24h:
- Total de requisições
- Taxa de sucesso
- Percentis (P50, P95, P99)

#### `top_errors_24h`
Top 20 erros mais frequentes (últimas 24h)

---

## 🔧 COMO USAR NO CÓDIGO

### 1. Importar o Sistema

```typescript
import { monitoring, sofiaMonitoring, cameraWorkoutMonitoring, yoloMonitoring } from '@/lib/monitoring';
```

### 2. Registrar Métricas Manualmente

```typescript
// Registrar métrica simples
await monitoring.logMetric({
  feature: 'sofia',
  action: 'analyze_food',
  duration_ms: 1500,
  success: true,
  metadata: {
    foods_detected: 3,
    calories: 450
  }
});
```

### 3. Usar Wrapper de Medição

```typescript
// Medir automaticamente tempo de execução
const result = await monitoring.measure(
  'sofia',
  'analyze_food',
  async () => {
    // Seu código aqui
    return await analyzeFood(imageUrl);
  },
  { imageUrl } // metadata opcional
);
```

### 4. Usar Helpers Específicos

#### Sofia (Análise de Alimentos)
```typescript
import { sofiaMonitoring } from '@/lib/monitoring';

// Sucesso
await sofiaMonitoring.trackAnalysis(1500, true, {
  foods_detected: 3,
  yolo_used: true,
  gemini_used: true,
  calories: 450
});

// Erro
await sofiaMonitoring.trackError(
  new Error('Falha na análise'),
  { imageUrl, userId }
);
```

#### Camera Workout
```typescript
import { cameraWorkoutMonitoring } from '@/lib/monitoring';

// Workout completo
await cameraWorkoutMonitoring.trackWorkout(30000, true, {
  exercise: 'squat',
  reps: 15,
  score: 85,
  yolo_latency: 120
});

// Detecção de pose
await cameraWorkoutMonitoring.trackPoseDetection(80, true, {
  keypoints_detected: 17,
  confidence: 0.92
});
```

#### YOLO
```typescript
import { yoloMonitoring } from '@/lib/monitoring';

// Detecção
await yoloMonitoring.trackDetection(120, true, {
  objects_detected: 5,
  confidence: 0.85
});

// Health check
const status = await yoloMonitoring.checkHealth();
// Retorna: 'healthy', 'degraded' ou 'down'
```

#### Dr. Vital (Análise de Exames)
```typescript
import { drVitalMonitoring } from '@/lib/monitoring';

await drVitalMonitoring.trackExamAnalysis(2500, true, {
  exam_type: 'blood_test',
  yolo_used: true,
  gemini_used: true
});
```

#### WhatsApp
```typescript
import { whatsappMonitoring } from '@/lib/monitoring';

await whatsappMonitoring.trackMessage(500, true, {
  message_type: 'image',
  premium: true
});
```

### 5. Registrar Erros Críticos

```typescript
try {
  // Seu código
} catch (error) {
  await monitoring.logCriticalError({
    feature: 'sofia',
    error_type: error.name,
    error_message: error.message,
    stack_trace: error.stack,
    metadata: { context: 'additional info' }
  });
}
```

### 6. Health Checks

```typescript
// Verificar saúde de um serviço
const status = await monitoring.checkServiceHealth(
  'yolo',
  async () => {
    const response = await fetch('https://yolo-service.../health');
    return response.ok;
  }
);
```

---

## 📊 MÉTRICAS COLETADAS AUTOMATICAMENTE

### Features Instrumentadas:

#### ✅ Sofia (Análise de Alimentos)
- ✅ Tempo de análise
- ✅ Alimentos detectados
- ✅ Uso de YOLO/Gemini
- ✅ Calorias calculadas
- ✅ Erros críticos

#### ✅ Camera Workout
- ✅ Duração de workout
- ✅ Reps completadas
- ✅ Score final
- ✅ Latência do YOLO
- ✅ FPS médio
- ✅ Confiança média
- ✅ Detecções de pose

#### ⚠️ Dr. Vital (Parcial)
- ⚠️ Análise de exames (precisa instrumentar edge function)

#### ⚠️ WhatsApp (Parcial)
- ⚠️ Mensagens processadas (precisa instrumentar webhook)

#### ❌ Outras Features (Não Instrumentadas)
- ❌ Challenges
- ❌ Sessions
- ❌ Auth
- ❌ Database operations

---

## 🎨 DASHBOARD NO ADMIN

### Cards de Overview:
1. **Total de Requisições** (últimas 24h)
2. **Taxa de Sucesso** (% de sucesso)
3. **Tempo Médio** (latência média)
4. **Serviços Ativos** (quantos estão healthy)

### Gráficos:

#### Visão Geral:
- **Requisições por Hora**: Área chart com sucesso/falhas
- **Requisições por Feature**: Bar chart
- **Tempo de Resposta**: Bar chart por feature

#### Por Feature:
- Detalhes de cada feature:
  - Total de requisições
  - Tempo médio
  - Percentis (P50, P95, P99)
  - Taxa de sucesso

#### Serviços:
- Status de cada serviço externo:
  - YOLO
  - Supabase
  - Gemini
  - Etc
- Tempo de resposta
- Última verificação
- Mensagem de erro (se houver)

#### Erros:
- Lista de erros críticos não resolvidos
- Botão para marcar como resolvido
- Detalhes completos do erro
- Stack trace

---

## 🔄 AUTO-REFRESH

O dashboard atualiza automaticamente a cada **30 segundos**.

Você também pode forçar atualização clicando no botão **"Atualizar"**.

---

## 🚨 ERROS CAPTURADOS AUTOMATICAMENTE

O sistema captura automaticamente:

### 1. Erros Não Tratados (window.onerror)
```javascript
window.addEventListener('error', (event) => {
  // Capturado automaticamente
});
```

### 2. Promises Rejeitadas (unhandledrejection)
```javascript
window.addEventListener('unhandledrejection', (event) => {
  // Capturado automaticamente
});
```

### 3. Erros em Componentes React
Use Error Boundaries ou try/catch com `monitoring.logCriticalError()`

---

## 📈 MÉTRICAS IMPORTANTES

### Performance Targets:

| Métrica | Bom | Aceitável | Ruim |
|---------|-----|-----------|------|
| **Taxa de Sucesso** | ≥ 99% | 95-99% | < 95% |
| **Tempo Médio** | < 500ms | 500-1000ms | > 1000ms |
| **YOLO Latency** | < 200ms | 200-500ms | > 500ms |
| **FPS (Camera)** | ≥ 25 | 20-25 | < 20 |

### Alertas Automáticos:

O sistema detecta automaticamente:
- ⚠️ Taxa de sucesso < 95%
- ⚠️ Latência > 1000ms
- ⚠️ Serviço down
- ⚠️ FPS < 20
- ⚠️ Confiança < 0.7

---

## 🔧 FUNÇÕES RPC DISPONÍVEIS

### 1. `log_performance_metric()`
```sql
SELECT log_performance_metric(
  p_feature := 'sofia',
  p_action := 'analyze_food',
  p_duration_ms := 1500,
  p_success := true,
  p_metadata := '{"foods": 3}'::jsonb
);
```

### 2. `log_health_check()`
```sql
SELECT log_health_check(
  p_service_name := 'yolo',
  p_status := 'healthy',
  p_response_time_ms := 120
);
```

### 3. `log_critical_error()`
```sql
SELECT log_critical_error(
  p_feature := 'sofia',
  p_error_type := 'NetworkError',
  p_error_message := 'Failed to fetch'
);
```

### 4. `resolve_critical_error()`
```sql
SELECT resolve_critical_error(
  p_error_id := 'uuid-do-erro'
);
```

---

## 🧹 LIMPEZA AUTOMÁTICA

### Função: `cleanup_old_metrics()`

Executa automaticamente (ou manualmente):
```sql
SELECT cleanup_old_metrics();
```

**Remove:**
- Métricas > 7 dias
- Health checks > 7 dias
- Erros resolvidos > 30 dias

**Recomendação:** Agendar via cron job ou Supabase Edge Function

---

## 🔐 SEGURANÇA (RLS)

### Políticas Aplicadas:

1. **Admins podem ver tudo**
   - SELECT em todas as tabelas
   - UPDATE em critical_errors (para resolver)

2. **Service Role pode inserir**
   - INSERT em todas as tabelas
   - Usado pelas edge functions

3. **Usuários normais: SEM ACESSO**
   - Apenas admins veem métricas

---

## 📝 PRÓXIMOS PASSOS

### Para Instrumentar Mais Features:

#### 1. Dr. Vital (Edge Function)
```typescript
// supabase/functions/analyze-medical-exam/index.ts
import { drVitalMonitoring } from '@/lib/monitoring';

const start = Date.now();
try {
  const result = await analyzeExam(imageUrl);
  await drVitalMonitoring.trackExamAnalysis(
    Date.now() - start,
    true,
    { exam_type: result.type }
  );
  return result;
} catch (error) {
  await drVitalMonitoring.trackError(error);
  throw error;
}
```

#### 2. WhatsApp Webhook
```typescript
// supabase/functions/whatsapp-nutrition-webhook/index.ts
import { whatsappMonitoring } from '@/lib/monitoring';

const start = Date.now();
await whatsappMonitoring.trackMessage(
  Date.now() - start,
  true,
  { message_type: 'image', premium: true }
);
```

#### 3. Challenges
```typescript
import { monitoring } from '@/lib/monitoring';

await monitoring.logMetric({
  feature: 'challenges',
  action: 'complete_challenge',
  duration_ms: 500,
  success: true,
  metadata: { challenge_id, points_earned }
});
```

---

## 🎯 CASOS DE USO

### 1. Detectar Problemas de Performance
```
Problema: Usuários reclamando de lentidão
Solução: 
1. Abrir Performance Monitoring
2. Ver "Por Feature"
3. Identificar feature com P95 > 2000ms
4. Investigar e otimizar
```

### 2. Monitorar YOLO
```
Problema: YOLO pode estar fora do ar
Solução:
1. Abrir "Serviços"
2. Ver status do YOLO
3. Se "down", verificar logs do Easypanel
```

### 3. Resolver Erros Críticos
```
Problema: Erros recorrentes
Solução:
1. Abrir "Erros"
2. Ver top erros
3. Corrigir código
4. Marcar como resolvido
```

### 4. Validar Otimizações
```
Problema: Implementou cache, quer validar
Solução:
1. Ver métricas ANTES (P95, avg)
2. Implementar cache
3. Ver métricas DEPOIS
4. Comparar melhoria
```

---

## 📚 ARQUIVOS CRIADOS

### Banco de Dados:
- `supabase/migrations/20260117120000_create_performance_monitoring.sql`

### Frontend:
- `src/lib/monitoring.ts` - Sistema centralizado
- `src/components/admin/PerformanceMonitoring.tsx` - Dashboard
- `src/pages/AdminPage.tsx` - Integração no menu

### Instrumentação:
- `src/hooks/useAsyncAnalysis.ts` - Sofia instrumentada
- `src/services/camera-workout/metricsService.ts` - Camera Workout instrumentado

---

## 🎉 BENEFÍCIOS

### Para Você (Admin):
- ✅ Visibilidade total do sistema
- ✅ Detectar problemas antes dos usuários
- ✅ Validar otimizações com dados reais
- ✅ Identificar gargalos
- ✅ Monitorar custos de IA

### Para os Usuários:
- ✅ App mais rápido (você detecta e corrige problemas)
- ✅ Menos erros (você vê e resolve rapidamente)
- ✅ Melhor experiência geral

### Para o Negócio:
- ✅ Redução de custos (otimizar features lentas)
- ✅ Maior satisfação dos usuários
- ✅ Decisões baseadas em dados
- ✅ SLA garantido

---

## 🆘 TROUBLESHOOTING

### Problema: Não vejo métricas no dashboard
**Solução:**
1. Verificar se a migration foi executada: `supabase db push`
2. Verificar se você é admin
3. Verificar console do navegador por erros

### Problema: Métricas não estão sendo registradas
**Solução:**
1. Verificar se o código está instrumentado
2. Verificar console por erros de `monitoring.logMetric()`
3. Verificar RLS policies no Supabase

### Problema: Dashboard muito lento
**Solução:**
1. Executar `cleanup_old_metrics()` manualmente
2. Reduzir timeRange para "1h" ou "6h"
3. Verificar índices no banco

---

## 📞 SUPORTE

Para dúvidas ou problemas:
1. Verificar este documento
2. Verificar console do navegador
3. Verificar logs do Supabase
4. Abrir issue no repositório

---

**Última atualização:** 2026-01-17  
**Versão:** 1.0.0  
**Status:** ✅ Produção
