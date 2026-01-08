import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhook = await req.json();
    console.log("[WhatsApp Nutrition] Webhook recebido:", JSON.stringify(webhook).slice(0, 500));

    // Ignorar eventos que não são mensagens (o provedor pode enviar formatos diferentes)
    const event = String(webhook.event || "").toLowerCase();
    const isUpsert = event === "messages.upsert" || event === "messages_upsert";
    if (!isUpsert) {
      console.log("[WhatsApp Nutrition] Evento ignorado:", webhook.event);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // Ignorar mensagens enviadas por nós
    if (webhook.data?.key?.fromMe) {
      console.log("[WhatsApp Nutrition] Mensagem própria ignorada");
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    // Extrair dados da mensagem (em alguns modos o WhatsApp usa JID "@lid"; nesse caso usamos remoteJidAlt)
    const key = webhook.data?.key || {};
    const jid = key.remoteJidAlt || key.remoteJid || "";

    // Ignorar grupos
    if (jid.includes("@g.us")) {
      console.log("[WhatsApp Nutrition] Mensagem de grupo ignorada:", jid);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    const phone = String(jid)
      .replace("@s.whatsapp.net", "")
      .replace("@lid", "")
      .replace(/\D/g, "");

    const message = webhook.data?.message || {};
    const pushName = webhook.data?.pushName || "Usuário";
    const instanceName = String(webhook.instance || EVOLUTION_INSTANCE || "");

    console.log(`[WhatsApp Nutrition] Mensagem de ${phone} (${pushName})`);
    console.log(`[WhatsApp Nutrition] Instância: ${instanceName || "(vazia)"}`);

    // Encontrar usuário pelo telefone
    const user = await findUserByPhone(phone);
    if (!user) {
      console.log("[WhatsApp Nutrition] Usuário não encontrado para telefone:", phone);
      return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
    }

    console.log(`[WhatsApp Nutrition] Usuário encontrado: ${user.id}`);

    // Verificar se há análise pendente de confirmação ou edição
    const pending = await getPendingConfirmation(user.id);

    // Extrair texto da mensagem
    const messageText = extractText(message);

    // Verificar se há análise expirada (para informar o usuário)
    if (!pending && messageText) {
      const hasExpired = await checkAndClearExpiredPending(user.id, phone);
      if (hasExpired && isConfirmationPositive(messageText)) {
        // Usuário tentou confirmar mas expirou
        return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
      }
    }

    // Verificar se há exame médico pendente
    const pendingMedical = await getPendingMedical(user.id);

    if (pending?.waiting_edit && messageText) {
      // Usuário está editando a lista de alimentos
      console.log("[WhatsApp Nutrition] Processando edição:", messageText);
      await handleEdit(user, pending, messageText, phone);
    } else if (pending?.waiting_confirmation && messageText) {
      // Usuário está respondendo SIM/NÃO/EDITAR
      console.log("[WhatsApp Nutrition] Processando confirmação:", messageText);
      await handleConfirmation(user, pending, messageText, phone);
    } else if (pendingMedical && messageText) {
      // Usuário respondendo sobre exame médico pendente
      console.log("[WhatsApp Nutrition] Processando resposta exame médico:", messageText);
      await handleMedicalResponse(user, pendingMedical, messageText, phone);
    } else if (hasImage(message)) {
      // Nova foto - detectar se é comida ou exame médico
      console.log("[WhatsApp Nutrition] Processando imagem...");
      await processImage(user, phone, message, webhook);
    } else if (messageText) {
      // Texto descrevendo refeição
      console.log("[WhatsApp Nutrition] Processando texto:", messageText);
      await processText(user, phone, messageText);
    }

    return new Response(JSON.stringify({ ok: true }), { headers: corsHeaders });
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: corsHeaders }
    );
  }
});

// =============== FUNÇÕES AUXILIARES ===============

async function findUserByPhone(phone: string): Promise<{ id: string; email: string } | null> {
  // Limpar telefone
  let cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.startsWith("55")) {
    cleanPhone = cleanPhone.substring(2);
  }

  // Buscar na tabela profiles
  const { data, error } = await supabase
    .from("profiles")
    .select("user_id, email, phone")
    .or(`phone.ilike.%${cleanPhone}%,phone.ilike.%${phone}%`)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[WhatsApp Nutrition] Erro ao buscar usuário:", error);
    return null;
  }

  if (data) {
    return { id: data.user_id, email: data.email };
  }

  return null;
}

async function getPendingConfirmation(userId: string): Promise<any | null> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("whatsapp_pending_nutrition")
    .select("*")
    .eq("user_id", userId)
    .eq("is_processed", false)
    .or("waiting_confirmation.eq.true,waiting_edit.eq.true")
    .gt("expires_at", now) // Filtrar expirados
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[WhatsApp Nutrition] Erro ao buscar pendente:", error);
    return null;
  }

  return data;
}

// Verificar e limpar análises expiradas, informando o usuário
async function checkAndClearExpiredPending(userId: string, phone: string): Promise<boolean> {
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

  console.log("[WhatsApp Nutrition] Análise expirada encontrada, notificando usuário");
  
  // Limpar pendentes expirados
  await supabase
    .from("whatsapp_pending_nutrition")
    .delete()
    .eq("user_id", userId)
    .lt("expires_at", new Date().toISOString());

  // Notificar usuário
  await sendWhatsApp(phone, 
    "⏰ Sua análise anterior expirou.\n\n" +
    "📸 Envie a foto novamente para registrar sua refeição!"
  );

  return true;
}

function extractText(message: any): string {
  return (
    message.conversation ||
    message.extendedTextMessage?.text ||
    message.imageMessage?.caption ||
    ""
  ).trim();
}

function hasImage(message: any): boolean {
  return !!message.imageMessage;
}

function isConfirmationPositive(text: string): boolean {
  const positive = ["sim", "s", "yes", "y", "ok", "1", "✅", "confirmo", "confirma", "certo", "isso"];
  return positive.includes(text.toLowerCase().trim());
}

function isConfirmationNegative(text: string): boolean {
  const negative = ["não", "nao", "n", "no", "2", "❌", "errado", "incorreto", "0", "cancelar"];
  return negative.includes(text.toLowerCase().trim());
}

function isConfirmationEdit(text: string): boolean {
  const edit = ["editar", "edit", "3", "✏️", "corrigir", "mudar", "alterar", "edita"];
  return edit.includes(text.toLowerCase().trim());
}

