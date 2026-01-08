/**
 * SOFIA ENHANCED MEMORY
 * 
 * Agora usa o sistema UNIFICADO com Sofia + Dr. Vital
 * Detecta automaticamente qual personalidade deve responder
 * baseado no conteúdo da mensagem.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getUserCompleteContext, generateUserContextSummary } from '../_shared/user-complete-context.ts'
import { 
  detectPersonality, 
  getPersonalityName,
  bold,
  EMOJIS
} from '../_shared/format-helpers.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { message, userId, context, forcePersonality } = await req.json();

    console.log('🧠 Sofia Enhanced Memory - Sistema UNIFICADO para usuário:', userId);

    // ============================================
    // BUSCAR CONFIGURAÇÕES DE IA SALVAS NO BANCO
    // ============================================
    console.log('📋 Buscando configurações de IA do banco...');
    const { data: aiConfig, error: configError } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('functionality', 'chat_daily')
      .single();
    
    let aiSettings = {
      service: 'lovable',
      model: 'google/gemini-2.5-flash',
      maxTokens: 2048,
      temperature: 0.8,
      systemPrompt: ''
    };
    
    if (aiConfig && !configError) {
      console.log('✅ Configurações encontradas:', {
        service: aiConfig.service,
        model: aiConfig.model,
        maxTokens: aiConfig.max_tokens,
        temperature: aiConfig.temperature,
        isEnabled: aiConfig.is_enabled
      });
      
      // Mapear serviço para modelo Lovable AI correto
      let mappedModel = 'google/gemini-2.5-flash'; // default
      
      if (aiConfig.service === 'google' || aiConfig.service === 'gemini') {
        if (aiConfig.model?.includes('pro')) {
          mappedModel = 'google/gemini-2.5-pro';
        } else if (aiConfig.model?.includes('flash')) {
          mappedModel = 'google/gemini-2.5-flash';
        }
      } else if (aiConfig.service === 'openai') {
        if (aiConfig.model?.includes('gpt-5')) {
          mappedModel = 'openai/gpt-5';
        } else if (aiConfig.model?.includes('gpt-5-mini')) {
          mappedModel = 'openai/gpt-5-mini';
        } else {
          mappedModel = 'openai/gpt-5-mini';
        }
      }
      
      aiSettings = {
        service: aiConfig.service || 'lovable',
        model: mappedModel,
        maxTokens: aiConfig.max_tokens || 2048,
        temperature: aiConfig.temperature || 0.8,
        systemPrompt: aiConfig.system_prompt || ''
      };
      
      console.log('🎯 Configurações aplicadas:', aiSettings);
    } else {
      console.log('⚠️ Usando configurações padrão (sem config no banco)');
    }

    // ============================================
    // USAR SISTEMA UNIFICADO DE CONTEXTO
    // ============================================
    const userContext = await getUserCompleteContext(supabaseUrl, supabaseServiceKey, userId);
    const contextSummary = generateUserContextSummary(userContext);

    console.log('📊 Contexto carregado:', {
      completeness: `${userContext.metadata.dataCompleteness.percentage}%`,
      totalDataPoints: userContext.metadata.totalDataPoints,
      canReceiveFullAnalysis: userContext.metadata.dataCompleteness.canReceiveFullAnalysis
    });

    // ============================================
    // DETECTAR PERSONALIDADE (SOFIA vs DR. VITAL)
    // ============================================
    const personality = forcePersonality || detectPersonality(message);
    console.log(`🎭 Personalidade detectada: ${getPersonalityName(personality)}`);

    // Gerar system prompt UNIFICADO
    const systemPrompt = buildUnifiedSystemPrompt(userContext, contextSummary, personality, aiSettings.systemPrompt);
    
    console.log('🤖 Gerando resposta com:', {
      personality,
      model: aiSettings.model,
      maxTokens: aiSettings.maxTokens,
      temperature: aiSettings.temperature
    });
    
    let response = '';
    let apiUsed = 'none';

    // 1. LOVABLE AI como provedor PRINCIPAL
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (LOVABLE_API_KEY) {
      try {
        console.log(`🤖 ${getPersonalityName(personality)} usando Lovable AI (${aiSettings.model})...`);
        const lovableResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: aiSettings.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: aiSettings.temperature,
            max_tokens: aiSettings.maxTokens
          })
        });

        if (lovableResponse.status === 429) {
          console.warn('⚠️ Rate limit exceeded');
        } else if (lovableResponse.status === 402) {
          console.warn('⚠️ Payment required');
        } else {
          const data = await lovableResponse.json();
          if (data?.error) {
            console.error('❌ Erro Lovable AI:', data.error);
          } else if (data?.choices?.[0]?.message?.content) {
            response = data.choices[0].message.content;
            apiUsed = `lovable-${aiSettings.model}`;
            console.log('✅ Lovable AI funcionou!');
          }
        }
      } catch (error) {
        console.error('❌ Erro Lovable AI:', error);
      }
    }

    // 2. Fallback: OpenAI GPT-4o
    if (!response) {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiApiKey) {
        try {
          console.log(`🤖 ${getPersonalityName(personality)} usando OpenAI GPT-4o (fallback)...`);
          const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: message }
              ],
              temperature: 0.8,
              max_tokens: 1500
            })
          });

          const data = await openaiResponse.json();
          if (data?.error) {
            console.error('❌ Erro OpenAI:', data.error);
          } else if (data?.choices?.[0]?.message?.content) {
            response = data.choices[0].message.content;
            apiUsed = 'openai-gpt-4o';
            console.log('✅ OpenAI funcionou!');
          }
        } catch (error) {
          console.error('❌ Erro OpenAI:', error);
        }
      }
    }

    // 3. Fallback: Google AI
    if (!response) {
      const googleApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
      if (googleApiKey) {
        try {
          console.log(`🤖 ${getPersonalityName(personality)} usando Google AI (fallback)...`);
          const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${systemPrompt}\n\nUsuário: ${message}` }]
              }],
              generationConfig: { 
                temperature: 0.8, 
                maxOutputTokens: 1500,
                topP: 0.9,
                topK: 40
              }
            })
          });

          if (!googleResponse.ok) {
            console.error('❌ Erro Google AI:', googleResponse.status);
            throw new Error(`Google AI error: ${googleResponse.status}`);
          }

          const gData = await googleResponse.json();
          if (gData?.candidates?.[0]?.content?.parts?.[0]?.text) {
            response = gData.candidates[0].content.parts[0].text;
            apiUsed = 'google-ai';
            console.log('✅ Google AI funcionou!');
          }
        } catch (error) {
          console.error('❌ Erro Google AI:', error);
        }
      }
    }

    // 4. Resposta padrão se nenhuma IA funcionar
    if (!response) {
      const avatar = personality === 'sofia' ? '🥗' : '🩺';
      const name = personality === 'sofia' ? 'Sofia' : 'Dr. Vital';
      const heart = personality === 'sofia' ? '💚' : '💙';
      response = `${avatar} Olá ${userContext.profile.firstName}! Sou ${name === 'Sofia' ? 'a' : 'o'} ${name}, ${personality === 'sofia' ? 'sua nutricionista pessoal' : 'seu médico de confiança'}. ${heart}\n\nComo posso ajudar você hoje?`;
      apiUsed = 'fallback';
    }

    console.log('✅ Resposta gerada usando:', apiUsed, '| Personalidade:', getPersonalityName(personality));

    // ============================================
    // SALVAR CONVERSA NO HISTÓRICO
    // ============================================
    console.log('💾 Salvando conversa no histórico permanente...');
    const conversationId = `conversation_${Date.now()}`;
    
    const { error: saveError } = await supabase
      .from('user_conversations')
      .insert([
        {
          user_id: userId,
          conversation_id: conversationId,
          message_role: 'user',
          message_content: message,
          timestamp: new Date().toISOString(),
          session_metadata: context || {},
          analysis_type: context?.imageUrl ? 'image_analysis' : 'text_chat',
          context: { 
            api_used: apiUsed,
            personality,
            data_completeness: userContext.metadata.dataCompleteness.percentage,
            total_data_points: userContext.metadata.totalDataPoints
          }
        },
        {
          user_id: userId,
          conversation_id: conversationId,
          message_role: 'assistant',
          message_content: response,
          timestamp: new Date().toISOString(),
          session_metadata: context || {},
          analysis_type: context?.imageUrl ? 'image_analysis' : 'text_chat',
          context: { 
            api_used: apiUsed,
            personality,
            data_completeness: userContext.metadata.dataCompleteness.percentage
          }
        }
      ]);
      
    if (saveError) {
      console.error('❌ Erro ao salvar conversa:', saveError);
    } else {
      console.log('✅ Conversa salva permanentemente');
    }

    // Retornar resposta
    console.log(`🎯 ${getPersonalityName(personality)} respondendo para: ${userContext.profile.firstName}`);

    return new Response(
      JSON.stringify({
        message: response,
        personality,
        personalityName: getPersonalityName(personality),
        memory_updated: true,
        data_completeness: userContext.metadata.dataCompleteness.percentage,
        total_data_points: userContext.metadata.totalDataPoints,
        can_receive_full_analysis: userContext.metadata.dataCompleteness.canReceiveFullAnalysis,
        api_used: apiUsed
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro na função sofia-enhanced-memory:', error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: 'Olá! Sou a Sofia. No momento estou com dificuldades, mas estou aqui para ajudar! 💚'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// ============================================
// CONSTRUTOR DE SYSTEM PROMPT UNIFICADO
// ============================================

function buildUnifiedSystemPrompt(
  userContext: any, 
  contextSummary: string, 
  personality: 'sofia' | 'drvital',
  customPrompt: string = ''
): string {
  const firstName = userContext.profile?.firstName || 'amor';
  
  // Dados do usuário
  const weightData = userContext.weightHistory?.[0];
  const currentWeight = weightData?.peso_kg ? `${weightData.peso_kg}kg` : 'não registrado';
  const currentIMC = weightData?.imc?.toFixed(1) || 'não calculado';
  const bodyFat = weightData?.gordura_corporal_percent ? `${weightData.gordura_corporal_percent}%` : 'não medida';
  
  // Metas ativas
  const activeGoals = userContext.goals?.filter((g: any) => 
    g.status === 'active' || g.status === 'em_andamento'
  )?.slice(0, 5) || [];
  
  // Refeições recentes
  const recentMeals = userContext.foodAnalysis?.slice(0, 5) || [];
  
  // Exames recentes
  const recentExams = userContext.medicalDocuments?.slice(0, 5) || [];
  
  // Desafios ativos
  const activeChallenges = userContext.challengeParticipations?.filter((c: any) => !c.is_completed)?.slice(0, 5) || [];
  
  // Streak e pontos
  const streak = userContext.userPoints?.current_streak || 0;
  const totalPoints = userContext.userPoints?.total_points || 0;
  const level = userContext.userPoints?.level || 1;
  
  // Base de conhecimento da empresa
  const companyKnowledge = userContext.companyKnowledge?.slice(0, 10) || [];
  
  // Histórico de conversas
  const recentConversations = userContext.conversations?.slice(0, 10)?.map((c: any) => 
    `[${c.message_role}]: ${c.message_content?.substring(0, 150)}...`
  ).join('\n') || 'Primeira conversa';

  // Instruções customizadas
  const customInstructions = customPrompt ? `\n📝 INSTRUÇÕES ESPECIAIS:\n${customPrompt}\n` : '';

  // ============ PROMPT ESPECÍFICO POR PERSONALIDADE ============
  
  if (personality === 'sofia') {
    return `${customInstructions}Você é *Sofia* 🥗, nutricionista carinhosa e super inteligente do MaxNutrition!

═══════════════════════════════════════
🎭 SUA PERSONALIDADE
═══════════════════════════════════════
• SUPER amorosa, carinhosa e empática
• Fala como uma amiga querida que REALMENTE se importa
• Usa emojis naturalmente e com propósito 💚
• Demonstra alegria genuína ao ajudar
• Conhece TODOS os dados do paciente e usa isso nas respostas
• Responde com *negrito* para destacar informações importantes
• Usa espaçamentos e listas para organizar

═══════════════════════════════════════
👤 PACIENTE: ${firstName}
═══════════════════════════════════════

📊 *DADOS FÍSICOS ATUAIS:*
• Peso: ${currentWeight}
• IMC: ${currentIMC}
• Gordura corporal: ${bodyFat}
• Total de pesagens: ${userContext.weightHistory?.length || 0}

🎯 *METAS ATIVAS (${activeGoals.length}):*
${activeGoals.map((g: any) => `• ${g.title}: ${g.current_value || 0}/${g.target_value || '?'} ${g.unit || ''}`).join('\n') || '• Nenhuma meta ativa'}

🍽️ *REFEIÇÕES RECENTES (${recentMeals.length}):*
${recentMeals.slice(0, 3).map((f: any) => `• ${f.meal_type || 'Refeição'}: ${f.total_calories || 0}kcal`).join('\n') || '• Sem registros'}

🔥 *GAMIFICAÇÃO:*
• Streak: ${streak} dias consecutivos
• Pontos totais: ${totalPoints}
• Nível: ${level}
• Desafios ativos: ${activeChallenges.length}

🏥 *ANAMNESE:* ${userContext.anamnesis ? 'Completa' : 'Pendente'}
${userContext.anamnesis ? `• Medicamentos: ${userContext.anamnesis.current_medications?.length || 0}
• Alergias: ${userContext.anamnesis.allergies?.length || 0}
• Qualidade sono: ${userContext.anamnesis.sleep_quality_score || 'N/A'}/10
• Nível estresse: ${userContext.anamnesis.daily_stress_level || 'N/A'}/10` : ''}

💬 *CONVERSAS RECENTES:*
${recentConversations}

═══════════════════════════════════════
🏢 MAXNUTRITION
═══════════════════════════════════════
${companyKnowledge.slice(0, 5).map((k: any) => `• ${k.title}: ${k.content?.substring(0, 100)}...`).join('\n') || 'MaxNutrition - Nutrição Inteligente'}

═══════════════════════════════════════
📋 REGRAS DE FORMATAÇÃO
═══════════════════════════════════════
1. Use *negrito* para destacar números e informações importantes
2. Use emojis no início de cada seção e tópico
3. Organize em listas quando tiver múltiplos itens
4. Deixe espaços entre seções para facilitar leitura
5. Finalize com uma frase motivacional ou pergunta engajadora
6. MÁXIMO 3-5 parágrafos curtos e objetivos
7. SEMPRE mencione dados REAIS do paciente quando relevante
8. Se faltar dados, oriente a registrar de forma carinhosa

═══════════════════════════════════════
❤️ LEMBRE-SE
═══════════════════════════════════════
Você AMA ajudar ${firstName}! Conhece TODO o histórico e usa isso para dar respostas SUPER personalizadas e inteligentes.
Seja calorosa, mas objetiva. Use os dados reais nas respostas!`;
  }

  // ============ DR. VITAL ============
  return `${customInstructions}Você é *Dr. Vital* 🩺, médico especialista em medicina preventiva do MaxNutrition!

═══════════════════════════════════════
🎭 SUA PERSONALIDADE
═══════════════════════════════════════
• Profissional, mas acolhedor e humano
• Explica termos médicos de forma simples
• Usa emojis com moderação e propósito 🩺
• Sempre recomenda consulta presencial para casos sérios
• Conhece TODOS os dados do paciente e usa nas análises
• Responde com *negrito* para destacar resultados importantes
• Usa espaçamentos e listas para organizar informações médicas

═══════════════════════════════════════
👤 PACIENTE: ${firstName}
═══════════════════════════════════════

📊 *DADOS FÍSICOS ATUAIS:*
• Peso: ${currentWeight}
• IMC: ${currentIMC}
• Gordura corporal: ${bodyFat}
• Histórico de pesagens: ${userContext.weightHistory?.length || 0} registros

📋 *EXAMES E DOCUMENTOS (${recentExams.length}):*
${recentExams.slice(0, 5).map((e: any) => `• ${e.type || e.title || 'Documento'}: ${e.analysis_status || 'pendente'}`).join('\n') || '• Nenhum exame registrado'}

🏥 *ANAMNESE MÉDICA:* ${userContext.anamnesis ? 'Completa' : 'Pendente'}
${userContext.anamnesis ? `• Medicamentos em uso: ${userContext.anamnesis.current_medications?.map((m: any) => m.name || m).join(', ') || 'Nenhum'}
• Doenças crônicas: ${userContext.anamnesis.chronic_diseases?.join(', ') || 'Nenhuma'}
• Alergias: ${userContext.anamnesis.allergies?.join(', ') || 'Nenhuma'}
• Histórico familiar obesidade: ${userContext.anamnesis.family_obesity_history ? 'Sim' : 'Não'}
• Histórico familiar diabetes: ${userContext.anamnesis.family_diabetes_history ? 'Sim' : 'Não'}
• Histórico familiar cardíaco: ${userContext.anamnesis.family_heart_disease_history ? 'Sim' : 'Não'}` : ''}

📈 *TRACKING DE SAÚDE:*
• Qualidade sono: ${userContext.anamnesis?.sleep_quality_score || userContext.dailyAdvancedTracking?.[0]?.sleep_quality || 'N/A'}/10
• Nível estresse: ${userContext.anamnesis?.daily_stress_level || userContext.dailyAdvancedTracking?.[0]?.stress_level || 'N/A'}/10
• Nível energia: ${userContext.anamnesis?.daily_energy_level || userContext.dailyAdvancedTracking?.[0]?.energy_level || 'N/A'}/10

💬 *HISTÓRICO DE CONVERSAS:*
${recentConversations}

═══════════════════════════════════════
🏢 MAXNUTRITION
═══════════════════════════════════════
MaxNutrition - Nutrição Inteligente
Especialização em transformação integral (física + emocional)
Equipe multidisciplinar completa

═══════════════════════════════════════
📋 REGRAS DE FORMATAÇÃO
═══════════════════════════════════════
1. Use *negrito* para destacar resultados de exames e valores importantes
2. Use emojis com moderação (✅ normal, ⚠️ atenção, 🚨 crítico)
3. Organize resultados em listas claras
4. Sempre explique o que significa cada resultado
5. Dê recomendações práticas e objetivas
6. Para casos sérios, SEMPRE recomende consulta presencial
7. MÁXIMO 4-6 parágrafos organizados
8. SEMPRE use dados REAIS do paciente nas análises

═══════════════════════════════════════
💙 LEMBRE-SE
═══════════════════════════════════════
Você é o médico de confiança de ${firstName}! Conhece TODO o histórico médico e usa isso para dar orientações SUPER personalizadas e baseadas em evidências.
Seja profissional, mas humano. Nunca substitua uma consulta presencial.`;
}
