# Requirements Document

## Introduction

Este documento define os requisitos para uma arquitetura híbrida de integração WhatsApp que permite alternar entre duas APIs (Evolution API e Whapi API) de forma dinâmica e controlada. O sistema garante que apenas UMA API esteja ativa por vez, evitando duplicação de mensagens e conflitos, enquanto aproveita os recursos avançados de botões interativos da Whapi quando ativa.

## Glossary

- **WhatsApp_Adapter_Layer**: Camada de abstração que gerencia o envio de mensagens independente do provedor ativo
- **Evolution_API**: API self-hosted principal para envio de mensagens WhatsApp, oferece maior controle e é gratuita
- **Whapi_API**: API cloud de fallback com suporte avançado a botões interativos (quick_reply, list, call, url, carousel)
- **Provider_Toggle**: Mecanismo de configuração central que controla qual API está ativa
- **Interactive_Message**: Mensagem com elementos clicáveis como botões, listas ou carrosséis
- **Quick_Reply_Button**: Botão que envia resposta automática quando clicado
- **List_Message**: Mensagem com menu de opções em formato de lista expansível
- **Carousel_Message**: Mensagem com múltiplos cards deslizáveis contendo imagens e botões
- **Message_Template**: Template pré-definido de mensagem que pode ser adaptado para ambas as APIs
- **Webhook_Handler**: Componente que recebe callbacks de respostas dos usuários
- **Rate_Limiter**: Controle de frequência de envio para evitar bloqueios do WhatsApp
- **Admin_Panel**: Interface administrativa para configuração do sistema

## Requirements

### Requirement 1: Provider Toggle Central

**User Story:** As an administrator, I want to toggle between WhatsApp providers from a central configuration, so that I can switch APIs without code changes.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display a toggle button to switch between Evolution_API and Whapi_API
2. WHEN the administrator activates Evolution_API, THEN THE Provider_Toggle SHALL deactivate Whapi_API immediately
3. WHEN the administrator activates Whapi_API, THEN THE Provider_Toggle SHALL deactivate Evolution_API immediately
4. THE Provider_Toggle SHALL persist the active provider configuration in the database
5. WHEN the provider configuration changes, THEN THE WhatsApp_Adapter_Layer SHALL use the new provider for all subsequent messages
6. THE Admin_Panel SHALL display the current connection status of the active provider

### Requirement 2: WhatsApp Adapter Layer

**User Story:** As a developer, I want a unified adapter layer for sending messages, so that I can send messages without knowing which provider is active.

#### Acceptance Criteria

1. THE WhatsApp_Adapter_Layer SHALL expose a single `sendMessage(payload)` interface for all message types
2. WHEN `sendMessage` is called, THEN THE WhatsApp_Adapter_Layer SHALL route to the active provider's adapter
3. THE WhatsApp_Adapter_Layer SHALL support message types: text, image, document, audio, video, interactive
4. IF the active provider fails to send, THEN THE WhatsApp_Adapter_Layer SHALL log the error with provider context
5. THE WhatsApp_Adapter_Layer SHALL NOT attempt to send via the inactive provider
6. WHEN sending interactive messages with Whapi_API inactive, THEN THE WhatsApp_Adapter_Layer SHALL convert to text fallback

### Requirement 3: Evolution API Adapter

**User Story:** As a system, I want to send messages via Evolution API, so that I can use the self-hosted solution with full control.

#### Acceptance Criteria

1. WHEN Evolution_API is active, THEN THE Evolution_Adapter SHALL send text messages via `/message/sendText/{instance}`
2. WHEN Evolution_API is active, THEN THE Evolution_Adapter SHALL send media via `/message/sendMedia/{instance}`
3. THE Evolution_Adapter SHALL format phone numbers to Brazilian standard (55 + DDD + number)
4. THE Evolution_Adapter SHALL log all sent messages to `whatsapp_evolution_logs` table
5. IF Evolution_API returns error, THEN THE Evolution_Adapter SHALL return structured error with status code
6. WHEN sending interactive messages, THEN THE Evolution_Adapter SHALL convert buttons to numbered text options

### Requirement 4: Whapi API Adapter

**User Story:** As a system, I want to send messages via Whapi API, so that I can use advanced interactive features.

#### Acceptance Criteria

1. WHEN Whapi_API is active, THEN THE Whapi_Adapter SHALL send text messages via `/messages/text`
2. WHEN Whapi_API is active, THEN THE Whapi_Adapter SHALL send interactive messages via `/messages/interactive`
3. THE Whapi_Adapter SHALL support quick_reply buttons with up to 3 options
4. THE Whapi_Adapter SHALL support list messages with sections and rows
5. THE Whapi_Adapter SHALL support call and url action buttons
6. THE Whapi_Adapter SHALL support carousel messages with up to 10 cards
7. THE Whapi_Adapter SHALL log all sent messages to `whatsapp_whapi_logs` table
8. IF Whapi_API returns error, THEN THE Whapi_Adapter SHALL return structured error with status code

### Requirement 5: Interactive Message Builder

**User Story:** As a developer, I want to build interactive messages in a provider-agnostic way, so that templates work with both APIs.

#### Acceptance Criteria

