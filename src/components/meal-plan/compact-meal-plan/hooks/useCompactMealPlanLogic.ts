/**
 * Hook para lógica do CompactMealPlanModal
 * Gerencia navegação entre refeições, estado de impressão e dados da refeição atual
 * 
 * @param dayPlan - Plano do dia com refeições
 * @returns Lógica de navegação, refeição atual e função de impressão
 * 
 * **Validates: Requirements 1.2**
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DayPlan, Meal, MealType, MealConfig } from '@/types/meal-plan';

// Configuração visual de cada tipo de refeição
const MEAL_CONFIG: Record<MealType, MealConfig> = {
  breakfast: { 
    emoji: '🌅', 
    label: 'Café da Manhã',
    shortLabel: 'CAFÉ',
    gradient: 'from-orange-500 via-amber-500 to-yellow-500',
    bgGradient: 'from-orange-500/20 via-amber-500/10 to-transparent',
    accentColor: 'text-orange-500',
    borderColor: 'border-orange-500',
    time: '07:00'
  },
  lunch: { 
    emoji: '☀️', 
    label: 'Almoço',
    shortLabel: 'ALMOÇO',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    bgGradient: 'from-green-500/20 via-emerald-500/10 to-transparent',
    accentColor: 'text-green-500',
    borderColor: 'border-green-500',
    time: '12:00'
  },
  snack: { 
    emoji: '🍃', 
    label: 'Lanche',
    shortLabel: 'LANCHE',
    gradient: 'from-cyan-500 via-sky-500 to-blue-500',
    bgGradient: 'from-cyan-500/20 via-sky-500/10 to-transparent',
    accentColor: 'text-cyan-500',
    borderColor: 'border-cyan-500',
    time: '15:30'
  },
  dinner: { 
    emoji: '🌆', 
    label: 'Jantar',
    shortLabel: 'JANTAR',
    gradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
    bgGradient: 'from-purple-500/20 via-violet-500/10 to-transparent',
    accentColor: 'text-purple-500',
    borderColor: 'border-purple-500',
    time: '19:00'
  },
  supper: { 
    emoji: '🌙', 
    label: 'Ceia',
    shortLabel: 'CEIA',
    gradient: 'from-indigo-500 via-blue-600 to-slate-600',
    bgGradient: 'from-indigo-500/20 via-blue-600/10 to-transparent',
    accentColor: 'text-indigo-500',
    borderColor: 'border-indigo-500',
    time: '21:00'
  }
};

// Ordem das refeições
const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner', 'supper'];

export interface UseCompactMealPlanLogicProps {
  dayPlan: DayPlan;
}

export interface UseCompactMealPlanLogicReturn {
  // Estado
  activeTab: MealType;
  setActiveTab: (tab: MealType) => void;
  currentMealIndex: number;
  userName: string;
  
  // Dados derivados
  availableMeals: MealType[];
  currentMeal: Meal | null;
  currentMealConfig: MealConfig;
  mealTypes: MealType[];
  
  // Handlers
  handleNext: () => void;
  handlePrevious: () => void;
  handlePrint: () => void;
  
  // Helpers
  hasMeal: (type: MealType) => boolean;
  getMealConfig: (type: MealType) => MealConfig;
}

export const useCompactMealPlanLogic = ({
  dayPlan,
}: UseCompactMealPlanLogicProps): UseCompactMealPlanLogicReturn => {
  // Lista de refeições disponíveis (que existem no dayPlan)
  const availableMeals = useMemo(() => 
    MEAL_TYPES.filter(type => dayPlan.meals[type]),
    [dayPlan.meals]
  );

  // Estado da tab ativa
  const [activeTab, setActiveTab] = useState<MealType>(
    availableMeals[0] || 'breakfast'
  );
  
  // Nome do usuário para impressão
  const [userName, setUserName] = useState('');

  // Buscar nome do usuário
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const name = (user.user_metadata as { full_name?: string })?.full_name 
          || user.email?.split('@')[0] 
          || '';
        setUserName(name);
      }
    };
    fetchUser();
  }, []);

  // Índice atual na lista de refeições disponíveis
  const currentMealIndex = useMemo(() => 
    availableMeals.indexOf(activeTab),
    [availableMeals, activeTab]
  );

  // Refeição atual
  const currentMeal = useMemo(() => 
    dayPlan.meals[activeTab] || null,
    [dayPlan.meals, activeTab]
  );

  // Configuração visual da refeição atual
  const currentMealConfig = useMemo(() => 
    MEAL_CONFIG[activeTab],
    [activeTab]
  );

  // Navegação para refeição anterior
  const handlePrevious = useCallback(() => {
    if (currentMealIndex > 0) {
      setActiveTab(availableMeals[currentMealIndex - 1]);
    }
  }, [currentMealIndex, availableMeals]);

  // Navegação para próxima refeição
  const handleNext = useCallback(() => {
    if (currentMealIndex < availableMeals.length - 1) {
      setActiveTab(availableMeals[currentMealIndex + 1]);
    }
  }, [currentMealIndex, availableMeals]);

  // Verificar se uma refeição existe
  const hasMeal = useCallback((type: MealType) => 
    !!dayPlan.meals[type],
    [dayPlan.meals]
  );

  // Obter configuração de uma refeição
  const getMealConfig = useCallback((type: MealType) => 
    MEAL_CONFIG[type],
    []
  );

  // Função de impressão
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const meal = currentMeal;
    if (!meal) return;
    
    const cfg = currentMealConfig;
    const macros = meal.macros || { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    const ingredients = meal.ingredients || [];
    
    const currentDate = new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    // Logo em base64 para garantir que apareça no PDF
    const logoBase64 = 'data:image/jpeg;base64,/9j/4gJASUNDX1BST0ZJTEUAAQEAAAIwQURCRQIQAABtbnRyUkdCIFhZWiAHzwAGAAMAAAAAAABhY3NwQVBQTAAAAABub25lAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLUFEQkUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApjcHJ0AAAA/AAAADJkZXNjAAABMAAAAGt3dHB0AAABnAAAABRia3B0AAABsAAAABRyVFJDAAABxAAAAA5nVFJDAAAB1AAAAA5iVFJDAAAB5AAAAA5yWFlaAAAB9AAAABRnWFlaAAACCAAAABRiWFlaAAACHAAAABR0ZXh0AAAAAENvcHlyaWdodCAxOTk5IEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkAAAAZGVzYwAAAAAAAAARQWRvYmUgUkdCICgxOTk4KQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAPNRAAEAAAABFsxYWVogAAAAAAAAAAAAAAAAAAAAAGN1cnYAAAAAAAAAAQIzAABjdXJ2AAAAAAAAAAECMwAAY3VydgAAAAAAAAABAjMAAFhZWiAAAAAAAACcGAAAT6UAAAT8WFlaIAAAAAAAADSNAACgLAAAD5VYWVogAAAAAAAAJjEAABAvAAC+nP/bAIQACgcHBwgHCggICg8KCAoPEg0KCg0SFBAQEhAQFBQPEREREQ8UFBcYGhgXFB8fISEfHy0sLCwtMjIyMjIyMjIyMgELCgoLDAsODAwOEg4ODhIUDg4ODhQZERESEREZIBcUFBQUFyAcHhoaGh4cIyMgICMjKyspKysyMjIyMjIyMjIy/90ABAAL/+4ADkFkb2JlAGTAAAAAAf/AABEIALEAowMAIgABEQECEQH/xAGiAAEAAwACAQUAAAAAAAAAAAAABgcIBAUCAQMJCgsBAQAABAcAAAAAAAAAAAAAAAABAgMEBQYHCAkKCxAAAAQCAgQFCihfAAAAAAAAAAECAwQFBhEHNnSyEiE1QbMTFiIxQkNRc3WBCAkKFBUXGBkaIyQlJicoKSoyMzQ3ODk6REVGR0hJSlJVYWJykZOx0VNUVldYWVpjZGVmZ2hpanF2d3h5eoKDhIWGh4iJipKUlZaXmJmaoaKjpKWmp6ipqrS1tre4ubrBwsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vDx8vP09fb3+Pn6EQABAAAAAB6DAAAAAAAAAAAAAQIDBAUGBwgJChESExQVFhcYGRohIiMkJSYnKCkqMTIzNDU2Nzg5OkFCQ0RFRkdISUpRUlNUVVZXWFlaYWJjZGVmZ2hpanFyc3R1dnd4eXqBgoOEhYaHiImKkZKTlJWWl5iZmqGio6SlpqeoqaqxsrO0tba3uLm6wcLDxMXGx8jJytHS09TV1tfY2drh4uPk5ebn6Onq8PHy8/T19vf4+fr/2gAMAwAAARECEQA/ALmAAAAAAAAAAAAAAAAHXxs9lUE7lKIfInMdKSNRlhV5lgSOoQQUMgIVAVUMgoCBSSCCgoCA0oKCqUk7ABF36bwqXKmIZbiMOtSlEg68aoiwQ6uJpjNXVmbGAYRVUkiSSjLDLDrXXh6YUUMjpEkCGqtIQCmgouiaBDVWkExiJnBQ0SzCvOkl586m0+MKvQVnhEOWKofdfdeU6+pS3V4alKzZ6AWbLYtMZAMRKc04gjMqzOpRYSirPQGQgiCLrIhkMgKioqNKBSAiSKq9BQUBUVFR8HKAAFwVQAAAAAAAAAAD/0LmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9G5gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//Z';
    
    // Limpar ingredientes duplicados
    const cleanIngredients = ingredients.map(ing => {
      const cleaned = ing.replace(/\s*\([^)]+\)\s*\([^)]+\)$/, match => {
        const parts = match.split(') (');
        return parts[0] + ')';
      });
      return cleaned;
    });

    const ingredientsHTML = cleanIngredients.map((ing, idx) => 
      `<div class="ing"><span class="ing-num">${idx + 1}</span><span class="ing-text">${ing}</span></div>`
    ).join('');
    
    // Formatar modo de preparo em passos
    const preparoText = meal.modoPreparoElegante || meal.preparo || meal.description || '';
    const preparoSteps = preparoText
      .split(/\d+\.\s*/)
      .filter(s => s.trim())
      .map((step, idx) => {
        const [title, ...rest] = step.split(':');
        const hasTitle = rest.length > 0 && title.length < 30;
        return `
          <div class="step">
            <div class="step-num">${idx + 1}</div>
            <div class="step-content">
              ${hasTitle ? `<div class="step-title">${title.trim()}</div>` : ''}
              <div class="step-text">${hasTitle ? rest.join(':').trim() : step.trim()}</div>
            </div>
          </div>
        `;
      }).join('');
    
    // Dicas nutricionais baseadas no tipo de refeição
    const tipsMap: Record<string, string[]> = {
      breakfast: [
        '🌅 Café da manhã é a refeição mais importante para ativar o metabolismo',
        '💧 Beba um copo de água ao acordar antes de comer',
        '🍳 Proteínas no café ajudam a manter a saciedade até o almoço'
      ],
      lunch: [
        '☀️ Almoce com calma, mastigue bem cada garfada',
        '🥗 Comece sempre pelos vegetais para melhor digestão',
        '⏰ Evite líquidos durante a refeição para não diluir enzimas'
      ],
      snack: [
        '🍃 Lanches saudáveis evitam exageros nas refeições principais',
        '🥜 Prefira snacks com proteína e fibra para saciedade',
        '⏱️ Coma a cada 3-4 horas para manter energia estável'
      ],
      dinner: [
        '🌆 Jante pelo menos 2h antes de dormir para boa digestão',
        '🥬 Prefira refeições mais leves à noite',
        '🍵 Chás digestivos após o jantar ajudam no relaxamento'
      ],
      supper: [
        '🌙 Ceia leve ajuda na qualidade do sono',
        '🥛 Proteínas de lenta absorção são ideais antes de dormir',
        '🧘 Evite alimentos estimulantes como café e chocolate'
      ]
    };
    
    const tips = tipsMap[activeTab] || tipsMap.lunch;
    const tipsHTML = tips.map(tip => `<div class="tip">${tip}</div>`).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${cfg.label} - ${userName || 'MaxNutrition'}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', system-ui, sans-serif; 
            font-size: 10px;
            color: #1a1a1a;
            background: white;
            line-height: 1.4;
          }
          
          .watermark {
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(-25deg);
            font-size: 100px;
            font-weight: 900;
            color: rgba(34, 197, 94, 0.03);
            pointer-events: none;
            white-space: nowrap;
          }
          
          .page { 
            padding: 15px; 
            position: relative; 
            z-index: 1;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 12px;
            border-bottom: 3px solid #22c55e;
            margin-bottom: 15px;
          }
          .header-left { display: flex; align-items: center; gap: 12px; }
          .logo-img { height: 40px; width: auto; }
          .header-title { font-size: 24px; font-weight: 900; color: #16a34a; letter-spacing: -0.5px; }
          .header-subtitle { font-size: 11px; color: #666; margin-top: 2px; }
          .header-right { text-align: right; }
          .header-date { font-size: 10px; color: #666; margin-bottom: 4px; }
          .header-user { font-size: 12px; font-weight: 600; color: #22c55e; }
          
          .meal-card {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 14px 18px;
            border-radius: 12px;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
          }
          .meal-card.breakfast { background: linear-gradient(135deg, #f97316, #ea580c); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3); }
          .meal-card.lunch { background: linear-gradient(135deg, #22c55e, #16a34a); }
          .meal-card.snack { background: linear-gradient(135deg, #06b6d4, #0891b2); box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3); }
          .meal-card.dinner { background: linear-gradient(135deg, #8b5cf6, #7c3aed); box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3); }
          .meal-card.supper { background: linear-gradient(135deg, #6366f1, #4f46e5); box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
          
          .meal-left { display: flex; align-items: center; gap: 12px; }
          .meal-emoji { font-size: 32px; }
          .meal-type { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; opacity: 0.9; }
          .meal-title { font-size: 18px; font-weight: 800; margin-top: 2px; }
          .meal-kcal { 
            text-align: right;
            background: rgba(255,255,255,0.25);
            padding: 8px 14px;
            border-radius: 10px;
          }
          .kcal-value { font-size: 22px; font-weight: 900; }
          .kcal-label { font-size: 9px; opacity: 0.9; text-transform: uppercase; }
          
          .macros { display: flex; gap: 10px; margin-bottom: 12px; }
          .macro {
            flex: 1;
            text-align: center;
            padding: 10px 8px;
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-radius: 10px;
            border: 1px solid #86efac;
          }
          .macro-emoji { font-size: 16px; }
          .macro-value { font-size: 16px; font-weight: 800; color: #16a34a; }
          .macro-label { font-size: 8px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
          
          .content-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; flex: 1; }
          .section { border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden; }
          .section-head {
            background: #f8fafc;
            padding: 10px 12px;
            font-weight: 700;
            font-size: 11px;
            display: flex;
            align-items: center;
            gap: 8px;
            border-bottom: 1px solid #e5e7eb;
          }
          .section-head-emoji { font-size: 14px; }
          .section-body { padding: 10px 12px; }
          
          .ing-section .section-body { background: linear-gradient(180deg, #f0fdf4 0%, white 100%); }
          .ing { display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }
          .ing:last-child { border-bottom: none; }
          .ing-num {
            width: 20px; height: 20px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 9px; font-weight: 700; flex-shrink: 0;
          }
          .ing-text { font-size: 10px; color: #374151; line-height: 1.5; }
          
          .prep-section .section-body { background: linear-gradient(180deg, #fffbeb 0%, white 100%); }
          .step { display: flex; gap: 10px; padding: 7px 0; border-bottom: 1px solid #fde68a; }
          .step:last-child { border-bottom: none; }
          .step-num {
            width: 22px; height: 22px;
            background: linear-gradient(135deg, #f59e0b, #d97706);
            color: white; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; font-weight: 700; flex-shrink: 0;
          }
          .step-content { flex: 1; }
          .step-title { font-size: 10px; font-weight: 700; color: #92400e; margin-bottom: 3px; }
          .step-text { font-size: 10px; color: #374151; line-height: 1.5; }
          
          .tips-section {
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 12px;
            padding: 14px 16px;
            margin-bottom: 12px;
            border: 1px solid #fbbf24;
          }
          .tips-header {
            display: flex; align-items: center; gap: 8px;
            margin-bottom: 10px;
            font-size: 12px; font-weight: 700; color: #92400e;
          }
          .tips-header-emoji { font-size: 16px; }
          .tip { font-size: 10px; color: #78350f; padding: 5px 0; border-bottom: 1px dashed #fbbf24; line-height: 1.5; }
          .tip:last-child { border-bottom: none; }
          
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 16px;
            background: linear-gradient(135deg, #f0fdf4, #dcfce7);
            border-radius: 10px;
            border: 2px solid #86efac;
            margin-top: auto;
          }
          .footer-left { display: flex; align-items: center; gap: 10px; }
          .footer-logo-img { height: 24px; width: auto; }
          .footer-brand { font-size: 14px; font-weight: 800; color: #16a34a; }
          .footer-right { text-align: right; }
          .footer-sofia { font-size: 10px; color: #22c55e; font-weight: 600; }
          .footer-user { font-size: 9px; color: #666; }
          .footer-slogan { font-size: 8px; color: #94a3b8; margin-top: 4px; font-style: italic; }
        </style>
      </head>
      <body>
        <div class="watermark">MAXNUTRITION</div>
        <div class="page">
          <div class="header">
            <div class="header-left">
              <img src="${logoBase64}" alt="MaxNutrition" class="logo-img" />
              <div class="header-text">
                <div class="header-title">Seu Cardápio Personalizado</div>
                <div class="header-subtitle">Receita gerada pela Sofia Nutricional</div>
              </div>
            </div>
            <div class="header-right">
              <div class="header-date">📅 ${currentDate}</div>
              ${userName ? `<div class="header-user">👤 ${userName}</div>` : ''}
            </div>
          </div>
          
          <div class="meal-card ${activeTab}">
            <div class="meal-left">
              <div class="meal-emoji">${cfg.emoji}</div>
              <div>
                <div class="meal-type">${cfg.label} • ${cfg.time}</div>
                <div class="meal-title">${meal.title || 'Refeição'}</div>
              </div>
            </div>
            <div class="meal-kcal">
              <div class="kcal-value">🔥 ${macros.calories}</div>
              <div class="kcal-label">calorias</div>
            </div>
          </div>
          
          <div class="macros">
            <div class="macro">
              <div class="macro-emoji">💪</div>
              <div class="macro-value">${macros.protein}g</div>
              <div class="macro-label">Proteína</div>
            </div>
            <div class="macro">
              <div class="macro-emoji">⚡</div>
              <div class="macro-value">${macros.carbs}g</div>
              <div class="macro-label">Carboidrato</div>
            </div>
            <div class="macro">
              <div class="macro-emoji">🥑</div>
              <div class="macro-value">${macros.fat}g</div>
              <div class="macro-label">Gordura</div>
            </div>
            <div class="macro">
              <div class="macro-emoji">🥬</div>
              <div class="macro-value">${macros.fiber || 0}g</div>
              <div class="macro-label">Fibra</div>
            </div>
          </div>
          
          <div class="content-grid">
            <div class="section ing-section">
              <div class="section-head">
                <span class="section-head-emoji">🥬</span>
                Ingredientes (${cleanIngredients.length})
              </div>
              <div class="section-body">
                ${ingredientsHTML || '<div class="ing">Ingredientes não disponíveis</div>'}
              </div>
            </div>
            
            <div class="section prep-section">
              <div class="section-head">
                <span class="section-head-emoji">👨‍🍳</span>
                Modo de Preparo
              </div>
              <div class="section-body">
                ${preparoSteps || '<div class="step"><div class="step-text">Instruções não disponíveis</div></div>'}
              </div>
            </div>
          </div>
          
          <div class="tips-section">
            <div class="tips-header">
              <span class="tips-header-emoji">💡</span>
              Dicas da Sofia para esta refeição
            </div>
            ${tipsHTML}
          </div>
          
          <div class="footer">
            <div class="footer-left">
              <img src="${logoBase64}" alt="MaxNutrition" class="footer-logo-img" />
              <div class="footer-brand">MaxNutrition</div>
            </div>
            <div class="footer-right">
              <div class="footer-sofia">🤖 Sofia Nutricional</div>
              ${userName ? `<div class="footer-user">Preparado para: ${userName}</div>` : ''}
              <div class="footer-slogan">Sua jornada para uma vida mais saudável</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => { 
      printWindow.print(); 
      printWindow.close(); 
    };
  }, [currentMeal, currentMealConfig, activeTab, userName]);

  return {
    // Estado
    activeTab,
    setActiveTab,
    currentMealIndex,
    userName,
    
    // Dados derivados
    availableMeals,
    currentMeal,
    currentMealConfig,
    mealTypes: MEAL_TYPES,
    
    // Handlers
    handleNext,
    handlePrevious,
    handlePrint,
    
    // Helpers
    hasMeal,
    getMealConfig,
  };
};

export { MEAL_CONFIG, MEAL_TYPES };
export type { MealType };