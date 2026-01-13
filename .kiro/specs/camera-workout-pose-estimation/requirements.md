# Requirements Document

## Introduction

Sistema revolucionário de "Treino com Câmera" que utiliza YOLO-Pose e MediaPipe para pose estimation em tempo real, permitindo contagem automática de repetições, feedback de postura em tempo real, e gamificação motivacional. O sistema é projetado para ser tolerante a erros (público iniciante/obeso), priorizando motivação e consistência sobre precisão clínica. Suporta execução on-device (preferido) e server-side (fallback via VPS Docker).

## Glossary

- **Pose_Estimator**: Motor principal de estimativa de pose usando YOLO-Pose ou MediaPipe
- **Rep_Counter**: Sistema de contagem de repetições baseado em análise de keypoints
- **Form_Analyzer**: Analisador de postura que fornece feedback gentil e construtivo
- **Camera_Manager**: Gerenciador de captura de câmera com otimização de performance
- **Skeleton_Renderer**: Renderizador de esqueleto sobreposto ao vídeo
- **Exercise_Detector**: Detector automático do tipo de exercício sendo executado
- **Calibration_System**: Sistema de calibração inicial (3 segundos) para ajustar thresholds
- **Smoothing_Pipeline**: Pipeline de suavização de keypoints para reduzir ruído
- **Workout_Session**: Sessão de treino com câmera ativa
- **Keypoint**: Ponto articular detectado (quadril, joelho, tornozelo, etc.)
- **Safe_Zone**: Zona de tolerância para movimentos imperfeitos
- **Debounce_Timer**: Timer para evitar contagens duplicadas
- **Server_Inference**: Modo de inferência via API quando device não suporta on-device
- **Motivational_Coach**: Sistema de mensagens motivacionais e encorajadoras

## Requirements

### Requirement 1: Captura e Processamento de Câmera

**User Story:** Como usuário, quero que o app capture minha câmera de forma fluida e eficiente, para que eu possa treinar sem travamentos ou delays.

#### Acceptance Criteria

1. WHEN a user opens the camera workout screen, THE Camera_Manager SHALL request camera permissions and initialize capture within 2 seconds
2. WHEN the camera is active, THE Camera_Manager SHALL maintain minimum 15 FPS on mid-range devices and 30 FPS on high-end devices
3. WHEN device resources are limited, THE Camera_Manager SHALL automatically reduce resolution to maintain frame rate
4. IF camera access is denied, THEN THE Camera_Manager SHALL display a friendly message explaining how to enable permissions
5. WHEN the user switches between front and back camera, THE Camera_Manager SHALL maintain session state and continue tracking
6. WHILE the camera is active, THE Camera_Manager SHALL monitor battery and temperature, reducing quality if overheating
7. WHEN the app goes to background, THE Camera_Manager SHALL pause processing and resume when returning to foreground
8. THE Camera_Manager SHALL support both portrait and landscape orientations with automatic adjustment

### Requirement 2: Pose Estimation Engine

**User Story:** Como usuário, quero que o sistema detecte minha posição corporal com precisão suficiente para contar repetições, mesmo com roupas largas ou iluminação ruim.

#### Acceptance Criteria

1. WHEN a frame is captured, THE Pose_Estimator SHALL detect 17 keypoints (COCO format) with confidence scores
2. WHEN YOLO-Pose is available on-device, THE Pose_Estimator SHALL use it as primary engine
3. IF YOLO-Pose is not available or fails, THEN THE Pose_Estimator SHALL fallback to MediaPipe Pose
4. IF on-device inference is too slow (<10 FPS), THEN THE Pose_Estimator SHALL switch to Server_Inference mode
5. WHEN using Server_Inference, THE Pose_Estimator SHALL stream frames to VPS (45.67.221.216:8002) and receive keypoints
6. THE Pose_Estimator SHALL apply temporal smoothing (exponential moving average) to reduce jitter
7. WHEN keypoint confidence is below 0.5, THE Pose_Estimator SHALL interpolate from previous frames
8. THE Pose_Estimator SHALL handle partial body visibility (e.g., only upper body visible)
9. WHEN multiple people are in frame, THE Pose_Estimator SHALL track only the primary user (largest/centered)
10. THE Pose_Estimator SHALL normalize keypoints to body-relative coordinates for scale invariance

### Requirement 3: Contagem de Repetições - Agachamento (MVP)

**User Story:** Como usuário, quero que o sistema conte minhas repetições de agachamento automaticamente, para que eu possa focar no exercício sem contar manualmente.

#### Acceptance Criteria

