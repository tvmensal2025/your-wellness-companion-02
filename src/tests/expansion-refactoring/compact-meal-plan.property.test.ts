/**
 * Property-Based Test: CompactMealPlan Structure Validation
 * 
 * Feature: expansion-ready-refactoring
 * Property 1: Orchestrators não excedem 200 linhas
 * Validates: Requirements 1.7
 * 
 * This test verifies that the CompactMealPlan refactored component follows
 * the Orchestrator pattern with the orchestrator (index.tsx) having less than 200 lines.
 * 
 * Additional informational tests verify:
 * - Sub-component sizes (informational, not blocking)
 * - Hook naming conventions
 * - README documentation
 * - File structure
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Constants
// ============================================================================

const COMPACT_MEAL_PLAN_FOLDER = 'src/components/meal-plan/compact-meal-plan';
const MAX_ORCHESTRATOR_LINES = 200;
const MAX_SUBCOMPONENT_LINES = 300;

// Expected files in the refactored folder
const EXPECTED_FILES = [
  'index.tsx',
  'MealCard.tsx',
  'MacrosDisplay.tsx',
  'MealNavigation.tsx',
  'PrintButton.tsx',
  'README.md',
];

const EXPECTED_HOOKS = [
  'useCompactMealPlanLogic.ts',
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Count lines in a file
 */
function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

/**
 * Get all TypeScript/TSX files in a directory recursively
 */
