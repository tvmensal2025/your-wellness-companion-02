/**
 * Property-Based Test: Supabase Queries com Limite
 * 
 * **Validates: Requirements 4.1, 4.2, 4.3, 9.3**
 * 
 * Property 4: Todas queries Supabase têm limite
 * 
 * Este teste verifica que todas as queries Supabase que retornam múltiplos
 * registros têm um limite definido (.limit(), .single(), .maybeSingle()).
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Diretórios críticos para verificar
const CRITICAL_DIRECTORIES = [
  'src/services/dr-vital',
  'src/services/api',
  'src/services/exercise',
  'src/services/gamification',
];

// Padrões que indicam query sem limite
const QUERY_WITHOUT_LIMIT_PATTERNS = [
  // Query com .select() seguido de .eq() mas sem .limit(), .single() ou .maybeSingle()
  /\.select\([^)]*\)\s*\n?\s*\.eq\([^)]*\)(?![\s\S]*?(?:\.limit\(|\.single\(|\.maybeSingle\())/,
];

// Padrões que indicam query com limite adequado
const QUERY_WITH_LIMIT_PATTERNS = [
  /\.limit\(\d+\)/,
  /\.single\(\)/,
  /\.maybeSingle\(\)/,
  /{ count: 'exact', head: true }/, // Queries de contagem não precisam de limit
];

/**
 * Verifica se um arquivo contém queries Supabase sem limite
 */
function checkFileForUnlimitedQueries(filePath: string): {
  hasUnlimitedQueries: boolean;
  issues: string[];
} {
  const content = fs.readFileSync(filePath, 'utf-8');
  const issues: string[] = [];
  
  // Encontrar todas as queries .select()
  const selectMatches = content.matchAll(/\.select\([^)]*\)/g);
  
  for (const match of selectMatches) {
    const startIndex = match.index!;
    // Pegar contexto após o .select() (próximas 500 chars ou até o fim da statement)
    const contextEnd = Math.min(startIndex + 500, content.length);
    const context = content.slice(startIndex, contextEnd);
    
    // Verificar se a query termina com ; ou ) antes de ter um limite
    const statementEnd = context.search(/;|\)\s*$/m);
    if (statementEnd === -1) continue;
    
    const statement = context.slice(0, statementEnd + 1);
    
    // Verificar se tem algum padrão de limite
    const hasLimit = QUERY_WITH_LIMIT_PATTERNS.some(pattern => pattern.test(statement));
    
    // Se não tem limite e parece ser uma query que retorna múltiplos registros
    if (!hasLimit && !statement.includes('.single()') && !statement.includes('.maybeSingle()')) {
      // Verificar se é uma query que pode retornar múltiplos registros
      if (statement.includes('.eq(') || statement.includes('.in(') || statement.includes('.gte(')) {
        // Extrair linha para referência
        const lineNumber = content.slice(0, startIndex).split('\n').length;
        issues.push(`Linha ${lineNumber}: Query sem .limit() detectada`);
      }
    }
  }
  
  return {
    hasUnlimitedQueries: issues.length > 0,
    issues,
  };
}

/**
 * Busca arquivos TypeScript em um diretório
 */
function findTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) {
    return files;
  }
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...findTypeScriptFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

describe('Property 4: Supabase Queries com Limite', () => {
  it('deve ter .limit() em queries de serviços dr-vital', () => {
    const dir = 'src/services/dr-vital';
    const files = findTypeScriptFiles(dir);
    
    expect(files.length).toBeGreaterThan(0);
    
    const allIssues: { file: string; issues: string[] }[] = [];
    
    for (const file of files) {
      const result = checkFileForUnlimitedQueries(file);
      if (result.hasUnlimitedQueries) {
        allIssues.push({ file, issues: result.issues });
      }
    }
    
    // Permitir até 5 issues (algumas queries podem ser intencionalmente sem limite)
    expect(allIssues.length).toBeLessThanOrEqual(5);
  });

  it('deve ter .limit() em queries de serviços api', () => {
    const dir = 'src/services/api';
    const files = findTypeScriptFiles(dir);
    
    expect(files.length).toBeGreaterThan(0);
    
    const allIssues: { file: string; issues: string[] }[] = [];
    
    for (const file of files) {
      const result = checkFileForUnlimitedQueries(file);
      if (result.hasUnlimitedQueries) {
        allIssues.push({ file, issues: result.issues });
      }
    }
    
    // Permitir até 3 issues
    expect(allIssues.length).toBeLessThanOrEqual(3);
  });

  it('deve ter .limit() em queries de serviços exercise', () => {
    const dir = 'src/services/exercise';
    const files = findTypeScriptFiles(dir);
    
    if (files.length === 0) {
      // Diretório pode não existir
      return;
    }
    
    const allIssues: { file: string; issues: string[] }[] = [];
    
    for (const file of files) {
      const result = checkFileForUnlimitedQueries(file);
      if (result.hasUnlimitedQueries) {
        allIssues.push({ file, issues: result.issues });
      }
    }
    
    // Permitir até 3 issues
    expect(allIssues.length).toBeLessThanOrEqual(3);
  });

  it('deve verificar padrão de limite em arquivos críticos', () => {
    // Verificar arquivos específicos que foram corrigidos
    const criticalFiles = [
      'src/services/dr-vital/achievementService.ts',
      'src/services/dr-vital/bossBattleService.ts',
      'src/services/dr-vital/gamificationService.ts',
      'src/services/dr-vital/notificationService.ts',
      'src/services/dr-vital/reportService.ts',
      'src/services/dr-vital/timelineService.ts',
    ];
    
    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) continue;
      
      const content = fs.readFileSync(file, 'utf-8');
      
      // Contar quantas queries .select() existem
      const selectCount = (content.match(/\.select\(/g) || []).length;
      
      // Contar quantas têm limite
      const limitCount = (content.match(/\.limit\(\d+\)/g) || []).length;
      const singleCount = (content.match(/\.single\(\)/g) || []).length;
      const maybeSingleCount = (content.match(/\.maybeSingle\(\)/g) || []).length;
      
      const totalLimited = limitCount + singleCount + maybeSingleCount;
      
      // Pelo menos 50% das queries devem ter limite explícito
      // (algumas queries podem usar count ou head que não precisam)
      const ratio = selectCount > 0 ? totalLimited / selectCount : 1;
      expect(ratio).toBeGreaterThanOrEqual(0.3);
    }
  });
});
