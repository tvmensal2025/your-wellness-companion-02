CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: assign_session_to_all_users(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assign_session_to_all_users(session_id_param uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  users_count INTEGER;
BEGIN
  -- Verificar se a sessão existe
  IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id_param) THEN
    RAISE EXCEPTION 'Sessão não encontrada';
  END IF;

  -- Inserir atribuições para todos os usuários que ainda não têm essa sessão
  INSERT INTO public.user_sessions (user_id, session_id, status, progress, assigned_at)
  SELECT 
    p.user_id,
    session_id_param,
    'pending',
    0,
    NOW()
  FROM public.profiles p
  WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_sessions us 
    WHERE us.user_id = p.user_id 
      AND us.session_id = session_id_param
  );

  GET DIAGNOSTICS users_count = ROW_COUNT;
  
  RAISE NOTICE 'Sessão atribuída a % usuários', users_count;
  RETURN TRUE;
END;
$$;


--
-- Name: assign_session_to_users(uuid, uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.assign_session_to_users(session_id_param uuid, user_ids_param uuid[]) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  users_count INTEGER;
BEGIN
  -- Verificar se a sessão existe
  IF NOT EXISTS (SELECT 1 FROM public.sessions WHERE id = session_id_param) THEN
    RAISE EXCEPTION 'Sessão não encontrada';
  END IF;

  -- Inserir atribuições para os usuários selecionados que ainda não têm essa sessão
  INSERT INTO public.user_sessions (user_id, session_id, status, progress, assigned_at)
  SELECT 
    unnest(user_ids_param),
    session_id_param,
    'pending',
    0,
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 
    FROM public.user_sessions us 
    WHERE us.user_id = unnest(user_ids_param)
      AND us.session_id = session_id_param
  );

  GET DIAGNOSTICS users_count = ROW_COUNT;
  
  RAISE NOTICE 'Sessão atribuída a % usuários', users_count;
  RETURN TRUE;
END;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Inserir perfil básico
    INSERT INTO public.profiles (
        user_id,
        email,
        full_name,
        phone,
        birth_date,
        city,
        state,
        height,
        gender,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        (NEW.raw_user_meta_data->>'birth_date')::date,
        NEW.raw_user_meta_data->>'city',
        NEW.raw_user_meta_data->>'state',
        (NEW.raw_user_meta_data->>'height')::decimal,
        NEW.raw_user_meta_data->>'gender',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE
    SET 
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        phone = COALESCE(EXCLUDED.phone, profiles.phone),
        birth_date = COALESCE(EXCLUDED.birth_date, profiles.birth_date),
        city = COALESCE(EXCLUDED.city, profiles.city),
        state = COALESCE(EXCLUDED.state, profiles.state),
        height = COALESCE(EXCLUDED.height, profiles.height),
        gender = COALESCE(EXCLUDED.gender, profiles.gender),
        updated_at = NOW();
    
    -- Inserir role padrão
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falha a criação do usuário
        RAISE WARNING 'Erro ao criar perfil para usuário %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;


--
-- Name: has_role(uuid, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role text) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::TEXT = _role
  )
$$;


--
-- Name: is_admin_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin_user() RETURNS boolean
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  RETURN public.has_role(auth.uid(), 'admin');
END;
$$;


--
-- Name: update_alimentos_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_alimentos_updated_at() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: achievement_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.achievement_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    achievement_type text,
    achievement_name text,
    description text,
    milestone_value numeric(10,2),
    current_value numeric(10,2),
    target_value numeric(10,2),
    progress_percentage numeric(5,2),
    badge_icon text,
    unlocked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: active_principles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.active_principles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    principle_name text NOT NULL,
    category text,
    description text,
    health_benefits text[],
    mechanism_of_action text,
    bioavailability text,
    food_sources text[],
    recommended_intake text,
    contraindications text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: activity_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    category_name character varying(100) NOT NULL,
    total_sessions integer DEFAULT 0,
    total_points integer DEFAULT 0,
    avg_score numeric DEFAULT 0,
    last_activity_date date,
    color_code character varying(7) DEFAULT '#3B82F6'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: activity_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    category_id uuid,
    session_date date DEFAULT CURRENT_DATE,
    duration_minutes integer,
    intensity_level integer,
    satisfaction_score integer,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    admin_id uuid,
    action text,
    target_type text,
    target_id text,
    details jsonb,
    ip_address text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: advanced_daily_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.advanced_daily_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    tracking_date date DEFAULT CURRENT_DATE,
    weight_kg numeric(5,2),
    body_fat_percentage numeric(4,2),
    muscle_mass_kg numeric(5,2),
    waist_cm numeric(5,2),
    systolic_bp integer,
    diastolic_bp integer,
    resting_heart_rate integer,
    calories_consumed integer,
    protein_g numeric(6,2),
    carbs_g numeric(6,2),
    fats_g numeric(6,2),
    water_ml integer,
    supplements_taken text[],
    steps integer,
    active_minutes integer,
    exercise_duration_minutes integer,
    exercise_type text,
    calories_burned integer,
    sleep_hours numeric(4,2),
    sleep_quality integer,
    bedtime time without time zone,
    wake_time time without time zone,
    mood_rating integer,
    stress_level integer,
    anxiety_level integer,
    energy_level integer,
    focus_level integer,
    symptoms text[],
    pain_level integer,
    pain_location text,
    medications_taken text[],
    notes text,
    photo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: ai_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_configurations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    functionality character varying(100) NOT NULL,
    service character varying(50) DEFAULT 'gemini'::character varying NOT NULL,
    model character varying(100) DEFAULT 'gemini-pro'::character varying NOT NULL,
    max_tokens integer DEFAULT 4096 NOT NULL,
    temperature numeric(3,2) DEFAULT 0.8 NOT NULL,
    is_enabled boolean DEFAULT true NOT NULL,
    system_prompt text,
    personality character varying(20) DEFAULT 'drvital'::character varying,
    level character varying(20) DEFAULT 'meio'::character varying,
    cost_per_request numeric(10,6) DEFAULT 0.01,
    priority integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: ai_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    document_type text,
    content jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: ai_fallback_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_fallback_configs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    functionality text NOT NULL,
    primary_service text NOT NULL,
    fallback_service text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: ai_presets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_presets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    preset_name text NOT NULL,
    preset_level text NOT NULL,
    service text NOT NULL,
    model text NOT NULL,
    description text,
    temperature numeric NOT NULL,
    max_tokens integer NOT NULL,
    is_recommended boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ai_system_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_system_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    log_type text,
    service_name text,
    operation text,
    status text,
    details jsonb,
    execution_time_ms integer,
    error_message text,
    user_id uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: ai_usage_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_usage_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    service_name text,
    model text,
    prompt_tokens integer,
    completion_tokens integer,
    total_tokens integer,
    cost numeric,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: alimentos_alias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alimentos_alias (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alimento_id uuid,
    nome_alias text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: alimentos_completos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alimentos_completos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome text NOT NULL,
    categoria text,
    aliases text[],
    unidade_padrao text DEFAULT '100g'::text,
    peso_medio_g numeric,
    is_verified boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: alimentos_principios_ativos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alimentos_principios_ativos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alimento_id uuid,
    alimento_nome text,
    principio_ativo text NOT NULL,
    concentracao text,
    unidade_medida text,
    beneficios text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: análise_estatísticas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."análise_estatísticas" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    periodo text NOT NULL,
    metricas jsonb NOT NULL,
    tendencias jsonb,
    insights text[],
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assessment_name text NOT NULL,
    assessment_type text,
    description text,
    questions jsonb,
    scoring_system jsonb,
    duration_minutes integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: avaliações_sabotadores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."avaliações_sabotadores" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    data_avaliacao date DEFAULT CURRENT_DATE NOT NULL,
    sabotadores_identificados jsonb,
    pontuacao_total integer,
    nivel_intensidade text,
    recomendacoes text[],
    plano_acao text,
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: backups_anamnese_do_usuário; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."backups_anamnese_do_usuário" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    dados_backup jsonb NOT NULL,
    versao_backup text,
    motivo_backup text,
    data_backup timestamp with time zone DEFAULT now(),
    restaurado boolean DEFAULT false,
    data_restauracao timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: bakery_pool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bakery_pool (
    food_name text NOT NULL,
    category text DEFAULT 'bakery'::text
);


--
-- Name: base_de_conhecimento_da_empresa; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.base_de_conhecimento_da_empresa (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    categoria text,
    titulo text,
    conteudo text,
    tags text[],
    prioridade integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: base_de_conhecimento_sofia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.base_de_conhecimento_sofia (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    categoria text NOT NULL,
    topico text NOT NULL,
    conteudo text NOT NULL,
    tags text[],
    relevancia integer DEFAULT 5,
    fonte text,
    referencias text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: bean_pool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bean_pool (
    food_name text NOT NULL,
    category text DEFAULT 'beans'::text
);


--
-- Name: bioimpedance_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bioimpedance_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    measurement_id uuid,
    analysis_result jsonb,
    recommendations text,
    health_score integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: carb_pool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carb_pool (
    food_name text NOT NULL,
    category text DEFAULT 'carbs'::text
);


--
-- Name: challenge_daily_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_daily_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    participation_id uuid NOT NULL,
    challenge_name text,
    log_date date DEFAULT CURRENT_DATE NOT NULL,
    is_completed boolean DEFAULT false,
    numeric_value numeric,
    value_logged text,
    notes text,
    photo_url text,
    points_earned integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: challenge_group_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_group_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    challenge_id uuid NOT NULL,
    message text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: challenge_leaderboard; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_leaderboard (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    challenge_id uuid,
    user_id uuid,
    score numeric(10,2),
    rank integer,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: challenge_participations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenge_participations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    challenge_id uuid NOT NULL,
    progress integer DEFAULT 0,
    is_completed boolean DEFAULT false,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    current_streak integer DEFAULT 0,
    best_streak integer DEFAULT 0,
    points_earned integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    completed boolean DEFAULT false,
    target_value numeric DEFAULT 100,
    CONSTRAINT challenge_participations_progress_check CHECK (((progress >= 0) AND (progress <= 100)))
);


--
-- Name: challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    challenge_type text,
    difficulty text,
    duration_days integer,
    xp_reward integer DEFAULT 0,
    badge_reward text,
    requirements jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by uuid,
    start_date date,
    end_date date,
    target_value numeric,
    unit text,
    status character varying(50) DEFAULT 'active'::character varying,
    frequency character varying(50) DEFAULT 'once'::character varying,
    target_unit character varying(50),
    image_url text,
    icon character varying(50),
    color character varying(10) DEFAULT '#6366f1'::character varying,
    tags text[],
    entry_fee numeric DEFAULT 0,
    notification_settings jsonb DEFAULT '{}'::jsonb,
    auto_assign boolean DEFAULT false,
    featured boolean DEFAULT false,
    completion_criteria jsonb DEFAULT '{}'::jsonb,
    progress_tracking jsonb DEFAULT '{}'::jsonb,
    rewards jsonb DEFAULT '[]'::jsonb,
    is_featured boolean DEFAULT false,
    max_participants integer,
    is_group_challenge boolean DEFAULT false,
    daily_log_target numeric DEFAULT 1,
    daily_log_type text DEFAULT 'boolean'::text,
    daily_log_unit text DEFAULT 'dia'::text,
    points_reward integer DEFAULT 100,
    badge_icon text DEFAULT '🏆'::text,
    badge_name text,
    instructions text,
    tips text[] DEFAULT '{}'::text[],
    rules text
);


--
-- Name: chat_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_configurations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    config_key text NOT NULL,
    config_value text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_conversations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text,
    personality text,
    messages jsonb,
    total_tokens integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: chat_emotional_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_emotional_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    conversation_id uuid NOT NULL,
    week_start date DEFAULT (date_trunc('week'::text, (CURRENT_DATE)::timestamp with time zone))::date NOT NULL,
    sentiment_score numeric,
    emotions_detected text[],
    mood_keywords text[],
    energy_level integer,
    stress_level integer,
    pain_level integer,
    physical_symptoms text[],
    emotional_topics text[],
    concerns_mentioned text[],
    goals_mentioned text[],
    achievements_mentioned text[],
    analysis_metadata jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    role text,
    content text,
    personality text,
    tokens_used integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: combinacoes_ideais; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.combinacoes_ideais (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alimento_principal text NOT NULL,
    alimento_combinado text NOT NULL,
    beneficio text,
    sinergia_nutricional text,
    potencializacao_percentual numeric,
    categoria_combinacao text,
    referencias_cientificas text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: comidas_favoritas_do_usuário; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."comidas_favoritas_do_usuário" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    alimento_nome text NOT NULL,
    categoria text,
    frequencia_consumo text,
    nivel_preferencia integer,
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT "comidas_favoritas_do_usuário_nivel_preferencia_check" CHECK (((nivel_preferencia >= 1) AND (nivel_preferencia <= 5)))
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    post_id uuid,
    parent_comment_id uuid,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: company_configurations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_configurations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name text,
    mission text,
    vision text,
    "values" text,
    about_us text,
    target_audience text,
    health_philosophy text,
    company_culture text,
    differentials text,
    main_services text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: company_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_name text,
    company_logo text,
    primary_color text,
    secondary_color text,
    contact_email text,
    contact_phone text,
    address text,
    website text,
    settings jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: company_knowledge_base; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.company_knowledge_base (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text,
    content text,
    category text,
    tags text[],
    priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: configurações_ai; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."configurações_ai" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    funcionalidade text NOT NULL,
    servico text DEFAULT 'gemini'::text NOT NULL,
    modelo text DEFAULT 'gemini-pro'::text NOT NULL,
    max_tokens integer DEFAULT 4096 NOT NULL,
    temperatura numeric DEFAULT 0.8 NOT NULL,
    nivel text DEFAULT 'medio'::text,
    personalidade text DEFAULT 'drvital'::text,
    system_prompt text,
    is_enabled boolean DEFAULT true NOT NULL,
    custo_por_requisicao numeric DEFAULT 0.01,
    prioridade integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: conquistas_do_usuário; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."conquistas_do_usuário" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    nome_conquista text NOT NULL,
    descricao text,
    tipo_conquista text,
    icone_badge text,
    data_desbloqueio timestamp with time zone,
    progresso_atual integer DEFAULT 0,
    progresso_total integer DEFAULT 100,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: content_access; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.content_access (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    content_type text,
    content_id uuid,
    access_level text,
    expires_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: conversation_attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_attachments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    message_id uuid,
    file_url text,
    file_name text,
    file_type text,
    file_size integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: conversation_facts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_facts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    fact_type text,
    fact_content text,
    source_message_id uuid,
    importance_score integer,
    tags text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: conversation_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversation_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid,
    user_id uuid,
    sender_type text,
    message_content text,
    message_type text,
    metadata jsonb,
    is_read boolean DEFAULT false,
    attachments jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: course_lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid,
    module_id uuid,
    title text NOT NULL,
    description text,
    content text,
    video_url text,
    thumbnail_url text,
    lesson_type text DEFAULT 'video'::text,
    duration_minutes integer,
    order_index integer NOT NULL,
    is_premium boolean DEFAULT false,
    is_completed boolean DEFAULT false,
    prerequisites text[],
    resources jsonb DEFAULT '[]'::jsonb,
    quiz_questions jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: course_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail_url text,
    category text,
    difficulty_level text,
    duration_minutes integer,
    price numeric(10,2) DEFAULT 0,
    is_premium boolean DEFAULT false,
    is_published boolean DEFAULT true,
    instructor_name text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT courses_difficulty_level_check CHECK ((difficulty_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])))
);


--
-- Name: cultural_context; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cultural_context (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    region text,
    country text,
    cultural_practices jsonb,
    traditional_foods text[],
    dietary_customs text[],
    religious_considerations text[],
    celebration_foods jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: custom_saboteurs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.custom_saboteurs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    saboteur_name text NOT NULL,
    description text,
    category text,
    common_triggers text[],
    behavioral_patterns text[],
    physical_symptoms text[],
    mental_patterns text[],
    coping_strategies text[],
    related_saboteurs text[],
    severity_levels jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: dados_físicos_do_usuário; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."dados_físicos_do_usuário" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    altura_cm numeric(5,2),
    peso_atual_kg numeric(5,2),
    sexo text,
    data_nascimento date,
    tipo_sanguineo text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT "dados_físicos_do_usuário_sexo_check" CHECK ((sexo = ANY (ARRAY['masculino'::text, 'feminino'::text, 'outro'::text])))
);


--
-- Name: daily_mission_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_mission_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_date date DEFAULT CURRENT_DATE,
    missions_completed integer DEFAULT 0,
    total_points integer DEFAULT 0,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    date date DEFAULT CURRENT_DATE,
    streak_days integer DEFAULT 0,
    completed_sections jsonb DEFAULT '[]'::jsonb
);


--
-- Name: daily_nutrition_summary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_nutrition_summary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    date date DEFAULT CURRENT_DATE,
    total_calories integer,
    total_proteins numeric(6,2),
    total_carbs numeric(6,2),
    total_fats numeric(6,2),
    total_fiber numeric(6,2),
    total_water_ml integer,
    meals_count integer,
    breakfast_calories integer,
    lunch_calories integer,
    dinner_calories integer,
    snacks_calories integer,
    adherence_to_plan_percentage numeric(5,2),
    health_score integer,
    notes text,
    goals_met boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: daily_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.daily_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    question_id text,
    response text,
    response_type text,
    score integer,
    date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    text_response text,
    section text,
    answer text,
    points_earned integer DEFAULT 0
);


