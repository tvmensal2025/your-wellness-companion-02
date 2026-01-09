import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WebhookQueueItem {
  id: string;
  event_type: string;
  user_id: string;
  payload: Record<string, unknown>;
  destination_url: string;
  destination_id: string | null;
  headers_sent: Record<string, string> | null;
  status: string;
  attempts: number;
  created_at: string;
}

interface WebhookDestination {
  id: string;
  secret_key: string | null;
  headers: Record<string, string> | null;
  retry_count: number;
  timeout_seconds: number;
}

async function sendWebhook(
  item: WebhookQueueItem,
  destination: WebhookDestination | null,
  secretKey: string | null
): Promise<{ success: boolean; responseCode: number; responseBody: string; executionTime: number }> {
  const startTime = Date.now();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "User-Agent": "MissionHealthNexus-Webhook/1.0",
    "X-Webhook-Event": item.event_type,
    "X-Webhook-Timestamp": new Date().toISOString(),
    "X-Webhook-ID": item.id,
  };

  const effectiveSecretKey = destination?.secret_key || secretKey;
  if (effectiveSecretKey) {
    headers["X-Webhook-Secret"] = effectiveSecretKey;
    headers["Authorization"] = `Bearer ${effectiveSecretKey}`;
  }

  if (destination?.headers) {
    Object.assign(headers, destination.headers);
  }

  if (item.headers_sent) {
    Object.assign(headers, item.headers_sent);
  }

  const timeout = (destination?.timeout_seconds || 30) * 1000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(item.destination_url, {
      method: "POST",
      headers,
      body: JSON.stringify(item.payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const executionTime = Date.now() - startTime;
    let responseBody = "";
    
    try {
      responseBody = await response.text();
    } catch {
      responseBody = "Unable to read response body";
    }

    return {
      success: response.ok,
      responseCode: response.status,
      responseBody: responseBody.substring(0, 1000),
      executionTime,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return {
      success: false,
      responseCode: 0,
      responseBody: `Error: ${errorMessage}`,
      executionTime,
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const defaultSecretKey = Deno.env.get("WEBHOOK_SECRET_KEY") || null;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: queueItems, error: queueError } = await supabase
      .from("webhook_queue")
      .select("*")
      .in("status", ["pending", "failed"])
      .lt("attempts", 5)
      .order("created_at", { ascending: true })
      .limit(50);

    if (queueError) {
      throw new Error(`Failed to fetch queue: ${queueError.message}`);
    }

    if (!queueItems || queueItems.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending webhooks", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      details: [] as Array<{ id: string; status: string; responseCode: number }>,
    };

    for (const item of queueItems as WebhookQueueItem[]) {
      let destination: WebhookDestination | null = null;
      
      if (item.destination_id) {
        const { data: destData } = await supabase
          .from("webhook_destinations")
          .select("id, secret_key, headers, retry_count, timeout_seconds")
          .eq("id", item.destination_id)
          .single();
        
        destination = destData as WebhookDestination | null;
      }

      await supabase
        .from("webhook_queue")
        .update({ 
          status: "processing",
          attempts: (item.attempts || 0) + 1,
          last_attempt_at: new Date().toISOString()
        })
        .eq("id", item.id);

      const result = await sendWebhook(item, destination, defaultSecretKey);

      const maxRetries = destination?.retry_count || 3;
      const newAttempts = (item.attempts || 0) + 1;
      const finalStatus = result.success 
        ? "sent" 
        : (newAttempts >= maxRetries ? "failed" : "pending");

      await supabase
        .from("webhook_queue")
        .update({
          status: finalStatus,
          response_code: result.responseCode,
          response_body: result.responseBody,
          execution_time_ms: result.executionTime,
          sent_at: result.success ? new Date().toISOString() : null,
          error_message: result.success ? null : result.responseBody,
        })
        .eq("id", item.id);

      results.processed++;
      if (result.success) {
        results.succeeded++;
      } else {
        results.failed++;
      }
      
      results.details.push({
        id: item.id,
        status: finalStatus,
        responseCode: result.responseCode,
      });

      console.log(`Webhook ${item.id}: ${finalStatus} (${result.responseCode}) - ${result.executionTime}ms`);
    }

    return new Response(
      JSON.stringify({
        message: "Webhooks processed",
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing webhooks:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});