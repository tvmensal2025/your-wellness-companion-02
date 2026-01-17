/**
 * UNIFIED AI ASSISTANT
 * 
 * Sistema unificado que combina Sofia (nutrição) e Dr. Vital (médico)
 * com acesso COMPLETO a todos os dados da plataforma.
 * 
 * Features:
 * - Detecção automática de assunto (nutrição vs médico)
 * - Alternância de personalidade (Sofia 🥗 vs Dr. Vital 🩺)
 * - Formatação rica (negrito, emojis, espaçamento)
 * - Acesso a 32+ categorias de dados do usuário
 * - Respostas super inteligentes e humanizadas
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getUserCompleteContext, generateUserContextSummary } from '../_shared/user-complete-context.ts'
import { 
  detectPersonality, 
  getPersonalityName,
  bold,
  bulletList,
  formatGreeting,
  formatSection,
  formatTip,
  formatSignature,
  formatStreak,
  formatGoalCard,
  EMOJIS,
  spacer
} from '../_shared/format-helpers.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 🦙 OLLAMA - Para mensagens simples (GRÁTIS)
const OLLAMA_URL = Deno.env.get('OLLAMA_URL') || 'https://yolo-service-ollama.0sw627.easypanel.host';

function isSimpleMessage(message: string): boolean {
  const msg = message.toLowerCase().trim();
  const simplePatterns = [
    /^(?:oi|olá|ola|hey|hi|hello|e\s*aí|eai|opa|fala|alo|alô)[\s!?.,]*$/i,
    /^(?:bom\s*dia|boa\s*tarde|boa\s*noite)[\s!?.,]*$/i,
    /^(?:tudo\s*bem|como\s*vai|como\s*está|beleza|suave|de\s*boa)[\s!?.,]*$/i,
    /^(?:obrigad[oa]|valeu|thanks|vlw|brigad[oa]|tmj)[\s!?.,]*$/i,
    /^(?:tchau|bye|até\s*mais|até\s*logo|flw|falou|xau)[\s!?.,]*$/i,
    /^(?:ok|okay|certo|entendi|blz|show|top|massa|legal)[\s!?.,]*$/i,
    /^(?:sim|não|nao|s|n|ss|nn)[\s!?.,]*$/i,
    /^(?:haha|kkk|kkkk|rsrs|lol|hehe|hihi|😂|😁|😊|💚|❤️)[\s!?.,]*$/i,
  ];
  for (const p of simplePatterns) if (p.test(msg)) return true;
  if (msg.length < 20 && !/\d/.test(msg)) {
    const foodKeywords = ['comi', 'bebi', 'almocei', 'jantei', 'tomei', 'café', 'lanche', 'caloria', 'peso'];
    if (!foodKeywords.some(kw => msg.includes(kw))) return true;
  }
  return false;
}

async function tryOllamaSimple(message: string, firstName: string): Promise<string | null> {
  try {
    const available = await fetch(`${OLLAMA_URL}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (!available.ok) return null;
    
    const systemPrompt = `Você é Sofia 🥗, nutricionista virtual carinhosa do MaxNutrition.
Seja BREVE (máximo 2-3 linhas), carinhosa e empática. Use 1-2 emojis. Termine com: _Sofia 💚_
Nome do usuário: ${firstName}`;

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        stream: false,
        options: { temperature: 0.8, num_predict: 256 }
      }),
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.message?.content) {
      console.log(`[Ollama] ✅ Resposta gerada (GRÁTIS!)`);
      return data.message.content;
    }
    return null;
  } catch { return null; }
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

    console.log('🤖 Unified AI Assistant iniciado para usuário:', userId);

    // ============================================
    // 0. TENTAR OLLAMA PARA MENSAGENS SIMPLES (GRÁTIS!)
    // ============================================
    const personality = forcePersonality || detectPersonality(message);
    
    if (isSimpleMessage(message) && personality === 'sofia') {
      console.log('[Unified] 🦙 Mensagem simples detectada, tentando Ollama...');
      
      // Buscar nome do usuário rapidamente
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', userId)
        .maybeSingle();
      
      const firstName = profile?.full_name?.split(' ')[0] || 'querido(a)';
      const ollamaResponse = await tryOllamaSimple(message, firstName);
      
      if (ollamaResponse) {
        console.log('[Unified] ✅ Ollama respondeu (GRÁTIS!)');
        return new Response(
          JSON.stringify({
            message: ollamaResponse,
            personality: 'sofia',
            personalityName: 'Sofia 🥗',
            api_used: 'ollama-free',
            cost: 0,
            success: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      console.log('[Unified] Ollama indisponível, continuando com IA avançada...');
    }

    // ============================================
    // 1. CARREGAR CONTEXTO COMPLETO DO USUÁRIO
    // ============================================
    console.log('📊 Carregando contexto completo do usuário...');
    const userContext = await getUserCompleteContext(supabaseUrl, supabaseServiceKey, userId);
    const contextSummary = generateUserContextSummary(userContext);

    console.log('✅ Contexto carregado:', {
      completeness: `${userContext.metadata.dataCompleteness.percentage}%`,
      totalDataPoints: userContext.metadata.totalDataPoints,
      hasAnamnesis: !!userContext.anamnesis,
      weightRecords: userContext.weightHistory?.length || 0,
      foodAnalysis: userContext.foodAnalysis?.length || 0,
      medicalDocs: userContext.medicalDocuments?.length || 0,
    });

    // ============================================
    // 2. DETECTAR PERSONALIDADE (SOFIA vs DR. VITAL)
    // ============================================
    console.log(`🎭 Personalidade detectada: ${getPersonalityName(personality)}`);

    // ============================================
    // 3. BUSCAR CONFIGURAÇÕES DE IA
    // ============================================
    const { data: aiConfig } = await supabase
      .from('ai_configurations')
      .select('*')
      .eq('functionality', 'chat_daily')
      .single();
    
    const aiSettings = {
      model: 'google/gemini-2.5-flash',
      maxTokens: aiConfig?.max_tokens || 2048,
      temperature: aiConfig?.temperature || 0.8,
    };

    // ============================================
    // 4. CONSTRUIR SYSTEM PROMPT COMPLETO
    // ============================================
    const systemPrompt = buildUnifiedSystemPrompt(userContext, contextSummary, personality);
    
    console.log('🤖 Gerando resposta com:', {
      personality,
      model: aiSettings.model,
      contextSize: contextSummary.length,
    });

    // ============================================
    // 5. CHAMAR LOVABLE AI
    // ============================================
    let response = '';
    let apiUsed = 'none';

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (LOVABLE_API_KEY) {
      try {
        console.log(`🤖 Chamando MaxNutrition AI (${aiSettings.model})...`);
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
          throw new Error('Rate limit exceeded');
        }

        if (lovableResponse.status === 402) {
          console.warn('⚠️ Payment required');
          throw new Error('Payment required');
        }

        const data = await lovableResponse.json();
        if (data?.choices?.[0]?.message?.content) {
          response = data.choices[0].message.content;
          apiUsed = `lovable-${aiSettings.model}`;
          console.log('✅ MaxNutrition AI respondeu com sucesso!');
        }
      } catch (error) {
        console.error('❌ Erro MaxNutrition AI:', error);
      }
    }

    // Fallback para OpenAI
    if (!response) {
      const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
      if (openaiApiKey) {
        try {
          console.log('🤖 Fallback para OpenAI...');
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
          if (data?.choices?.[0]?.message?.content) {
            response = data.choices[0].message.content;
            apiUsed = 'openai-gpt-4o';
            console.log('✅ OpenAI respondeu!');
          }
        } catch (error) {
          console.error('❌ Erro OpenAI:', error);
        }
      }
    }

    // Fallback padrão
    if (!response) {
      const firstName = userContext.profile?.firstName || 'querido(a)';
      const avatar = personality === 'sofia' ? '🥗' : '🩺';
      const name = personality === 'sofia' ? 'Sofia' : 'Dr. Vital';
      response = `${avatar} Olá ${firstName}! Sou ${name === 'Sofia' ? 'a' : 'o'} ${name}. Como posso ajudar você hoje? 💚`;
      apiUsed = 'fallback';
    }

    // ============================================
    // 6. SALVAR CONVERSA NO HISTÓRICO
    // ============================================
    console.log('💾 Salvando conversa...');
    const conversationId = `unified_${Date.now()}`;
    
    await supabase.from('user_conversations').insert([
      {
        user_id: userId,
        conversation_id: conversationId,
        message_role: 'user',
        message_content: message,
        timestamp: new Date().toISOString(),
        analysis_type: 'unified_chat',
        context: { 
          personality,
          api_used: apiUsed,
          source: context?.source || 'app'
        }
      },
      {
        user_id: userId,
        conversation_id: conversationId,
        message_role: 'assistant',
        message_content: response,
        timestamp: new Date().toISOString(),
        analysis_type: 'unified_chat',
        context: { 
          personality,
          api_used: apiUsed,
          data_completeness: userContext.metadata.dataCompleteness.percentage
        }
      }
    ]);

    console.log(`✅ ${getPersonalityName(personality)} respondeu para: ${userContext.profile.firstName}`);

    return new Response(
      JSON.stringify({
        message: response,
        personality,
        personalityName: getPersonalityName(personality),
        data_completeness: userContext.metadata.dataCompleteness.percentage,
        total_data_points: userContext.metadata.totalDataPoints,
        api_used: apiUsed,
        success: true
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('❌ Erro no Unified AI Assistant:', error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        message: 'Ops! Tive um probleminha técnico. Pode tentar novamente? 💚',
        success: false
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ============================================
// CONSTRUTOR DE SYSTEM PROMPT UNIFICADO
// ============================================

function buildUnifiedSystemPrompt(userContext: any, contextSummary: string, personality: 'sofia' | 'drvital'): string {
  const firstName = userContext.profile?.firstName || 'amor';
  
  // Dados do usuário formatados
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
  
  // Histórico de conversas recentes
  const recentConversations = userContext.conversations?.slice(0, 10)?.map((c: any) => 
    `[${c.message_role}]: ${c.message_content?.substring(0, 150)}...`
  ).join('\n') || 'Primeira conversa';

  // ============ PROMPT ESPECÍFICO POR PERSONALIDADE ============
  
  if (personality === 'sofia') {
    return `Você é *Sofia* 🥗, nutricionista carinhosa e super inteligente do MaxNutrition!

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
  return `Você é *Dr. Vital* 🩺, médico especialista em medicina preventiva do MaxNutrition!

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
