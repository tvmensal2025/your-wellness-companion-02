/**
 * WhatsApp Button Mapping - Mapeamento visual de botões, templates e handlers
 */

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Search,
  MessageSquare,
  Utensils,
  Stethoscope,
  Droplets,
  Scale,
  Dumbbell,
  Bell,
  Target,
  Smile,
  HelpCircle,
  Menu,
  FileText,
  ChevronRight
} from 'lucide-react';

// Definição completa de todos os botões
const ALL_BUTTONS = [
  // Sofia - Nutrição
  { id: 'sofia_confirm', category: 'Sofia', description: 'Confirmar análise de refeição', edgeHandler: true, vpsHandler: true, icon: Utensils },
  { id: 'sofia_edit', category: 'Sofia', description: 'Editar/corrigir análise', edgeHandler: true, vpsHandler: false, icon: Utensils },
  { id: 'sofia_cancel', category: 'Sofia', description: 'Cancelar registro', edgeHandler: true, vpsHandler: false, icon: Utensils },
  { id: 'sofia_details', category: 'Sofia', description: 'Ver detalhes nutricionais', edgeHandler: true, vpsHandler: false, icon: Utensils },
  { id: 'sofia_new_photo', category: 'Sofia', description: 'Solicitar nova foto', edgeHandler: true, vpsHandler: false, icon: Utensils },
  { id: 'sofia_tips', category: 'Sofia', description: 'Dicas nutricionais', edgeHandler: true, vpsHandler: false, icon: Utensils },
  { id: 'sofia_meal_plan', category: 'Sofia', description: 'Sugestão de cardápio', edgeHandler: true, vpsHandler: false, icon: Utensils },
  
  // Meal Plan
  { id: 'meal_accept', category: 'Meal Plan', description: 'Aceitar sugestão de refeição', edgeHandler: true, vpsHandler: false, icon: Utensils },
  { id: 'meal_change', category: 'Meal Plan', description: 'Solicitar outra opção', edgeHandler: true, vpsHandler: false, icon: Utensils },
  { id: 'meal_recipe', category: 'Meal Plan', description: 'Ver receita', edgeHandler: true, vpsHandler: false, icon: Utensils },
  { id: 'meal_shopping', category: 'Meal Plan', description: 'Lista de compras', edgeHandler: true, vpsHandler: false, icon: Utensils },
  
  // Dr. Vital - Exames
  { id: 'vital_analyze', category: 'Dr. Vital', description: 'Iniciar análise de exame', edgeHandler: true, vpsHandler: false, icon: Stethoscope },
  { id: 'vital_more', category: 'Dr. Vital', description: 'Adicionar mais imagens', edgeHandler: true, vpsHandler: false, icon: Stethoscope },
  { id: 'vital_cancel', category: 'Dr. Vital', description: 'Cancelar análise', edgeHandler: true, vpsHandler: false, icon: Stethoscope },
  { id: 'vital_wait', category: 'Dr. Vital', description: 'Aguardar processamento', edgeHandler: true, vpsHandler: false, icon: Stethoscope },
  { id: 'vital_retry', category: 'Dr. Vital', description: 'Tentar novamente', edgeHandler: true, vpsHandler: false, icon: Stethoscope },
  { id: 'vital_understood', category: 'Dr. Vital', description: 'Entendi o resultado', edgeHandler: true, vpsHandler: false, icon: Stethoscope },
  { id: 'vital_question', category: 'Dr. Vital', description: 'Fazer pergunta', edgeHandler: true, vpsHandler: false, icon: Stethoscope },
  { id: 'vital_full_report', category: 'Dr. Vital', description: 'Ver relatório completo', edgeHandler: true, vpsHandler: false, icon: Stethoscope },
  { id: 'vital_share', category: 'Dr. Vital', description: 'Compartilhar relatório', edgeHandler: true, vpsHandler: false, icon: Stethoscope },
  
  // Água
  { id: 'water_250ml', category: 'Água', description: 'Registrar 250ml', edgeHandler: false, vpsHandler: true, icon: Droplets },
  { id: 'water_500ml', category: 'Água', description: 'Registrar 500ml', edgeHandler: false, vpsHandler: true, icon: Droplets },
  { id: 'water_not_yet', category: 'Água', description: 'Lembrar depois', edgeHandler: false, vpsHandler: true, icon: Droplets },
  { id: 'water_view_progress', category: 'Água', description: 'Ver progresso do dia', edgeHandler: true, vpsHandler: false, icon: Droplets },
  
  // Peso
  { id: 'weigh_now', category: 'Peso', description: 'Pesar agora', edgeHandler: false, vpsHandler: true, icon: Scale },
  { id: 'weigh_later', category: 'Peso', description: 'Lembrar depois', edgeHandler: false, vpsHandler: true, icon: Scale },
  { id: 'weigh_view_evolution', category: 'Peso', description: 'Ver evolução', edgeHandler: false, vpsHandler: true, icon: Scale },
  
  // Humor/Check-in
  { id: 'feeling_great', category: 'Check-in', description: 'Estou ótimo', edgeHandler: true, vpsHandler: true, icon: Smile },
  { id: 'feeling_ok', category: 'Check-in', description: 'Estou normal', edgeHandler: true, vpsHandler: true, icon: Smile },
  { id: 'feeling_bad', category: 'Check-in', description: 'Não muito bem', edgeHandler: true, vpsHandler: true, icon: Smile },
  
  // Medicação
  { id: 'med_taken', category: 'Medicação', description: 'Tomei medicação', edgeHandler: false, vpsHandler: true, icon: Bell },
  { id: 'med_later', category: 'Medicação', description: 'Lembrar depois', edgeHandler: false, vpsHandler: true, icon: Bell },
  
  // Treino
  { id: 'start_workout', category: 'Treino', description: 'Começar treino', edgeHandler: false, vpsHandler: true, icon: Dumbbell },
  { id: 'skip_today', category: 'Treino', description: 'Pular hoje', edgeHandler: false, vpsHandler: true, icon: Dumbbell },
  
  // Desafios
  { id: 'accept_challenge', category: 'Desafios', description: 'Aceitar desafio', edgeHandler: false, vpsHandler: true, icon: Target },
  { id: 'decline_challenge', category: 'Desafios', description: 'Recusar desafio', edgeHandler: false, vpsHandler: true, icon: Target },
  
  // Missões
  { id: 'start_missions', category: 'Missões', description: 'Começar missões', edgeHandler: false, vpsHandler: true, icon: Target },
  { id: 'view_app', category: 'Geral', description: 'Ver no app', edgeHandler: false, vpsHandler: true, icon: Menu },
  
  // Re-engagement
  { id: 'return_now', category: 'Re-engagement', description: 'Voltar agora', edgeHandler: false, vpsHandler: true, icon: Bell },
  { id: 'remind_later', category: 'Re-engagement', description: 'Lembrar depois', edgeHandler: false, vpsHandler: true, icon: Bell },
  
  // Relatórios
  { id: 'view_report', category: 'Relatórios', description: 'Ver relatório', edgeHandler: false, vpsHandler: true, icon: FileText },
  
  // Geral
  { id: 'menu', category: 'Geral', description: 'Menu principal', edgeHandler: true, vpsHandler: true, icon: Menu },
  { id: 'help', category: 'Geral', description: 'Ajuda', edgeHandler: true, vpsHandler: true, icon: HelpCircle },
  { id: 'yes', category: 'Geral', description: 'Sim', edgeHandler: false, vpsHandler: false, icon: Menu },
  { id: 'no', category: 'Geral', description: 'Não', edgeHandler: false, vpsHandler: false, icon: Menu },
];

