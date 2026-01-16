import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, pendingId, userId, phone, imageBase64, examType, examDate, doctorName } = await req.json();

    console.log("[whatsapp-medical-handler] Ação:", action);

    switch (action) {
      case "process_exam":
        return await processExam(pendingId, userId, phone, imageBase64, examType, examDate, doctorName);
      
      case "check_pending":
        return await checkPending(userId);
      
      default:
        return new Response(
          JSON.stringify({ error: "Ação não reconhecida" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
  } catch (error: any) {
    console.error("[whatsapp-medical-handler] Erro:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function processExam(
  pendingId: string,
  userId: string,
  phone: string,
  imageBase64: string,
  examType: string,
  examDate: string,
  doctorName?: string
): Promise<Response> {
  console.log("[whatsapp-medical-handler] Processando exame para usuário:", userId);

  try {
    // 1. Enviar mensagem de processamento
    await sendWhatsApp(phone, 
      "🔬 *Analisando seu exame...*\n\n" +
      "Isso pode levar alguns segundos. Aguarde!"
    );

    // 2. Upload da imagem para MinIO via media-upload Edge Function
    console.log("[whatsapp-medical-handler] Enviando imagem para MinIO...");
    
    const { data: uploadData, error: uploadError } = await supabase.functions.invoke(
      "media-upload",
      {
        body: {
          data: imageBase64,
          folder: "medical-exams",
          userId,
          mimeType: "image/jpeg",
        },
      }
    );

    if (uploadError || !uploadData?.success) {
      console.error("[whatsapp-medical-handler] Erro no upload:", uploadError || uploadData);
      throw new Error("Erro ao salvar imagem no MinIO");
    }

    const imageUrl = uploadData.url;
    console.log("[whatsapp-medical-handler] Imagem salva no MinIO:", imageUrl);

    // 3. Criar registro na tabela medical_documents
    const { data: docData, error: docError } = await supabase
      .from("medical_documents")
      .insert({
        user_id: userId,
        document_type: "exam",
        exam_type: examType,
        exam_date: examDate || new Date().toISOString().split("T")[0],
        doctor_name: doctorName,
        image_url: imageUrl,
        analysis_status: "processing",
        source: "whatsapp",
      })
      .select()
      .single();

    if (docError) {
      console.error("[whatsapp-medical-handler] Erro ao criar documento:", docError);
      throw new Error("Erro ao registrar exame");
    }

    console.log("[whatsapp-medical-handler] Documento criado:", docData.id);

    // 4. Chamar analyze-medical-exam
    const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
      "analyze-medical-exam",
      {
        body: {
          imageBase64,
          documentId: docData.id,
          userId,
          examType,
        },
      }
    );

    if (analysisError) {
      console.error("[whatsapp-medical-handler] Erro na análise:", analysisError);
      // Continuar mesmo com erro - vamos gerar relatório básico
    }

    console.log("[whatsapp-medical-handler] Análise concluída");

    // 5. Gerar relatório
    const { data: reportData, error: reportError } = await supabase.functions.invoke(
      "generate-medical-report",
      {
        body: {
          documentId: docData.id,
          userId,
          visitData: {
            logoUrl: "https://ciszqtlaacrhfwsqnvjr.supabase.co/storage/v1/object/public/site-assets/logo.png",
            patient: await getPatientInfo(userId),
            visit: { date: examDate || new Date().toISOString().split("T")[0] },
            examsCurrent: analysisData?.exams || [],
          },
        },
      }
    );

    if (reportError) {
      console.error("[whatsapp-medical-handler] Erro ao gerar relatório:", reportError);
      throw new Error("Erro ao gerar relatório");
    }

    console.log("[whatsapp-medical-handler] Relatório gerado:", reportData?.report_path);

    // 6. Criar link público permanente
    const appUrl = Deno.env.get("SITE_URL") || "https://app.oficialmaxnutrition.com.br";
    
    const { data: linkData, error: linkError } = await supabase
      .from("public_report_links")
      .insert({
        user_id: userId,
        medical_document_id: docData.id,
        report_path: reportData.report_path,
        title: `Exame de ${examType || "Sangue"}`,
        exam_type: examType,
        exam_date: examDate,
      })
      .select()
      .single();

    if (linkError) {
      console.error("[whatsapp-medical-handler] Erro ao criar link:", linkError);
      throw new Error("Erro ao criar link do relatório");
    }

    const publicUrl = `${appUrl}/relatorio/${linkData.token}`;
    console.log("[whatsapp-medical-handler] Link público criado:", publicUrl);

    // 7. Atualizar pendente como processado
    if (pendingId) {
      await supabase
        .from("whatsapp_pending_medical")
        .update({
          status: "completed",
          medical_document_id: docData.id,
          public_link_token: linkData.token,
        })
        .eq("id", pendingId);
    }

    // 8. Gerar resumo para WhatsApp
    const summary = generateSummary(reportData?.report);

    // 9. Enviar resultado no WhatsApp
    await sendWhatsApp(phone,
      "🩺 *Análise Concluída!*\n\n" +
      `📋 *Exame:* ${examType || "Laboratorial"}\n` +
      `📅 *Data:* ${formatDate(examDate)}\n\n` +
      "📊 *Resumo Rápido:*\n" +
      summary + "\n\n" +
      "🔗 *Veja o relatório completo:*\n" +
      publicUrl + "\n\n" +
      "_O link é permanente e funciona em qualquer dispositivo._"
    );

    return new Response(
      JSON.stringify({
        success: true,
        documentId: docData.id,
        publicUrl,
        token: linkData.token,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[whatsapp-medical-handler] Erro no processamento:", error);

    // Notificar usuário do erro
    await sendWhatsApp(phone,
      "❌ *Ops! Houve um problema.*\n\n" +
      "Não consegui processar seu exame. Tente novamente ou acesse a plataforma para fazer o upload.\n\n" +
      "_Se o problema persistir, entre em contato conosco._"
    );

    throw error;
  }
}

async function checkPending(userId: string): Promise<Response> {
  const { data, error } = await supabase
    .from("whatsapp_pending_medical")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "awaiting_info")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return new Response(
    JSON.stringify({ pending: data }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}

async function getPatientInfo(userId: string): Promise<any> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("user_id", userId)
    .maybeSingle();

  const { data: fisica } = await supabase
    .from("dados_físicos_do_usuário")
    .select("sexo, data_nascimento")
    .eq("user_id", userId)
    .maybeSingle();

  const birthDate = fisica?.data_nascimento ? new Date(fisica.data_nascimento) : null;
  const age = birthDate ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

  return {
    name: profile?.name || "Paciente",
    sex: fisica?.sexo === "M" ? "Masculino" : fisica?.sexo === "F" ? "Feminino" : "Outro",
    birth: fisica?.data_nascimento || "",
    age,
  };
}

function generateSummary(report: any): string {
  if (!report?.summary_bullets || !Array.isArray(report.summary_bullets)) {
    return "• Análise processada com sucesso";
  }

  return report.summary_bullets
    .slice(0, 4)
    .map((bullet: string) => `• ${bullet}`)
    .join("\n");
}

function formatDate(date: string | null): string {
  if (!date) return new Date().toLocaleDateString("pt-BR");
  
  try {
    return new Date(date).toLocaleDateString("pt-BR");
  } catch {
    return date;
  }
}

function base64ToBytes(base64: string): Uint8Array {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function sendWhatsApp(phone: string, message: string): Promise<void> {
  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY || !EVOLUTION_INSTANCE) {
    console.log("[whatsapp-medical-handler] Evolution API não configurada");
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
      console.error("[whatsapp-medical-handler] Erro ao enviar:", errorData);
    }
  } catch (error) {
    console.error("[whatsapp-medical-handler] Erro WhatsApp:", error);
  }
}
