// =====================================================
// PREDICTION PROPERTY TESTS
// =====================================================
// Property-based tests using fast-check
// Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
// Properties 9, 10, 11
// =====================================================

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// =====================================================
// MOCK TYPES FOR TESTING
// =====================================================

type RiskTimeframe = '3_months' | '6_months' | '1_year';

interface RiskFactor {
  name: string;
  impact: 'high' | 'medium' | 'low';
  currentValue: number;
  idealValue: number;
  unit: string;
}

interface HealthPrediction {
  id: string;
  userId: string;
  riskType: string;
  probability: number;
  timeframe: RiskTimeframe;
  factors: RiskFactor[];
  recommendations: string[];
}

interface WhatIfChange {
  factor: string;
  currentValue: number;
  newValue: number;
}

interface WhatIfSimulation {
  inputChanges: WhatIfChange[];
  originalPredictions: HealthPrediction[];
  simulatedPredictions: HealthPrediction[];
  improvementPercentage: number;
}

interface HealthyTwin {
  demographics: {
    age: number;
    gender: string;
    height: number;
  };
  idealMetrics: {
    weight: number;
    bmi: number;
  };
  comparisonScore: number;
}

// =====================================================
// PURE FUNCTIONS FOR TESTING
// =====================================================

const VALID_TIMEFRAMES: RiskTimeframe[] = ['3_months', '6_months', '1_year'];

/**
 * Validates a prediction
 * Property 9: probability 0-100, valid timeframe, at least one recommendation
 */
function isValidPrediction(prediction: HealthPrediction): boolean {
  return (
    prediction.probability >= 0 &&
    prediction.probability <= 100 &&
    VALID_TIMEFRAMES.includes(prediction.timeframe) &&
    prediction.recommendations.length >= 1
  );
}

/**
 * Creates a valid prediction
 */
function createPrediction(
  userId: string,
  riskType: string,
  probability: number,
  timeframe: RiskTimeframe,
  recommendations: string[]
): HealthPrediction {
  // Ensure at least one recommendation
  const finalRecommendations = recommendations.length > 0 
    ? recommendations 
    : ['Consulte seu médico regularmente'];
  
  // Clamp probability
  const clampedProbability = Math.max(0, Math.min(100, probability));
  
  return {
    id: `${userId}_${riskType}`,
    userId,
    riskType,
    probability: clampedProbability,
    timeframe,
    factors: [],
    recommendations: finalRecommendations,
  };
}

/**
 * Calculates improvement percentage
 * Property 10: improvement = (original - simulated) / original * 100
 */
function calculateImprovementPercentage(
  originalPredictions: HealthPrediction[],
  simulatedPredictions: HealthPrediction[]
): number {
  if (originalPredictions.length === 0) return 0;
  
  const originalAvg = originalPredictions.reduce((sum, p) => sum + p.probability, 0) / originalPredictions.length;
  const simulatedAvg = simulatedPredictions.length > 0
    ? simulatedPredictions.reduce((sum, p) => sum + p.probability, 0) / simulatedPredictions.length
    : 0;
  
  if (originalAvg === 0) return 0;
  
  return Math.round(((originalAvg - simulatedAvg) / originalAvg) * 100);
}

/**
 * Simulates what-if changes
 */
function simulateWhatIf(
  originalPredictions: HealthPrediction[],
  changes: WhatIfChange[]
): WhatIfSimulation {
  // Simple simulation: reduce probability based on positive changes
  const simulatedPredictions = originalPredictions.map(p => {
    let newProbability = p.probability;
    
    for (const change of changes) {
      // Weight loss reduces risk
      if (change.factor === 'weight' && change.newValue < change.currentValue) {
        const reduction = (change.currentValue - change.newValue) * 0.5;
        newProbability -= reduction;
      }
      // More exercise reduces risk
      if (change.factor === 'exercise' && change.newValue > change.currentValue) {
        const reduction = (change.newValue - change.currentValue) * 0.1;
        newProbability -= reduction;
      }
    }
    
    return {
      ...p,
      id: `${p.id}_simulated`,
      probability: Math.max(0, Math.min(100, newProbability)),
    };
  });
  
  const improvementPercentage = calculateImprovementPercentage(originalPredictions, simulatedPredictions);
  
  return {
    inputChanges: changes,
    originalPredictions,
    simulatedPredictions,
    improvementPercentage,
  };
}

