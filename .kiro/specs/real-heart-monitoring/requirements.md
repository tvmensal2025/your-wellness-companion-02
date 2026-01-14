# Requirements Document

## Introduction

Este documento especifica os requisitos para o sistema de Monitoramento Cardíaco Real, que substituirá os cards de Pressão e Glicose (não disponíveis no Google Fit) por métricas cardiovasculares reais e gamificadas. O sistema utilizará dados do relógio do usuário via Google Fit para exibir batimentos cardíacos em tempo real, tendência cardiovascular e pontos cardio baseados em atividade física.

## Glossary

- **Heart_Monitor**: Sistema responsável por exibir e processar dados de batimento cardíaco em tempo real
- **Cardio_Trend_Analyzer**: Componente que calcula e exibe tendências cardiovasculares baseadas em histórico
- **Cardio_Points_Calculator**: Sistema de gamificação que converte atividade cardíaca em pontos
- **Google_Fit_Sync**: Serviço de sincronização de dados do Google Fit
- **Real_Time_Display**: Componente de exibição de dados em tempo real com animação de pulso
- **Dashboard_Card**: Componente visual de card no dashboard de saúde

## Requirements

### Requirement 1: Exibição de Batimento Cardíaco Real

**User Story:** As a user, I want to see my real heart rate from my smartwatch, so that I can monitor my cardiac health in real-time.

#### Acceptance Criteria

1. WHEN the user opens the dashboard, THE Heart_Monitor SHALL display the most recent heart rate from Google Fit data
2. WHEN heart rate data is available, THE Real_Time_Display SHALL show a pulsing animation synchronized with the BPM value
3. WHEN no heart rate data is available, THE Heart_Monitor SHALL display "--" with a message to connect Google Fit
4. WHEN heart rate is below 60 bpm, THE Heart_Monitor SHALL display the value in blue indicating bradycardia zone
5. WHEN heart rate is between 60-100 bpm, THE Heart_Monitor SHALL display the value in green indicating normal zone
6. WHEN heart rate is above 100 bpm, THE Heart_Monitor SHALL display the value in orange/red indicating elevated zone
7. THE Heart_Monitor SHALL display the timestamp of the last heart rate reading

### Requirement 2: Tendência Cardiovascular

**User Story:** As a user, I want to see my cardiovascular trend over time, so that I can understand if my heart health is improving or declining.

#### Acceptance Criteria

1. WHEN the user views the dashboard, THE Cardio_Trend_Analyzer SHALL calculate a 7-day trend based on average heart rates
2. WHEN the average heart rate is decreasing (improving fitness), THE Cardio_Trend_Analyzer SHALL display an upward green arrow with "Melhorando"
3. WHEN the average heart rate is stable (±5 bpm), THE Cardio_Trend_Analyzer SHALL display a horizontal yellow arrow with "Estável"
4. WHEN the average heart rate is increasing (declining fitness), THE Cardio_Trend_Analyzer SHALL display a downward red arrow with "Atenção"
5. THE Cardio_Trend_Analyzer SHALL display a mini sparkline chart showing the last 7 days of heart rate averages
6. IF insufficient data exists (less than 3 days), THEN THE Cardio_Trend_Analyzer SHALL display "Dados insuficientes" with instruction to sync more data

### Requirement 3: Pontos Cardio (Gamificação)

**User Story:** As a user, I want to earn cardio points based on my heart activity, so that I feel motivated to maintain an active lifestyle.

#### Acceptance Criteria

1. THE Cardio_Points_Calculator SHALL award 1 point for every minute in the fat-burn zone (50-70% max HR)
2. THE Cardio_Points_Calculator SHALL award 2 points for every minute in the cardio zone (70-85% max HR)
3. THE Cardio_Points_Calculator SHALL award 3 points for every minute in the peak zone (85-100% max HR)
4. WHEN calculating max heart rate, THE Cardio_Points_Calculator SHALL use the formula: 220 - user_age
5. THE Dashboard_Card SHALL display daily cardio points with a progress ring toward daily goal
6. WHEN the user reaches 100% of daily cardio points goal, THE Dashboard_Card SHALL display a celebration animation
7. THE Cardio_Points_Calculator SHALL persist daily points to the database for historical tracking
8. WHEN displaying cardio points, THE Dashboard_Card SHALL show comparison with previous day (e.g., "+15 vs ontem")

### Requirement 4: Remoção de Cards Não Suportados

**User Story:** As a user, I want to see only relevant health metrics, so that I'm not confused by empty or unavailable data.

#### Acceptance Criteria

1. THE Dashboard_Card for Pressão (blood pressure) SHALL be removed from the Dr. Vital dashboard
2. THE Dashboard_Card for Glicose (glucose) SHALL be removed from the Dr. Vital dashboard
3. WHERE blood pressure or glucose data exists from manual entry, THE Dashboard_Card SHALL display it in a secondary "Dados Manuais" section
4. THE Dashboard layout SHALL be reorganized to accommodate the new Tendência Cardiovascular and Pontos Cardio cards

### Requirement 5: Sincronização com Google Fit

**User Story:** As a user, I want my heart data to sync automatically from Google Fit, so that I always see up-to-date information.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE Google_Fit_Sync SHALL fetch the latest heart rate data if last sync was more than 15 minutes ago
2. WHEN the user pulls to refresh, THE Google_Fit_Sync SHALL force a new sync with Google Fit
3. IF the Google Fit token is expired, THEN THE Google_Fit_Sync SHALL prompt the user to reconnect
4. THE Google_Fit_Sync SHALL store heart rate samples with timestamps in the google_fit_data table
5. WHEN syncing heart rate data, THE Google_Fit_Sync SHALL retrieve heart_rate_avg, heart_rate_max, and heart_rate_min for each day

### Requirement 6: Responsividade e Performance

**User Story:** As a user, I want the heart monitoring cards to load quickly and look good on any device, so that I have a smooth experience.

#### Acceptance Criteria

1. THE Dashboard_Card components SHALL render within 100ms of data availability
2. THE Real_Time_Display animation SHALL use CSS animations to minimize JavaScript overhead
3. THE Dashboard_Card layout SHALL adapt to mobile screens (< 640px) with stacked layout
4. WHEN data is loading, THE Dashboard_Card SHALL display skeleton loaders instead of empty states
5. THE Cardio_Trend_Analyzer sparkline SHALL use SVG for crisp rendering at any resolution
