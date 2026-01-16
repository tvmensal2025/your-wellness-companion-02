# Documento de Design

## Visão Geral

Este documento descreve a arquitetura e abordagem técnica para o refatoramento completo da plataforma MaxNutrition. O refatoramento será executado em fases incrementais, priorizando correções críticas primeiro, seguidas por melhorias de alta prioridade.

### Princípios de Design

1. **Incrementalidade**: Cada mudança deve ser pequena e testável
2. **Compatibilidade**: Manter funcionalidade existente sem breaking changes
3. **Modularidade**: Componentes devem ter responsabilidade única
4. **Type Safety**: Eliminar tipos `any` em favor de tipos específicos
5. **Performance**: Otimizar bundle size e queries de banco de dados

### Escopo do Refatoramento

| Categoria | Quantidade | Prioridade |
|-----------|------------|------------|
| Componentes >500 linhas | 11 | Alta |
| Hooks com deps faltando | 25+ | Alta |
| Tipos `any` | ~1.200 | Média |
| Queries sem .limit() | 30+ | Média |
| Catch blocks vazios | 10 | Alta |
| Chunks >50KB | 5 | Média |

## Arquitetura

### Estrutura de Pastas Atual

```
src/
├── components/           # Componentes React
│   ├── admin/           # Componentes administrativos
│   ├── dashboard/       # Dashboard e visualizações
│   ├── exercise/        # Módulo de exercícios
│   ├── sofia/           # IA Sofia
│   ├── ui/              # Componentes base (shadcn)
│   └── ...
├── hooks/               # Custom hooks
├── pages/               # Páginas da aplicação
├── services/            # Serviços e APIs
├── types/               # Definições de tipos TypeScript
├── utils/               # Utilitários
└── integrations/        # Integrações (Supabase)
```

### Estrutura Proposta para Componentes Refatorados

```
src/components/
├── dashboard/
│   ├── course-platform/           # CoursePlatformNetflix refatorado
│   │   ├── CourseHeader.tsx
│   │   ├── CourseGrid.tsx
│   │   ├── CourseCard.tsx
│   │   ├── CoursePlayer.tsx
│   │   ├── CourseProgress.tsx
│   │   ├── hooks/
│   │   │   └── useCourseData.ts
│   │   └── index.tsx              # Componente principal
│   └── medical-documents/         # MedicalDocumentsSection refatorado
│       ├── DocumentList.tsx
│       ├── DocumentCard.tsx
│       ├── DocumentUploader.tsx
│       └── index.tsx
├── exercise/
│   ├── onboarding/                # ExerciseOnboardingModal refatorado
│   │   ├── steps/
│   │   │   ├── WelcomeStep.tsx
│   │   │   ├── GoalsStep.tsx
│   │   │   ├── ExperienceStep.tsx
│   │   │   └── EquipmentStep.tsx
│   │   ├── hooks/
│   │   │   └── useOnboardingState.ts
│   │   └── index.tsx
│   └── workout/                   # ActiveWorkoutModal refatorado
│       ├── WorkoutTimer.tsx
│       ├── ExerciseDisplay.tsx
│       ├── ProgressTracker.tsx
│       └── index.tsx
├── sessions/
│   ├── user-sessions/             # UserSessions refatorado
│   │   ├── SessionList.tsx
│   │   ├── SessionCard.tsx
│   │   ├── SessionActions.tsx
│   │   ├── hooks/
│   │   │   └── useSessionData.ts
│   │   └── index.tsx
│   └── templates/                 # SessionTemplates refatorado
│       ├── TemplateList.tsx
│       ├── TemplateEditor.tsx
│       ├── hooks/
│       │   └── useTemplateLogic.ts
│       └── index.tsx
└── sofia/
    └── chat/                      # SofiaChat refatorado
        ├── MessageList.tsx
        ├── MessageInput.tsx
        ├── ChatHeader.tsx
        ├── hooks/
        │   └── useChatLogic.ts
        └── index.tsx
```

## Componentes e Interfaces

### Padrão de Refatoração de Componentes

Para cada componente grande, seguiremos este padrão:

