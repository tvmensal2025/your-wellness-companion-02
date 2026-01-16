import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface PendingNutrition {
  id: string;
  user_id: string;
  phone: string;
  meal_type: string;
  analysis_result: any;
  waiting_confirmation: boolean;
  waiting_edit: boolean;
  confirmed: boolean | null;
  is_processed: boolean;
  image_url: string | null;
  expires_at: string;
}

export interface PendingMedical {
  id: string;
  user_id: string;
  phone: string;
  image_url: string;
  image_urls: Array<{ url: string; created_at: string }>;
  images_count: number;
  status: string;
  waiting_confirmation: boolean;
  confirmed: boolean | null;
  is_processed: boolean;
  expires_at: string;
  created_at: string;
  last_image_at: string | null;
  analysis_result?: any;
  medical_document_id?: string | null;
  public_link_token?: string | null;
  updated_at?: string | null;
}

/**
 * Get pending nutrition confirmation for user
 */
export async function getPendingConfirmation(
  supabase: SupabaseClient,
  userId: string
): Promise<PendingNutrition | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("whatsapp_pending_nutrition")
    .select("*")
    .eq("user_id", userId)
    .eq("is_processed", false)
    .or("waiting_confirmation.eq.true,waiting_edit.eq.true")
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[PendingService] Erro ao buscar pendente:", error);
    return null;
  }

  return data;
}

/**
 * Get pending medical batch for user
 */
export async function getPendingMedical(
  supabase: SupabaseClient,
  userId: string
): Promise<PendingMedical | null> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("whatsapp_pending_medical")
    .select("*")
    .eq("user_id", userId)
    .eq("is_processed", false)
    .in("status", ["collecting", "awaiting_confirm", "awaiting_info", "processing"])
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return data;
}

/**
 * Check if user has medical exam in processing status
 */
export async function hasMedicalInProcessing(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("whatsapp_pending_medical")
    .select("id")
    .eq("user_id", userId)
    .eq("is_processed", false)
    .eq("status", "processing")
    .gt("expires_at", now)
    .limit(1)
    .maybeSingle();

  return !error && !!data;
}

/**
 * Check and clear expired pending nutrition records
 */
export async function checkAndClearExpiredPending(
  supabase: SupabaseClient,
  userId: string,
  phone?: string
): Promise<boolean> {
  const { data: expired, error } = await supabase
    .from("whatsapp_pending_nutrition")
    .select("*")
    .eq("user_id", userId)
    .eq("is_processed", false)
    .or("waiting_confirmation.eq.true,waiting_edit.eq.true")
    .lt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !expired || expired.length === 0) {
    return false;
  }

  console.log("[PendingService] Análise expirada encontrada, limpando...");

  await supabase
    .from("whatsapp_pending_nutrition")
    .delete()
    .eq("user_id", userId)
    .lt("expires_at", new Date().toISOString());

  return true;
}

/**
 * Cleanup stuck medical batches (>10 min in processing)
 */
export async function cleanupStuckMedicalBatches(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // Primeiro: marcar como completed lotes que já têm medical_document_id
    await supabase
      .from("whatsapp_pending_medical")
      .update({ status: "completed", is_processed: true })
      .eq("user_id", userId)
      .in("status", ["processing", "stuck"])
      .eq("is_processed", false)
      .not("medical_document_id", "is", null);

    // Segundo: marcar como stuck lotes sem documento e muito antigos
    const { data: stuck } = await supabase
      .from("whatsapp_pending_medical")
      .update({ status: "stuck", is_processed: true })
      .eq("user_id", userId)
      .eq("status", "processing")
      .eq("is_processed", false)
      .is("medical_document_id", null)
      .lt("last_image_at", thirtyMinutesAgo)
      .select("id");

    if (stuck && stuck.length > 0) {
      console.log(`[PendingService] Limpos ${stuck.length} lotes presos em processing`);
    }
    return stuck?.length || 0;
  } catch (e) {
    console.error("[PendingService] Erro ao limpar lotes presos:", e);
    return 0;
  }
}

/**
 * Get all stuck or pending medical batches for user
 */
export async function getStuckMedicalBatches(
  supabase: SupabaseClient,
  userId: string
): Promise<Array<{ id: string; status: string; images_count: number; created_at: string }>> {
  try {
    const { data } = await supabase
      .from("whatsapp_pending_medical")
      .select("id, status, images_count, created_at")
      .eq("user_id", userId)
      .eq("is_processed", false)
      .in("status", ["collecting", "awaiting_confirm", "processing", "stuck"])
      .order("created_at", { ascending: false })
      .limit(5);
    
    return data || [];
  } catch (e) {
    console.error("[PendingService] Erro ao buscar lotes:", e);
    return [];
  }
}

/**
 * Cancel all pending medical batches for user
 */
