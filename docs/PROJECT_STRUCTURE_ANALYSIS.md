```
================================================================================
📊 ANÁLISE COMPLETA DO PROJETO MAXNUTRITION
================================================================================
Data: 2026-01-15T19:22:09.135662

📋 RESUMO GERAL
----------------------------------------
  Total de arquivos: 1,114
  Total de linhas: 313,203
  Componentes: 742
  Hooks: 165
  Services: 43
  Pages: 27
  Testes: 39

📁 ARQUIVOS POR TIPO
----------------------------------------
  .tsx: 746 arquivos (208,541 linhas)
  .ts: 362 arquivos (99,891 linhas)
  .css: 3 arquivos (3,034 linhas)
  .json: 3 arquivos (1,737 linhas)

📏 DISTRIBUIÇÃO DE TAMANHO DOS COMPONENTES
----------------------------------------
       0-100 linhas: 144 ████████████████████████████
     101-200 linhas: 178 ███████████████████████████████████
     201-300 linhas: 173 ██████████████████████████████████
     301-400 linhas: 107 █████████████████████
     401-500 linhas:  53 ██████████
     501-750 linhas:  57 ███████████
    751-1000 linhas:  23 ████
       1000+ linhas:   7 █

⚠️  COMPONENTES GRANDES (>500 linhas)
----------------------------------------
  src/components/UserSessions.tsx
    → 1320 linhas (excede por 820)
  src/components/meal-plan/UltraCreativeLayoutsV2.tsx
    → 1290 linhas (excede por 790)
  src/components/admin/CourseManagementNew.tsx
    → 1273 linhas (excede por 773)
  src/components/dashboard/MedicalDocumentsSection.tsx
    → 1210 linhas (excede por 710)
  src/components/admin/SessionTemplates.tsx
    → 1180 linhas (excede por 680)
  src/components/SaboteurTest.tsx
    → 1120 linhas (excede por 620)
  src/components/meal-plan/CompactMealPlanModal.tsx
    → 1037 linhas (excede por 537)
  src/components/dr-vital/DrVitalEnhancedChat.tsx
    → 969 linhas (excede por 469)
  src/components/exercise/onboarding/index.tsx
    → 942 linhas (excede por 442)
  src/components/nutrition-tracking/MealPlanGeneratorModal.tsx
    → 937 linhas (excede por 437)
  src/components/XiaomiScaleButton.tsx
    → 917 linhas (excede por 417)
  src/components/FoodAnalysisSystem.tsx
    → 897 linhas (excede por 397)
  src/components/SystemicAnamnesis.tsx
    → 890 linhas (excede por 390)
  src/components/dashboard/DesafiosSection.tsx
    → 881 linhas (excede por 381)
  src/components/exercise/ActiveWorkoutModal.tsx
    → 875 linhas (excede por 375)
  ... e mais 5 componentes

✅ COMPONENTES REFATORADOS
----------------------------------------
  📂 src/components/dashboard/course-platform
     Arquivos: 8 | Total: 2506 linhas
       - CourseProgress.tsx
       - CoursePlayerModals.tsx
       - CoursePlayer.tsx
       - CourseCard.tsx
       - CourseGrid.tsx
       ... e mais 3 arquivos
  📂 src/components/exercise/onboarding
     Arquivos: 6 | Total: 1600 linhas
       - index.tsx
       - WelcomeStep.tsx
       - ExperienceStep.tsx
       - EquipmentStep.tsx
       - GoalsStep.tsx
       ... e mais 1 arquivos
  📂 src/components/exercise/workout
     Arquivos: 3 | Total: 554 linhas
       - WorkoutTimer.tsx
       - ProgressTracker.tsx
       - ExerciseDisplay.tsx
  📂 src/components/sessions/templates
     Arquivos: 5 | Total: 1306 linhas
       - index.tsx
       - TemplateEditor.tsx
       - TemplateList.tsx
       - sessionPayloadBuilder.ts
       - useTemplateLogic.ts
  📂 src/components/sessions/user-sessions
     Arquivos: 4 | Total: 1234 linhas
       - SessionList.tsx
       - SessionCard.tsx
       - SessionActions.tsx
       - useSessionData.ts
  📂 src/components/sofia/chat
     Arquivos: 8 | Total: 1041 linhas
       - MessageInput.tsx
       - ChatHeader.tsx
       - MessageList.tsx
       - index.ts
       - useMessageSending.ts
       ... e mais 3 arquivos
  📂 src/components/admin/course-management
     Arquivos: 7 | Total: 1032 linhas
       - OverviewTab.tsx
       - StatsCards.tsx
       - CoursesTab.tsx
       - Breadcrumb.tsx
       - LessonsTab.tsx
       ... e mais 2 arquivos
  📂 src/components/dashboard/medical-documents
     Arquivos: 5 | Total: 656 linhas
       - DocumentUploadModal.tsx
       - DocumentFilters.tsx
       - DocumentCard.tsx
       - DocumentStatsCards.tsx
       - DocumentList.tsx
  📂 src/components/saboteur-test
     Arquivos: 2 | Total: 275 linhas
       - ResultsStep.tsx
       - QuestionStep.tsx
  📂 src/components/meal-plan/ultra-creative-layouts-v2
     Arquivos: 7 | Total: 1289 linhas
       - index.tsx
       - AdventureMapLayout.tsx
       - SmartphoneLayout.tsx
       - MusicPlayerLayout.tsx
       - ZenNatureLayout.tsx
       ... e mais 2 arquivos

📦 ANÁLISE DE IMPORTS
----------------------------------------
  @/ alias: 3144 (58.6%)
  Relativos: 296 (5.5%)
  Externos: 1927 (35.9%)
  Deep relative (../../..): 0

📦 ANÁLISE DO BUNDLE
----------------------------------------
  Tamanho total: 4.68 MB
  Total de chunks: 87
  Maiores chunks:
    - ProfessionalEvaluationPage-BSYIELsF.js: 691.3 KB
    - AdminPage-CDlw3DMg.js: 489.1 KB
    - vendor-charts-3N-3FZ_O.js: 370.1 KB
    - jspdf.es.min-bY8YQSVR.js: 344.1 KB
    - index-gPyvl-0w.js: 232.3 KB
    - HealthFeedPage-CjQ-XDZi.js: 199.6 KB
    - html2canvas.esm-BpODSdIb.js: 196.1 KB
    - ExerciseDashboard-BYMFXjZ9.js: 190.9 KB
    - SofiaNutricionalSection-BINvRWHh.js: 174.0 KB
    - vendor-supabase-DD20C1V1.js: 164.0 KB

📋 SPECS DO PROJETO
----------------------------------------
  🔄 camera-workout-pose-estimation
     Tarefas: 27/58 (46.6%)
  🔄 maxnutrition-refactoring
     Tarefas: 119/124 (96.0%)
  🔄 smart-supplement-recommendations
     Tarefas: 24/38 (63.2%)
  ✅ real-heart-monitoring
     Tarefas: 32/32 (100.0%)
  ✅ character-menu-selector
     Tarefas: 28/28 (100.0%)
  🔄 theme-color-consistency
     Tarefas: 9/57 (15.8%)
  🔄 whatsapp-hybrid-integration
     Tarefas: 57/63 (90.5%)
  🔄 advanced-exercise-system
     Tarefas: 37/90 (41.1%)
  🔄 dr-vital-revolution
     Tarefas: 62/65 (95.4%)

🧪 ANÁLISE DE TESTES
----------------------------------------
  Total de arquivos de teste: 36
  Testes de propriedade: 23
  Testes unitários: 13

⚡ EDGE FUNCTIONS (SUPABASE)
----------------------------------------
  - analyze-medical-exam: 4499 linhas
  - sofia-image-analysis: 1981 linhas
  - whatsapp-ai-assistant: 1118 linhas
  - finalize-medical-document: 1092 linhas
  - mealie-real: 1020 linhas
  - whatsapp-webhook-unified: 909 linhas
  - sofia-enhanced-memory: 829 linhas
  - whatsapp-nutrition-webhook: 749 linhas
  - google-fit-sync: 675 linhas
  - food-analysis: 591 linhas
  Total: 89 functions

================================================================================
Relatório gerado com sucesso!
================================================================================
```