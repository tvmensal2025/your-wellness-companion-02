import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_CLOUD_API_KEY = Deno.env.get('GOOGLE_CLOUD_API_KEY');
    
    if (!GOOGLE_CLOUD_API_KEY) {
      console.error('❌ GOOGLE_CLOUD_API_KEY não configurada');
      return new Response(
        JSON.stringify({ error: 'Google Cloud API key não configurada', extractedText: '' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { image, features } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Imagem é obrigatória', extractedText: '' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔍 Iniciando OCR com Google Vision API...');

    // Extrair base64 da imagem (remover data URL prefix se existir)
    let imageBase64 = image;
    if (image.includes('base64,')) {
      imageBase64 = image.split('base64,')[1];
    }

    // Chamar Google Cloud Vision API
    const visionUrl = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_CLOUD_API_KEY}`;
    
    const requestBody = {
      requests: [{
        image: {
          content: imageBase64
        },
        features: (features || ['TEXT_DETECTION', 'DOCUMENT_TEXT_DETECTION']).map((f: string) => ({
          type: f,
          maxResults: 50
        }))
      }]
    };

    const visionResponse = await fetch(visionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('❌ Google Vision API error:', visionResponse.status, errorText);
      return new Response(
        JSON.stringify({ 
          error: `Google Vision API error: ${visionResponse.status}`, 
          extractedText: '',
          details: errorText 
        }),
        { status: visionResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const visionData = await visionResponse.json();
    
    // Extrair texto da resposta
    let extractedText = '';
    
    if (visionData.responses && visionData.responses[0]) {
      const response = visionData.responses[0];
      
      // Preferir DOCUMENT_TEXT_DETECTION (fullTextAnnotation) se disponível
      if (response.fullTextAnnotation?.text) {
        extractedText = response.fullTextAnnotation.text;
        console.log('✅ Texto extraído via fullTextAnnotation');
      } 
      // Fallback para TEXT_DETECTION
      else if (response.textAnnotations && response.textAnnotations.length > 0) {
        extractedText = response.textAnnotations[0].description || '';
        console.log('✅ Texto extraído via textAnnotations');
      }
      
      // Verificar se houve erro
      if (response.error) {
        console.error('❌ Vision API response error:', response.error);
        return new Response(
          JSON.stringify({ 
            error: response.error.message || 'Vision API error', 
            extractedText: '' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`✅ OCR concluído. Caracteres extraídos: ${extractedText.length}`);
    console.log('📄 Prévia:', extractedText.substring(0, 300) + '...');

    return new Response(
      JSON.stringify({ 
        extractedText,
        success: true,
        charCount: extractedText.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro no vision-api:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        extractedText: ''
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
