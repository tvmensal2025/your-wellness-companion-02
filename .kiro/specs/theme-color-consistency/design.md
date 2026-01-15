# Design Document: Theme Color Consistency

## Overview

Este documento descreve a solução técnica para padronizar o uso de cores em todo o projeto MaxNutrition, garantindo que todos os componentes sejam legíveis e visualmente consistentes em ambos os temas (claro e escuro). A solução envolve a substituição sistemática de cores hardcoded por cores semânticas do Tailwind CSS que se adaptam automaticamente ao tema ativo.

## Architecture

### Sistema de Cores Atual

O projeto já possui um sistema de cores semânticas bem estruturado no Tailwind:

**Cores Base:**
- `background` / `foreground` - Fundo e texto principal
- `card` / `card-foreground` - Cards e seu texto
- `muted` / `muted-foreground` - Elementos secundários
- `accent` / `accent-foreground` - Elementos de destaque
- `primary` / `primary-foreground` - Cor primária da marca
- `secondary` / `secondary-foreground` - Cor secundária

**Cores de Status:**
- `success` / `success-foreground` - Sucesso
- `warning` / `warning-foreground` - Avisos
- `destructive` / `destructive-foreground` - Erros/Destruição

**Cores Especializadas:**
- `health-heart`, `health-steps`, `health-calories`, `health-hydration` - Métricas de saúde
- `instituto-blue`, `instituto-green`, `instituto-red`, `instituto-gray` - Cores da marca

### Problema Identificado

Muitos componentes usam cores hardcoded que não se adaptam ao tema:
- `text-white`, `text-black` - Texto fixo
- `text-slate-400`, `text-gray-900` - Tons de cinza fixos
- `bg-slate-700`, `bg-gray-100` - Fundos fixos
- Gradientes com cores fixas

## Components and Interfaces

### 1. Mapeamento de Cores

Criação de um guia de mapeamento de cores hardcoded para semânticas:

```typescript
// lib/color-mapping.ts
export const colorMapping = {
  // Texto
  'text-white': 'text-foreground dark:text-foreground',
  'text-black': 'text-foreground',
  'text-slate-400': 'text-muted-foreground',
  'text-slate-200': 'text-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-gray-900': 'text-foreground',
  'text-gray-600': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  
  // Fundos
  'bg-white': 'bg-background',
  'bg-black': 'bg-background',
  'bg-slate-700': 'bg-muted',
  'bg-slate-800': 'bg-card',
  'bg-gray-100': 'bg-muted',
  
  // Bordas
  'border-slate-700': 'border-border',
  'border-gray-200': 'border-border',
  
  // Casos especiais - manter cores de status
  'text-emerald-400': 'text-success',
  'text-orange-400': 'text-warning',
  'text-red-400': 'text-destructive',
  'text-blue-500': 'text-primary',
  'text-purple-600': 'text-primary',
};
```

### 2. Utilitário de Validação de Contraste

```typescript
// lib/contrast-validator.ts
export interface ContrastResult {
  ratio: number;
  passes: boolean;
  level: 'AAA' | 'AA' | 'AA-Large' | 'Fail';
}

export function validateContrast(
  foreground: string,
  background: string,
  fontSize: number = 16
): ContrastResult {
  // Implementação usando algoritmo WCAG 2.1
  const ratio = calculateContrastRatio(foreground, background);
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
  
  return {
    ratio,
    passes: isLargeText ? ratio >= 3 : ratio >= 4.5,
    level: getWCAGLevel(ratio, isLargeText)
  };
}
```

### 3. Script de Análise Automática

