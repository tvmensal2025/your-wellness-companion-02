# 🔄 FLUXO COMPLETO: DE ONDE VÊM OS DADOS DE NUTRIÇÃO

## 📊 **VISÃO GERAL**

Este documento explica o caminho completo dos dados desde a foto tirada pelo usuário até aparecer no dashboard.

---

## 🎯 **FLUXO PASSO A PASSO**

### **1️⃣ Usuário Tira Foto via WhatsApp**

```
Usuário → WhatsApp → Foto de almoço (pão + presunto)
```

**O que acontece:**
- Usuário envia foto para o número do WhatsApp
- WhatsApp recebe a imagem e envia para o webhook

---

### **2️⃣ Webhook Recebe a Imagem**

**Arquivo:** `supabase/functions/whatsapp-nutrition-webhook/index.ts`

```typescript
// Webhook recebe mensagem do WhatsApp
const message = req.body.entry[0].changes[0].value.messages[0];

if (message.type === 'image') {
  const imageUrl = await downloadWhatsAppImage(message.image.id);
  
  // Chama a edge function de análise
  await analyzeImage(imageUrl, userId);
}
```

**O que acontece:**
- Webhook baixa a imagem do WhatsApp
- Salva a imagem no MinIO (storage)
- Chama a edge function `sofia-image-analysis`

---

### **3️⃣ Edge Function Analisa a Imagem**

**Arquivo:** `supabase/functions/sofia-image-analysis/index.ts`

#### **3.1 - Detecção com YOLO**
```typescript
// YOLO detecta objetos na imagem
const yoloResult = await tryYoloDetect(imageUrl);
// Resultado: ["pão", "presunto"]
```

#### **3.2 - Análise com Gemini AI**
```typescript
// Gemini identifica alimentos específicos
const geminiResult = await analyzeWithEnhancedAI(imageUrl);
// Resultado: 
// [
//   {nome: "pão de forma prensado", quantidade: 60},
//   {nome: "presunto fatiado", quantidade: 30}
// ]
```

#### **3.3 - Busca Dados Nutricionais (Tabela TACO)**
```typescript
// Para cada alimento, busca na tabela nutrition_foods (TACO)
const tacoData = await supabase
  .from('nutrition_foods')
  .select('*')
  .ilike('canonical_name', '%pão de forma%');

// Calcula nutrientes por quantidade
const calories = (tacoData.kcal / 100) * 60; // 60g de pão
const protein = (tacoData.protein_g / 100) * 60;
// ...
```

#### **3.4 - Calcula Totais**
```typescript
const totalCalories = 247; // soma de todos os alimentos
const totalProtein = 9.8;
const totalCarbs = 40.2;
const totalFat = 5.2;
```

---

### **4️⃣ Salva no Banco de Dados**

**Arquivo:** `supabase/functions/sofia-image-analysis/index.ts` (linha 1930-1970)

```typescript
const analysisRecord = {
  user_id: userId,                    // ID do usuário
  user_name: "Rafael Ferreira Dias",  // Nome do usuário
  image_url: imageUrl,                 // URL da imagem no MinIO
  
  // ✅ DADOS PRINCIPAIS (onde o dashboard busca)
  foods_detected: [                    // JSONB com lista de alimentos
    {nome: "pão de forma prensado", quantidade: 60},
    {nome: "presunto fatiado", quantidade: 30}
  ],
  total_calories: 247,                 // Calorias totais
  total_protein: 9.8,                  // Proteínas totais
  total_carbs: 40.2,                   // Carboidratos totais
  total_fat: 5.2,                      // Gorduras totais
  total_fiber: 0,                      // Fibras totais
  
  // Metadados
  meal_type: 'almoco',                 // Tipo de refeição (normalizado)
  meal_date: '2026-01-17',             // Data da refeição
  meal_time: '14:30:43',               // Hora da refeição
  sofia_analysis: "Oi Rafael! ...",    // Texto da análise
  
  // Status
  confirmed_by_user: false,            // Usuário ainda não confirmou
  confirmation_status: 'pending',      // Aguardando confirmação
  confirmation_prompt_sent: true,      // Prompt enviado
  image_deleted: false,                // Imagem ainda não foi deletada
  
  created_at: new Date().toISOString()
};

// Insere no banco
await supabase
  .from('sofia_food_analysis')
  .insert(analysisRecord);
```