function isEditDone(text: string): boolean {
  const done = ["pronto", "done", "finalizar", "ok", "confirmar", "confirma", "terminar", "terminei"];
  return done.includes(text.toLowerCase().trim());
}

function parseEditCommand(text: string, foods: any[]): { action: string; index?: number; newFood?: { name: string; grams: number } } | null {
  const lower = text.toLowerCase().trim();
  
  // "Trocar 1 por Macarrão 200g" ou "Substituir 2 por Arroz 150g"
  const replaceMatch = lower.match(/(?:trocar|substituir|mudar)\s+(\d+)\s+(?:por|para)\s+(.+)/i);
  if (replaceMatch) {
    const index = parseInt(replaceMatch[1]) - 1;
    const foodPart = replaceMatch[2].trim();
    const gramsMatch = foodPart.match(/(\d+)\s*g?$/);
    const grams = gramsMatch ? parseInt(gramsMatch[1]) : 100;
    const name = foodPart.replace(/\d+\s*g?$/, '').trim() || foodPart;
    if (index >= 0 && index < foods.length) {
      return { action: 'replace', index, newFood: { name, grams } };
    }
  }
  
  // "Remover 2" ou "Tirar 1"
  const removeMatch = lower.match(/(?:remover|tirar|excluir|deletar)\s+(\d+)/i);
  if (removeMatch) {
    const index = parseInt(removeMatch[1]) - 1;
    if (index >= 0 && index < foods.length) {
      return { action: 'remove', index };
    }
  }
  
  // "Adicionar Bife 150g" ou "Incluir Salada 80g"
  const addMatch = lower.match(/(?:adicionar|incluir|acrescentar|add)\s+(.+)/i);
  if (addMatch) {
    const foodPart = addMatch[1].trim();
    const gramsMatch = foodPart.match(/(\d+)\s*g?$/);
    const grams = gramsMatch ? parseInt(gramsMatch[1]) : 100;
    const name = foodPart.replace(/\d+\s*g?$/, '').trim() || foodPart;
    return { action: 'add', newFood: { name, grams } };
  }
  
  return null;
}

function detectMealType(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "cafe_da_manha";
  if (hour >= 10 && hour < 12) return "lanche_manha";
  if (hour >= 12 && hour < 15) return "almoco";
  if (hour >= 15 && hour < 18) return "lanche_tarde";
  if (hour >= 18 && hour < 21) return "jantar";
  return "ceia";
}