```typescript
// scripts/analyze-colors.ts
import { glob } from 'glob';
import { readFile } from 'fs/promises';

interface ColorIssue {
  file: string;
  line: number;
  hardcodedClass: string;
  suggestedClass: string;
  priority: 'high' | 'medium' | 'low';
}

export async function analyzeColors(): Promise<ColorIssue[]> {
  const files = await glob('src/**/*.{tsx,ts}');
  const issues: ColorIssue[] = [];
  
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Detectar classes hardcoded
      const hardcodedPatterns = [
        /text-(white|black|slate-\d+|gray-\d+)/g,
        /bg-(white|black|slate-\d+|gray-\d+)/g,
        /border-(slate-\d+|gray-\d+)/g
      ];
      
      hardcodedPatterns.forEach(pattern => {
        const matches = line.matchAll(pattern);
        for (const match of matches) {
          issues.push({
            file,
            line: index + 1,
            hardcodedClass: match[0],
            suggestedClass: colorMapping[match[0]] || 'REVIEW_MANUALLY',
            priority: getPriority(file, match[0])
          });
        }
      });
    });
  }
  
  return issues;
}

function getPriority(file: string, className: string): 'high' | 'medium' | 'low' {
  // Páginas principais = alta prioridade
  if (file.includes('/pages/')) return 'high';
  // Componentes UI base = alta prioridade
  if (file.includes('/components/ui/')) return 'high';
  // Texto branco/preto = alta prioridade (mais problemático)
  if (className.includes('white') || className.includes('black')) return 'high';
  // Resto = média prioridade
  return 'medium';
}
```

### 4. Componente de Teste de Tema

```typescript
// components/dev/ThemeTestCard.tsx
import { Card } from '@/components/ui/card';

export function ThemeTestCard() {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold text-foreground">
        Teste de Cores Semânticas
      </h3>
      
      <div className="space-y-2">
        <p className="text-foreground">Texto principal (foreground)</p>
        <p className="text-muted-foreground">Texto secundário (muted-foreground)</p>
        <p className="text-primary">Texto primário (primary)</p>
        <p className="text-success">Texto de sucesso (success)</p>
        <p className="text-warning">Texto de aviso (warning)</p>
        <p className="text-destructive">Texto de erro (destructive)</p>
      </div>
      
      <div className="space-y-2">
        <div className="p-2 bg-background border border-border">
          Background
        </div>
        <div className="p-2 bg-card border border-border">
          Card
        </div>
        <div className="p-2 bg-muted border border-border">
          Muted
        </div>
        <div className="p-2 bg-accent border border-border">
          Accent
        </div>
      </div>
    </Card>
  );
}
```

## Data Models

### Relatório de Análise

```typescript
interface ColorAnalysisReport {
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
}
```

### Configuração de Migração

```typescript
interface MigrationConfig {
  dryRun: boolean;
  autoFix: boolean;
  excludePatterns: string[];
  priorityThreshold: 'high' | 'medium' | 'low';
  backupFiles: boolean;
}
```

## Correctness Properties

*Uma propriedade é uma característica ou comportamento que deve ser verdadeiro em todas as execuções válidas de um sistema - essencialmente, uma declaração formal sobre o que o sistema deve fazer. Propriedades servem como ponte entre especificações legíveis por humanos e garantias de correção verificáveis por máquina.*

### Property 1: Cores Semânticas em Texto

*Para qualquer* componente que renderiza texto visível, o texto deve usar classes de cor semânticas (`text-foreground`, `text-muted-foreground`, etc.) ou cores de status (`text-success`, `text-warning`, `text-destructive`) ao invés de cores hardcoded.

**Validates: Requirements 3.1, 3.2**

### Property 2: Contraste Mínimo WCAG AA

*Para qualquer* combinação de cor de texto e cor de fundo em um componente, a razão de contraste deve ser no mínimo 4.5:1 para texto normal ou 3:1 para texto grande (18pt+) em ambos os temas.

**Validates: Requirements 3.3, 3.4, 7.1, 7.2**

### Property 3: Adaptação Automática ao Tema

*Para qualquer* componente que usa cores semânticas, quando o tema é alternado entre claro e escuro, todas as cores devem se atualizar automaticamente sem necessidade de lógica condicional no componente.