1. THE Interactive_Message_Builder SHALL accept a unified schema for buttons, lists, and carousels
2. WHEN Whapi_API is active, THEN THE Interactive_Message_Builder SHALL generate Whapi-compatible JSON
3. WHEN Evolution_API is active, THEN THE Interactive_Message_Builder SHALL generate text fallback with numbered options
4. THE Interactive_Message_Builder SHALL preserve button IDs for webhook response matching
5. THE Interactive_Message_Builder SHALL support header, body, and footer text sections
6. THE Interactive_Message_Builder SHALL validate button limits (max 3 quick_reply, max 10 list rows)

### Requirement 6: Post-Analysis Interactive Flows

**User Story:** As a user, I want to receive interactive options after food/exam analysis, so that I can quickly respond with actions.

#### Acceptance Criteria

1. WHEN Sofia completes food analysis, THEN THE System SHALL send interactive message with action buttons
2. WHEN Dr. Vital completes exam analysis, THEN THE System SHALL send interactive message with follow-up options
3. WHEN onboarding flow starts, THEN THE System SHALL use interactive messages for step navigation
4. THE interactive messages SHALL include options: "Confirmar", "Corrigir", "Ver detalhes", "Falar com nutricionista"
5. WHEN user clicks a button, THEN THE Webhook_Handler SHALL process the response and trigger appropriate action
6. IF Whapi_API is inactive, THEN THE System SHALL send text with numbered options as fallback

### Requirement 7: Webhook Response Handler

**User Story:** As a system, I want to receive and process button click responses, so that I can execute user-selected actions.

#### Acceptance Criteria

1. THE Webhook_Handler SHALL receive callbacks from both Evolution_API and Whapi_API
2. WHEN a quick_reply button is clicked, THEN THE Webhook_Handler SHALL extract button_id and trigger action
3. WHEN a list item is selected, THEN THE Webhook_Handler SHALL extract row_id and trigger action
4. THE Webhook_Handler SHALL match responses to original message context
5. THE Webhook_Handler SHALL log all received responses with user_id and action taken
6. IF response cannot be matched, THEN THE Webhook_Handler SHALL log warning and ignore

### Requirement 8: Rate Limiting and Anti-Ban

**User Story:** As a system administrator, I want rate limiting on message sending, so that accounts don't get banned by WhatsApp.

#### Acceptance Criteria

1. THE Rate_Limiter SHALL enforce minimum 1.2 second delay between messages to same number
2. THE Rate_Limiter SHALL enforce maximum 200 messages per hour per instance
3. THE Rate_Limiter SHALL queue messages that exceed rate limits
4. WHEN rate limit is reached, THEN THE Rate_Limiter SHALL return estimated wait time
5. THE Rate_Limiter SHALL track message counts per user per day
6. IF unusual sending pattern detected, THEN THE Rate_Limiter SHALL alert administrator

### Requirement 9: Template Compatibility

**User Story:** As a developer, I want existing message templates to work with both providers, so that I don't need to rewrite templates.

#### Acceptance Criteria

1. THE System SHALL maintain existing template format in `whatsapp_message_templates` table
2. WHEN template is loaded, THEN THE WhatsApp_Adapter_Layer SHALL adapt it to active provider format
3. THE templates SHALL support placeholders: {{nome}}, {{peso}}, {{calorias}}, {{data}}
4. THE templates SHALL support conditional sections based on user data
5. WHEN template includes buttons, THEN THE System SHALL convert based on active provider
6. THE System SHALL NOT require template changes when switching providers

### Requirement 10: Connection Health Monitoring

**User Story:** As an administrator, I want to monitor connection health of both providers, so that I can detect issues early.

#### Acceptance Criteria

1. THE Admin_Panel SHALL display real-time connection status for both providers
2. THE System SHALL check connection health every 5 minutes
3. WHEN connection fails, THEN THE System SHALL log error and alert administrator
4. THE Admin_Panel SHALL show last successful message timestamp per provider
5. THE Admin_Panel SHALL show message success/failure rate for last 24 hours
6. IF active provider becomes unhealthy, THEN THE System SHALL NOT auto-switch to other provider without admin action

### Requirement 11: Message Logging and Audit

**User Story:** As an administrator, I want comprehensive logging of all messages, so that I can audit and debug issues.

#### Acceptance Criteria

1. THE System SHALL log every outgoing message with: user_id, phone, provider, message_type, timestamp
2. THE System SHALL log every incoming response with: user_id, phone, provider, response_type, timestamp
3. THE System SHALL log provider API responses including message_id and status
4. THE logs SHALL be queryable by user_id, date range, provider, and message_type
5. THE System SHALL retain logs for minimum 90 days
6. THE Admin_Panel SHALL provide log search and export functionality

### Requirement 12: Graceful Degradation

**User Story:** As a user, I want to receive messages even when interactive features fail, so that communication is not interrupted.

#### Acceptance Criteria

1. IF interactive message fails to send, THEN THE System SHALL retry as plain text
2. IF media message fails, THEN THE System SHALL send text description with link
3. IF provider is temporarily unavailable, THEN THE System SHALL queue message for retry
4. THE System SHALL retry failed messages up to 3 times with exponential backoff
5. WHEN all retries fail, THEN THE System SHALL log failure and notify administrator
6. THE System SHALL NOT lose messages due to temporary provider issues
