import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Palette, 
  Timer, 
  BarChart3, 
  RefreshCw, 
  BookOpen,
  ChefHat,
  Heart
} from 'lucide-react';

import { MoodSelector, MOODS, Mood } from './MoodSelector';
import { PlateAssemblyAnimation } from './PlateAssemblyAnimation';
import { DayTimeline } from './DayTimeline';
import { MealCardWithVibe } from './MealCardWithVibe';
import { MacroRadarChart } from './MacroRadarChart';
import { SwipeToSwapMeal } from './SwipeToSwapMeal';
import { IngredientChips } from './IngredientChips';
import { StoryModeMealPlan } from './StoryModeMealPlan';
import { ChefModeAnimation } from './ChefModeAnimation';
import { FeedbackSensorial } from './FeedbackSensorial';

// Sample data
const SAMPLE_MEALS = [
  {
    id: '1',
    type: 'breakfast' as const,
    title: 'Overnight Oats com Frutas',
    description: 'Aveia cremosa com frutas frescas e mel',
    calories: 350,
    protein: 12,
    carbs: 55,
    fat: 8,
    prepTime: '10min',
    emoji: '🥣',
    ingredients: ['Aveia', 'Leite', 'Iogurte', 'Banana', 'Mel', 'Chia'],
    time: '7h'
  },
  {
    id: '2',
    type: 'lunch' as const,
    title: 'Frango Grelhado com Quinoa',
    description: 'Proteína magra com grãos nutritivos',
    calories: 520,
    protein: 42,
    carbs: 45,
    fat: 15,
    prepTime: '25min',
    emoji: '🍗',
    ingredients: ['Frango', 'Quinoa', 'Brócolis', 'Azeite', 'Limão'],
    time: '12h'
  },
  {
    id: '3',
    type: 'snack' as const,
    title: 'Mix de Nuts com Frutas Secas',
    description: 'Energia rápida e saudável',
    calories: 200,
    protein: 6,
    carbs: 18,
    fat: 14,
    prepTime: '2min',
    emoji: '🥜',
    ingredients: ['Castanhas', 'Amêndoas', 'Damasco', 'Uva passa'],
    time: '15h'
  },
  {
    id: '4',
    type: 'dinner' as const,
    title: 'Salmão com Legumes',
    description: 'Ômega 3 e vegetais coloridos',
    calories: 480,
    protein: 38,
    carbs: 25,
    fat: 28,
    prepTime: '30min',
    emoji: '🐟',
    ingredients: ['Salmão', 'Aspargos', 'Tomate', 'Alho', 'Ervas'],
    time: '19h'
  },
  {
    id: '5',
    type: 'supper' as const,
    title: 'Iogurte com Granola',
    description: 'Leve e reconfortante',
    calories: 180,
    protein: 10,
    carbs: 22,
    fat: 6,
    prepTime: '3min',
    emoji: '🥛',
    ingredients: ['Iogurte natural', 'Granola', 'Mel'],
    time: '21h'
  }
];

const SAMPLE_INGREDIENTS = [
  { name: 'Frango', amount: '150g', category: 'protein' as const, calories: 165, canSubstitute: true, substitutes: ['Peru', 'Tofu', 'Peixe'] },
  { name: 'Arroz integral', amount: '100g', category: 'carb' as const, calories: 111, canSubstitute: true, substitutes: ['Quinoa', 'Batata doce'] },
  { name: 'Brócolis', amount: '80g', category: 'vegetable' as const, calories: 27 },
  { name: 'Azeite', amount: '1 colher', category: 'fat' as const, calories: 40 },
  { name: 'Banana', amount: '1 unidade', category: 'fruit' as const, calories: 89 },
  { name: 'Iogurte', amount: '100g', category: 'dairy' as const, calories: 59 }
];

const SAMPLE_ALTERNATIVES = [
  { id: 'alt1', title: 'Omelete de Claras', calories: 280, protein: 24, carbs: 8, fat: 18, emoji: '🍳', prepTime: '10min' },
  { id: 'alt2', title: 'Smoothie Proteico', calories: 320, protein: 28, carbs: 35, fat: 8, emoji: '🥤', prepTime: '5min' },
  { id: 'alt3', title: 'Panqueca Fit', calories: 340, protein: 18, carbs: 42, fat: 12, emoji: '🥞', prepTime: '15min' }
];

const PREP_STEPS = [
  { step: 1, instruction: 'Separe todos os ingredientes', duration: '2min', icon: '📦' },
  { step: 2, instruction: 'Tempere o frango com sal e pimenta', duration: '1min', icon: '🧂' },
  { step: 3, instruction: 'Aqueça a frigideira em fogo médio', duration: '2min', icon: '🔥' },
  { step: 4, instruction: 'Grelhe o frango por 5 minutos de cada lado', duration: '10min', icon: '🍳' },
  { step: 5, instruction: 'Cozinhe a quinoa conforme instruções', duration: '15min', icon: '🍚' },
  { step: 6, instruction: 'Monte o prato e sirva', duration: '2min', icon: '🍽️' }
];

