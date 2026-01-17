/**
 * Exercise Configurations for Camera Workout
 * 
 * Defines keypoints, angles, thresholds, and form rules for each exercise type.
 */

export interface KeypointConfig {
  name: string;
  index: number; // COCO keypoint index
  required: boolean;
}

export interface AngleConfig {
  name: string;
  points: [number, number, number]; // Three keypoint indices for angle calculation
  downThreshold: number; // Angle threshold for "down" position
  upThreshold: number; // Angle threshold for "up" position
}

export interface FormRule {
  name: string;
  description: string;
  checkFunction: string; // Name of the check function to use
  params: Record<string, any>;
  severity: 'warning' | 'error';
}

export interface ExerciseConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  keypoints: KeypointConfig[];
  primaryAngle: AngleConfig;
  secondaryAngles?: AngleConfig[];
  formRules: FormRule[];
  repType: 'count' | 'time'; // Count reps or measure time (for plank)
  calibrationInstructions: string[];
  exerciseInstructions: string[];
}

/**
 * COCO Keypoint Indices
 */
export const COCO_KEYPOINTS = {
  NOSE: 0,
  LEFT_EYE: 1,
  RIGHT_EYE: 2,
  LEFT_EAR: 3,
  RIGHT_EAR: 4,
  LEFT_SHOULDER: 5,
  RIGHT_SHOULDER: 6,
  LEFT_ELBOW: 7,
  RIGHT_ELBOW: 8,
  LEFT_WRIST: 9,
  RIGHT_WRIST: 10,
  LEFT_HIP: 11,
  RIGHT_HIP: 12,
  LEFT_KNEE: 13,
  RIGHT_KNEE: 14,
  LEFT_ANKLE: 15,
  RIGHT_ANKLE: 16,
};

/**
 * Squat Exercise Configuration
 */
export const SQUAT_CONFIG: ExerciseConfig = {
  id: 'squat',
  name: 'squat',
  displayName: 'Agachamento',
  description: 'Agachamento livre com análise de profundidade e postura',
  keypoints: [
    { name: 'left_shoulder', index: COCO_KEYPOINTS.LEFT_SHOULDER, required: true },
    { name: 'right_shoulder', index: COCO_KEYPOINTS.RIGHT_SHOULDER, required: true },
    { name: 'left_hip', index: COCO_KEYPOINTS.LEFT_HIP, required: true },
    { name: 'right_hip', index: COCO_KEYPOINTS.RIGHT_HIP, required: true },
    { name: 'left_knee', index: COCO_KEYPOINTS.LEFT_KNEE, required: true },
    { name: 'right_knee', index: COCO_KEYPOINTS.RIGHT_KNEE, required: true },
    { name: 'left_ankle', index: COCO_KEYPOINTS.LEFT_ANKLE, required: true },
    { name: 'right_ankle', index: COCO_KEYPOINTS.RIGHT_ANKLE, required: true },
  ],
  primaryAngle: {
    name: 'knee_angle',
    points: [COCO_KEYPOINTS.LEFT_HIP, COCO_KEYPOINTS.LEFT_KNEE, COCO_KEYPOINTS.LEFT_ANKLE],
    downThreshold: 100, // Knee angle < 100° = down position
    upThreshold: 160, // Knee angle > 160° = up position
  },
  secondaryAngles: [
    {
      name: 'hip_angle',
      points: [COCO_KEYPOINTS.LEFT_SHOULDER, COCO_KEYPOINTS.LEFT_HIP, COCO_KEYPOINTS.LEFT_KNEE],
      downThreshold: 90,
      upThreshold: 170,
    },
  ],
  formRules: [
    {
      name: 'knee_alignment',
      description: 'Joelhos alinhados com os pés',
      checkFunction: 'checkKneeAlignment',
      params: { maxDeviation: 15 },
      severity: 'warning',
    },
    {
      name: 'back_straight',
      description: 'Costas retas durante o movimento',
      checkFunction: 'checkBackAlignment',
      params: { maxAngleDeviation: 20 },
      severity: 'warning',
    },
    {
      name: 'depth',
      description: 'Profundidade adequada (quadril abaixo do joelho)',
      checkFunction: 'checkSquatDepth',
      params: { minDepth: 90 },
      severity: 'warning',
    },
  ],
  repType: 'count',
  calibrationInstructions: [
    'Fique em pé de frente para a câmera',
    'Posicione-se a cerca de 2 metros da câmera',
    'Certifique-se de que todo o seu corpo está visível',
    'Mantenha os pés afastados na largura dos ombros',
  ],
  exerciseInstructions: [
    'Mantenha os pés afastados na largura dos ombros',
    'Desça lentamente dobrando os joelhos',
    'Mantenha as costas retas',
    'Desça até os quadris ficarem abaixo dos joelhos',
    'Suba de volta à posição inicial',
  ],
};

