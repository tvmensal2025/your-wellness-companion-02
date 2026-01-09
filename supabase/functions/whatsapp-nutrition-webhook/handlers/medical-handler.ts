import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { UserInfo } from "../services/user-service.ts";
import { PendingMedical, cleanupStuckMedicalBatches } from "../services/pending-service.ts";
import { sendWhatsApp } from "../utils/whatsapp-sender.ts";
import { isConfirmationPositive, isConfirmationNegative } from "../utils/message-utils.ts";

const MAX_RETRIES = 5;

/**
 * Process medical exam image - add to batch
 */
export async function processMedicalImage(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  imageUrl: string
): Promise<void> {
  try {
    console.log("[Medical] ========================================");
    console.log("[Medical] 🔥 MODO LOTE: Recebendo imagem de exame para", user.id);

    // Cleanup stuck batches
    await cleanupStuckMedicalBatches(supabase, user.id);

    const now = new Date().toISOString();
    const newImageEntry = { url: imageUrl, created_at: now };

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      // Find active batch
      const { data: existingBatch, error: fetchError } = await supabase
        .from("whatsapp_pending_medical")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_processed", false)
        .in("status", ["collecting", "awaiting_confirm"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error("[Medical] ❌ Erro ao buscar lote:", fetchError);
        throw fetchError;
      }

      if (existingBatch) {
        // Add to existing batch with optimistic lock
        const currentUrls = existingBatch.image_urls || [];
        const updatedUrls = [...currentUrls, newImageEntry];
        const newCount = updatedUrls.length;

        console.log(
          `[Medical] 🔄 Tentativa ${attempt + 1}: Adicionando imagem ao lote ${existingBatch.id}`
        );

        const { data: updateResult, error: updateError } = await supabase
          .from("whatsapp_pending_medical")
          .update({
            image_urls: updatedUrls,
            images_count: newCount,
            last_image_at: now,
            status: "collecting",
            waiting_confirmation: false,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // Renew +1 hour
          })
          .eq("id", existingBatch.id)
          .eq("images_count", existingBatch.images_count)
          .select();

        if (updateError) {
          console.error(`[Medical] ❌ Erro no update (tentativa ${attempt + 1}):`, updateError);
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
            continue;
          }
          throw updateError;
        }

        if (!updateResult || updateResult.length === 0) {
          console.log(`[Medical] 🔄 Conflito de lock otimista, retry ${attempt + 1}/${MAX_RETRIES}`);
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
            continue;
          }
          continue;
        }

        console.log(`[Medical] ✅ Imagem ${newCount} adicionada ao lote ${existingBatch.id}`);
        
        // Feedback every 5 images
        if (newCount % 5 === 0) {
          await sendWhatsApp(
            phone,
            `📸 *${newCount} fotos recebidas!*\n\n` +
            `Continue enviando ou aguarde...\n\n` +
            `_Dr. Vital 🩺_`
          );
        }
        
        // 🔥 AUTO-DETECT: Wait 8s and check if more images arrived
        console.log(`[Medical] ⏳ Aguardando 8s para detectar fim do envio...`);
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        // Re-fetch batch to check if count changed
        const { data: refreshedBatch } = await supabase
          .from("whatsapp_pending_medical")
          .select("images_count, status")
          .eq("id", existingBatch.id)
          .single();
        
        // If no new images arrived in 8s and still collecting, ask to analyze
        if (refreshedBatch && refreshedBatch.images_count === newCount && refreshedBatch.status === "collecting") {
          console.log(`[Medical] 🔔 Nenhuma nova imagem em 8s, perguntando se pode analisar...`);
          
          await supabase
            .from("whatsapp_pending_medical")
            .update({
              status: "awaiting_confirm",
              waiting_confirmation: true,
            })
            .eq("id", existingBatch.id);
          
          await sendWhatsApp(
            phone,
            `📋 *${newCount} ${newCount === 1 ? "imagem recebida" : "imagens recebidas"}*\n\n` +
            `*Posso analisar agora?*\n\n` +
            `1️⃣ *SIM*, pode analisar\n` +
            `2️⃣ *NÃO*, vou enviar mais\n` +
            `3️⃣ *CANCELAR*\n\n` +
            `_Dr. Vital 🩺_`
          );
        } else {
          console.log(`[Medical] 📸 Mais imagens chegaram ou status mudou, continuando...`);
        }
        
        console.log("[Medical] ========================================");
        return;
      } else {
        // Create new batch
        console.log("[Medical] 📁 Criando novo lote de exames...");

        const { data: insertResult, error: insertError } = await supabase
          .from("whatsapp_pending_medical")
          .insert({
            user_id: user.id,
            phone: phone,
            image_url: imageUrl,
            image_urls: [newImageEntry],
            images_count: 1,
            last_image_at: now,
            status: "collecting",
            waiting_confirmation: false,
            confirmed: null,
            is_processed: false,
            expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
            created_at: now,
          })
          .select();

        if (insertError) {
          console.log(`[Medical] ⚠️ Erro ao criar lote: ${insertError.message}`);
          if (attempt < MAX_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, 100 * (attempt + 1)));
            continue;
          }
          throw insertError;
        }

        console.log("[Medical] ✅ Novo lote criado:", insertResult?.[0]?.id);
        console.log("[Medical] ========================================");
        
        // 🔥 ENVIAR ACK IMEDIATO NA PRIMEIRA FOTO
        await sendWhatsApp(
          phone,
          `🩺 *Recebi sua foto de exame!*\n\n` +
          `📸 Continue enviando mais fotos se tiver.\n` +
          `⏳ Assim que você parar de enviar, perguntarei se posso analisar.\n\n` +
          `_Dr. Vital 🩺_`
        );
        
        return;
      }
    }

    console.error("[Medical] ❌ Todas as tentativas falharam");
    throw new Error("Falha ao processar imagem após múltiplas tentativas");
  } catch (error) {
    console.error("[Medical] 💥 ERRO CRÍTICO:", error);
    await sendWhatsApp(
      phone,
      "❌ Ocorreu um erro ao receber seu exame.\n\n" +
        "Por favor, tente novamente.\n\n" +
        "_Dr. Vital 🩺_"
    );
  }
}

