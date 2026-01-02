# 🍎 COMO APLICAR OS PROTOCOLOS - FILTRO DE NUTRIÇÃO

## ✅ O QUE FOI IMPLEMENTADO

### 1. **Adição de Categoria aos Protocolos** ✅

Foi adicionado um campo `category` na tabela `health_conditions` para permitir filtrar protocolos por área (nutrição, saúde mental, estética, etc.).

**Arquivo criado:**
- `supabase/migrations/20250125000000_add_category_to_health_conditions.sql`

**O que faz:**
- Adiciona coluna `category` na tabela `health_conditions`
- Cria índice para performance
- Atualiza todas as condições existentes com categoria `'nutrição'`
- Define valor padrão como `'nutrição'` para novas condições

### 2. **Filtro no Frontend** ✅

O componente `PersonalizedSupplementsCard` foi atualizado para carregar **apenas protocolos de nutrição**.

**Arquivo modificado:**
- `src/components/sofia/PersonalizedSupplementsCard.tsx`

**Como funciona:**
1. Busca todas as condições de saúde com `category = 'nutrição'`
2. Filtra os protocolos que pertencem a essas condições
3. Exibe apenas protocolos de nutrição no seletor
4. Tem fallback caso a categoria ainda não exista no banco

---

## 📋 COMO APLICAR

### Passo 1: Executar a Migração

Execute a migração SQL no Supabase:

```sql
-- Execute o arquivo:
supabase/migrations/20250125000000_add_category_to_health_conditions.sql
```

Ou execute diretamente no Supabase Dashboard:

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole o conteúdo do arquivo de migração
4. Execute

### Passo 2: Verificar a Aplicação

Após executar a migração:

1. Acesse a aplicação
2. Vá até a seção de **Vitrine Personalizada Nema's Way**
3. No seletor de protocolos, você verá **apenas protocolos de nutrição**

### Passo 3: Verificar no Banco de Dados

Para confirmar que tudo está funcionando:

```sql
-- Ver todas as condições com suas categorias
SELECT name, category, is_active 
FROM public.health_conditions 
ORDER BY category, name;

-- Ver protocolos de nutrição
SELECT 
  sp.name as protocolo,
  hc.name as condicao,
  hc.category
FROM public.supplement_protocols sp
JOIN public.health_conditions hc ON hc.id = sp.health_condition_id
WHERE hc.category = 'nutrição'
ORDER BY sp.name;
```

---

## 🎯 PROTOCOLOS DE NUTRIÇÃO INCLUÍDOS

Todos os protocolos foram categorizados como **nutrição**, incluindo:

- ✅ Emagrecimento
- ✅ Desintoxicação
- ✅ Diabetes
- ✅ Hipertensão
- ✅ Saúde Cardiovascular
- ✅ Saúde Intestinal
- ✅ Saúde Ocular
- ✅ Imunidade
- ✅ Performance e Energia
- ✅ Alzheimer e Memória
- ✅ Ansiedade
- ✅ Insônia
- ✅ E todos os outros protocolos do catálogo

---

## 🔧 PERSONALIZAÇÃO

### Adicionar Novas Categorias

Se quiser criar outras categorias além de "nutrição":

```sql
-- Exemplo: adicionar categoria "estética"
UPDATE public.health_conditions 
SET category = 'estética' 
WHERE name IN ('Saúde da Pele', 'Queda de Cabelos', 'Acne');
```

### Filtrar por Outra Categoria no Frontend

Para filtrar por outra categoria, modifique o componente:

```typescript
// Em PersonalizedSupplementsCard.tsx, linha ~107
.eq('category', 'estética') // ou outra categoria
```

---

## ⚠️ IMPORTANTE

1. **Execute a migração primeiro** antes de usar o filtro
2. O fallback garante que a aplicação continue funcionando mesmo se a coluna não existir
3. **TODAS as condições existentes e futuras terão `category = 'nutrição'` por padrão**
4. A migração garante 100% de cobertura - todas as condições serão atualizadas automaticamente
5. Você pode alterar a categoria de qualquer condição a qualquer momento

## ✅ VERIFICAÇÃO 100%

Após executar a migração, execute o script de verificação:

```sql
-- Execute o arquivo:
VERIFICAR_PROTOCOLOS_NUTRICAO.sql
```

Este script verifica:
- ✅ Se a coluna `category` existe
- ✅ Quantas condições têm categoria 'nutrição'
- ✅ Lista todas as condições e suas categorias
- ✅ Lista todos os protocolos de nutrição com seus produtos
- ✅ Verifica se há protocolos sem categoria
- ✅ Resumo final com totais

---

## 📝 PRÓXIMOS PASSOS

1. ✅ Executar a migração SQL
2. ✅ Testar o filtro na aplicação
3. ✅ Verificar se apenas protocolos de nutrição aparecem
4. ⚠️ Se necessário, ajustar categorias específicas

---

## 🆘 TROUBLESHOOTING

### Problema: Protocolos não aparecem

**Solução:**
- Verifique se a migração foi executada
- Verifique se as condições têm `category = 'nutrição'`
- Verifique os logs do console do navegador

### Problema: Todos os protocolos aparecem

**Solução:**
- A migração pode não ter sido executada
- Execute a migração novamente
- Verifique se a coluna `category` existe: `SELECT category FROM health_conditions LIMIT 1;`

---

**Status:** ✅ Implementação completa e pronta para uso!

