import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Apple, 
  Activity,
  BarChart3,
  Settings,
  Plus,
  Trophy,
  Lightbulb
} from 'lucide-react';
import { NutritionTracker } from '@/components/nutrition-tracking/NutritionTracker';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';
import { SofiaNutritionInsights } from '@/components/sofia/SofiaNutritionInsights';

export const NutritionTrackingPage: React.FC = () => {
  const { 
    meals, 
    goals, 
    loading, 
    error, 
    getDailyNutrition, 
    getNutritionStats 
  } = useNutritionTracking();
  
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const stats = getNutritionStats(7); // Últimos 7 dias
  const dailyNutrition = getDailyNutrition(selectedDate);

  return (
    <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Rastreador Nutricional</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Monitore sua alimentação e metas
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" className="text-xs sm:text-sm">
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Configurações</span>
          </Button>
          <Button size="sm" className="text-xs sm:text-sm">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-2" />
            <span className="hidden sm:inline">Nova</span> Refeição
          </Button>
        </div>
      </div>

      {/* Cards de Resumo - Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Calorias</CardTitle>
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{dailyNutrition.totalCalories}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Meta: {goals.calories} kcal
            </p>
            <div className="mt-1.5 sm:mt-2">
              <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(dailyNutrition.progress.calories, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Proteínas</CardTitle>
            <Apple className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{dailyNutrition.totalProtein}g</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Meta: {goals.protein}g
            </p>
            <div className="mt-1.5 sm:mt-2">
              <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-green-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(dailyNutrition.progress.protein, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Carbos</CardTitle>
            <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{dailyNutrition.totalCarbs}g</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Meta: {goals.carbs}g
            </p>
            <div className="mt-1.5 sm:mt-2">
              <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-yellow-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(dailyNutrition.progress.carbs, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:p-4 pb-1 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Gorduras</CardTitle>
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="text-lg sm:text-2xl font-bold">{dailyNutrition.totalFat}g</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Meta: {goals.fat}g
            </p>
            <div className="mt-1.5 sm:mt-2">
              <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-red-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(dailyNutrition.progress.fat, 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal - Mobile Tabs */}
      <Tabs defaultValue="tracker" className="space-y-3 sm:space-y-4">
        <TabsList className="grid w-full grid-cols-4 h-9 sm:h-10">
          <TabsTrigger value="tracker" className="text-xs sm:text-sm px-1 sm:px-3">Rastreador</TabsTrigger>
          <TabsTrigger value="stats" className="text-xs sm:text-sm px-1 sm:px-3">Stats</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs sm:text-sm px-1 sm:px-3">Insights</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs sm:text-sm px-1 sm:px-3">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-4">
          <NutritionTracker />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Estatísticas dos Últimos 7 Dias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Últimos 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats.averageCalories}
                    </div>
                    <div className="text-sm text-muted-foreground">Calorias/dia</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats.averageProtein}g
                    </div>
                    <div className="text-sm text-muted-foreground">Proteínas/dia</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.averageCarbs}g
                    </div>
                    <div className="text-sm text-muted-foreground">Carboidratos/dia</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {stats.averageFat}g
                    </div>
                    <div className="text-sm text-muted-foreground">Gorduras/dia</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Dias rastreados:</span>
                    <span className="font-medium">{stats.daysTracked}/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de alcance de metas:</span>
                    <span className="font-medium">{stats.goalAchievementRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alimentos Mais Consumidos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="w-5 h-5" />
                  Alimentos Favoritos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.mostConsumedFoods.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum alimento registrado ainda
                  </p>
                ) : (
                  <div className="space-y-3">
                    {stats.mostConsumedFoods.map((item, index) => (
                      <div key={item.food.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {item.food.brazilianName || item.food.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {item.frequency} vezes • {item.totalQuantity}g
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          Score: {item.food.healthScore}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <SofiaNutritionInsights />
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Suas Metas Nutricionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Macronutrientes</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Calorias</span>
                      <span className="text-blue-600 font-bold">{goals.calories} kcal</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Proteínas</span>
                      <span className="text-green-600 font-bold">{goals.protein}g</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <span className="font-medium">Carboidratos</span>
                      <span className="text-yellow-600 font-bold">{goals.carbs}g</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="font-medium">Gorduras</span>
                      <span className="text-red-600 font-bold">{goals.fat}g</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Fibras</span>
                      <span className="text-purple-600 font-bold">{goals.fiber}g</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Distribuição</h3>
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                      <div className="text-2xl font-bold text-blue-800">
                        {Math.round((goals.protein * 4 / goals.calories) * 100)}%
                      </div>
                      <div className="text-sm text-blue-700">Proteínas</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-800">
                        {Math.round((goals.carbs * 4 / goals.calories) * 100)}%
                      </div>
                      <div className="text-sm text-yellow-700">Carboidratos</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-red-100 to-red-200 rounded-lg">
                      <div className="text-2xl font-bold text-red-800">
                        {Math.round((goals.fat * 9 / goals.calories) * 100)}%
                      </div>
                      <div className="text-sm text-red-700">Gorduras</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Ações</h3>
                  <div className="space-y-3">
                    <Button className="w-full" variant="outline">
                      <Settings className="w-4 h-4 mr-2" />
                      Editar Metas
                    </Button>
                    <Button className="w-full" variant="outline">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Ver Histórico
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Target className="w-4 h-4 mr-2" />
                      Definir por Dieta
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span>Carregando dados nutricionais...</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-red-600 font-medium">Erro:</span>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};
