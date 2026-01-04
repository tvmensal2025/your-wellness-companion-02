/**
 * SISTEMA UNIFICADO DE CONTEXTO DO USUÁRIO
 * 
 * Este módulo agrega TODOS os dados do usuário de TODAS as tabelas
 * para que Sofia e Dr. Vital tenham acesso completo ao histórico.
 * 
 * IMPORTANTE: Estes dados NUNCA devem ser apagados!
 * São essenciais para análises precisas e personalizadas.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

export interface UserCompleteContext {
  // 1. IDENTIFICAÇÃO E PERFIL
  profile: {
    userId: string;
    firstName: string;
    fullName: string;
    email: string;
    phone?: string;
    age?: number;
    birthDate?: string;
    gender?: string;
    city?: string;
    state?: string;
    avatarUrl?: string;
    createdAt?: string;
  };

  // 2. DADOS FÍSICOS E MEDIDAS
  physicalData: {
    height_cm?: number;
    current_weight_kg?: number;
    target_weight_kg?: number;
    activity_level?: string;
    blood_type?: string;
    objetivo?: string;
  };

  // 3. HISTÓRICO COMPLETO DE PESO (nunca apagar!)
  weightHistory: Array<{
    id: string;
    measurement_date: string;
    peso_kg: number;
    imc?: number;
    gordura_corporal_percent?: number;
    gordura_visceral?: number;
    massa_muscular_kg?: number;
    agua_corporal_percent?: number;
    massa_ossea_kg?: number;
    metabolismo_basal_kcal?: number;
    idade_metabolica?: number;
    risco_metabolico?: string;
    risco_cardiometabolico?: string;
    circunferencia_abdominal_cm?: number;
    circunferencia_braco_cm?: number;
    circunferencia_perna_cm?: number;
    device_type?: string;
    notes?: string;
  }>;

  // 4. ANAMNESE MÉDICA COMPLETA
  anamnesis: {
    // Dados pessoais
    profession?: string;
    marital_status?: string;
    how_found_method?: string;
    
    // Histórico familiar
    family_obesity_history?: boolean;
    family_diabetes_history?: boolean;
    family_heart_disease_history?: boolean;
    family_eating_disorders_history?: boolean;
    family_depression_anxiety_history?: boolean;
    family_thyroid_problems_history?: boolean;
    family_other_chronic_diseases?: string;
    
    // Histórico de peso
    weight_gain_started_age?: number;
    lowest_adult_weight?: number;
    highest_adult_weight?: number;
    major_weight_gain_periods?: string;
    emotional_events_during_weight_gain?: string;
    
    // Tratamentos anteriores
    previous_weight_treatments?: any[];
    had_rebound_effect?: boolean;
    most_effective_treatment?: string;
    least_effective_treatment?: string;
    
    // Medicações e condições atuais
    current_medications?: any[];
    chronic_diseases?: any[];
    allergies?: any[];
    food_intolerances?: any[];
    supplements?: any[];
    herbal_medicines?: any[];
    
    // Relacionamento com comida
    food_relationship_score?: number;
    has_compulsive_eating?: boolean;
    compulsive_eating_situations?: string;
    problematic_foods?: any[];
    forbidden_foods?: any[];
    feels_guilt_after_eating?: boolean;
    eats_in_secret?: boolean;
    eats_until_uncomfortable?: boolean;
    
    // Qualidade de vida
    sleep_hours_per_night?: number;
    sleep_quality_score?: number;
    daily_stress_level?: number;
    daily_energy_level?: number;
    general_quality_of_life?: number;
    
    // Hábitos
    physical_activity_type?: string;
    physical_activity_frequency?: string;
    water_intake_liters?: number;
    
    // Objetivos
    ideal_weight_goal?: number;
    main_treatment_goals?: string;
    biggest_weight_loss_challenge?: string;
    motivation_for_seeking_treatment?: string;
    timeframe_to_achieve_goal?: string;
    treatment_success_definition?: string;
    
    // Medidas corporais da anamnese
    bmi?: number;
    waist_circumference_cm?: number;
    hip_circumference_cm?: number;
    body_fat_percentage?: number;
  } | null;

  // 5. METAS DO USUÁRIO (todas, não só ativas)
  goals: Array<{
    id: string;
    title: string;
    description?: string;
    goal_type?: string;
    category?: string;
    target_value?: number;
    current_value?: number;
    unit?: string;
    difficulty?: string;
    peso_meta_kg?: number;
    gordura_corporal_meta_percent?: number;
    imc_meta?: number;
    target_date?: string;
    status: string;
    created_at: string;
    updated_at?: string;
  }>;

  // 6. PROGRESSO DAS METAS
  goalProgress: Array<{
    id: string;
    goal_id: string;
    value?: number;
    new_value?: number;
    notes?: string;
    created_at: string;
  }>;

  // 7. HISTÓRICO NUTRICIONAL COMPLETO
  nutritionHistory: Array<{
    id: string;
    date: string;
    meal_type: string;
    food_items?: any[];
    total_calories?: number;
    total_proteins?: number;
    total_carbs?: number;
    total_fats?: number;
    total_fiber?: number;
    total_sodium?: number;
    water_ml?: number;
    notes?: string;
    photo_url?: string;
  }>;

  // 8. ANÁLISES DE ALIMENTOS POR FOTO (Sofia)
  foodAnalysis: Array<{
    id: string;
    created_at: string;
    meal_type?: string;
    food_items?: any[];
    nutrition_analysis?: any;
    total_calories?: number;
    total_proteins?: number;
    total_carbs?: number;
    total_fats?: number;
    health_rating?: number;
    recommendations?: string;
    image_url?: string;
    sofia_analysis?: string;
  }>;

  // 9. RESPOSTAS DIÁRIAS (missões do dia)
  dailyResponses: Array<{
    id: string;
    date: string;
    section: string;
    question_id: string;
    answer: string;
    text_response?: string;
    points_earned?: number;
    score?: number;
  }>;

  // 10. SESSÕES DE MISSÕES DIÁRIAS
  dailyMissions: Array<{
    id: string;
    date: string;
    missions_completed?: number;
    total_points?: number;
    streak_days?: number;
    is_completed?: boolean;
    completed_sections?: any;
  }>;

  // 11. TRACKING DIÁRIO AVANÇADO
  dailyAdvancedTracking: Array<{
    id: string;
    tracking_date: string;
    weight_kg?: number;
    body_fat_percentage?: number;
    muscle_mass_kg?: number;
    waist_cm?: number;
    systolic_bp?: number;
    diastolic_bp?: number;
    resting_heart_rate?: number;
    calories_consumed?: number;
    calories_burned?: number;
    protein_g?: number;
    carbs_g?: number;
    fats_g?: number;
    water_ml?: number;
    exercise_type?: string;
    exercise_duration_minutes?: number;
    active_minutes?: number;
    steps?: number;
    sleep_hours?: number;
    sleep_quality?: number;
    bedtime?: string;
    wake_time?: string;
    energy_level?: number;
    mood_rating?: number;
    stress_level?: number;
    anxiety_level?: number;
    focus_level?: number;
    pain_level?: number;
    pain_location?: string;
    medications_taken?: string[];
    supplements_taken?: string[];
    symptoms?: string[];
    notes?: string;
    photo_url?: string;
  }>;

  // 12. EXERCÍCIOS E ATIVIDADE FÍSICA
  exerciseHistory: Array<{
    id: string;
    date?: string;
    session_type?: string;
    exercises?: any[];
    duration_minutes?: number;
    calories_burned?: number;
    heart_rate_avg?: number;
    heart_rate_max?: number;
    intensity_level?: number;
    mood_before?: number;
    mood_after?: number;
    performance_rating?: number;
    notes?: string;
  }>;

  // 13. DADOS DO GOOGLE FIT
  googleFitData: Array<{
    id: string;
    data_type: string;
    recorded_at: string;
    value?: number;
    unit?: string;
    raw_data?: any;
  }>;

  // 14. MONITORAMENTO DE HUMOR
  moodTracking: Array<{
    id: string;
    date?: string;
    time?: string;
    mood_rating?: number;
    mood_tags?: string[];
    triggers?: string[];
    context?: string;
    notes?: string;
  }>;

  // 15. HIDRATAÇÃO
  waterTracking: Array<{
    id: string;
    date: string;
    total_ml?: number;
    goal_ml?: number;
    times_recorded?: number;
  }>;

  // 16. SONO
  sleepTracking: Array<{
    id: string;
    date: string;
    hours_slept?: number;
    sleep_quality?: number;
    bedtime?: string;
    wake_time?: string;
  }>;

  // 17. DIÁRIO DE SAÚDE
  healthDiary: Array<{
    id: string;
    date: string;
    mood_rating?: number;
    energy_level?: number;
    sleep_hours?: number;
    water_intake?: number;
    exercise_minutes?: number;
    notes?: string;
  }>;

  // 18. DOCUMENTOS MÉDICOS
  medicalDocuments: Array<{
    id: string;
    title?: string;
    type?: string;
    file_name?: string;
    file_url?: string;
    file_type?: string;
    file_size?: number;
    doctor_name?: string;
    analysis_status?: string;
    analysis_result?: any;
    results?: any;
    created_at: string;
  }>;

  // 19. RELATÓRIOS MÉDICOS
  medicalReports: Array<{
    id: string;
    report_type?: string;
    report_data?: any;
    analysis_summary?: string;
    created_at: string;
  }>;

  // 20. PRESCRIÇÕES E MEDICAMENTOS
  prescriptions: Array<{
    id: string;
    medication_name?: string;
    dosage?: string;
    frequency?: string;
    prescribed_by?: string;
    start_date?: string;
    end_date?: string;
  }>;

  // 21. SUPLEMENTOS
  supplements: Array<{
    id: string;
    supplement_name?: string;
    dosage?: string;
    frequency?: string;
    purpose?: string;
    start_date?: string;
  }>;

  // 22. PARTICIPAÇÃO EM DESAFIOS
  challengeParticipations: Array<{
    id: string;
    challenge_id: string;
    progress?: number;
    is_completed?: boolean;
    current_streak?: number;
    best_streak?: number;
    points_earned?: number;
    target_value?: number;
    started_at?: string;
    completed_at?: string;
  }>;

  // 23. LOGS DIÁRIOS DE DESAFIOS
  challengeDailyLogs: Array<{
    id: string;
    participation_id: string;
    challenge_name?: string;
    log_date: string;
    is_completed?: boolean;
    value_logged?: string;
    numeric_value?: number;
    points_earned?: number;
    notes?: string;
  }>;

  // 24. CONQUISTAS
  achievements: Array<{
    id: string;
    achievement_name?: string;
    achievement_type?: string;
    description?: string;
    badge_icon?: string;
    current_value?: number;
    target_value?: number;
    progress_percentage?: number;
    unlocked_at?: string;
  }>;

  // 25. PONTOS DO USUÁRIO
  userPoints: {
    total_points?: number;
    daily_points?: number;
    weekly_points?: number;
    monthly_points?: number;
    current_streak?: number;
    best_streak?: number;
    level?: number;
    completed_challenges?: number;
  } | null;

  // 26. CONVERSAS COM A IA
  conversations: Array<{
    id: string;
    conversation_id?: string;
    message_role: string;
    message_content: string;
    timestamp: string;
    analysis_type?: string;
    context?: any;
  }>;

  // 27. MENSAGENS DE CHAT
  chatMessages: Array<{
    id: string;
    role: string;
    content: string;
    personality?: string;
    tokens_used?: number;
    created_at: string;
  }>;

  // 28. MEMÓRIA DO DR. VITAL
  drVitalMemory: Array<{
    id: string;
    memory_key: string;
    memory_value: any;
    created_at: string;
    updated_at?: string;
  }>;

  // 29. DADOS DE FREQUÊNCIA CARDÍACA
  heartRateData: Array<{
    id: string;
    recorded_at: string;
    heart_rate_bpm?: number;
    activity_type?: string;
    zones?: any;
  }>;

  // 30. ANÁLISES SEMANAIS
  weeklyAnalyses: Array<{
    id: string;
    week_start_date?: string;
    summary?: any;
    recommendations?: string[];
    progress_score?: number;
    created_at: string;
  }>;

  // 31. PROGRESSO EM CURSOS
  courseProgress: Array<{
    id: string;
    course_id?: string;
    progress_percentage?: number;
    completed_lessons?: number;
    total_lessons?: number;
    time_spent_minutes?: number;
  }>;

  // 32. BASE DE CONHECIMENTO DA EMPRESA
  companyKnowledge: Array<{
    category: string;
    title: string;
    content: string;
    priority?: number;
  }>;

  // METADADOS
  metadata: {
    dataCompleteness: {
      percentage: number;
      missingData: string[];
      canReceiveFullAnalysis: boolean;
    };
    lastUpdated: string;
    totalDataPoints: number;
  };
}

/**
 * Busca TODOS os dados do usuário de TODAS as tabelas relevantes.
 * Esta função é o ponto central de acesso aos dados do usuário.
 */
