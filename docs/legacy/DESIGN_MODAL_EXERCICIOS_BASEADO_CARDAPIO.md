# 🏋️ DESIGN DO MODAL DE EXERCÍCIOS - BASEADO NO MODAL DE CARDÁPIO

## 📊 ANÁLISE DO MODAL DE CARDÁPIO ATUAL

### ✅ Estrutura Identificada:

```typescript
// MODAL DE CARDÁPIO (MealPlanGeneratorModalV2.tsx)

1. IMPORTS E HOOKS
   ├─ Dialog, Button, Input, Label, Select, Badge, Card
   ├─ useWeightMeasurement (dados físicos do usuário)
   ├─ useMealPlanGeneratorV2 (lógica de geração)
   └─ useUserFoodPreferences (preferências salvas)

2. ESTADOS PRINCIPAIS
   ├─ numberOfDays: '7' (quantidade de dias)
   ├─ objective: NutritionObjective.MAINTAIN (objetivo nutricional)
   ├─ dailyGoals: { calories, protein, carbs, fat, fiber }
   ├─ preferredFoods: string[] (alimentos preferidos)
   ├─ restrictedFoods: string[] (alimentos restritos)
   └─ selectedEquipments: string[] (equipamentos disponíveis)

3. SEÇÕES DO MODAL
   ├─ CARD 1: Configuração Básica (Objetivo + Dias)
   ├─ CARD 2: Filtros Rápidos (Equipamentos + Restrições)
   ├─ CARD 3: Preferências (Alimentos preferidos)
   └─ BOTÃO: Gerar Cardápio (com loading)

4. FLUXO DE GERAÇÃO
   ├─ Validar dados
   ├─ Chamar edge function (supabase.functions.invoke)
   ├─ Receber resultado
   ├─ Abrir modal de visualização (WeeklyMealPlanModal)
   └─ Salvar no histórico
```

---

## 🏋️ ADAPTAÇÃO PARA MODAL DE EXERCÍCIOS

### 🎯 ESTRUTURA PROPOSTA:

```typescript
// NOVO MODAL: WorkoutPlanGeneratorModal.tsx

1. IMPORTS E HOOKS (MESMA ESTRUTURA)
   ├─ Dialog, Button, Input, Label, Select, Badge, Card
   ├─ useWeightMeasurement (dados físicos do usuário)
   ├─ useWorkoutPlanGenerator (NOVO HOOK - mesma lógica do cardápio)
   └─ useUserExercisePreferences (NOVO HOOK - preferências de exercícios)

2. ESTADOS PRINCIPAIS (ADAPTADOS)
   ├─ numberOfDays: '7' → Dias do programa
   ├─ objective: WorkoutObjective.WEIGHT_LOSS → Objetivo fitness
   ├─ workoutGoals: { duration_minutes, frequency, intensity }
   ├─ preferredExercises: string[] → Exercícios preferidos
   ├─ restrictedExercises: string[] → Exercícios a evitar
   ├─ location: 'home' | 'gym' → Local de treino
   └─ equipmentAvailable: string[] → Equipamentos disponíveis

3. SEÇÕES DO MODAL (MESMA ESTRUTURA)
   ├─ CARD 1: Configuração Básica (Objetivo + Dias + Local)
   ├─ CARD 2: Filtros Rápidos (Equipamentos + Nível)
   ├─ CARD 3: Preferências (Exercícios preferidos + Restrições)
   └─ BOTÃO: Gerar Treino (com loading)

4. FLUXO DE GERAÇÃO (MESMA LÓGICA)
   ├─ Validar dados
   ├─ Chamar edge function (supabase.functions.invoke('generate-workout-plan'))
   ├─ Receber resultado
   ├─ Abrir modal de visualização (WeeklyWorkoutPlanModal)
   └─ Salvar no histórico
```

---

## 🎨 COMPARAÇÃO VISUAL LADO A LADO

### 📋 CARDÁPIO (Atual) ➡️ 🏋️ EXERCÍCIOS (Novo)