// Templates que usam cada botão
const BUTTON_TEMPLATES: Record<string, string[]> = {
  'sofia_confirm': ['createSofiaAnalysisComplete', 'createSofiaDetails', 'createSofiaEditPrompt'],
  'sofia_edit': ['createSofiaAnalysisComplete'],
  'sofia_details': ['createSofiaAnalysisComplete'],
  'sofia_new_photo': ['createSofiaPostConfirm', 'createSofiaDetails', 'createWelcomeMessage'],
  'sofia_tips': ['createSofiaPostConfirm'],
  'sofia_meal_plan': ['createWelcomeMessage'],
  'meal_accept': ['createMealPlanSuggestion'],
  'meal_change': ['createMealPlanSuggestion', 'createMealRecipe'],
  'meal_recipe': ['createMealPlanSuggestion'],
  'meal_shopping': ['createMealRecipe'],
  'vital_understood': ['createVitalAnalysisComplete', 'createVitalQuestionPrompt'],
  'vital_question': ['createVitalAnalysisComplete', 'createVitalFullReport', 'createVitalQuestionPrompt'],
  'vital_full_report': ['createVitalAnalysisComplete'],
  'vital_share': ['createVitalFullReport'],
  'feeling_great': ['createDailyCheckin'],
  'feeling_ok': ['createDailyCheckin'],
  'feeling_bad': ['createDailyCheckin'],
  'water_250ml': ['templates.waterReminder'],
  'water_500ml': ['templates.waterReminder'],
  'water_not_yet': ['templates.waterReminder'],
  'water_view_progress': ['templates.waterReminder'],
  'weigh_now': ['templates.weightReminder'],
  'weigh_later': ['templates.weightReminder'],
  'weigh_view_evolution': ['templates.weightReminder'],
  'menu': ['createSofiaPostConfirm', 'createCheckinResponse'],
  'help': ['createWelcomeMessage'],
};

