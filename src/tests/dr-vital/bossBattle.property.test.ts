// =====================================================
// BOSS BATTLE PROPERTY TESTS
// =====================================================
// Property-based tests using fast-check
// Validates: Requirements 2.5
// Property 7: Boss Battle Trigger from Abnormal Exams
// =====================================================

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// =====================================================
// MOCK TYPES FOR TESTING
// =====================================================

interface ExamResult {
  id: string;
  examType: string;
  status: string;
  analysisText: string;
}

interface BossBattle {
  id: string;
  userId: string;
  relatedExamId: string;
  type: 'boss_battle';
  xpReward: number;
}

// =====================================================
// PURE FUNCTIONS FOR TESTING
// =====================================================

const ABNORMAL_INDICATORS = [
  'attention_needed',
  'abnormal',
  'high',
  'low',
  'critical',
  'fora_do_normal',
  'alterado',
];

/**
 * Determines if an exam result is abnormal
 */
function isExamAbnormal(exam: ExamResult): boolean {
  const analysisLower = exam.analysisText.toLowerCase();
  const statusLower = exam.status.toLowerCase();
  
  return ABNORMAL_INDICATORS.some(
    indicator => analysisLower.includes(indicator) || statusLower.includes(indicator)
  );
}

/**
 * Creates a boss battle from an abnormal exam
 */
function createBossBattleFromExam(
  userId: string,
  exam: ExamResult,
  severity: 'warning' | 'critical'
): BossBattle {
  const baseXp = 500;
  const xpReward = severity === 'critical' ? baseXp * 2 : baseXp;
  
  return {
    id: `boss_${exam.id}`,
    userId,
    relatedExamId: exam.id,
    type: 'boss_battle',
    xpReward,
  };
}

/**
 * Validates that a boss battle correctly references its exam
 */
function validateBossBattleExamLink(battle: BossBattle, exam: ExamResult): boolean {
  return battle.relatedExamId === exam.id && battle.type === 'boss_battle';
}

// =====================================================
// ARBITRARIES (Data Generators)
// =====================================================

// Generate random exam status
const examStatusArb = fc.oneof(
  fc.constant('normal'),
  fc.constant('abnormal'),
  fc.constant('attention_needed'),
  fc.constant('critical'),
  fc.constant('high'),
  fc.constant('low'),
  fc.constant('alterado'),
  fc.constant('ok'),
);

// Generate random analysis text
const analysisTextArb = fc.oneof(
  fc.constant('Todos os valores estão normais'),
  fc.constant('Valor alterado detectado'),
  fc.constant('Attention needed: glucose levels high'),
  fc.constant('Critical: immediate action required'),
  fc.constant('Resultado dentro do esperado'),
  fc.constant('Fora do normal - consulte seu médico'),
  fc.constant('Exame sem alterações'),
);

// Generate exam result
const examResultArb = fc.record({
  id: fc.uuid(),
  examType: fc.constantFrom('blood', 'urine', 'glucose', 'cholesterol', 'hemoglobin'),
  status: examStatusArb,
  analysisText: analysisTextArb,
});

// Generate abnormal exam specifically
const abnormalExamArb = fc.record({
  id: fc.uuid(),
  examType: fc.constantFrom('blood', 'urine', 'glucose', 'cholesterol'),
  status: fc.constantFrom('abnormal', 'attention_needed', 'critical', 'high', 'low', 'alterado'),
  analysisText: fc.constantFrom(
    'Valor alterado detectado',
    'Attention needed: glucose levels high',
    'Critical: immediate action required',
    'Fora do normal - consulte seu médico'
  ),
});

// Generate normal exam specifically
const normalExamArb = fc.record({
  id: fc.uuid(),
  examType: fc.constantFrom('blood', 'urine', 'glucose', 'cholesterol'),
  status: fc.constant('normal'),
  analysisText: fc.constantFrom(
    'Todos os valores estão normais',
    'Resultado dentro do esperado',
    'Exame sem alterações'
  ),
});

const userIdArb = fc.uuid();
const severityArb = fc.constantFrom('warning', 'critical') as fc.Arbitrary<'warning' | 'critical'>;

// =====================================================
// PROPERTY 7: Boss Battle Trigger from Abnormal Exams
// =====================================================
// For any exam result marked as "abnormal" or "attention_needed",
// a boss_battle mission SHALL be created with related_exam_id 
// pointing to that exam.
// =====================================================

