/**
 * 💪 Form Analyzer - Camera Workout System
 * Análise de postura com feedback gentil e encorajador
 * Validates: Requirements 4.1, 4.2, 4.5
 */

import type {
  Keypoint,
  KeypointId,
  ExerciseType,
  FormAnalysis,
  FormIssue,
  FormIssueType,
  FitnessLevel,
  FormRecommendation,
} from '@/types/camera-workout';
import { findKeypoint, hasValidConfidence, calculateAngle } from './angleCalculator';

// Mensagens SEMPRE positivas e encorajadoras (nunca críticas)
const POSITIVE_MESSAGES: Record<FormIssueType, Record<'minor' | 'moderate' | 'significant', string>> = {
  knee_over_toes: {
    minor: 'Ótimo ritmo! Tente manter os joelhos um pouquinho mais atrás 👍',
    moderate: 'Você está indo bem! Foque em empurrar o quadril para trás 💪',
    significant: 'Vamos ajustar: sente-se para trás como se fosse sentar numa cadeira 🪑',
  },
  back_rounding: {
    minor: 'Quase perfeito! Mantenha o peito erguido ✨',
    moderate: 'Bom trabalho! Olhe para frente para ajudar a postura 👀',
    significant: 'Você consegue! Imagine um fio puxando seu peito para cima 🎯',
  },
  depth_insufficient: {
    minor: 'Excelente! Tente descer só mais um pouquinho quando se sentir confortável 🌟',
    moderate: 'Muito bom! Vá até onde for confortável, cada vez mais fundo 📈',
    significant: 'Continue assim! A flexibilidade vem com a prática 🚀',
  },
  asymmetry: {
    minor: 'Boa forma! Tente distribuir o peso igualmente nos dois lados ⚖️',
    moderate: 'Você está progredindo! Foque em manter os dois lados simétricos 🎯',
    significant: 'Vamos equilibrar: preste atenção nos dois lados do corpo 💫',
  },
  speed_too_fast: {
    minor: 'Energia boa! Tente um ritmo um pouco mais controlado ⏱️',
    moderate: 'Ótimo entusiasmo! Movimentos mais lentos = mais resultados 🏆',
    significant: 'Calma, campeão! Qualidade > quantidade. Vá devagar 🐢',
  },
  range_limited: {
    minor: 'Bom começo! Com o tempo você vai aumentar a amplitude 📈',
    moderate: 'Progresso é progresso! Continue praticando 💪',
    significant: 'Cada dia um pouco melhor! Respeite seus limites 🌱',
  },
  elbow_flare: {
    minor: 'Quase lá! Cotovelos um pouco mais junto ao corpo 💪',
    moderate: 'Boa força! Tente manter os cotovelos a 45 graus 📐',
    significant: 'Vamos ajustar: cotovelos apontando para trás, não para os lados ➡️',
  },
  hip_drop: {
    minor: 'Ótima prancha! Mantenha o quadril alinhado ✨',
    moderate: 'Força no core! Levante o quadril um pouquinho 🎯',
    significant: 'Você consegue! Imagine uma linha reta da cabeça aos pés 📏',
  },
  neck_strain: {
    minor: 'Boa postura! Mantenha o pescoço neutro 👍',
    moderate: 'Relaxe o pescoço! Olhe para um ponto fixo no chão 👀',
    significant: 'Cuidado com o pescoço! Mantenha alinhado com a coluna 🦒',
  },
};

// Correções sugeridas
const CORRECTIONS: Record<FormIssueType, string> = {
  knee_over_toes: 'Empurre o quadril para trás antes de dobrar os joelhos',
  back_rounding: 'Mantenha o peito erguido e olhe para frente',
  depth_insufficient: 'Desça até as coxas ficarem paralelas ao chão',
  asymmetry: 'Distribua o peso igualmente entre os dois pés',
  speed_too_fast: 'Conte 2 segundos descendo e 2 segundos subindo',
  range_limited: 'Faça alongamentos antes do treino',
  elbow_flare: 'Mantenha os cotovelos a 45 graus do corpo',
  hip_drop: 'Contraia o abdômen e glúteos',
  neck_strain: 'Mantenha o olhar para baixo, pescoço neutro',
};

