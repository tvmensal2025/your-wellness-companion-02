/**
 * Supabase Service - Conexão com banco de dados
 */

import { createClient } from '@supabase/supabase-js';

let supabase = null;

export function getSupabase() {
  if (!supabase) {
    supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
  }
  return supabase;
}

// ===========================================
// Funções de Usuário
// ===========================================

/**
 * Buscar usuário por telefone
 */
export async function getUserByPhone(phone) {
  const db = getSupabase();
  const { data, error } = await db
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('phone', phone)
    .single();
  
  if (error) return null;
  return data;
}

/**
 * Buscar usuário por ID
 */
export async function getUserById(userId) {
  const db = getSupabase();
  const { data, error } = await db
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) return null;
  return data;
}

// ===========================================
// Funções de Tracking
// ===========================================

/**
 * Registrar peso
 */
export async function recordWeight(userId, weightKg, notes = '') {
  const db = getSupabase();
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await db
    .from('weight_measurements')
    .upsert({
      user_id: userId,
      weight_kg: weightKg,
      measurement_date: today,
      notes,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,measurement_date'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

/**
 * Buscar último peso
 */
export async function getLastWeight(userId) {
  const db = getSupabase();
  const { data } = await db
    .from('weight_measurements')
    .select('weight_kg, measurement_date')
    .eq('user_id', userId)
    .order('measurement_date', { ascending: false })
    .limit(1)
    .single();
  
  return data;
}

/**
 * Registrar água
 */
export async function recordWater(userId, amountMl) {
  const db = getSupabase();
  const today = new Date().toISOString().split('T')[0];
  
  // Buscar tracking atual
  const { data: current } = await db
    .from('advanced_daily_tracking')
    .select('water_ml')
    .eq('user_id', userId)
    .eq('tracking_date', today)
    .single();
  
  const currentWater = current?.water_ml || 0;
  const newTotal = currentWater + amountMl;
  
  const { data, error } = await db
    .from('advanced_daily_tracking')
    .upsert({
      user_id: userId,
      tracking_date: today,
      water_ml: newTotal,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,tracking_date'
    })
    .select()
    .single();
  
  if (error) throw error;
  return { previous: currentWater, added: amountMl, total: newTotal };
}

/**
 * Buscar água do dia
 */
export async function getTodayWater(userId) {
  const db = getSupabase();
  const today = new Date().toISOString().split('T')[0];
  
  const { data } = await db
    .from('advanced_daily_tracking')
    .select('water_ml')
    .eq('user_id', userId)
    .eq('tracking_date', today)
    .single();
  
  return data?.water_ml || 0;
}

/**
 * Registrar humor/energia
 */
export async function recordMood(userId, energyLevel, moodLevel) {
  const db = getSupabase();
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await db
    .from('advanced_daily_tracking')
    .upsert({
      user_id: userId,
      tracking_date: today,
      energy_level: energyLevel,
      mood_level: moodLevel,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,tracking_date'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ===========================================
// Funções de Análise de Alimentos
// ===========================================

/**
 * Buscar última análise pendente
 */
export async function getPendingAnalysis(userId) {
  const db = getSupabase();
  const { data } = await db
    .from('food_analysis')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  return data;
}

/**
 * Confirmar análise
 */
export async function confirmAnalysis(analysisId) {
  const db = getSupabase();
  const { data, error } = await db
    .from('food_analysis')
    .update({
      status: 'confirmed',
      confirmed_at: new Date().toISOString()
    })
    .eq('id', analysisId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// ===========================================
// Funções de Notificação
// ===========================================

/**
 * Buscar usuários para lembrete de água
 */
export async function getUsersForWaterReminder() {
  const db = getSupabase();
  const today = new Date().toISOString().split('T')[0];
  
  // Usuários que não atingiram meta de água hoje
  const { data } = await db
    .from('profiles')
    .select(`
      id, 
      full_name, 
      phone,
      advanced_daily_tracking!inner(water_ml)
    `)
    .not('phone', 'is', null)
    .eq('advanced_daily_tracking.tracking_date', today)
    .lt('advanced_daily_tracking.water_ml', 2000);
  
  return data || [];
}

/**
 * Buscar usuários para lembrete de peso semanal
 */
export async function getUsersForWeightReminder() {
  const db = getSupabase();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  // Usuários que não pesaram na última semana
  const { data } = await db
    .from('profiles')
    .select('id, full_name, phone')
    .not('phone', 'is', null);
  
  // Filtrar quem não pesou recentemente
  const usersToRemind = [];
  for (const user of data || []) {
    const lastWeight = await getLastWeight(user.id);
    if (!lastWeight || new Date(lastWeight.measurement_date) < weekAgo) {
      usersToRemind.push(user);
    }
  }
  
  return usersToRemind;
}
