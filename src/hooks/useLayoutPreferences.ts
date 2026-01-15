import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export interface LayoutPreferences {
  sidebarOrder: string[];
  hiddenSidebarItems: string[];
  defaultSection: string;
  dashboardCardsOrder: string[];
  hiddenDashboardCards: string[];
}

const DEFAULT_SIDEBAR_ORDER = [
  'dashboard', 'comunidade', 'goals', 'courses', 
  'missions', 'progress', 'sessions', 'challenges', 'saboteur-test', 
  'sofia-nutricional', 'dr-vital', 'exercicios', 'subscriptions'
];

const DEFAULT_DASHBOARD_CARDS = ['hero', 'evolution', 'actions', 'mascot'];

const defaultPreferences: LayoutPreferences = {
  sidebarOrder: DEFAULT_SIDEBAR_ORDER,
  hiddenSidebarItems: [],
  defaultSection: 'dashboard',
  dashboardCardsOrder: DEFAULT_DASHBOARD_CARDS,
  hiddenDashboardCards: [],
};

export const useLayoutPreferences = (user: User | null) => {
  const [preferences, setPreferences] = useState<LayoutPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_layout_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          sidebarOrder: data.sidebar_order || DEFAULT_SIDEBAR_ORDER,
          hiddenSidebarItems: data.hidden_sidebar_items || [],
          defaultSection: data.default_section || 'dashboard',
          dashboardCardsOrder: data.dashboard_cards_order || DEFAULT_DASHBOARD_CARDS,
          hiddenDashboardCards: data.hidden_dashboard_cards || [],
        });
      }
    } catch (err) {
      console.error('Error fetching layout preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = useCallback(async (newPrefs: Partial<LayoutPreferences>) => {
    if (!user) return false;

    const updatedPrefs = { ...preferences, ...newPrefs };
    setPreferences(updatedPrefs);

    try {
      const { error } = await supabase
        .from('user_layout_preferences')
        .upsert({
          user_id: user.id,
          sidebar_order: updatedPrefs.sidebarOrder,
          hidden_sidebar_items: updatedPrefs.hiddenSidebarItems,
          default_section: updatedPrefs.defaultSection,
          dashboard_cards_order: updatedPrefs.dashboardCardsOrder,
          hidden_dashboard_cards: updatedPrefs.hiddenDashboardCards,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error saving layout preferences:', err);
      return false;
    }
  }, [user, preferences]);

  const toggleSidebarItem = useCallback((itemId: string) => {
    const hidden = preferences.hiddenSidebarItems.includes(itemId)
      ? preferences.hiddenSidebarItems.filter(id => id !== itemId)
      : [...preferences.hiddenSidebarItems, itemId];
    
    return savePreferences({ hiddenSidebarItems: hidden });
  }, [preferences.hiddenSidebarItems, savePreferences]);

  const reorderSidebar = useCallback((newOrder: string[]) => {
    return savePreferences({ sidebarOrder: newOrder });
  }, [savePreferences]);

  const setDefaultSection = useCallback((section: string) => {
    return savePreferences({ defaultSection: section });
  }, [savePreferences]);

  const getVisibleSidebarItems = useCallback(() => {
    return preferences.sidebarOrder.filter(
      id => !preferences.hiddenSidebarItems.includes(id)
    );
  }, [preferences.sidebarOrder, preferences.hiddenSidebarItems]);

  return {
    preferences,
    loading,
    savePreferences,
    toggleSidebarItem,
    reorderSidebar,
    setDefaultSection,
    getVisibleSidebarItems,
    refetch: fetchPreferences,
  };
};
