# 🚀 GUIA RÁPIDO - QUERIES ANAMNESES FUNCIONAIS

## ✅ **Status Atual**
- **Tabelas verificadas**: ✅ Funcionando
- **Relacionamento**: ✅ OK (user_anamnesis ↔ profiles)
- **Dados encontrados**: 2 anamneses, 85 perfis

---

## 📋 **ORDEM DE EXECUÇÃO DAS QUERIES**

### **1º PASSO - Verificar campos disponíveis**
📄 **Arquivo**: `query-campos-disponiveis.sql`
```sql
SELECT * FROM user_anamnesis LIMIT 1;
```
**Objetivo**: Ver quais campos realmente existem

---

### **2º PASSO - Query completa das anamneses**
📄 **Arquivo**: `query-anamneses-completa-v2.sql`

**Inclui**:
- ✅ Nome do usuário (com fallback)
- ✅ Dados pessoais (profissão, estado civil)
- ✅ Métricas físicas (peso, altura, IMC)
- ✅ Histórico familiar (diabetes, obesidade, coração)
- ✅ Comportamento alimentar (compulsão, culpa, comer escondido)
- ✅ Qualidade de vida (sono, stress, energia)
- ✅ **Cálculo automático de risco** (ALTO/MODERADO/BAIXO)
- ✅ **Classificações automáticas** (IMC, sono, stress)
- ✅ **Contadores** (riscos familiares, comportamentos problemáticos)

---

### **3º PASSO - Resumo estatístico**
📄 **Arquivo**: `resumo-estatistico-anamneses.sql`

**Mostra**:
- 📊 Total de anamneses e usuários únicos
- 📈 Estatísticas de IMC (média, min, max)
- 🚨 Contagem de casos por problema (obesidade, compulsão)
- 👨‍👩‍👧‍👦 Histórico familiar por tipo
- 💭 Médias de qualidade de vida
- 📊 Distribuição por nível de risco

---

## 🎯 **QUERIES PARA CASOS ESPECÍFICOS**

### **Usuários de Alto Risco**
```sql
-- Adicione esta condição WHERE na query completa:
WHERE (cálculo_de_risco) >= 6
```

### **Casos de Compulsão Alimentar**
```sql
WHERE ua.has_compulsive_eating = true
```

### **IMC Alto (Obesidade)**
```sql
WHERE ua.current_bmi >= 30
```

### **Múltiplos Problemas**
```sql
WHERE ua.has_compulsive_eating = true 
   AND ua.current_bmi >= 30
   AND ua.daily_stress_level >= 7
```

---

## 📊 **INTERPRETAÇÃO DOS RESULTADOS**

### **Níveis de Risco**:
- **🔴 ALTO RISCO** (Score ≥ 6): Necessita intervenção imediata
- **🟡 RISCO MODERADO** (Score 3-5): Acompanhamento próximo  
- **🟢 BAIXO RISCO** (Score < 3): Manutenção preventiva

### **Classificação IMC**:
- **< 18.5**: Abaixo do peso
- **18.5-24.9**: Peso normal
- **25-29.9**: Sobrepeso
- **≥ 30**: Obesidade

### **Scores de Qualidade de Vida (0-10)**:
- **≤ 3**: Muito problemático
- **4-5**: Problemático  
- **6-7**: Regular
- **8-9**: Bom
- **10**: Excelente

---

## 🔧 **PERSONALIZAÇÃO**

### **Filtrar por Período**:
```sql
WHERE ua.created_at >= NOW() - INTERVAL '30 days'
```

### **Buscar por Nome**:
```sql
WHERE p.full_name ILIKE '%nome%'
```

### **Limitar Resultados**:
```sql
LIMIT 20
```

### **Ordenar Diferente**:
```sql
ORDER BY ua.current_bmi DESC  -- Por IMC decrescente
ORDER BY score_risco_total DESC  -- Por risco decrescente
```

---

## ⚠️ **IMPORTANTE**

1. **Execute sempre na ordem**: campos → completa → resumo
2. **Adapte os campos** conforme sua estrutura real
3. **Use LIMIT** para queries grandes
4. **Salve as queries** como favoritas no Supabase

---

## 🎯 **CASOS DE USO ADMINISTRATIVOS**

### **Triagem de Usuários**
1. Execute o resumo estatístico
2. Identifique quantos estão em alto risco
3. Use a query completa para ver detalhes

### **Acompanhamento Semanal**
1. Filtre por data da última semana
2. Veja novos casos de risco
3. Monitore mudanças nos scores

### **Relatório Mensal**
1. Use o resumo para estatísticas gerais
2. Compare com mês anterior
3. Identifique tendências

---

**🎉 Agora você tem queries completas e funcionais para análise administrativa das anamneses!**