/**
 * Pushup Exercise Configuration
 */
export const PUSHUP_CONFIG: ExerciseConfig = {
  id: 'pushup',
  name: 'pushup',
  displayName: 'Flexão',
  description: 'Flexão de braço com análise de amplitude e alinhamento corporal',
  keypoints: [
    { name: 'nose', index: COCO_KEYPOINTS.NOSE, required: true },
    { name: 'left_shoulder', index: COCO_KEYPOINTS.LEFT_SHOULDER, required: true },
    { name: 'right_shoulder', index: COCO_KEYPOINTS.RIGHT_SHOULDER, required: true },
    { name: 'left_elbow', index: COCO_KEYPOINTS.LEFT_ELBOW, required: true },
    { name: 'right_elbow', index: COCO_KEYPOINTS.RIGHT_ELBOW, required: true },
    { name: 'left_wrist', index: COCO_KEYPOINTS.LEFT_WRIST, required: true },
    { name: 'right_wrist', index: COCO_KEYPOINTS.RIGHT_WRIST, required: true },
    { name: 'left_hip', index: COCO_KEYPOINTS.LEFT_HIP, required: true },
    { name: 'right_hip', index: COCO_KEYPOINTS.RIGHT_HIP, required: true },
    { name: 'left_ankle', index: COCO_KEYPOINTS.LEFT_ANKLE, required: true },
    { name: 'right_ankle', index: COCO_KEYPOINTS.RIGHT_ANKLE, required: true },
  ],
  primaryAngle: {
    name: 'elbow_angle',
    points: [COCO_KEYPOINTS.LEFT_SHOULDER, COCO_KEYPOINTS.LEFT_ELBOW, COCO_KEYPOINTS.LEFT_WRIST],
    downThreshold: 90, // Elbow angle < 90° = down position
    upThreshold: 160, // Elbow angle > 160° = up position
  },
  secondaryAngles: [
    {
      name: 'body_alignment',
      points: [COCO_KEYPOINTS.LEFT_SHOULDER, COCO_KEYPOINTS.LEFT_HIP, COCO_KEYPOINTS.LEFT_ANKLE],
      downThreshold: 160,
      upThreshold: 180,
    },
  ],
  formRules: [
    {
      name: 'body_straight',
      description: 'Corpo alinhado (ombros, quadril e tornozelos)',
      checkFunction: 'checkBodyAlignment',
      params: { maxDeviation: 15 },
      severity: 'warning',
    },
    {
      name: 'elbow_position',
      description: 'Cotovelos próximos ao corpo (não muito abertos)',
      checkFunction: 'checkElbowPosition',
      params: { maxAngle: 45 },
      severity: 'warning',
    },
    {
      name: 'full_range',
      description: 'Amplitude completa (peito próximo ao chão)',
      checkFunction: 'checkPushupDepth',
      params: { minAngle: 90 },
      severity: 'warning',
    },
  ],
  repType: 'count',
  calibrationInstructions: [
    'Posicione-se de lado para a câmera',
    'Fique na posição de prancha (mãos e pés no chão)',
    'Certifique-se de que todo o seu corpo está visível',
    'Mantenha o corpo alinhado',
  ],
  exerciseInstructions: [
    'Comece na posição de prancha',
    'Mantenha o corpo reto (ombros, quadril e tornozelos alinhados)',
    'Desça lentamente dobrando os cotovelos',
    'Desça até o peito quase tocar o chão',
    'Empurre de volta à posição inicial',
  ],
};

/**
 * Situp Exercise Configuration
 */
