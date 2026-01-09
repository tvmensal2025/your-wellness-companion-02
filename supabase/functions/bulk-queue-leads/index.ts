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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar todos os profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) throw profilesError;

    // Buscar destinos ativos
    const { data: destinations, error: destError } = await supabase
      .from('webhook_destinations')
      .select('*')
      .eq('is_active', true);

    if (destError) throw destError;

    if (!destinations?.length) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Nenhum destino de webhook ativo encontrado'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!profiles?.length) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Nenhum profile encontrado'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let queued = 0;

    // Para cada profile, criar webhook na fila para cada destino
    for (const profile of profiles) {
      const leadPayload = {
        event: 'lead.created',
        event_type: 'new_user',
        timestamp: new Date().toISOString(),
        source: 'mission-health-nexus',
        webhook_id: crypto.randomUUID(),
        bulk_sync: true,

        contact: {
          id: profile.user_id,
          email: profile.email,
          phone: profile.phone,
          full_name: profile.full_name,
          first_name: profile.full_name?.split(' ')[0] || '',
          last_name: profile.full_name?.split(' ').slice(1).join(' ') || null,
        },

        location: {
          city: profile.city,
          state: profile.state,
          country: 'BR',
        },

        profile: {
          gender: profile.gender,
          birth_date: profile.birth_date,
          age: profile.birth_date 
            ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
            : null,
        },

        health_data: {
          height_cm: profile.height,
          current_weight_kg: profile.current_weight,
          target_weight_kg: profile.target_weight,
          activity_level: profile.activity_level,
          fitness_level: profile.fitness_level,
        },

        engagement: {
          points: profile.points || 0,
          registered_at: profile.created_at,
          last_activity: profile.updated_at,
        },

        meta: {
          raw_event: 'bulk_sync',
          table_name: 'profiles',
        },
      };

      for (const dest of destinations) {
        // Verificar se o destino aceita o evento
        if (!dest.events?.includes('new_user')) continue;

        const { error: insertError } = await supabase
          .from('webhook_queue')
          .insert({
            event_type: 'new_user',
            user_id: profile.user_id,
            payload: leadPayload,
            destination_url: dest.url,
            destination_id: dest.id,
            headers_sent: dest.headers,
          });

        if (!insertError) queued++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      queued,
      profiles_count: profiles.length,
      destinations_count: destinations.length,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Erro ao enfileirar leads:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