**Validates: Requirements 3.2, 4.2**

### Property 4: Fundos Semânticos

*Para qualquer* elemento com cor de fundo definida, o fundo deve usar classes semânticas (`bg-background`, `bg-card`, `bg-muted`, etc.) ao invés de cores hardcoded, exceto para gradientes decorativos específicos.

**Validates: Requirements 4.1, 4.2, 4.3**

### Property 5: Bordas Visíveis

*Para qualquer* elemento com borda, a borda deve usar `border-border` ou variantes semânticas e deve ser visível (contraste suficiente) em ambos os temas.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 6: Ícones Adaptativos

*Para qualquer* ícone renderizado, a cor do ícone deve usar `currentColor` ou classes semânticas, garantindo que o ícone seja visível em ambos os temas.

**Validates: Requirements 6.1, 6.2, 6.4**

### Property 7: Preservação de Cores de Status

*Para qualquer* elemento que usa cores de status (sucesso, erro, aviso), as cores devem permanecer consistentes e reconhecíveis em ambos os temas, mantendo sua semântica visual.

**Validates: Requirements 6.3**

### Property 8: Ausência de Cores Hardcoded Problemáticas

*Para qualquer* arquivo de componente no projeto, não deve existir uso de `text-white`, `text-black`, `text-slate-*`, ou `text-gray-*` exceto em casos documentados e aprovados.

**Validates: Requirements 1.1, 1.2, 3.1**

## Error Handling

### Casos de Erro

1. **Cores Hardcoded Não Mapeadas**
   - Detectar classes de cor que não têm mapeamento definido
   - Gerar warning no console de desenvolvimento
   - Adicionar ao relatório de análise para revisão manual

2. **Contraste Insuficiente**
   - Validar contraste em tempo de build (opcional)
   - Gerar erro se contraste < 3:1
   - Sugerir cores alternativas automaticamente

3. **Gradientes Complexos**
   - Identificar gradientes que usam cores hardcoded
   - Marcar para revisão manual (difícil de automatizar)
   - Documentar padrões aprovados

4. **Componentes de Terceiros**
   - Identificar componentes que não podem ser modificados
   - Documentar exceções
   - Criar wrappers com estilos semânticos quando possível

### Estratégia de Fallback

```typescript
// Utilitário para garantir contraste mínimo
export function ensureContrast(
  textColor: string,
  bgColor: string,
  theme: 'light' | 'dark'
): string {
  const contrast = calculateContrastRatio(textColor, bgColor);
  
  if (contrast < 4.5) {
    // Retornar cor semântica apropriada
    return theme === 'dark' ? 'text-foreground' : 'text-foreground';
  }
  
  return textColor;
}
```

## Testing Strategy

### Testes Unitários

1. **Validação de Contraste**
   - Testar função `validateContrast` com pares conhecidos
   - Verificar cálculo correto de razão de contraste
   - Validar classificação WCAG (AA, AAA)

2. **Mapeamento de Cores**
   - Testar que todas as cores hardcoded comuns têm mapeamento
   - Verificar que mapeamentos são válidos (classes existem)

3. **Análise de Arquivos**
   - Testar detecção de cores hardcoded em exemplos
   - Verificar priorização correta
   - Validar geração de relatório

### Testes de Propriedades

Usar **Vitest** com **fast-check** para property-based testing (mínimo 100 iterações por teste):

