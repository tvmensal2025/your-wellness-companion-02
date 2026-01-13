// =====================================================
// METRIC ALERT PROPERTY TESTS
// =====================================================
// Property-based tests using fast-check
// Validates: Requirements 1.5, 1.6
// Property 4: Metric Alert Threshold Detection
// =====================================================

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// =====================================================
// MOCK TYPES AND THRESHOLDS
// =====================================================

type MetricType = 'weight' | 'sleep' | 'exercise' | 'nutrition' | 'mood';

interface MetricThreshold {
  alertBelow: number | null;
  alertAbove: number | null;
}

const METRIC_THRESHOLDS: Record<MetricType, MetricThreshold> = {
  weight: { alertBelow: null, alertAbove: null },
  sleep: { alertBelow: 6, alertAbove: 10 },
  exercise: { alertBelow: 1, alertAbove: null },
  nutrition: { alertBelow: 40, alertAbove: null },
  mood: { alertBelow: 4, alertAbove: null },
};

// =====================================================
// PURE FUNCTIONS FOR TESTING
// =====================================================

/**
 * Determines if a metric should trigger an alert
 * Property 4: if value crosses threshold, isAlert SHALL be true
 */
function shouldTriggerAlert(type: MetricType, value: number): boolean {
  const threshold = METRIC_THRESHOLDS[type];
  
  if (threshold.alertBelow !== null && value < threshold.alertBelow) {
    return true;
  }
  
  if (threshold.alertAbove !== null && value > threshold.alertAbove) {
    return true;
  }
  
  return false;
}

/**
 * Gets the alert message for a metric
 */
function getAlertMessage(type: MetricType, value: number): string | null {
  if (!shouldTriggerAlert(type, value)) return null;
  
  const messages: Record<MetricType, string> = {
    weight: 'Peso fora do objetivo',
    sleep: value < 6 ? 'Você está dormindo menos que o recomendado' : 'Você está dormindo demais',
    exercise: 'Você não treinou esta semana',
    nutrition: 'Sua alimentação precisa de atenção',
    mood: 'Cuide da sua saúde mental',
  };
  
  return messages[type];
}

/**
 * Validates a metric card has correct alert state
 */
function validateMetricAlert(
  type: MetricType,
  value: number,
  isAlert: boolean,
  alertMessage?: string
): boolean {
  const shouldAlert = shouldTriggerAlert(type, value);
  
  if (shouldAlert !== isAlert) return false;
  
  if (shouldAlert && !alertMessage) return false;
  if (!shouldAlert && alertMessage) return false;
  
  return true;
}

// =====================================================
// ARBITRARIES (Data Generators)
// =====================================================

const metricTypeArb = fc.constantFrom('sleep', 'exercise', 'nutrition', 'mood') as fc.Arbitrary<MetricType>;

// Sleep values (0-24 hours)
const sleepValueArb = fc.float({ min: 0, max: 24, noNaN: true });

// Exercise values (0-7 days)
const exerciseValueArb = fc.integer({ min: 0, max: 7 });

// Nutrition score (0-100)
const nutritionValueArb = fc.integer({ min: 0, max: 100 });

// Mood score (0-10)
const moodValueArb = fc.integer({ min: 0, max: 10 });

// =====================================================
// PROPERTY 4: Metric Alert Threshold Detection
// =====================================================
// For any metric card, if the value crosses the defined threshold
// (e.g., sleep < 6h, exercise streak = 0), the isAlert flag SHALL be true.
// =====================================================