--
-- Name: demographic_nutrition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.demographic_nutrition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    age_group text,
    gender text,
    life_stage text,
    nutritional_needs jsonb,
    recommended_intake jsonb,
    special_considerations text[],
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: desafios_esportivos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.desafios_esportivos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo text NOT NULL,
    descricao text,
    tipo_desafio text,
    esporte text,
    nivel_dificuldade text,
    duracao_dias integer,
    meta_valor numeric,
    meta_unidade text,
    data_inicio date,
    data_fim date,
    pontos_recompensa integer DEFAULT 100,
    badge_recompensa text,
    regras text,
    instrucoes text,
    is_grupo boolean DEFAULT false,
    max_participantes integer,
    criado_por uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: device_sync_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.device_sync_log (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    device_type text,
    device_id text,
    sync_type text,
    data_synced jsonb,
    sync_status text,
    records_synced integer,
    error_message text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: diseases_conditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.diseases_conditions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    condition_name text NOT NULL,
    category text,
    description text,
    symptoms text[],
    risk_factors text[],
    prevention_tips text[],
    treatment_approaches text[],
    dietary_recommendations text[],
    exercise_recommendations text[],
    lifestyle_modifications text[],
    related_conditions text[],
    severity_levels jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: documentos_médicos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."documentos_médicos" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tipo_documento text NOT NULL,
    titulo text NOT NULL,
    descricao text,
    data_documento date,
    arquivo_url text,
    arquivo_nome text,
    arquivo_tamanho integer,
    tipo_mime text,
    tags text[],
    categoria text,
    medico_responsavel text,
    instituicao text,
    resultado_geral text,
    resultados_exames jsonb,
    analise_ia text,
    analise_completa jsonb,
    prioridade text DEFAULT 'normal'::text,
    status text DEFAULT 'ativo'::text,
    compartilhado_com text[],
    notas_usuario text,
    notas_profissional text,
    data_proxima_revisao date,
    alertas text[],
    metadata jsonb,
    processado boolean DEFAULT false,
    data_processamento timestamp with time zone,
    versao_processamento text,
    is_publico boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: dr_vital_memory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dr_vital_memory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    memory_key text NOT NULL,
    memory_value jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: economic_information; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.economic_information (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    region text,
    food_name text,
    average_price numeric(10,2),
    currency text DEFAULT 'BRL'::text,
    price_range_min numeric(10,2),
    price_range_max numeric(10,2),
    availability text,
    season text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: environmental_impact; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.environmental_impact (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_name text NOT NULL,
    carbon_footprint_kg numeric(8,2),
    water_usage_liters numeric(10,2),
    land_usage_sqm numeric(10,2),
    sustainability_rating text,
    seasonal_availability text[],
    local_production boolean,
    eco_certifications text[],
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: exercise_ai_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_ai_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    recommendation_type text,
    recommendation_text text,
    recommended_exercises jsonb,
    reasoning text,
    priority_level text,
    valid_until date,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: exercise_nutrition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_nutrition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    exercise_type text NOT NULL,
    pre_workout_recommendations jsonb,
    post_workout_recommendations jsonb,
    hydration_guidelines text,
    supplement_suggestions text[],
    timing_guidelines text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: exercise_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    goal text,
    difficulty text,
    duration_weeks integer,
    sessions_per_week integer,
    exercises jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: exercise_progress_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_progress_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    analysis_period text,
    period_start date,
    period_end date,
    total_sessions integer,
    total_duration_minutes integer,
    avg_intensity numeric(3,2),
    improvements jsonb,
    recommendations text[],
    next_goals text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: exercise_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    session_date date DEFAULT CURRENT_DATE,
    session_type text,
    exercises jsonb,
    duration_minutes integer,
    calories_burned integer,
    heart_rate_avg integer,
    heart_rate_max integer,
    intensity_level text,
    mood_before text,
    mood_after text,
    notes text,
    performance_rating integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: exercise_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercise_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    exercise_type text,
    duration_minutes integer,
    calories_burned integer,
    distance_km numeric(5,2),
    steps integer,
    heart_rate_avg integer,
    notes text,
    date date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: exercises; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.exercises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    muscle_group text,
    difficulty text,
    video_url text,
    image_url text,
    instructions text,
    duration_seconds integer,
    calories_per_minute integer,
    equipment text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: fatos_da_conversação; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."fatos_da_conversação" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    conteudo_fato text,
    tipo_fato text,
    importancia integer DEFAULT 5,
    is_active boolean DEFAULT true,
    mensagem_origem_id uuid,
    tags text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: food_active_principles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.food_active_principles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_id uuid,
    active_principle_name text NOT NULL,
    concentration text,
    health_benefit text,
    scientific_evidence text,
    is_verified boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: food_aliases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.food_aliases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_id uuid,
    alias_name text NOT NULL,
    language text DEFAULT 'pt-BR'::text
);


--
-- Name: food_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.food_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    food_items text[],
    meal_type text,
    nutrition_analysis jsonb,
    total_calories integer,
    total_proteins numeric(5,2),
    total_carbs numeric(5,2),
    total_fats numeric(5,2),
    health_rating integer,
    recommendations text,
    image_url text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: food_contraindications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.food_contraindications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_name text NOT NULL,
    condition_name text,
    contraindication_type text,
    severity text,
    reason text,
    alternative_suggestions text[],
    scientific_reference text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: food_densities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.food_densities (
    food_name text NOT NULL,
    density_g_ml numeric(5,3)
);


--
-- Name: food_diseases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.food_diseases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_id uuid,
    disease_id uuid,
    food_name text,
    disease_name text,
    relationship_type text,
    benefit_level text,
    mechanism text,
    dosage_recommendation text,
    precautions text[],
    evidence_quality text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: food_preparation_preservation; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.food_preparation_preservation (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_name text NOT NULL,
    preparation_methods jsonb,
    cooking_tips text[],
    preservation_methods jsonb,
    storage_duration text,
    storage_conditions text,
    nutritional_impact jsonb,
    food_safety_tips text[],
    best_practices text[],
    common_mistakes text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: food_security; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.food_security (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_name text NOT NULL,
    allergen_info text[],
    cross_contamination_risks text[],
    storage_safety text,
    handling_precautions text[],
    expiration_guidelines text,
    foodborne_illness_risks text[],
    safe_temperature_range text,
    recall_history jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: food_yields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.food_yields (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_name text NOT NULL,
    raw_weight_g numeric(8,2),
    cooked_weight_g numeric(8,2),
    yield_percentage numeric(5,2)
);


--
-- Name: fruit_pool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fruit_pool (
    food_name text NOT NULL,
    category text DEFAULT 'fruit'::text
);


--
-- Name: goal_benefits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goal_benefits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goal_type text NOT NULL,
    benefit_title text,
    benefit_description text,
    health_impact text,
    evidence_level text,
    time_to_benefit text,
    sustainability_level text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: goal_updates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.goal_updates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    goal_id uuid,
    update_type text,
    value numeric(10,2),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: google_fit_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.google_fit_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    analysis_date date DEFAULT CURRENT_DATE,
    period_type text,
    period_start date,
    period_end date,
    total_steps integer,
    avg_daily_steps integer,
    total_distance_km numeric(8,2),
    total_calories integer,
    total_active_minutes integer,
    avg_heart_rate integer,
    resting_heart_rate integer,
    avg_sleep_hours numeric(4,2),
    sleep_quality_avg numeric(3,2),
    activity_trend text,
    health_score integer,
    insights text[],
    recommendations text[],
    data_quality_score integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: google_fit_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.google_fit_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    data_type text,
    value numeric(10,2),
    unit text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    source text,
    raw_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: google_fit_data_extended; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.google_fit_data_extended (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    data_source text,
    data_type text,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    value numeric(10,2),
    unit text,
    steps integer,
    distance_meters numeric(10,2),
    calories_burned integer,
    active_minutes integer,
    heart_rate_bpm integer,
    heart_rate_min integer,
    heart_rate_max integer,
    heart_rate_avg integer,
    heart_rate_resting integer,
    sleep_duration_minutes integer,
    sleep_quality_score integer,
    deep_sleep_minutes integer,
    light_sleep_minutes integer,
    rem_sleep_minutes integer,
    awake_minutes integer,
    weight_kg numeric(5,2),
    height_cm numeric(5,2),
    body_fat_percentage numeric(4,2),
    water_ml integer,
    nutrition_calories integer,
    nutrition_protein_g numeric(6,2),
    nutrition_carbs_g numeric(6,2),
    nutrition_fat_g numeric(6,2),
    stress_level integer,
    energy_level integer,
    mood_score integer,
    raw_data jsonb,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: google_fit_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.google_fit_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    access_token text,
    refresh_token text,
    token_type text,
    expires_at timestamp with time zone,
    scope text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: health_alerts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_alerts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    alert_type text,
    severity text,
    title text,
    message text,
    related_data jsonb,
    action_required boolean DEFAULT false,
    is_acknowledged boolean DEFAULT false,
    acknowledged_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone
);


--
-- Name: health_conditions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_conditions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    condition_name text,
    severity text,
    diagnosed_date date,
    notes text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: health_diary; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_diary (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    mood_rating integer,
    energy_level integer,
    sleep_hours numeric(3,1),
    water_intake numeric(4,1),
    exercise_minutes integer,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT health_diary_energy_level_check CHECK (((energy_level >= 1) AND (energy_level <= 10))),
    CONSTRAINT health_diary_mood_rating_check CHECK (((mood_rating >= 1) AND (mood_rating <= 10)))
);


--
-- Name: health_feed_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_feed_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid,
    user_id uuid,
    comment_text text,
    parent_comment_id uuid,
    likes_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: health_feed_follows; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_feed_follows (
    follower_id uuid NOT NULL,
    following_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: health_feed_group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_feed_group_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid,
    user_id uuid,
    role text DEFAULT 'member'::text,
    joined_at timestamp with time zone DEFAULT now()
);


--
-- Name: health_feed_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_feed_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_name text NOT NULL,
    description text,
    group_type text,
    privacy_level text DEFAULT 'public'::text,
    members_count integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: health_feed_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_feed_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    post_type text,
    title text,
    content text,
    media_urls text[],
    tags text[],
    visibility text DEFAULT 'public'::text,
    likes_count integer DEFAULT 0,
    comments_count integer DEFAULT 0,
    shares_count integer DEFAULT 0,
    is_pinned boolean DEFAULT false,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: health_feed_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_feed_reactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid,
    user_id uuid,
    reaction_type text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: health_integrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.health_integrations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    integration_type text,
    provider_name text,
    access_token text,
    refresh_token text,
    token_expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    last_sync_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: heart_rate_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.heart_rate_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    measurement_time timestamp with time zone DEFAULT now(),
    heart_rate_bpm integer NOT NULL,
    measurement_type text,
    activity_context text,
    resting_heart_rate integer,
    max_heart_rate integer,
    heart_rate_variability integer,
    recovery_time_minutes integer,
    stress_level text,
    notes text,
    device_source text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: image_cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.image_cache (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    storage_path text NOT NULL,
    base64_data text,
    mime_type text,
    file_size integer,
    created_at timestamp with time zone DEFAULT now(),
    accessed_at timestamp with time zone DEFAULT now(),
    access_count integer DEFAULT 0
);


--
-- Name: information_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.information_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    content_type text,
    content_id text,
    feedback_type text,
    feedback_text text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: informações_economicas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."informações_economicas" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alimento_nome text,
    preco_medio numeric,
    faixa_preco_min numeric,
    faixa_preco_max numeric,
    moeda text DEFAULT 'BRL'::text,
    regiao text,
    disponibilidade text,
    sazonalidade text,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: institute_nutritional_catalog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.institute_nutritional_catalog (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_name text NOT NULL,
    food_code text,
    category text,
    subcategory text,
    nutritional_data jsonb,
    health_benefits text[],
    therapeutic_uses text[],
    bioactive_compounds jsonb,
    recommended_portions text,
    preparation_notes text,
    contraindications text[],
    drug_interactions text[],
    research_references text[],
    quality_grade text,
    certification_info jsonb,
    is_verified boolean DEFAULT true,
    source text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: layout_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.layout_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    config_key text NOT NULL,
    config_value jsonb,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    module_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    video_url text,
    duration_minutes integer,
    order_index integer NOT NULL,
    is_free boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    is_premium boolean DEFAULT false
);


--
-- Name: lições; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."lições" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    curso_id uuid,
    modulo_id uuid,
    titulo text NOT NULL,
    descricao text,
    conteudo text,
    tipo_licao text DEFAULT 'video'::text,
    url_video text,
    url_thumbnail text,
    duracao_minutos integer,
    ordem_index integer NOT NULL,
    is_premium boolean DEFAULT false,
    is_completed boolean DEFAULT false,
    prerequisitos text[],
    recursos jsonb DEFAULT '[]'::jsonb,
    questoes_quiz jsonb DEFAULT '[]'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: meal_feedback; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_feedback (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    meal_id uuid,
    rating integer,
    feedback_text text,
    would_eat_again boolean,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: meal_plan_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_plan_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text,
    plan_type text,
    meal_plan_data jsonb,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: meal_plan_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_plan_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meal_plan_id uuid,
    day_of_week integer,
    meal_type text,
    meal_name text,
    recipe_id uuid,
    food_items jsonb,
    calories integer,
    proteins numeric(6,2),
    carbs numeric(6,2),
    fats numeric(6,2),
    preparation_instructions text,
    timing text,
    order_index integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: meal_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name text,
    description text,
    goal text,
    daily_calories integer,
    daily_proteins numeric(5,2),
    daily_carbs numeric(5,2),
    daily_fats numeric(5,2),
    meals jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: meal_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.meal_suggestions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    meal_type text,
    suggestion_data jsonb,
    nutritional_values jsonb,
    health_score integer,
    reason text,
    is_favorite boolean DEFAULT false,
    date_suggested date DEFAULT CURRENT_DATE,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: medical_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medical_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    file_name text,
    file_url text,
    file_type text,
    file_size integer,
    analysis_status text DEFAULT 'pending'::text,
    analysis_result jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    title text,
    type text,
    doctor_name text,
    status text DEFAULT 'pending'::text,
    results jsonb,
    processing_stage text,
    progress_pct integer DEFAULT 0,
    images_processed integer DEFAULT 0,
    images_total integer DEFAULT 0
);


--
-- Name: medidas_de_peso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.medidas_de_peso (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    data_medicao date DEFAULT CURRENT_DATE NOT NULL,
    peso_kg numeric(5,2),
    altura_cm numeric(5,2),
    imc numeric(4,2),
    gordura_corporal_percentual numeric(4,2),
    massa_muscular_kg numeric(5,2),
    massa_ossea_kg numeric(4,2),
    agua_corporal_percentual numeric(4,2),
    gordura_visceral integer,
    taxa_metabolica_basal integer,
    idade_metabolica integer,
    circunferencia_cintura_cm numeric(5,2),
    circunferencia_quadril_cm numeric(5,2),
    circunferencia_abdominal_cm numeric(5,2),
    circunferencia_braco_cm numeric(5,2),
    circunferencia_coxa_cm numeric(5,2),
    circunferencia_panturrilha_cm numeric(5,2),
    dobra_triceps_mm numeric(4,1),
    dobra_biceps_mm numeric(4,1),
    dobra_subescapular_mm numeric(4,1),
    dobra_suprailiaca_mm numeric(4,1),
    pressao_sistolica integer,
    pressao_diastolica integer,
    risco_cardiometabolico text,
    tipo_dispositivo text,
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: membros_do_grupo_feed_de_saúde; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."membros_do_grupo_feed_de_saúde" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    grupo_id uuid NOT NULL,
    user_id uuid NOT NULL,
    papel text DEFAULT 'membro'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: memória_sofia; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."memória_sofia" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tipo_memoria text NOT NULL,
    conteudo text NOT NULL,
    contexto jsonb,
    importancia integer DEFAULT 5,
    frequencia_acesso integer DEFAULT 0,
    ultimo_acesso timestamp with time zone,
    tags text[],
    is_active boolean DEFAULT true,
    expira_em timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: missions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.missions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text,
    points integer DEFAULT 0,
    category text,
    difficulty text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT missions_category_check CHECK ((category = ANY (ARRAY['exercise'::text, 'nutrition'::text, 'mindset'::text, 'hydration'::text, 'sleep'::text]))),
    CONSTRAINT missions_difficulty_check CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text])))
);


--
-- Name: missões_diárias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."missões_diárias" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    titulo text NOT NULL,
    descricao text,
    categoria text,
    tipo_missao text,
    dificuldade text DEFAULT 'facil'::text,
    pontos_recompensa integer DEFAULT 10,
    xp_recompensa integer DEFAULT 5,
    icone text,
    cor text,
    objetivo_valor numeric,
    objetivo_unidade text,
    is_diaria boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: mock_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mock_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    mock_data jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: mood_monitoring; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mood_monitoring (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    date date DEFAULT CURRENT_DATE,
    "time" time without time zone DEFAULT LOCALTIME,
    mood_rating integer,
    mood_tags text[],
    triggers text[],
    context text,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    preferences jsonb,
    channels jsonb,
    frequency text DEFAULT 'realtime'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    title text,
    message text,
    type text,
    is_read boolean DEFAULT false,
    action_url text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: notificações_enviadas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."notificações_enviadas" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tipo_notificacao text NOT NULL,
    titulo text NOT NULL,
    mensagem text NOT NULL,
    lida boolean DEFAULT false,
    data_leitura timestamp with time zone,
    prioridade text DEFAULT 'normal'::text,
    acao_url text,
    metadata jsonb,
    canal text DEFAULT 'app'::text,
    status_envio text DEFAULT 'pendente'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: nutrition_foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutrition_foods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    aliases text[],
    category text,
    calories_per_100g integer,
    proteins_per_100g numeric(5,2),
    carbs_per_100g numeric(5,2),
    fats_per_100g numeric(5,2),
    fiber_per_100g numeric(5,2),
    sodium_per_100g numeric(5,2),
    is_verified boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: nutrition_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutrition_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    date date DEFAULT CURRENT_DATE,
    meal_type text,
    food_items jsonb,
    total_calories integer,
    total_proteins numeric(6,2),
    total_carbs numeric(6,2),
    total_fats numeric(6,2),
    total_fiber numeric(6,2),
    water_ml integer,
    notes text,
    photo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: nutritional_aliases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutritional_aliases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_id uuid,
    alias text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: nutritional_food_patterns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutritional_food_patterns (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pattern_name text NOT NULL,
    pattern_type text,
    description text,
    food_combinations jsonb,
    health_benefits text[],
    meal_examples jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: nutritional_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutritional_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    goal_name text NOT NULL,
    goal_type text,
    target_calories integer,
    target_protein_g numeric(6,2),
    target_carbs_g numeric(6,2),
    target_fats_g numeric(6,2),
    target_fiber_g numeric(6,2),
    target_water_ml integer,
    target_weight_kg numeric(5,2),
    current_weight_kg numeric(5,2),
    start_date date,
    target_date date,
    status text DEFAULT 'active'::text,
    progress_percentage numeric(5,2),
    notes text,
    created_by text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: nutritional_protocols; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutritional_protocols (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    protocol_name text NOT NULL,
    health_condition text,
    description text,
    duration_weeks integer,
    phases jsonb,
    dietary_guidelines jsonb,
    supplement_recommendations jsonb,
    meal_timing jsonb,
    restrictions text[],
    monitoring_metrics text[],
    expected_outcomes text[],
    evidence_level text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: nutritional_recommendations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutritional_recommendations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    recommendation_type text,
    recommendation_text text,
    foods_to_include text[],
    foods_to_avoid text[],
    priority text,
    valid_until date,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: nutritional_yields; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nutritional_yields (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_name text NOT NULL,
    preparation_method text,
    yield_factor numeric(4,2),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    offer_title text NOT NULL,
    description text,
    discount_percentage numeric(5,2),
    discount_amount numeric(10,2),
    valid_from date,
    valid_until date,
    offer_code text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: payment_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payment_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    subscription_id uuid,
    invoice_id uuid,
    amount numeric(10,2),
    currency text DEFAULT 'BRL'::text,
    payment_method text,
    payment_provider text,
    transaction_id text,
    status text DEFAULT 'pending'::text,
    payment_date timestamp with time zone,
    metadata jsonb,
    error_message text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    refunded_at timestamp with time zone
);


--
-- Name: pending_nutritional_aliases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pending_nutritional_aliases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    food_name text NOT NULL,
    alias text NOT NULL,
    submitted_by uuid,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: pontos_do_usuário; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."pontos_do_usuário" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    total_pontos integer DEFAULT 0,
    nivel_atual integer DEFAULT 1,
    experiencia_atual integer DEFAULT 0,
    experiencia_proximo_nivel integer DEFAULT 100,
    pontos_semana integer DEFAULT 0,
    pontos_mes integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: pontuações_do_usuário; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."pontuações_do_usuário" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    categoria text NOT NULL,
    pontuacao numeric NOT NULL,
    pontuacao_maxima numeric DEFAULT 100,
    data_avaliacao date DEFAULT CURRENT_DATE NOT NULL,
    detalhes jsonb,
    tendencia text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: pregnancy_nutrition; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pregnancy_nutrition (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    trimester text,
    nutrient_name text,
    recommended_amount text,
    food_sources text[],
    benefits text,
    precautions text[],
    is_essential boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: premium_medical_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.premium_medical_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    report_type text NOT NULL,
    title text NOT NULL,
    description text,
    html_path text,
    pdf_path text,
    generated_at timestamp with time zone DEFAULT now(),
    data jsonb,
    status text DEFAULT 'completed'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT premium_medical_reports_report_type_check CHECK ((report_type = ANY (ARRAY['bioimpedance'::text, 'blood_test'::text, 'preventive'::text, 'comprehensive'::text, 'custom'::text]))),
    CONSTRAINT premium_medical_reports_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'processing'::text, 'completed'::text, 'failed'::text])))
);


--
-- Name: premium_report_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.premium_report_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    report_id uuid,
    event_type text,
    event_data jsonb,
    triggered_by uuid,
    processed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    processed_at timestamp with time zone
);


--
-- Name: preventive_health_analyses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preventive_health_analyses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    analysis_type text,
    risk_score integer,
    risk_factors jsonb,
    recommendations jsonb,
    health_indicators jsonb,
    lifestyle_score integer,
    action_plan text,
    next_steps text[],
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: professional_evaluations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.professional_evaluations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    evaluator_id uuid,
    evaluation_date date DEFAULT CURRENT_DATE,
    weight_kg numeric(5,2) NOT NULL,
    height_cm numeric(5,2),
    bmi numeric(5,2),
    body_fat_percentage numeric(5,2),
    fat_mass_kg numeric(5,2),
    lean_mass_kg numeric(5,2),
    muscle_mass_kg numeric(5,2),
    bmr_kcal integer,
    waist_circumference_cm numeric(5,2),
    hip_circumference_cm numeric(5,2),
    abdominal_circumference_cm numeric(5,2),
    waist_to_height_ratio numeric(5,3),
    waist_to_hip_ratio numeric(5,3),
    muscle_to_fat_ratio numeric(5,3),
    risk_level text,
    notes text,
    recommendations text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT professional_evaluations_risk_level_check CHECK ((risk_level = ANY (ARRAY['low'::text, 'moderate'::text, 'high'::text, 'very_high'::text])))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text,
    email text,
    height numeric(5,2),
    target_weight numeric(5,2),
    current_weight numeric(5,2),
    age integer,
    gender text,
    activity_level text,
    avatar_url text,
    google_fit_enabled boolean DEFAULT false,
    provider text DEFAULT 'email'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phone text,
    city text,
    birth_date date,
    state text,
    role character varying(50) DEFAULT 'user'::character varying,
    points integer DEFAULT 0,
    CONSTRAINT profiles_activity_level_check CHECK ((activity_level = ANY (ARRAY['sedentary'::text, 'light'::text, 'moderate'::text, 'active'::text, 'very_active'::text, 'sedentario'::text, 'moderado'::text, 'ativo'::text]))),
    CONSTRAINT profiles_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text, 'masculino'::text, 'feminino'::text])))
);


--
-- Name: protein_pool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.protein_pool (
    food_name text NOT NULL,
    category text DEFAULT 'protein'::text
);


--
-- Name: protocol_supplements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.protocol_supplements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    protocol_id uuid,
    supplement_name text NOT NULL,
    dosage text,
    frequency text,
    timing text,
    notes text,
    is_required boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: reações_feed_de_saúde; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."reações_feed_de_saúde" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    tipo_reacao text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: receitas_terapeuticas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.receitas_terapeuticas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome_receita text NOT NULL,
    descricao text,
    condicao_alvo text,
    ingredientes jsonb DEFAULT '[]'::jsonb NOT NULL,
    modo_preparo text,
    tempo_preparo_minutos integer,
    porcoes integer DEFAULT 1,
    calorias_por_porcao numeric,
    beneficios_terapeuticos text[],
    contraindicacoes text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: recipe_components; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_components (
    recipe_id uuid,
    food_name text,
    quantity_g numeric(8,2),
    order_index integer
);


--
-- Name: recipe_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid,
    food_id uuid,
    quantity_g numeric(8,2),
    notes text
);


--
-- Name: recipe_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipe_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_name text NOT NULL,
    category text,
    base_ingredients jsonb,
    instructions_template text,
    tags text[],
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    instructions text
);


