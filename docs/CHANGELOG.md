# Changelog

Todas as mudanças notáveis documentadas aqui (estilo SemVer).

---

## [2.0.0] - 2026-01-05

### 🎉 Major Release - Documentação Completa

#### Adicionado
- **Catálogo de Edge Functions**: Documentação completa das 53 edge functions
- **Schema do Banco**: Documentação das 236 tabelas do sistema
- **Documentação de IAs**: Sofia e Dr. Vital documentados completamente
- **Documentação de Integrações**: Google Fit, Mealie, Stripe, n8n, Resend

#### Infraestrutura
- 53 Edge Functions ativas em produção
- 236 tabelas no banco de dados
- 7 integrações externas funcionais
- 2 sistemas de IA personalizados

---

## [1.9.0] - 2026-01-04

### 🔧 Correções e Otimizações

#### Corrigido
- **dr-vital-enhanced**: Removidas referências a modelos IA inexistentes (gpt-5, gpt-4.1)
- **Análise de 76 edge functions**: Sistema 100% limpo e operacional
- **CORS Headers**: Configurados corretamente em todas as functions

#### Otimizado
- Consolidação de edge functions essenciais vs opcionais
- Performance de carregamento de contexto do usuário

---

## [1.8.0] - 2025-12-28

### 📱 Google Fit Avançado

#### Adicionado
- **Dados expandidos**: 25+ tipos de dados sincronizados
  - Sono detalhado (estágios, eficiência)
  - Composição corporal (gordura, massa muscular)
  - Hidratação e nutrição
  - Oxigenação e frequência respiratória
- **Sincronização horária automática**: `google-fit-hourly-sync`
- **Análise IA dos dados**: `google-fit-ai-analysis`

#### Melhorado
- Renovação automática de tokens expirados
- Cache de dados para melhor performance

---

## [1.7.0] - 2025-12-20

### 🤖 Lovable AI Integration

#### Adicionado
- **Lovable AI Gateway**: Integração com gateway de IA da Lovable
- **Modelos suportados**:
  - google/gemini-2.5-pro
  - google/gemini-2.5-flash
  - google/gemini-2.5-flash-lite
  - openai/gpt-5
  - openai/gpt-5-mini
  - openai/gpt-5-nano
- **Fallback Chain**: Lovable → OpenAI → Google AI → Resposta padrão

#### Alterado
- Sofia e Dr. Vital agora usam Lovable AI como provedor principal
- Configurações de IA gerenciadas via tabela `ai_configurations`

---

## [1.6.0] - 2025-12-15

### 💚 Sofia Enhanced

#### Adicionado
- **sofia-enhanced-memory**: Chat com memória persistente
- **Contexto unificado**: Busca dados de 30+ tabelas
- **Histórico de conversas**: Nunca apagado, usado para contexto
- **Personalidade refinada**: Super carinhosa e empática

#### Novo módulo compartilhado
- `_shared/user-complete-context.ts`: Contexto completo do usuário

---

## [1.5.0] - 2025-12-10

### 🏥 Dr. Vital Completo

#### Adicionado
- **dr-vital-chat**: Chat principal com acesso a 20+ tabelas
- **Memória de longo prazo**: Tabela `dr_vital_memory`
- **Relatórios semanais**: `dr-vital-weekly-report`
- **Análise multidimensional**: Correlação peso + humor + sono + nutrição

#### Dados acessados
- Perfil, anamnese, dados físicos
- Peso, nutrição, exercícios
- Sono, humor, hidratação
- Metas, conquistas, missões
- Medicamentos, suplementos, documentos

---

## [1.4.0] - 2025-12-01

### 🍽️ Mealie Integration

#### Adicionado
- **mealie-real**: Integração real com servidor Mealie
- **Filtragem por restrições**: Glúten, lactose, vegetariano, vegano
- **Filtragem por preferências**: Frango, peixe, proteína, etc.
- **Cache de receitas**: 5 minutos para performance
- **Mapeamento nutricional**: Conversão automática de dados

---

## [1.3.0] - 2025-11-20

### 📊 Sistema de Metas

#### Adicionado
- **user_goals**: Sistema completo de metas
- **goal_updates**: Histórico de progresso
- **user_goal_invitations**: Convites para metas em grupo
- **user_goal_participants**: Participantes de metas compartilhadas
- **goal-notifications**: Notificações de metas e convites

---

## [1.2.0] - 2025-08-11

#### Adicionado
- Suíte de documentação em `/docs/*`
- Group Goals: `user_goal_invitations` e `user_goal_participants` com RLS
- Frontend invoca `goal-notifications` com `recipientUserId`
- Storage: padronizado `course-thumbnails` para cursos/módulos

#### Segurança
- RLS reforçado para `sessions` e `lessons` (somente admin escreve)
- Daily responses: permitido seções `saboteurs` em CHECK constraint

---

## [1.1.0] - 2025-08-10

#### Alterado
- Schema de medição de peso unificado
- Campos de bioimpedância padronizados

---

## [1.0.0] - 2025-08-01

### 🎉 Lançamento Inicial

#### Features Principais
- Sistema de autenticação com Supabase
- Perfis de usuário completos
- Rastreamento de peso e composição corporal
- Sistema de cursos e aulas
- Comunidade com posts e comentários
- Desafios e gamificação
- Chat com IA básico

#### Infraestrutura
- 50+ tabelas iniciais
- 20+ edge functions
- RLS em todas as tabelas de usuário
- Storage buckets configurados

---

## Convenções

Os tipos de mudanças são:
- **Adicionado**: Para novas features
- **Alterado**: Para mudanças em funcionalidades existentes
- **Descontinuado**: Para features que serão removidas
- **Removido**: Para features removidas
- **Corrigido**: Para correções de bugs
- **Segurança**: Para vulnerabilidades

---

*Mantido por: Equipe Dr. Vita*  
*Última atualização: 05/01/2026*
