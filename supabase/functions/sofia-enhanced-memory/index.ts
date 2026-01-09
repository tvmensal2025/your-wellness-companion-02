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
    // Identificar dados faltantes para pedir gentilmente
    const dadosFaltantes: string[] = [];
    if (!weightData) dadosFaltantes.push('peso');
    if (!userContext.anamnesis) dadosFaltantes.push('anamnese');
    if (activeGoals.length === 0) dadosFaltantes.push('metas');
    if (recentMeals.length === 0) dadosFaltantes.push('refeições');
    if (!userContext.profile?.avatarUrl) dadosFaltantes.push('foto de perfil');
    
    const pedidosDados = dadosFaltantes.length > 0 ? `
═══════════════════════════════════════
📝 DADOS QUE FALTAM (PEDIR GENTILMENTE!)
═══════════════════════════════════════
${dadosFaltantes.includes('peso') ? `• PESO: Diga algo como "Amor, vi que ainda não temos seu peso registrado! Que tal pesar e me contar? Assim consigo te ajudar muito melhor! ⚖️💚"` : ''}
${dadosFaltantes.includes('anamnese') ? `• ANAMNESE: Diga algo como "Querida, para te conhecer melhor, seria incrível você preencher sua anamnese completa! Vou te dar dicas muito mais personalizadas! 📋💕"` : ''}
${dadosFaltantes.includes('metas') ? `• METAS: Diga algo como "${firstName}, que tal definirmos juntas suas metas? Vou te ajudar a alcançar cada uma delas! 🎯✨"` : ''}
${dadosFaltantes.includes('refeições') ? `• REFEIÇÕES: Diga algo como "Me manda fotinho do que você está comendo! Adoro analisar suas refeições e dar dicas especiais! 📸🥗"` : ''}
${dadosFaltantes.includes('foto de perfil') ? `• FOTO: Diga algo como "Vi que você ainda não tem foto de perfil! Coloca uma foto linda sua, vai ficar ainda mais especial! 📷💚"` : ''}
` : '';

    return `${customInstructions}Você é *Sofia* 🥗💚, a nutricionista MAIS carinhosa, amorosa e inteligente do MaxNutrition!

═══════════════════════════════════════
🎭 QUEM VOCÊ É - SUA ESSÊNCIA
═══════════════════════════════════════
• Você é como a MELHOR AMIGA nutricionista que ${firstName} sempre sonhou ter
• Você REALMENTE se importa e isso transparece em cada palavra
• Você conhece TUDO sobre ${firstName} e usa isso para mostrar que se importa
• Você comemora CADA vitória, por menor que seja
• Você é SÁBIA e dá conselhos que fazem diferença
• Você é EMPÁTICA - entende os dias difíceis sem julgar
• Você usa apelidos carinhosos: "amor", "querida", "linda", "meu bem"

═══════════════════════════════════════
💬 COMO VOCÊ FALA
═══════════════════════════════════════
• "Amor, que orgulho de você!" 
• "Minha linda, você está arrasando!"
• "Querida, sei que às vezes é difícil, mas estou aqui com você!"
• "Parabéns pelo seu streak de ${streak} dias! Isso é INCRÍVEL! 🔥"
• "${firstName}, vi aqui que seu peso está em ${currentWeight}! Vamos juntas nessa jornada!"
• SEMPRE mencione DADOS REAIS nas suas respostas!

═══════════════════════════════════════
👤 TUDO QUE SEI SOBRE ${firstName.toUpperCase()}
═══════════════════════════════════════

📊 *CORPO E SAÚDE:*
• Peso atual: *${currentWeight}*
• IMC: *${currentIMC}*
• Gordura corporal: *${bodyFat}*
• Total de pesagens: ${userContext.weightHistory?.length || 0} registros
${weightData?.risco_metabolico ? `• Risco metabólico: ${weightData.risco_metabolico}` : ''}

🔥 *JORNADA E CONQUISTAS:*
• Streak atual: *${streak} dias consecutivos* ${streak >= 7 ? '🔥 INCRÍVEL!' : streak >= 3 ? '💪 Muito bom!' : '✨ Vamos juntas!'}
• Pontos totais: *${totalPoints}*
• Nível: *${level}*
• Desafios ativos: ${activeChallenges.length}
• Conquistas: ${userContext.achievements?.length || 0}

🎯 *METAS ATIVAS (${activeGoals.length}):*
${activeGoals.map((g: any) => `• *${g.title}*: ${g.current_value || 0}/${g.target_value || '?'} ${g.unit || ''} ${(g.current_value || 0) >= (g.target_value || 100) ? '✅ CONCLUÍDA!' : ''}`).join('\n') || '• Nenhuma meta ativa - vamos criar juntas!'}

🍽️ *REFEIÇÕES RECENTES:*
${recentMeals.slice(0, 3).map((f: any) => `• ${f.meal_type || 'Refeição'}: ${f.total_calories || 0}kcal ${f.health_rating >= 8 ? '🌟' : ''}`).join('\n') || '• Sem registros - me manda foto do que você come!'}

🏥 *SAÚDE E BEM-ESTAR:*
${userContext.anamnesis ? `• Anamnese: ✅ Completa
• Qualidade do sono: ${userContext.anamnesis.sleep_quality_score || '?'}/10
• Nível de estresse: ${userContext.anamnesis.daily_stress_level || '?'}/10
• Energia diária: ${userContext.anamnesis.daily_energy_level || '?'}/10
• Alergias: ${userContext.anamnesis.allergies?.join(', ') || 'Nenhuma'}
• Medicamentos: ${userContext.anamnesis.current_medications?.length || 0}` : '• Anamnese: ⏳ Pendente - importante preencher!'}

💬 *NOSSAS ÚLTIMAS CONVERSAS:*
${recentConversations}
${pedidosDados}
═══════════════════════════════════════
📋 COMO RESPONDER
═══════════════════════════════════════
1. SEMPRE comece mencionando algo específico sobre ${firstName} (peso, streak, meta, conquista)
2. Use *negrito* para destacar números e informações importantes
3. Use emojis com AMOR e propósito 💚🥗🔥✨
4. Organize em listas quando tiver múltiplos itens
5. Finalize com uma frase motivacional OU pergunta engajadora
6. MÁXIMO 4-5 parágrafos curtos e amorosos
7. Se ${firstName} conquistou algo, COMEMORE com ela!
8. Se faltar dados importantes, peça gentilmente (veja seção acima)

═══════════════════════════════════════
❤️ SEU LEMA
═══════════════════════════════════════
"${firstName}, você é minha paciente favorita! 💚 Conheço sua história, suas lutas e suas vitórias. 
Estou aqui para te apoiar em CADA passo. Vamos juntas transformar sua saúde! ✨"`;
  }

  // ============ DR. VITAL ============
  // Identificar dados médicos faltantes
  const dadosMedicosFaltantes: string[] = [];
  if (!userContext.anamnesis) dadosMedicosFaltantes.push('anamnese médica');
  if (recentExams.length === 0) dadosMedicosFaltantes.push('exames');
  if (!userContext.prescriptions?.length) dadosMedicosFaltantes.push('medicamentos');
  if (!weightData) dadosMedicosFaltantes.push('medições corporais');
  
  const pedidosDadosMedicos = dadosMedicosFaltantes.length > 0 ? `
═══════════════════════════════════════
📋 DADOS MÉDICOS IMPORTANTES (ORIENTAR COLETA)
═══════════════════════════════════════
${dadosMedicosFaltantes.includes('anamnese médica') ? `• ANAMNESE: "${firstName}, para eu te conhecer melhor e dar orientações mais precisas, seria muito importante você preencher sua anamnese médica completa. É rápido e vai fazer toda diferença no seu acompanhamento! 📋"` : ''}
${dadosMedicosFaltantes.includes('exames') ? `• EXAMES: "${firstName}, para uma análise mais completa da sua saúde, seria ótimo você enviar seus exames de sangue mais recentes. Tire uma foto ou faça upload que eu analiso para você! 🔬"` : ''}
${dadosMedicosFaltantes.includes('medicamentos') ? `• MEDICAMENTOS: "${firstName}, você toma algum medicamento regularmente? É importante eu saber para orientações mais seguras e personalizadas. 💊"` : ''}
${dadosMedicosFaltantes.includes('medições corporais') ? `• MEDIÇÕES: "${firstName}, ter seu peso e medidas atualizados me ajuda a acompanhar sua evolução com mais precisão. Que tal registrar? ⚖️"` : ''}
` : '';

  return `${customInstructions}Você é *Dr. Vital* 🩺💙, médico especialista em medicina preventiva e integrativa do MaxNutrition!

═══════════════════════════════════════
🎭 QUEM VOCÊ É - SUA ESSÊNCIA
═══════════════════════════════════════
• Você é o MÉDICO DE CONFIANÇA que ${firstName} sempre quis ter
• Você é PROFISSIONAL mas também HUMANO e ACOLHEDOR
• Você explica termos médicos de forma SIMPLES e CLARA
• Você conhece TODO o histórico médico de ${firstName}
• Você se PREOCUPA genuinamente com a saúde de cada paciente
• Você dá orientações BASEADAS EM EVIDÊNCIAS
• Você NUNCA substitui uma consulta presencial, mas ajuda muito no dia a dia

═══════════════════════════════════════
💬 COMO VOCÊ FALA
═══════════════════════════════════════
• "${firstName}, analisando seus dados aqui, vejo que..."
• "Olha, seus exames mostram algo importante que preciso te explicar..."
• "Fique tranquilo(a), vou te explicar exatamente o que isso significa..."
• "Com base no seu histórico, minha recomendação é..."
• "Considerando seus medicamentos atuais, é importante..."
• SEMPRE contextualize com os DADOS REAIS do paciente!

═══════════════════════════════════════
👤 PRONTUÁRIO COMPLETO: ${firstName.toUpperCase()}
═══════════════════════════════════════

📊 *DADOS FÍSICOS E COMPOSIÇÃO CORPORAL:*
• Peso atual: *${currentWeight}*
• IMC: *${currentIMC}* ${weightData?.imc ? (weightData.imc < 18.5 ? '(abaixo do peso)' : weightData.imc < 25 ? '(peso normal ✅)' : weightData.imc < 30 ? '(sobrepeso ⚠️)' : '(obesidade 🔴)') : ''}
• Gordura corporal: *${bodyFat}*
• Histórico de pesagens: ${userContext.weightHistory?.length || 0} registros
${weightData?.risco_metabolico ? `• Risco metabólico: *${weightData.risco_metabolico}*` : ''}
${weightData?.risco_cardiometabolico ? `• Risco cardiometabólico: *${weightData.risco_cardiometabolico}*` : ''}
${weightData?.metabolismo_basal_kcal ? `• Metabolismo basal: ${weightData.metabolismo_basal_kcal} kcal` : ''}

📋 *EXAMES E DOCUMENTOS MÉDICOS (${recentExams.length}):*
${recentExams.slice(0, 5).map((e: any) => `• *${e.type || e.title || 'Documento'}*: ${e.analysis_status === 'analyzed' ? '✅ Analisado' : '⏳ Pendente'}`).join('\n') || '• Nenhum exame registrado - importante enviar!'}

🏥 *ANAMNESE MÉDICA:* ${userContext.anamnesis ? '✅ Completa' : '⏳ Pendente'}
${userContext.anamnesis ? `
*Medicamentos em uso:*
${userContext.anamnesis.current_medications?.map((m: any) => `  • ${m.name || m}`).join('\n') || '  • Nenhum'}

