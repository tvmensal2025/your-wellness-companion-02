# 🚀 Guia de Deploy

> Documentação gerada em: 2026-01-16
> Plataforma: MaxNutrition Cloud

---

## 📊 Visão Geral

| Ambiente | URL | Branch |
|----------|-----|--------|
| Preview | `https://id-preview--*.lovable.app` | feature/* |
| Production | `https://your-wellness-companion-02.lovable.app` | main |

---

## 🛠️ Requisitos

### Sistema

| Requisito | Versão |
|-----------|--------|
| Node.js | 18.x ou superior |
| npm | 9.x ou superior |
| Git | 2.x ou superior |

### Contas/Acessos

- [x] Conta Lovable (já configurada)
- [x] MaxNutrition Cloud habilitado
- [ ] Google Cloud Console (para Google Fit)
- [ ] Evolution API (para WhatsApp)
- [ ] Resend (para emails)

---

## 💻 Desenvolvimento Local

### 1. Clonar Repositório

```bash
# Via Lovable (recomendado)
# Clique em "Edit in VS Code" ou "Edit in Cursor"

# Ou via Git
git clone https://github.com/your-repo/maxnutrition.git
cd maxnutrition
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.example .env

# Editar .env com seus valores
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

### 4. Iniciar Servidor de Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

### 5. Build de Produção (Local)

```bash
# Build
npm run build

# Preview do build
npm run preview
```

---

## ☁️ Deploy via Lovable

### Deploy Automático

Cada push no repositório dispara deploy automático:

1. **Preview**: Branches `feature/*` geram preview
2. **Production**: Branch `main` faz deploy em produção

### Deploy Manual

1. Abra o projeto no Lovable
2. Faça suas alterações
3. Clique em "Deploy" ou aguarde auto-deploy
4. Verifique logs de build

### Verificar Status

```
┌─────────────────────────────────────────────────────────────────┐
│                     LOVABLE DASHBOARD                           │
│                                                                 │
│  Status: ✅ Deployed                                            │
│  Last Deploy: 2026-01-16 15:30:00                              │
│  Build Time: 45s                                                │
│                                                                 │
│  URLs:                                                          │
│  - Preview: https://id-preview--f520bb44-...lovable.app        │
│  - Production: https://your-wellness-companion-02.lovable.app  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Backend (MaxNutrition Cloud)

### Edge Functions

Edge Functions são deployadas automaticamente ao salvar.

```bash
# Estrutura
supabase/functions/
├── my-function/
│   └── index.ts
└── another-function/
    └── index.ts
```

### Verificar Deploy de Function

```bash
# Via Lovable
# 1. Salve a Edge Function
# 2. Aguarde "Function deployed" no log
# 3. Teste via:
curl https://ciszqtlaacrhfwsqnvjr.supabase.co/functions/v1/my-function
```

### Logs de Edge Functions

```bash
# No Lovable, use a ferramenta:
# supabase--edge-function-logs

# Ou via Dashboard
# Settings > Backend > Logs
```

---

## 🗃️ Database Migrations

### Criar Migration

```sql
-- Via Lovable:
-- Use a ferramenta supabase--migration

-- Exemplo:
CREATE TABLE my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- Criar policy
CREATE POLICY "Users can view own data"
  ON my_table FOR SELECT
  USING (auth.uid() = user_id);
```

### Aplicar Migration

1. Crie a migration via `supabase--migration`
2. Revise o SQL gerado
3. Confirme a aplicação
4. Verifique no banco

---

## 🔐 Configuração de Secrets

### Via MaxNutrition Cloud UI

1. Acesse Settings do projeto
2. Vá em "Backend Settings"
3. Clique em "Secrets"
4. Adicione/edite secrets

### Secrets Necessários

| Secret | Obrigatório | Onde Obter |
|--------|-------------|------------|
| `GOOGLE_AI_API_KEY` | Sim (IA) | [Google AI Studio](https://makersuite.google.com/) |
| `YOLO_SERVICE_URL` | Sim (detecção) | Seu EasyPanel |
| `N8N_WHATSAPP_WEBHOOK` | Para WhatsApp | Seu N8N |
| `GOOGLE_CLIENT_ID` | Para Google Fit | [Google Console](https://console.cloud.google.com/) |
| `GOOGLE_CLIENT_SECRET` | Para Google Fit | Google Console |
| `RESEND_API_KEY` | Para emails | [Resend](https://resend.com/) |

---

## 📱 Build Mobile (Capacitor)

### Configuração

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.maxnutrition.app',
  appName: 'MaxNutrition',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

### Build Android

```bash
# Build web
npm run build

# Sincronizar com Android
npx cap sync android

# Abrir no Android Studio
npx cap open android

# Build APK/AAB via Android Studio
```

### Build iOS

```bash
# Build web
npm run build

# Sincronizar com iOS
npx cap sync ios

# Abrir no Xcode
npx cap open ios

# Build via Xcode
```

---

## 🔄 CI/CD Pipeline

### Fluxo Automático

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Commit    │ ──► │   Build     │ ──► │   Deploy    │
│   Push      │     │   (Vite)    │     │   (Lovable) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  TypeCheck  │
                    │   Lint      │
                    │   Tests     │
                    └─────────────┘
```

### Checks Automáticos

- [x] TypeScript compilation
- [x] ESLint validation
- [x] Build success
- [x] Edge Functions deploy

---

## 📊 Monitoramento

### Sentry (Erros)

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

### Logs do Backend

```sql
-- Verificar logs de IA
SELECT 
  created_at,
  provider,
  functionality,
  success,
  response_time_ms,
  error_message
FROM ai_usage_logs
WHERE created_at > now() - interval '1 hour'
ORDER BY created_at DESC
LIMIT 50;
```

### Métricas de Uso

```sql
-- Usuários ativos
SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as active_users
FROM user_activity_logs
WHERE created_at > now() - interval '7 days'
GROUP BY DATE(created_at)
ORDER BY date;
```

---

## 🔧 Troubleshooting

### Build Falha

```bash
# Erro: TypeScript errors
# Solução: Verificar erros de tipo
npm run typecheck

# Erro: Missing dependencies
# Solução: Reinstalar
rm -rf node_modules
npm install

# Erro: Out of memory
# Solução: Aumentar memória
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### Edge Function Falha

```bash
# Verificar logs
# Use supabase--edge-function-logs no Lovable

# Erros comuns:
# 1. Secret não configurado → Adicionar secret
# 2. Timeout → Otimizar função
# 3. CORS → Verificar headers
```

### Database Migration Falha

```sql
-- Verificar erro
-- Use supabase--analytics-query para ver logs

-- Rollback manual (se necessário)
-- Criar nova migration que reverte mudanças
```

---

## 📋 Checklist de Deploy

### Pré-Deploy

- [ ] Todos os testes passando
- [ ] Sem erros de TypeScript
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets do backend configurados
- [ ] Migrations aplicadas
- [ ] Edge Functions testadas

### Pós-Deploy

- [ ] Verificar URL de produção
- [ ] Testar fluxos críticos:
  - [ ] Login/Logout
  - [ ] Análise de alimentos (Sofia)
  - [ ] Registro de refeição
  - [ ] Google Fit sync
- [ ] Verificar logs de erro
- [ ] Monitorar métricas

---

## 🌐 Domínio Personalizado

### Configurar Domínio

1. Acesse Settings > Domain no Lovable
2. Adicione seu domínio personalizado
3. Configure DNS conforme instruções
4. Aguarde propagação (até 24h)

### DNS Records

```
Tipo    Nome    Valor
A       @       [IP fornecido pelo Lovable]
CNAME   www     [CNAME fornecido pelo Lovable]
```

---

## 📝 Próximos Passos

- Consulte `09_ENVIRONMENT_VARS.md` para configuração de secrets
- Consulte `05_EDGE_FUNCTIONS.md` para detalhes do backend
- Consulte `01_ESTRUTURA_PROJETO.md` para visão geral

---

## 📞 Suporte

- **Documentação MaxNutrition**: https://docs.lovable.dev
- **Supabase Docs**: https://supabase.com/docs
- **Comunidade**: https://discord.gg/lovable
