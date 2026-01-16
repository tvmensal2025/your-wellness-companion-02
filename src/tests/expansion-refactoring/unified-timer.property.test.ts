/**
 * Property-Based Tests for UnifiedTimer Refactoring
 * 
 * **Feature: expansion-ready-refactoring**
 * **Validates: Requirements 5.1-5.9**
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const UNIFIED_TIMER_FOLDER = 'src/components/exercise/unified-timer';

describe('UnifiedTimer Refactoring Properties', () => {
  /**
   * **Feature: expansion-ready-refactoring, Property 1: Orchestrators não excedem 200 linhas**
   * **Validates: Requirements 5.8**
   */
  it('should have orchestrator (index.tsx) with less than 200 lines', () => {
    const indexPath = path.join(UNIFIED_TIMER_FOLDER, 'index.tsx');
    expect(fs.existsSync(indexPath)).toBe(true);
    
    const content = fs.readFileSync(indexPath, 'utf-8');
    const lineCount = content.split('\n').length;
    
    expect(lineCount).toBeLessThanOrEqual(200);
    console.log(`✓ Orchestrator has ${lineCount} lines (max 200)`);
  });

  /**
   * **Feature: expansion-ready-refactoring, Property 2: Sub-componentes não excedem 300 linhas**
   * **Validates: Requirements 10.1**
   */
  it('should have all sub-components with less than 300 lines', () => {
    const subComponents = [
      'TimerDisplay.tsx',
      'TimerControls.tsx',
      'TimerPresets.tsx',
      'MotivationalMessage.tsx',
    ];

    subComponents.forEach(component => {
      const filePath = path.join(UNIFIED_TIMER_FOLDER, component);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lineCount = content.split('\n').length;
        expect(lineCount).toBeLessThanOrEqual(300);
        console.log(`✓ ${component} has ${lineCount} lines (max 300)`);
      }
    });
  });

  /**
   * **Feature: expansion-ready-refactoring, Property 3: Hooks seguem padrão de nomenclatura**
   * **Validates: Requirements 10.2**
   */
  it('should have hooks following naming convention use[Feature]Logic.ts', () => {
    const hooksFolder = path.join(UNIFIED_TIMER_FOLDER, 'hooks');
    expect(fs.existsSync(hooksFolder)).toBe(true);

    const hookFiles = fs.readdirSync(hooksFolder).filter(f => f.endsWith('.ts'));
    
    hookFiles.forEach(hookFile => {
      // Should match useTimerLogic.ts or useTimerSound.ts pattern
      const validPattern = /^use[A-Z][a-zA-Z]+\.ts$/;
      expect(hookFile).toMatch(validPattern);
      console.log(`✓ Hook ${hookFile} follows naming convention`);
    });

    // Verify expected hooks exist
    expect(hookFiles).toContain('useTimerLogic.ts');
    expect(hookFiles).toContain('useTimerSound.ts');
  });

  /**
   * **Feature: expansion-ready-refactoring, Property 4: Pastas refatoradas têm README**
   * **Validates: Requirements 10.3, 11.1**
   */
  it('should have README.md in unified-timer folder', () => {
    const readmePath = path.join(UNIFIED_TIMER_FOLDER, 'README.md');
    expect(fs.existsSync(readmePath)).toBe(true);
    
    const content = fs.readFileSync(readmePath, 'utf-8');
    expect(content.length).toBeGreaterThan(100); // Should have meaningful content
    console.log(`✓ README.md exists with ${content.length} characters`);
  });

  /**
   * **Feature: expansion-ready-refactoring, Property 5: Imports usam @/ alias**
   * **Validates: Requirements 10.4**
   */
  it('should not have deep relative imports (../../..)', () => {
    const getAllFiles = (dir: string): string[] => {
      const files: string[] = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...getAllFiles(fullPath));
        } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
      return files;
    };

    const files = getAllFiles(UNIFIED_TIMER_FOLDER);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      // Check for deep relative imports (3+ levels up)
      const deepImports = content.match(/from ['"]\.\.\/\.\.\/\.\.\//g);
      expect(deepImports).toBeNull();
    });
    
    console.log(`✓ No deep relative imports found in ${files.length} files`);
  });

  /**
   * **Feature: expansion-ready-refactoring, Property 6: Cores semânticas são usadas**
   * **Validates: Requirements 10.5**
   */
  it('should use semantic colors instead of hardcoded white/black', () => {
    const getAllFiles = (dir: string): string[] => {
      const files: string[] = [];
      const items = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...getAllFiles(fullPath));
        } else if (item.name.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
      return files;
    };

    const files = getAllFiles(UNIFIED_TIMER_FOLDER);
    
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      // Check for hardcoded bg-white or text-black (but allow text-white for contrast)
      const hardcodedBgWhite = content.match(/className="[^"]*\bbg-white\b[^"]*"/g);
      const hardcodedTextBlack = content.match(/className="[^"]*\btext-black\b[^"]*"/g);
      
      expect(hardcodedBgWhite).toBeNull();
      expect(hardcodedTextBlack).toBeNull();
    });
    
    console.log(`✓ No hardcoded bg-white/text-black found in ${files.length} files`);
  });

  /**
   * **Feature: expansion-ready-refactoring, Property: Estrutura de arquivos completa**
   * **Validates: Requirements 5.1-5.7**
   */
  it('should have complete file structure as per requirements', () => {
    const expectedFiles = [
      'index.tsx',
      'TimerDisplay.tsx',
      'TimerControls.tsx',
      'TimerPresets.tsx',
      'MotivationalMessage.tsx',
      'README.md',
      'hooks/useTimerLogic.ts',
      'hooks/useTimerSound.ts',
    ];

    expectedFiles.forEach(file => {
      const filePath = path.join(UNIFIED_TIMER_FOLDER, file);
      expect(fs.existsSync(filePath)).toBe(true);
      console.log(`✓ ${file} exists`);
    });
  });

  /**
   * **Feature: expansion-ready-refactoring, Property: Exports de compatibilidade**
   * **Validates: Requirements 5.9, 10.6**
   */
  it('should export compatibility aliases (RestTimer, InlineRestTimer, etc)', () => {
    const indexPath = path.join(UNIFIED_TIMER_FOLDER, 'index.tsx');
    const content = fs.readFileSync(indexPath, 'utf-8');

    // Check for compatibility exports
    expect(content).toContain('export const RestTimer');
    expect(content).toContain('export const InlineRestTimer');
    expect(content).toContain('export const CompactTimer');
    expect(content).toContain('export const MiniTimer');
    expect(content).toContain('export default UnifiedTimer');
    
    console.log('✓ All compatibility exports present');
  });

  /**
   * **Feature: expansion-ready-refactoring, Property: Variant support**
   * **Validates: Requirements 5.9**
   */
  it('should support all 4 variants (full, compact, inline, mini)', () => {
    const indexPath = path.join(UNIFIED_TIMER_FOLDER, 'index.tsx');
    const content = fs.readFileSync(indexPath, 'utf-8');

    // Check for variant handling
    expect(content).toContain("variant === 'mini'");
    expect(content).toContain("variant === 'compact'");
    expect(content).toContain("variant === 'inline'");
    // 'full' is the default, so it's handled by the final return
    
    console.log('✓ All 4 variants are supported');
  });
});
