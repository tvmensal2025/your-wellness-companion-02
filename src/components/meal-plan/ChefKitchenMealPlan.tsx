/**
 * ChefKitchenMealPlan - Re-export para compatibilidade
 * 
 * Este arquivo mantém compatibilidade com imports existentes.
 * A implementação real está em ./chef-kitchen/index.tsx
 * 
 * @deprecated Importe diretamente de '@/components/meal-plan/chef-kitchen'
 */

// Re-export do componente refatorado
export { ChefKitchenMealPlan, ChefKitchenMealPlan as default } from './chef-kitchen';
export type { ChefKitchenMealPlanProps } from './chef-kitchen';
