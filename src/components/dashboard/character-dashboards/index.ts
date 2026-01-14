/**
 * Character Dashboards Index
 * Exporta todos os dashboards personalizados por personagem
 */

export { SofiaDashboard } from './SofiaDashboard';
export { AlexDashboard } from './AlexDashboard';
export { DrVitalDashboard } from './DrVitalDashboard';
export { RafaelDashboard } from './RafaelDashboard';
export { CompleteDashboard } from './CompleteDashboard';

// Mapeamento de CharacterId para Dashboard
export const characterDashboardMap = {
  nutrition: 'SofiaDashboard',
  exercise: 'AlexDashboard',
  health: 'DrVitalDashboard',
  coaching: 'RafaelDashboard',
  complete: 'CompleteDashboard',
} as const;
