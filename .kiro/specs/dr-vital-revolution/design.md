# Design Document: Dr. Vital Revolution

## Overview

Este documento descreve a arquitetura técnica para transformar o Dr. Vital em uma experiência de saúde revolucionária, gamificada e preditiva. O sistema será construído sobre a infraestrutura existente do Supabase, mantendo a integração YOLO → Gemini para análise de imagens, e adicionando novos módulos para gamificação, previsões e interatividade.

### Princípios de Design

1. **Modularidade**: Cada feature é um módulo independente que pode ser ativado/desativado
2. **Performance**: Lazy loading e caching agressivo para dados frequentes
3. **Escalabilidade**: Arquitetura preparada para milhares de usuários simultâneos
4. **Acessibilidade**: Interface responsiva e acessível (WCAG 2.1 AA)
5. **Segurança**: Dados médicos protegidos com RLS e criptografia

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + TypeScript)                  │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Dashboard  │  │  Health Quest│  │ Health Oracle│  │   Timeline   │ │
│  │   Command    │  │  Gamification│  │  Predictions │  │   Visual     │ │
│  │   Center     │  │              │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Avatar 3D  │  │    Voice     │  │ Notifications│  │   Reports    │ │
│  │   Animated   │  │   Assistant  │  │   Smart      │  │   Premium    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                              HOOKS LAYER                                 │
│  useHealthScore │ useHealthQuest │ useHealthOracle │ useWearables       │
│  useVoiceInput  │ useNotifications │ useTimeline │ useReports           │
├─────────────────────────────────────────────────────────────────────────┤
│                            SERVICES LAYER                                │
│  healthScoreService │ gamificationService │ predictionService           │
│  wearableService │ notificationService │ reportService                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE EDGE FUNCTIONS                          │
├─────────────────────────────────────────────────────────────────────────┤
│  dr-vital-enhanced (existing) │ health-score-calculator                  │
│  health-quest-engine │ health-oracle-predictor │ notification-scheduler  │
│  report-generator │ wearable-sync                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           SUPABASE DATABASE                              │
├─────────────────────────────────────────────────────────────────────────┤
│  health_scores │ health_missions │ health_achievements │ health_streaks │
│  health_predictions │ health_timeline_events │ notification_queue       │
│  shared_reports │ wearable_data │ avatar_customizations                  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Health Command Center Dashboard

```typescript
// src/components/dr-vital/HealthCommandCenter.tsx
interface HealthCommandCenterProps {
  userId: string;
}

interface HealthScoreData {
  score: number;           // 0-100
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
  breakdown: {
    nutrition: number;     // 0-25
    exercise: number;      // 0-25
    sleep: number;         // 0-25
    mental: number;        // 0-25
  };
}

interface MetricCard {
  id: string;
  type: 'weight' | 'sleep' | 'exercise' | 'nutrition' | 'mood';
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  isAlert: boolean;
  alertMessage?: string;
}
```

### 2. Health Quest Gamification System

```typescript
// src/components/dr-vital/HealthQuestSystem.tsx
interface HealthMission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'boss_battle' | 'achievement';
  xpReward: number;
  progress: number;        // 0-100
  isCompleted: boolean;
  expiresAt?: Date;
  relatedExamId?: string;  // For boss battles
}

interface HealthStreak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: Date;
  bonusXpEarned: number;
}

interface HealthLevel {
  level: number;
  currentXp: number;
  xpToNextLevel: number;
  title: string;           // "Iniciante", "Guerreiro da Saúde", etc.
  unlockedFeatures: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  category: 'nutrition' | 'exercise' | 'consistency' | 'milestones';
}
```

### 3. Health Oracle Prediction System

