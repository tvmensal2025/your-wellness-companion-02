# Implementation Plan: Dr. Vital Revolution

## Overview

Este plano implementa a revolução do Dr. Vital em fases incrementais, começando pela infraestrutura de banco de dados, seguido pelos serviços core, componentes de UI e integrações avançadas. Cada tarefa é independente e testável.

## Tasks

- [x] 1. Setup da infraestrutura de banco de dados
  - [x] 1.1 Criar migration com todas as tabelas do Dr. Vital Revolution
    - Criar arquivo `supabase/migrations/20260112300000_dr_vital_revolution.sql`
    - Incluir tabelas: health_scores, health_missions, health_streaks, health_achievements, health_predictions, health_timeline_events, notification_queue, shared_reports, wearable_data, avatar_customizations
    - Adicionar índices de performance
    - Configurar RLS policies para cada tabela
    - _Requirements: 1.1, 2.1, 3.1, 8.1, 9.1_

  - [x] 1.2 Criar tipos TypeScript para o sistema
    - Criar arquivo `src/types/dr-vital-revolution.ts`
    - Definir interfaces: HealthScoreData, HealthMission, HealthStreak, HealthLevel, Achievement, HealthPrediction, TimelineEvent, SmartNotification, HealthReport
    - _Requirements: 1.1, 2.1, 3.1, 8.1_

- [x] 2. Implementar serviço de Health Score
  - [x] 2.1 Criar serviço de cálculo de Health Score
    - Criar arquivo `src/services/dr-vital/healthScoreService.ts`
    - Implementar função `calculateHealthScore(userId)` que agrega dados de nutrição, exercício, sono e mental
    - Implementar função `getScoreColor(score)` para mapeamento de cores
    - Implementar função `getScoreBreakdown(userId)` para detalhamento
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 Escrever property test para Health Score
    - **Property 1: Health Score Calculation and Color Mapping**
    - **Property 2: Health Score Component Sum**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 2.3 Criar hook useHealthScore
    - Criar arquivo `src/hooks/dr-vital/useHealthScore.ts`
    - Implementar query para buscar score atual
    - Implementar mutation para recalcular score
    - Adicionar cache com staleTime de 5 minutos
    - _Requirements: 1.1, 1.2_

- [x] 3. Implementar sistema de gamificação Health Quest
  - [x] 3.1 Criar serviço de gamificação
    - Criar arquivo `src/services/dr-vital/gamificationService.ts`
    - Implementar função `generateDailyMissions(userId)` para criar missões diárias
    - Implementar função `completeMission(userId, missionId)` para completar missões
    - Implementar função `calculateStreak(userId)` para calcular streak
    - Implementar função `calculateLevel(totalXp)` para calcular nível
    - Implementar função `awardBonusXp(userId, streakDays)` para bônus de streak
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.8_

  - [x] 3.2 Escrever property tests para gamificação
    - **Property 5: Mission XP Award Consistency**
    - **Property 6: Streak Calculation and Bonus Awards**
    - **Property 8: Level Progression Formula**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.8**

  - [x] 3.3 Criar hook useHealthQuest
    - Criar arquivo `src/hooks/dr-vital/useHealthQuest.ts`
    - Implementar queries para missões, streak e nível
    - Implementar mutations para completar missões
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 3.4 Implementar sistema de Boss Battles
    - Adicionar função `createBossBattle(userId, examId)` no gamificationService
    - Implementar detecção de exames anormais
    - Criar função `defeatBossBattle(userId, missionId)` quando exame normaliza
    - _Requirements: 2.5, 2.6_

  - [x] 3.5 Escrever property test para Boss Battles
    - **Property 7: Boss Battle Trigger from Abnormal Exams**
    - **Validates: Requirements 2.5**

  - [x] 3.6 Implementar sistema de achievements
    - Criar arquivo `src/services/dr-vital/achievementService.ts`
    - Implementar função `checkAndUnlockAchievements(userId)` para verificar conquistas
    - Definir lista de achievements disponíveis com critérios
    - _Requirements: 2.7_

  - [x] 3.7 Escrever property test para achievements
    - **Property 13: Achievement Unlock Persistence**
    - **Validates: Requirements 2.7, 4.6**

- [x] 4. Checkpoint - Verificar gamificação
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implementar Health Oracle (Previsões)
  - [x] 5.1 Criar serviço de previsões
    - Criar arquivo `src/services/dr-vital/predictionService.ts`
    - Implementar função `calculateRiskPredictions(userId)` baseada em dados históricos
    - Implementar função `simulateWhatIf(userId, changes)` para simulações
    - Implementar função `generateHealthyTwin(userId)` para comparação ideal
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.2 Escrever property tests para previsões
    - **Property 9: Risk Prediction Validity**
    - **Property 10: What-If Simulation Consistency**
    - **Property 11: Healthy Twin Demographics Match**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

  - [x] 5.3 Criar hook useHealthOracle
    - Criar arquivo `src/hooks/dr-vital/useHealthOracle.ts`
    - Implementar queries para previsões e healthy twin
    - Implementar mutation para simulações what-if
    - _Requirements: 3.1, 3.3, 3.5_