--
-- Name: registros_diários_de_desafio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."registros_diários_de_desafio" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    participacao_id uuid NOT NULL,
    data_registro date DEFAULT CURRENT_DATE NOT NULL,
    valor_registrado text,
    valor_numerico numeric,
    completado boolean DEFAULT false,
    notas text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: respostas_do_sabotador; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.respostas_do_sabotador (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    avaliacao_id uuid,
    questao_id text,
    resposta text,
    pontuacao integer,
    sabotador_identificado text,
    intensidade text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: resumo_nutricional_diário; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."resumo_nutricional_diário" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    data date DEFAULT CURRENT_DATE NOT NULL,
    total_calorias numeric,
    total_proteinas numeric,
    total_carboidratos numeric,
    total_gorduras numeric,
    total_fibras numeric,
    total_agua_ml integer,
    calorias_cafe numeric,
    calorias_almoco numeric,
    calorias_jantar numeric,
    calorias_lanches numeric,
    metas_atingidas boolean DEFAULT false,
    score_saude integer,
    aderencia_plano_percentual numeric,
    quantidade_refeicoes integer DEFAULT 0,
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sabotadores_personalizados; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sabotadores_personalizados (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nome_sabotador text NOT NULL,
    descricao text,
    categoria text,
    padroes_mentais text[],
    padroes_comportamentais text[],
    sintomas_fisicos text[],
    gatilhos_comuns text[],
    estrategias_enfrentamento text[],
    sabotadores_relacionados text[],
    niveis_gravidade jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: saboteur_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saboteur_assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    assessment_date date DEFAULT CURRENT_DATE,
    saboteur_type text,
    intensity_score integer,
    trigger_situations text[],
    impact_areas text[],
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: saboteur_responses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saboteur_responses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    assessment_id uuid,
    question_id text,
    question_text text,
    response_value integer,
    response_text text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: saboteur_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saboteur_results (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    assessment_date date DEFAULT CURRENT_DATE,
    saboteur_type text,
    score integer,
    percentage numeric(5,2),
    dominant_saboteurs text[],
    recommendations text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: saude_especifica; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.saude_especifica (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    condicao text NOT NULL,
    diagnostico_confirmado boolean DEFAULT false,
    data_diagnostico date,
    gravidade text,
    tratamento_atual text,
    medicamentos text[],
    restricoes_alimentares text[],
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: scheduled_analysis_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scheduled_analysis_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    analysis_type text,
    scheduled_for timestamp with time zone,
    status text DEFAULT 'scheduled'::text,
    completed_at timestamp with time zone,
    result_data jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: sent_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sent_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    notification_type text,
    title text,
    message text,
    data jsonb,
    channel text,
    status text DEFAULT 'sent'::text,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    sent_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: session_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_name text NOT NULL,
    category text,
    description text,
    duration_minutes integer,
    difficulty_level text,
    activities jsonb,
    goals text[],
    materials_needed text[],
    instructions text,
    benefits text[],
    precautions text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    type character varying(50) DEFAULT 'saboteur_work'::character varying NOT NULL,
    content jsonb NOT NULL,
    target_saboteurs text[],
    difficulty character varying(20) DEFAULT 'beginner'::character varying,
    estimated_time integer,
    materials_needed text[],
    follow_up_questions text[],
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


--
-- Name: sleep_monitoring; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sleep_monitoring (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    sleep_date date DEFAULT CURRENT_DATE,
    sleep_duration_hours numeric(4,2),
    sleep_quality_rating integer,
    deep_sleep_hours numeric(4,2),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: smart_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.smart_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL,
    category text,
    priority text DEFAULT 'medium'::text,
    trigger_conditions jsonb,
    is_active boolean DEFAULT true,
    is_read boolean DEFAULT false,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: sofia_comprehensive_analyses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sofia_comprehensive_analyses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    analysis_type text,
    analysis_data jsonb,
    insights text[],
    recommendations text[],
    priority_level text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sofia_conversation_context; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sofia_conversation_context (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    context_data jsonb,
    context_type text,
    relevance_score numeric(3,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sofia_food_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sofia_food_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    food_name text,
    food_image_url text,
    analysis_result jsonb,
    calories integer,
    proteins numeric(5,2),
    carbs numeric(5,2),
    fats numeric(5,2),
    health_score integer,
    recommendations text,
    created_at timestamp with time zone DEFAULT now(),
    confirmed_by_user boolean DEFAULT false
);


--
-- Name: sofia_knowledge_base; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sofia_knowledge_base (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    category text,
    title text,
    content text,
    keywords text[],
    priority integer DEFAULT 1,
    is_active boolean DEFAULT true,
    language text DEFAULT 'pt-BR'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sofia_learning; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sofia_learning (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    learning_topic text,
    learning_data jsonb,
    confidence_score numeric(3,2),
    is_validated boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sofia_memory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sofia_memory (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    memory_type text,
    memory_key text,
    memory_value jsonb,
    importance_score numeric(3,2),
    last_accessed_at timestamp with time zone,
    access_count integer DEFAULT 0,
    expires_at timestamp with time zone,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sofia_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sofia_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    conversation_id uuid,
    user_id uuid NOT NULL,
    role text NOT NULL,
    content text,
    tokens_used integer,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: specific_health; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.specific_health (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    health_category text,
    condition_name text,
    diagnosis_date date,
    severity text,
    current_treatment text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sport_training_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sport_training_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name text NOT NULL,
    sport_type text,
    goal text,
    difficulty text,
    duration_weeks integer,
    current_week integer DEFAULT 1,
    total_workouts integer DEFAULT 0,
    completed_workouts integer DEFAULT 0,
    workouts_per_week integer,
    exercises jsonb,
    status text DEFAULT 'active'::text,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    modality text,
    CONSTRAINT sport_training_plans_modality_check CHECK ((modality = ANY (ARRAY['gym'::text, 'home_bodyweight'::text, 'home_equipment'::text, 'walking'::text, 'running'::text, 'functional'::text, 'crossfit'::text, 'yoga'::text, 'pilates'::text, 'swimming'::text, 'cycling'::text, 'martial_arts'::text, 'dance'::text, 'sports'::text])))
);


--
-- Name: sport_workout_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sport_workout_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    plan_id uuid,
    workout_name text,
    exercises_completed jsonb,
    duration_minutes integer,
    calories_burned integer,
    notes text,
    rating integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: sports_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sports_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    achievement_type text,
    achievement_name text NOT NULL,
    description text,
    sport_type text,
    badge_icon text,
    points_earned integer,
    unlocked_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: sports_challenge_participations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sports_challenge_participations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    challenge_id uuid,
    user_id uuid,
    joined_at timestamp with time zone DEFAULT now(),
    current_progress numeric(10,2),
    status text DEFAULT 'active'::text,
    completed_at timestamp with time zone,
    rank integer,
    achievements jsonb,
    notes text
);


--
-- Name: sports_challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sports_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    challenge_name text NOT NULL,
    sport_type text,
    description text,
    difficulty text,
    duration_days integer,
    target_metric text,
    target_value numeric(10,2),
    unit text,
    start_date date,
    end_date date,
    rules jsonb,
    rewards jsonb,
    max_participants integer,
    is_team_challenge boolean DEFAULT false,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sports_training_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sports_training_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    plan_name text NOT NULL,
    sport_type text,
    goal text,
    difficulty_level text,
    duration_weeks integer,
    sessions_per_week integer,
    description text,
    training_phases jsonb,
    exercises jsonb,
    progression_plan jsonb,
    equipment_needed text[],
    recovery_guidelines text,
    nutrition_recommendations text,
    performance_metrics text[],
    is_active boolean DEFAULT true,
    is_public boolean DEFAULT false,
    created_by text,
    start_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sports_training_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sports_training_records (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    training_plan_id uuid,
    session_date date DEFAULT CURRENT_DATE,
    session_type text,
    exercises_completed jsonb,
    duration_minutes integer,
    intensity_level text,
    performance_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: subscription_invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    subscription_id uuid,
    user_id uuid,
    invoice_number text,
    amount numeric(10,2),
    tax numeric(10,2),
    total numeric(10,2),
    status text DEFAULT 'pending'::text,
    due_date date,
    paid_at timestamp with time zone,
    invoice_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscription_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    plan_name text NOT NULL,
    description text,
    price numeric(10,2),
    billing_cycle text,
    features jsonb,
    max_users integer,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: sugestões_nutracêuticas_do_usuário; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."sugestões_nutracêuticas_do_usuário" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    nome_suplemento text NOT NULL,
    dosagem text,
    frequencia text,
    objetivo text,
    condicao_alvo text,
    beneficios_esperados text[],
    contraindicacoes text[],
    interacoes_medicamentosas text[],
    duracao_sugerida text,
    prioridade text DEFAULT 'media'::text,
    evidencia_cientifica text,
    status_sugestao text DEFAULT 'pendente'::text,
    data_inicio_sugerida date,
    data_revisao date,
    notas text,
    created_by text,
    criado_por_ia boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: suplementos_do_usuário; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."suplementos_do_usuário" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    nome_suplemento text NOT NULL,
    dosagem text,
    frequencia text,
    horario_tomada text,
    objetivo text,
    data_inicio date,
    data_fim date,
    is_ativo boolean DEFAULT true,
    notas text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: supplement_protocols; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplement_protocols (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    conditions text[],
    supplements jsonb,
    dosages jsonb,
    duration_days integer,
    precautions text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: supplements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.supplements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    external_id text,
    name text NOT NULL,
    category text,
    brand text,
    description text,
    price numeric(10,2),
    image_url text,
    affiliate_link text,
    benefits text[],
    ingredients text[],
    dosage text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    original_price numeric(10,2),
    discount_price numeric(10,2),
    stock_quantity integer DEFAULT 0,
    is_approved boolean DEFAULT true,
    tags text[],
    score integer DEFAULT 0
);


--
-- Name: taco_foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taco_foods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code integer,
    food_name text NOT NULL,
    category text,
    energy_kcal numeric(8,2),
    energy_kj numeric(8,2),
    protein_g numeric(6,2),
    lipids_g numeric(6,2),
    carbohydrate_g numeric(6,2),
    fiber_g numeric(6,2),
    ash_g numeric(6,2),
    calcium_mg numeric(8,2),
    magnesium_mg numeric(6,2),
    manganese_mg numeric(6,2),
    phosphorus_mg numeric(8,2),
    iron_mg numeric(6,2),
    sodium_mg numeric(8,2),
    potassium_mg numeric(8,2),
    copper_mg numeric(6,2),
    zinc_mg numeric(6,2),
    retinol_mcg numeric(8,2),
    re_mcg numeric(8,2),
    rae_mcg numeric(8,2),
    thiamine_mg numeric(6,2),
    riboflavin_mg numeric(6,2),
    pyridoxine_mg numeric(6,2),
    niacin_mg numeric(6,2),
    vitamin_c_mg numeric(6,2),
    saturated_g numeric(6,2),
    monounsaturated_g numeric(6,2),
    polyunsaturated_g numeric(6,2),
    cholesterol_mg numeric(6,2),
    is_verified boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: taco_stage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.taco_stage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    numero integer,
    alimento text,
    categoria text,
    energia_kcal numeric(8,2),
    proteina_g numeric(6,2),
    lipidios_g numeric(6,2),
    carboidrato_g numeric(6,2),
    fibra_g numeric(6,2),
    calcio_mg numeric(8,2),
    magnesio_mg numeric(6,2),
    manganes_mg numeric(6,2),
    fosforo_mg numeric(8,2),
    ferro_mg numeric(6,2),
    sodio_mg numeric(8,2),
    potassio_mg numeric(8,2),
    cobre_mg numeric(6,2),
    zinco_mg numeric(6,2),
    selenio_mcg numeric(6,2),
    vitamina_a_rae_mcg numeric(8,2),
    vitamina_b1_mg numeric(6,2),
    vitamina_b2_mg numeric(6,2),
    vitamina_b3_mg numeric(6,2),
    vitamina_b6_mg numeric(6,2),
    vitamina_b12_mcg numeric(6,2),
    vitamina_c_mg numeric(6,2),
    vitamina_d_mcg numeric(6,2),
    vitamina_e_mg numeric(6,2),
    acido_folico_mcg numeric(6,2),
    colesterol_mg numeric(6,2),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: therapeutic_recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.therapeutic_recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_name text NOT NULL,
    health_condition text,
    ingredients jsonb,
    instructions text,
    preparation_time_minutes integer,
    servings integer,
    nutritional_info jsonb,
    therapeutic_benefits text[],
    precautions text[],
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    achievement_id text,
    achievement_name text,
    achievement_type text,
    description text,
    xp_earned integer DEFAULT 0,
    earned_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_anamnesis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_anamnesis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    previous_weight_treatments text,
    current_medications text,
    chronic_diseases text,
    supplements text,
    herbal_medicines text,
    food_allergies text,
    food_intolerances text,
    digestive_issues text,
    sleep_quality text,
    stress_level text,
    physical_activity text,
    eating_habits text,
    water_intake text,
    alcohol_consumption text,
    smoking text,
    family_history text,
    health_goals text,
    additional_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    problematic_foods text,
    forbidden_foods text,
    physical_activity_frequency text,
    main_treatment_goals text,
    daily_stress_level text,
    sleep_quality_score integer,
    current_bmi numeric(5,2),
    current_weight_kg numeric(5,2),
    height_cm numeric(5,2),
    waist_circumference_cm numeric(5,2),
    hip_circumference_cm numeric(5,2),
    body_fat_percentage numeric(5,2),
    weight_gain_started_age integer,
    major_weight_gain_periods text,
    emotional_events_during_weight_gain text,
    weight_fluctuation_classification text,
    profession text,
    marital_status text,
    how_found_method text,
    family_obesity_history boolean,
    family_diabetes_history boolean,
    family_heart_disease_history boolean,
    family_eating_disorders_history boolean,
    family_depression_anxiety_history boolean,
    family_thyroid_problems_history boolean,
    family_other_chronic_diseases text,
    lowest_adult_weight numeric,
    highest_adult_weight numeric,
    most_effective_treatment text,
    least_effective_treatment text,
    had_rebound_effect boolean,
    food_relationship_score integer,
    has_compulsive_eating boolean,
    compulsive_eating_situations text,
    feels_guilt_after_eating boolean,
    eats_in_secret boolean,
    eats_until_uncomfortable boolean,
    sleep_hours_per_night numeric,
    physical_activity_type text,
    daily_energy_level integer,
    general_quality_of_life integer,
    ideal_weight_goal numeric,
    timeframe_to_achieve_goal text,
    biggest_weight_loss_challenge text,
    treatment_success_definition text,
    motivation_for_seeking_treatment text
);


--
-- Name: user_anamnesis_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_anamnesis_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    anamnesis_id uuid,
    change_type text,
    changes jsonb,
    changed_by uuid,
    reason text,
    previous_data jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_assessments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_assessments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    assessment_id uuid,
    responses jsonb,
    score integer,
    result_data jsonb,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_challenges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_id uuid,
    status text DEFAULT 'active'::text,
    progress integer DEFAULT 0,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_custom_saboteurs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_custom_saboteurs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    saboteur_id uuid,
    intensity_level text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_exercise_programs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_exercise_programs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    program_id uuid,
    status text DEFAULT 'active'::text,
    current_week integer DEFAULT 1,
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_favorite_foods; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_favorite_foods (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    food_id uuid,
    food_name text,
    category text,
    preference_level integer,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_food_preferences; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_food_preferences (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    food_name text NOT NULL,
    preference_type text,
    severity_level text,
    auto_detected boolean DEFAULT false,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_gamification; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_gamification (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    total_xp integer DEFAULT 0,
    level integer DEFAULT 1,
    streak_days integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    badges jsonb,
    achievements jsonb,
    last_activity_date date,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_goal_invites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_goal_invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goal_id uuid,
    inviter_id uuid,
    invitee_id uuid,
    status text DEFAULT 'pending'::text,
    message text,
    invited_at timestamp with time zone DEFAULT now(),
    responded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_goal_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_goal_participants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    goal_id uuid,
    user_id uuid,
    role text DEFAULT 'participant'::text,
    joined_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_goals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    peso_meta_kg numeric(5,2),
    gordura_corporal_meta_percent numeric(4,2),
    imc_meta numeric(4,2),
    data_inicio date DEFAULT CURRENT_DATE,
    data_fim date,
    status character varying(20) DEFAULT 'ativo'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    estimated_points integer DEFAULT 0,
    target_value numeric(10,2),
    current_value numeric(10,2),
    goal_type text,
    title text,
    description text,
    category text,
    challenge_id uuid,
    unit text,
    difficulty text,
    target_date date,
    is_group_goal boolean DEFAULT false,
    evidence_required boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now(),
    admin_notes text,
    approved_at timestamp with time zone,
    approved_by uuid,
    rejection_reason text,
    final_points integer
);


--
-- Name: user_ingredient_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_ingredient_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    ingredient_name text,
    usage_count integer DEFAULT 1,
    last_used_at timestamp with time zone DEFAULT now(),
    is_favorite boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_medical_reports; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_medical_reports (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    report_type text,
    title text,
    description text,
    report_date date DEFAULT CURRENT_DATE,
    doctor_name text,
    specialty text,
    file_url text,
    file_name text,
    file_type text,
    analysis_data jsonb,
    key_findings text[],
    recommendations text[],
    follow_up_date date,
    is_critical boolean DEFAULT false,
    tags text[],
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_missions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_missions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    mission_id uuid NOT NULL,
    completed_at timestamp with time zone,
    is_completed boolean DEFAULT false,
    date_assigned date DEFAULT CURRENT_DATE NOT NULL
);


--
-- Name: user_notification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_notification_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    email_notifications boolean DEFAULT true,
    push_notifications boolean DEFAULT true,
    sms_notifications boolean DEFAULT false,
    notification_frequency text DEFAULT 'daily'::text,
    quiet_hours_start time without time zone,
    quiet_hours_end time without time zone,
    enabled_types jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_nutraceutical_suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_nutraceutical_suggestions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    supplement_name text NOT NULL,
    dosage text,
    frequency text,
    timing text,
    duration_days integer,
    health_goal text,
    benefits text[],
    precautions text[],
    interactions text[],
    cost_estimate numeric(10,2),
    priority_level text,
    evidence_quality text,
    suggested_by text,
    status text DEFAULT 'suggested'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_physical_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_physical_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    altura_cm numeric(5,2) NOT NULL,
    idade integer NOT NULL,
    sexo character varying(10) NOT NULL,
    nivel_atividade character varying(20) DEFAULT 'moderado'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_physical_data_sexo_check CHECK (((sexo)::text = ANY (ARRAY[('masculino'::character varying)::text, ('feminino'::character varying)::text])))
);


--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    lesson_id uuid NOT NULL,
    completed_at timestamp with time zone,
    watch_time_seconds integer DEFAULT 0,
    is_completed boolean DEFAULT false
);


--
-- Name: user_purchases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_purchases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    product_id uuid,
    product_name text,
    amount numeric(10,2),
    status text DEFAULT 'pending'::text,
    payment_method text,
    transaction_id text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    role text DEFAULT 'user'::text,
    permissions jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid,
    user_id uuid,
    status character varying(20) DEFAULT 'assigned'::character varying,
    assigned_at timestamp with time zone DEFAULT now(),
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    due_date timestamp with time zone,
    progress integer DEFAULT 0,
    feedback jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tools_data jsonb
);


--
-- Name: user_sport_modalities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sport_modalities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    modality text NOT NULL,
    experience_level text,
    frequency_per_week integer,
    preferred_time text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_sport_modalities_experience_level_check CHECK ((experience_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))),
    CONSTRAINT user_sport_modalities_frequency_per_week_check CHECK (((frequency_per_week >= 1) AND (frequency_per_week <= 7))),
    CONSTRAINT user_sport_modalities_modality_check CHECK ((modality = ANY (ARRAY['gym'::text, 'home_bodyweight'::text, 'home_equipment'::text, 'walking'::text, 'running'::text, 'functional'::text, 'crossfit'::text, 'yoga'::text, 'pilates'::text, 'swimming'::text, 'cycling'::text, 'martial_arts'::text, 'dance'::text, 'sports'::text])))
);


--
-- Name: user_sports_modalities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_sports_modalities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    sport_name text NOT NULL,
    skill_level text,
    years_experience integer,
    training_frequency text,
    goals text[],
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    subscription_type text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    payment_method text,
    amount numeric(10,2),
    currency text DEFAULT 'BRL'::text,
    auto_renew boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_subscriptions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'cancelled'::text, 'expired'::text, 'pending'::text]))),
    CONSTRAINT user_subscriptions_subscription_type_check CHECK ((subscription_type = ANY (ARRAY['free'::text, 'basic'::text, 'premium'::text, 'vip'::text])))
);


--
-- Name: user_supplements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_supplements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    supplement_id uuid,
    supplement_name text,
    dosage text,
    frequency text,
    start_date date,
    end_date date,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: users_needing_analysis; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users_needing_analysis (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    analysis_type text,
    priority integer DEFAULT 1,
    status text DEFAULT 'pending'::text,
    requested_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    notes text
);


--
-- Name: v_ingestão_diária_de_macronutrientes; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."v_ingestão_diária_de_macronutrientes" AS
 SELECT user_id,
    data,
    sum(total_proteinas) AS proteinas_dia,
    sum(total_carboidratos) AS carboidratos_dia,
    sum(total_gorduras) AS gorduras_dia,
    sum(total_calorias) AS calorias_dia,
    sum(total_fibras) AS fibras_dia,
    sum(total_agua_ml) AS agua_ml_dia,
    avg(score_saude) AS score_medio,
    count(*) AS registros_dia
   FROM public."resumo_nutricional_diário"
  GROUP BY user_id, data;


--
-- Name: v_user_conversation_summary; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public.v_user_conversation_summary AS
 SELECT user_id,
    count(*) AS total_conversas,
    max(created_at) AS ultima_conversa,
    avg(
        CASE
            WHEN (sentiment_score IS NOT NULL) THEN sentiment_score
            ELSE (0)::numeric
        END) AS sentimento_medio,
    array_agg(DISTINCT conversation_id) AS conversas_ids
   FROM public.chat_emotional_analysis
  GROUP BY user_id;


--
-- Name: valores_nutricionais_completos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.valores_nutricionais_completos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    alimento_id uuid,
    alimento_nome text NOT NULL,
    kcal numeric,
    proteina numeric,
    gorduras numeric,
    carboidratos numeric,
    fibras numeric,
    sodio numeric,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: vegetable_pool; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vegetable_pool (
    food_name text NOT NULL,
    category text DEFAULT 'vegetable'::text
);


--
-- Name: water_tracking; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.water_tracking (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    amount_ml integer,
    date date DEFAULT CURRENT_DATE,
    "time" time without time zone DEFAULT CURRENT_TIME,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: weekly_analyses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_analyses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    semana_inicio date NOT NULL,
    semana_fim date NOT NULL,
    peso_inicial numeric(5,2),
    peso_final numeric(5,2),
    variacao_peso numeric(5,2),
    variacao_gordura_corporal numeric(4,2),
    variacao_massa_muscular numeric(5,2),
    media_imc numeric(4,2),
    tendencia character varying(20),
    observacoes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: weekly_goal_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_goal_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    goal_id uuid,
    week_start date,
    progress_value numeric(10,2),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: weekly_insights; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weekly_insights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    week_start_date date NOT NULL,
    average_mood numeric(3,2),
    average_energy numeric(3,2),
    average_stress numeric(3,2),
    most_common_gratitude text,
    water_consistency numeric(3,2),
    sleep_consistency numeric(3,2),
    exercise_frequency numeric(3,2),
    total_points integer,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: weighings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weighings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    weight_kg numeric(5,2) NOT NULL,
    date date DEFAULT CURRENT_DATE,
    "time" time without time zone,
    bmi numeric(4,2),
    body_fat_percentage numeric(4,2),
    notes text,
    measurement_context text,
    mood text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: weight_measurements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weight_measurements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    peso_kg numeric(5,2) NOT NULL,
    gordura_corporal_percent numeric(4,2),
    gordura_visceral integer,
    massa_muscular_kg numeric(5,2),
    agua_corporal_percent numeric(4,2),
    osso_kg numeric(4,2),
    metabolismo_basal_kcal integer,
    idade_metabolica integer,
    risco_metabolico character varying(20),
    imc numeric(4,2),
    circunferencia_abdominal_cm numeric(5,2),
    circunferencia_braco_cm numeric(4,2),
    circunferencia_perna_cm numeric(4,2),
    device_type character varying(50) DEFAULT 'manual'::character varying,
    notes text,
    measurement_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    massa_ossea_kg numeric,
    risco_cardiometabolico text
);