```typescript
// src/components/dr-vital/HealthOracle.tsx
interface HealthPrediction {
  id: string;
  riskType: string;        // "diabetes", "hypertension", etc.
  probability: number;     // 0-100
  timeframe: '3_months' | '6_months' | '1_year';
  factors: RiskFactor[];
  recommendations: string[];
  lastUpdated: Date;
}

interface RiskFactor {
  name: string;
  impact: 'high' | 'medium' | 'low';
  currentValue: number;
  idealValue: number;
  unit: string;
}

interface WhatIfSimulation {
  inputChanges: Record<string, number>;
  originalPredictions: HealthPrediction[];
  simulatedPredictions: HealthPrediction[];
  improvementPercentage: number;
}

interface HealthyTwin {
  demographics: {
    age: number;
    gender: string;
    height: number;
  };
  idealMetrics: {
    weight: number;
    bmi: number;
    bodyFat: number;
    sleepHours: number;
    exerciseMinutes: number;
  };
  comparisonScore: number; // How close user is to ideal
}
```

### 4. Avatar 3D System

```typescript
// src/components/dr-vital/DrVitalAvatar.tsx
type AvatarState = 'idle' | 'thinking' | 'talking' | 'listening' | 'celebrating' | 'concerned';
type AvatarMood = 'happy' | 'neutral' | 'concerned' | 'excited';

interface AvatarCustomization {
  outfit: string;
  accessory?: string;
  background?: string;
  unlockedItems: string[];
}

interface DrVitalAvatarProps {
  state: AvatarState;
  mood: AvatarMood;
  customization: AvatarCustomization;
  onAnimationComplete?: () => void;
}
```

### 5. Wearable Integration

```typescript
// src/services/dr-vital/wearableService.ts
type WearableProvider = 'apple_health' | 'google_fit' | 'garmin';

interface WearableData {
  provider: WearableProvider;
  heartRate?: {
    current: number;
    resting: number;
    max: number;
  };
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  sleepData?: {
    totalHours: number;
    deepSleep: number;
    remSleep: number;
    quality: number;
  };
  lastSynced: Date;
}

interface WearableAnomaly {
  type: 'heart_rate' | 'sleep' | 'activity';
  severity: 'warning' | 'alert';
  value: number;
  threshold: number;
  message: string;
  detectedAt: Date;
}
```

### 6. Voice Assistant

```typescript
// src/hooks/dr-vital/useVoiceAssistant.ts
interface VoiceAssistantState {
  isListening: boolean;
  isProcessing: boolean;
  transcript: string;
  error?: string;
}

interface VoiceAssistantConfig {
  language: 'pt-BR';
  autoSend: boolean;
  enableTTS: boolean;
}
```

### 7. Smart Notifications

```typescript
// src/services/dr-vital/notificationService.ts
type NotificationType = 
  | 'morning_briefing'
  | 'medication_reminder'
  | 'contextual_reminder'
  | 're_engagement'
  | 'weekly_report'
  | 'urgent_exam';

interface SmartNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledFor: Date;
  sentAt?: Date;
  readAt?: Date;
  actionUrl?: string;
}
```

### 8. Health Timeline

```typescript
// src/components/dr-vital/HealthTimeline.tsx
type TimelineEventType = 
  | 'weight_change'
  | 'exam_result'
  | 'achievement'
  | 'goal_reached'
  | 'consultation'
  | 'medication_change';

interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  title: string;
  description: string;
  date: Date;
  isMilestone: boolean;
  metadata: Record<string, any>;
  icon: string;
}

interface TimelineFilter {
  types: TimelineEventType[];
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface TimelineComparison {
  period1: { start: Date; end: Date; events: TimelineEvent[] };
  period2: { start: Date; end: Date; events: TimelineEvent[] };
  insights: string[];
}
```

### 9. Premium Reports

```typescript
// src/services/dr-vital/reportService.ts
interface HealthReport {
  id: string;
  userId: string;
  type: 'complete' | 'summary' | 'exam_focused';
  period: { start: Date; end: Date };
  generatedAt: Date;
  pdfUrl?: string;
  shareableLink?: string;
  expiresAt?: Date;
  downloadCount: number;
  aiAnalysis: string;
  recommendations: string[];
}

interface ShareableReportAccess {
  reportId: string;
  accessToken: string;
  expiresAt: Date;
  accessedAt?: Date;
  accessedBy?: string;
}
```

## Data Models

### Database Schema (Supabase)

