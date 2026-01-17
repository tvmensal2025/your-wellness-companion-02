# 🍽️ Explicação Detalhada: Integração Mealie + MaxNutrition

## 📋 CONTEXTO ATUAL

### ✅ O QUE JÁ FUNCIONA NO MAXNUTRITION

1. **Sofia (IA Nutricional)**
   - Analisa fotos de refeições via WhatsApp
   - Detecta alimentos usando YOLO + Gemini
   - Calcula calorias e macros automaticamente
   - Salva histórico de refeições

2. **Dashboard Nutricional**
   - Mostra refeições do dia (café, almoço, lanche, jantar)
   - Gráficos de progresso de macros
   - Histórico semanal
   - Metas personalizadas

3. **Banco de Dados TACO**
   - 5000+ alimentos brasileiros
   - Informações nutricionais precisas
   - Cálculos automáticos

4. **WhatsApp Integration**
   - Recebe fotos de refeições
   - Envia análises automáticas
   - Confirmação interativa

### ❌ O QUE ESTÁ FALTANDO

O sistema atual **NÃO TEM**:
- ❌ Planejamento de refeições futuras
- ❌ Biblioteca de receitas organizadas
- ❌ Lista de compras automática
- ❌ Cardápio semanal visual
- ❌ Substituição inteligente de receitas

---

## 🎯 O QUE É O MEALIE?

**Mealie** é um sistema profissional de gerenciamento de receitas que oferece:

- 📚 **Biblioteca de Receitas**: Armazena receitas com fotos, ingredientes e instruções
- 📅 **Planejamento Semanal**: Cria cardápios para 7 dias
- 🛒 **Lista de Compras**: Gera automaticamente baseado nas receitas
- 🔗 **Importação Automática**: Pega receitas de sites (TudoGostoso, Panelinha, etc)
- 📊 **Dados Nutricionais**: Calcula macros por receita
- 🔔 **Webhooks**: Envia notificações automáticas

**Exemplo Real:**
```
Usuário quer fazer "Frango Grelhado com Batata Doce"
→ Mealie tem a receita completa
→ Ingredientes: 200g frango, 150g batata doce, temperos
→ Instruções: Passo 1, 2, 3...
→ Macros: 350 kcal, 45g proteína, 30g carbs, 8g gordura
→ Tempo: 30 minutos
```

---

## 🚀 O QUE VAMOS IMPLEMENTAR

### 1. **CARD SEMANAL COMPACTO** ⭐⭐⭐⭐⭐

**O QUE FAZ:**
Mostra um card visual com os 7 dias da semana, indicando:
- ✅ Dias com refeições planejadas (verde)
- ⚠️ Dias parcialmente planejados (amarelo)
- ❌ Dias vazios (cinza)
- 🎯 Dia atual destacado

**ONDE APARECE:**
No topo do dashboard nutricional, logo após o card de calorias

**EXEMPLO VISUAL:**
```
┌─────────────────────────────────────────────┐
│  📅 Seu Cardápio da Semana                  │
├─────────────────────────────────────────────┤
│  D    S    T    Q    Q    S    S            │
│  ✅   ✅   🎯   ⚠️   ❌   ❌   ❌           │
│  15   16   17   18   19   20   21           │
│                                              │
│  Toque em um dia para ver detalhes          │
└─────────────────────────────────────────────┘
```

**POR QUE É IMPORTANTE:**
- Usuário vê de relance se está planejado
- Incentiva planejamento antecipado
- Reduz decisões de última hora
- Melhora aderência à dieta

**CÓDIGO A CRIAR:**
```typescript
// src/components/mealie/WeeklyPlanCard.tsx
// Componente visual do card semanal
// ~120 linhas

// src/hooks/mealie/useWeeklyPlan.ts
// Hook para buscar dados da semana
// ~80 linhas
```

---

### 2. **POPUP DE DETALHES DO DIA** ⭐⭐⭐⭐⭐

