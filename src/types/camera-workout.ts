/**
 * 🎥 Camera Workout Types - Pose Estimation System
 * MaxNutrition - Janeiro 2026
 */

// =====================================================
// KEYPOINTS & POSE
// =====================================================

/** COCO 17 Keypoint IDs */
export type KeypointId =
  | 'nose' | 'left_eye' | 'right_eye' | 'left_ear' | 'right_ear'
  | 'left_shoulder' | 'right_shoulder' | 'left_elbow' | 'right_elbow'
  | 'left_wrist' | 'right_wrist' | 'left_hip' | 'right_hip'
  | 'left_knee' | 'right_knee' | 'left_ankle' | 'right_ankle';

/** Keypoint individual detectado */
export interface Keypoint {
  id: KeypointId;
  name: string;
  x: number; // normalized 0-1
  y: number; // normalized 0-1
  confidence: number; // 0-1
  worldX?: number; // 3D coordinates (MediaPipe)
  worldY?: number;
  worldZ?: number;
}

/** Resultado da detecção de pose */
export interface PoseResult {
  keypoints: Keypoint[];
  confidence: number;
  inferenceTime: number;
  boundingBox?: BoundingBox;
  isFullBody: boolean;
}

/** Bounding box da pessoa detectada */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// =====================================================
// EXERCISE CONFIGURATION
// =====================================================

/** Tipos de exercício suportados */
export type ExerciseType = 'squat' | 'pushup' | 'situp' | 'plank' | 'lunge' | 'jumping_jack';

/** Configuração de cálculo de ângulo */
export interface AngleCalculation {
  type: 'three-point' | 'two-point' | 'vertical';
  points: [KeypointId, KeypointId, KeypointId?];
  invert?: boolean;
}

/** Thresholds para detecção de exercício */
export interface ExerciseThresholds {
  repDownAngle: number; // Ângulo para considerar "desceu"
  repUpAngle: number; // Ângulo para considerar "subiu"
  safeZoneTolerance: number; // Tolerância em graus (±)
  minRepDuration: number; // ms - evita contagem rápida demais
  maxRepDuration: number; // ms - detecta rep muito lenta
  debounceTime: number; // ms - entre reps
}


/** Regra de análise de forma */
export interface FormRule {
  id: string;
  check: (keypoints: Keypoint[]) => boolean;
  issue: FormIssueType;
  severity: 'minor' | 'moderate' | 'significant';
}

/** Passo de tutorial */
export interface TutorialStep {
  text: string;
  duration: number; // ms
  image?: string;
}

/** Configuração completa de exercício */
export interface ExerciseConfig {
  type: ExerciseType;
  name: string;
  namePt: string;
  primaryKeypoints: KeypointId[];
  secondaryKeypoints: KeypointId[];
  angleCalculation: AngleCalculation;
  thresholds: ExerciseThresholds;
  formRules: FormRule[];
  calibrationPose: string;
  tutorialSteps: TutorialStep[];
}

// =====================================================
// REP COUNTING
// =====================================================

/** Fase atual do movimento */
export type MovementPhase = 'up' | 'down' | 'transition' | 'rest';

/** Ângulos calculados do exercício */
export interface ExerciseAngles {
  primary: number;
  secondary?: number;
  tertiary?: number;
  valley?: number; // Ângulo mínimo atingido
  peak?: number; // Ângulo máximo atingido
}

/** Resultado do contador de reps */
export interface RepCountResult {
  totalReps: number;
  currentPhase: MovementPhase;
  phaseProgress: number; // 0-100%
  isValidRep: boolean;
  partialReps: number;
  lastRepQuality: number; // 0-100
  angles: ExerciseAngles;
}

/** Estatísticas de reps */
export interface RepStats {
  totalReps: number;
  validReps: number;
  partialReps: number;
  averageQuality: number;
  bestRep: number;
  worstRep: number;
  duration: number;
}

/** Estado interno do contador de reps */
export interface RepCounterState {
  phase: MovementPhase;
  repCount: number;
  partialReps: number;
  lastRepTime: number;
  peakAngle: number;
  valleyAngle: number;
  phaseStartTime: number;
  currentAngle: number;
}

// =====================================================
// FORM ANALYSIS
// =====================================================

/** Tipos de problemas de forma */
export type FormIssueType =
  | 'knee_over_toes'
  | 'back_rounding'
  | 'depth_insufficient'
  | 'asymmetry'
  | 'speed_too_fast'
  | 'range_limited'
  | 'elbow_flare'
  | 'hip_drop'
  | 'neck_strain';