```typescript
// Antes: ComponenteGrande.tsx (1000+ linhas)
// Depois: componente-grande/index.tsx + sub-componentes

// 1. Extrair tipos para arquivo separado
// src/types/componente-grande.ts
export interface ComponenteGrandeProps {
  // props tipadas
}

export interface SubComponenteProps {
  // props do sub-componente
}

// 2. Extrair lógica para custom hook
// src/components/componente-grande/hooks/useComponenteLogic.ts
export const useComponenteLogic = (props: ComponenteGrandeProps) => {
  // toda lógica de estado e efeitos
  return { /* valores e funções */ };
};

// 3. Criar sub-componentes focados
// src/components/componente-grande/SubComponente.tsx
export const SubComponente: React.FC<SubComponenteProps> = (props) => {
  // apenas renderização
};

// 4. Componente principal orquestra
// src/components/componente-grande/index.tsx
export const ComponenteGrande: React.FC<ComponenteGrandeProps> = (props) => {
  const logic = useComponenteLogic(props);
  return (
    <div>
      <SubComponente {...logic.subProps} />
    </div>
  );
};
```

### Interface de Tipos para Componentes Admin

```typescript
// src/types/admin.ts

// PlatformAudit types
export interface AuditLog {
  id: string;
  action: string;
  user_id: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface AuditFilter {
  action?: string;
  user_id?: string;
  date_from?: string;
  date_to?: string;
}

// SessionAnalytics types
export interface SessionMetrics {
  total_sessions: number;
  completed_sessions: number;
  average_duration: number;
  completion_rate: number;
}

export interface SessionAnalyticsData {
  metrics: SessionMetrics;
  daily_stats: DailySessionStat[];
  user_breakdown: UserSessionBreakdown[];
}

export interface DailySessionStat {
  date: string;
  count: number;
  completed: number;
}

export interface UserSessionBreakdown {
  user_id: string;
  user_name: string;
  sessions_completed: number;
  total_time: number;
}

// CourseManagement types
export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  modules: CourseModule[];
  is_active: boolean;
  created_at: string;
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: string;
  title: string;
  content_type: 'video' | 'text' | 'quiz';
  content_url?: string;
  duration?: number;
  order: number;
}

// GoalManagement types
export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  target_value: number;
  current_value: number;
  target_date?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface GoalProgress {
  goal_id: string;
  progress_percentage: number;
  days_remaining?: number;
  on_track: boolean;
}

// CompanyConfiguration types
export interface CompanyConfig {
  id: string;
  company_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  features_enabled: string[];
  settings: Record<string, unknown>;
}
```

### Interface de Tipos para Sessions

```typescript
// src/types/sessions.ts

export interface UserSession {
  id: string;
  user_id: string;
  session_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  progress: number;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  auto_save_data?: Record<string, unknown>;
  cycle_number: number;
  next_available_date?: string;
  is_locked: boolean;
  review_count: number;
  tools_data?: Record<string, unknown>;
}

export interface SessionTemplate {
  id: string;
  title: string;
  description: string;
  type: string;
  content: SessionContent;
  target_saboteurs?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_time: number;
  is_active: boolean;
}

export interface SessionContent {
  sections: SessionSection[];
  tools?: SessionTool[];
}

export interface SessionSection {
  id: string;
  title: string;
  type: 'intro' | 'questions' | 'exercise' | 'reflection';
  content: string;
  questions?: SessionQuestion[];
}

export interface SessionQuestion {
  id: string;
  text: string;
  type: 'text' | 'scale' | 'multiple_choice' | 'checkbox';
  options?: string[];
  required: boolean;
}

export interface SessionTool {
  id: string;
  name: string;
  type: string;
  config: Record<string, unknown>;
}
```

## Modelos de Dados

### Estrutura de Queries Otimizadas

```typescript
// Padrão para queries com limite
const fetchWithLimit = async <T>(
  table: string,
  options: {
    select?: string;
    filters?: Record<string, unknown>;
    limit?: number;
    orderBy?: { column: string; ascending?: boolean };
  }
): Promise<T[]> => {
  let query = supabase
    .from(table)
    .select(options.select || '*');
  
  // Aplicar filtros
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }
  
  // Aplicar ordenação
  if (options.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true
    });
  }
  
  // SEMPRE aplicar limite (padrão 50)
  query = query.limit(options.limit || 50);
  
  const { data, error } = await query;
  if (error) throw error;
  return data as T[];
};
```

### Padrão de Hook com Dependências Corretas

```typescript
// Padrão para hooks com useCallback
const useDataFetching = (userId: string | undefined) => {
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Função de fetch envolvida em useCallback
  const fetchData = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await supabase
        .from('table')
        .select('*')
        .eq('user_id', userId)
        .limit(50);
      
      if (result.error) throw result.error;
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Dependência correta

  // useEffect com dependência correta
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData como dependência

  return { data, loading, error, refetch: fetchData };
};
```

