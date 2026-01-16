# Plano de Implementação: MaxNutrition Refactoring

## Visão Geral

Este plano divide o refatoramento em sprints incrementais, priorizando correções críticas primeiro, seguidas por melhorias de alta prioridade. Cada tarefa é independente e pode ser executada sem quebrar funcionalidades existentes.

## Tarefas

- [x] 1. Criar tipos TypeScript para componentes admin
  - [x] 1.1 Criar src/types/admin.ts com interfaces para PlatformAudit, SessionAnalytics, CourseManagement, GoalManagement, CompanyConfiguration
    - Definir AuditLog, AuditFilter, SessionMetrics, SessionAnalyticsData
    - Definir Course, CourseModule, CourseLesson
    - Definir Goal, GoalProgress, CompanyConfig
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.7_
  - [x] 1.2 Criar src/types/sessions.ts com interfaces para UserSessions e SessionTemplates
    - Definir UserSession, SessionTemplate, SessionContent, SessionSection, SessionQuestion, SessionTool
    - _Requirements: 3.6_
  - [x] 1.3 Escrever teste de propriedade para verificar que tipos compilam
    - **Property 2: TypeScript compila sem erros**
    - **Validates: Requirements 3.10**

- [x] 2. Corrigir catch blocks vazios
  - [x] 2.1 Corrigir UserSessions.tsx - adicionar console.error e toast.error nos 3 catch blocks vazios
    - _Requirements: 7.2_
  - [x] 2.2 Corrigir ChallengeCard.tsx - adicionar tratamento de erro nos 3 catch blocks vazios
    - _Requirements: 7.3_
  - [x] 2.3 Corrigir ExerciseCard.tsx - adicionar tratamento de erro no catch block vazio
    - _Requirements: 7.4_
  - [x] 2.4 Corrigir ExerciseSessionCard.tsx - adicionar tratamento de erro nos 2 catch blocks vazios
    - _Requirements: 7.5_
  - [x] 2.5 Corrigir useHealthFeed.ts - adicionar tratamento de erro no catch block vazio
    - _Requirements: 7.6_
  - [x] 2.6 Corrigir useGoogleFitSync.ts - adicionar tratamento de erro no catch block vazio
    - _Requirements: 7.7_

- [x] 3. Checkpoint - Verificar correções de catch blocks
  - Executar `npx eslint src/ --ext .ts,.tsx --rule 'no-empty: error'` e verificar que não há erros
  - Perguntar ao usuário se há dúvidas

- [x] 4. Corrigir dependências de React Hooks (Parte 1 - Admin)
  - [x] 4.1 Corrigir AdminWebhooks.tsx - envolver funções de fetch com useCallback
    - _Requirements: 2.3_
  - [x] 4.2 Corrigir AICostDashboard.tsx - adicionar dependências faltando aos hooks
    - _Requirements: 2.6_
  - [x] 4.3 Corrigir AdminDashboard.tsx - envolver funções de refresh com useCallback
    - _Requirements: 2.7_
  - [x] 4.4 Corrigir ChallengeManagement.tsx - adicionar dependências aos hooks
    - _Requirements: 2.8_
  - [x] 4.5 Corrigir SessionAnalytics.tsx - adicionar dependências aos hooks de analytics
    - _Requirements: 2.9_
  - [x] 4.6 Corrigir SystemStatus.tsx - adicionar dependências aos hooks de status
    - _Requirements: 2.10_
  - [x] 4.7 Corrigir UserDetailModal.tsx - adicionar dependências aos hooks de detalhes
    - _Requirements: 2.11_


- [x] 5. Corrigir dependências de React Hooks (Parte 2 - Componentes)
  - [x] 5.1 Corrigir RankingCommunity.tsx - adicionar dependências faltando aos useEffect
    - _Requirements: 2.4_
  - [x] 5.2 Corrigir SofiaBiography.tsx - adicionar dependências aos hooks
    - _Requirements: 2.5_
  - [x] 5.3 Corrigir UserSessions.tsx - usar useCallback para funções de sessão
    - _Requirements: 2.6_
  - [x] 5.4 Escrever teste de propriedade para verificar ESLint hooks
    - **Property 1: ESLint sem warnings críticos**
    - **Validates: Requirements 2.13**

- [x] 6. Checkpoint - Verificar correções de hooks
  - Executar `npx eslint src/ --ext .ts,.tsx --rule 'react-hooks/exhaustive-deps: error'`
  - Perguntar ao usuário se há dúvidas

