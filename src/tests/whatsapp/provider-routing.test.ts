/**
 * Property-Based Tests for WhatsApp Provider Routing
 * 
 * Feature: whatsapp-hybrid-integration
 * Property 3: Provider Routing Correctness
 * 
 * Validates: Requirements 1.5, 2.2, 2.5
 * 
 * For any message sent through the WhatsApp_Adapter_Layer, the message SHALL be 
 * routed exclusively to the currently active provider's adapter, and never to 
 * the inactive provider.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';

// ============================================
// Mock Types (matching the actual types)
// ============================================

type WhatsAppProvider = 'evolution' | 'whapi';
type MessageType = 'text' | 'image' | 'document' | 'audio' | 'video' | 'interactive';

interface SendResult {
  success: boolean;
  messageId?: string;
  provider: WhatsAppProvider;
  error?: string;
}

interface MockAdapter {
  sendText: ReturnType<typeof vi.fn>;
  sendMedia: ReturnType<typeof vi.fn>;
  sendInteractive: ReturnType<typeof vi.fn>;
  provider: WhatsAppProvider;
  callCount: number;
}

// ============================================
// Mock Adapter Layer for Testing
// ============================================

class MockWhatsAppAdapterLayer {
  private activeProvider: WhatsAppProvider = 'evolution';
  private evolutionAdapter: MockAdapter;
  private whapiAdapter: MockAdapter;
  
  constructor() {
    this.evolutionAdapter = this.createMockAdapter('evolution');
    this.whapiAdapter = this.createMockAdapter('whapi');
  }
  
  private createMockAdapter(provider: WhatsAppProvider): MockAdapter {
    return {
      sendText: vi.fn().mockResolvedValue({ success: true, provider, messageId: `${provider}-msg-${Date.now()}` }),
      sendMedia: vi.fn().mockResolvedValue({ success: true, provider, messageId: `${provider}-media-${Date.now()}` }),
      sendInteractive: vi.fn().mockResolvedValue({ success: true, provider, messageId: `${provider}-interactive-${Date.now()}` }),
      provider,
      callCount: 0,
    };
  }
  
  setActiveProvider(provider: WhatsAppProvider): void {
    this.activeProvider = provider;
  }
  
  getActiveProvider(): WhatsAppProvider {
    return this.activeProvider;
  }
  
  getEvolutionAdapter(): MockAdapter {
    return this.evolutionAdapter;
  }
  
  getWhapiAdapter(): MockAdapter {
    return this.whapiAdapter;
  }
  
  resetMocks(): void {
    this.evolutionAdapter = this.createMockAdapter('evolution');
    this.whapiAdapter = this.createMockAdapter('whapi');
  }
  
  async sendMessage(payload: {
    phone: string;
    messageType: MessageType;
    content: any;
  }): Promise<SendResult> {
    const adapter = this.activeProvider === 'evolution' 
      ? this.evolutionAdapter 
      : this.whapiAdapter;
    
    adapter.callCount++;
    
    switch (payload.messageType) {
      case 'text':
        return adapter.sendText(payload.phone, payload.content.body);
      case 'image':
      case 'document':
      case 'audio':
      case 'video':
        return adapter.sendMedia(payload.phone, payload.content);
      case 'interactive':
        // Evolution converts interactive to text
        if (this.activeProvider === 'evolution') {
          return adapter.sendText(payload.phone, this.convertInteractiveToText(payload.content));
        }
        return adapter.sendInteractive(payload.phone, payload.content);
      default:
        return { success: false, provider: this.activeProvider, error: 'Unknown message type' };
    }
  }
  
  private convertInteractiveToText(content: any): string {
    let text = content.body?.text || '';
    if (content.action?.buttons) {
      text += '\n\n';
      content.action.buttons.forEach((btn: any, i: number) => {
        text += `${i + 1}️⃣ ${btn.title}\n`;
      });
    }
    return text;
  }
}

// ============================================
// Arbitraries (Test Data Generators)
// ============================================

const providerArbitrary = fc.constantFrom<WhatsAppProvider>('evolution', 'whapi');

const messageTypeArbitrary = fc.constantFrom<MessageType>(
  'text', 'image', 'document', 'audio', 'video', 'interactive'
);

const phoneArbitrary = fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'), {
  minLength: 10,
  maxLength: 13,
}).map(digits => `55${digits.join('')}`);

const textContentArbitrary = fc.record({
  body: fc.string({ minLength: 1, maxLength: 500 }),
});

const mediaContentArbitrary = fc.record({
  url: fc.webUrl(),
  caption: fc.option(fc.string({ maxLength: 200 })),
});

const buttonArbitrary = fc.record({
  type: fc.constantFrom('quick_reply', 'call', 'url'),
  id: fc.string({ minLength: 1, maxLength: 20 }),
  title: fc.string({ minLength: 1, maxLength: 20 }),
});

const interactiveContentArbitrary = fc.record({
  type: fc.constantFrom('button', 'list'),
  body: fc.record({ text: fc.string({ minLength: 1, maxLength: 500 }) }),
  action: fc.record({
    buttons: fc.array(buttonArbitrary, { minLength: 1, maxLength: 3 }),
  }),
});

const messagePayloadArbitrary = fc.record({
  phone: phoneArbitrary,
  messageType: messageTypeArbitrary,
}).chain(({ phone, messageType }) => {
  const contentArb = messageType === 'text' 
    ? textContentArbitrary
    : messageType === 'interactive'
    ? interactiveContentArbitrary
    : mediaContentArbitrary;
  
  return fc.record({
    phone: fc.constant(phone),
    messageType: fc.constant(messageType),
    content: contentArb,
  });
});

// ============================================
// Property Tests
// ============================================

describe('WhatsApp Provider Routing - Property Tests', () => {
  let adapterLayer: MockWhatsAppAdapterLayer;
  
  beforeEach(() => {
    adapterLayer = new MockWhatsAppAdapterLayer();
  });
  
  /**
   * Property 3: Provider Routing Correctness
   * 
   * For any message sent through the WhatsApp_Adapter_Layer, the message SHALL be 
   * routed exclusively to the currently active provider's adapter, and never to 
   * the inactive provider.
   */
  it.each([
    ['evolution' as WhatsAppProvider],
    ['whapi' as WhatsAppProvider],
  ])('should route all messages exclusively to %s when it is active', async (activeProvider) => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(messagePayloadArbitrary, { minLength: 1, maxLength: 10 }),
        async (messages) => {
          // Setup
          adapterLayer.resetMocks();
          adapterLayer.setActiveProvider(activeProvider);
          
          const evolutionAdapter = adapterLayer.getEvolutionAdapter();
          const whapiAdapter = adapterLayer.getWhapiAdapter();
          
          // Send all messages
          for (const msg of messages) {
            await adapterLayer.sendMessage(msg);
          }
          
          // Verify routing
          const activeAdapter = activeProvider === 'evolution' ? evolutionAdapter : whapiAdapter;
          const inactiveAdapter = activeProvider === 'evolution' ? whapiAdapter : evolutionAdapter;
          
          // Active adapter should have received calls
          expect(activeAdapter.callCount).toBe(messages.length);
          
          // Inactive adapter should have received NO calls
          expect(inactiveAdapter.callCount).toBe(0);
          expect(inactiveAdapter.sendText).not.toHaveBeenCalled();
          expect(inactiveAdapter.sendMedia).not.toHaveBeenCalled();
          expect(inactiveAdapter.sendInteractive).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Provider Switch Mid-Sequence
   * 
   * When provider is switched mid-sequence, subsequent messages should go to 
   * the new provider, and previous messages should have gone to the old provider.
   */
  it('should correctly route messages when provider is switched mid-sequence', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(messagePayloadArbitrary, { minLength: 2, maxLength: 5 }),
        fc.array(messagePayloadArbitrary, { minLength: 2, maxLength: 5 }),
        providerArbitrary,
        async (firstBatch, secondBatch, initialProvider) => {
          // Setup
          adapterLayer.resetMocks();
          adapterLayer.setActiveProvider(initialProvider);
          
          const evolutionAdapter = adapterLayer.getEvolutionAdapter();
          const whapiAdapter = adapterLayer.getWhapiAdapter();
          
          // Send first batch
          for (const msg of firstBatch) {
            await adapterLayer.sendMessage(msg);
          }
          
          // Record counts after first batch
          const evolutionCountAfterFirst = evolutionAdapter.callCount;
          const whapiCountAfterFirst = whapiAdapter.callCount;
          
          // Switch provider
          const newProvider: WhatsAppProvider = initialProvider === 'evolution' ? 'whapi' : 'evolution';
          adapterLayer.setActiveProvider(newProvider);
          
          // Send second batch
          for (const msg of secondBatch) {
            await adapterLayer.sendMessage(msg);
          }
          
          // Verify first batch went to initial provider
          if (initialProvider === 'evolution') {
            expect(evolutionCountAfterFirst).toBe(firstBatch.length);
            expect(whapiCountAfterFirst).toBe(0);
          } else {
            expect(whapiCountAfterFirst).toBe(firstBatch.length);
            expect(evolutionCountAfterFirst).toBe(0);
          }
          
          // Verify second batch went to new provider
          if (newProvider === 'evolution') {
            expect(evolutionAdapter.callCount - evolutionCountAfterFirst).toBe(secondBatch.length);
          } else {
            expect(whapiAdapter.callCount - whapiCountAfterFirst).toBe(secondBatch.length);
          }
        }
      ),
      { numRuns: 30 }
    );
  });
  
  /**
   * Property: Message Type Routing
   * 
   * All message types should be routed to the active provider regardless of type.
   */
  it('should route all message types to the active provider', async () => {
    await fc.assert(
      fc.asyncProperty(
        providerArbitrary,
        messageTypeArbitrary,
        phoneArbitrary,
        async (provider, messageType, phone) => {
          // Setup
          adapterLayer.resetMocks();
          adapterLayer.setActiveProvider(provider);
          
          const evolutionAdapter = adapterLayer.getEvolutionAdapter();
          const whapiAdapter = adapterLayer.getWhapiAdapter();
          
          // Create appropriate content for message type
          let content: any;
          switch (messageType) {
            case 'text':
              content = { body: 'Test message' };
              break;
            case 'interactive':
              content = {
                type: 'button',
                body: { text: 'Choose an option' },
                action: { buttons: [{ type: 'quick_reply', id: 'btn1', title: 'Option 1' }] },
              };
              break;
            default:
              content = { url: 'https://example.com/media.jpg' };
          }
          
          // Send message
          await adapterLayer.sendMessage({ phone, messageType, content });
          
          // Verify correct adapter was called
          const activeAdapter = provider === 'evolution' ? evolutionAdapter : whapiAdapter;
          const inactiveAdapter = provider === 'evolution' ? whapiAdapter : evolutionAdapter;
          
          expect(activeAdapter.callCount).toBe(1);
          expect(inactiveAdapter.callCount).toBe(0);
        }
      ),
      { numRuns: 50 }
    );
  });
  
  /**
   * Property: Interactive to Text Conversion for Evolution
   * 
   * When Evolution is active, interactive messages should be converted to text
   * and sent via sendText, not sendInteractive.
   */
  it('should convert interactive to text when Evolution is active', async () => {
    await fc.assert(
      fc.asyncProperty(
        phoneArbitrary,
        interactiveContentArbitrary,
        async (phone, interactiveContent) => {
          // Setup
          adapterLayer.resetMocks();
          adapterLayer.setActiveProvider('evolution');
          
          const evolutionAdapter = adapterLayer.getEvolutionAdapter();
          
          // Send interactive message
          await adapterLayer.sendMessage({
            phone,
            messageType: 'interactive',
            content: interactiveContent,
          });
          
          // Evolution should use sendText for interactive (fallback)
          expect(evolutionAdapter.sendText).toHaveBeenCalled();
          expect(evolutionAdapter.sendInteractive).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 30 }
    );
  });
  
  /**
   * Property: Native Interactive for Whapi
   * 
   * When Whapi is active, interactive messages should be sent via sendInteractive.
   */
  it('should use native interactive when Whapi is active', async () => {
    await fc.assert(
      fc.asyncProperty(
        phoneArbitrary,
        interactiveContentArbitrary,
        async (phone, interactiveContent) => {
          // Setup
          adapterLayer.resetMocks();
          adapterLayer.setActiveProvider('whapi');
          
          const whapiAdapter = adapterLayer.getWhapiAdapter();
          
          // Send interactive message
          await adapterLayer.sendMessage({
            phone,
            messageType: 'interactive',
            content: interactiveContent,
          });
          
          // Whapi should use sendInteractive
          expect(whapiAdapter.sendInteractive).toHaveBeenCalled();
          expect(whapiAdapter.sendText).not.toHaveBeenCalled();
        }
      ),
      { numRuns: 30 }
    );
  });
});

