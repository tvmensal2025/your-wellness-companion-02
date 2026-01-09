import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

interface IncomingLead {
  event?: string;
  event_type?: string;
  contact?: {
    id?: string;
    email?: string;
    phone?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  profile?: {
    gender?: string;
    birth_date?: string;
  };
  health_data?: {
    height_cm?: number;
    current_weight_kg?: number;
    target_weight_kg?: number;
    activity_level?: string;
    fitness_level?: string;
  };
  engagement?: {
    points?: number;
  };
  // Campos alternativos para compatibilidade
  lead?: {
    user_id?: string;
    email?: string;
    phone?: string;
    full_name?: string;
    city?: string;
    state?: string;
    birth_date?: string;
    gender?: string;
  };
  health_profile?: {
    height_cm?: number;
    current_weight_kg?: number;
    target_weight_kg?: number;
    activity_level?: string;
    fitness_level?: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const expectedSecret = Deno.env.get("WEBHOOK_SECRET_KEY");
    
    // Validar secret se configurado
    if (expectedSecret) {
      const receivedSecret = req.headers.get("x-webhook-secret") || 
                            req.headers.get("authorization")?.replace("Bearer ", "");
      
      if (receivedSecret !== expectedSecret) {
        console.warn("Invalid webhook secret received");
        return new Response(
          JSON.stringify({ error: "Unauthorized", message: "Invalid webhook secret" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parsear payload
    let payload: IncomingLead;
    try {
      payload = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extrair dados do lead (suporta múltiplos formatos)
    const contact = payload.contact || payload.lead || {};
    const location = payload.location || {};
    const profile = payload.profile || {};
    const healthData = payload.health_data || payload.health_profile || {};
    const engagement = payload.engagement || {};

    const email = contact.email;
    const fullName = contact.full_name || 
                    (contact.first_name && contact.last_name 
                      ? `${contact.first_name} ${contact.last_name}` 
                      : contact.first_name || null);

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required", message: "contact.email field is missing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verificar se já existe um usuário com este email
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("email", email)
      .single();

    let userId = existingUser?.user_id || contact.id;
    let action = "updated";

    if (!existingUser) {
      // Criar novo usuário no auth se não existir
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: email,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          phone: contact.phone,
        },
      });

      if (authError && !authError.message.includes("already been registered")) {
        console.error("Error creating auth user:", authError);
        return new Response(
          JSON.stringify({ error: "Failed to create user", details: authError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      userId = authUser?.user?.id;
      action = "created";
    }

    // Atualizar ou criar perfil
    if (userId) {
      const profileData = {
        user_id: userId,
        email: email,
        full_name: fullName,
        phone: contact.phone,
        city: location.city,
        state: location.state,
        gender: profile.gender,
        birth_date: profile.birth_date,
        height: healthData.height_cm,
        current_weight: healthData.current_weight_kg,
        target_weight: healthData.target_weight_kg,
        activity_level: healthData.activity_level,
        fitness_level: healthData.fitness_level,
        points: engagement.points,
        updated_at: new Date().toISOString(),
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(profileData, { onConflict: "user_id" });

      if (profileError) {
        console.error("Error upserting profile:", profileError);
        return new Response(
          JSON.stringify({ error: "Failed to update profile", details: profileError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Log do recebimento
    console.log(`Lead ${action}: ${email} (${userId})`);

    return new Response(
      JSON.stringify({
        success: true,
        action: action,
        user_id: userId,
        email: email,
        message: `Lead ${action} successfully`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error receiving lead:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
