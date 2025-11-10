# 🔍 DIAGNÓSTICO: Por que não estava lendo a imagem?

## ❌ **PROBLEMAS IDENTIFICADOS:**

### 1. **Bucket de Imagens Não Configurado** 🪣
**Problema:** O bucket `chat-images` precisa existir no Supabase Storage

**Local do erro:**
```typescript
// src/components/sofia/SofiaChat.tsx:204
const { data: { publicUrl } } = supabase.storage
  .from('chat-images')  // ❌ Este bucket pode não existir
  .getPublicUrl(fileName);
```

### 2. **Google AI API Key Não Configurada** 🔑
**Problema:** A chave `GOOGLE_AI_API_KEY` não está nas variáveis de ambiente

**Local do erro:**
```typescript
// supabase/functions/sofia-image-analysis/index.ts:19
const googleAIApiKey = Deno.env.get('GOOGLE_AI_API_KEY');
// ❌ Se não configurada, análise de imagem falha
```

### 3. **Edge Function Não Deployada** 🚀
**Problema:** A função `sofia-image-analysis` pode não estar deployada no Supabase

**Como verificar:**
- Dashboard Supabase → Edge Functions
- Deve existir: `sofia-image-analysis`

---

## ✅ **SOLUÇÕES:**

### **Solução 1: Criar Bucket de Imagens**

```sql
-- Criar bucket chat-images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas de acesso
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'chat-images' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'chat-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### **Solução 2: Configurar Google AI API Key**

#### **Passo 1: Obter a chave**
1. Acesse: https://makersuite.google.com/app/apikey
2. Crie um novo projeto ou use existente
3. Clique em "Get API Key"
4. Copie a chave (formato: `AIzaSy...`)

#### **Passo 2: Adicionar no Supabase**
```bash
# Via Dashboard Supabase:
# 1. Settings → Edge Functions
# 2. Secrets
# 3. Adicionar:
#    Nome: GOOGLE_AI_API_KEY
#    Valor: sua-chave-aqui

# Ou via CLI:
npx supabase secrets set GOOGLE_AI_API_KEY=sua-chave-aqui
```

### **Solução 3: Deploy da Edge Function**

```bash
# Deploy da função de análise de imagem
npx supabase functions deploy sofia-image-analysis
```

---

## 🔧 **SCRIPT DE CORREÇÃO AUTOMÁTICA**

Vou criar um script que faz tudo automaticamente:



