# 🍽️ Integração Mealie + MaxNutrition

## 📋 Visão Geral

**Mealie** é um gerenciador de receitas e planejador de refeições self-hosted com:
- ✅ API REST completa
- ✅ Importação automática de receitas via URL
- ✅ Planejamento de refeições (diário/semanal/mensal)
- ✅ Listas de compras inteligentes
- ✅ Webhooks para notificações
- ✅ Dados nutricionais por receita
- ✅ Sistema de tags e categorias
- ✅ Multi-usuário com grupos

---

## 🎯 O Que Temos no MaxNutrition

### ✅ Funcionalidades Existentes

1. **Geração de Cardápios com IA**
   - Sofia gera cardápios personalizados
   - Baseado em objetivos e preferências
   - Cálculo automático de macros

2. **Análise de Alimentos**
   - YOLO + Gemini para detecção
   - Cálculo nutricional automático
   - Histórico de refeições

3. **Banco de Dados TACO**
   - 5000+ alimentos brasileiros
   - Informações nutricionais completas
   - Tabela normalizada

4. **Sistema de Metas**
   - Cálculo de TDEE (Mifflin-St Jeor)
   - Distribuição de macros
   - Ajuste por objetivo

5. **Dashboard Nutricional**
   - Visualização por refeição
   - Gráficos de macros
   - Progresso diário

---

## 🚀 O Que Podemos Implementar com Mealie

### 1. **Biblioteca de Receitas Profissionais** ⭐⭐⭐⭐⭐

**Funcionalidade:**
- Importar receitas de sites populares automaticamente
- Criar biblioteca de receitas validadas
- Categorizar por objetivo (emagrecer, ganhar massa, etc.)

**Implementação:**
```typescript
// src/services/mealie/mealieClient.ts
export class MealieClient {
  async importRecipe(url: string): Promise<Recipe> {
    // POST /api/recipes/create-url
    const response = await fetch(`${MEALIE_URL}/api/recipes/create-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MEALIE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url })
    });
    return response.json();
  }
  
  async getRecipes(filters: RecipeFilters): Promise<Recipe[]> {
    // GET /api/recipes?queryFilter=...
    const queryFilter = buildQueryFilter(filters);
    const response = await fetch(
      `${MEALIE_URL}/api/recipes?queryFilter=${queryFilter}`
    );
    return response.json();
  }
}
```

**Benefícios:**
- ✅ Receitas com instruções detalhadas
- ✅ Fotos profissionais
- ✅ Tempo de preparo e cozimento
- ✅ Dificuldade e porções

---

### 2. **Planejamento de Refeições Semanal** ⭐⭐⭐⭐⭐

**Funcionalidade:**
- Criar planos de refeições para 7 dias
- Sincronizar com metas calóricas do usuário
- Substituir refeições facilmente

**Implementação:**
```typescript
// src/services/mealie/mealPlanService.ts
export class MealPlanService {
  async createWeeklyPlan(
    userId: string,
    startDate: Date,
    calorieTarget: number
  ): Promise<MealPlan> {
    // 1. Buscar receitas que se encaixam nas calorias
    const recipes = await mealieClient.getRecipes({
      caloriesMin: calorieTarget * 0.2, // 20% das calorias
      caloriesMax: calorieTarget * 0.4  // 40% das calorias
    });
    
    // 2. Criar plano no Mealie
    const plan = await mealieClient.createMealPlan({
      startDate,
      endDate: addDays(startDate, 7),
      meals: generateMealSchedule(recipes, calorieTarget)
    });
    
    // 3. Salvar referência no MaxNutrition
    await supabase.from('meal_plans').insert({
      user_id: userId,
      mealie_plan_id: plan.id,
      start_date: startDate,
      target_calories: calorieTarget
    });
    
    return plan;
  }
}
```

**Benefícios:**
- ✅ Planejamento visual de 7 dias
- ✅ Variedade de receitas
- ✅ Fácil substituição
- ✅ Sincronização com metas

---

### 3. **Lista de Compras Inteligente** ⭐⭐⭐⭐

**Funcionalidade:**
- Gerar lista de compras automaticamente
- Agrupar ingredientes por categoria
- Marcar itens como comprados

**Implementação:**
```typescript
// src/services/mealie/shoppingListService.ts
export class ShoppingListService {
  async generateFromMealPlan(mealPlanId: string): Promise<ShoppingList> {
    // 1. Buscar receitas do plano
    const mealPlan = await mealieClient.getMealPlan(mealPlanId);
    
    // 2. Extrair ingredientes
    const ingredients = extractIngredients(mealPlan.recipes);
    
    // 3. Criar lista no Mealie
    const shoppingList = await mealieClient.createShoppingList({
      name: `Compras - Semana ${format(new Date(), 'dd/MM')}`,
      items: ingredients.map(ing => ({
        food: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        checked: false
      }))
    });
    
    return shoppingList;
  }
  
