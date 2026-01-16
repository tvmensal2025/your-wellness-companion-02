# 🔐 Variáveis de Ambiente

> Documentação gerada em: 2026-01-16
> IMPORTANTE: Nunca commitar valores reais de secrets!

---

## 📊 Visão Geral

| Categoria | Quantidade | Prefixo |
|-----------|------------|---------|
| Frontend (Vite) | 8 | `VITE_` |
| Edge Functions | 15+ | Nenhum |
| Integrações | 5 | Variado |

---

## 🖥️ Frontend (Vite)

Variáveis acessíveis no código frontend via `import.meta.env`.

| Variável | Tipo | Obrigatória | Descrição |
|----------|------|-------------|-----------|
| `VITE_SUPABASE_URL` | URL | ✅ Sim | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | JWT | ✅ Sim | Chave pública anon |
| `VITE_SUPABASE_PROJECT_ID` | String | ✅ Sim | ID do projeto |
| `VITE_APP_NAME` | String | ❌ Não | Nome do aplicativo |
| `VITE_APP_URL` | URL | ❌ Não | URL do app em produção |
| `VITE_DEBUG_MODE` | Boolean | ❌ Não | Ativar modo debug |
| `VITE_ENABLE_ANALYTICS` | Boolean | ❌ Não | Ativar analytics |
| `VITE_SENTRY_DSN` | URL | ❌ Não | DSN do Sentry |

### Exemplo .env

```bash
# .env (Frontend - NÃO commitar valores reais!)

# Supabase (Obrigatórias)
VITE_SUPABASE_URL=https://ciszqtlaacrhfwsqnvjr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=ciszqtlaacrhfwsqnvjr

# Aplicação (Opcionais)
VITE_APP_NAME=MaxNutrition
VITE_APP_URL=https://your-wellness-companion-02.lovable.app
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

### Uso no Código

```typescript
// Acessando variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificação de debug
if (import.meta.env.VITE_DEBUG_MODE === 'true') {
  console.log('Debug mode ativo');
}

// Tipagem (vite-env.d.ts)
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SUPABASE_PROJECT_ID: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_DEBUG_MODE?: string;
  readonly VITE_ENABLE_ANALYTICS?: string;
  readonly VITE_SENTRY_DSN?: string;
}
```

---

## ⚡ Edge Functions (Backend)

Variáveis configuradas no Supabase para Edge Functions.

### Supabase Core

| Variável | Tipo | Obrigatória | Descrição |
|----------|------|-------------|-----------|
| `SUPABASE_URL` | URL | ✅ Sim | URL do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | JWT | ✅ Sim | Chave service role |
| `SUPABASE_ANON_KEY` | JWT | ✅ Sim | Chave anon |

### IA e Análise

| Variável | Functions | Obrigatória | Descrição |
|----------|-----------|-------------|-----------|
| `GOOGLE_AI_API_KEY` | sofia-*, dr-vital-* | ✅ Para IA | Chave Gemini API |
| `OPENAI_API_KEY` | enhanced-gpt-chat | ❌ Opcional | Chave OpenAI |
| `YOLO_SERVICE_URL` | sofia-image-analysis | ✅ Para YOLO | URL do serviço YOLO |

### WhatsApp/Comunicação

| Variável | Functions | Obrigatória | Descrição |
|----------|-----------|-------------|-----------|
| `N8N_WHATSAPP_WEBHOOK` | whatsapp-* | ✅ Para WhatsApp | Webhook do N8N |
| `EVOLUTION_API_URL` | whatsapp-* | ❌ Opcional | URL Evolution API |
| `EVOLUTION_API_KEY` | whatsapp-* | ❌ Opcional | Chave Evolution |
| `RESEND_API_KEY` | send-email | ❌ Opcional | Chave Resend (email) |

### Google Fit

| Variável | Functions | Obrigatória | Descrição |
|----------|-----------|-------------|-----------|
| `GOOGLE_CLIENT_ID` | google-fit-* | ✅ Para Fit | Client ID OAuth |
| `GOOGLE_CLIENT_SECRET` | google-fit-* | ✅ Para Fit | Client Secret |
| `GOOGLE_REDIRECT_URI` | google-fit-callback | ✅ Para Fit | URI de callback |

### Storage (MinIO)

| Variável | Functions | Obrigatória | Descrição |
|----------|-----------|-------------|-----------|
| `MINIO_ENDPOINT` | media-upload | ❌ Opcional | Endpoint MinIO |
| `MINIO_ACCESS_KEY` | media-upload | ❌ Opcional | Access key |
| `MINIO_SECRET_KEY` | media-upload | ❌ Opcional | Secret key |
| `MINIO_BUCKET_NAME` | media-upload | ❌ Opcional | Nome do bucket |

---

## 🔧 Configuração de Secrets

### Via Lovable Cloud

1. Acesse Configurações do Projeto
2. Vá em "Backend Settings" > "Secrets"
3. Adicione cada variável necessária

### Variáveis Já Configuradas (Auto)

```
SUPABASE_URL              ✅ Automático
SUPABASE_ANON_KEY         ✅ Automático  
SUPABASE_SERVICE_ROLE_KEY ✅ Automático
```

### Variáveis a Configurar Manualmente

```
GOOGLE_AI_API_KEY         ⚠️ Necessário para IA
YOLO_SERVICE_URL          ⚠️ Necessário para detecção
N8N_WHATSAPP_WEBHOOK      ⚠️ Necessário para WhatsApp
GOOGLE_CLIENT_ID          ⚠️ Necessário para Google Fit
GOOGLE_CLIENT_SECRET      ⚠️ Necessário para Google Fit
RESEND_API_KEY            ❓ Opcional para emails
```

---

## 📁 Estrutura de Arquivos

```
/
├── .env                    # ❌ NÃO COMMITAR (git ignored)
├── .env.example            # ✅ Template sem valores reais
├── .env.local              # ❌ NÃO COMMITAR (development)
└── docs/
    └── ENVIRONMENT.md      # Esta documentação
