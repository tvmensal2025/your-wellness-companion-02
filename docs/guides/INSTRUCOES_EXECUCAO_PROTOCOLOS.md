# 📋 INSTRUÇÕES DE EXECUÇÃO - PROTOCOLOS COMPLETOS

## ✅ **CORREÇÕES APLICADAS**

1. ✅ **Produto OZONIO adicionado** ao `MIGRACAO_PRODUTOS_FINAL_V2.sql`
2. ✅ **Função auxiliar criada** para inserção segura de produtos nos protocolos
3. ✅ **Validações adicionadas** para evitar erros de NULL
4. ✅ **Horários faltantes adicionados** (APOS_ALMOCO_E_JANTAR, etc.)
5. ✅ **Condições de saúde faltantes adicionadas** (32 novas condições)

## 🚀 **ORDEM DE EXECUÇÃO**

### **PASSO 1: Executar Migração de Produtos**
```sql
-- Execute primeiro este arquivo:
MIGRACAO_PRODUTOS_FINAL_V2.sql
```
**O que faz:**
- Limpa produtos antigos
- Insere os 59 produtos (incluindo OZONIO)
- Aplica desconto de 50% automaticamente

### **PASSO 2: Executar Protocolos**
```sql
-- Execute depois este arquivo:
PROTOCOLOS_COMPLETOS_CATALOGO.sql
```
**O que faz:**
- Adiciona horários faltantes
- Adiciona condições de saúde faltantes
- Cria 16 protocolos principais com validações

## ⚠️ **IMPORTANTE**

### **Se encontrar erro de produto não encontrado:**
O script agora usa a função `insert_protocol_supplement_safe()` que **ignora produtos NULL** automaticamente. Isso significa que:
- ✅ Produtos que não existem serão **ignorados silenciosamente**
- ✅ Protocolos serão criados mesmo se alguns produtos estiverem faltando
- ⚠️ **Verifique os logs** para ver quais produtos não foram encontrados

### **Produtos que devem existir:**
Certifique-se de que estes produtos estão no banco antes de executar:
- ✅ `OZONIO` - **CRÍTICO** (usado em todos os protocolos)
- ✅ `SD_FIBRO3` - Para dores e inflamações
- ✅ `BVB_INSU` - Para diabetes
- ✅ `SEREMIX` - Para sono
- ✅ `BVB_D3K2` - Vitamina D3+K2
- ✅ `OMEGA_3_1400MG` - Ômega 3
- ✅ `BVB_B12` - Vitamina B12
- ✅ `PROPOWAY_VERMELHA` - Própolis
- ✅ `SPIRULINA_VIT_E` - Spirulina
- ✅ `LIPOWAY` - Emagrecimento
- ✅ `AMARGO` - Chá amargo
- ✅ `PROWOMAN` - Saúde feminina
- ✅ `PROMEN` - Saúde masculina
- ✅ `BVB_Q10` - Coenzima Q10
- ✅ `MEGA_NUTRI_RX21` - Cabelos e unhas
- ✅ `VITAMIX_SKIN` - Pele
- ✅ `VISION_WAY` - Saúde ocular
- ✅ E todos os outros produtos do catálogo

## 📊 **PROTOCOLOS IMPLEMENTADOS (16)**

1. ✅ Ansiedade
2. ✅ Diabetes
3. ✅ Fibromialgia e Enxaqueca
4. ✅ Insônia
5. ✅ Emagrecimento
6. ✅ Desintoxicação
7. ✅ Saúde Íntima
8. ✅ Menopausa
9. ✅ Alzheimer e Memória Fraca
10. ✅ Candidíase
11. ✅ Hipertensão
12. ✅ Saúde Cardiovascular
13. ✅ Saúde Ocular
14. ✅ Queda de Cabelos
15. ✅ Infecção Urinária
16. ✅ Gripe e Resfriados

## 📝 **PROTOCOLOS FALTANDO (21+)**

Os seguintes protocolos ainda precisam ser adicionados:
- S.O.S. Dor
- Cãimbra e Formigamento
- Saúde do Homem
- Saúde da Mulher
- Saúde Sexual
- Próstata
- Inflamação no Útero, Ovários, Endometriose
- Esgotamento Físico e Mental
- Enxaqueca (separado)
- Bactéria H. Pylori
- Alergias Respiratórias
- Sinusite
- Herpes Zoster
- Intestino Preso
- Inchaço e Retenção de Líquidos
- Feridas
- Apoio ao Tratamento de Câncer
- Psoríase / Dermatite
- Varizes - Dor e Cansaço nas Pernas
- Hidratação e Relaxamento para os Pés
- Acne
- Tratamento de Unha
- Hepatite
- Circulação

## 🔍 **VERIFICAÇÃO PÓS-EXECUÇÃO**

Após executar os scripts, verifique:

```sql
-- Verificar produtos cadastrados
SELECT COUNT(*) FROM public.supplements;
-- Deve retornar 59 produtos

-- Verificar protocolos criados
SELECT COUNT(*) FROM public.supplement_protocols;
-- Deve retornar 16+ protocolos

-- Verificar se OZONIO existe
SELECT * FROM public.supplements WHERE external_id = 'OZONIO';
-- Deve retornar 1 linha

-- Verificar protocolos com produtos
SELECT 
  sp.name as protocolo,
  COUNT(ps.id) as produtos_no_protocolo
FROM public.supplement_protocols sp
LEFT JOIN public.protocol_supplements ps ON ps.protocol_id = sp.id
GROUP BY sp.id, sp.name
ORDER BY sp.name;
```

## 🐛 **TROUBLESHOOTING**

### **Erro: "null value in column supplement_id"**
**Causa:** Produto não encontrado no banco  
**Solução:** A função `insert_protocol_supplement_safe()` já resolve isso. Se ainda ocorrer, verifique se o produto OZONIO foi inserido corretamente.

### **Erro: "condition not found"**
**Causa:** Condição de saúde não existe  
**Solução:** O script já cria todas as condições necessárias. Se ocorrer, verifique se a seção de condições foi executada.

### **Protocolo criado mas sem produtos**
**Causa:** Todos os produtos do protocolo estão NULL  
**Solução:** Verifique se os produtos existem no banco com os external_ids corretos.

---

**Data:** 2025-01-XX  
**Status:** ✅ Scripts prontos para execução

