/**
 * Property-Based Tests for Interactive Fallback Conversion
 * 
 * Feature: whatsapp-hybrid-integration
 * Property 5: Interactive Fallback Conversion
 * 
 * Validates: Requirements 2.6, 3.6, 5.3, 6.6
 * 
 * For any interactive message content when Evolution_API is active, the output 
 * SHALL be converted to plain text with numbered options that preserve the 
 * semantic meaning of the original buttons/list items.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============================================
// Types (matching actual implementation)
// ============================================

interface ButtonAction {
  buttons: Array<{
    type: 'quick_reply' | 'call' | 'url' | 'copy';
    id: string;
    title: string;
    payload?: string;
  }>;
}

interface ListAction {
  label: string;
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>;
}

interface CarouselCard {
  id: string;
  media: string;
  text: string;
  buttons: ButtonAction['buttons'];
}

interface InteractiveContent {
  type: 'button' | 'list' | 'carousel';
  header?: { text?: string };
  body: { text: string };
  footer?: { text: string };
  action: ButtonAction | ListAction | { cards: CarouselCard[] };
}


// ============================================
// Conversion Function (mirrors Evolution adapter)
// ============================================

function getNumberEmoji(num: number): string {
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  return emojis[num - 1] || `${num}.`;
}

function convertInteractiveToText(content: InteractiveContent): string {
  let text = '';
  
  // Add header if present
  if (content.header?.text) {
    text += `*${content.header.text}*\n\n`;
  }
  
  // Add body
  text += content.body.text + '\n\n';
  
  // Convert action to numbered options
  if (content.type === 'button' && 'buttons' in content.action) {
    const buttons = (content.action as ButtonAction).buttons;
    buttons.forEach((button, index) => {
      const emoji = getNumberEmoji(index + 1);
      text += `${emoji} ${button.title}\n`;
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
        const emoji = getNumberEmoji(optionNumber);
        text += `${emoji} ${row.title}`;
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
    const cards = (content.action as { cards: CarouselCard[] }).cards;
    cards.forEach((card, index) => {
      const emoji = getNumberEmoji(index + 1);
      text += `${emoji} *${card.text}*\n`;
      if (card.buttons && card.buttons.length > 0) {
        card.buttons.forEach(btn => {
          text += `   • ${btn.title}\n`;
        });
      }
      text += '\n';
    });
    text += '_Responda com o número do item_';
  }
  
  // Add footer if present
  if (content.footer?.text) {
    text += `\n\n_${content.footer.text}_`;
  }
  
  return text;
}


// ============================================
// Arbitraries (Test Data Generators)
// ============================================

const buttonArbitrary = fc.record({
  type: fc.constantFrom<'quick_reply' | 'call' | 'url' | 'copy'>('quick_reply', 'call', 'url', 'copy'),
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 20 }),
});

const listRowArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 24 }),
  description: fc.option(fc.string({ minLength: 1, maxLength: 72 }), { nil: undefined }),
});

const listSectionArbitrary = fc.record({
  title: fc.string({ minLength: 1, maxLength: 24 }),
  rows: fc.array(listRowArbitrary, { minLength: 1, maxLength: 10 }),
});

const carouselCardArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  media: fc.webUrl(),
  text: fc.string({ minLength: 1, maxLength: 100 }),
  buttons: fc.array(buttonArbitrary, { minLength: 1, maxLength: 3 }),
});

// ============================================
// Property Tests
// ============================================

describe('Interactive Fallback Conversion - Property Tests', () => {
  
  /**
   * Property: All button titles appear in converted text
   */
  it('should include all button titles in converted text', () => {
    fc.assert(
      fc.property(
        fc.array(buttonArbitrary, { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (buttons, bodyText) => {
          const content: InteractiveContent = {
            type: 'button',
            body: { text: bodyText },
            action: { buttons },
          };
          
          const result = convertInteractiveToText(content);
          
          // Every button title should appear in the result
          for (const button of buttons) {
            expect(result).toContain(button.title);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: All list row titles appear in converted text
   */
  it('should include all list row titles in converted text', () => {
    fc.assert(
      fc.property(
        fc.array(listSectionArbitrary, { minLength: 1, maxLength: 3 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        (sections, bodyText, label) => {
          const content: InteractiveContent = {
            type: 'list',
            body: { text: bodyText },
            action: { label, sections },
          };
          
          const result = convertInteractiveToText(content);
          
          // Every row title should appear in the result
          for (const section of sections) {
            for (const row of section.rows) {
              expect(result).toContain(row.title);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  
  /**
   * Property: All carousel card texts appear in converted text
   */
  it('should include all carousel card texts in converted text', () => {
    fc.assert(
      fc.property(
        fc.array(carouselCardArbitrary, { minLength: 1, maxLength: 10 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (cards, bodyText) => {
          const content: InteractiveContent = {
            type: 'carousel',
            body: { text: bodyText },
            action: { cards },
          };
          
          const result = convertInteractiveToText(content);
          
          // Every card text should appear in the result
          for (const card of cards) {
            expect(result).toContain(card.text);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Body text is always preserved
   */
  it('should always preserve the body text', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<'button' | 'list' | 'carousel'>('button', 'list', 'carousel'),
        fc.string({ minLength: 1, maxLength: 200 }),
        (type, bodyText) => {
          let action: any;
          
          switch (type) {
            case 'button':
              action = { buttons: [{ type: 'quick_reply', id: 'btn1', title: 'OK' }] };
              break;
            case 'list':
              action = { label: 'Menu', sections: [{ title: 'Sec', rows: [{ id: 'r1', title: 'Row' }] }] };
              break;
            case 'carousel':
              action = { cards: [{ id: 'c1', media: 'https://x.com/i.jpg', text: 'Card', buttons: [] }] };
              break;
          }
          
          const content: InteractiveContent = { type, body: { text: bodyText }, action };
          const result = convertInteractiveToText(content);
          
          expect(result).toContain(bodyText);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  /**
   * Property: Header text is preserved when present
   */
  it('should preserve header text when present', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (headerText, bodyText) => {
          const content: InteractiveContent = {
            type: 'button',
            header: { text: headerText },
            body: { text: bodyText },
            action: { buttons: [{ type: 'quick_reply', id: 'btn1', title: 'OK' }] },
          };
          
          const result = convertInteractiveToText(content);
          
          expect(result).toContain(headerText);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Footer text is preserved when present
   */
  it('should preserve footer text when present', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        (footerText, bodyText) => {
          const content: InteractiveContent = {
            type: 'button',
            body: { text: bodyText },
            footer: { text: footerText },
            action: { buttons: [{ type: 'quick_reply', id: 'btn1', title: 'OK' }] },
          };
          
          const result = convertInteractiveToText(content);
          
          expect(result).toContain(footerText);
        }
      ),
      { numRuns: 50 }
    );
  });

  
  /**
   * Property: Number emojis appear in correct order
   */
  it('should use number emojis in sequential order for buttons', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        (buttonCount) => {
          const buttons = Array.from({ length: buttonCount }, (_, i) => ({
            type: 'quick_reply' as const,
            id: `btn_${i}`,
            title: `Option ${i + 1}`,
          }));
          
          const content: InteractiveContent = {
            type: 'button',
            body: { text: 'Choose' },
            action: { buttons },
          };
          
          const result = convertInteractiveToText(content);
          
          // Check that emojis appear in order
          const expectedEmojis = ['1️⃣', '2️⃣', '3️⃣'].slice(0, buttonCount);
          for (let i = 0; i < expectedEmojis.length; i++) {
            expect(result).toContain(expectedEmojis[i]);
            // Each emoji should appear before the next
            if (i < expectedEmojis.length - 1) {
              const pos1 = result.indexOf(expectedEmojis[i]);
              const pos2 = result.indexOf(expectedEmojis[i + 1]);
              expect(pos1).toBeLessThan(pos2);
            }
          }
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: List descriptions are included when present
   */
  it('should include row descriptions when present', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 24 }),
        fc.string({ minLength: 1, maxLength: 72 }),
        (title, description) => {
          const content: InteractiveContent = {
            type: 'list',
            body: { text: 'Select' },
            action: {
              label: 'Menu',
              sections: [{
                title: 'Section',
                rows: [{ id: 'row1', title, description }],
              }],
            },
          };
          
          const result = convertInteractiveToText(content);
          
          expect(result).toContain(title);
          expect(result).toContain(description);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Converted text always includes instruction to respond with number
   */
  it('should always include instruction to respond with number', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<'button' | 'list' | 'carousel'>('button', 'list', 'carousel'),
        (type) => {
          let action: any;
          
          switch (type) {
            case 'button':
              action = { buttons: [{ type: 'quick_reply', id: 'b1', title: 'OK' }] };
              break;
            case 'list':
              action = { label: 'Menu', sections: [{ title: 'S', rows: [{ id: 'r1', title: 'R' }] }] };
              break;
            case 'carousel':
              action = { cards: [{ id: 'c1', media: 'https://x.com/i.jpg', text: 'C', buttons: [] }] };
              break;
          }
          
          const content: InteractiveContent = { type, body: { text: 'Test' }, action };
          const result = convertInteractiveToText(content);
          
          // Should contain instruction about responding with number
          expect(result.toLowerCase()).toMatch(/responda com o número/i);
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ============================================
// Unit Tests for Edge Cases
// ============================================

describe('Interactive Fallback Conversion - Unit Tests', () => {
  
  it('should handle empty buttons array gracefully', () => {
    const content: InteractiveContent = {
      type: 'button',
      body: { text: 'No options' },
      action: { buttons: [] },
    };
    
    const result = convertInteractiveToText(content);
    expect(result).toContain('No options');
  });
  
  it('should handle special characters in titles', () => {
    const content: InteractiveContent = {
      type: 'button',
      body: { text: 'Choose' },
      action: {
        buttons: [
          { type: 'quick_reply', id: 'b1', title: '✅ Confirmar & Salvar' },
          { type: 'quick_reply', id: 'b2', title: '❌ Cancelar <script>' },
        ],
      },
    };
    
    const result = convertInteractiveToText(content);
    expect(result).toContain('✅ Confirmar & Salvar');
    expect(result).toContain('❌ Cancelar <script>');
  });
  
  it('should handle unicode in body text', () => {
    const content: InteractiveContent = {
      type: 'button',
      body: { text: '🍎 Análise de maçã concluída! 营养分析' },
      action: { buttons: [{ type: 'quick_reply', id: 'b1', title: 'OK' }] },
    };
    
    const result = convertInteractiveToText(content);
    expect(result).toContain('🍎 Análise de maçã concluída! 营养分析');
  });
});
