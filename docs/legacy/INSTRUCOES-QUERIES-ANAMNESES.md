# 📋 QUERIES SQL PARA ANAMNESES - GUIA COMPLETO

## 📁 Arquivos Criados

1. **`query-anamneses-completa.sql`** - Query principal com análise completa de risco
2. **`query-anamneses-simples.sql`** - Query simplificada para uso rápido
3. **`verificar-estrutura-anamneses.sql`** - Script de diagnóstico da estrutura

## 🔍 ANÁLISE DA ESTRUTURA DAS TABELAS

### Tabela `user_anamnesis`
- **Campo chave**: `user_id` (UUID que referencia auth.users(id))
- **Campos principais**: Dados completos da anamnese sistêmica
- **Relacionamento**: Faz join com `profiles` através do `user_id`

### Tabela `profiles` 
- **Campo chave**: `user_id` (UUID que referencia auth.users(id))
- **Campo nome**: `full_name` (contém o nome completo do usuário)
- **Relacionamento**: LEFT JOIN para incluir anamneses mesmo sem nome

## 🚀 COMO USAR

### 1. PRIMEIRO PASSO - DIAGNÓSTICO
```sql
-- Execute este script primeiro para verificar se tudo está ok:
-- Arquivo: verificar-estrutura-anamneses.sql
```
Este script vai verificar:
- Se as tabelas existem
- Estrutura dos campos
- Quantidade de registros
- Possíveis problemas de dados

### 2. QUERY SIMPLES - USO RÁPIDO
```sql
-- Use esta query para resultados rápidos:
-- Arquivo: query-anamneses-simples.sql

SELECT 
    ua.id as anamnesis_id,
    COALESCE(p.full_name, 'Usuário sem nome') as nome_usuario,
    p.email,
    ua.profession as profissao,
    ua.current_bmi as imc,
    ua.has_compulsive_eating as compulsao_alimentar,
    ua.daily_stress_level as nivel_stress,
    ua.created_at as data_criacao
FROM user_anamnesis ua
LEFT JOIN profiles p ON ua.user_id = p.user_id
ORDER BY ua.created_at DESC;
```

### 3. QUERY COMPLETA - ANÁLISE DETALHADA
```sql
-- Use esta query para análise administrativa completa:
-- Arquivo: query-anamneses-completa.sql
```
Esta query inclui:
- **Cálculo automático de risco** (ALTO/MODERADO/BAIXO)
- **Classificação de IMC** (Normal/Sobrepeso/Obesidade)
- **Contadores de fatores de risco**
- **Status de qualidade de vida**
- **Análise comportamental alimentar**

## 📊 FUNCIONALIDADES DAS QUERIES

### Query Completa Inclui:

#### ✅ Informações Básicas
- Nome do usuário (com fallback para "Usuário sem nome")
- Email, telefone, profissão
- Data de criação da anamnese

#### ✅ Análise de Risco Automática
```sql
-- Classificação baseada em:
- Histórico familiar (diabetes, obesidade, coração)
- IMC atual (peso 2x para obesidade)
- Comportamentos alimentares problemáticos
- Qualidade de vida (sono, stress, energia)
```

#### ✅ Contadores Automáticos
- Fatores de risco familiares
- Comportamentos alimentares problemáticos
- Dias desde última atualização

#### ✅ Classificações Automáticas
- **IMC**: Abaixo/Normal/Sobrepeso/Obesidade
- **Relacionamento com comida**: Muito problemático → Excelente
- **Qualidade do sono**: Muito ruim → Excelente
- **Nível de stress**: Baixo → Muito alto

### Queries Extras Incluídas:

#### 📈 Resumo Estatístico
```sql
-- Mostra estatísticas gerais:
- Total de anamneses
- Casos de alto risco
- Médias de IMC, stress, sono
- Distribuição de problemas
```

#### 🚨 Casos Críticos
```sql
-- Identifica usuários que precisam atenção imediata:
- IMC ≥ 35 (obesidade severa)
- Compulsão alimentar + comer escondido
- Stress alto + sono ruim
- Relacionamento com comida muito problemático
```

## 🔧 PERSONALIZAÇÃO

### Para Buscar Usuários Específicos:
```sql
-- Adicione ao final da query:
WHERE p.full_name ILIKE '%nome%'
-- ou
WHERE ua.city_state ILIKE '%cidade%'
-- ou  
WHERE ua.profession ILIKE '%profissão%'
```

### Para Filtrar por Nível de Risco:
```sql
-- Adicione esta condição WHERE:
WHERE (cálculo_de_risco) >= 6  -- Alto risco
-- ou
WHERE ua.has_compulsive_eating = true  -- Só compulsão alimentar
```

### Para Limitar Resultados:
```sql
-- Adicione ao final:
LIMIT 50  -- Só os primeiros 50
```

## 🎯 CASOS DE USO ADMINISTRATIVOS

### 1. Identificar Usuários de Alto Risco
```sql
-- Use a query completa e filtre por risk_level = 'ALTO'
```

### 2. Acompanhar Casos de Compulsão Alimentar
```sql
-- Filtre por has_compulsive_eating = true
```

### 3. Analisar Qualidade de Vida Geral
```sql
-- Use o resumo estatístico para médias
```

### 4. Priorizar Atendimentos
```sql
-- Use a query de casos críticos
```

## ⚠️ POSSÍVEIS PROBLEMAS E SOLUÇÕES

### Problema: "Tabela não encontrada"
**Solução**: Execute o script de verificação primeiro

### Problema: "Muitos usuários sem nome"
**Solução**: Verifique se o campo `full_name` está preenchido na tabela `profiles`

### Problema: "Dados de anamnese vazios"
**Solução**: Verifique se os usuários completaram suas anamneses

### Problema: "Query muito lenta"
**Solução**: Adicione LIMIT ou filtre por data:
```sql
WHERE ua.created_at >= NOW() - INTERVAL '30 days'
```

## 🔍 CAMPOS IMPORTANTES PARA ANÁLISE

### Críticos para Risco:
- `current_bmi` - IMC atual
- `has_compulsive_eating` - Compulsão alimentar
- `daily_stress_level` - Nível de stress
- `family_diabetes_history` - Diabetes na família
- `family_heart_disease_history` - Problemas cardíacos na família

### Importantes para Acompanhamento:
- `food_relationship_score` - Relacionamento com comida (0-10)
- `sleep_quality_score` - Qualidade do sono (0-10)
- `daily_energy_level` - Nível de energia (0-10)
- `feels_guilt_after_eating` - Culpa ao comer
- `eats_in_secret` - Come escondido

## 💡 DICAS DE USO

1. **Execute sempre o script de verificação primeiro**
2. **Use a query simples para testes rápidos**
3. **Use a query completa para análises administrativas**
4. **Salve as queries como views no banco para reutilização**
5. **Adicione filtros conforme sua necessidade específica**

---

**📞 Essas queries foram criadas especificamente para o painel administrativo visualizar todas as anamneses e entender como ajudar cada usuário com base em seus fatores de risco e necessidades específicas.**
