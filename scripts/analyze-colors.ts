/**
 * Script de análise de cores hardcoded no projeto
 * Identifica e reporta uso de cores que não se adaptam ao tema
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';
import { colorMapping, isAllowedColor, getColorType, getSuggestedColor } from '../src/lib/color-mapping';

export interface ColorIssue {
  file: string;
  line: number;
  column: number;
  hardcodedClass: string;
  suggestedClass: string;
  priority: 'high' | 'medium' | 'low';
  type: 'text' | 'background' | 'border' | 'other';
  context: string;
}

export interface ColorAnalysisReport {
  totalFiles: number;
  totalIssues: number;
  issuesByPriority: {
    high: number;
    medium: number;
    low: number;
  };
  issuesByType: {
    text: number;
    background: number;
    border: number;
    other: number;
  };
  filesMostAffected: Array<{
    file: string;
    issueCount: number;
  }>;
  issues: ColorIssue[];
  timestamp: string;
}

/**
 * Determina a prioridade de um problema baseado no arquivo e classe
 */
function getPriority(file: string, className: string): 'high' | 'medium' | 'low' {
  // Páginas principais = alta prioridade
  if (file.includes('/pages/')) return 'high';
  
  // Componentes UI base = alta prioridade
  if (file.includes('/components/ui/')) return 'high';
  
  // Texto branco/preto = alta prioridade (mais problemático)
  if (className.includes('white') || className.includes('black')) return 'high';
  
  // Componentes de features = média prioridade
  if (file.includes('/components/')) return 'medium';
  
  // Resto = baixa prioridade
  return 'low';
}

/**
 * Analisa um arquivo em busca de cores hardcoded
 */