function formatMealType(mealType: string): string {
  const types: Record<string, string> = {
    cafe_da_manha: "☕ Café da Manhã",
    lanche_manha: "🍎 Lanche da Manhã",
    almoco: "🍽️ Almoço",
    lanche_tarde: "🥤 Lanche da Tarde",
    jantar: "🌙 Jantar",
    ceia: "🌃 Ceia",
  };
  return types[mealType] || mealType;
}

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.error("[WhatsApp Nutrition] Evolution API não configurada");
    return;
  }

  let formattedPhone = phone.replace(/\D/g, "");
  if (!formattedPhone.startsWith("55")) {
    formattedPhone = "55" + formattedPhone;
  }

  try {
    const response = await fetch(`${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_API_KEY,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
        delay: 1200,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("[WhatsApp Nutrition] Erro ao enviar mensagem:", errorData);
    } else {
      console.log("[WhatsApp Nutrition] Mensagem enviada com sucesso");
    }
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao enviar WhatsApp:", error);
  }
}

async function getDailyTotal(userId: string): Promise<number> {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("nutrition_tracking")
    .select("total_calories")
    .eq("user_id", userId)
    .eq("date", today);

  if (error) {
    console.error("[WhatsApp Nutrition] Erro ao buscar total diário:", error);
    return 0;
  }

  return data?.reduce((sum, item) => sum + (item.total_calories || 0), 0) || 0;
}

// =============== PROCESSAMENTO DE IMAGEM ===============

async function processImage(user: { id: string }, phone: string, message: any, webhook: any): Promise<void> {
  try {
    const contentTypeHint = message?.imageMessage?.mimetype || "image/jpeg";

    const uploadBytesToStorage = async (bytes: Uint8Array, contentType: string): Promise<string | null> => {
      const ext = contentType.includes("png") ? "png" : contentType.includes("webp") ? "webp" : "jpg";
      const fileName = `whatsapp/${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("chat-images")
        .upload(fileName, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), { contentType, upsert: true });

      if (uploadError) {
        console.error("[WhatsApp Nutrition] Erro no upload:", uploadError);
        return null;
      }

      const { data: urlData } = supabase.storage.from("chat-images").getPublicUrl(fileName);
      return urlData.publicUrl || null;
    };

    const base64ToBytes = (base64: string): Uint8Array => {
      const clean = base64.includes(",") ? base64.split(",")[1] : base64;
      const bin = atob(clean);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes;
    };

    const uploadBase64ToStorage = async (base64: string, contentType: string): Promise<string | null> => {
      const ct = base64.startsWith("data:") ? base64.slice(5, base64.indexOf(";")) : contentType;
      return uploadBytesToStorage(base64ToBytes(base64), ct || contentType);
    };

    // Função para obter base64 via Evolution API - payload COMPLETO
    const tryGetBase64FromEvolution = async (): Promise<string | null> => {
      if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
        console.log("[WhatsApp Nutrition] Evolution API não configurada para getBase64");
        return null;
      }

      // Construir payload COMPLETO conforme esperado pela Evolution API
      const messageKey = webhook.data?.key || {};
      const messageContent = webhook.data?.message || {};
      
      // Log detalhado para debug
      console.log("[WhatsApp Nutrition] Estrutura do webhook.data.key:", JSON.stringify(messageKey));
      console.log("[WhatsApp Nutrition] Estrutura do webhook.data.message (resumo):", JSON.stringify({
        hasImageMessage: !!messageContent.imageMessage,
        hasMimetype: !!messageContent.imageMessage?.mimetype,
        hasMediaKey: !!messageContent.imageMessage?.mediaKey,
        hasDirectPath: !!messageContent.imageMessage?.directPath,
        hasUrl: !!messageContent.imageMessage?.url,
      }));

      const payload = {
        message: {
          key: {
            remoteJid: messageKey.remoteJid,
            fromMe: messageKey.fromMe || false,
            id: messageKey.id, // ID da mensagem é CRUCIAL
          },
          message: messageContent,
        },
        convertToMp4: false,
      };

      console.log("[WhatsApp Nutrition] Payload para getBase64FromMediaMessage:", JSON.stringify(payload).slice(0, 800));

      try {
        const base64Response = await fetch(
          `${EVOLUTION_API_URL}/chat/getBase64FromMediaMessage/${EVOLUTION_INSTANCE}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: EVOLUTION_API_KEY,
            },
            body: JSON.stringify(payload),
          }
        );

        const responseText = await base64Response.text();
        
        if (!base64Response.ok) {
          console.error("[WhatsApp Nutrition] getBase64FromMediaMessage falhou:", base64Response.status, responseText);
          return null;
        }

        try {
          const responseData = JSON.parse(responseText);
          const base64 = responseData?.base64 || responseData?.data?.base64 || responseData?.media || null;
          
          if (base64) {
            console.log("[WhatsApp Nutrition] Base64 obtido via Evolution API (tamanho:", base64.length, ")");
            return base64;
          } else {
            console.log("[WhatsApp Nutrition] Resposta da Evolution não contém base64:", JSON.stringify(responseData).slice(0, 300));
            return null;
          }
        } catch (parseError) {
          console.error("[WhatsApp Nutrition] Erro ao parsear resposta:", parseError, responseText.slice(0, 200));
          return null;
        }
      } catch (e) {
        console.error("[WhatsApp Nutrition] Erro no getBase64FromMediaMessage:", e);
        return null;
      }
    };

    // Função para download via directPath (fallback)
    const tryDownloadViaDirectPath = async (): Promise<string | null> => {
      const imageMessage = message?.imageMessage || {};
      const directPath = imageMessage.directPath;
      const mediaKey = imageMessage.mediaKey;
      
      if (!directPath) {
        console.log("[WhatsApp Nutrition] Sem directPath disponível");
        return null;
      }

      console.log("[WhatsApp Nutrition] Tentando download via directPath:", directPath);

      // O directPath precisa ser decodificado com a mediaKey pelo servidor do WhatsApp
      // A Evolution API deve ter um endpoint para isso
      if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) return null;

      try {
        // Tentar via endpoint downloadMediaMessage (alguns provedores têm isso)
        const downloadResponse = await fetch(
          `${EVOLUTION_API_URL}/chat/downloadMediaMessage/${EVOLUTION_INSTANCE}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: EVOLUTION_API_KEY,
            },
            body: JSON.stringify({
              message: {
                key: webhook.data?.key,
                message: webhook.data?.message,
              },
            }),
          }
        );

        if (!downloadResponse.ok) {
          console.log("[WhatsApp Nutrition] downloadMediaMessage não disponível:", downloadResponse.status);
          return null;
        }

        const data = await downloadResponse.json();
        return data?.base64 || data?.media || null;
      } catch (e) {
        console.log("[WhatsApp Nutrition] Erro no downloadMediaMessage:", e);
        return null;
      }
    };

    const uploadFromUrlToStorage = async (url: string, contentType: string): Promise<string | null> => {
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.error("[WhatsApp Nutrition] Falha ao baixar mídia:", res.status, await res.text());
          return null;
        }
        const ct = res.headers.get("content-type") || contentType;
        const bytes = new Uint8Array(await res.arrayBuffer());
        return uploadBytesToStorage(bytes, ct);
      } catch (e) {
        console.error("[WhatsApp Nutrition] Erro ao baixar mídia:", e);
        return null;
      }
    };

    let imageUrl: string | null = null;

    // Log da estrutura completa para debug
    console.log("[WhatsApp Nutrition] === INÍCIO PROCESSAMENTO DE IMAGEM ===");
    console.log("[WhatsApp Nutrition] webhook.data?.key:", JSON.stringify(webhook.data?.key));
    console.log("[WhatsApp Nutrition] Campos imageMessage disponíveis:", Object.keys(message?.imageMessage || {}));

    // 1) Base64 direto do webhook (se configurado "Base64: true" na Evolution)
    const directBase64 =
      webhook?.data?.message?.imageMessage?.base64 ??
      webhook?.data?.message?.base64 ??
      message?.imageMessage?.base64 ??
      message?.base64;

    if (directBase64) {
      console.log("[WhatsApp Nutrition] ✅ Base64 encontrado direto no webhook (tamanho:", directBase64.length, ")");
      imageUrl = await uploadBase64ToStorage(directBase64, contentTypeHint);
    }

    // 2) Buscar base64 via Evolution getBase64FromMediaMessage
    if (!imageUrl) {
      console.log("[WhatsApp Nutrition] Tentativa 2: getBase64FromMediaMessage...");
      const evoBase64 = await tryGetBase64FromEvolution();
      if (evoBase64) {
        console.log("[WhatsApp Nutrition] ✅ Base64 obtido via getBase64FromMediaMessage");
        imageUrl = await uploadBase64ToStorage(evoBase64, contentTypeHint);
      }
    }

    // 3) Tentar download via directPath
    if (!imageUrl) {
      console.log("[WhatsApp Nutrition] Tentativa 3: downloadMediaMessage via directPath...");
      const directPathBase64 = await tryDownloadViaDirectPath();
      if (directPathBase64) {
        console.log("[WhatsApp Nutrition] ✅ Base64 obtido via directPath");
        imageUrl = await uploadBase64ToStorage(directPathBase64, contentTypeHint);
      }
    }

    // 4) Último fallback: baixar URL direta (raramente funciona com WhatsApp)
    if (!imageUrl) {
      const mediaUrl = message?.imageMessage?.mediaUrl || message?.imageMessage?.url;
      if (mediaUrl) {
        console.log("[WhatsApp Nutrition] Tentativa 4: download direto da URL:", mediaUrl.slice(0, 100));
        imageUrl = await uploadFromUrlToStorage(mediaUrl, contentTypeHint);
      }
    }

    console.log("[WhatsApp Nutrition] === FIM TENTATIVAS ===");

    if (!imageUrl) {
      console.error("[WhatsApp Nutrition] ❌ FALHA: Não foi possível obter a imagem por nenhum método");
      console.error("[WhatsApp Nutrition] Dica: Verifique se 'Base64: true' está ativo nas configurações do webhook da Evolution API");
      await sendWhatsApp(phone, "❌ Não consegui processar sua foto. Tente enviar novamente!");
      return;
    }

    console.log("[WhatsApp Nutrition] ✅ Upload concluído! URL:", imageUrl);

    // Chamar sofia-image-analysis
    const { data: analysis, error: analysisError } = await supabase.functions.invoke("sofia-image-analysis", {
      body: {
        imageUrl,
        userId: user.id,
        userContext: { currentMeal: detectMealType() },
      },
    });

    if (analysisError || !analysis) {
      console.error("[WhatsApp Nutrition] Erro na análise:", analysisError);
      await sendWhatsApp(phone, "❌ Erro ao analisar sua foto. Tente novamente!");
      return;
    }

    console.log("[WhatsApp Nutrition] Análise completa:", JSON.stringify(analysis).slice(0, 500));

    // Formatar lista de alimentos (normalizando formatos diferentes da resposta)
    const normalizedFoods =
      analysis?.detectedFoods ??
      analysis?.foods ??
      analysis?.foods_detected ??
      analysis?.sofia_analysis?.foods_detected ??
      analysis?.sofia_analysis?.foods ??
      [];

    const detectedFoods = Array.isArray(normalizedFoods) ? normalizedFoods : [];

    if (detectedFoods.length === 0) {
      await sendWhatsApp(phone, "🤔 Não consegui identificar alimentos na foto. Tente enviar uma foto mais clara do prato!");
      return;
    }

    const foodsList = detectedFoods
      .map((f: any) => {
        const name = f.nome || f.name || f.alimento || "(alimento)";
        const grams = f.quantidade ?? f.grams ?? f.g ?? "?";
        return `• ${name} (${grams}g)`;
      })
      .join("\n");

    const totalCalories =
      analysis?.totalCalories ??
      analysis?.total_kcal ??
      analysis?.nutrition_data?.total_kcal ??
      analysis?.sofia_analysis?.totalCalories ??
      analysis?.sofia_analysis?.total_kcal ??
      analysis?.sofia_analysis?.nutrition_data?.total_kcal ??
      0;

    const kcalLine = totalCalories && Number(totalCalories) > 0
      ? `📊 *Total estimado: ~${Math.round(Number(totalCalories))} kcal*\n\n`
      : "";

    const confirmMessage =
      `🍽️ *Analisei sua refeição!*\n\n` +
      `${foodsList}\n\n` +
      kcalLine +
      `Está correto? Responda:\n` +
      `✅ *1* ou *SIM* - Confirmar\n` +
      `❌ *2* ou *NÃO* - Cancelar\n` +
      `✏️ *3* ou *EDITAR* - Corrigir itens`;

    await sendWhatsApp(phone, confirmMessage);

    // Salvar análise pendente (sempre salva em formato estável para a confirmação)
    const pendingPayload = {
      detectedFoods,
      totalCalories: Number(totalCalories) || null,
      raw: analysis,
    };

    // Limpar pendentes antigos antes de inserir novo
    await supabase
      .from("whatsapp_pending_nutrition")
      .delete()
      .eq("user_id", user.id)
      .eq("waiting_confirmation", true);

    const { error: insertError } = await supabase.from("whatsapp_pending_nutrition").insert({
      user_id: user.id,
      phone: phone,
      meal_type: detectMealType(),
      image_url: imageUrl,
      analysis_result: pendingPayload,
      waiting_confirmation: true,
      waiting_edit: false,
      confirmed: null,
      is_processed: false,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas
    });

    if (insertError) {
      console.error("[WhatsApp Nutrition] Erro ao salvar pendente:", insertError);
    }
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao processar imagem:", error);
    await sendWhatsApp(phone, "❌ Ocorreu um erro. Tente novamente!");
  }
}
// =============== PROCESSAMENTO DE TEXTO ===============

