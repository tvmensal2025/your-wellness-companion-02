# 📸 CATÁLOGO COMPLETO DE MÍDIAS - MaxNutrition

> Lista COMPLETA de todos os tipos de mídia, origem, destino e processamento

---

## 📋 ÍNDICE RÁPIDO

| # | Tipo de Mídia | Origem | Destino | Tabela |
|---|---------------|--------|---------|--------|
| 1 | Avatar/Foto de Perfil | App/WhatsApp | `avatars/` | `profiles.avatar_url` |
| 2 | Foto de Alimentos | App/WhatsApp | `food-analysis/` | `food_analysis.image_url` |
| 3 | Exame Médico (Imagem) | App/WhatsApp | `medical-exams/` | `medical_documents.file_url` |
| 4 | Relatório Médico (HTML) | Gerado (IA) | `medical-reports/` | `medical_documents.report_path` |
| 5 | Relatório Médico (PDF) | Gerado (IA) | `medical-reports/` | `medical_documents.pdf_path` |
| 6 | Story (24h) | App | `stories/` | `health_feed_stories.media_url` |
| 7 | Post da Comunidade | App | `feed/` | `health_feed_posts.media_url` |
| 8 | Foto de Pesagem | App | `weight-photos/` | `weight_measurements.photo_url` |
| 9 | Chat Sofia/Dr. Vital | App | `chat-images/` | - |
| 10 | WhatsApp (Recebido) | WhatsApp | `whatsapp/` | - |
| 11 | Vídeo de Exercício | Admin | `exercise-videos/` | `exercises.video_url` |
| 12 | Mídia de Exercício | Admin | `exercise-media/` | `exercises.media_url` |
| 13 | Thumbnail de Curso | Admin | `course-thumbnails/` | `courses.thumbnail_url` |
| 14 | Vídeo de Aula | Admin | `lesson-videos/` | `lessons.video_url` |
| 15 | Documento de Aula (PDF) | Admin | `lesson-videos/` | `lessons.document_url` |
| 16 | Imagem de Produto | Admin | `product-images/` | `products.image_url` |
| 17 | Banner da Plataforma | Admin | `banners/` | `platform_settings.banner_url` |
| 18 | Foto de Meta/Progresso | App | `feed/` | `user_goals.progress_photos` |

---

## 🔍 DETALHAMENTO COMPLETO

### 1️⃣ AVATAR / FOTO DE PERFIL

**Origem:**
- App (upload manual)
- WhatsApp (primeira interação)
- Google OAuth (importado)

**Fluxo:**
```
Usuário → useMediaUpload.uploadAvatar() → MinIO (avatars/) → profiles.avatar_url
```

**Pasta MinIO:** `avatars/{user_id}/avatar_{timestamp}.{ext}`

**Tabela:** `profiles`
```sql
avatar_url TEXT
```

**Processamento:**
- Redimensionamento: 400x400px
- Formato: JPEG/PNG/WebP
- Limite: 5 MB

**Componentes:**
- `src/components/UserProfile.tsx`
- `src/components/profile/ProfileHeader.tsx`

**Hook:** `uploadAvatar(file)`

---

### 2️⃣ FOTO DE ALIMENTOS (SOFIA)

**Origem:**
- App (câmera ou galeria)
- WhatsApp (envio de foto)

**Fluxo:**
```
Foto → MinIO (food-analysis/) → YOLO (detecção) → Gemini (análise) → food_analysis
```

**Pasta MinIO:** `food-analysis/{user_id}/food_{timestamp}.{ext}`

**Tabela:** `food_analysis`
```sql
image_url TEXT
meal_type TEXT (breakfast, lunch, dinner, snack)
analysis_text TEXT
health_score INTEGER
calories DECIMAL
protein_g DECIMAL
carbs_g DECIMAL
fat_g DECIMAL
```

**Processamento:**
1. Upload para MinIO
2. YOLO detecta objetos (0.8s)
3. Gemini refina análise (2-3s)
4. Cálculo nutricional
5. Salva em `food_analysis`

**Edge Functions:**
- `sofia-image-analysis` (síncrono)
- `enqueue-analysis` + `process-analysis-worker` (assíncrono)

**Componentes:**
- `src/components/sofia/AsyncFoodAnalysis.tsx`
- `src/components/FoodAnalysisSystem.tsx`

**Hook:** `uploadFoodImage(file)`

**WhatsApp:**
```
Foto → Webhook → Upload MinIO → Análise → Resposta WhatsApp
```

---

### 3️⃣ EXAME MÉDICO (IMAGEM)

**Origem:**
- App (upload de exame)
- WhatsApp (envio de exame)

**Fluxo:**
```
Imagem → MinIO (medical-exams/) → YOLO (OCR) → Gemini (interpretação) → Relatório HTML
```

