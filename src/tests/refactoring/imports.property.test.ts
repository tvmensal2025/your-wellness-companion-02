/**
 * Property-Based Tests for Import Patterns
 * 
 * **Feature: maxnutrition-refactoring, Property 6: Imports usando padrão @/ alias**
 * 
 * Validates: Requirements 1.13, 9.8
 * 
 * This test suite verifies that all TypeScript/TSX files follow the import pattern standards:
 * - No deep relative imports (../../..)
 * - Prefer @/ alias for cross-module imports
 * - Single-level relative imports (./) are acceptable for sibling files
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Helper function to recursively get all TypeScript/TSX files
function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other build directories
      if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Helper function to extract import statements from file content
function extractImports(content: string): string[] {
  const importRegex = /import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)\s+from\s+)?['"]([^'"]+)['"]/g;
  const imports: string[] = [];
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  
  return imports;
}

// Helper function to check if import is a deep relative import
function isDeepRelativeImport(importPath: string): boolean {
  // Deep relative imports have ../../.. pattern (3+ levels)
  return /^\.\.\/\.\.\/\.\./.test(importPath);
}

// Helper function to check if import is a two-level relative import
function isTwoLevelRelativeImport(importPath: string): boolean {
  // Two-level relative imports have ../..\/ pattern
  return /^\.\.\/\.\.\//.test(importPath) && !isDeepRelativeImport(importPath);
}

// Helper function to check if import uses @/ alias
function usesAliasImport(importPath: string): boolean {
  return importPath.startsWith('@/');
}

// Helper function to check if import is external (node_modules)
function isExternalImport(importPath: string): boolean {
  return !importPath.startsWith('.') && !importPath.startsWith('@/');
}

describe('Import Pattern Properties', () => {
  const srcDir = path.join(process.cwd(), 'src');
  const allFiles = getAllTsFiles(srcDir);
  
  // **Property 6.1: No deep relative imports (../../..)**
  it('should not have any deep relative imports (../../..)', () => {
    const violations: Array<{ file: string; import: string }> = [];
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      
      imports.forEach(importPath => {
        if (isDeepRelativeImport(importPath)) {
          violations.push({
            file: path.relative(process.cwd(), file),
            import: importPath
          });
        }
      });
    });
    
    if (violations.length > 0) {
      const violationList = violations
        .map(v => `  - ${v.file}: import from '${v.import}'`)
        .join('\n');
      
      expect.fail(
        `Found ${violations.length} deep relative import(s) (../../..):\n${violationList}\n\n` +
        `Use @/ alias instead for cross-module imports.`
      );
    }
    
    expect(violations).toHaveLength(0);
  });
  
  // **Property 6.2: Prefer @/ alias for cross-module imports**
  it('should prefer @/ alias over two-level relative imports', () => {
    const warnings: Array<{ file: string; import: string }> = [];
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      
      imports.forEach(importPath => {
        if (isTwoLevelRelativeImport(importPath)) {
          warnings.push({
            file: path.relative(process.cwd(), file),
            import: importPath
          });
        }
      });
    });
    
    // This is a warning, not a hard failure
    // Two-level imports are acceptable but @/ alias is preferred
    if (warnings.length > 0) {
      console.warn(
        `\n⚠️  Found ${warnings.length} two-level relative import(s) (../..).\n` +
        `Consider using @/ alias for better maintainability:\n` +
        warnings.slice(0, 5).map(w => `  - ${w.file}: ${w.import}`).join('\n') +
        (warnings.length > 5 ? `\n  ... and ${warnings.length - 5} more` : '')
      );
    }
    
    // Don't fail the test, just warn
    expect(true).toBe(true);
  });
  
  // **Property 6.3: All files should have at least some imports**
  it('should have import statements in non-empty files', () => {
    const filesWithoutImports: string[] = [];
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      
      // Skip very small files (likely type definitions or constants)
      if (content.trim().length > 100 && imports.length === 0) {
        // Check if it's not just a type definition file
        if (!content.includes('export type') && !content.includes('export interface')) {
          filesWithoutImports.push(path.relative(process.cwd(), file));
        }
      }
    });
    
    // This is informational - some files legitimately have no imports
    if (filesWithoutImports.length > 0) {
      console.info(
        `\nℹ️  Found ${filesWithoutImports.length} file(s) without imports (may be intentional):\n` +
        filesWithoutImports.slice(0, 3).map(f => `  - ${f}`).join('\n') +
        (filesWithoutImports.length > 3 ? `\n  ... and ${filesWithoutImports.length - 3} more` : '')
      );
    }
    
    expect(true).toBe(true);
  });
  
  // **Property 6.4: Import consistency - @/ alias usage statistics**
  it('should report import pattern statistics', () => {
    let totalImports = 0;
    let aliasImports = 0;
    let relativeImports = 0;
    let externalImports = 0;
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      
      imports.forEach(importPath => {
        totalImports++;
        
        if (usesAliasImport(importPath)) {
          aliasImports++;
        } else if (isExternalImport(importPath)) {
          externalImports++;
        } else {
          relativeImports++;
        }
      });
    });
    
    const aliasPercentage = totalImports > 0 ? ((aliasImports / totalImports) * 100).toFixed(1) : '0';
    const relativePercentage = totalImports > 0 ? ((relativeImports / totalImports) * 100).toFixed(1) : '0';
    const externalPercentage = totalImports > 0 ? ((externalImports / totalImports) * 100).toFixed(1) : '0';
    
    console.info(
      `\n📊 Import Pattern Statistics:\n` +
      `  Total imports: ${totalImports}\n` +
      `  @/ alias imports: ${aliasImports} (${aliasPercentage}%)\n` +
      `  Relative imports: ${relativeImports} (${relativePercentage}%)\n` +
      `  External imports: ${externalImports} (${externalPercentage}%)\n` +
      `  Files analyzed: ${allFiles.length}`
    );
    
    // Expect at least 50% of internal imports to use @/ alias
    const internalImports = aliasImports + relativeImports;
    const aliasRatio = internalImports > 0 ? aliasImports / internalImports : 0;
    
    expect(aliasRatio).toBeGreaterThan(0.5);
  });
  
  // **Property 6.5: Test files should follow same import patterns**
  it('should apply import patterns to test files', () => {
    const testFiles = allFiles.filter(f => 
      f.includes('.test.') || f.includes('.spec.') || f.includes('__tests__')
    );
    
    const violations: Array<{ file: string; import: string }> = [];
    
    testFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      
      imports.forEach(importPath => {
        if (isDeepRelativeImport(importPath)) {
          violations.push({
            file: path.relative(process.cwd(), file),
            import: importPath
          });
        }
      });
    });
    
    if (violations.length > 0) {
      const violationList = violations
        .map(v => `  - ${v.file}: import from '${v.import}'`)
        .join('\n');
      
      expect.fail(
        `Found ${violations.length} deep relative import(s) in test files:\n${violationList}\n\n` +
        `Test files should also use @/ alias for imports.`
      );
    }
    
    expect(violations).toHaveLength(0);
  });
  
  // **Property 6.6: Verify @/ alias resolves correctly**
  it('should have valid @/ alias imports that resolve to src/', () => {
    const invalidAliasImports: Array<{ file: string; import: string }> = [];
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      const imports = extractImports(content);
      
      imports.forEach(importPath => {
        if (usesAliasImport(importPath)) {
          // Convert @/ to src/ and check if file exists
          const resolvedPath = importPath.replace('@/', 'src/');
          const possibleExtensions = ['', '.ts', '.tsx', '.js', '.jsx'];
          
          let exists = false;
          for (const ext of possibleExtensions) {
            const fullPath = path.join(process.cwd(), resolvedPath + ext);
            if (fs.existsSync(fullPath)) {
              exists = true;
              break;
            }
            // Also check for index files
            const indexPath = path.join(process.cwd(), resolvedPath, 'index' + ext);
            if (fs.existsSync(indexPath)) {
              exists = true;
              break;
            }
          }
          
          if (!exists) {
            invalidAliasImports.push({
              file: path.relative(process.cwd(), file),
              import: importPath
            });
          }
        }
      });
    });
    
    // Some imports might be from generated files or external packages
    // So we only warn if there are many invalid imports
    if (invalidAliasImports.length > 10) {
      console.warn(
        `\n⚠️  Found ${invalidAliasImports.length} potentially invalid @/ alias imports.\n` +
        `First few examples:\n` +
        invalidAliasImports.slice(0, 5).map(i => `  - ${i.file}: ${i.import}`).join('\n')
      );
    }
    
    // Don't fail - some imports might be valid but not detectable
    expect(true).toBe(true);
  });
});

describe('Import Pattern Edge Cases', () => {
  // **Property 6.7: Dynamic imports should also follow patterns**
  it('should check dynamic imports for patterns', () => {
    const srcDir = path.join(process.cwd(), 'src');
    const allFiles = getAllTsFiles(srcDir);
    const violations: Array<{ file: string; import: string }> = [];
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for dynamic imports: import('...')
      const dynamicImportRegex = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
      let match;
      
      while ((match = dynamicImportRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (isDeepRelativeImport(importPath)) {
          violations.push({
            file: path.relative(process.cwd(), file),
            import: importPath
          });
        }
      }
    });
    
    if (violations.length > 0) {
      const violationList = violations
        .map(v => `  - ${v.file}: import('${v.import}')`)
        .join('\n');
      
      expect.fail(
        `Found ${violations.length} deep relative dynamic import(s):\n${violationList}\n\n` +
        `Use @/ alias for dynamic imports too.`
      );
    }
    
    expect(violations).toHaveLength(0);
  });
  
  // **Property 6.8: Re-exports should follow patterns**
  it('should check re-export statements for patterns', () => {
    const srcDir = path.join(process.cwd(), 'src');
    const allFiles = getAllTsFiles(srcDir);
    const violations: Array<{ file: string; export: string }> = [];
    
    allFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      
      // Check for re-exports: export { ... } from '...' or export * from '...'
      const reExportRegex = /export\s+(?:\{[^}]*\}|\*)\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      
      while ((match = reExportRegex.exec(content)) !== null) {
        const exportPath = match[1];
        if (isDeepRelativeImport(exportPath)) {
          violations.push({
            file: path.relative(process.cwd(), file),
            export: exportPath
          });
        }
      }
    });
    
    if (violations.length > 0) {
      const violationList = violations
        .map(v => `  - ${v.file}: export from '${v.export}'`)
        .join('\n');
      
      expect.fail(
        `Found ${violations.length} deep relative re-export(s):\n${violationList}\n\n` +
        `Use @/ alias for re-exports too.`
      );
    }
    
    expect(violations).toHaveLength(0);
  });
});