async function processText(user: { id: string }, phone: string, text: string): Promise<void> {
  try {
    // Verificar se é uma descrição de refeição (contém palavras-chave de alimentos)
    const foodKeywords = ["comi", "almocei", "jantei", "tomei", "bebi", "arroz", "feijão", "carne", "frango", "salada", "pão", "café", "leite", "ovo", "fruta", "suco", "vitamina"];
    const isFood = foodKeywords.some((k) => text.toLowerCase().includes(k));

    if (!isFood) {
      // Usar IA inteligente para responder qualquer mensagem
      console.log("[WhatsApp Nutrition] Usando IA inteligente para responder:", text);
      await handleSmartResponse(user, phone, text);
      return;
    }

    // Chamar sofia-deterministic para extrair alimentos do texto
    const { data: analysis, error: analysisError } = await supabase.functions.invoke("sofia-deterministic", {
      body: {
        user_input: text,
        user_id: user.id,
        analysis_type: "text_extraction",
      },
    });

    if (analysisError || !analysis) {
      console.error("[WhatsApp Nutrition] Erro na análise de texto:", analysisError);
      // Tentar resposta inteligente mesmo assim
      await handleSmartResponse(user, phone, text);
      return;
    }

    const foods = analysis.detected_foods || analysis.foods || [];
    if (foods.length === 0) {
      // Pode ser uma mensagem sobre nutrição mas sem alimentos específicos
      await handleSmartResponse(user, phone, text);
      return;
    }

    const foodsList = foods
      .map((f: any) => `• ${f.name || f.nome} (${f.grams || f.quantidade || "?"}g)`)
      .join("\n");

    const totalCalories = analysis.nutrition_data?.total_kcal || analysis.total_kcal || 0;

    const confirmMessage = 
      `🍽️ *Entendi! Você comeu:*\n\n` +
      `${foodsList}\n\n` +
      `📊 *Total estimado: ~${Math.round(totalCalories)} kcal*\n\n` +
      `Está correto? Responda:\n` +
      `✅ *1* ou *SIM* - Confirmar\n` +
      `❌ *2* ou *NÃO* - Cancelar\n` +
      `✏️ *3* ou *EDITAR* - Corrigir itens`;

    await sendWhatsApp(phone, confirmMessage);

    // Limpar pendentes antigos antes de inserir novo
    await supabase
      .from("whatsapp_pending_nutrition")
      .delete()
      .eq("user_id", user.id)
      .eq("waiting_confirmation", true);

    await supabase.from("whatsapp_pending_nutrition").insert({
      user_id: user.id,
      phone: phone,
      meal_type: detectMealType(),
      analysis_result: { detectedFoods: foods, totalCalories },
      waiting_confirmation: true,
      waiting_edit: false,
      confirmed: null,
      is_processed: false,
      expires_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 horas
    });

  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao processar texto:", error);
    // Tentar resposta inteligente em caso de erro
    try {
      await handleSmartResponse(user, phone, text);
    } catch {}
  }
}

// =============== RESPOSTA INTELIGENTE COM IA ===============