**Tabela:** `sofia_food_analysis`

**Estrutura:**
```sql
CREATE TABLE sofia_food_analysis (
  id UUID PRIMARY KEY,
  user_id UUID,
  user_name TEXT,
  image_url TEXT,
  
  -- ✅ DADOS NUTRICIONAIS (onde o dashboard busca)
  foods_detected JSONB,        -- Lista de alimentos com quantidades
  total_calories INTEGER,      -- Calorias totais
  total_protein NUMERIC,       -- Proteínas totais (g)
  total_carbs NUMERIC,         -- Carboidratos totais (g)
  total_fat NUMERIC,           -- Gorduras totais (g)
  total_fiber NUMERIC,         -- Fibras totais (g)
  
  -- Metadados
  meal_type TEXT,              -- 'breakfast', 'lunch', 'snack', 'dinner'
  meal_date DATE,              -- Data da refeição
  meal_time TIME,              -- Hora da refeição
  sofia_analysis TEXT,         -- Texto da análise
  
  -- Status
  confirmed_by_user BOOLEAN,
  confirmation_status TEXT,
  image_deleted BOOLEAN,
  
  created_at TIMESTAMPTZ
);
```

---

### **5️⃣ Dashboard Busca os Dados**

**Arquivo:** `src/components/sofia/SofiaNutricionalRedesigned.tsx` (linha 710-730)

```typescript
const loadTodayMeals = async () => {
  if (!userId) return;
  
  const today = new Date().toISOString().split('T')[0];
  
  // Busca todas as refeições do dia
  const { data } = await supabase
    .from('sofia_food_analysis')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)
    .order('created_at', { ascending: true });
  
  // Formata os dados para exibição
  const formattedMeals = data.map((item) => ({
    id: item.id,
    meal_type: item.meal_type,           // 'almoco'
    calories: item.total_calories,        // 247
    protein_g: item.total_protein,        // 9.8
    carbs_g: item.total_carbs,            // 40.2
    fat_g: item.total_fat,                // 5.2
    foods_detected: item.foods_detected.map(f => f.nome), // ["pão...", "presunto..."]
    created_at: item.created_at
  }));
  
  setMeals(formattedMeals);
};
```

**O que acontece:**
1. Busca todos os registros do dia atual
2. Filtra por `user_id` (só mostra dados do usuário logado)
3. Extrai os dados das colunas:
   - `foods_detected` → Lista de alimentos
   - `total_calories` → Calorias
   - `total_protein` → Proteínas
   - `total_carbs` → Carboidratos
   - `total_fat` → Gorduras
4. Formata e exibe no dashboard

---

### **6️⃣ Dashboard Exibe os Dados**

**Arquivo:** `src/components/sofia/SofiaNutricionalRedesigned.tsx`

```tsx
<div className="meal-card">
  <h3>Almoço - 11:30</h3>
  <p className="calories">247 kcal</p>
  
  <div className="foods-list">
    <p>Sofia detectou 2 alimentos</p>
    
    {/* Lista de alimentos */}
    <div>
      <span>1</span>
      <span>🍞</span>
      <span>Pão de forma prensado</span>
      <span>~130 kcal</span>
    </div>
    
    <div>
      <span>2</span>
      <span>🥓</span>
      <span>Presunto fatiado</span>
      <span>~117 kcal</span>
    </div>
  </div>
  
  {/* Macros */}
  <div className="macros">
    <div>9.8g Proteína</div>
    <div>40.2g Carbos</div>
    <div>5.2g Gorduras</div>
  </div>
</div>
```

---

## 📊 **MAPEAMENTO DE DADOS**

### **De onde vem cada informação:**