/** Nível de fitness do usuário */
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

/** Problema de forma detectado */
export interface FormIssue {
  type: FormIssueType;
  severity: 'minor' | 'moderate' | 'significant';
  message: string; // Sempre positivo/encorajador
  correction: string;
  affectedKeypoints: KeypointId[];
}

/** Resultado da análise de forma */
export interface FormAnalysis {
  overallScore: number; // 0-100
  issues: FormIssue[];
  improvements: string[];
  isInSafeZone: boolean;
}

/** Recomendação de forma */
export interface FormRecommendation {
  type: FormIssueType;
  message: string;
  priority: number;
}


// =====================================================
// CALIBRATION
// =====================================================

/** Dados de calibração do usuário */
export interface CalibrationData {
  standingHeight: number;
  shoulderWidth: number;
  hipWidth: number;
  naturalKneeAngle: number;
  naturalHipAngle: number;
  rangeOfMotion: {
    squat?: { min: number; max: number };
    pushup?: { min: number; max: number };
    situp?: { min: number; max: number };
  };
  thresholds: {
    repDownAngle: number;
    repUpAngle: number;
    safeZoneTolerance: number;
  };
  timestamp: Date;
}

/** Progresso da calibração */
export interface CalibrationProgress {
  step: 'positioning' | 'capturing' | 'analyzing' | 'complete';
  progress: number; // 0-100
  message: string;
  isValid: boolean;
}

/** Verificação de ambiente */
export interface EnvironmentCheck {
  lighting: 'good' | 'fair' | 'poor';
  distance: 'too_close' | 'optimal' | 'too_far';
  visibility: 'full_body' | 'partial' | 'obstructed';
  stability: 'stable' | 'shaky';
  recommendations: string[];
}

// =====================================================
// CAMERA & SESSION
// =====================================================

/** Configuração da câmera */
export interface CameraConfig {
  resolution: 'low' | 'medium' | 'high'; // 320p, 480p, 720p
  targetFPS: number; // 15-30
  facingMode: 'user' | 'environment';
  autoOptimize: boolean;
}

/** Estatísticas da câmera */
export interface CameraStats {
  currentFPS: number;
  resolution: { width: number; height: number };
  batteryImpact: 'low' | 'medium' | 'high';
  temperature: number;
}

/** Estado da câmera */
export interface CameraState {
  isInitialized: boolean;
  isCapturing: boolean;
  hasPermission: boolean;
  error?: string;
  stats: CameraStats;
}

/** Modo de inferência */
export type InferenceMode = 'yolo-pose' | 'mediapipe' | 'server';

/** Informações do dispositivo */
export interface DeviceInfo {
  platform: string;
  model: string;
  osVersion: string;
  screenSize: { width: number; height: number };
  hasGPU: boolean;
  memoryGB: number;
}

// =====================================================
// WORKOUT SESSION
// =====================================================

/** Sessão de treino com câmera */
export interface CameraWorkoutSession {
  id: string;
  userId: string;
  exerciseType: ExerciseType;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds: number;
  totalReps: number;
  validReps: number;
  partialReps: number;
  averageFormScore: number;
  bestRepScore: number;
  inferenceMode: InferenceMode;
  deviceInfo: DeviceInfo;
  calibrationData: CalibrationData;
  pointsEarned: number;
  xpEarned: number;
}

/** Evento de repetição */
export interface CameraRepEvent {
  id: string;
  sessionId: string;
  repNumber: number;
  timestamp: Date;
  durationMs: number;
  formScore: number;
  angles: ExerciseAngles;
  phaseDurations: { down: number; up: number };
  isValid: boolean;
  issues: FormIssueType[];
  keypointsSnapshot?: Keypoint[];
}

/** Evento de postura */
export interface CameraPostureEvent {
  id: string;
  sessionId: string;
  timestamp: Date;
  issueType: FormIssueType;
  severity: 'minor' | 'moderate' | 'significant';
  messageShown: string;
  userImproved: boolean;
  keypointsAtIssue?: Keypoint[];
}