```sql
-- Health Score tracking
CREATE TABLE health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  nutrition_score INTEGER CHECK (nutrition_score >= 0 AND nutrition_score <= 25),
  exercise_score INTEGER CHECK (exercise_score >= 0 AND exercise_score <= 25),
  sleep_score INTEGER CHECK (sleep_score >= 0 AND sleep_score <= 25),
  mental_score INTEGER CHECK (mental_score >= 0 AND mental_score <= 25),
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, DATE(calculated_at))
);

-- Gamification: Missions
CREATE TABLE health_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT CHECK (type IN ('daily', 'weekly', 'boss_battle', 'achievement')),
  xp_reward INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  related_exam_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification: Streaks
CREATE TABLE health_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  total_xp_earned INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gamification: Achievements
CREATE TABLE health_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT CHECK (category IN ('nutrition', 'exercise', 'consistency', 'milestones')),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_key)
);

-- Predictions
CREATE TABLE health_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  risk_type TEXT NOT NULL,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  timeframe TEXT CHECK (timeframe IN ('3_months', '6_months', '1_year')),
  factors JSONB DEFAULT '[]',
  recommendations JSONB DEFAULT '[]',
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Timeline Events
CREATE TABLE health_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  is_milestone BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications Queue
CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  scheduled_for TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shared Reports
CREATE TABLE shared_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT CHECK (report_type IN ('complete', 'summary', 'exam_focused')),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  pdf_url TEXT,
  access_token TEXT UNIQUE,
  expires_at TIMESTAMPTZ,
  download_count INTEGER DEFAULT 0,
  ai_analysis TEXT,
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wearable Data
CREATE TABLE wearable_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT CHECK (provider IN ('apple_health', 'google_fit', 'garmin')),
  heart_rate_current INTEGER,
  heart_rate_resting INTEGER,
  steps INTEGER,
  active_minutes INTEGER,
  calories_burned INTEGER,
  sleep_hours DECIMAL(4,2),
  sleep_quality INTEGER,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  data_date DATE NOT NULL,
  UNIQUE(user_id, provider, data_date)
);

-- Avatar Customizations
CREATE TABLE avatar_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_outfit TEXT DEFAULT 'default',
  current_accessory TEXT,
  current_background TEXT DEFAULT 'clinic',
  unlocked_items JSONB DEFAULT '["default"]',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_health_scores_user_date ON health_scores(user_id, calculated_at DESC);
CREATE INDEX idx_health_missions_user_active ON health_missions(user_id, is_completed, expires_at);
CREATE INDEX idx_health_timeline_user_date ON health_timeline_events(user_id, event_date DESC);
CREATE INDEX idx_notification_queue_scheduled ON notification_queue(scheduled_for, sent_at);
CREATE INDEX idx_wearable_data_user_date ON wearable_data(user_id, data_date DESC);
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Health Score Calculation and Color Mapping

*For any* user with health data, the calculated Health Score SHALL be between 0 and 100, and the color mapping SHALL follow: score < 40 → red, 40-69 → yellow, 70+ → green.

**Validates: Requirements 1.1, 1.2**

### Property 2: Health Score Component Sum

*For any* Health Score calculation, the sum of nutrition_score + exercise_score + sleep_score + mental_score SHALL equal the total score, with each component between 0-25.

**Validates: Requirements 1.1**

### Property 3: Timeline Event Chronological Order

*For any* Health Timeline query, events SHALL be returned in chronological order (newest first by default), and all events SHALL fall within the last 30 days when no filter is applied.

**Validates: Requirements 1.3, 8.1**

### Property 4: Metric Alert Threshold Detection

*For any* metric card, if the value crosses the defined threshold (e.g., sleep < 6h, exercise streak = 0), the isAlert flag SHALL be true.

**Validates: Requirements 1.5, 1.6**

### Property 5: Mission XP Award Consistency

*For any* completed mission, the XP awarded SHALL equal the mission's xpReward value, and the user's total XP SHALL increase by exactly that amount.

**Validates: Requirements 2.1, 2.2**

### Property 6: Streak Calculation and Bonus Awards

*For any* user, the current_streak SHALL increment by 1 for each consecutive day of completing all daily missions, and streaks of 7+ days SHALL trigger bonus XP (streak * 10 bonus).

**Validates: Requirements 2.3, 2.4**

### Property 7: Boss Battle Trigger from Abnormal Exams

*For any* exam result marked as "abnormal" or "attention_needed", a boss_battle mission SHALL be created with related_exam_id pointing to that exam.

**Validates: Requirements 2.5**

### Property 8: Level Progression Formula

*For any* user, the level SHALL be calculated as floor(sqrt(total_xp / 100)) + 1, and xpToNextLevel SHALL be (level^2 * 100) - total_xp.

**Validates: Requirements 2.8**

### Property 9: Risk Prediction Validity

*For any* health prediction, the probability SHALL be between 0-100, the timeframe SHALL be one of ['3_months', '6_months', '1_year'], and at least one recommendation SHALL be provided.

**Validates: Requirements 3.1, 3.2**

### Property 10: What-If Simulation Consistency

*For any* What-If simulation, changing an input value SHALL produce a different prediction probability, and the improvement percentage SHALL equal (original - simulated) / original * 100.

**Validates: Requirements 3.3, 3.4**

### Property 11: Healthy Twin Demographics Match

*For any* Healthy Twin comparison, the twin's demographics (age, gender, height) SHALL match the user's demographics exactly.

**Validates: Requirements 3.5**

### Property 12: Avatar Mood Health Score Mapping

*For any* avatar state, the mood SHALL be: score >= 80 → 'happy', 60-79 → 'neutral', 40-59 → 'concerned', < 40 → 'concerned' with alert animation.

**Validates: Requirements 4.4**

### Property 13: Achievement Unlock Persistence

*For any* unlocked achievement, it SHALL be persisted with a unique (user_id, achievement_key) constraint, and unlocked_items in avatar_customizations SHALL include the reward item.

**Validates: Requirements 4.6, 2.7**

### Property 14: Wearable Data Provider Support

*For any* wearable sync request, the provider SHALL be one of ['apple_health', 'google_fit', 'garmin'], and the data SHALL include at minimum: steps and synced_at.

**Validates: Requirements 5.1, 5.2**

### Property 15: Wearable Anomaly Detection

*For any* wearable data point, if heart_rate > 120 at rest OR sleep_hours < 4 for 3+ consecutive days, an anomaly notification SHALL be queued.

**Validates: Requirements 5.4, 5.6**

### Property 16: Scheduled Notification Timing

*For any* morning_briefing notification, scheduled_for SHALL be between 06:00-09:00 local time, and weekly_report SHALL be scheduled for Sunday.

**Validates: Requirements 7.1, 7.5**

### Property 17: Inactivity Re-engagement Trigger

*For any* user with no logged data for 2+ consecutive days, a re_engagement notification SHALL be queued within 24 hours.

**Validates: Requirements 7.4**

### Property 18: Timeline Milestone Detection

*For any* timeline event, is_milestone SHALL be true if: first goal achieved, best health score, weight goal reached, or 30-day streak.

**Validates: Requirements 8.3**

### Property 19: Timeline Filter Correctness

*For any* timeline filter applied, all returned events SHALL match at least one of the specified types AND fall within the specified date range.

**Validates: Requirements 8.5**

### Property 20: Report Data Period Inclusion

*For any* generated report, all included data points SHALL have dates within the specified period (period_start to period_end inclusive).

**Validates: Requirements 9.2**

### Property 21: Shareable Link Expiration

*For any* shareable report link, accessing after expires_at SHALL return 403 Forbidden, and expires_at SHALL be exactly 7 days after creation.

**Validates: Requirements 9.3**

### Property 22: Conversation History Limit

*For any* chat conversation, the history SHALL contain at most 50 messages, with oldest messages being removed when limit is exceeded (FIFO).

**Validates: Requirements 10.1**

### Property 23: Context Reference in Follow-ups

*For any* follow-up question (detected by keywords like "isso", "aquilo", "anterior"), the AI prompt SHALL include the last 3 conversation messages as context.

**Validates: Requirements 10.2**

### Property 24: Suggested Questions Relevance

*For any* set of suggested questions, at least 50% SHALL reference data points that exist in the user's profile (e.g., if user has weight data, suggest weight-related questions).

**Validates: Requirements 10.3**

## Error Handling

### Frontend Error Handling

```typescript
// src/lib/dr-vital/errorHandler.ts
type DrVitalErrorCode = 
  | 'HEALTH_SCORE_CALCULATION_FAILED'
  | 'MISSION_UPDATE_FAILED'
  | 'PREDICTION_UNAVAILABLE'
  | 'WEARABLE_SYNC_FAILED'
  | 'VOICE_RECOGNITION_FAILED'
  | 'REPORT_GENERATION_FAILED'
  | 'NETWORK_ERROR'
  | 'RATE_LIMITED';

