# Implementation Plan: WhatsApp Hybrid Integration

## Overview

Este plano implementa a arquitetura híbrida de WhatsApp em fases incrementais, começando pela infraestrutura de banco de dados, seguindo para os adapters, e finalizando com a integração no admin panel e fluxos de mensagens interativas.

## Tasks

- [x] 1. Setup Database Infrastructure
  - [x] 1.1 Create provider configuration table and singleton
    - Create migration for `whatsapp_provider_config` table
    - Insert initial configuration with Evolution as default
    - Add RLS policies for admin-only access
    - _Requirements: 1.4_

  - [x] 1.2 Create unified message logs table
    - Create migration for `whatsapp_message_logs` table
    - Add indexes for user_id, phone, created_at, status
    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 1.3 Create webhook responses table
    - Create migration for `whatsapp_webhook_responses` table
    - Add indexes for user_id, original_message_id
    - _Requirements: 7.4, 7.5_

  - [x] 1.4 Create rate limit tracking table
    - Create migration for `whatsapp_rate_limit_tracking` table
    - Add unique constraint on (phone, tracking_date)
    - _Requirements: 8.5_

- [x] 2. Implement Core Adapter Layer
  - [x] 2.1 Create shared types and interfaces
    - Create `supabase/functions/_shared/whatsapp/types.ts`
    - Define SendMessagePayload, TextContent, MediaContent, InteractiveContent
    - Define SendResult, WhatsAppError, WhatsAppErrorCode
    - _Requirements: 2.1, 2.3_

  - [x] 2.2 Implement phone number formatter utility
    - Create `supabase/functions/_shared/whatsapp/phone-formatter.ts`
    - Handle various input formats (with/without country code, with/without special chars)
    - Always output Brazilian standard: 55 + DDD + number
    - _Requirements: 3.3_

  - [x] 2.3 Write property test for phone number formatting
    - **Property 6: Phone Number Formatting**
    - Generate random phone numbers in various formats
    - Verify output always matches /^55\d{10,11}$/
    - **Validates: Requirements 3.3**

  - [x] 2.4 Implement WhatsApp Adapter Layer
    - Create `supabase/functions/_shared/whatsapp/adapter-layer.ts`
    - Implement getActiveProvider() reading from database
    - Implement sendMessage() routing to correct adapter
    - Implement logging to whatsapp_message_logs
    - _Requirements: 2.1, 2.2, 2.5_

  - [x] 2.5 Write property test for provider routing
    - **Property 3: Provider Routing Correctness**
    - Mock adapters and verify correct one is called based on config
    - **Validates: Requirements 1.5, 2.2, 2.5**

- [x] 3. Implement Evolution Adapter
  - [x] 3.1 Create Evolution Adapter
    - Create `supabase/functions/_shared/whatsapp/evolution-adapter.ts`
    - Implement sendText() using existing Evolution API integration
    - Implement sendMedia() for images, documents, audio, video
    - Implement checkConnection() for health monitoring
    - _Requirements: 3.1, 3.2_

  - [x] 3.2 Implement interactive-to-text fallback converter
    - Add convertInteractiveToText() method
    - Convert buttons to numbered options: "1️⃣ Option1\n2️⃣ Option2..."
    - Convert list items to numbered sections
    - Preserve button IDs in metadata for response matching
    - _Requirements: 3.6_

  - [x] 3.3 Write property test for interactive fallback conversion
    - **Property 5: Interactive Fallback Conversion**
    - Generate random interactive content (1-3 buttons, 1-10 rows)
    - Verify all options appear numbered in output text
    - **Validates: Requirements 2.6, 3.6, 5.3, 6.6**

  - [x] 3.4 Implement error handling and logging
    - Return structured WhatsAppError on failures
    - Log all messages to whatsapp_message_logs with provider='evolution'
    - _Requirements: 3.4, 3.5_

