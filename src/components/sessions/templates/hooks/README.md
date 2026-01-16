# Session Templates Hooks

This directory contains custom hooks extracted from `SessionTemplates.tsx` as part of the refactoring effort to reduce component size and improve maintainability.

## Files

### `useTemplateLogic.ts`
Main custom hook that encapsulates all business logic for session templates:

**Responsibilities:**
- State management (selectedTemplate, isCreating, selectedUsers, stats)
- Data fetching (session statistics from database)
- Session creation and assignment logic
- User selection and bulk operations
- Error handling and user feedback

**Exports:**
- `useTemplateLogic()` - Main hook
- `Template` interface - TypeScript type for template objects
- `SessionStats` interface - TypeScript type for statistics
- `categoryTags` - Category tag configuration for UI

**Usage:**
```typescript
import { useTemplateLogic } from './hooks/useTemplateLogic';

const MyComponent = () => {
  const {
    selectedTemplate,
    isCreating,
    selectedUsers,
    stats,
    isLoadingStats,
    setSelectedTemplate,
    setSelectedUsers,
    handleUseTemplate,
    handleSendToAll,
    handleSendToSelected,
    getTemplateKeyFromTitle,
    buildSessionPayload
  } = useTemplateLogic();
  
  // Use the values and functions...
};
```

### `sessionPayloadBuilder.ts`
Pure function that builds session payloads for different template types:

**Responsibilities:**
- Generates complete session configuration objects
- Handles 15 different template types
- Provides consistent structure for all templates

**Exports:**
- `buildSessionPayload(templateId: string)` - Returns session payload or null

**Template Types Supported:**
- `12-areas` - 12 Life Areas Assessment
- `147-perguntas` - 147 Symptoms Mapping
- `8-pilares` - 8 Financial Pillars
- `8-competencias` - 8 Professional Competencies
- `sabotadores` - 24 Weight Loss Saboteurs
- `sono` - Sleep Quality Assessment
- `estresse` - Stress and Anxiety Assessment
- `bem-estar` - Wellbeing and Mindfulness
- `habitos-alimentares` - Eating Habits Assessment
- `hidratacao` - Hydration Assessment
- `rotina-diaria` - Daily Routine Mapping
- `objetivos-saude` - Health Goals Definition
- `motivacao` - Motivation and Energy Assessment
- `anamnese` - Complete Health Anamnesis
- `atividade-fisica` - Physical Activity Assessment

## Refactoring Benefits

1. **Reduced Component Size**: Original SessionTemplates.tsx was 1,312 lines
2. **Separation of Concerns**: Logic separated from presentation
3. **Reusability**: Hook can be used by multiple components
4. **Testability**: Pure functions easier to test
5. **Maintainability**: Clearer code organization
6. **Type Safety**: Full TypeScript support with interfaces

## Related Files

- `../TemplateList.tsx` - Displays template grid
- `../TemplateEditor.tsx` - User selection modal
- `../index.tsx` - Main component that orchestrates everything

## Validation

**Validates: Requirements 1.4** - Extract logic from SessionTemplates.tsx into custom hooks

## Notes

- All queries use `.limit()` to prevent excessive data fetching
- Error handling with toast notifications
- Proper TypeScript typing throughout
- Follows React Hooks best practices (useCallback, useEffect dependencies)
- Uses `@/` import alias pattern