### Padrão de Tratamento de Erros

```typescript
// Padrão para catch blocks
try {
  await someAsyncOperation();
} catch (error) {
  // 1. Log do erro para debugging
  console.error('Operation failed:', error);
  
  // 2. Feedback ao usuário quando apropriado
  toast.error('Não foi possível completar a operação. Tente novamente.');
  
  // 3. Atualizar estado de erro se necessário
  setError(error instanceof Error ? error : new Error('Unknown error'));
  
  // 4. Reportar para sistema de monitoramento (se configurado)
  // reportError(error);
}
```

### Configuração de Lazy Loading

```typescript
// src/utils/lazy-components.ts
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Componente de fallback padrão
const LoadingFallback = () => (
  <div className="p-4 space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-8 w-3/4" />
  </div>
);

// Lazy load de componentes grandes
export const LazyDashboardOverview = lazy(() => 
  import('@/components/dashboard/DashboardOverview')
);

export const LazyExerciseOnboardingModal = lazy(() => 
  import('@/components/exercise/ExerciseOnboardingModal')
);

export const LazyChallengesDashboard = lazy(() => 
  import('@/components/challenges-v2/ChallengesDashboard')
);

export const LazyCoursePlatformNetflix = lazy(() => 
  import('@/components/dashboard/CoursePlatformNetflix')
);

// HOC para envolver componentes lazy
export const withSuspense = <P extends object>(
  LazyComponent: React.LazyExoticComponent<React.ComponentType<P>>,
  fallback: React.ReactNode = <LoadingFallback />
) => {
  return (props: P) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};
```

### Configuração de Vite para Chunks Otimizados

```typescript
// vite.config.ts - seção de build
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        // Vendor chunks separados
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        'vendor-charts': ['recharts', 'apexcharts', 'react-apexcharts'],
        'vendor-motion': ['framer-motion'],
        'vendor-date': ['date-fns'],
        'vendor-query': ['@tanstack/react-query'],
        
        // Feature chunks
        'feature-admin': [
          './src/components/admin/AdminDashboard.tsx',
          './src/components/admin/PlatformAudit.tsx',
        ],
        'feature-exercise': [
          './src/components/exercise/ExerciseDashboard.tsx',
          './src/components/exercise/ActiveWorkoutModal.tsx',
        ],
        'feature-sofia': [
          './src/components/sofia/SofiaChat.tsx',
          './src/components/sofia/SofiaIntegratedSystem.tsx',
        ],
      },
    },
  },
  chunkSizeWarningLimit: 500, // Warning para chunks >500KB
},
```


## Propriedades de Corretude

*Uma propriedade é uma característica ou comportamento que deve ser verdadeiro em todas as execuções válidas de um sistema - essencialmente, uma declaração formal sobre o que o sistema deve fazer. Propriedades servem como ponte entre especificações legíveis por humanos e garantias de corretude verificáveis por máquina.*

### Propriedades Derivadas dos Requisitos

Baseado na análise de prework dos critérios de aceitação, as seguintes propriedades foram identificadas:

**Property 1: ESLint sem warnings críticos**
*Para qualquer* arquivo TypeScript/TSX no projeto, após o refatoramento, a execução do ESLint não deve retornar warnings das regras: react-hooks/exhaustive-deps, no-empty, prefer-const, no-useless-escape.
**Validates: Requirements 2.1, 2.2, 2.13, 7.1, 8.1, 9.1, 9.4, 10.1, 11.1, 12.1**

**Property 2: TypeScript compila sem erros**
*Para qualquer* arquivo TypeScript/TSX no projeto, a execução de `tsc --noEmit` deve completar sem erros de compilação.
**Validates: Requirements 3.1, 3.8, 3.10, 9.5, 9.7**

**Property 3: Nenhum componente excede 500 linhas**
*Para qualquer* arquivo de componente React (.tsx) em src/components/, o número de linhas não deve exceder 500.
**Validates: Requirements 1.1, 9.2**

**Property 4: Todas queries Supabase têm limite**
*Para qualquer* query Supabase que use `.select()` sem agregação, deve haver um `.limit()`, `.single()`, ou comentário explicativo.
**Validates: Requirements 4.1, 4.2, 4.3, 4.9, 9.3**

