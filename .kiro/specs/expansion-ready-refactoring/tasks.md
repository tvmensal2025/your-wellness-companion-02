# Plano de Implementação: Expansion Ready Refactoring

## Visão Geral

Este plano implementa a refatoração de 9 componentes grandes nas áreas de MealPlan e Exercise, seguindo o padrão Orchestrator para preparar a arquitetura para expansão de conteúdo.

**Componentes a refatorar:**
- MealPlan: CompactMealPlanModal, WeeklyMealPlanModal, ChefKitchenMealPlan, DailyMealPlanModal
- Exercise: UnifiedTimer, ExerciseChallengeCard, ExerciseDetailModal, SavedProgramView, BuddyWorkoutCard

## Tasks

- [x] 1. Setup inicial e tipos compartilhados
  - [x] 1.1 Criar tipos compartilhados para MealPlan em `src/types/meal-plan.ts`
    - Definir interfaces Meal, MacroNutrients, DayPlan, MealType, MealConfig
    - _Requirements: 1.1, 2.1, 3.1, 4.1_
  - [x] 1.2 Criar tipos compartilhados para Exercise em `src/types/exercise-components.ts`
    - Definir interfaces TimerLogic, ChallengeLogic, ExerciseDetailLogic, etc.
    - _Requirements: 5.1, 6.1, 7.1, 8.1, 9.1_
  - [x] 1.3 Criar script de validação `scripts/validate-expansion-refactoring.sh`
    - Script bash para validar propriedades de corretude
    - _Requirements: 10.7, 10.8_

- [x] 2. Refatorar CompactMealPlanModal (1.037 linhas → ~150 linhas orchestrator)
  - [x] 2.1 Criar pasta `src/components/meal-plan/compact-meal-plan/` com estrutura
    - Criar hooks/, README.md inicial
    - _Requirements: 1.1_
  - [x] 2.2 Extrair hook `useCompactMealPlanLogic.ts`
    - Lógica de navegação entre refeições, estado de impressão
    - _Requirements: 1.2_
  - [x] 2.3 Extrair componente `MealCard.tsx`
    - Renderização de card de refeição individual com macros
    - _Requirements: 1.3_
  - [x] 2.4 Extrair componente `MacrosDisplay.tsx`
    - Exibição de macronutrientes com barras de progresso
    - _Requirements: 1.4_
  - [x] 2.5 Extrair componente `MealNavigation.tsx`
    - Navegação entre refeições (anterior/próximo)
    - _Requirements: 1.5_
  - [x] 2.6 Extrair componente `PrintButton.tsx`
    - Funcionalidade de impressão do cardápio
    - _Requirements: 1.6_
  - [x] 2.7 Criar orchestrator `index.tsx` e atualizar exports
    - Manter compatibilidade com imports existentes
    - _Requirements: 1.7, 10.6_
  - [x] 2.8 Escrever teste de propriedade para CompactMealPlan
    - **Property 1: Orchestrators não excedem 200 linhas**
    - **Validates: Requirements 1.7**

- [x] 3. Checkpoint - Validar CompactMealPlanModal
  - Executar `npm run build` e verificar que não há erros
  - Testar funcionalidade no browser
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Refatorar WeeklyMealPlanModal (660 linhas → ~120 linhas orchestrator)
  - [x] 4.1 Criar pasta `src/components/meal-plan/weekly-meal-plan/` com estrutura
    - _Requirements: 2.1_
  - [x] 4.2 Extrair hook `useWeeklyPlanLogic.ts`
    - Lógica de seleção de dias, cálculo de totais semanais
    - _Requirements: 2.2_
  - [x] 4.3 Extrair componente `DaySelector.tsx`
    - Seleção de dias da semana com indicadores visuais
    - _Requirements: 2.3_
  - [x] 4.4 Extrair componente `WeeklyOverview.tsx`
    - Visão geral da semana com totais
    - _Requirements: 2.4_
  - [x] 4.5 Extrair componente `CircularProgress.tsx`
    - Componente de progresso circular reutilizável
    - _Requirements: 2.5_
  - [x] 4.6 Criar orchestrator `index.tsx` e atualizar exports
    - _Requirements: 2.5, 10.6_