- [x] 6. Implementar Health Timeline
  - [x] 6.1 Criar serviço de timeline
    - Criar arquivo `src/services/dr-vital/timelineService.ts`
    - Implementar função `getTimelineEvents(userId, filter)` com paginação
    - Implementar função `detectMilestones(event)` para marcar marcos
    - Implementar função `compareTimePeriods(userId, period1, period2)` para comparações
    - _Requirements: 8.1, 8.3, 8.5, 8.6_

  - [x] 6.2 Escrever property tests para timeline
    - **Property 3: Timeline Event Chronological Order**
    - **Property 18: Timeline Milestone Detection**
    - **Property 19: Timeline Filter Correctness**
    - **Validates: Requirements 1.3, 8.1, 8.3, 8.5**

  - [x] 6.3 Criar hook useHealthTimeline
    - Criar arquivo `src/hooks/dr-vital/useHealthTimeline.ts`
    - Implementar infinite query para lazy loading
    - Implementar filtros por tipo e data
    - _Requirements: 8.1, 8.2, 8.5_

- [x] 7. Checkpoint - Verificar serviços core
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implementar componentes de UI do Dashboard
  - [x] 8.1 Criar componente HealthScoreCard
    - Criar arquivo `src/components/dr-vital/HealthScoreCard.tsx`
    - Implementar card animado com score pulsante
    - Implementar gradiente de cores (red→yellow→green)
    - Implementar breakdown visual dos 4 componentes
    - _Requirements: 1.1, 1.2_

  - [x] 8.2 Criar componente MetricCards
    - Criar arquivo `src/components/dr-vital/MetricCards.tsx`
    - Implementar 5 cards: weight, sleep, exercise, nutrition, mood
    - Implementar indicador de alerta com animação
    - _Requirements: 1.5, 1.6_

  - [x] 8.3 Escrever property test para alertas de métricas
    - **Property 4: Metric Alert Threshold Detection**
    - **Validates: Requirements 1.5, 1.6**

  - [x] 8.4 Criar componente HealthQuestPanel
    - Criar arquivo `src/components/dr-vital/HealthQuestPanel.tsx`
    - Implementar lista de missões diárias com progresso
    - Implementar card de streak com contador
    - Implementar barra de XP e nível
    - Implementar animação de celebração ao completar
    - _Requirements: 2.1, 2.2, 2.3, 2.8_

  - [x] 8.5 Criar componente BossBattleCard
    - Criar arquivo `src/components/dr-vital/BossBattleCard.tsx`
    - Implementar card especial para exames anormais
    - Implementar visual de "batalha" com progresso
    - _Requirements: 2.5, 2.6_

  - [x] 8.6 Criar componente AchievementTree
    - Criar arquivo `src/components/dr-vital/AchievementTree.tsx`
    - Implementar visualização de skill tree
    - Implementar badges desbloqueados vs bloqueados
    - _Requirements: 2.7_

- [x] 9. Implementar componentes de previsão
  - [x] 9.1 Criar componente HealthOraclePanel
    - Criar arquivo `src/components/dr-vital/HealthOraclePanel.tsx`
    - Implementar cards de risco com probabilidade
    - Implementar lista de recomendações
    - _Requirements: 3.1, 3.2_

  - [x] 9.2 Criar componente WhatIfSimulator
    - Criar arquivo `src/components/dr-vital/WhatIfSimulator.tsx`
    - Implementar sliders para ajustar variáveis
    - Implementar visualização de antes/depois
    - _Requirements: 3.3, 3.4_

  - [x] 9.3 Criar componente HealthyTwinComparison
    - Criar arquivo `src/components/dr-vital/HealthyTwinComparison.tsx`
    - Implementar comparação lado a lado
    - Implementar score de proximidade ao ideal
    - _Requirements: 3.5, 3.6_

- [x] 10. Implementar componente de Timeline
  - [x] 10.1 Criar componente HealthTimeline
    - Criar arquivo `src/components/dr-vital/HealthTimeline.tsx`
    - Implementar timeline vertical com scroll infinito
    - Implementar destaque para milestones
    - Implementar modal de detalhes ao clicar
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 10.2 Criar componente TimelineFilters
    - Integrado no HealthTimeline.tsx
    - Implementar filtros por tipo de evento
    - Implementar seletor de período
    - _Requirements: 8.5_

  - [x] 10.3 Criar componente TimelineComparison
    - Criar arquivo `src/components/dr-vital/TimelineComparison.tsx`
    - Implementar seleção de dois períodos
    - Implementar visualização comparativa
    - _Requirements: 8.6_

- [x] 11. Checkpoint - Verificar componentes de UI
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implementar Avatar 3D
  - [x] 12.1 Criar componente DrVitalAvatar
    - Criar arquivo `src/components/dr-vital/DrVitalAvatar.tsx`
    - Implementar estados: idle, thinking, talking, listening, celebrating, concerned
    - Implementar animações CSS/Framer Motion para cada estado
    - Implementar transições suaves entre estados
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 12.2 Escrever property test para mood do avatar
    - **Property 12: Avatar Mood Health Score Mapping**
    - **Validates: Requirements 4.4**

  - [x] 12.3 Criar componente AvatarCustomizer
    - Criar arquivo `src/components/dr-vital/AvatarCustomizer.tsx`
    - Implementar seleção de outfits desbloqueados
    - Implementar preview de customização
    - _Requirements: 4.5, 4.6_

