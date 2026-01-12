// ============================================
// Interactive Message Builder
// Unified builder for interactive WhatsApp messages
// ============================================

import {
  WhatsAppProvider,
  InteractiveContent,
  ButtonAction,
  ListAction,
  CarouselAction,
  SendMessagePayload,
  WhatsAppErrorCode,
  INTERACTIVE_TEMPLATES,
  BUTTON_ACTIONS,
} from './types.ts';

// ============================================
// Validation Types
// ============================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  errorCode?: WhatsAppErrorCode;
}

// ============================================
// Pre-defined Templates
// ============================================


export const PREDEFINED_TEMPLATES: Record<string, InteractiveContent> = {
  // Food analysis complete - after Sofia analyzes food
  [INTERACTIVE_TEMPLATES.FOOD_ANALYSIS_COMPLETE]: {
    type: 'button',
    header: { text: '🍽️ Análise Concluída!' },
    body: {
      text: 'Identifiquei os alimentos da sua refeição.\n\n{{summary}}\n\nO que deseja fazer?',
    },
    footer: { text: 'Sofia - Sua nutricionista IA' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_ACTIONS.CONFIRM_ANALYSIS, title: '✅ Confirmar' },
        { type: 'quick_reply', id: BUTTON_ACTIONS.EDIT_ANALYSIS, title: '✏️ Corrigir' },
        { type: 'quick_reply', id: BUTTON_ACTIONS.VIEW_DETAILS, title: '📊 Detalhes' },
      ],
    },
  },
  
  // Exam analysis complete - after Dr. Vital analyzes exam
  [INTERACTIVE_TEMPLATES.EXAM_ANALYSIS_COMPLETE]: {
    type: 'button',
    header: { text: '🔬 Análise de Exame Concluída!' },
    body: {
      text: 'Analisei seu exame e preparei um relatório.\n\n{{summary}}\n\nComo posso ajudar?',
    },
    footer: { text: 'Dr. Vital - Seu médico IA' },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_ACTIONS.VIEW_DETAILS, title: '📋 Ver Relatório' },
        { type: 'quick_reply', id: BUTTON_ACTIONS.TALK_NUTRITIONIST, title: '👩‍⚕️ Falar com Sofia' },
      ],
    },
  },
  
  // Onboarding step navigation
  [INTERACTIVE_TEMPLATES.ONBOARDING_STEP]: {
    type: 'button',
    body: {
      text: '{{step_content}}',
    },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_ACTIONS.NEXT_STEP, title: '➡️ Próximo' },
        { type: 'quick_reply', id: BUTTON_ACTIONS.SKIP_STEP, title: '⏭️ Pular' },
      ],
    },
  },
  
  // Daily check-in
  [INTERACTIVE_TEMPLATES.DAILY_CHECKIN]: {
    type: 'button',
    header: { text: '☀️ Bom dia, {{nome}}!' },
    body: {
      text: 'Como você está se sentindo hoje?\n\nVamos registrar seu dia?',
    },
    action: {
      buttons: [
        { type: 'quick_reply', id: BUTTON_ACTIONS.YES, title: '✅ Sim, vamos!' },
        { type: 'quick_reply', id: BUTTON_ACTIONS.NO, title: '⏰ Mais tarde' },
      ],
    },
  },
  
  // Goal reminder
  [INTERACTIVE_TEMPLATES.GOAL_REMINDER]: {
    type: 'button',
    body: {
      text: '🎯 Lembrete de Meta\n\n{{goal_description}}\n\nProgresso: {{progress}}%',
    },
    action: {
      buttons: [
        { type: 'quick_reply', id: 'update_progress', title: '📝 Atualizar' },
        { type: 'quick_reply', id: 'view_tips', title: '💡 Ver Dicas' },
      ],
    },
  },
  
  // Weekly report
  [INTERACTIVE_TEMPLATES.WEEKLY_REPORT]: {
    type: 'list',
    header: { text: '📊 Relatório Semanal' },
    body: {
      text: 'Confira seu progresso desta semana!\n\n🔥 Calorias: {{calories}}\n💪 Treinos: {{workouts}}\n💧 Água: {{water}}L',
    },
    action: {
      label: 'Ver Detalhes',
      sections: [
        {
          title: 'Nutrição',
          rows: [
            { id: 'nutrition_details', title: '🍽️ Refeições', description: 'Ver todas as refeições' },
            { id: 'macros_details', title: '📈 Macros', description: 'Proteínas, carbos, gorduras' },
          ],
        },
        {
          title: 'Atividade',
          rows: [
            { id: 'workout_details', title: '🏋️ Treinos', description: 'Histórico de exercícios' },
            { id: 'steps_details', title: '👣 Passos', description: 'Média diária de passos' },
          ],
        },
      ],
    },
  },
};