**Pasta MinIO:** `medical-exams/{user_id}/exam_{timestamp}.{ext}`

**Tabela:** `medical_documents`
```sql
file_url TEXT
file_path TEXT
document_type TEXT (exam, prescription, report)
status TEXT (pending, processing, completed, error)
report_path TEXT (HTML gerado)
pdf_path TEXT (PDF gerado)
```

**Processamento:**
1. Upload para MinIO
2. YOLO detecta regiões de texto
3. Gemini extrai dados estruturados
4. Gera relatório HTML humanizado
5. Opcionalmente gera PDF

**Edge Functions:**
- `analyze-medical-exam` (principal)
- `generate-medical-report` (HTML)
- `generate-medical-pdf` (PDF)
- `premium-medical-report` (versão premium)

**Componentes:**
- `src/components/dashboard/MedicalDocumentsSection.tsx`
- `src/components/dr-vital/ExamUploadModal.tsx`

**Hook:** `uploadMedicalExam(file)`

---

### 4️⃣ RELATÓRIO MÉDICO (HTML)

**Origem:**
- Gerado automaticamente após análise de exame

**Fluxo:**
```
Análise completa → Gera HTML → MinIO (medical-reports/) → medical_documents.report_path
```

**Pasta MinIO:** `medical-reports/{user_id}/report_{document_id}.html`

**Formato:**
- HTML5 responsivo
- CSS inline
- Gráficos RGraph
- Seções: Resumo, Valores, Interpretação, Recomendações

**Visualização:**
- Link público compartilhável
- Expiração: 7 dias (configurável)
- Tabela: `medical_report_links`

**Edge Function:** `generate-medical-report`

---

### 5️⃣ RELATÓRIO MÉDICO (PDF)

**Origem:**
- Gerado sob demanda (versão premium)

**Fluxo:**
```
HTML → Conversão PDF → MinIO (medical-reports/) → medical_documents.pdf_path
```

**Pasta MinIO:** `medical-reports/{user_id}/report_{document_id}.pdf`

**Geração:**
- Baseado no HTML
- Usa API externa (pdf.co ou similar)
- Fallback: HTML com extensão .pdf

**Edge Function:** `generate-medical-pdf`

---

### 6️⃣ STORY (24 HORAS)

**Origem:**
- App (câmera ou galeria)

**Fluxo:**
```
Foto/Vídeo → MinIO (stories/) → health_feed_stories → Expira em 24h
```

**Pasta MinIO:** `stories/{user_id}/story_{timestamp}.{ext}`

**Tabela:** `health_feed_stories`
```sql
media_url TEXT
media_type TEXT (image, video)
expires_at TIMESTAMPTZ (NOW() + 24 hours)
view_count INTEGER
```

**Processamento:**
- Compressão automática
- Limite: 10 MB
- Formatos: JPEG, PNG, MP4, WebM

**Expiração:**
- Soft delete após 24h
- Cleanup automático (cron job)

**Componentes:**
- `src/components/community/StoriesSection.tsx`
- `src/components/community/StoryViewer.tsx`
- `src/components/community/CreateStoryModal.tsx`

**Hook:** `uploadStoryImage(file)`

---

### 7️⃣ POST DA COMUNIDADE

**Origem:**
- App (feed da comunidade)

**Fluxo:**
```
Foto/Vídeo → MinIO (feed/) → health_feed_posts
```

**Pasta MinIO:** `feed/{user_id}/post_{timestamp}.{ext}`

**Tabela:** `health_feed_posts`
```sql
media_url TEXT
media_type TEXT (image, video, none)
content TEXT
likes_count INTEGER
comments_count INTEGER
```

**Processamento:**
- Múltiplas imagens (até 5)
- Compressão automática
- Limite: 10 MB por arquivo

**Componentes:**
- `src/components/health-feed/CreatePost.tsx`
- `src/components/health-feed/FileUpload.tsx`
- `src/pages/HealthFeedPage.tsx`

**Hook:** `uploadFeedImage(file)`

---

### 8️⃣ FOTO DE PESAGEM

**Origem:**
- App (registro de peso)

**Fluxo:**
```
Foto → MinIO (weight-photos/) → weight_measurements.photo_url
```

**Pasta MinIO:** `weight-photos/{user_id}/weight_{timestamp}.{ext}`

**Tabela:** `weight_measurements`
```sql
photo_url TEXT
weight_kg DECIMAL
measurement_date TIMESTAMPTZ
notes TEXT
body_fat_percentage DECIMAL
```

**Uso:**
- Evidência visual do progresso
- Comparação antes/depois
- Timeline de evolução

**Componentes:**
- `src/components/weighing/WeightTracker.tsx`
- `src/components/XiaomiScaleConnection.tsx`

**Hook:** `uploadWeightPhoto(file)`

---