export async function cancelAllMedicalBatches(
  supabase: SupabaseClient,
  userId: string
): Promise<number> {
  try {
    const { data } = await supabase
      .from("whatsapp_pending_medical")
      .update({ status: "cancelled", is_processed: true })
      .eq("user_id", userId)
      .eq("is_processed", false)
      .select("id");
    
    return data?.length || 0;
  } catch (e) {
    console.error("[PendingService] Erro ao cancelar lotes:", e);
    return 0;
  }
}

/**
 * Save to food history with comprehensive nutrition extraction
 */
export async function saveToFoodHistory(
  supabase: SupabaseClient,
  userId: string,
  mealType: string,
  photoUrl: string | null,
  foodItems: any[],
  nutritionData: any,
  aiAnalysis: string | null,
  confirmed: boolean = false,
  source: string = "whatsapp"
): Promise<string | null> {
  try {
    const now = new Date();
    const mealDate = now.toISOString().split("T")[0];
    const mealTime = now.toTimeString().split(" ")[0];

    // Extração robusta de macros de múltiplas fontes
    const totalCalories = 
      nutritionData?.total_kcal ??
      nutritionData?.totalCalories ??
      nutritionData?.kcal ??
      nutritionData?.calories ??
      nutritionData?.nutrition_totals?.totals?.kcal ??
      0;

    const totalProteins = 
      nutritionData?.total_proteina ??
      nutritionData?.totalProteins ??
      nutritionData?.proteins ??
      nutritionData?.protein ??
      nutritionData?.nutrition_totals?.totals?.protein ??
      0;

    const totalCarbs = 
      nutritionData?.total_carbo ??
      nutritionData?.totalCarbs ??
      nutritionData?.carbs ??
      nutritionData?.carbohydrates ??
      nutritionData?.nutrition_totals?.totals?.carbs ??
      0;

    const totalFats = 
      nutritionData?.total_gordura ??
      nutritionData?.totalFats ??
      nutritionData?.fats ??
      nutritionData?.fat ??
      nutritionData?.nutrition_totals?.totals?.fat ??
      0;

    const totalFiber = 
      nutritionData?.total_fibra ??
      nutritionData?.totalFiber ??
      nutritionData?.fiber ??
      nutritionData?.nutrition_totals?.totals?.fiber ??
      0;

    console.log("[PendingService] 📊 Salvando food_history com macros:", {
      calories: totalCalories,
      proteins: totalProteins,
      carbs: totalCarbs,
      fats: totalFats,
      fiber: totalFiber,
    });

    const { data, error } = await supabase
      .from("food_history")
      .insert({
        user_id: userId,
        meal_date: mealDate,
        meal_time: mealTime,
        meal_type: mealType,
        photo_url: photoUrl,
        food_items: foodItems,
        total_calories: Number(totalCalories) || 0,
        total_proteins: Number(totalProteins) || 0,
        total_carbs: Number(totalCarbs) || 0,
        total_fats: Number(totalFats) || 0,
        total_fiber: Number(totalFiber) || 0,
        source: source,
        confidence_score: nutritionData?.confidence || null,
        user_confirmed: confirmed,
        ai_analysis: aiAnalysis,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[PendingService] Erro ao salvar food_history:", error);
      return null;
    }

    console.log("[PendingService] ✅ Salvo em food_history:", data.id);
    return data.id;
  } catch (e) {
    console.error("[PendingService] Erro ao salvar food_history:", e);
    return null;
  }
}

/**
 * Update food history confirmation status
 */
export async function updateFoodHistoryConfirmation(
  supabase: SupabaseClient,
  foodHistoryId: string,
  confirmed: boolean,
  updatedFoods?: any[],
  updatedNutrition?: any
): Promise<void> {
  try {
    const updateData: any = {
      user_confirmed: confirmed,
      updated_at: new Date().toISOString(),
    };

    if (updatedFoods) {
      updateData.food_items = updatedFoods;
    }

    if (updatedNutrition) {
      // Extração robusta
      updateData.total_calories = 
        updatedNutrition.total_kcal ?? 
        updatedNutrition.totalCalories ?? 
        updatedNutrition.kcal ??
        0;
      updateData.total_proteins = 
        updatedNutrition.total_proteina ?? 
        updatedNutrition.totalProteins ??
        updatedNutrition.protein ??
        0;
      updateData.total_carbs = 
        updatedNutrition.total_carbo ?? 
        updatedNutrition.totalCarbs ??
        updatedNutrition.carbs ??
        0;
      updateData.total_fats = 
        updatedNutrition.total_gordura ?? 
        updatedNutrition.totalFats ??
        updatedNutrition.fat ??
        0;
      updateData.total_fiber = 
        updatedNutrition.total_fibra ?? 
        updatedNutrition.totalFiber ??
        updatedNutrition.fiber ??
        0;
    }

    await supabase
      .from("food_history")
      .update(updateData)
      .eq("id", foodHistoryId);

    console.log("[PendingService] ✅ food_history atualizado:", foodHistoryId);
  } catch (e) {
    console.error("[PendingService] Erro ao atualizar food_history:", e);
  }
}