/**
 * Handle medical exam batch response
 */
export async function handleMedicalResponse(
  supabase: SupabaseClient,
  user: UserInfo,
  pending: PendingMedical,
  messageText: string,
  phone: string
): Promise<void> {
  try {
    const lower = messageText.toLowerCase().trim();
    const status = pending.status || "collecting";
    const imageUrls = pending.image_urls || [];
    const imagesCount = pending.images_count || imageUrls.length || 1;

    console.log(`[Medical] handleMedicalResponse: status=${status}, msg="${lower}", images=${imagesCount}`);

    // PRONTO - start analysis directly
    if (["pronto", "terminei", "finalizar", "fim", "acabou", "done"].includes(lower)) {
      if (status === "collecting") {
        console.log("[Medical] ✅ PRONTO recebido - iniciando análise DIRETO");

        await sendWhatsApp(
          phone,
          `🩺 *Analisando ${imagesCount} ${imagesCount === 1 ? "imagem" : "imagens"}...*\n\n` +
            `⏳ Isso pode levar alguns segundos.\n\n` +
            `💡 Se quiser enviar mais fotos depois, digite *MAIS*.\n\n` +
            `_Dr. Vital 🩺_`
        );

        await supabase
          .from("whatsapp_pending_medical")
          .update({
            status: "processing",
            waiting_confirmation: false,
            confirmed: true,
          })
          .eq("id", pending.id);

        await analyzeExamBatch(supabase, user, phone, pending);
        return;
      }
    }

    // MAIS - add more photos
    if (["mais", "add", "adicionar", "enviar mais", "more"].includes(lower)) {
      if (status === "processing" || status === "awaiting_confirm") {
        await supabase
          .from("whatsapp_pending_medical")
          .update({
            status: "collecting",
            waiting_confirmation: false,
            confirmed: false,
          })
          .eq("id", pending.id);

        await sendWhatsApp(
          phone,
          `📸 Ok! Continue enviando as fotos do exame.\n\n` +
            `Você já tem *${imagesCount} ${imagesCount === 1 ? "foto" : "fotos"}*.\n\n` +
            `Quando terminar, digite *PRONTO* novamente.\n\n` +
            `_Dr. Vital 🩺_`
        );
        return;
      }
    }

    // Confirm from awaiting_confirm status
    if (
      status === "awaiting_confirm" &&
      (lower === "1" || lower === "sim" || lower === "s" || lower === "yes")
    ) {
      // Estimate time based on image count
      const estimatedMinutes = Math.max(1, Math.ceil(imagesCount * 0.3));
      const timeText = estimatedMinutes <= 1 ? "menos de 1 minuto" : `até ${estimatedMinutes} minutos`;
      const coffeeHint = imagesCount > 10 ? "São várias páginas! Pode aproveitar para tomar um café enquanto analiso. " : "";
      
      await sendWhatsApp(
        phone,
        `🩺 *Iniciando análise de ${imagesCount} ${imagesCount === 1 ? "imagem" : "imagens"}...*\n\n` +
          `⏳ *Tempo estimado: ${timeText}*\n\n` +
          `☕ ${coffeeHint}Aguarde, eu aviso quando terminar!\n\n` +
          `_Dr. Vital 🩺_`
      );

      await supabase
        .from("whatsapp_pending_medical")
        .update({
          status: "processing",
          waiting_confirmation: false,
          confirmed: true,
        })
        .eq("id", pending.id);

      await analyzeExamBatch(supabase, user, phone, pending);
      return;
    }

    // Cancel from awaiting_confirm
    if (
      status === "awaiting_confirm" &&
      (lower === "2" || lower === "nao" || lower === "não" || lower === "n" || lower === "no")
    ) {
      await supabase
        .from("whatsapp_pending_medical")
        .update({
          status: "collecting",
          waiting_confirmation: false,
        })
        .eq("id", pending.id);

      await sendWhatsApp(
        phone,
        `📸 Ok! Continue enviando as fotos.\n\n` +
          `Quando terminar, digite *PRONTO*.\n\n` +
          `_Dr. Vital 🩺_`
      );
      return;
    }

    // Cancel completely
    if (
      status === "awaiting_confirm" &&
      (lower === "3" || lower === "cancelar" || lower === "cancel")
    ) {
      await supabase
        .from("whatsapp_pending_medical")
        .update({ status: "cancelled", is_processed: true })
        .eq("id", pending.id);

      await sendWhatsApp(phone, `❌ Análise cancelada.\n\n_Dr. Vital 🩺_`);
      return;
    }

    // If collecting and not PRONTO, remind user with gentle message
    if (status === "collecting") {
      await sendWhatsApp(
        phone,
        `📋 *Oi! Ainda tenho ${imagesCount} ${imagesCount === 1 ? "foto" : "fotos"} do seu exame aguardando análise.*\n\n` +
        `Quando estiver pronto, é só me avisar ou digitar *PRONTO*! 😊\n\n` +
        `_Dr. Vital 🩺_`
      );
      return;
    }

    // If awaiting_confirm but didn't understand
    if (status === "awaiting_confirm") {
      await sendWhatsApp(
        phone,
        `🤔 Não entendi. Responda:\n\n` +
          `*1* - ✅ SIM, analisar agora\n` +
          `*2* - 📸 NÃO, vou enviar mais\n` +
          `*3* - ❌ CANCELAR\n\n` +
          `_Dr. Vital 🩺_`
      );
      return;
    }

    // Fallback
    if (isConfirmationPositive(messageText)) {
      await supabase
        .from("whatsapp_pending_medical")
        .update({ is_processed: true, confirmed: true })
        .eq("id", pending.id);
      await sendWhatsApp(phone, "✅ Exame registrado!\n\n_Dr. Vital 🩺_");
    } else if (isConfirmationNegative(messageText)) {
      await supabase
        .from("whatsapp_pending_medical")
        .update({ is_processed: true, confirmed: false })
        .eq("id", pending.id);
      await sendWhatsApp(phone, "❌ Exame não registrado.\n\n_Dr. Vital 🩺_");
    }
  } catch (error) {
    console.error("[Medical] Erro no exame médico:", error);
  }
}