### 9️⃣ CHAT SOFIA / DR. VITAL

**Origem:**
- App (chat com IA)

**Fluxo:**
```
Imagem → MinIO (chat-images/) → Análise contextual → Resposta IA
```

**Pasta MinIO:** `chat-images/{user_id}/chat_{timestamp}.{ext}`

**Uso:**
- Perguntas visuais para Sofia
- Envio de sintomas para Dr. Vital
- Análise rápida sem salvar histórico

**Componentes:**
- `src/components/sofia/SofiaVoiceChat.tsx`
- `src/components/HealthChatBot.tsx`

**Hook:** `uploadChatImage(file)`

---

### 🔟 WHATSAPP (RECEBIDO)

**Origem:**
- WhatsApp (webhook Evolution API)

**Fluxo:**
```
WhatsApp → Webhook → Download → MinIO (whatsapp/) → Processa → Move para pasta específica
```

**Pasta MinIO:** `whatsapp/{phone_number}/{timestamp}_{media_id}.{ext}`

**Processamento:**
1. Webhook recebe notificação
2. Download da mídia (Evolution API)
3. Upload temporário para MinIO
4. Identifica tipo (food/medical)
5. Processa e move para pasta correta

**Edge Functions:**
- `whatsapp-nutrition-webhook` (principal)
- `whatsapp-medical-handler` (exames)

**Tipos detectados:**
- FOOD → `food-analysis/`
- MEDICAL → `medical-exams/`
- OTHER → permanece em `whatsapp/`

---

### 1️⃣1️⃣ VÍDEO DE EXERCÍCIO

**Origem:**
- Admin (cadastro de exercícios)

**Fluxo:**
```
Admin → Upload → MinIO (exercise-videos/) → exercises.video_url
```

**Pasta MinIO:** `exercise-videos/{exercise_id}/video_{timestamp}.mp4`

**Tabela:** `exercises`
```sql
video_url TEXT
video_duration INTEGER (segundos)
```

**Formatos:**
- MP4, WebM, MOV
- Limite: 100 MB
- Resolução: 720p ou 1080p

**Componentes:**
- `src/components/admin/ExerciseModal.tsx`

---

### 1️⃣2️⃣ MÍDIA DE EXERCÍCIO

**Origem:**
- Admin (imagens de exercícios)

**Fluxo:**
```
Admin → Upload → MinIO (exercise-media/) → exercises.media_url
```

**Pasta MinIO:** `exercise-media/{exercise_id}/media_{timestamp}.{ext}`

**Uso:**
- Thumbnails de exercícios
- Diagramas de movimento
- Fotos de posição

**Hook:** `uploadExerciseMedia(file)`

---

### 1️⃣3️⃣ THUMBNAIL DE CURSO

**Origem:**
- Admin (cadastro de cursos)

**Fluxo:**
```
Admin → Upload → MinIO (course-thumbnails/) → courses.thumbnail_url
```

**Pasta MinIO:** `course-thumbnails/{course_id}/thumb_{timestamp}.{ext}`

**Tabela:** `courses`
```sql
thumbnail_url TEXT
```

**Especificações:**
- Tamanho: 1280x720px (16:9)
- Formato: JPEG, PNG, WebP
- Limite: 2 MB

**Componentes:**
- `src/components/admin/CourseModal.tsx`

**Hook:** `uploadCourseThumbnail(file)`

---

### 1️⃣4️⃣ VÍDEO DE AULA

**Origem:**
- Admin (cadastro de aulas)

**Fluxo:**
```
Admin → Upload → MinIO (lesson-videos/) → lessons.video_url
```

**Pasta MinIO:** `lesson-videos/{lesson_id}/video_{timestamp}.mp4`

**Tabela:** `lessons`
```sql
video_url TEXT
video_duration INTEGER
```

**Formatos:**
- MP4, WebM
- Limite: 500 MB
- Resolução: 1080p

**Componentes:**
- `src/components/admin/LessonModal.tsx`

---

### 1️⃣5️⃣ DOCUMENTO DE AULA (PDF)

**Origem:**
- Admin (material complementar)

**Fluxo:**
```
Admin → Upload → MinIO (lesson-videos/) → lessons.document_url
```

**Pasta MinIO:** `lesson-videos/{lesson_id}/doc_{timestamp}.pdf`

**Tabela:** `lessons`
```sql
document_url TEXT
```

**Uso:**
- Apostilas
- Slides
- Material de apoio

---

### 1️⃣6️⃣ IMAGEM DE PRODUTO

**Origem:**
- Admin (catálogo de produtos)

**Fluxo:**
```
Admin → Upload → MinIO (product-images/) → products.image_url
```

**Pasta MinIO:** `product-images/{product_id}/product_{timestamp}.{ext}`

**Tabela:** `products`
```sql
image_url TEXT
```

