# ✅ CHECKLIST DE EXECUÇÃO - Metas Gamificadas

> **Imprima ou mantenha aberto durante a execução**

---

## 📋 PRÉ-EXECUÇÃO

- [ ] Tenho acesso ao Dashboard Supabase
- [ ] Sou admin do projeto
- [ ] Tenho o arquivo SQL pronto
- [ ] Li o guia de execução
- [ ] Escolhi horário de baixo tráfego (opcional)

---

## 🚀 EXECUÇÃO (5 minutos)

### Passo 1: Acessar
- [ ] Abri https://supabase.com/dashboard
- [ ] Selecionei meu projeto
- [ ] Estou na tela do projeto

### Passo 2: SQL Editor
- [ ] Cliquei em "SQL Editor" no menu lateral
- [ ] Cliquei em "+ New Query"
- [ ] Editor SQL está aberto

### Passo 3: Colar SQL
- [ ] Abri o arquivo: `supabase/migrations/20260112400000_add_goals_gamification_safe.sql`
- [ ] Copiei TODO o conteúdo (Ctrl+A, Ctrl+C)
- [ ] Colei no SQL Editor (Ctrl+V)
- [ ] Revisei que está completo (começa com `-- ===` e termina com `END $;`)

### Passo 4: Executar
- [ ] Cliquei em "Run" (ou Ctrl+Enter)
- [ ] Aguardei 5-10 segundos
- [ ] Vi mensagem de sucesso

### Passo 5: Validar
- [ ] Criei nova query
- [ ] Colei query de validação (ver abaixo)
- [ ] Executei
- [ ] Vi resultado: `3, 3, 2`

---

## ✅ VALIDAÇÃO

### Query de Validação:
```sql
SELECT 
  (SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_name IN ('goal_achievements', 'goal_streaks', 'user_goal_levels')) as tabelas,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = 'user_goals' 
   AND column_name IN ('streak_days', 'xp_earned', 'level')) as campos,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_name IN ('update_goal_streak', 'process_level_up')) as funcoes;
```

### Resultado Esperado:
```
tabelas: 3
campos: 3
funcoes: 2
```

- [ ] Resultado está correto
- [ ] Sem erros nos logs

---

## 🔍 VERIFICAÇÃO ADICIONAL (Opcional)

### Verificar Tabelas Criadas:
- [ ] Fui para "Table Editor"
- [ ] Vi tabela `goal_achievements`
- [ ] Vi tabela `goal_streaks`
- [ ] Vi tabela `user_goal_levels`

