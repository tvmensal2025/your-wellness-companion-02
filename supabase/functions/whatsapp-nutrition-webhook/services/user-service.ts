import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface UserInfo {
  id: string;
  email: string;
  full_name?: string;
}

/**
 * Normaliza telefone para busca - gera múltiplas variações
 */
function generatePhoneVariations(phone: string): string[] {
  // Remove tudo que não é número
  const numbersOnly = phone.replace(/\D/g, "");
  
  const variations: string[] = [];
  
  // Original
  if (phone) variations.push(phone);
  
  // Só números
  if (numbersOnly) variations.push(numbersOnly);
  
  // Com DDI 55
  if (!numbersOnly.startsWith("55")) {
    variations.push("55" + numbersOnly);
    variations.push("+55" + numbersOnly);
  }
  
  // Sem DDI 55
  if (numbersOnly.startsWith("55") && numbersOnly.length > 10) {
    const withoutDDI = numbersOnly.substring(2);
    variations.push(withoutDDI);
  }
  
  // Com + no início
  if (!phone.startsWith("+") && numbersOnly.startsWith("55")) {
    variations.push("+" + numbersOnly);
  }
  
  // Remove duplicatas
  return [...new Set(variations)].filter(v => v.length >= 8);
}

/**
 * Find user by phone number
 * Busca com múltiplas variações de formato de telefone
 */
export async function findUserByPhone(
  supabase: SupabaseClient,
  phone: string
): Promise<UserInfo | null> {
  const variations = generatePhoneVariations(phone);
  
  console.log(`[UserService] 🔍 Buscando usuário pelo telefone: ${phone}`);
  console.log(`[UserService] 📱 Variações geradas: ${JSON.stringify(variations)}`);

  // 1. Buscar em profiles usando OR com todas as variações
  const orConditions = variations.map(v => `phone.ilike.%${v}%`).join(",");
  
  console.log(`[UserService] 🔎 Query OR: ${orConditions}`);

  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, email, phone, full_name")
    .or(orConditions)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[UserService] ❌ Erro ao buscar usuário:", error);
    return null;
  }

  if (data) {
    console.log(`[UserService] ✅ Usuário encontrado: ${data.full_name || data.email} (phone: ${data.phone})`);
    return { 
      id: data.user_id, 
      email: data.email,
      full_name: data.full_name || undefined,
    };
  }

  // 2. Tentar busca exata com cada variação (fallback)
  console.log(`[UserService] 🔄 Tentando busca exata com cada variação...`);
  
  for (const variation of variations) {
    const { data: exactData, error: exactError } = await supabase
      .from("profiles")
      .select("user_id, email, phone, full_name")
      .eq("phone", variation)
      .limit(1)
      .maybeSingle();
    
    if (!exactError && exactData) {
      console.log(`[UserService] ✅ Usuário encontrado (busca exata): ${exactData.full_name || exactData.email}`);
      return { 
        id: exactData.user_id, 
        email: exactData.email,
        full_name: exactData.full_name || undefined,
      };
    }
  }

  // 3. Se não encontrou em profiles, tentar sincronizar usuário órfão
  console.log(`[UserService] 🔄 Usuário não encontrado em profiles, tentando sincronizar...`);
  
  const cleanPhone = phone.replace(/\D/g, "").replace(/^55/, "");
  const syncedUser = await syncOrphanUser(supabase, cleanPhone, phone);
  
  if (syncedUser) {
    console.log(`[UserService] ✅ Usuário sincronizado com sucesso: ${syncedUser.full_name || syncedUser.email}`);
    return syncedUser;
  }

  console.log(`[UserService] ⚠️ Usuário NÃO encontrado em nenhuma fonte: ${phone}`);
  console.log(`[UserService] 📊 Variações testadas: ${JSON.stringify(variations)}`);
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
    console.log(`[UserService] 🔍 Buscando usuário órfão com telefone: ${cleanPhone}`);
    
    // Buscar usuário órfão usando RPC (função no banco que pode acessar auth.users)
    const { data: orphanData, error: orphanError } = await supabase.rpc(
      'find_and_sync_orphan_user_by_phone',
      { p_phone: cleanPhone }
    );

    if (orphanError) {
      console.error("[UserService] ❌ Erro ao buscar usuário órfão:", orphanError);
      return null;
    }

    // O RPC retorna um array
    const orphan = Array.isArray(orphanData) ? orphanData[0] : orphanData;

    if (orphan && orphan.user_id) {
      console.log(`[UserService] ✅ Usuário órfão encontrado e sincronizado: ${orphan.email}`);
      return {
        id: orphan.user_id,
        email: orphan.email,
        full_name: orphan.full_name || undefined,
      };
    }

    console.log(`[UserService] ℹ️ Nenhum usuário órfão encontrado para: ${cleanPhone}`);
    return null;
  } catch (err) {
    console.error("[UserService] ❌ Exceção ao sincronizar usuário órfão:", err);
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
