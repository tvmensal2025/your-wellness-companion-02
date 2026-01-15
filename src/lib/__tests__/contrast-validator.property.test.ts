/**
 * Testes de propriedade para validação de contraste
 * Feature: theme-color-consistency, Property 2: Contraste Mínimo WCAG AA
 * Validates: Requirements 3.3, 3.4, 7.1, 7.2
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  calculateContrastRatio, 
  validateContrast, 
  ensureContrast,
  validatePalette 
} from '../contrast-validator';

describe('Contrast Validation Properties', () => {
  // Gerador de cores hexadecimais válidas usando tuple de integers
  const hexColorArb: fc.Arbitrary<string> = fc.tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  ).map(([r, g, b]) => 
    `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  );

  it('Property 2: Contraste mínimo WCAG AA - Razão de contraste é sempre positiva', () => {
    /**
     * Para qualquer par de cores válidas, a razão de contraste deve ser positiva
     */
    fc.assert(
      fc.property(
        fc.record({
          color1: hexColorArb,
          color2: hexColorArb
        }),
        ({ color1, color2 }: { color1: string; color2: string }) => {
          const ratio = calculateContrastRatio(color1, color2);
          
          // Propriedade: razão de contraste deve ser sempre positiva
          expect(ratio).toBeGreaterThan(0);
          expect(ratio).toBeLessThanOrEqual(21); // Máximo teórico WCAG
          
          return ratio > 0 && ratio <= 21;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Contraste é simétrico', () => {
    /**
     * Para qualquer par de cores, contraste(A,B) deve ser igual a contraste(B,A)
     */
    fc.assert(
      fc.property(
        fc.record({
          color1: hexColorArb,
          color2: hexColorArb
        }),
        ({ color1, color2 }: { color1: string; color2: string }) => {
          const ratio1 = calculateContrastRatio(color1, color2);
          const ratio2 = calculateContrastRatio(color2, color1);
          
          // Propriedade: contraste deve ser simétrico
          expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.01); // Tolerância para arredondamento
          
          return Math.abs(ratio1 - ratio2) < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Validação WCAG AA para texto normal', () => {
    /**
     * Para qualquer par de cores com contraste >= 4.5:1, deve passar na validação AA
     */
    fc.assert(
      fc.property(
        fc.record({
          foreground: hexColorArb,
          background: hexColorArb,
          fontSize: fc.integer({ min: 12, max: 17 }) // Texto normal
        }),
        ({ foreground, background, fontSize }: { foreground: string; background: string; fontSize: number }) => {
          const result = validateContrast(foreground, background, fontSize);
          const ratio = calculateContrastRatio(foreground, background);
          
          // Propriedade: se ratio >= 4.5, deve passar; se < 4.5, deve falhar
          if (ratio >= 4.5) {
            expect(result.passes).toBe(true);
            expect(['AA', 'AAA']).toContain(result.level);
          } else {
            expect(result.passes).toBe(false);
            expect(result.level).toBe('Fail');
          }
          
          return (ratio >= 4.5) === result.passes;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Validação WCAG AA para texto grande', () => {
    /**
     * Para qualquer par de cores com texto grande, contraste >= 3:1 deve passar
     */
    fc.assert(
      fc.property(
        fc.record({
          foreground: hexColorArb,
          background: hexColorArb,
          fontSize: fc.integer({ min: 18, max: 48 }) // Texto grande
        }),
        ({ foreground, background, fontSize }: { foreground: string; background: string; fontSize: number }) => {
          const result = validateContrast(foreground, background, fontSize);
          const ratio = calculateContrastRatio(foreground, background);
          
          // Propriedade: texto grande precisa apenas 3:1 para AA-Large
          if (ratio >= 3) {
            expect(result.passes).toBe(true);
            expect(['AA-Large', 'AA', 'AAA']).toContain(result.level);
          } else {
            expect(result.passes).toBe(false);
            expect(result.level).toBe('Fail');
          }
          
          return (ratio >= 3) === result.passes;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Contraste máximo entre branco e preto', () => {
    /**
     * O contraste entre branco puro e preto puro deve ser 21:1 (máximo teórico)
     */
    const whiteBlackRatio = calculateContrastRatio('#ffffff', '#000000');
    
    // Propriedade: contraste máximo deve ser aproximadamente 21
    expect(whiteBlackRatio).toBeCloseTo(21, 1);
    
    const result = validateContrast('#ffffff', '#000000');
    expect(result.passes).toBe(true);
    expect(result.level).toBe('AAA');
  });

  it('Property 2: Contraste mínimo entre cores idênticas', () => {
    /**
     * Para qualquer cor idêntica, o contraste deve ser 1:1 (mínimo)
     */
    fc.assert(
      fc.property(
        hexColorArb,
        (color: string) => {
          const ratio = calculateContrastRatio(color, color);
          
          // Propriedade: cores idênticas têm contraste 1:1
          expect(ratio).toBeCloseTo(1, 1);
          
          const result = validateContrast(color, color);
          expect(result.passes).toBe(false);
          expect(result.level).toBe('Fail');
          
          return Math.abs(ratio - 1) < 0.1;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: ensureContrast sempre retorna cor com contraste adequado', () => {
    /**
     * Para qualquer par de cores e tema, ensureContrast deve garantir contraste mínimo
     */
    fc.assert(
      fc.property(
        fc.record({
          textColor: hexColorArb,
          bgColor: hexColorArb,
          theme: fc.constantFrom('light' as const, 'dark' as const),
          fontSize: fc.integer({ min: 12, max: 24 })
        }),
        ({ textColor, bgColor, theme, fontSize }: { textColor: string; bgColor: string; theme: 'light' | 'dark'; fontSize: number }) => {
          const ensuredColor = ensureContrast(textColor, bgColor, theme, fontSize);
          const finalRatio = calculateContrastRatio(ensuredColor, bgColor);
          
          // Propriedade: cor garantida deve ter contraste adequado
          const minRatio = fontSize >= 18 ? 3 : 4.5;
          
          if (ensuredColor === textColor) {
            // Se cor original foi mantida, deve ter contraste adequado
            expect(finalRatio).toBeGreaterThanOrEqual(minRatio - 0.1); // Tolerância
          } else {
            // Se cor foi alterada, nova cor deve ter contraste adequado
            expect(finalRatio).toBeGreaterThanOrEqual(minRatio - 0.1);
          }
          
          return finalRatio >= (minRatio - 0.1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Validação de paleta é consistente', () => {
    /**
     * Para qualquer paleta de cores, a validação deve ser consistente
     */
    fc.assert(
      fc.property(
        fc.record({
          foregrounds: fc.array(hexColorArb, { minLength: 1, maxLength: 3 }),
          backgrounds: fc.array(hexColorArb, { minLength: 1, maxLength: 3 }),
          fontSize: fc.integer({ min: 12, max: 24 })
        }),
        ({ foregrounds, backgrounds, fontSize }: { foregrounds: string[]; backgrounds: string[]; fontSize: number }) => {
          const results = validatePalette(foregrounds, backgrounds, fontSize);
          
          // Propriedade: deve haver resultado para cada combinação
          expect(results).toHaveLength(foregrounds.length * backgrounds.length);
          
          // Propriedade: cada resultado deve ser válido
          results.forEach(result => {
            expect(result.foreground).toBeTruthy();
            expect(result.background).toBeTruthy();
            expect(result.result.ratio).toBeGreaterThan(0);
            expect(['AAA', 'AA', 'AA-Large', 'Fail']).toContain(result.result.level);
          });
          
          return results.length === (foregrounds.length * backgrounds.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 2: Recomendações são fornecidas para contraste insuficiente', () => {
    /**
     * Para qualquer par de cores com contraste insuficiente, deve haver recomendação
     */
    fc.assert(
      fc.property(
        fc.record({
          // Gerar cores com baixo contraste (tons similares)
          baseHue: fc.integer({ min: 0, max: 360 }),
          baseSat: fc.integer({ min: 20, max: 80 }),
          lightness1: fc.integer({ min: 40, max: 60 }),
          lightness2: fc.integer({ min: 40, max: 60 }),
          fontSize: fc.integer({ min: 12, max: 24 })
        }),
        ({ baseHue, baseSat, lightness1, lightness2, fontSize }) => {
          // Criar cores HSL similares (baixo contraste)
          const color1 = `hsl(${baseHue}, ${baseSat}%, ${lightness1}%)`;
          const color2 = `hsl(${baseHue}, ${baseSat}%, ${lightness2}%)`;
          
          const result = validateContrast(color1, color2, fontSize);
          
          // Propriedade: se não passa, deve ter recomendação
          if (!result.passes) {
            expect(result.recommendation).toBeTruthy();
            expect(result.recommendation).toContain('Contraste insuficiente');
          }
          
          return !result.passes ? !!result.recommendation : true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