export function WhatsAppButtonMapping() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Categorias únicas
  const categories = useMemo(() => {
    return ['all', ...new Set(ALL_BUTTONS.map(b => b.category))];
  }, []);

  // Botões filtrados
  const filteredButtons = useMemo(() => {
    return ALL_BUTTONS.filter(btn => {
      const matchesSearch = btn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           btn.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || btn.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = ALL_BUTTONS.length;
    const withEdgeHandler = ALL_BUTTONS.filter(b => b.edgeHandler).length;
    const withVpsHandler = ALL_BUTTONS.filter(b => b.vpsHandler).length;
    const fullyImplemented = ALL_BUTTONS.filter(b => b.edgeHandler || b.vpsHandler).length;
    const missing = ALL_BUTTONS.filter(b => !b.edgeHandler && !b.vpsHandler).length;
    
    return { total, withEdgeHandler, withVpsHandler, fullyImplemented, missing };
  }, []);

  const getStatusBadge = (btn: typeof ALL_BUTTONS[0]) => {
    if (btn.edgeHandler && btn.vpsHandler) {
      return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Ambos</Badge>;
    }
    if (btn.edgeHandler) {
      return <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Edge</Badge>;
    }
    if (btn.vpsHandler) {
      return <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">VPS</Badge>;
    }
    return <Badge variant="destructive">Sem Handler</Badge>;
  };

  const getStatusIcon = (btn: typeof ALL_BUTTONS[0]) => {
    if (btn.edgeHandler || btn.vpsHandler) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mapeamento de Botões WhatsApp
          </h3>
          <p className="text-sm text-muted-foreground">
            Visualização de todos os botões interativos e seus handlers
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Botões</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.withEdgeHandler}</p>
            <p className="text-xs text-muted-foreground">Edge Function</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.withVpsHandler}</p>
            <p className="text-xs text-muted-foreground">VPS Node.js</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.fullyImplemented}</p>
            <p className="text-xs text-muted-foreground">Implementados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.missing}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar botão..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.slice(0, 8).map(cat => (
            <Button
              key={cat}
              variant={activeCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'all' ? 'Todos' : cat}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">📋 Lista</TabsTrigger>
          <TabsTrigger value="matrix">📊 Matriz</TabsTrigger>
          <TabsTrigger value="flow">🔄 Fluxo</TabsTrigger>
        </TabsList>

        {/* Tab: Lista */}
        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="divide-y">
                  {filteredButtons.map((btn) => {
                    const Icon = btn.icon;
                    const templates = BUTTON_TEMPLATES[btn.id] || [];
                    
                    return (
                      <div key={btn.id} className="flex items-center gap-3 p-4 hover:bg-muted/50">
                        <div className="flex items-center gap-2 w-10">
                          {getStatusIcon(btn)}
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-muted px-2 py-0.5 rounded">{btn.id}</code>
                            {getStatusBadge(btn)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{btn.description}</p>
                          {templates.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                              {templates.map(t => (
                                <Badge key={t} variant="outline" className="text-xs">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <Badge variant="secondary">{btn.category}</Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Matriz */}
        <TabsContent value="matrix">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Matriz de Cobertura por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.filter(c => c !== 'all').map(category => {
                  const categoryButtons = ALL_BUTTONS.filter(b => b.category === category);
                  const implemented = categoryButtons.filter(b => b.edgeHandler || b.vpsHandler).length;
                  const total = categoryButtons.length;
                  const percentage = Math.round((implemented / total) * 100);
                  
                  return (
                    <Card key={category}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{category}</span>
                          <Badge variant={percentage === 100 ? 'default' : 'secondary'}>
                            {percentage}%
                          </Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all ${percentage === 100 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {implemented}/{total} botões implementados
                        </p>
                        <div className="mt-3 space-y-1">
                          {categoryButtons.map(btn => (
                            <div key={btn.id} className="flex items-center gap-2 text-xs">
                              {btn.edgeHandler || btn.vpsHandler ? (
                                <CheckCircle className="h-3 w-3 text-green-500" />
                              ) : (
                                <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              )}
                              <code className="font-mono">{btn.id}</code>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Fluxo */}
        <TabsContent value="flow">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fluxo de Interação por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Sofia Flow */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <Utensils className="h-4 w-4" />
                    Sofia - Análise de Alimentos
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>📸 Foto enviada</Badge>
                    <ChevronRight className="h-4 w-4" />
                    <Badge variant="outline">Análise processada</Badge>
                    <ChevronRight className="h-4 w-4" />
                    <div className="flex gap-1">
                      <Badge className="bg-green-100 text-green-700">sofia_confirm</Badge>
                      <Badge className="bg-blue-100 text-blue-700">sofia_edit</Badge>
                      <Badge className="bg-purple-100 text-purple-700">sofia_details</Badge>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                    <Badge variant="outline">Registro salvo</Badge>
                    <ChevronRight className="h-4 w-4" />
                    <div className="flex gap-1">
                      <Badge className="bg-green-100 text-green-700">sofia_new_photo</Badge>
                      <Badge className="bg-blue-100 text-blue-700">sofia_tips</Badge>
                    </div>
                  </div>
                </div>

                {/* Dr. Vital Flow */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <Stethoscope className="h-4 w-4" />
                    Dr. Vital - Análise de Exames
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>🩺 Exame enviado</Badge>
                    <ChevronRight className="h-4 w-4" />
                    <div className="flex gap-1">
                      <Badge className="bg-green-100 text-green-700">vital_analyze</Badge>
                      <Badge className="bg-blue-100 text-blue-700">vital_more</Badge>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                    <Badge variant="outline">Análise processada</Badge>
                    <ChevronRight className="h-4 w-4" />
                    <div className="flex gap-1">
                      <Badge className="bg-green-100 text-green-700">vital_understood</Badge>
                      <Badge className="bg-purple-100 text-purple-700">vital_question</Badge>
                      <Badge className="bg-blue-100 text-blue-700">vital_full_report</Badge>
                    </div>
                  </div>
                </div>

                {/* Water Flow */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <Droplets className="h-4 w-4" />
                    Água - Hidratação
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>💧 Lembrete enviado</Badge>
                    <ChevronRight className="h-4 w-4" />
                    <div className="flex gap-1">
                      <Badge className="bg-green-100 text-green-700">water_250ml</Badge>
                      <Badge className="bg-blue-100 text-blue-700">water_500ml</Badge>
                      <Badge className="bg-yellow-100 text-yellow-700">water_not_yet</Badge>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                    <Badge variant="outline">Registro atualizado</Badge>
                    <ChevronRight className="h-4 w-4" />
                    <Badge className="bg-purple-100 text-purple-700">water_view_progress</Badge>
                  </div>
                </div>

                {/* Weight Flow */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium flex items-center gap-2 mb-4">
                    <Scale className="h-4 w-4" />
                    Peso - Monitoramento
                  </h4>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge>⚖️ Lembrete enviado</Badge>
                    <ChevronRight className="h-4 w-4" />
                    <div className="flex gap-1">
                      <Badge className="bg-green-100 text-green-700">weigh_now</Badge>
                      <Badge className="bg-yellow-100 text-yellow-700">weigh_later</Badge>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                    <Badge variant="outline">Peso digitado</Badge>
                    <ChevronRight className="h-4 w-4" />
                    <Badge className="bg-purple-100 text-purple-700">weigh_view_evolution</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}