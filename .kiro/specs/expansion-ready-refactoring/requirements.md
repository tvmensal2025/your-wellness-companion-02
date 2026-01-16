# Documento de Requisitos

## Introdução

Este documento define os requisitos para refatorar as áreas de MealPlan e Exercise do MaxNutrition, preparando-as para expansão massiva de conteúdo. O projeto planeja adicionar muitos cardápios, templates de sessão, cursos e exercícios, exigindo uma arquitetura modular e escalável.

### Situação Atual

| Área | Arquivos | Linhas | Componentes >500 linhas |
|------|----------|--------|-------------------------|
| MealPlan | 55 | 13.591 | 4 (CompactMealPlanModal, WeeklyMealPlanModal, ChefKitchenMealPlan, DailyMealPlanModal) |
| Exercise | 68 | 20.414 | 7 (index.tsx, ActiveWorkoutModal, UnifiedTimer, ExerciseChallengeCard, ExerciseDetailModal, SavedProgramView, BuddyWorkoutCard) |

### Componentes Prioritários para Refatoração

**MealPlan (4 componentes):**
- `CompactMealPlanModal.tsx` - 1.037 linhas
- `WeeklyMealPlanModal.tsx` - 660 linhas
- `ChefKitchenMealPlan.tsx` - 523 linhas
- `DailyMealPlanModal.tsx` - 450 linhas

**Exercise (7 componentes):**
- `exercise/index.tsx` - 942 linhas (ExerciseDashboard)
- `ActiveWorkoutModal.tsx` - 875 linhas (já parcialmente refatorado em workout/)
- `UnifiedTimer.tsx` - 775 linhas
- `ExerciseChallengeCard.tsx` - 747 linhas
- `ExerciseDetailModal.tsx` - 698 linhas
- `SavedProgramView.tsx` - 638 linhas
- `BuddyWorkoutCard.tsx` - 630 linhas

### Metas de Sucesso
- Todos os componentes < 300 linhas
- Estrutura modular com hooks extraídos
- Padrão Orchestrator aplicado consistentemente
- Preparado para lazy loading de conteúdo
- Zero breaking changes na funcionalidade

## Glossário

- **Orchestrator**: Componente principal que coordena sub-componentes, contendo apenas lógica de composição
- **Divisor_MealPlan**: Módulo responsável por refatorar componentes da área de cardápios
- **Divisor_Exercise**: Módulo responsável por refatorar componentes da área de exercícios
- **Hook_Extractor**: Módulo responsável por extrair lógica de estado para custom hooks
- **Sub_Componente**: Componente menor com responsabilidade única, extraído de um componente grande
- **Expansion_Ready**: Arquitetura preparada para receber grande volume de conteúdo dinâmico

## Requisitos

### Requisito 1: Refatoração de CompactMealPlanModal

**História do Usuário:** Como desenvolvedor, quero que o CompactMealPlanModal seja dividido em componentes menores, para que seja fácil adicionar novos layouts de cardápio.

#### Critérios de Aceitação

1. QUANDO refatorar CompactMealPlanModal.tsx (1.037 linhas), O Divisor_MealPlan DEVE criar uma pasta `compact-meal-plan/` com estrutura modular
2. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useCompactMealPlanLogic.ts` com toda lógica de estado e navegação
3. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `MealCard.tsx` para renderização de refeições individuais
4. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `MacrosDisplay.tsx` para exibição de macronutrientes
5. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `MealNavigation.tsx` para navegação entre refeições
6. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `PrintButton.tsx` para funcionalidade de impressão
7. QUANDO criar o orchestrator, O Divisor_MealPlan DEVE manter `index.tsx` com menos de 200 linhas
8. QUANDO refatorar, O Divisor_MealPlan DEVE manter todas as animações Framer Motion funcionando

### Requisito 2: Refatoração de WeeklyMealPlanModal

**História do Usuário:** Como desenvolvedor, quero que o WeeklyMealPlanModal seja modular, para que seja fácil adicionar visualizações semanais alternativas.

#### Critérios de Aceitação

1. QUANDO refatorar WeeklyMealPlanModal.tsx (660 linhas), O Divisor_MealPlan DEVE criar uma pasta `weekly-meal-plan/` com estrutura modular
2. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useWeeklyPlanLogic.ts` com lógica de seleção de dias
3. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `DaySelector.tsx` para seleção de dias da semana
4. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `WeeklyOverview.tsx` para visão geral da semana
5. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `CircularProgress.tsx` para componente de progresso circular
6. QUANDO criar o orchestrator, O Divisor_MealPlan DEVE manter `index.tsx` com menos de 150 linhas