  async syncWithWhatsApp(listId: string): Promise<void> {
    // Enviar lista via WhatsApp
    const list = await mealieClient.getShoppingList(listId);
    const message = formatShoppingListMessage(list);
    await sendWhatsAppMessage(message);
  }
}
```

**Benefícios:**
- ✅ Lista automática de ingredientes
- ✅ Agrupamento por categoria
- ✅ Compartilhamento via WhatsApp
- ✅ Sincronização em tempo real

---

### 4. **Webhooks para Notificações** ⭐⭐⭐⭐

**Funcionalidade:**
- Notificar usuário sobre refeições do dia
- Lembrar de preparar ingredientes
- Alertas de compras

**Implementação:**
```typescript
// supabase/functions/mealie-webhook/index.ts
serve(async (req) => {
  const { event, data } = await req.json();
  
  switch (event) {
    case 'meal_plan.today':
      // Enviar notificação das refeições de hoje
      await sendDailyMealNotification(data);
      break;
      
    case 'shopping_list.updated':
      // Sincronizar lista de compras
      await syncShoppingList(data);
      break;
      
    case 'recipe.created':
      // Analisar nutrição da receita
      await analyzeRecipeNutrition(data);
      break;
  }
  
  return new Response(JSON.stringify({ success: true }));
});
```

**Benefícios:**
- ✅ Notificações automáticas
- ✅ Lembretes personalizados
- ✅ Integração com WhatsApp
- ✅ Sincronização em tempo real

---

### 5. **Análise Nutricional Avançada** ⭐⭐⭐⭐⭐

**Funcionalidade:**
- Enriquecer receitas do Mealie com dados TACO
- Calcular macros precisos
- Validar adequação às metas

**Implementação:**
```typescript
// src/services/mealie/nutritionEnricher.ts
export class NutritionEnricher {
  async enrichRecipe(mealieRecipe: MealieRecipe): Promise<EnrichedRecipe> {
    // 1. Extrair ingredientes
    const ingredients = mealieRecipe.recipeIngredient;
    
    // 2. Buscar no banco TACO
    const nutritionData = await Promise.all(
      ingredients.map(async (ing) => {
        const food = await searchTACO(ing.food.name);
        return {
          name: ing.food.name,
          quantity: ing.quantity,
          unit: ing.unit,
          calories: food.energia_kcal * (ing.quantity / 100),
          protein: food.proteina_g * (ing.quantity / 100),
          carbs: food.carboidrato_g * (ing.quantity / 100),
          fat: food.lipidios_g * (ing.quantity / 100),
          fiber: food.fibra_g * (ing.quantity / 100)
        };
      })
    );
    
    // 3. Calcular totais
    const totals = calculateTotals(nutritionData);
    
    // 4. Atualizar receita no Mealie com extras
    await mealieClient.updateRecipe(mealieRecipe.id, {
      extras: {
        maxnutrition_nutrition: totals,
        maxnutrition_validated: true,
        maxnutrition_taco_matched: nutritionData.length
      }
    });
    
    return { ...mealieRecipe, nutrition: totals };
  }
}
```

**Benefícios:**
- ✅ Dados nutricionais precisos (TACO)
- ✅ Validação automática
- ✅ Compatibilidade com metas
- ✅ Histórico de análises

---

### 6. **Importação de Receitas da Sofia** ⭐⭐⭐⭐⭐

**Funcionalidade:**
- Salvar cardápios gerados pela Sofia no Mealie
- Criar biblioteca pessoal do usuário
- Reutilizar receitas favoritas

**Implementação:**
```typescript
// src/services/mealie/sofiaIntegration.ts
export class SofiaToMealieSync {
  async saveSofiaRecipe(
    sofiaRecipe: SofiaGeneratedRecipe,
    userId: string
  ): Promise<MealieRecipe> {
    // 1. Converter formato Sofia → Mealie
    const mealieRecipe = {
      name: sofiaRecipe.title,
      description: sofiaRecipe.description,
      recipeIngredient: sofiaRecipe.ingredients.map(ing => ({
        food: { name: ing },
        quantity: parseQuantity(ing),
        unit: parseUnit(ing)
      })),
      recipeInstructions: sofiaRecipe.preparo
        .split(/\d+\./)
        .filter(s => s.trim())
        .map((step, i) => ({
          text: step.trim(),
          title: `Passo ${i + 1}`
        })),
      nutrition: {
        calories: sofiaRecipe.macros.calories.toString(),
        proteinContent: sofiaRecipe.macros.protein.toString(),
        carbohydrateContent: sofiaRecipe.macros.carbs.toString(),
        fatContent: sofiaRecipe.macros.fat.toString()
      },
      tags: [
        { name: 'Sofia' },
        { name: 'MaxNutrition' },
        { name: sofiaRecipe.objective }
      ],
      extras: {
        maxnutrition_user_id: userId,
        maxnutrition_generated_at: new Date().toISOString(),
        maxnutrition_objective: sofiaRecipe.objective
      }
    };
    
    // 2. Criar no Mealie
    const created = await mealieClient.createRecipe(mealieRecipe);
    
    // 3. Salvar referência
    await supabase.from('mealie_recipes').insert({
      user_id: userId,
      mealie_recipe_id: created.id,
      sofia_recipe_id: sofiaRecipe.id,
      created_at: new Date()
    });
    
    return created;
  }
}
```

**Benefícios:**
- ✅ Biblioteca pessoal de receitas
- ✅ Reutilização fácil
- ✅ Histórico de cardápios
- ✅ Compartilhamento com família

---

### 7. **Substituição Inteligente de Receitas** ⭐⭐⭐⭐

**Funcionalidade:**
- Sugerir alternativas com macros similares
- Considerar preferências e restrições
- Manter equilíbrio nutricional

**Implementação:**
```typescript
// src/services/mealie/recipeSubstitution.ts
export class RecipeSubstitutionService {
  async findAlternatives(
    originalRecipe: MealieRecipe,
    userPreferences: UserPreferences
  ): Promise<MealieRecipe[]> {
    // 1. Extrair características da receita original
    const targetNutrition = originalRecipe.nutrition;
    const targetTags = originalRecipe.tags.map(t => t.name);
    
    // 2. Buscar receitas similares
    const alternatives = await mealieClient.getRecipes({
      queryFilter: `
        (nutrition.calories >= ${targetNutrition.calories * 0.9} AND 
         nutrition.calories <= ${targetNutrition.calories * 1.1}) AND
        tags.name CONTAINS ANY [${targetTags.join(', ')}]
      `,
      perPage: 10
    });
    
    // 3. Filtrar por restrições
    const filtered = alternatives.filter(recipe => 
      !hasRestrictedIngredients(recipe, userPreferences.restrictions)
    );
    
    // 4. Ordenar por similaridade
    return filtered.sort((a, b) => 
      calculateSimilarity(a, originalRecipe) - 
      calculateSimilarity(b, originalRecipe)
    );
  }
}
```

**Benefícios:**
- ✅ Variedade sem perder metas
- ✅ Respeita restrições
- ✅ Mantém equilíbrio nutricional
- ✅ Evita monotonia

---

## 🏗️ Arquitetura de Integração

```
┌─────────────────────────────────────────────────────────────┐
│                      MaxNutrition App                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Sofia IA   │  │  Dashboard   │  │   WhatsApp   │      │
│  │  (Cardápios) │  │  Nutricional │  │  (Notific.)  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘               │
│                            │                                  │
│  ┌─────────────────────────▼──────────────────────────────┐  │
│  │         Mealie Integration Service                      │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  • Recipe Import/Export                          │  │  │
│  │  │  • Meal Plan Sync                                │  │  │
│  │  │  • Shopping List Generation                      │  │  │
│  │  │  • Nutrition Enrichment (TACO)                   │  │  │
│  │  │  • Webhook Handler                               │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └─────────────────────────┬──────────────────────────────┘  │
│                            │                                  │
└────────────────────────────┼──────────────────────────────────┘
                             │
                             │ REST API
                             │