// ============================================
// Interactive Message Builder Class
// ============================================

export class InteractiveMessageBuilder {
  
  /**
   * Build an interactive message from a template
   */
  static build(
    templateKey: string,
    data: Record<string, any>,
    provider: WhatsAppProvider
  ): { content: InteractiveContent; textFallback: string } {
    const template = PREDEFINED_TEMPLATES[templateKey];
    
    if (!template) {
      throw new Error(`Template not found: ${templateKey}`);
    }
    
    // Clone and substitute placeholders
    const content = this.substituteplaceholders(template, data);
    
    // Generate text fallback for Evolution
    const textFallback = this.convertToTextFallback(content);
    
    return { content, textFallback };
  }
  
  /**
   * Create a custom button message
   */
  static createButtonMessage(
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    options?: {
      header?: string;
      footer?: string;
    }
  ): InteractiveContent {
    const content: InteractiveContent = {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map(btn => ({
          type: 'quick_reply' as const,
          id: btn.id,
          title: btn.title,
        })),
      },
    };
    
    if (options?.header) {
      content.header = { text: options.header };
    }
    
    if (options?.footer) {
      content.footer = { text: options.footer };
    }
    
    return content;
  }
  
  /**
   * Create a custom list message
   */
  static createListMessage(
    bodyText: string,
    buttonLabel: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    options?: {
      header?: string;
      footer?: string;
    }
  ): InteractiveContent {
    const content: InteractiveContent = {
      type: 'list',
      body: { text: bodyText },
      action: {
        label: buttonLabel,
        sections,
      },
    };
    
    if (options?.header) {
      content.header = { text: options.header };
    }
    
    if (options?.footer) {
      content.footer = { text: options.footer };
    }
    
    return content;
  }

  
  /**
   * Validate interactive content against Whapi limits
   */
  static validate(content: InteractiveContent): ValidationResult {
    const errors: string[] = [];
    
    if (content.type === 'button' && 'buttons' in content.action) {
      const buttons = (content.action as ButtonAction).buttons;
      const quickReplyCount = buttons.filter(b => b.type === 'quick_reply').length;
      
      if (quickReplyCount > 3) {
        errors.push(`Quick reply buttons cannot exceed 3 (got ${quickReplyCount})`);
        return { valid: false, errors, errorCode: WhatsAppErrorCode.BUTTON_LIMIT_EXCEEDED };
      }
      
      // Validate button titles
      for (const btn of buttons) {
        if (btn.title.length > 20) {
          errors.push(`Button title "${btn.title}" exceeds 20 characters`);
        }
      }
    }
    
    if (content.type === 'list' && 'sections' in content.action) {
      const listAction = content.action as ListAction;
      
      if (listAction.label.length > 20) {
        errors.push(`List button label exceeds 20 characters`);
      }
      
      for (const section of listAction.sections) {
        if (section.rows.length > 10) {
          errors.push(`Section "${section.title}" has more than 10 rows`);
          return { valid: false, errors, errorCode: WhatsAppErrorCode.LIST_LIMIT_EXCEEDED };
        }
        
        for (const row of section.rows) {
          if (row.title.length > 24) {
            errors.push(`Row title "${row.title}" exceeds 24 characters`);
          }
          if (row.description && row.description.length > 72) {
            errors.push(`Row description exceeds 72 characters`);
          }
        }
      }
    }
    
    if (content.type === 'carousel' && 'cards' in content.action) {
      const cards = (content.action as CarouselAction).cards;
      
      if (cards.length > 10) {
        errors.push(`Carousel cannot have more than 10 cards (got ${cards.length})`);
        return { valid: false, errors, errorCode: WhatsAppErrorCode.CAROUSEL_LIMIT_EXCEEDED };
      }
    }
    
    // Validate body text
    if (content.body.text.length > 1024) {
      errors.push('Body text exceeds 1024 characters');
    }
    
    return { valid: errors.length === 0, errors };
  }
  
  /**
   * Substitute placeholders in template
   */
  private static substituteplaceholders(
    template: InteractiveContent,
    data: Record<string, any>
  ): InteractiveContent {
    const substitute = (text: string): string => {
      return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return data[key] !== undefined ? String(data[key]) : match;
      });
    };
    
    const result: InteractiveContent = JSON.parse(JSON.stringify(template));
    
    // Substitute in header
    if (result.header?.text) {
      result.header.text = substitute(result.header.text);
    }
    
    // Substitute in body
    result.body.text = substitute(result.body.text);
    
    // Substitute in footer
    if (result.footer?.text) {
      result.footer.text = substitute(result.footer.text);
    }
    
    return result;
  }

  
  /**
   * Convert interactive content to text fallback (for Evolution)
   */
  static convertToTextFallback(content: InteractiveContent): string {
    let text = '';
    
    // Add header
    if (content.header?.text) {
      text += `*${content.header.text}*\n\n`;
    }
    
    // Add body
    text += content.body.text + '\n\n';
    
    // Convert action to numbered options
    if (content.type === 'button' && 'buttons' in content.action) {
      const buttons = (content.action as ButtonAction).buttons;
      buttons.forEach((button, index) => {
        text += `${this.getNumberEmoji(index + 1)} ${button.title}\n`;
      });
      text += '\n_Responda com o número da opção_';
    } else if (content.type === 'list' && 'sections' in content.action) {
      const listAction = content.action as ListAction;
      text += `📋 *${listAction.label}*\n\n`;
      
      let optionNumber = 1;
      for (const section of listAction.sections) {
        if (section.title) {
          text += `*${section.title}*\n`;
        }
        for (const row of section.rows) {
          text += `${this.getNumberEmoji(optionNumber)} ${row.title}`;
          if (row.description) {
            text += ` - ${row.description}`;
          }
          text += '\n';
          optionNumber++;
        }
        text += '\n';
      }
      text += '_Responda com o número da opção_';
    } else if (content.type === 'carousel' && 'cards' in content.action) {
      const cards = (content.action as CarouselAction).cards;
      cards.forEach((card, index) => {
        text += `${this.getNumberEmoji(index + 1)} *${card.text}*\n`;
        if (card.buttons && card.buttons.length > 0) {
          card.buttons.forEach(btn => {
            text += `   • ${btn.title}\n`;
          });
        }
        text += '\n';
      });
      text += '_Responda com o número do item_';
    }
    
    // Add footer
    if (content.footer?.text) {
      text += `\n\n_${content.footer.text}_`;
    }
    
    return text;
  }
  
  /**
   * Get button ID mapping for webhook response matching
   */
  static getButtonIdMapping(content: InteractiveContent): Map<number, string> {
    const mapping = new Map<number, string>();
    
    if (content.type === 'button' && 'buttons' in content.action) {
      const buttons = (content.action as ButtonAction).buttons;
      buttons.forEach((button, index) => {
        mapping.set(index + 1, button.id);
      });
    } else if (content.type === 'list' && 'sections' in content.action) {
      const listAction = content.action as ListAction;
      let optionNumber = 1;
      for (const section of listAction.sections) {
        for (const row of section.rows) {
          mapping.set(optionNumber, row.id);
          optionNumber++;
        }
      }
    } else if (content.type === 'carousel' && 'cards' in content.action) {
      const cards = (content.action as CarouselAction).cards;
      cards.forEach((card, index) => {
        mapping.set(index + 1, card.id);
      });
    }
    
    return mapping;
  }
  
  /**
   * Get number emoji
   */
  private static getNumberEmoji(num: number): string {
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[num - 1] || `${num}.`;
  }
}
