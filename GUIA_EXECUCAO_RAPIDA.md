# ⚡ GUIA DE EXECUÇÃO RÁPIDA - PROTOCOLOS DE NUTRIÇÃO

## 🎯 OBJETIVO
Executar todos os scripts SQL necessários para deixar o sistema 100% pronto para venda.

**Tempo estimado:** 30-45 minutos

---

## 📋 CHECKLIST DE EXECUÇÃO

### ✅ PASSO 1: Migração de Categoria (5 min)

**Arquivo:** `EXECUTAR_ESTE_ARQUIVO.sql`

1. Acesse **Supabase Dashboard** → **SQL Editor**
2. Cole o conteúdo do arquivo `EXECUTAR_ESTE_ARQUIVO.sql`
3. Clique em **RUN**
4. Aguarde confirmação de sucesso

**O que faz:**
- Adiciona coluna `category` na tabela `health_conditions`
- Cria índice para performance
- Atualiza todas as condições para categoria 'nutrição'

**Verificação:**
```sql
SELECT name, category FROM public.health_conditions LIMIT 5;
-- Deve mostrar todas com category = 'nutrição'
```

---

### ✅ PASSO 2: Protocolos Principais (15 min)

**Arquivo:** `PROTOCOLOS_COMPLETOS_CATALOGO.sql`

1. No mesmo **SQL Editor**
2. Cole o conteúdo do arquivo `PROTOCOLOS_COMPLETOS_CATALOGO.sql`
3. Clique em **RUN**
4. Aguarde confirmação (pode levar alguns minutos)

**O que faz:**
- Cria 16 protocolos principais
- Associa produtos aos protocolos
- Adiciona condições de saúde faltantes
- Adiciona horários de uso faltantes

**Verificação:**
```sql
SELECT COUNT(*) FROM public.supplement_protocols WHERE is_active = true;
-- Deve mostrar pelo menos 16 protocolos
```

---

### ✅ PASSO 3: Protocolos Adicionais (10 min)

**Arquivo:** `PROTOCOLOS_COMPLETOS_PARTE2.sql`

1. No mesmo **SQL Editor**
2. Cole o conteúdo do arquivo `PROTOCOLOS_COMPLETOS_PARTE2.sql`
3. Clique em **RUN**
4. Aguarde confirmação

**O que faz:**
- Adiciona 9 protocolos adicionais (protocolos 17-25)
- Associa produtos aos protocolos

**Verificação:**
```sql
SELECT COUNT(*) FROM public.supplement_protocols WHERE is_active = true;
-- Deve mostrar pelo menos 25 protocolos
```

---

### ✅ PASSO 4: Verificação Completa (5 min)

**Arquivo:** `VERIFICAR_APOS_EXECUCAO.sql`

1. No mesmo **SQL Editor**
2. Cole o conteúdo do arquivo `VERIFICAR_APOS_EXECUCAO.sql`
3. Clique em **RUN**
4. Analise os resultados

**O que verifica:**
- Total de condições de nutrição
- Total de protocolos ativos
- Total de associações produtos-protocolos
- Lista de protocolos com produtos

**Resultado esperado:**
- ✅ Pelo menos 25 protocolos ativos
- ✅ Pelo menos 25 condições de nutrição
- ✅ Cada protocolo com produtos associados

---

## 🧪 TESTE NO FRONTEND (10 min)

### 1. Acesse a Aplicação
- Vá até a página de **Sofia Nutricional**
- Ou acesse **Vitrine Personalizada Nema's Way**

### 2. Verifique o Seletor de Protocolos
- Deve aparecer um dropdown com protocolos
- Deve ter opção "Recomendação da IA (Personalizado)"
- Deve listar os protocolos criados

### 3. Teste Seleção de Protocolo
- Selecione um protocolo (ex: "Ansiedade")
- Verifique se produtos aparecem
- Verifique se dosagens estão corretas
- Verifique se horários estão corretos

### 4. Teste Recomendação por IA
- Selecione "Recomendação da IA (Personalizado)"
- Verifique se produtos personalizados aparecem

---

## ⚠️ TROUBLESHOOTING

### Problema: Erro ao executar script

**Solução:**
1. Verifique se está executando no banco correto
2. Verifique se há erros de sintaxe no console
3. Execute `DIAGNOSTICO_PROTOCOLOS.sql` para identificar problemas

### Problema: Protocolos não aparecem no frontend

**Solução:**
1. Verifique se a migração de categoria foi executada:
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'health_conditions' AND column_name = 'category';
```

2. Verifique se protocolos existem:
```sql
SELECT COUNT(*) FROM public.supplement_protocols WHERE is_active = true;
```

3. Verifique se condições têm categoria:
```sql
SELECT name, category FROM public.health_conditions WHERE category = 'nutrição';
```

### Problema: Protocolos aparecem sem produtos

**Solução:**
1. Verifique se produtos existem:
```sql
SELECT COUNT(*) FROM public.supplements WHERE is_approved = true;
```

2. Verifique associações:
```sql
SELECT sp.name, COUNT(ps.id) as produtos
FROM public.supplement_protocols sp
LEFT JOIN public.protocol_supplements ps ON ps.protocol_id = sp.id
GROUP BY sp.id, sp.name;
```

3. Se produtos não existirem, execute primeiro a migração de produtos.

---

## ✅ CHECKLIST FINAL

Após executar tudo, verifique:

- [ ] Coluna `category` existe em `health_conditions`
- [ ] Pelo menos 25 protocolos ativos
- [ ] Pelo menos 25 condições de nutrição
- [ ] Protocolos aparecem no frontend
- [ ] Produtos aparecem ao selecionar protocolo
- [ ] Recomendação por IA funciona

---

## 📊 RESULTADO ESPERADO

Após execução completa:

```
✅ 25+ Protocolos ativos
✅ 25+ Condições de nutrição
✅ 100+ Associações produtos-protocolos
✅ Frontend funcionando 100%
✅ Sistema pronto para venda
```

---

## 🚀 PRÓXIMOS PASSOS

1. ✅ Executar scripts SQL (30 min)
2. ✅ Testar no frontend (10 min)
3. ✅ Validar com usuário real (opcional)
4. ✅ **COMEÇAR A VENDER!** 🎉

---

**Última atualização:** 25/01/2025  
**Status:** ✅ Pronto para execução