async function handleSmartResponse(user: { id: string }, phone: string, text: string): Promise<void> {
  try {
    console.log("[WhatsApp Nutrition] Chamando IA inteligente...");
    
    // Chamar a edge function de IA
    const { data: aiResponse, error } = await supabase.functions.invoke("whatsapp-ai-assistant", {
      body: {
        userId: user.id,
        message: text,
        conversationHistory: [],
      },
    });

    if (error) {
      console.error("[WhatsApp Nutrition] Erro na IA:", error);
      await sendWhatsApp(phone, 
        "🤔 Hmm, não entendi muito bem. Pode reformular?\n\n" +
        "💡 *Dica:* Envie uma foto da sua refeição ou me conte o que comeu!"
      );
      return;
    }

    const responseText = aiResponse?.response || "Estou aqui para ajudar! 💚";
    
    // Adicionar assinatura baseada na personalidade
    const personality = aiResponse?.personality || 'sofia';
    const signature = personality === 'drvital' 
      ? "\n\n_Dr. Vital 🩺_"
      : "\n\n_Sofia 🥗_";
    
    await sendWhatsApp(phone, responseText + signature);
    
    console.log("[WhatsApp Nutrition] Resposta IA enviada:", responseText.slice(0, 100));

  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro na resposta inteligente:", error);
    await sendWhatsApp(phone, 
      "Oi! 👋 Estou aqui para ajudar com sua nutrição!\n\n" +
      "📸 Envie uma foto da refeição\n" +
      "✍️ Ou descreva o que comeu"
    );
  }
}

// =============== INTERPRETAÇÃO DE INTENÇÃO COM IA ===============

async function interpretUserIntent(text: string, context: string, pendingFoods?: any[]): Promise<any> {
  try {
    const { data, error } = await supabase.functions.invoke("interpret-user-intent", {
      body: {
        text,
        context,
        pendingFoods: pendingFoods || []
      }
    });

    if (error || !data) {
      console.log("[WhatsApp Nutrition] Erro na interpretação IA, usando fallback");
      return fallbackIntentInterpretation(text);
    }

    console.log("[WhatsApp Nutrition] Intenção IA:", data.intent, "confiança:", data.confidence);
    return data;

  } catch (e) {
    console.error("[WhatsApp Nutrition] Erro ao chamar interpret-user-intent:", e);
    return fallbackIntentInterpretation(text);
  }
}

// Fallback simples para quando a IA falhar
function fallbackIntentInterpretation(text: string): any {
  const lower = text.toLowerCase().trim();
  
  if (isConfirmationPositive(lower)) return { intent: "confirm", confidence: 0.8, details: {} };
  if (isConfirmationNegative(lower)) return { intent: "cancel", confidence: 0.8, details: {} };
  if (isConfirmationEdit(lower)) return { intent: "edit", confidence: 0.8, details: {} };
  if (isEditDone(lower)) return { intent: "confirm", confidence: 0.8, details: {} };
  
  return { intent: "unknown", confidence: 0, details: {} };
}

// =============== PROCESSAMENTO DE CONFIRMAÇÃO ===============