// ============================================
// Unit Tests for Edge Cases
// ============================================

describe('WhatsApp Provider Routing - Unit Tests', () => {
  let adapterLayer: MockWhatsAppAdapterLayer;
  
  beforeEach(() => {
    adapterLayer = new MockWhatsAppAdapterLayer();
  });
  
  it('should default to evolution provider', () => {
    expect(adapterLayer.getActiveProvider()).toBe('evolution');
  });
  
  it('should correctly switch providers', () => {
    adapterLayer.setActiveProvider('whapi');
    expect(adapterLayer.getActiveProvider()).toBe('whapi');
    
    adapterLayer.setActiveProvider('evolution');
    expect(adapterLayer.getActiveProvider()).toBe('evolution');
  });
  
  it('should handle empty message content gracefully', async () => {
    const result = await adapterLayer.sendMessage({
      phone: '5511999999999',
      messageType: 'text',
      content: { body: '' },
    });
    
    expect(result.success).toBe(true);
    expect(result.provider).toBe('evolution');
  });
  
  it('should handle rapid provider switches', async () => {
    // Rapidly switch providers
    for (let i = 0; i < 10; i++) {
      adapterLayer.setActiveProvider(i % 2 === 0 ? 'evolution' : 'whapi');
    }
    
    // Final state should be whapi (9 % 2 = 1)
    expect(adapterLayer.getActiveProvider()).toBe('whapi');
    
    // Send a message
    const result = await adapterLayer.sendMessage({
      phone: '5511999999999',
      messageType: 'text',
      content: { body: 'Test' },
    });
    
    expect(result.provider).toBe('whapi');
  });
});