/**
 * Analyze exam batch
 */
async function analyzeExamBatch(
  supabase: SupabaseClient,
  user: UserInfo,
  phone: string,
  pending: PendingMedical
): Promise<void> {
  console.log("[Medical] ========================================");
  console.log("[Medical] 🚀 INICIANDO analyzeExamBatch");

  try {
    const imageUrls = pending.image_urls || [];
    const imagesCount = imageUrls.length;

    if (imagesCount === 0) {
      console.error("[Medical] ❌ Nenhuma imagem no lote");
      await sendWhatsApp(phone, "❌ Nenhuma imagem encontrada para análise.\n\n_Dr. Vital 🩺_");
      await supabase
        .from("whatsapp_pending_medical")
        .update({ status: "error", is_processed: true })
        .eq("id", pending.id);
      return;
    }

    // Convert public URLs to storage paths
    const tmpPaths = imageUrls
      .map((img: any) => {
        const url = img.url || img;
        const match = url.match(/\/chat-images\/(.+)$/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    if (tmpPaths.length === 0) {
      console.error("[Medical] ❌ Nenhum path válido extraído das URLs");
      await sendWhatsApp(phone, "❌ Erro ao processar imagens.\n\nTente enviar novamente.\n\n_Dr. Vital 🩺_");
      await supabase
        .from("whatsapp_pending_medical")
        .update({ status: "error", is_processed: true })
        .eq("id", pending.id);
      return;
    }

    console.log("[Medical] 📞 CHAMANDO analyze-medical-exam...");

    const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
      "analyze-medical-exam",
      {
        body: {
          tmpPaths,
          userId: user.id,
          examType: "exame_laboratorial",
          title: `Exame via WhatsApp - ${new Date().toLocaleDateString("pt-BR")}`,
        },
      }
    );

    if (analysisError || !analysisResult || analysisResult.error) {
      console.error("[Medical] 💥 ERRO na análise:", analysisError || analysisResult?.error);
      await sendWhatsApp(
        phone,
        `❌ Não consegui analisar seu exame.\n\nTente enviar fotos mais claras.\n\n_Dr. Vital 🩺_`
      );
      await supabase
        .from("whatsapp_pending_medical")
        .update({ status: "error", is_processed: true })
        .eq("id", pending.id);
      return;
    }

    console.log("[Medical] ✅ Análise concluída com sucesso!");

    const summary = analysisResult?.summary || analysisResult?.message || "Análise concluída com sucesso.";
    const documentId = analysisResult?.documentId || analysisResult?.document_id;
    const findings = analysisResult?.findings || [];
    const reportPath = analysisResult?.reportPath || analysisResult?.report_path;

    // Format findings
    let findingsText = "";
    if (findings.length > 0) {
      findingsText = "\n\n📋 *Principais achados:*\n";
      for (const finding of findings.slice(0, 8)) {
        const status =
          finding.status === "normal" ? "🟢" : finding.status === "attention" ? "🟡" : "🔴";
        findingsText += `${status} ${finding.name || finding.test}: ${finding.value || finding.result}\n`;
      }
    }

    // Create public link
    let reportLink = "";
    let publicLinkToken = "";

    if (reportPath) {
      try {
        const { data: linkData } = await supabase
          .from("public_report_links")
          .insert({
            user_id: user.id,
            medical_document_id: documentId || null,
            report_path: reportPath,
            title: `Exame via WhatsApp - ${new Date().toLocaleDateString("pt-BR")}`,
            exam_type: "exame_laboratorial",
            exam_date: new Date().toISOString().split("T")[0],
          })
          .select("token")
          .single();

        if (linkData?.token) {
          publicLinkToken = linkData.token;
          reportLink = `\n\n📊 *Relatório completo:*\n👉 https://app.maxnutrition.com.br/relatorio/${publicLinkToken}`;
        }
      } catch (e) {
        console.log("[Medical] ⚠️ Erro ao criar link público:", e);
      }
    }

    // Send result
    await sendWhatsApp(
      phone,
      `🩺 *Análise Concluída!*\n` +
        `📷 _${imagesCount} ${imagesCount === 1 ? "imagem analisada" : "imagens analisadas"}_\n\n` +
        `${summary}${findingsText}${reportLink}\n\n` +
        `Qualquer dúvida, estou aqui!\n\n` +
        `_Dr. Vital 🩺_`
    );

    // Mark as completed
    const updateData: any = {
      status: "completed",
      is_processed: true,
      confirmed: true,
      analysis_result: analysisResult,
      medical_document_id: documentId,
    };

    if (publicLinkToken) {
      updateData.public_link_token = publicLinkToken;
    }

    await supabase.from("whatsapp_pending_medical").update(updateData).eq("id", pending.id);

    console.log("[Medical] ✅ FLUXO COMPLETO - Análise finalizada com sucesso!");
    console.log("[Medical] ========================================");
  } catch (error) {
    console.error("[Medical] 💥 ERRO CRÍTICO em analyzeExamBatch:", error);

    await supabase
      .from("whatsapp_pending_medical")
      .update({ status: "error", is_processed: true })
      .eq("id", pending.id);

    await sendWhatsApp(
      phone,
      `❌ Erro ao analisar exames.\n\nPor favor, envie as fotos novamente.\n\n_Dr. Vital 🩺_`
    );
  }
}