export const SITUP_CONFIG: ExerciseConfig = {
  id: 'situp',
  name: 'situp',
  displayName: 'Abdominal',
  description: 'Abdominal tradicional com análise de amplitude e controle',
  keypoints: [
    { name: 'nose', index: COCO_KEYPOINTS.NOSE, required: true },
    { name: 'left_shoulder', index: COCO_KEYPOINTS.LEFT_SHOULDER, required: true },
    { name: 'right_shoulder', index: COCO_KEYPOINTS.RIGHT_SHOULDER, required: true },
    { name: 'left_hip', index: COCO_KEYPOINTS.LEFT_HIP, required: true },
    { name: 'right_hip', index: COCO_KEYPOINTS.RIGHT_HIP, required: true },
    { name: 'left_knee', index: COCO_KEYPOINTS.LEFT_KNEE, required: true },
    { name: 'right_knee', index: COCO_KEYPOINTS.RIGHT_KNEE, required: true },
  ],
  primaryAngle: {
    name: 'trunk_angle',
    points: [COCO_KEYPOINTS.LEFT_SHOULDER, COCO_KEYPOINTS.LEFT_HIP, COCO_KEYPOINTS.LEFT_KNEE],
    downThreshold: 30, // Trunk angle < 30° = down position (lying)
    upThreshold: 70, // Trunk angle > 70° = up position (sitting)
  },
  formRules: [
    {
      name: 'controlled_movement',
      description: 'Movimento controlado (não usar impulso)',
      checkFunction: 'checkMovementSpeed',
      params: { maxSpeed: 100 },
      severity: 'warning',
    },
    {
      name: 'full_range',
      description: 'Amplitude completa (ombros tocam o chão)',
      checkFunction: 'checkSitupRange',
      params: { minAngle: 30 },
      severity: 'warning',
    },
  ],
  repType: 'count',
  calibrationInstructions: [
    'Deite-se de lado para a câmera',
    'Dobre os joelhos a 90 graus',
    'Certifique-se de que todo o seu corpo está visível',
    'Mantenha os pés no chão',
  ],
  exerciseInstructions: [
    'Deite-se com os joelhos dobrados',
    'Coloque as mãos atrás da cabeça ou cruzadas no peito',
    'Levante o tronco em direção aos joelhos',
    'Contraia o abdômen durante o movimento',
    'Desça de volta controladamente',
  ],
};

/**
 * Plank Exercise Configuration
 */
export const PLANK_CONFIG: ExerciseConfig = {
  id: 'plank',
  name: 'plank',
  displayName: 'Prancha',
  description: 'Prancha isométrica com análise de alinhamento corporal',
  keypoints: [
    { name: 'nose', index: COCO_KEYPOINTS.NOSE, required: true },
    { name: 'left_shoulder', index: COCO_KEYPOINTS.LEFT_SHOULDER, required: true },
    { name: 'right_shoulder', index: COCO_KEYPOINTS.RIGHT_SHOULDER, required: true },
    { name: 'left_elbow', index: COCO_KEYPOINTS.LEFT_ELBOW, required: true },
    { name: 'right_elbow', index: COCO_KEYPOINTS.RIGHT_ELBOW, required: true },
    { name: 'left_hip', index: COCO_KEYPOINTS.LEFT_HIP, required: true },
    { name: 'right_hip', index: COCO_KEYPOINTS.RIGHT_HIP, required: true },
    { name: 'left_ankle', index: COCO_KEYPOINTS.LEFT_ANKLE, required: true },
    { name: 'right_ankle', index: COCO_KEYPOINTS.RIGHT_ANKLE, required: true },
  ],
  primaryAngle: {
    name: 'body_alignment',
    points: [COCO_KEYPOINTS.LEFT_SHOULDER, COCO_KEYPOINTS.LEFT_HIP, COCO_KEYPOINTS.LEFT_ANKLE],
    downThreshold: 160, // Body should be straight (160-180°)
    upThreshold: 180,
  },
  formRules: [
    {
      name: 'straight_body',
      description: 'Corpo alinhado (não deixe o quadril cair)',
      checkFunction: 'checkPlankAlignment',
      params: { minAngle: 160, maxAngle: 180 },
      severity: 'error',
    },
    {
      name: 'head_neutral',
      description: 'Cabeça neutra (olhando para o chão)',
      checkFunction: 'checkHeadPosition',
      params: { maxDeviation: 20 },
      severity: 'warning',
    },
  ],
  repType: 'time', // Plank is timed, not counted
  calibrationInstructions: [
    'Posicione-se de lado para a câmera',
    'Fique na posição de prancha (antebraços e pés no chão)',
    'Certifique-se de que todo o seu corpo está visível',
    'Mantenha o corpo alinhado',
  ],
  exerciseInstructions: [
    'Apoie-se nos antebraços e pés',
    'Mantenha o corpo reto (ombros, quadril e tornozelos alinhados)',
    'Não deixe o quadril cair ou subir demais',
    'Mantenha a cabeça neutra (olhando para o chão)',
    'Respire normalmente e mantenha a posição',
  ],
};

/**
 * All available exercise configurations
 */
export const EXERCISE_CONFIGS: Record<string, ExerciseConfig> = {
  squat: SQUAT_CONFIG,
  pushup: PUSHUP_CONFIG,
  situp: SITUP_CONFIG,
  plank: PLANK_CONFIG,
};

/**
 * Get exercise configuration by ID
 */
export function getExerciseConfig(exerciseId: string): ExerciseConfig | null {
  return EXERCISE_CONFIGS[exerciseId] || null;
}

/**
 * Get all available exercises
 */
export function getAllExercises(): ExerciseConfig[] {
  return Object.values(EXERCISE_CONFIGS);
}