1. WHEN performing a squat, THE Rep_Counter SHALL detect the movement using hip, knee, and ankle keypoints
2. THE Rep_Counter SHALL calculate knee angle using the formula: angle = atan2(hip-knee, knee-ankle)
3. WHEN knee angle goes below 90° (descida) and returns above 160° (subida), THE Rep_Counter SHALL count one repetition
4. THE Rep_Counter SHALL use dynamic thresholds based on user's range of motion during calibration
5. THE Rep_Counter SHALL apply debouncing (minimum 0.8 seconds between reps) to prevent double counting
6. WHEN a rep is counted, THE Rep_Counter SHALL provide haptic feedback and audio confirmation
7. THE Rep_Counter SHALL track partial reps (incomplete range of motion) separately
8. WHEN user's form degrades significantly, THE Rep_Counter SHALL pause counting and prompt for rest
9. THE Rep_Counter SHALL maintain accuracy of at least 90% compared to manual counting
10. THE Rep_Counter SHALL work with users of different heights and body types without recalibration

### Requirement 4: Feedback de Postura Gentil

**User Story:** Como usuário iniciante/obeso, quero receber feedback de postura de forma gentil e encorajadora, para que eu me sinta motivado a continuar sem me sentir julgado.

#### Acceptance Criteria

1. WHEN analyzing form, THE Form_Analyzer SHALL use tolerant thresholds (Safe_Zone) appropriate for beginners
2. THE Form_Analyzer SHALL provide feedback in positive language ("Tente descer um pouquinho mais" instead of "Agachamento incompleto")
3. WHEN knees extend past toes excessively, THE Form_Analyzer SHALL gently suggest "Mantenha os joelhos alinhados com os pés"
4. WHEN back rounds during squat, THE Form_Analyzer SHALL suggest "Mantenha o peito erguido, você está indo bem!"
5. THE Form_Analyzer SHALL limit feedback frequency to maximum 1 tip every 5 seconds to avoid overwhelming
6. WHEN user improves form, THE Form_Analyzer SHALL provide positive reinforcement ("Excelente! Sua postura melhorou!")
7. THE Form_Analyzer SHALL never use negative or judgmental language
8. WHEN user completes a set with good form, THE Form_Analyzer SHALL celebrate with encouraging messages
9. THE Form_Analyzer SHALL adapt feedback based on user's fitness level (beginner/intermediate/advanced)
10. IF user reports discomfort, THEN THE Form_Analyzer SHALL immediately suggest stopping and provide alternative exercises

### Requirement 5: Calibração Inicial

**User Story:** Como usuário, quero um processo de calibração rápido e simples, para que o sistema se adapte ao meu corpo e ambiente.

#### Acceptance Criteria

1. WHEN starting a camera workout, THE Calibration_System SHALL guide user through a 3-second calibration pose
2. DURING calibration, THE Calibration_System SHALL capture user's standing position and range of motion
3. THE Calibration_System SHALL detect and warn about poor lighting conditions
4. THE Calibration_System SHALL detect and warn if user is too close or too far from camera
5. THE Calibration_System SHALL adjust angle thresholds based on user's natural flexibility
6. WHEN calibration is complete, THE Calibration_System SHALL display "Pronto para treinar!" with visual confirmation
7. THE Calibration_System SHALL save calibration data for future sessions (optional recalibration)
8. IF calibration fails, THEN THE Calibration_System SHALL provide specific guidance to fix the issue
9. THE Calibration_System SHALL work in various environments (home, gym, outdoors)
10. THE Calibration_System SHALL complete within 5 seconds maximum including user guidance

### Requirement 6: Interface Visual do Treino

**User Story:** Como usuário, quero ver meu esqueleto sobreposto ao vídeo e um contador claro, para que eu tenha feedback visual imediato do meu treino.

#### Acceptance Criteria

1. WHEN camera is active, THE Skeleton_Renderer SHALL overlay detected keypoints and connections on the video feed
2. THE Skeleton_Renderer SHALL use color coding: green for good form, yellow for minor issues, red for significant issues
3. THE UI SHALL display a large, clear rep counter visible during exercise
4. THE UI SHALL show current exercise name and target reps/sets
5. THE UI SHALL display real-time feedback tips in a non-intrusive area
6. WHEN a rep is completed, THE UI SHALL animate the counter with satisfying visual feedback
7. THE UI SHALL show a progress bar for the current set
8. THE UI SHALL provide pause/resume and end workout buttons easily accessible
9. THE UI SHALL adapt layout for both portrait and landscape orientations
10. THE UI SHALL maintain minimal, clean design to avoid distraction during exercise
11. WHEN workout is complete, THE UI SHALL show summary with stats and achievements

### Requirement 7: Gamificação e Missões

**User Story:** Como usuário, quero ganhar pontos e completar missões ao treinar com câmera, para que eu me sinta motivado a continuar.

#### Acceptance Criteria

1. WHEN a rep is completed with good form, THE Gamification_Module SHALL award bonus points
2. THE Gamification_Module SHALL create daily camera workout missions (e.g., "Complete 50 agachamentos hoje")
3. WHEN user maintains streak of camera workouts, THE Gamification_Module SHALL award streak bonuses
4. THE Gamification_Module SHALL track and celebrate personal records (most reps, best form score)
5. WHEN user completes a camera workout, THE Gamification_Module SHALL save session to Supabase
6. THE Gamification_Module SHALL integrate with existing challenge system for camera-specific challenges
7. WHEN user achieves milestones (100 reps, 1000 reps), THE Gamification_Module SHALL unlock achievements
8. THE Gamification_Module SHALL provide weekly summaries of camera workout progress
9. THE Gamification_Module SHALL enable social sharing of workout achievements
10. THE Gamification_Module SHALL award XP that contributes to user's overall fitness level

