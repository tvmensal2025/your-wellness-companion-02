/**
 * WhatsApp Template Processor
 * Handles template loading, placeholder substitution, and provider adaptation
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { 
  InteractiveContent, 
  WhatsAppProvider,
  InteractiveButton,
  ListRow 
} from './types.ts';

// ============================================
// Types
// ============================================

export interface TemplateData {
  // User data
  nome?: string;
  email?: string;
  telefone?: string;
  
  // Physical data
  peso?: number | string;
  altura?: number | string;
  imc?: number | string;
  
  // Nutrition data
  calorias?: number | string;
  proteinas?: number | string;
  carboidratos?: number | string;
  gorduras?: number | string;
  
  // Analysis data
  alimentos?: string;
  refeicao?: string;
  pontuacao?: number | string;
  
  // Exam data
  exame_tipo?: string;
  resultado?: string;
  observacoes?: string;
  
  // Date/time
  data?: string;
  hora?: string;
  
  // Challenge data
  desafio?: string;
  progresso?: number | string;
  pontos?: number | string;
  
  // Generic
  [key: string]: string | number | undefined;
}

export interface TemplateDefinition {
  id: string;
  name: string;
  category: 'food_analysis' | 'exam_analysis' | 'onboarding' | 'daily_checkin' | 'challenge' | 'general';
  body_text: string;
  buttons?: InteractiveButton[];
  list_sections?: Array<{
    title: string;
    rows: ListRow[];
  }>;
  footer_text?: string;
  header_text?: string;
  is_active: boolean;
}

export interface ProcessedTemplate {
  text: string;
  interactive?: InteractiveContent;
  hasInteractive: boolean;
}

// ============================================
// Placeholder Patterns
// ============================================

const PLACEHOLDER_PATTERN = /\{\{(\w+)\}\}/g;

const CONDITIONAL_PATTERN = /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g;

const DEFAULT_VALUE_PATTERN = /\{\{(\w+)\|default:([^}]+)\}\}/g;

// ============================================
// Template Processor Class
// ============================================

export class TemplateProcessor {
  private supabase: ReturnType<typeof createClient>;
  private templateCache: Map<string, TemplateDefinition> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes
  private lastCacheUpdate: number = 0;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Load template by ID or name
   */
  async loadTemplate(templateIdOrName: string): Promise<TemplateDefinition | null> {
    // Check cache first
    if (this.isCacheValid() && this.templateCache.has(templateIdOrName)) {
      return this.templateCache.get(templateIdOrName)!;
    }

    // Try to load from database
    const { data, error } = await this.supabase
      .from('whatsapp_message_templates')
      .select('*')
      .or(`id.eq.${templateIdOrName},name.eq.${templateIdOrName}`)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.error('Template not found:', templateIdOrName, error);
      return null;
    }

    const template: TemplateDefinition = {
      id: data.id,
      name: data.name,
      category: data.category,
      body_text: data.body_text,
      buttons: data.buttons,
      list_sections: data.list_sections,
      footer_text: data.footer_text,
      header_text: data.header_text,
      is_active: data.is_active,
    };

    // Update cache
    this.templateCache.set(template.id, template);
    this.templateCache.set(template.name, template);
    this.lastCacheUpdate = Date.now();

    return template;
  }

  /**
   * Process template with data substitution
   */
  processTemplate(
    template: TemplateDefinition,
    data: TemplateData,
    provider: WhatsAppProvider
  ): ProcessedTemplate {
    // Process body text
    let processedText = this.substitutePlaceholders(template.body_text, data);
    processedText = this.processConditionals(processedText, data);
    processedText = this.processDefaults(processedText);

    // Process header if present
    let headerText: string | undefined;
    if (template.header_text) {
      headerText = this.substitutePlaceholders(template.header_text, data);
    }

    // Process footer if present
    let footerText: string | undefined;
    if (template.footer_text) {
      footerText = this.substitutePlaceholders(template.footer_text, data);
    }

    // Build interactive content if buttons or list present
    const hasInteractive = !!(template.buttons?.length || template.list_sections?.length);
    let interactive: InteractiveContent | undefined;

    if (hasInteractive) {
      interactive = this.buildInteractiveContent(template, data, provider);
    }

    return {
      text: processedText,
      interactive,
      hasInteractive,
    };
  }

  /**
   * Substitute placeholders with data values
   */
  private substitutePlaceholders(text: string, data: TemplateData): string {
    return text.replace(PLACEHOLDER_PATTERN, (match, key) => {
      const value = data[key];
      if (value !== undefined && value !== null) {
        return String(value);
      }
      // Keep placeholder if no value (will be handled by defaults or removed)
      return match;
    });
  }

  /**
   * Process conditional sections
   * {{#if variable}}content{{/if}}
   */
  private processConditionals(text: string, data: TemplateData): string {
    return text.replace(CONDITIONAL_PATTERN, (match, key, content) => {
      const value = data[key];
      // Include content if value is truthy
      if (value !== undefined && value !== null && value !== '' && value !== 0) {
        return this.substitutePlaceholders(content, data);
      }
      return '';
    });
  }

  /**
   * Process default values
   * {{variable|default:valor padrão}}
   */
  private processDefaults(text: string): string {
    return text.replace(DEFAULT_VALUE_PATTERN, (match, key, defaultValue) => {
      // If placeholder still exists, use default
      return defaultValue.trim();
    });
  }

  /**
   * Remove any remaining unsubstituted placeholders
   */
  cleanUnsubstitutedPlaceholders(text: string): string {
    return text.replace(PLACEHOLDER_PATTERN, '').replace(/\s+/g, ' ').trim();
  }

  /**
   * Build interactive content based on template and provider
   */
  private buildInteractiveContent(
    template: TemplateDefinition,
    data: TemplateData,
    provider: WhatsAppProvider
  ): InteractiveContent {
    // Process button titles with data
    const processedButtons = template.buttons?.map(button => ({
      ...button,
      title: this.substitutePlaceholders(button.title, data),
    }));

    // Process list sections with data
    const processedSections = template.list_sections?.map(section => ({
      title: this.substitutePlaceholders(section.title, data),
      rows: section.rows.map(row => ({
        ...row,
        title: this.substitutePlaceholders(row.title, data),
        description: row.description 
          ? this.substitutePlaceholders(row.description, data)
          : undefined,
      })),
    }));

    // Determine interactive type
    if (processedSections?.length) {
      return {
        type: 'list',
        body: this.substitutePlaceholders(template.body_text, data),
        buttonText: 'Ver opções',
        sections: processedSections,
        footer: template.footer_text 
          ? this.substitutePlaceholders(template.footer_text, data)
          : undefined,
      };
    }

    if (processedButtons?.length) {
      return {
        type: 'quick_reply',
        body: this.substitutePlaceholders(template.body_text, data),
        buttons: processedButtons,
        footer: template.footer_text
          ? this.substitutePlaceholders(template.footer_text, data)
          : undefined,
      };
    }

    // Fallback to text-only
    return {
      type: 'quick_reply',
      body: this.substitutePlaceholders(template.body_text, data),
      buttons: [],
    };
  }

  /**
   * Check if cache is still valid
   */
  private isCacheValid(): boolean {
    return Date.now() - this.lastCacheUpdate < this.cacheExpiry;
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.lastCacheUpdate = 0;
  }

  /**
   * Preload all active templates into cache
   */
  async preloadTemplates(): Promise<void> {
    const { data, error } = await this.supabase
      .from('whatsapp_message_templates')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Failed to preload templates:', error);
      return;
    }

    this.templateCache.clear();
    for (const row of data || []) {
      const template: TemplateDefinition = {
        id: row.id,
        name: row.name,
        category: row.category,
        body_text: row.body_text,
        buttons: row.buttons,
        list_sections: row.list_sections,
        footer_text: row.footer_text,
        header_text: row.header_text,
        is_active: row.is_active,
      };
      this.templateCache.set(template.id, template);
      this.templateCache.set(template.name, template);
    }
    this.lastCacheUpdate = Date.now();
  }
}

