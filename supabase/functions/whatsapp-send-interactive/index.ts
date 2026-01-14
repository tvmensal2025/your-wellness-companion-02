/**
 * WhatsApp Send Interactive Templates
 * Edge function to send interactive messages (water, weighing, help, etc.)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";
import { 
  createWaterReminder,
  createWaterConfirmation,
  createWaterNotYetResponse,
  createWaterWeeklyProgress,
  createWeeklyWeighingReminder,
  createWeighingPromptWeight,
  createWeighingPromptWaist,
  createWeighingComplete,
  createWeighingEvolution,
  createWeighingLaterResponse,
  createHelpResponse,
  createWelcomeMessage,
  createMainMenu,
  createDailyCheckin,
} from "../_shared/whatsapp/interactive-templates.ts";
import { createWhatsAppAdapterLayer } from "../_shared/whatsapp/adapter-layer.ts";
import { EvolutionAdapter } from "../_shared/whatsapp/evolution-adapter.ts";
import { WhapiAdapter } from "../_shared/whatsapp/whapi-adapter.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template types available
type TemplateType = 
  | 'water_reminder'
  | 'water_confirmation'
  | 'water_not_yet'
  | 'water_weekly'
  | 'weighing_reminder'
  | 'weighing_prompt_weight'
  | 'weighing_prompt_waist'
  | 'weighing_complete'
  | 'weighing_evolution'
  | 'weighing_later'
  | 'help'
  | 'welcome'
  | 'menu'
  | 'daily_checkin';

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { phone, userId, templateType, data } = await req.json() as {
      phone: string;
      userId?: string;
      templateType: TemplateType;
      data?: Record<string, any>;
    };

    if (!phone) {
      throw new Error("Phone number is required");
    }

    if (!templateType) {
      throw new Error("Template type is required");
    }

    console.log(`[SendInteractive] Sending ${templateType} to ${phone}`);

    // Initialize adapter layer
    const adapterLayer = createWhatsAppAdapterLayer();
    
    // Evolution adapter
    const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL');
    const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY');
    const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE');
    
    if (evolutionApiUrl && evolutionApiKey && evolutionInstance) {
      const evolutionAdapter = new EvolutionAdapter({
        apiUrl: evolutionApiUrl,
        apiKey: evolutionApiKey,
        instance: evolutionInstance,
      });
      adapterLayer.setEvolutionAdapter(evolutionAdapter);
    } else {
      console.warn('[SendInteractive] Evolution API not fully configured');
    }
    
    // Whapi adapter
    const whapiApiUrl = Deno.env.get('WHAPI_API_URL') || 'https://gate.whapi.cloud';
    const whapiApiToken = Deno.env.get('WHAPI_TOKEN') || Deno.env.get('WHAPI_API_TOKEN');
    const whapiChannelId = Deno.env.get('WHAPI_CHANNEL_ID');
    
    if (whapiApiToken) {
      const whapiAdapter = new WhapiAdapter({
        apiUrl: whapiApiUrl,
        apiToken: whapiApiToken,
        channelId: whapiChannelId || undefined,
      });
      adapterLayer.setWhapiAdapter(whapiAdapter);
    } else {
      console.warn('[SendInteractive] WHAPI_TOKEN not configured');
    }

    // Get user data if userId provided
    let userData: any = null;
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();
      userData = profile;
    }

    // Get water data for water templates
    let waterData = { totalToday: 0, goal: 2500 };
    if (templateType.startsWith('water_') && userId) {
      const today = new Date().toISOString().split('T')[0];
      const { data: tracking } = await supabase
        .from('advanced_daily_tracking')
        .select('water_ml')
        .eq('user_id', userId)
        .eq('tracking_date', today)
        .single();
      
      waterData.totalToday = tracking?.water_ml || 0;
    }

    // Get weight data for weighing templates
    let weightData: any = {};
    if (templateType.startsWith('weighing_') && userId) {
      const { data: lastMeasurement } = await supabase
        .from('weight_measurements')
        .select('weight_kg, waist_cm, measurement_date')
        .eq('user_id', userId)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .single();
      
      if (lastMeasurement) {
        const daysSince = Math.floor(
          (Date.now() - new Date(lastMeasurement.measurement_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        weightData = {
          lastWeight: lastMeasurement.weight_kg,
          lastWaist: lastMeasurement.waist_cm,
          daysSinceLastWeighing: daysSince,
        };
      }
    }

    // Generate interactive content based on template type
    let interactive;
    switch (templateType) {
      case 'water_reminder':
        interactive = createWaterReminder({
          userName: userData?.full_name || data?.userName,
          totalToday: data?.totalToday ?? waterData.totalToday,
          goal: data?.goal ?? waterData.goal,
        });
        break;

      case 'water_confirmation':
        interactive = createWaterConfirmation({
          amount: data?.amount || 250,
          totalToday: data?.totalToday ?? waterData.totalToday,
          goal: data?.goal ?? waterData.goal,
        });
        break;

      case 'water_not_yet':
        interactive = createWaterNotYetResponse();
        break;

      case 'water_weekly':
        interactive = createWaterWeeklyProgress({
          weekData: data?.weekData || [
            { day: 'Seg', amount: 2000 },
            { day: 'Ter', amount: 2500 },
            { day: 'Qua', amount: 1800 },
            { day: 'Qui', amount: 2200 },
            { day: 'Sex', amount: 2400 },
            { day: 'Sáb', amount: 1500 },
            { day: 'Dom', amount: 2100 },
          ],
          avgDaily: data?.avgDaily || 2071,
          goal: data?.goal || 2500,
          bestDay: data?.bestDay || 'Terça',
        });
        break;

      case 'weighing_reminder':
        interactive = createWeeklyWeighingReminder({
          userName: userData?.full_name || data?.userName,
          lastWeight: data?.lastWeight ?? weightData.lastWeight,
          lastWaist: data?.lastWaist ?? weightData.lastWaist,
          daysSinceLastWeighing: data?.daysSinceLastWeighing ?? weightData.daysSinceLastWeighing ?? 7,
        });
        break;

      case 'weighing_prompt_weight':
        interactive = createWeighingPromptWeight();
        break;

      case 'weighing_prompt_waist':
        interactive = createWeighingPromptWaist(data?.weight || 70);
        break;

      case 'weighing_complete':
        interactive = createWeighingComplete({
          weight: data?.weight || 70,
          waist: data?.waist,
          previousWeight: data?.previousWeight ?? weightData.lastWeight,
          previousWaist: data?.previousWaist ?? weightData.lastWaist,
          analysis: data?.analysis || 'Continue mantendo hábitos saudáveis! 💪',
        });
        break;

      case 'weighing_evolution':
        interactive = createWeighingEvolution({
          history: data?.history || [
            { date: '14/01', weight: 72.5, waist: 85 },
            { date: '07/01', weight: 73.0, waist: 86 },
            { date: '31/12', weight: 73.5, waist: 87 },
            { date: '24/12', weight: 74.0, waist: 88 },
          ],
          startWeight: data?.startWeight || 74.0,
          currentWeight: data?.currentWeight || 72.5,
          totalLoss: data?.totalLoss || -1.5,
        });
        break;

      case 'weighing_later':
        interactive = createWeighingLaterResponse();
        break;

      case 'help':
        interactive = createHelpResponse();
        break;

      case 'welcome':
        interactive = createWelcomeMessage(userData?.full_name || data?.userName);
        break;

      case 'menu':
        interactive = createMainMenu();
        break;

      case 'daily_checkin':
        interactive = createDailyCheckin(userData?.full_name || data?.userName);
        break;

      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }

    // Send the message
    const result = await adapterLayer.sendMessage({
      phone,
      userId,
      messageType: 'interactive',
      content: interactive,
      templateKey: templateType.toUpperCase(),
      metadata: {
        templateType,
        sentAt: new Date().toISOString(),
      },
    });

    // Log the send
    await supabase.from('whatsapp_message_logs').insert({
      user_id: userId,
      phone,
      direction: 'outbound',
      message_type: 'interactive',
      template_key: templateType,
      content_preview: JSON.stringify(interactive).substring(0, 200),
      provider: result.provider || 'unknown',
      provider_message_id: result.messageId,
      status: result.success ? 'sent' : 'failed',
      error_message: result.error,
      created_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: result.success,
        messageId: result.messageId,
        templateType,
        provider: result.provider,
        error: result.error,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[SendInteractive] Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