export const CreativeMealPlanDemo: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood.id);
  };

  const simulateGeneration = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 5000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Cardápio Criativo
          </h1>
          <p className="text-muted-foreground">
            Uma experiência surreal de geração de cardápios
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="mood" className="w-full">
          <TabsList className="grid grid-cols-5 lg:grid-cols-10 gap-1 h-auto p-1">
            <TabsTrigger value="mood" className="flex flex-col gap-1 py-2">
              <Heart className="w-4 h-4" />
              <span className="text-xs">Mood</span>
            </TabsTrigger>
            <TabsTrigger value="plate" className="flex flex-col gap-1 py-2">
              <Palette className="w-4 h-4" />
              <span className="text-xs">Prato</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex flex-col gap-1 py-2">
              <Timer className="w-4 h-4" />
              <span className="text-xs">Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex flex-col gap-1 py-2">
              <Palette className="w-4 h-4" />
              <span className="text-xs">Cards</span>
            </TabsTrigger>
            <TabsTrigger value="radar" className="flex flex-col gap-1 py-2">
              <BarChart3 className="w-4 h-4" />
              <span className="text-xs">Radar</span>
            </TabsTrigger>
            <TabsTrigger value="swap" className="flex flex-col gap-1 py-2">
              <RefreshCw className="w-4 h-4" />
              <span className="text-xs">Swap</span>
            </TabsTrigger>
            <TabsTrigger value="chips" className="flex flex-col gap-1 py-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">Chips</span>
            </TabsTrigger>
            <TabsTrigger value="story" className="flex flex-col gap-1 py-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs">Story</span>
            </TabsTrigger>
            <TabsTrigger value="chef" className="flex flex-col gap-1 py-2">
              <ChefHat className="w-4 h-4" />
              <span className="text-xs">Chef</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex flex-col gap-1 py-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs">Feedback</span>
            </TabsTrigger>
          </TabsList>

          {/* Mood Selector */}
          <TabsContent value="mood">
            <Card>
              <CardHeader>
                <CardTitle>1. Mood do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <MoodSelector
                  selectedMood={selectedMood}
                  onMoodSelect={handleMoodSelect}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plate Assembly */}
          <TabsContent value="plate">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  2. Prato Montado em Tempo Real
                  <Button onClick={simulateGeneration} disabled={isGenerating}>
                    {isGenerating ? 'Gerando...' : 'Simular Geração'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <PlateAssemblyAnimation
                  isGenerating={isGenerating}
                  calories={isGenerating ? 1200 : 0}
                  targetCalories={2000}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>3. Timeline Visual do Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <DayTimeline
                  meals={SAMPLE_MEALS}
                  selectedMealId={selectedMealId}
                  onMealClick={(meal) => setSelectedMealId(meal.id)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meal Cards */}
          <TabsContent value="cards">
            <Card>
              <CardHeader>
                <CardTitle>4. Cards com Vibe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {SAMPLE_MEALS.slice(0, 3).map((meal) => (
                    <MealCardWithVibe
                      key={meal.id}
                      type={meal.type}
                      title={meal.title}
                      description={meal.description}
                      ingredients={meal.ingredients}
                      prepTime={meal.prepTime}
                      macros={{
                        calories: meal.calories,
                        protein: meal.protein,
                        carbs: meal.carbs,
                        fat: meal.fat,
                        fiber: 5
                      }}
                      onSwap={() => console.log('Swap', meal.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Radar Chart */}
          <TabsContent value="radar">
            <Card>
              <CardHeader>
                <CardTitle>5. Comparador Visual de Macros</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <MacroRadarChart
                  current={{ calories: 1800, protein: 120, carbs: 200, fat: 60, fiber: 28 }}
                  target={{ calories: 2000, protein: 150, carbs: 250, fat: 65, fiber: 30 }}
                  size={280}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Swipe to Swap */}
          <TabsContent value="swap">
            <Card>
              <CardHeader>
                <CardTitle>6. Swipe to Swap</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <SwipeToSwapMeal
                  currentMeal={{ ...SAMPLE_MEALS[0], id: 'current' }}
                  alternatives={SAMPLE_ALTERNATIVES}
                  onSelect={(meal) => console.log('Selected', meal)}
                  onKeepCurrent={() => console.log('Kept current')}
                  mealType="breakfast"
                  className="max-w-sm"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Ingredient Chips */}
          <TabsContent value="chips">
            <Card>
              <CardHeader>
                <CardTitle>7. Ingredientes Interativos</CardTitle>
              </CardHeader>
              <CardContent>
                <IngredientChips
                  ingredients={SAMPLE_INGREDIENTS}
                  editable
                  onRemove={(ing) => console.log('Remove', ing)}
                  onSubstitute={(ing, sub) => console.log('Substitute', ing, sub)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Story Mode */}
          <TabsContent value="story">
            <Card>
              <CardHeader>
                <CardTitle>8. Story Mode</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <StoryModeMealPlan
                  meals={SAMPLE_MEALS}
                  onComplete={() => console.log('All stories viewed')}
                  onMealComplete={(id) => console.log('Meal complete', id)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chef Mode */}
          <TabsContent value="chef">
            <Card>
              <CardHeader>
                <CardTitle>9. Chef Mode - Animação de Preparo</CardTitle>
              </CardHeader>
              <CardContent>
                <ChefModeAnimation
                  recipeName="Frango Grelhado com Quinoa"
                  totalTime="30min"
                  steps={PREP_STEPS}
                  utensils={['Frigideira', 'Panela', 'Faca', 'Tábua']}
                  isActive
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Sensorial */}
          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>10. Feedback Sensorial</CardTitle>
              </CardHeader>
              <CardContent>
                <FeedbackSensorial
                  onMealComplete={() => console.log('Meal completed!')}
                  onDayComplete={() => console.log('Day completed!')}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