**Property 5: Bundle size otimizado**
*Para qualquer* chunk gerado pelo build, o tamanho gzipado não deve exceder 100KB, e o total do bundle principal não deve exceder 100KB gzipado.
**Validates: Requirements 5.1, 5.5, 5.7, 5.8**

**Property 6: Imports usando padrão @/ alias**
*Para qualquer* arquivo TypeScript/TSX, imports não devem usar caminhos relativos com mais de um nível (../../), devendo usar o alias @/.
**Validates: Requirements 1.13, 9.8**

**Property 7: Testes passando**
*Para qualquer* suite de testes existente, todos os testes devem passar após o refatoramento.
**Validates: Requirements 9.6**


## Tratamento de Erros

### Padrão de Tratamento de Erros em Componentes

```typescript
// Padrão para componentes com operações assíncronas
const ComponenteComErros: React.FC = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOperation = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await operacaoAssincrona();
      toast.success('Operação concluída com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      console.error('Erro na operação:', err);
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error.message}</AlertDescription>
        <Button onClick={() => setError(null)}>Tentar novamente</Button>
      </Alert>
    );
  }

  return (/* componente normal */);
};
```

### Padrão de Error Boundary

```typescript
// src/components/ui/error-boundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <p className="text-destructive">Algo deu errado.</p>
          <Button onClick={() => this.setState({ hasError: false })}>
            Tentar novamente
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
```


## Estratégia de Testes

### Abordagem Dual de Testes

O refatoramento utilizará duas abordagens complementares:

1. **Testes Unitários**: Verificam exemplos específicos, edge cases e condições de erro
2. **Testes de Propriedade**: Verificam propriedades universais em muitas entradas geradas

### Configuração de Testes de Propriedade

O projeto já possui `fast-check` instalado. Cada teste de propriedade deve:
- Executar no mínimo 100 iterações
- Referenciar a propriedade do documento de design
- Usar o formato de tag: **Feature: maxnutrition-refactoring, Property {number}: {property_text}**

### Exemplos de Testes de Propriedade

```typescript
// src/tests/refactoring.property.test.ts
import fc from 'fast-check';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

describe('Refactoring Properties', () => {
  // Feature: maxnutrition-refactoring, Property 3: Nenhum componente excede 500 linhas
  it('should have no component exceeding 500 lines', () => {
    const componentsDir = path.join(__dirname, '../components');
    const files = getAllTsxFiles(componentsDir);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const lineCount = content.split('\n').length;
      expect(lineCount).toBeLessThanOrEqual(500);
    });
  });

  // Feature: maxnutrition-refactoring, Property 6: Imports usando padrão @/ alias
  it('should not have deep relative imports', () => {
    const srcDir = path.join(__dirname, '..');
    const files = getAllTsxFiles(srcDir);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const deepImports = content.match(/from ['"]\.\.\/\.\.\/\.\.\//g);
      expect(deepImports).toBeNull();
    });
  });
});
```

### Testes de Integração para Funcionalidades

```typescript
// src/tests/integration/sofia-sections.test.ts
describe('Sofia Sections Integration', () => {
  it('should load community section', async () => {
    // Testar que a seção comunidade carrega corretamente
  });

  it('should load subscriptions section', async () => {
    // Testar que a seção subscriptions carrega corretamente
  });

  it('should load exercises section', async () => {
    // Testar que a seção exercícios carrega corretamente
  });
});
```

### Scripts de Validação

```bash
# scripts/validate-refactoring.sh

#!/bin/bash

echo "🔍 Validando refatoramento..."

# Property 1: ESLint sem warnings críticos
echo "Verificando ESLint..."
npx eslint src/ --ext .ts,.tsx --quiet
if [ $? -ne 0 ]; then
  echo "❌ ESLint encontrou erros"
  exit 1
fi

# Property 2: TypeScript compila
echo "Verificando TypeScript..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "❌ TypeScript encontrou erros"
  exit 1
fi

# Property 3: Componentes <= 500 linhas
echo "Verificando tamanho de componentes..."
find src/components -name "*.tsx" -exec wc -l {} \; | while read lines file; do
  if [ "$lines" -gt 500 ]; then
    echo "❌ $file tem $lines linhas (máximo 500)"
    exit 1
  fi
done

# Property 7: Testes passando
echo "Executando testes..."
npm run test -- --run
if [ $? -ne 0 ]; then
  echo "❌ Testes falharam"
  exit 1
fi

echo "✅ Todas as validações passaram!"
```