describe('Property 4: Metric Alert Threshold Detection', () => {
  describe('Sleep Metric', () => {
    it('should trigger alert when sleep < 6 hours', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 59 }).map(n => n / 10), // 0 to 5.9
          (sleepHours) => {
            expect(shouldTriggerAlert('sleep', sleepHours)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should trigger alert when sleep > 10 hours', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 101, max: 240 }).map(n => n / 10), // 10.1 to 24
          (sleepHours) => {
            expect(shouldTriggerAlert('sleep', sleepHours)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should NOT trigger alert when sleep is 6-10 hours', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 60, max: 100 }).map(n => n / 10), // 6 to 10
          (sleepHours) => {
            expect(shouldTriggerAlert('sleep', sleepHours)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Exercise Metric', () => {
    it('should trigger alert when exercise days = 0', () => {
      expect(shouldTriggerAlert('exercise', 0)).toBe(true);
    });

    it('should NOT trigger alert when exercise days >= 1', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 7 }),
          (exerciseDays) => {
            expect(shouldTriggerAlert('exercise', exerciseDays)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Nutrition Metric', () => {
    it('should trigger alert when nutrition score < 40', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 39 }),
          (score) => {
            expect(shouldTriggerAlert('nutrition', score)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should NOT trigger alert when nutrition score >= 40', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 40, max: 100 }),
          (score) => {
            expect(shouldTriggerAlert('nutrition', score)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Mood Metric', () => {
    it('should trigger alert when mood < 4', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 3 }),
          (mood) => {
            expect(shouldTriggerAlert('mood', mood)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should NOT trigger alert when mood >= 4', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 4, max: 10 }),
          (mood) => {
            expect(shouldTriggerAlert('mood', mood)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Weight Metric', () => {
    it('should never trigger alert (no thresholds defined)', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 30, max: 200, noNaN: true }),
          (weight) => {
            expect(shouldTriggerAlert('weight', weight)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

// =====================================================
// ALERT MESSAGE PROPERTIES
// =====================================================

describe('Alert Message Properties', () => {
  it('should return message when alert is triggered', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }), // mood values that trigger alert
        (mood) => {
          const message = getAlertMessage('mood', mood);
          expect(message).not.toBeNull();
          expect(typeof message).toBe('string');
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return null when no alert', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 4, max: 10 }), // mood values that don't trigger alert
        (mood) => {
          const message = getAlertMessage('mood', mood);
          expect(message).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have different messages for low vs high sleep', () => {
    const lowSleepMessage = getAlertMessage('sleep', 4);
    const highSleepMessage = getAlertMessage('sleep', 12);
    
    expect(lowSleepMessage).not.toBeNull();
    expect(highSleepMessage).not.toBeNull();
    expect(lowSleepMessage).not.toBe(highSleepMessage);
  });
});

// =====================================================
// VALIDATION PROPERTIES
// =====================================================

describe('Metric Alert Validation', () => {
  it('should validate correct alert state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 3 }), // triggers alert
        (mood) => {
          const isAlert = shouldTriggerAlert('mood', mood);
          const message = getAlertMessage('mood', mood);
          
          expect(validateMetricAlert('mood', mood, isAlert, message || undefined)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should fail validation when alert state is wrong', () => {
    // Value that should trigger alert
    const value = 2; // mood < 4
    
    // But we say isAlert is false (wrong)
    expect(validateMetricAlert('mood', value, false, undefined)).toBe(false);
  });

  it('should fail validation when message is missing for alert', () => {
    const value = 2; // triggers alert
    
    // Alert is true but no message
    expect(validateMetricAlert('mood', value, true, undefined)).toBe(false);
  });

  it('should fail validation when message exists but no alert', () => {
    const value = 8; // no alert
    
    // No alert but has message
    expect(validateMetricAlert('mood', value, false, 'Some message')).toBe(false);
  });
});

// =====================================================
// BOUNDARY TESTS
// =====================================================

describe('Boundary Tests', () => {
  it('should handle exact threshold values for sleep', () => {
    // Exactly at lower threshold
    expect(shouldTriggerAlert('sleep', 6)).toBe(false);
    expect(shouldTriggerAlert('sleep', 5.99)).toBe(true);
    
    // Exactly at upper threshold
    expect(shouldTriggerAlert('sleep', 10)).toBe(false);
    expect(shouldTriggerAlert('sleep', 10.01)).toBe(true);
  });

  it('should handle exact threshold values for exercise', () => {
    expect(shouldTriggerAlert('exercise', 0)).toBe(true);
    expect(shouldTriggerAlert('exercise', 1)).toBe(false);
  });

  it('should handle exact threshold values for nutrition', () => {
    expect(shouldTriggerAlert('nutrition', 39)).toBe(true);
    expect(shouldTriggerAlert('nutrition', 40)).toBe(false);
  });

  it('should handle exact threshold values for mood', () => {
    expect(shouldTriggerAlert('mood', 3)).toBe(true);
    expect(shouldTriggerAlert('mood', 4)).toBe(false);
  });
});

// =====================================================
// EDGE CASES
// =====================================================

describe('Edge Cases', () => {
  it('should handle zero values', () => {
    expect(shouldTriggerAlert('sleep', 0)).toBe(true);
    expect(shouldTriggerAlert('exercise', 0)).toBe(true);
    expect(shouldTriggerAlert('nutrition', 0)).toBe(true);
    expect(shouldTriggerAlert('mood', 0)).toBe(true);
  });

  it('should handle maximum values', () => {
    expect(shouldTriggerAlert('sleep', 24)).toBe(true); // > 10
    expect(shouldTriggerAlert('exercise', 7)).toBe(false);
    expect(shouldTriggerAlert('nutrition', 100)).toBe(false);
    expect(shouldTriggerAlert('mood', 10)).toBe(false);
  });

  it('should be deterministic', () => {
    fc.assert(
      fc.property(
        metricTypeArb,
        fc.float({ min: 0, max: 100, noNaN: true }),
        (type, value) => {
          const result1 = shouldTriggerAlert(type, value);
          const result2 = shouldTriggerAlert(type, value);
          expect(result1).toBe(result2);
        }
      ),
      { numRuns: 100 }
    );
  });
});