**O QUE FAZ:**
Quando usuário clica em um dia do card semanal, abre um popup mostrando:
- 🍳 Café da manhã planejado
- 🍽️ Almoço planejado
- 🍎 Lanche planejado
- 🌙 Jantar planejado
- 📊 Total de calorias do dia
- 📈 Distribuição de macros

**EXEMPLO VISUAL:**
```
┌─────────────────────────────────────────────┐
│  📅 Terça-feira, 17 de Janeiro              │
├─────────────────────────────────────────────┤
│                                              │
│  ☕ CAFÉ DA MANHÃ (400 kcal)                │
│  • Omelete de 3 ovos                        │
│  • Pão integral (2 fatias)                  │
│  • Café com leite                           │
│                                              │
│  🍽️ ALMOÇO (600 kcal)                      │
│  • Frango grelhado (200g)                   │
│  • Arroz integral (100g)                    │
│  • Salada verde                             │
│                                              │
│  🍎 LANCHE (200 kcal)                       │
│  • Iogurte grego                            │
│  • Banana                                   │
│                                              │
│  🌙 JANTAR (500 kcal)                       │
│  • Salmão assado (150g)                     │
│  • Batata doce (150g)                       │
│  • Brócolis                                 │
│                                              │
│  📊 TOTAL: 1.700 kcal                       │
│  🎯 Meta: 1.800 kcal (94%)                  │
│                                              │
│  [🛒 Gerar Lista de Compras]                │
│  [✏️ Editar Dia]                            │
│  [❌ Fechar]                                │
└─────────────────────────────────────────────┘
```

**POR QUE É IMPORTANTE:**
- Usuário vê exatamente o que vai comer
- Pode se preparar com antecedência
- Evita improvisos prejudiciais
- Facilita meal prep

**CÓDIGO A CRIAR:**
```typescript
// src/components/mealie/DayDetailModal.tsx
// Modal com detalhes do dia
// ~150 linhas

// src/hooks/mealie/useDayMeals.ts
// Hook para buscar refeições do dia
// ~70 linhas
```

---

### 3. **LISTA DE COMPRAS AUTOMÁTICA** ⭐⭐⭐⭐⭐

**O QUE FAZ:**
Quando usuário clica em "Gerar Lista de Compras":
1. Analisa todas as receitas da semana
2. Extrai todos os ingredientes
3. Agrupa por categoria (proteínas, vegetais, grãos, etc)
4. Remove duplicatas e soma quantidades
5. Envia lista formatada via WhatsApp

**EXEMPLO REAL:**

**Entrada (Receitas da Semana):**
```
Segunda: Frango grelhado (200g frango, 100g arroz)
Terça: Frango ao molho (250g frango, 50g arroz)
Quarta: Salmão (150g salmão, 100g batata)
```

**Saída (Lista de Compras):**
```
🛒 LISTA DE COMPRAS - Semana 17/01

🍗 PROTEÍNAS
• Frango: 450g
• Salmão: 150g

🌾 GRÃOS
• Arroz integral: 150g

🥔 TUBÉRCULOS
• Batata doce: 100g

📱 Lista enviada para seu WhatsApp!
```

**POR QUE É IMPORTANTE:**
- Economiza tempo no mercado
- Evita esquecer ingredientes
- Reduz desperdício
- Facilita organização

**CÓDIGO A CRIAR:**
```typescript
// src/services/mealie/shoppingListService.ts
// Lógica de geração da lista
// ~100 linhas

// src/hooks/mealie/useShoppingList.ts
// Hook para gerenciar lista
// ~60 linhas

// src/components/mealie/ShoppingListButton.tsx
// Botão de gerar lista
// ~50 linhas
```

---

### 4. **INTEGRAÇÃO COM WHATSAPP** ⭐⭐⭐⭐⭐

