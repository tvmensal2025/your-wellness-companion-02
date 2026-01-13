# Implementation Plan: Camera Workout with Pose Estimation

## Overview

Implementação em 3 fases do módulo "Treino com Câmera" usando YOLO-Pose para pose estimation, contagem automática de repetições e feedback de postura. A Fase 1 foca no MVP com agachamento, Fase 2 expande para mais exercícios e gamificação, Fase 3 adiciona features avançadas.

## Tasks

### Fase 1: MVP - Agachamento com Contagem (Core)

- [x] 1. Configurar infraestrutura base
  - [x] 1.1 Criar tabelas Supabase para camera workouts
    - Criar migration com `camera_workout_sessions`, `camera_rep_events`, `camera_posture_events`, `camera_metrics`, `camera_calibrations`
    - Adicionar índices para performance
    - Configurar RLS policies
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 1.2 Criar tipos TypeScript para o sistema
    - Definir interfaces: `Keypoint`, `PoseResult`, `RepCountResult`, `FormAnalysis`, `CalibrationData`
    - Criar tipos para exercícios: `ExerciseConfig`, `ExerciseThresholds`
    - Adicionar em `src/types/camera-workout.ts`
    - _Requirements: 2.1, 3.1_

  - [x] 1.3 Write property test for keypoint serialization round-trip
    - **Property 21: Keypoint Serialization Round-Trip**
    - **Validates: Requirements 8.2**

- [x] 2. Implementar YOLO-Pose no servidor
  - [x] 2.1 Adicionar endpoint /pose/analyze ao yolo-service-v2
    - Carregar modelo `yolo11n-pose.pt`
    - Implementar detecção de 17 keypoints COCO
    - Gerenciar session state para contagem contínua
    - Calcular ângulos e detectar reps
    - _Requirements: 9.2, 9.3, 9.8_

  - [x] 2.2 Implementar cálculo de ângulos no servidor
    - Função `calculate_angle(p1, p2, p3)` para 3 pontos
    - Suavização com EMA (exponential moving average)
    - Detecção de fase (up/down/transition)
    - _Requirements: 3.2, 2.6_

  - [x] 2.3 Write property test for angle calculation correctness
    - **Property 8: Angle Calculation Correctness**
    - **Validates: Requirements 3.2**

  - [x] 2.4 Atualizar Dockerfile e requirements.txt
    - Adicionar `yolo11n-pose.pt` ao build
    - Atualizar ultralytics para versão com pose
    - _Requirements: 9.6_

- [ ] 3. Checkpoint - Testar servidor YOLO-Pose
  - Ensure all tests pass, ask the user if questions arise.
  - Testar endpoint `/pose/analyze` com imagens de teste
  - Verificar detecção de keypoints e cálculo de ângulos


- [x] 4. Implementar pipeline de processamento no cliente
  - [x] 4.1 Criar SmoothingPipeline service
    - Implementar EMA (Exponential Moving Average) para keypoints
    - Interpolação de keypoints com baixa confiança
    - Histórico de frames para suavização
    - Criar em `src/services/camera-workout/smoothingPipeline.ts`
    - _Requirements: 2.6, 2.7_

  - [x] 4.2 Write property test for smoothing effectiveness
    - **Property 5: Temporal Smoothing Effectiveness**
    - **Validates: Requirements 2.6**

  - [x] 4.3 Criar RepCounterEngine service
    - Implementar máquina de estados (up/down/transition)
    - Cálculo de ângulo com 3 pontos
    - Debouncing para evitar contagem dupla
    - Detecção de reps parciais
    - Criar em `src/services/camera-workout/repCounterEngine.ts`
    - _Requirements: 3.2, 3.3, 3.5, 3.7_

  - [x] 4.4 Write property test for rep counting with debounce
    - **Property 9: Rep Counting with Debounce**
    - **Validates: Requirements 3.3, 3.5**

  - [x] 4.5 Criar FormAnalyzer service
    - Análise de postura com Safe Zone tolerance
    - Mensagens sempre positivas e encorajadoras
    - Rate limiting de feedback (1 por 5 segundos)
    - Criar em `src/services/camera-workout/formAnalyzer.ts`
    - _Requirements: 4.1, 4.2, 4.5_

  - [x] 4.6 Write property test for positive language enforcement
    - **Property 12: Positive Language Enforcement**
    - **Validates: Requirements 4.2**

  - [x] 4.7 Write property test for feedback rate limiting
    - **Property 13: Feedback Rate Limiting**
    - **Validates: Requirements 4.5**

