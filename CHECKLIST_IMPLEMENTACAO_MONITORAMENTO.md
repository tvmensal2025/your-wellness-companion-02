# ✅ CHECKLIST DE IMPLEMENTAÇÃO - SISTEMA DE MONITORAMENTO

> Use este checklist para garantir que tudo foi implementado corretamente

---

## 📋 FASE 1: PREPARAÇÃO (5 minutos)

### Verificar Pré-requisitos
- [ ] Node.js instalado (v18+)
- [ ] Supabase CLI instalado (`npm install -g supabase`)
- [ ] Projeto Supabase configurado
- [ ] Acesso admin ao painel
- [ ] Git configurado (para commit)

### Backup
- [ ] Fazer backup do banco de dados
- [ ] Fazer commit do código atual
- [ ] Anotar versão atual do app

---

## 📋 FASE 2: BANCO DE DADOS (10 minutos)

### Aplicar Migration
- [ ] Abrir terminal na raiz do projeto
- [ ] Executar: `npx supabase db push`
- [ ] Verificar se migration foi aplicada sem erros
- [ ] Confirmar que não há conflitos

### Verificar Tabelas Criadas
- [ ] Abrir Supabase Dashboard → SQL Editor
- [ ] Executar query de verificação:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
  'performance_metrics',
  'service_health_checks',
  'critical_errors'
);
```
- [ ] Confirmar que retornou 3 linhas

### Verificar Views Criadas
- [ ] Executar query:
```sql
SELECT table_name FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN (
  'metrics_hourly',
  'services_status',
  'feature_performance_24h',
  'top_errors_24h'
);
```
- [ ] Confirmar que retornou 4 linhas

### Verificar Functions Criadas
- [ ] Executar query:
```sql
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN (
  'log_performance_metric',
  'log_health_check',
  'log_critical_error',
  'resolve_critical_error',
  'cleanup_old_metrics'
);
```
- [ ] Confirmar que retornou 5 linhas

### Verificar RLS Policies
- [ ] Executar query:
```sql
SELECT tablename, policyname FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
  'performance_metrics',
  'service_health_checks',
  'critical_errors'
);
```
- [ ] Confirmar que existem policies

---

## 📋 FASE 3: FRONTEND (15 minutos)

### Verificar Arquivos Criados
- [ ] `src/lib/monitoring.ts` existe
- [ ] `src/components/admin/PerformanceMonitoring.tsx` existe
- [ ] `src/pages/AdminPage.tsx` foi modificado
- [ ] `src/hooks/useAsyncAnalysis.ts` foi modificado
- [ ] `src/services/camera-workout/metricsService.ts` foi modificado

### Compilar Código
- [ ] Executar: `npm run build` (ou `npm run dev`)
- [ ] Verificar se não há erros de TypeScript
- [ ] Verificar se não há erros de import

### Verificar Imports
- [ ] Abrir `src/lib/monitoring.ts`
- [ ] Verificar se `@/integrations/supabase/client` está correto
- [ ] Verificar se não há erros de lint

---

## 📋 FASE 4: PAINEL ADMIN (10 minutos)

### Acessar Painel
- [ ] Fazer login como admin
- [ ] Ir para `/admin`
- [ ] Verificar se página carrega sem erros

### Verificar Menu
- [ ] Procurar item "📊 Performance Monitoring"
- [ ] Verificar se está logo após "Dashboard Admin"
- [ ] Verificar se ícone está correto

### Abrir Dashboard
- [ ] Clicar em "📊 Performance Monitoring"
- [ ] Verificar se página carrega
- [ ] Verificar se não há erros no console (F12)

### Verificar Componentes
- [ ] Cards de overview aparecem (4 cards)
- [ ] Abas aparecem (Visão Geral, Por Feature, Serviços, Erros)
- [ ] Botão "Atualizar" aparece
- [ ] Select de tempo aparece (1h, 6h, 24h)

---

## 📋 FASE 5: DADOS DE TESTE (10 minutos)

### Inserir Métricas de Teste
- [ ] Abrir Supabase SQL Editor
- [ ] Executar script de teste:
```sql
INSERT INTO performance_metrics (feature, action, duration_ms, success, metadata) VALUES
  ('sofia', 'analyze_food', 1500, true, '{"foods_detected": 3}'::jsonb),
  ('camera_workout', 'workout_session', 30000, true, '{"reps": 15}'::jsonb),
  ('yolo', 'detect_objects', 120, true, '{"objects": 5}'::jsonb);
```
- [ ] Confirmar que inseriu 3 linhas

### Inserir Health Checks de Teste
- [ ] Executar:
```sql
INSERT INTO service_health_checks (service_name, status, response_time_ms) VALUES
  ('yolo', 'healthy', 120),
  ('supabase', 'healthy', 50);
```
- [ ] Confirmar que inseriu 2 linhas

### Inserir Erro de Teste
- [ ] Executar:
```sql
INSERT INTO critical_errors (feature, error_type, error_message, resolved) VALUES
  ('sofia', 'TestError', 'Erro de teste', false);