### Requisito 3: Refatoração de ChefKitchenMealPlan

**História do Usuário:** Como desenvolvedor, quero que o ChefKitchenMealPlan seja modular, para que seja fácil adicionar novos temas de cozinha.

#### Critérios de Aceitação

1. QUANDO refatorar ChefKitchenMealPlan.tsx (523 linhas), O Divisor_MealPlan DEVE criar uma pasta `chef-kitchen/` com estrutura modular
2. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useChefKitchenLogic.ts` com lógica de animações e estado
3. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `KitchenHeader.tsx` para cabeçalho temático
4. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `RecipeCard.tsx` para cards de receitas
5. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `CookingAnimation.tsx` para animações de cozinha
6. QUANDO criar o orchestrator, O Divisor_MealPlan DEVE manter `index.tsx` com menos de 150 linhas

### Requisito 4: Refatoração de DailyMealPlanModal

**História do Usuário:** Como desenvolvedor, quero que o DailyMealPlanModal seja modular, para que seja fácil customizar visualizações diárias.

#### Critérios de Aceitação

1. QUANDO refatorar DailyMealPlanModal.tsx (450 linhas), O Divisor_MealPlan DEVE criar uma pasta `daily-meal-plan/` com estrutura modular
2. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useDailyPlanLogic.ts` com lógica de estado
3. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `DailyMealList.tsx` para lista de refeições do dia
4. QUANDO dividir UI, O Divisor_MealPlan DEVE extrair `DailyTotals.tsx` para totais nutricionais do dia
5. QUANDO criar o orchestrator, O Divisor_MealPlan DEVE manter `index.tsx` com menos de 150 linhas

### Requisito 5: Refatoração de UnifiedTimer

**História do Usuário:** Como desenvolvedor, quero que o UnifiedTimer seja modular, para que seja fácil adicionar novos modos de timer para diferentes tipos de exercício.

#### Critérios de Aceitação

1. QUANDO refatorar UnifiedTimer.tsx (775 linhas), O Divisor_Exercise DEVE criar uma pasta `unified-timer/` com estrutura modular
2. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useTimerLogic.ts` com toda lógica de contagem e controle
3. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useTimerSound.ts` com lógica de sons e beeps
4. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `TimerDisplay.tsx` para exibição do tempo
5. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `TimerControls.tsx` para botões de controle (play, pause, reset)
6. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `TimerPresets.tsx` para presets de tempo
7. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `MotivationalMessage.tsx` para mensagens motivacionais
8. QUANDO criar o orchestrator, O Divisor_Exercise DEVE manter `index.tsx` com menos de 200 linhas
9. QUANDO refatorar, O Divisor_Exercise DEVE manter todas as variantes (full, compact, inline, mini) funcionando

### Requisito 6: Refatoração de ExerciseChallengeCard

**História do Usuário:** Como desenvolvedor, quero que o ExerciseChallengeCard seja modular, para que seja fácil adicionar novos tipos de desafios de exercício.

#### Critérios de Aceitação

