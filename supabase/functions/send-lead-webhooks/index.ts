import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const webhookSecret = Deno.env.get('WEBHOOK_SECRET_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar webhooks pendentes ou com falha (max 5 tentativas)
    const { data: pendingWebhooks, error: fetchError } = await supabase
      .from('webhook_queue')
      .select('*')
      .in('status', ['pending', 'failed'])
      .lt('attempts', 5)
      .order('created_at', { ascending: true })
      .limit(50);

    if (fetchError) {
      console.error('Erro ao buscar webhooks:', fetchError);
      throw fetchError;
    }

    if (!pendingWebhooks || pendingWebhooks.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'Nenhum webhook pendente', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📤 Processando ${pendingWebhooks.length} webhooks...`);

    let successCount = 0;
    let failCount = 0;

    for (const webhook of pendingWebhooks) {
      try {
        const targetUrl = webhook.destination_url;
        
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-webhook-secret': webhookSecret,
            'x-source': 'mission-health-nexus',
          },
          body: JSON.stringify(webhook.payload),
        });

        if (response.ok) {
          // Sucesso - atualizar status
          await supabase
            .from('webhook_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
              last_error: null,
            })
            .eq('id', webhook.id);

          console.log(`✅ Webhook ${webhook.id} enviado com sucesso`);
          successCount++;
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (sendError) {
        // Falha - incrementar attempts e registrar erro
        const errorMessage = sendError instanceof Error ? sendError.message : 'Erro desconhecido';
        
        await supabase
          .from('webhook_queue')
          .update({
            status: 'failed',
            attempts: (webhook.attempts || 0) + 1,
            last_error: errorMessage,
          })
          .eq('id', webhook.id);

        console.error(`❌ Webhook ${webhook.id} falhou:`, errorMessage);
        failCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processamento concluído`,
        sent: successCount,
        failed: failCount,
        total: pendingWebhooks.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no send-lead-webhooks:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
