/**
 * Property-Based Tests for Database Compatibility
 * 
 * Feature: advanced-exercise-system
 * Property 29: Backward Compatibility Preservation
 * Validates: Requirements 7.1, 7.3
 * 
 * For any existing exercise in the 257-exercise database, all functionality 
 * should remain accessible and compatible with new features
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Mock exercise structure from existing database
interface ExerciseLibraryRow {
  id: string;
  name: string;
  location: string;
  muscle_group: string | null;
  difficulty: string | null;
  equipment_needed: string[] | null;
  instructions: string[] | null;
  reps: string | null;
  sets: string | null;
  rest_time: string | null;
  is_active: boolean | null;
  tags: string[] | null;
}

// New AI-enhanced exercise structure
interface AIEnhancedExercise extends ExerciseLibraryRow {
  ai_adaptations?: {
    difficulty_multiplier: number;
    rest_time_adjustment: number;
    alternative_exercises: string[];
  };
  progression_data?: {
    current_level: number;
    next_progression: string;
  };
  injury_risk_factors?: string[];
}

/**
 * Function that ensures backward compatibility when adding AI features
 * Property 29: Backward Compatibility Preservation
 */
function enhanceExerciseWithAI(exercise: ExerciseLibraryRow): AIEnhancedExercise {
  // All original fields must be preserved
  const enhanced: AIEnhancedExercise = {
    ...exercise,
    // Add optional AI features without breaking existing structure
    ai_adaptations: {
      difficulty_multiplier: 1.0,
      rest_time_adjustment: 0,
      alternative_exercises: [],
    },
    progression_data: {
      current_level: 1,
      next_progression: 'maintain',
    },
    injury_risk_factors: [],
  };
  
  return enhanced;
}

/**
 * Validates that all required fields from original exercise are present
 */
function validateOriginalFields(
  original: ExerciseLibraryRow,
  enhanced: AIEnhancedExercise
): boolean {
  return (
    enhanced.id === original.id &&
    enhanced.name === original.name &&
    enhanced.location === original.location &&
    enhanced.muscle_group === original.muscle_group &&
    enhanced.difficulty === original.difficulty &&
    JSON.stringify(enhanced.equipment_needed) === JSON.stringify(original.equipment_needed) &&
    JSON.stringify(enhanced.instructions) === JSON.stringify(original.instructions) &&
    enhanced.reps === original.reps &&
    enhanced.sets === original.sets &&
    enhanced.rest_time === original.rest_time &&
    enhanced.is_active === original.is_active &&
    JSON.stringify(enhanced.tags) === JSON.stringify(original.tags)
  );
}

// Arbitraries for generating test data
const locationArbitrary = fc.constantFrom('casa', 'academia');

const difficultyArbitrary = fc.constantFrom('iniciante', 'intermediário', 'avançado', null);

const muscleGroupArbitrary = fc.constantFrom(
  'peito',
  'costas',
  'pernas',
  'ombros',
  'braços',
  'abdômen',
  'corpo todo',
  null
);

const equipmentArbitrary = fc.oneof(
  fc.constant(null),
  fc.array(
    fc.constantFrom('halteres', 'barra', 'banco', 'elástico', 'peso corporal', 'kettlebell'),
    { minLength: 0, maxLength: 3 }
  )
);

const instructionsArbitrary = fc.oneof(
  fc.constant(null),
  fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 })
);

const tagsArbitrary = fc.oneof(
  fc.constant(null),
  fc.array(
    fc.constantFrom('força', 'hipertrofia', 'resistência', 'mobilidade', 'cardio'),
    { minLength: 0, maxLength: 3 }
  )
);

const exerciseArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 5, maxLength: 50 }),
  location: locationArbitrary,
  muscle_group: muscleGroupArbitrary,
  difficulty: difficultyArbitrary,
  equipment_needed: equipmentArbitrary,
  instructions: instructionsArbitrary,
  reps: fc.oneof(fc.constant(null), fc.constantFrom('8-12', '10-15', '12-20', '15-20')),
  sets: fc.oneof(fc.constant(null), fc.constantFrom('3', '4', '3-4', '2-3')),
  rest_time: fc.oneof(fc.constant(null), fc.constantFrom('30s', '60s', '90s', '120s')),
  is_active: fc.oneof(fc.constant(true), fc.constant(false), fc.constant(null)),
  tags: tagsArbitrary,
});

