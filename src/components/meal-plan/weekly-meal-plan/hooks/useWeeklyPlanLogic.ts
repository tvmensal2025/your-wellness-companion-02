/**
 * Hook para lógica do WeeklyMealPlanModal
 * 
 * Responsabilidades:
 * - Estado de dias expandidos
 * - Cálculo de médias de macros semanais
 * - Funcionalidade de impressão
 * - Integração com CompactMealPlanModal
 * - Busca do nome do usuário
 * 
 * @module useWeeklyPlanLogic
 * @requirements 2.2
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DayPlan, Meal, MacroNutrients } from '@/types/meal-plan';

// Configuração de refeições para impressão
const MEAL_CONFIG_PRINT = {
  breakfast: { 
    emoji: '🌅', 
    fullLabel: 'CAFÉ DA MANHÃ',
  },
  lunch: { 
    emoji: '☀️', 
    fullLabel: 'ALMOÇO',
  },
  snack: { 
    emoji: '🍃', 
    fullLabel: 'LANCHE',
  },
  dinner: { 
    emoji: '🌆', 
    fullLabel: 'JANTAR',
  },
  supper: { 
    emoji: '🌙', 
    fullLabel: 'CEIA',
  }
};

export interface UseWeeklyPlanLogicProps {
  mealPlan: DayPlan[];
  title?: string;
  onOpenChange?: (open: boolean) => void;
}

export interface UseWeeklyPlanLogicReturn {
  // Estado de dias expandidos
  expandedDays: number[];
  toggleDay: (day: number) => void;
  
  // Médias de macros
  avgMacros: MacroNutrients & { fiber: number };
  
  // Utilitários
  getDayName: (day: number) => string;
  
  // Impressão
  handlePrint: () => void;
  userFullName: string;
  
  // Integração com CompactMealPlanModal
  compactModalOpen: boolean;
  setCompactModalOpen: (open: boolean) => void;
  selectedDayForCompact: DayPlan | null;
  setSelectedDayForCompact: (day: DayPlan | null) => void;
  openDayDetail: (day: DayPlan) => void;
}

/**
 * Hook que gerencia toda a lógica do WeeklyMealPlanModal
 */
