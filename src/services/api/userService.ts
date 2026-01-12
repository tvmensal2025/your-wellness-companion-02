/**
 * 👤 User Service - CRUD Centralizado de Usuário
 * 
 * Este serviço centraliza TODAS as operações de dados do usuário.
 * Substitui múltiplas queries espalhadas pelo código.
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════
// 📋 TIPOS
// ═══════════════════════════════════════════════════════════

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  gender: string | null;
  birth_date: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPhysicalData {
  id: string;
  user_id: string;
  altura_cm: number | null;
  peso_atual_kg: number | null;
  idade: number | null;
  sexo: string | null;
  nivel_atividade: string | null;
  imc: number | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  sidebar_order: string[] | null;
  hidden_sidebar_items: string[] | null;
  hidden_dashboard_cards: string[] | null;
  dashboard_cards_order: string[] | null;
  default_section: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompleteUserData {
  profile: UserProfile | null;
  physicalData: UserPhysicalData | null;
  preferences: UserPreferences | null;
  // Dados derivados para conveniência
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
}

// ═══════════════════════════════════════════════════════════
// 📖 READ OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Busca todos os dados do usuário em uma única chamada
 * Usa Promise.all para paralelizar as queries
 */
export async function fetchCompleteUserData(userId: string): Promise<CompleteUserData> {
  const [profileResult, physicalResult, preferencesResult] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('user_physical_data')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('user_layout_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  const profile = profileResult.data as UserProfile | null;
  const physicalData = physicalResult.data as UserPhysicalData | null;
  const preferences = preferencesResult.data as UserPreferences | null;

  return {
    profile,
    physicalData,
    preferences,
    displayName: profile?.full_name || profile?.email?.split('@')[0] || 'Usuário',
    avatarUrl: profile?.avatar_url || null,
    email: profile?.email || null,
  };
}

/**
 * Busca apenas o perfil do usuário
 */
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }

  return data as UserProfile | null;
}

/**
 * Busca dados físicos do usuário
 */
export async function fetchUserPhysicalData(userId: string): Promise<UserPhysicalData | null> {
  const { data, error } = await supabase
    .from('user_physical_data')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Erro ao buscar dados físicos:', error);
    return null;
  }

  return data as UserPhysicalData | null;
}

// ═══════════════════════════════════════════════════════════
// ✏️ UPDATE OPERATIONS
// ═══════════════════════════════════════════════════════════

/**
 * Atualiza o perfil do usuário
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }

  return data as UserProfile;
}

/**
 * Atualiza dados físicos do usuário
 */
export async function updateUserPhysicalData(
  userId: string,
  updates: Partial<Omit<UserPhysicalData, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserPhysicalData | null> {
  const { data, error } = await supabase
    .from('user_physical_data')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar dados físicos:', error);
    throw error;
  }

  return data as UserPhysicalData;
}

/**
 * Atualiza preferências de layout
 */
export async function updateUserPreferences(
  userId: string,
  updates: Partial<Omit<UserPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from('user_layout_preferences')
    .upsert({
      user_id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar preferências:', error);
    throw error;
  }

  return data as UserPreferences;
}

// ═══════════════════════════════════════════════════════════
// 🔍 VERIFICAÇÕES
// ═══════════════════════════════════════════════════════════

/**
 * Verifica se usuário é admin (via RPC seguro)
 */
export async function checkIsAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin_user');
  
  if (error) {
    console.error('Erro ao verificar admin:', error);
    return false;
  }

  return data === true;
}

/**
 * Busca o ID do usuário atual
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}