**Especificações:**
- Tamanho: 800x800px (1:1)
- Fundo branco
- Formato: PNG com transparência

**Componentes:**
- `src/components/admin/ProductManagement.tsx`
- `src/components/admin/ImageUpload.tsx`

---

### 1️⃣7️⃣ BANNER DA PLATAFORMA

**Origem:**
- Admin (configurações da plataforma)

**Fluxo:**
```
Admin → Upload → MinIO (banners/) → platform_settings.banner_url
```

**Pasta MinIO:** `banners/banner_{timestamp}.{ext}`

**Uso:**
- Banner principal do dashboard
- Promoções
- Anúncios

**Especificações:**
- Tamanho: 1920x400px
- Formato: JPEG, PNG, WebP
- Limite: 5 MB

**Componentes:**
- `src/components/admin/PlatformSettingsPanel.tsx`

---

### 1️⃣8️⃣ FOTO DE META/PROGRESSO

**Origem:**
- App (atualização de metas)

**Fluxo:**
```
Foto → MinIO (feed/) → user_goals.progress_photos (JSONB array)
```

**Pasta MinIO:** `feed/{user_id}/goal_{goal_id}_{timestamp}.{ext}`

**Tabela:** `user_goals`
```sql
progress_photos JSONB (array de URLs)
```

**Uso:**
- Evidência de progresso
- Motivação visual
- Compartilhamento opcional

**Componentes:**
- `src/components/goals/UpdateProgressModal.tsx`

---

## 🔄 FLUXOS ESPECIAIS

### WhatsApp → Análise de Alimentos

```
1. Usuário envia foto no WhatsApp
2. Webhook recebe notificação
3. Download da imagem (Evolution API)
4. Upload para MinIO (whatsapp/)
5. Detecta tipo: FOOD
6. Processa com Sofia
7. Salva em food_analysis
8. Responde no WhatsApp com análise
```

### WhatsApp → Análise de Exame

```
1. Usuário envia exame no WhatsApp
2. Webhook recebe notificação
3. Download da imagem
4. Upload para MinIO (whatsapp/)
5. Detecta tipo: MEDICAL
6. Cria medical_documents
7. Processa com Dr. Vital
8. Gera relatório HTML
9. Envia link no WhatsApp
```

### Análise Assíncrona (Nova)

```
1. Upload de imagem
2. Enfileira job (async_jobs)
3. Retorna imediatamente (202 Accepted)
4. Worker processa em background
5. Notifica usuário quando pronto
6. Salva resultado no banco
```

---

## 📊 ESTATÍSTICAS DE USO

| Tipo | Uploads/dia | Tamanho Médio | Storage Total |
|------|-------------|---------------|---------------|
| Alimentos | 500-1000 | 800 KB | ~400 MB/dia |
| Exames | 50-100 | 1.5 MB | ~75 MB/dia |
| Stories | 200-400 | 500 KB | ~100 MB/dia |
| Posts | 100-200 | 600 KB | ~60 MB/dia |
| Avatares | 20-50 | 200 KB | ~5 MB/dia |
| Peso | 100-200 | 300 KB | ~30 MB/dia |
| **TOTAL** | **~1500** | - | **~670 MB/dia** |

---

## 🛠️ FERRAMENTAS E HOOKS

### Hook Principal
```typescript
import { useMediaUpload } from '@/hooks/useMediaUpload';

const {
  uploadAvatar,
  uploadFoodImage,
  uploadMedicalExam,
  uploadStoryImage,
  uploadFeedImage,
  uploadWeightPhoto,
  uploadChatImage,
  uploadCourseThumbnail,
  uploadExerciseVideo,
  uploadExerciseMedia,
  isUploading,
  progress,
  error
} = useMediaUpload();
```

### API Direta
```typescript
import { uploadToVPS } from '@/lib/vpsApi';

const result = await uploadToVPS(file, 'food-analysis');
// result.url, result.path, result.source
```

---

## 🔐 SEGURANÇA E PERMISSÕES

### Buckets Públicos (MinIO)
- `avatars/` ✅
- `stories/` ✅
- `feed/` ✅
- `course-thumbnails/` ✅
- `exercise-videos/` ✅

### Buckets Privados (MinIO)
- `medical-exams/` 🔒
- `medical-reports/` 🔒
- `whatsapp/` 🔒

### RLS (Supabase Storage - Fallback)
- Usuários só acessam suas próprias pastas
- Admins têm acesso total
- Políticas por bucket

---

## 📚 REFERÊNCIAS

- **Hook:** `src/hooks/useMediaUpload.ts`
- **API:** `src/lib/vpsApi.ts`
- **Edge Function:** `supabase/functions/media-upload/index.ts`
- **Arquitetura:** `docs/STORAGE_ARCHITECTURE.md`

---

*Última atualização: Janeiro 2026*
