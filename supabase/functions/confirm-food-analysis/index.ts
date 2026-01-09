import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { corsHeaders } from "../_shared/utils/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { analysis_id, confirmed, corrections } = await req.json();

    if (!analysis_id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'ID da análise é obrigatório'
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    console.log(`📋 Confirmando análise ${analysis_id}, confirmed: ${confirmed}`);

    // Buscar análise atual
    const { data: analysis, error: fetchError } = await supabase
      .from('sofia_food_analysis')
      .select('*')
      .eq('id', analysis_id)
      .single();

    if (fetchError || !analysis) {
      console.error('❌ Análise não encontrada:', fetchError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Análise não encontrada'
      }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Se confirmado, atualizar status e deletar imagem
    if (confirmed) {
      // Atualizar registro com confirmação
      const updateData: Record<string, unknown> = {
        confirmed_by_user: true,
        confirmation_status: 'confirmed',
        image_deleted: false // Será true após deletar
      };

      // Se houver correções, atualizar os alimentos
      if (corrections && Array.isArray(corrections)) {
        updateData.foods_detected = corrections;
      }

      const { error: updateError } = await supabase
        .from('sofia_food_analysis')
        .update(updateData)
        .eq('id', analysis_id);

      if (updateError) {
        console.error('❌ Erro ao atualizar análise:', updateError);
      }

      // Deletar imagem do storage se existir
      const imageUrl = analysis.image_url || analysis.food_image_url;
      if (imageUrl && imageUrl.includes('chat-images')) {
        try {
          // Extrair path da imagem do URL
          const urlParts = imageUrl.split('/chat-images/');
          if (urlParts.length > 1) {
            const imagePath = decodeURIComponent(urlParts[1].split('?')[0]);
            console.log(`🗑️ Deletando imagem: ${imagePath}`);

            const { error: deleteError } = await supabase.storage
              .from('chat-images')
              .remove([imagePath]);

            if (deleteError) {
              console.error('⚠️ Erro ao deletar imagem:', deleteError);
            } else {
              console.log('✅ Imagem deletada com sucesso');
              
              // Atualizar registro indicando que imagem foi deletada
              await supabase
                .from('sofia_food_analysis')
                .update({
                  image_deleted: true,
                  image_deleted_at: new Date().toISOString(),
                  image_url: null,
                  food_image_url: null
                })
                .eq('id', analysis_id);
            }
          }
        } catch (storageError) {
          console.error('⚠️ Erro ao processar deleção:', storageError);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Refeição confirmada! Os dados foram salvos permanentemente.',
        analysis_id,
        image_deleted: true
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } else {
      // Não confirmado - marcar como rejeitado mas manter dados
      await supabase
        .from('sofia_food_analysis')
        .update({
          confirmed_by_user: false,
          confirmation_status: 'rejected'
        })
        .eq('id', analysis_id);

      return new Response(JSON.stringify({
        success: true,
        message: 'Análise marcada para correção.',
        analysis_id
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    console.error('❌ Erro:', error);
    const err = error as Error;
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
