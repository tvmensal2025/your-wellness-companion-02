# 🚀 Implementação - Sistema "Minhas Metas" Melhorado

> **Guia Prático de Implementação**  
> **Data:** 12 de Janeiro de 2026

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Redesign Visual (PRIORIDADE ALTA)

- [ ] **1.1 Criar novo dashboard hero**
  - [ ] Componente `GoalsHeroStats.tsx`
  - [ ] Estatísticas em tempo real
  - [ ] Animações de entrada
  
- [ ] **1.2 Implementar cards modernos**
  - [x] Componente `ModernGoalCard.tsx` ✅
  - [ ] Integrar com página principal
  - [ ] Testes de responsividade
  
- [ ] **1.3 Adicionar filtros avançados**
  - [ ] Componente `GoalsFilters.tsx`
  - [ ] Múltiplos critérios
  - [ ] Salvamento de preferências
  
- [ ] **1.4 Implementar visualizações**
  - [ ] Grid view (padrão)
  - [ ] List view (compacta)
  - [ ] Kanban view (por status)
  - [ ] Timeline view (cronológica)

### Fase 2: Gamificação (PRIORIDADE ALTA)

- [ ] **2.1 Sistema de níveis**
  - [ ] Tabela `user_goal_levels`
  - [ ] Cálculo de XP
  - [ ] Componente de level up
  
- [ ] **2.2 Conquistas**
  - [ ] Tabela `goal_achievements`
  - [ ] 20+ conquistas únicas
  - [ ] Galeria de conquistas
  
- [ ] **2.3 Streaks**
  - [ ] Tabela `goal_streaks`
  - [ ] Contador automático
  - [ ] Proteção de streak

### Fase 3: Funcionalidades Avançadas (PRIORIDADE MÉDIA)

- [ ] **3.1 Metas inteligentes com IA**
- [ ] **3.2 Sub-metas (milestones)**
- [ ] **3.3 Metas recorrentes**
- [ ] **3.4 Sistema de accountability**

---

## 💻 CÓDIGO PRONTO PARA USO

### 1. Hero Stats Component

```typescript
// src/components/goals/GoalsHeroStats.tsx
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Target, Trophy, Flame, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const GoalsHeroStats = () => {
  const { data: stats } = useQuery({
    queryKey: ['goals-hero-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Buscar estatísticas
      const { data: goals } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id);

      const total = goals?.length || 0;
      const completed = goals?.filter(g => g.status === 'concluida').length || 0;
      const inProgress = goals?.filter(g => g.status === 'em_progresso').length || 0;
      
      // Calcular streak (mock - implementar lógica real)
      const streak = 15;

      return { total, completed, inProgress, streak };
    }
  });

  const statCards = [
    {
      icon: Target,
      label: "Metas Ativas",
      value: stats?.inProgress || 0,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      icon: Trophy,
      label: "Concluídas",
      value: stats?.completed || 0,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      icon: Flame,
      label: "Dias de Streak",
      value: stats?.streak || 0,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    },
    {
      icon: TrendingUp,
      label: "Taxa de Sucesso",
      value: stats?.total ? `${Math.round((stats.completed / stats.total) * 100)}%` : "0%",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
            
            <div className="relative p-4 space-y-2">
              <div className="flex items-center justify-between">
                <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
                <div className={`px-2 py-1 rounded-full ${stat.bgColor} ${stat.textColor} text-xs font-medium`}>
                  Hoje
                </div>
              </div>
              
              <div>
                <motion.div 
                  className="text-3xl font-bold"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
```

### 2. Filtros Avançados

```typescript
// src/components/goals/GoalsFilters.tsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Filter, X, Grid, List, Columns, Calendar } from "lucide-react";
import { useState } from "react";

interface GoalsFiltersProps {
  onFilterChange: (filters: any) => void;
  onViewChange: (view: 'grid' | 'list' | 'kanban' | 'timeline') => void;
  currentView: string;
}

export const GoalsFilters = ({ 
  onFilterChange, 
  onViewChange, 
  currentView 
}: GoalsFiltersProps) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const categories = [
    { value: 'peso', label: '⚖️ Peso' },
    { value: 'exercicio', label: '🏃 Exercício' },
    { value: 'alimentacao', label: '🥗 Alimentação' },
    { value: 'habitos', label: '📝 Hábitos' },
    { value: 'sono', label: '😴 Sono' },
    { value: 'agua', label: '💧 Hidratação' }
  ];

  const difficulties = [
    { value: 'facil', label: '😊 Fácil' },
    { value: 'medio', label: '😐 Médio' },
    { value: 'dificil', label: '😤 Difícil' }
  ];

  const statuses = [
    { value: 'pendente', label: '⏳ Pendente' },
    { value: 'em_progresso', label: '🔄 Em Progresso' },
    { value: 'concluida', label: '✅ Concluída' }
  ];

  const views = [
    { value: 'grid', icon: Grid, label: 'Grade' },
    { value: 'list', icon: List, label: 'Lista' },
    { value: 'kanban', icon: Columns, label: 'Kanban' },
    { value: 'timeline', icon: Calendar, label: 'Timeline' }
  ];

  return (
    <div className="space-y-4">
      {/* View Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filtros e Visualização
        </h3>
        
        <div className="flex gap-1">
          {views.map((view) => (
            <Button
              key={view.value}
              variant={currentView === view.value ? "default" : "outline"}
              size="sm"
              onClick={() => onViewChange(view.value as any)}
              className="gap-2"
            >
              <view.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{view.label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select onValueChange={(value) => onFilterChange({ category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onFilterChange({ difficulty: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Dificuldade" />
          </SelectTrigger>
          <SelectContent>
            {difficulties.map((diff) => (
              <SelectItem key={diff.value} value={diff.value}>
                {diff.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={(value) => onFilterChange({ status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge key={filter} variant="secondary" className="gap-1">
              {filter}
              <X className="w-3 h-3 cursor-pointer" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 3. Página Principal Atualizada

```typescript
// src/pages/GoalsPageV2.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { GoalsHeroStats } from '@/components/goals/GoalsHeroStats';
import { GoalsFilters } from '@/components/goals/GoalsFilters';
import { ModernGoalCard } from '@/components/goals/ModernGoalCard';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { motion } from 'framer-motion';

