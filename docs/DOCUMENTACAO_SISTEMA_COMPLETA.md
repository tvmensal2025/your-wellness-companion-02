# 📚 DOCUMENTAÇÃO COMPLETA DO SISTEMA
## Your Wellness Companion - Instituto dos Sonhos

**Versão:** 1.0.0  
**Data:** 06/01/2025  
**Autor:** Sistema de Documentação Automática

---

## 📋 ÍNDICE

1. [Sistema de Geração de Cardápio (Mealie)](#1-sistema-de-geração-de-cardápio-mealie)
2. [Sistema de Missões Diárias](#2-sistema-de-missões-diárias)
3. [Sistema de Desafios](#3-sistema-de-desafios)
4. [Sistema de Sessões](#4-sistema-de-sessões)
5. [Sistema de Gamificação](#5-sistema-de-gamificação)
6. [Sistema de Comunidade](#6-sistema-de-comunidade)
7. [Sistema de Exercícios](#7-sistema-de-exercícios)
8. [Sistema Sofia (IA Nutricional)](#8-sistema-sofia-ia-nutricional)
9. [Sistema Dr. Vital](#9-sistema-dr-vital)
10. [Arquitetura e Infraestrutura](#10-arquitetura-e-infraestrutura)

---

# 1. SISTEMA DE GERAÇÃO DE CARDÁPIO (MEALIE)

## 1.1 Visão Geral

O sistema de geração de cardápio utiliza o **Mealie** como fonte de receitas reais e integra com **OpenAI GPT-4/GPT-5** para criar cardápios personalizados baseados em:
- Calorias diárias
- Restrições alimentares
- Preferências do usuário
- Objetivos nutricionais
- Número de dias

## 1.2 Arquitetura do Sistema

### Componentes Principais

1. **Frontend:**
   - `MealPlanGeneratorModal.tsx` - Modal de geração
   - `MealPlanGeneratorModalV2.tsx` - Versão melhorada
   - `useMealPlanGeneratorV2.ts` - Hook principal
   - `useIntelligentMealGenerator.ts` - Gerador inteligente com IA

2. **Backend (Edge Functions):**
   - `mealie-real/index.ts` - Função principal de geração
   - `generate-meal-plan-gpt4/index.ts` - Geração com IA

3. **Integração Mealie:**
   - API REST do Mealie
   - Cache de receitas (5 minutos)
   - Busca detalhada de receitas

## 1.3 Fluxo Completo de Geração

### Passo 1: Entrada de Parâmetros

```typescript
interface MealPlanParams {
  calorias: number;           // Ex: 2000 kcal
  dias: number;               // Ex: 7 dias
  restricoes: string[];       // Ex: ['gluten', 'lactose']
  preferencias: string[];     // Ex: ['frango', 'arroz']
  refeicoes_selecionadas?: string[]; // Ex: ['café da manhã', 'almoço']
  peso_kg?: number;           // Peso do usuário
  objetivo?: string;          // Ex: 'emagrecimento'
}
```

### Passo 2: Busca de Receitas no Mealie

**Localização:** `supabase/functions/mealie-real/index.ts`

```typescript
async function fetchMealieRecipes() {
  // 1. Verificar cache (5 minutos)
  if (cache válido) return cache;
  
  // 2. Buscar lista básica de receitas
  GET /api/recipes?limit=50
  
  // 3. Para cada receita, buscar detalhes completos
  for (receita in lista) {
    GET /api/recipes/{id}
    // Inclui: ingredientes, nutrição, instruções, imagens
  }
  
  // 4. Atualizar cache
  recipeCache = receitas_completas;
  cacheTimestamp = Date.now();
  
  return receitas_completas;
}
```

**Detalhes da Busca:**
- Limite inicial: 50 receitas
- Busca detalhada: uma por uma para obter dados completos
- Rate limiting: pausa de 100ms a cada 5 receitas
- Cache: 5 minutos de duração
- Dados obtidos:
  - Nome, descrição
  - Ingredientes completos
  - Informações nutricionais
  - Instruções de preparo
  - Tempo de preparo/cozimento
  - Porções
  - Imagens
  - Tags e categorias

### Passo 3: Aplicação de Filtros

#### 3.1 Normalização de Restrições

```typescript
function normalizeStringArray(input: any): string[] {
  // Caso 1: Array vazio
  if (array vazio) return [];
  
  // Caso 2: Array com string única separada por vírgula
  // Ex: ["gluten, lactose"] → ["gluten", "lactose"]
  if (array[0].includes(',')) {
    return array[0].split(',').map(trim).filter(empty);
  }
  
  // Caso 3: Array normal de strings
  // Ex: ["gluten", "lactose"]
  return array.map(trim).filter(empty);
  
  // Caso 4: String única
  // Ex: "gluten, lactose" → ["gluten", "lactose"]
  return string.split(',').map(trim).filter(empty);
}
```

#### 3.2 Mapeamento de Restrições

```typescript
const RESTRICTION_MAPPING = {
  'gluten': ['glúten', 'trigo', 'pão', 'macarrão', 'aveia', ...],
  'lactose': ['leite', 'queijo', 'iogurte', 'laticínio', ...],
  'peixe': ['peixe', 'salmão', 'atum', 'tilápia', ...],
  'carne': ['carne', 'boi', 'porco', 'vitela', ...],
  'vegetariano': ['carne', 'peixe', 'frango', 'porco', ...],
  'vegano': ['carne', 'peixe', 'leite', 'queijo', 'ovo', ...]
};
```

#### 3.3 Filtragem por Restrições

```typescript
function filterByRestrictions(recipes, restrictions) {
  const normalized = normalizeStringArray(restrictions);
  
  return recipes.filter(recipe => {
    const fullText = `
      ${recipe.name} 
      ${recipe.description} 
      ${recipe.tags} 
      ${recipe.categories} 
      ${recipe.ingredients}
    `.toLowerCase();
    
    for (restriction of normalized) {
      const keywords = RESTRICTION_MAPPING[restriction] || [restriction];
      
      for (keyword of keywords) {
        if (fullText.includes(keyword)) {
          return false; // REMOVER receita
        }
      }
    }
    
    return true; // MANTER receita
  });
}
```

**Logs Detalhados:**
- Receitas originais: X
- Após restrições: Y
- Receitas removidas: X - Y

### Passo 4: Priorização por Preferências

```typescript
function prioritizeByPreferences(recipes, preferences) {
  const normalized = normalizeStringArray(preferences);
  
  return recipes.map(recipe => {
    let score = 0;
    const fullText = `${recipe.name} ${recipe.description} ${recipe.ingredients}`.toLowerCase();
    
    for (preference of normalized) {
      const keywords = PREFERENCE_MAPPING[preference] || [preference];
      
      for (keyword of keywords) {
        if (fullText.includes(keyword)) {
          score += 15; // Pontos por preferência encontrada
        }
      }
    }
    
    return { ...recipe, score };
  }).sort((a, b) => b.score - a.score);
}
```

**Mapeamento de Preferências:**
```typescript
const PREFERENCE_MAPPING = {
  'frango': ['frango', 'galinha', 'peru', 'ave', ...],
  'peixe': ['peixe', 'salmão', 'atum', 'tilápia', ...],
  'arroz': ['arroz', 'integral', 'branco'],
  'quinoa': ['quinoa', 'quinua'],
  'legumes': ['legume', 'vegetal', 'verdura', 'brócolis', ...],
  'proteina': ['proteína', 'proteico', 'alto teor'],
  'light': ['light', 'leve', 'baixo', 'diet'],
  'integral': ['integral', 'fibra', 'grão']
};
```

### Passo 5: Distribuição de Calorias

```typescript
const CALORIE_DISTRIBUTION = {
  'café da manhã': 0.25,  // 25% das calorias diárias
  'almoço': 0.35,         // 35% das calorias diárias
  'lanche': 0.15,         // 15% das calorias diárias
  'jantar': 0.20,         // 20% das calorias diárias
  'ceia': 0.05            // 5% das calorias diárias
};

const MEAL_STRUCTURE = {
  'café da manhã': 'breakfast',
  'almoço': 'lunch',
  'lanche': 'snack',
  'jantar': 'dinner',
  'ceia': 'supper'
};
```

**Cálculo por Refeição:**
```typescript
const targetCalories = 2000; // Exemplo
const breakfastCalories = targetCalories * 0.25; // 500 kcal
const lunchCalories = targetCalories * 0.35;     // 700 kcal
const snackCalories = targetCalories * 0.15;     // 300 kcal
const dinnerCalories = targetCalories * 0.20;     // 400 kcal
const supperCalories = targetCalories * 0.05;     // 100 kcal
```

### Passo 6: Seleção de Receitas

```typescript
function selectRecipeForMeal(recipes, mealType, usedRecipes) {
  // 1. Filtrar receitas não usadas
  const available = recipes.filter(r => !usedRecipes.has(r.id));
  
  // 2. Calcular calorias alvo para a refeição
  const targetCalories = totalCalories * CALORIE_DISTRIBUTION[mealType];
  
  // 3. Filtrar receitas dentro da faixa calórica (±20%)
  const inRange = available.filter(r => {
    const calories = r.nutrition?.calories || 300;
    return calories >= targetCalories * 0.8 && 
           calories <= targetCalories * 1.2;
  });
  
  // 4. Se não houver na faixa, usar todas disponíveis
  const candidates = inRange.length > 0 ? inRange : available;
  
  // 5. Selecionar receita com maior score de preferência
  const selected = candidates.sort((a, b) => 
    (b.preferenceScore || 0) - (a.preferenceScore || 0)
  )[0];
  
  // 6. Adicionar ao conjunto de usadas
  usedRecipes.add(selected.id);
  
  return selected;
}
```

### Passo 7: Geração do Cardápio Completo

```typescript
function generateMealPlan(params) {
  const mealPlan = {};
  const usedRecipes = new Set();
  
  for (let day = 1; day <= params.dias; day++) {
    mealPlan[`dia_${day}`] = {
      data: calcularData(day),
      refeicoes: {}
    };
    
    // Para cada tipo de refeição
    for (mealType of ['café da manhã', 'almoço', 'lanche', 'jantar', 'ceia']) {
      const recipe = selectRecipeForMeal(
        filteredRecipes, 
        mealType, 
        usedRecipes
      );
      
      mealPlan[`dia_${day}`].refeicoes[mealType] = {
        receita: mapMealieRecipe(recipe, mealType),
        calorias: recipe.nutrition?.calories || 0,
        proteinas: recipe.nutrition?.protein || 0,
        carboidratos: recipe.nutrition?.carbs || 0,
        gorduras: recipe.nutrition?.fat || 0
      };
    }
  }
  
  return mealPlan;
}
```

### Passo 8: Mapeamento de Receita Mealie

```typescript
function mapMealieRecipe(raw, tipoRefeicao) {
  return {
    id: raw.id,
    nome: raw.name,
    descricao: raw.description || '',
    categoria: mapCategory(raw.recipeCategory),
    tags: mapTags(raw.tags),
    ingredientes: mapIngredients(raw.recipeIngredient),
    preparo: prepararInstrucoes(raw.recipeInstructions),
    nutricao: mapNutrition(raw.nutrition),
    tempo_preparo: raw.prepTime || '5 minutos',
    tempo_cozimento: raw.cookTime || '0 minutos',
    tempo_total: raw.totalTime || '30 minutos',
    porcoes: raw.recipeYield || '1 porção',
    image: raw.image || null,
    slug: raw.slug || null,
    source: 'mealie_real',
    tipo_refeicao: tipoRefeicao,
    
    // Informações extras
    tempo_preparo_min: parseInt(raw.prepTime) || 5,
    tempo_cozimento_min: parseInt(raw.cookTime) || 0,
    tempo_total_min: parseInt(raw.totalTime) || 30,
    porcoes_numero: parseInt(raw.recipeYield) || 1,
    ingredientes_detalhados: mapIngredients(raw.recipeIngredient),
    instrucoes_completas: prepararInstrucoes(raw.recipeInstructions)
  };
}
```

**Mapeamento de Ingredientes:**
```typescript
function mapIngredients(ingredients) {
  return ingredients.map(ing => ({
    nome: ing.food?.name || ing.title || ing.note || 'Ingrediente',
    quantidade: ing.quantity ? `${ing.quantity} ${ing.unit || ''}`.trim() : '1 unidade',
    observacao: ing.note || ing.food?.description || ''
  }));
}
```

**Mapeamento de Nutrição:**
```typescript
function mapNutrition(nutrition, description = '') {
  const defaultNutrition = {
    calorias: 300,
    proteinas: 20,
    carboidratos: 30,
    gorduras: 10,
    fibras: 5,
    sodio: 200
  };
  
  if (nutrition) {
    return {
      calorias: parseFloat(nutrition.calories || nutrition.calorieContent || defaultNutrition.calorias),
      proteinas: parseFloat(nutrition.proteinContent || nutrition.protein || defaultNutrition.proteinas),
      carboidratos: parseFloat(nutrition.carbohydrateContent || nutrition.carbs || defaultNutrition.carboidratos),
      gorduras: parseFloat(nutrition.fatContent || nutrition.fat || defaultNutrition.gorduras),
      fibras: parseFloat(nutrition.fiberContent || nutrition.fiber || defaultNutrition.fibras),
      sodio: parseFloat(nutrition.sodiumContent || nutrition.sodium || defaultNutrition.sodio)
    };
  }
  
  // Tentar extrair da descrição se não houver nutrição
  const caloriesMatch = description.match(/~?(\d+)\s*kcal/i);
  if (caloriesMatch) {
    defaultNutrition.calorias = parseInt(caloriesMatch[1]);
  }
  
  return defaultNutrition;
}
```

### Passo 9: Modo Inteligente com IA (GPT-4/GPT-5)

**Localização:** `useIntelligentMealGenerator.ts`

```typescript
const generateUniqueIntelligentPlan = async (params) => {
  // 1. Sempre usar GPT-5 para máxima qualidade
  const { data, error } = await supabase.functions.invoke(
    'generate-meal-plan-gpt4',
    {
      body: {
        ...params,
        userId: user.id,
        forceNewRecipes: true,    // Força receitas novas
        intelligentMode: true     // Ativa modo inteligente
      }
    }
  );
  
  // 2. Adaptar resposta para formato padrão
  const adaptedPlan = adaptIntelligentToStandard(data.cardapio);
  
  return adaptedPlan;
};
```

**Vantagens do Modo Inteligente:**
- Variedade garantida (receitas não repetidas)
- Rastreamento de ingredientes únicos
- Melhor distribuição nutricional
- Consideração de sazonalidade
- Combinações mais criativas

### Passo 10: Validação e Retorno

```typescript
// Validações realizadas:
1. ✅ Receitas não podem ser null/undefined
2. ✅ Cada refeição deve ter receita válida
3. ✅ Calorias totais devem estar dentro de ±10% do alvo
4. ✅ Todas as refeições selecionadas devem estar preenchidas
5. ✅ Receitas devem ter dados nutricionais

// Formato de retorno:
{
  success: true,
  cardapio: {
    dia_1: { refeicoes: {...} },
    dia_2: { refeicoes: {...} },
    ...
  },
  metadata: {
    total_calorias: 2000,
    ingredientes_rastreados: 45,
    receitas_unicas: 35,
    variedade_score: 0.85
  }
}
```

## 1.4 Tratamento de Erros

### Erros Comuns e Soluções

1. **Nenhuma receita encontrada no Mealie**
   - Verificar conexão com API
   - Verificar token de autenticação
   - Verificar se há receitas cadastradas

2. **Nenhuma receita após filtros**
   - Relaxar restrições
   - Adicionar mais receitas ao Mealie
   - Verificar mapeamento de restrições

3. **Calorias fora da faixa**
   - Ajustar tolerância (±20%)
   - Usar receitas mais próximas
   - Combinar múltiplas receitas pequenas

4. **Cache desatualizado**
   - Limpar cache manualmente
   - Aguardar 5 minutos
   - Forçar refresh

## 1.5 Variáveis de Ambiente Necessárias

```bash
# Mealie
MEALIE_BASE_URL=https://seu-mealie.com
MEALIE_API_TOKEN=seu_token_aqui

# OpenAI (para modo inteligente)
OPENAI_API_KEY=sk-...
VITE_OPENAI_API_KEY=sk-...
```

## 1.6 Exemplo de Uso Completo

```typescript
// 1. Importar hook
import { useMealPlanGeneratorV2 } from '@/hooks/useMealPlanGeneratorV2';

// 2. Usar no componente
const { generateMealPlan, isGenerating } = useMealPlanGeneratorV2();

// 3. Gerar cardápio
const handleGenerate = async () => {
  const result = await generateMealPlan({
    calorias: 2000,
    dias: 7,
    restricoes: ['gluten', 'lactose'],
    preferencias: ['frango', 'arroz', 'legumes'],
    peso_kg: 70,
    objetivo: 'emagrecimento'
  });
  
  if (result.success) {
    console.log('Cardápio gerado:', result.cardapio);
  }
};
```

---

# 2. SISTEMA DE MISSÕES DIÁRIAS

## 2.1 Visão Geral

O sistema de Missões Diárias é um questionário interativo que os usuários completam diariamente para:
- Rastrear hábitos de saúde
- Coletar dados de bem-estar
- Ganhar pontos de gamificação
- Manter engajamento diário

## 2.2 Estrutura de Dados

### Tabelas do Banco

#### 2.2.1 `daily_mission_sessions`
```sql
CREATE TABLE daily_mission_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  completed_sections TEXT[] DEFAULT [],
  total_points INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, date)
);
```

#### 2.2.2 `daily_responses`
```sql
CREATE TABLE daily_responses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  section TEXT NOT NULL,           -- 'morning', 'habits', 'mindset'
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  text_response TEXT,
  points_earned INTEGER DEFAULT 0,
  session_attempt_id TEXT,
  created_at TIMESTAMP
);
```

#### 2.2.3 `health_diary`
```sql
CREATE TABLE health_diary (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  date DATE NOT NULL,
  water_intake DECIMAL,
  sleep_hours DECIMAL,
  energy_level INTEGER,
  mood_rating INTEGER,
  stress_level INTEGER,
  notes TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, date)
);
```

## 2.3 Estrutura de Perguntas

### Tipos de Perguntas

1. **Scale (Escala)**
   ```typescript
   {
     id: 'water_intake',
     type: 'scale',
     question: 'Quantos copos de água você bebeu hoje?',
     section: 'morning',
     scale: {
       labels: ['0 copos', '1-2 copos', '3-4 copos', '5-6 copos', '7+ copos'],
       emojis: ['💧', '💧💧', '💧💧💧', '💧💧💧💧', '💧💧💧💧💧']
     },
     points: 10,
     tracking: 'water_intake',
     order: 1
   }
   ```

2. **Star Scale (Escala de Estrelas)**
   ```typescript
   {
     id: 'day_rating',
     type: 'star_scale',
     question: 'Como você avalia seu dia hoje?',
     section: 'mindset',
     scale: {
       labels: ['Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente']
     },
     points: 15,
     tracking: 'day_rating',
     order: 10
   }
   ```

3. **Multiple Choice (Múltipla Escolha)**
   ```typescript
   {
     id: 'breakfast_quality',
     type: 'multiple_choice',
     question: 'Qual foi a qualidade do seu café da manhã?',
     section: 'morning',
     options: ['Não tomei', 'Muito leve', 'Balanceado', 'Completo'],
     points: 10,
     order: 2
   }
   ```

4. **Yes/No (Sim/Não)**
   ```typescript
   {
     id: 'exercise_today',
     type: 'yes_no',
     question: 'Você fez exercício hoje?',
     section: 'habits',
     points: 20,
     order: 5
   }
   ```

5. **Text Input (Texto)**
   ```typescript
   {
     id: 'small_victory',
     type: 'text',
     question: 'Qual foi sua pequena vitória de hoje?',
     section: 'mindset',
     placeholder: 'Descreva algo positivo que aconteceu...',
     points: 15,
     tracking: 'small_victory',
     order: 11
   }
   ```

### Seções

1. **Morning (Manhã)**
   - Água consumida
   - Qualidade do café da manhã
   - Nível de energia
   - Sono da noite anterior

2. **Habits (Hábitos)**
   - Exercício realizado
   - Meditação/prática mindfulness
   - Qualidade das refeições
   - Atividades físicas

3. **Mindset (Mentalidade)**
   - Avaliação do dia
   - Pequena vitória
   - Nível de estresse
   - Gratidão

## 2.4 Fluxo Completo de Execução

### Passo 1: Carregamento Inicial

**Localização:** `useDailyMissionsFinal.ts`

```typescript
useEffect(() => {
  if (!user) return;
  
  const loadSession = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Buscar sessão do dia
    const { data } = await supabase
      .from('daily_mission_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();
    
    // 2. Se existe, carregar estado
    if (data) {
      setSession(data);
      setIsCompleted(data.is_completed);
      
      // 3. Carregar respostas existentes
      const { data: responses } = await supabase
        .from('daily_responses')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);
      
      // 4. Mapear respostas para estado
      const answersMap = {};
      responses.forEach(response => {
        answersMap[response.question_id] = response.answer;
      });
      setAnswers(answersMap);
    }
  };
  
  loadSession();
}, [user]);
```

### Passo 2: Responder Pergunta

```typescript
const handleAnswer = async (answer: string | number) => {
  // 1. Atualizar estado local
  setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));
  
  // 2. Salvar resposta no banco
  await saveAnswer(currentQuestion.id, answer);
  
  // 3. Avançar para próxima pergunta
  if (currentQuestionIndex < allQuestions.length - 1) {
    setCurrentQuestionIndex(prev => prev + 1);
  } else {
    // Última pergunta - completar missão
    await completeMission();
  }
};
```

### Passo 3: Salvar Resposta Individual

```typescript
const saveAnswer = async (questionId: string, answer: string | number) => {
  const today = new Date().toISOString().split('T')[0];
  const question = allQuestions.find(q => q.id === questionId);
  
  // 1. Inserir resposta (sempre nova para histórico)
  await supabase
    .from('daily_responses')
    .insert({
      user_id: user.id,
      date: today,
      section: question.section,
      question_id: questionId,
      answer: answer.toString(),
      points_earned: question.points,
      created_at: new Date().toISOString()
    });
  
  // 2. Se pergunta tem tracking, salvar dados específicos
  if (question.tracking) {
    await saveTrackingData(question.tracking, answer);
  }
};
```

### Passo 4: Salvar Dados de Tracking

```typescript
const saveTrackingData = async (trackingType: string, answer: string | number) => {
  const today = new Date().toISOString().split('T')[0];
  
  switch (trackingType) {
    case 'water_intake': {
      const waterAmount = calculateWaterIntake(answer.toString());
      // Ex: "3-4 copos" → 1.5L
      
      await supabase
        .from('health_diary')
        .upsert({
          user_id: user.id,
          date: today,
          water_intake: parseFloat(waterAmount.toString()),
          notes: `Água: ${waterAmount}L`
        }, {
          onConflict: 'user_id,date'
        });
      break;
    }
    
    case 'sleep_hours': {
      const sleepHours = calculateSleepHours(answer.toString());
      // Ex: "7-8 horas" → 7.5
      
      await supabase
        .from('health_diary')
        .upsert({
          user_id: user.id,
          date: today,
          sleep_hours: parseFloat(sleepHours.toString()),
          notes: `Sono: ${sleepHours} horas`
        }, {
          onConflict: 'user_id,date'
        });
      break;
    }
    
    case 'energy_level':
    case 'stress_level':
    case 'day_rating': {
      await supabase
        .from('health_diary')
        .upsert({
          user_id: user.id,
          date: today,
          energy_level: trackingType === 'energy_level' ? Number(answer) : undefined,
          mood_rating: trackingType === 'day_rating' ? Number(answer) : undefined,
          notes: `${trackingType}: ${answer}`
        }, {
          onConflict: 'user_id,date'
        });
      break;
    }
    
    case 'small_victory': {
      await supabase
        .from('health_diary')
        .upsert({
          user_id: user.id,
          date: today,
          notes: answer.toString(),
          mood_rating: 5
        }, {
          onConflict: 'user_id,date'
        });
      break;
    }
  }
};
```

**Funções de Cálculo:**
```typescript
function calculateWaterIntake(answer: string): number {
  // "0 copos" → 0L
  // "1-2 copos" → 0.75L (média)
  // "3-4 copos" → 1.05L
  // "5-6 copos" → 1.575L
  // "7+ copos" → 2.1L
  
  const mapping = {
    '0 copos': 0,
    '1-2 copos': 0.75,
    '3-4 copos': 1.05,
    '5-6 copos': 1.575,
    '7+ copos': 2.1
  };
  
  return mapping[answer] || 0;
}

function calculateSleepHours(answer: string): number {
  // "Menos de 5h" → 4.5
  // "5-6 horas" → 5.5
  // "7-8 horas" → 7.5
  // "9+ horas" → 9.5
  
  const mapping = {
    'Menos de 5h': 4.5,
    '5-6 horas': 5.5,
    '7-8 horas': 7.5,
    '9+ horas': 9.5
  };
  
  return mapping[answer] || 7;
}
```

### Passo 5: Completar Missão

```typescript
const completeMission = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  // 1. Calcular pontos totais
  const totalPoints = allQuestions.reduce((sum, q) => {
    return answers[q.id] !== undefined ? sum + q.points : sum;
  }, 0);
  
  // 2. Verificar se sessão existe
  const { data: existingSession } = await supabase
    .from('daily_mission_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();
  
  // 3. Atualizar ou criar sessão
  if (existingSession) {
    await supabase
      .from('daily_mission_sessions')
      .update({
        completed_sections: ['morning', 'habits', 'mindset'],
        total_points: totalPoints,
        is_completed: true
      })
      .eq('id', existingSession.id);
  } else {
    await supabase
      .from('daily_mission_sessions')
      .insert({
        user_id: user.id,
        date: today,
        completed_sections: ['morning', 'habits', 'mindset'],
        total_points: totalPoints,
        is_completed: true
      });
  }
  
  // 4. Atualizar estado
  setIsCompleted(true);
  setSession(updatedSession);
};
```

## 2.5 Interface do Usuário

### Componente Principal

**Localização:** `DailyMissionsFinal.tsx`

```typescript
export const DailyMissionsFinal = ({ user }) => {
  const {
    currentQuestion,
    currentQuestionIndex,
    progress,
    answers,
    isLoading,
    isCompleted,
    handleScaleAnswer,
    handleMultipleChoice,
    handleYesNo,
    handleTextInput,
    handleStarRating
  } = useDailyMissionsFinal({ user });
  
  // Renderizar pergunta baseada no tipo
  const renderQuestion = (question) => {
    switch (question.type) {
      case 'scale':
        return <ScaleQuestion question={question} onAnswer={handleScaleAnswer} />;
      case 'star_scale':
        return <StarScaleQuestion question={question} onAnswer={handleStarRating} />;
      case 'multiple_choice':
        return <MultipleChoiceQuestion question={question} onAnswer={handleMultipleChoice} />;
      case 'yes_no':
        return <YesNoQuestion question={question} onAnswer={handleYesNo} />;
      case 'text':
        return <TextQuestion question={question} onAnswer={handleTextInput} />;
    }
  };
  
  return (
    <div>
      {/* Barra de progresso */}
      <Progress value={progress} />
      
      {/* Pergunta atual */}
      {renderQuestion(currentQuestion)}
      
      {/* Indicador de progresso */}
      <span>{currentQuestionIndex + 1} de {allQuestions.length}</span>
    </div>
  );
};
```

### Tipos de Renderização

1. **Scale (Escala Visual)**
   - Botões grandes com emojis
   - Feedback visual ao selecionar
   - Labels descritivos

2. **Star Scale (Estrelas)**
   - 5 estrelas clicáveis
   - Preenchimento ao selecionar
   - Label dinâmico baseado na seleção

3. **Multiple Choice (Múltipla Escolha)**
   - Botões de opção
   - Checkmark ao selecionar
   - Layout vertical

4. **Yes/No (Sim/Não)**
   - Dois botões grandes
   - Verde para Sim, Vermelho para Não
   - Ícones visuais

5. **Text Input (Texto)**
   - Textarea expansível
   - Placeholder descritivo
   - Validação de mínimo de caracteres

## 2.6 Página de Conclusão

**Localização:** `MissionCompletePage.tsx`

Após completar todas as perguntas:
- Exibe pontos ganhos
- Mostra estatísticas do dia
- Animações de celebração
- Botão para voltar ao dashboard

---

# 3. SISTEMA DE DESAFIOS

## 3.1 Visão Geral

O sistema de Desafios permite que usuários participem de desafios individuais ou em grupo para:
- Alcançar objetivos específicos
- Competir com outros usuários
- Ganhar pontos e badges
- Manter motivação

## 3.2 Estrutura de Dados

### Tabelas do Banco

#### 3.2.1 `challenges`
```sql
CREATE TABLE challenges (
  id UUID PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(50) DEFAULT 'exercicio',
  difficulty VARCHAR(20) DEFAULT 'medio',
  duration_days INTEGER DEFAULT 7,
  points_reward INTEGER DEFAULT 100,
  badge_icon VARCHAR(10) DEFAULT '🏆',
  badge_name VARCHAR(100),
  instructions TEXT,
  tips TEXT[],
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_group_challenge BOOLEAN DEFAULT false,
  daily_log_target DECIMAL(10,2) DEFAULT 1,
  daily_log_unit VARCHAR(20) DEFAULT 'vez',
  daily_log_type VARCHAR(20) DEFAULT 'numeric',
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  image_url TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Categorias:**
- `exercicio` - Exercícios físicos
- `hidratacao` - Hidratação
- `nutricao` - Nutrição
- `mindfulness` - Meditação/Mindfulness
- `sono` - Sono
- `medicao` - Medições corporais
- `especial` - Desafios especiais

**Dificuldades:**
- `facil` - Fácil
- `medio` - Médio
- `dificil` - Difícil

#### 3.2.2 `challenge_participations`
```sql
CREATE TABLE challenge_participations (
  id UUID PRIMARY KEY,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  progress DECIMAL(10,2) DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  started_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  target_value DECIMAL(10,2),
  points_earned INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  daily_logs JSONB DEFAULT '[]',
  notes TEXT,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  UNIQUE(challenge_id, user_id)
);
```

**Status:**
- `active` - Em andamento
- `completed` - Concluído
- `abandoned` - Abandonado

#### 3.2.3 `challenge_daily_logs`
```sql
CREATE TABLE challenge_daily_logs (
  id UUID PRIMARY KEY,
  participation_id UUID REFERENCES challenge_participations(id) ON DELETE CASCADE,
  log_date DATE NOT NULL,
  value_logged TEXT,
  numeric_value DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participation_id, log_date)
);
```

## 3.3 Fluxo Completo de Participação

### Passo 1: Visualizar Desafios Disponíveis

**Localização:** `DesafiosSection.tsx`

```typescript
const loadChallenges = async () => {
  // 1. Buscar desafios ativos
  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });
  
  // 2. Buscar participações do usuário
  const { data: participations } = await supabase
    .from('challenge_participations')
    .select('*')
    .eq('user_id', user.id);
  
  // 3. Combinar dados
  const challengesWithParticipation = challenges.map(challenge => ({
    ...challenge,
    user_participation: participations.find(p => p.challenge_id === challenge.id)
  }));
  
  setDesafios(challengesWithParticipation);
};
```

### Passo 2: Participar de um Desafio

**Localização:** `useChallengeParticipation.ts`

```typescript
const participate = async (challengeId: string) => {
  // 1. Verificar se já está participando
  const { data: existing } = await supabase
    .from('challenge_participations')
    .select('id')
    .eq('user_id', user.id)
    .eq('challenge_id', challengeId)
    .maybeSingle();
  
  if (existing) {
    throw new Error('Você já está participando deste desafio');
  }
  
  // 2. Buscar dados do desafio
  const { data: challenge } = await supabase
    .from('challenges')
    .select('target_value, daily_log_target')
    .eq('id', challengeId)
    .single();
  
  // 3. Criar participação
  const { data } = await supabase
    .from('challenge_participations')
    .insert({
      user_id: user.id,
      challenge_id: challengeId,
      target_value: challenge.target_value || 1,
      progress: 0,
      status: 'active'
    })
    .select()
    .single();
  
  // 4. Atualizar contador de participantes
  await supabase.rpc('increment_challenge_participants', {
    challenge_id: challengeId
  });
  
  return data;
};
```

### Passo 3: Atualizar Progresso

```typescript
const updateProgress = async (challengeId: string, progress: number) => {
  // 1. Buscar participação
  const { data: participation } = await supabase
    .from('challenge_participations')
    .select('*, challenges(*)')
    .eq('user_id', user.id)
    .eq('challenge_id', challengeId)
    .single();
  
  // 2. Calcular se completou
  const isCompleted = progress >= 100;
  const challenge = participation.challenges;
  
  // 3. Atualizar participação
  const updateData = {
    progress: Math.min(progress, 100),
    status: isCompleted ? 'completed' : 'active',
    completed_at: isCompleted ? new Date().toISOString() : null,
    last_updated: new Date().toISOString()
  };
  
  // 4. Se completou, calcular pontos
  if (isCompleted && !participation.is_completed) {
    updateData.points_earned = challenge.points_reward;
    updateData.is_completed = true;
    
    // Adicionar pontos ao perfil
    await supabase.rpc('add_user_points', {
      user_id: user.id,
      points: challenge.points_reward
    });
  }
  
  // 5. Salvar atualização
  await supabase
    .from('challenge_participations')
    .update(updateData)
    .eq('id', participation.id);
  
  // 6. Registrar log diário
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('challenge_daily_logs')
    .upsert({
      participation_id: participation.id,
      log_date: today,
      numeric_value: progress,
      value_logged: `${progress}%`,
      notes: `Progresso atualizado para ${progress}%`
    }, {
      onConflict: 'participation_id,log_date'
    });
  
  return updateData;
};
```

### Passo 4: Função SQL de Atualização de Progresso

**Localização:** `corrigir-sistema-pontuacao-desafios.sql`

```sql
CREATE OR REPLACE FUNCTION update_challenge_progress(
  participation_id UUID,
  new_progress DECIMAL,
  notes TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  participation_record RECORD;
  challenge_record RECORD;
  points_to_award INTEGER;
  result JSON;
BEGIN
  -- 1. Buscar participação
  SELECT * INTO participation_record 
  FROM challenge_participations 
  WHERE id = participation_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Participação não encontrada';
  END IF;
  
  -- 2. Buscar desafio
  SELECT * INTO challenge_record 
  FROM challenges 
  WHERE id = participation_record.challenge_id;
  
  -- 3. Atualizar progresso
  UPDATE challenge_participations 
  SET 
    progress = new_progress,
    last_updated = NOW(),
    is_completed = (new_progress >= challenge_record.daily_log_target)
  WHERE id = participation_id;
  
  -- 4. Calcular pontos se completou
  IF new_progress >= challenge_record.daily_log_target 
     AND NOT participation_record.is_completed THEN
    points_to_award := challenge_record.points_reward;
    
    -- Atualizar pontos ganhos
    UPDATE challenge_participations 
    SET points_earned = points_to_award
    WHERE id = participation_id;
    
    -- Adicionar pontos ao perfil
    UPDATE profiles 
    SET 
      points = COALESCE(points, 0) + points_to_award,
      updated_at = NOW()
    WHERE user_id = participation_record.user_id;
  END IF;
  
  -- 5. Registrar log diário
  IF notes IS NOT NULL THEN
    INSERT INTO challenge_daily_logs (
      participation_id,
      log_date,
      value_logged,
      numeric_value,
      notes
    ) VALUES (
      participation_id,
      CURRENT_DATE,
      notes,
      new_progress,
      notes
    )
    ON CONFLICT (participation_id, log_date) DO UPDATE SET
      value_logged = notes,
      numeric_value = new_progress,
      notes = notes;
  END IF;
  
  -- 6. Retornar resultado
  result := JSON_BUILD_OBJECT(
    'participation_id', participation_id,
    'new_progress', new_progress,
    'is_completed', (new_progress >= challenge_record.daily_log_target),
    'points_awarded', COALESCE(points_to_award, 0),
    'message', 'Progresso atualizado com sucesso'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

### Passo 5: Função de Participação

```sql
CREATE OR REPLACE FUNCTION join_challenge(
  user_uuid UUID,
  challenge_uuid UUID
) RETURNS JSON AS $$
DECLARE
  challenge_data RECORD;
  participation_id UUID;
  result JSON;
BEGIN
  -- 1. Verificar se já está participando
  IF EXISTS (
    SELECT 1 FROM challenge_participations
    WHERE user_id = user_uuid AND challenge_id = challenge_uuid
  ) THEN
    RAISE EXCEPTION 'Usuário já está participando deste desafio';
  END IF;
  
  -- 2. Buscar dados do desafio
  SELECT * INTO challenge_data
  FROM challenges
  WHERE id = challenge_uuid AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Desafio não encontrado ou inativo';
  END IF;
  
  -- 3. Verificar limite de participantes
  IF challenge_data.max_participants IS NOT NULL AND
     challenge_data.current_participants >= challenge_data.max_participants THEN
    RAISE EXCEPTION 'Desafio atingiu o limite de participantes';
  END IF;
  
  -- 4. Criar participação
  INSERT INTO challenge_participations (
    user_id,
    challenge_id,
    target_value,
    progress,
    status
  ) VALUES (
    user_uuid,
    challenge_uuid,
    challenge_data.daily_log_target,
    0,
    'active'
  ) RETURNING id INTO participation_id;
  
  -- 5. Incrementar contador
  UPDATE challenges
  SET current_participants = current_participants + 1
  WHERE id = challenge_uuid;
  
  -- 6. Retornar resultado
  result := JSON_BUILD_OBJECT(
    'participation_id', participation_id,
    'challenge_id', challenge_uuid,
    'message', 'Participação criada com sucesso'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;
```

## 3.4 Interface do Usuário

### Listagem de Desafios

```typescript
const DesafiosSection = ({ user }) => {
  const [desafios, setDesafios] = useState([]);
  const [selectedTab, setSelectedTab] = useState('individuais');
  
  // Filtrar por tipo
  const desafiosIndividuais = desafios.filter(d => !d.is_group_challenge);
  const desafiosGrupo = desafios.filter(d => d.is_group_challenge);
  
  return (
    <Tabs value={selectedTab}>
      <TabsList>
        <TabsTrigger value="individuais">Individuais</TabsTrigger>
        <TabsTrigger value="grupo">Grupo</TabsTrigger>
      </TabsList>
      
      <TabsContent value="individuais">
        {desafiosIndividuais.map(desafio => (
          <ChallengeCard
            key={desafio.id}
            desafio={desafio}
            onParticipate={() => handleParticipate(desafio.id)}
            onUpdateProgress={() => handleUpdateProgress(desafio.id)}
          />
        ))}
      </TabsContent>
    </Tabs>
  );
};
```

### Card de Desafio

```typescript
const ChallengeCard = ({ desafio, onParticipate, onUpdateProgress }) => {
  const isParticipating = !!desafio.user_participation;
  const progress = desafio.user_participation?.progress || 0;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{desafio.title}</CardTitle>
          <Badge>{desafio.difficulty}</Badge>
        </div>
        <CardDescription>{desafio.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Progresso */}
        {isParticipating && (
          <div>
            <Progress value={progress} />
            <span>{progress}% concluído</span>
          </div>
        )}
        
        {/* Ações */}
        {!isParticipating ? (
          <Button onClick={onParticipate}>
            Participar
          </Button>
        ) : (
          <Button onClick={onUpdateProgress}>
            Atualizar Progresso
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
```

### Modal de Atualização de Progresso

**Localização:** `UpdateChallengeProgressModal.tsx`

```typescript
const UpdateChallengeProgressModal = ({ desafio, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [notes, setNotes] = useState('');
  
  const handleSubmit = async () => {
    // 1. Atualizar progresso
    await updateProgress(desafio.id, progress, notes);
    
    // 2. Se completou, mostrar celebração
    if (progress >= 100) {
      triggerCelebration();
      toast({
        title: "🎉 Desafio Concluído!",
        description: `Você ganhou ${desafio.points_reward} pontos!`
      });
    }
    
    onClose();
  };
  
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Atualizar Progresso</DialogTitle>
        </DialogHeader>
        
        <div>
          <label>Progresso (%)</label>
          <Input
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
          />
        </div>
        
        <div>
          <label>Notas (opcional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Como foi seu progresso hoje?"
          />
        </div>
        
        <Button onClick={handleSubmit}>
          Salvar Progresso
        </Button>
      </DialogContent>
    </Dialog>
  );
};
```

## 3.5 Ranking de Desafios em Grupo

```typescript
const loadChallengeRanking = async (challengeId: string) => {
  // 1. Buscar todas as participações do desafio
  const { data: participations } = await supabase
    .from('challenge_participations')
    .select(`
      *,
      profiles:user_id (
        full_name,
        avatar_url
      )
    `)
    .eq('challenge_id', challengeId)
    .order('progress', { ascending: false })
    .order('points_earned', { ascending: false });
  
  // 2. Calcular posições
  const ranking = participations.map((p, index) => ({
    position: index + 1,
    user: p.profiles,
    progress: p.progress,
    points: p.points_earned,
    is_current_user: p.user_id === user.id
  }));
  
  return ranking;
};
```

---

# 4. SISTEMA DE SESSÕES

## 4.1 Visão Geral

O sistema de Sessões permite que profissionais (psicólogos, coaches) enviem sessões personalizadas para usuários, incluindo:
- Conteúdo educacional
- Ferramentas interativas (Roda da Saúde, etc.)
- Questionários
- Materiais de apoio
- Ciclos de acompanhamento

## 4.2 Estrutura de Dados

### Tabelas do Banco

#### 4.2.1 `sessions`
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content JSONB,
  type VARCHAR(50),
  difficulty VARCHAR(20),
  estimated_time INTEGER DEFAULT 30,
  target_saboteurs TEXT[],
  tools TEXT[],
  tools_data JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false
);
```

**Tipos de Sessão:**
- `health_wheel_assessment` - Roda da Saúde
- `life_wheel_assessment` - Roda da Vida
- `symptoms_assessment` - Avaliação de Sintomas
- `educational` - Educacional
- `therapeutic` - Terapêutica
- `coaching` - Coaching

#### 4.2.2 `user_sessions`
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending',
  assigned_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  due_date TIMESTAMP,
  progress INTEGER DEFAULT 0,
  feedback TEXT,
  notes TEXT,
  auto_save_data JSONB,
  tools_data JSONB,
  last_activity TIMESTAMP,
  cycle_number INTEGER DEFAULT 1,
  next_available_date TIMESTAMP,
  is_locked BOOLEAN DEFAULT false,
  review_count INTEGER DEFAULT 0,
  UNIQUE(user_id, session_id, cycle_number)
);
```

**Status:**
- `pending` - Pendente (não iniciada)
- `in_progress` - Em progresso
- `completed` - Completa
- `locked` - Bloqueada (aguardando próximo ciclo)

#### 4.2.3 `session_materials`
```sql
CREATE TABLE session_materials (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('video', 'image', 'audio', 'pdf', 'text')),
  title VARCHAR(255),
  content TEXT,
  url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 4.2.4 `session_responses`
```sql
CREATE TABLE session_responses (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  response_data JSONB,
  rating INTEGER,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 4.3 Fluxo Completo de Sessão

### Passo 1: Atribuição de Sessão (Admin)

**Localização:** `SessionManagement.tsx` (Admin)

```typescript
const assignSession = async (sessionId: string, userId: string) => {
  // 1. Buscar dados da sessão
  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  
  // 2. Calcular data de vencimento (ex: 7 dias)
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  
  // 3. Criar atribuição
  const { data } = await supabase
    .from('user_sessions')
    .insert({
      user_id: userId,
      session_id: sessionId,
      status: 'pending',
      assigned_at: new Date().toISOString(),
      due_date: dueDate.toISOString(),
      cycle_number: 1,
      is_locked: false
    })
    .select()
    .single();
  
  return data;
};
```

### Passo 2: Carregamento de Sessões do Usuário

**Localização:** `UserSessions.tsx`

```typescript
const loadUserSessions = async () => {
  // 1. Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  
  // 2. Verificar/criar perfil
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();
  
  if (!profile) {
    // Criar perfil automaticamente
    const { data: newProfile } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0]
      })
      .select()
      .single();
    profile = newProfile;
  }
  
  // 3. Buscar sessões do usuário
  const { data, error } = await supabase
    .from('user_sessions')
    .select(`
      *,
      sessions (
        id, title, description, type, difficulty, 
        estimated_time, content, target_saboteurs,
        tools, tools_data
      )
    `)
    .eq('user_id', user.id)
    .order('assigned_at', { ascending: false });
  
  if (error) throw error;
  
  // 4. Processar dados
  const processedSessions = data.map(us => ({
    ...us,
    sessions: us.sessions,
    tools_data: us.tools_data || {},
    auto_save_data: us.auto_save_data || {}
  }));
  
  setUserSessions(processedSessions);
  
  // 5. Calcular estatísticas
  const stats = {
    pending: processedSessions.filter(s => s.status === 'pending').length,
    inProgress: processedSessions.filter(s => s.status === 'in_progress').length,
    completed: processedSessions.filter(s => s.status === 'completed').length,
    locked: processedSessions.filter(s => s.is_locked).length,
    total: processedSessions.length
  };
  
  setStats(stats);
};
```

### Passo 3: Iniciar Sessão

```typescript
const startSession = async (sessionId: string) => {
  const userSession = userSessions.find(us => us.id === sessionId);
  
  // 1. Verificar se é sessão interativa (Roda da Saúde, etc.)
  if (userSession?.sessions.type === 'health_wheel_assessment' || 
      userSession?.sessions.type === 'life_wheel_assessment') {
    setActiveHealthWheelSession(userSession);
    return;
  }
  
  // 2. Atualizar status
  const { error } = await supabase
    .from('user_sessions')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', sessionId);
  
  if (error) throw error;
  
  // 3. Recarregar sessões
  loadUserSessions();
};
```

### Passo 4: Sessões Interativas (Roda da Saúde)

**Localização:** `HealthWheelSession.tsx`

```typescript
const HealthWheelSession = ({ userSession, onComplete }) => {
  const [scores, setScores] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  
  // Áreas da roda da saúde
  const areas = [
    'Física', 'Emocional', 'Mental', 'Espiritual',
    'Social', 'Financeira', 'Profissional', 'Ambiental'
  ];
  
  const handleScoreChange = (area: string, score: number) => {
    setScores(prev => ({ ...prev, [area]: score }));
  };
  
  const handleComplete = async () => {
    setIsSaving(true);
    
    try {
      // 1. Salvar dados da roda
      const wheelData = {
        scores,
        completed_at: new Date().toISOString(),
        total_score: Object.values(scores).reduce((sum, s) => sum + s, 0) / areas.length
      };
      
      // 2. Atualizar sessão
      await supabase
        .from('user_sessions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          progress: 100,
          auto_save_data: wheelData,
          tools_data: {
            ...userSession.tools_data,
            health_wheel: wheelData
          }
        })
        .eq('id', userSession.id);
      
      // 3. Salvar resposta
      await supabase
        .from('session_responses')
        .insert({
          user_id: user.id,
          session_id: userSession.session_id,
          response_data: wheelData,
          rating: wheelData.total_score,
          feedback: 'Roda da Saúde completada'
        });
      
      // 4. Chamar callback
      onComplete();
      
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div>
      <h2>Roda da Saúde</h2>
      {areas.map(area => (
        <div key={area}>
          <label>{area}</label>
          <Slider
            value={scores[area] || 0}
            onValueChange={(value) => handleScoreChange(area, value[0])}
            min={0}
            max={10}
          />
          <span>{scores[area] || 0}/10</span>
        </div>
      ))}
      <Button onClick={handleComplete} disabled={isSaving}>
        Concluir Sessão
      </Button>
    </div>
  );
};
```

### Passo 5: Atualizar Progresso

```typescript
const updateProgress = async (sessionId: string, progress: number) => {
  const updateData = { 
    progress: Math.min(progress, 100),
    notes: `Progresso atualizado para ${progress}% em ${new Date().toLocaleString()}`,
    last_activity: new Date().toISOString()
  };
  
  // Se completou
  if (progress >= 100) {
    updateData.status = 'completed';
    updateData.completed_at = new Date().toISOString();
    updateData.feedback = 'Sessão concluída com sucesso';
  }
  
  await supabase
    .from('user_sessions')
    .update(updateData)
    .eq('id', sessionId);
  
  // Salvar log de atividade
  await saveSessionActivity(sessionId, `Progresso atualizado para ${progress}%`);
  
  loadUserSessions();
};
```

### Passo 6: Auto-save

```typescript
const autoSaveProgress = async (sessionId: string, progressData: any) => {
  const session = userSessions.find(s => s.id === sessionId);
  if (!session) return;
  
  await supabase
    .from('user_sessions')
    .update({
      progress: progressData.progress || 0,
      auto_save_data: progressData,
      last_activity: new Date().toISOString()
    })
    .eq('id', sessionId);
};
```

### Passo 7: Completar Ciclo

```typescript
const completeSessionCycle = async (sessionId: string) => {
  const userSession = userSessions.find(s => s.id === sessionId);
  
  // 1. Calcular próximo ciclo (ex: 15 dias)
  const nextAvailableDate = new Date();
  nextAvailableDate.setDate(nextAvailableDate.getDate() + 15);
  
  // 2. Atualizar sessão
  await supabase
    .from('user_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      progress: 100,
      cycle_number: userSession.cycle_number + 1,
      next_available_date: nextAvailableDate.toISOString(),
      is_locked: true
    })
    .eq('id', sessionId);
  
  // 3. Criar nova sessão para próximo ciclo (se necessário)
  if (userSession.cycle_number < maxCycles) {
    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_id: userSession.session_id,
        status: 'locked',
        cycle_number: userSession.cycle_number + 1,
        next_available_date: nextAvailableDate.toISOString(),
        is_locked: true
      });
  }
  
  loadUserSessions();
};
```

## 4.4 Ferramentas Integradas

### Tipos de Ferramentas

1. **Health Wheel (Roda da Saúde)**
   - 8 áreas de avaliação
   - Score de 0-10 por área
   - Visualização gráfica

2. **Life Wheel (Roda da Vida)**
   - Similar à Roda da Saúde
   - Foco em diferentes aspectos da vida

3. **Symptoms Assessment (Avaliação de Sintomas)**
   - Checklist de sintomas
   - Severidade por sintoma
   - Histórico temporal

### Integração de Ferramentas

```typescript
const openToolsModal = (userSession: UserSession) => {
  if (!userSession.sessions.tools || userSession.sessions.tools.length === 0) {
    toast({
      title: "Nenhuma ferramenta disponível",
      description: "Esta sessão não possui ferramentas configuradas."
    });
    return;
  }
  
  setSelectedSessionForTools(userSession);
  setShowToolsModal(true);
};

const handleSelectTool = (tool: SessionTool) => {
  if (!selectedSessionForTools) return;
  setActiveToolSession({ 
    session: selectedSessionForTools, 
    tool 
  });
  setShowToolsModal(false);
};

const handleToolComplete = async (toolResponse: ToolResponse) => {
  if (!activeToolSession) return;
  
  // Salvar resposta da ferramenta
  await supabase
    .from('user_sessions')
    .update({
      tools_data: {
        ...activeToolSession.session.tools_data,
        [activeToolSession.tool.id]: toolResponse
      }
    })
    .eq('id', activeToolSession.session.id);
  
  // Recarregar dados
  await loadUserSessions();
  
  setActiveToolSession(null);
};
```

## 4.5 Solicitação de Liberação Antecipada

```typescript
const requestEarlyRelease = async (sessionId: string, reason: string) => {
  const userSession = userSessions.find(s => s.id === sessionId);
  
  if (!userSession || !userSession.is_locked) {
    throw new Error('Sessão não está bloqueada');
  }
  
  // 1. Criar solicitação
  await supabase
    .from('early_release_requests')
    .insert({
      user_id: user.id,
      session_id: sessionId,
      reason: reason,
      status: 'pending',
      requested_at: new Date().toISOString()
    });
  
  // 2. Notificar administrador
  await supabase.functions.invoke('notify-admin', {
    body: {
      type: 'early_release_request',
      userId: user.id,
      sessionId: sessionId,
      reason: reason
    }
  });
  
  toast({
    title: "Solicitação Enviada",
    description: "Sua solicitação de liberação antecipada foi enviada para análise."
  });
};
```

## 4.6 Respostas e Avaliações

```typescript
const submitSessionResponse = async (sessionId: string, responseData: any) => {
  // 1. Salvar resposta
  const { data, error } = await supabase
    .from('session_responses')
    .insert({
      user_id: user.id,
      session_id: sessionId,
      response_data: responseData,
      rating: responseData.rating || null,
      feedback: responseData.feedback || null,
      created_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // 2. Atualizar sessão do usuário
  await supabase
    .from('user_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      progress: 100,
      feedback: responseData.feedback
    })
    .eq('user_id', user.id)
    .eq('session_id', sessionId);
  
  return data;
};
```

## 4.7 Exemplo de Uso Completo

```typescript
// 1. Importar componente
import { UserSessions } from '@/components/sessions/UserSessions';

// 2. Usar no componente pai
const SessionsPage = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <h1>Minhas Sessões</h1>
      <UserSessions user={user} />
    </div>
  );
};
```

---

# 5. SISTEMA DE GAMIFICAÇÃO

## 5.1 Visão Geral

O sistema de Gamificação é responsável por manter os usuários engajados através de:
- **Pontos (XP)** - Experiência acumulada por ações
- **Níveis** - Progressão baseada em XP total
- **Streaks** - Sequências de dias consecutivos
- **Badges** - Conquistas especiais
- **Rankings** - Competição entre usuários
- **Efeitos visuais** - Celebrações e animações

## 5.2 Estrutura de Dados

### Tabelas do Banco

#### 5.2.1 `user_points`
```sql
CREATE TABLE user_points (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER DEFAULT 0,
  daily_points INTEGER DEFAULT 0,
  weekly_points INTEGER DEFAULT 0,
  monthly_points INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  completed_challenges INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);
```

#### 5.2.2 `user_achievements`
```sql
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  achievement_name TEXT,
  achievement_type TEXT,
  description TEXT,
  xp_earned INTEGER DEFAULT 0,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);
```

#### 5.2.3 `achievement_tracking`
```sql
CREATE TABLE achievement_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  achievement_name TEXT,
  achievement_type TEXT,
  description TEXT,
  badge_icon TEXT,
  current_value INTEGER DEFAULT 0,
  target_value INTEGER,
  milestone_value INTEGER,
  progress_percentage DECIMAL,
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 5.3 Sistema de Pontos (XP)

### Hook Principal

**Localização:** `src/hooks/useUserXP.ts`

```typescript
interface XPData {
  currentXP: number;
  totalXP: number;
  level: number;
  xpToNextLevel: number;
  progressPercent: number;
  levelTitle: string;
}

const LEVEL_TITLES = [
  'Iniciante', 'Aprendiz', 'Praticante', 'Dedicado',
  'Experiente', 'Avançado', 'Especialista', 'Mestre',
  'Grão-Mestre', 'Lenda'
];

const calculateLevel = (totalXP: number) => {
  // Fórmula: cada nível requer 100 * nível XP
  // Nível 1: 0-100 XP
  // Nível 2: 100-300 XP
  // Nível 3: 300-600 XP
  let level = 1;
  let xpRequired = 100;
  let xpAccumulated = 0;
  
  while (totalXP >= xpAccumulated + xpRequired) {
    xpAccumulated += xpRequired;
    level++;
    xpRequired = 100 * level;
  }
  
  return {
    level,
    currentXP: totalXP - xpAccumulated,
    xpToNextLevel: xpRequired
  };
};

export const useUserXP = () => {
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [xpGained, setXpGained] = useState<number | null>(null);
  
  const fetchXP = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from('user_points')
      .select('total_points, experience')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      const totalXP = data.experience || data.total_points || 0;
      const { level, currentXP, xpToNextLevel } = calculateLevel(totalXP);
      
      setXpData({
        currentXP,
        totalXP,
        level,
        xpToNextLevel,
        progressPercent: (currentXP / xpToNextLevel) * 100,
        levelTitle: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
      });
    }
    
    setLoading(false);
  }, []);
  
  const addXP = useCallback(async (amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    // Atualizar no banco
    await supabase
      .from('user_points')
      .upsert({
        user_id: user.id,
        experience: (xpData?.totalXP || 0) + amount,
        total_points: (xpData?.totalXP || 0) + amount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    // Mostrar animação
    setXpGained(amount);
    setTimeout(() => setXpGained(null), 2000);
    
    // Recarregar dados
    await fetchXP();
  }, [xpData, fetchXP]);
  
  return { xpData, loading, addXP, xpGained, refetch: fetchXP };
};
```

### Componente XPBar

**Localização:** `src/components/gamification/XPBar.tsx`

```typescript
export const XPBar: React.FC = () => {
  const { xpData, loading, xpGained } = useUserXP();
  
  if (loading || !xpData) {
    return <Skeleton className="h-16 w-full" />;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-4"
    >
      {/* Badge de Nível */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{xpData.level}</span>
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between text-sm text-white/80">
            <span>{xpData.levelTitle}</span>
            <span>{xpData.currentXP}/{xpData.xpToNextLevel} XP</span>
          </div>
          
          {/* Barra de Progresso */}
          <div className="h-3 bg-white/20 rounded-full overflow-hidden mt-1">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
              initial={{ width: 0 }}
              animate={{ width: `${xpData.progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
      
      {/* Animação de XP Ganho */}
      <AnimatePresence>
        {xpGained && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 right-4 text-2xl font-bold text-yellow-300"
          >
            +{xpGained} XP
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
```

## 5.4 Sistema de Streaks

### Hook de Streaks

**Localização:** `src/hooks/useUserStreak.ts`

```typescript
interface StreakData {
  currentStreak: number;
  bestStreak: number;
  lastActivityDate: string | null;
  isActiveToday: boolean;
  streakExpiresIn: number; // horas
}

export const useUserStreak = () => {
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK);
  const [loading, setLoading] = useState(true);
  
  const fetchStreak = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data } = await supabase
      .from('user_points')
      .select('current_streak, best_streak, last_activity_date')
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      const today = new Date().toISOString().split('T')[0];
      const lastActivity = data.last_activity_date;
      const isActiveToday = lastActivity === today;
      
      // Calcular horas até expirar (meia-noite)
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const hoursUntilExpire = Math.ceil((midnight - now) / (1000 * 60 * 60));
      
      setStreakData({
        currentStreak: data.current_streak || 0,
        bestStreak: data.best_streak || 0,
        lastActivityDate: lastActivity,
        isActiveToday,
        streakExpiresIn: hoursUntilExpire
      });
    }
    
    setLoading(false);
  }, []);
  
  const updateStreak = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Calcular novo streak
    let newStreak = 1;
    if (streakData.lastActivityDate === yesterday) {
      newStreak = streakData.currentStreak + 1;
    } else if (streakData.lastActivityDate === today) {
      newStreak = streakData.currentStreak; // Já atualizou hoje
    }
    
    const newBestStreak = Math.max(newStreak, streakData.bestStreak);
    
    // Atualizar no banco
    await supabase
      .from('user_points')
      .upsert({
        user_id: user.id,
        current_streak: newStreak,
        best_streak: newBestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });
    
    await fetchStreak();
  }, [streakData, fetchStreak]);
  
  return { ...streakData, loading, updateStreak, refetch: fetchStreak };
};
```

### Componente StreakBar

**Localização:** `src/components/gamification/StreakBar.tsx`

```typescript
export const StreakBar: React.FC = () => {
  const { currentStreak, bestStreak, isActiveToday, streakExpiresIn, loading } = useUserStreak();
  
  // Milestones de streak
  const milestones = [7, 14, 30, 60, 100];
  const nextMilestone = milestones.find(m => m > currentStreak) || 100;
  const progress = (currentStreak / nextMilestone) * 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4"
    >
      <div className="flex items-center gap-4">
        {/* Ícone de Chama Animada */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
          className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center"
        >
          <Flame className={`w-8 h-8 ${isActiveToday ? 'text-yellow-300' : 'text-white/50'}`} />
        </motion.div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-white">{currentStreak} dias</span>
            <Badge className="bg-white/20 text-white">
              Recorde: {bestStreak}
            </Badge>
          </div>
          
          {/* Status */}
          <AnimatePresence mode="wait">
            {isActiveToday ? (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 text-sm text-white/80"
              >
                <CheckCircle className="w-4 h-4" />
                Ativo hoje!
              </motion.div>
            ) : (
              <motion.div
                key="expires"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 text-sm text-yellow-200"
              >
                <Clock className="w-4 h-4" />
                Expira em {streakExpiresIn}h
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Barra de Progresso para Próximo Milestone */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>Próximo: {nextMilestone} dias</span>
          <span>{currentStreak}/{nextMilestone}</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-yellow-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Milestones */}
        <div className="flex justify-between mt-2">
          {milestones.map(m => (
            <div
              key={m}
              className={`text-xs ${currentStreak >= m ? 'text-yellow-300' : 'text-white/50'}`}
            >
              {m}d
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
```

## 5.5 Sistema de Badges

### Interface de Badge

```typescript
export interface GameBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement: string;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}
```

### Componente BadgeSystem

**Localização:** `src/components/gamification/BadgeSystem.tsx`

```typescript
const tierColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-cyan-600',
  diamond: 'from-purple-400 to-purple-600'
};

const tierGlow = {
  bronze: 'shadow-amber-500/20',
  silver: 'shadow-gray-500/20',
  gold: 'shadow-yellow-500/30',
  platinum: 'shadow-cyan-500/30',
  diamond: 'shadow-purple-500/40'
};

export const BadgeSystem: React.FC<{ badges: GameBadge[] }> = ({ badges }) => {
  const earnedBadges = badges.filter(badge => badge.earned);
  const unEarnedBadges = badges.filter(badge => !badge.earned);
  
  return (
    <div className="space-y-6">
      {/* Badges Conquistados */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Conquistas Desbloqueadas ({earnedBadges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {earnedBadges.map((badge, index) => (
              <BadgeCard key={badge.id} badge={badge} index={index} />
            ))}
          </div>
        </div>
      )}
      
      {/* Próximas Conquistas */}
      {unEarnedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-muted-foreground" />
            Próximas Conquistas ({unEarnedBadges.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {unEarnedBadges.map((badge, index) => (
              <BadgeCard key={badge.id} badge={badge} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### Badges Disponíveis

| Badge | Tier | Requisito |
|-------|------|-----------|
| Primeiro Passo | Bronze | Completar primeira missão |
| Semana Perfeita | Silver | 7 dias de streak |
| Maratonista | Gold | 30 dias de streak |
| Centurião | Platinum | 100 dias de streak |
| Lenda | Diamond | 365 dias de streak |
| Hidratado | Bronze | Beber 2L de água por 7 dias |
| Atleta | Silver | Completar 50 treinos |
| Mestre | Gold | Alcançar nível 10 |
| Campeão | Platinum | Vencer 10 desafios |
| Guru | Diamond | 1000 pontos de XP |

## 5.6 Efeitos de Celebração

### Componente CelebrationEffect

**Localização:** `src/components/gamification/CelebrationEffect.tsx`

```typescript
interface CelebrationProps {
  trigger: boolean;
  type: 'confetti' | 'fireworks' | 'balloons' | 'stars';
  xpAmount?: number;
  message?: string;
  onComplete?: () => void;
}

export const CelebrationEffect: React.FC<CelebrationProps> = ({
  trigger,
  type,
  xpAmount,
  message,
  onComplete
}) => {
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      
      // Disparar efeito confetti
      if (type === 'confetti') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else if (type === 'fireworks') {
        // Múltiplos disparos
        const duration = 3000;
        const end = Date.now() + duration;
        
        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#ff0000', '#00ff00', '#0000ff']
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#ff0000', '#00ff00', '#0000ff']
          });
          
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
      
      // Auto-hide
      setTimeout(() => {
        setIsActive(false);
        onComplete?.();
      }, 3000);
    }
  }, [trigger, type, onComplete]);
  
  if (!isActive) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5 }}
        className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      >
        {/* Mensagem Central */}
        {message && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl shadow-xl"
          >
            <h2 className="text-2xl font-bold text-center">{message}</h2>
            {xpAmount && (
              <p className="text-center text-yellow-300 text-xl mt-2">
                +{xpAmount} XP
              </p>
            )}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

// Hook para usar celebrações
export const useCelebration = () => {
  const [celebrationState, setCelebrationState] = useState({
    trigger: false,
    type: 'confetti' as const,
    xpAmount: 0,
    message: ''
  });
  
  const celebrate = (options: Partial<typeof celebrationState>) => {
    setCelebrationState({
      trigger: true,
      type: options.type || 'confetti',
      xpAmount: options.xpAmount || 0,
      message: options.message || ''
    });
    
    setTimeout(() => {
      setCelebrationState(prev => ({ ...prev, trigger: false }));
    }, 100);
  };
  
  const CelebrationComponent = () => (
    <CelebrationEffect {...celebrationState} />
  );
  
  return { celebrate, CelebrationComponent };
};
```

## 5.7 Popup de Conquista

**Localização:** `src/components/gamification/AchievementPopup.tsx`

```typescript
interface AchievementPopupProps {
  show: boolean;
  type: 'level_up' | 'badge' | 'streak' | 'challenge' | 'xp';
  title: string;
  description: string;
  value?: number;
  onClose: () => void;
}

export const AchievementPopup: React.FC<AchievementPopupProps> = ({
  show,
  type,
  title,
  description,
  value,
  onClose
}) => {
  const { celebrate, CelebrationComponent } = useCelebration();
  
  useEffect(() => {
    if (show) {
      // Disparar celebração baseada no tipo
      const celebrationType = {
        level_up: 'fireworks',
        badge: 'confetti',
        streak: 'stars',
        challenge: 'fireworks',
        xp: 'confetti'
      }[type] || 'confetti';
      
      celebrate({
        type: celebrationType,
        message: title,
        xpAmount: value
      });
      
      // Auto-close após 5s
      setTimeout(onClose, 5000);
    }
  }, [show, type, title, value, celebrate, onClose]);
  
  const getIcon = () => {
    switch (type) {
      case 'level_up': return <Zap className="w-12 h-12 text-yellow-400" />;
      case 'badge': return <Award className="w-12 h-12 text-purple-400" />;
      case 'streak': return <Flame className="w-12 h-12 text-orange-400" />;
      case 'challenge': return <Trophy className="w-12 h-12 text-yellow-400" />;
      case 'xp': return <Star className="w-12 h-12 text-blue-400" />;
    }
  };
  
  const getGradient = () => {
    switch (type) {
      case 'level_up': return 'from-yellow-500 to-orange-600';
      case 'badge': return 'from-purple-500 to-pink-600';
      case 'streak': return 'from-orange-500 to-red-600';
      case 'challenge': return 'from-green-500 to-emerald-600';
      case 'xp': return 'from-blue-500 to-indigo-600';
    }
  };
  
  return (
    <>
      <CelebrationComponent />
      
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: -100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
            onClick={onClose}
          >
            <div className={`bg-gradient-to-r ${getGradient()} p-6 rounded-3xl shadow-2xl`}>
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"
                >
                  {getIcon()}
                </motion.div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white">{title}</h2>
                  <p className="text-white/80">{description}</p>
                  {value && (
                    <p className="text-yellow-300 font-bold text-xl mt-1">
                      +{value} XP
                    </p>
                  )}
                </div>
              </div>
              
              {/* Estrelas decorativas */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
```

---

# 6. SISTEMA DE COMUNIDADE

## 6.1 Visão Geral

O sistema de Comunidade permite interação social entre usuários:
- **Feed de Posts** - Compartilhamento de conquistas e progresso
- **Curtidas e Comentários** - Interações sociais
- **Stories** - Conteúdo temporário
- **Rankings** - Competição saudável
- **Grupos** - Comunidades temáticas

## 6.2 Estrutura de Dados

### Tabelas do Banco

#### 6.2.1 `community_posts`
```sql
CREATE TABLE community_posts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  location TEXT,
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  achievement_data JSONB,
  progress_data JSONB,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 6.2.2 `post_likes`
```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);
```

#### 6.2.3 `comments`
```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 6.3 Componente FeedPostCard

**Localização:** `src/components/community/FeedPostCard.tsx`

```typescript
interface Post {
  id: string;
  userName: string;
  userAvatar?: string;
  userLevel: string;
  content: string;
  imageUrl?: string;
  location?: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  achievementData?: {
    title: string;
    value: number;
    unit: string;
  };
  progressData?: {
    type: string;
    duration: string;
    calories: number;
  };
}

export const FeedPostCard: React.FC<FeedPostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);
  
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike(post.id);
  };
  
  return (
    <Card className="mb-4 overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex gap-3">
            <Avatar>
              <AvatarImage src={post.userAvatar} />
              <AvatarFallback>{post.userName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-semibold">{post.userName}</span>
              <Badge variant="secondary">{post.userLevel}</Badge>
              <div className="text-xs text-muted-foreground">
                {formatTimeAgo(post.createdAt)}
                {post.location && <span> • {post.location}</span>}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p>{post.content}</p>
        
        {/* Card de Conquista */}
        {post.achievementData && (
          <div className="bg-gradient-to-r from-blue-100 to-blue-50 p-4 rounded-xl mt-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Conquista Desbloqueada!</span>
            </div>
            <p className="text-2xl font-bold">
              {post.achievementData.value} {post.achievementData.unit}
            </p>
            <p className="text-sm">{post.achievementData.title}</p>
          </div>
        )}
        
        {/* Card de Progresso */}
        {post.progressData && (
          <div className="bg-blue-50 p-4 rounded-xl mt-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{post.progressData.type}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-xs text-muted-foreground">Duração</p>
                <p className="font-semibold">{post.progressData.duration}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Calorias</p>
                <p className="font-semibold">{post.progressData.calories} kcal</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Imagem */}
        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt="Post"
            className="w-full rounded-xl mt-3 max-h-96 object-cover"
          />
        )}
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline">#{tag}</Badge>
            ))}
          </div>
        )}
        
        {/* Ações */}
        <div className="flex items-center justify-between border-t border-b py-2 mt-4">
          <Button variant="ghost" onClick={handleLike}>
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            Curtir
          </Button>
          <Button variant="ghost" onClick={() => setShowComments(!showComments)}>
            <MessageCircle className="w-5 h-5" />
            Comentar
          </Button>
          <Button variant="ghost" onClick={() => onShare(post.id)}>
            <Share2 className="w-5 h-5" />
            Compartilhar
          </Button>
        </div>
        
        {/* Seção de Comentários */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {/* Input de comentário e lista */}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
```

## 6.4 Ranking da Comunidade

**Localização:** `src/components/gamification/RealRankingCard.tsx`

```typescript
export const RealRankingCard: React.FC = () => {
  const { ranking, currentUserRank, loading } = useRealRanking();
  
  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (position === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (position === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="font-bold">{position}</span>;
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Ranking da Comunidade
        </CardTitle>
        {currentUserRank && (
          <Badge>Sua posição: #{currentUserRank}</Badge>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {ranking.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                user.isCurrentUser ? 'bg-primary/10 border border-primary' : 'bg-muted/50'
              }`}
            >
              <div className="w-8 flex justify-center">
                {getRankIcon(index + 1)}
              </div>
              
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  Nível {user.level} • {user.streak} dias de streak
                </p>
              </div>
              
              <div className="text-right">
                <p className="font-bold text-primary">{user.xp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP</p>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

---

# 7. SISTEMA DE EXERCÍCIOS

## 7.1 Visão Geral

O sistema de Exercícios oferece:
- **Biblioteca de exercícios** com vídeos
- **Planos de treino** personalizados
- **Geração por IA** baseada em objetivos
- **Tracking de atividades**
- **Integração Google Fit**
- **Histórico e estatísticas**

## 7.2 Estrutura de Dados

### Tabelas do Banco

#### 7.2.1 `exercises_library`
```sql
CREATE TABLE exercises_library (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  muscle_group TEXT,
  difficulty TEXT,
  equipment_needed TEXT[],
  sets INTEGER,
  reps TEXT,
  rest_time TEXT,
  instructions TEXT[],
  tips TEXT[],
  youtube_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7.2.2 `exercise_tracking`
```sql
CREATE TABLE exercise_tracking (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  exercise_type TEXT,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  distance_km DECIMAL,
  steps INTEGER,
  heart_rate_avg INTEGER,
  notes TEXT,
  date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 7.2.3 `workout_plans`
```sql
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  plan_name TEXT,
  goal TEXT,
  difficulty TEXT,
  location TEXT,
  duration_weeks INTEGER,
  workouts_per_week INTEGER,
  current_week INTEGER DEFAULT 1,
  plan_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 7.3 Dashboard de Exercícios

**Localização:** `src/components/exercise/ExerciseDashboard.tsx`

```typescript
export const ExerciseDashboard: React.FC<{ user: User | null }> = ({ user }) => {
  const { activeProgram, completeWorkout, workoutLogs, loading } = useExerciseProgram(user?.id);
  const { weeklyPlan, todayWorkout, refreshPlan } = useExercisesLibrary(location, goal, difficulty);
  
  const [activeWorkout, setActiveWorkout] = useState<WeeklyPlan | null>(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  
  const handleStartWorkout = (day: WeeklyPlan) => {
    setActiveWorkout(day);
    setIsWorkoutModalOpen(true);
  };
  
  const handleWorkoutComplete = async (completedExercises: string[]) => {
    if (!activeProgram) {
      toast({
        title: "Treino Concluído! 🎉",
        description: `Você completou ${completedExercises.length} exercícios!`
      });
      return;
    }
    
    await completeWorkout(
      activeProgram.id,
      activeProgram.current_week,
      new Date().getDay(),
      activeWorkout?.title || "Treino",
      { exercises: completedExercises }
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Header com informações do programa */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-8"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
            <Flame className="w-10 h-10 text-white" />
          </div>
          <div>
            <Badge className="bg-white/20 text-white">
              {activeProgram ? "MEU PROGRAMA" : "TREINO DO DIA"}
            </Badge>
            <h2 className="text-3xl font-bold text-white">
              {activeProgram?.plan_name || "Sua melhor versão começa agora! 💪"}
            </h2>
          </div>
        </div>
        
        {/* Estatísticas */}
        {activeProgram && (
          <div className="flex gap-4 mt-4">
            <div className="bg-white/15 rounded-xl px-4 py-3">
              <Target className="w-4 h-4 text-white" />
              <p className="text-xs text-white/70">Progresso</p>
              <p className="text-lg font-bold text-white">
                {activeProgram.completed_workouts}/{activeProgram.total_workouts}
              </p>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-3">
              <Clock className="w-4 h-4 text-white" />
              <p className="text-xs text-white/70">Treinos/Sem</p>
              <p className="text-lg font-bold text-white">{activeProgram.workouts_per_week}x</p>
            </div>
          </div>
        )}
      </motion.section>
      
      {/* Plano Semanal */}
      <WeeklyPlanView
        weeklyPlan={weeklyPlan}
        todayWorkout={todayWorkout}
        onStartWorkout={handleStartWorkout}
        onExerciseClick={handleExerciseClick}
      />
      
      {/* Modal de Treino Ativo */}
      {activeWorkout && (
        <ActiveWorkoutModal
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          workout={activeWorkout}
          onComplete={handleWorkoutComplete}
        />
      )}
    </div>
  );
};
```

## 7.4 Geração de Treino com IA

### Edge Function

**Localização:** `supabase/functions/generate-ai-workout/index.ts`

```typescript
Deno.serve(async (req) => {
  const { userId, goal, level, location, daysPerWeek, duration } = await req.json();
  
  // Buscar perfil do usuário
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  // Buscar biblioteca de exercícios
  const { data: exercises } = await supabase
    .from('exercises_library')
    .select('*')
    .eq('is_active', true);
  
  // Gerar plano com IA
  const prompt = `
    Crie um plano de treino personalizado:
    - Objetivo: ${goal}
    - Nível: ${level}
    - Local: ${location}
    - Dias por semana: ${daysPerWeek}
    - Duração: ${duration} semanas
    
    Use apenas exercícios desta biblioteca: ${JSON.stringify(exercises.map(e => e.name))}
    
    Retorne em JSON com a estrutura:
    {
      weeks: [
        {
          weekNumber: 1,
          days: [
            {
              dayNumber: 1,
              dayName: "Segunda",
              isRestDay: false,
              muscleGroups: ["Peito", "Tríceps"],
              exercises: ["Nome do exercício 1", "Nome do exercício 2"]
            }
          ]
        }
      ]
    }
  `;
  
  const response = await fetch('https://lovable.dev/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  const aiResponse = await response.json();
  const plan = JSON.parse(aiResponse.content);
  
  // Salvar plano no banco
  await supabase
    .from('workout_plans')
    .insert({
      user_id: userId,
      plan_name: `Plano ${goal} - ${level}`,
      goal,
      difficulty: level,
      location,
      duration_weeks: duration,
      workouts_per_week: daysPerWeek,
      plan_data: plan
    });
  
  return new Response(JSON.stringify({ success: true, plan }));
});
```

## 7.5 Integração Google Fit

```typescript
// Conexão com Google Fit
const connectGoogleFit = async () => {
  const { data, error } = await supabase.functions.invoke('google-fit-connect', {
    body: { userId: user.id }
  });
  
  if (data?.authUrl) {
    window.open(data.authUrl, '_blank');
  }
};

// Sincronizar dados
const syncGoogleFitData = async () => {
  const { data } = await supabase.functions.invoke('google-fit-sync', {
    body: { 
      userId: user.id,
      startDate: lastSyncDate,
      endDate: new Date().toISOString()
    }
  });
  
  if (data?.activities) {
    // Inserir atividades no tracking
    for (const activity of data.activities) {
      await supabase
        .from('exercise_tracking')
        .insert({
          user_id: user.id,
          exercise_type: activity.type,
          duration_minutes: activity.duration,
          calories_burned: activity.calories,
          steps: activity.steps,
          date: activity.date
        });
    }
  }
};
```

---

# 8. SISTEMA SOFIA (IA NUTRICIONAL)

## 8.1 Visão Geral

Sofia é a assistente nutricional virtual do Instituto dos Sonhos, especializada em:
- **Chat nutricional** com memória persistente
- **Análise de imagens** de refeições
- **Sugestões personalizadas** baseadas no perfil
- **Base de conhecimento** com 391 protocolos

## 8.2 Identidade e Personalidade

**Nome:** Sofia  
**Papel:** Nutricionista virtual do Instituto dos Sonhos  
**Personalidade:**
- Super amorosa, carinhosa e empática 💚
- Usa emojis naturalmente
- Como uma amiga querida que se importa
- Demonstra alegria genuína ao ajudar
- Respostas curtas (2-4 frases)

## 8.3 Edge Functions

### 8.3.1 `sofia-enhanced-memory`

Chat principal com memória de longo prazo.

```typescript
Deno.serve(async (req) => {
  const { message, userId, context } = await req.json();
  
  // 1. Buscar contexto completo do usuário
  const userContext = await getUserCompleteContext(userId);
  
  // 2. Buscar histórico de conversas
  const { data: history } = await supabase
    .from('chat_conversations')
    .select('messages')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  
  // 3. Buscar base de conhecimento relevante
  const { data: knowledge } = await supabase
    .from('base_de_conhecimento_sofia')
    .select('*')
    .textSearch('conteudo', message.split(' ').slice(0, 5).join(' | '));
  
  // 4. Construir prompt
  const systemPrompt = `
    Você é Sofia, nutricionista virtual do Instituto dos Sonhos.
    
    PERSONALIDADE:
    - Super amorosa, carinhosa e empática 💚
    - Use emojis naturalmente
    - Respostas curtas (2-4 frases)
    - Como uma amiga querida
    
    CONTEXTO DO USUÁRIO:
    ${JSON.stringify(userContext)}
    
    CONHECIMENTO RELEVANTE:
    ${knowledge?.map(k => k.conteudo).join('\n')}
    
    HISTÓRICO RECENTE:
    ${history?.flatMap(h => h.messages).slice(-20)}
  `;
  
  // 5. Chamar IA
  const response = await fetch('https://lovable.dev/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });
  
  const aiResponse = await response.json();
  
  // 6. Salvar na memória
  await supabase
    .from('chat_conversations')
    .upsert({
      user_id: userId,
      messages: [...(history?.[0]?.messages || []), 
        { role: 'user', content: message },
        { role: 'assistant', content: aiResponse.content }
      ],
      updated_at: new Date().toISOString()
    });
  
  return new Response(JSON.stringify({ 
    message: aiResponse.content,
    tokens: aiResponse.usage?.total_tokens 
  }));
});
```

### 8.3.2 `sofia-image-analysis`

Análise de imagens de refeições.

```typescript
Deno.serve(async (req) => {
  const { imageUrl, userId, mealType } = await req.json();
  
  // 1. Analisar imagem com IA
  const response = await fetch('https://lovable.dev/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro', // Pro para imagens
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: `
            Analise esta imagem de refeição e retorne em JSON:
            {
              "foods": ["lista de alimentos identificados"],
              "portions": {"alimento": "porção estimada"},
              "calories": número total estimado,
              "protein": gramas de proteína,
              "carbs": gramas de carboidratos,
              "fat": gramas de gordura,
              "fiber": gramas de fibra,
              "healthScore": 1-10,
              "suggestions": ["sugestões de melhoria"],
              "positives": ["pontos positivos da refeição"]
            }
          `},
          { type: 'image_url', image_url: imageUrl }
        ]
      }]
    })
  });
  
  const analysis = JSON.parse((await response.json()).content);
  
  // 2. Salvar análise
  await supabase
    .from('food_analysis')
    .insert({
      user_id: userId,
      meal_type: mealType,
      foods_detected: analysis.foods,
      total_calories: analysis.calories,
      macros: {
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        fiber: analysis.fiber
      },
      health_score: analysis.healthScore,
      image_url: imageUrl,
      analysis_data: analysis
    });
  
  // 3. Gerar resposta amigável da Sofia
  const sofiaMessage = `
    Que refeição linda, amor! 💚 
    
    Identifiquei: ${analysis.foods.join(', ')}.
    
    📊 Estimativa nutricional:
    • Calorias: ~${analysis.calories} kcal
    • Proteínas: ${analysis.protein}g
    • Carboidratos: ${analysis.carbs}g
    
    ${analysis.positives.length > 0 ? `✨ Adorei: ${analysis.positives[0]}` : ''}
    ${analysis.suggestions.length > 0 ? `💡 Dica: ${analysis.suggestions[0]}` : ''}
  `;
  
  return new Response(JSON.stringify({
    message: sofiaMessage,
    analysis
  }));
});
```

## 8.4 Base de Conhecimento

### Categorias (391 protocolos)

| Categoria | Quantidade |
|-----------|------------|
| Combinações visuais | 20 |
| Sintomas com alimentos | 34 |
| Estados emocionais | 36 |
| Atividades físicas | 32 |
| Faixas etárias | 14 |
| Categorias de gênero | 4 |
| Objetivos fitness | 24 |
| Alimentos medicinais | 35 |
| Doenças com abordagem nutricional | 31 |
| Substituições inteligentes | 52 |
| Funcionalidades avançadas | 70+ |

### Tabela

```sql
CREATE TABLE base_de_conhecimento_sofia (
  id UUID PRIMARY KEY,
  categoria TEXT NOT NULL,
  topico TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  referencias TEXT[],
  tags TEXT[],
  relevancia INTEGER DEFAULT 5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

# 9. SISTEMA DR. VITAL

## 9.1 Visão Geral

Dr. Vital é o médico virtual do Instituto dos Sonhos:
- **Consulta virtual** com análise completa do paciente
- **Análise de exames** médicos
- **Relatórios semanais** de saúde
- **Memória de longo prazo** sobre o paciente

## 9.2 Identidade e Personalidade

**Nome:** Dr. Vital  
**Papel:** Médico virtual especialista do Instituto dos Sonhos  
**Personalidade:**
- Profissional e acolhedor
- Linguagem simples e humana
- Não faz diagnósticos ou prescrições
- Orientações gerais de saúde

## 9.3 Contexto do Paciente

O Dr. Vital tem acesso a 30+ tabelas de dados:

```typescript
interface PatientContext {
  // Dados básicos
  profile: ProfileData;
  anamnesis: AnamnesisData;
  physicalData: PhysicalData;
  
  // Histórico e medições
  weight_trend: WeightMeasurement[];
  nutrition_tracking: NutritionRecord[];
  food_analysis: FoodAnalysis[];
  exercise_history: ExerciseRecord[];
  water_tracking: WaterRecord[];
  sleep_tracking: SleepRecord[];
  mood_tracking: MoodRecord[];
  
  // Metas e engajamento
  all_goals: Goal[];
  daily_responses: DailyResponse[];
  missions: Mission[];
  achievements: Achievement[];
  
  // Medicamentos e documentos
  prescriptions: Prescription[];
  supplements: Supplement[];
  medical_documents: MedicalDocument[];
  
  // Dispositivos
  heart_rate_data: HeartRateData[];
  google_fit_data: GoogleFitData[];
  
  // Análises
  weekly_analyses: WeeklyAnalysis[];
  
  // Memória
  long_term_memory: MemorySummary;
}
```

## 9.4 Edge Functions

### 9.4.1 `dr-vital-chat`

```typescript
Deno.serve(async (req) => {
  const { message, userId } = await req.json();
  
  // 1. Buscar contexto completo (30+ tabelas)
  const context = await getUserCompleteContext(userId);
  
  // 2. Buscar memória de longo prazo
  const { data: memory } = await supabase
    .from('dr_vital_memory')
    .select('*')
    .eq('user_id', userId);
  
  const memoryMap = Object.fromEntries(memory.map(m => [m.key, m.value]));
  
  // 3. Construir prompt
  const systemPrompt = `
    Você é Dr. Vital, médico virtual do Instituto dos Sonhos.
    
    REGRAS IMPORTANTES:
    - Nunca faça diagnósticos
    - Nunca prescreva medicamentos
    - Sempre recomende consultar um médico para decisões sérias
    - Use linguagem simples e acolhedora
    
    CONTEXTO COMPLETO DO PACIENTE:
    Nome: ${context.profile?.full_name}
    Idade: ${context.physicalData?.age} anos
    Peso atual: ${context.weight_trend?.[0]?.weight_kg} kg
    Altura: ${context.physicalData?.height_cm} cm
    
    HISTÓRICO RECENTE (7 dias):
    - Média de sono: ${calculateAverage(context.sleep_tracking, 'hours')}h
    - Média de água: ${calculateAverage(context.water_tracking, 'ml')}ml
    - Exercícios: ${context.exercise_history?.length || 0} sessões
    - Humor médio: ${calculateAverage(context.mood_tracking, 'rating')}/10
    
    METAS ATIVAS:
    ${context.all_goals?.filter(g => g.status === 'active').map(g => `- ${g.title}`).join('\n')}
    
    MEDICAMENTOS:
    ${context.prescriptions?.map(p => `- ${p.name}: ${p.dosage}`).join('\n') || 'Nenhum registrado'}
    
    MEMÓRIA DE LONGO PRAZO:
    ${memoryMap.long_term_summary || 'Primeira consulta'}
    
    Alergias conhecidas: ${memoryMap.allergies || 'Nenhuma registrada'}
    Condições crônicas: ${memoryMap.chronic_flags || 'Nenhuma registrada'}
  `;
  
  // 4. Chamar IA
  const response = await fetch('https://lovable.dev/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-pro',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 1024,
      temperature: 0.6
    })
  });
  
  const aiResponse = await response.json();
  
  // 5. Atualizar memória se necessário
  await updateDrVitalMemory(userId, message, aiResponse.content);
  
  return new Response(JSON.stringify({ 
    message: aiResponse.content 
  }));
});
```

### 9.4.2 `dr-vital-weekly-report`

```typescript
Deno.serve(async (req) => {
  const { userId } = await req.json();
  
  // 1. Buscar dados da semana
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const [weights, nutrition, exercises, sleep, mood, water] = await Promise.all([
    supabase.from('weight_measurements').select('*').eq('user_id', userId).gte('created_at', weekAgo),
    supabase.from('nutrition_tracking').select('*').eq('user_id', userId).gte('created_at', weekAgo),
    supabase.from('exercise_tracking').select('*').eq('user_id', userId).gte('date', weekAgo.split('T')[0]),
    supabase.from('sleep_tracking').select('*').eq('user_id', userId).gte('date', weekAgo.split('T')[0]),
    supabase.from('mood_tracking').select('*').eq('user_id', userId).gte('date', weekAgo.split('T')[0]),
    supabase.from('water_tracking').select('*').eq('user_id', userId).gte('date', weekAgo.split('T')[0])
  ]);
  
  // 2. Calcular métricas
  const report = {
    period: `${weekAgo.split('T')[0]} a ${new Date().toISOString().split('T')[0]}`,
    weight_analysis: {
      start: weights.data?.[weights.data.length - 1]?.weight_kg,
      end: weights.data?.[0]?.weight_kg,
      change: (weights.data?.[0]?.weight_kg - weights.data?.[weights.data.length - 1]?.weight_kg).toFixed(1),
      trend: weights.data?.[0]?.weight_kg < weights.data?.[weights.data.length - 1]?.weight_kg ? 'descendo' : 'subindo'
    },
    nutrition_score: calculateNutritionScore(nutrition.data),
    exercise_days: exercises.data?.length || 0,
    sleep_average: calculateAverage(sleep.data, 'hours'),
    mood_average: calculateAverage(mood.data, 'rating'),
    water_average: calculateAverage(water.data, 'ml')
  };
  
  // 3. Gerar insights com IA
  const insights = await generateWeeklyInsights(report);
  
  // 4. Salvar relatório
  await supabase
    .from('weekly_analyses')
    .insert({
      user_id: userId,
      period: report.period,
      analysis_data: report,
      ai_insights: insights
    });
  
  return new Response(JSON.stringify({ report, insights }));
});
```

---

# 10. ARQUITETURA E INFRAESTRUTURA

## 10.1 Stack Tecnológico

### Frontend
- **React 18** - Biblioteca UI
- **Vite** - Build tool
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilos utilitários
- **Framer Motion** - Animações
- **Radix UI** - Componentes acessíveis
- **TanStack Query** - Gerenciamento de estado

### Backend (Lovable Cloud)
- **Supabase** - Backend as a Service
  - PostgreSQL - Banco de dados
  - Auth - Autenticação
  - Storage - Armazenamento de arquivos
  - Edge Functions - Lógica serverless
  - Realtime - WebSockets

### Integrações
- **Lovable AI** - Gateway de IA (Gemini, GPT-5)
- **Mealie** - Receitas
- **Google Fit** - Dados de saúde
- **Stripe** - Pagamentos

## 10.2 Estrutura de Pastas

```
/
├── src/
│   ├── components/          # Componentes React
│   │   ├── gamification/    # Sistema de gamificação
│   │   ├── community/       # Sistema de comunidade
│   │   ├── exercise/        # Sistema de exercícios
│   │   ├── sessions/        # Sistema de sessões
│   │   ├── daily-missions/  # Missões diárias
│   │   ├── challenges/      # Desafios
│   │   ├── chat/            # Chat Sofia/Dr. Vital
│   │   └── ui/              # Componentes base (shadcn)
│   │
│   ├── hooks/               # Hooks customizados
│   │   ├── useUserXP.ts
│   │   ├── useUserStreak.ts
│   │   ├── useExerciseProgram.ts
│   │   └── ...
│   │
│   ├── pages/               # Páginas da aplicação
│   │   ├── AuthPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── ...
│   │
│   ├── integrations/        # Integrações
│   │   └── supabase/
│   │       ├── client.ts    # Cliente Supabase
│   │       └── types.ts     # Tipos gerados
│   │
│   └── lib/                 # Utilitários
│
├── supabase/
│   ├── functions/           # Edge Functions (54 funções)
│   │   ├── sofia-enhanced-memory/
│   │   ├── dr-vital-chat/
│   │   ├── generate-ai-workout/
│   │   └── ...
│   │
│   ├── migrations/          # Migrações SQL
│   └── config.toml          # Configuração Supabase
│
└── docs/                    # Documentação
    ├── ARCHITECTURE.md
    ├── AI_SYSTEMS.md
    └── DOCUMENTACAO_SISTEMA_COMPLETA.md
```

## 10.3 Edge Functions (54 funções)

### Categorias

| Categoria | Funções | Descrição |
|-----------|---------|-----------|
| **IA** | 12 | Sofia, Dr. Vital, análises |
| **Nutrição** | 8 | Cardápios, análise de alimentos |
| **Exercícios** | 5 | Geração de treinos, sync |
| **Gamificação** | 4 | Pontos, badges, rankings |
| **Notificações** | 6 | Email, push, WhatsApp |
| **Integrações** | 10 | Google Fit, Mealie, Stripe |
| **Utilitários** | 9 | Logs, backups, cron jobs |

### Lista Completa

```
supabase/functions/
├── sofia-enhanced-memory/      # Chat Sofia com memória
├── sofia-image-analysis/       # Análise de imagens
├── sofia-deterministic/        # Respostas padronizadas
├── dr-vital-chat/              # Chat Dr. Vital
├── dr-vital-enhanced/          # Dr. Vital aprimorado
├── dr-vital-weekly-report/     # Relatórios semanais
├── analyze-medical-exam/       # Análise de exames
├── generate-meal-plan-gpt4/    # Cardápio com IA
├── mealie-real/                # Integração Mealie
├── generate-ai-workout/        # Geração de treinos
├── improve-exercises/          # Melhoria de exercícios
├── google-fit-connect/         # Conexão Google Fit
├── google-fit-sync/            # Sincronização dados
├── send-email/                 # Envio de emails
├── goal-notifications/         # Notificações de metas
├── stripe-webhook/             # Webhook Stripe
├── create-checkout/            # Criar checkout
├── gpt-chat/                   # Gateway GPT
├── smart-scale-sync/           # Sync balança smart
├── export-health-report/       # Exportar relatório PDF
└── ... (34 outras)
```

## 10.4 Banco de Dados (238+ tabelas)

### Categorias Principais

| Categoria | Tabelas | Exemplos |
|-----------|---------|----------|
| Usuários | 15 | profiles, user_anamnesis, user_points |
| Gamificação | 12 | achievements, badges, challenges |
| Nutrição | 25 | meal_plans, food_analysis, recipes |
| Exercícios | 18 | exercise_tracking, workout_plans |
| Saúde | 30 | weight_measurements, sleep_tracking |
| Comunidade | 8 | community_posts, comments, likes |
| Sessões | 6 | sessions, user_sessions, responses |
| IA | 15 | chat_conversations, ai_usage_logs |
| Configurações | 20 | app_settings, ai_configurations |

## 10.5 Storage Buckets

| Bucket | Uso | Políticas |
|--------|-----|-----------|
| avatars | Fotos de perfil | Público leitura, privado escrita |
| community-uploads | Imagens de posts | Público leitura, auth escrita |
| chat-images | Imagens de chat | Privado por usuário |
| course-thumbnails | Miniaturas de cursos | Público leitura |
| medical-documents | Exames médicos | Privado por usuário |
| exercise-videos | Vídeos de exercícios | Público leitura |

## 10.6 Segurança

### Row Level Security (RLS)

Todas as tabelas com dados de usuário têm RLS habilitado:

```sql
-- Exemplo: usuário só vê seus próprios dados
CREATE POLICY "Users can view own data"
ON user_points
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
ON user_points
FOR UPDATE
USING (auth.uid() = user_id);
```

### Autenticação

- Email/senha com confirmação
- Google OAuth (planejado)
- Tokens JWT gerenciados pelo Supabase

### Secrets

| Secret | Uso |
|--------|-----|
| OPENAI_API_KEY | Fallback IA |
| MEALIE_API_TOKEN | Integração Mealie |
| GOOGLE_FIT_CLIENT_ID | Google Fit |
| STRIPE_SECRET_KEY | Pagamentos |
| RESEND_API_KEY | Emails |

## 10.7 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    React + Vite + TypeScript                    │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Dashboard │  │Gamific.  │  │Community │  │ Chats    │        │
│  │  Page    │  │Components│  │   Feed   │  │Sofia/Dr. │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
│       └─────────────┼─────────────┼─────────────┘               │
│                     │             │                              │
│              ┌──────┴─────────────┴──────┐                      │
│              │   Supabase Client SDK     │                      │
│              │   @supabase/supabase-js   │                      │
│              └────────────┬──────────────┘                      │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOVABLE CLOUD                               │
│                   (Supabase Backend)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                │
│  │ PostgreSQL │  │   Auth     │  │  Storage   │                │
│  │  Database  │  │  Service   │  │  Buckets   │                │
│  │ 238 tables │  │ JWT/OAuth  │  │  6 buckets │                │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘                │
│        │               │               │                        │
│        └───────────────┼───────────────┘                        │
│                        │                                         │
│  ┌─────────────────────┴─────────────────────┐                  │
│  │           EDGE FUNCTIONS (54)              │                  │
│  ├────────────────────────────────────────────┤                  │
│  │ • sofia-enhanced-memory                    │                  │
│  │ • dr-vital-chat                            │                  │
│  │ • generate-ai-workout                      │                  │
│  │ • mealie-real                              │                  │
│  │ • google-fit-sync                          │                  │
│  │ • ... 49 outras                            │                  │
│  └─────────────────────┬──────────────────────┘                  │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRAÇÕES EXTERNAS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ Lovable AI │  │   Mealie   │  │ Google Fit │  │  Stripe   │ │
│  │  Gateway   │  │   Server   │  │    API     │  │ Payments  │ │
│  │ Gemini/GPT │  │  Receitas  │  │ Atividades │  │ Checkout  │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 10.8 Fluxo de Dados

```
┌──────────────────────────────────────────────────────────────────┐
│                       COLETA DE DADOS                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Manual            Dispositivos           Análises IA            │
│  ┌─────┐           ┌─────────┐           ┌────────┐              │
│  │Forms│           │Google   │           │ Sofia  │              │
│  │Daily│           │  Fit    │           │ Image  │              │
│  │Check│           │ Xiaomi  │           │Analysis│              │
│  └──┬──┘           └────┬────┘           └───┬────┘              │
│     │                   │                    │                    │
└─────┼───────────────────┼────────────────────┼────────────────────┘
      │                   │                    │
      ▼                   ▼                    ▼
┌──────────────────────────────────────────────────────────────────┐
│                      BANCO DE DADOS                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ profiles, user_anamnesis, weight_measurements,             │  │
│  │ nutrition_tracking, food_analysis, exercise_tracking,      │  │
│  │ sleep_tracking, mood_tracking, google_fit_data, ...        │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬──────────────────────────────────┘
                                │
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                   PROCESSAMENTO DE IA                             │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │             user-complete-context.ts                       │   │
│  │  • Busca dados de 30+ tabelas                              │   │
│  │  • Calcula completude (0-100%)                             │   │
│  │  • Gera resumo contextual                                  │   │
│  └────────────────────────┬──────────────────────────────────┘   │
│                           ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │               System Prompt + Contexto                     │   │
│  └────────────────────────┬──────────────────────────────────┘   │
│                           ▼                                       │
│  ┌───────────────────────────────────────────────────────────┐   │
│  │                Lovable AI Gateway                          │   │
│  │  Gemini 2.5 Pro → GPT-5 → Fallback                        │   │
│  └────────────────────────┬──────────────────────────────────┘   │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│                    RESPOSTA PERSONALIZADA                         │
│  • Baseada em TODOS os dados do usuário                          │
│  • Considera histórico e tendências                              │
│  • Memória de conversas anteriores                               │
│  • Estilo e tom personalizados                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

# APÊNDICE

## A. Variáveis de Ambiente

```bash
# Supabase (automático)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...

# Mealie
MEALIE_BASE_URL=https://mealie.exemplo.com
MEALIE_API_TOKEN=xxx

# OpenAI (fallback)
OPENAI_API_KEY=sk-xxx

# Google Fit
GOOGLE_FIT_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Email
RESEND_API_KEY=re_xxx
```

## B. Comandos Úteis

```bash
# Desenvolvimento local
npm run dev

# Build produção
npm run build

# Deploy Edge Functions
supabase functions deploy

# Reset banco de dados
supabase db reset

# Gerar tipos TypeScript
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

## C. Links Úteis

- [Lovable Docs](https://docs.lovable.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/docs/primitives)

---

**Última atualização:** 06/01/2026  
**Versão da documentação:** 1.0.0  
**Total de linhas:** ~4700
