import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  isConfirmationPositive,
  isConfirmationNegative,
  isConfirmationEdit,
  isEditDone,
  isClearPending,
} from "../utils/message-utils.ts";

export interface IntentResult {
  intent: string;
  confidence: number;
  details: {
    newFood?: { name: string; grams: number };
    foodIndex?: number;
  };
}

/**
 * Interpret user intent using AI
 */
export async function interpretUserIntent(
  supabase: SupabaseClient,
  text: string,
  context: string,
  pendingFoods?: any[]
): Promise<IntentResult> {
  try {
    const { data, error } = await supabase.functions.invoke("interpret-user-intent", {
      body: {
        text,
        context,
        pendingFoods: pendingFoods || [],
      },
    });

    if (error || !data) {
      return fallbackIntentInterpretation(text);
    }

    // If AI returned unknown, try fallback
    if (data.intent === "unknown") {
      const fallback = fallbackIntentInterpretation(text);
      if (fallback.intent !== "unknown") {
        console.log("[IntentService] IA retornou unknown, usando fallback:", fallback.intent);
        return fallback;
      }
    }

    return data;
  } catch (e) {
    return fallbackIntentInterpretation(text);
  }
}

/**
 * Fallback intent interpretation using pattern matching
 */
export function fallbackIntentInterpretation(text: string): IntentResult {
  const lower = text.toLowerCase().trim();

  if (isConfirmationPositive(lower)) {
    return { intent: "confirm", confidence: 0.8, details: {} };
  }
  if (isConfirmationNegative(lower)) {
    return { intent: "cancel", confidence: 0.8, details: {} };
  }
  if (isConfirmationEdit(lower)) {
    return { intent: "edit", confidence: 0.8, details: {} };
  }
  if (isEditDone(lower)) {
    return { intent: "confirm", confidence: 0.8, details: {} };
  }
  if (isClearPending(lower)) {
    return { intent: "clear_pending", confidence: 0.8, details: {} };
  }

  return { intent: "unknown", confidence: 0, details: {} };
}
