import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/utils/cors.ts";

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") ?? "";
    const GOOGLE_AI_API_KEY = Deno.env.get("GOOGLE_AI_API_KEY") ?? "";
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";
    const OLLAMA_URL = Deno.env.get("OLLAMA_URL") || "https://ids-ollama-web.ifrhb3.easypanel.host";
    
    console.log('🔥 Ativando e testando APIs de IA...');
    console.log('🔑 MaxNutrition AI Key exists:', !!LOVABLE_API_KEY);
    console.log('🔑 OpenAI Key exists:', !!OPENAI_API_KEY);
    console.log('🔑 Google AI Key exists:', !!GOOGLE_AI_API_KEY);
    console.log('🔑 Ollama URL:', OLLAMA_URL);

    // Authenticated client (to know who is calling)
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin
    const { data: isAdmin, error: adminErr } = await supabaseAuth.rpc("is_admin_user");
    if (adminErr || !isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1) Test MaxNutrition AI (PRINCIPAL - sem necessidade de API key externa)
    let lovableResult: { ok: boolean; status?: number; message?: string } = { ok: false };
    if (LOVABLE_API_KEY) {
      try {
        console.log('🧪 Testando MaxNutrition AI...');
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "Você é um verificador de saúde da API." },
              { role: "user", content: "Responda apenas: ok" },
            ],
            max_tokens: 10,
          }),
        });
        const j = await r.json();
        const text = j?.choices?.[0]?.message?.content ?? "";
        lovableResult = { ok: r.ok && typeof text === "string", status: r.status, message: text };
        console.log(lovableResult.ok ? '✅ MaxNutrition AI conectado!' : '❌ MaxNutrition AI falhou:', text);
      } catch (e) {
        lovableResult = { ok: false, message: (e as Error).message };
        console.log('❌ MaxNutrition AI exception:', e);
      }
    } else {
      console.log('⚠️ LOVABLE_API_KEY não configurada');
    }

    // 2) Test OpenAI
    let openaiResult: { ok: boolean; status?: number; message?: string } = { ok: false };
    if (OPENAI_API_KEY) {
      try {
        console.log('🧪 Testando OpenAI...');
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "Você é um verificador de saúde da API." },
              { role: "user", content: "Responda apenas: ok" },
            ],
            temperature: 0.2,
            max_tokens: 5,
          }),
        });
        const j = await r.json();
        const text = j?.choices?.[0]?.message?.content ?? "";
        openaiResult = { ok: r.ok && typeof text === "string", status: r.status, message: text };
        console.log(openaiResult.ok ? '✅ OpenAI conectado!' : '❌ OpenAI falhou:', text);
      } catch (e) {
        openaiResult = { ok: false, message: (e as Error).message };
        console.log('❌ OpenAI exception:', e);
      }
    }

    // 3) Test Google Gemini
    let googleResult: { ok: boolean; status?: number; message?: string } = { ok: false };
    if (GOOGLE_AI_API_KEY) {
      try {
        console.log('🧪 Testando Google Gemini...');
        const r = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: "Responda apenas: ok" }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 5 },
            }),
          },
        );
        const j = await r.json();
        const text = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        googleResult = { ok: r.ok && typeof text === "string", status: r.status, message: text };
        console.log(googleResult.ok ? '✅ Google Gemini conectado!' : '❌ Google Gemini falhou:', text);
      } catch (e) {
        googleResult = { ok: false, message: (e as Error).message };
        console.log('❌ Google Gemini exception:', e);
      }
    }

    // 4) Test Ollama
    let ollamaResult: { ok: boolean; status?: number; message?: string; models?: number } = { ok: false };
    try {
      console.log('🧪 Testando Ollama...');
      const r = await fetch(`${OLLAMA_URL}/api/tags`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (r.ok) {
        const data = await r.json();
        ollamaResult = { 
          ok: true, 
          status: r.status, 
          message: "Connected", 
          models: data.models?.length || 0 
        };
        console.log('✅ Ollama conectado!', data.models?.length, 'modelos disponíveis');
      } else {
        const error = await r.text();
        ollamaResult = { ok: false, status: r.status, message: error };
        console.log('❌ Ollama falhou:', error);
      }
    } catch (e) {
      ollamaResult = { ok: false, message: (e as Error).message };
      console.log('❌ Ollama exception:', e);
    }

    // 5) Update configurations to use MaxNutrition AI as default if available
    if (lovableResult.ok) {
      console.log('📝 Atualizando configurações para usar MaxNutrition AI...');
      
      const lovableConfigs = [
        { functionality: "chat_daily", service: "lovable", model: "google/gemini-2.5-flash", max_tokens: 2048, temperature: 0.8, is_enabled: true, level: "maximo", personality: "sofia", system_prompt: "Você é a Sofia, nutricionista virtual do MaxNutrition. Seja EMPÁTICA, MOTIVACIONAL e CONCISA. Use linguagem simples e direta, como uma amiga conversando. Foque no bem-estar e motivação do usuário." },
        { functionality: "weekly_report", service: "lovable", model: "google/gemini-2.5-flash", max_tokens: 4096, temperature: 0.7, is_enabled: true, level: "maximo", personality: "sofia", system_prompt: "Você é a Sofia. Gere relatórios semanais detalhados e motivacionais sobre o progresso do paciente." },
        { functionality: "monthly_report", service: "lovable", model: "google/gemini-2.5-pro", max_tokens: 8192, temperature: 0.7, is_enabled: true, level: "maximo", personality: "sofia", system_prompt: "Você é a Sofia. Gere relatórios mensais completos com análise profunda do progresso." },
        { functionality: "medical_analysis", service: "lovable", model: "google/gemini-2.5-pro", max_tokens: 4096, temperature: 0.5, is_enabled: true, level: "maximo", personality: "drvital", system_prompt: "Você é o Dr. Vital, médico virtual do MaxNutrition. Analise exames médicos de forma profissional e segura." },
        { functionality: "preventive_analysis", service: "lovable", model: "google/gemini-2.5-flash", max_tokens: 2048, temperature: 0.6, is_enabled: true, level: "maximo", personality: "drvital", system_prompt: "Você é o Dr. Vital. Analise dados de saúde e identifique riscos potenciais de forma preventiva." },
        { functionality: "food_analysis", service: "lovable", model: "google/gemini-2.5-flash", max_tokens: 2048, temperature: 0.7, is_enabled: true, level: "maximo", personality: "sofia", system_prompt: "Você é a Sofia. Analise fotos de refeições e forneça estimativas nutricionais." },
        { functionality: "image_analysis", service: "lovable", model: "google/gemini-2.5-flash", max_tokens: 2048, temperature: 0.7, is_enabled: true, level: "maximo", personality: "sofia", system_prompt: "Você é a Sofia. Analise imagens de forma detalhada e forneça insights úteis sobre nutrição e saúde." },
        { functionality: "medical_exam_analysis", service: "lovable", model: "google/gemini-2.5-pro", max_tokens: 4096, temperature: 0.5, is_enabled: true, level: "maximo", personality: "drvital", system_prompt: "Você é o Dr. Vital. Extraia e analise dados de exames médicos com precisão e segurança." },
        { functionality: "daily_missions", service: "lovable", model: "google/gemini-2.5-flash-lite", max_tokens: 1024, temperature: 0.8, is_enabled: true, level: "medio", personality: "sofia", system_prompt: "Você é a Sofia. Gere missões diárias personalizadas e motivadoras." },
        { functionality: "whatsapp_reports", service: "lovable", model: "google/gemini-2.5-flash-lite", max_tokens: 512, temperature: 0.7, is_enabled: true, level: "minimo", personality: "sofia", system_prompt: "Você é a Sofia. Gere mensagens curtas e motivacionais para WhatsApp." },
        { functionality: "email_reports", service: "lovable", model: "google/gemini-2.5-flash", max_tokens: 2048, temperature: 0.7, is_enabled: true, level: "medio", personality: "sofia", system_prompt: "Você é a Sofia. Gere emails personalizados com relatórios e orientações." },
        { functionality: "simple_messages", service: "ollama", model: "llama3.2:3b", max_tokens: 512, temperature: 0.7, is_enabled: true, level: "minimo", personality: "sofia", system_prompt: "Você é a Sofia. Responda mensagens simples de forma amigável e calorosa." },
      ];

      for (const config of lovableConfigs) {
        const { error } = await supabase
          .from("ai_configurations")
          .upsert(config, { onConflict: "functionality" });
          
        if (error) {
          console.error("Erro ao criar config:", config.functionality, error);
        } else {
          console.log("✅ Config MaxNutrition AI criada:", config.functionality);
        }
      }
    }

    const summary = {
      lovable_working: lovableResult.ok,
      openai_working: openaiResult.ok,
      google_working: googleResult.ok,
      ollama_working: ollamaResult.ok,
      recommended_service: lovableResult.ok ? 'lovable' : (openaiResult.ok ? 'openai' : (googleResult.ok ? 'gemini' : 'ollama')),
      all_working: lovableResult.ok && openaiResult.ok && googleResult.ok && ollamaResult.ok
    };
    
    console.log('📊 Resumo final:', summary);

    return new Response(
      JSON.stringify({
        success: true,
        user: userData.user.email,
        lovable: lovableResult,
        openai: openaiResult,
        google: googleResult,
        ollama: ollamaResult,
        summary,
        message: lovableResult.ok 
          ? "✅ MaxNutrition AI configurado como padrão! Todas as funcionalidades ativas." 
          : "IAs validadas e configurações criadas",
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("activate-ai fatal", e);
    return new Response(JSON.stringify({ success: false, error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