async function handleConfirmation(
  user: { id: string },
  pending: any,
  messageText: string,
  phone: string
): Promise<void> {
  try {
    // Extrair alimentos pendentes para contexto
    const analysis = pending.analysis_result || {};
    const pendingFoods = analysis.detectedFoods || analysis.foods || analysis.foods_detected || [];
    
    // Usar IA para interpretar a intenção do usuário
    const intent = await interpretUserIntent(messageText, "awaiting_confirmation", pendingFoods);
    
    console.log("[WhatsApp Nutrition] Intenção interpretada:", intent.intent);
    
    // Processar baseado na intenção
    if (intent.intent === "confirm") {
      console.log("[WhatsApp Nutrition] Confirmação positiva recebida");

      // Extrair alimentos da análise pendente (formato estável)
      const analysis = pending.analysis_result || {};
      const detectedFoods =
        analysis.detectedFoods ||
        analysis.foods ||
        analysis.foods_detected ||
        analysis.raw?.sofia_analysis?.foods_detected ||
        analysis.raw?.foods_detected ||
        analysis.raw?.detectedFoods ||
        analysis.raw?.foods ||
        [];

      // Chamar sofia-deterministic para cálculo exato
      const { data: deterministicResult, error: deterministicError } = await supabase.functions.invoke(
        "sofia-deterministic",
        {
          body: {
            detected_foods: detectedFoods.map((f: any) => ({
              name: f.nome || f.name,
              grams: f.quantidade || f.grams || 100,
            })),
            user_id: user.id,
            analysis_type: "nutritional_sum",
          },
        }
      );

      if (deterministicError) {
        console.error("[WhatsApp Nutrition] Erro no cálculo:", deterministicError);
      }

      const nutritionData = deterministicResult?.nutrition_data || {
        total_kcal: analysis.totalCalories || analysis.total_kcal || 0,
        total_proteina: 0,
        total_carbo: 0,
        total_gordura: 0,
      };

      // Salvar em nutrition_tracking
      const today = new Date().toISOString().split("T")[0];
      const { data: tracking, error: trackingError } = await supabase
        .from("nutrition_tracking")
        .insert({
          user_id: user.id,
          date: today,
          meal_type: pending.meal_type || detectMealType(),
          total_calories: nutritionData.total_kcal || 0,
          total_proteins: nutritionData.total_proteina || 0,
          total_carbs: nutritionData.total_carbo || 0,
          total_fats: nutritionData.total_gordura || 0,
          total_fiber: nutritionData.total_fibra || 0,
          food_items: detectedFoods,
          photo_url: pending.image_url,
          notes: "Registrado via WhatsApp",
        })
        .select()
        .single();

      if (trackingError) {
        console.error("[WhatsApp Nutrition] Erro ao salvar tracking:", trackingError);
        await sendWhatsApp(phone, "❌ Erro ao registrar. Tente novamente!");
        return;
      }

      // Atualizar pendente como processado
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({
          waiting_confirmation: false,
          confirmed: true,
          is_processed: true,
          nutrition_tracking_id: tracking?.id,
        })
        .eq("id", pending.id);

      // Buscar total do dia
      const dailyTotal = await getDailyTotal(user.id);

      // Responder com sucesso
      const successMessage =
        `✅ *Refeição registrada!*\n\n` +
        `${formatMealType(pending.meal_type || detectMealType())}: ${Math.round(nutritionData.total_kcal)} kcal\n` +
        `📊 Total do dia: ${Math.round(dailyTotal)} kcal\n\n` +
        `Continue assim! 💪`;

      await sendWhatsApp(phone, successMessage);

    } else if (intent.intent === "edit") {
      console.log("[WhatsApp Nutrition] Modo edição ativado");

      // Marcar como em edição
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ waiting_edit: true })
        .eq("id", pending.id);

      // Montar lista numerada
      const numberedList = pendingFoods
        .map((f: any, i: number) => {
          const name = f.nome || f.name || f.alimento || "(alimento)";
          const grams = f.quantidade ?? f.grams ?? f.g ?? "?";
          return `${i + 1}. ${name} (${grams}g)`;
        })
        .join("\n");

      await sendWhatsApp(
        phone,
        `✏️ *Modo edição*\n\n` +
        `Itens detectados:\n${numberedList}\n\n` +
        `Agora você pode me dizer naturalmente:\n` +
        `• "Adiciona uma banana"\n` +
        `• "Tira o arroz"\n` +
        `• "Na verdade era macarrão, não arroz"\n\n` +
        `Ou use comandos:\n` +
        `• "Trocar 1 por Macarrão 200g"\n` +
        `• "Remover 2"\n\n` +
        `Responda *PRONTO* quando terminar`
      );

    } else if (intent.intent === "add_food" && intent.details?.newFood) {
      // Usuário quer adicionar alimento diretamente (sem entrar em modo edição)
      console.log("[WhatsApp Nutrition] Adicionando alimento via intent:", intent.details.newFood);
      
      const newFood = {
        nome: intent.details.newFood.name,
        quantidade: intent.details.newFood.grams || 100,
        name: intent.details.newFood.name,
        grams: intent.details.newFood.grams || 100
      };
      
      const updatedFoods = [...pendingFoods, newFood];
      const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
      
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ analysis_result: updatedAnalysis })
        .eq("id", pending.id);
      
      const foodsList = updatedFoods
        .map((f: any) => {
          const name = f.nome || f.name || "(alimento)";
          const grams = f.quantidade ?? f.grams ?? "?";
          return `• ${name} (${grams}g)`;
        })
        .join("\n");
      
      await sendWhatsApp(
        phone,
        `✅ *Adicionado!*\n\n` +
        `Lista atualizada:\n${foodsList}\n\n` +
        `Confirmar registro?\n` +
        `✅ *SIM* para confirmar\n` +
        `❌ *NÃO* para cancelar\n` +
        `✏️ *EDITAR* para mais alterações`
      );

    } else if (intent.intent === "remove_food") {
      // Usuário quer remover alimento diretamente
      console.log("[WhatsApp Nutrition] Removendo alimento via intent:", intent.details);
      
      let updatedFoods = [...pendingFoods];
      
      if (intent.details?.foodIndex !== undefined && intent.details.foodIndex >= 0 && intent.details.foodIndex < updatedFoods.length) {
        updatedFoods.splice(intent.details.foodIndex, 1);
      } else if (intent.details?.newFood?.name) {
        // Remover por nome
        const nameToRemove = intent.details.newFood.name.toLowerCase();
        updatedFoods = updatedFoods.filter((f: any) => {
          const foodName = (f.nome || f.name || "").toLowerCase();
          return !foodName.includes(nameToRemove);
        });
      }
      
      const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
      
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ analysis_result: updatedAnalysis })
        .eq("id", pending.id);
      
      const foodsList = updatedFoods
        .map((f: any) => {
          const name = f.nome || f.name || "(alimento)";
          const grams = f.quantidade ?? f.grams ?? "?";
          return `• ${name} (${grams}g)`;
        })
        .join("\n");
      
      await sendWhatsApp(
        phone,
        `✅ *Removido!*\n\n` +
        `Lista atualizada:\n${foodsList || "(lista vazia)"}\n\n` +
        `Confirmar registro?\n` +
        `✅ *SIM* para confirmar\n` +
        `❌ *NÃO* para cancelar\n` +
        `✏️ *EDITAR* para mais alterações`
      );

    } else if (intent.intent === "replace_food" && intent.details?.newFood) {
      // Usuário quer substituir alimento diretamente
      console.log("[WhatsApp Nutrition] Substituindo alimento via intent:", intent.details);
      
      let updatedFoods = [...pendingFoods];
      const indexToReplace = intent.details.foodIndex ?? 0; // Se não especificou, assume o primeiro
      
      if (indexToReplace >= 0 && indexToReplace < updatedFoods.length) {
        updatedFoods[indexToReplace] = {
          nome: intent.details.newFood.name,
          quantidade: intent.details.newFood.grams || 100,
          name: intent.details.newFood.name,
          grams: intent.details.newFood.grams || 100
        };
      }
      
      const updatedAnalysis = { ...analysis, detectedFoods: updatedFoods };
      
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({ analysis_result: updatedAnalysis })
        .eq("id", pending.id);
      
      const foodsList = updatedFoods
        .map((f: any) => {
          const name = f.nome || f.name || "(alimento)";
          const grams = f.quantidade ?? f.grams ?? "?";
          return `• ${name} (${grams}g)`;
        })
        .join("\n");
      
      await sendWhatsApp(
        phone,
        `✅ *Substituído!*\n\n` +
        `Lista atualizada:\n${foodsList}\n\n` +
        `Confirmar registro?\n` +
        `✅ *SIM* para confirmar\n` +
        `❌ *NÃO* para cancelar\n` +
        `✏️ *EDITAR* para mais alterações`
      );

    } else if (intent.intent === "cancel") {
      console.log("[WhatsApp Nutrition] Confirmação negativa recebida");

      // Limpar pendente
      await supabase
        .from("whatsapp_pending_nutrition")
        .update({
          waiting_confirmation: false,
          confirmed: false,
        })
        .eq("id", pending.id);

      // Pedir correção
      await sendWhatsApp(
        phone,
        `Sem problemas! 📝\n\n` +
        `Me conta o que estava errado:\n` +
        `📸 Manda outra foto\n` +
        `✍️ Ou descreve o que comeu`
      );
    } else {
      // Resposta não reconhecida
      await sendWhatsApp(
        phone,
        `🤔 Não entendi sua resposta.\n\n` +
        `Você pode me dizer naturalmente:\n` +
        `• "Beleza, pode salvar"\n` +
        `• "Faltou uma banana"\n` +
        `• "Tira o arroz"\n\n` +
        `Ou responda:\n` +
        `*SIM* - Confirmar\n` +
        `*NÃO* - Cancelar\n` +
        `*EDITAR* - Corrigir itens`
      );
    }
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao processar confirmação:", error);
    await sendWhatsApp(phone, "❌ Ocorreu um erro. Tente novamente!");
  }
}