- [x] 7. Substituir tipos `any` em componentes críticos (Parte 1)
  - [x] 7.1 Refatorar PlatformAudit.tsx - substituir 25+ tipos `any` pelas interfaces de admin.ts
    - _Requirements: 3.2_‹›
  - [x] 7.2 Refatorar SessionAnalytics.tsx - substituir 15+ tipos `any` pelas interfaces
    - _Requirements: 3.3_
  - [x] 7.3 Refatorar CourseManagementNew.tsx - substituir 15+ tipos `any` pelas interfaces
    - _Requirements: 3.4_

- [x] 8. Substituir tipos `any` em componentes críticos (Parte 2)
  - [x] 8.1 Refatorar GoalManagement.tsx - substituir 14+ tipos `any` pelas interfaces
    - _Requirements: 3.5_
  - [x] 8.2 Refatorar UserSessions.tsx - substituir 12+ tipos `any` pelas interfaces de sessions.ts
    - _Requirements: 3.6_
  - [x] 8.3 Refatorar CompanyConfiguration.tsx - substituir 10+ tipos `any` pelas interfaces
    - _Requirements: 3.7_
  - [x] 8.4 Escrever teste de propriedade para verificar ausência de `any` em arquivos críticos
    - **Property 2: TypeScript compila sem erros**
    - **Validates: Requirements 3.10, 9.5**

- [x] 9. Checkpoint - Verificar tipos TypeScript
  - Executar `npx tsc --noEmit` e verificar que não há erros
  - Perguntar ao usuário se há dúvidas