- [x] 5. Refatorar ChefKitchenMealPlan (523 linhas → ~120 linhas orchestrator)
  - [x] 5.1 Criar pasta `src/components/meal-plan/chef-kitchen/` com estrutura
    - _Requirements: 3.1_
  - [x] 5.2 Extrair hook `useChefKitchenLogic.ts`
    - Lógica de animações e estado do tema cozinha
    - _Requirements: 3.2_
  - [x] 5.3 Extrair componente `KitchenHeader.tsx`
    - Cabeçalho temático com animações
    - _Requirements: 3.3_
  - [x] 5.4 Extrair componente `RecipeCard.tsx`
    - Cards de receitas estilizados
    - _Requirements: 3.4_
  - [x] 5.5 Extrair componente `CookingAnimation.tsx`
    - Animações de cozinha (Framer Motion)
    - _Requirements: 3.5_
  - [x] 5.6 Criar orchestrator `index.tsx` e atualizar exports
    - _Requirements: 3.5, 10.6_

- [x] 6. Refatorar DailyMealPlanModal (450 linhas → ~100 linhas orchestrator)
  - [x] 6.1 Criar pasta `src/components/meal-plan/daily-meal-plan/` com estrutura
    - _Requirements: 4.1_
  - [x] 6.2 Extrair hook `useDailyPlanLogic.ts`
    - Lógica de estado do plano diário
    - _Requirements: 4.2_
  - [x] 6.3 Extrair componente `DailyMealList.tsx`
    - Lista de refeições do dia
    - _Requirements: 4.3_
  - [x] 6.4 Extrair componente `DailyTotals.tsx`
    - Totais nutricionais do dia
    - _Requirements: 4.4_
  - [x] 6.5 Criar orchestrator `index.tsx` e atualizar exports
    - _Requirements: 4.4, 10.6_

- [x] 7. Checkpoint - Validar área MealPlan completa
  - Executar `npm run build` e verificar que não há erros
  - Testar todas as 4 modais de cardápio no browser
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Refatorar UnifiedTimer (775 linhas → ~180 linhas orchestrator)
  - [x] 8.1 Criar pasta `src/components/exercise/unified-timer/` com estrutura
    - _Requirements: 5.1_
  - [x] 8.2 Extrair hook `useTimerLogic.ts`
    - Lógica de contagem, controle de play/pause/reset
    - _Requirements: 5.2_
  - [x] 8.3 Extrair hook `useTimerSound.ts`
    - Lógica de sons e beeps
    - _Requirements: 5.3_
  - [x] 8.4 Extrair componente `TimerDisplay.tsx`
    - Exibição do tempo com animações
    - _Requirements: 5.4_
  - [x] 8.5 Extrair componente `TimerControls.tsx`
    - Botões de controle (play, pause, reset, skip)
    - _Requirements: 5.5_
  - [x] 8.6 Extrair componente `TimerPresets.tsx`
    - Presets de tempo (30s, 60s, 90s, etc.)
    - _Requirements: 5.6_
  - [x] 8.7 Extrair componente `MotivationalMessage.tsx`
    - Mensagens motivacionais aleatórias
    - _Requirements: 5.7_
  - [x] 8.8 Criar orchestrator `index.tsx` com suporte a variantes
    - Manter variantes: full, compact, inline, mini
    - _Requirements: 5.8, 5.9, 10.6_
  - [x] 8.9 Escrever teste de propriedade para UnifiedTimer
    - **Property 1: Orchestrators não excedem 200 linhas**
    - **Validates: Requirements 5.8**

- [x] 9. Refatorar ExerciseChallengeCard (747 linhas → ~180 linhas orchestrator)
  - [x] 9.1 Criar pasta `src/components/exercise/exercise-challenge/` com estrutura
    - _Requirements: 6.1_
  - [x] 9.2 Extrair hook `useChallengeLogic.ts`
    - Lógica de criação, aceitação e progresso de desafios
    - _Requirements: 6.2_
  - [x] 9.3 Extrair componente `ChallengeHeader.tsx`
    - Cabeçalho do desafio com status
    - _Requirements: 6.3_
  - [x] 9.4 Extrair componente `OpponentSelector.tsx`
    - Seleção de oponentes da lista de seguidos
    - _Requirements: 6.4_
  - [x] 9.5 Extrair componente `ChallengeProgress.tsx`
    - Progresso comparativo do desafio
    - _Requirements: 6.5_
  - [x] 9.6 Extrair componente `ChallengeActions.tsx`
    - Ações (aceitar, recusar, completar)
    - _Requirements: 6.6_
  - [x] 9.7 Criar orchestrator `index.tsx` e atualizar exports
    - _Requirements: 6.6, 10.6_