interface DrVitalError {
  code: DrVitalErrorCode;
  message: string;
  userMessage: string;
  retryable: boolean;
  retryAfter?: number;
}

const errorMessages: Record<DrVitalErrorCode, DrVitalError> = {
  HEALTH_SCORE_CALCULATION_FAILED: {
    code: 'HEALTH_SCORE_CALCULATION_FAILED',
    message: 'Failed to calculate health score',
    userMessage: 'Não foi possível calcular seu score de saúde. Tente novamente.',
    retryable: true,
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Too many requests',
    userMessage: 'Muitas requisições. Aguarde alguns minutos.',
    retryable: true,
    retryAfter: 60,
  },
  // ... other errors
};
```

### Edge Function Error Handling

```typescript
// All edge functions follow this pattern
try {
  // Main logic
} catch (error) {
  console.error(`[${functionName}] Error:`, error);
  
  if (error.code === '23505') { // Unique violation
    return new Response(JSON.stringify({
      error: 'DUPLICATE_ENTRY',
      message: 'Este registro já existe',
    }), { status: 409, headers: corsHeaders });
  }
  
  if (error.code === 'PGRST116') { // No rows returned
    return new Response(JSON.stringify({
      error: 'NOT_FOUND',
      message: 'Registro não encontrado',
    }), { status: 404, headers: corsHeaders });
  }
  
  return new Response(JSON.stringify({
    error: 'INTERNAL_ERROR',
    message: 'Erro interno. Tente novamente.',
  }), { status: 500, headers: corsHeaders });
}
```

## Testing Strategy

### Unit Tests

Unit tests will cover:
- Health score calculation logic
- Streak calculation and bonus awards
- Level progression formula
- Color mapping for scores
- Timeline filtering logic
- Notification scheduling logic

### Property-Based Tests

Property-based tests will use `fast-check` library with minimum 100 iterations per test.

```typescript
// Example: Health Score Property Test
import * as fc from 'fast-check';

