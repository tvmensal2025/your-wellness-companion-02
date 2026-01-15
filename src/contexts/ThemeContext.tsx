import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

// Preset de cores disponíveis - com variações completas
export const THEME_PRESETS = [
  { 
    id: 'green', 
    name: 'Verde', 
    primary: '142 76% 36%', 
    primaryLight: '142 76% 90%',
    primaryDark: '142 76% 25%',
    accent: '142 70% 45%', 
    gradient: 'from-green-500 to-emerald-600',
    chart1: '142 76% 50%',
    chart2: '160 84% 39%',
    sidebar: '142 76% 45%',
  },
  { 
    id: 'blue', 
    name: 'Azul', 
    primary: '217 91% 60%', 
    primaryLight: '217 91% 92%',
    primaryDark: '217 91% 45%',
    accent: '199 89% 48%', 
    gradient: 'from-blue-500 to-cyan-600',
    chart1: '217 91% 60%',
    chart2: '199 89% 48%',
    sidebar: '217 91% 60%',
  },
  { 
    id: 'purple', 
    name: 'Roxo', 
    primary: '262 83% 58%', 
    primaryLight: '262 83% 92%',
    primaryDark: '262 83% 45%',
    accent: '280 65% 60%', 
    gradient: 'from-purple-500 to-violet-600',
    chart1: '262 83% 58%',
    chart2: '280 65% 60%',
    sidebar: '262 83% 58%',
  },
  { 
    id: 'pink', 
    name: 'Rosa', 
    primary: '330 81% 60%', 
    primaryLight: '330 81% 92%',
    primaryDark: '330 81% 45%',
    accent: '340 75% 55%', 
    gradient: 'from-pink-500 to-rose-600',
    chart1: '330 81% 60%',
    chart2: '340 75% 55%',
    sidebar: '330 81% 60%',
  },
  { 
    id: 'orange', 
    name: 'Laranja', 
    primary: '25 95% 53%', 
    primaryLight: '25 95% 92%',
    primaryDark: '25 95% 40%',
    accent: '32 95% 44%', 
    gradient: 'from-orange-500 to-amber-600',
    chart1: '25 95% 53%',
    chart2: '32 95% 44%',
    sidebar: '25 95% 53%',
  },
  { 
    id: 'teal', 
    name: 'Turquesa', 
    primary: '174 72% 40%', 
    primaryLight: '174 72% 90%',
    primaryDark: '174 72% 30%',
    accent: '168 76% 42%', 
    gradient: 'from-teal-500 to-cyan-600',
    chart1: '174 72% 40%',
    chart2: '168 76% 42%',
    sidebar: '174 72% 40%',
  },
  { 
    id: 'red', 
    name: 'Vermelho', 
    primary: '0 84% 60%', 
    primaryLight: '0 84% 92%',
    primaryDark: '0 84% 45%',
    accent: '350 80% 55%', 
    gradient: 'from-red-500 to-rose-600',
    chart1: '0 84% 60%',
    chart2: '350 80% 55%',
    sidebar: '0 84% 60%',
  },
  { 
    id: 'indigo', 
    name: 'Índigo', 
    primary: '239 84% 67%', 
    primaryLight: '239 84% 92%',
    primaryDark: '239 84% 50%',
    accent: '243 75% 59%', 
    gradient: 'from-indigo-500 to-purple-600',
    chart1: '239 84% 67%',
    chart2: '243 75% 59%',
    sidebar: '239 84% 67%',
  },
] as const;

export type ThemePresetId = typeof THEME_PRESETS[number]['id'];

export interface UserTheme {
  presetId: ThemePresetId;
  customPrimary?: string;
  customAccent?: string;
}

interface ThemeContextType {
  theme: UserTheme;
  currentPreset: typeof THEME_PRESETS[number];
  setTheme: (theme: UserTheme) => Promise<void>;
  setPreset: (presetId: ThemePresetId) => Promise<void>;
  isLoading: boolean;
  hasSelectedTheme: boolean;
}