// =============== PROCESSAMENTO DE EDIÇÃO ===============

async function handleEdit(
  user: { id: string },
  pending: any,
  messageText: string,
  phone: string
): Promise<void> {
  try {
    const analysis = pending.analysis_result || {};
    let detectedFoods = [
      ...(analysis.detectedFoods ||
        analysis.foods ||
        analysis.foods_detected ||
        [])
    ];

    // Usar IA para interpretar a intenção do usuário
    const intent = await interpretUserIntent(messageText, "editing_food_list", detectedFoods);
    
    console.log("[WhatsApp Nutrition] Intenção no modo edição:", intent.intent);

    // Verificar se usuário terminou edição
    if (intent.intent === "confirm" || isEditDone(messageText)) {
      console.log("[WhatsApp Nutrition] Edição finalizada, solicitando confirmação");

      // Atualizar análise com alimentos editados
      const updatedAnalysis = {
        ...analysis,
        detectedFoods,
      };

      await supabase
        .from("whatsapp_pending_nutrition")
        .update({
          waiting_edit: false,
          analysis_result: updatedAnalysis,
        })
        .eq("id", pending.id);

      // Mostrar lista final e pedir confirmação
      const foodsList = detectedFoods
        .map((f: any) => {
          const name = f.nome || f.name || f.alimento || "(alimento)";
          const grams = f.quantidade ?? f.grams ?? f.g ?? "?";
          return `• ${name} (${grams}g)`;
        })
        .join("\n");

      await sendWhatsApp(
        phone,
        `🍽️ *Lista final:*\n\n` +
        `${foodsList}\n\n` +
        `Confirmar registro?\n` +
        `✅ *SIM* para confirmar\n` +
        `❌ *NÃO* para cancelar`
      );
      return;
    }

    // Processar baseado na intenção da IA
    let actionTaken = false;
    
    if (intent.intent === "add_food" && intent.details?.newFood) {
      detectedFoods.push({
        nome: intent.details.newFood.name,
        name: intent.details.newFood.name,
        quantidade: intent.details.newFood.grams || 100,
        grams: intent.details.newFood.grams || 100,
      });
      console.log(`[WhatsApp Nutrition] Adicionado via IA:`, intent.details.newFood);
      actionTaken = true;
      
    } else if (intent.intent === "remove_food") {
      if (intent.details?.foodIndex !== undefined && intent.details.foodIndex >= 0 && intent.details.foodIndex < detectedFoods.length) {
        const removed = detectedFoods.splice(intent.details.foodIndex, 1);
        console.log(`[WhatsApp Nutrition] Removido item ${intent.details.foodIndex + 1}:`, removed);
        actionTaken = true;
      } else if (intent.details?.newFood?.name) {
        // Remover por nome
        const nameToRemove = intent.details.newFood.name.toLowerCase();
        const originalLength = detectedFoods.length;
        detectedFoods = detectedFoods.filter((f: any) => {
          const foodName = (f.nome || f.name || "").toLowerCase();
          return !foodName.includes(nameToRemove);
        });
        if (detectedFoods.length < originalLength) {
          console.log(`[WhatsApp Nutrition] Removido por nome:`, nameToRemove);
          actionTaken = true;
        }
      }
      
    } else if (intent.intent === "replace_food" && intent.details?.newFood) {
      const indexToReplace = intent.details.foodIndex ?? 0;
      if (indexToReplace >= 0 && indexToReplace < detectedFoods.length) {
        const oldFood = detectedFoods[indexToReplace];
        detectedFoods[indexToReplace] = {
          nome: intent.details.newFood.name,
          name: intent.details.newFood.name,
          quantidade: intent.details.newFood.grams || 100,
          grams: intent.details.newFood.grams || 100,
        };
        console.log(`[WhatsApp Nutrition] Substituído item ${indexToReplace + 1}:`, oldFood, "->", intent.details.newFood);
        actionTaken = true;
      }
    }
    
    // Se a IA não conseguiu, tentar o parser antigo como fallback
    if (!actionTaken) {
      const command = parseEditCommand(messageText, detectedFoods);
      
      if (command) {
        if (command.action === 'replace' && command.index !== undefined && command.newFood) {
          const oldFood = detectedFoods[command.index];
          detectedFoods[command.index] = {
            nome: command.newFood.name,
            name: command.newFood.name,
            quantidade: command.newFood.grams,
            grams: command.newFood.grams,
          };
          console.log(`[WhatsApp Nutrition] Substituído item ${command.index + 1} (fallback):`, oldFood, "->", command.newFood);
          actionTaken = true;

        } else if (command.action === 'remove' && command.index !== undefined) {
          const removed = detectedFoods.splice(command.index, 1);
          console.log(`[WhatsApp Nutrition] Removido item ${command.index + 1} (fallback):`, removed);
          actionTaken = true;

        } else if (command.action === 'add' && command.newFood) {
          detectedFoods.push({
            nome: command.newFood.name,
            name: command.newFood.name,
            quantidade: command.newFood.grams,
            grams: command.newFood.grams,
          });
          console.log(`[WhatsApp Nutrition] Adicionado (fallback):`, command.newFood);
          actionTaken = true;
        }
      }
    }
    
    if (!actionTaken) {
      await sendWhatsApp(
        phone,
        `🤔 Não entendi.\n\n` +
        `Você pode dizer naturalmente:\n` +
        `• "Adiciona uma maçã"\n` +
        `• "Tira o arroz"\n` +
        `• "Era macarrão, não arroz"\n\n` +
        `Ou use comandos:\n` +
        `• "Adicionar Bife 150g"\n` +
        `• "Remover 2"\n\n` +
        `Responda *PRONTO* para finalizar`
      );
      return;
    }

    // Atualizar análise no banco
    const updatedAnalysis = {
      ...analysis,
      detectedFoods,
    };

    await supabase
      .from("whatsapp_pending_nutrition")
      .update({ analysis_result: updatedAnalysis })
      .eq("id", pending.id);

    // Mostrar lista atualizada
    const numberedList = detectedFoods
      .map((f: any, i: number) => {
        const name = f.nome || f.name || f.alimento || "(alimento)";
        const grams = f.quantidade ?? f.grams ?? f.g ?? "?";
        return `${i + 1}. ${name} (${grams}g)`;
      })
      .join("\n");

    await sendWhatsApp(
      phone,
      `✅ *Atualizado!*\n\n` +
      `${numberedList}\n\n` +
      `Continue editando ou responda *PRONTO*`
    );

  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao processar edição:", error);
    await sendWhatsApp(phone, "❌ Erro na edição. Tente novamente!");
  }
}