- [x] 10. Adicionar .limit() às queries Supabase restantes
  - [x] 10.1 Corrigir queries em src/services/exercise/*.ts - adicionar .limit(50) ou .single()
    - _Requirements: 4.4_
  - [x] 10.2 Corrigir queries em src/services/dr-vital/*.ts - adicionar .limit(50) ou .single()
    - _Requirements: 4.5_
  - [x] 10.3 Corrigir queries em src/services/api/*.ts - adicionar .limit(50) ou .single()
    - _Requirements: 4.6_
  - [x] 10.4 Corrigir queries restantes em src/hooks/*.ts - adicionar .limit(50) ou .single()
    - _Requirements: 4.7_
  - [x] 10.5 Escrever teste de propriedade para verificar queries com limite
    - **Property 4: Todas queries Supabase têm limite**
    - **Validates: Requirements 4.1, 4.2, 4.3, 9.3**


- [x] 11. Corrigir funcionalidades incompletas
  - [x] 11.1 Corrigir /professional-evaluation - verificar roteamento e permissões
    - _Requirements: 6.1_
  - [x] 11.2 Corrigir seção comunidade da Sofia - verificar lógica de renderização
    - _Requirements: 6.2_
  - [x] 11.3 Corrigir seção subscriptions da Sofia - verificar data fetching
    - _Requirements: 6.3_
  - [x] 11.4 Corrigir seção exercícios da Sofia - verificar montagem do componente
    - _Requirements: 6.4_

- [x] 12. Checkpoint - Verificar funcionalidades
  - Testar manualmente as 4 funcionalidades corrigidas
  - Perguntar ao usuário se há dúvidas

- [x] 13. Corrigir lexical declarations em case blocks
  - [x] 13.1 Corrigir AbundanceResults.tsx - adicionar blocos {} aos 3 cases com declarações
    - _Requirements: 8.2_
  - [x] 13.2 Corrigir SystemStatus.tsx - adicionar blocos {} aos 7 cases com declarações
    - _Requirements: 8.3_

- [x] 14. Substituir @ts-ignore por @ts-expect-error
  - [x] 14.1 Corrigir src/test/setup.ts - substituir 3 @ts-ignore com comentários explicativos
    - _Requirements: 10.2_
  - [x] 14.2 Corrigir src/utils/exportShoppingListPDF.ts - substituir @ts-ignore
    - _Requirements: 10.3_
  - [x] 14.3 Corrigir src/utils/exportMealPlanPDF.ts - substituir @ts-ignore
    - _Requirements: 10.4_
  - [x] 14.4 Corrigir src/components/ui/error-boundary.tsx - substituir @ts-ignore
    - _Requirements: 10.5_
  - [x] 14.5 Corrigir src/hooks/useExerciseProgram.ts - substituir @ts-ignore
    - _Requirements: 10.6_

- [x] 15. Corrigir escape characters e let/const
  - [x] 15.1 Remover escape characters desnecessários em ExerciseLibraryManagement.tsx, TutorialDeviceConfig.tsx
    - _Requirements: 11.2, 11.3_
  - [x] 15.2 Remover escape characters desnecessários em ChallengeCard.tsx, ExerciseCard.tsx
    - _Requirements: 11.4, 11.5_
  - [x] 15.3 Remover escape characters desnecessários em meal-plan-error-handler.ts
    - _Requirements: 11.6_
  - [x] 15.4 Converter let para const em UserSessions.tsx, ChallengeCard.tsx, ExerciseCard.tsx, useHealthFeed.ts
    - _Requirements: 12.2, 12.3, 12.4, 12.5_

- [x] 16. Checkpoint - Verificar correções de lint
  - Executar `npx eslint src/ --ext .ts,.tsx` e verificar redução de warnings
  - Perguntar ao usuário se há dúvidas


- [x] 17. Refatorar componentes grandes (Parte 1 - CoursePlatformNetflix)
  - [x] 17.1 Criar estrutura src/components/dashboard/course-platform/ com subpastas
    - _Requirements: 1.2_
  - [x] 17.2 Extrair CourseHeader.tsx do CoursePlatformNetflix.tsx
    - _Requirements: 1.2_
  - [x] 17.3 Extrair CourseGrid.tsx e CourseCard.tsx
    - _Requirements: 1.2_
  - [x] 17.4 Extrair CoursePlayer.tsx e CourseProgress.tsx
    - _Requirements: 1.2_
  - [x] 17.5 Criar hook useCourseData.ts com lógica extraída
    - _Requirements: 1.2_
  - [x] 17.6 Criar index.tsx que orquestra os sub-componentes
    - _Requirements: 1.2_

- [x] 18. Refatorar componentes grandes (Parte 2 - ExerciseOnboardingModal)
  - [x] 18.1 Criar estrutura src/components/exercise/onboarding/ com subpastas
    - _Requirements: 1.3_
  - [x] 18.2 Extrair WelcomeStep.tsx, GoalsStep.tsx
    - _Requirements: 1.3_
  - [x] 18.3 Extrair ExperienceStep.tsx, EquipmentStep.tsx
    - _Requirements: 1.3_
  - [x] 18.4 Criar hook useOnboardingState.ts com lógica de estado
    - _Requirements: 1.3_
  - [x] 18.5 Criar index.tsx que orquestra os steps
    - _Requirements: 1.3_

- [x] 19. Refatorar componentes grandes (Parte 3 - SessionTemplates e UserSessions)
  - [x] 19.1 Criar estrutura src/components/sessions/templates/ e user-sessions/
    - _Requirements: 1.4, 1.7_
  - [x] 19.2 Extrair TemplateList.tsx, TemplateEditor.tsx de SessionTemplates.tsx
    - _Requirements: 1.4_
  - [x] 19.3 Criar hook useTemplateLogic.ts
    - _Requirements: 1.4_
  - [x] 19.4 Extrair SessionList.tsx, SessionCard.tsx, SessionActions.tsx de UserSessions.tsx
    - _Requirements: 1.7_
  - [x] 19.5 Criar hook useSessionData.ts
    - _Requirements: 1.7_

- [x] 20. Checkpoint - Verificar refatoração de componentes (Parte 1)
  - Verificar que componentes refatorados funcionam corretamente
  - Verificar que nenhum arquivo excede 500 linhas
  - Perguntar ao usuário se há dúvidas

- [x] 21. Refatorar componentes grandes (Parte 4 - ActiveWorkoutModal e SofiaChat)
  - [x] 21.1 Criar estrutura src/components/exercise/workout/
    - _Requirements: 1.6_
  - [x] 21.2 Extrair WorkoutTimer.tsx, ExerciseDisplay.tsx, ProgressTracker.tsx
    - _Requirements: 1.6_
  - [x] 21.3 Criar estrutura src/components/sofia/chat/
    - _Requirements: 1.11_
  - [x] 21.4 Extrair MessageList.tsx, MessageInput.tsx, ChatHeader.tsx
    - _Requirements: 1.11_
  - [x] 21.5 Criar hook useChatLogic.ts
    - _Requirements: 1.11_


- [x] 22. Refatorar componentes grandes (Parte 5 - Restantes)
  - [x] 22.1 Refatorar UltraCreativeLayoutsV2.tsx - implementar lazy load para cada layout
    - _Requirements: 1.5_
  - [x] 22.2 Refatorar XiaomiScaleFlow.tsx - dividir em steps separados
    - _Requirements: 1.8_
  - [x] 22.3 Refatorar CourseManagementNew.tsx - dividir em componentes de gerenciamento
    - _Requirements: 1.9_
  - [x] 22.4 Refatorar MedicalDocumentsSection.tsx - dividir em seções separadas
    - _Requirements: 1.10_
  - [x] 22.5 Refatorar SaboteurTest.tsx - extrair cada step em componente separado
    - _Requirements: 1.12_
  - [x] 22.6 Escrever teste de propriedade para verificar tamanho de componentes
    - **Property 3: Nenhum componente excede 500 linhas**
    - **Validates: Requirements 1.1, 9.2**

- [x] 23. Checkpoint - Verificar refatoração de componentes (Parte 2)
  - Verificar que todos os 11 componentes grandes foram refatorados
  - Executar script de validação de linhas
  - Perguntar ao usuário se há dúvidas

- [x] 24. Implementar lazy loading para chunks grandes
  - [x] 24.1 Criar src/utils/lazy-components.ts com componentes lazy e HOC withSuspense
    - _Requirements: 5.6, 5.7_
  - [x] 24.2 Implementar lazy loading para DashboardOverview (117KB)
    - _Requirements: 5.2_
  - [x] 24.3 Implementar lazy loading para ExerciseOnboardingModal (68KB)
    - _Requirements: 5.3_
  - [x] 24.4 Implementar lazy loading para ChallengesDashboard (62KB)
    - _Requirements: 5.4_
  - [x] 24.5 Atualizar vite.config.ts com manualChunks otimizados
    - _Requirements: 5.6_

- [x] 25. Resolver circular chunks e otimizar bundle
  - [x] 25.1 Identificar e resolver dependências circulares entre vendor chunks
    - _Requirements: 5.5_
  - [x] 25.2 Configurar chunks separados para vendor-react, vendor-ui, vendor-charts
    - _Requirements: 5.6_
  - [x] 25.3 Verificar e remover dependências não utilizadas
    - _Requirements: 5.8_
  - [x] 25.4 Escrever teste de propriedade para verificar tamanho do bundle
    - **Property 5: Bundle size otimizado**
    - **Validates: Requirements 5.1, 5.8**

- [x] 26. Checkpoint - Verificar otimização de bundle
  - Executar `npm run build` e verificar tamanhos dos chunks
  - Verificar que não há warnings de circular dependencies
  - Perguntar ao usuário se há dúvidas

- [x] 27. Verificar padrões de qualidade finais
  - [x] 27.1 Verificar que todos os imports usam @/ alias
    - _Requirements: 9.8_
  - [x] 27.2 Verificar que cores semânticas são usadas (não hardcoded)
    - _Requirements: 9.9_
  - [x] 27.3 Verificar que edge functions têm CORS headers
    - _Requirements: 9.10_
  - [x] 27.4 Escrever teste de propriedade para verificar imports
    - **Property 6: Imports usando padrão @/ alias**
    - **Validates: Requirements 1.13, 9.8**

- [x] 28. Criar script de validação e executar testes finais
  - [x] 28.1 Criar scripts/validate-refactoring.sh com todas as verificações
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  - [x] 28.2 Executar suite de testes completa
    - _Requirements: 9.6_
  - [x] 28.3 Escrever teste de propriedade para verificar testes passando
    - **Property 7: Testes passando**
    - **Validates: Requirements 9.6**

- [x] 29. Checkpoint Final - Validação completa
  - Executar script de validação completo
  - Verificar métricas de sucesso:
    - [ ] Bundle size <100KB (gzip)
    - [ ] Lighthouse >90
    - [ ] 0 warnings ESLint críticos
    - [ ] Componentes <500 linhas
    - [ ] Todas queries com .limit()
  - Perguntar ao usuário se há dúvidas ou ajustes necessários

## Notas

- Todas as tarefas são obrigatórias para garantir qualidade completa
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Checkpoints garantem validação incremental
- Testes de propriedade validam propriedades universais de corretude
- Testes unitários validam exemplos específicos e edge cases