**O QUE FAZ:**
Envia a lista de compras automaticamente para o WhatsApp do usuário em formato organizado e fácil de usar no mercado.

**EXEMPLO DE MENSAGEM:**
```
🛒 *LISTA DE COMPRAS*
📅 Semana de 17 a 23 de Janeiro

━━━━━━━━━━━━━━━━━━━━━━

🍗 *PROTEÍNAS*
☐ Frango (peito): 450g
☐ Salmão (filé): 150g
☐ Ovos: 12 unidades

🌾 *GRÃOS E CEREAIS*
☐ Arroz integral: 500g
☐ Aveia: 200g
☐ Pão integral: 1 pacote

🥬 *VEGETAIS*
☐ Brócolis: 300g
☐ Alface: 1 pé
☐ Tomate: 500g

🥔 *TUBÉRCULOS*
☐ Batata doce: 500g
☐ Mandioca: 300g

🥛 *LATICÍNIOS*
☐ Iogurte grego: 400g
☐ Queijo branco: 200g

━━━━━━━━━━━━━━━━━━━━━━

💰 *ESTIMATIVA*: R$ 85,00
⏱️ *TEMPO NO MERCADO*: ~30 min

✅ Marque os itens conforme compra!

_MaxNutrition 🥗_
```

**POR QUE É IMPORTANTE:**
- Usuário tem lista no celular
- Pode marcar itens comprados
- Compartilha com família
- Não precisa papel

**CÓDIGO A CRIAR:**
```typescript
// src/services/mealie/whatsappService.ts
// Serviço de envio WhatsApp
// ~80 linhas

// Integração com edge function existente
// supabase/functions/whatsapp-nutrition-webhook/
```

---

## 🏗️ ARQUITETURA TÉCNICA

### ESTRUTURA DE PASTAS
```
src/
├── components/
│   └── mealie/
│       ├── WeeklyPlanCard.tsx        # Card semanal compacto
│       ├── DayIndicator.tsx          # Indicador visual do dia
│       ├── DayDetailModal.tsx        # Modal de detalhes
│       └── ShoppingListButton.tsx    # Botão de lista
│
├── hooks/
│   └── mealie/
│       ├── useWeeklyPlan.ts          # Dados da semana
│       ├── useDayMeals.ts            # Refeições do dia
│       └── useShoppingList.ts        # Lista de compras
│
├── services/
│   └── mealie/
│       ├── weeklyPlanService.ts      # Lógica de negócio
│       ├── shoppingListService.ts    # Geração de lista
│       └── whatsappService.ts        # Envio WhatsApp
│
└── types/
    └── mealie.ts                     # ✅ JÁ CRIADO
```

### FLUXO DE DADOS

```
┌─────────────────────────────────────────────────────────┐
│  1. USUÁRIO ABRE DASHBOARD                              │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  2. useWeeklyPlan() BUSCA DADOS                         │
│     • Consulta sofia_food_analysis (histórico)          │
│     • Consulta meal_plans (planejamento futuro)         │
│     • Calcula status de cada dia                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  3. WeeklyPlanCard RENDERIZA                            │
│     • 7 dias com indicadores visuais                    │
│     • Cores: verde (completo), amarelo (parcial),       │
│       cinza (vazio), azul (hoje)                        │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  4. USUÁRIO CLICA EM UM DIA                             │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  5. useDayMeals() BUSCA REFEIÇÕES                       │
│     • Busca por data específica                         │
│     • Agrupa por meal_type                              │
│     • Calcula totais                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  6. DayDetailModal ABRE                                 │
│     • Mostra 4 refeições                                │
│     • Totais de calorias e macros                       │
│     • Botão "Gerar Lista de Compras"                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  7. USUÁRIO CLICA "GERAR LISTA"                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  8. shoppingListService.generate()                      │
│     • Extrai ingredientes de todas receitas             │
│     • Agrupa por categoria                              │
│     • Remove duplicatas                                 │
│     • Soma quantidades                                  │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  9. whatsappService.send()                              │
│     • Formata mensagem bonita                           │
│     • Envia via edge function                           │
│     • Salva em shopping_lists (histórico)               │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  10. USUÁRIO RECEBE NO WHATSAPP                         │
│      ✅ Lista organizada por categoria                  │
│      ✅ Pode marcar itens comprados                     │
│      ✅ Compartilhar com família                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 BANCO DE DADOS

### TABELAS EXISTENTES (Usaremos)
```sql
-- Já existe, vamos usar
sofia_food_analysis
├── user_id
├── meal_type (breakfast, lunch, snack, dinner)
├── total_calories
├── total_protein
├── total_carbs
├── total_fat
├── foods_detected (array de objetos)
└── created_at
```

### NOVAS TABELAS (A criar)
```sql
-- Armazenar listas de compras geradas
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  week_start DATE,
  week_end DATE,
  items JSONB, -- Array de {name, quantity, unit, category, checked}
  sent_to_whatsapp BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_dates ON shopping_lists(week_start, week_end);