┌────────────────────────────▼──────────────────────────────────┐
│                    Mealie Instance                             │
│                   (Self-Hosted / Cloud)                        │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Recipes    │  │  Meal Plans  │  │Shopping Lists│        │
│  │   Database   │  │   Calendar   │  │   Manager    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Webhooks   │  │  User Groups │  │   API Keys   │        │
│  │   Scheduler  │  │   Manager    │  │   Manager    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Tabelas do Banco de Dados

### Nova Tabela: `mealie_integration`

```sql
CREATE TABLE public.mealie_integration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mealie_url TEXT NOT NULL,
  mealie_api_key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_mealie_integration_user ON mealie_integration(user_id);
```

### Nova Tabela: `mealie_recipes`

```sql
CREATE TABLE public.mealie_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mealie_recipe_id TEXT NOT NULL,
  sofia_recipe_id UUID REFERENCES sofia_generated_recipes(id),
  recipe_name TEXT NOT NULL,
  calories INTEGER,
  protein_g NUMERIC,
  carbs_g NUMERIC,
  fat_g NUMERIC,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_mealie_recipes_user ON mealie_recipes(user_id);
CREATE INDEX idx_mealie_recipes_mealie_id ON mealie_recipes(mealie_recipe_id);
```

### Nova Tabela: `mealie_meal_plans`

