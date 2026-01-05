# 📚 Documentação do Dr. Vita

Documentação técnica completa do sistema Dr. Vita para engenheiros e agentes de IA.

---

## 📋 Índice Geral

### Documentação Nova (Atualizada 05/01/2026)

| Documento | Descrição |
|-----------|-----------|
| [AI_SYSTEMS.md](./AI_SYSTEMS.md) | **Sofia e Dr. Vital - Sistemas de IA** |
| [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) | **Schema completo (236 tabelas)** |
| [EDGE_FUNCTIONS_CATALOG.md](./EDGE_FUNCTIONS_CATALOG.md) | **Catálogo de 53 Edge Functions** |
| [INTEGRATIONS.md](./INTEGRATIONS.md) | **Google Fit, Mealie, Stripe, n8n** |
| [CHANGELOG.md](./CHANGELOG.md) | **Histórico completo de mudanças** |

### Documentação Base

| Documento | Descrição |
|-----------|-----------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitetura geral do sistema |
| [DOMAIN_MAP.md](./DOMAIN_MAP.md) | Mapa de domínios |
| [ENVIRONMENT.md](./ENVIRONMENT.md) | Variáveis de ambiente |
| [SUPABASE_SCHEMA.md](./SUPABASE_SCHEMA.md) | ERD e políticas RLS |
| [RBAC_SECURITY.md](./RBAC_SECURITY.md) | Controle de acesso |
| [STORAGE_POLICIES.md](./STORAGE_POLICIES.md) | Políticas de storage |
| [FEATURE_MAPS.md](./FEATURE_MAPS.md) | Mapa de features |
| [OPERATIONS_RUNBOOK.md](./OPERATIONS_RUNBOOK.md) | Runbook de operações |
| [TESTING.md](./TESTING.md) | Guia de testes |
| [CI_CD.md](./CI_CD.md) | Pipeline CI/CD |
| [MIGRATION.md](./MIGRATION.md) | Guia de migrações |
| [ADRs/](./ADRs) | Registros de decisão arquitetural |

---

## 🎯 Highlights

### Stack Tecnológico
- **Frontend**: TypeScript + React (Vite)
- **Backend**: Supabase (Postgres + Edge Functions + Storage)
- **IA**: Lovable AI Gateway (Gemini, GPT-5)
- **Path alias**: `@/* → ./src/*`

### Números do Sistema
- **53 Edge Functions** em produção
- **236 tabelas** no banco de dados
- **7 integrações** externas ativas
- **2 sistemas de IA** personalizados (Sofia, Dr. Vital)

### Edge Functions
Ver: `supabase/functions/*` ou [EDGE_FUNCTIONS_CATALOG.md](./EDGE_FUNCTIONS_CATALOG.md)

### Segurança Crítica
- RLS admin overrides usam JWT `app_metadata.role = 'admin'`
- Todos os segredos são redatados
- Use placeholders como `<SUPABASE_URL>`

---

## 🤖 Sistemas de IA

| IA | Especialidade | Personalidade |
|----|---------------|---------------|
| **Sofia** | Nutrição | Carinhosa, empática 💚 |
| **Dr. Vital** | Saúde geral | Profissional, acolhedor |

Ver detalhes em: [AI_SYSTEMS.md](./AI_SYSTEMS.md)

---

## 🔗 Integrações Ativas

| Integração | Status | Edge Functions |
|------------|--------|----------------|
| Google Fit | ✅ | 6 functions |
| Mealie | ✅ | 2 functions |
| Stripe | ✅ | 3 functions |
| Resend | ✅ | 1 function |
| n8n | ✅ | 2 functions |

Ver detalhes em: [INTEGRATIONS.md](./INTEGRATIONS.md)

---

## 📊 Categorias do Banco de Dados

| Categoria | Tabelas |
|-----------|---------|
| Usuários e Perfis | 5 |
| Saúde e Medições | 7 |
| Nutrição | 8 |
| Exercícios | 4 |
| Metas e Gamificação | 8 |
| Cursos | 5 |
| Comunidade | 4 |
| IAs e Configurações | 8 |
| Integrações | 3 |
| Sistema | 3+ |

Ver detalhes em: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

*Mantido por: Equipe Dr. Vita*  
*Versão: 2.0.0*  
*Última atualização: 05/01/2026*