async function analyzeFile(filePath: string): Promise<ColorIssue[]> {
  const content = await readFile(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues: ColorIssue[] = [];

  // Padrões para detectar classes hardcoded
  const hardcodedPatterns = [
    /\b(text-(white|black|slate-\d+|gray-\d+))\b/g,
    /\b(bg-(white|black|slate-\d+|gray-\d+))\b/g,
    /\b(border-(slate-\d+|gray-\d+))\b/g,
  ];

  lines.forEach((line, lineIndex) => {
    hardcodedPatterns.forEach((pattern) => {
      let match;
      const regex = new RegExp(pattern);
      
      while ((match = regex.exec(line)) !== null) {
        const className = match[1];
        
        // Pular se for uma cor permitida (exceção)
        if (isAllowedColor(className)) {
          continue;
        }

        const suggested = getSuggestedColor(className);
        
        if (suggested) {
          issues.push({
            file: filePath,
            line: lineIndex + 1,
            column: match.index + 1,
            hardcodedClass: className,
            suggestedClass: suggested,
            priority: getPriority(filePath, className),
            type: getColorType(className),
            context: line.trim().substring(0, 100),
          });
        }
      }
    });
  });

  return issues;
}

/**
 * Função auxiliar para buscar arquivos recursivamente
 */
async function findFiles(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  
  async function walk(currentDir: string) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        // Ignorar node_modules e outras pastas
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          await walk(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = extname(entry.name);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  }
  
  await walk(dir);
  return files;
}

/**
 * Analisa todos os arquivos do projeto
 */
export async function analyzeColors(): Promise<ColorAnalysisReport> {
  console.log('🔍 Analisando cores hardcoded no projeto...\n');

  const files = await findFiles('src', ['.tsx', '.ts', '.jsx', '.js']);

  console.log(`📁 Encontrados ${files.length} arquivos para analisar\n`);

  const allIssues: ColorIssue[] = [];

  for (const file of files) {
    const issues = await analyzeFile(file);
    allIssues.push(...issues);
  }

  // Agrupar por arquivo
  const issuesByFile = new Map<string, number>();
  allIssues.forEach((issue) => {
    issuesByFile.set(issue.file, (issuesByFile.get(issue.file) || 0) + 1);
  });

  // Ordenar arquivos por número de problemas
  const filesMostAffected = Array.from(issuesByFile.entries())
    .map(([file, count]) => ({ file, issueCount: count }))
    .sort((a, b) => b.issueCount - a.issueCount)
    .slice(0, 10);

  // Contar por prioridade
  const issuesByPriority = {
    high: allIssues.filter((i) => i.priority === 'high').length,
    medium: allIssues.filter((i) => i.priority === 'medium').length,
    low: allIssues.filter((i) => i.priority === 'low').length,
  };

  // Contar por tipo
  const issuesByType = {
    text: allIssues.filter((i) => i.type === 'text').length,
    background: allIssues.filter((i) => i.type === 'background').length,
    border: allIssues.filter((i) => i.type === 'border').length,
    other: allIssues.filter((i) => i.type === 'other').length,
  };

  const report: ColorAnalysisReport = {
    totalFiles: files.length,
    totalIssues: allIssues.length,
    issuesByPriority,
    issuesByType,
    filesMostAffected,
    issues: allIssues,
    timestamp: new Date().toISOString(),
  };

  return report;
}

/**
 * Gera relatório em formato legível
 */
export function generateReport(report: ColorAnalysisReport): string {
  let output = '# Relatório de Análise de Cores\n\n';
  output += `**Data:** ${new Date(report.timestamp).toLocaleString('pt-BR')}\n\n`;
  output += `## Resumo\n\n`;
  output += `- **Total de arquivos analisados:** ${report.totalFiles}\n`;
  output += `- **Total de problemas encontrados:** ${report.totalIssues}\n\n`;

  output += `### Por Prioridade\n\n`;
  output += `- 🔴 Alta: ${report.issuesByPriority.high}\n`;
  output += `- 🟡 Média: ${report.issuesByPriority.medium}\n`;
  output += `- 🟢 Baixa: ${report.issuesByPriority.low}\n\n`;

  output += `### Por Tipo\n\n`;
  output += `- Texto: ${report.issuesByType.text}\n`;
  output += `- Fundo: ${report.issuesByType.background}\n`;
  output += `- Borda: ${report.issuesByType.border}\n`;
  output += `- Outro: ${report.issuesByType.other}\n\n`;

  output += `## Arquivos Mais Afetados\n\n`;
  report.filesMostAffected.forEach((item, index) => {
    output += `${index + 1}. **${item.file}** - ${item.issueCount} problemas\n`;
  });

  output += `\n## Detalhes dos Problemas\n\n`;
  
  // Agrupar por arquivo
  const byFile = new Map<string, ColorIssue[]>();
  report.issues.forEach((issue) => {
    if (!byFile.has(issue.file)) {
      byFile.set(issue.file, []);
    }
    byFile.get(issue.file)!.push(issue);
  });

  // Ordenar por prioridade
  const sortedFiles = Array.from(byFile.entries()).sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const aPriority = Math.min(...a[1].map(i => priorityOrder[i.priority]));
    const bPriority = Math.min(...b[1].map(i => priorityOrder[i.priority]));
    return aPriority - bPriority;
  });

  sortedFiles.forEach(([file, issues]) => {
    output += `### ${file}\n\n`;
    issues.forEach((issue) => {
      const priorityEmoji = issue.priority === 'high' ? '🔴' : issue.priority === 'medium' ? '🟡' : '🟢';
      output += `${priorityEmoji} **Linha ${issue.line}:** \`${issue.hardcodedClass}\` → \`${issue.suggestedClass}\`\n`;
      output += `   \`\`\`\n   ${issue.context}\n   \`\`\`\n\n`;
    });
  });

  return output;
}

/**
 * Executa análise e salva relatório
 */
async function main() {
  try {
    const report = await analyzeColors();
    const reportText = generateReport(report);

    // Salvar relatório
    await writeFile('color-analysis-report.md', reportText);
    await writeFile('color-analysis-report.json', JSON.stringify(report, null, 2));

    console.log('✅ Análise concluída!\n');
    console.log(`📊 Total de problemas: ${report.totalIssues}`);
    console.log(`🔴 Alta prioridade: ${report.issuesByPriority.high}`);
    console.log(`🟡 Média prioridade: ${report.issuesByPriority.medium}`);
    console.log(`🟢 Baixa prioridade: ${report.issuesByPriority.low}\n`);
    console.log('📄 Relatórios salvos:');
    console.log('   - color-analysis-report.md');
    console.log('   - color-analysis-report.json\n');
  } catch (error) {
    console.error('❌ Erro ao analisar cores:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}
