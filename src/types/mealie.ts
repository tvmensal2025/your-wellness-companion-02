/**
 * @file Mealie Types
 * @description TypeScript types para o sistema de planejamento semanal e lista de compras
 */

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type DayStatus = 'empty' | 'partial' | 'complete' | 'today';

export interface MealItem {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  image_url?: string;
}

export interface DayMeals {
  date: Date;
  breakfast: MealItem[];
  lunch: MealItem[];
  snack: MealItem[];
  dinner: MealItem[];
  totalCalories: number;
  targetCalories: number;
  status: DayStatus;
}

export interface WeekDay {
  date: Date;
  dayOfWeek: string;
  dayNumber: number;
  mealsCount: number;
  calories: number;
  status: DayStatus;
}

export interface WeeklyPlan {
  startDate: Date;
  endDate: Date;
  days: WeekDay[];
  completedDays: number;
  totalDays: number;
}

export interface ShoppingItem {
  name: string;
  quantity: number;
  unit: string;
  category: string;
  checked: boolean;
}

export interface ShoppingList {
  id: string;
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  items: ShoppingItem[];
  createdAt: Date;
  sentToWhatsApp: boolean;
}

export interface ShoppingListByCategory {
  [category: string]: ShoppingItem[];
}
