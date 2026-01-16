# Sessions Components

This directory contains all session-related components for the MaxNutrition platform.

## Directory Structure

```
src/components/sessions/
├── templates/                    # SessionTemplates refactored components
│   ├── hooks/                   # Custom hooks for template logic
│   │   └── useTemplateLogic.ts  # (To be created) Main template logic hook
│   ├── TemplateList.tsx         # (To be created) List of session templates
│   ├── TemplateEditor.tsx       # (To be created) Template editing interface
│   └── index.tsx                # (To be created) Main templates component
│
├── user-sessions/               # UserSessions refactored components
│   ├── hooks/                   # Custom hooks for session data
│   │   └── useSessionData.ts    # (To be created) Main session data hook
│   ├── SessionList.tsx          # (To be created) List of user sessions
│   ├── SessionCard.tsx          # (To be created) Individual session card
│   ├── SessionActions.tsx       # (To be created) Session action buttons
│   └── index.tsx                # (To be created) Main user sessions component
│
├── results/                     # Session results components (existing)
│   ├── AICoachingReportWrapper.tsx
│   ├── AnamnesisResultCard.tsx
│   ├── CoachingReportCard.tsx
│   ├── DailyReflectionResultCard.tsx
│   ├── GenericResultCard.tsx
│   ├── LifeWheelResultCard.tsx
│   ├── SaboteursResultCard.tsx
│   ├── SessionCompleteFactory.tsx
│   ├── ShareToWhatsAppButton.tsx
│   ├── SymptomsResultCard.tsx
│   └── index.ts
│
├── UserSessionsCompact.tsx      # Compact view variant (existing)
├── UserSessionsCreative.tsx     # Creative view variant (existing)
├── UserSessionsRedesigned.tsx   # Redesigned view variant (existing)
└── index.ts                     # Main exports
```

## Refactoring Plan

### Phase 1: SessionTemplates (Task 19.2-19.3)
**Source:** `src/components/admin/SessionTemplates.tsx` (1,312 lines)

**Target Components:**
- `templates/TemplateList.tsx` - Display and filter session templates
- `templates/TemplateEditor.tsx` - Create and edit templates
- `templates/hooks/useTemplateLogic.ts` - Template state management and business logic
- `templates/index.tsx` - Main orchestrator component

**Requirements:** 1.4

### Phase 2: UserSessions (Task 19.4-19.5)
**Source:** `src/components/UserSessions.tsx` (1,272 lines)

**Target Components:**
- `user-sessions/SessionList.tsx` - Display list of user sessions
- `user-sessions/SessionCard.tsx` - Individual session card with status
- `user-sessions/SessionActions.tsx` - Actions (start, complete, cancel)
- `user-sessions/hooks/useSessionData.ts` - Session data fetching and state
- `user-sessions/index.tsx` - Main orchestrator component

**Requirements:** 1.7

## Design Principles

### Component Responsibilities
Each component should have a single, clear responsibility:
- **List components**: Display collections with filtering/sorting
- **Card components**: Display individual items with minimal logic
- **Action components**: Handle user interactions and mutations
- **Hook components**: Manage state, data fetching, and business logic
- **Index components**: Orchestrate sub-components

### Import Standards
All imports must use the `@/` alias pattern:
```typescript
// ✅ CORRECT
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

// ❌ WRONG
import { supabase } from '../../../integrations/supabase/client';
```

### Type Safety
All components must use TypeScript with proper types from `src/types/sessions.ts`:
```typescript
import { UserSession, SessionTemplate } from '@/types/sessions';
```

### Error Handling
All async operations must have proper error handling:
```typescript
try {
  await operation();
  toast.success('Success message');
} catch (error) {
  console.error('Operation failed:', error);
  toast.error('User-friendly error message');
}
```

### Hook Dependencies
All React hooks must have correct dependencies:
```typescript
// Wrap functions in useCallback
const fetchData = useCallback(async () => {
  // fetch logic
}, [dependency1, dependency2]);

// Include callbacks in useEffect dependencies
useEffect(() => {
  fetchData();
}, [fetchData]);
```

## Component Size Guidelines

- **Maximum 500 lines** per component file
- Extract logic to custom hooks when components grow large
- Split complex components into smaller sub-components
- Use composition over large monolithic components

## Testing

Each refactored component should maintain existing functionality:
- All existing features must work after refactoring
- No breaking changes to component APIs
- Maintain backward compatibility where possible

## Related Documentation

- **Requirements:** `.kiro/specs/maxnutrition-refactoring/requirements.md`
- **Design:** `.kiro/specs/maxnutrition-refactoring/design.md`
- **Tasks:** `.kiro/specs/maxnutrition-refactoring/tasks.md`
- **Type Definitions:** `src/types/sessions.ts`
- **Coding Rules:** `.kiro/steering/coding-rules.md`

## Status

- [x] Task 19.1: Folder structure created
- [ ] Task 19.2: Extract TemplateList.tsx, TemplateEditor.tsx
- [ ] Task 19.3: Create useTemplateLogic.ts hook
- [ ] Task 19.4: Extract SessionList.tsx, SessionCard.tsx, SessionActions.tsx
- [ ] Task 19.5: Create useSessionData.ts hook

---

*Last updated: Task 19.1 - Folder structure creation*