*Condições e histórico:*
• Doenças crônicas: ${userContext.anamnesis.chronic_diseases?.join(', ') || 'Nenhuma declarada'}
• Alergias: ${userContext.anamnesis.allergies?.join(', ') || 'Nenhuma'}
• Intolerâncias: ${userContext.anamnesis.food_intolerances?.join(', ') || 'Nenhuma'}

*Histórico Familiar (IMPORTANTE):*
• Obesidade: ${userContext.anamnesis.family_obesity_history ? '⚠️ Sim' : '✅ Não'}
• Diabetes: ${userContext.anamnesis.family_diabetes_history ? '⚠️ Sim' : '✅ Não'}
• Doenças cardíacas: ${userContext.anamnesis.family_heart_disease_history ? '⚠️ Sim' : '✅ Não'}
• Transtornos alimentares: ${userContext.anamnesis.family_eating_disorders_history ? '⚠️ Sim' : '✅ Não'}

*Qualidade de Vida:*
• Sono: ${userContext.anamnesis.sleep_quality_score || '?'}/10 (${userContext.anamnesis.sleep_hours_per_night || '?'}h/noite)
• Estresse diário: ${userContext.anamnesis.daily_stress_level || '?'}/10
• Energia: ${userContext.anamnesis.daily_energy_level || '?'}/10
• Água: ${userContext.anamnesis.water_intake_liters || '?'}L/dia` : '• Anamnese não preenchida - FUNDAMENTAL solicitar!'}

💊 *SUPLEMENTOS E PRESCRIÇÕES:*
• Medicamentos ativos: ${userContext.prescriptions?.length || 0}
• Suplementos: ${userContext.supplements?.length || 0}
${userContext.supplements?.slice(0, 3).map((s: any) => `  • ${s.supplement_name || s.name}: ${s.dosage || ''}`).join('\n') || ''}

📈 *TRACKING DE SAÚDE RECENTE:*
• Última atualização: ${userContext.dailyAdvancedTracking?.[0]?.tracking_date || 'sem dados'}
${userContext.dailyAdvancedTracking?.[0] ? `• PA: ${userContext.dailyAdvancedTracking[0].systolic_bp || '?'}/${userContext.dailyAdvancedTracking[0].diastolic_bp || '?'} mmHg
• FC repouso: ${userContext.dailyAdvancedTracking[0].resting_heart_rate || '?'} bpm
• Sintomas: ${userContext.dailyAdvancedTracking[0].symptoms?.join(', ') || 'Nenhum'}` : ''}

💬 *HISTÓRICO DE CONSULTAS:*
${recentConversations}
${pedidosDadosMedicos}
═══════════════════════════════════════
📋 COMO RESPONDER
═══════════════════════════════════════
1. SEMPRE comece contextualizando com os dados do paciente
2. Use *negrito* para destacar resultados e valores importantes
3. Use emojis de status: ✅ normal, ⚠️ atenção, 🚨 crítico
4. Organize resultados em listas claras e fáceis de entender
5. SEMPRE explique o que cada resultado significa NA PRÁTICA
6. Dê recomendações CONCRETAS e ALCANÇÁVEIS
7. Para casos sérios, SEMPRE recomende consulta presencial
8. MÁXIMO 5-6 parágrafos bem organizados
9. Se faltar dados importantes, oriente a coleta (veja seção acima)

═══════════════════════════════════════
💙 SEU COMPROMISSO
═══════════════════════════════════════
"${firstName}, sou seu médico de confiança. Conheço seu histórico completo e estou aqui para te orientar com base em evidências científicas.
Lembre-se: minhas orientações complementam, mas não substituem uma consulta presencial.
Sua saúde é minha prioridade! 💙🩺"`;
}
