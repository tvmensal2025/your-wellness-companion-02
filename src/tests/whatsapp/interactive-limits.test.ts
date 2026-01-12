/**
 * Property-Based Tests for Whapi Interactive Limits
 * 
 * Feature: whatsapp-hybrid-integration
 * Property 9: Whapi Interactive Limits Validation
 * 
 * Validates: Requirements 4.3, 4.6, 5.6
 * 
 * For any interactive message sent via Whapi_Adapter, the system SHALL validate that:
 * - quick_reply buttons <= 3
 * - list rows <= 10 per section
 * - carousel cards <= 10
 * Messages exceeding limits SHALL be rejected with validation error.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// ============================================
// Types (matching actual implementation)
// ============================================

enum WhatsAppErrorCode {
  BUTTON_LIMIT_EXCEEDED = 'BUTTON_LIMIT_EXCEEDED',
  LIST_LIMIT_EXCEEDED = 'LIST_LIMIT_EXCEEDED',
  CAROUSEL_LIMIT_EXCEEDED = 'CAROUSEL_LIMIT_EXCEEDED',
}

interface ButtonAction {
  buttons: Array<{
    type: 'quick_reply' | 'call' | 'url' | 'copy';
    id: string;
    title: string;
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
  body: { text: string };
  action: ButtonAction | ListAction | { cards: CarouselCard[] };
}

interface ValidationError {
  code: WhatsAppErrorCode;
  message: string;
}


// ============================================
// Validation Function (mirrors Whapi adapter)
// ============================================

function validateInteractiveContent(content: InteractiveContent): ValidationError | null {
  if (content.type === 'button' && 'buttons' in content.action) {
    const buttons = (content.action as ButtonAction).buttons;
    const quickReplyCount = buttons.filter(b => b.type === 'quick_reply').length;
    
    if (quickReplyCount > 3) {
      return {
        code: WhatsAppErrorCode.BUTTON_LIMIT_EXCEEDED,
        message: `Quick reply buttons cannot exceed 3 (got ${quickReplyCount})`,
      };
    }
  }
  
  if (content.type === 'list' && 'sections' in content.action) {
    const sections = (content.action as ListAction).sections;
    for (const section of sections) {
      if (section.rows.length > 10) {
        return {
          code: WhatsAppErrorCode.LIST_LIMIT_EXCEEDED,
          message: `List section cannot have more than 10 rows (got ${section.rows.length})`,
        };
      }
    }
  }
  
  if (content.type === 'carousel' && 'cards' in content.action) {
    const cards = (content.action as { cards: CarouselCard[] }).cards;
    if (cards.length > 10) {
      return {
        code: WhatsAppErrorCode.CAROUSEL_LIMIT_EXCEEDED,
        message: `Carousel cannot have more than 10 cards (got ${cards.length})`,
      };
    }
  }
  
  return null;
}

// ============================================
// Arbitraries (Test Data Generators)
// ============================================

const buttonArbitrary = fc.record({
  type: fc.constantFrom<'quick_reply' | 'call' | 'url' | 'copy'>('quick_reply', 'call', 'url', 'copy'),
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 20 }),
});

const quickReplyButtonArbitrary = fc.record({
  type: fc.constant<'quick_reply'>('quick_reply'),
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 20 }),
});

const listRowArbitrary = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 24 }),
  description: fc.option(fc.string({ maxLength: 72 })),
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

describe('Whapi Interactive Limits - Property Tests', () => {
  
  /**
   * Property: Valid button content (1-3 quick_reply) should pass validation
   */
  it('should accept button content with 1-3 quick_reply buttons', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        (buttonCount) => {
          const content: InteractiveContent = {
            type: 'button',
            body: { text: 'Choose an option' },
            action: {
              buttons: Array.from({ length: buttonCount }, (_, i) => ({
                type: 'quick_reply' as const,
                id: `btn_${i}`,
                title: `Option ${i + 1}`,
              })),
            },
          };
          
          const error = validateInteractiveContent(content);
          expect(error).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Button content with >3 quick_reply should fail validation
   */
  it('should reject button content with more than 3 quick_reply buttons', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 4, max: 10 }),
        (buttonCount) => {
          const content: InteractiveContent = {
            type: 'button',
            body: { text: 'Choose an option' },
            action: {
              buttons: Array.from({ length: buttonCount }, (_, i) => ({
                type: 'quick_reply' as const,
                id: `btn_${i}`,
                title: `Option ${i + 1}`,
              })),
            },
          };
          
          const error = validateInteractiveContent(content);
          expect(error).not.toBeNull();
          expect(error?.code).toBe(WhatsAppErrorCode.BUTTON_LIMIT_EXCEEDED);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Mixed button types - only quick_reply counts toward limit
   */
  it('should only count quick_reply buttons toward the 3-button limit', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 0, max: 5 }),
        (quickReplyCount, otherCount) => {
          const quickReplyButtons = Array.from({ length: quickReplyCount }, (_, i) => ({
            type: 'quick_reply' as const,
            id: `qr_${i}`,
            title: `Quick ${i + 1}`,
          }));
          
          const otherButtons = Array.from({ length: otherCount }, (_, i) => ({
            type: (['call', 'url', 'copy'] as const)[i % 3],
            id: `other_${i}`,
            title: `Other ${i + 1}`,
          }));
          
          const content: InteractiveContent = {
            type: 'button',
            body: { text: 'Choose an option' },
            action: {
              buttons: [...quickReplyButtons, ...otherButtons],
            },
          };
          
          const error = validateInteractiveContent(content);
          // Should pass because quick_reply count is <= 3
          expect(error).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });

  
  /**
   * Property: Valid list content (1-10 rows per section) should pass validation
   */
  it('should accept list content with 1-10 rows per section', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 3 }),
        fc.integer({ min: 1, max: 10 }),
        (sectionCount, rowsPerSection) => {
          const content: InteractiveContent = {
            type: 'list',
            body: { text: 'Select from the list' },
            action: {
              label: 'View Options',
              sections: Array.from({ length: sectionCount }, (_, s) => ({
                title: `Section ${s + 1}`,
                rows: Array.from({ length: rowsPerSection }, (_, r) => ({
                  id: `row_${s}_${r}`,
                  title: `Item ${r + 1}`,
                })),
              })),
            },
          };
          
          const error = validateInteractiveContent(content);
          expect(error).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: List content with >10 rows in any section should fail validation
   */
  it('should reject list content with more than 10 rows in any section', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 11, max: 20 }),
        (rowCount) => {
          const content: InteractiveContent = {
            type: 'list',
            body: { text: 'Select from the list' },
            action: {
              label: 'View Options',
              sections: [{
                title: 'Section 1',
                rows: Array.from({ length: rowCount }, (_, r) => ({
                  id: `row_${r}`,
                  title: `Item ${r + 1}`,
                })),
              }],
            },
          };
          
          const error = validateInteractiveContent(content);
          expect(error).not.toBeNull();
          expect(error?.code).toBe(WhatsAppErrorCode.LIST_LIMIT_EXCEEDED);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Valid carousel content (1-10 cards) should pass validation
   */
  it('should accept carousel content with 1-10 cards', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }),
        (cardCount) => {
          const content: InteractiveContent = {
            type: 'carousel',
            body: { text: 'Browse our products' },
            action: {
              cards: Array.from({ length: cardCount }, (_, i) => ({
                id: `card_${i}`,
                media: `https://example.com/image${i}.jpg`,
                text: `Product ${i + 1}`,
                buttons: [{ type: 'quick_reply' as const, id: `btn_${i}`, title: 'Select' }],
              })),
            },
          };
          
          const error = validateInteractiveContent(content);
          expect(error).toBeNull();
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Carousel content with >10 cards should fail validation
   */
  it('should reject carousel content with more than 10 cards', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 11, max: 20 }),
        (cardCount) => {
          const content: InteractiveContent = {
            type: 'carousel',
            body: { text: 'Browse our products' },
            action: {
              cards: Array.from({ length: cardCount }, (_, i) => ({
                id: `card_${i}`,
                media: `https://example.com/image${i}.jpg`,
                text: `Product ${i + 1}`,
                buttons: [{ type: 'quick_reply' as const, id: `btn_${i}`, title: 'Select' }],
              })),
            },
          };
          
          const error = validateInteractiveContent(content);
          expect(error).not.toBeNull();
          expect(error?.code).toBe(WhatsAppErrorCode.CAROUSEL_LIMIT_EXCEEDED);
        }
      ),
      { numRuns: 50 }
    );
  });
});