```
- [ ] Confirmar que inseriu 1 linha

---

## 📋 FASE 6: VALIDAÇÃO DO DASHBOARD (15 minutos)

### Aba: Visão Geral
- [ ] Atualizar página (F5)
- [ ] Verificar se cards mostram dados:
  - [ ] Total de Requisições > 0
  - [ ] Taxa de Sucesso ~100%
  - [ ] Tempo Médio > 0ms
  - [ ] Serviços Ativos > 0
- [ ] Verificar se gráficos renderizam:
  - [ ] Requisições por Hora (área chart)
  - [ ] Requisições por Feature (bar chart)
  - [ ] Tempo de Resposta (bar chart)

### Aba: Por Feature
- [ ] Clicar na aba "Por Feature"
- [ ] Verificar se aparecem cards:
  - [ ] Sofia
  - [ ] Camera Workout
  - [ ] YOLO
- [ ] Verificar se cada card mostra:
  - [ ] Total de requisições
  - [ ] Tempo médio
  - [ ] P50, P95, P99
  - [ ] Taxa de sucesso

### Aba: Serviços
- [ ] Clicar na aba "Serviços"
- [ ] Verificar se aparecem cards:
  - [ ] YOLO
  - [ ] Supabase
- [ ] Verificar se cada card mostra:
  - [ ] Status (badge colorido)
  - [ ] Tempo de resposta
  - [ ] Última verificação

### Aba: Erros
- [ ] Clicar na aba "Erros"
- [ ] Verificar se aparece o erro de teste
- [ ] Verificar se mostra:
  - [ ] Tipo do erro
  - [ ] Mensagem
  - [ ] Feature
  - [ ] Data/hora
  - [ ] Botão "Marcar como resolvido"

---

## 📋 FASE 7: FUNCIONALIDADES (10 minutos)

### Auto-Refresh
- [ ] Deixar dashboard aberto
- [ ] Aguardar 30 segundos
- [ ] Verificar se dados atualizam automaticamente
- [ ] Verificar se não há erros no console

### Refresh Manual
- [ ] Clicar no botão "Atualizar"
- [ ] Verificar se mostra loading
- [ ] Verificar se dados atualizam
- [ ] Verificar se toast de sucesso aparece

### Filtro de Tempo
- [ ] Mudar de "Últimas 24h" para "Última hora"
- [ ] Verificar se gráficos atualizam
- [ ] Mudar para "Últimas 6h"
- [ ] Verificar se funciona

### Resolver Erro
- [ ] Na aba "Erros", clicar em "Marcar como resolvido"
- [ ] Verificar se toast de sucesso aparece
- [ ] Verificar se erro desaparece da lista
- [ ] Verificar no banco:
```sql
SELECT * FROM critical_errors WHERE resolved = true;
```

---

## 📋 FASE 8: INSTRUMENTAÇÃO (20 minutos)

### Sofia (Análise de Alimentos)
- [ ] Ir para Sofia ou Dashboard
- [ ] Fazer upload de uma imagem de comida
- [ ] Aguardar análise completar
- [ ] Voltar para Performance Monitoring
- [ ] Verificar se métrica apareceu:
  - [ ] Feature: sofia
  - [ ] Action: analyze_food
  - [ ] Duration > 0
  - [ ] Success: true

### Camera Workout
- [ ] Ir para Exercícios → Camera Workout
- [ ] Iniciar um workout
- [ ] Fazer alguns reps
- [ ] Finalizar workout
- [ ] Voltar para Performance Monitoring
- [ ] Verificar se métrica apareceu:
  - [ ] Feature: camera_workout
  - [ ] Action: workout_session
  - [ ] Metadata com reps, score, etc

### YOLO Health Check
- [ ] Abrir console do navegador (F12)
- [ ] Executar:
```javascript
import { yoloMonitoring } from '@/lib/monitoring';
const status = await yoloMonitoring.checkHealth();
console.log('YOLO Status:', status);
```
- [ ] Verificar se retorna 'healthy', 'degraded' ou 'down'
- [ ] Verificar no dashboard se health check apareceu

---

## 📋 FASE 9: QUERIES E PERFORMANCE (10 minutos)

### Verificar Métricas no Banco
- [ ] Executar:
```sql
SELECT COUNT(*) FROM performance_metrics;
```
- [ ] Confirmar que tem métricas

### Verificar Performance das Views
- [ ] Executar:
```sql
EXPLAIN ANALYZE SELECT * FROM feature_performance_24h;
```
- [ ] Verificar se tempo < 100ms

### Verificar Índices
- [ ] Executar:
```sql
SELECT indexname FROM pg_indexes
WHERE tablename IN (
  'performance_metrics',
  'service_health_checks',
  'critical_errors'
);
```
- [ ] Confirmar que tem 11 índices

---

## 📋 FASE 10: LIMPEZA E MANUTENÇÃO (5 minutos)

### Testar Limpeza Automática
- [ ] Executar:
```sql
SELECT cleanup_old_metrics();
```
- [ ] Verificar se executa sem erros

### Verificar Tamanho das Tabelas
- [ ] Executar:
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename IN ('performance_metrics', 'service_health_checks', 'critical_errors')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```
- [ ] Verificar se tamanho é razoável (< 10MB)