```
┌─────────────────────────────────────┐  ┌─────────────────────────────────────┐
│   🍽️ GERAR CARDÁPIO PERSONALIZADO   │  │   🏋️ GERAR TREINO PERSONALIZADO     │
├─────────────────────────────────────┤  ├─────────────────────────────────────┤
│                                     │  │                                     │
│ ┌─ Configuração Básica ──────────┐ │  │ ┌─ Configuração Básica ──────────┐ │
│ │                                 │ │  │ │                                 │ │
│ │ Objetivo:   [Emagrecimento ▼]  │ │  │ │ Objetivo:   [Perder Peso ▼]    │ │
│ │             1800 kcal           │ │  │ │             Cardio + Força      │ │
│ │                                 │ │  │ │                                 │ │
│ │ Dias:       [7 dias ▼]         │ │  │ │ Dias:       [7 dias ▼]         │ │
│ │                                 │ │  │ │                                 │ │
│ └─────────────────────────────────┘ │  │ │ Local:      [🏠 Casa] [🏋️ Gym] │ │
│                                     │  │ │                                 │ │
│ ┌─ Filtros Rápidos ──────────────┐ │  │ │ Frequência: [5 dias/semana ▼]  │ │
│ │                                 │ │  │ │                                 │ │
│ │ 🍳 Equipamentos:                │ │  │ │ Duração:    [30 minutos ▼]     │ │
│ │ ☑ Air Fryer                    │ │  │ │                                 │ │
│ │ ☑ Fogão                        │ │  │ └─────────────────────────────────┘ │
│ │ ☐ Microondas                   │ │  │                                     │
│ │                                 │ │  │ ┌─ Equipamentos e Nível ────────┐ │
│ │ 🚫 Alimentos Restritos:        │ │  │ │                                 │ │
│ │ [Digite aqui...] [+]           │ │  │ │ 🏠 Para Casa:                  │ │
│ │ [lactose ×] [glúten ×]         │ │  │ │ ☑ Escada                       │ │
│ └─────────────────────────────────┘ │  │ │ ☑ Cadeira                      │ │
│                                     │  │ │ ☑ Cabo de Vassoura             │ │
│ ┌─ Preferências ────────────────┐ │  │ │ ☐ Halteres                     │ │
│ │                                 │ │  │ │                                 │ │
│ │ ❤️ Alimentos Preferidos:       │ │  │ │ 🏋️ Para Academia:              │ │
│ │ [Digite aqui...] [+]           │ │  │ │ ☑ Supino                       │ │
│ │ [frango ×] [arroz ×] [peixe ×] │ │  │ │ ☑ Leg Press                    │ │
│ └─────────────────────────────────┘ │  │ │ ☑ Barra Fixa                   │ │
│                                     │  │ │ ☑ Esteira                      │ │
│ [Cancelar]  [🍽️ Gerar Cardápio]   │  │ │                                 │ │
└─────────────────────────────────────┘  │ │ 📊 Nível:                      │ │
                                         │ │ ○ Iniciante                    │ │
                                         │ │ ● Intermediário                │ │
                                         │ │ ○ Avançado                     │ │
                                         │ │                                 │ │
                                         │ └─────────────────────────────────┘ │
                                         │                                     │
                                         │ ┌─ Preferências e Restrições ───┐ │
                                         │ │                                 │ │
                                         │ │ 💪 Exercícios Preferidos:      │ │
                                         │ │ [Digite aqui...] [+]           │ │
                                         │ │ [flexão ×] [corrida ×]         │ │
                                         │ │                                 │ │
                                         │ │ 🚫 Exercícios Restritos:       │ │
                                         │ │ [Digite aqui...] [+]           │ │
                                         │ │ [agachamento ×] [burpee ×]     │ │
                                         │ └─────────────────────────────────┘ │
                                         │                                     │
                                         │ [Cancelar]  [💪 Gerar Treino]      │
                                         └─────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### 1️⃣ NOVO ARQUIVO: `WorkoutPlanGeneratorModal.tsx`

```typescript
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dumbbell, Target, Home, Building, X, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';

interface WorkoutPlanGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Objetivos de treino (similar aos objetivos nutricionais)
const WORKOUT_OBJECTIVES = {
  WEIGHT_LOSS: { label: 'Perder Peso', icon: '🔥', description: 'Foco em cardio e queima de gordura' },
  MUSCLE_GAIN: { label: 'Ganhar Massa', icon: '💪', description: 'Foco em hipertrofia e força' },
  MAINTAIN: { label: 'Manter Saúde', icon: '❤️', description: 'Equilíbrio entre cardio e força' },
  ATHLETIC: { label: 'Performance Atlética', icon: '⚡', description: 'Treino funcional e explosão' }
};

