# 🚀 Instruções de Deploy - Integração Mealie

## 📋 CHECKLIST PRÉ-DEPLOY

Antes de fazer deploy, verifique:

- [ ] Todos os arquivos foram criados
- [ ] Migration foi testada localmente
- [ ] Componentes renderizam sem erros
- [ ] TypeScript compila sem erros
- [ ] Não há imports quebrados

---

## 🔧 PASSO 1: Aplicar Migration

### Opção A: Via Supabase CLI (Recomendado)

```bash
# 1. Conectar ao projeto
supabase link --project-ref SEU_PROJECT_REF

# 2. Aplicar migration
supabase db push

# 3. Verificar se foi aplicada
supabase db diff
```

### Opção B: Via Dashboard do Supabase

1. Abrir https://supabase.com/dashboard
2. Selecionar seu projeto
3. Ir em **SQL Editor**
4. Criar nova query
5. Copiar conteúdo de `supabase/migrations/20260117150000_create_shopping_lists.sql`
6. Executar (Run)
7. Verificar mensagem de sucesso

### Verificar Migration

```sql
-- No SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'shopping_lists';

-- Deve retornar 1 linha
```

---

## 🧪 PASSO 2: Criar Dados de Teste

### Descobrir seu User ID

```sql
-- No SQL Editor do Supabase
SELECT id, email FROM auth.users WHERE email = 'seu@email.com';
```

Copie o `id` retornado.

### Executar Script de Teste

1. Abrir `scripts/test-mealie-integration.sql`
2. Substituir **TODAS** as ocorrências de `USER_ID_AQUI` pelo seu ID real
3. Copiar seções 4, 5 e 6 do script
4. Colar no SQL Editor do Supabase
5. Executar

### Verificar Dados

```sql
-- Ver refeições criadas
SELECT 
  DATE(created_at) as dia,
  COUNT(*) as refeicoes,
  SUM(total_calories) as calorias
FROM sofia_food_analysis
WHERE user_id = 'SEU_USER_ID'
  AND created_at >= date_trunc('week', CURRENT_DATE)
GROUP BY DATE(created_at)
ORDER BY dia;

-- Deve mostrar:
-- Segunda: 4 refeições, ~1700 kcal
-- Terça: 4 refeições, ~1730 kcal
-- Quarta: 2 refeições, ~930 kcal
-- Quinta: 1 refeição, ~420 kcal
```

---

## 📦 PASSO 3: Build e Deploy

### Verificar TypeScript

```bash
# Verificar erros de tipo
npm run type-check

# Ou
npx tsc --noEmit
```

### Build Local

```bash
# Limpar cache
rm -rf node_modules/.vite
rm -rf dist

# Instalar dependências
npm install

# Build
npm run build

# Verificar se build foi bem-sucedido
ls -la dist/
```

### Deploy (Lovable/Vercel/Netlify)

#### Lovable
```bash
# Commit e push
git add .
git commit -m "feat: adiciona integração Mealie com card semanal e lista de compras"
git push origin main

# Lovable faz deploy automático
```

#### Vercel
```bash
# Via CLI
vercel --prod

# Ou via dashboard
# Push para GitHub → Vercel detecta e faz deploy
```

#### Netlify
```bash
# Via CLI
netlify deploy --prod

# Ou via dashboard
# Push para GitHub → Netlify detecta e faz deploy
```

---

## ✅ PASSO 4: Validação Pós-Deploy

### 1. Verificar App Carregou

```bash
# Abrir app em produção
# Exemplo: https://app.oficialmaxnutrition.com.br
```

### 2. Fazer Login

- Usar conta de teste
- Verificar se login funciona

### 3. Ir para Dashboard Nutricional

- Clicar em "Nutrição" ou "Sofia"
- Verificar se página carrega

### 4. Verificar Card Semanal

**Deve aparecer:**
- Card com título "Seu Cardápio da Semana"
- 7 dias da semana
- Indicadores coloridos
- Badge com "X/7 completos"

**Se não aparecer:**
- Abrir DevTools (F12)
- Ver console para erros
- Verificar Network tab

### 5. Testar Clique no Dia

- Clicar em um dia que tem refeições (verde ou amarelo)
- Modal deve abrir
- Deve mostrar refeições do dia

**Se não abrir:**
- Verificar console
- Verificar se Dialog está renderizando

### 6. Testar Lista de Compras

- No modal, clicar em "Gerar Lista de Compras"
- Aguardar processamento
- Verificar toast de sucesso
- Verificar WhatsApp

**Se não funcionar:**
- Verificar se telefone está cadastrado
- Verificar logs da edge function
- Verificar tabela shopping_lists

---

## 🐛 TROUBLESHOOTING

### Erro: "shopping_lists does not exist"

**Causa:** Migration não foi aplicada

**Solução:**
```bash
supabase db push
```

### Erro: "Cannot read property 'days' of null"

**Causa:** useWeeklyPlan não está retornando dados

