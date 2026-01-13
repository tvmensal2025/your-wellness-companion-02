// =====================================================
// DR. VITAL REVOLUTION PAGE
// =====================================================
// Página principal com todas as features do Dr. Vital
// Requirements: 1.1, 1.3, 1.5
// =====================================================

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Eye, 
  Clock,
  User,
  MessageCircle,
} from 'lucide-react';

// Components
import { HealthScoreCard } from './HealthScoreCard';
import { MetricCards, useMetricCards } from './MetricCards';
import { HealthQuestPanel } from './HealthQuestPanel';
import { BossBattleCard } from './BossBattleCard';
import { AchievementTree } from './AchievementTree';
import { HealthOraclePanel } from './HealthOraclePanel';
import { WhatIfSimulator } from './WhatIfSimulator';
import { HealthyTwinComparison } from './HealthyTwinComparison';
import { HealthTimeline } from './HealthTimeline';
import { TimelineComparison } from './TimelineComparison';
import { DrVitalAvatar } from './DrVitalAvatar';

// Hooks
import { useHealthScore } from '@/hooks/dr-vital/useHealthScore';
import { useHealthQuest } from '@/hooks/dr-vital/useHealthQuest';
import { useAchievements } from '@/hooks/dr-vital/useAchievements';

// =====================================================
// TAB DEFINITIONS
// =====================================================

type TabId = 'dashboard' | 'quest' | 'oracle' | 'timeline' | 'profile';

interface TabDefinition {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDefinition[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'quest', label: 'Health Quest', icon: <Gamepad2 className="w-4 h-4" /> },
  { id: 'oracle', label: 'Oracle', icon: <Eye className="w-4 h-4" /> },
  { id: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
  { id: 'profile', label: 'Perfil', icon: <User className="w-4 h-4" /> },
];

// =====================================================
// DASHBOARD TAB
// =====================================================

function DashboardTab() {
  const { score, trend } = useHealthScore();
  const { metrics } = useMetricCards();

  return (
    <div className="space-y-6">
      {/* Header with Avatar */}
      <div className="flex items-center gap-4">
        <DrVitalAvatar 
          healthScore={score} 
          size="lg"
          state="idle"
        />
        <div>
          <h1 className="text-2xl font-bold">Olá! 👋</h1>
          <p className="text-muted-foreground">
            Veja como está sua saúde hoje
          </p>
        </div>
      </div>

      {/* Health Score */}
      <HealthScoreCard />

      {/* Metric Cards */}
      <MetricCards metrics={metrics} />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <HealthOraclePanel compact />
        <HealthyTwinComparison compact />
      </div>
    </div>
  );
}

// =====================================================
// QUEST TAB
// =====================================================

function QuestTab() {
  const { bossBattles, achievements } = useHealthQuest();

  return (
    <div className="space-y-6">
      {/* Boss Battles */}
      {bossBattles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            ⚔️ Batalhas Ativas
          </h2>
          {bossBattles.map(battle => (
            <BossBattleCard key={battle.id} mission={battle} />
          ))}
        </div>
      )}

      {/* Daily Missions */}
      <HealthQuestPanel />

      {/* Achievements */}
      <AchievementTree achievements={achievements} />
    </div>
  );
}

// =====================================================
// ORACLE TAB
// =====================================================

function OracleTab() {
  return (
    <div className="space-y-6">
      {/* Risk Predictions */}
      <HealthOraclePanel />

      {/* What-If Simulator */}
      <WhatIfSimulator />

      {/* Healthy Twin */}
      <HealthyTwinComparison />
    </div>
  );
}

// =====================================================
// TIMELINE TAB
// =====================================================

function TimelineTab() {
  return (
    <div className="space-y-6">
      {/* Timeline Comparison */}
      <TimelineComparison />

      {/* Full Timeline */}
      <HealthTimeline showFilters />
    </div>
  );
}

// =====================================================
// PROFILE TAB
// =====================================================

function ProfileTab() {
  const { score } = useHealthScore();
  const { healthLevel, streak } = useHealthQuest();
  const { achievements } = useAchievements();

  return (
    <div className="space-y-6">
      {/* Avatar with customization */}
      <div className="flex flex-col items-center py-8">
        <DrVitalAvatar 
          healthScore={score} 
          size="lg"
          state="idle"
        />
        <div className="mt-4 text-center">
          <h2 className="text-xl font-bold">Nível {healthLevel?.level || 1}</h2>
          <p className="text-muted-foreground">{healthLevel?.title || 'Iniciante'}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold text-primary">{score || 0}</p>
          <p className="text-xs text-muted-foreground">Health Score</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold text-orange-500">{streak?.currentStreak || 0}</p>
          <p className="text-xs text-muted-foreground">Dias de Streak</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <p className="text-2xl font-bold text-yellow-500">{streak?.totalXpEarned || 0}</p>
          <p className="text-xs text-muted-foreground">XP Total</p>
        </div>
      </div>

      {/* Achievements Summary */}
      <AchievementTree achievements={achievements} />
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface DrVitalRevolutionPageProps {
  className?: string;
  defaultTab?: TabId;
}

export function DrVitalRevolutionPage({ 
  className,
  defaultTab = 'dashboard',
}: DrVitalRevolutionPageProps) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);

  return (
    <div className={cn('min-h-screen bg-background', className)}>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        {/* Content */}
        <div className="container max-w-2xl mx-auto px-4 pb-24">
          <TabsContent value="dashboard" className="mt-0">
            <DashboardTab />
          </TabsContent>
          
          <TabsContent value="quest" className="mt-0">
            <QuestTab />
          </TabsContent>
          
          <TabsContent value="oracle" className="mt-0">
            <OracleTab />
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-0">
            <TimelineTab />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-0">
            <ProfileTab />
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t safe-area-pb">
          <TabsList className="w-full h-16 rounded-none bg-transparent justify-around">
            {TABS.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'flex-1 flex flex-col items-center gap-1 h-full rounded-none',
                  'data-[state=active]:bg-transparent data-[state=active]:text-primary',
                  'data-[state=inactive]:text-muted-foreground'
                )}
              >
                {tab.icon}
                <span className="text-xs">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
}

export default DrVitalRevolutionPage;