// ============================================
// Pre-defined Templates (Fallback)
// ============================================

export const BUILTIN_TEMPLATES: Record<string, TemplateDefinition> = {
  FOOD_ANALYSIS_COMPLETE: {
    id: 'builtin_food_analysis',
    name: 'FOOD_ANALYSIS_COMPLETE',
    category: 'food_analysis',
    body_text: `🍽️ *Análise Nutricional Completa*

Olá {{nome}}! Analisei sua refeição:

*Alimentos detectados:*
{{alimentos}}

*Valores Nutricionais:*
• Calorias: {{calorias}} kcal
• Proteínas: {{proteinas}}g
• Carboidratos: {{carboidratos}}g
• Gorduras: {{gorduras}}g

*Pontuação de Saúde:* {{pontuacao}}/100

{{#if observacoes}}
📝 *Observações:* {{observacoes}}
{{/if}}`,
    buttons: [
      { id: 'confirm_analysis', title: '✅ Confirmar' },
      { id: 'edit_analysis', title: '✏️ Corrigir' },
      { id: 'view_details', title: '📊 Detalhes' },
    ],
    footer_text: 'Sofia - Sua Nutricionista IA',
    is_active: true,
  },

  EXAM_ANALYSIS_COMPLETE: {
    id: 'builtin_exam_analysis',
    name: 'EXAM_ANALYSIS_COMPLETE',
    category: 'exam_analysis',
    body_text: `🔬 *Análise de Exame*

Olá {{nome}}! Analisei seu exame de {{exame_tipo}}.

*Resultado:*
{{resultado}}

{{#if observacoes}}
📋 *Observações importantes:*
{{observacoes}}
{{/if}}

⚠️ Esta análise é informativa. Consulte seu médico para orientações.`,
    buttons: [
      { id: 'confirm_exam', title: '✅ Entendi' },
      { id: 'ask_question', title: '❓ Perguntar' },
      { id: 'schedule_appointment', title: '📅 Agendar' },
    ],
    footer_text: 'Dr. Vital - Seu Assistente de Saúde',
    is_active: true,
  },

  DAILY_CHECKIN: {
    id: 'builtin_daily_checkin',
    name: 'DAILY_CHECKIN',
    category: 'daily_checkin',
    body_text: `☀️ *Bom dia, {{nome}}!*

Como você está se sentindo hoje?

Vamos registrar seu dia para acompanhar seu progresso! 💪`,
    buttons: [
      { id: 'feeling_great', title: '😊 Ótimo' },
      { id: 'feeling_ok', title: '😐 Normal' },
      { id: 'feeling_bad', title: '😔 Não muito bem' },
    ],
    footer_text: 'MaxNutrition',
    is_active: true,
  },

  CHALLENGE_UPDATE: {
    id: 'builtin_challenge_update',
    name: 'CHALLENGE_UPDATE',
    category: 'challenge',
    body_text: `🏆 *Atualização do Desafio*

{{nome}}, você está indo muito bem no desafio "{{desafio}}"!

*Progresso:* {{progresso}}%
*Pontos acumulados:* {{pontos}}

Continue assim! 🔥`,
    buttons: [
      { id: 'view_challenge', title: '👀 Ver desafio' },
      { id: 'share_progress', title: '📤 Compartilhar' },
    ],
    footer_text: 'MaxNutrition Desafios',
    is_active: true,
  },

  ONBOARDING_WELCOME: {
    id: 'builtin_onboarding_welcome',
    name: 'ONBOARDING_WELCOME',
    category: 'onboarding',
    body_text: `👋 *Bem-vindo(a) ao MaxNutrition, {{nome}}!*

Estou muito feliz em ter você aqui! 🎉

Sou a Sofia, sua nutricionista virtual. Vou te ajudar a:
• 📸 Analisar suas refeições
• 📊 Acompanhar seu progresso
• 💡 Dar dicas personalizadas

Vamos começar?`,
    buttons: [
      { id: 'start_onboarding', title: '🚀 Começar' },
      { id: 'learn_more', title: '📖 Saber mais' },
    ],
    footer_text: 'Sofia - Sua Nutricionista IA',
    is_active: true,
  },
};

/**
 * Get built-in template by name
 */
export function getBuiltinTemplate(name: string): TemplateDefinition | null {
  return BUILTIN_TEMPLATES[name] || null;
}

/**
 * Process a built-in template with data
 */
export function processBuiltinTemplate(
  templateName: string,
  data: TemplateData,
  provider: WhatsAppProvider
): ProcessedTemplate | null {
  const template = getBuiltinTemplate(templateName);
  if (!template) return null;

  const processor = new TemplateProcessor();
  return processor.processTemplate(template, data, provider);
}