- [x] 4. Implement Whapi Adapter
  - [x] 4.1 Create Whapi Adapter
    - Create `supabase/functions/_shared/whatsapp/whapi-adapter.ts`
    - Implement sendText() via POST /messages/text
    - Implement sendMedia() for images, documents
    - Implement checkConnection() for health monitoring
    - _Requirements: 4.1_

  - [x] 4.2 Implement interactive message support
    - Implement sendInteractive() via POST /messages/interactive
    - Support quick_reply buttons (max 3)
    - Support list messages with sections and rows
    - Support call and url action buttons
    - _Requirements: 4.2, 4.3, 4.4, 4.5_

  - [x] 4.3 Implement carousel message support
    - Implement sendCarousel() via POST /messages/carousel
    - Support up to 10 cards with images and buttons
    - _Requirements: 4.6_

  - [x] 4.4 Write property test for Whapi button limits
    - **Property 9: Whapi Interactive Limits Validation**
    - Generate interactive content with varying button/row counts
    - Verify validation rejects content exceeding limits
    - **Validates: Requirements 4.3, 4.6, 5.6**

  - [x] 4.5 Implement error handling and logging
    - Return structured WhatsAppError on failures
    - Log all messages to whatsapp_message_logs with provider='whapi'
    - _Requirements: 4.7, 4.8_

- [x] 5. Checkpoint - Core Adapters Complete
  - Ensure all adapter tests pass
  - Verify both adapters can send text messages
  - Ask the user if questions arise

- [x] 6. Implement Interactive Message Builder
  - [x] 6.1 Create Interactive Message Builder
    - Create `supabase/functions/_shared/whatsapp/interactive-builder.ts`
    - Define unified schema for buttons, lists, carousels
    - Implement build() method that adapts to provider
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 6.2 Implement button ID preservation
    - Ensure button IDs are preserved in both Whapi format and text fallback
    - Store ID mapping for webhook response matching
    - _Requirements: 5.4_

  - [ ] 6.3 Write property test for button ID preservation
    - **Property 10: Button ID Preservation**
    - Generate messages with random button IDs
    - Verify all IDs present in output regardless of provider
    - **Validates: Requirements 5.4**

  - [x] 6.4 Implement validation
    - Validate button limits (max 3 quick_reply)
    - Validate list limits (max 10 rows per section)
    - Validate carousel limits (max 10 cards)
    - Return validation errors for invalid content
    - _Requirements: 5.6_

  - [x] 6.5 Create pre-defined templates for common flows
    - FOOD_ANALYSIS_COMPLETE template with confirm/edit/cancel buttons
    - EXAM_ANALYSIS_COMPLETE template with follow-up options
    - ONBOARDING_STEP template for navigation
    - DAILY_CHECKIN template
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 7. Implement Rate Limiter
  - [x] 7.1 Create Rate Limiter service
    - Create `supabase/functions/_shared/whatsapp/rate-limiter.ts`
    - Implement checkLimit() checking delay and hourly limits
    - Implement recordSent() updating tracking table
    - Implement getQueuePosition() for queued messages
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ] 7.2 Write property test for rate limiting
    - **Property 13: Rate Limiting Enforcement**
    - Generate sequences of messages with timestamps
    - Verify rate limits are correctly enforced
    - **Validates: Requirements 8.1, 8.2, 8.3, 8.4**

  - [x] 7.3 Implement message queue for rate-limited messages
    - Queue messages that exceed rate limits
    - Return estimated wait time
    - Process queue with appropriate delays
    - _Requirements: 8.3, 8.4_

- [x] 8. Implement Webhook Handler
  - [x] 8.1 Create unified webhook handler edge function
    - Create `supabase/functions/whatsapp-webhook-unified/index.ts`
    - Accept webhooks from both Evolution and Whapi
    - Parse and normalize webhook payloads
    - _Requirements: 7.1_

  - [x] 8.2 Implement button/list response extraction
    - Extract button_id from quick_reply clicks
    - Extract row_id from list selections
    - Match to original message context
    - _Requirements: 7.2, 7.3, 7.4_

  - [ ] 8.3 Write property test for webhook response extraction
    - **Property 11: Webhook Response Extraction**
    - Generate webhook payloads with various button/list responses
    - Verify correct extraction of IDs and titles
    - **Validates: Requirements 7.2, 7.3**

  - [x] 8.4 Implement action execution
    - Map button IDs to action handlers
    - Execute appropriate action (confirm, edit, cancel, etc.)
    - Log response and action result
    - _Requirements: 6.5, 7.5_

- [x] 9. Checkpoint - Backend Complete
  - Ensure all backend tests pass
  - Verify end-to-end message flow works
  - Ask the user if questions arise

