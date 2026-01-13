// =====================================================
// ACHIEVEMENT TREE COMPONENT
// =====================================================
// Visualização de skill tree com badges
// Requirements: 2.7
// =====================================================

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  Trophy, 
  Lock, 
  Star,
  Flame,
  Apple,
  Activity,
  Target,
  Crown,
  Medal,
  Award,
  Sparkles,
  ChefHat,
  Dumbbell,
  Heart,
  Shield,
  Zap,
} from 'lucide-react';
import { useAchievements } from '@/hooks/dr-vital/useAchievements';
import type { Achievement, AchievementCategory } from '@/types/dr-vital-revolution';

// =====================================================
// ICON MAPPING
// =====================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  star: Star,
  flame: Flame,
  crown: Crown,
  trophy: Trophy,
  medal: Medal,
  award: Award,
  'chef-hat': ChefHat,
  utensils: Apple,
  dumbbell: Dumbbell,
  zap: Zap,
  target: Target,
  shield: Shield,
  heart: Heart,
  sword: Activity,
};

// =====================================================
// ACHIEVEMENT BADGE COMPONENT
// =====================================================

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

function AchievementBadge({ achievement, size = 'md', onClick }: AchievementBadgeProps) {
  const isUnlocked = achievement.isUnlocked;
  const Icon = iconMap[achievement.icon] || Trophy;

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-20 h-20',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const categoryColors: Record<AchievementCategory, string> = {
    nutrition: 'from-green-500 to-emerald-600',
    exercise: 'from-blue-500 to-cyan-600',
    consistency: 'from-orange-500 to-amber-600',
    milestones: 'from-purple-500 to-pink-600',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative group transition-all duration-300',
        isUnlocked ? 'cursor-pointer hover:scale-110' : 'cursor-default'
      )}
    >
      {/* Badge circle */}
      <div
        className={cn(
          'rounded-full flex items-center justify-center transition-all',
          sizeClasses[size],
          isUnlocked
            ? `bg-gradient-to-br ${categoryColors[achievement.category]} shadow-lg`
            : 'bg-muted border-2 border-dashed border-muted-foreground/30'
        )}
      >
        {isUnlocked ? (
          <Icon className={cn(iconSizes[size], 'text-white')} />
        ) : (
          <Lock className={cn(iconSizes[size], 'text-muted-foreground/50')} />
        )}
      </div>

      {/* Sparkle effect for unlocked */}
      {isUnlocked && (
        <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Tooltip on hover */}
      <div className={cn(
        'absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg',
        'bg-popover border border-border shadow-lg',
        'opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none',
        'whitespace-nowrap z-10 text-sm'
      )}>
        <p className="font-medium">{achievement.name}</p>
        <p className="text-xs text-muted-foreground">{achievement.description}</p>
        {isUnlocked && achievement.unlockedAt && (
          <p className="text-xs text-green-500 mt-1">
            ✓ Desbloqueado em {new Date(achievement.unlockedAt).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </button>
  );
}

// =====================================================
// ACHIEVEMENT DETAIL MODAL
// =====================================================

interface AchievementDetailProps {
  achievement: Achievement;
  onClose: () => void;
}

function AchievementDetail({ achievement, onClose }: AchievementDetailProps) {
  const isUnlocked = achievement.isUnlocked;
  const Icon = iconMap[achievement.icon] || Trophy;

  const categoryColors: Record<AchievementCategory, string> = {
    nutrition: 'from-green-500 to-emerald-600',
    exercise: 'from-blue-500 to-cyan-600',
    consistency: 'from-orange-500 to-amber-600',
    milestones: 'from-purple-500 to-pink-600',
  };

  const categoryLabels: Record<AchievementCategory, string> = {
    nutrition: 'Nutrição',
    exercise: 'Exercício',
    consistency: 'Consistência',
    milestones: 'Marcos',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card 
        className="w-full max-w-sm mx-4 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent className="p-6 text-center space-y-4">
          {/* Badge */}
          <div className="flex justify-center">
            <div
              className={cn(
                'w-24 h-24 rounded-full flex items-center justify-center',
                isUnlocked
                  ? `bg-gradient-to-br ${categoryColors[achievement.category]} shadow-xl`
                  : 'bg-muted border-4 border-dashed border-muted-foreground/30'
              )}
            >
              {isUnlocked ? (
                <Icon className="w-12 h-12 text-white" />
              ) : (
                <Lock className="w-12 h-12 text-muted-foreground/50" />
              )}
            </div>
          </div>

          {/* Info */}
          <div>
            <span className={cn(
              'text-xs font-medium uppercase tracking-wide',
              isUnlocked ? 'text-primary' : 'text-muted-foreground'
            )}>
              {categoryLabels[achievement.category]}
            </span>
            <h3 className="text-xl font-bold mt-1">{achievement.name}</h3>
            <p className="text-muted-foreground mt-2">{achievement.description}</p>
          </div>

          {/* Status */}
          {isUnlocked ? (
            <div className="p-3 bg-green-500/10 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Desbloqueado em {new Date(achievement.unlockedAt!).toLocaleDateString('pt-BR')}
              </p>
              {achievement.reward && (
                <p className="text-xs text-muted-foreground mt-1">
                  Recompensa: {achievement.reward.type === 'xp' 
                    ? `${achievement.reward.value} XP` 
                    : achievement.reward.value}
                </p>
              )}
            </div>
          ) : (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                🔒 Continue progredindo para desbloquear
              </p>
            </div>
          )}

          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// CATEGORY SECTION
// =====================================================

interface CategorySectionProps {
  category: AchievementCategory;
  achievements: Achievement[];
  onSelectAchievement: (achievement: Achievement) => void;
}

function CategorySection({ category, achievements, onSelectAchievement }: CategorySectionProps) {
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  const categoryIcons: Record<AchievementCategory, React.ComponentType<{ className?: string }>> = {
    nutrition: Apple,
    exercise: Activity,
    consistency: Flame,
    milestones: Trophy,
  };

  const categoryLabels: Record<AchievementCategory, string> = {
    nutrition: 'Nutrição',
    exercise: 'Exercício',
    consistency: 'Consistência',
    milestones: 'Marcos',
  };

  const Icon = categoryIcons[category];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-primary" />
          <h3 className="font-medium">{categoryLabels[category]}</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {unlockedCount}/{totalCount}
        </span>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            onClick={() => onSelectAchievement(achievement)}
          />
        ))}
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface AchievementTreeProps {
  achievements?: Achievement[];
  className?: string;
  compact?: boolean;
}

export function AchievementTree({ achievements: propAchievements, className, compact = false }: AchievementTreeProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [activeTab, setActiveTab] = useState<AchievementCategory | 'all'>('all');

  // Use hook if no achievements provided
  const { achievements: hookAchievements, stats: hookStats, isLoading } = useAchievements();
  const achievements = propAchievements || hookAchievements;

  // Group by category
  const byCategory = achievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<AchievementCategory, Achievement[]>);

  const categories: AchievementCategory[] = ['consistency', 'nutrition', 'exercise', 'milestones'];

  // Stats
  const totalUnlocked = achievements.filter(a => a.isUnlocked).length;
  const totalAchievements = achievements.length;
  const progressPercentage = totalAchievements > 0 
    ? Math.round((totalUnlocked / totalAchievements) * 100) 
    : 0;

  // Loading state
  if (isLoading && !propAchievements) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="h-40 bg-muted rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // Compact mode - show recent unlocks only
  if (compact) {
    const recentUnlocks = achievements
      .filter(a => a.isUnlocked)
      .slice(0, 4);

    return (
      <div className={cn('space-y-3', className)}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {totalUnlocked}/{totalAchievements} conquistas
          </span>
          <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {recentUnlocks.length > 0 ? (
            recentUnlocks.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                size="sm"
                onClick={() => setSelectedAchievement(achievement)}
              />
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-2">
              Complete missões para desbloquear conquistas
            </p>
          )}
        </div>

        {selectedAchievement && (
          <AchievementDetail
            achievement={selectedAchievement}
            onClose={() => setSelectedAchievement(null)}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Conquistas
            </CardTitle>
            <div className="text-right">
              <span className="text-2xl font-bold">{totalUnlocked}</span>
              <span className="text-muted-foreground">/{totalAchievements}</span>
              <p className="text-xs text-muted-foreground">{progressPercentage}% completo</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AchievementCategory | 'all')}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="consistency">
                <Flame className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="nutrition">
                <Apple className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="exercise">
                <Activity className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="milestones">
                <Trophy className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-4">
              {categories.map((category) => (
                byCategory[category]?.length > 0 && (
                  <CategorySection
                    key={category}
                    category={category}
                    achievements={byCategory[category]}
                    onSelectAchievement={setSelectedAchievement}
                  />
                )
              ))}
            </TabsContent>

            {categories.map((category) => (
              <TabsContent key={category} value={category} className="mt-4">
                {byCategory[category]?.length > 0 ? (
                  <CategorySection
                    category={category}
                    achievements={byCategory[category]}
                    onSelectAchievement={setSelectedAchievement}
                  />
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma conquista nesta categoria
                  </p>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      {selectedAchievement && (
        <AchievementDetail
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </>
  );
}

export default AchievementTree;
