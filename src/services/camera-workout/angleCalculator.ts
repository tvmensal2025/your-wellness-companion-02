/**
 * 📐 Angle Calculator - Camera Workout System
 * Cálculo de ângulos entre keypoints para detecção de exercícios
 */

import type { Keypoint, KeypointId, ExerciseAngles } from '@/types/camera-workout';

/**
 * Calcula o ângulo entre 3 pontos (p2 é o vértice)
 * Retorna ângulo em graus (0-180)
 */
export function calculateAngle(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number }
): number {
  // Vetores do vértice para os outros pontos
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

  // Produto escalar
  const dot = v1.x * v2.x + v1.y * v2.y;

  // Magnitudes
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  // Evitar divisão por zero
  if (mag1 * mag2 === 0) {
    return 180;
  }

  // Cosseno do ângulo (clamped para evitar erros de arredondamento)
  const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));

  // Converter para graus
  const angleRad = Math.acos(cosAngle);
  const angleDeg = angleRad * (180 / Math.PI);

  return angleDeg;
}

/**
 * Encontra um keypoint pelo ID
 */
export function findKeypoint(
  keypoints: Keypoint[],
  id: KeypointId
): Keypoint | undefined {
  return keypoints.find((kp) => kp.id === id);
}

/**
 * Verifica se keypoints têm confiança suficiente
 */
export function hasValidConfidence(
  keypoints: (Keypoint | undefined)[],
  threshold = 0.4
): boolean {
  return keypoints.every((kp) => kp && kp.confidence >= threshold);
}

/**
 * Calcula ângulo do joelho para agachamento
 * Usa: quadril -> joelho -> tornozelo
 */
export function calculateKneeAngle(
  keypoints: Keypoint[],
  side: 'left' | 'right' = 'left'
): number | null {
  const hip = findKeypoint(keypoints, `${side}_hip` as KeypointId);
  const knee = findKeypoint(keypoints, `${side}_knee` as KeypointId);
  const ankle = findKeypoint(keypoints, `${side}_ankle` as KeypointId);

  if (!hasValidConfidence([hip, knee, ankle])) {
    return null;
  }

  return calculateAngle(
    { x: hip!.x, y: hip!.y },
    { x: knee!.x, y: knee!.y },
    { x: ankle!.x, y: ankle!.y }
  );
}

/**
 * Calcula ângulo do cotovelo para flexão
 * Usa: ombro -> cotovelo -> pulso
 */
export function calculateElbowAngle(
  keypoints: Keypoint[],
  side: 'left' | 'right' = 'left'
): number | null {
  const shoulder = findKeypoint(keypoints, `${side}_shoulder` as KeypointId);
  const elbow = findKeypoint(keypoints, `${side}_elbow` as KeypointId);
  const wrist = findKeypoint(keypoints, `${side}_wrist` as KeypointId);

  if (!hasValidConfidence([shoulder, elbow, wrist])) {
    return null;
  }

  return calculateAngle(
    { x: shoulder!.x, y: shoulder!.y },
    { x: elbow!.x, y: elbow!.y },
    { x: wrist!.x, y: wrist!.y }
  );
}

/**
 * Calcula ângulo do quadril para abdominal
 * Usa: ombro -> quadril -> joelho
 */
export function calculateHipAngle(
  keypoints: Keypoint[],
  side: 'left' | 'right' = 'left'
): number | null {
  const shoulder = findKeypoint(keypoints, `${side}_shoulder` as KeypointId);
  const hip = findKeypoint(keypoints, `${side}_hip` as KeypointId);
  const knee = findKeypoint(keypoints, `${side}_knee` as KeypointId);

  if (!hasValidConfidence([shoulder, hip, knee])) {
    return null;
  }

  return calculateAngle(
    { x: shoulder!.x, y: shoulder!.y },
    { x: hip!.x, y: hip!.y },
    { x: knee!.x, y: knee!.y }
  );
}

/**
 * Calcula todos os ângulos relevantes para um exercício
 */
export function calculateExerciseAngles(
  keypoints: Keypoint[],
  exerciseType: 'squat' | 'pushup' | 'situp' | 'plank'
): ExerciseAngles {
  const angles: ExerciseAngles = { primary: 180 };

  switch (exerciseType) {
    case 'squat': {
      const leftKnee = calculateKneeAngle(keypoints, 'left');
      const rightKnee = calculateKneeAngle(keypoints, 'right');
      
      // Usar média dos dois lados se ambos disponíveis
      if (leftKnee !== null && rightKnee !== null) {
        angles.primary = (leftKnee + rightKnee) / 2;
        angles.secondary = calculateHipAngle(keypoints, 'left') ?? undefined;
      } else {
        angles.primary = leftKnee ?? rightKnee ?? 180;
      }
      break;
    }

    case 'pushup': {
      const leftElbow = calculateElbowAngle(keypoints, 'left');
      const rightElbow = calculateElbowAngle(keypoints, 'right');
      
      if (leftElbow !== null && rightElbow !== null) {
        angles.primary = (leftElbow + rightElbow) / 2;
      } else {
        angles.primary = leftElbow ?? rightElbow ?? 180;
      }
      break;
    }

    case 'situp': {
      const leftHip = calculateHipAngle(keypoints, 'left');
      const rightHip = calculateHipAngle(keypoints, 'right');
      
      if (leftHip !== null && rightHip !== null) {
        angles.primary = (leftHip + rightHip) / 2;
      } else {
        angles.primary = leftHip ?? rightHip ?? 180;
      }
      break;
    }

    case 'plank': {
      // Para prancha, verificamos alinhamento (ombro-quadril-tornozelo)
      const shoulder = findKeypoint(keypoints, 'left_shoulder');
      const hip = findKeypoint(keypoints, 'left_hip');
      const ankle = findKeypoint(keypoints, 'left_ankle');
      
      if (hasValidConfidence([shoulder, hip, ankle])) {
        angles.primary = calculateAngle(
          { x: shoulder!.x, y: shoulder!.y },
          { x: hip!.x, y: hip!.y },
          { x: ankle!.x, y: ankle!.y }
        );
      }
      break;
    }
  }

  return angles;
}

/**
 * Verifica se o ângulo está dentro da zona segura
 */
export function isInSafeZone(
  angle: number,
  targetAngle: number,
  tolerance: number
): boolean {
  return Math.abs(angle - targetAngle) <= tolerance;
}

/**
 * Calcula a diferença percentual entre dois ângulos
 */
export function angleDifferencePercent(
  angle1: number,
  angle2: number,
  maxDiff = 90
): number {
  const diff = Math.abs(angle1 - angle2);
  return Math.min(100, (diff / maxDiff) * 100);
}
