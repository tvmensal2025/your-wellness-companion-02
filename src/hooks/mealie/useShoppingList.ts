/**
 * @file useShoppingList Hook
 * @description Hook para gerenciar lista de compras semanal
 * 
 * Funcionalidade:
 * - Gera lista de compras baseada nas refeições da semana
 * - Agrupa ingredientes por categoria
 * - Remove duplicatas e soma quantidades
 * - Envia lista via WhatsApp
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ShoppingList, ShoppingItem, ShoppingListByCategory } from '@/types/mealie';

interface UseShoppingListReturn {
  generating: boolean;
  error: string | null;
  generateList: (weekStart: Date, weekEnd: Date) => Promise<ShoppingList | null>;
  sendToWhatsApp: (listId: string) => Promise<boolean>;
}

export function useShoppingList(userId?: string): UseShoppingListReturn {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateList = async (
    weekStart: Date,
    weekEnd: Date
  ): Promise<ShoppingList | null> => {
    if (!userId) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setGenerating(true);
      setError(null);

      const startStr = weekStart.toISOString().split('T')[0];
      const endStr = weekEnd.toISOString().split('T')[0];

      // Buscar todas as refeições da semana
      const { data: meals, error: mealsError } = await supabase
        .from('sofia_food_analysis')
        .select('foods_detected')
        .eq('user_id', userId)
        .gte('created_at', `${startStr}T00:00:00`)
        .lte('created_at', `${endStr}T23:59:59`);

      if (mealsError) throw mealsError;

      // Extrair todos os ingredientes
      const allIngredients: Map<string, ShoppingItem> = new Map();

      meals?.forEach((meal: any) => {
        if (!Array.isArray(meal.foods_detected)) return;

        meal.foods_detected.forEach((food: any) => {
          const name = typeof food === 'string' ? food : food.nome || food.name;
          const quantity = typeof food === 'object' ? food.quantidade || 1 : 1;
          const unit = typeof food === 'object' ? food.unidade || 'g' : 'g';

          if (!name) return;

          // Normalizar nome
          const normalizedName = name.toLowerCase().trim();

          // Se já existe, somar quantidade
          if (allIngredients.has(normalizedName)) {
            const existing = allIngredients.get(normalizedName)!;
            existing.quantity += quantity;
          } else {
            // Categorizar ingrediente
            const category = categorizeIngredient(normalizedName);

            allIngredients.set(normalizedName, {
              name,
              quantity,
              unit,
              category,
              checked: false,
            });
          }
        });
      });

      // Converter para array
      const items = Array.from(allIngredients.values());

      // Criar lista no banco
      const { data: shoppingList, error: insertError } = await supabase
        .from('shopping_lists')
        .insert({
          user_id: userId,
          week_start: startStr,
          week_end: endStr,
          items: items,
          sent_to_whatsapp: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      return {
        id: shoppingList.id,
        userId,
        weekStart,
        weekEnd,
        items,
        createdAt: new Date(shoppingList.created_at),
        sentToWhatsApp: false,
      };
    } catch (err) {
      console.error('Erro ao gerar lista de compras:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const sendToWhatsApp = async (listId: string): Promise<boolean> => {
    if (!userId) {
      setError('Usuário não autenticado');
      return false;
    }

    try {
      setGenerating(true);
      setError(null);

      // Buscar lista
      const { data: list, error: listError } = await supabase
        .from('shopping_lists')
        .select('*')
        .eq('id', listId)
        .single();

      if (listError) throw listError;

      // Buscar telefone do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      if (!profile?.phone) {
        setError('Telefone não cadastrado');
        return false;
      }

      // Agrupar por categoria
      const grouped = groupByCategory(list.items);

      // Formatar mensagem
      const message = formatWhatsAppMessage(grouped, list.week_start, list.week_end);

      // Enviar via edge function
      const { error: sendError } = await supabase.functions.invoke(
        'whatsapp-nutrition-webhook',
        {
          body: {
            action: 'send_shopping_list',
            phone: profile.phone,
            message,
          },
        }
      );

      if (sendError) throw sendError;

      // Marcar como enviada
      await supabase
        .from('shopping_lists')
        .update({ sent_to_whatsapp: true })
        .eq('id', listId);

      return true;
    } catch (err) {
      console.error('Erro ao enviar lista via WhatsApp:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return false;
    } finally {
      setGenerating(false);
    }
  };

  return {
    generating,
    error,
    generateList,
    sendToWhatsApp,
  };
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function categorizeIngredient(name: string): string {
  const lowerName = name.toLowerCase();

  // Proteínas
  if (
    lowerName.includes('frango') ||
    lowerName.includes('carne') ||
    lowerName.includes('peixe') ||
    lowerName.includes('salmão') ||
    lowerName.includes('atum') ||
    lowerName.includes('ovo') ||
    lowerName.includes('presunto') ||
    lowerName.includes('peito de peru')
  ) {
    return 'Proteínas';
  }

  // Grãos e Cereais
  if (
    lowerName.includes('arroz') ||
    lowerName.includes('aveia') ||
    lowerName.includes('pão') ||
    lowerName.includes('macarrão') ||
    lowerName.includes('massa') ||
    lowerName.includes('feijão') ||
    lowerName.includes('lentilha') ||
    lowerName.includes('grão')
  ) {
    return 'Grãos e Cereais';
  }

  // Vegetais
  if (
    lowerName.includes('alface') ||
    lowerName.includes('tomate') ||
    lowerName.includes('cebola') ||
    lowerName.includes('alho') ||
    lowerName.includes('brócolis') ||
    lowerName.includes('couve') ||
    lowerName.includes('cenoura') ||
    lowerName.includes('pimentão') ||
    lowerName.includes('salada')
  ) {
    return 'Vegetais';
  }

  // Tubérculos
  if (
    lowerName.includes('batata') ||
    lowerName.includes('mandioca') ||
    lowerName.includes('inhame') ||
    lowerName.includes('aipim')
  ) {
    return 'Tubérculos';
  }

  // Frutas
  if (
    lowerName.includes('banana') ||
    lowerName.includes('maçã') ||
    lowerName.includes('laranja') ||
    lowerName.includes('morango') ||
    lowerName.includes('uva') ||
    lowerName.includes('abacaxi') ||
    lowerName.includes('melancia') ||
    lowerName.includes('mamão')
  ) {
    return 'Frutas';
  }

  // Laticínios
  if (
    lowerName.includes('leite') ||
    lowerName.includes('iogurte') ||
    lowerName.includes('queijo') ||
    lowerName.includes('requeijão')
  ) {
    return 'Laticínios';
  }

  // Temperos e Óleos
  if (
    lowerName.includes('azeite') ||
    lowerName.includes('óleo') ||
    lowerName.includes('sal') ||
    lowerName.includes('pimenta') ||
    lowerName.includes('tempero')
  ) {
    return 'Temperos e Óleos';
  }

  return 'Outros';
}

function groupByCategory(items: ShoppingItem[]): ShoppingListByCategory {
  const grouped: ShoppingListByCategory = {};

  items.forEach((item) => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  // Ordenar categorias
  const orderedCategories = [
    'Proteínas',
    'Grãos e Cereais',
    'Vegetais',
    'Tubérculos',
    'Frutas',
    'Laticínios',
    'Temperos e Óleos',
    'Outros',
  ];

  const ordered: ShoppingListByCategory = {};
  orderedCategories.forEach((cat) => {
    if (grouped[cat]) {
      ordered[cat] = grouped[cat];
    }
  });

  return ordered;
}

function formatWhatsAppMessage(
  grouped: ShoppingListByCategory,
  weekStart: string,
  weekEnd: string
): string {
  const startDate = new Date(weekStart);
  const endDate = new Date(weekEnd);

  // Formato Premium com negrito e emojis
  let message = `🛒 *LISTA DE COMPRAS* 💚\n`;
  message += `📅 *Semana de ${startDate.getDate()}/${startDate.getMonth() + 1} a ${endDate.getDate()}/${endDate.getMonth() + 1}*\n\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Emojis por categoria
  const categoryEmojis: Record<string, string> = {
    'Proteínas': '🍗',
    'Grãos e Cereais': '🌾',
    'Vegetais': '🥬',
    'Tubérculos': '🥔',
    'Frutas': '🍌',
    'Laticínios': '🥛',
    'Temperos e Óleos': '🧈',
    'Outros': '📦',
  };

  Object.entries(grouped).forEach(([category, items]) => {
    const emoji = categoryEmojis[category] || '📦';
    message += `${emoji} *${category.toUpperCase()}*\n`;

    items.forEach((item) => {
      const quantity = item.quantity > 1 ? `${Math.round(item.quantity)}${item.unit}` : '';
      message += `☐ ${item.name}${quantity ? ` → *${quantity}*` : ''}\n`;
    });

    message += `\n`;
  });

  message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `✅ *Marque os itens conforme compra!*\n`;
  message += `📤 *Compartilhe com sua família*\n`;
  message += `🛍️ *Boa compra!*\n\n`;
  message += `_Sofia 💚_`;

  return message;
}
