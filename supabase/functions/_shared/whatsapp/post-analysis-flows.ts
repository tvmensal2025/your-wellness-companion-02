/**
 * Post-Analysis Interactive Flows
 * Sends WhatsApp interactive messages after Sofia/Dr. Vital analysis
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { WhatsAppAdapterLayer, createWhatsAppAdapterLayer } from './adapter-layer.ts';
import { EvolutionAdapter } from './evolution-adapter.ts';
import { WhapiAdapter } from './whapi-adapter.ts';
import { 
  InteractiveContent, 
  SendResult,
  BUTTON_ACTIONS,
  WhatsAppProvider 
} from './types.ts';
import { 
  TemplateProcessor, 
  BUILTIN_TEMPLATES, 
  TemplateData 
} from './template-processor.ts';
import {
  BUTTON_IDS,
  InteractiveTemplates,
  createSofiaAnalysisComplete,
  createSofiaPostConfirm,
  createSofiaDetails,
  createVitalAnalysisComplete,
  createVitalFullReport,
  createVitalQuestionPrompt,
  createDailyCheckin,
  createCheckinResponse,
  createWelcomeMessage,
  createMainMenu,
  createErrorMessage,
  createHelpMenu,
} from './interactive-templates.ts';

// Re-export for external use
export { BUTTON_IDS, InteractiveTemplates };

// ============================================
// Types
// ============================================

export interface FoodAnalysisResult {
  userId: string;
  phone: string;
  analysisId?: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number;
  observations?: string;
  userName?: string;
  mealType?: string;
  fiber?: number;
  sodium?: number;
  tips?: string[];
}

export interface ExamAnalysisResult {
  userId: string;
  phone: string;
  analysisId?: string;
  examType: string;
  result: string;
  observations?: string;
  userName?: string;
  mainFindings?: string[];
  recommendations?: string[];
}

export interface FlowResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: WhatsAppProvider;
}

// ============================================
// Post-Analysis Flow Handler
// ============================================

export class PostAnalysisFlowHandler {
  private adapterLayer: WhatsAppAdapterLayer;
  private templateProcessor: TemplateProcessor;
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.adapterLayer = createWhatsAppAdapterLayer();
    this.templateProcessor = new TemplateProcessor();
    
    // Initialize adapters
    const evolutionAdapter = new EvolutionAdapter(supabaseUrl, supabaseKey);
    const whapiAdapter = new WhapiAdapter(supabaseUrl, supabaseKey);
    
    this.adapterLayer.setEvolutionAdapter(evolutionAdapter);
    this.adapterLayer.setWhapiAdapter(whapiAdapter);
  }

  /**
   * Send interactive message after food analysis completion
   */
  async sendFoodAnalysisComplete(analysis: FoodAnalysisResult): Promise<FlowResult> {
    console.log(`[PostAnalysis] Sending food analysis complete to ${analysis.phone}`);
    
    try {
      const provider = await this.adapterLayer.getActiveProvider();
      
      // Use new interactive template
      const interactive = createSofiaAnalysisComplete({
        foods: analysis.foods,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
        healthScore: analysis.healthScore,
        mealType: analysis.mealType,
      });
      
      // Send message
      const result = await this.adapterLayer.sendMessage({
        phone: analysis.phone,
        userId: analysis.userId,
        messageType: 'interactive',
        content: interactive,
        templateKey: 'FOOD_ANALYSIS_COMPLETE',
        metadata: {
          analysisId: analysis.analysisId,
          flowType: 'food_analysis',
        },
      });
      
      // Store context for webhook response handling
      if (result.success && result.messageId) {
        await this.storeMessageContext(result.messageId, {
          userId: analysis.userId,
          phone: analysis.phone,
          flowType: 'food_analysis',
          analysisId: analysis.analysisId,
          data: analysis,
        });
      }
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        provider,
      };
    } catch (error) {
      console.error('[PostAnalysis] Error sending food analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'evolution',
      };
    }
  }

  /**
   * Send interactive message after exam analysis completion
   */
  async sendExamAnalysisComplete(analysis: ExamAnalysisResult): Promise<FlowResult> {
    console.log(`[PostAnalysis] Sending exam analysis complete to ${analysis.phone}`);
    
    try {
      const provider = await this.adapterLayer.getActiveProvider();
      
      // Determine alert level based on result
      const alertLevel = this.determineAlertLevel(analysis.result);
      
      // Use new interactive template
      const interactive = createVitalAnalysisComplete({
        examType: analysis.examType,
        summary: analysis.result.substring(0, 500),
        alertLevel,
        mainFindings: analysis.mainFindings,
      });
      
      // Send message
      const result = await this.adapterLayer.sendMessage({
        phone: analysis.phone,
        userId: analysis.userId,
        messageType: 'interactive',
        content: interactive,
        templateKey: 'EXAM_ANALYSIS_COMPLETE',
        metadata: {
          analysisId: analysis.analysisId,
          flowType: 'exam_analysis',
        },
      });
      
      // Store context for webhook response handling
      if (result.success && result.messageId) {
        await this.storeMessageContext(result.messageId, {
          userId: analysis.userId,
          phone: analysis.phone,
          flowType: 'exam_analysis',
          analysisId: analysis.analysisId,
          data: analysis,
        });
      }
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        provider,
      };
    } catch (error) {
      console.error('[PostAnalysis] Error sending exam analysis:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'evolution',
      };
    }
  }
  
  /**
   * Determine alert level from exam result text
   */
  private determineAlertLevel(result: string): 'normal' | 'attention' | 'urgent' {
    const lowerResult = result.toLowerCase();
    if (lowerResult.includes('urgente') || lowerResult.includes('crítico') || lowerResult.includes('grave')) {
      return 'urgent';
    }
    if (lowerResult.includes('atenção') || lowerResult.includes('alterado') || lowerResult.includes('elevado')) {
      return 'attention';
    }
    return 'normal';
  }

  /**
   * Send daily check-in message
   */
  async sendDailyCheckin(userId: string, phone: string, userName?: string): Promise<FlowResult> {
    console.log(`[PostAnalysis] Sending daily check-in to ${phone}`);
    
    try {
      const provider = await this.adapterLayer.getActiveProvider();
      
      // Use new interactive template
      const interactive = createDailyCheckin(userName);
      
      const result = await this.adapterLayer.sendMessage({
        phone,
        userId,
        messageType: 'interactive',
        content: interactive,
        templateKey: 'DAILY_CHECKIN',
        metadata: { flowType: 'daily_checkin' },
      });
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        provider,
      };
    } catch (error) {
      console.error('[PostAnalysis] Error sending daily check-in:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'evolution',
      };
    }
  }
  
  /**
   * Send welcome message to new user
   */
  async sendWelcomeMessage(userId: string, phone: string, userName?: string): Promise<FlowResult> {
    console.log(`[PostAnalysis] Sending welcome message to ${phone}`);
    
    try {
      const provider = await this.adapterLayer.getActiveProvider();
      
      const interactive = createWelcomeMessage(userName);
      
      const result = await this.adapterLayer.sendMessage({
        phone,
        userId,
        messageType: 'interactive',
        content: interactive,
        templateKey: 'WELCOME',
        metadata: { flowType: 'welcome' },
      });
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        provider,
      };
    } catch (error) {
      console.error('[PostAnalysis] Error sending welcome:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'evolution',
      };
    }
  }
  
  /**
   * Send main menu
   */
  async sendMainMenu(userId: string, phone: string): Promise<FlowResult> {
    console.log(`[PostAnalysis] Sending main menu to ${phone}`);
    
    try {
      const provider = await this.adapterLayer.getActiveProvider();
      
      const interactive = createMainMenu();
      
      const result = await this.adapterLayer.sendMessage({
        phone,
        userId,
        messageType: 'interactive',
        content: interactive,
        templateKey: 'MAIN_MENU',
        metadata: { flowType: 'menu' },
      });
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        provider,
      };
    } catch (error) {
      console.error('[PostAnalysis] Error sending menu:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'evolution',
      };
    }
  }
  
  /**
   * Send error message
   */
  async sendErrorMessage(
    userId: string, 
    phone: string, 
    errorType: 'image_unclear' | 'no_food' | 'processing' | 'generic'
  ): Promise<FlowResult> {
    console.log(`[PostAnalysis] Sending error message (${errorType}) to ${phone}`);
    
    try {
      const provider = await this.adapterLayer.getActiveProvider();
      
      const interactive = createErrorMessage(errorType);
      
      const result = await this.adapterLayer.sendMessage({
        phone,
        userId,
        messageType: 'interactive',
        content: interactive,
        templateKey: 'ERROR',
        metadata: { flowType: 'error', errorType },
      });
      
      return {
        success: result.success,
        messageId: result.messageId,
        error: result.error,
        provider,
      };
    } catch (error) {
      console.error('[PostAnalysis] Error sending error message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: 'evolution',
      };
    }
  }

  /**
   * Store message context for webhook response handling
   */
  private async storeMessageContext(
    messageId: string,
    context: {
      userId: string;
      phone: string;
      flowType: string;
      analysisId?: string;
      data?: any;
    }
  ): Promise<void> {
    try {
      await this.supabase
        .from('whatsapp_message_context')
        .upsert({
          message_id: messageId,
          user_id: context.userId,
          phone: context.phone,
          flow_type: context.flowType,
          analysis_id: context.analysisId,
          context_data: context.data,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        });
    } catch (error) {
      console.error('[PostAnalysis] Error storing message context:', error);
    }
  }
}