export const useWeeklyPlanLogic = ({
  mealPlan,
  title = "Cardápio Semanal",
  onOpenChange,
}: UseWeeklyPlanLogicProps): UseWeeklyPlanLogicReturn => {
  // Estado de dias expandidos (primeiro dia expandido por padrão)
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  
  // Estado para CompactMealPlanModal
  const [compactModalOpen, setCompactModalOpen] = useState(false);
  const [selectedDayForCompact, setSelectedDayForCompact] = useState<DayPlan | null>(null);
  
  // Nome do usuário para impressão
  const [userFullName, setUserFullName] = useState('');

  // Buscar nome do usuário
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const metadata = data.user?.user_metadata as { full_name?: string } | undefined;
        setUserFullName(metadata?.full_name || '');
      } catch {
        // Silently ignore auth errors - user name is optional
      }
    };
    fetchUserName();
  }, []);

  /**
   * Retorna o nome do dia da semana
   */
  const getDayName = useCallback((day: number): string => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[(day - 1) % 7];
  }, []);

  /**
   * Toggle expansão de um dia
   */
  const toggleDay = useCallback((day: number) => {
    setExpandedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  }, []);

  /**
   * Abre o modal de detalhes do dia
   */
  const openDayDetail = useCallback((day: DayPlan) => {
    setSelectedDayForCompact(day);
    setCompactModalOpen(true);
  }, []);

  /**
   * Calcula a média de macros da semana
   */
  const avgMacros = useMemo(() => {
    if (!mealPlan.length) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    }

    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    
    mealPlan.forEach(dayPlan => {
      if (dayPlan.dailyTotals) {
        totals.calories += dayPlan.dailyTotals.calories;
        totals.protein += dayPlan.dailyTotals.protein;
        totals.carbs += dayPlan.dailyTotals.carbs;
        totals.fat += dayPlan.dailyTotals.fat;
        totals.fiber += dayPlan.dailyTotals.fiber;
      } else {
        // Calcular a partir das refeições individuais
        const meals = Object.values(dayPlan.meals).filter(Boolean) as Meal[];
        meals.forEach(meal => {
          totals.calories += meal.macros.calories;
          totals.protein += meal.macros.protein;
          totals.carbs += meal.macros.carbs;
          totals.fat += meal.macros.fat;
          totals.fiber += meal.macros.fiber || 0;
        });
      }
    });
    
    const count = mealPlan.length;
    return {
      calories: Math.round(totals.calories / count),
      protein: Math.round(totals.protein / count),
      carbs: Math.round(totals.carbs / count),
      fat: Math.round(totals.fat / count),
      fiber: Math.round(totals.fiber / count),
    };
  }, [mealPlan]);

  /**
   * Gera o HTML para impressão
   */
  const generatePrintHTML = useCallback(() => {
    const currentDate = new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Logo em base64 para garantir que apareça no PDF
    const logoBase64 = 'data:image/jpeg;base64,/9j/4gJASUNDX1BST0ZJTEUAAQEAAAIwQURCRQIQAABtbnRyUkdCIFhZWiAHzwAGAAMAAAAAAABhY3NwQVBQTAAAAABub25lAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLUFEQkUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApjcHJ0AAAA/AAAADJkZXNjAAABMAAAAGt3dHB0AAABnAAAABRia3B0AAABsAAAABRyVFJDAAABxAAAAA5nVFJDAAAB1AAAAA5iVFJDAAAB5AAAAA5yWFlaAAAB9AAAABRnWFlaAAACCAAAABRiWFlaAAACHAAAABR0ZXh0AAAAAENvcHlyaWdodCAxOTk5IEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkAAAAZGVzYwAAAAAAAAARQWRvYmUgUkdCICgxOTk4KQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAPNRAAEAAAABFsxYWVogAAAAAAAAAAAAAAAAAAAAAGN1cnYAAAAAAAAAAQIzAABjdXJ2AAAAAAAAAAECMwAAY3VydgAAAAAAAAABAjMAAFhZWiAAAAAAAACcGAAAT6UAAAT8WFlaIAAAAAAAADSNAACgLAAAD5VYWVogAAAAAAAAJjEAABAvAAC+nP/bAIQACgcHBwgHCggICg8KCAoPEg0KCg0SFBAQEhAQFBQPEREREQ8UFBcYGhgXFB8fISEfHy0sLCwtMjIyMjIyMjIyMgELCgoLDAsODAwOEg4ODhIUDg4ODhQZERESEREZIBcUFBQUFyAcHhoaGh4cIyMgICMjKyspKysyMjIyMjIyMjIy/90ABAAL/+4ADkFkb2JlAGTAAAAAAf/AABEIALEAowMAIgABEQECEQH/xAGiAAEAAwACAQUAAAAAAAAAAAAABgcIBAUCAQMJCgsBAQAABAcAAAAAAAAAAAAAAAABAgMEBQYHCAkKCxAAAAQCAgQFCihfAAAAAAAAAAECAwQFBhEHNnSyEiE1QbMTFiIxQkNRc3WBCAkKFBUXGBkaIyQlJicoKSoyMzQ3ODk6REVGR0hJSlJVYWJykZOx0VNUVldYWVpjZGVmZ2hpanF2d3h5eoKDhIWGh4iJipKUlZaXmJmaoaKjpKWmp6ipqrS1tre4ubrBwsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vDx8vP09fb3+Pn6EQABAAAAAB6DAAAAAAAAAAAAAQIDBAUGBwgJChESExQVFhcYGRohIiMkJSYnKCkqMTIzNDU2Nzg5OkFCQ0RFRkdISUpRUlNUVVZXWFlaYWJjZGVmZ2hpanFyc3R1dnd4eXqBgoOEhYaHiImKkZKTlJWWl5iZmqGio6SlpqeoqaqxsrO0tba3uLm6wcLDxMXGx8jJytHS09TV1tfY2drh4uPk5ebn6Onq8PHy8/T19vf4+fr/2gAMAwAAARECEQA/ALmAAAAAAAAAAAAAAAAHXxs9lUE7lKIfInMdKSNRlhV5lgSOoQQUMgIVAVUMgoCBSSCCgoCA0oKCqUk7ABF36bwqXKmIZbiMOtSlEg68aoiwQ6uJpjNXVmbGAYRVUkiSSjLDLDrXXh6YUUMjpEkCGqtIQCmgouiaBDVWkExiJnBQ0SzCvOkl586m0+MKvQVnhEOWKofdfdeU6+pS3V4alKzZ6AWbLYtMZAMRKc04gjMqzOpRYSirPQGQgiCLrIhkMgKioqNKBSAiSKq9BQUBUVFR8HKAAFwVQAAAAAAAAAAD/0LmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9G5gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//Z';

    const daysHTML = mealPlan.map(d => {
      const mealsHTML = Object.entries(d.meals)
        .filter(([, m]) => m)
        .map(([k, m]) => {
          const meal = m as Meal;
          const cfg = MEAL_CONFIG_PRINT[k as keyof typeof MEAL_CONFIG_PRINT];
          return `<div class="meal ${k}">
            <div class="meal-header">
              <span class="meal-title">${cfg?.emoji} ${cfg?.fullLabel}</span>
              <span class="meal-kcal">🔥 ${meal.macros.calories} kcal</span>
            </div>
            <div class="meal-name">${meal.title}</div>
            <div class="meal-desc">${meal.practicalSuggestion || meal.ingredients.slice(0, 3).join(', ')}</div>
          </div>`;
        })
        .join('');

      return `<div class="day">
        <h3>${getDayName(d.day)} <span class="day-badge">Dia ${d.day} ${d.dailyTotals ? `• ${d.dailyTotals.calories} kcal` : ''}</span></h3>
        ${mealsHTML}
      </div>`;
    }).join('');

    return `<!DOCTYPE html><html><head><title>${title}</title><style>
      @page { size: A4; margin: 12mm; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', system-ui, sans-serif; padding: 15px; max-width: 800px; margin: 0 auto; color: #1a1a1a; font-size: 11px; }
      
      /* Header Premium */
      .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 12px; border-bottom: 3px solid #22c55e; margin-bottom: 15px; }
      .header-left { display: flex; align-items: center; gap: 12px; }
      .logo-img { height: 36px; width: auto; }
      .header-title { font-size: 22px; font-weight: 900; color: #16a34a; }
      .header-subtitle { font-size: 10px; color: #666; margin-top: 2px; }
      .header-right { text-align: right; }
      .header-date { font-size: 10px; color: #666; }
      .header-user { font-size: 11px; font-weight: 600; color: #22c55e; margin-top: 2px; }
      
      /* Summary */
      .summary { background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 15px 20px; border-radius: 12px; margin: 15px 0; display: flex; justify-content: space-around; text-align: center; border: 1px solid #86efac; }
      .summary div { }
      .summary .value { font-size: 22px; font-weight: 800; color: #16a34a; }
      .summary .label { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
      
      /* Day Card */
      .day { border: 1px solid #e5e7eb; border-left: 5px solid #22c55e; padding: 12px 15px; margin: 12px 0; border-radius: 10px; background: white; }
      .day h3 { color: #16a34a; margin: 0 0 10px 0; font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
      .day-badge { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 2px 10px; border-radius: 12px; font-size: 11px; }
      
      /* Meal Card */
      .meal { padding: 10px 12px; margin: 8px 0; border-radius: 8px; border-left: 4px solid; }
      .meal.breakfast { background: linear-gradient(135deg, #fff7ed, #ffedd5); border-color: #f97316; }
      .meal.lunch { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-color: #22c55e; }
      .meal.snack { background: linear-gradient(135deg, #ecfeff, #cffafe); border-color: #06b6d4; }
      .meal.dinner { background: linear-gradient(135deg, #faf5ff, #f3e8ff); border-color: #8b5cf6; }
      .meal.supper { background: linear-gradient(135deg, #eef2ff, #e0e7ff); border-color: #6366f1; }
      
      .meal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
      .meal-title { font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 6px; }
      .meal-kcal { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 3px 10px; border-radius: 12px; font-size: 10px; font-weight: 700; }
      .meal-name { font-size: 12px; font-weight: 600; margin-bottom: 3px; color: #1a1a1a; }
      .meal-desc { font-size: 10px; color: #666; line-height: 1.4; }
      
      /* Tips Section */
      .tips { background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 10px; padding: 12px 15px; margin: 15px 0; border: 1px solid #fbbf24; }
      .tips-header { font-size: 12px; font-weight: 700; color: #92400e; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
      .tip { font-size: 10px; color: #78350f; padding: 4px 0; border-bottom: 1px dashed #fbbf24; }
      .tip:last-child { border-bottom: none; }
      
      /* Footer */
      .footer { display: flex; justify-content: space-between; align-items: center; margin-top: 20px; padding: 12px 15px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 10px; border: 2px solid #86efac; }
      .footer-left { display: flex; align-items: center; gap: 10px; }
      .footer-logo { height: 20px; width: auto; }
      .footer-brand { font-size: 14px; font-weight: 800; color: #16a34a; }
      .footer-right { text-align: right; }
      .footer-sofia { font-size: 10px; color: #22c55e; font-weight: 600; }
      .footer-user { font-size: 9px; color: #666; }
      .footer-slogan { font-size: 8px; color: #94a3b8; font-style: italic; margin-top: 2px; }
    </style></head><body>
      <!-- Header Premium -->
      <div class="header">
        <div class="header-left">
          <img src="${logoBase64}" alt="MaxNutrition" class="logo-img" />
          <div>
            <div class="header-title">${title}</div>
            <div class="header-subtitle">Plano alimentar personalizado por Sofia Nutricional</div>
          </div>
        </div>
        <div class="header-right">
          <div class="header-date">📅 ${currentDate}</div>
          ${userFullName ? `<div class="header-user">👤 ${userFullName}</div>` : ''}
        </div>
      </div>
      
      <!-- Summary -->
      <div class="summary">
        <div><div class="value">🔥 ${avgMacros.calories}</div><div class="label">kcal/dia</div></div>
        <div><div class="value">💪 ${avgMacros.protein}g</div><div class="label">Proteína</div></div>
        <div><div class="value">⚡ ${avgMacros.carbs}g</div><div class="label">Carboidratos</div></div>
        <div><div class="value">🥑 ${avgMacros.fat}g</div><div class="label">Gordura</div></div>
        <div><div class="value">🥬 ${avgMacros.fiber}g</div><div class="label">Fibras</div></div>
      </div>
      
      <!-- Days -->
      ${daysHTML}
      
      <!-- Tips -->
      <div class="tips">
        <div class="tips-header">💡 Dicas da Sofia para seu cardápio</div>
        <div class="tip">🥗 Varie as cores dos vegetais para garantir diferentes nutrientes</div>
        <div class="tip">💧 Beba pelo menos 2 litros de água por dia entre as refeições</div>
        <div class="tip">⏰ Mantenha horários regulares para as refeições</div>
      </div>
      
      <!-- Footer Premium -->
      <div class="footer">
        <div class="footer-left">
          <img src="${logoBase64}" alt="MaxNutrition" class="footer-logo" />
          <div class="footer-brand">MaxNutrition</div>
        </div>
        <div class="footer-right">
          <div class="footer-sofia">🤖 Sofia Nutricional</div>
          ${userFullName ? `<div class="footer-user">Preparado para: ${userFullName}</div>` : ''}
          <div class="footer-slogan">Sua jornada para uma vida mais saudável</div>
        </div>
      </div>
    </body></html>`;
  }, [mealPlan, title, avgMacros, userFullName, getDayName]);

  /**
   * Abre janela de impressão
   */
  const handlePrint = useCallback(() => {
    // Fechar o modal antes de imprimir
    onOpenChange?.(false);
    
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(generatePrintHTML());
        printWindow.document.close();
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
    }, 100);
  }, [onOpenChange, generatePrintHTML]);

  return {
    // Estado de dias expandidos
    expandedDays,
    toggleDay,
    
    // Médias de macros
    avgMacros,
    
    // Utilitários
    getDayName,
    
    // Impressão
    handlePrint,
    userFullName,
    
    // Integração com CompactMealPlanModal
    compactModalOpen,
    setCompactModalOpen,
    selectedDayForCompact,
    setSelectedDayForCompact,
    openDayDetail,
  };
};

export default useWeeklyPlanLogic;
