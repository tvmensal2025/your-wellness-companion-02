# Implementation Plan: Real Heart Monitoring System

## Overview

Este plano implementa o sistema de Monitoramento Cardíaco Real em etapas incrementais, começando pelos serviços de cálculo, seguido pelos hooks, componentes e finalmente a integração no dashboard.

## Tasks

- [x] 1. Criar serviços de cálculo cardíaco
  - [x] 1.1 Criar `src/services/cardio/zoneClassifier.ts` com função de classificação de zonas HR
    - Implementar `classifyHeartRateZone(bpm)` retornando 'bradycardia' | 'normal' | 'elevated'
    - Implementar `getZoneColor(zone)` retornando classe CSS apropriada
    - _Requirements: 1.4, 1.5, 1.6_
  - [x] 1.2 Write property test for zone classification
    - **Property 1: Heart Rate Zone Classification**
    - **Validates: Requirements 1.4, 1.5, 1.6**
  - [x] 1.3 Criar `src/services/cardio/pointsCalculator.ts` com cálculo de pontos cardio
    - Implementar `calculateMaxHeartRate(age)` usando fórmula 220 - age
    - Implementar `getCardioZone(bpm, maxHR)` retornando zona e multiplicador
    - Implementar `calculateDailyPoints(samples, age)` somando pontos por zona
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  - [x] 1.4 Write property test for points calculation
    - **Property 4: Cardio Points Zone Calculation**
    - **Property 5: Max Heart Rate Formula**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
  - [x] 1.5 Criar `src/services/cardio/trendAnalyzer.ts` com análise de tendência
    - Implementar `analyzeTrend(dailyAverages)` retornando direction e message
    - Implementar `normalizeForSparkline(values)` para dados do gráfico
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 1.6 Write property test for trend analysis
    - **Property 3: Trend Classification Consistency**
    - **Property 11: Sparkline Data Transformation**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**

- [x] 2. Checkpoint - Verificar serviços
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Criar migration para tabela de pontos cardio
  - [x] 3.1 Criar migration `supabase/migrations/YYYYMMDD_cardio_points_history.sql`
    - Criar tabela `cardio_points_history` com campos: id, user_id, date, total_points, fat_burn_minutes, cardio_minutes, peak_minutes
    - Adicionar índice em (user_id, date)
    - Configurar RLS policies para acesso do próprio usuário
    - _Requirements: 3.7_

- [x] 4. Criar hooks de dados cardíacos
  - [x] 4.1 Criar `src/hooks/cardio/useHeartRate.ts`
    - Buscar dados mais recentes do google_fit_data
    - Classificar zona usando zoneClassifier
    - Retornar currentBpm, zone, lastUpdated, isConnected
    - _Requirements: 1.1, 1.3, 1.7_
  - [x] 4.2 Write property test for most recent HR selection
    - **Property 2: Most Recent Heart Rate Selection**
    - **Validates: Requirements 1.1, 1.7**
  - [x] 4.3 Criar `src/hooks/cardio/useCardioTrend.ts`
    - Buscar últimos 7 dias de heart_rate_avg do google_fit_data
    - Calcular tendência usando trendAnalyzer
    - Retornar trend, weeklyAverages, changePercent, message
    - _Requirements: 2.1, 2.6_
  - [x] 4.4 Criar `src/hooks/cardio/useCardioPoints.ts`
    - Buscar active_minutes do google_fit_data para hoje
    - Calcular pontos usando pointsCalculator
    - Buscar pontos de ontem para comparação
    - Persistir pontos na tabela cardio_points_history
    - _Requirements: 3.5, 3.7, 3.8_
  - [x] 4.5 Write property tests for hooks
    - **Property 6: Progress Percentage Calculation**
    - **Property 7: Day Comparison Calculation**
    - **Property 8: Sync Timing Logic**
    - **Validates: Requirements 3.5, 3.8, 5.1**

- [x] 5. Checkpoint - Verificar hooks
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Criar componentes de UI
  - [x] 6.1 Criar `src/components/cardio/HeartRateCard.tsx`
    - Exibir BPM com animação de pulso CSS
    - Mostrar indicador de zona colorido
    - Exibir timestamp da última leitura
    - Mostrar estado de conexão/erro
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_
  - [x] 6.2 Criar `src/components/cardio/CardioTrendCard.tsx`
    - Exibir seta de tendência com cor apropriada
    - Renderizar mini sparkline SVG
    - Mostrar mensagem descritiva
    - Exibir percentual de mudança
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_
  - [x] 6.3 Criar `src/components/cardio/CardioPointsCard.tsx`
    - Exibir pontos do dia com progress ring
    - Mostrar comparação com dia anterior
    - Adicionar animação de celebração ao atingir meta
    - _Requirements: 3.5, 3.6, 3.8_

- [x] 7. Integrar no DrVitalDashboard
  - [x] 7.1 Atualizar `src/components/dashboard/character-dashboards/DrVitalDashboard.tsx`
    - Remover MetricCard de Pressão
    - Remover MetricCard de Glicose
    - Adicionar HeartRateCard no lugar do ECG card atual
    - Adicionar CardioTrendCard
    - Adicionar CardioPointsCard
    - Reorganizar grid para 2 colunas com novos cards
    - _Requirements: 4.1, 4.2, 4.4_
  - [x] 7.2 Write unit tests for dashboard integration
    - Verificar que Pressão e Glicose não são renderizados
    - Verificar que novos cards são renderizados
    - _Requirements: 4.1, 4.2_

- [x] 8. Atualizar sincronização do Google Fit
  - [x] 8.1 Atualizar `src/hooks/useGoogleFitData.ts`
    - Adicionar lógica de sync automático se última sync > 15 min
    - Garantir que heart_rate_avg, heart_rate_max, heart_rate_min são buscados
    - _Requirements: 5.1, 5.5_
  - [x] 8.2 Write property test for sync timing
    - **Property 8: Sync Timing Logic**
    - **Property 9: Token Expiry Detection**
    - **Validates: Requirements 5.1, 5.3**

- [x] 9. Checkpoint - Verificar integração completa
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Adicionar estados de loading e erro
  - [x] 10.1 Adicionar skeleton loaders aos componentes cardio
    - Criar variantes de skeleton para cada card
    - Exibir durante carregamento de dados
    - _Requirements: 6.4_
  - [x] 10.2 Implementar tratamento de erros nos hooks
    - Detectar token expirado e mostrar mensagem de reconexão
    - Mostrar fallback quando não há dados
    - _Requirements: 5.3, 1.3_

- [x] 11. Final checkpoint - Testes e validação
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar responsividade em mobile
  - Testar fluxo completo com Google Fit conectado

## Notes

- All tasks including tests are required for comprehensive coverage
- Cada task referencia requisitos específicos para rastreabilidade
- Property tests usam fast-check para TypeScript
- Checkpoints garantem validação incremental