--
-- Name: weight_measures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.weight_measures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    measurement_date date DEFAULT CURRENT_DATE,
    weight_kg numeric(5,2),
    height_cm numeric(5,2),
    bmi numeric(4,2),
    body_fat_percentage numeric(4,2),
    muscle_mass_kg numeric(5,2),
    bone_mass_kg numeric(4,2),
    water_percentage numeric(4,2),
    visceral_fat_level integer,
    basal_metabolic_rate integer,
    waist_circumference_cm numeric(5,2),
    hip_circumference_cm numeric(5,2),
    chest_circumference_cm numeric(5,2),
    arm_circumference_cm numeric(4,2),
    thigh_circumference_cm numeric(5,2),
    calf_circumference_cm numeric(4,2),
    neck_circumference_cm numeric(4,2),
    metabolic_age integer,
    protein_percentage numeric(4,2),
    body_type text,
    measurement_method text,
    device_used text,
    measurement_conditions text,
    notes text,
    photo_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: wheel_of_life; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.wheel_of_life (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    assessment_date date DEFAULT CURRENT_DATE,
    health_score integer,
    career_score integer,
    relationships_score integer,
    finances_score integer,
    personal_growth_score integer,
    fun_recreation_score integer,
    environment_score integer,
    spirituality_score integer,
    overall_balance numeric(4,2),
    notes text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: workout_plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workout_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    name text,
    description text,
    goal text,
    difficulty text,
    duration_weeks integer,
    workouts_per_week integer,
    exercises jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: achievement_tracking achievement_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_tracking
    ADD CONSTRAINT achievement_tracking_pkey PRIMARY KEY (id);


--
-- Name: active_principles active_principles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_principles
    ADD CONSTRAINT active_principles_pkey PRIMARY KEY (id);


--
-- Name: active_principles active_principles_principle_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.active_principles
    ADD CONSTRAINT active_principles_principle_name_key UNIQUE (principle_name);


--
-- Name: activity_categories activity_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_categories
    ADD CONSTRAINT activity_categories_pkey PRIMARY KEY (id);


--
-- Name: activity_sessions activity_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_sessions
    ADD CONSTRAINT activity_sessions_pkey PRIMARY KEY (id);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: advanced_daily_tracking advanced_daily_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advanced_daily_tracking
    ADD CONSTRAINT advanced_daily_tracking_pkey PRIMARY KEY (id);


--
-- Name: ai_configurations ai_configurations_functionality_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_configurations
    ADD CONSTRAINT ai_configurations_functionality_key UNIQUE (functionality);


--
-- Name: ai_configurations ai_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_configurations
    ADD CONSTRAINT ai_configurations_pkey PRIMARY KEY (id);


--
-- Name: ai_documents ai_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_documents
    ADD CONSTRAINT ai_documents_pkey PRIMARY KEY (id);


--
-- Name: ai_fallback_configs ai_fallback_configs_functionality_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_fallback_configs
    ADD CONSTRAINT ai_fallback_configs_functionality_key UNIQUE (functionality);


--
-- Name: ai_fallback_configs ai_fallback_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_fallback_configs
    ADD CONSTRAINT ai_fallback_configs_pkey PRIMARY KEY (id);


--
-- Name: ai_presets ai_presets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_presets
    ADD CONSTRAINT ai_presets_pkey PRIMARY KEY (id);


--
-- Name: ai_system_logs ai_system_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_system_logs
    ADD CONSTRAINT ai_system_logs_pkey PRIMARY KEY (id);


--
-- Name: ai_usage_logs ai_usage_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_usage_logs
    ADD CONSTRAINT ai_usage_logs_pkey PRIMARY KEY (id);


--
-- Name: alimentos_alias alimentos_alias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alimentos_alias
    ADD CONSTRAINT alimentos_alias_pkey PRIMARY KEY (id);


--
-- Name: alimentos_completos alimentos_completos_nome_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alimentos_completos
    ADD CONSTRAINT alimentos_completos_nome_key UNIQUE (nome);


--
-- Name: alimentos_completos alimentos_completos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alimentos_completos
    ADD CONSTRAINT alimentos_completos_pkey PRIMARY KEY (id);


--
-- Name: alimentos_principios_ativos alimentos_principios_ativos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alimentos_principios_ativos
    ADD CONSTRAINT alimentos_principios_ativos_pkey PRIMARY KEY (id);


--
-- Name: análise_estatísticas análise_estatísticas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."análise_estatísticas"
    ADD CONSTRAINT "análise_estatísticas_pkey" PRIMARY KEY (id);


--
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- Name: avaliações_sabotadores avaliações_sabotadores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."avaliações_sabotadores"
    ADD CONSTRAINT "avaliações_sabotadores_pkey" PRIMARY KEY (id);


--
-- Name: backups_anamnese_do_usuário backups_anamnese_do_usuário_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."backups_anamnese_do_usuário"
    ADD CONSTRAINT "backups_anamnese_do_usuário_pkey" PRIMARY KEY (id);


--
-- Name: bakery_pool bakery_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bakery_pool
    ADD CONSTRAINT bakery_pool_pkey PRIMARY KEY (food_name);


--
-- Name: base_de_conhecimento_da_empresa base_de_conhecimento_da_empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.base_de_conhecimento_da_empresa
    ADD CONSTRAINT base_de_conhecimento_da_empresa_pkey PRIMARY KEY (id);


--
-- Name: base_de_conhecimento_sofia base_de_conhecimento_sofia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.base_de_conhecimento_sofia
    ADD CONSTRAINT base_de_conhecimento_sofia_pkey PRIMARY KEY (id);


--
-- Name: bean_pool bean_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bean_pool
    ADD CONSTRAINT bean_pool_pkey PRIMARY KEY (food_name);


--
-- Name: bioimpedance_analysis bioimpedance_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bioimpedance_analysis
    ADD CONSTRAINT bioimpedance_analysis_pkey PRIMARY KEY (id);


--
-- Name: carb_pool carb_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carb_pool
    ADD CONSTRAINT carb_pool_pkey PRIMARY KEY (food_name);


--
-- Name: challenge_daily_logs challenge_daily_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_daily_logs
    ADD CONSTRAINT challenge_daily_logs_pkey PRIMARY KEY (id);


--
-- Name: challenge_group_messages challenge_group_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_group_messages
    ADD CONSTRAINT challenge_group_messages_pkey PRIMARY KEY (id);


--
-- Name: challenge_leaderboard challenge_leaderboard_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_leaderboard
    ADD CONSTRAINT challenge_leaderboard_pkey PRIMARY KEY (id);


--
-- Name: challenge_participations challenge_participations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participations
    ADD CONSTRAINT challenge_participations_pkey PRIMARY KEY (id);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: chat_configurations chat_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_configurations
    ADD CONSTRAINT chat_configurations_pkey PRIMARY KEY (id);


--
-- Name: chat_conversations chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_pkey PRIMARY KEY (id);


--
-- Name: chat_emotional_analysis chat_emotional_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_emotional_analysis
    ADD CONSTRAINT chat_emotional_analysis_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: combinacoes_ideais combinacoes_ideais_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.combinacoes_ideais
    ADD CONSTRAINT combinacoes_ideais_pkey PRIMARY KEY (id);


--
-- Name: comidas_favoritas_do_usuário comidas_favoritas_do_usuário_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."comidas_favoritas_do_usuário"
    ADD CONSTRAINT "comidas_favoritas_do_usuário_pkey" PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: company_configurations company_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_configurations
    ADD CONSTRAINT company_configurations_pkey PRIMARY KEY (id);


--
-- Name: company_data company_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_data
    ADD CONSTRAINT company_data_pkey PRIMARY KEY (id);


--
-- Name: company_knowledge_base company_knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.company_knowledge_base
    ADD CONSTRAINT company_knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: configurações_ai configurações_ai_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."configurações_ai"
    ADD CONSTRAINT "configurações_ai_pkey" PRIMARY KEY (id);


--
-- Name: conquistas_do_usuário conquistas_do_usuário_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."conquistas_do_usuário"
    ADD CONSTRAINT "conquistas_do_usuário_pkey" PRIMARY KEY (id);


--
-- Name: content_access content_access_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_access
    ADD CONSTRAINT content_access_pkey PRIMARY KEY (id);


--
-- Name: conversation_attachments conversation_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_attachments
    ADD CONSTRAINT conversation_attachments_pkey PRIMARY KEY (id);


--
-- Name: conversation_facts conversation_facts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_facts
    ADD CONSTRAINT conversation_facts_pkey PRIMARY KEY (id);


--
-- Name: conversation_messages conversation_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_pkey PRIMARY KEY (id);


--
-- Name: course_lessons course_lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_lessons
    ADD CONSTRAINT course_lessons_pkey PRIMARY KEY (id);


--
-- Name: course_modules course_modules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: cultural_context cultural_context_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cultural_context
    ADD CONSTRAINT cultural_context_pkey PRIMARY KEY (id);


--
-- Name: custom_saboteurs custom_saboteurs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.custom_saboteurs
    ADD CONSTRAINT custom_saboteurs_pkey PRIMARY KEY (id);


--
-- Name: dados_físicos_do_usuário dados_físicos_do_usuário_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."dados_físicos_do_usuário"
    ADD CONSTRAINT "dados_físicos_do_usuário_pkey" PRIMARY KEY (id);


--
-- Name: dados_físicos_do_usuário dados_físicos_do_usuário_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."dados_físicos_do_usuário"
    ADD CONSTRAINT "dados_físicos_do_usuário_user_id_key" UNIQUE (user_id);


--
-- Name: daily_mission_sessions daily_mission_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_mission_sessions
    ADD CONSTRAINT daily_mission_sessions_pkey PRIMARY KEY (id);


--
-- Name: daily_nutrition_summary daily_nutrition_summary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_nutrition_summary
    ADD CONSTRAINT daily_nutrition_summary_pkey PRIMARY KEY (id);


--
-- Name: daily_responses daily_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_responses
    ADD CONSTRAINT daily_responses_pkey PRIMARY KEY (id);


--
-- Name: demographic_nutrition demographic_nutrition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.demographic_nutrition
    ADD CONSTRAINT demographic_nutrition_pkey PRIMARY KEY (id);


--
-- Name: desafios_esportivos desafios_esportivos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.desafios_esportivos
    ADD CONSTRAINT desafios_esportivos_pkey PRIMARY KEY (id);


--
-- Name: device_sync_log device_sync_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_sync_log
    ADD CONSTRAINT device_sync_log_pkey PRIMARY KEY (id);


--
-- Name: diseases_conditions diseases_conditions_condition_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diseases_conditions
    ADD CONSTRAINT diseases_conditions_condition_name_key UNIQUE (condition_name);


--
-- Name: diseases_conditions diseases_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.diseases_conditions
    ADD CONSTRAINT diseases_conditions_pkey PRIMARY KEY (id);


--
-- Name: documentos_médicos documentos_médicos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."documentos_médicos"
    ADD CONSTRAINT "documentos_médicos_pkey" PRIMARY KEY (id);


--
-- Name: dr_vital_memory dr_vital_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dr_vital_memory
    ADD CONSTRAINT dr_vital_memory_pkey PRIMARY KEY (id);


--
-- Name: economic_information economic_information_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.economic_information
    ADD CONSTRAINT economic_information_pkey PRIMARY KEY (id);


--
-- Name: environmental_impact environmental_impact_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.environmental_impact
    ADD CONSTRAINT environmental_impact_pkey PRIMARY KEY (id);


--
-- Name: exercise_ai_recommendations exercise_ai_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_ai_recommendations
    ADD CONSTRAINT exercise_ai_recommendations_pkey PRIMARY KEY (id);


--
-- Name: exercise_nutrition exercise_nutrition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_nutrition
    ADD CONSTRAINT exercise_nutrition_pkey PRIMARY KEY (id);


--
-- Name: exercise_programs exercise_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_programs
    ADD CONSTRAINT exercise_programs_pkey PRIMARY KEY (id);


--
-- Name: exercise_progress_analysis exercise_progress_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_progress_analysis
    ADD CONSTRAINT exercise_progress_analysis_pkey PRIMARY KEY (id);


--
-- Name: exercise_sessions exercise_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_sessions
    ADD CONSTRAINT exercise_sessions_pkey PRIMARY KEY (id);


--
-- Name: exercise_tracking exercise_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_tracking
    ADD CONSTRAINT exercise_tracking_pkey PRIMARY KEY (id);


--
-- Name: exercises exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercises
    ADD CONSTRAINT exercises_pkey PRIMARY KEY (id);


--
-- Name: fatos_da_conversação fatos_da_conversação_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."fatos_da_conversação"
    ADD CONSTRAINT "fatos_da_conversação_pkey" PRIMARY KEY (id);


--
-- Name: food_active_principles food_active_principles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_active_principles
    ADD CONSTRAINT food_active_principles_pkey PRIMARY KEY (id);


--
-- Name: food_aliases food_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_aliases
    ADD CONSTRAINT food_aliases_pkey PRIMARY KEY (id);


--
-- Name: food_analysis food_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_analysis
    ADD CONSTRAINT food_analysis_pkey PRIMARY KEY (id);


--
-- Name: food_contraindications food_contraindications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_contraindications
    ADD CONSTRAINT food_contraindications_pkey PRIMARY KEY (id);


--
-- Name: food_densities food_densities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_densities
    ADD CONSTRAINT food_densities_pkey PRIMARY KEY (food_name);


--
-- Name: food_diseases food_diseases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_diseases
    ADD CONSTRAINT food_diseases_pkey PRIMARY KEY (id);


--
-- Name: food_preparation_preservation food_preparation_preservation_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_preparation_preservation
    ADD CONSTRAINT food_preparation_preservation_pkey PRIMARY KEY (id);


--
-- Name: food_security food_security_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_security
    ADD CONSTRAINT food_security_pkey PRIMARY KEY (id);


--
-- Name: food_yields food_yields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_yields
    ADD CONSTRAINT food_yields_pkey PRIMARY KEY (id);


--
-- Name: fruit_pool fruit_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fruit_pool
    ADD CONSTRAINT fruit_pool_pkey PRIMARY KEY (food_name);


--
-- Name: goal_benefits goal_benefits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goal_benefits
    ADD CONSTRAINT goal_benefits_pkey PRIMARY KEY (id);


--
-- Name: goal_updates goal_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goal_updates
    ADD CONSTRAINT goal_updates_pkey PRIMARY KEY (id);


--
-- Name: google_fit_analysis google_fit_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_fit_analysis
    ADD CONSTRAINT google_fit_analysis_pkey PRIMARY KEY (id);


--
-- Name: google_fit_data_extended google_fit_data_extended_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_fit_data_extended
    ADD CONSTRAINT google_fit_data_extended_pkey PRIMARY KEY (id);


--
-- Name: google_fit_data google_fit_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_fit_data
    ADD CONSTRAINT google_fit_data_pkey PRIMARY KEY (id);


--
-- Name: google_fit_tokens google_fit_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_fit_tokens
    ADD CONSTRAINT google_fit_tokens_pkey PRIMARY KEY (id);


--
-- Name: google_fit_tokens google_fit_tokens_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_fit_tokens
    ADD CONSTRAINT google_fit_tokens_user_id_key UNIQUE (user_id);


--
-- Name: health_alerts health_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_alerts
    ADD CONSTRAINT health_alerts_pkey PRIMARY KEY (id);


--
-- Name: health_conditions health_conditions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_conditions
    ADD CONSTRAINT health_conditions_pkey PRIMARY KEY (id);


--
-- Name: health_diary health_diary_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_diary
    ADD CONSTRAINT health_diary_pkey PRIMARY KEY (id);


--
-- Name: health_diary health_diary_user_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_diary
    ADD CONSTRAINT health_diary_user_id_date_key UNIQUE (user_id, date);


--
-- Name: health_feed_comments health_feed_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_comments
    ADD CONSTRAINT health_feed_comments_pkey PRIMARY KEY (id);


--
-- Name: health_feed_follows health_feed_follows_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_follows
    ADD CONSTRAINT health_feed_follows_pkey PRIMARY KEY (follower_id, following_id);


--
-- Name: health_feed_group_members health_feed_group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_group_members
    ADD CONSTRAINT health_feed_group_members_pkey PRIMARY KEY (id);


--
-- Name: health_feed_groups health_feed_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_groups
    ADD CONSTRAINT health_feed_groups_pkey PRIMARY KEY (id);


--
-- Name: health_feed_posts health_feed_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_posts
    ADD CONSTRAINT health_feed_posts_pkey PRIMARY KEY (id);


--
-- Name: health_feed_reactions health_feed_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_reactions
    ADD CONSTRAINT health_feed_reactions_pkey PRIMARY KEY (id);


--
-- Name: health_integrations health_integrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_integrations
    ADD CONSTRAINT health_integrations_pkey PRIMARY KEY (id);


--
-- Name: heart_rate_data heart_rate_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.heart_rate_data
    ADD CONSTRAINT heart_rate_data_pkey PRIMARY KEY (id);


--
-- Name: image_cache image_cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_cache
    ADD CONSTRAINT image_cache_pkey PRIMARY KEY (id);


--
-- Name: image_cache image_cache_storage_path_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.image_cache
    ADD CONSTRAINT image_cache_storage_path_key UNIQUE (storage_path);


--
-- Name: information_feedback information_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.information_feedback
    ADD CONSTRAINT information_feedback_pkey PRIMARY KEY (id);


--
-- Name: informações_economicas informações_economicas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."informações_economicas"
    ADD CONSTRAINT "informações_economicas_pkey" PRIMARY KEY (id);


--
-- Name: institute_nutritional_catalog institute_nutritional_catalog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.institute_nutritional_catalog
    ADD CONSTRAINT institute_nutritional_catalog_pkey PRIMARY KEY (id);


--
-- Name: layout_config layout_config_config_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.layout_config
    ADD CONSTRAINT layout_config_config_key_key UNIQUE (config_key);


--
-- Name: layout_config layout_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.layout_config
    ADD CONSTRAINT layout_config_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: lições lições_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."lições"
    ADD CONSTRAINT "lições_pkey" PRIMARY KEY (id);


--
-- Name: meal_feedback meal_feedback_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_feedback
    ADD CONSTRAINT meal_feedback_pkey PRIMARY KEY (id);


--
-- Name: meal_plan_history meal_plan_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_history
    ADD CONSTRAINT meal_plan_history_pkey PRIMARY KEY (id);


--
-- Name: meal_plan_items meal_plan_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT meal_plan_items_pkey PRIMARY KEY (id);


--
-- Name: meal_plans meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_pkey PRIMARY KEY (id);


--
-- Name: meal_suggestions meal_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_suggestions
    ADD CONSTRAINT meal_suggestions_pkey PRIMARY KEY (id);


--
-- Name: medical_documents medical_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_documents
    ADD CONSTRAINT medical_documents_pkey PRIMARY KEY (id);


--
-- Name: medidas_de_peso medidas_de_peso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medidas_de_peso
    ADD CONSTRAINT medidas_de_peso_pkey PRIMARY KEY (id);


--
-- Name: membros_do_grupo_feed_de_saúde membros_do_grupo_feed_de_saúde_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."membros_do_grupo_feed_de_saúde"
    ADD CONSTRAINT "membros_do_grupo_feed_de_saúde_pkey" PRIMARY KEY (id);


--
-- Name: memória_sofia memória_sofia_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."memória_sofia"
    ADD CONSTRAINT "memória_sofia_pkey" PRIMARY KEY (id);


--
-- Name: missions missions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT missions_pkey PRIMARY KEY (id);


--
-- Name: missões_diárias missões_diárias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."missões_diárias"
    ADD CONSTRAINT "missões_diárias_pkey" PRIMARY KEY (id);


--
-- Name: mock_users mock_users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mock_users
    ADD CONSTRAINT mock_users_email_key UNIQUE (email);


--
-- Name: mock_users mock_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mock_users
    ADD CONSTRAINT mock_users_pkey PRIMARY KEY (id);


--
-- Name: mood_monitoring mood_monitoring_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mood_monitoring
    ADD CONSTRAINT mood_monitoring_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: notificações_enviadas notificações_enviadas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."notificações_enviadas"
    ADD CONSTRAINT "notificações_enviadas_pkey" PRIMARY KEY (id);


--
-- Name: nutrition_foods nutrition_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_foods
    ADD CONSTRAINT nutrition_foods_pkey PRIMARY KEY (id);


--
-- Name: nutrition_tracking nutrition_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_tracking
    ADD CONSTRAINT nutrition_tracking_pkey PRIMARY KEY (id);


--
-- Name: nutritional_aliases nutritional_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritional_aliases
    ADD CONSTRAINT nutritional_aliases_pkey PRIMARY KEY (id);


--
-- Name: nutritional_food_patterns nutritional_food_patterns_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritional_food_patterns
    ADD CONSTRAINT nutritional_food_patterns_pkey PRIMARY KEY (id);


--
-- Name: nutritional_goals nutritional_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritional_goals
    ADD CONSTRAINT nutritional_goals_pkey PRIMARY KEY (id);


--
-- Name: nutritional_protocols nutritional_protocols_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritional_protocols
    ADD CONSTRAINT nutritional_protocols_pkey PRIMARY KEY (id);


--
-- Name: nutritional_recommendations nutritional_recommendations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritional_recommendations
    ADD CONSTRAINT nutritional_recommendations_pkey PRIMARY KEY (id);


--
-- Name: nutritional_yields nutritional_yields_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritional_yields
    ADD CONSTRAINT nutritional_yields_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: payment_records payment_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_records
    ADD CONSTRAINT payment_records_pkey PRIMARY KEY (id);


--
-- Name: pending_nutritional_aliases pending_nutritional_aliases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_nutritional_aliases
    ADD CONSTRAINT pending_nutritional_aliases_pkey PRIMARY KEY (id);


--
-- Name: pontos_do_usuário pontos_do_usuário_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."pontos_do_usuário"
    ADD CONSTRAINT "pontos_do_usuário_pkey" PRIMARY KEY (id);


--
-- Name: pontos_do_usuário pontos_do_usuário_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."pontos_do_usuário"
    ADD CONSTRAINT "pontos_do_usuário_user_id_key" UNIQUE (user_id);


--
-- Name: pontuações_do_usuário pontuações_do_usuário_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."pontuações_do_usuário"
    ADD CONSTRAINT "pontuações_do_usuário_pkey" PRIMARY KEY (id);


--
-- Name: pregnancy_nutrition pregnancy_nutrition_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pregnancy_nutrition
    ADD CONSTRAINT pregnancy_nutrition_pkey PRIMARY KEY (id);


--
-- Name: premium_medical_reports premium_medical_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_medical_reports
    ADD CONSTRAINT premium_medical_reports_pkey PRIMARY KEY (id);


--
-- Name: premium_report_events premium_report_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_report_events
    ADD CONSTRAINT premium_report_events_pkey PRIMARY KEY (id);


--
-- Name: preventive_health_analyses preventive_health_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preventive_health_analyses
    ADD CONSTRAINT preventive_health_analyses_pkey PRIMARY KEY (id);


--
-- Name: professional_evaluations professional_evaluations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.professional_evaluations
    ADD CONSTRAINT professional_evaluations_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: protein_pool protein_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protein_pool
    ADD CONSTRAINT protein_pool_pkey PRIMARY KEY (food_name);


--
-- Name: protocol_supplements protocol_supplements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protocol_supplements
    ADD CONSTRAINT protocol_supplements_pkey PRIMARY KEY (id);


--
-- Name: reações_feed_de_saúde reações_feed_de_saúde_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."reações_feed_de_saúde"
    ADD CONSTRAINT "reações_feed_de_saúde_pkey" PRIMARY KEY (id);


--
-- Name: receitas_terapeuticas receitas_terapeuticas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.receitas_terapeuticas
    ADD CONSTRAINT receitas_terapeuticas_pkey PRIMARY KEY (id);


--
-- Name: recipe_items recipe_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_items
    ADD CONSTRAINT recipe_items_pkey PRIMARY KEY (id);


--
-- Name: recipe_templates recipe_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_templates
    ADD CONSTRAINT recipe_templates_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: registros_diários_de_desafio registros_diários_de_desafio_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."registros_diários_de_desafio"
    ADD CONSTRAINT "registros_diários_de_desafio_pkey" PRIMARY KEY (id);


--
-- Name: respostas_do_sabotador respostas_do_sabotador_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas_do_sabotador
    ADD CONSTRAINT respostas_do_sabotador_pkey PRIMARY KEY (id);


--
-- Name: resumo_nutricional_diário resumo_nutricional_diário_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."resumo_nutricional_diário"
    ADD CONSTRAINT "resumo_nutricional_diário_pkey" PRIMARY KEY (id);


--
-- Name: sabotadores_personalizados sabotadores_personalizados_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sabotadores_personalizados
    ADD CONSTRAINT sabotadores_personalizados_pkey PRIMARY KEY (id);


--
-- Name: saboteur_assessments saboteur_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saboteur_assessments
    ADD CONSTRAINT saboteur_assessments_pkey PRIMARY KEY (id);


--
-- Name: saboteur_responses saboteur_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saboteur_responses
    ADD CONSTRAINT saboteur_responses_pkey PRIMARY KEY (id);


--
-- Name: saboteur_results saboteur_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saboteur_results
    ADD CONSTRAINT saboteur_results_pkey PRIMARY KEY (id);


--
-- Name: saude_especifica saude_especifica_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saude_especifica
    ADD CONSTRAINT saude_especifica_pkey PRIMARY KEY (id);


--
-- Name: scheduled_analysis_records scheduled_analysis_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_analysis_records
    ADD CONSTRAINT scheduled_analysis_records_pkey PRIMARY KEY (id);


--
-- Name: sent_notifications sent_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_notifications
    ADD CONSTRAINT sent_notifications_pkey PRIMARY KEY (id);


--
-- Name: session_templates session_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session_templates
    ADD CONSTRAINT session_templates_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sleep_monitoring sleep_monitoring_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sleep_monitoring
    ADD CONSTRAINT sleep_monitoring_pkey PRIMARY KEY (id);


--
-- Name: smart_notifications smart_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.smart_notifications
    ADD CONSTRAINT smart_notifications_pkey PRIMARY KEY (id);


--
-- Name: sofia_comprehensive_analyses sofia_comprehensive_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_comprehensive_analyses
    ADD CONSTRAINT sofia_comprehensive_analyses_pkey PRIMARY KEY (id);


--
-- Name: sofia_conversation_context sofia_conversation_context_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_conversation_context
    ADD CONSTRAINT sofia_conversation_context_pkey PRIMARY KEY (id);


--
-- Name: sofia_food_analysis sofia_food_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_food_analysis
    ADD CONSTRAINT sofia_food_analysis_pkey PRIMARY KEY (id);


--
-- Name: sofia_knowledge_base sofia_knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_knowledge_base
    ADD CONSTRAINT sofia_knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: sofia_learning sofia_learning_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_learning
    ADD CONSTRAINT sofia_learning_pkey PRIMARY KEY (id);


--
-- Name: sofia_memory sofia_memory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_memory
    ADD CONSTRAINT sofia_memory_pkey PRIMARY KEY (id);


--
-- Name: sofia_messages sofia_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_messages
    ADD CONSTRAINT sofia_messages_pkey PRIMARY KEY (id);


--
-- Name: specific_health specific_health_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specific_health
    ADD CONSTRAINT specific_health_pkey PRIMARY KEY (id);


--
-- Name: sport_training_plans sport_training_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sport_training_plans
    ADD CONSTRAINT sport_training_plans_pkey PRIMARY KEY (id);


--
-- Name: sport_workout_logs sport_workout_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sport_workout_logs
    ADD CONSTRAINT sport_workout_logs_pkey PRIMARY KEY (id);


--
-- Name: sports_achievements sports_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_achievements
    ADD CONSTRAINT sports_achievements_pkey PRIMARY KEY (id);


--
-- Name: sports_challenge_participations sports_challenge_participations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_challenge_participations
    ADD CONSTRAINT sports_challenge_participations_pkey PRIMARY KEY (id);


--
-- Name: sports_challenges sports_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_challenges
    ADD CONSTRAINT sports_challenges_pkey PRIMARY KEY (id);


--
-- Name: sports_training_plans sports_training_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_training_plans
    ADD CONSTRAINT sports_training_plans_pkey PRIMARY KEY (id);


--
-- Name: sports_training_records sports_training_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_training_records
    ADD CONSTRAINT sports_training_records_pkey PRIMARY KEY (id);


--
-- Name: subscription_invoices subscription_invoices_invoice_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT subscription_invoices_invoice_number_key UNIQUE (invoice_number);


--
-- Name: subscription_invoices subscription_invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT subscription_invoices_pkey PRIMARY KEY (id);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: sugestões_nutracêuticas_do_usuário sugestões_nutracêuticas_do_usuário_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sugestões_nutracêuticas_do_usuário"
    ADD CONSTRAINT "sugestões_nutracêuticas_do_usuário_pkey" PRIMARY KEY (id);


--
-- Name: suplementos_do_usuário suplementos_do_usuário_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."suplementos_do_usuário"
    ADD CONSTRAINT "suplementos_do_usuário_pkey" PRIMARY KEY (id);


--
-- Name: supplement_protocols supplement_protocols_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplement_protocols
    ADD CONSTRAINT supplement_protocols_pkey PRIMARY KEY (id);


--
-- Name: supplements supplements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.supplements
    ADD CONSTRAINT supplements_pkey PRIMARY KEY (id);


--
-- Name: taco_foods taco_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taco_foods
    ADD CONSTRAINT taco_foods_pkey PRIMARY KEY (id);


--
-- Name: taco_stage taco_stage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.taco_stage
    ADD CONSTRAINT taco_stage_pkey PRIMARY KEY (id);


--
-- Name: therapeutic_recipes therapeutic_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.therapeutic_recipes
    ADD CONSTRAINT therapeutic_recipes_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_anamnesis_history user_anamnesis_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_anamnesis_history
    ADD CONSTRAINT user_anamnesis_history_pkey PRIMARY KEY (id);


--
-- Name: user_anamnesis user_anamnesis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_anamnesis
    ADD CONSTRAINT user_anamnesis_pkey PRIMARY KEY (id);


--
-- Name: user_anamnesis user_anamnesis_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_anamnesis
    ADD CONSTRAINT user_anamnesis_user_id_key UNIQUE (user_id);


--
-- Name: user_assessments user_assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT user_assessments_pkey PRIMARY KEY (id);


--
-- Name: user_challenges user_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_pkey PRIMARY KEY (id);


--
-- Name: user_custom_saboteurs user_custom_saboteurs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_custom_saboteurs
    ADD CONSTRAINT user_custom_saboteurs_pkey PRIMARY KEY (id);


--
-- Name: user_exercise_programs user_exercise_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_exercise_programs
    ADD CONSTRAINT user_exercise_programs_pkey PRIMARY KEY (id);


--
-- Name: user_favorite_foods user_favorite_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorite_foods
    ADD CONSTRAINT user_favorite_foods_pkey PRIMARY KEY (id);


--
-- Name: user_food_preferences user_food_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_food_preferences
    ADD CONSTRAINT user_food_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_gamification user_gamification_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_gamification
    ADD CONSTRAINT user_gamification_pkey PRIMARY KEY (id);


--
-- Name: user_gamification user_gamification_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_gamification
    ADD CONSTRAINT user_gamification_user_id_key UNIQUE (user_id);


--
-- Name: user_goal_invites user_goal_invites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goal_invites
    ADD CONSTRAINT user_goal_invites_pkey PRIMARY KEY (id);


--
-- Name: user_goal_participants user_goal_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goal_participants
    ADD CONSTRAINT user_goal_participants_pkey PRIMARY KEY (id);


--
-- Name: user_goals user_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT user_goals_pkey PRIMARY KEY (id);


--
-- Name: user_ingredient_history user_ingredient_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_ingredient_history
    ADD CONSTRAINT user_ingredient_history_pkey PRIMARY KEY (id);


--
-- Name: user_medical_reports user_medical_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_medical_reports
    ADD CONSTRAINT user_medical_reports_pkey PRIMARY KEY (id);


--
-- Name: user_missions user_missions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_pkey PRIMARY KEY (id);


--
-- Name: user_missions user_missions_user_id_mission_id_date_assigned_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_user_id_mission_id_date_assigned_key UNIQUE (user_id, mission_id, date_assigned);


--
-- Name: user_notification_settings user_notification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification_settings
    ADD CONSTRAINT user_notification_settings_pkey PRIMARY KEY (id);


--
-- Name: user_notification_settings user_notification_settings_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification_settings
    ADD CONSTRAINT user_notification_settings_user_id_key UNIQUE (user_id);


--
-- Name: user_nutraceutical_suggestions user_nutraceutical_suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_nutraceutical_suggestions
    ADD CONSTRAINT user_nutraceutical_suggestions_pkey PRIMARY KEY (id);


--
-- Name: user_physical_data user_physical_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_physical_data
    ADD CONSTRAINT user_physical_data_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_user_id_lesson_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_lesson_id_key UNIQUE (user_id, lesson_id);


--
-- Name: user_purchases user_purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_purchases
    ADD CONSTRAINT user_purchases_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_key UNIQUE (user_id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: user_sport_modalities user_sport_modalities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sport_modalities
    ADD CONSTRAINT user_sport_modalities_pkey PRIMARY KEY (id);


--
-- Name: user_sports_modalities user_sports_modalities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sports_modalities
    ADD CONSTRAINT user_sports_modalities_pkey PRIMARY KEY (id);


--
-- Name: user_subscriptions user_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_subscriptions
    ADD CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id);


--
-- Name: user_supplements user_supplements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_supplements
    ADD CONSTRAINT user_supplements_pkey PRIMARY KEY (id);


--
-- Name: users_needing_analysis users_needing_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_needing_analysis
    ADD CONSTRAINT users_needing_analysis_pkey PRIMARY KEY (id);


--
-- Name: valores_nutricionais_completos valores_nutricionais_completos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valores_nutricionais_completos
    ADD CONSTRAINT valores_nutricionais_completos_pkey PRIMARY KEY (id);


--
-- Name: vegetable_pool vegetable_pool_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vegetable_pool
    ADD CONSTRAINT vegetable_pool_pkey PRIMARY KEY (food_name);


--
-- Name: water_tracking water_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.water_tracking
    ADD CONSTRAINT water_tracking_pkey PRIMARY KEY (id);


--
-- Name: weekly_analyses weekly_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_analyses
    ADD CONSTRAINT weekly_analyses_pkey PRIMARY KEY (id);


--
-- Name: weekly_analyses weekly_analyses_user_id_semana_inicio_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_analyses
    ADD CONSTRAINT weekly_analyses_user_id_semana_inicio_key UNIQUE (user_id, semana_inicio);


--
-- Name: weekly_goal_progress weekly_goal_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_goal_progress
    ADD CONSTRAINT weekly_goal_progress_pkey PRIMARY KEY (id);


--
-- Name: weekly_insights weekly_insights_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_insights
    ADD CONSTRAINT weekly_insights_pkey PRIMARY KEY (id);


--
-- Name: weekly_insights weekly_insights_user_id_week_start_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_insights
    ADD CONSTRAINT weekly_insights_user_id_week_start_date_key UNIQUE (user_id, week_start_date);


--
-- Name: weighings weighings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weighings
    ADD CONSTRAINT weighings_pkey PRIMARY KEY (id);


--
-- Name: weight_measurements weight_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weight_measurements
    ADD CONSTRAINT weight_measurements_pkey PRIMARY KEY (id);


--
-- Name: weight_measures weight_measures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weight_measures
    ADD CONSTRAINT weight_measures_pkey PRIMARY KEY (id);


--
-- Name: wheel_of_life wheel_of_life_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wheel_of_life
    ADD CONSTRAINT wheel_of_life_pkey PRIMARY KEY (id);


--
-- Name: workout_plans workout_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_plans
    ADD CONSTRAINT workout_plans_pkey PRIMARY KEY (id);


--
-- Name: idx_achievement_tracking_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_achievement_tracking_user_id ON public.achievement_tracking USING btree (user_id);


--
-- Name: idx_activity_categories_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_categories_user_id ON public.activity_categories USING btree (user_id);


--
-- Name: idx_activity_sessions_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_sessions_category_id ON public.activity_sessions USING btree (category_id);


--
-- Name: idx_activity_sessions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_sessions_user_id ON public.activity_sessions USING btree (user_id);


--
-- Name: idx_admin_logs_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_logs_admin ON public.admin_logs USING btree (admin_id);


--
-- Name: idx_advanced_tracking_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_advanced_tracking_user_date ON public.advanced_daily_tracking USING btree (user_id, tracking_date);


--
-- Name: idx_ai_configurations_functionality; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_configurations_functionality ON public.ai_configurations USING btree (functionality);


--
-- Name: idx_ai_usage_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_usage_logs_created_at ON public.ai_usage_logs USING btree (created_at);


--
-- Name: idx_ai_usage_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_usage_logs_user_id ON public.ai_usage_logs USING btree (user_id);


--
-- Name: idx_alimentos_alias_nome; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alimentos_alias_nome ON public.alimentos_alias USING btree (nome_alias);


--
-- Name: idx_alimentos_categoria; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alimentos_categoria ON public.alimentos_completos USING btree (categoria);


--
-- Name: idx_alimentos_nome; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alimentos_nome ON public.alimentos_completos USING btree (nome);


--
-- Name: idx_alimentos_principios_alimento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_alimentos_principios_alimento ON public.alimentos_principios_ativos USING btree (alimento_nome);


--
-- Name: idx_analise_stats_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_analise_stats_user_id ON public."análise_estatísticas" USING btree (user_id);


--
-- Name: idx_avaliacoes_sabotadores_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_avaliacoes_sabotadores_user_id ON public."avaliações_sabotadores" USING btree (user_id);


--
-- Name: idx_backups_anamnese_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_backups_anamnese_user_id ON public."backups_anamnese_do_usuário" USING btree (user_id);


--
-- Name: idx_bioimpedance_analysis_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bioimpedance_analysis_user ON public.bioimpedance_analysis USING btree (user_id);


--
-- Name: idx_challenge_daily_logs_log_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_daily_logs_log_date ON public.challenge_daily_logs USING btree (log_date);


--
-- Name: idx_challenge_daily_logs_participation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_daily_logs_participation_id ON public.challenge_daily_logs USING btree (participation_id);


--
-- Name: idx_challenge_group_messages_challenge_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_group_messages_challenge_id ON public.challenge_group_messages USING btree (challenge_id);


--
-- Name: idx_challenge_group_messages_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_group_messages_user_id ON public.challenge_group_messages USING btree (user_id);


--
-- Name: idx_challenge_participations_challenge_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_participations_challenge_id ON public.challenge_participations USING btree (challenge_id);


--
-- Name: idx_challenge_participations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenge_participations_user_id ON public.challenge_participations USING btree (user_id);


--
-- Name: idx_challenges_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenges_active ON public.challenges USING btree (is_active);


--
-- Name: idx_chat_configurations_config_key; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_configurations_config_key ON public.chat_configurations USING btree (config_key);


--
-- Name: idx_chat_conversations_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_user ON public.chat_conversations USING btree (user_id);


--
-- Name: idx_chat_emotional_analysis_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_emotional_analysis_user_id ON public.chat_emotional_analysis USING btree (user_id);


--
-- Name: idx_chat_emotional_analysis_week_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_emotional_analysis_week_start ON public.chat_emotional_analysis USING btree (week_start);


--
-- Name: idx_chat_messages_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_user ON public.chat_messages USING btree (user_id);


--
-- Name: idx_comidas_favoritas_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comidas_favoritas_user_id ON public."comidas_favoritas_do_usuário" USING btree (user_id);


--
-- Name: idx_comments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id);