describe('Health Score Properties', () => {
  // Feature: dr-vital-revolution, Property 1: Health Score Calculation and Color Mapping
  it('should always produce score between 0-100 with correct color', () => {
    fc.assert(
      fc.property(
        fc.record({
          nutrition: fc.integer({ min: 0, max: 25 }),
          exercise: fc.integer({ min: 0, max: 25 }),
          sleep: fc.integer({ min: 0, max: 25 }),
          mental: fc.integer({ min: 0, max: 25 }),
        }),
        (breakdown) => {
          const score = calculateHealthScore(breakdown);
          const color = getScoreColor(score);
          
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
          
          if (score < 40) expect(color).toBe('red');
          else if (score < 70) expect(color).toBe('yellow');
          else expect(color).toBe('green');
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: dr-vital-revolution, Property 2: Health Score Component Sum
  it('should have component sum equal total score', () => {
    fc.assert(
      fc.property(
        fc.record({
          nutrition: fc.integer({ min: 0, max: 25 }),
          exercise: fc.integer({ min: 0, max: 25 }),
          sleep: fc.integer({ min: 0, max: 25 }),
          mental: fc.integer({ min: 0, max: 25 }),
        }),
        (breakdown) => {
          const score = calculateHealthScore(breakdown);
          const sum = breakdown.nutrition + breakdown.exercise + breakdown.sleep + breakdown.mental;
          expect(score).toBe(sum);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Tests

Integration tests will verify:
- Edge function responses
- Database constraints
- RLS policies
- Wearable data sync flow
- Notification delivery

### Test Configuration

```typescript
// vitest.config.ts additions
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'src/**/*.property.test.ts'],
    coverage: {
      include: ['src/services/dr-vital/**', 'src/hooks/dr-vital/**'],
      threshold: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
});
```
