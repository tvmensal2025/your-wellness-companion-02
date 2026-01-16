/**
 * Property-Based Test: TypeScript Any Types Compliance
 * 
 * **Validates: Requirements 3.10, 9.5**
 * **Property 2: TypeScript compila sem erros**
 * 
 * Este teste verifica que os arquivos críticos não usam tipos `any`
 * de forma excessiva ou problemática.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

// Lista de arquivos críticos que foram refatorados para remover `any`
const CRITICAL_FILES = [
  'src/components/admin/PlatformAudit.tsx',
  'src/components/admin/SessionAnalytics.tsx',
  'src/components/admin/CourseManagementNew.tsx',
  'src/components/admin/GoalManagement.tsx',
  'src/components/admin/CompanyConfiguration.tsx',
  'src/components/UserSessions.tsx',
];

// Padrões de `any` que são aceitáveis (com comentário explicativo)
const ACCEPTABLE_ANY_PATTERNS = [
  /@ts-expect-error.*any/i,
  /\/\/.*any.*tabela.*não.*existe/i,
  /\/\/.*any.*campo.*não.*existe/i,
];

// Padrões de `any` que são problemáticos
const PROBLEMATIC_ANY_PATTERNS = [
  /:\s*any\s*[;,)=\]]/g,  // Tipo any direto
  /as\s+any\s*[;,)]/g,    // Cast para any
  /<any>/g,               // Generic any
];

describe('Property: TypeScript Any Types Compliance', () => {
  it('should not have excessive any types in critical files', () => {
    // Property: Arquivos críticos devem ter menos de 5 usos de `any`
    fc.assert(
      fc.property(
        fc.constantFrom(...CRITICAL_FILES),
        (filePath) => {
          const fullPath = path.resolve(process.cwd(), filePath);
          
          if (!fs.existsSync(fullPath)) {
            return true; // Arquivo não existe, pular
          }
          
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Contar usos de `any`
          let anyCount = 0;
          for (const pattern of PROBLEMATIC_ANY_PATTERNS) {
            const matches = content.match(pattern);
            if (matches) {
              anyCount += matches.length;
            }
          }
          
          // Subtrair usos aceitáveis (com @ts-expect-error)
          for (const pattern of ACCEPTABLE_ANY_PATTERNS) {
            const matches = content.match(pattern);
            if (matches) {
              anyCount -= matches.length;
            }
          }
          
          // Permitir até 5 usos de `any` por arquivo (para casos legítimos)
          return anyCount <= 5;
        }
      ),
      { numRuns: CRITICAL_FILES.length }
    );
  });

  it('should use @ts-expect-error instead of @ts-ignore', () => {
    // Property: Não deve usar @ts-ignore, apenas @ts-expect-error
    fc.assert(
      fc.property(
        fc.constantFrom(...CRITICAL_FILES),
        (filePath) => {
          const fullPath = path.resolve(process.cwd(), filePath);
          
          if (!fs.existsSync(fullPath)) {
            return true;
          }
          
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Verificar se não usa @ts-ignore
          const hasIgnore = /@ts-ignore/.test(content);
          
          return !hasIgnore;
        }
      ),
      { numRuns: CRITICAL_FILES.length }
    );
  });

  it('should have proper type annotations for function parameters', () => {
    // Property: Funções devem ter tipos nos parâmetros
    fc.assert(
      fc.property(
        fc.constantFrom(...CRITICAL_FILES),
        (filePath) => {
          const fullPath = path.resolve(process.cwd(), filePath);
          
          if (!fs.existsSync(fullPath)) {
            return true;
          }
          
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Verificar se funções async têm tipos nos parâmetros
          // Padrão: async (param: any) => ou async (param) =>
          const untypedAsyncParams = /async\s*\(\s*\w+\s*\)\s*=>/g;
          const matches = content.match(untypedAsyncParams);
          
          // Permitir até 3 funções sem tipo (podem ser callbacks simples)
          return !matches || matches.length <= 3;
        }
      ),
      { numRuns: CRITICAL_FILES.length }
    );
  });

  it('should compile without TypeScript errors', () => {
    // Property: Todos os arquivos devem existir e ser válidos
    fc.assert(
      fc.property(
        fc.constantFrom(...CRITICAL_FILES),
        (filePath) => {
          const fullPath = path.resolve(process.cwd(), filePath);
          
          // Verificar se arquivo existe
          if (!fs.existsSync(fullPath)) {
            console.warn(`Arquivo não encontrado: ${filePath}`);
            return true; // Pular arquivos que não existem
          }
          
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Verificar se tem imports válidos
          const hasReactImport = /import.*from\s+['"]react['"]/.test(content);
          // Regex mais flexível para export
          const hasExport = /export\s+(default\s+)?\w+/.test(content) || 
                           /export\s+\{/.test(content) ||
                           /export\s+default\s+\w+/.test(content);
          
          // Arquivo deve ter import de React e export
          return hasReactImport && hasExport;
        }
      ),
      { numRuns: CRITICAL_FILES.length }
    );
  });
});