// Equipamentos para CASA (similar aos equipamentos de cozinha)
const HOME_EQUIPMENT = [
  { id: 'escada', label: 'Escada', icon: '🪜' },
  { id: 'cadeira', label: 'Cadeira', icon: '🪑' },
  { id: 'cabo_vassoura', label: 'Cabo de Vassoura', icon: '🧹' },
  { id: 'halteres', label: 'Halteres', icon: '🏋️' },
  { id: 'tapete', label: 'Tapete', icon: '🧘' }
];

// Equipamentos para ACADEMIA
const GYM_EQUIPMENT = [
  { id: 'supino', label: 'Supino', icon: '🏋️' },
  { id: 'leg_press', label: 'Leg Press', icon: '🦵' },
  { id: 'barra_fixa', label: 'Barra Fixa', icon: '⬆️' },
  { id: 'esteira', label: 'Esteira', icon: '🏃' },
  { id: 'halteres', label: 'Halteres', icon: '💪' },
  { id: 'cabos', label: 'Cabos/Polias', icon: '🔗' }
];

export const WorkoutPlanGeneratorModal: React.FC<WorkoutPlanGeneratorModalProps> = ({
  open,
  onOpenChange
}) => {
  const { physicalData, measurements } = useWeightMeasurement();
  
  // Estados (MESMA ESTRUTURA DO CARDÁPIO)
  const [numberOfDays, setNumberOfDays] = useState('7');
  const [objective, setObjective] = useState('MAINTAIN');
  const [location, setLocation] = useState<'home' | 'gym'>('home');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [frequency, setFrequency] = useState('5');
  
  // Preferências e restrições (MESMA LÓGICA)
  const [preferredExercises, setPreferredExercises] = useState<string[]>([]);
  const [newPreferredExercise, setNewPreferredExercise] = useState('');
  const [restrictedExercises, setRestrictedExercises] = useState<string[]>([]);
  const [newRestrictedExercise, setNewRestrictedExercise] = useState('');
  
  // Equipamentos selecionados
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  
  // Estado de geração
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Peso do usuário
  const weight = measurements && measurements.length > 0 ? measurements[0].peso_kg : 70;

  // Adicionar exercício preferido (MESMA LÓGICA DO CARDÁPIO)
  const addPreferredExercise = () => {
    const exercise = newPreferredExercise.trim().toLowerCase();
    if (exercise && !preferredExercises.includes(exercise)) {
      setPreferredExercises(prev => [...prev, exercise]);
      setNewPreferredExercise('');
    }
  };

  // Remover exercício preferido
  const removePreferredExercise = (exercise: string) => {
    setPreferredExercises(prev => prev.filter(e => e !== exercise));
  };

  // Adicionar exercício restrito
  const addRestrictedExercise = () => {
    const exercise = newRestrictedExercise.trim().toLowerCase();
    if (exercise && !restrictedExercises.includes(exercise)) {
      setRestrictedExercises(prev => [...prev, exercise]);
      setNewRestrictedExercise('');
    }
  };

  // Remover exercício restrito
  const removeRestrictedExercise = (exercise: string) => {
    setRestrictedExercises(prev => prev.filter(e => e !== exercise));
  };

  // Toggle equipamento
  const toggleEquipment = (equipmentId: string) => {
    setSelectedEquipments(prev => 
      prev.includes(equipmentId) 
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId]
    );
  };

  // Gerar programa de treino (MESMA ESTRUTURA DO CARDÁPIO)
  const handleGenerateWorkoutPlan = async () => {
    setIsGenerating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Preparar parâmetros (mesma lógica do cardápio)
      const workoutParams = {
        userId: user?.id,
        objetivo: objective,
        local: location,
        nivel: experienceLevel,
        dias: parseInt(numberOfDays),
        duracao_minutos: parseInt(durationMinutes),
        frequencia_semanal: parseInt(frequency),
        peso_kg: weight,
        equipamentos_disponiveis: selectedEquipments,
        exercicios_preferidos: preferredExercises,
        exercicios_restritos: restrictedExercises
      };
      
      console.log('🏋️ Gerando programa de treino:', workoutParams);
      
      // Chamar edge function (NOVA FUNÇÃO - mesma estrutura)
      const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
        body: workoutParams
      });
      
      if (error) throw error;
      
      if (data?.success) {
        toast.success('Programa de treino gerado com sucesso!');
        // Abrir modal de visualização (criar WeeklyWorkoutPlanModal)
        // setWorkoutPlanForModal(data.workout_plan);
        // setIsWeeklyWorkoutModalOpen(true);
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar programa:', error);
      toast.error('Erro ao gerar programa de treino');
    } finally {
      setIsGenerating(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2">
            <Dumbbell className="w-5 h-5" />
            Gerar Treino Personalizado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* CARD 1: Configuração Básica */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-4 h-4" />
                Configuração Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Objetivo */}
              <div>
                <Label htmlFor="objective">Objetivo</Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger id="objective">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WORKOUT_OBJECTIVES).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value.icon} {value.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {WORKOUT_OBJECTIVES[objective as keyof typeof WORKOUT_OBJECTIVES]?.description}
                </p>
              </div>

              {/* Local + Dias */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Local de Treino</Label>
                  <RadioGroup value={location} onValueChange={(v) => setLocation(v as 'home' | 'gym')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="home" id="home" />
                      <Label htmlFor="home" className="cursor-pointer">
                        <Home className="inline w-4 h-4 mr-1" /> Casa
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="gym" id="gym" />
                      <Label htmlFor="gym" className="cursor-pointer">
                        <Building className="inline w-4 h-4 mr-1" /> Academia
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="days">Dias do Programa</Label>
                  <Select value={numberOfDays} onValueChange={setNumberOfDays}>
                    <SelectTrigger id="days">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[7, 14, 21, 30, 60].map(d => (
                        <SelectItem key={d} value={d.toString()}>
                          {d} dias
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Frequência + Duração */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency">Frequência Semanal</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7].map(f => (
                        <SelectItem key={f} value={f.toString()}>
                          {f} dias por semana
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duração por Treino</Label>
                  <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[15, 30, 45, 60, 90].map(d => (
                        <SelectItem key={d} value={d.toString()}>
                          {d} minutos
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: Equipamentos e Nível */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Dumbbell className="w-4 h-4" />
                Equipamentos e Nível
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Equipamentos baseados no local */}
              <div>
                <Label className="text-sm font-medium">
                  {location === 'home' ? '🏠 Equipamentos em Casa' : '🏋️ Equipamentos na Academia'}
                </Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(location === 'home' ? HOME_EQUIPMENT : GYM_EQUIPMENT).map(equipment => (
                    <div key={equipment.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={equipment.id}
                        checked={selectedEquipments.includes(equipment.id)}
                        onCheckedChange={() => toggleEquipment(equipment.id)}
                      />
                      <Label htmlFor={equipment.id} className="text-sm cursor-pointer">
                        {equipment.icon} {equipment.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nível de Experiência */}
              <div>
                <Label>Nível de Experiência</Label>
                <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="beginner" id="beginner" />
                    <Label htmlFor="beginner" className="cursor-pointer">
                      🌱 Iniciante
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="intermediate" id="intermediate" />
                    <Label htmlFor="intermediate" className="cursor-pointer">
                      🔶 Intermediário
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="advanced" id="advanced" />
                    <Label htmlFor="advanced" className="cursor-pointer">
                      🏆 Avançado
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          {/* CARD 3: Preferências e Restrições */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                💪 Preferências e Restrições
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Exercícios Preferidos */}
              <div>
                <Label className="text-sm font-medium">💪 Exercícios Preferidos</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ex: flexão, corrida, agachamento..."
                    value={newPreferredExercise}
                    onChange={(e) => setNewPreferredExercise(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPreferredExercise()}
                  />
                  <Button onClick={addPreferredExercise} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {preferredExercises.map(exercise => (
                    <Badge key={exercise} variant="secondary" className="gap-1">
                      {exercise}
                      <button onClick={() => removePreferredExercise(exercise)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Exercícios Restritos */}
              <div>
                <Label className="text-sm font-medium">🚫 Exercícios a Evitar</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Ex: burpee, pular corda..."
                    value={newRestrictedExercise}
                    onChange={(e) => setNewRestrictedExercise(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addRestrictedExercise()}
                  />
                  <Button onClick={addRestrictedExercise} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {restrictedExercises.map(exercise => (
                    <Badge key={exercise} variant="destructive" className="gap-1">
                      {exercise}
                      <button onClick={() => removeRestrictedExercise(exercise)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de ação */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleGenerateWorkoutPlan} 
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Treino...
                </>
              ) : (
                <>
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Gerar Treino Personalizado
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabelas necessárias (seguindo padrão do cardápio):

```sql
-- 1. Tabela de preferências de exercícios (similar a user_food_preferences)
CREATE TABLE user_exercise_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  preference_type TEXT CHECK (preference_type IN ('preference', 'restriction')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de programas de treino gerados (similar a meal_plans)
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  objective TEXT,
  location TEXT,
  experience_level TEXT,
  days INTEGER,
  frequency INTEGER,
  duration_minutes INTEGER,
  plan_data JSONB, -- Estrutura dos treinos por dia
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de histórico de treinos (similar a meal_logs)
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_plan_id UUID REFERENCES workout_plans(id),
  exercise_name TEXT,
  completed_at TIMESTAMP DEFAULT NOW(),
  duration_minutes INTEGER,
  notes TEXT
);
```

---

## 🔌 EDGE FUNCTION

### Nova função: `generate-workout-plan`

```typescript
// supabase/functions/generate-workout-plan/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const {
      userId,
      objetivo,
      local,
      nivel,
      dias,
      duracao_minutos,
      frequencia_semanal,
      peso_kg,
      equipamentos_disponiveis,
      exercicios_preferidos,
      exercicios_restritos
    } = await req.json();

    // Buscar exercícios do banco baseado nos parâmetros
    // Mesma lógica da geração de cardápio, mas para exercícios
    
    // Gerar programa de treino com IA (OpenAI ou outra)
    const workoutPlan = await generateWorkoutWithAI({
      objetivo,
      local,
      nivel,
      dias,
      duracao_minutos,
      equipamentos_disponiveis,
      exercicios_preferidos,
      exercicios_restritos
    });

    // Salvar no banco
    const { data, error } = await supabase
      .from('workout_plans')
      .insert({
        user_id: userId,
        objective: objetivo,
        location: local,
        experience_level: nivel,
        days: dias,
        frequency: frequencia_semanal,
        duration_minutes: duracao_minutos,
        plan_data: workoutPlan
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, workout_plan: data }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
```

---

## 📊 RESUMO DA ADAPTAÇÃO

| Aspecto | Cardápio | Exercícios |
|---------|----------|------------|
| **Modal** | MealPlanGeneratorModalV2.tsx | WorkoutPlanGeneratorModal.tsx |
| **Hook** | useMealPlanGeneratorV2 | useWorkoutPlanGenerator |
| **Edge Function** | generate-meal-plan-taco | generate-workout-plan |
| **Objetivo** | Emagrecimento, Manter, Ganhar Massa | Perder Peso, Ganhar Massa, Manter Saúde |
| **Filtros** | Equipamentos (Air Fryer, Fogão) | Equipamentos (Escada, Supino) |
| **Preferências** | Alimentos (frango, arroz) | Exercícios (flexão, corrida) |
| **Restrições** | Alimentos (lactose, glúten) | Exercícios (burpee, pular) |
| **Dias** | 1, 3, 7, 14, 21, 30 | 7, 14, 21, 30, 60 |
| **Parâmetro Extra** | Calorias | Duração (minutos) |
| **Local** | - | Casa / Academia |
| **Nível** | - | Iniciante / Inter / Avançado |

---

## ✅ VANTAGENS DESSA ABORDAGEM

1. **Consistência**: Mesma UX do cardápio
2. **Reutilização**: Aproveita hooks e componentes existentes
3. **Familiaridade**: Usuários já sabem como usar
4. **Manutenção**: Padrão unificado facilita updates
5. **Escalabilidade**: Fácil adicionar novos recursos

---

## 🎯 PRÓXIMOS PASSOS

Quando for implementar:

1. ✅ Criar `WorkoutPlanGeneratorModal.tsx`
2. ✅ Criar `useWorkoutPlanGenerator.ts` hook
3. ✅ Criar `useUserExercisePreferences.ts` hook
4. ✅ Criar tabelas SQL no Supabase
5. ✅ Criar Edge Function `generate-workout-plan`
6. ✅ Criar `WeeklyWorkoutPlanModal.tsx` (visualização)
7. ✅ Adicionar rota no menu do dashboard
8. ✅ Testar fluxo completo

---

**Quer que eu crie algum desses arquivos agora para você começar?** 💪🏋️‍♂️


