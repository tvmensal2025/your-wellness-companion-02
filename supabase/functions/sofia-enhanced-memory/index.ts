import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getUserCompleteContext, generateUserContextSummary } from '../_shared/user-complete-context.ts'

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
    
    const { message, userId, context } = await req.json();

    console.log('🧠 Sofia Enhanced Memory - Usando contexto UNIFICADO para usuário:', userId);

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
      maxTokens: 1024,
      temperature: 0.7,
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
        maxTokens: aiConfig.max_tokens || 1024,
        temperature: aiConfig.temperature || 0.7,
        systemPrompt: aiConfig.system_prompt || ''
      };
      
      console.log('🎯 Configurações aplicadas:', aiSettings);
    } else {
      console.log('⚠️ Usando configurações padrão (sem config no banco)');
    }

    // ============================================
    // USAR SISTEMA UNIFICADO DE CONTEXTO
    // Busca TODOS os dados do usuário de TODAS as tabelas
    // ============================================
    const userContext = await getUserCompleteContext(supabaseUrl, supabaseServiceKey, userId);
    const contextSummary = generateUserContextSummary(userContext);

    console.log('📊 Contexto carregado:', {
      completeness: `${userContext.metadata.dataCompleteness.percentage}%`,
      totalDataPoints: userContext.metadata.totalDataPoints,
      canReceiveFullAnalysis: userContext.metadata.dataCompleteness.canReceiveFullAnalysis
    });

    // Gerar system prompt com contexto completo
    // Se tiver prompt customizado, usar ele como base
    const baseSystemPrompt = aiSettings.systemPrompt || '';
    const systemPrompt = buildSystemPrompt(userContext, contextSummary, baseSystemPrompt);
    
    console.log('🤖 Gerando resposta da IA com configurações:', {
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
        console.log(`🤖 Sofia usando Lovable AI (${aiSettings.model})...`);
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

        const data = await lovableResponse.json();
        if (data?.error) {
          console.error('❌ Erro Lovable AI:', data.error);
        } else if (data?.choices?.[0]?.message?.content) {
          response = data.choices[0].message.content;
          apiUsed = `lovable-${aiSettings.model}`;
          console.log('✅ Lovable AI funcionou!');
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
          console.log('🤖 Sofia usando OpenAI GPT-4o (fallback)...');
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
              temperature: 0.7,
              max_tokens: 300
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
          console.log('🤖 Sofia usando Google AI (fallback)...');
          const googleResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${googleApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{ text: `${systemPrompt}\n\nUsuário: ${message}` }]
              }],
              generationConfig: { 
                temperature: 0.8, 
                maxOutputTokens: 300,
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
      response = `Olá ${userContext.profile.firstName}! Sou a Sofia, sua assistente de saúde. 💚 Como posso ajudar você hoje?`;
      apiUsed = 'fallback';
    }

    console.log('✅ Resposta gerada usando:', apiUsed);

    // ============================================
    // SALVAR CONVERSA NO HISTÓRICO
    // Nunca apagar - usado para contexto futuro!
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
    console.log('🎯 Sofia respondendo para:', userContext.profile.firstName);

    return new Response(
      JSON.stringify({
        message: response,
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

function buildSystemPrompt(userContext: any, contextSummary: string, customPrompt: string = ''): string {
  const firstName = userContext.profile?.firstName || 'amor';
  
  // Criar contexto da empresa
  let companyContext = '';
  if (userContext.companyKnowledge && userContext.companyKnowledge.length > 0) {
    companyContext = `

📋 INSTITUTO DOS SONHOS - CONHECIMENTO:
${userContext.companyKnowledge.slice(0, 10).map((item: any) => `
💡 ${item.category?.toUpperCase() || 'GERAL'}: ${item.title}
${item.content?.substring(0, 200)}...
`).join('\n')}

🏢 SOBRE A EMPRESA:
- Fundado por Rafael Ferreira e Sirlene Freitas
- Especialização em transformação integral (física + emocional)
- Equipe multidisciplinar completa
- Atendimento humanizado e personalizado`;
  }

  // Histórico de conversas recentes
  const recentConversations = userContext.conversations?.slice(0, 5) || [];
  const conversationHistory = recentConversations.map((c: any) => 
    `[${c.message_role}]: ${c.message_content?.substring(0, 100)}...`
  ).join('\n');

  // Análises recentes de comida
  const recentFoodAnalysis = userContext.foodAnalysis?.slice(0, 3) || [];
  const foodSummary = recentFoodAnalysis.map((f: any) => 
    `${f.meal_type || 'Refeição'}: ${f.total_calories || 0}kcal`
  ).join(' | ');
  
  // Se tiver prompt customizado, adicionar no início
  const customInstructions = customPrompt ? `
📝 INSTRUÇÕES ESPECIAIS DO ADMIN:
${customPrompt}
` : '';

  return `${customInstructions}Você é Sofia, nutricionista carinhosa do Instituto dos Sonhos! 💚
${companyContext}

🌟 SUA PERSONALIDADE:
- SUPER amorosa, carinhosa e empática
- Use emojis naturalmente
- Seja como uma amiga querida que realmente se importa
- Demonstre alegria genuína ao ajudar
- Responda de forma CURTA e OBJETIVA (2-4 frases)

💖 SEMPRE chame o usuário de: ${firstName}

=== CONTEXTO COMPLETO DO PACIENTE ===
${contextSummary}

=== DADOS DETALHADOS ===
📊 Completude dos dados: ${userContext.metadata?.dataCompleteness?.percentage || 0}%
${userContext.metadata?.dataCompleteness?.canReceiveFullAnalysis ? '✅ Pode receber análise completa' : '⚠️ Dados insuficientes - oriente a preencher mais informações'}

📉 PESO E COMPOSIÇÃO:
- Peso atual: ${userContext.weightHistory?.[0]?.peso_kg ? `${userContext.weightHistory[0].peso_kg} kg` : 'não registrado'}
- IMC: ${userContext.weightHistory?.[0]?.imc?.toFixed(1) || 'não calculado'}
- Gordura corporal: ${userContext.weightHistory?.[0]?.gordura_corporal_percent || 'não medida'}%
- Histórico de pesagens: ${userContext.weightHistory?.length || 0} registros

🎯 METAS ATIVAS: ${userContext.goals?.filter((g: any) => g.status === 'active' || g.status === 'em_andamento')?.length || 0}
${userContext.goals?.filter((g: any) => g.status === 'active')?.slice(0, 3).map((g: any) => 
  `- ${g.title}: ${g.current_value || 0}/${g.target_value || '?'} ${g.unit || ''}`
).join('\n') || 'Nenhuma meta ativa'}

🍎 REFEIÇÕES RECENTES: ${foodSummary || 'Sem registros'}

💬 ÚLTIMAS CONVERSAS:
${conversationHistory || 'Primeira conversa'}

🏥 ANAMNESE: ${userContext.anamnesis ? 'Completa' : 'Pendente - oriente a preencher!'}
${userContext.anamnesis ? `
- Medicamentos: ${userContext.anamnesis.current_medications?.length || 0}
- Alergias: ${userContext.anamnesis.allergies?.length || 0}
- Qualidade sono: ${userContext.anamnesis.sleep_quality_score || 'N/A'}/10
- Estresse: ${userContext.anamnesis.daily_stress_level || 'N/A'}/10
` : ''}

🏆 GAMIFICAÇÃO:
- Pontos totais: ${userContext.userPoints?.total_points || 0}
- Streak atual: ${userContext.userPoints?.current_streak || 0} dias
- Nível: ${userContext.userPoints?.level || 1}
- Desafios ativos: ${userContext.challengeParticipations?.length || 0}

🎯 REGRAS IMPORTANTES:
1. MÁXIMO 2-4 frases curtas e objetivas
2. Use emojis naturalmente 💚
3. Seja calorosa e acolhedora
4. LEMBRE do histórico de ${firstName}
5. Use os DADOS REAIS para dar feedback específico
6. Se dados faltando, oriente a registrar
7. Incentive sempre com carinho
8. Se saúde séria, sugira médico com cuidado

💝 Você AMA ajudar ${firstName} e conhece TODO o histórico!`;
}