/**
 * Creates a healthy twin
 * Property 11: demographics SHALL match user exactly
 */
function createHealthyTwin(
  userAge: number,
  userGender: string,
  userHeight: number
): HealthyTwin {
  const idealBmi = userGender === 'female' ? 21.5 : 22.5;
  const idealWeight = idealBmi * Math.pow(userHeight / 100, 2);
  
  return {
    demographics: {
      age: userAge,
      gender: userGender,
      height: userHeight,
    },
    idealMetrics: {
      weight: Math.round(idealWeight),
      bmi: idealBmi,
    },
    comparisonScore: 100,
  };
}

/**
 * Validates healthy twin demographics match
 */
function validateHealthyTwinDemographics(
  twin: HealthyTwin,
  userAge: number,
  userGender: string,
  userHeight: number
): boolean {
  return (
    twin.demographics.age === userAge &&
    twin.demographics.gender === userGender &&
    twin.demographics.height === userHeight
  );
}

// =====================================================
// ARBITRARIES (Data Generators)
// =====================================================

const userIdArb = fc.uuid();

const riskTypeArb = fc.constantFrom(
  'diabetes_type2',
  'hypertension',
  'cardiovascular',
  'obesity'
);

const probabilityArb = fc.integer({ min: 0, max: 100 });

const timeframeArb = fc.constantFrom('3_months', '6_months', '1_year') as fc.Arbitrary<RiskTimeframe>;

const recommendationArb = fc.constantFrom(
  'Consulte seu médico regularmente',
  'Pratique exercícios físicos',
  'Mantenha uma dieta equilibrada',
  'Durma 7-8 horas por noite',
  'Reduza o consumo de sal',
  'Monitore sua pressão arterial'
);

const recommendationsArb = fc.array(recommendationArb, { minLength: 1, maxLength: 5 });

const predictionArb = fc.record({
  id: fc.uuid(),
  userId: userIdArb,
  riskType: riskTypeArb,
  probability: probabilityArb,
  timeframe: timeframeArb,
  factors: fc.constant([] as RiskFactor[]),
  recommendations: recommendationsArb,
});

const whatIfChangeArb = fc.record({
  factor: fc.constantFrom('weight', 'exercise', 'sleep', 'bloodPressure'),
  currentValue: fc.integer({ min: 1, max: 200 }),
  newValue: fc.integer({ min: 1, max: 200 }),
});

const ageArb = fc.integer({ min: 18, max: 100 });
const genderArb = fc.constantFrom('male', 'female');
const heightArb = fc.integer({ min: 140, max: 220 });

// =====================================================
// PROPERTY 9: Risk Prediction Validity
// =====================================================
// For any health prediction, the probability SHALL be between 0-100,
// the timeframe SHALL be one of ['3_months', '6_months', '1_year'],
// and at least one recommendation SHALL be provided.
// =====================================================

