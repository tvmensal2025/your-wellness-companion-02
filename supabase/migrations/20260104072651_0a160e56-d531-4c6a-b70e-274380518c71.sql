-- Recriar tabela google_fit_data com estrutura correta para a edge function
DROP TABLE IF EXISTS google_fit_data CASCADE;

CREATE TABLE public.google_fit_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    
    -- Dados básicos
    steps INTEGER DEFAULT 0,
    calories INTEGER DEFAULT 0,
    distance_meters INTEGER DEFAULT 0,
    
    -- Dados cardiovasculares
    heart_rate_avg INTEGER DEFAULT 0,
    heart_rate_min INTEGER DEFAULT 0,
    heart_rate_max INTEGER DEFAULT 0,
    heart_rate_resting INTEGER,
    active_minutes INTEGER DEFAULT 0,
    
    -- Dados de sono
    sleep_hours DECIMAL(4,2) DEFAULT 0,
    sleep_efficiency DECIMAL(5,2),
    sleep_stages JSONB,
    
    -- Dados antropométricos
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    bmi DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    muscle_mass_kg DECIMAL(5,2),
    
    -- Dados de exercício
    exercise_minutes INTEGER DEFAULT 0,
    workout_sessions INTEGER DEFAULT 0,
    exercise_calories INTEGER DEFAULT 0,
    
    -- Dados de hidratação
    hydration_ml INTEGER DEFAULT 0,
    water_intake_ml INTEGER DEFAULT 0,
    
    -- Dados de nutrição
    nutrition_calories INTEGER DEFAULT 0,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    
    -- Dados de oxigenação
    oxygen_saturation DECIMAL(5,2),
    respiratory_rate DECIMAL(5,2),
    
    -- Dados de ambiente
    location TEXT,
    weather TEXT,
    temperature_celsius DECIMAL(5,2),
    
    -- Dados de dispositivos
    device_type TEXT,
    data_source TEXT,
    
    -- Metadados
    sync_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    data_quality INTEGER DEFAULT 0,
    raw_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date)
);

-- Habilitar RLS
ALTER TABLE public.google_fit_data ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own Google Fit data" ON public.google_fit_data
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own Google Fit data" ON public.google_fit_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own Google Fit data" ON public.google_fit_data
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own Google Fit data" ON public.google_fit_data
    FOR DELETE USING (auth.uid() = user_id);

-- Política para service role
CREATE POLICY "Service role can manage all Google Fit data" ON public.google_fit_data
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Índices para performance
CREATE INDEX idx_google_fit_data_user_date ON public.google_fit_data(user_id, date);
CREATE INDEX idx_google_fit_data_date ON public.google_fit_data(date);
CREATE INDEX idx_google_fit_data_sync ON public.google_fit_data(sync_timestamp);

-- Comentários
COMMENT ON TABLE public.google_fit_data IS 'Dados do Google Fit sincronizados diariamente';
COMMENT ON COLUMN public.google_fit_data.data_quality IS 'Qualidade dos dados de 0-100 baseado na quantidade de métricas disponíveis';