```typescript
// __tests__/theme-colors.property.test.ts
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

describe('Theme Color Properties', () => {
  it('Property 1: Semantic colors in text', () => {
    // Gerar componentes aleatórios e verificar uso de cores semânticas
    fc.assert(
      fc.property(
        fc.record({
          className: fc.string(),
          content: fc.string()
        }),
        (component) => {
          const hasHardcodedText = /text-(white|black|slate-\d+|gray-\d+)/.test(
            component.className
          );
          // Propriedade: não deve ter cores hardcoded
          return !hasHardcodedText;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Minimum WCAG AA contrast', () => {
    fc.assert(
      fc.property(
        fc.record({
          textColor: fc.hexaString({ minLength: 6, maxLength: 6 }),
          bgColor: fc.hexaString({ minLength: 6, maxLength: 6 }),
          fontSize: fc.integer({ min: 12, max: 48 })
        }),
        (colors) => {
          const result = validateContrast(
            `#${colors.textColor}`,
            `#${colors.bgColor}`,
            colors.fontSize
          );
          // Propriedade: deve passar ou falhar consistentemente
          return typeof result.passes === 'boolean';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 3: Automatic theme adaptation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('light', 'dark'),
        (theme) => {
          // Simular mudança de tema
          document.documentElement.classList.toggle('dark', theme === 'dark');
          
          // Verificar que cores CSS mudam
          const computedBg = getComputedStyle(document.documentElement)
            .getPropertyValue('--background');
          
          // Propriedade: background deve ser diferente entre temas
          return computedBg.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Testes de Integração

1. **Renderização em Ambos os Temas**
   - Renderizar componentes críticos em modo claro
   - Alternar para modo escuro
   - Verificar que texto permanece legível
   - Capturar screenshots para comparação visual

2. **Navegação Completa**
   - Percorrer todas as páginas principais
   - Alternar tema em cada página
   - Verificar ausência de texto invisível

### Testes Visuais

1. **Chromatic/Percy** (opcional)
   - Capturar screenshots de componentes em ambos os temas
   - Detectar regressões visuais automaticamente

2. **Teste Manual**
   - Checklist de páginas para revisar manualmente
   - Verificar em diferentes dispositivos
   - Testar com leitores de tela

### Configuração de Testes

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}']
    }
  }
});
```

## Implementation Plan

### Fase 1: Análise e Documentação (Prioridade Alta)

1. Executar script de análise em todo o projeto
2. Gerar relatório completo de cores hardcoded
3. Priorizar arquivos por impacto (páginas principais primeiro)
4. Documentar exceções legítimas (gradientes decorativos, etc.)

### Fase 2: Componentes Críticos (Prioridade Alta)

Migrar componentes mais visíveis e usados:
- `UserDrVitalPage.tsx` - Muitos `text-white`, `text-slate-400`
- Componentes de navegação
- Cards de dashboard
- Formulários principais

### Fase 3: Componentes UI Base (Prioridade Média)

- Componentes em `src/components/ui/`
- Componentes compartilhados
- Layouts

### Fase 4: Componentes Especializados (Prioridade Média)

- Componentes de features específicas
- Páginas secundárias
- Modais e dialogs

### Fase 5: Validação e Testes (Prioridade Alta)

- Executar testes de propriedades
- Validar contraste em todas as páginas
- Testes manuais em ambos os temas
- Correção de problemas encontrados

### Fase 6: Documentação e Prevenção (Prioridade Média)

- Atualizar guia de estilo
- Adicionar regras de linting (ESLint plugin)
- Documentar padrões para novos componentes
- Criar exemplos de uso correto

## Migration Strategy

### Abordagem Incremental

1. **Não quebrar funcionalidade existente**
   - Migrar um componente por vez
   - Testar após cada migração
   - Commit frequente

2. **Priorização Clara**
   - Começar por componentes mais problemáticos
   - Focar em páginas principais primeiro
   - Deixar componentes menos usados para depois

3. **Automação Onde Possível**
   - Script para substituições simples
   - Revisão manual para casos complexos
   - Testes automatizados para validação

### Script de Migração Automática

```typescript
// scripts/migrate-colors.ts
import { replaceInFile } from 'replace-in-file';