export default function GoalsPageV2() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'kanban' | 'timeline'>('grid');
  const [filters, setFilters] = useState({});

  const { data: goals, isLoading, refetch } = useQuery({
    queryKey: ['user-goals', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id);

      // Aplicar filtros
      if (filters.category) query = query.eq('category', filters.category);
      if (filters.difficulty) query = query.eq('difficulty', filters.difficulty);
      if (filters.status) query = query.eq('status', filters.status);

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">🎯 Minhas Metas</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e conquiste seus objetivos
          </p>
        </div>
        
        <Button 
          onClick={() => setCreateDialogOpen(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Nova Meta
        </Button>
      </div>

      {/* Hero Stats */}
      <GoalsHeroStats />

      {/* Filters */}
      <GoalsFilters
        onFilterChange={setFilters}
        onViewChange={setViewMode}
        currentView={viewMode}
      />

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : goals && goals.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {goals.map((goal, index) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <ModernGoalCard
                goal={goal}
                onUpdate={refetch}
                onViewDetails={() => console.log('View details:', goal.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Nenhuma meta encontrada. Crie sua primeira meta!
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Meta
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <CreateGoalDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={refetch}
      />
    </div>
  );
}
```

---

## 🗄️ MIGRAÇÕES DO BANCO DE DADOS

### 1. Adicionar Campos de Gamificação

```sql
-- supabase/migrations/20260112_add_goal_gamification.sql

-- Adicionar campos de gamificação à tabela user_goals
ALTER TABLE public.user_goals
ADD COLUMN IF NOT EXISTS streak_days integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_update_date date,
ADD COLUMN IF NOT EXISTS xp_earned integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS level integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS evidence_urls text[],
ADD COLUMN IF NOT EXISTS participant_ids uuid[];

-- Criar tabela de conquistas
CREATE TABLE IF NOT EXISTS public.goal_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type text NOT NULL,
  achievement_name text NOT NULL,
  achievement_description text,
  icon text,
  rarity text DEFAULT 'common', -- common, rare, epic, legendary
  unlocked_at timestamp DEFAULT now(),
  progress integer DEFAULT 0,
  total_required integer DEFAULT 1,
  metadata jsonb,
  created_at timestamp DEFAULT now()
);

-- Criar tabela de streaks
CREATE TABLE IF NOT EXISTS public.goal_streaks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES user_goals(id) ON DELETE CASCADE,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  last_update_date date,
  streak_type text DEFAULT 'daily', -- daily, weekly, monthly
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Criar tabela de níveis
CREATE TABLE IF NOT EXISTS public.user_goal_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_level integer DEFAULT 1,
  current_xp integer DEFAULT 0,
  total_xp integer DEFAULT 0,
  level_title text DEFAULT 'Iniciante',
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_goal_achievements_user ON goal_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_streaks_user ON goal_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_streaks_goal ON goal_streaks(goal_id);

-- RLS Policies
ALTER TABLE goal_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goal_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON goal_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streaks" ON goal_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own level" ON user_goal_levels
  FOR SELECT USING (auth.uid() = user_id);
```

### 2. Função para Calcular Streak

```sql
-- Função para atualizar streak automaticamente
CREATE OR REPLACE FUNCTION update_goal_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar streak quando meta é atualizada
  IF NEW.current_value > OLD.current_value THEN
    -- Verificar se é atualização no mesmo dia
    IF NEW.last_update_date = CURRENT_DATE THEN
      -- Mesmo dia, não incrementa streak
      RETURN NEW;
    ELSIF NEW.last_update_date = CURRENT_DATE - INTERVAL '1 day' THEN
      -- Dia consecutivo, incrementa streak
      NEW.streak_days := OLD.streak_days + 1;
      NEW.last_update_date := CURRENT_DATE;
    ELSE
      -- Quebrou o streak, reinicia
      NEW.streak_days := 1;
      NEW.last_update_date := CURRENT_DATE;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar streak
DROP TRIGGER IF EXISTS trigger_update_goal_streak ON user_goals;
CREATE TRIGGER trigger_update_goal_streak
  BEFORE UPDATE ON user_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_goal_streak();
```

---

## 🎯 PRÓXIMOS PASSOS

1. **Testar os componentes criados**
   ```bash
   npm run dev
   ```

2. **Executar migrações**
   ```bash
   supabase db push
   ```

3. **Validar responsividade**
   - Testar em mobile
   - Testar em tablet
   - Testar em desktop

4. **Coletar feedback**
   - Usuários beta
   - Equipe interna
   - Métricas de uso

5. **Iterar e melhorar**
   - Ajustar baseado em feedback
   - Adicionar funcionalidades
   - Otimizar performance

---

*Documento criado por Kiro AI - Janeiro 2026*