const defaultTheme: UserTheme = { presetId: 'green' };

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Aplica as variáveis CSS do tema - COMPLETO
const applyThemeToDOM = (preset: typeof THEME_PRESETS[number], customPrimary?: string, customAccent?: string) => {
  const root = document.documentElement;
  const primary = customPrimary || preset.primary;
  const accent = customAccent || preset.accent;
  
  // === VARIÁVEIS PRINCIPAIS ===
  root.style.setProperty('--primary', primary);
  root.style.setProperty('--primary-foreground', '0 0% 100%');
  root.style.setProperty('--accent', accent);
  root.style.setProperty('--ring', primary);
  
  // === VARIÁVEIS DE SIDEBAR ===
  root.style.setProperty('--sidebar-primary', preset.sidebar);
  root.style.setProperty('--sidebar-primary-foreground', '0 0% 100%');
  root.style.setProperty('--sidebar-ring', preset.sidebar);
  
  // === VARIÁVEIS DE CHARTS ===
  root.style.setProperty('--chart-1', preset.chart1);
  root.style.setProperty('--chart-2', preset.chart2);
  
  // === VARIÁVEIS EXTRAS PARA COMPONENTES ===
  // Estas variáveis são usadas por componentes que precisam de variações da cor primária
  root.style.setProperty('--theme-primary-light', preset.primaryLight);
  root.style.setProperty('--theme-primary-dark', preset.primaryDark);
  
  // === DESTRUCTIVE mantém vermelho para erros ===
  // Não alteramos --destructive pois é para erros
  
  // Salva no localStorage para carregamento rápido
  localStorage.setItem('user-theme', JSON.stringify({ presetId: preset.id, customPrimary, customAccent }));
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const UserThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [theme, setThemeState] = useState<UserTheme>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSelectedTheme, setHasSelectedTheme] = useState(false);

  const currentPreset = THEME_PRESETS.find(p => p.id === theme.presetId) || THEME_PRESETS[0];

  // Carrega tema do localStorage primeiro (rápido)
  useEffect(() => {
    const cached = localStorage.getItem('user-theme');
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as UserTheme;
        setThemeState(parsed);
        const preset = THEME_PRESETS.find(p => p.id === parsed.presetId) || THEME_PRESETS[0];
        applyThemeToDOM(preset, parsed.customPrimary, parsed.customAccent);
        setHasSelectedTheme(true);
      } catch (e) {
        console.error('Error parsing cached theme:', e);
      }
    }
  }, []);

  // Carrega tema do banco de dados
  useEffect(() => {
    const loadTheme = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_layout_preferences')
          .select('sidebar_order')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        // Usa sidebar_order[0] como hack temporário para armazenar tema
        // Formato: "theme:presetId" ou "theme:presetId:customPrimary:customAccent"
        if (data?.sidebar_order) {
          const themeEntry = data.sidebar_order.find((s: string) => s.startsWith('theme:'));
          if (themeEntry) {
            const parts = themeEntry.split(':');
            const presetId = parts[1] as ThemePresetId;
            const customPrimary = parts[2];
            const customAccent = parts[3];
            
            const newTheme: UserTheme = { presetId, customPrimary, customAccent };
            setThemeState(newTheme);
            setHasSelectedTheme(true);
            
            const preset = THEME_PRESETS.find(p => p.id === presetId) || THEME_PRESETS[0];
            applyThemeToDOM(preset, customPrimary, customAccent);
          }
        }
      } catch (err) {
        console.error('Error loading theme:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [user]);

  // Aplica tema quando muda
  useEffect(() => {
    applyThemeToDOM(currentPreset, theme.customPrimary, theme.customAccent);
  }, [theme, currentPreset]);

  const setTheme = useCallback(async (newTheme: UserTheme) => {
    setThemeState(newTheme);
    setHasSelectedTheme(true);
    
    const preset = THEME_PRESETS.find(p => p.id === newTheme.presetId) || THEME_PRESETS[0];
    applyThemeToDOM(preset, newTheme.customPrimary, newTheme.customAccent);

    if (!user) return;

    try {
      // Busca sidebar_order atual
      const { data } = await supabase
        .from('user_layout_preferences')
        .select('sidebar_order')
        .eq('user_id', user.id)
        .maybeSingle();

      let sidebarOrder = data?.sidebar_order || [];
      
      // Remove tema antigo e adiciona novo
      sidebarOrder = sidebarOrder.filter((s: string) => !s.startsWith('theme:'));
      const themeEntry = `theme:${newTheme.presetId}${newTheme.customPrimary ? ':' + newTheme.customPrimary : ''}${newTheme.customAccent ? ':' + newTheme.customAccent : ''}`;
      sidebarOrder.push(themeEntry);

      await supabase
        .from('user_layout_preferences')
        .upsert({
          user_id: user.id,
          sidebar_order: sidebarOrder,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });
    } catch (err) {
      console.error('Error saving theme:', err);
    }
  }, [user]);

  const setPreset = useCallback(async (presetId: ThemePresetId) => {
    await setTheme({ presetId });
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, currentPreset, setTheme, setPreset, isLoading, hasSelectedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
