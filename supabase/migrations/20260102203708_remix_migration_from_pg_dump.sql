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
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
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
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

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
    updated_at timestamp with time zone DEFAULT now()
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
-- Name: course_modules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_modules (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    order_index integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
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
    CONSTRAINT profiles_activity_level_check CHECK ((activity_level = ANY (ARRAY['sedentary'::text, 'light'::text, 'moderate'::text, 'active'::text, 'very_active'::text, 'sedentario'::text, 'moderado'::text, 'ativo'::text]))),
    CONSTRAINT profiles_gender_check CHECK ((gender = ANY (ARRAY['male'::text, 'female'::text, 'other'::text, 'masculino'::text, 'feminino'::text])))
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
    updated_at timestamp with time zone DEFAULT now()
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
    tags text[]
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
    sleep_quality_score integer
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
    description text
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
    CONSTRAINT user_physical_data_sexo_check CHECK (((sexo)::text = ANY ((ARRAY['masculino'::character varying, 'feminino'::character varying])::text[])))
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
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


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
-- Name: bioimpedance_analysis bioimpedance_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bioimpedance_analysis
    ADD CONSTRAINT bioimpedance_analysis_pkey PRIMARY KEY (id);


--
-- Name: challenges challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.challenges
    ADD CONSTRAINT challenges_pkey PRIMARY KEY (id);


--
-- Name: chat_conversations chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_conversations
    ADD CONSTRAINT chat_conversations_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


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
-- Name: daily_mission_sessions daily_mission_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_mission_sessions
    ADD CONSTRAINT daily_mission_sessions_pkey PRIMARY KEY (id);


--
-- Name: daily_responses daily_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_responses
    ADD CONSTRAINT daily_responses_pkey PRIMARY KEY (id);


--
-- Name: exercise_programs exercise_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_programs
    ADD CONSTRAINT exercise_programs_pkey PRIMARY KEY (id);


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
-- Name: food_analysis food_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_analysis
    ADD CONSTRAINT food_analysis_pkey PRIMARY KEY (id);


--
-- Name: goal_updates goal_updates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.goal_updates
    ADD CONSTRAINT goal_updates_pkey PRIMARY KEY (id);


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
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: meal_plan_history meal_plan_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_history
    ADD CONSTRAINT meal_plan_history_pkey PRIMARY KEY (id);


--
-- Name: meal_plans meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_pkey PRIMARY KEY (id);


--
-- Name: medical_documents medical_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_documents
    ADD CONSTRAINT medical_documents_pkey PRIMARY KEY (id);


--
-- Name: missions missions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.missions
    ADD CONSTRAINT missions_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: nutrition_foods nutrition_foods_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nutrition_foods
    ADD CONSTRAINT nutrition_foods_pkey PRIMARY KEY (id);


--
-- Name: preventive_health_analyses preventive_health_analyses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preventive_health_analyses
    ADD CONSTRAINT preventive_health_analyses_pkey PRIMARY KEY (id);


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
-- Name: protocol_supplements protocol_supplements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.protocol_supplements
    ADD CONSTRAINT protocol_supplements_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sofia_food_analysis sofia_food_analysis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_food_analysis
    ADD CONSTRAINT sofia_food_analysis_pkey PRIMARY KEY (id);


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
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_anamnesis user_anamnesis_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_anamnesis
    ADD CONSTRAINT user_anamnesis_pkey PRIMARY KEY (id);


--
-- Name: user_challenges user_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_challenges
    ADD CONSTRAINT user_challenges_pkey PRIMARY KEY (id);


--
-- Name: user_exercise_programs user_exercise_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_exercise_programs
    ADD CONSTRAINT user_exercise_programs_pkey PRIMARY KEY (id);


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
-- Name: user_goals user_goals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT user_goals_pkey PRIMARY KEY (id);


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
-- Name: weight_measurements weight_measurements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weight_measurements
    ADD CONSTRAINT weight_measurements_pkey PRIMARY KEY (id);


--
-- Name: workout_plans workout_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_plans
    ADD CONSTRAINT workout_plans_pkey PRIMARY KEY (id);


--
-- Name: idx_admin_logs_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_admin_logs_admin ON public.admin_logs USING btree (admin_id);


--
-- Name: idx_ai_configurations_functionality; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_ai_configurations_functionality ON public.ai_configurations USING btree (functionality);


--
-- Name: idx_bioimpedance_analysis_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_bioimpedance_analysis_user ON public.bioimpedance_analysis USING btree (user_id);


--
-- Name: idx_challenges_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_challenges_active ON public.challenges USING btree (is_active);


--
-- Name: idx_chat_conversations_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_conversations_user ON public.chat_conversations USING btree (user_id);


--
-- Name: idx_chat_messages_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_chat_messages_user ON public.chat_messages USING btree (user_id);


--
-- Name: idx_daily_mission_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_mission_sessions_user ON public.daily_mission_sessions USING btree (user_id, session_date);


--
-- Name: idx_daily_responses_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_daily_responses_user_date ON public.daily_responses USING btree (user_id, date);


--
-- Name: idx_exercise_tracking_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exercise_tracking_user ON public.exercise_tracking USING btree (user_id, date);


--
-- Name: idx_exercises_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_exercises_category ON public.exercises USING btree (category);


--
-- Name: idx_food_analysis_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_food_analysis_user ON public.food_analysis USING btree (user_id);


--
-- Name: idx_goal_updates_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_goal_updates_user ON public.goal_updates USING btree (user_id);


--
-- Name: idx_google_fit_data_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_google_fit_data_user ON public.google_fit_data USING btree (user_id);


--
-- Name: idx_google_fit_tokens_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_google_fit_tokens_user ON public.google_fit_tokens USING btree (user_id);


--
-- Name: idx_health_conditions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_health_conditions_user ON public.health_conditions USING btree (user_id);


--
-- Name: idx_health_diary_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_health_diary_user_date ON public.health_diary USING btree (user_id, date DESC);


--
-- Name: idx_meal_plan_history_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plan_history_user ON public.meal_plan_history USING btree (user_id);


--
-- Name: idx_meal_plans_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_meal_plans_user ON public.meal_plans USING btree (user_id);


--
-- Name: idx_medical_documents_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_medical_documents_user ON public.medical_documents USING btree (user_id);


--
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_nutrition_foods_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nutrition_foods_name ON public.nutrition_foods USING btree (name);


--
-- Name: idx_preventive_health_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_preventive_health_user ON public.preventive_health_analyses USING btree (user_id);


--
-- Name: idx_profiles_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_profiles_user_id ON public.profiles USING btree (user_id);


--
-- Name: idx_protocol_supplements_protocol; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_protocol_supplements_protocol ON public.protocol_supplements USING btree (protocol_id);


--
-- Name: idx_sessions_is_active; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_is_active ON public.sessions USING btree (is_active);


--
-- Name: idx_sofia_food_analysis_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sofia_food_analysis_user ON public.sofia_food_analysis USING btree (user_id);


--
-- Name: idx_sport_training_plans_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sport_training_plans_user ON public.sport_training_plans USING btree (user_id);


--
-- Name: idx_sport_workout_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sport_workout_logs_user ON public.sport_workout_logs USING btree (user_id);


--
-- Name: idx_supplements_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_supplements_category ON public.supplements USING btree (category);


--
-- Name: idx_user_achievements_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_achievements_user ON public.user_achievements USING btree (user_id);


--
-- Name: idx_user_anamnesis_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_anamnesis_user ON public.user_anamnesis USING btree (user_id);


--
-- Name: idx_user_challenges_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_challenges_user ON public.user_challenges USING btree (user_id);


--
-- Name: idx_user_exercise_programs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_exercise_programs_user ON public.user_exercise_programs USING btree (user_id);


--
-- Name: idx_user_food_preferences_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_food_preferences_user ON public.user_food_preferences USING btree (user_id);


--
-- Name: idx_user_gamification_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_gamification_user ON public.user_gamification USING btree (user_id);


--
-- Name: idx_user_goals_user_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_goals_user_status ON public.user_goals USING btree (user_id, status);


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
-- Name: idx_user_roles_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_roles_user ON public.user_roles USING btree (user_id);


--
-- Name: idx_user_sessions_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_sessions_user ON public.user_sessions USING btree (user_id);


--
-- Name: idx_water_tracking_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_water_tracking_user ON public.water_tracking USING btree (user_id, date);


--
-- Name: idx_weekly_analyses_user_week; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_analyses_user_week ON public.weekly_analyses USING btree (user_id, semana_inicio DESC);


--
-- Name: idx_weekly_goal_progress_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weekly_goal_progress_user ON public.weekly_goal_progress USING btree (user_id);


--
-- Name: idx_weight_measurements_user_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_weight_measurements_user_date ON public.weight_measurements USING btree (user_id, measurement_date DESC);


--
-- Name: idx_workout_plans_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_workout_plans_user ON public.workout_plans USING btree (user_id);


--
-- Name: ai_configurations update_ai_configurations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_ai_configurations_updated_at BEFORE UPDATE ON public.ai_configurations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: challenges update_challenges_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: chat_conversations update_chat_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


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
-- Name: workout_plans update_workout_plans_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON public.workout_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES auth.users(id);


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
-- Name: course_modules course_modules_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_modules
    ADD CONSTRAINT course_modules_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: daily_mission_sessions daily_mission_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_mission_sessions
    ADD CONSTRAINT daily_mission_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: daily_responses daily_responses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.daily_responses
    ADD CONSTRAINT daily_responses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: exercise_tracking exercise_tracking_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.exercise_tracking
    ADD CONSTRAINT exercise_tracking_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: food_analysis food_analysis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.food_analysis
    ADD CONSTRAINT food_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: lessons lessons_module_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.course_modules(id) ON DELETE CASCADE;


--
-- Name: meal_plan_history meal_plan_history_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plan_history
    ADD CONSTRAINT meal_plan_history_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: meal_plans meal_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: medical_documents medical_documents_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.medical_documents
    ADD CONSTRAINT medical_documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: sessions sessions_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: sofia_food_analysis sofia_food_analysis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sofia_food_analysis
    ADD CONSTRAINT sofia_food_analysis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: user_anamnesis user_anamnesis_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_anamnesis
    ADD CONSTRAINT user_anamnesis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: user_goals user_goals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_goals
    ADD CONSTRAINT user_goals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


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
-- Name: weight_measurements weight_measurements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.weight_measurements
    ADD CONSTRAINT weight_measurements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: workout_plans workout_plans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workout_plans
    ADD CONSTRAINT workout_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: admin_logs Admins can insert admin logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert admin logs" ON public.admin_logs FOR INSERT WITH CHECK (true);


--
-- Name: admin_logs Admins can view admin logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view admin logs" ON public.admin_logs FOR SELECT USING (true);


--
-- Name: ai_configurations Everyone can view ai config; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view ai config" ON public.ai_configurations FOR SELECT USING (true);


--
-- Name: challenges Everyone can view challenges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view challenges" ON public.challenges FOR SELECT USING (true);


--
-- Name: company_data Everyone can view company data; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view company data" ON public.company_data FOR SELECT USING (true);


--
-- Name: courses Everyone can view courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view courses" ON public.courses FOR SELECT USING ((is_published = true));


--
-- Name: exercise_programs Everyone can view exercise programs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view exercise programs" ON public.exercise_programs FOR SELECT USING (true);


--
-- Name: exercises Everyone can view exercises; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view exercises" ON public.exercises FOR SELECT USING (true);


--
-- Name: company_knowledge_base Everyone can view knowledge base; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view knowledge base" ON public.company_knowledge_base FOR SELECT USING (true);


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
-- Name: protocol_supplements Everyone can view protocol supplements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view protocol supplements" ON public.protocol_supplements FOR SELECT USING (true);


--
-- Name: sessions Everyone can view sessions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view sessions" ON public.sessions FOR SELECT USING (true);


--
-- Name: supplement_protocols Everyone can view supplement protocols; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view supplement protocols" ON public.supplement_protocols FOR SELECT USING (true);


--
-- Name: supplements Everyone can view supplements; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Everyone can view supplements" ON public.supplements FOR SELECT USING (true);


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
-- Name: sport_training_plans Users can insert own sport plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own sport plans" ON public.sport_training_plans FOR INSERT WITH CHECK ((auth.uid() = user_id));


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
-- Name: user_food_preferences Users can manage own food preferences; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own food preferences" ON public.user_food_preferences USING ((auth.uid() = user_id));


--
-- Name: weekly_goal_progress Users can manage own weekly progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage own weekly progress" ON public.weekly_goal_progress USING ((auth.uid() = user_id));


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
-- Name: sport_training_plans Users can update own sport plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update own sport plans" ON public.sport_training_plans FOR UPDATE USING ((auth.uid() = user_id));


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
-- Name: sport_training_plans Users can view own sport plans; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own sport plans" ON public.sport_training_plans FOR SELECT USING ((auth.uid() = user_id));


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
-- Name: admin_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: ai_configurations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_configurations ENABLE ROW LEVEL SECURITY;

--
-- Name: bioimpedance_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bioimpedance_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: company_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_data ENABLE ROW LEVEL SECURITY;

--
-- Name: company_knowledge_base; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.company_knowledge_base ENABLE ROW LEVEL SECURITY;

--
-- Name: course_modules; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_mission_sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_mission_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: daily_responses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.daily_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: exercise_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercise_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: exercise_tracking; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercise_tracking ENABLE ROW LEVEL SECURITY;

--
-- Name: exercises; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

--
-- Name: food_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.food_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: goal_updates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;

--
-- Name: google_fit_data; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.google_fit_data ENABLE ROW LEVEL SECURITY;

--
-- Name: google_fit_tokens; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.google_fit_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: health_conditions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_conditions ENABLE ROW LEVEL SECURITY;

--
-- Name: health_diary; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.health_diary ENABLE ROW LEVEL SECURITY;

--
-- Name: lessons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

--
-- Name: meal_plan_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meal_plan_history ENABLE ROW LEVEL SECURITY;

--
-- Name: meal_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: medical_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: missions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: nutrition_foods; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nutrition_foods ENABLE ROW LEVEL SECURITY;

--
-- Name: preventive_health_analyses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.preventive_health_analyses ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: protocol_supplements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.protocol_supplements ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sofia_food_analysis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sofia_food_analysis ENABLE ROW LEVEL SECURITY;

--
-- Name: sport_training_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sport_training_plans ENABLE ROW LEVEL SECURITY;

--
-- Name: sport_workout_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sport_workout_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: supplement_protocols; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.supplement_protocols ENABLE ROW LEVEL SECURITY;

--
-- Name: supplements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- Name: user_anamnesis; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_anamnesis ENABLE ROW LEVEL SECURITY;

--
-- Name: user_challenges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: user_exercise_programs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_exercise_programs ENABLE ROW LEVEL SECURITY;

--
-- Name: user_food_preferences; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_food_preferences ENABLE ROW LEVEL SECURITY;

--
-- Name: user_gamification; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

--
-- Name: user_goals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

--
-- Name: user_missions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;

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
-- Name: weight_measurements; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.weight_measurements ENABLE ROW LEVEL SECURITY;

--
-- Name: workout_plans; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;