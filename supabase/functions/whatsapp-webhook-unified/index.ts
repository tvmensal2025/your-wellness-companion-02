// ============================================
// Unified WhatsApp Webhook Handler
// Handles webhooks from both Evolution and Whapi
// ============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================
// Types
// ============================================

type WebhookProvider = 'evolution' | 'whapi';
type WebhookEventType = 'message' | 'button_reply' | 'list_reply' | 'status' | 'unknown';

interface ParsedWebhook {
  provider: WebhookProvider;
  event: WebhookEventType;
  phone: string;
  messageId?: string;
  buttonId?: string;
  buttonTitle?: string;
  listRowId?: string;
  listRowTitle?: string;
  textContent?: string;
  timestamp: number;
  rawPayload: any;
}


// ============================================
// Main Handler
// ============================================

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const payload = await req.json();
    const url = new URL(req.url);
    
    // Determine provider from URL path or payload
    const provider = detectProvider(url, payload);
    
    console.log(`[Webhook] Received from ${provider}:`, JSON.stringify(payload).substring(0, 500));
    
    // Parse the webhook
    const parsed = parseWebhook(provider, payload);
    
    if (!parsed) {
      console.log('[Webhook] Could not parse webhook, ignoring');
      return new Response(JSON.stringify({ success: true, ignored: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Log the webhook
    await logWebhook(supabase, parsed);
    
    // Handle based on event type
    if (parsed.event === 'button_reply' || parsed.event === 'list_reply') {
      await handleInteractiveResponse(supabase, parsed);
    } else if (parsed.event === 'message') {
      await handleIncomingMessage(supabase, parsed);
    } else if (parsed.event === 'status') {
      await handleStatusUpdate(supabase, parsed);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});


// ============================================
// Provider Detection
// ============================================

function detectProvider(url: URL, payload: any): WebhookProvider {
  // Check URL path
  if (url.pathname.includes('evolution')) return 'evolution';
  if (url.pathname.includes('whapi')) return 'whapi';
  
  // Check payload structure
  if (payload.event || payload.instance) return 'evolution';
  if (payload.messages || payload.statuses) return 'whapi';
  
  // Default to evolution
  return 'evolution';
}

// ============================================
// Webhook Parsing
// ============================================

function parseWebhook(provider: WebhookProvider, payload: any): ParsedWebhook | null {
  if (provider === 'evolution') {
    return parseEvolutionWebhook(payload);
  } else {
    return parseWhapiWebhook(payload);
  }
}

function parseEvolutionWebhook(payload: any): ParsedWebhook | null {
  const event = payload.event;
  const data = payload.data;
  
  if (!data) return null;
  
  // Message received
  if (event === 'messages.upsert') {
    const message = data.message || data;
    const phone = message.key?.remoteJid?.replace('@s.whatsapp.net', '') || '';
    
    // Check for button response
    if (message.message?.buttonsResponseMessage) {
      return {
        provider: 'evolution',
        event: 'button_reply',
        phone,
        messageId: message.key?.id,
        buttonId: message.message.buttonsResponseMessage.selectedButtonId,
        buttonTitle: message.message.buttonsResponseMessage.selectedDisplayText,
        timestamp: message.messageTimestamp || Date.now(),
        rawPayload: payload,
      };
    }
    
    // Check for list response
    if (message.message?.listResponseMessage) {
      return {
        provider: 'evolution',
        event: 'list_reply',
        phone,
        messageId: message.key?.id,
        listRowId: message.message.listResponseMessage.singleSelectReply?.selectedRowId,
        listRowTitle: message.message.listResponseMessage.title,
        timestamp: message.messageTimestamp || Date.now(),
        rawPayload: payload,
      };
    }
    
    // Regular text message (could be numbered response)
    const textContent = message.message?.conversation || 
                       message.message?.extendedTextMessage?.text || '';
    
    return {
      provider: 'evolution',
      event: 'message',
      phone,
      messageId: message.key?.id,
      textContent,
      timestamp: message.messageTimestamp || Date.now(),
      rawPayload: payload,
    };
  }
  
  // Status update
  if (event === 'messages.update' || event === 'message.ack') {
    return {
      provider: 'evolution',
      event: 'status',
      phone: data.remoteJid?.replace('@s.whatsapp.net', '') || '',
      messageId: data.id || data.key?.id,
      timestamp: Date.now(),
      rawPayload: payload,
    };
  }
  
  return null;
}


function parseWhapiWebhook(payload: any): ParsedWebhook | null {
  // Whapi sends messages array
  const messages = payload.messages || [];
  
  for (const message of messages) {
    const phone = message.from?.replace('@s.whatsapp.net', '') || message.chat_id?.replace('@s.whatsapp.net', '') || '';
    
    // Button reply
    if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
      return {
        provider: 'whapi',
        event: 'button_reply',
        phone,
        messageId: message.id,
        buttonId: message.interactive.button_reply?.id,
        buttonTitle: message.interactive.button_reply?.title,
        timestamp: message.timestamp || Date.now(),
        rawPayload: payload,
      };
    }
    
    // List reply
    if (message.type === 'interactive' && message.interactive?.type === 'list_reply') {
      return {
        provider: 'whapi',
        event: 'list_reply',
        phone,
        messageId: message.id,
        listRowId: message.interactive.list_reply?.id,
        listRowTitle: message.interactive.list_reply?.title,
        timestamp: message.timestamp || Date.now(),
        rawPayload: payload,
      };
    }
    
    // Text message
    if (message.type === 'text') {
      return {
        provider: 'whapi',
        event: 'message',
        phone,
        messageId: message.id,
        textContent: message.text?.body || message.body,
        timestamp: message.timestamp || Date.now(),
        rawPayload: payload,
      };
    }
  }
  
  // Status updates
  const statuses = payload.statuses || [];
  for (const status of statuses) {
    return {
      provider: 'whapi',
      event: 'status',
      phone: status.recipient_id || '',
      messageId: status.id,
      timestamp: status.timestamp || Date.now(),
      rawPayload: payload,
    };
  }
  
  return null;
}


// ============================================
// Webhook Logging
// ============================================

async function logWebhook(supabase: any, parsed: ParsedWebhook): Promise<void> {
  // Find user by phone
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('phone', parsed.phone)
    .single();
  
  await supabase.from('whatsapp_webhook_responses').insert({
    user_id: profile?.id || null,
    phone: parsed.phone,
    provider: parsed.provider,
    original_message_id: parsed.messageId,
    response_type: parsed.event,
    button_id: parsed.buttonId,
    button_title: parsed.buttonTitle,
    list_row_id: parsed.listRowId,
    list_row_title: parsed.listRowTitle,
    raw_payload: parsed.rawPayload,
    received_at: new Date().toISOString(),
  });
}

// ============================================
// Event Handlers
// ============================================

async function handleInteractiveResponse(supabase: any, parsed: ParsedWebhook): Promise<void> {
  const actionId = parsed.buttonId || parsed.listRowId;
  
  if (!actionId) {
    console.log('[Webhook] No action ID found in interactive response');
    return;
  }
  
  console.log(`[Webhook] Interactive response: ${actionId} from ${parsed.phone}`);
  
  // Find user
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('phone', parsed.phone)
    .single();
  
  // Execute action based on ID
  const result = await executeAction(supabase, actionId, profile?.id, parsed);
  
  // Update webhook log with action result
  if (parsed.messageId) {
    await supabase
      .from('whatsapp_webhook_responses')
      .update({
        action_triggered: actionId,
        action_result: result,
        processed_at: new Date().toISOString(),
      })
      .eq('original_message_id', parsed.messageId);
  }
}

async function handleIncomingMessage(supabase: any, parsed: ParsedWebhook): Promise<void> {
  // Check if this is a numbered response to an interactive message
  const text = parsed.textContent?.trim();
  
  if (text && /^[1-9]$|^10$/.test(text)) {
    // This might be a response to a text-fallback interactive message
    console.log(`[Webhook] Possible numbered response: ${text} from ${parsed.phone}`);
    
    // Find the last interactive message sent to this phone
    const { data: lastMessage } = await supabase
      .from('whatsapp_message_logs')
      .select('*')
      .eq('phone', parsed.phone)
      .eq('interactive_type', 'button')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (lastMessage) {
      // TODO: Map number to button ID and execute action
      console.log(`[Webhook] Found last interactive message, mapping response`);
    }
  }
}

async function handleStatusUpdate(supabase: any, parsed: ParsedWebhook): Promise<void> {
  // Update message status in logs
  if (parsed.messageId) {
    const statusMap: Record<string, string> = {
      'sent': 'sent',
      'delivered': 'delivered',
      'read': 'read',
      'failed': 'failed',
    };
    
    const status = parsed.rawPayload?.status || parsed.rawPayload?.ack;
    const mappedStatus = statusMap[status] || 'sent';
    
    await supabase
      .from('whatsapp_message_logs')
      .update({
        status: mappedStatus,
        [`${mappedStatus}_at`]: new Date().toISOString(),
      })
      .eq('provider_message_id', parsed.messageId);
  }
}


// ============================================
// Action Execution
// ============================================

async function executeAction(
  supabase: any,
  actionId: string,
  userId: string | null,
  parsed: ParsedWebhook
): Promise<any> {
  console.log(`[Webhook] Executing action: ${actionId} for user: ${userId}`);
  
  switch (actionId) {
    // Sofia buttons
    case 'sofia_confirm':
    case 'confirm_analysis':
      return await confirmAnalysis(supabase, userId, parsed);
    
    case 'sofia_edit':
    case 'edit_analysis':
      return await editAnalysis(supabase, userId, parsed);
    
    case 'sofia_details':
    case 'view_details':
      return await viewDetails(supabase, userId, parsed);
    
    case 'sofia_new_photo':
      return { action: actionId, status: 'awaiting_photo' };
    
    case 'sofia_meal_plan':
      return { action: actionId, status: 'generating_meal_plan' };
    
    case 'sofia_tips':
      return { action: actionId, status: 'sending_tips' };
    
    // Dr. Vital buttons
    case 'vital_understood':
    case 'confirm_exam':
      return { action: actionId, status: 'acknowledged' };
    
    case 'vital_question':
    case 'ask_question':
      return await askQuestion(supabase, userId, parsed);
    
    case 'vital_full_report':
      return { action: actionId, status: 'sending_report' };
    
    case 'vital_schedule':
    case 'schedule_appointment':
      return await scheduleAppointment(supabase, userId, parsed);
    
    // Daily check-in
    case 'feeling_great':
    case 'feeling_ok':
    case 'feeling_bad':
      return await handleFeeling(supabase, userId, actionId, parsed);
    
    // Meal plan buttons
    case 'meal_accept':
      return { action: actionId, status: 'meal_accepted' };
    
    case 'meal_change':
      return { action: actionId, status: 'generating_alternative' };
    
    case 'meal_recipe':
      return { action: actionId, status: 'generating_recipe' };
    
    case 'meal_shopping':
      return { action: actionId, status: 'generating_shopping_list' };
    
    // General
    case 'yes':
    case 'next_step':
      return { action: actionId, status: 'acknowledged' };
    
    case 'no':
    case 'skip_step':
      return { action: actionId, status: 'skipped' };
    
    case 'help':
      return { action: actionId, status: 'showing_help' };
    
    case 'menu':
      return { action: actionId, status: 'showing_menu' };
    
    case 'cancel_analysis':
      return await cancelAnalysis(supabase, userId, parsed);
    
    default:
      console.log(`[Webhook] Unknown action: ${actionId}`);
      return { action: actionId, status: 'unknown' };
  }
}

async function confirmAnalysis(supabase: any, userId: string | null, parsed: ParsedWebhook): Promise<any> {
  if (!userId) return { error: 'User not found' };
  
  // Find the latest pending analysis
  const { data: analysis } = await supabase
    .from('food_analysis')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (analysis) {
    await supabase
      .from('food_analysis')
      .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
      .eq('id', analysis.id);
    
    return { action: 'confirm_analysis', analysisId: analysis.id, status: 'confirmed' };
  }
  
  return { action: 'confirm_analysis', status: 'no_pending_analysis' };
}

async function editAnalysis(supabase: any, userId: string | null, parsed: ParsedWebhook): Promise<any> {
  // TODO: Trigger edit flow
  return { action: 'edit_analysis', status: 'edit_requested' };
}

async function cancelAnalysis(supabase: any, userId: string | null, parsed: ParsedWebhook): Promise<any> {
  if (!userId) return { error: 'User not found' };
  
  const { data: analysis } = await supabase
    .from('food_analysis')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (analysis) {
    await supabase
      .from('food_analysis')
      .update({ status: 'cancelled' })
      .eq('id', analysis.id);
    
    return { action: 'cancel_analysis', analysisId: analysis.id, status: 'cancelled' };
  }
  
  return { action: 'cancel_analysis', status: 'no_pending_analysis' };
}

async function viewDetails(supabase: any, userId: string | null, parsed: ParsedWebhook): Promise<any> {
  // TODO: Send detailed report
  return { action: 'view_details', status: 'details_requested' };
}

async function talkNutritionist(supabase: any, userId: string | null, parsed: ParsedWebhook): Promise<any> {
  // TODO: Connect to Sofia
  return { action: 'talk_nutritionist', status: 'connection_requested' };
}

async function askQuestion(supabase: any, userId: string | null, parsed: ParsedWebhook): Promise<any> {
  // Store state for follow-up question
  if (userId) {
    await supabase
      .from('whatsapp_user_state')
      .upsert({
        user_id: userId,
        phone: parsed.phone,
        state: 'awaiting_question',
        context: { flowType: 'exam_question' },
        updated_at: new Date().toISOString(),
      });
  }
  
  return { action: 'ask_question', status: 'awaiting_question' };
}

async function scheduleAppointment(supabase: any, userId: string | null, parsed: ParsedWebhook): Promise<any> {
  return { action: 'schedule_appointment', status: 'info_sent' };
}

async function handleFeeling(
  supabase: any, 
  userId: string | null, 
  feeling: string, 
  parsed: ParsedWebhook
): Promise<any> {
  const levelMap: Record<string, number> = {
    'feeling_great': 5,
    'feeling_ok': 3,
    'feeling_bad': 1,
  };
  
  const level = levelMap[feeling] || 3;
  
  if (userId) {
    await supabase
      .from('advanced_daily_tracking')
      .upsert({
        user_id: userId,
        tracking_date: new Date().toISOString().split('T')[0],
        energy_level: level,
        mood_level: level,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,tracking_date',
      });
  }
  
  return { action: 'daily_checkin', feeling, level };
}
