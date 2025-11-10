# 🔑 Configurar Novas Credenciais Google

## ✅ **Credenciais Antigas Removidas**

Todas as credenciais antigas do Google foram removidas do sistema.

---

## 🚀 **Configurar Novas Credenciais**

### **1. Google Cloud Console**
🔗 [https://console.cloud.google.com/](https://console.cloud.google.com/)

#### **APIs para Ativar:**
- Cloud Text-to-Speech API
- Google Fit API
- Google+ API (para OAuth)

#### **Criar OAuth 2.0 Client ID:**
1. Menu → APIs e serviços → Credenciais
2. Criar credenciais → OAuth Client ID
3. Tipo: Aplicação Web
4. Origens JavaScript autorizadas:
   - `http://localhost:8081`
   - `https://seu-dominio.com`
5. URIs de redirecionamento:
   - `http://localhost:8081/auth`
   - `http://localhost:8081/google-fit-callback`
   - `https://seu-dominio.com/auth`
   - `https://seu-dominio.com/google-fit-callback`

#### **Criar API Key:**
1. Menu → APIs e serviços → Credenciais
2. Criar credenciais → Chave de API
3. Copiar a chave gerada

---

## 🔧 **Configurar no Supabase**

### **Edge Functions - Secrets:**
```bash
# Google Fit
npx supabase secrets set GOOGLE_FIT_CLIENT_ID="novo_client_id"
npx supabase secrets set GOOGLE_FIT_CLIENT_SECRET="novo_client_secret"

# Google AI
npx supabase secrets set GOOGLE_AI_API_KEY="nova_api_key"
```

### **Frontend - Variáveis de Ambiente:**
Crie/edite `.env`:

```env
# Google Text-to-Speech
VITE_GOOGLE_TTS_API_KEY=sua_nova_api_key

# Supabase (manter existentes)
VITE_SUPABASE_URL=https://hlrkoyywjpckdotimtik.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📋 **Checklist de Configuração**

- [ ] Ativar APIs no Google Cloud Console
- [ ] Criar OAuth 2.0 Client ID
- [ ] Criar API Key para TTS
- [ ] Configurar secrets no Supabase
- [ ] Atualizar .env com nova API key
- [ ] Testar OAuth login
- [ ] Testar Google Fit sync
- [ ] Testar TTS Sofia

---

## 🧪 **Testar Configuração**

### **1. Testar Google OAuth:**
```bash
# Acessar
http://localhost:8081/auth

# Clicar em "Login com Google"
```

### **2. Testar Google Fit:**
```bash
# Acessar página de pesagem
# Clicar em "Conectar Google Fit"
```

### **3. Testar Google TTS:**
```bash
# Acessar chat Sofia
# Enviar mensagem e ouvir resposta
```

---

## ⚠️ **IMPORTANTE**

1. **Nunca** commitar credenciais no código
2. Usar apenas via **Supabase Secrets** (backend)
3. Usar apenas via **.env** (frontend)
4. Adicionar `.env` no `.gitignore`

---

**🎯 Configure as novas credenciais seguindo este guia!**
