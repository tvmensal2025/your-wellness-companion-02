import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface UserInfo {
  id: string;
  email: string;
}

/**
 * Find user by phone number
 */
export async function findUserByPhone(
  supabase: SupabaseClient,
  phone: string
): Promise<UserInfo | null> {
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("55")) {
    cleanPhone = cleanPhone.substring(2);
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, email, phone")
    .or(`phone.ilike.%${cleanPhone}%,phone.ilike.%${phone}%`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[UserService] Erro ao buscar usuário:", error);
    return null;
  }

  if (data) {
    return { id: data.user_id, email: data.email };
  }

  return null;
}

/**
 * Get user's daily calorie total
 */
export async function getDailyTotal(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  // Buscar de food_history (fonte principal)
  const { data: foodHistory } = await supabase
    .from("food_history")
    .select("total_calories")
    .eq("user_id", userId)
    .eq("meal_date", today);

  const foodHistoryTotal = foodHistory?.reduce(
    (sum, item) => sum + (Number(item.total_calories) || 0),
    0
  ) || 0;

  // Também buscar de nutrition_tracking (legado)
  const { data: nutritionTracking } = await supabase
    .from("nutrition_tracking")
    .select("total_calories")
    .eq("user_id", userId)
    .eq("date", today);

  const nutritionTotal = nutritionTracking?.reduce(
    (sum, item) => sum + (Number(item.total_calories) || 0),
    0
  ) || 0;

  return Math.max(foodHistoryTotal, nutritionTotal);
}