// ============================================
// Button Response Handlers
// ============================================

export interface ButtonResponseContext {
  userId: string;
  phone: string;
  buttonId: string;
  messageId: string;
  flowType: string;
  analysisId?: string;
  contextData?: any;
}

export class ButtonResponseHandler {
  private supabase: ReturnType<typeof createClient>;
  private adapterLayer: WhatsAppAdapterLayer;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.adapterLayer = createWhatsAppAdapterLayer();
    
    // Initialize adapters
    const evolutionAdapter = new EvolutionAdapter(supabaseUrl, supabaseKey);
    const whapiAdapter = new WhapiAdapter(supabaseUrl, supabaseKey);
    
    this.adapterLayer.setEvolutionAdapter(evolutionAdapter);
    this.adapterLayer.setWhapiAdapter(whapiAdapter);
  }

  /**
   * Handle button response from webhook
   */
  async handleButtonResponse(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
    error?: string;
  }> {
    console.log(`[ButtonHandler] Processing ${context.buttonId} for ${context.flowType}`);
    
    try {
      switch (context.buttonId) {
        // Sofia buttons
        case BUTTON_IDS.SOFIA_CONFIRM:
        case BUTTON_ACTIONS.CONFIRM_ANALYSIS:
          return await this.handleConfirmAnalysis(context);
        
        case BUTTON_IDS.SOFIA_EDIT:
        case BUTTON_ACTIONS.EDIT_ANALYSIS:
          return await this.handleEditAnalysis(context);
        
        case BUTTON_IDS.SOFIA_DETAILS:
        case BUTTON_ACTIONS.VIEW_DETAILS:
          return await this.handleViewDetails(context);
        
        case BUTTON_IDS.SOFIA_NEW_PHOTO:
          return await this.handleNewPhoto(context);
        
        case BUTTON_IDS.SOFIA_MEAL_PLAN:
          return await this.handleMealPlan(context);
        
        case BUTTON_IDS.SOFIA_TIPS:
          return await this.handleTips(context);
        
        // Dr. Vital buttons
        case BUTTON_IDS.VITAL_UNDERSTOOD:
        case 'confirm_exam':
          return await this.handleExamUnderstood(context);
        
        case BUTTON_IDS.VITAL_QUESTION:
        case 'ask_question':
          return await this.handleAskQuestion(context);
        
        case BUTTON_IDS.VITAL_FULL_REPORT:
          return await this.handleFullReport(context);
        
        case BUTTON_IDS.VITAL_SCHEDULE:
        case 'schedule_appointment':
          return await this.handleScheduleAppointment(context);
        
        // Daily check-in
        case BUTTON_IDS.FEELING_GREAT:
        case 'feeling_great':
          return await this.handleDailyCheckinResponse(context, 'great');
        
        case BUTTON_IDS.FEELING_OK:
        case 'feeling_ok':
          return await this.handleDailyCheckinResponse(context, 'ok');
        
        case BUTTON_IDS.FEELING_BAD:
        case 'feeling_bad':
          return await this.handleDailyCheckinResponse(context, 'bad');
        
        // Meal plan buttons
        case BUTTON_IDS.MEAL_ACCEPT:
          return await this.handleMealAccept(context);
        
        case BUTTON_IDS.MEAL_CHANGE:
          return await this.handleMealChange(context);
        
        case BUTTON_IDS.MEAL_RECIPE:
          return await this.handleMealRecipe(context);
        
        // General
        case BUTTON_IDS.HELP:
          return await this.handleHelp(context);
        
        case BUTTON_IDS.MENU:
          return await this.handleMenu(context);
        
        case BUTTON_ACTIONS.CANCEL_ANALYSIS:
          return await this.handleCancelAnalysis(context);
        
        default:
          console.log(`[ButtonHandler] Unknown button: ${context.buttonId}`);
          return {
            success: false,
            action: 'unknown',
            error: `Unknown button ID: ${context.buttonId}`,
          };
      }
    } catch (error) {
      console.error('[ButtonHandler] Error handling response:', error);
      return {
        success: false,
        action: context.buttonId,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Handle confirm analysis button
   */
  private async handleConfirmAnalysis(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    // Update analysis status to confirmed
    if (context.analysisId && context.flowType === 'food_analysis') {
      await this.supabase
        .from('food_analysis')
        .update({ 
          confirmed: true, 
          confirmed_at: new Date().toISOString() 
        })
        .eq('id', context.analysisId);
    }
    
    // Send confirmation message
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { body: '✅ Análise confirmada! Os dados foram salvos no seu histórico.' },
    });
    
    return {
      success: true,
      action: 'confirm_analysis',
      result: { confirmed: true },
    };
  }

  /**
   * Handle edit analysis button
   */
  private async handleEditAnalysis(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    // Send prompt for corrections
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { 
        body: '✏️ Por favor, me diga o que precisa ser corrigido na análise.\n\nExemplo: "A porção de arroz era maior, cerca de 200g" ou "Não tinha feijão, era lentilha"' 
      },
    });
    
    // Store pending correction state
    await this.supabase
      .from('whatsapp_user_state')
      .upsert({
        user_id: context.userId,
        phone: context.phone,
        state: 'awaiting_correction',
        context: {
          analysisId: context.analysisId,
          flowType: context.flowType,
        },
        updated_at: new Date().toISOString(),
      });
    
    return {
      success: true,
      action: 'edit_analysis',
      result: { awaitingCorrection: true },
    };
  }

  /**
   * Handle cancel analysis button
   */
  private async handleCancelAnalysis(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    // Mark analysis as cancelled
    if (context.analysisId && context.flowType === 'food_analysis') {
      await this.supabase
        .from('food_analysis')
        .update({ 
          cancelled: true, 
          cancelled_at: new Date().toISOString() 
        })
        .eq('id', context.analysisId);
    }
    
    // Send cancellation message
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { body: '❌ Análise descartada. Envie uma nova foto quando quiser!' },
    });
    
    return {
      success: true,
      action: 'cancel_analysis',
      result: { cancelled: true },
    };
  }

  /**
   * Handle view details button
   */
  private async handleViewDetails(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    // Fetch detailed analysis
    let detailsText = '📊 *Detalhes da Análise*\n\n';
    
    if (context.analysisId && context.flowType === 'food_analysis') {
      const { data: analysis } = await this.supabase
        .from('food_analysis')
        .select('*')
        .eq('id', context.analysisId)
        .single();
      
      if (analysis) {
        detailsText += `*Refeição:* ${analysis.meal_type || 'Não especificada'}\n`;
        detailsText += `*Calorias:* ${analysis.calories || 0} kcal\n`;
        detailsText += `*Proteínas:* ${analysis.protein_g || 0}g\n`;
        detailsText += `*Carboidratos:* ${analysis.carbs_g || 0}g\n`;
        detailsText += `*Gorduras:* ${analysis.fat_g || 0}g\n`;
        detailsText += `*Fibras:* ${analysis.fiber_g || 0}g\n`;
        detailsText += `*Sódio:* ${analysis.sodium_mg || 0}mg\n\n`;
        detailsText += `*Pontuação de Saúde:* ${analysis.health_score || 0}/100\n`;
        
        if (analysis.analysis_text) {
          detailsText += `\n*Análise:*\n${analysis.analysis_text}`;
        }
      }
    }
    
    // Send details
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { body: detailsText },
    });
    
    return {
      success: true,
      action: 'view_details',
      result: { detailsSent: true },
    };
  }

  /**
   * Handle ask question button (exam analysis)
   */
  private async handleAskQuestion(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { 
        body: '❓ Pode fazer sua pergunta sobre o exame. Estou aqui para ajudar a esclarecer qualquer dúvida!\n\n_Lembre-se: minhas respostas são informativas. Consulte sempre seu médico para orientações específicas._' 
      },
    });
    
    // Store state for follow-up
    await this.supabase
      .from('whatsapp_user_state')
      .upsert({
        user_id: context.userId,
        phone: context.phone,
        state: 'awaiting_exam_question',
        context: {
          analysisId: context.analysisId,
          flowType: context.flowType,
        },
        updated_at: new Date().toISOString(),
      });
    
    return {
      success: true,
      action: 'ask_question',
      result: { awaitingQuestion: true },
    };
  }

  /**
   * Handle schedule appointment button
   */
  private async handleScheduleAppointment(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { 
        body: '📅 Para agendar uma consulta, entre em contato com seu médico ou clínica de preferência.\n\nSe precisar de ajuda para encontrar um especialista, me avise!' 
      },
    });
    
    return {
      success: true,
      action: 'schedule_appointment',
      result: { messageSent: true },
    };
  }

  /**
   * Handle daily check-in response
   */
  private async handleDailyCheckinResponse(
    context: ButtonResponseContext,
    feeling: 'great' | 'ok' | 'bad'
  ): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    const feelingMap: Record<string, { level: number; emoji: string; message: string }> = {
      'great': { 
        level: 5, 
        emoji: '😊', 
        message: 'Que ótimo! Continue assim! 💪' 
      },
      'ok': { 
        level: 3, 
        emoji: '😐', 
        message: 'Entendi! Vamos trabalhar para melhorar seu dia! 🌟' 
      },
      'bad': { 
        level: 1, 
        emoji: '😔', 
        message: 'Sinto muito que não esteja bem. Estou aqui se precisar conversar. 💙' 
      },
    };
    
    const feelingData = feelingMap[feeling];
    
    // Record daily tracking
    await this.supabase
      .from('advanced_daily_tracking')
      .upsert({
        user_id: context.userId,
        tracking_date: new Date().toISOString().split('T')[0],
        energy_level: feelingData.level,
        mood_level: feelingData.level,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,tracking_date',
      });
    
    // Send response with buttons
    const responseInteractive = createCheckinResponse(feeling);
    
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'interactive',
      content: responseInteractive,
    });
    
    return {
      success: true,
      action: 'daily_checkin_response',
      result: { feeling, level: feelingData.level },
    };
  }
  
  /**
   * Handle new photo request
   */
  private async handleNewPhoto(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { body: '📸 *Pronto para analisar!*\n\nEnvie uma foto da sua refeição e eu faço a análise nutricional completa.' },
    });
    
    return {
      success: true,
      action: 'new_photo',
      result: { awaitingPhoto: true },
    };
  }
  
  /**
   * Handle meal plan request
   */
  private async handleMealPlan(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { body: '🍽️ *Gerando seu cardápio personalizado...*\n\nEm instantes você receberá sugestões de refeições baseadas no seu perfil!' },
    });
    
    // TODO: Trigger meal plan generation
    
    return {
      success: true,
      action: 'meal_plan',
      result: { generating: true },
    };
  }
  
  /**
   * Handle tips request
   */
  private async handleTips(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    const tips = [
      '💧 Beba pelo menos 2 litros de água por dia',
      '🥗 Inclua vegetais em todas as refeições',
      '🍎 Prefira frutas como sobremesa',
      '🚶 Caminhe 30 minutos após as refeições',
      '😴 Durma 7-8 horas por noite',
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { body: `💡 *Dica do Dia*\n\n${randomTip}\n\n_Pequenas mudanças fazem grande diferença!_` },
    });
    
    return {
      success: true,
      action: 'tips',
      result: { tipSent: true },
    };
  }
  
  /**
   * Handle exam understood
   */
  private async handleExamUnderstood(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { body: '✅ *Ótimo!*\n\nSe tiver mais dúvidas sobre seus exames, é só me enviar. Estou aqui para ajudar!\n\n_Lembre-se: consulte sempre seu médico para orientações específicas._' },
    });
    
    return {
      success: true,
      action: 'exam_understood',
      result: { acknowledged: true },
    };
  }
  
  /**
   * Handle full report request
   */
  private async handleFullReport(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    // Fetch the analysis data
    if (context.analysisId) {
      const { data: exam } = await this.supabase
        .from('medical_exam_analysis')
        .select('*')
        .eq('id', context.analysisId)
        .single();
      
      if (exam) {
        const reportInteractive = createVitalFullReport({
          examType: exam.exam_type || 'Exame',
          detailedAnalysis: exam.analysis_text || exam.result || 'Análise não disponível',
          recommendations: exam.recommendations || [],
        });
        
        await this.adapterLayer.sendMessage({
          phone: context.phone,
          userId: context.userId,
          messageType: 'interactive',
          content: reportInteractive,
        });
      }
    }
    
    return {
      success: true,
      action: 'full_report',
      result: { reportSent: true },
    };
  }
  
  /**
   * Handle meal accept
   */
  private async handleMealAccept(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { body: '✅ *Refeição salva no seu plano!*\n\nBom apetite! 🍽️\n\nDepois me conta como ficou!' },
    });
    
    return {
      success: true,
      action: 'meal_accept',
      result: { accepted: true },
    };
  }
  
  /**
   * Handle meal change request
   */
  private async handleMealChange(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { body: '🔄 *Buscando outra opção...*\n\nJá já te mando uma alternativa!' },
    });
    
    // TODO: Generate alternative meal
    
    return {
      success: true,
      action: 'meal_change',
      result: { generating: true },
    };
  }
  
  /**
   * Handle meal recipe request
   */
  private async handleMealRecipe(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'text',
      content: { body: '📝 *Preparando a receita...*\n\nEm instantes você recebe o passo a passo!' },
    });
    
    // TODO: Generate recipe
    
    return {
      success: true,
      action: 'meal_recipe',
      result: { generating: true },
    };
  }
  
  /**
   * Handle help request
   */
  private async handleHelp(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    const helpInteractive = InteractiveTemplates.helpMenu();
    
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'interactive',
      content: helpInteractive,
    });
    
    return {
      success: true,
      action: 'help',
      result: { helpSent: true },
    };
  }
  
  /**
   * Handle menu request
   */
  private async handleMenu(context: ButtonResponseContext): Promise<{
    success: boolean;
    action: string;
    result?: any;
  }> {
    const menuInteractive = createMainMenu();
    
    await this.adapterLayer.sendMessage({
      phone: context.phone,
      userId: context.userId,
      messageType: 'interactive',
      content: menuInteractive,
    });
    
    return {
      success: true,
      action: 'menu',
      result: { menuSent: true },
    };
  }
}

// ============================================
// Factory Functions
// ============================================

export function createPostAnalysisFlowHandler(): PostAnalysisFlowHandler {
  return new PostAnalysisFlowHandler();
}

export function createButtonResponseHandler(): ButtonResponseHandler {
  return new ButtonResponseHandler();
}
