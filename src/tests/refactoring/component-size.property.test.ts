/**
 * Property-Based Test: Component Size Validation
 * 
 * Feature: maxnutrition-refactoring
 * Property 3: Nenhum componente excede 500 linhas
 * Validates: Requirements 1.1, 9.2
 * 
 * This test verifies that all React component files (.tsx) in the src/components
 * directory do not exceed 500 lines of code, ensuring maintainability and
 * adherence to the refactoring requirements.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to recursively get all .tsx files in a directory
function getAllTsxFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, and other build directories
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'dev-dist') {
        getAllTsxFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Helper function to count lines in a file
function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

describe('Component Size Property Tests', () => {
  const componentsDir = path.join(process.cwd(), 'src', 'components');
  const MAX_LINES = 500;

  it('Property 3: No component should exceed 500 lines', () => {
    const tsxFiles = getAllTsxFiles(componentsDir);
    
    expect(tsxFiles.length).toBeGreaterThan(0); // Ensure we found some files

    const violations: Array<{ file: string; lines: number }> = [];

    tsxFiles.forEach(file => {
      const lineCount = countLines(file);
      
      if (lineCount > MAX_LINES) {
        const relativePath = path.relative(process.cwd(), file);
        violations.push({ file: relativePath, lines: lineCount });
      }
    });

    // If there are violations, create a detailed error message
    if (violations.length > 0) {
      const violationDetails = violations
        .map(v => `  - ${v.file}: ${v.lines} lines (exceeds by ${v.lines - MAX_LINES})`)
        .join('\n');

      throw new Error(
        `Found ${violations.length} component(s) exceeding ${MAX_LINES} lines:\n${violationDetails}\n\n` +
        `These components should be refactored into smaller, more focused components.`
      );
    }

    // If we get here, all components are within the limit
    expect(violations.length).toBe(0);
  });

  it('should report statistics about component sizes', () => {
    const tsxFiles = getAllTsxFiles(componentsDir);
    const lineCounts = tsxFiles.map(file => ({
      file: path.relative(process.cwd(), file),
      lines: countLines(file)
    }));

    // Calculate statistics
    const totalLines = lineCounts.reduce((sum, f) => sum + f.lines, 0);
    const avgLines = Math.round(totalLines / lineCounts.length);
    const maxFile = lineCounts.reduce((max, f) => f.lines > max.lines ? f : max, lineCounts[0]);
    const minFile = lineCounts.reduce((min, f) => f.lines < min.lines ? f : min, lineCounts[0]);

    // Log statistics (will appear in test output)
    console.log('\n📊 Component Size Statistics:');
    console.log(`  Total components: ${lineCounts.length}`);
    console.log(`  Average lines: ${avgLines}`);
    console.log(`  Largest: ${maxFile.file} (${maxFile.lines} lines)`);
    console.log(`  Smallest: ${minFile.file} (${minFile.lines} lines)`);
    console.log(`  Components over ${MAX_LINES} lines: ${lineCounts.filter(f => f.lines > MAX_LINES).length}`);

    // This test always passes - it's just for reporting
    expect(lineCounts.length).toBeGreaterThan(0);
  });

  it('should identify the largest components for potential refactoring', () => {
    const tsxFiles = getAllTsxFiles(componentsDir);
    const lineCounts = tsxFiles.map(file => ({
      file: path.relative(process.cwd(), file),
      lines: countLines(file)
    }));

    // Get top 10 largest components
    const largestComponents = lineCounts
      .sort((a, b) => b.lines - a.lines)
      .slice(0, 10);

    console.log('\n🔍 Top 10 Largest Components:');
    largestComponents.forEach((comp, idx) => {
      const status = comp.lines > MAX_LINES ? '❌' : '✅';
      console.log(`  ${idx + 1}. ${status} ${comp.file}: ${comp.lines} lines`);
    });

    // This test always passes - it's just for reporting
    expect(largestComponents.length).toBeGreaterThan(0);
  });

  it('should verify refactored components are within limits', () => {
    // List of components that were specifically refactored in this task
    const refactoredComponents = [
      'src/components/meal-plan/ultra-creative-layouts-v2/layouts/MusicPlayerLayout.tsx',
      'src/components/meal-plan/ultra-creative-layouts-v2/layouts/ZenNatureLayout.tsx',
      'src/components/meal-plan/ultra-creative-layouts-v2/layouts/CinemaLayout.tsx',
      'src/components/meal-plan/ultra-creative-layouts-v2/layouts/AdventureMapLayout.tsx',
      'src/components/meal-plan/ultra-creative-layouts-v2/layouts/SmartphoneLayout.tsx',
      'src/components/meal-plan/ultra-creative-layouts-v2/layouts/LuxuryLayout.tsx',
      'src/components/admin/course-management/StatsCards.tsx',
      'src/components/admin/course-management/Breadcrumb.tsx',
      'src/components/dashboard/medical-documents/DocumentStatsCards.tsx',
      'src/components/dashboard/medical-documents/DocumentFilters.tsx',
      'src/components/dashboard/medical-documents/DocumentCard.tsx',
      'src/components/saboteur-test/QuestionStep.tsx',
      'src/components/saboteur-test/ResultsStep.tsx',
      'src/components/sofia/chat/ChatHeader.tsx',
      'src/components/sofia/chat/MessageList.tsx',
      'src/components/sofia/chat/MessageInput.tsx',
      'src/components/sofia/SofiaChat.tsx',
    ];

    const violations: Array<{ file: string; lines: number }> = [];

    refactoredComponents.forEach(componentPath => {
      const fullPath = path.join(process.cwd(), componentPath);
      
      if (fs.existsSync(fullPath)) {
        const lineCount = countLines(fullPath);
        
        if (lineCount > MAX_LINES) {
          violations.push({ file: componentPath, lines: lineCount });
        }
      }
    });

    if (violations.length > 0) {
      const violationDetails = violations
        .map(v => `  - ${v.file}: ${v.lines} lines`)
        .join('\n');

      throw new Error(
        `Refactored components should not exceed ${MAX_LINES} lines:\n${violationDetails}`
      );
    }

    expect(violations.length).toBe(0);
  });
});