--
-- Name: idx_comments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id);


--
-- Name: idx_conquistas_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conquistas_user_id ON public."conquistas_do_usuário" USING btree (user_id);


--
-- Name: idx_content_access_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_content_access_user_id ON public.content_access USING btree (user_id);


--
-- Name: idx_conversation_facts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_facts_user_id ON public.conversation_facts USING btree (user_id);


--
-- Name: idx_conversation_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_messages_conversation_id ON public.conversation_messages USING btree (conversation_id);


--
-- Name: idx_conversation_messages_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_conversation_messages_user_id ON public.conversation_messages USING btree (user_id);


--
-- Name: idx_course_lessons_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_course_lessons_course_id ON public.course_lessons USING btree (course_id);


--
-- Name: idx_course_lessons_module_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_course_lessons_module_id ON public.course_lessons USING btree (module_id);


--
-- Name: idx_daily_mission_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_mission_sessions_user ON public.daily_mission_sessions USING btree (user_id, session_date);


--
-- Name: idx_daily_nutrition_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_nutrition_user_date ON public.daily_nutrition_summary USING btree (user_id, date);


--
-- Name: idx_daily_responses_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_responses_user_date ON public.daily_responses USING btree (user_id, date);


--
-- Name: idx_desafios_esportivos_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_desafios_esportivos_tipo ON public.desafios_esportivos USING btree (tipo_desafio);


--
-- Name: idx_device_sync_log_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_device_sync_log_user_id ON public.device_sync_log USING btree (user_id);


--
-- Name: idx_docs_medicos_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_docs_medicos_data ON public."documentos_médicos" USING btree (data_documento);


--
-- Name: idx_docs_medicos_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_docs_medicos_tipo ON public."documentos_médicos" USING btree (tipo_documento);


--
-- Name: idx_docs_medicos_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_docs_medicos_user_id ON public."documentos_médicos" USING btree (user_id);


--
-- Name: idx_exercise_sessions_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exercise_sessions_user_date ON public.exercise_sessions USING btree (user_id, session_date);


--
-- Name: idx_exercise_tracking_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exercise_tracking_user ON public.exercise_tracking USING btree (user_id, date);


--
-- Name: idx_exercises_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exercises_category ON public.exercises USING btree (category);


--
-- Name: idx_fatos_conversacao_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_fatos_conversacao_user_id ON public."fatos_da_conversação" USING btree (user_id);


--
-- Name: idx_food_active_principles_food_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_food_active_principles_food_id ON public.food_active_principles USING btree (food_id);


--
-- Name: idx_food_aliases_food_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_food_aliases_food_id ON public.food_aliases USING btree (food_id);


--
-- Name: idx_food_analysis_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_food_analysis_user ON public.food_analysis USING btree (user_id);


--
-- Name: idx_food_diseases_food_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_food_diseases_food_id ON public.food_diseases USING btree (food_id);


--
-- Name: idx_goal_updates_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_goal_updates_user ON public.goal_updates USING btree (user_id);


--
-- Name: idx_google_fit_data_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_google_fit_data_user ON public.google_fit_data USING btree (user_id);


--
-- Name: idx_google_fit_data_user_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_google_fit_data_user_time ON public.google_fit_data_extended USING btree (user_id, start_time);


--
-- Name: idx_google_fit_tokens_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_google_fit_tokens_user ON public.google_fit_tokens USING btree (user_id);


--
-- Name: idx_health_alerts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_health_alerts_user_id ON public.health_alerts USING btree (user_id);


--
-- Name: idx_health_conditions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_health_conditions_user ON public.health_conditions USING btree (user_id);


--
-- Name: idx_health_diary_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_health_diary_user_date ON public.health_diary USING btree (user_id, date DESC);


--
-- Name: idx_health_feed_comments_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_health_feed_comments_post_id ON public.health_feed_comments USING btree (post_id);


--
-- Name: idx_health_feed_posts_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_health_feed_posts_user_id ON public.health_feed_posts USING btree (user_id);


--
-- Name: idx_health_feed_reactions_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_health_feed_reactions_post_id ON public.health_feed_reactions USING btree (post_id);


--
-- Name: idx_health_integrations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_health_integrations_user_id ON public.health_integrations USING btree (user_id);


--
-- Name: idx_heart_rate_data_user_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_heart_rate_data_user_time ON public.heart_rate_data USING btree (user_id, measurement_time);


--
-- Name: idx_image_cache_accessed_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_image_cache_accessed_at ON public.image_cache USING btree (accessed_at);


--
-- Name: idx_image_cache_storage_path; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_image_cache_storage_path ON public.image_cache USING btree (storage_path);


--
-- Name: idx_info_economicas_alimento; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_info_economicas_alimento ON public."informações_economicas" USING btree (alimento_nome);


--
-- Name: idx_licoes_curso_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_licoes_curso_id ON public."lições" USING btree (curso_id);


--
-- Name: idx_licoes_modulo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_licoes_modulo_id ON public."lições" USING btree (modulo_id);


--
-- Name: idx_meal_plan_history_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plan_history_user ON public.meal_plan_history USING btree (user_id);


--
-- Name: idx_meal_plan_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plan_history_user_id ON public.meal_plan_history USING btree (user_id);


--
-- Name: idx_meal_plans_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plans_user ON public.meal_plans USING btree (user_id);


--
-- Name: idx_meal_plans_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plans_user_id ON public.meal_plans USING btree (user_id);


--
-- Name: idx_meal_suggestions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_suggestions_user_id ON public.meal_suggestions USING btree (user_id);


--
-- Name: idx_medical_documents_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_medical_documents_user ON public.medical_documents USING btree (user_id);


--
-- Name: idx_medidas_peso_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_medidas_peso_data ON public.medidas_de_peso USING btree (data_medicao);


--
-- Name: idx_medidas_peso_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_medidas_peso_user_id ON public.medidas_de_peso USING btree (user_id);


--
-- Name: idx_membros_grupo_grupo_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_membros_grupo_grupo_id ON public."membros_do_grupo_feed_de_saúde" USING btree (grupo_id);


--
-- Name: idx_membros_grupo_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_membros_grupo_user_id ON public."membros_do_grupo_feed_de_saúde" USING btree (user_id);


--
-- Name: idx_memoria_sofia_tipo; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_memoria_sofia_tipo ON public."memória_sofia" USING btree (tipo_memoria);


--
-- Name: idx_memoria_sofia_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_memoria_sofia_user_id ON public."memória_sofia" USING btree (user_id);


--
-- Name: idx_mood_monitoring_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_mood_monitoring_user_date ON public.mood_monitoring USING btree (user_id, date);


--
-- Name: idx_notificacoes_lida; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notificacoes_lida ON public."notificações_enviadas" USING btree (lida);


--
-- Name: idx_notificacoes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notificacoes_user_id ON public."notificações_enviadas" USING btree (user_id);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_nutrition_foods_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_foods_name ON public.nutrition_foods USING btree (name);


--
-- Name: idx_nutrition_tracking_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_tracking_user_date ON public.nutrition_tracking USING btree (user_id, date);


--
-- Name: idx_nutritional_aliases_food_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutritional_aliases_food_id ON public.nutritional_aliases USING btree (food_id);


--
-- Name: idx_nutritional_goals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutritional_goals_user_id ON public.nutritional_goals USING btree (user_id);


--
-- Name: idx_nutritional_recommendations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutritional_recommendations_user_id ON public.nutritional_recommendations USING btree (user_id);


--
-- Name: idx_payment_records_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_payment_records_user_id ON public.payment_records USING btree (user_id);


--
-- Name: idx_pontuacoes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pontuacoes_user_id ON public."pontuações_do_usuário" USING btree (user_id);


--
-- Name: idx_premium_medical_reports_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_premium_medical_reports_type ON public.premium_medical_reports USING btree (report_type);


--
-- Name: idx_premium_medical_reports_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_premium_medical_reports_user_id ON public.premium_medical_reports USING btree (user_id);


--
-- Name: idx_preventive_health_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_preventive_health_user ON public.preventive_health_analyses USING btree (user_id);


--
-- Name: idx_professional_evaluations_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_evaluations_date ON public.professional_evaluations USING btree (evaluation_date);


--
-- Name: idx_professional_evaluations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_professional_evaluations_user_id ON public.professional_evaluations USING btree (user_id);


--
-- Name: idx_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);


--
-- Name: idx_protocol_supplements_protocol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_protocol_supplements_protocol ON public.protocol_supplements USING btree (protocol_id);


--
-- Name: idx_reacoes_post_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reacoes_post_id ON public."reações_feed_de_saúde" USING btree (post_id);


--
-- Name: idx_reacoes_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reacoes_user_id ON public."reações_feed_de_saúde" USING btree (user_id);


--
-- Name: idx_respostas_sabotador_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_respostas_sabotador_user_id ON public.respostas_do_sabotador USING btree (user_id);


--
-- Name: idx_resumo_nutri_data; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resumo_nutri_data ON public."resumo_nutricional_diário" USING btree (data);


--
-- Name: idx_resumo_nutri_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_resumo_nutri_user_id ON public."resumo_nutricional_diário" USING btree (user_id);


--
-- Name: idx_saboteur_assessments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_saboteur_assessments_user_id ON public.saboteur_assessments USING btree (user_id);


--
-- Name: idx_saboteur_responses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_saboteur_responses_user_id ON public.saboteur_responses USING btree (user_id);


--
-- Name: idx_saboteur_results_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_saboteur_results_user_id ON public.saboteur_results USING btree (user_id);


--
-- Name: idx_saude_especifica_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_saude_especifica_user_id ON public.saude_especifica USING btree (user_id);


--
-- Name: idx_scheduled_analysis_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_scheduled_analysis_user_id ON public.scheduled_analysis_records USING btree (user_id);


--
-- Name: idx_sent_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sent_notifications_user_id ON public.sent_notifications USING btree (user_id);


--
-- Name: idx_sessions_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_is_active ON public.sessions USING btree (is_active);


--
-- Name: idx_smart_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_smart_notifications_created_at ON public.smart_notifications USING btree (created_at);


--
-- Name: idx_smart_notifications_user_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_smart_notifications_user_active ON public.smart_notifications USING btree (user_id, is_active);


--
-- Name: idx_sofia_analyses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sofia_analyses_user_id ON public.sofia_comprehensive_analyses USING btree (user_id);


--
-- Name: idx_sofia_context_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sofia_context_user_id ON public.sofia_conversation_context USING btree (user_id);


--
-- Name: idx_sofia_food_analysis_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sofia_food_analysis_user ON public.sofia_food_analysis USING btree (user_id);


--
-- Name: idx_sofia_food_analysis_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sofia_food_analysis_user_id ON public.sofia_food_analysis USING btree (user_id);


--
-- Name: idx_sofia_knowledge_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sofia_knowledge_category ON public.sofia_knowledge_base USING btree (category);


--
-- Name: idx_sofia_memory_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sofia_memory_type ON public.sofia_memory USING btree (memory_type);


--
-- Name: idx_sofia_memory_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sofia_memory_user_id ON public.sofia_memory USING btree (user_id);


--
-- Name: idx_sofia_messages_conversation_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sofia_messages_conversation_id ON public.sofia_messages USING btree (conversation_id);


--
-- Name: idx_sofia_messages_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sofia_messages_user_id ON public.sofia_messages USING btree (user_id);


--
-- Name: idx_sport_training_plans_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sport_training_plans_user ON public.sport_training_plans USING btree (user_id);


--
-- Name: idx_sport_workout_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sport_workout_logs_user ON public.sport_workout_logs USING btree (user_id);


--
-- Name: idx_sports_achievements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sports_achievements_user_id ON public.sports_achievements USING btree (user_id);


--
-- Name: idx_sports_challenge_participations_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sports_challenge_participations_user_id ON public.sports_challenge_participations USING btree (user_id);


--
-- Name: idx_sports_training_plans_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sports_training_plans_user_id ON public.sports_training_plans USING btree (user_id);


--
-- Name: idx_sports_training_records_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sports_training_records_user_id ON public.sports_training_records USING btree (user_id);


--
-- Name: idx_subscription_invoices_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subscription_invoices_user_id ON public.subscription_invoices USING btree (user_id);


--
-- Name: idx_sugestoes_nutra_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sugestoes_nutra_user_id ON public."sugestões_nutracêuticas_do_usuário" USING btree (user_id);


--
-- Name: idx_suplementos_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_suplementos_user_id ON public."suplementos_do_usuário" USING btree (user_id);


--
-- Name: idx_supplements_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supplements_category ON public.supplements USING btree (category);


--
-- Name: idx_taco_foods_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_taco_foods_category ON public.taco_foods USING btree (category);


--
-- Name: idx_user_achievements_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_achievements_user ON public.user_achievements USING btree (user_id);


--
-- Name: idx_user_anamnesis_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_anamnesis_user ON public.user_anamnesis USING btree (user_id);


--
-- Name: idx_user_assessments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_assessments_user_id ON public.user_assessments USING btree (user_id);


--
-- Name: idx_user_challenges_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_challenges_user ON public.user_challenges USING btree (user_id);


--
-- Name: idx_user_custom_saboteurs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_custom_saboteurs_user_id ON public.user_custom_saboteurs USING btree (user_id);


--
-- Name: idx_user_exercise_programs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_exercise_programs_user ON public.user_exercise_programs USING btree (user_id);


--
-- Name: idx_user_favorite_foods_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_favorite_foods_user_id ON public.user_favorite_foods USING btree (user_id);


--
-- Name: idx_user_food_preferences_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_food_preferences_user ON public.user_food_preferences USING btree (user_id);


--
-- Name: idx_user_gamification_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_gamification_user ON public.user_gamification USING btree (user_id);


--
-- Name: idx_user_goals_approved_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_goals_approved_by ON public.user_goals USING btree (approved_by);


--
-- Name: idx_user_goals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_goals_status ON public.user_goals USING btree (status);


--
-- Name: idx_user_goals_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_goals_user_id ON public.user_goals USING btree (user_id);


--
-- Name: idx_user_goals_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_goals_user_status ON public.user_goals USING btree (user_id, status);


--
-- Name: idx_user_ingredient_history_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_ingredient_history_user_id ON public.user_ingredient_history USING btree (user_id);


--
-- Name: idx_user_medical_reports_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_medical_reports_user_id ON public.user_medical_reports USING btree (user_id);


--
-- Name: idx_user_missions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_missions_user ON public.user_missions USING btree (user_id, date_assigned);


--
-- Name: idx_user_physical_data_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_physical_data_user ON public.user_physical_data USING btree (user_id);


--
-- Name: idx_user_progress_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_progress_user ON public.user_progress USING btree (user_id);


--
-- Name: idx_user_purchases_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_purchases_user ON public.user_purchases USING btree (user_id);


--
-- Name: idx_user_roles_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_role ON public.user_roles USING btree (role);


--
-- Name: idx_user_roles_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user ON public.user_roles USING btree (user_id);


--
-- Name: idx_user_roles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user_id ON public.user_roles USING btree (user_id);


--
-- Name: idx_user_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_user ON public.user_sessions USING btree (user_id);


--
-- Name: idx_user_sport_modalities_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sport_modalities_user_id ON public.user_sport_modalities USING btree (user_id);


--
-- Name: idx_user_subscriptions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_subscriptions_status ON public.user_subscriptions USING btree (status);


--
-- Name: idx_user_subscriptions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_subscriptions_user_id ON public.user_subscriptions USING btree (user_id);


--
-- Name: idx_user_supplements_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_supplements_user_id ON public.user_supplements USING btree (user_id);


--
-- Name: idx_valores_alimento_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_valores_alimento_id ON public.valores_nutricionais_completos USING btree (alimento_id);


--
-- Name: idx_valores_alimento_nome; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_valores_alimento_nome ON public.valores_nutricionais_completos USING btree (alimento_nome);


--
-- Name: idx_water_tracking_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_water_tracking_user ON public.water_tracking USING btree (user_id, date);


--
-- Name: idx_water_tracking_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_water_tracking_user_date ON public.water_tracking USING btree (user_id, date);


--
-- Name: idx_weekly_analyses_semana_inicio; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_analyses_semana_inicio ON public.weekly_analyses USING btree (semana_inicio);


--
-- Name: idx_weekly_analyses_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_analyses_user_id ON public.weekly_analyses USING btree (user_id);


--
-- Name: idx_weekly_analyses_user_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_analyses_user_week ON public.weekly_analyses USING btree (user_id, semana_inicio DESC);


--
-- Name: idx_weekly_goal_progress_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_goal_progress_user ON public.weekly_goal_progress USING btree (user_id);


--
-- Name: idx_weekly_insights_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_insights_user_id ON public.weekly_insights USING btree (user_id);


--
-- Name: idx_weekly_insights_week_start; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_insights_week_start ON public.weekly_insights USING btree (week_start_date);


--
-- Name: idx_weight_measurements_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weight_measurements_user_date ON public.weight_measurements USING btree (user_id, measurement_date DESC);


--
-- Name: idx_weight_measures_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weight_measures_user_date ON public.weight_measures USING btree (user_id, measurement_date);


--
-- Name: idx_wheel_of_life_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wheel_of_life_user_date ON public.wheel_of_life USING btree (user_id, assessment_date);


--
-- Name: idx_workout_plans_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_plans_user ON public.workout_plans USING btree (user_id);


--
-- Name: ai_configurations update_ai_configurations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_configurations_updated_at BEFORE UPDATE ON public.ai_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: ai_fallback_configs update_ai_fallback_configs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_fallback_configs_updated_at BEFORE UPDATE ON public.ai_fallback_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: alimentos_completos update_alimentos_completos_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_alimentos_completos_updated_at BEFORE UPDATE ON public.alimentos_completos FOR EACH ROW EXECUTE FUNCTION public.update_alimentos_updated_at();