1. QUANDO refatorar ExerciseChallengeCard.tsx (747 linhas), O Divisor_Exercise DEVE criar uma pasta `exercise-challenge/` com estrutura modular
2. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useChallengeLogic.ts` com lógica de desafios
3. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `ChallengeHeader.tsx` para cabeçalho do desafio
4. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `OpponentSelector.tsx` para seleção de oponentes
5. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `ChallengeProgress.tsx` para progresso do desafio
6. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `ChallengeActions.tsx` para ações (aceitar, recusar, completar)
7. QUANDO criar o orchestrator, O Divisor_Exercise DEVE manter `index.tsx` com menos de 200 linhas

### Requisito 7: Refatoração de ExerciseDetailModal

**História do Usuário:** Como desenvolvedor, quero que o ExerciseDetailModal seja modular, para que seja fácil adicionar novos tipos de exercícios com diferentes visualizações.

#### Critérios de Aceitação

1. QUANDO refatorar ExerciseDetailModal.tsx (698 linhas), O Divisor_Exercise DEVE criar uma pasta `exercise-detail/` com estrutura modular
2. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useExerciseDetailLogic.ts` com lógica de navegação entre steps
3. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useExerciseFeedback.ts` com lógica de feedback de dificuldade
4. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `ExerciseOverview.tsx` para visão geral do exercício
5. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `ExerciseInstructions.tsx` para instruções detalhadas
6. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `ExerciseExecution.tsx` para tela de execução com timer
7. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `DifficultyFeedback.tsx` para feedback de dificuldade
8. QUANDO criar o orchestrator, O Divisor_Exercise DEVE manter `index.tsx` com menos de 200 linhas

### Requisito 8: Refatoração de SavedProgramView

**História do Usuário:** Como desenvolvedor, quero que o SavedProgramView seja modular, para que seja fácil adicionar novos tipos de programas de treino.

#### Critérios de Aceitação

1. QUANDO refatorar SavedProgramView.tsx (638 linhas), O Divisor_Exercise DEVE criar uma pasta `saved-program/` com estrutura modular
2. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useSavedProgramLogic.ts` com lógica de programas salvos
3. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `ProgramHeader.tsx` para cabeçalho do programa
4. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `ProgramDayList.tsx` para lista de dias do programa
5. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `ProgramExerciseList.tsx` para lista de exercícios
6. QUANDO criar o orchestrator, O Divisor_Exercise DEVE manter `index.tsx` com menos de 200 linhas

### Requisito 9: Refatoração de BuddyWorkoutCard

**História do Usuário:** Como desenvolvedor, quero que o BuddyWorkoutCard seja modular, para que seja fácil adicionar novos modos de treino em dupla.

#### Critérios de Aceitação

1. QUANDO refatorar BuddyWorkoutCard.tsx (630 linhas), O Divisor_Exercise DEVE criar uma pasta `buddy-workout/` com estrutura modular
2. QUANDO extrair lógica, O Hook_Extractor DEVE criar `hooks/useBuddyWorkoutLogic.ts` com lógica de treino em dupla
3. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `BuddySelector.tsx` para seleção de parceiro
4. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `BuddyProgress.tsx` para progresso comparativo
5. QUANDO dividir UI, O Divisor_Exercise DEVE extrair `BuddyActions.tsx` para ações de convite e aceitação
6. QUANDO criar o orchestrator, O Divisor_Exercise DEVE manter `index.tsx` com menos de 150 linhas

### Requisito 10: Padrões de Qualidade para Expansão

**História do Usuário:** Como desenvolvedor, quero que a arquitetura refatorada siga padrões consistentes, para que seja fácil adicionar novo conteúdo no futuro.

#### Critérios de Aceitação

1. O Sistema_Refatoramento DEVE garantir que todos os componentes refatorados tenham menos de 300 linhas
2. O Sistema_Refatoramento DEVE garantir que todos os hooks extraídos sigam o padrão de nomenclatura `use[Feature]Logic.ts`
3. O Sistema_Refatoramento DEVE garantir que todas as pastas refatoradas tenham um `README.md` documentando a estrutura
4. O Sistema_Refatoramento DEVE garantir que todos os imports usem o padrão @/ alias
5. O Sistema_Refatoramento DEVE garantir que cores semânticas sejam usadas (bg-background, text-foreground)
6. O Sistema_Refatoramento DEVE garantir que nenhum breaking change seja introduzido nas APIs públicas dos componentes
7. O Sistema_Refatoramento DEVE garantir que TypeScript compile sem erros após cada refatoração
8. O Sistema_Refatoramento DEVE garantir que ESLint não reporte warnings críticos após cada refatoração

### Requisito 11: Documentação de Estrutura

**História do Usuário:** Como desenvolvedor, quero documentação clara da nova estrutura, para que seja fácil entender e manter o código.

#### Critérios de Aceitação

1. QUANDO uma pasta for criada, O Sistema_Refatoramento DEVE criar um `README.md` com diagrama da estrutura
2. QUANDO um hook for extraído, O Sistema_Refatoramento DEVE documentar os parâmetros e retornos
3. QUANDO um componente for dividido, O Sistema_Refatoramento DEVE manter exports compatíveis com uso anterior
4. QUANDO a refatoração estiver completa, O Sistema_Refatoramento DEVE atualizar `docs/COMPONENTS_TO_REFACTOR.md` com status