- [x] 10. Checkpoint - Validar Timer e Challenge
  - Executar `npm run build` e verificar que não há erros
  - Testar UnifiedTimer em todas as variantes
  - Testar ExerciseChallengeCard
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Refatorar ExerciseDetailModal (698 linhas → ~180 linhas orchestrator)
  - [x] 11.1 Criar pasta `src/components/exercise/exercise-detail/` com estrutura
    - _Requirements: 7.1_
  - [x] 11.2 Extrair hook `useExerciseDetailLogic.ts`
    - Lógica de navegação entre steps (overview, instructions, execution)
    - _Requirements: 7.2_
  - [x] 11.3 Extrair hook `useExerciseFeedback.ts`
    - Lógica de feedback de dificuldade
    - _Requirements: 7.3_
  - [x] 11.4 Extrair componente `ExerciseOverview.tsx`
    - Visão geral do exercício com vídeo/imagem
    - _Requirements: 7.4_
  - [x] 11.5 Extrair componente `ExerciseInstructions.tsx`
    - Instruções detalhadas do exercício
    - _Requirements: 7.5_
  - [x] 11.6 Extrair componente `ExerciseExecution.tsx`
    - Tela de execução com timer e sets
    - _Requirements: 7.6_
  - [x] 11.7 Extrair componente `DifficultyFeedback.tsx`
    - Feedback de dificuldade (fácil, médio, difícil)
    - _Requirements: 7.7_
  - [x] 11.8 Criar orchestrator `index.tsx` e atualizar exports
    - _Requirements: 7.7, 10.6_

- [x] 12. Refatorar SavedProgramView (638 linhas → ~150 linhas orchestrator)
  - [x] 12.1 Criar pasta `src/components/exercise/saved-program/` com estrutura
    - _Requirements: 8.1_
  - [x] 12.2 Extrair hook `useSavedProgramLogic.ts`
    - Lógica de programas salvos e seleção de dias
    - _Requirements: 8.2_
  - [x] 12.3 Extrair componente `ProgramHeader.tsx`
    - Cabeçalho do programa com título e ações
    - _Requirements: 8.3_
  - [x] 12.4 Extrair componente `ProgramDayList.tsx`
    - Lista de dias do programa
    - _Requirements: 8.4_
  - [x] 12.5 Extrair componente `ProgramExerciseList.tsx`
    - Lista de exercícios de um dia
    - _Requirements: 8.5_
  - [x] 12.6 Criar orchestrator `index.tsx` e atualizar exports
    - _Requirements: 8.5, 10.6_

- [x] 13. Refatorar BuddyWorkoutCard (630 linhas → ~120 linhas orchestrator)
  - [x] 13.1 Criar pasta `src/components/exercise/buddy-workout/` com estrutura
    - _Requirements: 9.1_
  - [x] 13.2 Extrair hook `useBuddyWorkoutLogic.ts`
    - Lógica de treino em dupla e convites
    - _Requirements: 9.2_
  - [x] 13.3 Extrair componente `BuddySelector.tsx`
    - Seleção de parceiro de treino
    - _Requirements: 9.3_
  - [x] 13.4 Extrair componente `BuddyProgress.tsx`
    - Progresso comparativo entre parceiros
    - _Requirements: 9.4_
  - [x] 13.5 Extrair componente `BuddyActions.tsx`
    - Ações de convite e aceitação
    - _Requirements: 9.5_
  - [x] 13.6 Criar orchestrator `index.tsx` e atualizar exports
    - _Requirements: 9.5, 10.6_

- [x] 14. Checkpoint - Validar área Exercise completa
  - Executar `npm run build` e verificar que não há erros
  - Testar todos os 5 componentes de exercício no browser
  - Ensure all tests pass, ask the user if questions arise.

- [x] 15. Documentação e validação final
  - [x] 15.1 Criar/atualizar README.md em cada pasta refatorada
    - Documentar estrutura, props e uso
    - _Requirements: 10.3, 11.1, 11.2_
  - [x] 15.2 Atualizar `docs/COMPONENTS_TO_REFACTOR.md` com status
    - Marcar componentes refatorados como concluídos
    - _Requirements: 11.4_
  - [x] 15.3 Executar suite completa de testes de propriedade
    - **Property 1-8: Todas as propriedades de corretude**
    - **Validates: Requirements 10.1-10.8**
  - [x] 15.4 Executar script de validação final
    - `./scripts/validate-expansion-refactoring.sh`
    - _Requirements: 10.7, 10.8_

- [x] 16. Checkpoint Final - Validação completa
  - Executar `npm run build` e verificar bundle size
  - Executar `npm run test` e verificar que todos os testes passam
  - Testar navegação completa no browser
  - Ensure all tests pass, ask the user if questions arise.

## Notas

- Todas as tasks são obrigatórias para cobertura completa
- Cada task referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude
- Manter compatibilidade com imports existentes usando re-exports