--
-- Name: challenge_participations update_challenge_participations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_challenge_participations_updated_at BEFORE UPDATE ON public.challenge_participations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: challenges update_challenges_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chat_configurations update_chat_configurations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_chat_configurations_updated_at BEFORE UPDATE ON public.chat_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chat_conversations update_chat_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: company_configurations update_company_configurations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_configurations_updated_at BEFORE UPDATE ON public.company_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: company_data update_company_data_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_company_data_updated_at BEFORE UPDATE ON public.company_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: courses update_courses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: exercise_programs update_exercise_programs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_exercise_programs_updated_at BEFORE UPDATE ON public.exercise_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: exercises update_exercises_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON public.exercises FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: google_fit_tokens update_google_fit_tokens_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_google_fit_tokens_updated_at BEFORE UPDATE ON public.google_fit_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: company_knowledge_base update_knowledge_base_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_knowledge_base_updated_at BEFORE UPDATE ON public.company_knowledge_base FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: meal_plan_history update_meal_plan_history_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_meal_plan_history_updated_at BEFORE UPDATE ON public.meal_plan_history FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: meal_plans update_meal_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: medical_documents update_medical_documents_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_medical_documents_updated_at BEFORE UPDATE ON public.medical_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nutrition_foods update_nutrition_foods_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_nutrition_foods_updated_at BEFORE UPDATE ON public.nutrition_foods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: premium_medical_reports update_premium_medical_reports_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_premium_medical_reports_updated_at BEFORE UPDATE ON public.premium_medical_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: professional_evaluations update_professional_evaluations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_professional_evaluations_updated_at BEFORE UPDATE ON public.professional_evaluations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sessions update_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sport_training_plans update_sport_training_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sport_training_plans_updated_at BEFORE UPDATE ON public.sport_training_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: supplement_protocols update_supplement_protocols_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_supplement_protocols_updated_at BEFORE UPDATE ON public.supplement_protocols FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: supplements update_supplements_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_supplements_updated_at BEFORE UPDATE ON public.supplements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_anamnesis update_user_anamnesis_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_anamnesis_updated_at BEFORE UPDATE ON public.user_anamnesis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_gamification update_user_gamification_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_gamification_updated_at BEFORE UPDATE ON public.user_gamification FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_goals update_user_goals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON public.user_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_physical_data update_user_physical_data_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_physical_data_updated_at BEFORE UPDATE ON public.user_physical_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_roles update_user_roles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_sessions update_user_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON public.user_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_sport_modalities update_user_sport_modalities_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_sport_modalities_updated_at BEFORE UPDATE ON public.user_sport_modalities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: user_subscriptions update_user_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: weekly_analyses update_weekly_analyses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_weekly_analyses_updated_at BEFORE UPDATE ON public.weekly_analyses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: workout_plans update_workout_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: achievement_tracking achievement_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.achievement_tracking
    ADD CONSTRAINT achievement_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id);


--
-- Name: advanced_daily_tracking advanced_daily_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.advanced_daily_tracking
    ADD CONSTRAINT advanced_daily_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_documents ai_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_documents
    ADD CONSTRAINT ai_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_system_logs ai_system_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_system_logs
    ADD CONSTRAINT ai_system_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id);


--
-- Name: análise_estatísticas análise_estatísticas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."análise_estatísticas"
    ADD CONSTRAINT "análise_estatísticas_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: avaliações_sabotadores avaliações_sabotadores_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."avaliações_sabotadores"
    ADD CONSTRAINT "avaliações_sabotadores_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: backups_anamnese_do_usuário backups_anamnese_do_usuário_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."backups_anamnese_do_usuário"
    ADD CONSTRAINT "backups_anamnese_do_usuário_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: bioimpedance_analysis bioimpedance_analysis_measurement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bioimpedance_analysis
    ADD CONSTRAINT bioimpedance_analysis_measurement_id_fkey FOREIGN KEY (measurement_id) REFERENCES public.weight_measurements(id);


--
-- Name: bioimpedance_analysis bioimpedance_analysis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bioimpedance_analysis
    ADD CONSTRAINT bioimpedance_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: challenge_leaderboard challenge_leaderboard_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_leaderboard
    ADD CONSTRAINT challenge_leaderboard_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;


--
-- Name: challenge_leaderboard challenge_leaderboard_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_leaderboard
    ADD CONSTRAINT challenge_leaderboard_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: challenge_participations challenge_participations_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenge_participations
    ADD CONSTRAINT challenge_participations_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;


--
-- Name: chat_conversations chat_conversations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: comidas_favoritas_do_usuário comidas_favoritas_do_usuário_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."comidas_favoritas_do_usuário"
    ADD CONSTRAINT "comidas_favoritas_do_usuário_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: conquistas_do_usuário conquistas_do_usuário_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."conquistas_do_usuário"
    ADD CONSTRAINT "conquistas_do_usuário_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: content_access content_access_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.content_access
    ADD CONSTRAINT content_access_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: conversation_facts conversation_facts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_facts
    ADD CONSTRAINT conversation_facts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: conversation_messages conversation_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversation_messages
    ADD CONSTRAINT conversation_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: course_modules course_modules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: dados_físicos_do_usuário dados_físicos_do_usuário_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."dados_físicos_do_usuário"
    ADD CONSTRAINT "dados_físicos_do_usuário_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: daily_mission_sessions daily_mission_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_mission_sessions
    ADD CONSTRAINT daily_mission_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: daily_nutrition_summary daily_nutrition_summary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_nutrition_summary
    ADD CONSTRAINT daily_nutrition_summary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: daily_responses daily_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_responses
    ADD CONSTRAINT daily_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: device_sync_log device_sync_log_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.device_sync_log
    ADD CONSTRAINT device_sync_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: documentos_médicos documentos_médicos_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."documentos_médicos"
    ADD CONSTRAINT "documentos_médicos_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: exercise_ai_recommendations exercise_ai_recommendations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_ai_recommendations
    ADD CONSTRAINT exercise_ai_recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: exercise_progress_analysis exercise_progress_analysis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_progress_analysis
    ADD CONSTRAINT exercise_progress_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: exercise_sessions exercise_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_sessions
    ADD CONSTRAINT exercise_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: exercise_tracking exercise_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_tracking
    ADD CONSTRAINT exercise_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: fatos_da_conversação fatos_da_conversação_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."fatos_da_conversação"
    ADD CONSTRAINT "fatos_da_conversação_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: food_active_principles food_active_principles_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_active_principles
    ADD CONSTRAINT food_active_principles_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.nutrition_foods(id) ON DELETE CASCADE;


--
-- Name: food_aliases food_aliases_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_aliases
    ADD CONSTRAINT food_aliases_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.nutrition_foods(id) ON DELETE CASCADE;


--
-- Name: food_analysis food_analysis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_analysis
    ADD CONSTRAINT food_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: food_diseases food_diseases_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_diseases
    ADD CONSTRAINT food_diseases_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.nutrition_foods(id);


--
-- Name: goal_updates goal_updates_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goal_updates
    ADD CONSTRAINT goal_updates_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.user_goals(id) ON DELETE CASCADE;


--
-- Name: goal_updates goal_updates_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goal_updates
    ADD CONSTRAINT goal_updates_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: google_fit_analysis google_fit_analysis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_fit_analysis
    ADD CONSTRAINT google_fit_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: google_fit_data_extended google_fit_data_extended_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_fit_data_extended
    ADD CONSTRAINT google_fit_data_extended_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: google_fit_data google_fit_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_fit_data
    ADD CONSTRAINT google_fit_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: google_fit_tokens google_fit_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.google_fit_tokens
    ADD CONSTRAINT google_fit_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: health_alerts health_alerts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_alerts
    ADD CONSTRAINT health_alerts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: health_conditions health_conditions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_conditions
    ADD CONSTRAINT health_conditions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: health_diary health_diary_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_diary
    ADD CONSTRAINT health_diary_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: health_feed_comments health_feed_comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_comments
    ADD CONSTRAINT health_feed_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.health_feed_posts(id) ON DELETE CASCADE;


--
-- Name: health_feed_comments health_feed_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_comments
    ADD CONSTRAINT health_feed_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: health_feed_follows health_feed_follows_follower_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_follows
    ADD CONSTRAINT health_feed_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: health_feed_follows health_feed_follows_following_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_follows
    ADD CONSTRAINT health_feed_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: health_feed_group_members health_feed_group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_group_members
    ADD CONSTRAINT health_feed_group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.health_feed_groups(id) ON DELETE CASCADE;


--
-- Name: health_feed_group_members health_feed_group_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_group_members
    ADD CONSTRAINT health_feed_group_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: health_feed_groups health_feed_groups_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_groups
    ADD CONSTRAINT health_feed_groups_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: health_feed_posts health_feed_posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_posts
    ADD CONSTRAINT health_feed_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: health_feed_reactions health_feed_reactions_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_reactions
    ADD CONSTRAINT health_feed_reactions_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.health_feed_posts(id) ON DELETE CASCADE;


--
-- Name: health_feed_reactions health_feed_reactions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_feed_reactions
    ADD CONSTRAINT health_feed_reactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: health_integrations health_integrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.health_integrations
    ADD CONSTRAINT health_integrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: heart_rate_data heart_rate_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.heart_rate_data
    ADD CONSTRAINT heart_rate_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: information_feedback information_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.information_feedback
    ADD CONSTRAINT information_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;


--
-- Name: meal_feedback meal_feedback_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_feedback
    ADD CONSTRAINT meal_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: meal_plan_history meal_plan_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_history
    ADD CONSTRAINT meal_plan_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: meal_plan_items meal_plan_items_meal_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT meal_plan_items_meal_plan_id_fkey FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plans(id) ON DELETE CASCADE;


--
-- Name: meal_plan_items meal_plan_items_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT meal_plan_items_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id);


--
-- Name: meal_plans meal_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: meal_suggestions meal_suggestions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_suggestions
    ADD CONSTRAINT meal_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: medical_documents medical_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_documents
    ADD CONSTRAINT medical_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: medidas_de_peso medidas_de_peso_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medidas_de_peso
    ADD CONSTRAINT medidas_de_peso_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: membros_do_grupo_feed_de_saúde membros_do_grupo_feed_de_saúde_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."membros_do_grupo_feed_de_saúde"
    ADD CONSTRAINT "membros_do_grupo_feed_de_saúde_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: memória_sofia memória_sofia_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."memória_sofia"
    ADD CONSTRAINT "memória_sofia_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mood_monitoring mood_monitoring_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mood_monitoring
    ADD CONSTRAINT mood_monitoring_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notificações_enviadas notificações_enviadas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."notificações_enviadas"
    ADD CONSTRAINT "notificações_enviadas_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: nutrition_tracking nutrition_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_tracking
    ADD CONSTRAINT nutrition_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: nutritional_aliases nutritional_aliases_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritional_aliases
    ADD CONSTRAINT nutritional_aliases_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.nutrition_foods(id) ON DELETE CASCADE;


--
-- Name: nutritional_goals nutritional_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritional_goals
    ADD CONSTRAINT nutritional_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: nutritional_recommendations nutritional_recommendations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutritional_recommendations
    ADD CONSTRAINT nutritional_recommendations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: payment_records payment_records_invoice_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_records
    ADD CONSTRAINT payment_records_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.subscription_invoices(id);


--
-- Name: payment_records payment_records_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_records
    ADD CONSTRAINT payment_records_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id);


--
-- Name: payment_records payment_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payment_records
    ADD CONSTRAINT payment_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: pending_nutritional_aliases pending_nutritional_aliases_submitted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pending_nutritional_aliases
    ADD CONSTRAINT pending_nutritional_aliases_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES auth.users(id);


--
-- Name: pontos_do_usuário pontos_do_usuário_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."pontos_do_usuário"
    ADD CONSTRAINT "pontos_do_usuário_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: pontuações_do_usuário pontuações_do_usuário_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."pontuações_do_usuário"
    ADD CONSTRAINT "pontuações_do_usuário_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: premium_report_events premium_report_events_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_report_events
    ADD CONSTRAINT premium_report_events_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.premium_medical_reports(id);


--
-- Name: premium_report_events premium_report_events_triggered_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.premium_report_events
    ADD CONSTRAINT premium_report_events_triggered_by_fkey FOREIGN KEY (triggered_by) REFERENCES auth.users(id);


--
-- Name: preventive_health_analyses preventive_health_analyses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preventive_health_analyses
    ADD CONSTRAINT preventive_health_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: protocol_supplements protocol_supplements_protocol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protocol_supplements
    ADD CONSTRAINT protocol_supplements_protocol_id_fkey FOREIGN KEY (protocol_id) REFERENCES public.supplement_protocols(id) ON DELETE CASCADE;


--
-- Name: reações_feed_de_saúde reações_feed_de_saúde_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."reações_feed_de_saúde"
    ADD CONSTRAINT "reações_feed_de_saúde_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: recipe_components recipe_components_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_components
    ADD CONSTRAINT recipe_components_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: recipe_items recipe_items_food_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_items
    ADD CONSTRAINT recipe_items_food_id_fkey FOREIGN KEY (food_id) REFERENCES public.nutrition_foods(id);


--
-- Name: recipe_items recipe_items_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipe_items
    ADD CONSTRAINT recipe_items_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: respostas_do_sabotador respostas_do_sabotador_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.respostas_do_sabotador
    ADD CONSTRAINT respostas_do_sabotador_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: resumo_nutricional_diário resumo_nutricional_diário_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."resumo_nutricional_diário"
    ADD CONSTRAINT "resumo_nutricional_diário_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saboteur_assessments saboteur_assessments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saboteur_assessments
    ADD CONSTRAINT saboteur_assessments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saboteur_responses saboteur_responses_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saboteur_responses
    ADD CONSTRAINT saboteur_responses_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.saboteur_results(id);


--
-- Name: saboteur_responses saboteur_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saboteur_responses
    ADD CONSTRAINT saboteur_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saboteur_results saboteur_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saboteur_results
    ADD CONSTRAINT saboteur_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: saude_especifica saude_especifica_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.saude_especifica
    ADD CONSTRAINT saude_especifica_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: scheduled_analysis_records scheduled_analysis_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scheduled_analysis_records
    ADD CONSTRAINT scheduled_analysis_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sent_notifications sent_notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sent_notifications
    ADD CONSTRAINT sent_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: sleep_monitoring sleep_monitoring_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sleep_monitoring
    ADD CONSTRAINT sleep_monitoring_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sofia_comprehensive_analyses sofia_comprehensive_analyses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_comprehensive_analyses
    ADD CONSTRAINT sofia_comprehensive_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sofia_conversation_context sofia_conversation_context_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_conversation_context
    ADD CONSTRAINT sofia_conversation_context_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sofia_food_analysis sofia_food_analysis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_food_analysis
    ADD CONSTRAINT sofia_food_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sofia_learning sofia_learning_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_learning
    ADD CONSTRAINT sofia_learning_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sofia_memory sofia_memory_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_memory
    ADD CONSTRAINT sofia_memory_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sofia_messages sofia_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_messages
    ADD CONSTRAINT sofia_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: specific_health specific_health_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.specific_health
    ADD CONSTRAINT specific_health_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sport_training_plans sport_training_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sport_training_plans
    ADD CONSTRAINT sport_training_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sport_workout_logs sport_workout_logs_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sport_workout_logs
    ADD CONSTRAINT sport_workout_logs_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.sport_training_plans(id) ON DELETE CASCADE;


--
-- Name: sport_workout_logs sport_workout_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sport_workout_logs
    ADD CONSTRAINT sport_workout_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sports_achievements sports_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_achievements
    ADD CONSTRAINT sports_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sports_challenge_participations sports_challenge_participations_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_challenge_participations
    ADD CONSTRAINT sports_challenge_participations_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.sports_challenges(id) ON DELETE CASCADE;


--
-- Name: sports_challenge_participations sports_challenge_participations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_challenge_participations
    ADD CONSTRAINT sports_challenge_participations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sports_training_plans sports_training_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_training_plans
    ADD CONSTRAINT sports_training_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sports_training_records sports_training_records_training_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_training_records
    ADD CONSTRAINT sports_training_records_training_plan_id_fkey FOREIGN KEY (training_plan_id) REFERENCES public.sports_training_plans(id);


--
-- Name: sports_training_records sports_training_records_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sports_training_records
    ADD CONSTRAINT sports_training_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: subscription_invoices subscription_invoices_subscription_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT subscription_invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.user_subscriptions(id);


--
-- Name: subscription_invoices subscription_invoices_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscription_invoices
    ADD CONSTRAINT subscription_invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sugestões_nutracêuticas_do_usuário sugestões_nutracêuticas_do_usuário_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."sugestões_nutracêuticas_do_usuário"
    ADD CONSTRAINT "sugestões_nutracêuticas_do_usuário_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: suplementos_do_usuário suplementos_do_usuário_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."suplementos_do_usuário"
    ADD CONSTRAINT "suplementos_do_usuário_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_anamnesis_history user_anamnesis_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_anamnesis_history
    ADD CONSTRAINT user_anamnesis_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES auth.users(id);


--
-- Name: user_anamnesis_history user_anamnesis_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_anamnesis_history
    ADD CONSTRAINT user_anamnesis_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_anamnesis user_anamnesis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_anamnesis
    ADD CONSTRAINT user_anamnesis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_assessments user_assessments_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT user_assessments_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- Name: user_assessments user_assessments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_assessments
    ADD CONSTRAINT user_assessments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_challenges user_challenges_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.challenges(id) ON DELETE CASCADE;


--
-- Name: user_challenges user_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_custom_saboteurs user_custom_saboteurs_saboteur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_custom_saboteurs
    ADD CONSTRAINT user_custom_saboteurs_saboteur_id_fkey FOREIGN KEY (saboteur_id) REFERENCES public.custom_saboteurs(id);


--
-- Name: user_custom_saboteurs user_custom_saboteurs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_custom_saboteurs
    ADD CONSTRAINT user_custom_saboteurs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_exercise_programs user_exercise_programs_program_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_exercise_programs
    ADD CONSTRAINT user_exercise_programs_program_id_fkey FOREIGN KEY (program_id) REFERENCES public.exercise_programs(id) ON DELETE CASCADE;


--
-- Name: user_exercise_programs user_exercise_programs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_exercise_programs
    ADD CONSTRAINT user_exercise_programs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_favorite_foods user_favorite_foods_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_favorite_foods
    ADD CONSTRAINT user_favorite_foods_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_food_preferences user_food_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_food_preferences
    ADD CONSTRAINT user_food_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_gamification user_gamification_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_gamification
    ADD CONSTRAINT user_gamification_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_goal_invites user_goal_invites_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goal_invites
    ADD CONSTRAINT user_goal_invites_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.user_goals(id) ON DELETE CASCADE;


--
-- Name: user_goal_invites user_goal_invites_invitee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goal_invites
    ADD CONSTRAINT user_goal_invites_invitee_id_fkey FOREIGN KEY (invitee_id) REFERENCES auth.users(id);


--
-- Name: user_goal_invites user_goal_invites_inviter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goal_invites
    ADD CONSTRAINT user_goal_invites_inviter_id_fkey FOREIGN KEY (inviter_id) REFERENCES auth.users(id);


--
-- Name: user_goal_participants user_goal_participants_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goal_participants
    ADD CONSTRAINT user_goal_participants_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.user_goals(id) ON DELETE CASCADE;


--
-- Name: user_goal_participants user_goal_participants_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goal_participants
    ADD CONSTRAINT user_goal_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_goals user_goals_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT user_goals_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: user_goals user_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_ingredient_history user_ingredient_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_ingredient_history
    ADD CONSTRAINT user_ingredient_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_medical_reports user_medical_reports_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_medical_reports
    ADD CONSTRAINT user_medical_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_missions user_missions_mission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(id) ON DELETE CASCADE;


--
-- Name: user_missions user_missions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_missions
    ADD CONSTRAINT user_missions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_notification_settings user_notification_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_notification_settings
    ADD CONSTRAINT user_notification_settings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_nutraceutical_suggestions user_nutraceutical_suggestions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_nutraceutical_suggestions
    ADD CONSTRAINT user_nutraceutical_suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_physical_data user_physical_data_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_physical_data
    ADD CONSTRAINT user_physical_data_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: user_progress user_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_purchases user_purchases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_purchases
    ADD CONSTRAINT user_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.sessions(id) ON DELETE CASCADE;


--
-- Name: user_sessions user_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_sports_modalities user_sports_modalities_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_sports_modalities
    ADD CONSTRAINT user_sports_modalities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_supplements user_supplements_supplement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_supplements
    ADD CONSTRAINT user_supplements_supplement_id_fkey FOREIGN KEY (supplement_id) REFERENCES public.supplements(id);


--
-- Name: user_supplements user_supplements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_supplements
    ADD CONSTRAINT user_supplements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: users_needing_analysis users_needing_analysis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users_needing_analysis
    ADD CONSTRAINT users_needing_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: valores_nutricionais_completos valores_nutricionais_completos_alimento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.valores_nutricionais_completos
    ADD CONSTRAINT valores_nutricionais_completos_alimento_id_fkey FOREIGN KEY (alimento_id) REFERENCES public.alimentos_completos(id) ON DELETE CASCADE;


--
-- Name: water_tracking water_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.water_tracking
    ADD CONSTRAINT water_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: weekly_analyses weekly_analyses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_analyses
    ADD CONSTRAINT weekly_analyses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: weekly_goal_progress weekly_goal_progress_goal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_goal_progress
    ADD CONSTRAINT weekly_goal_progress_goal_id_fkey FOREIGN KEY (goal_id) REFERENCES public.user_goals(id) ON DELETE CASCADE;


--
-- Name: weekly_goal_progress weekly_goal_progress_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weekly_goal_progress
    ADD CONSTRAINT weekly_goal_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: weighings weighings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weighings
    ADD CONSTRAINT weighings_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: weight_measurements weight_measurements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weight_measurements
    ADD CONSTRAINT weight_measurements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: weight_measures weight_measures_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weight_measures
    ADD CONSTRAINT weight_measures_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: wheel_of_life wheel_of_life_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.wheel_of_life
    ADD CONSTRAINT wheel_of_life_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: workout_plans workout_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_plans
    ADD CONSTRAINT workout_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_sessions Admins can delete any session; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete any session" ON public.user_sessions FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: admin_logs Admins can insert admin logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert admin logs" ON public.admin_logs FOR INSERT WITH CHECK (true);


--
-- Name: user_sessions Admins can insert sessions for any user; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert sessions for any user" ON public.user_sessions FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: user_roles Admins can manage user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage user roles" ON public.user_roles USING ((EXISTS ( SELECT 1
   FROM public.user_roles user_roles_1
  WHERE ((user_roles_1.user_id = auth.uid()) AND (user_roles_1.role = 'admin'::text)))));


--
-- Name: user_sessions Admins can update all sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update all sessions" ON public.user_sessions FOR UPDATE TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: admin_logs Admins can view admin logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view admin logs" ON public.admin_logs FOR SELECT USING (true);


--
-- Name: user_sessions Admins can view all sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all sessions" ON public.user_sessions FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::text)))));


--
-- Name: challenge_group_messages Authenticated users can create challenge messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create challenge messages" ON public.challenge_group_messages FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: image_cache Authenticated users can insert image cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can insert image cache" ON public.image_cache FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: image_cache Authenticated users can read image cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can read image cache" ON public.image_cache FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: image_cache Authenticated users can update image cache; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can update image cache" ON public.image_cache FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: sofia_learning Authenticated users can view sofia learning; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view sofia learning" ON public.sofia_learning FOR SELECT USING (((auth.uid() IS NOT NULL) OR (user_id IS NULL)));


--
-- Name: ai_fallback_configs Everyone can view AI fallback configs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view AI fallback configs" ON public.ai_fallback_configs FOR SELECT USING (true);


--
-- Name: ai_presets Everyone can view AI presets; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view AI presets" ON public.ai_presets FOR SELECT USING (true);


--
-- Name: sabotadores_personalizados Everyone can view active custom saboteurs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view active custom saboteurs" ON public.sabotadores_personalizados FOR SELECT USING ((is_active = true));


--
-- Name: missões_diárias Everyone can view active daily missions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view active daily missions" ON public."missões_diárias" FOR SELECT USING ((is_active = true));


--
-- Name: active_principles Everyone can view active principles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view active principles" ON public.active_principles FOR SELECT USING ((is_active = true));


--
-- Name: desafios_esportivos Everyone can view active sports challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view active sports challenges" ON public.desafios_esportivos FOR SELECT USING (true);


--
-- Name: sports_challenges Everyone can view active sports challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view active sports challenges" ON public.sports_challenges FOR SELECT USING ((is_active = true));


--
-- Name: ai_configurations Everyone can view ai config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view ai config" ON public.ai_configurations FOR SELECT USING (true);


--
-- Name: configurações_ai Everyone can view ai configurations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view ai configurations" ON public."configurações_ai" FOR SELECT USING (true);


