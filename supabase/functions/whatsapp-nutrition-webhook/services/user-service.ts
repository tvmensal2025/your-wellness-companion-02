import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface UserInfo {
  id: string;
  email: string;
  full_name?: string;
}

/**
 * Find user by phone number
 * Busca primeiro em profiles, depois tenta criar profile se usuário existir em auth.users
 */
export async function findUserByPhone(
  supabase: SupabaseClient,
  phone: string
): Promise<UserInfo | null> {
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("55")) {
    cleanPhone = cleanPhone.substring(2);
  }

  // 1. Buscar em profiles
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, email, phone, full_name")
    .or(`phone.ilike.%${cleanPhone}%,phone.ilike.%${phone}%`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[UserService] Erro ao buscar usuário:", error);
    return null;
  }

  if (data) {
    console.log(`[UserService] Usuário encontrado: ${data.full_name || data.email}`);
    return { 
      id: data.user_id, 
      email: data.email,
      full_name: data.full_name || undefined,
    };
  }

  // 2. Se não encontrou em profiles, tentar criar profile a partir de auth.users
  console.log(`[UserService] Usuário não encontrado em profiles, tentando sincronizar...`);
  
  const syncedUser = await syncOrphanUser(supabase, cleanPhone, phone);
  if (syncedUser) {
    console.log(`[UserService] Usuário sincronizado com sucesso: ${syncedUser.full_name || syncedUser.email}`);
    return syncedUser;
  }

  console.log(`[UserService] Usuário não encontrado em nenhuma fonte: ${phone}`);
  return null;
}

/**
 * Tenta sincronizar um usuário que existe em auth.users mas não em profiles
 */
async function syncOrphanUser(
  supabase: SupabaseClient,
  cleanPhone: string,
  originalPhone: string
): Promise<UserInfo | null> {
  try {
    // Buscar usuário órfão usando RPC (função no banco que pode acessar auth.users)
    const { data: orphanData, error: orphanError } = await supabase.rpc(
      'find_and_sync_orphan_user_by_phone',
      { p_phone: cleanPhone }
    );

    if (orphanError) {
      console.error("[UserService] Erro ao buscar usuário órfão:", orphanError);
      return null;
    }

    if (orphanData && orphanData.user_id) {
      return {
        id: orphanData.user_id,
        email: orphanData.email,
        full_name: orphanData.full_name || undefined,
      };
    }

    return null;
  } catch (err) {
    console.error("[UserService] Exceção ao sincronizar usuário órfão:", err);
    return null;
  }
}

/**
 * Get user's daily calorie total
 * IMPORTANTE: Somar apenas refeições CONFIRMADAS pelo usuário
 */
export async function getDailyTotal(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  // Buscar de food_history - APENAS confirmados!
  const { data: foodHistory } = await supabase
    .from("food_history")
    .select("total_calories")
    .eq("user_id", userId)
    .eq("meal_date", today)
    .eq("user_confirmed", true);

  const foodHistoryTotal = foodHistory?.reduce(
    (sum, item) => sum + (Number(item.total_calories) || 0),
    0
  ) || 0;

  // Se não tiver food_history confirmado, tentar nutrition_tracking
  if (foodHistoryTotal === 0) {
    const { data: nutritionTracking } = await supabase
      .from("nutrition_tracking")
      .select("total_calories")
      .eq("user_id", userId)
      .eq("date", today);

    const nutritionTotal = nutritionTracking?.reduce(
      (sum, item) => sum + (Number(item.total_calories) || 0),
      0
    ) || 0;

    return nutritionTotal;
  }

  return foodHistoryTotal;
}