```

### .env.example

```bash
# ============================================
# MAXNUTRITION - VARIÁVEIS DE AMBIENTE
# ============================================
# Copie este arquivo para .env e preencha os valores

# ------------------------------------------
# SUPABASE (Obrigatórias)
# ------------------------------------------
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_PROJECT_ID=your-project-id

# ------------------------------------------
# APLICAÇÃO (Opcionais)
# ------------------------------------------
VITE_APP_NAME=MaxNutrition
VITE_APP_URL=https://your-app-url.com
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=false

# ------------------------------------------
# MONITORAMENTO (Opcionais)
# ------------------------------------------
VITE_SENTRY_DSN=https://your-sentry-dsn

# ============================================
# EDGE FUNCTIONS
# ============================================
# Configurar diretamente no Supabase Dashboard
# ou via Lovable Cloud Settings

# GOOGLE_AI_API_KEY=your-gemini-key
# YOLO_SERVICE_URL=https://your-yolo-service.com
# N8N_WHATSAPP_WEBHOOK=https://your-n8n-webhook
# RESEND_API_KEY=your-resend-key
```

---

## 🔒 Boas Práticas de Segurança

### ✅ FAZER

1. **Usar .env.example** para documentar variáveis
2. **Rotacionar secrets** periodicamente
3. **Usar chaves diferentes** para dev/staging/prod
4. **Limitar escopo** de API keys quando possível
5. **Monitorar uso** de API keys

### ❌ NÃO FAZER

1. **Nunca commitar** valores reais de secrets
2. **Nunca logar** secrets no console
3. **Nunca expor** SERVICE_ROLE_KEY no frontend
4. **Nunca hardcodar** secrets no código
5. **Nunca compartilhar** secrets via chat/email

---

## 🔍 Diagnóstico de Problemas

### Variável não encontrada

```typescript
// Erro: "import.meta.env.VITE_SUPABASE_URL is undefined"

// Verificar:
// 1. Arquivo .env existe na raiz
// 2. Prefixo VITE_ para variáveis do frontend
// 3. Reiniciar servidor de desenvolvimento
// 4. Variável está no .env correto
```

### Edge Function sem acesso

```typescript
// Erro: "Deno.env.get('GOOGLE_AI_API_KEY') is undefined"

// Verificar:
// 1. Secret configurado no Lovable Cloud
// 2. Nome exato da variável (case-sensitive)
// 3. Redeploy da Edge Function após adicionar secret
```

### Google Fit OAuth falha

```
// Erro: "redirect_uri_mismatch"

// Verificar:
// 1. GOOGLE_REDIRECT_URI corresponde ao configurado no Google Console
// 2. URIs autorizados incluem o domínio correto
// 3. Protocolo correto (https:// em produção)
```

---

## 📋 Checklist de Deploy

Antes de fazer deploy em produção:

- [ ] Todas variáveis obrigatórias configuradas
- [ ] Chaves de produção (não desenvolvimento)
- [ ] URLs corretas para ambiente de produção
- [ ] Google Fit OAuth URIs atualizados
- [ ] YOLO Service URL de produção
- [ ] Secrets do WhatsApp configurados
- [ ] Monitoramento (Sentry) configurado
- [ ] Backup das configurações

---

## 📝 Próximos Passos

- Consulte `10_DEPLOY_GUIDE.md` para processo de deploy
- Consulte `05_EDGE_FUNCTIONS.md` para uso das variáveis