// =============== FUNÇÕES PARA EXAMES MÉDICOS ===============

async function getPendingMedical(userId: string): Promise<any | null> {
  const now = new Date().toISOString();
  
  const { data, error } = await supabase
    .from("whatsapp_pending_medical")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "awaiting_info")
    .gt("expires_at", now)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[WhatsApp Nutrition] Erro ao buscar exame pendente:", error);
    return null;
  }

  return data;
}

async function detectImageType(imageBase64: string): Promise<'food' | 'medical' | 'other'> {
  try {
    // Usar Gemini via Lovable AI para classificar a imagem
    const { data, error } = await supabase.functions.invoke("sofia-image-analysis", {
      body: {
        imageBase64,
        analysisType: "classify",
        prompt: "Classifique esta imagem em UMA destas categorias: COMIDA (alimentos, refeição, prato), EXAME_MEDICO (exame de sangue, raio-x, ultrassom, resultado laboratorial), ou OUTRO. Responda apenas: COMIDA, EXAME_MEDICO ou OUTRO"
      },
    });

    if (error || !data) {
      console.log("[WhatsApp Nutrition] Erro na classificação, assumindo comida");
      return 'food';
    }

    const response = String(data.classification || data.response || data.text || '').toUpperCase();
    
    if (response.includes('EXAME') || response.includes('MEDICAL')) {
      return 'medical';
    }
    if (response.includes('COMIDA') || response.includes('FOOD') || response.includes('ALIMENTO')) {
      return 'food';
    }
    
    return 'other';
  } catch (e) {
    console.error("[WhatsApp Nutrition] Erro ao detectar tipo de imagem:", e);
    return 'food'; // Default para comida
  }
}

async function handleMedicalResponse(
  user: { id: string },
  pending: any,
  messageText: string,
  phone: string
): Promise<void> {
  try {
    const text = messageText.toLowerCase().trim();
    
    // Detectar tipo de exame mencionado
    const examTypes: Record<string, string[]> = {
      'sangue': ['sangue', 'hemograma', 'glicose', 'colesterol', 'triglicerides', 'creatinina', 'ureia'],
      'urina': ['urina', 'eas', 'urinocultura'],
      'fezes': ['fezes', 'parasitologico', 'coprocultura'],
      'imagem': ['raio-x', 'rx', 'ultrassom', 'ultrassonografia', 'tomografia', 'ressonancia'],
      'hormonal': ['hormonio', 'tsh', 't4', 'tireoide', 'testosterona', 'estradiol'],
    };

    let detectedType = 'laboratorial';
    for (const [type, keywords] of Object.entries(examTypes)) {
      if (keywords.some(k => text.includes(k))) {
        detectedType = type;
        break;
      }
    }

    // Detectar data mencionada
    let examDate = new Date().toISOString().split('T')[0];
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/, // DD/MM ou DD/MM/YYYY
      /ontem/i,
      /hoje/i,
      /semana passada/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        if (text.includes('ontem')) {
          const d = new Date();
          d.setDate(d.getDate() - 1);
          examDate = d.toISOString().split('T')[0];
        } else if (text.includes('semana passada')) {
          const d = new Date();
          d.setDate(d.getDate() - 7);
          examDate = d.toISOString().split('T')[0];
        } else if (match[1] && match[2]) {
          const day = parseInt(match[1]);
          const month = parseInt(match[2]) - 1;
          const year = match[3] ? parseInt(match[3]) : new Date().getFullYear();
          const d = new Date(year < 100 ? 2000 + year : year, month, day);
          examDate = d.toISOString().split('T')[0];
        }
        break;
      }
    }

    // Se usuário respondeu "analisar" ou similar, processar direto
    const quickProcess = ['analisar', 'analisa', 'processar', 'ok', 'vai', 'pode'];
    const shouldProcessNow = quickProcess.some(k => text.includes(k));

    if (shouldProcessNow || pending.exam_type) {
      // Processar o exame
      console.log("[WhatsApp Nutrition] Processando exame médico:", detectedType);
      
      await supabase
        .from("whatsapp_pending_medical")
        .update({
          exam_type: pending.exam_type || detectedType,
          exam_date: examDate,
          status: "processing",
        })
        .eq("id", pending.id);

      // Chamar o handler de exames médicos
      await supabase.functions.invoke("whatsapp-medical-handler", {
        body: {
          action: "process_exam",
          pendingId: pending.id,
          userId: user.id,
          phone,
          imageBase64: pending.image_base64,
          examType: pending.exam_type || detectedType,
          examDate,
          doctorName: pending.doctor_name,
        },
      });
    } else {
      // Atualizar informações e perguntar mais
      await supabase
        .from("whatsapp_pending_medical")
        .update({
          exam_type: detectedType,
          exam_date: examDate,
        })
        .eq("id", pending.id);

      await sendWhatsApp(phone,
        `🩺 *Entendi!*\n\n` +
        `📋 Exame de: *${detectedType}*\n` +
        `📅 Data: *${formatDateBR(examDate)}*\n\n` +
        `Está correto? Responda:\n` +
        `✅ *ANALISAR* - Processar agora\n` +
        `✏️ Ou corrija as informações`
      );
    }
  } catch (error) {
    console.error("[WhatsApp Nutrition] Erro ao processar resposta médica:", error);
    await sendWhatsApp(phone, "❌ Erro ao processar. Tente enviar o exame novamente!");
  }
}

function formatDateBR(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

async function createMedicalPending(
  userId: string,
  phone: string,
  imageBase64: string
): Promise<void> {
  // Limpar pendentes antigos
  await supabase
    .from("whatsapp_pending_medical")
    .delete()
    .eq("user_id", userId)
    .eq("status", "awaiting_info");

  // Criar novo pendente
  await supabase.from("whatsapp_pending_medical").insert({
    user_id: userId,
    phone,
    image_base64: imageBase64,
    status: "awaiting_info",
    expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hora
  });

  // Enviar mensagem do Dr. Vital
  await sendWhatsApp(phone,
    `🩺 *Dr. Vital aqui!*\n\n` +
    `Recebi uma imagem do que parece ser um *exame médico*.\n\n` +
    `📋 Para uma análise completa, me conta:\n` +
    `1️⃣ Que tipo de exame é esse?\n` +
    `2️⃣ Quando você realizou?\n\n` +
    `_Ou responda *"analisar"* para eu processar direto!_`
  );
}