```

---

## 🎯 BENEFÍCIOS PARA O USUÁRIO

### ANTES (Situação Atual)
```
❌ Usuário não sabe o que vai comer amanhã
❌ Vai ao mercado sem lista
❌ Compra coisas desnecessárias
❌ Esquece ingredientes importantes
❌ Improvisa refeições (sai da dieta)
❌ Perde tempo decidindo o que comer
```

### DEPOIS (Com Mealie)
```
✅ Usuário vê cardápio da semana inteira
✅ Recebe lista de compras no WhatsApp
✅ Compra apenas o necessário
✅ Não esquece nada
✅ Segue o planejamento (mantém dieta)
✅ Economiza tempo e dinheiro
```

### EXEMPLO PRÁTICO

**Cenário: Maria quer emagrecer**

**Segunda-feira (Hoje):**
1. Maria abre o app
2. Vê que terça-feira está vazio ❌
3. Clica em "Planejar Semana"
4. Sofia sugere receitas baseadas na meta (1.600 kcal/dia)
5. Maria aprova o cardápio
6. Clica em "Gerar Lista de Compras"
7. Recebe no WhatsApp: "🛒 Compre: 500g frango, 300g batata doce..."

**Terça-feira:**
1. Maria acorda sabendo o que vai comer
2. Já tem os ingredientes (comprou ontem)
3. Segue o plano sem improvisar
4. Mantém as 1.600 kcal
5. Progride no objetivo de emagrecimento

**Resultado:**
- ✅ Aderência à dieta: 95% (vs 60% antes)
- ✅ Tempo economizado: 2h/semana
- ✅ Dinheiro economizado: R$ 50/semana
- ✅ Estresse reduzido: Sem decisões de última hora

---

## 🚀 IMPLEMENTAÇÃO PASSO A PASSO

### FASE 1: Tipos e Estrutura (✅ FEITO)
```typescript
// src/types/mealie.ts - JÁ CRIADO
export interface WeekDay {
  date: Date;
  dayOfWeek: string;
  mealsCount: number;
  calories: number;
  status: 'empty' | 'partial' | 'complete' | 'today';
}
```

### FASE 2: Hooks de Dados (🔄 PRÓXIMO)
```typescript
// src/hooks/mealie/useWeeklyPlan.ts
export function useWeeklyPlan(userId: string) {
  // 1. Buscar dados de sofia_food_analysis
  // 2. Agrupar por dia da semana
  // 3. Calcular status de cada dia
  // 4. Retornar array de 7 dias
}
```

### FASE 3: Componentes Visuais (🔄 PRÓXIMO)
```typescript
// src/components/mealie/WeeklyPlanCard.tsx
export function WeeklyPlanCard({ userId }) {
  const { days, loading } = useWeeklyPlan(userId);
  
  return (
    <Card>
      <div className="flex gap-2">
        {days.map(day => (
          <DayIndicator 
            key={day.date}
            day={day}
            onClick={() => openDayDetail(day)}
          />
        ))}
      </div>
    </Card>
  );
}
```

### FASE 4: Modal de Detalhes (🔄 PRÓXIMO)
```typescript
// src/components/mealie/DayDetailModal.tsx
export function DayDetailModal({ date, onClose }) {
  const { meals, totals } = useDayMeals(date);
  
  return (
    <Modal>
      <h2>{format(date, 'EEEE, dd/MM')}</h2>
      
      {/* Café, Almoço, Lanche, Jantar */}
      {meals.map(meal => (
        <MealSection key={meal.type} meal={meal} />
      ))}
      
      <Button onClick={generateShoppingList}>
        🛒 Gerar Lista de Compras
      </Button>
    </Modal>
  );
}
```

### FASE 5: Lista de Compras (🔄 PRÓXIMO)
```typescript
// src/services/mealie/shoppingListService.ts
export async function generateShoppingList(
  weekStart: Date,
  weekEnd: Date,
  userId: string
) {
  // 1. Buscar todas refeições da semana
  const meals = await fetchWeekMeals(weekStart, weekEnd, userId);
  
  // 2. Extrair ingredientes
  const ingredients = extractIngredients(meals);
  
  // 3. Agrupar por categoria
  const grouped = groupByCategory(ingredients);
  
  // 4. Formatar mensagem
  const message = formatWhatsAppMessage(grouped);
  
  // 5. Enviar WhatsApp
  await sendWhatsApp(userId, message);
  
  // 6. Salvar histórico
  await saveShoppingList(userId, grouped);
}
```

---

## 💡 PERGUNTAS FREQUENTES

### 1. "Preciso instalar o Mealie?"
**Resposta:** NÃO nesta primeira versão. Vamos usar apenas os dados que já temos (sofia_food_analysis). O Mealie será integrado depois para funcionalidades avançadas.

### 2. "Vai quebrar algo existente?"
**Resposta:** NÃO. Estamos apenas ADICIONANDO funcionalidades. Nada será removido ou modificado.

### 3. "Quanto tempo leva?"
**Resposta:** 
- Fase 2 (Hooks): 2 dias
- Fase 3 (Card Semanal): 1 dia
- Fase 4 (Modal): 2 dias
- Fase 5 (Lista de Compras): 2 dias
- **Total: ~1 semana**

### 4. "Vai aumentar custos?"
**Resposta:** NÃO. Usamos apenas:
- Banco de dados existente (Supabase)
- WhatsApp já configurado
- Sem APIs externas pagas

### 5. "E se o usuário não planejar a semana?"
**Resposta:** O card mostra o histórico. Se não planejou, mostra os dias vazios e incentiva a planejar.

---

## 📝 RESUMO EXECUTIVO

### O QUE VAMOS FAZER
1. ✅ Card semanal visual (7 dias)
2. ✅ Popup com detalhes do dia
3. ✅ Lista de compras automática
4. ✅ Envio via WhatsApp

### POR QUE É IMPORTANTE
- Aumenta aderência à dieta
- Economiza tempo do usuário
- Reduz desperdício
- Melhora experiência

### QUANTO CUSTA
- 💰 Custo: R$ 0 (usa infraestrutura existente)
- ⏱️ Tempo: 1 semana de desenvolvimento
- 📈 Impacto: ALTO (melhora retenção de usuários)

### PRÓXIMOS PASSOS
1. Criar hooks de dados (useWeeklyPlan, useDayMeals)
2. Criar componentes visuais (WeeklyPlanCard, DayDetailModal)
3. Implementar serviço de lista de compras
4. Integrar com WhatsApp
5. Testar com usuários beta

---

**Pronto para começar? Vamos implementar! 🚀**