| Dado no Dashboard | Coluna no Banco | Origem |
|-------------------|-----------------|--------|
| **Nome dos alimentos** | `foods_detected[].nome` | Gemini AI + TACO |
| **Quantidade (g)** | `foods_detected[].quantidade` | Gemini AI |
| **Calorias totais** | `total_calories` | Soma dos alimentos (TACO) |
| **Proteínas** | `total_protein` | Soma dos alimentos (TACO) |
| **Carboidratos** | `total_carbs` | Soma dos alimentos (TACO) |
| **Gorduras** | `total_fat` | Soma dos alimentos (TACO) |
| **Tipo de refeição** | `meal_type` | Detectado por horário ou contexto |
| **Horário** | `meal_time` | Timestamp da análise |

---

## 🔍 **EXEMPLO REAL**

### **Dados no Banco:**
```json
{
  "id": "9ba82dda-ebd7-4e09-850f-83d7818211f0",
  "user_id": "b3ea0787-4990-4d2c-bc21-cfd66bf58ea6",
  "user_name": "Rafael Ferreira Dias",
  "image_url": "https://yolo-service-minio.0sw627.easypanel.host/images/whatsapp/674b4e2f.webp",
  
  "foods_detected": [
    {"nome": "pão de forma prensado", "quantidade": 60},
    {"nome": "presunto/mortadela fatiado", "quantidade": 30}
  ],
  "total_calories": 247,
  "total_protein": 9.8,
  "total_carbs": 40.2,
  "total_fat": 5.2,
  "total_fiber": 0,
  
  "meal_type": "almoco",
  "meal_date": "2026-01-17",
  "meal_time": "14:30:43",
  "sofia_analysis": "Oi Rafael Ferreira Dias! 😊\n\n📸 **Analisei sua refeição...",
  
  "confirmed_by_user": false,
  "confirmation_status": "pending",
  "image_deleted": false,
  "created_at": "2026-01-17T14:30:43.498+00:00"
}
```

### **Como aparece no Dashboard:**
```
┌─────────────────────────────────────────┐
│ 🍽️ Almoço - 14:30          247 kcal    │
├─────────────────────────────────────────┤
│ Sofia detectou 2 alimentos              │
│                                          │
│ 1  🍞  Pão de forma prensado  ~130 kcal │
│ 2  🥓  Presunto/mortadela     ~117 kcal │
│                                          │
│ 9.8g Proteína                           │
│ 40.2g Carbos                            │
│ 5.2g Gorduras                           │
└─────────────────────────────────────────┘
```

---

## 🎯 **RESUMO**

### **Caminho dos Dados:**
```
Foto → WhatsApp → Webhook → YOLO → Gemini → TACO → Banco → Dashboard
```

### **Onde os dados são salvos:**
- **Tabela:** `sofia_food_analysis`
- **Colunas principais:**
  - `foods_detected` (JSONB) - Lista de alimentos
  - `total_calories` (INTEGER) - Calorias totais
  - `total_protein` (NUMERIC) - Proteínas
  - `total_carbs` (NUMERIC) - Carboidratos
  - `total_fat` (NUMERIC) - Gorduras
  - `meal_type` (TEXT) - Tipo de refeição

### **Onde o dashboard busca:**
```typescript
supabase
  .from('sofia_food_analysis')
  .select('*')
  .eq('user_id', userId)
  .gte('created_at', hoje)
```

---

## 📚 **Arquivos Relacionados**

1. **Edge Functions:**
   - `supabase/functions/whatsapp-nutrition-webhook/index.ts` - Recebe foto
   - `supabase/functions/sofia-image-analysis/index.ts` - Analisa e salva

2. **Componentes:**
   - `src/components/sofia/SofiaNutricionalRedesigned.tsx` - Dashboard

3. **Migrations:**
   - `supabase/migrations/20260105184809_*.sql` - Cria colunas
   - `supabase/migrations/20260117140001_*.sql` - Normaliza meal_type

4. **Hooks:**
   - `src/hooks/useDailyNutritionReport.ts` - Busca dados do dia

---

**Última atualização:** 17/01/2026