--
-- Name: alimentos_completos Everyone can view alimentos; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view alimentos" ON public.alimentos_completos FOR SELECT USING (true);


--
-- Name: assessments Everyone can view assessments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view assessments" ON public.assessments FOR SELECT USING ((is_active = true));


--
-- Name: bean_pool Everyone can view bean pool; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view bean pool" ON public.bean_pool FOR SELECT USING (true);


--
-- Name: carb_pool Everyone can view carb pool; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view carb pool" ON public.carb_pool FOR SELECT USING (true);


--
-- Name: challenge_leaderboard Everyone can view challenge leaderboard; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view challenge leaderboard" ON public.challenge_leaderboard FOR SELECT USING (true);


--
-- Name: challenge_group_messages Everyone can view challenge messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view challenge messages" ON public.challenge_group_messages FOR SELECT USING (true);


--
-- Name: challenges Everyone can view challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view challenges" ON public.challenges FOR SELECT USING (true);


--
-- Name: chat_configurations Everyone can view chat configurations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view chat configurations" ON public.chat_configurations FOR SELECT USING (true);


--
-- Name: comments Everyone can view comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view comments" ON public.comments FOR SELECT USING (true);


--
-- Name: company_configurations Everyone can view company configurations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view company configurations" ON public.company_configurations FOR SELECT USING (true);


--
-- Name: company_data Everyone can view company data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view company data" ON public.company_data FOR SELECT USING (true);


--
-- Name: base_de_conhecimento_da_empresa Everyone can view company knowledge base; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view company knowledge base" ON public.base_de_conhecimento_da_empresa FOR SELECT USING ((is_active = true));


--
-- Name: courses Everyone can view courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view courses" ON public.courses FOR SELECT USING ((is_published = true));


--
-- Name: cultural_context Everyone can view cultural context; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view cultural context" ON public.cultural_context FOR SELECT USING ((is_active = true));


--
-- Name: custom_saboteurs Everyone can view custom saboteurs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view custom saboteurs" ON public.custom_saboteurs FOR SELECT USING ((is_active = true));


--
-- Name: demographic_nutrition Everyone can view demographic nutrition; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view demographic nutrition" ON public.demographic_nutrition FOR SELECT USING (true);


--
-- Name: diseases_conditions Everyone can view diseases and conditions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view diseases and conditions" ON public.diseases_conditions FOR SELECT USING ((is_active = true));


--
-- Name: economic_information Everyone can view economic info; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view economic info" ON public.economic_information FOR SELECT USING (true);


--
-- Name: informações_economicas Everyone can view economic information; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view economic information" ON public."informações_economicas" FOR SELECT USING (true);


--
-- Name: environmental_impact Everyone can view environmental impact; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view environmental impact" ON public.environmental_impact FOR SELECT USING (true);


--
-- Name: exercise_nutrition Everyone can view exercise nutrition; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view exercise nutrition" ON public.exercise_nutrition FOR SELECT USING ((is_active = true));


--
-- Name: exercise_programs Everyone can view exercise programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view exercise programs" ON public.exercise_programs FOR SELECT USING (true);


--
-- Name: exercises Everyone can view exercises; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view exercises" ON public.exercises FOR SELECT USING (true);


--
-- Name: alimentos_principios_ativos Everyone can view food active principles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view food active principles" ON public.alimentos_principios_ativos FOR SELECT USING (true);


--
-- Name: alimentos_alias Everyone can view food aliases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view food aliases" ON public.alimentos_alias FOR SELECT USING (true);


--
-- Name: food_aliases Everyone can view food aliases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view food aliases" ON public.food_aliases FOR SELECT USING (true);


--
-- Name: food_contraindications Everyone can view food contraindications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view food contraindications" ON public.food_contraindications FOR SELECT USING ((is_active = true));


--
-- Name: food_densities Everyone can view food densities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view food densities" ON public.food_densities FOR SELECT USING (true);


--
-- Name: food_diseases Everyone can view food diseases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view food diseases" ON public.food_diseases FOR SELECT USING ((is_active = true));


--
-- Name: bakery_pool Everyone can view food pools; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view food pools" ON public.bakery_pool FOR SELECT USING (true);


--
-- Name: food_preparation_preservation Everyone can view food preparation; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view food preparation" ON public.food_preparation_preservation FOR SELECT USING ((is_active = true));


--
-- Name: food_security Everyone can view food security; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view food security" ON public.food_security FOR SELECT USING ((is_active = true));


--
-- Name: food_yields Everyone can view food yields; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view food yields" ON public.food_yields FOR SELECT USING (true);


--
-- Name: fruit_pool Everyone can view fruit pool; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view fruit pool" ON public.fruit_pool FOR SELECT USING (true);


--
-- Name: goal_benefits Everyone can view goal benefits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view goal benefits" ON public.goal_benefits FOR SELECT USING ((is_active = true));


--
-- Name: health_feed_groups Everyone can view groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view groups" ON public.health_feed_groups FOR SELECT USING (true);


--
-- Name: combinacoes_ideais Everyone can view ideal combinations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view ideal combinations" ON public.combinacoes_ideais FOR SELECT USING (true);


--
-- Name: institute_nutritional_catalog Everyone can view institute catalog; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view institute catalog" ON public.institute_nutritional_catalog FOR SELECT USING ((is_verified = true));


--
-- Name: company_knowledge_base Everyone can view knowledge base; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view knowledge base" ON public.company_knowledge_base FOR SELECT USING (true);


--
-- Name: layout_config Everyone can view layout config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view layout config" ON public.layout_config FOR SELECT USING (true);


--
-- Name: lessons Everyone can view lessons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view lessons" ON public.lessons FOR SELECT USING (true);


--
-- Name: missions Everyone can view missions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view missions" ON public.missions FOR SELECT USING (true);


--
-- Name: course_modules Everyone can view modules; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view modules" ON public.course_modules FOR SELECT USING (true);


--
-- Name: nutrition_foods Everyone can view nutrition foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view nutrition foods" ON public.nutrition_foods FOR SELECT USING (true);


--
-- Name: nutritional_aliases Everyone can view nutritional aliases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view nutritional aliases" ON public.nutritional_aliases FOR SELECT USING (true);


--
-- Name: nutritional_food_patterns Everyone can view nutritional patterns; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view nutritional patterns" ON public.nutritional_food_patterns FOR SELECT USING ((is_active = true));


--
-- Name: offers Everyone can view offers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view offers" ON public.offers FOR SELECT USING ((is_active = true));


--
-- Name: pregnancy_nutrition Everyone can view pregnancy nutrition; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view pregnancy nutrition" ON public.pregnancy_nutrition FOR SELECT USING (true);


--
-- Name: protein_pool Everyone can view protein pool; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view protein pool" ON public.protein_pool FOR SELECT USING (true);


--
-- Name: protocol_supplements Everyone can view protocol supplements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view protocol supplements" ON public.protocol_supplements FOR SELECT USING (true);


--
-- Name: nutritional_protocols Everyone can view protocols; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view protocols" ON public.nutritional_protocols FOR SELECT USING ((is_active = true));


--
-- Name: course_lessons Everyone can view published lessons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view published lessons" ON public.course_lessons FOR SELECT USING (true);


--
-- Name: lições Everyone can view published lessons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view published lessons" ON public."lições" FOR SELECT USING (true);


--
-- Name: recipe_templates Everyone can view recipe templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view recipe templates" ON public.recipe_templates FOR SELECT USING (true);


--
-- Name: recipes Everyone can view recipes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view recipes" ON public.recipes FOR SELECT USING (true);


--
-- Name: session_templates Everyone can view session templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view session templates" ON public.session_templates FOR SELECT USING ((is_active = true));


--
-- Name: sessions Everyone can view sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view sessions" ON public.sessions FOR SELECT USING (true);


--
-- Name: base_de_conhecimento_sofia Everyone can view sofia knowledge base; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view sofia knowledge base" ON public.base_de_conhecimento_sofia FOR SELECT USING ((is_active = true));


--
-- Name: sofia_knowledge_base Everyone can view sofia knowledge base; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view sofia knowledge base" ON public.sofia_knowledge_base FOR SELECT USING ((is_active = true));


--
-- Name: subscription_plans Everyone can view subscription plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view subscription plans" ON public.subscription_plans FOR SELECT USING ((is_active = true));


--
-- Name: supplement_protocols Everyone can view supplement protocols; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view supplement protocols" ON public.supplement_protocols FOR SELECT USING (true);


--
-- Name: supplements Everyone can view supplements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view supplements" ON public.supplements FOR SELECT USING (true);


--
-- Name: taco_stage Everyone can view taco data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view taco data" ON public.taco_stage FOR SELECT USING (true);


--
-- Name: taco_foods Everyone can view taco foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view taco foods" ON public.taco_foods FOR SELECT USING (true);


--
-- Name: receitas_terapeuticas Everyone can view therapeutic recipes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view therapeutic recipes" ON public.receitas_terapeuticas FOR SELECT USING (true);


--
-- Name: therapeutic_recipes Everyone can view therapeutic recipes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view therapeutic recipes" ON public.therapeutic_recipes FOR SELECT USING ((is_active = true));


--
-- Name: valores_nutricionais_completos Everyone can view valores nutricionais; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view valores nutricionais" ON public.valores_nutricionais_completos FOR SELECT USING (true);


--
-- Name: vegetable_pool Everyone can view vegetable pool; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view vegetable pool" ON public.vegetable_pool FOR SELECT USING (true);


--
-- Name: dr_vital_memory System can manage dr vital memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage dr vital memory" ON public.dr_vital_memory USING (true);


--
-- Name: memória_sofia System can manage sofia memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "System can manage sofia memory" ON public."memória_sofia" USING (true);


--
-- Name: comments Users can create comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create comments" ON public.comments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: profiles Users can create own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create own profile" ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: exercise_tracking Users can delete own exercise tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own exercise tracking" ON public.exercise_tracking FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: google_fit_tokens Users can delete own google fit tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own google fit tokens" ON public.google_fit_tokens FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: meal_plan_history Users can delete own meal plan history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own meal plan history" ON public.meal_plan_history FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_sport_modalities Users can delete own sport modalities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own sport modalities" ON public.user_sport_modalities FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: sport_training_plans Users can delete own sport plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own sport plans" ON public.sport_training_plans FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: water_tracking Users can delete own water tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete own water tracking" ON public.water_tracking FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: user_achievements Users can insert own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own achievements" ON public.user_achievements FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: weekly_analyses Users can insert own analyses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own analyses" ON public.weekly_analyses FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_anamnesis Users can insert own anamnesis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own anamnesis" ON public.user_anamnesis FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: bioimpedance_analysis Users can insert own bioimpedance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own bioimpedance" ON public.bioimpedance_analysis FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_messages Users can insert own chat messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own chat messages" ON public.chat_messages FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_conversations Users can insert own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own conversations" ON public.chat_conversations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: daily_responses Users can insert own daily responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own daily responses" ON public.daily_responses FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: health_diary Users can insert own diary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own diary" ON public.health_diary FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: professional_evaluations Users can insert own evaluations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own evaluations" ON public.professional_evaluations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_exercise_programs Users can insert own exercise programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own exercise programs" ON public.user_exercise_programs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: exercise_tracking Users can insert own exercise tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own exercise tracking" ON public.exercise_tracking FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: food_analysis Users can insert own food analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own food analysis" ON public.food_analysis FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: sofia_food_analysis Users can insert own food analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own food analysis" ON public.sofia_food_analysis FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_gamification Users can insert own gamification; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own gamification" ON public.user_gamification FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: goal_updates Users can insert own goal updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own goal updates" ON public.goal_updates FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_goals Users can insert own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own goals" ON public.user_goals FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: google_fit_data Users can insert own google fit data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own google fit data" ON public.google_fit_data FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: google_fit_tokens Users can insert own google fit tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own google fit tokens" ON public.google_fit_tokens FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: health_conditions Users can insert own health conditions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own health conditions" ON public.health_conditions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: meal_plan_history Users can insert own meal plan history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own meal plan history" ON public.meal_plan_history FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: meal_plans Users can insert own meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own meal plans" ON public.meal_plans FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: medical_documents Users can insert own medical docs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own medical docs" ON public.medical_documents FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: premium_medical_reports Users can insert own medical reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own medical reports" ON public.premium_medical_reports FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: daily_mission_sessions Users can insert own mission sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own mission sessions" ON public.daily_mission_sessions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_missions Users can insert own missions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own missions" ON public.user_missions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: notifications Users can insert own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: challenge_participations Users can insert own participations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own participations" ON public.challenge_participations FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_physical_data Users can insert own physical data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own physical data" ON public.user_physical_data FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: preventive_health_analyses Users can insert own preventive analyses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own preventive analyses" ON public.preventive_health_analyses FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_progress Users can insert own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_purchases Users can insert own purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own purchases" ON public.user_purchases FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_sessions Users can insert own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own sessions" ON public.user_sessions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_sport_modalities Users can insert own sport modalities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own sport modalities" ON public.user_sport_modalities FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: sport_training_plans Users can insert own sport plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own sport plans" ON public.sport_training_plans FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_subscriptions Users can insert own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own subscriptions" ON public.user_subscriptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_challenges Users can insert own user challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own user challenges" ON public.user_challenges FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: water_tracking Users can insert own water tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own water tracking" ON public.water_tracking FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: weight_measurements Users can insert own weight; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own weight" ON public.weight_measurements FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: sport_workout_logs Users can insert own workout logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own workout logs" ON public.sport_workout_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: workout_plans Users can insert own workout plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own workout plans" ON public.workout_plans FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_usage_logs Users can insert their own AI usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own AI usage" ON public.ai_usage_logs FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: chat_emotional_analysis Users can insert their own emotional analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own emotional analysis" ON public.chat_emotional_analysis FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: user_goal_invites Users can manage goal invites; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage goal invites" ON public.user_goal_invites USING (((auth.uid() = inviter_id) OR (auth.uid() = invitee_id)));


--
-- Name: user_goal_participants Users can manage goal participations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage goal participations" ON public.user_goal_participants USING ((auth.uid() = user_id));


--
-- Name: user_food_preferences Users can manage own food preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own food preferences" ON public.user_food_preferences USING ((auth.uid() = user_id));


--
-- Name: weekly_goal_progress Users can manage own weekly progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own weekly progress" ON public.weekly_goal_progress USING ((auth.uid() = user_id));


--
-- Name: registros_diários_de_desafio Users can manage their challenge daily records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their challenge daily records" ON public."registros_diários_de_desafio" USING ((EXISTS ( SELECT 1
   FROM public.challenge_participations
  WHERE ((challenge_participations.id = "registros_diários_de_desafio".participacao_id) AND (challenge_participations.user_id = auth.uid())))));


--
-- Name: comidas_favoritas_do_usuário Users can manage their favorite foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their favorite foods" ON public."comidas_favoritas_do_usuário" USING ((auth.uid() = user_id));


--
-- Name: user_favorite_foods Users can manage their favorite foods; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their favorite foods" ON public.user_favorite_foods USING ((auth.uid() = user_id));


--
-- Name: activity_categories Users can manage their own activity categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own activity categories" ON public.activity_categories USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: activity_sessions Users can manage their own activity sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own activity sessions" ON public.activity_sessions USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: ai_documents Users can manage their own ai documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own ai documents" ON public.ai_documents USING ((auth.uid() = user_id));


--
-- Name: user_assessments Users can manage their own assessments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own assessments" ON public.user_assessments USING ((auth.uid() = user_id));


--
-- Name: challenge_daily_logs Users can manage their own challenge logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own challenge logs" ON public.challenge_daily_logs USING ((EXISTS ( SELECT 1
   FROM public.challenge_participations
  WHERE ((challenge_participations.id = challenge_daily_logs.participation_id) AND (challenge_participations.user_id = auth.uid()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM public.challenge_participations
  WHERE ((challenge_participations.id = challenge_daily_logs.participation_id) AND (challenge_participations.user_id = auth.uid())))));


--
-- Name: sports_challenge_participations Users can manage their own challenge participations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own challenge participations" ON public.sports_challenge_participations USING ((auth.uid() = user_id));


--
-- Name: health_feed_comments Users can manage their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own comments" ON public.health_feed_comments USING ((auth.uid() = user_id));


--
-- Name: conversation_facts Users can manage their own conversation facts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own conversation facts" ON public.conversation_facts USING ((auth.uid() = user_id));


--
-- Name: fatos_da_conversação Users can manage their own conversation facts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own conversation facts" ON public."fatos_da_conversação" USING ((auth.uid() = user_id));


--
-- Name: user_custom_saboteurs Users can manage their own custom saboteurs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own custom saboteurs" ON public.user_custom_saboteurs USING ((auth.uid() = user_id));


--
-- Name: resumo_nutricional_diário Users can manage their own daily nutrition summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own daily nutrition summary" ON public."resumo_nutricional_diário" USING ((auth.uid() = user_id));


--
-- Name: advanced_daily_tracking Users can manage their own daily tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own daily tracking" ON public.advanced_daily_tracking USING ((auth.uid() = user_id));


--
-- Name: exercise_sessions Users can manage their own exercise sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own exercise sessions" ON public.exercise_sessions USING ((auth.uid() = user_id));


--
-- Name: health_feed_follows Users can manage their own follows; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own follows" ON public.health_feed_follows USING ((auth.uid() = follower_id));


--
-- Name: google_fit_data_extended Users can manage their own google fit data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own google fit data" ON public.google_fit_data_extended USING ((auth.uid() = user_id));


--
-- Name: health_feed_group_members Users can manage their own group memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own group memberships" ON public.health_feed_group_members USING ((auth.uid() = user_id));


--
-- Name: health_integrations Users can manage their own health integrations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own health integrations" ON public.health_integrations USING ((auth.uid() = user_id));


--
-- Name: heart_rate_data Users can manage their own heart rate data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own heart rate data" ON public.heart_rate_data USING ((auth.uid() = user_id));


--
-- Name: meal_plans Users can manage their own meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own meal plans" ON public.meal_plans USING ((auth.uid() = user_id));


--
-- Name: meal_suggestions Users can manage their own meal suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own meal suggestions" ON public.meal_suggestions USING ((auth.uid() = user_id));


--
-- Name: documentos_médicos Users can manage their own medical documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own medical documents" ON public."documentos_médicos" USING ((auth.uid() = user_id));


--
-- Name: conversation_messages Users can manage their own messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own messages" ON public.conversation_messages USING ((auth.uid() = user_id));


--
-- Name: mood_monitoring Users can manage their own mood monitoring; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own mood monitoring" ON public.mood_monitoring USING ((auth.uid() = user_id));


--
-- Name: notification_preferences Users can manage their own notification preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own notification preferences" ON public.notification_preferences USING ((auth.uid() = user_id));


--
-- Name: user_notification_settings Users can manage their own notification settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own notification settings" ON public.user_notification_settings USING ((auth.uid() = user_id));


--
-- Name: nutrition_tracking Users can manage their own nutrition tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own nutrition tracking" ON public.nutrition_tracking USING ((auth.uid() = user_id));


--
-- Name: nutritional_goals Users can manage their own nutritional goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own nutritional goals" ON public.nutritional_goals USING ((auth.uid() = user_id));


--
-- Name: dados_físicos_do_usuário Users can manage their own physical data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own physical data" ON public."dados_físicos_do_usuário" USING ((auth.uid() = user_id));


--
-- Name: health_feed_posts Users can manage their own posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own posts" ON public.health_feed_posts USING ((auth.uid() = user_id));


--
-- Name: health_feed_reactions Users can manage their own reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own reactions" ON public.health_feed_reactions USING ((auth.uid() = user_id));


--
-- Name: reações_feed_de_saúde Users can manage their own reactions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own reactions" ON public."reações_feed_de_saúde" USING ((auth.uid() = user_id));


--
-- Name: avaliações_sabotadores Users can manage their own saboteur assessments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own saboteur assessments" ON public."avaliações_sabotadores" USING ((auth.uid() = user_id));


--
-- Name: saboteur_assessments Users can manage their own saboteur assessments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own saboteur assessments" ON public.saboteur_assessments USING ((auth.uid() = user_id));


--
-- Name: respostas_do_sabotador Users can manage their own saboteur responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own saboteur responses" ON public.respostas_do_sabotador USING ((auth.uid() = user_id));


--
-- Name: saboteur_responses Users can manage their own saboteur responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own saboteur responses" ON public.saboteur_responses USING ((auth.uid() = user_id));


--
-- Name: saboteur_results Users can manage their own saboteur results; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own saboteur results" ON public.saboteur_results USING ((auth.uid() = user_id));


--
-- Name: pontuações_do_usuário Users can manage their own scores; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own scores" ON public."pontuações_do_usuário" USING ((auth.uid() = user_id));


--
-- Name: sleep_monitoring Users can manage their own sleep monitoring; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own sleep monitoring" ON public.sleep_monitoring USING ((auth.uid() = user_id));


--
-- Name: sofia_conversation_context Users can manage their own sofia context; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own sofia context" ON public.sofia_conversation_context USING ((auth.uid() = user_id));


--
-- Name: sofia_memory Users can manage their own sofia memory; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own sofia memory" ON public.sofia_memory USING ((auth.uid() = user_id));


--
-- Name: sofia_messages Users can manage their own sofia messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own sofia messages" ON public.sofia_messages USING ((auth.uid() = user_id));


--
-- Name: saude_especifica Users can manage their own specific health; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own specific health" ON public.saude_especifica USING ((auth.uid() = user_id));


--
-- Name: specific_health Users can manage their own specific health; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own specific health" ON public.specific_health USING ((auth.uid() = user_id));


--
-- Name: user_sports_modalities Users can manage their own sports modalities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own sports modalities" ON public.user_sports_modalities USING ((auth.uid() = user_id));


--
-- Name: suplementos_do_usuário Users can manage their own supplements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own supplements" ON public."suplementos_do_usuário" USING ((auth.uid() = user_id));


--
-- Name: user_supplements Users can manage their own supplements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own supplements" ON public.user_supplements USING ((auth.uid() = user_id));


--
-- Name: sports_training_plans Users can manage their own training plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own training plans" ON public.sports_training_plans USING ((auth.uid() = user_id));


--
-- Name: sports_training_records Users can manage their own training records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own training records" ON public.sports_training_records USING ((auth.uid() = user_id));


--
-- Name: water_tracking Users can manage their own water tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own water tracking" ON public.water_tracking USING ((auth.uid() = user_id));


--
-- Name: weekly_analyses Users can manage their own weekly analyses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own weekly analyses" ON public.weekly_analyses USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: weekly_insights Users can manage their own weekly insights; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own weekly insights" ON public.weekly_insights USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- Name: weighings Users can manage their own weighings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own weighings" ON public.weighings USING ((auth.uid() = user_id));


--
-- Name: medidas_de_peso Users can manage their own weight measures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own weight measures" ON public.medidas_de_peso USING ((auth.uid() = user_id));


--
-- Name: weight_measures Users can manage their own weight measures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own weight measures" ON public.weight_measures USING ((auth.uid() = user_id));


--
-- Name: wheel_of_life Users can manage their own wheel of life; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage their own wheel of life" ON public.wheel_of_life USING ((auth.uid() = user_id));


--
-- Name: information_feedback Users can submit feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can submit feedback" ON public.information_feedback USING ((auth.uid() = user_id));


--
-- Name: meal_feedback Users can submit meal feedback; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can submit meal feedback" ON public.meal_feedback USING ((auth.uid() = user_id));


--
-- Name: pending_nutritional_aliases Users can submit pending aliases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can submit pending aliases" ON public.pending_nutritional_aliases FOR INSERT WITH CHECK ((auth.uid() = submitted_by));


--
-- Name: weekly_analyses Users can update own analyses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own analyses" ON public.weekly_analyses FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_anamnesis Users can update own anamnesis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own anamnesis" ON public.user_anamnesis FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: chat_conversations Users can update own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own conversations" ON public.chat_conversations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: daily_responses Users can update own daily responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own daily responses" ON public.daily_responses FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: health_diary Users can update own diary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own diary" ON public.health_diary FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_exercise_programs Users can update own exercise programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own exercise programs" ON public.user_exercise_programs FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: exercise_tracking Users can update own exercise tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own exercise tracking" ON public.exercise_tracking FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_gamification Users can update own gamification; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own gamification" ON public.user_gamification FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_goals Users can update own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own goals" ON public.user_goals FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: google_fit_tokens Users can update own google fit tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own google fit tokens" ON public.google_fit_tokens FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: health_conditions Users can update own health conditions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own health conditions" ON public.health_conditions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: meal_plan_history Users can update own meal plan history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own meal plan history" ON public.meal_plan_history FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: meal_plans Users can update own meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own meal plans" ON public.meal_plans FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: medical_documents Users can update own medical docs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own medical docs" ON public.medical_documents FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: daily_mission_sessions Users can update own mission sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own mission sessions" ON public.daily_mission_sessions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_missions Users can update own missions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own missions" ON public.user_missions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: challenge_participations Users can update own participations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own participations" ON public.challenge_participations FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_physical_data Users can update own physical data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own physical data" ON public.user_physical_data FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_progress Users can update own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_sessions Users can update own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own sessions" ON public.user_sessions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_sport_modalities Users can update own sport modalities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own sport modalities" ON public.user_sport_modalities FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: sport_training_plans Users can update own sport plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own sport plans" ON public.sport_training_plans FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_subscriptions Users can update own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: user_challenges Users can update own user challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own user challenges" ON public.user_challenges FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: weight_measurements Users can update own weight; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own weight" ON public.weight_measurements FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: workout_plans Users can update own workout plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own workout plans" ON public.workout_plans FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: comments Users can update their own comments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own comments" ON public.comments FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: smart_notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own notifications" ON public.smart_notifications FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: conversation_attachments Users can view message attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view message attachments" ON public.conversation_attachments FOR SELECT USING (true);