---

## 📋 FASE 11: DOCUMENTAÇÃO (5 minutos)

### Verificar Arquivos de Documentação
- [ ] `docs/SISTEMA_MONITORAMENTO_COMPLETO.md` existe
- [ ] `docs/ARQUITETURA_MONITORAMENTO.md` existe
- [ ] `TESTE_MONITORAMENTO.md` existe
- [ ] `RESUMO_SISTEMA_MONITORAMENTO.md` existe
- [ ] `COMANDOS_MONITORAMENTO.sh` existe
- [ ] `SISTEMA_MONITORAMENTO_CRIADO.md` existe
- [ ] `ANTES_DEPOIS_MONITORAMENTO.md` existe

### Ler Documentação
- [ ] Ler `RESUMO_SISTEMA_MONITORAMENTO.md`
- [ ] Entender como usar o sistema
- [ ] Saber onde encontrar ajuda

---

## 📋 FASE 12: COMMIT E DEPLOY (10 minutos)

### Commit das Mudanças
- [ ] Executar: `git status`
- [ ] Verificar arquivos modificados
- [ ] Executar: `git add .`
- [ ] Executar: `git commit -m "feat: Sistema de monitoramento completo"`
- [ ] Executar: `git push`

### Deploy (se aplicável)
- [ ] Fazer deploy para produção
- [ ] Verificar se migration foi aplicada
- [ ] Verificar se dashboard funciona em produção
- [ ] Testar com dados reais

---

## 📋 FASE 13: VALIDAÇÃO FINAL (10 minutos)

### Checklist Final
- [ ] Migration aplicada ✅
- [ ] Tabelas criadas ✅
- [ ] Views criadas ✅
- [ ] Functions criadas ✅
- [ ] RLS configurado ✅
- [ ] Frontend compilando ✅
- [ ] Dashboard acessível ✅
- [ ] Métricas sendo registradas ✅
- [ ] Gráficos renderizando ✅
- [ ] Auto-refresh funcionando ✅
- [ ] Filtros funcionando ✅
- [ ] Resolver erro funcionando ✅
- [ ] Sofia instrumentada ✅
- [ ] Camera Workout instrumentado ✅
- [ ] YOLO health checks funcionando ✅
- [ ] Documentação completa ✅
- [ ] Código commitado ✅

### Teste de Aceitação
- [ ] Fazer login como admin
- [ ] Acessar Performance Monitoring
- [ ] Ver métricas em tempo real
- [ ] Fazer uma análise Sofia
- [ ] Verificar se métrica aparece
- [ ] Resolver um erro de teste
- [ ] Verificar se funciona

---

## 🎉 CONCLUSÃO

### Se Todos os Itens Estão Marcados:
✅ **PARABÉNS!** Sistema de monitoramento implementado com sucesso!

### Próximos Passos:
1. Usar o sistema diariamente
2. Instrumentar mais features (Dr. Vital, WhatsApp)
3. Configurar alertas (email, Slack)
4. Compartilhar com a equipe

### Se Algo Falhou:
1. Verificar console do navegador (F12)
2. Verificar logs do Supabase
3. Consultar documentação:
   - `docs/SISTEMA_MONITORAMENTO_COMPLETO.md`
   - `TESTE_MONITORAMENTO.md`
4. Executar: `bash COMANDOS_MONITORAMENTO.sh`

---

## 📞 SUPORTE

### Problemas Comuns:

**Dashboard vazio:**
- Verificar se migration foi aplicada
- Inserir dados de teste
- Verificar RLS policies

**Erros de TypeScript:**
- Executar: `npm install`
- Verificar imports
- Verificar se `@/` alias está configurado

**Métricas não aparecem:**
- Verificar console do navegador
- Verificar se código está instrumentado
- Verificar se batch queue está funcionando

---

## ✅ CHECKLIST RESUMIDO

```
[ ] Fase 1: Preparação (5 min)
[ ] Fase 2: Banco de Dados (10 min)
[ ] Fase 3: Frontend (15 min)
[ ] Fase 4: Painel Admin (10 min)
[ ] Fase 5: Dados de Teste (10 min)
[ ] Fase 6: Validação do Dashboard (15 min)
[ ] Fase 7: Funcionalidades (10 min)
[ ] Fase 8: Instrumentação (20 min)
[ ] Fase 9: Queries e Performance (10 min)
[ ] Fase 10: Limpeza e Manutenção (5 min)
[ ] Fase 11: Documentação (5 min)
[ ] Fase 12: Commit e Deploy (10 min)
[ ] Fase 13: Validação Final (10 min)
```

**Tempo Total Estimado:** ~2 horas

---

**Boa sorte! 🚀**

Você está a poucos passos de ter visibilidade total do seu app! 📊