- [x] 10. Implement Provider Toggle in Admin Panel
  - [x] 10.1 Create provider configuration hook
    - Create `src/hooks/useWhatsAppProviderConfig.ts`
    - Fetch current provider config from database
    - Implement toggle mutation with optimistic update
    - _Requirements: 1.1, 1.2, 1.3_

  - [ ] 10.2 Write property test for provider mutual exclusion
    - **Property 1: Provider Mutual Exclusion**
    - Generate sequence of toggle actions
    - Verify exactly one provider active after each toggle
    - **Validates: Requirements 1.2, 1.3**

  - [x] 10.3 Create WhatsApp Provider Panel component
    - Create `src/components/admin/WhatsAppProviderPanel.tsx`
    - Display toggle button for Evolution/Whapi
    - Show connection status for both providers
    - Show last message timestamp and success rate
    - _Requirements: 1.1, 1.6, 10.1, 10.4, 10.5_

  - [x] 10.4 Add provider panel to Admin Page
    - Import and add WhatsAppProviderPanel to AdminPage
    - Ensure only admins can access
    - _Requirements: 1.1_

- [x] 11. Implement Template Compatibility
  - [x] 11.1 Create template processor
    - Create `supabase/functions/_shared/whatsapp/template-processor.ts`
    - Load templates from whatsapp_message_templates table
    - Replace placeholders: {{nome}}, {{peso}}, {{calorias}}, {{data}}
    - Handle conditional sections
    - _Requirements: 9.1, 9.2, 9.3, 9.4_

  - [x] 11.2 Write property test for template placeholder substitution
    - **Property 14: Template Placeholder Substitution**
    - Generate templates with random placeholders and data
    - Verify no placeholders remain in output
    - **Validates: Requirements 9.3**

  - [x] 11.3 Adapt templates for provider
    - Convert button definitions based on active provider
    - Ensure same template works with both providers
    - _Requirements: 9.5, 9.6_

  - [x] 11.4 Write property test for template provider agnostic
    - **Property 15: Template Provider Agnostic**
    - Process same template with both providers
    - Verify both produce valid output without template changes
    - **Validates: Requirements 9.6**

- [x] 12. Implement Graceful Degradation
  - [x] 12.1 Implement retry logic with exponential backoff
    - Add retry wrapper to adapter layer
    - Implement exponential backoff (1s, 2s, 4s)
    - Max 3 retries for retryable errors
    - _Requirements: 12.4_

  - [x] 12.2 Implement fallback strategies
    - Interactive fails → retry as plain text
    - Media fails → send text with link
    - Provider unavailable → queue for later
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ] 12.3 Write property test for graceful degradation
    - **Property 17: Graceful Degradation with Retry**
    - Simulate various failure scenarios
    - Verify messages are never lost (sent or logged as failed)
    - **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.6**

  - [x] 12.4 Implement failure notification
    - Log permanent failures
    - Alert admin for critical failures
    - _Requirements: 12.5_

- [x] 13. Implement Post-Analysis Interactive Flows
  - [x] 13.1 Update Sofia food analysis to send interactive message
    - After food analysis complete, send interactive message via adapter
    - Include buttons: Confirmar, Corrigir, Ver detalhes
    - Use text fallback when Evolution active
    - _Requirements: 6.1, 6.4_

  - [x] 13.2 Update Dr. Vital exam analysis to send interactive message
    - After exam analysis complete, send interactive message
    - Include follow-up options
    - _Requirements: 6.2, 6.4_

  - [x] 13.3 Implement button response handlers
    - Handle "confirm_analysis" → save confirmed analysis
    - Handle "edit_analysis" → prompt for corrections
    - Handle "cancel_analysis" → discard analysis
    - Handle "view_details" → send detailed report
    - _Requirements: 6.5_

- [x] 14. Implement Health Monitoring
  - [x] 14.1 Create health check edge function
    - Create `supabase/functions/whatsapp-health-check/index.ts`
    - Check connection status for both providers
    - Update health status in provider_config table
    - _Requirements: 10.2, 10.3_

  - [ ] 14.2 Write property test for no auto-switch on failure
    - **Property 16: No Auto-Switch on Provider Failure**
    - Simulate provider failure
    - Verify active provider remains unchanged
    - **Validates: Requirements 10.6**

  - [x] 14.3 Add health status display to admin panel
    - Show real-time connection status
    - Show last health check timestamp
    - Show error details if unhealthy
    - _Requirements: 10.1, 10.3_

- [x] 15. Final Checkpoint - Integration Complete
  - Ensure all tests pass (62 tests passing)
  - Verify complete flow: toggle → send → webhook → action
  - Test with both providers
  - Ask the user if questions arise

## Notes

- All tasks are required for complete implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout for type safety
- All edge functions follow the existing project patterns