```sql
CREATE TABLE public.mealie_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  mealie_plan_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_calories INTEGER,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_mealie_meal_plans_user ON mealie_meal_plans(user_id);
CREATE INDEX idx_mealie_meal_plans_dates ON mealie_meal_plans(start_date, end_date);
```

---

## 🚀 Roadmap de Implementação

### Fase 1: Fundação (Semana 1-2) ⭐⭐⭐⭐⭐
- [ ] Criar serviço de cliente Mealie
- [ ] Implementar autenticação via API key
- [ ] Criar tabelas no banco de dados
- [ ] Configurar webhooks básicos

### Fase 2: Receitas (Semana 3-4) ⭐⭐⭐⭐⭐
- [ ] Importar receitas de URLs
- [ ] Sincronizar receitas da Sofia
- [ ] Enriquecer com dados TACO
- [ ] Interface de biblioteca de receitas

### Fase 3: Planejamento (Semana 5-6) ⭐⭐⭐⭐
- [ ] Criar planos de refeições semanais
- [ ] Substituição inteligente de receitas
- [ ] Visualização de calendário
- [ ] Sincronização com metas

### Fase 4: Compras (Semana 7-8) ⭐⭐⭐⭐
- [ ] Gerar listas de compras
- [ ] Agrupar por categoria
- [ ] Integração com WhatsApp
- [ ] Marcar itens comprados

### Fase 5: Automação (Semana 9-10) ⭐⭐⭐
- [ ] Notificações diárias
- [ ] Lembretes de preparo
- [ ] Alertas de compras
- [ ] Relatórios semanais

---

## 💰 Custo e Infraestrutura

### Opção 1: Self-Hosted (Recomendado)
**Custo:** $5-10/mês
- VPS básico (1GB RAM, 1 CPU)
- Docker Compose
- Backup automático

### Opção 2: Mealie Cloud
**Custo:** $0 (beta gratuito)
- Hospedagem gerenciada
- Backups incluídos
- Atualizações automáticas

---

## 📈 Benefícios para o Usuário

1. **Variedade** ⭐⭐⭐⭐⭐
   - Milhares de receitas disponíveis
   - Importação de sites favoritos
   - Biblioteca pessoal crescente

2. **Praticidade** ⭐⭐⭐⭐⭐
   - Planejamento semanal automático
   - Lista de compras gerada
   - Notificações inteligentes

3. **Precisão** ⭐⭐⭐⭐⭐
   - Dados nutricionais validados (TACO)
   - Cálculos automáticos
   - Adequação às metas

4. **Organização** ⭐⭐⭐⭐
   - Calendário visual
   - Tags e categorias
   - Histórico completo

5. **Compartilhamento** ⭐⭐⭐⭐
   - Receitas com família
   - Listas de compras
   - Planos de refeições

---

## 🎯 Conclusão

A integração com Mealie **complementa perfeitamente** o MaxNutrition:

| MaxNutrition | Mealie | Resultado |
|--------------|--------|-----------|
| IA Sofia gera cardápios | Armazena receitas | Biblioteca crescente |
| Cálculo de macros | Planejamento semanal | Organização total |
| Dados TACO | Importação de sites | Variedade infinita |
| WhatsApp | Webhooks | Notificações automáticas |
| Dashboard | Calendário visual | Experiência completa |

**Prioridade:** ⭐⭐⭐⭐⭐ (ALTA)

**Esforço:** Médio (10 semanas)

**Impacto:** MUITO ALTO - Transforma MaxNutrition em solução completa de nutrição

---

## 📝 Próximos Passos

1. ✅ Configurar instância Mealie (Docker)
2. ✅ Criar API keys e testar endpoints
3. ✅ Implementar cliente TypeScript
4. ✅ Criar migrations do banco
5. ✅ Desenvolver interface de receitas
6. ✅ Integrar com Sofia
7. ✅ Testar com usuários beta

---

**Documentação Completa:** https://docs.mealie.io/
**GitHub:** https://github.com/mealie-recipes/mealie
**Demo:** https://demo.mealie.io/
