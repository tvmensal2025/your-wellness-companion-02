/**
 * Testes de propriedade para análise de cores
 * Feature: theme-color-consistency, Property 8: Ausência de Cores Hardcoded Problemáticas
 * Validates: Requirements 1.1, 1.2, 3.1
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { colorMapping, isAllowedColor, getColorType, getSuggestedColor } from '../color-mapping';

describe('Color Analysis Properties', () => {
  it('Property 8: Ausência de Cores Hardcoded Problemáticas - Mapeamento completo', () => {
    /**
     * Para qualquer cor hardcoded comum, deve existir um mapeamento para cor semântica
     */
    fc.assert(
      fc.property(
        fc.constantFrom(
          'text-white', 'text-black', 'text-slate-400', 'text-gray-900',
          'bg-white', 'bg-black', 'bg-slate-700', 'bg-gray-100',
          'border-slate-200', 'border-gray-300'
        ),
        (hardcodedClass) => {
          const suggestion = getSuggestedColor(hardcodedClass);
          
          // Propriedade: toda cor hardcoded comum deve ter sugestão
          expect(suggestion).toBeTruthy();
          expect(suggestion).toMatch(/^(text|bg|border)-(foreground|background|card|muted|border|primary|success|warning|destructive)/);
          
          return suggestion !== null;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Categorização correta de tipos de cor', () => {
    /**
     * Para qualquer classe de cor, a categorização deve ser consistente
     */
    fc.assert(
      fc.property(
        fc.record({
          prefix: fc.constantFrom('text', 'bg', 'border'),
          color: fc.constantFrom('white', 'black', 'slate-400', 'gray-900'),
        }),
        ({ prefix, color }) => {
          const className = `${prefix}-${color}`;
          const type = getColorType(className);
          
          // Propriedade: tipo deve corresponder ao prefixo
          if (prefix === 'text') expect(type).toBe('text');
          else if (prefix === 'bg') expect(type).toBe('background');
          else if (prefix === 'border') expect(type).toBe('border');
          
          return type !== 'other';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Cores permitidas não são flagadas como problemas', () => {
    /**
     * Para qualquer cor da lista de exceções, deve ser considerada permitida
     */
    fc.assert(
      fc.property(
        fc.constantFrom(
          'text-health-heart', 'text-health-steps', 'text-health-calories',
          'bg-instituto-blue', 'bg-instituto-green', 'bg-gradient-primary',
          'text-success', 'text-warning', 'text-destructive'
        ),
        (allowedClass) => {
          const isAllowed = isAllowedColor(allowedClass);
          
          // Propriedade: cores permitidas devem ser reconhecidas como tal
          expect(isAllowed).toBe(true);
          
          return isAllowed;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Cores hardcoded problemáticas são detectadas', () => {
    /**
     * Para qualquer cor hardcoded problemática, deve ser detectada como não permitida
     */
    fc.assert(
      fc.property(
        fc.record({
          prefix: fc.constantFrom('text', 'bg', 'border'),
          shade: fc.constantFrom('50', '100', '200', '300', '400', '500', '600', '700', '800', '900'),
          colorFamily: fc.constantFrom('slate', 'gray')
        }),
        ({ prefix, shade, colorFamily }) => {
          const className = `${prefix}-${colorFamily}-${shade}`;
          const isAllowed = isAllowedColor(className);
          
          // Propriedade: cores hardcoded não devem ser permitidas
          expect(isAllowed).toBe(false);
          
          return !isAllowed;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Sugestões são sempre cores semânticas válidas', () => {
    /**
     * Para qualquer sugestão de cor, deve ser uma cor semântica válida
     */
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(colorMapping)),
        (hardcodedClass) => {
          const suggestion = getSuggestedColor(hardcodedClass);
          
          if (suggestion) {
            // Propriedade: sugestão deve ser cor semântica válida
            const validSemanticPatterns = [
              /^text-(foreground|muted-foreground|primary|success|warning|destructive)$/,
              /^bg-(background|card|muted|accent|primary|success|warning|destructive)$/,
              /^border-(border|input)$/
            ];
            
            const isValidSemantic = validSemanticPatterns.some(pattern => 
              pattern.test(suggestion)
            );
            
            expect(isValidSemantic).toBe(true);
            return isValidSemantic;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Mapeamento é consistente e determinístico', () => {
    /**
     * Para qualquer cor hardcoded, o mapeamento deve ser sempre o mesmo
     */
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(colorMapping)),
        (hardcodedClass) => {
          const suggestion1 = getSuggestedColor(hardcodedClass);
          const suggestion2 = getSuggestedColor(hardcodedClass);
          
          // Propriedade: mapeamento deve ser determinístico
          expect(suggestion1).toBe(suggestion2);
          
          return suggestion1 === suggestion2;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Cores brancas e pretas são mapeadas para foreground', () => {
    /**
     * Para cores extremas (branco/preto), devem ser mapeadas para foreground
     */
    fc.assert(
      fc.property(
        fc.constantFrom('text-white', 'text-black'),
        (extremeColor) => {
          const suggestion = getSuggestedColor(extremeColor);
          
          // Propriedade: cores extremas devem usar foreground
          expect(suggestion).toBe('text-foreground');
          
          return suggestion === 'text-foreground';
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Cores de status são preservadas semanticamente', () => {
    /**
     * Para cores que indicam status, devem ser mapeadas para cores semânticas de status
     */
    fc.assert(
      fc.property(
        fc.record({
          color: fc.constantFrom('emerald', 'green', 'orange', 'yellow', 'red'),
          shade: fc.constantFrom('400', '500')
        }),
        ({ color, shade }) => {
          const className = `text-${color}-${shade}`;
          const suggestion = getSuggestedColor(className);
          
          if (suggestion) {
            // Propriedade: cores de status devem manter semântica
            const statusColors = ['text-success', 'text-warning', 'text-destructive'];
            const isStatusColor = statusColors.includes(suggestion);
            
            expect(isStatusColor).toBe(true);
            return isStatusColor;
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});