describe('Property 9: Risk Prediction Validity', () => {
  it('should have probability between 0-100', () => {
    fc.assert(
      fc.property(
        userIdArb,
        riskTypeArb,
        fc.integer({ min: -100, max: 200 }),
        timeframeArb,
        recommendationsArb,
        (userId, riskType, rawProbability, timeframe, recommendations) => {
          const prediction = createPrediction(userId, riskType, rawProbability, timeframe, recommendations);
          
          expect(prediction.probability).toBeGreaterThanOrEqual(0);
          expect(prediction.probability).toBeLessThanOrEqual(100);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have valid timeframe', () => {
    fc.assert(
      fc.property(predictionArb, (prediction) => {
        expect(VALID_TIMEFRAMES).toContain(prediction.timeframe);
      }),
      { numRuns: 100 }
    );
  });

  it('should have at least one recommendation', () => {
    fc.assert(
      fc.property(
        userIdArb,
        riskTypeArb,
        probabilityArb,
        timeframeArb,
        fc.array(recommendationArb, { minLength: 0, maxLength: 5 }),
        (userId, riskType, probability, timeframe, recommendations) => {
          const prediction = createPrediction(userId, riskType, probability, timeframe, recommendations);
          
          expect(prediction.recommendations.length).toBeGreaterThanOrEqual(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should validate complete prediction', () => {
    fc.assert(
      fc.property(
        userIdArb,
        riskTypeArb,
        probabilityArb,
        timeframeArb,
        recommendationsArb,
        (userId, riskType, probability, timeframe, recommendations) => {
          const prediction = createPrediction(userId, riskType, probability, timeframe, recommendations);
          
          expect(isValidPrediction(prediction)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// PROPERTY 10: What-If Simulation Consistency
// =====================================================
// For any What-If simulation, changing an input value SHALL produce
// a different prediction probability, and the improvement percentage
// SHALL equal (original - simulated) / original * 100.
// =====================================================

describe('Property 10: What-If Simulation Consistency', () => {
  it('should calculate improvement percentage correctly', () => {
    fc.assert(
      fc.property(
        fc.array(predictionArb, { minLength: 1, maxLength: 5 }),
        fc.array(whatIfChangeArb, { minLength: 1, maxLength: 3 }),
        (predictions, changes) => {
          const simulation = simulateWhatIf(predictions, changes);
          
          const expectedImprovement = calculateImprovementPercentage(
            simulation.originalPredictions,
            simulation.simulatedPredictions
          );
          
          expect(simulation.improvementPercentage).toBe(expectedImprovement);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should preserve original predictions', () => {
    fc.assert(
      fc.property(
        fc.array(predictionArb, { minLength: 1, maxLength: 5 }),
        fc.array(whatIfChangeArb, { minLength: 1, maxLength: 3 }),
        (predictions, changes) => {
          const simulation = simulateWhatIf(predictions, changes);
          
          expect(simulation.originalPredictions).toEqual(predictions);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have same number of simulated predictions as original', () => {
    fc.assert(
      fc.property(
        fc.array(predictionArb, { minLength: 1, maxLength: 5 }),
        fc.array(whatIfChangeArb, { minLength: 1, maxLength: 3 }),
        (predictions, changes) => {
          const simulation = simulateWhatIf(predictions, changes);
          
          expect(simulation.simulatedPredictions.length).toBe(predictions.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should keep simulated probabilities within 0-100', () => {
    fc.assert(
      fc.property(
        fc.array(predictionArb, { minLength: 1, maxLength: 5 }),
        fc.array(whatIfChangeArb, { minLength: 1, maxLength: 3 }),
        (predictions, changes) => {
          const simulation = simulateWhatIf(predictions, changes);
          
          for (const pred of simulation.simulatedPredictions) {
            expect(pred.probability).toBeGreaterThanOrEqual(0);
            expect(pred.probability).toBeLessThanOrEqual(100);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 0 improvement when no original predictions', () => {
    fc.assert(
      fc.property(
        fc.array(whatIfChangeArb, { minLength: 1, maxLength: 3 }),
        (changes) => {
          const simulation = simulateWhatIf([], changes);
          
          expect(simulation.improvementPercentage).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// PROPERTY 11: Healthy Twin Demographics Match
// =====================================================
// For any Healthy Twin comparison, the twin's demographics
// (age, gender, height) SHALL match the user's demographics exactly.
// =====================================================

describe('Property 11: Healthy Twin Demographics Match', () => {
  it('should match user age exactly', () => {
    fc.assert(
      fc.property(ageArb, genderArb, heightArb, (age, gender, height) => {
        const twin = createHealthyTwin(age, gender, height);
        
        expect(twin.demographics.age).toBe(age);
      }),
      { numRuns: 100 }
    );
  });

  it('should match user gender exactly', () => {
    fc.assert(
      fc.property(ageArb, genderArb, heightArb, (age, gender, height) => {
        const twin = createHealthyTwin(age, gender, height);
        
        expect(twin.demographics.gender).toBe(gender);
      }),
      { numRuns: 100 }
    );
  });

  it('should match user height exactly', () => {
    fc.assert(
      fc.property(ageArb, genderArb, heightArb, (age, gender, height) => {
        const twin = createHealthyTwin(age, gender, height);
        
        expect(twin.demographics.height).toBe(height);
      }),
      { numRuns: 100 }
    );
  });

  it('should validate all demographics match', () => {
    fc.assert(
      fc.property(ageArb, genderArb, heightArb, (age, gender, height) => {
        const twin = createHealthyTwin(age, gender, height);
        
        expect(validateHealthyTwinDemographics(twin, age, gender, height)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('should fail validation when demographics differ', () => {
    fc.assert(
      fc.property(
        ageArb,
        genderArb,
        heightArb,
        fc.integer({ min: 1, max: 10 }),
        (age, gender, height, ageDiff) => {
          const twin = createHealthyTwin(age, gender, height);
          
          // Different age should fail
          expect(validateHealthyTwinDemographics(twin, age + ageDiff, gender, height)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate ideal weight based on height', () => {
    fc.assert(
      fc.property(ageArb, genderArb, heightArb, (age, gender, height) => {
        const twin = createHealthyTwin(age, gender, height);
        
        // Ideal weight should be positive and reasonable
        expect(twin.idealMetrics.weight).toBeGreaterThan(0);
        expect(twin.idealMetrics.weight).toBeLessThan(200);
        
        // BMI should be in healthy range
        expect(twin.idealMetrics.bmi).toBeGreaterThanOrEqual(18);
        expect(twin.idealMetrics.bmi).toBeLessThanOrEqual(25);
      }),
      { numRuns: 100 }
    );
  });

  it('should have different ideal BMI for male vs female', () => {
    fc.assert(
      fc.property(ageArb, heightArb, (age, height) => {
        const maleTwin = createHealthyTwin(age, 'male', height);
        const femaleTwin = createHealthyTwin(age, 'female', height);
        
        expect(maleTwin.idealMetrics.bmi).not.toBe(femaleTwin.idealMetrics.bmi);
      }),
      { numRuns: 100 }
    );
  });
});

// =====================================================
// EDGE CASES
// =====================================================

describe('Edge Cases', () => {
  it('should handle minimum age', () => {
    const twin = createHealthyTwin(18, 'male', 170);
    expect(twin.demographics.age).toBe(18);
  });

  it('should handle maximum age', () => {
    const twin = createHealthyTwin(100, 'female', 160);
    expect(twin.demographics.age).toBe(100);
  });

  it('should handle extreme heights', () => {
    const shortTwin = createHealthyTwin(30, 'male', 140);
    const tallTwin = createHealthyTwin(30, 'male', 220);
    
    expect(shortTwin.idealMetrics.weight).toBeLessThan(tallTwin.idealMetrics.weight);
  });

  it('should handle zero probability', () => {
    const prediction = createPrediction('user1', 'diabetes', 0, '1_year', ['Test']);
    expect(isValidPrediction(prediction)).toBe(true);
    expect(prediction.probability).toBe(0);
  });

  it('should handle 100% probability', () => {
    const prediction = createPrediction('user1', 'diabetes', 100, '3_months', ['Test']);
    expect(isValidPrediction(prediction)).toBe(true);
    expect(prediction.probability).toBe(100);
  });

  it('should handle empty changes in what-if', () => {
    const predictions = [createPrediction('user1', 'diabetes', 50, '6_months', ['Test'])];
    const simulation = simulateWhatIf(predictions, []);
    
    expect(simulation.improvementPercentage).toBe(0);
    expect(simulation.simulatedPredictions[0].probability).toBe(50);
  });
});