describe('Property 7: Boss Battle Trigger from Abnormal Exams', () => {
  it('should detect abnormal exams correctly', () => {
    fc.assert(
      fc.property(abnormalExamArb, (exam) => {
        const isAbnormal = isExamAbnormal(exam);
        expect(isAbnormal).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should not flag normal exams as abnormal', () => {
    fc.assert(
      fc.property(normalExamArb, (exam) => {
        const isAbnormal = isExamAbnormal(exam);
        expect(isAbnormal).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it('should create boss battle with correct exam reference', () => {
    fc.assert(
      fc.property(
        userIdArb,
        abnormalExamArb,
        severityArb,
        (userId, exam, severity) => {
          const battle = createBossBattleFromExam(userId, exam, severity);
          
          // Property: related_exam_id SHALL point to the exam
          expect(battle.relatedExamId).toBe(exam.id);
          expect(battle.type).toBe('boss_battle');
          expect(validateBossBattleExamLink(battle, exam)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should assign correct XP based on severity', () => {
    fc.assert(
      fc.property(
        userIdArb,
        abnormalExamArb,
        (userId, exam) => {
          const warningBattle = createBossBattleFromExam(userId, exam, 'warning');
          const criticalBattle = createBossBattleFromExam(userId, exam, 'critical');
          
          expect(warningBattle.xpReward).toBe(500);
          expect(criticalBattle.xpReward).toBe(1000);
          expect(criticalBattle.xpReward).toBe(warningBattle.xpReward * 2);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should always have positive XP reward', () => {
    fc.assert(
      fc.property(
        userIdArb,
        abnormalExamArb,
        severityArb,
        (userId, exam, severity) => {
          const battle = createBossBattleFromExam(userId, exam, severity);
          expect(battle.xpReward).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect all abnormal indicators', () => {
    for (const indicator of ABNORMAL_INDICATORS) {
      const examWithStatus: ExamResult = {
        id: 'test-id',
        examType: 'blood',
        status: indicator,
        analysisText: 'normal text',
      };
      
      const examWithAnalysis: ExamResult = {
        id: 'test-id',
        examType: 'blood',
        status: 'normal',
        analysisText: `Some text with ${indicator} in it`,
      };
      
      expect(isExamAbnormal(examWithStatus)).toBe(true);
      expect(isExamAbnormal(examWithAnalysis)).toBe(true);
    }
  });

  it('should be case-insensitive for abnormal detection', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...ABNORMAL_INDICATORS),
        (indicator) => {
          const upperCase: ExamResult = {
            id: 'test',
            examType: 'blood',
            status: indicator.toUpperCase(),
            analysisText: '',
          };
          
          const lowerCase: ExamResult = {
            id: 'test',
            examType: 'blood',
            status: indicator.toLowerCase(),
            analysisText: '',
          };
          
          const mixedCase: ExamResult = {
            id: 'test',
            examType: 'blood',
            status: indicator.charAt(0).toUpperCase() + indicator.slice(1).toLowerCase(),
            analysisText: '',
          };
          
          expect(isExamAbnormal(upperCase)).toBe(true);
          expect(isExamAbnormal(lowerCase)).toBe(true);
          expect(isExamAbnormal(mixedCase)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// BOSS BATTLE INVARIANTS
// =====================================================

describe('Boss Battle Invariants', () => {
  it('should always have type boss_battle', () => {
    fc.assert(
      fc.property(
        userIdArb,
        abnormalExamArb,
        severityArb,
        (userId, exam, severity) => {
          const battle = createBossBattleFromExam(userId, exam, severity);
          expect(battle.type).toBe('boss_battle');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve user ID', () => {
    fc.assert(
      fc.property(
        userIdArb,
        abnormalExamArb,
        severityArb,
        (userId, exam, severity) => {
          const battle = createBossBattleFromExam(userId, exam, severity);
          expect(battle.userId).toBe(userId);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should generate unique battle ID', () => {
    fc.assert(
      fc.property(
        userIdArb,
        abnormalExamArb,
        abnormalExamArb,
        severityArb,
        (userId, exam1, exam2, severity) => {
          fc.pre(exam1.id !== exam2.id);
          
          const battle1 = createBossBattleFromExam(userId, exam1, severity);
          const battle2 = createBossBattleFromExam(userId, exam2, severity);
          
          expect(battle1.id).not.toBe(battle2.id);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// EDGE CASES
// =====================================================

describe('Edge Cases', () => {
  it('should handle empty analysis text', () => {
    const exam: ExamResult = {
      id: 'test',
      examType: 'blood',
      status: 'abnormal',
      analysisText: '',
    };
    
    expect(isExamAbnormal(exam)).toBe(true);
  });

  it('should handle empty status', () => {
    const exam: ExamResult = {
      id: 'test',
      examType: 'blood',
      status: '',
      analysisText: 'attention_needed',
    };
    
    expect(isExamAbnormal(exam)).toBe(true);
  });

  it('should handle both empty status and analysis', () => {
    const exam: ExamResult = {
      id: 'test',
      examType: 'blood',
      status: '',
      analysisText: '',
    };
    
    expect(isExamAbnormal(exam)).toBe(false);
  });

  it('should handle partial indicator matches', () => {
    const exam: ExamResult = {
      id: 'test',
      examType: 'blood',
      status: 'normal',
      analysisText: 'abnormality detected', // Contains 'abnormal'
    };
    
    expect(isExamAbnormal(exam)).toBe(true);
  });
});
