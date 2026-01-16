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
  
  // Limpar telefone
  const cleanPhone = phone.replace(/\D/g, '');
  
  const { data, error } = await db
    .from('profiles')
    .select('id, user_id, full_name, email, phone')
    .or(`phone.eq.${phone},phone.eq.${cleanPhone},phone.like.%${cleanPhone.slice(-9)}`)
    .limit(1)
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
    .or(`id.eq.${userId},user_id.eq.${userId}`)
    .limit(1)
    .single();
  
  if (error) return null;
  return data;
}

/**
 * Buscar usuários com telefone
 */
export async function getUsersWithPhone(limit = 1000) {
  const db = getSupabase();
  const { data } = await db
    .from('profiles')
    .select('id, user_id, full_name, phone')
    .not('phone', 'is', null)
    .limit(limit);
  
  return data || [];
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
// Funções de Notificação (Fila Unificada)
// ===========================================

/**
 * Buscar notificações pendentes para processar
 */
export async function getPendingNotifications(limit = 50, userId = null) {
  const db = getSupabase();
  
  let query = db
    .from('notification_queue_unified')
    .select('*')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('priority', { ascending: false }) // critical > high > medium > low
    .order('scheduled_for', { ascending: true })
    .limit(limit);
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar notificações pendentes:', error);
    return [];
  }
  
  return data || [];
}

/**
 * Marcar notificação como enviada
 */
export async function markNotificationSent(notificationId, sentVia = 'whatsapp') {
  const db = getSupabase();
  
  const { error } = await db
    .from('notification_queue_unified')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_via: sentVia,
      updated_at: new Date().toISOString()
    })
    .eq('id', notificationId);
  
  if (error) {
    console.error('Erro ao marcar notificação como enviada:', error);
  }
}

/**
 * Marcar notificação como falha
 */
export async function markNotificationFailed(notificationId, errorMessage) {
  const db = getSupabase();
  
  const { data: current } = await db
    .from('notification_queue_unified')
    .select('retry_count')
    .eq('id', notificationId)
    .single();
  
  const retryCount = (current?.retry_count || 0) + 1;
  
  const { error } = await db
    .from('notification_queue_unified')
    .update({
      status: retryCount >= 3 ? 'failed' : 'pending', // Retry até 3x
      error_message: errorMessage,
      retry_count: retryCount,
      updated_at: new Date().toISOString()
    })
    .eq('id', notificationId);
  
  if (error) {
    console.error('Erro ao marcar notificação como falha:', error);
  }
}

/**
 * Criar notificação na fila
 */
export async function createNotification(userId, type, category, title, body, options = {}) {
  const db = getSupabase();
  
  const { data, error } = await db
    .from('notification_queue_unified')
    .insert({
      user_id: userId,
      notification_type: type,
      category: category,
      title: title,
      body: body,
      action_url: options.actionUrl,
      metadata: options.metadata || {},
      priority: options.priority || 'medium',
      scheduled_for: options.scheduledFor || new Date().toISOString(),
      status: 'pending'
    })
    .select()
    .single();
  
  if (error) {
    console.error('Erro ao criar notificação:', error);
    return null;
  }
  
  return data;
}

// ===========================================
// Funções de Lembretes (Legacy)
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
      user_id,
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
    .select('id, user_id, full_name, phone')
    .not('phone', 'is', null);
  
  // Filtrar quem não pesou recentemente
  const usersToRemind = [];
  for (const user of data || []) {
    const lastWeight = await getLastWeight(user.user_id || user.id);
    if (!lastWeight || new Date(lastWeight.measurement_date) < weekAgo) {
      usersToRemind.push(user);
    }
  }
  
  return usersToRemind;
}