interface FormAnalyzerConfig {
  feedbackCooldown: number; // ms entre feedbacks do mesmo tipo
  maxFeedbacksPerMinute: number;
  toleranceMultiplier: number; // Multiplicador de tolerância por nível
  userGender?: string | null; // Gênero do usuário para mensagens personalizadas
}

const DEFAULT_CONFIG: FormAnalyzerConfig = {
  feedbackCooldown: 5000, // 5 segundos
  maxFeedbacksPerMinute: 6,
  toleranceMultiplier: 1.0,
  userGender: null,
};

// Função para obter mensagem com gênero correto
const getGenderedMessage = (message: string, gender: string | null | undefined): string => {
  if (!gender) return message;
  const isFeminine = ['feminino', 'female', 'f'].includes(gender.toLowerCase());
  if (isFeminine) {
    return message
      .replace(/campeão/gi, 'campeã')
      .replace(/guerreiro/gi, 'guerreira')
      .replace(/mestre/gi, 'mestra');
  }
  return message;
};

const LEVEL_TOLERANCE: Record<FitnessLevel, number> = {
  beginner: 1.5, // 50% mais tolerante
  intermediate: 1.0,
  advanced: 0.8, // 20% mais exigente
};

/**
 * Analisador de forma com feedback gentil
 */
export class FormAnalyzer {
  private exerciseType: ExerciseType;
  private userLevel: FitnessLevel;
  private config: FormAnalyzerConfig;
  private lastFeedbackTime: Map<FormIssueType, number> = new Map();
  private feedbackCount: number = 0;
  private feedbackWindowStart: number = Date.now();

