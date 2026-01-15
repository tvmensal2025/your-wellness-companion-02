/**
 * Mapeamento de cores hardcoded para cores semânticas
 * Este arquivo define como cores fixas devem ser substituídas por cores que se adaptam ao tema
 */

export const colorMapping: Record<string, string> = {
  // Texto - Cores principais
  'text-white': 'text-foreground',
  'text-black': 'text-foreground',
  
  // Texto - Tons de cinza (slate)
  'text-slate-50': 'text-foreground',
  'text-slate-100': 'text-foreground',
  'text-slate-200': 'text-foreground',
  'text-slate-300': 'text-muted-foreground',
  'text-slate-400': 'text-muted-foreground',
  'text-slate-500': 'text-muted-foreground',
  'text-slate-600': 'text-foreground',
  'text-slate-700': 'text-foreground',
  'text-slate-800': 'text-foreground',
  'text-slate-900': 'text-foreground',
  
  // Texto - Tons de cinza (gray)
  'text-gray-50': 'text-foreground',
  'text-gray-100': 'text-foreground',
  'text-gray-200': 'text-foreground',
  'text-gray-300': 'text-muted-foreground',
  'text-gray-400': 'text-muted-foreground',
  'text-gray-500': 'text-muted-foreground',
  'text-gray-600': 'text-foreground',
  'text-gray-700': 'text-foreground',
  'text-gray-800': 'text-foreground',
  'text-gray-900': 'text-foreground',
  
  // Fundos - Cores principais
  'bg-white': 'bg-background',
  'bg-black': 'bg-background',
  
  // Fundos - Tons de cinza (slate)
  'bg-slate-50': 'bg-muted',
  'bg-slate-100': 'bg-muted',
  'bg-slate-200': 'bg-muted',
  'bg-slate-700': 'bg-muted',
  'bg-slate-800': 'bg-card',
  'bg-slate-900': 'bg-card',
  
  // Fundos - Tons de cinza (gray)
  'bg-gray-50': 'bg-muted',
  'bg-gray-100': 'bg-muted',
  'bg-gray-200': 'bg-muted',
  'bg-gray-700': 'bg-muted',
  'bg-gray-800': 'bg-card',
  'bg-gray-900': 'bg-card',
  
  // Bordas
  'border-slate-200': 'border-border',
  'border-slate-300': 'border-border',
  'border-slate-700': 'border-border',
  'border-slate-800': 'border-border',
  'border-gray-200': 'border-border',
  'border-gray-300': 'border-border',
  'border-gray-700': 'border-border',
  'border-gray-800': 'border-border',
  
  // Cores de status - manter semânticas
  'text-emerald-400': 'text-success',
  'text-emerald-500': 'text-success',
  'text-green-400': 'text-success',
  'text-green-500': 'text-success',
  'text-orange-400': 'text-warning',
  'text-orange-500': 'text-warning',
  'text-yellow-400': 'text-warning',
  'text-yellow-500': 'text-warning',
  'text-red-400': 'text-destructive',
  'text-red-500': 'text-destructive',
  'text-blue-500': 'text-primary',
  'text-blue-600': 'text-primary',
  'text-purple-600': 'text-primary',
};

/**
 * Exceções - cores que são permitidas e não devem ser substituídas
 */
export const allowedColors = [
  // Cores de saúde (especializadas)
  /^text-health-(heart|steps|calories|hydration)$/,
  /^bg-health-(heart|steps|calories|hydration)$/,
  
  // Cores da marca Instituto
  /^text-instituto-(blue|green|red|gray)$/,
  /^bg-instituto-(blue|green|red|gray)$/,
  
  // Gradientes específicos (decorativos)
  /^bg-gradient-/,
  
  // Cores de status em fundos
  /^bg-(success|warning|destructive|primary|secondary)$/,
];

/**
 * Verifica se uma classe de cor é permitida (exceção)
 */
export function isAllowedColor(className: string): boolean {
  return allowedColors.some(pattern => pattern.test(className));
}

/**
 * Obtém a sugestão de cor semântica para uma cor hardcoded
 */
export function getSuggestedColor(hardcodedClass: string): string | null {
  return colorMapping[hardcodedClass] || null;
}

/**
 * Categoriza o tipo de cor
 */
export function getColorType(className: string): 'text' | 'background' | 'border' | 'other' {
  if (className.startsWith('text-')) return 'text';
  if (className.startsWith('bg-')) return 'background';
  if (className.startsWith('border-')) return 'border';
  return 'other';
}