### Verificar Campos em user_goals:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_goals'
AND column_name IN ('streak_days', 'last_update_date', 'xp_earned', 'level', 'evidence_urls', 'participant_ids');
```

- [ ] Executei query acima
- [ ] Vi 6 linhas (6 campos novos)

### Verificar Dados Existentes Intactos:
```sql
SELECT COUNT(*) as total_metas FROM user_goals;
```

- [ ] Executei query acima
- [ ] Número de metas está igual ao anterior
- [ ] Nenhuma meta foi perdida

---

## 📊 PÓS-EXECUÇÃO

### Documentação:
- [ ] Salvei data/hora da execução
- [ ] Anotei resultado da validação
- [ ] Arquivei logs (se houver)

### Comunicação:
- [ ] Notifiquei equipe de sucesso
- [ ] Compartilhei resultado da validação
- [ ] Agendei próximos passos

### Monitoramento (Primeiras 24h):
- [ ] Verificar performance do banco
- [ ] Monitorar logs de erro
- [ ] Validar queries antigas funcionando
- [ ] Testar criação de nova meta

---

## 🎯 PRÓXIMOS PASSOS

### Imediato (Hoje):
- [ ] Migração executada ✅
- [ ] Validação concluída ✅
- [ ] Logs verificados ✅

### Esta Semana:
- [ ] Integrar `ModernGoalCard.tsx`
- [ ] Criar `GoalsHeroStats.tsx`
- [ ] Testar em staging
- [ ] Validar responsividade

### Próximas 2 Semanas:
- [ ] Implementar sistema de conquistas
- [ ] Adicionar visualização de streaks
- [ ] Criar página de níveis e XP
- [ ] Implementar upload de evidências

### Próximo Mês:
- [ ] Adicionar sugestões com IA
- [ ] Criar analytics avançados
- [ ] Implementar notificações push
- [ ] Lançar oficialmente

---

## 📁 ARQUIVOS DE REFERÊNCIA

### Execução:
- `EXECUTAR_AGORA_METAS.md` - Guia rápido
- `EXECUTAR_MIGRACAO_METAS.md` - Guia detalhado
- `GUIA_VISUAL_SUPABASE.md` - Passo a passo visual

### Código:
- `supabase/migrations/20260112400000_add_goals_gamification_safe.sql` - Migração
- `src/components/goals/ModernGoalCard.tsx` - Componente React
- `PREVIEW_MINHAS_METAS_NOVO.html` - Preview visual

### Documentação:
- `RESUMO_IMPLEMENTACAO_METAS.md` - Resumo executivo
- `docs/ANALISE_MINHAS_METAS_COMPLETA.md` - Análise completa
- `docs/ANALISE_BANCO_METAS_SEGURA.md` - Análise técnica
- `docs/MIGRACAO_METAS_VALIDACAO.md` - Validações

---

## 🆘 EM CASO DE PROBLEMA

### Erro Durante Execução:
1. [ ] Copiei mensagem de erro
2. [ ] Verifiquei troubleshooting no `GUIA_VISUAL_SUPABASE.md`
3. [ ] Se necessário, executei rollback (ver abaixo)

### Rollback (Se necessário):
```sql
DROP TRIGGER IF EXISTS trigger_update_goal_streak ON public.user_goals;
DROP FUNCTION IF EXISTS update_goal_streak();
DROP FUNCTION IF EXISTS calculate_xp_to_next_level(integer);
DROP FUNCTION IF EXISTS process_level_up(uuid, integer);
DROP TABLE IF EXISTS public.goal_achievements CASCADE;
DROP TABLE IF EXISTS public.goal_streaks CASCADE;
DROP TABLE IF EXISTS public.user_goal_levels CASCADE;

ALTER TABLE public.user_goals
DROP COLUMN IF EXISTS streak_days,
DROP COLUMN IF EXISTS last_update_date,
DROP COLUMN IF EXISTS xp_earned,
DROP COLUMN IF EXISTS level,
DROP COLUMN IF EXISTS evidence_urls,
DROP COLUMN IF EXISTS participant_ids;
```

- [ ] Executei rollback
- [ ] Verifiquei que voltou ao estado anterior
- [ ] Investiguei causa do erro

---

## 📊 MÉTRICAS DE SUCESSO

### Técnicas:
- [ ] 3 tabelas criadas
- [ ] 6 campos adicionados
- [ ] 3 funções criadas
- [ ] 9 índices criados
- [ ] 7 policies criadas
- [ ] 0 erros
- [ ] 0 dados perdidos

### Negócio (Acompanhar):
- [ ] Usuários ativos em metas: 30% → 70%
- [ ] Taxa de conclusão: 25% → 60%
- [ ] Tempo na plataforma: 5 min → 12 min
- [ ] NPS: 35 → 65
- [ ] Churn: 15% → 8%
- [ ] Receita/usuário: R$ 50 → R$ 85

---

## 🎉 CONCLUSÃO

### Status Final:
- [ ] ✅ Migração executada com sucesso
- [ ] ✅ Validação concluída
- [ ] ✅ Sem erros
- [ ] ✅ Dados preservados
- [ ] ✅ Performance normal
- [ ] ✅ Equipe notificada
- [ ] ✅ Próximos passos agendados

### Assinatura:
```
Executado por: _______________________
Data: ___/___/2026
Hora: ___:___
Resultado: ✅ SUCESSO
```

---

## 📞 CONTATOS

### Suporte Técnico:
- Documentação: Ver arquivos listados acima
- Logs: Supabase Dashboard → Logs
- Rollback: Ver seção "Em Caso de Problema"

### Equipe:
- Frontend: Integrar componentes React
- Backend: Monitorar performance
- Product: Acompanhar métricas

---

*Checklist criado por Kiro AI - Janeiro 2026*  
*Marque cada item conforme avança! ✅*
