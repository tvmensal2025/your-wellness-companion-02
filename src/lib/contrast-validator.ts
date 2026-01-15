/**
 * Validador de contraste WCAG 2.1
 * Implementa cálculos de contraste e validação de acessibilidade
 */

export interface ContrastResult {
  ratio: number;
  passes: boolean;
  level: 'AAA' | 'AA' | 'AA-Large' | 'Fail';
  recommendation?: string;
}

/**
 * Converte cor hexadecimal para RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converte cor HSL para RGB
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  s /= 100;
  l /= 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) {
    r = c; g = x; b = 0;
  } else if (h >= 60 && h < 120) {
    r = x; g = c; b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0; g = c; b = x;
  } else if (h >= 180 && h < 240) {
    r = 0; g = x; b = c;
  } else if (h >= 240 && h < 300) {
    r = x; g = 0; b = c;
  } else if (h >= 300 && h < 360) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Calcula a luminância relativa de uma cor RGB
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calcula a razão de contraste entre duas cores
 */
export function calculateContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    return 0;
  }

  const l1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Determina o nível WCAG baseado na razão de contraste
 */
function getWCAGLevel(ratio: number, isLargeText: boolean): 'AAA' | 'AA' | 'AA-Large' | 'Fail' {
  if (isLargeText) {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3) return 'AA-Large';
    return 'Fail';
  } else {
    if (ratio >= 7) return 'AAA';
    if (ratio >= 4.5) return 'AA';
    return 'Fail';
  }
}

/**
 * Valida o contraste entre duas cores
 */
export function validateContrast(
  foreground: string,
  background: string,
  fontSize: number = 16,
  isBold: boolean = false
): ContrastResult {
  const ratio = calculateContrastRatio(foreground, background);
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
  const level = getWCAGLevel(ratio, isLargeText);
  const passes = level !== 'Fail';

  let recommendation: string | undefined;
  if (!passes) {
    const requiredRatio = isLargeText ? 3 : 4.5;
    recommendation = `Contraste insuficiente (${ratio.toFixed(2)}:1). Necessário: ${requiredRatio}:1`;
  }

  return {
    ratio: Math.round(ratio * 100) / 100,
    passes,
    level,
    recommendation,
  };
}

/**
 * Garante contraste mínimo, retornando cor alternativa se necessário
 */
export function ensureContrast(
  textColor: string,
  bgColor: string,
  theme: 'light' | 'dark',
  fontSize: number = 16
): string {
  const result = validateContrast(textColor, bgColor, fontSize);

  if (result.passes) {
    return textColor;
  }

  // Retornar cor semântica apropriada baseada no tema
  return theme === 'dark' ? '#e5e7eb' : '#1f2937'; // foreground colors
}

/**
 * Valida contraste de uma paleta de cores
 */
export interface PaletteValidation {
  foreground: string;
  background: string;
  result: ContrastResult;
}

export function validatePalette(
  foregrounds: string[],
  backgrounds: string[],
  fontSize: number = 16
): PaletteValidation[] {
  const results: PaletteValidation[] = [];

  for (const fg of foregrounds) {
    for (const bg of backgrounds) {
      results.push({
        foreground: fg,
        background: bg,
        result: validateContrast(fg, bg, fontSize),
      });
    }
  }

  return results;
}