export async function getUserCompleteContext(
  supabaseUrl: string,
  supabaseKey: string,
  userId: string
): Promise<UserCompleteContext> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('🔄 Carregando contexto COMPLETO do usuário:', userId);
  
  // Data ranges
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

  // Parallel fetch all data
  const [
    profileResult,
    physicalDataResult,
    weightHistoryResult,
    anamnesisResult,
    goalsResult,
    goalProgressResult,
    nutritionResult,
    foodAnalysisResult,
    dailyResponsesResult,
    dailyMissionsResult,
    dailyAdvancedResult,
    exerciseResult,
    googleFitResult,
    moodResult,
    waterResult,
    sleepResult,
    healthDiaryResult,
    medicalDocsResult,
    medicalReportsResult,
    prescriptionsResult,
    supplementsResult,
    challengeParticipationsResult,
    challengeLogsResult,
    achievementsResult,
    userPointsResult,
    conversationsResult,
    chatMessagesResult,
    drVitalMemoryResult,
    heartRateResult,
    weeklyAnalysesResult,
    courseProgressResult,
    companyKnowledgeResult,
  ] = await Promise.all([
    // 1. Perfil
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    
    // 2. Dados físicos - tentar múltiplas tabelas
    supabase.from('user_physical_profiles').select('*').eq('user_id', userId).single(),
    
    // 3. Histórico de peso (TODO o histórico - nunca deletar!)
    supabase.from('weight_measurements').select('*').eq('user_id', userId).order('measurement_date', { ascending: false }).limit(200),
    
    // 4. Anamnese
    supabase.from('user_anamnesis').select('*').eq('user_id', userId).single(),
    
    // 5. Metas (todas)
    supabase.from('user_goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    
    // 6. Progresso de metas
    supabase.from('goal_updates').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
    
    // 7. Nutrição (90 dias)
    supabase.from('nutrition_tracking').select('*').eq('user_id', userId).gte('date', ninetyDaysAgo.toISOString().split('T')[0]).order('date', { ascending: false }),
    
    // 8. Análises de comida (todas)
    supabase.from('food_analysis').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
    
    // 9. Respostas diárias (90 dias)
    supabase.from('daily_responses').select('*').eq('user_id', userId).gte('date', ninetyDaysAgo.toISOString().split('T')[0]).order('date', { ascending: false }),
    
    // 10. Missões diárias (90 dias)
    supabase.from('daily_mission_sessions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(90),
    
    // 11. Tracking avançado (90 dias)
    supabase.from('advanced_daily_tracking').select('*').eq('user_id', userId).order('tracking_date', { ascending: false }).limit(90),
    
    // 12. Exercícios (90 dias)
    supabase.from('exercise_sessions').select('*').eq('user_id', userId).order('session_date', { ascending: false }).limit(100),
    
    // 13. Google Fit (30 dias)
    supabase.from('google_fit_data').select('*').eq('user_id', userId).order('recorded_at', { ascending: false }).limit(200),
    
    // 14. Humor (90 dias)
    supabase.from('mood_monitoring').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(90),
    
    // 15. Água (90 dias)
    supabase.from('water_tracking').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(90),
    
    // 16. Sono (90 dias)
    supabase.from('sleep_tracking').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(90),
    
    // 17. Diário de saúde
    supabase.from('health_diary').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(90),
    
    // 18. Documentos médicos (todos)
    supabase.from('medical_documents').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    
    // 19. Relatórios médicos
    supabase.from('medical_reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    
    // 20. Prescrições
    supabase.from('prescriptions').select('*').eq('user_id', userId),
    
    // 21. Suplementos
    supabase.from('user_supplements').select('*').eq('user_id', userId),
    
    // 22. Participações em desafios
    supabase.from('challenge_participations').select('*').eq('user_id', userId),
    
    // 23. Logs de desafios
    supabase.from('challenge_daily_logs').select('*').order('log_date', { ascending: false }).limit(200),
    
    // 24. Conquistas
    supabase.from('achievement_tracking').select('*').eq('user_id', userId),
    
    // 25. Pontos
    supabase.from('user_points').select('*').eq('user_id', userId).single(),
    
    // 26. Conversas (últimas 50)
    supabase.from('user_conversations').select('*').eq('user_id', userId).order('timestamp', { ascending: false }).limit(50),
    
    // 27. Mensagens de chat (últimas 100)
    supabase.from('chat_messages').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(100),
    
    // 28. Memória do Dr. Vital
    supabase.from('dr_vital_memory').select('*').eq('user_id', userId).order('updated_at', { ascending: false }).limit(50),
    
    // 29. Frequência cardíaca
    supabase.from('heart_rate_data').select('*').eq('user_id', userId).order('recorded_at', { ascending: false }).limit(100),
    
    // 30. Análises semanais
    supabase.from('weekly_analyses').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    
    // 31. Progresso em cursos
    supabase.from('course_progress').select('*').eq('user_id', userId),
    
    // 32. Base de conhecimento
    supabase.from('company_knowledge_base').select('category, title, content, priority').eq('is_active', true).order('priority', { ascending: false }),
  ]);

  // Extract profile info
  const profileData = profileResult.data;
  const firstName = profileData?.full_name?.split(' ')[0] || 'usuário';

  // Calculate data completeness
  const dataChecks = [
    { key: 'profile', weight: 5, has: !!profileData },
    { key: 'physicalData', weight: 10, has: !!physicalDataResult.data },
    { key: 'anamnesis', weight: 20, has: !!anamnesisResult.data },
    { key: 'weightHistory', weight: 15, has: (weightHistoryResult.data?.length || 0) > 0 },
    { key: 'goals', weight: 10, has: (goalsResult.data?.length || 0) > 0 },
    { key: 'nutritionHistory', weight: 15, has: (nutritionResult.data?.length || 0) > 0 },
    { key: 'dailyResponses', weight: 10, has: (dailyResponsesResult.data?.length || 0) > 0 },
    { key: 'exerciseHistory', weight: 10, has: (exerciseResult.data?.length || 0) > 0 },
    { key: 'medicalDocuments', weight: 5, has: (medicalDocsResult.data?.length || 0) > 0 },
  ];

  const completedWeight = dataChecks.filter(c => c.has).reduce((sum, c) => sum + c.weight, 0);
  const totalWeight = dataChecks.reduce((sum, c) => sum + c.weight, 0);
  const completenessPercentage = Math.round((completedWeight / totalWeight) * 100);
  const missingData = dataChecks.filter(c => !c.has).map(c => c.key);

  // Count total data points
  const totalDataPoints = 
    (weightHistoryResult.data?.length || 0) +
    (nutritionResult.data?.length || 0) +
    (foodAnalysisResult.data?.length || 0) +
    (dailyResponsesResult.data?.length || 0) +
    (exerciseResult.data?.length || 0) +
    (moodResult.data?.length || 0) +
    (conversationsResult.data?.length || 0) +
    (chatMessagesResult.data?.length || 0);

  console.log('✅ Contexto carregado:', {
    profile: !!profileData,
    anamnesis: !!anamnesisResult.data,
    weightHistory: weightHistoryResult.data?.length || 0,
    nutrition: nutritionResult.data?.length || 0,
    foodAnalysis: foodAnalysisResult.data?.length || 0,
    dailyResponses: dailyResponsesResult.data?.length || 0,
    completeness: `${completenessPercentage}%`,
    totalDataPoints
  });

  return {
    profile: {
      userId,
      firstName,
      fullName: profileData?.full_name || firstName,
      email: profileData?.email || '',
      phone: profileData?.phone,
      age: profileData?.age,
      birthDate: profileData?.birth_date,
      gender: profileData?.gender,
      city: profileData?.city,
      state: profileData?.state,
      avatarUrl: profileData?.avatar_url,
      createdAt: profileData?.created_at,
    },
    physicalData: physicalDataResult.data || {},
    weightHistory: weightHistoryResult.data || [],
    anamnesis: anamnesisResult.data || null,
    goals: goalsResult.data || [],
    goalProgress: goalProgressResult.data || [],
    nutritionHistory: nutritionResult.data || [],
    foodAnalysis: foodAnalysisResult.data || [],
    dailyResponses: dailyResponsesResult.data || [],
    dailyMissions: dailyMissionsResult.data || [],
    dailyAdvancedTracking: dailyAdvancedResult.data || [],
    exerciseHistory: exerciseResult.data || [],
    googleFitData: googleFitResult.data || [],
    moodTracking: moodResult.data || [],
    waterTracking: waterResult.data || [],
    sleepTracking: sleepResult.data || [],
    healthDiary: healthDiaryResult.data || [],
    medicalDocuments: medicalDocsResult.data || [],
    medicalReports: medicalReportsResult.data || [],
    prescriptions: prescriptionsResult.data || [],
    supplements: supplementsResult.data || [],
    challengeParticipations: challengeParticipationsResult.data || [],
    challengeDailyLogs: challengeLogsResult.data || [],
    achievements: achievementsResult.data || [],
    userPoints: userPointsResult.data || null,
    conversations: conversationsResult.data || [],
    chatMessages: chatMessagesResult.data || [],
    drVitalMemory: drVitalMemoryResult.data || [],
    heartRateData: heartRateResult.data || [],
    weeklyAnalyses: weeklyAnalysesResult.data || [],
    courseProgress: courseProgressResult.data || [],
    companyKnowledge: companyKnowledgeResult.data || [],
    metadata: {
      dataCompleteness: {
        percentage: completenessPercentage,
        missingData,
        canReceiveFullAnalysis: completenessPercentage >= 60,
      },
      lastUpdated: new Date().toISOString(),
      totalDataPoints,
    },
  };
}

/**
 * Gera um resumo textual dos dados do usuário para o prompt da IA.
 * Este resumo é usado tanto pela Sofia quanto pelo Dr. Vital.
 */
export function generateUserContextSummary(context: UserCompleteContext): string {
  const { profile, physicalData, weightHistory, anamnesis, goals, nutritionHistory, dailyResponses, metadata } = context;

  // Análise de peso
  const currentWeight = weightHistory[0]?.peso_kg;
  const previousWeight = weightHistory[1]?.peso_kg;
  const weightTrend = currentWeight && previousWeight 
    ? currentWeight > previousWeight ? '📈 aumentando' 
      : currentWeight < previousWeight ? '📉 diminuindo' 
      : '➡️ estável'
    : 'indeterminado';

  const latestBMI = weightHistory[0]?.imc;
  const metabolicRisk = weightHistory[0]?.risco_metabolico;
  const bodyFat = weightHistory[0]?.gordura_corporal_percent;
  const muscleMass = weightHistory[0]?.massa_muscular_kg;

  // Análise nutricional
  const last7DaysNutrition = nutritionHistory.slice(0, 7);
  const avgCalories = last7DaysNutrition.length > 0
    ? Math.round(last7DaysNutrition.reduce((sum, d) => sum + (d.total_calories || 0), 0) / last7DaysNutrition.length)
    : null;

  // Padrões das respostas diárias
  const last14DaysResponses = dailyResponses.slice(0, 14);
  const stressResponses = last14DaysResponses.filter(r => r.question_id?.includes('stress')).map(r => parseInt(r.answer)).filter(v => !isNaN(v));
  const energyResponses = last14DaysResponses.filter(r => r.question_id?.includes('energy')).map(r => parseInt(r.answer)).filter(v => !isNaN(v));
  const avgStress = stressResponses.length > 0 ? Math.round(stressResponses.reduce((a, b) => a + b, 0) / stressResponses.length) : null;
  const avgEnergy = energyResponses.length > 0 ? Math.round(energyResponses.reduce((a, b) => a + b, 0) / energyResponses.length) : null;

  // Metas ativas
  const activeGoals = goals.filter(g => g.status === 'active' || g.status === 'em_andamento');

  return `
=== RESUMO DO PACIENTE: ${profile.fullName} ===

📊 COMPLETUDE DOS DADOS: ${metadata.dataCompleteness.percentage}%
${metadata.dataCompleteness.canReceiveFullAnalysis ? '✅ Dados suficientes para análise completa' : '⚠️ Dados insuficientes - orientar coleta de mais informações'}
${metadata.dataCompleteness.missingData.length > 0 ? `📝 Dados faltantes: ${metadata.dataCompleteness.missingData.join(', ')}` : ''}

👤 DADOS BÁSICOS:
- Nome: ${profile.fullName}
- Idade: ${profile.age || 'não informada'}
- Gênero: ${profile.gender || 'não informado'}
- Altura: ${physicalData?.height_cm ? `${physicalData.height_cm} cm` : 'não informada'}

⚖️ DADOS DE PESO E COMPOSIÇÃO CORPORAL:
- Peso atual: ${currentWeight ? `${currentWeight} kg` : 'não registrado'}
- Tendência: ${weightTrend}
- IMC: ${latestBMI ? latestBMI.toFixed(1) : 'não calculado'}
- Gordura corporal: ${bodyFat ? `${bodyFat}%` : 'não medida'}
- Massa muscular: ${muscleMass ? `${muscleMass} kg` : 'não medida'}
- Risco metabólico: ${metabolicRisk || 'não avaliado'}
- Total de pesagens registradas: ${weightHistory.length}

🍽️ NUTRIÇÃO (últimos 7 dias):
- Média de calorias/dia: ${avgCalories || 'sem registros'} kcal
- Refeições registradas: ${last7DaysNutrition.length}
- Análises de fotos: ${context.foodAnalysis.length}

🎯 METAS ATIVAS (${activeGoals.length}):
${activeGoals.slice(0, 5).map(g => `- ${g.title}: ${g.current_value || 0}/${g.target_value || '?'} ${g.unit || ''}`).join('\n') || 'Nenhuma meta ativa'}

📈 PADRÕES RECENTES (14 dias):
- Nível de estresse médio: ${avgStress !== null ? `${avgStress}/10` : 'sem dados'}
- Energia matinal média: ${avgEnergy !== null ? `${avgEnergy}/10` : 'sem dados'}
- Respostas diárias: ${last14DaysResponses.length}

🏥 ANAMNESE:
${anamnesis ? `
- Histórico familiar: ${[
    anamnesis.family_obesity_history && 'obesidade',
    anamnesis.family_diabetes_history && 'diabetes',
    anamnesis.family_heart_disease_history && 'cardiopatias',
  ].filter(Boolean).join(', ') || 'não informado'}
- Medicações atuais: ${anamnesis.current_medications?.length || 0}
- Doenças crônicas: ${anamnesis.chronic_diseases?.length || 0}
- Qualidade do sono: ${anamnesis.sleep_quality_score ? `${anamnesis.sleep_quality_score}/10` : 'não avaliada'}
- Nível de estresse diário: ${anamnesis.daily_stress_level ? `${anamnesis.daily_stress_level}/10` : 'não avaliado'}
` : 'Anamnese não preenchida'}

💪 ATIVIDADE FÍSICA:
- Sessões de exercício: ${context.exerciseHistory.length}
- Desafios participando: ${context.challengeParticipations.length}

📚 TOTAL DE DADOS COLETADOS: ${metadata.totalDataPoints} registros
`;
}
