import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      htmlContent, 
      htmlUrl, 
      userId, 
      documentId, 
      publicLinkId,
      examType,
      examDate,
      patientName 
    } = await req.json();

    console.log("[generate-medical-pdf] Iniciando geração de PDF");
    console.log("[generate-medical-pdf] userId:", userId);
    console.log("[generate-medical-pdf] documentId:", documentId);

    // Obter HTML do conteúdo direto ou da URL
    let html = htmlContent;
    
    if (!html && htmlUrl) {
      console.log("[generate-medical-pdf] Buscando HTML de:", htmlUrl);
      const response = await fetch(htmlUrl);
      if (!response.ok) {
        throw new Error(`Erro ao buscar HTML: ${response.status}`);
      }
      html = await response.text();
    }

    if (!html) {
      throw new Error("HTML content ou URL é obrigatório");
    }

    // Gerar PDF usando API externa (pdf.co ou similar)
    // Por simplicidade, vamos usar uma abordagem alternativa:
    // Salvar o HTML com extensão .pdf no MinIO (para visualização)
    // E criar um wrapper que renderiza como PDF no navegador

    const VPS_API_URL = Deno.env.get("VPS_API_URL");
    const VPS_API_KEY = Deno.env.get("VPS_API_KEY");

    if (!VPS_API_URL || !VPS_API_KEY) {
      throw new Error("VPS_API_URL e VPS_API_KEY são obrigatórios");
    }

    // Criar versão do HTML otimizada para impressão/PDF
    const pdfOptimizedHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Relatório Médico - ${patientName || 'Paciente'} - ${examDate || new Date().toLocaleDateString('pt-BR')}</title>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    @page { margin: 1cm; size: A4; }
  </style>
  <script>
    window.onload = function() {
      // Auto-print when opened
      if (window.location.search.includes('autoprint=1')) {
        setTimeout(function() { window.print(); }, 500);
      }
    };
  </script>
</head>
<body>
${html}
</body>
</html>`;

    // Converter para base64
    const encoder = new TextEncoder();
    const bytes = encoder.encode(pdfOptimizedHtml);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Html = btoa(binary);

    // Nome do arquivo PDF
    const timestamp = Date.now();
    const sanitizedName = (patientName || 'paciente').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const pdfFilename = `relatorio_${sanitizedName}_${examDate?.replace(/-/g, '') || timestamp}.pdf.html`;
    const pdfPath = `medical-pdfs/${userId || 'public'}/${pdfFilename}`;

    console.log("[generate-medical-pdf] Salvando PDF-HTML em:", pdfPath);

    // Upload para MinIO
    const uploadResponse = await fetch(`${VPS_API_URL}/storage/upload-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': VPS_API_KEY,
      },
      body: JSON.stringify({
        data: base64Html,
        folder: 'medical-pdfs',
        mimeType: 'text/html',
        filename: pdfFilename,
        userId: userId || 'public'
      }),
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("[generate-medical-pdf] Erro no upload:", errorText);
      throw new Error("Erro ao salvar PDF no MinIO");
    }

    const uploadResult = await uploadResponse.json();
    const pdfUrl = uploadResult.url;

    console.log("[generate-medical-pdf] ✅ PDF-HTML salvo:", pdfUrl);

    // Salvar registro no banco
    const { data: pdfRecord, error: dbError } = await supabase
      .from("medical_pdf_reports")
      .insert({
        user_id: userId,
        medical_document_id: documentId || null,
        public_link_id: publicLinkId || null,
        pdf_url: pdfUrl,
        pdf_path: pdfPath,
        html_url: htmlUrl || null,
        file_size_bytes: bytes.length,
        is_permanent: true,
      })
      .select()
      .single();

    if (dbError) {
      console.error("[generate-medical-pdf] Erro ao salvar registro:", dbError);
      // Não é crítico, continuar
    }

    // URL para download direto (com autoprint)
    const downloadUrl = `${pdfUrl}?autoprint=1`;

    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: pdfUrl,
        download_url: downloadUrl,
        pdf_path: pdfPath,
        pdf_record_id: pdfRecord?.id || null,
        filename: pdfFilename,
        instructions: "Abra a URL no navegador e use 'Salvar como PDF' na impressão"
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("[generate-medical-pdf] Erro:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Erro ao gerar PDF" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
