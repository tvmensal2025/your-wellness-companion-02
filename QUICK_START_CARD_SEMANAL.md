# ⚡ QUICK START - Card Semanal

## 🎯 O QUE FOI FEITO

Substituí o card semanal antigo (estático) por um novo (interativo) com:
- ✅ Clicável para ver detalhes
- ✅ Popup com 4 refeições
- ✅ Lista de compras automática
- ✅ Envio via WhatsApp

---

## 🚀 COMEÇAR AGORA (5 MINUTOS)

### 1. Aplicar Migration
```bash
supabase db push
```

### 2. Descobrir User ID
```sql
SELECT id, email FROM auth.users WHERE email = 'seu@email.com';
```

### 3. Criar Dados de Teste
1. Abrir `scripts/test-mealie-integration.sql`
2. Substituir `USER_ID_AQUI` pelo seu ID
3. Executar no SQL Editor

### 4. Testar
```bash
npm run dev
```
- Abrir http://localhost:5173
- Login → Dashboard Sofia
- Ver card "Seu Cardápio da Semana"
- Clicar em um dia
- Gerar lista de compras

---

## 📁 ARQUIVOS CRIADOS

**Código (8 arquivos):**
- `src/types/mealie.ts`
- `src/hooks/mealie/useWeeklyPlan.ts`
- `src/hooks/mealie/useDayMeals.ts`
- `src/hooks/mealie/useShoppingList.ts`
- `src/components/mealie/WeeklyPlanCard.tsx`
- `src/components/mealie/DayDetailModal.tsx`
- `supabase/migrations/20260117150000_create_shopping_lists.sql`
- `scripts/test-mealie-integration.sql`

**Modificado (1 arquivo):**
- `src/components/sofia/SofiaNutricionalRedesigned.tsx`

**Documentação (8 arquivos):**
- `PROXIMOS_PASSOS_CARD_SEMANAL.md` ⭐ (Guia completo)
- `ANTES_DEPOIS_CARD_SEMANAL.md` (Comparação)
- `RESUMO_FINAL_CARD_SEMANAL.md` (Resumo executivo)
- `TESTE_CARD_SEMANAL.md` (Guia de testes)
- `COMANDOS_RAPIDOS_CARD_SEMANAL.sh` (Comandos)
- `QUICK_START_CARD_SEMANAL.md` (Este arquivo)
- `MEALIE_IMPLEMENTACAO_COMPLETA.md`
- `EXPLICACAO_MEALIE_DETALHADA.md`

---

## 🐛 PROBLEMAS COMUNS

**Card não aparece:**
```bash
# Verificar console (F12)
# Aplicar migration novamente
supabase db push
```

**Lista não envia:**
```sql
-- Cadastrar telefone
UPDATE profiles SET phone = '5511999999999' WHERE id = 'SEU_USER_ID';
```

**Sem dados:**
```bash
# Executar script de teste
# scripts/test-mealie-integration.sql
```

---

## 📊 RESULTADO ESPERADO

### Card Semanal
```
📅 Seu Cardápio da Semana      [3/7 completos]

DOM   SEG   TER   QUA   QUI   SEX   SAB
⚪    🟢   🟢   🔵   🟡   ⚪   ⚪
12    13   14   15   16   17   18
0/4   4/4  4/4  3/4  1/4  0/4  0/4

👆 Toque em um dia para ver detalhes
```

### Popup (ao clicar)
```
Terça-feira, 14 de janeiro
🎯 Meta: 1.800 | Atual: 1.700 kcal (94%)

☕ CAFÉ DA MANHÃ (400 kcal)      7h00
• Omelete 3 ovos
• Pão integral

🍽️ ALMOÇO (600 kcal)            12h30
• Frango grelhado 200g
• Arroz integral 100g

🍎 LANCHE (200 kcal)             16h00
• Iogurte grego
• Banana

🌙 JANTAR (500 kcal)             19h30
• Salmão assado 150g
• Batata doce 150g

[🛒 Gerar Lista de Compras da Semana]
```

### WhatsApp
```
🛒 LISTA DE COMPRAS
📅 Semana de 13 a 19 de Janeiro

🍗 PROTEÍNAS
☐ Frango (peito): 1,2 kg
☐ Salmão (filé): 450g
☐ Ovos: 18 unidades

🌾 GRÃOS E CEREAIS
☐ Arroz integral: 700g
☐ Aveia: 300g

✅ Marque os itens conforme compra!
_MaxNutrition 🥗_
```

---

## ✅ CHECKLIST

- [ ] Migration aplicada
- [ ] Dados de teste criados
- [ ] App rodando
- [ ] Card aparece
- [ ] Popup abre
- [ ] Lista gera
- [ ] WhatsApp recebe

---

## 📚 DOCUMENTAÇÃO COMPLETA

**Leia primeiro:** `PROXIMOS_PASSOS_CARD_SEMANAL.md`

**Para testes:** `TESTE_CARD_SEMANAL.md`

**Para deploy:** `MEALIE_DEPLOY_INSTRUCTIONS.md`

---

## 🎯 PRÓXIMA AÇÃO

```bash
supabase db push
```

**Tempo estimado:** 30 minutos

**ROI:** INFINITO 🚀

---

**Vamos começar! 🎉**
