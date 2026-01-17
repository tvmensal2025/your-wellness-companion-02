# 🗄️ Arquitetura de Storage - MaxNutrition

> Documentação completa sobre onde e como as imagens são armazenadas no sistema

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura Híbrida](#arquitetura-híbrida)
3. [Buckets e Pastas](#buckets-e-pastas)
4. [Fluxo de Upload](#fluxo-de-upload)
5. [Onde Cada Tipo de Imagem é Salvo](#onde-cada-tipo-de-imagem-é-salvo)
6. [Como Usar](#como-usar)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O sistema utiliza uma **arquitetura híbrida** de storage:

- **MinIO (VPS)** - Storage principal (gratuito, ilimitado)
- **Supabase Storage** - Fallback automático (limitado)

### Vantagens da Arquitetura

| Aspecto | MinIO (VPS) | Supabase Storage |
|---------|-------------|------------------|
| **Custo** | Gratuito | Limitado (1GB free) |
| **Velocidade** | Rápido | Rápido |
| **Disponibilidade** | 99%+ | 99.9%+ |
| **Uso** | Primário | Fallback |

---

## 🏗️ Arquitetura Híbrida

### Fluxo de Upload

```
Frontend (React)
    ↓
useMediaUpload Hook
    ↓
Edge Function: media-upload
    ↓
    ├─→ MinIO (VPS) ✅ [PRIMÁRIO]
    │   └─→ Sucesso → Retorna URL pública
    │
    └─→ Supabase Storage ⚠️ [FALLBACK]
        └─→ Usado apenas se MinIO falhar
```

### Componentes Principais

1. **Hook: `useMediaUpload`** (`src/hooks/useMediaUpload.ts`)
   - Interface unificada para upload
   - Helpers específicos por tipo de mídia

2. **API Client: `vpsApi`** (`src/lib/vpsApi.ts`)
   - Comunicação com Edge Function
   - Conversão de File para base64

3. **Edge Function: `media-upload`** (`supabase/functions/media-upload/index.ts`)
   - Proxy para MinIO
   - Fallback automático para Supabase
   - Modo: **100% MinIO** (sem fallback por padrão)

---

## 📁 Buckets e Pastas

### MinIO (VPS) - Pastas Disponíveis

```typescript
type MinIOFolder = 
  | 'avatars'              // Fotos de perfil
  | 'banners'              // Banners do app
  | 'chat-images'          // Imagens do chat (Sofia/Dr. Vital)
  | 'exercise-videos'      // Vídeos de exercícios
  | 'feed'                 // Posts da comunidade
  | 'food-analysis'        // Análise de alimentos (Sofia)
  | 'lesson-videos'        // Vídeos de aulas
  | 'medical-exams'        // Exames médicos (Dr. Vital)
  | 'medical-reports'      // Relatórios médicos (HTML/PDF)
  | 'profiles'             // Dados de perfil
  | 'stories'              // Stories da comunidade
  | 'weight-photos'        // Fotos de pesagem
  | 'whatsapp'             // Imagens do WhatsApp
  | 'course-thumbnails'    // Thumbnails de cursos
  | 'product-images'       // Imagens de produtos
  | 'exercise-media';      // Mídia de exercícios
```

### Supabase Storage - Buckets

```sql
-- Buckets criados nas migrations
- avatars                 (público)
- course-thumbnails       (público, admin only)
- community-media         (público, auth required)
- medical-documents       (privado)
- medical-documents-reports (privado)
```

---

## 🖼️ Onde Cada Tipo de Imagem é Salvo

### 1. **Fotos de Perfil (Avatar)**

**Pasta MinIO:** `avatars/`

**Estrutura:**
```
avatars/
  └── {user_id}/
      └── avatar_{timestamp}.{ext}
```

**Tabela:** `profiles.avatar_url`

**Como usar:**
```typescript
import { useMediaUpload } from '@/hooks/useMediaUpload';

const { uploadAvatar, isUploading } = useMediaUpload();

const handleAvatarUpload = async (file: File) => {
  const result = await uploadAvatar(file);
  if (result) {
    // Atualizar profiles.avatar_url com result.url
    await supabase
      .from('profiles')
      .update({ avatar_url: result.url })
      .eq('id', userId);
  }
};
```

---

### 2. **Stories da Comunidade**

**Pasta MinIO:** `stories/`

**Estrutura:**
```
stories/
  └── {user_id}/
      └── story_{timestamp}.{ext}
```

**Tabela:** `health_feed_stories.media_url`

**Como usar:**
```typescript
const { uploadStoryImage } = useMediaUpload();

const handleStoryUpload = async (file: File) => {
  const result = await uploadStoryImage(file);
  if (result) {
    // Criar story
    await supabase
      .from('health_feed_stories')
      .insert({
        user_id: userId,
        media_url: result.url,
        media_type: 'image',
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
      });
  }
};
```

**Expiração:** Stories expiram após 24 horas (soft delete)

---

### 3. **Análise de Alimentos (Sofia)**

**Pasta MinIO:** `food-analysis/`

**Estrutura:**
```
food-analysis/
  └── {user_id}/
      └── food_{timestamp}.{ext}
```

**Tabela:** `food_analysis.image_url`

**Como usar:**
```typescript
const { uploadFoodImage } = useMediaUpload();

const handleFoodAnalysis = async (file: File) => {
  const result = await uploadFoodImage(file);
  if (result) {
    // Enviar para análise
    const { data } = await supabase.functions.invoke('sofia-image-analysis', {
      body: {
        imageUrl: result.url,
        userId,
        mealType: 'lunch'
      }
    });
  }
};
```

**Fluxo completo:**
```
1. Upload → MinIO (food-analysis/)
2. URL → Edge Function (sofia-image-analysis)
3. YOLO detecta objetos
4. Gemini refina análise
5. Salva em food_analysis table
```

---

### 4. **Exames Médicos (Dr. Vital)**

**Pasta MinIO:** `medical-exams/`

**Estrutura:**
```
medical-exams/
  └── {user_id}/
      └── exam_{timestamp}.{ext}
```

**Tabela:** `medical_documents.file_path`

**Como usar:**
```typescript
const { uploadMedicalExam } = useMediaUpload();

const handleExamUpload = async (file: File) => {
  const result = await uploadMedicalExam(file);
  if (result) {
    // Criar documento médico
    const { data: doc } = await supabase
      .from('medical_documents')
      .insert({
        user_id: userId,
        file_path: result.path,
        file_url: result.url,
        document_type: 'exam',
        status: 'pending'
      })
      .select()
      .single();
    
    // Enviar para análise
    await supabase.functions.invoke('analyze-medical-exam', {
      body: {
        documentId: doc.id,
        userId
      }
    });
  }
};
```

**Relatórios gerados:**
```
medical-reports/
  └── {user_id}/
      └── report_{document_id}.html
```

---

### 5. **Posts da Comunidade (Feed)**

**Pasta MinIO:** `feed/`

**Estrutura:**
```
feed/
  └── {user_id}/
      └── post_{timestamp}.{ext}
```

**Tabela:** `health_feed_posts.media_url`

**Como usar:**
```typescript
const { uploadFeedImage } = useMediaUpload();

const handlePostUpload = async (file: File) => {
  const result = await uploadFeedImage(file);
  if (result) {
    await supabase
      .from('health_feed_posts')
      .insert({
        user_id: userId,
        content: 'Meu progresso!',
        media_url: result.url,
        media_type: 'image'
      });
  }
};
```

---

### 6. **Fotos de Pesagem**

**Pasta MinIO:** `weight-photos/`

**Estrutura:**
```
weight-photos/
  └── {user_id}/
      └── weight_{timestamp}.{ext}
```

**Tabela:** `weight_measurements.photo_url`

**Como usar:**
```typescript
const { uploadWeightPhoto } = useMediaUpload();

const handleWeightPhoto = async (file: File, weightKg: number) => {
  const result = await uploadWeightPhoto(file);
  if (result) {
    await supabase
      .from('weight_measurements')
      .insert({
        user_id: userId,
        weight_kg: weightKg,
        photo_url: result.url,
        measurement_date: new Date().toISOString()
      });
  }
};
```

---

### 7. **Imagens do Chat (Sofia/Dr. Vital)**

**Pasta MinIO:** `chat-images/`

**Estrutura:**
```
chat-images/
  └── {user_id}/
      └── chat_{timestamp}.{ext}
```

**Tabela:** `chat_messages.image_url` (se existir)

**Como usar:**
```typescript
const { uploadChatImage } = useMediaUpload();

const handleChatImage = async (file: File) => {
  const result = await uploadChatImage(file);
  // Usar result.url na mensagem
};
```

---

### 8. **WhatsApp (Imagens Recebidas)**

**Pasta MinIO:** `whatsapp/`

**Estrutura:**
```
whatsapp/
  └── {phone_number}/
      └── {timestamp}_{media_id}.{ext}
```

**Fluxo:**
```
1. WhatsApp envia webhook
2. Edge Function baixa mídia
3. Upload para MinIO (whatsapp/)
4. Processa (food ou medical)
5. Move para pasta específica (opcional)
```

---

## 🚀 Como Usar

### Opção 1: Hook Unificado (Recomendado)

```typescript
import { useMediaUpload } from '@/hooks/useMediaUpload';

function MyComponent() {
  const { 
    uploadAvatar,
    uploadFoodImage,
    uploadMedicalExam,
    isUploading,
    progress,
    error
  } = useMediaUpload();

  const handleUpload = async (file: File) => {
    const result = await uploadFoodImage(file);
    if (result) {
      console.log('URL:', result.url);
      console.log('Path:', result.path);
      console.log('Source:', result.source); // 'minio' ou 'supabase'
    }
  };

  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {isUploading && <p>Uploading... {progress}%</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Opção 2: API Direta

```typescript
import { uploadToVPS } from '@/lib/vpsApi';

const result = await uploadToVPS(file, 'food-analysis');
console.log(result.url); // URL pública
```

### Opção 3: Base64 Upload

```typescript
const { uploadBase64 } = useMediaUpload();

const result = await uploadBase64(
  base64Data,
  'avatars',
  'image/jpeg',
  'avatar.jpg'
);
```

---

## 🔧 Configuração

### Variáveis de Ambiente (Edge Function)

```bash
# supabase/.env
VPS_API_URL=https://your-vps.com/api
VPS_API_KEY=your-secret-key
```

### Modo de Operação

**Atual:** 100% MinIO (sem fallback)

```typescript
// supabase/functions/media-upload/index.ts
// Se MinIO falhar, retorna erro (NÃO usa Supabase Storage)
```

**Para habilitar fallback:**
```typescript
// Descomentar código de fallback na edge function
```

---

## 🐛 Troubleshooting

### Problema: Upload falha com "MinIO error"

**Causa:** VPS offline ou não configurada

**Solução:**
1. Verificar `VPS_API_URL` e `VPS_API_KEY`
2. Testar endpoint: `curl https://your-vps.com/api/health`
3. Habilitar fallback para Supabase Storage

### Problema: Imagem não aparece

**Causa:** URL incorreta ou CORS

**Solução:**
1. Verificar se URL é pública
2. Testar URL no navegador
3. Verificar CORS no MinIO

### Problema: "Bucket não existe"

**Causa:** Bucket não criado no Supabase

**Solução:**
```sql
-- Criar bucket manualmente
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);
```

---

## 📊 Estatísticas de Uso

### Tamanhos Médios

| Tipo | Tamanho Médio | Limite |
|------|---------------|--------|
| Avatar | 200 KB | 5 MB |
| Story | 500 KB | 10 MB |
| Food | 800 KB | 10 MB |
| Exam | 1.5 MB | 20 MB |
| Post | 600 KB | 10 MB |

### Formatos Suportados

- **Imagens:** JPEG, PNG, WebP, GIF
- **Vídeos:** MP4, WebM (exercise-videos)
- **Documentos:** PDF (medical-reports)

---

## 🔐 Segurança

### Políticas RLS (Supabase Storage)

```sql
-- Exemplo: avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### MinIO (VPS)

- Buckets públicos (read-only)
- Upload via API autenticada
- URLs públicas sem expiração

---

## 📚 Referências

- **Hook:** `src/hooks/useMediaUpload.ts`
- **API:** `src/lib/vpsApi.ts`
- **Edge Function:** `supabase/functions/media-upload/index.ts`
- **Migrations:** `supabase/migrations/*_storage_*.sql`

---

## 🎯 Resumo Rápido

| Tipo de Imagem | Pasta MinIO | Tabela | Hook |
|----------------|-------------|--------|------|
| **Avatar** | `avatars/` | `profiles.avatar_url` | `uploadAvatar()` |
| **Story** | `stories/` | `health_feed_stories.media_url` | `uploadStoryImage()` |
| **Alimento** | `food-analysis/` | `food_analysis.image_url` | `uploadFoodImage()` |
| **Exame** | `medical-exams/` | `medical_documents.file_url` | `uploadMedicalExam()` |
| **Post** | `feed/` | `health_feed_posts.media_url` | `uploadFeedImage()` |
| **Peso** | `weight-photos/` | `weight_measurements.photo_url` | `uploadWeightPhoto()` |
| **Chat** | `chat-images/` | - | `uploadChatImage()` |
| **WhatsApp** | `whatsapp/` | - | (automático) |

---

*Última atualização: Janeiro 2026*