  constructor(
    exerciseType: ExerciseType,
    userLevel: FitnessLevel = 'beginner',
    config: Partial<FormAnalyzerConfig> = {}
  ) {
    this.exerciseType = exerciseType;
    this.userLevel = userLevel;
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      toleranceMultiplier: LEVEL_TOLERANCE[userLevel],
    };
  }

  /**
   * Analisa a forma e retorna feedback
   */
  analyzeForm(keypoints: Keypoint[], currentAngle: number): FormAnalysis {
    const issues: FormIssue[] = [];
    const improvements: string[] = [];
    let overallScore = 100;
    let isInSafeZone = true;

    // Análise específica por exercício
    switch (this.exerciseType) {
      case 'squat':
        this.analyzeSquatForm(keypoints, currentAngle, issues);
        break;
      case 'pushup':
        this.analyzePushupForm(keypoints, currentAngle, issues);
        break;
      case 'plank':
        this.analyzePlankForm(keypoints, issues);
        break;
      default:
        // Análise genérica
        break;
    }

    // Calcular score baseado nos issues
    for (const issue of issues) {
      const penalty = issue.severity === 'minor' ? 5 : issue.severity === 'moderate' ? 15 : 25;
      overallScore -= penalty;
      
      if (issue.severity === 'significant') {
        isInSafeZone = false;
      }

      improvements.push(issue.correction);
    }

    overallScore = Math.max(0, overallScore);

    return {
      overallScore,
      issues,
      improvements: [...new Set(improvements)], // Remove duplicatas
      isInSafeZone,
    };
  }

  /**
   * Analisa forma do agachamento
   */
  private analyzeSquatForm(keypoints: Keypoint[], angle: number, issues: FormIssue[]): void {
    const tolerance = this.config.toleranceMultiplier;

    // 1. Joelhos passando dos pés
    const leftKnee = findKeypoint(keypoints, 'left_knee');
    const leftAnkle = findKeypoint(keypoints, 'left_ankle');
    
    if (leftKnee && leftAnkle && hasValidConfidence([leftKnee, leftAnkle])) {
      const kneeOverToes = leftKnee.x - leftAnkle.x;
      
      if (kneeOverToes > 0.08 * tolerance) {
        const severity = kneeOverToes > 0.15 ? 'significant' : kneeOverToes > 0.1 ? 'moderate' : 'minor';
        this.addIssueIfAllowed('knee_over_toes', severity, ['left_knee', 'left_ankle'], issues);
      }
    }

    // 2. Costas arredondadas
    const leftShoulder = findKeypoint(keypoints, 'left_shoulder');
    const leftHip = findKeypoint(keypoints, 'left_hip');
    
    if (leftShoulder && leftHip && hasValidConfidence([leftShoulder, leftHip])) {
      const trunkAngle = Math.atan2(
        leftShoulder.y - leftHip.y,
        leftShoulder.x - leftHip.x
      ) * 180 / Math.PI;

      if (Math.abs(trunkAngle + 90) > 40 * tolerance) {
        const severity = Math.abs(trunkAngle + 90) > 60 ? 'significant' : 'moderate';
        this.addIssueIfAllowed('back_rounding', severity, ['left_shoulder', 'left_hip'], issues);
      }
    }

    // 3. Profundidade insuficiente (só durante fase down)
    if (angle > 120 * tolerance) {
      const severity = angle > 140 ? 'significant' : angle > 130 ? 'moderate' : 'minor';
      this.addIssueIfAllowed('depth_insufficient', severity, ['left_hip', 'left_knee'], issues);
    }

    // 4. Assimetria
    const rightKnee = findKeypoint(keypoints, 'right_knee');
    const rightAnkle = findKeypoint(keypoints, 'right_ankle');
    
    if (leftKnee && rightKnee && hasValidConfidence([leftKnee, rightKnee])) {
      const asymmetry = Math.abs(leftKnee.y - rightKnee.y);
      
      if (asymmetry > 0.05 * tolerance) {
        const severity = asymmetry > 0.1 ? 'moderate' : 'minor';
        this.addIssueIfAllowed('asymmetry', severity, ['left_knee', 'right_knee'], issues);
      }
    }
  }

  /**
   * Analisa forma da flexão
   */
  private analyzePushupForm(keypoints: Keypoint[], angle: number, issues: FormIssue[]): void {
    const tolerance = this.config.toleranceMultiplier;

    // 1. Cotovelos muito abertos
    const leftShoulder = findKeypoint(keypoints, 'left_shoulder');
    const leftElbow = findKeypoint(keypoints, 'left_elbow');
    const leftWrist = findKeypoint(keypoints, 'left_wrist');

    if (leftShoulder && leftElbow && leftWrist && hasValidConfidence([leftShoulder, leftElbow, leftWrist])) {
      // Verificar ângulo do cotovelo em relação ao corpo
      const elbowAngle = Math.atan2(
        leftElbow.y - leftShoulder.y,
        leftElbow.x - leftShoulder.x
      ) * 180 / Math.PI;

      if (Math.abs(elbowAngle) > 60 * tolerance) {
        const severity = Math.abs(elbowAngle) > 80 ? 'significant' : 'moderate';
        this.addIssueIfAllowed('elbow_flare', severity, ['left_elbow'], issues);
      }
    }

    // 2. Quadril caindo
    const leftHip = findKeypoint(keypoints, 'left_hip');
    const leftAnkle = findKeypoint(keypoints, 'left_ankle');

    if (leftShoulder && leftHip && leftAnkle && hasValidConfidence([leftShoulder, leftHip, leftAnkle])) {
      const bodyLineAngle = calculateAngle(
        { x: leftShoulder.x, y: leftShoulder.y },
        { x: leftHip.x, y: leftHip.y },
        { x: leftAnkle.x, y: leftAnkle.y }
      );

      if (bodyLineAngle < 160 * tolerance) {
        const severity = bodyLineAngle < 140 ? 'significant' : 'moderate';
        this.addIssueIfAllowed('hip_drop', severity, ['left_hip'], issues);
      }
    }
  }

  /**
   * Analisa forma da prancha
   */
  private analyzePlankForm(keypoints: Keypoint[], issues: FormIssue[]): void {
    const tolerance = this.config.toleranceMultiplier;

    const leftShoulder = findKeypoint(keypoints, 'left_shoulder');
    const leftHip = findKeypoint(keypoints, 'left_hip');
    const leftAnkle = findKeypoint(keypoints, 'left_ankle');

    if (leftShoulder && leftHip && leftAnkle && hasValidConfidence([leftShoulder, leftHip, leftAnkle])) {
      // Verificar alinhamento do corpo
      const bodyLineAngle = calculateAngle(
        { x: leftShoulder.x, y: leftShoulder.y },
        { x: leftHip.x, y: leftHip.y },
        { x: leftAnkle.x, y: leftAnkle.y }
      );

      if (bodyLineAngle < 165 * tolerance) {
        const severity = bodyLineAngle < 150 ? 'significant' : bodyLineAngle < 160 ? 'moderate' : 'minor';
        this.addIssueIfAllowed('hip_drop', severity, ['left_hip'], issues);
      }
    }

    // Verificar pescoço
    const nose = findKeypoint(keypoints, 'nose');
    
    if (nose && leftShoulder && hasValidConfidence([nose, leftShoulder])) {
      const neckAngle = Math.atan2(
        nose.y - leftShoulder.y,
        nose.x - leftShoulder.x
      ) * 180 / Math.PI;

      if (Math.abs(neckAngle + 90) > 30 * tolerance) {
        this.addIssueIfAllowed('neck_strain', 'moderate', ['nose'], issues);
      }
    }
  }

  /**
   * Adiciona issue se permitido pelo rate limiting
   */
  private addIssueIfAllowed(
    type: FormIssueType,
    severity: 'minor' | 'moderate' | 'significant',
    affectedKeypoints: KeypointId[],
    issues: FormIssue[]
  ): void {
    const now = Date.now();

    // Verificar cooldown por tipo
    const lastTime = this.lastFeedbackTime.get(type) || 0;
    if (now - lastTime < this.config.feedbackCooldown) {
      return;
    }

    // Verificar limite por minuto
    if (now - this.feedbackWindowStart > 60000) {
      this.feedbackWindowStart = now;
      this.feedbackCount = 0;
    }

    if (this.feedbackCount >= this.config.maxFeedbacksPerMinute) {
      return;
    }

    // Adicionar issue
    const rawMessage = POSITIVE_MESSAGES[type][severity];
    const genderedMessage = getGenderedMessage(rawMessage, this.config.userGender);
    
    issues.push({
      type,
      severity,
      message: genderedMessage,
      correction: CORRECTIONS[type],
      affectedKeypoints,
    });

    this.lastFeedbackTime.set(type, now);
    this.feedbackCount++;
  }

  /**
   * Obtém recomendações priorizadas
   */
  getRecommendations(issues: FormIssue[]): FormRecommendation[] {
    return issues
      .map((issue, index) => ({
        type: issue.type,
        message: issue.message,
        priority: issue.severity === 'significant' ? 1 : issue.severity === 'moderate' ? 2 : 3,
      }))
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 2); // Máximo 2 recomendações por vez
  }

  /**
   * Reseta o estado do analisador
   */
  reset(): void {
    this.lastFeedbackTime.clear();
    this.feedbackCount = 0;
    this.feedbackWindowStart = Date.now();
  }

  /**
   * Atualiza nível do usuário
   */
  setUserLevel(level: FitnessLevel): void {
    this.userLevel = level;
    this.config.toleranceMultiplier = LEVEL_TOLERANCE[level];
  }

  /**
   * Atualiza gênero do usuário para mensagens personalizadas
   */
  setUserGender(gender: string | null): void {
    this.config.userGender = gender;
  }
}

/**
 * Factory para criar analisador
 */
export function createFormAnalyzer(
  exerciseType: ExerciseType,
  userLevel: FitnessLevel = 'beginner'
): FormAnalyzer {
  return new FormAnalyzer(exerciseType, userLevel);
}