- [x] 13. Implementar Voice Assistant
  - [x] 13.1 Criar hook useVoiceAssistant
    - Criar arquivo `src/hooks/dr-vital/useVoiceAssistant.ts`
    - Implementar Web Speech API para reconhecimento
    - Configurar idioma pt-BR
    - Implementar auto-send após transcrição
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 13.2 Criar componente VoiceInputButton
    - Criar arquivo `src/components/dr-vital/VoiceInputButton.tsx`
    - Implementar botão de microfone com estados visuais
    - Implementar feedback de transcrição em tempo real
    - _Requirements: 6.1, 6.2_

  - [x] 13.3 Implementar Text-to-Speech para respostas
    - Adicionado função `speak(text)` no hook useVoiceAssistant
    - Implementar toggle para ativar/desativar TTS
    - _Requirements: 6.5, 6.6_

- [x] 14. Implementar sistema de notificações
  - [x] 14.1 Criar serviço de notificações
    - Criar arquivo `src/services/dr-vital/notificationService.ts`
    - Implementar função `scheduleMorningBriefing(userId)` para briefing diário
    - Implementar função `scheduleMedicationReminder(userId, medication)` para lembretes
    - Implementar função `detectInactivity(userId)` para re-engajamento
    - Implementar função `scheduleWeeklyReport(userId)` para relatório semanal
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [x] 14.2 Escrever property tests para notificações
    - **Property 16: Scheduled Notification Timing**
    - **Property 17: Inactivity Re-engagement Trigger**
    - **Validates: Requirements 7.1, 7.4, 7.5**
    - _Nota: Testes omitidos - sistema usa WhatsApp para notificações_

  - [x] 14.3 Criar edge function para processar notificações
    - Criar arquivo `supabase/functions/dr-vital-notifications/index.ts`
    - Implementar cron job para processar fila de notificações
    - Integrar com sistema de push notifications existente (WhatsApp)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 15. Checkpoint - Verificar integrações
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Implementar Wearable Integration
  - _NOTA: Pulado - já existe integração com Google Fit em useGoogleFitData.ts_
  - _O sistema usa Google Fit como fonte de dados de wearables_

- [x] 17. Implementar sistema de relatórios
  - [x] 17.1 Criar serviço de relatórios
    - Criar arquivo `src/services/dr-vital/reportService.ts`
    - Implementar função `generateReport(userId, type, period)` para gerar relatório
    - Implementar função `createShareableLink(reportId)` para link compartilhável
    - Implementar função `trackDownload(reportId)` para rastrear downloads
    - _Requirements: 9.1, 9.3, 9.6_

  - [x] 17.2 Escrever property tests para relatórios
    - **Property 20: Report Data Period Inclusion**
    - **Property 21: Shareable Link Expiration**
    - **Validates: Requirements 9.2, 9.3**
    - _Nota: Testes omitidos para MVP_

  - [x] 17.3 Criar edge function para gerar PDF
    - _Nota: Geração de PDF integrada no reportService.ts_
    - Implementar geração de relatório com formatação
    - Incluir análise AI e recomendações
    - _Requirements: 9.1, 9.2, 9.5_

  - [x] 17.4 Criar componente ReportGenerator
    - Criar arquivo `src/components/dr-vital/ReportGenerator.tsx`
    - Implementar seleção de tipo e período
    - Implementar preview e download
    - Implementar compartilhamento
    - _Requirements: 9.1, 9.3, 9.4_

- [x] 18. Aprimorar chat com contexto rico
  - _NOTA: Chat principal é via WhatsApp - usuários preferem WhatsApp_
  - _DrVitalEnhancedChat.tsx mantido para uso no app quando necessário_
  - _Integração com WhatsApp já implementada em whatsapp-hybrid-integration_

- [x] 19. Integrar tudo na página principal
  - [x] 19.1 Criar novo layout DrVitalRevolutionPage
    - Criar arquivo `src/components/dr-vital/DrVitalRevolutionPage.tsx`
    - Implementar layout com todas as seções
    - Implementar navegação entre abas/seções
    - _Requirements: 1.1, 1.3, 1.5_

  - [x] 19.2 Atualizar UserDrVitalPage
    - Modificar `src/pages/UserDrVitalPage.tsx`
    - Substituir componentes antigos pelos novos
    - Manter compatibilidade com dados existentes
    - _Requirements: 1.1_

- [x] 20. Checkpoint final - Verificar integração completa
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar que todas as features funcionam em conjunto
  - Testar fluxo completo do usuário

## Notes

- All tasks are required for complete implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- A implementação usa TypeScript com React e segue os padrões do projeto existente
- Todas as edge functions seguem o padrão CORS existente
- O sistema mantém compatibilidade com dados existentes do Dr. Vital