**Solução:**
1. Verificar se userId está sendo passado
2. Verificar se há refeições no banco
3. Verificar console para erros de query

### Erro: "Permission denied for table shopping_lists"

**Causa:** RLS não está configurado corretamente

**Solução:**
```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'shopping_lists';

-- Recriar policies se necessário
-- (copiar da migration)
```

### Erro: "Module not found: @/components/mealie/WeeklyPlanCard"

**Causa:** Arquivo não foi commitado ou build não incluiu

**Solução:**
```bash
# Verificar se arquivo existe
ls -la src/components/mealie/

# Rebuild
npm run build

# Commit e push
git add src/components/mealie/
git commit -m "fix: adiciona componentes mealie"
git push
```

### Card aparece mas está vazio

**Causa:** Não há dados de refeições

**Solução:**
1. Executar script de teste (seção 2)
2. Ou registrar refeições manualmente via app
3. Ou enviar fotos via WhatsApp

### Modal abre mas não mostra refeições

**Causa:** useDayMeals não está buscando corretamente

**Solução:**
1. Verificar console
2. Verificar se data está correta
3. Verificar query no Supabase logs

### Lista de compras não é enviada

**Causa:** Telefone não cadastrado ou edge function com erro

**Solução:**
```sql
-- Verificar telefone
SELECT phone FROM profiles WHERE id = 'SEU_USER_ID';

-- Cadastrar telefone se necessário
UPDATE profiles 
SET phone = '5511999999999' 
WHERE id = 'SEU_USER_ID';
```

---

## 📊 MONITORAMENTO

### Verificar Uso da Feature

```sql
-- Quantas listas foram geradas
SELECT 
  COUNT(*) as total_listas,
  COUNT(CASE WHEN sent_to_whatsapp THEN 1 END) as enviadas_whatsapp,
  DATE(created_at) as dia
FROM shopping_lists
GROUP BY DATE(created_at)
ORDER BY dia DESC
LIMIT 7;

-- Usuários que usaram
SELECT 
  COUNT(DISTINCT user_id) as usuarios_unicos
FROM shopping_lists
WHERE created_at >= CURRENT_DATE - interval '7 days';

-- Média de itens por lista
SELECT 
  AVG(jsonb_array_length(items)) as media_itens
FROM shopping_lists;
```

### Logs de Erro

```sql
-- Ver erros recentes (se tiver tabela de logs)
SELECT * 
FROM error_logs 
WHERE component LIKE '%mealie%' 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🎯 MÉTRICAS DE SUCESSO

### Semana 1
- [ ] 10+ usuários visualizaram card semanal
- [ ] 5+ usuários clicaram em um dia
- [ ] 2+ listas de compras geradas

### Semana 2
- [ ] 50+ visualizações do card
- [ ] 20+ cliques em dias
- [ ] 10+ listas geradas

### Mês 1
- [ ] 80% dos usuários ativos viram o card
- [ ] 40% clicaram em um dia
- [ ] 20% geraram lista de compras

---

## 🔄 ROLLBACK (Se necessário)

### Reverter Migration

```sql
-- Dropar tabela
DROP TABLE IF EXISTS shopping_lists CASCADE;
```

### Reverter Código

```bash
# Voltar commit
git revert HEAD

# Ou checkout versão anterior
git checkout COMMIT_ANTERIOR

# Push
git push origin main
```

### Remover Componente do Dashboard

```typescript
// src/components/sofia/SofiaNutricionalRedesigned.tsx
// Comentar linha:
// <WeeklyPlanCard userId={userId} />
```

---

## 📝 CHECKLIST FINAL

Antes de considerar deploy completo:

- [ ] Migration aplicada em produção
- [ ] Dados de teste criados
- [ ] Build sem erros
- [ ] Deploy realizado
- [ ] App carrega normalmente
- [ ] Card semanal aparece
- [ ] Modal abre ao clicar
- [ ] Lista de compras funciona
- [ ] WhatsApp recebe mensagem
- [ ] Sem erros no console
- [ ] Sem erros nos logs do Supabase
- [ ] Performance aceitável (<2s para carregar)
- [ ] Responsivo em mobile
- [ ] Funciona em dark mode

---

## 🎉 CONCLUSÃO

Se todos os itens do checklist estão ✅, o deploy foi bem-sucedido!

**Próximos passos:**
1. Monitorar métricas
2. Coletar feedback dos usuários
3. Iterar baseado no uso real
4. Planejar Fase 2 (receitas personalizadas)

---

**Dúvidas?** Consulte:
- `EXPLICACAO_MEALIE_DETALHADA.md` - Explicação completa
- `MEALIE_RESUMO_VISUAL.md` - Referência rápida
- `MEALIE_IMPLEMENTACAO_COMPLETA.md` - Detalhes técnicos
- `scripts/test-mealie-integration.sql` - Script de teste

**Boa sorte! 🚀**
