-- Tabela para preferências de personalização do usuário
CREATE TABLE public.user_layout_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  -- Ordem dos itens no menu lateral (array de IDs)
  sidebar_order TEXT[] DEFAULT ARRAY['dashboard', 'missions', 'progress', 'goals', 'courses', 'sessions', 'comunidade', 'challenges', 'saboteur-test', 'sofia-nutricional', 'dr-vital', 'exercicios', 'subscriptions'],
  -- Itens ocultos do menu lateral
  hidden_sidebar_items TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Seção padrão ao abrir o dashboard
  default_section TEXT DEFAULT 'dashboard',
  -- Ordem dos cards no dashboard principal
  dashboard_cards_order TEXT[] DEFAULT ARRAY['hero', 'evolution', 'actions', 'mascot'],
  -- Cards ocultos no dashboard
  hidden_dashboard_cards TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_layout_preferences ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own preferences"
ON public.user_layout_preferences
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.user_layout_preferences
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.user_layout_preferences
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
ON public.user_layout_preferences
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_layout_preferences_updated_at
BEFORE UPDATE ON public.user_layout_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();