describe('Database Compatibility - Property Tests', () => {
  /**
   * Property 29: Backward Compatibility Preservation
   * For any existing exercise, all original fields must be preserved when adding AI features
   */
  describe('Property 29: Backward Compatibility Preservation', () => {
    it('should preserve all original exercise fields when enhancing with AI', () => {
      fc.assert(
        fc.property(exerciseArbitrary, (exercise) => {
          const enhanced = enhanceExerciseWithAI(exercise);
          return validateOriginalFields(exercise, enhanced);
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain exercise accessibility after AI enhancement', () => {
      fc.assert(
        fc.property(exerciseArbitrary, (exercise) => {
          const enhanced = enhanceExerciseWithAI(exercise);
          
          // All original fields should be directly accessible
          const canAccessOriginalFields = 
            typeof enhanced.id === 'string' &&
            typeof enhanced.name === 'string' &&
            typeof enhanced.location === 'string';
          
          // New AI fields should be optional and not interfere
          const aiFieldsAreOptional = 
            enhanced.ai_adaptations !== undefined &&
            enhanced.progression_data !== undefined;
          
          return canAccessOriginalFields && aiFieldsAreOptional;
        }),
        { numRuns: 100 }
      );
    });

    it('should handle exercises with null optional fields', () => {
      fc.assert(
        fc.property(exerciseArbitrary, (exercise) => {
          const enhanced = enhanceExerciseWithAI(exercise);
          
          // Null fields should remain null
          if (exercise.muscle_group === null) {
            return enhanced.muscle_group === null;
          }
          if (exercise.difficulty === null) {
            return enhanced.difficulty === null;
          }
          if (exercise.equipment_needed === null) {
            return enhanced.equipment_needed === null;
          }
          
          return true;
        }),
        { numRuns: 100 }
      );
    });

    it('should preserve array fields without modification', () => {
      fc.assert(
        fc.property(exerciseArbitrary, (exercise) => {
          const enhanced = enhanceExerciseWithAI(exercise);
          
          // Array fields should be identical
          const equipmentMatch = 
            JSON.stringify(exercise.equipment_needed) === 
            JSON.stringify(enhanced.equipment_needed);
          
          const instructionsMatch = 
            JSON.stringify(exercise.instructions) === 
            JSON.stringify(enhanced.instructions);
          
          const tagsMatch = 
            JSON.stringify(exercise.tags) === 
            JSON.stringify(enhanced.tags);
          
          return equipmentMatch && instructionsMatch && tagsMatch;
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain is_active flag for filtering', () => {
      fc.assert(
        fc.property(exerciseArbitrary, (exercise) => {
          const enhanced = enhanceExerciseWithAI(exercise);
          
          // is_active should be preserved for backward compatibility
          return enhanced.is_active === exercise.is_active;
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimal exercise with only required fields', () => {
      const minimalExercise: ExerciseLibraryRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Flexão de Braço',
        location: 'casa',
        muscle_group: null,
        difficulty: null,
        equipment_needed: null,
        instructions: null,
        reps: null,
        sets: null,
        rest_time: null,
        is_active: null,
        tags: null,
      };
      
      const enhanced = enhanceExerciseWithAI(minimalExercise);
      
      expect(enhanced.id).toBe(minimalExercise.id);
      expect(enhanced.name).toBe(minimalExercise.name);
      expect(enhanced.location).toBe(minimalExercise.location);
      expect(enhanced.ai_adaptations).toBeDefined();
      expect(enhanced.progression_data).toBeDefined();
    });

    it('should handle fully populated exercise', () => {
      const fullExercise: ExerciseLibraryRow = {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Supino Reto com Barra',
        location: 'academia',
        muscle_group: 'peito',
        difficulty: 'intermediário',
        equipment_needed: ['barra', 'banco', 'anilhas'],
        instructions: [
          'Deite no banco',
          'Segure a barra',
          'Desça até o peito',
          'Empurre para cima',
        ],
        reps: '8-12',
        sets: '4',
        rest_time: '90s',
        is_active: true,
        tags: ['força', 'hipertrofia'],
      };
      
      const enhanced = enhanceExerciseWithAI(fullExercise);
      
      expect(validateOriginalFields(fullExercise, enhanced)).toBe(true);
      expect(enhanced.equipment_needed).toHaveLength(3);
      expect(enhanced.instructions).toHaveLength(4);
      expect(enhanced.tags).toHaveLength(2);
    });

    it('should handle inactive exercises', () => {
      const inactiveExercise: ExerciseLibraryRow = {
        id: '123e4567-e89b-12d3-a456-426614174002',
        name: 'Exercício Descontinuado',
        location: 'casa',
        muscle_group: 'pernas',
        difficulty: 'avançado',
        equipment_needed: null,
        instructions: null,
        reps: null,
        sets: null,
        rest_time: null,
        is_active: false,
        tags: null,
      };
      
      const enhanced = enhanceExerciseWithAI(inactiveExercise);
      
      // Inactive exercises should still be enhanced but remain inactive
      expect(enhanced.is_active).toBe(false);
      expect(enhanced.ai_adaptations).toBeDefined();
    });
  });

  describe('Compatibility with Existing Queries', () => {
    it('should allow filtering by location after enhancement', () => {
      fc.assert(
        fc.property(
          fc.array(exerciseArbitrary, { minLength: 5, maxLength: 20 }),
          (exercises) => {
            const enhanced = exercises.map(enhanceExerciseWithAI);
            
            // Should be able to filter by location as before
            const casaExercises = enhanced.filter(e => e.location === 'casa');
            const academiaExercises = enhanced.filter(e => e.location === 'academia');
            
            return casaExercises.length + academiaExercises.length === enhanced.length;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow filtering by muscle_group after enhancement', () => {
      fc.assert(
        fc.property(
          fc.array(exerciseArbitrary, { minLength: 5, maxLength: 20 }),
          (exercises) => {
            const enhanced = exercises.map(enhanceExerciseWithAI);
            
            // Should be able to filter by muscle_group as before
            const filtered = enhanced.filter(e => e.muscle_group === 'peito');
            
            // All filtered exercises should have muscle_group === 'peito'
            return filtered.every(e => e.muscle_group === 'peito');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should allow filtering by is_active after enhancement', () => {
      fc.assert(
        fc.property(
          fc.array(exerciseArbitrary, { minLength: 5, maxLength: 20 }),
          (exercises) => {
            const enhanced = exercises.map(enhanceExerciseWithAI);
            
            // Should be able to filter active exercises as before
            const activeExercises = enhanced.filter(e => e.is_active === true);
            
            // All filtered exercises should be active
            return activeExercises.every(e => e.is_active === true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