/** Métricas de sessão */
export interface SessionMetrics {
  avgFps: number;
  minFps: number;
  avgInferenceLatency: number;
  p95InferenceLatency: number;
  avgConfidence: number;
  lowConfidenceFrames: number;
  interpolatedFrames: number;
  totalReps: number;
  userReportedReps?: number;
  formIssuesDetected: number;
  feedbacksShown: number;
  lightingQuality: 'good' | 'fair' | 'poor';
  deviceTemperature: number;
  batteryDrain: number;
  cameraErrors: number;
  poseErrors: number;
  networkErrors: number;
}


// =====================================================
// SERVER API
// =====================================================

/** Request para análise de pose no servidor */
export interface PoseAnalyzeRequest {
  image_base64?: string;
  image_url?: string;
  session_id: string;
  exercise: ExerciseType;
  calibration?: CalibrationData;
}

/** Response da análise de pose do servidor */
export interface PoseAnalyzeResponse {
  success: boolean;
  keypoints: Keypoint[];
  rep_count: number;
  partial_reps: number;
  current_phase: MovementPhase;
  phase_progress: number;
  form_hints: FormHint[];
  confidence: number;
  warnings: string[];
  inference_time_ms: number;
  angles: ExerciseAngles;
  is_valid_rep: boolean;
  is_full_body: boolean;
}

/** Dica de forma do servidor */
export interface FormHint {
  type: FormIssueType;
  message: string;
  priority: number;
}

// =====================================================
// GAMIFICATION
// =====================================================

/** Pontuação de treino com câmera */
export interface CameraWorkoutScore {
  basePoints: number;
  formBonus: number;
  streakBonus: number;
  totalPoints: number;
  xpEarned: number;
  achievements: string[];
}

/** Estatísticas do usuário em treinos com câmera */
export interface CameraWorkoutStats {
  totalSessions: number;
  totalReps: number;
  totalValidReps: number;
  avgFormScore: number;
  totalDurationMinutes: number;
  favoriteExercise: ExerciseType | null;
  currentStreak: number;
  bestSessionReps: number;
}

// =====================================================
// UI STATE
// =====================================================

/** Estado da tela de treino com câmera */
export type WorkoutScreenState = 
  | 'initializing'
  | 'calibrating'
  | 'ready'
  | 'counting'
  | 'paused'
  | 'resting'
  | 'completed'
  | 'error';

/** Cor do esqueleto baseada na qualidade da forma */
export type SkeletonColor = 'green' | 'yellow' | 'red';

/** Props do overlay de esqueleto */
export interface SkeletonOverlayProps {
  keypoints: Keypoint[];
  formScore: number;
  showLabels?: boolean;
  animate?: boolean;
}

/** Props do contador de reps */
export interface RepCounterDisplayProps {
  currentReps: number;
  targetReps?: number;
  isValidRep: boolean;
  partialReps: number;
  formScore: number;
}

/** Props do toast de feedback */
export interface FormFeedbackToastProps {
  message: string;
  type: 'tip' | 'warning' | 'celebration';
  duration?: number;
  onDismiss?: () => void;
}

// =====================================================
// CONSTANTS
// =====================================================

/** Conexões do esqueleto COCO */
export const SKELETON_CONNECTIONS: [KeypointId, KeypointId][] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'left_ear'],
  ['right_eye', 'right_ear'],
];

/** Nomes dos keypoints em português */
export const KEYPOINT_NAMES_PT: Record<KeypointId, string> = {
  nose: 'Nariz',
  left_eye: 'Olho Esquerdo',
  right_eye: 'Olho Direito',
  left_ear: 'Orelha Esquerda',
  right_ear: 'Orelha Direita',
  left_shoulder: 'Ombro Esquerdo',
  right_shoulder: 'Ombro Direito',
  left_elbow: 'Cotovelo Esquerdo',
  right_elbow: 'Cotovelo Direito',
  left_wrist: 'Pulso Esquerdo',
  right_wrist: 'Pulso Direito',
  left_hip: 'Quadril Esquerdo',
  right_hip: 'Quadril Direito',
  left_knee: 'Joelho Esquerdo',
  right_knee: 'Joelho Direito',
  left_ankle: 'Tornozelo Esquerdo',
  right_ankle: 'Tornozelo Direito',
};

/** Nomes dos exercícios em português */
export const EXERCISE_NAMES_PT: Record<ExerciseType, string> = {
  squat: 'Agachamento',
  pushup: 'Flexão',
  situp: 'Abdominal',
  plank: 'Prancha',
  lunge: 'Avanço',
  jumping_jack: 'Polichinelo',
};