--
-- Name: user_achievements Users can view own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: weekly_analyses Users can view own analyses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own analyses" ON public.weekly_analyses FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_anamnesis Users can view own anamnesis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own anamnesis" ON public.user_anamnesis FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: bioimpedance_analysis Users can view own bioimpedance; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own bioimpedance" ON public.bioimpedance_analysis FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: chat_messages Users can view own chat messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own chat messages" ON public.chat_messages FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: chat_conversations Users can view own conversations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own conversations" ON public.chat_conversations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: daily_responses Users can view own daily responses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own daily responses" ON public.daily_responses FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: health_diary Users can view own diary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own diary" ON public.health_diary FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: professional_evaluations Users can view own evaluations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own evaluations" ON public.professional_evaluations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_exercise_programs Users can view own exercise programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own exercise programs" ON public.user_exercise_programs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: exercise_tracking Users can view own exercise tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own exercise tracking" ON public.exercise_tracking FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: food_analysis Users can view own food analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own food analysis" ON public.food_analysis FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: sofia_food_analysis Users can view own food analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own food analysis" ON public.sofia_food_analysis FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_gamification Users can view own gamification; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own gamification" ON public.user_gamification FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: goal_updates Users can view own goal updates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own goal updates" ON public.goal_updates FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_goals Users can view own goals; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own goals" ON public.user_goals FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: google_fit_data Users can view own google fit data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own google fit data" ON public.google_fit_data FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: google_fit_tokens Users can view own google fit tokens; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own google fit tokens" ON public.google_fit_tokens FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: health_conditions Users can view own health conditions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own health conditions" ON public.health_conditions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: meal_plan_history Users can view own meal plan history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own meal plan history" ON public.meal_plan_history FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: meal_plans Users can view own meal plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own meal plans" ON public.meal_plans FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: medical_documents Users can view own medical docs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own medical docs" ON public.medical_documents FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: premium_medical_reports Users can view own medical reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own medical reports" ON public.premium_medical_reports FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: daily_mission_sessions Users can view own mission sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own mission sessions" ON public.daily_mission_sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_missions Users can view own missions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own missions" ON public.user_missions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: challenge_participations Users can view own participations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own participations" ON public.challenge_participations FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_physical_data Users can view own physical data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own physical data" ON public.user_physical_data FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: preventive_health_analyses Users can view own preventive analyses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own preventive analyses" ON public.preventive_health_analyses FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_progress Users can view own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_purchases Users can view own purchases; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own purchases" ON public.user_purchases FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view own role; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_sessions Users can view own sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_sport_modalities Users can view own sport modalities; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own sport modalities" ON public.user_sport_modalities FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: sport_training_plans Users can view own sport plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own sport plans" ON public.sport_training_plans FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_subscriptions Users can view own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: user_challenges Users can view own user challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own user challenges" ON public.user_challenges FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: water_tracking Users can view own water tracking; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own water tracking" ON public.water_tracking FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: weight_measurements Users can view own weight; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own weight" ON public.weight_measurements FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: sport_workout_logs Users can view own workout logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own workout logs" ON public.sport_workout_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: workout_plans Users can view own workout plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own workout plans" ON public.workout_plans FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: health_feed_posts Users can view public posts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view public posts" ON public.health_feed_posts FOR SELECT USING ((visibility = 'public'::text));


--
-- Name: membros_do_grupo_feed_de_saúde Users can view their group memberships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their group memberships" ON public."membros_do_grupo_feed_de_saúde" FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: ai_usage_logs Users can view their own AI usage; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own AI usage" ON public.ai_usage_logs FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: achievement_tracking Users can view their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own achievements" ON public.achievement_tracking USING ((auth.uid() = user_id));


--
-- Name: conquistas_do_usuário Users can view their own achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own achievements" ON public."conquistas_do_usuário" USING ((auth.uid() = user_id));


--
-- Name: backups_anamnese_do_usuário Users can view their own anamnesis backups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own anamnesis backups" ON public."backups_anamnese_do_usuário" USING ((auth.uid() = user_id));


--
-- Name: user_anamnesis_history Users can view their own anamnesis history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own anamnesis history" ON public.user_anamnesis_history USING ((auth.uid() = user_id));


--
-- Name: content_access Users can view their own content access; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own content access" ON public.content_access USING ((auth.uid() = user_id));


--
-- Name: daily_nutrition_summary Users can view their own daily nutrition summary; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own daily nutrition summary" ON public.daily_nutrition_summary USING ((auth.uid() = user_id));


--
-- Name: chat_emotional_analysis Users can view their own emotional analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own emotional analysis" ON public.chat_emotional_analysis FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: exercise_progress_analysis Users can view their own exercise analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own exercise analysis" ON public.exercise_progress_analysis USING ((auth.uid() = user_id));


--
-- Name: exercise_ai_recommendations Users can view their own exercise recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own exercise recommendations" ON public.exercise_ai_recommendations USING ((auth.uid() = user_id));


--
-- Name: google_fit_analysis Users can view their own google fit analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own google fit analysis" ON public.google_fit_analysis USING ((auth.uid() = user_id));


--
-- Name: health_alerts Users can view their own health alerts; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own health alerts" ON public.health_alerts USING ((auth.uid() = user_id));


--
-- Name: user_ingredient_history Users can view their own ingredient history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own ingredient history" ON public.user_ingredient_history USING ((auth.uid() = user_id));


--
-- Name: subscription_invoices Users can view their own invoices; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own invoices" ON public.subscription_invoices USING ((auth.uid() = user_id));


--
-- Name: meal_plan_history Users can view their own meal plan history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own meal plan history" ON public.meal_plan_history USING ((auth.uid() = user_id));


--
-- Name: user_medical_reports Users can view their own medical reports; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own medical reports" ON public.user_medical_reports USING ((auth.uid() = user_id));


--
-- Name: notificações_enviadas Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public."notificações_enviadas" USING ((auth.uid() = user_id));


--
-- Name: sent_notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.sent_notifications USING ((auth.uid() = user_id));


--
-- Name: smart_notifications Users can view their own notifications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own notifications" ON public.smart_notifications FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: sugestões_nutracêuticas_do_usuário Users can view their own nutraceutical suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own nutraceutical suggestions" ON public."sugestões_nutracêuticas_do_usuário" USING ((auth.uid() = user_id));


--
-- Name: payment_records Users can view their own payment records; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own payment records" ON public.payment_records USING ((auth.uid() = user_id));


--
-- Name: pontos_do_usuário Users can view their own points; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own points" ON public."pontos_do_usuário" USING ((auth.uid() = user_id));


--
-- Name: user_progress Users can view their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own progress" ON public.user_progress USING ((auth.uid() = user_id));


--
-- Name: nutritional_recommendations Users can view their own recommendations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own recommendations" ON public.nutritional_recommendations USING ((auth.uid() = user_id));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: scheduled_analysis_records Users can view their own scheduled analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own scheduled analysis" ON public.scheduled_analysis_records USING ((auth.uid() = user_id));


--
-- Name: sofia_comprehensive_analyses Users can view their own sofia analyses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sofia analyses" ON public.sofia_comprehensive_analyses USING ((auth.uid() = user_id));


--
-- Name: sofia_food_analysis Users can view their own sofia food analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sofia food analysis" ON public.sofia_food_analysis USING ((auth.uid() = user_id));


--
-- Name: sports_achievements Users can view their own sports achievements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sports achievements" ON public.sports_achievements USING ((auth.uid() = user_id));


--
-- Name: análise_estatísticas Users can view their own statistical analysis; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own statistical analysis" ON public."análise_estatísticas" USING ((auth.uid() = user_id));


--
-- Name: user_subscriptions Users can view their own subscriptions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own subscriptions" ON public.user_subscriptions USING ((auth.uid() = user_id));


--
-- Name: user_nutraceutical_suggestions Users can view their own supplement suggestions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own supplement suggestions" ON public.user_nutraceutical_suggestions USING ((auth.uid() = user_id));


--
-- Name: device_sync_log Users can view their own sync logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own sync logs" ON public.device_sync_log USING ((auth.uid() = user_id));


--
-- Name: achievement_tracking; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.achievement_tracking ENABLE ROW LEVEL SECURITY;

--
-- Name: active_principles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.active_principles ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: activity_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: advanced_daily_tracking; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.advanced_daily_tracking ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_configurations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_fallback_configs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_fallback_configs ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_presets; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_presets ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_system_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_system_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_usage_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: alimentos_alias; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.alimentos_alias ENABLE ROW LEVEL SECURITY;

--
-- Name: alimentos_completos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.alimentos_completos ENABLE ROW LEVEL SECURITY;

--
-- Name: alimentos_principios_ativos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.alimentos_principios_ativos ENABLE ROW LEVEL SECURITY;

--
-- Name: análise_estatísticas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."análise_estatísticas" ENABLE ROW LEVEL SECURITY;

--
-- Name: assessments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

--
-- Name: avaliações_sabotadores; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."avaliações_sabotadores" ENABLE ROW LEVEL SECURITY;

--
-- Name: backups_anamnese_do_usuário; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."backups_anamnese_do_usuário" ENABLE ROW LEVEL SECURITY;

--
-- Name: bakery_pool; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bakery_pool ENABLE ROW LEVEL SECURITY;

--
-- Name: base_de_conhecimento_da_empresa; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.base_de_conhecimento_da_empresa ENABLE ROW LEVEL SECURITY;

--
-- Name: base_de_conhecimento_sofia; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.base_de_conhecimento_sofia ENABLE ROW LEVEL SECURITY;

--
-- Name: bean_pool; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bean_pool ENABLE ROW LEVEL SECURITY;

--
-- Name: bioimpedance_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bioimpedance_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: carb_pool; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.carb_pool ENABLE ROW LEVEL SECURITY;

--
-- Name: challenge_daily_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_daily_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: challenge_group_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_group_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: challenge_leaderboard; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_leaderboard ENABLE ROW LEVEL SECURITY;

--
-- Name: challenge_participations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenge_participations ENABLE ROW LEVEL SECURITY;

--
-- Name: challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_configurations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_configurations ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_emotional_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_emotional_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: combinacoes_ideais; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.combinacoes_ideais ENABLE ROW LEVEL SECURITY;

--
-- Name: comidas_favoritas_do_usuário; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."comidas_favoritas_do_usuário" ENABLE ROW LEVEL SECURITY;

--
-- Name: comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

--
-- Name: company_configurations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_configurations ENABLE ROW LEVEL SECURITY;

--
-- Name: company_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

--
-- Name: company_knowledge_base; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_knowledge_base ENABLE ROW LEVEL SECURITY;

--
-- Name: configurações_ai; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."configurações_ai" ENABLE ROW LEVEL SECURITY;

--
-- Name: conquistas_do_usuário; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."conquistas_do_usuário" ENABLE ROW LEVEL SECURITY;

--
-- Name: content_access; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.content_access ENABLE ROW LEVEL SECURITY;

--
-- Name: conversation_attachments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversation_attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: conversation_facts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversation_facts ENABLE ROW LEVEL SECURITY;

--
-- Name: conversation_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: course_lessons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;

--
-- Name: course_modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: cultural_context; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cultural_context ENABLE ROW LEVEL SECURITY;

--
-- Name: custom_saboteurs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.custom_saboteurs ENABLE ROW LEVEL SECURITY;

--
-- Name: dados_físicos_do_usuário; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."dados_físicos_do_usuário" ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_mission_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_mission_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_nutrition_summary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_nutrition_summary ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: demographic_nutrition; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.demographic_nutrition ENABLE ROW LEVEL SECURITY;

--
-- Name: desafios_esportivos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.desafios_esportivos ENABLE ROW LEVEL SECURITY;

--
-- Name: device_sync_log; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.device_sync_log ENABLE ROW LEVEL SECURITY;

--
-- Name: diseases_conditions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.diseases_conditions ENABLE ROW LEVEL SECURITY;

--
-- Name: documentos_médicos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."documentos_médicos" ENABLE ROW LEVEL SECURITY;

--
-- Name: dr_vital_memory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.dr_vital_memory ENABLE ROW LEVEL SECURITY;

--
-- Name: economic_information; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.economic_information ENABLE ROW LEVEL SECURITY;

--
-- Name: environmental_impact; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.environmental_impact ENABLE ROW LEVEL SECURITY;

--
-- Name: exercise_ai_recommendations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercise_ai_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: exercise_nutrition; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercise_nutrition ENABLE ROW LEVEL SECURITY;

--
-- Name: exercise_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercise_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: exercise_progress_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercise_progress_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: exercise_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercise_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: exercise_tracking; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercise_tracking ENABLE ROW LEVEL SECURITY;

--
-- Name: exercises; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

--
-- Name: fatos_da_conversação; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."fatos_da_conversação" ENABLE ROW LEVEL SECURITY;

--
-- Name: food_active_principles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.food_active_principles ENABLE ROW LEVEL SECURITY;

--
-- Name: food_aliases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.food_aliases ENABLE ROW LEVEL SECURITY;

--
-- Name: food_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.food_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: food_contraindications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.food_contraindications ENABLE ROW LEVEL SECURITY;

--
-- Name: food_densities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.food_densities ENABLE ROW LEVEL SECURITY;

--
-- Name: food_diseases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.food_diseases ENABLE ROW LEVEL SECURITY;

--
-- Name: food_preparation_preservation; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.food_preparation_preservation ENABLE ROW LEVEL SECURITY;

--
-- Name: food_security; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.food_security ENABLE ROW LEVEL SECURITY;

--
-- Name: food_yields; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.food_yields ENABLE ROW LEVEL SECURITY;

--
-- Name: fruit_pool; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.fruit_pool ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_benefits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.goal_benefits ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_updates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;

--
-- Name: google_fit_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.google_fit_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: google_fit_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.google_fit_data ENABLE ROW LEVEL SECURITY;

--
-- Name: google_fit_data_extended; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.google_fit_data_extended ENABLE ROW LEVEL SECURITY;

--
-- Name: google_fit_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.google_fit_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: health_alerts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_alerts ENABLE ROW LEVEL SECURITY;

--
-- Name: health_conditions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;

--
-- Name: health_diary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_diary ENABLE ROW LEVEL SECURITY;

--
-- Name: health_feed_comments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_feed_comments ENABLE ROW LEVEL SECURITY;

--
-- Name: health_feed_follows; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_feed_follows ENABLE ROW LEVEL SECURITY;

--
-- Name: health_feed_group_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_feed_group_members ENABLE ROW LEVEL SECURITY;

--
-- Name: health_feed_groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_feed_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: health_feed_posts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_feed_posts ENABLE ROW LEVEL SECURITY;

--
-- Name: health_feed_reactions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_feed_reactions ENABLE ROW LEVEL SECURITY;

--
-- Name: health_integrations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_integrations ENABLE ROW LEVEL SECURITY;

--
-- Name: heart_rate_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.heart_rate_data ENABLE ROW LEVEL SECURITY;

--
-- Name: image_cache; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.image_cache ENABLE ROW LEVEL SECURITY;

--
-- Name: information_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.information_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: informações_economicas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."informações_economicas" ENABLE ROW LEVEL SECURITY;

--
-- Name: institute_nutritional_catalog; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.institute_nutritional_catalog ENABLE ROW LEVEL SECURITY;

--
-- Name: layout_config; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.layout_config ENABLE ROW LEVEL SECURITY;

--
-- Name: lessons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

--
-- Name: lições; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."lições" ENABLE ROW LEVEL SECURITY;

--
-- Name: meal_feedback; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meal_feedback ENABLE ROW LEVEL SECURITY;

--
-- Name: meal_plan_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meal_plan_history ENABLE ROW LEVEL SECURITY;

--
-- Name: meal_plan_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

--
-- Name: meal_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: meal_suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meal_suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: medical_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: medidas_de_peso; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.medidas_de_peso ENABLE ROW LEVEL SECURITY;

--
-- Name: membros_do_grupo_feed_de_saúde; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."membros_do_grupo_feed_de_saúde" ENABLE ROW LEVEL SECURITY;

--
-- Name: memória_sofia; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."memória_sofia" ENABLE ROW LEVEL SECURITY;

--
-- Name: missions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

--
-- Name: missões_diárias; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."missões_diárias" ENABLE ROW LEVEL SECURITY;

--
-- Name: mock_users; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mock_users ENABLE ROW LEVEL SECURITY;

--
-- Name: mood_monitoring; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.mood_monitoring ENABLE ROW LEVEL SECURITY;

--
-- Name: notification_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: notificações_enviadas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."notificações_enviadas" ENABLE ROW LEVEL SECURITY;

--
-- Name: nutrition_foods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutrition_foods ENABLE ROW LEVEL SECURITY;

--
-- Name: nutrition_tracking; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutrition_tracking ENABLE ROW LEVEL SECURITY;

--
-- Name: nutritional_aliases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutritional_aliases ENABLE ROW LEVEL SECURITY;

--
-- Name: nutritional_food_patterns; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutritional_food_patterns ENABLE ROW LEVEL SECURITY;

--
-- Name: nutritional_goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutritional_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: nutritional_protocols; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutritional_protocols ENABLE ROW LEVEL SECURITY;

--
-- Name: nutritional_recommendations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutritional_recommendations ENABLE ROW LEVEL SECURITY;

--
-- Name: nutritional_yields; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutritional_yields ENABLE ROW LEVEL SECURITY;

--
-- Name: offers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

--
-- Name: payment_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

--
-- Name: pending_nutritional_aliases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pending_nutritional_aliases ENABLE ROW LEVEL SECURITY;

--
-- Name: pontos_do_usuário; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."pontos_do_usuário" ENABLE ROW LEVEL SECURITY;

--
-- Name: pontuações_do_usuário; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."pontuações_do_usuário" ENABLE ROW LEVEL SECURITY;

--
-- Name: pregnancy_nutrition; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.pregnancy_nutrition ENABLE ROW LEVEL SECURITY;

--
-- Name: premium_medical_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.premium_medical_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: premium_report_events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.premium_report_events ENABLE ROW LEVEL SECURITY;

--
-- Name: preventive_health_analyses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.preventive_health_analyses ENABLE ROW LEVEL SECURITY;

--
-- Name: professional_evaluations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.professional_evaluations ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: protein_pool; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.protein_pool ENABLE ROW LEVEL SECURITY;

--
-- Name: protocol_supplements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.protocol_supplements ENABLE ROW LEVEL SECURITY;

--
-- Name: reações_feed_de_saúde; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."reações_feed_de_saúde" ENABLE ROW LEVEL SECURITY;

--
-- Name: receitas_terapeuticas; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.receitas_terapeuticas ENABLE ROW LEVEL SECURITY;

--
-- Name: recipe_components; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recipe_components ENABLE ROW LEVEL SECURITY;

--
-- Name: recipe_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recipe_items ENABLE ROW LEVEL SECURITY;

--
-- Name: recipe_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recipe_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: recipes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

--
-- Name: registros_diários_de_desafio; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."registros_diários_de_desafio" ENABLE ROW LEVEL SECURITY;

--
-- Name: respostas_do_sabotador; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.respostas_do_sabotador ENABLE ROW LEVEL SECURITY;

--
-- Name: resumo_nutricional_diário; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."resumo_nutricional_diário" ENABLE ROW LEVEL SECURITY;

--
-- Name: sabotadores_personalizados; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sabotadores_personalizados ENABLE ROW LEVEL SECURITY;

--
-- Name: saboteur_assessments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saboteur_assessments ENABLE ROW LEVEL SECURITY;

--
-- Name: saboteur_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saboteur_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: saboteur_results; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saboteur_results ENABLE ROW LEVEL SECURITY;

--
-- Name: saude_especifica; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.saude_especifica ENABLE ROW LEVEL SECURITY;

--
-- Name: scheduled_analysis_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scheduled_analysis_records ENABLE ROW LEVEL SECURITY;

--
-- Name: sent_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sent_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: session_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.session_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sleep_monitoring; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sleep_monitoring ENABLE ROW LEVEL SECURITY;

--
-- Name: smart_notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: sofia_comprehensive_analyses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sofia_comprehensive_analyses ENABLE ROW LEVEL SECURITY;

--
-- Name: sofia_conversation_context; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sofia_conversation_context ENABLE ROW LEVEL SECURITY;

--
-- Name: sofia_food_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sofia_food_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: sofia_knowledge_base; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sofia_knowledge_base ENABLE ROW LEVEL SECURITY;

--
-- Name: sofia_learning; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sofia_learning ENABLE ROW LEVEL SECURITY;

--
-- Name: sofia_memory; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sofia_memory ENABLE ROW LEVEL SECURITY;

--
-- Name: sofia_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sofia_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: specific_health; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.specific_health ENABLE ROW LEVEL SECURITY;

--
-- Name: sport_training_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sport_training_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: sport_workout_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sport_workout_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: sports_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sports_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: sports_challenge_participations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sports_challenge_participations ENABLE ROW LEVEL SECURITY;

--
-- Name: sports_challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sports_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: sports_training_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sports_training_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: sports_training_records; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sports_training_records ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_invoices; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscription_invoices ENABLE ROW LEVEL SECURITY;

--
-- Name: subscription_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: sugestões_nutracêuticas_do_usuário; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."sugestões_nutracêuticas_do_usuário" ENABLE ROW LEVEL SECURITY;

--
-- Name: suplementos_do_usuário; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public."suplementos_do_usuário" ENABLE ROW LEVEL SECURITY;

--
-- Name: supplement_protocols; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.supplement_protocols ENABLE ROW LEVEL SECURITY;

--
-- Name: supplements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

--
-- Name: taco_foods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.taco_foods ENABLE ROW LEVEL SECURITY;

--
-- Name: taco_stage; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.taco_stage ENABLE ROW LEVEL SECURITY;

--
-- Name: therapeutic_recipes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.therapeutic_recipes ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_anamnesis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_anamnesis ENABLE ROW LEVEL SECURITY;

--
-- Name: user_anamnesis_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_anamnesis_history ENABLE ROW LEVEL SECURITY;

--
-- Name: user_assessments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;

--
-- Name: user_challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: user_custom_saboteurs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_custom_saboteurs ENABLE ROW LEVEL SECURITY;

--
-- Name: user_exercise_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_exercise_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: user_favorite_foods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_favorite_foods ENABLE ROW LEVEL SECURITY;

--
-- Name: user_food_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_food_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: user_gamification; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

--
-- Name: user_goal_invites; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_goal_invites ENABLE ROW LEVEL SECURITY;

--
-- Name: user_goal_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_goal_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: user_goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: user_ingredient_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_ingredient_history ENABLE ROW LEVEL SECURITY;

--
-- Name: user_medical_reports; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_medical_reports ENABLE ROW LEVEL SECURITY;

--
-- Name: user_missions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_notification_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_notification_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: user_nutraceutical_suggestions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_nutraceutical_suggestions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_physical_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_physical_data ENABLE ROW LEVEL SECURITY;

--
-- Name: user_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: user_purchases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_purchases ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sport_modalities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_sport_modalities ENABLE ROW LEVEL SECURITY;

--
-- Name: user_sports_modalities; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_sports_modalities ENABLE ROW LEVEL SECURITY;

--
-- Name: user_subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_supplements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_supplements ENABLE ROW LEVEL SECURITY;

--
-- Name: users_needing_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.users_needing_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: valores_nutricionais_completos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.valores_nutricionais_completos ENABLE ROW LEVEL SECURITY;

--
-- Name: vegetable_pool; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vegetable_pool ENABLE ROW LEVEL SECURITY;

--
-- Name: water_tracking; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.water_tracking ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_analyses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_analyses ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_goal_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_goal_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: weekly_insights; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weekly_insights ENABLE ROW LEVEL SECURITY;

--
-- Name: weighings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weighings ENABLE ROW LEVEL SECURITY;

--
-- Name: weight_measurements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weight_measurements ENABLE ROW LEVEL SECURITY;

--
-- Name: weight_measures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weight_measures ENABLE ROW LEVEL SECURITY;

--
-- Name: wheel_of_life; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.wheel_of_life ENABLE ROW LEVEL SECURITY;

--
-- Name: workout_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;