- [x] 5. Implementar Camera Manager
  - [x] 5.1 Criar hook useCameraWorkout
    - Gerenciar permissões de câmera
    - Inicialização com timeout de 2 segundos
    - Monitorar FPS e ajustar resolução automaticamente
    - Switch entre câmeras (front/back)
    - Criar em `src/hooks/camera-workout/useCameraWorkout.ts`
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ] 5.2 Write property test for camera initialization timing
    - **Property 1: Camera Initialization Timing**
    - **Validates: Requirements 1.1**

  - [x] 5.3 Criar hook usePoseEstimation
    - Integração com servidor YOLO-Pose
    - Fallback para MediaPipe se disponível
    - Gerenciar modo de inferência (on-device/server)
    - Criar em `src/hooks/camera-workout/usePoseEstimation.ts`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Checkpoint - Testar pipeline de processamento
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar smoothing, rep counting e form analysis funcionando


- [x] 7. Implementar UI do treino com câmera
  - [x] 7.1 Criar componente CameraWorkoutScreen
    - Layout com preview de câmera fullscreen
    - Overlay de esqueleto com cores por qualidade
    - Contador de reps grande e visível
    - Área de feedback não intrusiva
    - Criar em `src/components/camera-workout/CameraWorkoutScreen.tsx`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 7.2 Criar componente SkeletonOverlay
    - Renderizar keypoints e conexões
    - Cores: verde (bom), amarelo (atenção), vermelho (problema)
    - Animação suave de transição
    - Criar em `src/components/camera-workout/SkeletonOverlay.tsx`
    - _Requirements: 6.2_

  - [ ] 7.3 Write property test for form score color mapping
    - **Property 16: Form Score Color Mapping**
    - **Validates: Requirements 6.2**

  - [x] 7.4 Criar componente RepCounter display
    - Número grande com animação ao incrementar
    - Progress bar do set atual
    - Feedback visual de rep válida vs parcial
    - Criar em `src/components/camera-workout/RepCounterDisplay.tsx`
    - _Requirements: 6.3, 6.6, 6.7_

  - [x] 7.5 Criar componente FormFeedbackToast
    - Mensagens de feedback gentis
    - Auto-dismiss após 3 segundos
    - Animação de entrada/saída suave
    - Criar em `src/components/camera-workout/FormFeedbackToast.tsx`
    - _Requirements: 4.2, 4.6, 4.7_

- [x] 8. Implementar sistema de calibração
  - [x] 8.1 Criar componente CalibrationFlow
    - Guia visual de 3 segundos
    - Detecção de posição em pé
    - Validação de ambiente (luz, distância)
    - Salvar calibração para sessões futuras
    - Criar em `src/components/camera-workout/CalibrationFlow.tsx`
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ] 8.2 Write property test for calibration data completeness
    - **Property 14: Calibration Data Completeness**
    - **Validates: Requirements 5.2**

  - [ ] 8.3 Write property test for calibration time bound
    - **Property 15: Calibration Time Bound**
    - **Validates: Requirements 5.10**

  - [ ] 8.4 Criar hook useCalibration
    - Gerenciar estado de calibração
    - Persistir calibração no Supabase
    - Carregar calibração anterior se existir
    - Criar em `src/hooks/camera-workout/useCalibration.ts`
    - _Requirements: 5.7, 5.9_

- [ ] 9. Checkpoint - Testar UI completa do MVP
  - Ensure all tests pass, ask the user if questions arise.
  - Testar fluxo completo: calibração → treino → resultados
  - Verificar feedback visual e contagem de reps


### Fase 2: Gamificação e Persistência

- [ ] 10. Implementar persistência de sessões
  - [ ] 10.1 Criar service de persistência
    - Salvar sessão ao finalizar treino
    - Salvar eventos de rep individuais
    - Salvar eventos de postura
    - Queue offline para sync posterior
    - Criar em `src/services/camera-workout/sessionPersistence.ts`
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ] 10.2 Write property test for session persistence
    - **Property 18: Session Persistence**
    - **Validates: Requirements 7.5, 8.1, 8.2**

  - [ ] 10.3 Criar hook useWorkoutSession
    - Gerenciar ciclo de vida da sessão
    - Integrar com persistência
    - Calcular estatísticas em tempo real
    - Criar em `src/hooks/camera-workout/useWorkoutSession.ts`
    - _Requirements: 8.6, 8.7_

