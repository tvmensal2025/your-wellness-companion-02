import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import { UserInfo } from "../services/user-service.ts";
import { PendingMedical, cleanupStuckMedicalBatches } from "../services/pending-service.ts";
import { sendWhatsApp } from "../utils/whatsapp-sender.ts";
import { 
  sendInteractiveMessage, 
  sendMedicalAnalysisPrompt,
  sendTextMessage,
} from "../utils/whatsapp-interactive-sender.ts";
import { 
  isConfirmationPositive, 
  isConfirmationNegative,
  isMedicalReady,
  isMedicalCancel,
  isMedicalAddMore,
} from "../utils/message-utils.ts";

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
          await sendTextMessage(
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
          
          // Send interactive buttons for medical confirmation
          await sendMedicalAnalysisPrompt(phone, newCount);
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
        await sendInteractiveMessage(phone, {
          headerText: '🩺 Recebi sua foto de exame!',
          bodyText: '📸 Continue enviando mais fotos se tiver.\n⏳ Assim que você parar de enviar, perguntarei se posso analisar.',
          footerText: 'Dr. Vital 🩺',
          buttons: [
            { id: 'vital_analyze', title: '✅ Analisar agora' },
            { id: 'vital_more', title: '📸 Enviar mais' },
          ],
        });
        
        return;
      }
    }

    console.error("[Medical] ❌ Todas as tentativas falharam");
    throw new Error("Falha ao processar imagem após múltiplas tentativas");
  } catch (error) {
    console.error("[Medical] 💥 ERRO CRÍTICO:", error);
    await sendInteractiveMessage(phone, {
      headerText: '❌ Erro ao receber exame',
      bodyText: 'Por favor, tente novamente.',
      footerText: 'Dr. Vital 🩺',
      buttons: [
        { id: 'sofia_new_photo', title: '📸 Tentar novamente' },
        { id: 'help', title: '❓ Ajuda' },
      ],
    });
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

    // 🔥 FLEXIBLE PATTERN MATCHING - Usar funções inteligentes
    
    // CANCELAR - prioridade alta
    if (isMedicalCancel(lower)) {
      console.log("[Medical] ❌ CANCELAR detectado:", lower);
      await supabase
        .from("whatsapp_pending_medical")
        .update({ status: "cancelled", is_processed: true })
        .eq("id", pending.id);

      await sendInteractiveMessage(phone, {
        headerText: '❌ Análise cancelada',
        bodyText: 'Se precisar, envie novas fotos!',
        footerText: 'Dr. Vital 🩺',
        buttons: [
          { id: 'sofia_new_photo', title: '📸 Nova Foto' },
          { id: 'help', title: '❓ Ajuda' },
        ],
      });
      return;
    }

    // MAIS FOTOS
    if (isMedicalAddMore(lower)) {
      console.log("[Medical] 📸 MAIS detectado:", lower);
      if (status === "processing" || status === "awaiting_confirm" || status === "collecting") {
        await supabase
          .from("whatsapp_pending_medical")
          .update({
            status: "collecting",
            waiting_confirmation: false,
            confirmed: false,
          })
          .eq("id", pending.id);

        await sendTextMessage(
          phone,
          `📸 Ok! Continue enviando as fotos do exame.\n\n` +
            `Você já tem *${imagesCount} ${imagesCount === 1 ? "foto" : "fotos"}*.\n\n` +
            `Quando terminar, me avise ou digite *PRONTO*!\n\n` +
            `_Dr. Vital 🩺_`
        );
        return;
      }
    }

    // PRONTO / FINALIZAR - usar função flexível
    if (isMedicalReady(lower)) {
      if (status === "collecting" || status === "awaiting_confirm") {
        console.log("[Medical] ✅ PRONTO detectado (flexível):", lower);

        const estimatedMinutes = Math.max(1, Math.ceil(imagesCount * 0.3));
        const timeText = estimatedMinutes <= 1 ? "menos de 1 minuto" : `até ${estimatedMinutes} minutos`;

        await sendTextMessage(
          phone,
          `🩺 *Analisando ${imagesCount} ${imagesCount === 1 ? "imagem" : "imagens"}...*\n\n` +
            `⏳ *Tempo estimado: ${timeText}*\n\n` +
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

    // NOTE: As verificações de awaiting_confirm foram movidas para cima usando isMedicalReady/isMedicalCancel/isMedicalAddMore

    // If collecting and not PRONTO, remind user with gentle message
    if (status === "collecting") {
      await sendInteractiveMessage(phone, {
        bodyText: `📋 Ainda tenho ${imagesCount} ${imagesCount === 1 ? "foto" : "fotos"} do seu exame aguardando análise.\n\nQuando estiver pronto, é só me avisar! 😊`,
        footerText: 'Dr. Vital 🩺',
        buttons: [
          { id: 'vital_analyze', title: '✅ Analisar agora' },
          { id: 'vital_more', title: '📸 Enviar mais' },
          { id: 'vital_cancel', title: '❌ Cancelar' },
        ],
      });
      return;
    }

    // If awaiting_confirm but didn't understand
    if (status === "awaiting_confirm") {
      await sendMedicalAnalysisPrompt(phone, imagesCount);
      return;
    }

    // Fallback
    if (isConfirmationPositive(messageText)) {
      await supabase
        .from("whatsapp_pending_medical")
        .update({ is_processed: true, confirmed: true })
        .eq("id", pending.id);
      await sendTextMessage(phone, "✅ Exame registrado!\n\n_Dr. Vital 🩺_");
    } else if (isConfirmationNegative(messageText)) {
      await supabase
        .from("whatsapp_pending_medical")
        .update({ is_processed: true, confirmed: false })
        .eq("id", pending.id);
      await sendTextMessage(phone, "❌ Exame não registrado.\n\n_Dr. Vital 🩺_");
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
      await sendTextMessage(phone, "❌ Nenhuma imagem encontrada para análise.\n\n_Dr. Vital 🩺_");
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
      await sendTextMessage(phone, "❌ Erro ao processar imagens.\n\nTente enviar novamente.\n\n_Dr. Vital 🩺_");
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
      await sendInteractiveMessage(phone, {
        headerText: '❌ Erro na análise',
        bodyText: 'Não consegui analisar seu exame.\n\nTente enviar fotos mais claras.',
        footerText: 'Dr. Vital 🩺',
        buttons: [
          { id: 'sofia_new_photo', title: '📸 Tentar novamente' },
          { id: 'help', title: '❓ Ajuda' },
        ],
      });
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
          const siteUrl = Deno.env.get("SITE_URL") || "https://app.oficialmaxnutrition.com.br";
          reportLink = `\n\n📊 *Relatório completo:*\n👉 ${siteUrl}/relatorio/${publicLinkToken}`;
        }
      } catch (e) {
        console.log("[Medical] ⚠️ Erro ao criar link público:", e);
      }
    }

    // Send result with text first
    await sendTextMessage(
      phone,
      `🩺 *Análise Concluída!*\n` +
        `📷 _${imagesCount} ${imagesCount === 1 ? "imagem analisada" : "imagens analisadas"}_\n\n` +
        `${summary}${findingsText}${reportLink}`
    );
    
    // Then send interactive buttons for next actions
    await sendInteractiveMessage(phone, {
      bodyText: 'Qualquer dúvida, estou aqui!',
      footerText: 'Dr. Vital 🩺',
      buttons: [
        { id: 'vital_question', title: '❓ Perguntar' },
        { id: 'sofia_new_photo', title: '📸 Novo Exame' },
      ],
    });

    // Mark as completed - update à prova de falhas
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

    const { error: updateError } = await supabase
      .from("whatsapp_pending_medical")
      .update(updateData)
      .eq("id", pending.id);

    // Se falhar, tentar update mínimo para não ficar stuck
    if (updateError) {
      console.error("[Medical] ⚠️ Erro no update completo, tentando fallback:", updateError);
      await supabase
        .from("whatsapp_pending_medical")
        .update({
          status: "completed",
          is_processed: true,
          confirmed: true,
          medical_document_id: documentId,
          public_link_token: publicLinkToken || null
        })
        .eq("id", pending.id);
    }

    console.log("[Medical] ✅ FLUXO COMPLETO - Análise finalizada com sucesso!");
    console.log("[Medical] ========================================");
  } catch (error) {
    console.error("[Medical] 💥 ERRO CRÍTICO em analyzeExamBatch:", error);

    await supabase
      .from("whatsapp_pending_medical")
      .update({ status: "error", is_processed: true })
      .eq("id", pending.id);

    await sendInteractiveMessage(phone, {
      headerText: '❌ Erro ao analisar',
      bodyText: 'Por favor, envie as fotos novamente.',
      footerText: 'Dr. Vital 🩺',
      buttons: [
        { id: 'sofia_new_photo', title: '📸 Tentar novamente' },
        { id: 'help', title: '❓ Ajuda' },
      ],
    });
  }
}