### Requirement 8: Persistência e Sincronização

**User Story:** Como usuário, quero que meus treinos com câmera sejam salvos e sincronizados, para que eu possa acompanhar meu progresso ao longo do tempo.

#### Acceptance Criteria

1. WHEN a camera workout session ends, THE System SHALL save session data to Supabase
2. THE System SHALL store: exercise type, total reps, form score, duration, timestamps
3. THE System SHALL store individual rep data: timestamp, angles, form quality
4. THE System SHALL store posture events: warnings given, improvements made
5. WHEN offline, THE System SHALL queue data locally and sync when connection is restored
6. THE System SHALL integrate with existing workout_sessions table structure
7. THE System SHALL provide API for retrieving historical camera workout data
8. THE System SHALL calculate and store aggregate statistics (weekly reps, form improvement)
9. THE System SHALL support data export for healthcare providers
10. THE System SHALL maintain data privacy and security standards

### Requirement 9: Server Inference API (Fallback)

**User Story:** Como usuário com dispositivo mais antigo, quero poder usar o treino com câmera via servidor, para que eu não seja excluído da funcionalidade.

#### Acceptance Criteria

1. WHEN on-device inference is not viable, THE Server_Inference SHALL provide pose estimation via API
2. THE Server_Inference SHALL expose endpoint POST /pose/analyze accepting frame data
3. THE Server_Inference SHALL return keypoints, rep count, form hints, confidence, and warnings
4. THE Server_Inference SHALL process frames within 200ms latency for acceptable user experience
5. THE Server_Inference SHALL handle concurrent users with proper rate limiting
6. THE Server_Inference SHALL integrate with existing YOLO service on VPS (45.67.221.216:8002)
7. THE Server_Inference SHALL support both base64 and binary frame formats
8. THE Server_Inference SHALL maintain session state for continuous rep counting
9. IF server is unavailable, THEN THE System SHALL gracefully degrade to manual counting mode
10. THE Server_Inference SHALL log metrics: FPS, latency, error rate, confidence scores

### Requirement 10: Observabilidade e Qualidade

**User Story:** Como desenvolvedor, quero monitorar a qualidade do sistema de pose estimation, para que eu possa identificar e corrigir problemas rapidamente.

#### Acceptance Criteria

1. THE System SHALL log FPS, inference latency, and confidence scores for each session
2. THE System SHALL detect and alert on poor lighting conditions
3. THE System SHALL detect and alert on camera obstruction or movement
4. THE System SHALL track rep counting accuracy through user feedback
5. THE System SHALL monitor and report device temperature and battery impact
6. THE System SHALL provide debug mode with detailed keypoint visualization
7. THE System SHALL collect anonymized usage metrics for improvement
8. THE System SHALL alert when error rate exceeds 5% of sessions
9. THE System SHALL track model performance across different device types
10. THE System SHALL provide A/B testing capability for algorithm improvements

### Requirement 11: Expansão para Outros Exercícios

**User Story:** Como usuário, quero que o sistema suporte múltiplos exercícios além do agachamento, para que eu possa ter treinos completos com câmera.

#### Acceptance Criteria

1. THE Exercise_Detector SHALL support detection of: agachamento, flexão, abdominal, prancha, lunges
2. WHEN user selects an exercise, THE System SHALL load appropriate keypoint analysis rules
3. THE System SHALL provide exercise-specific calibration when needed
4. THE System SHALL maintain consistent UI/UX across all supported exercises
5. THE System SHALL allow adding new exercises through configuration (not code changes)
6. WHEN exercise is detected automatically, THE System SHALL confirm with user before counting
7. THE System SHALL provide exercise tutorials with pose overlay demonstrations
8. THE System SHALL track progress separately for each exercise type
9. THE System SHALL suggest exercise variations based on user's performance
10. THE System SHALL integrate with existing exercise database (257 exercises) for metadata

### Requirement 12: Acessibilidade e Inclusão

**User Story:** Como usuário com diferentes capacidades físicas, quero que o sistema seja adaptável às minhas limitações, para que eu possa treinar de forma segura e eficaz.

#### Acceptance Criteria

1. THE System SHALL support seated exercise variations for users with mobility limitations
2. THE System SHALL provide audio feedback for users who cannot see the screen during exercise
3. THE System SHALL allow customization of sensitivity and tolerance levels
4. THE System SHALL support one-sided exercises for users with asymmetric abilities
5. THE System SHALL provide high contrast mode for better visibility
6. THE System SHALL support voice commands for hands-free operation
7. WHEN user reports physical limitations, THE System SHALL adapt exercises accordingly
8. THE System SHALL never assume user's physical capabilities
9. THE System SHALL provide alternative exercises when standard form is not achievable
10. THE System SHALL celebrate all progress, regardless of starting point