- [ ] 11. Implementar gamificação
  - [ ] 11.1 Criar service de pontuação
    - Pontos base por rep
    - Bonus por boa forma (1.5x)
    - Streak bonus
    - XP para nível geral
    - Criar em `src/services/camera-workout/scoringService.ts`
    - _Requirements: 7.1, 7.10_

  - [ ] 11.2 Write property test for good form bonus points
    - **Property 17: Good Form Bonus Points**
    - **Validates: Requirements 7.1**

  - [ ] 11.3 Criar componente WorkoutSummary
    - Tela de resultados pós-treino
    - Estatísticas: reps, tempo, pontos, XP
    - Achievements desbloqueados
    - Opção de compartilhar
    - Criar em `src/components/camera-workout/WorkoutSummary.tsx`
    - _Requirements: 6.11, 7.4, 7.9_

  - [ ] 11.4 Integrar com sistema de desafios existente
    - Criar desafios específicos de câmera
    - Missões diárias de reps
    - Integrar com ChallengesV2
    - _Requirements: 7.2, 7.3, 7.6_

- [ ] 12. Checkpoint - Testar gamificação
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar pontuação, achievements e persistência

### Fase 3: Expansão e Polimento

- [ ] 13. Adicionar mais exercícios
  - [ ] 13.1 Implementar configuração de flexão (pushup)
    - Keypoints: ombros, cotovelos, pulsos
    - Ângulo do cotovelo para contagem
    - Form rules específicas
    - _Requirements: 11.1, 11.2_

  - [ ] 13.2 Implementar configuração de abdominal (situp)
    - Keypoints: ombros, quadril, joelhos
    - Ângulo do tronco para contagem
    - Form rules específicas
    - _Requirements: 11.1, 11.2_

  - [ ] 13.3 Implementar configuração de prancha (plank)
    - Keypoints: ombros, quadril, tornozelos
    - Detecção de alinhamento (não contagem)
    - Timer em vez de reps
    - _Requirements: 11.1, 11.2_

  - [ ] 13.4 Criar seletor de exercícios
    - Lista de exercícios suportados
    - Preview com demonstração
    - Tutorial integrado
    - Criar em `src/components/camera-workout/ExerciseSelector.tsx`
    - _Requirements: 11.3, 11.7_

- [ ] 14. Implementar observabilidade
  - [ ] 14.1 Criar service de métricas
    - Coletar FPS, latência, confiança
    - Detectar problemas de ambiente
    - Alertas automáticos
    - Criar em `src/services/camera-workout/metricsService.ts`
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

  - [ ] 14.2 Criar modo debug
    - Visualização detalhada de keypoints
    - Valores de ângulos em tempo real
    - Logs de decisões do sistema
    - _Requirements: 10.6_

- [ ] 15. Implementar acessibilidade
  - [ ] 15.1 Adicionar feedback de áudio
    - Contagem por voz
    - Dicas de postura faladas
    - Configurável on/off
    - _Requirements: 12.2_

  - [ ] 15.2 Adicionar comandos de voz
    - "Pausar", "Continuar", "Encerrar"
    - Integrar com Web Speech API
    - _Requirements: 12.6_

  - [ ] 15.3 Implementar exercícios adaptados
    - Variações sentadas
    - Tolerâncias ajustáveis
    - Exercícios alternativos
    - _Requirements: 12.1, 12.3, 12.4_

- [ ] 16. Checkpoint Final - Validação completa
  - Ensure all tests pass, ask the user if questions arise.
  - Testar todos os exercícios
  - Validar com 10 vídeos de teste
  - Verificar performance em diferentes dispositivos

## Notes

- Todos os testes são obrigatórios para garantir robustez do sistema
- Fase 1 é o MVP mínimo funcional com agachamento
- Fase 2 adiciona valor com gamificação e persistência
- Fase 3 expande para sistema completo
- Cada checkpoint valida a fase antes de prosseguir
- Property tests usam fast-check com mínimo 100 iterações
- Integração com YOLO existente na VPS 45.67.221.216:8002
