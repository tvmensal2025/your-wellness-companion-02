import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { UserInfo } from "../services/user-service.ts";
import { PendingNutrition, updateFoodHistoryConfirmation } from "../services/pending-service.ts";
import { sendWhatsApp } from "../utils/whatsapp-sender.ts";
import { isEditDone, parseEditCommand } from "../utils/message-utils.ts";
import { interpretUserIntent } from "../services/intent-service.ts";

/**
 * Handle edit mode messages
 */
export async function handleEdit(
  supabase: SupabaseClient,
  user: UserInfo,
  pending: PendingNutrition,
  messageText: string,
  phone: string
): Promise<void> {
  try {
    const analysis = pending.analysis_result || {};
    const pendingFoods = analysis.detectedFoods || analysis.foods || [];
    const foodHistoryId = analysis.food_history_id;

    // Check if user wants to finish editing
    if (isEditDone(messageText)) {
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ waiting_edit: false })
        .eq("id", pending.id);

      const foodsList = pendingFoods
        .map((f: any) => `• ${f.nome || f.name} (${f.quantidade ?? f.grams ?? "?"}g)`)
        .join("\n");

      await sendWhatsApp(
        phone,
        `✅ *Edição finalizada!*\n\n` +
          `Lista final:\n${foodsList}\n\n` +
          `Confirmar registro?\n` +
          `✅ *SIM* para confirmar\n` +
          `❌ *NÃO* para cancelar`
      );
      return;
    }

    // Use AI to interpret edit command
    const intent = await interpretUserIntent(supabase, messageText, "editing_foods", pendingFoods);

    let updatedFoods = [...pendingFoods];
    let actionMessage = "";

    if (intent.intent === "add_food" && intent.details?.newFood) {
      const newFood = {
        nome: intent.details.newFood.name,
        quantidade: intent.details.newFood.grams || 100,
        name: intent.details.newFood.name,
        grams: intent.details.newFood.grams || 100,
      };
      updatedFoods.push(newFood);
      actionMessage = `✅ Adicionado: ${newFood.nome} (${newFood.quantidade}g)`;
    } else if (intent.intent === "remove_food") {
      if (
        intent.details?.foodIndex !== undefined &&
        intent.details.foodIndex >= 0 &&
        intent.details.foodIndex < updatedFoods.length
      ) {
        const removed = updatedFoods.splice(intent.details.foodIndex, 1)[0];
        actionMessage = `✅ Removido: ${removed?.nome || removed?.name || "item"}`;
      } else if (intent.details?.newFood?.name) {
        const nameToRemove = intent.details.newFood.name.toLowerCase();
        const before = updatedFoods.length;
        updatedFoods = updatedFoods.filter((f: any) => {
          const foodName = (f.nome || f.name || "").toLowerCase();
          return !foodName.includes(nameToRemove);
        });
        if (updatedFoods.length < before) {
          actionMessage = `✅ Removido: ${intent.details.newFood.name}`;
        }
      }
    } else if (intent.intent === "replace_food" && intent.details?.newFood) {
      const indexToReplace = intent.details.foodIndex ?? 0;
      if (indexToReplace >= 0 && indexToReplace < updatedFoods.length) {
        const oldFood = updatedFoods[indexToReplace];
        updatedFoods[indexToReplace] = {
          nome: intent.details.newFood.name,
          quantidade: intent.details.newFood.grams || 100,
          name: intent.details.newFood.name,
          grams: intent.details.newFood.grams || 100,
        };
        actionMessage = `✅ Substituído: ${oldFood?.nome || oldFood?.name} → ${intent.details.newFood.name}`;
      }
    } else {
      // Try manual text command parsing
      const command = parseEditCommand(messageText, pendingFoods);
      if (command) {
        if (command.action === "add" && command.newFood) {
          updatedFoods.push({
            nome: command.newFood.name,
            quantidade: command.newFood.grams,
            name: command.newFood.name,
            grams: command.newFood.grams,
          });
          actionMessage = `✅ Adicionado: ${command.newFood.name} (${command.newFood.grams}g)`;
        } else if (command.action === "remove" && command.index !== undefined) {
          const removed = updatedFoods.splice(command.index, 1)[0];
          actionMessage = `✅ Removido: ${removed?.nome || removed?.name}`;
        } else if (
          command.action === "replace" &&
          command.index !== undefined &&
          command.newFood
        ) {
          updatedFoods[command.index] = {
            nome: command.newFood.name,
            quantidade: command.newFood.grams,
            name: command.newFood.name,
            grams: command.newFood.grams,
          };
          actionMessage = `✅ Substituído para: ${command.newFood.name} (${command.newFood.grams}g)`;
        }
      }
    }

    if (actionMessage) {
      const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ analysis_result: updatedAnalysis })
        .eq("id", pending.id);

      // Update food_history too
      if (foodHistoryId) {
        await supabase
          .from("food_history")
          .update({ food_items: updatedFoods })
          .eq("id", foodHistoryId);
      }

      const numberedList = updatedFoods
        .map(
          (f: any, i: number) =>
            `${i + 1}. ${f.nome || f.name} (${f.quantidade ?? f.grams}g)`
        )
        .join("\n");

      await sendWhatsApp(
        phone,
        `${actionMessage}\n\n` +
          `Lista atualizada:\n${numberedList}\n\n` +
          `Continue editando ou responda *PRONTO*`
      );
    } else {
      await sendWhatsApp(
        phone,
        `🤔 Não entendi. Tente:\n` +
          `• "Adiciona banana 100g"\n` +
          `• "Tira o arroz"\n` +
          `• "Trocar 1 por macarrão 200g"\n\n` +
          `Ou responda *PRONTO* para finalizar`
      );
    }
  } catch (error) {
    console.error("[EditHandler] Erro na edição:", error);
    await sendWhatsApp(phone, "❌ Erro ao editar. Tente novamente!");
  }
}