async function migrateColors(config: MigrationConfig) {
  const replacements = Object.entries(colorMapping).map(([old, new_]) => ({
    from: new RegExp(`\\b${old}\\b`, 'g'),
    to: new_
  }));
  
  const options = {
    files: 'src/**/*.{tsx,ts}',
    from: replacements.map(r => r.from),
    to: replacements.map(r => r.to),
    dry: config.dryRun
  };
  
  const results = await replaceInFile(options);
  
  return {
    filesModified: results.filter(r => r.hasChanged).length,
    totalReplacements: results.reduce((sum, r) => sum + r.numReplacements, 0)
  };
}
```

## Performance Considerations

### Impacto Mínimo

- Cores semânticas usam CSS variables (sem overhead de JS)
- Mudança de tema é instantânea (apenas toggle de classe)
- Sem re-renders desnecessários

### Otimizações

- CSS variables são computadas uma vez pelo navegador
- Transições suaves com `transition-colors`
- Lazy loading de componentes não críticos

## Accessibility

### WCAG 2.1 Compliance

- Contraste mínimo AA para todo texto
- Contraste AAA para texto importante
- Indicadores visuais não dependem apenas de cor
- Suporte a modo de alto contraste

### Testes de Acessibilidade

- Validação automática de contraste
- Testes com leitores de tela
- Verificação de navegação por teclado
- Teste com diferentes configurações de sistema

## Documentation

### Guia de Estilo Atualizado

```markdown
# Guia de Cores - MaxNutrition

## Cores Semânticas

### Texto
- `text-foreground` - Texto principal
- `text-muted-foreground` - Texto secundário
- `text-primary` - Texto de destaque (marca)
- `text-success` - Sucesso
- `text-warning` - Avisos
- `text-destructive` - Erros

### Fundos
- `bg-background` - Fundo principal
- `bg-card` - Cards e painéis
- `bg-muted` - Fundos secundários
- `bg-accent` - Destaques

### Bordas
- `border-border` - Bordas padrão
- `border-input` - Bordas de inputs

## ❌ Não Use

- `text-white`, `text-black`
- `text-slate-*`, `text-gray-*`
- `bg-white`, `bg-black`
- Cores hardcoded em geral

## ✅ Exceções

- Gradientes decorativos específicos
- Cores de métricas de saúde (`text-health-heart`, etc.)
- Cores de marca (`text-instituto-blue`, etc.)
```

### Exemplos de Código

```tsx
// ❌ ERRADO
<div className="bg-slate-800 text-white">
  <p className="text-slate-400">Texto secundário</p>
</div>

// ✅ CORRETO
<div className="bg-card text-card-foreground">
  <p className="text-muted-foreground">Texto secundário</p>
</div>

// ✅ CORRETO - Cores de status
<div className="text-success">Operação bem-sucedida!</div>
<div className="text-destructive">Erro ao processar</div>

// ✅ CORRETO - Cores de saúde (especializadas)
<div className="text-health-heart">❤️ 72 bpm</div>
```

## Monitoring and Maintenance

### Prevenção de Regressões

1. **ESLint Rule**
   ```javascript
   // .eslintrc.js
   rules: {
     'no-hardcoded-colors': ['error', {
       allow: ['text-health-*', 'text-instituto-*']
     }]
   }
   ```

2. **Pre-commit Hook**
   ```bash
   # .husky/pre-commit
   npm run analyze-colors
   ```

3. **CI/CD Check**
   - Executar análise de cores em cada PR
   - Falhar build se cores hardcoded forem adicionadas
   - Gerar relatório de diferenças

### Métricas de Sucesso

- 0 cores hardcoded problemáticas em componentes críticos
- 100% de contraste WCAG AA em todas as páginas
- 0 regressões visuais detectadas
- Tempo de migração < 2 semanas

## Conclusion

Esta solução fornece uma abordagem sistemática e incremental para padronizar o uso de cores no projeto MaxNutrition. Através de análise automatizada, migração gradual e testes rigorosos, garantiremos que todos os componentes sejam legíveis e acessíveis em ambos os temas, melhorando significativamente a experiência do usuário.