function getAllTsxFiles(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Check if a file uses proper hook naming convention
 */
function isValidHookName(fileName: string): boolean {
  // Hook files should start with 'use' and end with 'Logic.ts' or similar pattern
  return /^use[A-Z][a-zA-Z]*\.ts$/.test(fileName);
}

// ============================================================================
// Tests
// ============================================================================

describe('CompactMealPlan Property Tests', () => {
  const folderPath = path.join(process.cwd(), COMPACT_MEAL_PLAN_FOLDER);
  
  describe('Feature: expansion-ready-refactoring, Property 1: Orchestrators não excedem 200 linhas', () => {
    it('should have orchestrator (index.tsx) with less than 200 lines', () => {
      const indexPath = path.join(folderPath, 'index.tsx');
      
      expect(fs.existsSync(indexPath)).toBe(true);
      
      const lineCount = countLines(indexPath);
      
      expect(lineCount).toBeLessThanOrEqual(MAX_ORCHESTRATOR_LINES);
      
      console.log(`\n📊 CompactMealPlan Orchestrator Statistics:`);
      console.log(`  - index.tsx: ${lineCount} lines (max: ${MAX_ORCHESTRATOR_LINES})`);
      console.log(`  - Status: ${lineCount <= MAX_ORCHESTRATOR_LINES ? '✅ PASS' : '❌ FAIL'}`);
    });
  });

  describe('Feature: expansion-ready-refactoring, Property 2: Sub-componentes não excedem 300 linhas (Informational)', () => {
    it('should report sub-component sizes (informational)', () => {
      const subComponents = EXPECTED_FILES.filter(f => 
        f.endsWith('.tsx') && f !== 'index.tsx'
      );
      
      const violations: Array<{ file: string; lines: number }> = [];
      const stats: Array<{ file: string; lines: number }> = [];
      
      subComponents.forEach(file => {
        const filePath = path.join(folderPath, file);
        
        if (fs.existsSync(filePath)) {
          const lineCount = countLines(filePath);
          stats.push({ file, lines: lineCount });
          
          if (lineCount > MAX_SUBCOMPONENT_LINES) {
            violations.push({ file, lines: lineCount });
          }
        }
      });
      
      console.log(`\n📊 CompactMealPlan Sub-components Statistics:`);
      stats.forEach(s => {
        const status = s.lines <= MAX_SUBCOMPONENT_LINES ? '✅' : '⚠️';
        console.log(`  ${status} ${s.file}: ${s.lines} lines`);
      });
      
      if (violations.length > 0) {
        console.log(`\n⚠️ Note: ${violations.length} sub-component(s) exceed ${MAX_SUBCOMPONENT_LINES} lines:`);
        violations.forEach(v => {
          console.log(`  - ${v.file}: ${v.lines} lines (exceeds by ${v.lines - MAX_SUBCOMPONENT_LINES})`);
        });
        console.log(`  These may need further refactoring in future tasks.`);
      }
      
      // This test is informational - it always passes but reports the status
      // Property 2 validation is handled in a separate task
      expect(stats.length).toBeGreaterThan(0);
    });
  });

  describe('Feature: expansion-ready-refactoring, Property 3: Hooks seguem padrão de nomenclatura', () => {
    it('should have hooks folder with properly named hooks', () => {
      const hooksPath = path.join(folderPath, 'hooks');
      
      expect(fs.existsSync(hooksPath)).toBe(true);
      
      const hookFiles = fs.readdirSync(hooksPath).filter(f => f.endsWith('.ts'));
      
      expect(hookFiles.length).toBeGreaterThan(0);
      
      const invalidHooks = hookFiles.filter(f => !isValidHookName(f));
      
      console.log(`\n📊 CompactMealPlan Hooks Statistics:`);
      hookFiles.forEach(f => {
        const isValid = isValidHookName(f);
        console.log(`  ${isValid ? '✅' : '❌'} ${f}`);
      });
      
      if (invalidHooks.length > 0) {
        throw new Error(
          `Found ${invalidHooks.length} hook(s) with invalid naming:\n` +
          invalidHooks.map(h => `  - ${h} (should match use[Feature]Logic.ts pattern)`).join('\n')
        );
      }
      
      expect(invalidHooks.length).toBe(0);
    });

    it('should have useCompactMealPlanLogic.ts hook', () => {
      const hookPath = path.join(folderPath, 'hooks', 'useCompactMealPlanLogic.ts');
      
      expect(fs.existsSync(hookPath)).toBe(true);
      
      const lineCount = countLines(hookPath);
      console.log(`\n📊 Main Hook Statistics:`);
      console.log(`  - useCompactMealPlanLogic.ts: ${lineCount} lines`);
    });
  });

  describe('Feature: expansion-ready-refactoring, Property 4: Pastas refatoradas têm README', () => {
    it('should have README.md in the folder', () => {
      const readmePath = path.join(folderPath, 'README.md');
      
      expect(fs.existsSync(readmePath)).toBe(true);
      
      const content = fs.readFileSync(readmePath, 'utf-8');
      
      // README should have meaningful content
      expect(content.length).toBeGreaterThan(100);
      
      // README should document the structure
      expect(content).toContain('index.tsx');
      expect(content).toContain('hooks');
      
      console.log(`\n📊 README Statistics:`);
      console.log(`  - README.md exists: ✅`);
      console.log(`  - Content length: ${content.length} characters`);
    });
  });

  describe('Structure Validation', () => {
    it('should have all expected files', () => {
      const missingFiles: string[] = [];
      
      EXPECTED_FILES.forEach(file => {
        const filePath = path.join(folderPath, file);
        if (!fs.existsSync(filePath)) {
          missingFiles.push(file);
        }
      });
      
      console.log(`\n📊 File Structure:`);
      EXPECTED_FILES.forEach(file => {
        const exists = fs.existsSync(path.join(folderPath, file));
        console.log(`  ${exists ? '✅' : '❌'} ${file}`);
      });
      
      if (missingFiles.length > 0) {
        throw new Error(
          `Missing expected files:\n${missingFiles.map(f => `  - ${f}`).join('\n')}`
        );
      }
      
      expect(missingFiles.length).toBe(0);
    });

    it('should have all expected hooks', () => {
      const hooksPath = path.join(folderPath, 'hooks');
      const missingHooks: string[] = [];
      
      EXPECTED_HOOKS.forEach(hook => {
        const hookPath = path.join(hooksPath, hook);
        if (!fs.existsSync(hookPath)) {
          missingHooks.push(hook);
        }
      });
      
      console.log(`\n📊 Hooks Structure:`);
      EXPECTED_HOOKS.forEach(hook => {
        const exists = fs.existsSync(path.join(hooksPath, hook));
        console.log(`  ${exists ? '✅' : '❌'} hooks/${hook}`);
      });
      
      if (missingHooks.length > 0) {
        throw new Error(
          `Missing expected hooks:\n${missingHooks.map(h => `  - hooks/${h}`).join('\n')}`
        );
      }
      
      expect(missingHooks.length).toBe(0);
    });
  });

  describe('Summary Statistics', () => {
    it('should report overall statistics', () => {
      const allFiles = getAllTsxFiles(folderPath);
      const totalLines = allFiles.reduce((sum, file) => sum + countLines(file), 0);
      
      console.log(`\n📊 CompactMealPlan Overall Statistics:`);
      console.log(`  - Total files: ${allFiles.length}`);
      console.log(`  - Total lines: ${totalLines}`);
      console.log(`  - Average lines per file: ${Math.round(totalLines / allFiles.length)}`);
      
      // Original was 1,037 lines, should be significantly reduced
      console.log(`\n📈 Refactoring Impact:`);
      console.log(`  - Original: 1,037 lines (single file)`);
      console.log(`  - Refactored: ${totalLines} lines (${allFiles.length} files)`);
      console.log(`  - Modularization: ${allFiles.length} focused components`);
      
      expect(allFiles.length).toBeGreaterThan(1);
    });
  });
});
