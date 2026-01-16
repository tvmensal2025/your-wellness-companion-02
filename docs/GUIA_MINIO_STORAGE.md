# 🗄️ Guia Completo: Configurar MinIO + Backend VPS

Este guia explica PASSO A PASSO como configurar o MinIO e o Backend para armazenar imagens no MaxNutrition.

---

## 📋 Sua Configuração Atual

Você já tem:
- ✅ **MinIO** rodando em `yolo-service-minio.0sw627.easypanel.host`
- ✅ **media-api** criado no EasyPanel (usando `vps-backend/`)
- ✅ **Bucket `images`** criado

Falta apenas:
- ⏳ Configurar variáveis de ambiente no `media-api`
- ⏳ Fazer deploy do `media-api`
- ⏳ Atualizar URL no frontend

---

## 🚀 PARTE 0: Configurar seu media-api (FAÇA ISSO PRIMEIRO!)

### Passo 0.1: Acessar EasyPanel
1. Abra: `https://painel.0sw627.easypanel.host`
2. Vá no projeto `yolo-service`
3. Clique no serviço `media-api`

### Passo 0.2: Configurar Variáveis de Ambiente
Clique em **"Environment"** e adicione TODAS estas variáveis:

```env
# Servidor
PORT=3000
NODE_ENV=production
API_SECRET_KEY=maxnutrition-secret-2026

# MinIO (seus dados)
MINIO_ENDPOINT=yolo-service-minio.0sw627.easypanel.host
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=rfdias
MINIO_SECRET_KEY=201097De.
MINIO_BUCKET=images
MINIO_PUBLIC_URL=https://yolo-service-minio.0sw627.easypanel.host

# Supabase
SUPABASE_URL=https://ciszqtlaacrhfwsqnvjr.supabase.co
SUPABASE_SERVICE_KEY=sua-service-role-key-aqui

# Rate Limit
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Passo 0.3: Verificar Configuração de Build
Na aba **"Source"**, confirme:
- **Repository**: `https://github.com/tvmensal2025/your-wellness-companion-02.git`
- **Branch**: `main`
- **Build Path**: `/vps-backend`

### Passo 0.4: Configurar Domínio
Na aba **"Domains"**, adicione:
- `media-api-yolo-service.0sw627.easypanel.host` → porta `3000`

### Passo 0.5: Deploy
1. Clique em **"Salvar"**
2. Clique em **"Implantar"** (ou "Deploy")
3. Aguarde o build (2-5 minutos)
4. Status deve ficar **"Running"** (verde)

### Passo 0.6: Testar
Acesse no navegador:
```
https://media-api-yolo-service.0sw627.easypanel.host/health
```

Deve retornar:
```json
{"status": "ok", "timestamp": "..."}
```

---

## 🚀 PARTE 1: Criar MinIO no EasyPanel (JÁ FEITO!)

### Passo 1.1: Acessar EasyPanel
1. Abra seu painel EasyPanel (ex: `https://painel.0sw627.easypanel.host`)
2. No menu lateral, clique em **"Projects"**
3. Selecione seu projeto ou crie um novo

### Passo 1.2: Criar Serviço MinIO
1. Clique no botão **"+ Create Service"** (ou "+ New")
2. Selecione **"App"**
3. Escolha **"Docker"** como tipo

### Passo 1.3: Configurar o MinIO
Preencha os campos:

**General:**
- **Service Name**: `minio`

**Source:**
- **Image**: `minio/minio`
- **Command**: `server /data --console-address ":9001"`

### Passo 1.4: Adicionar Variáveis de Ambiente
Clique em **"Environment"** e adicione:

```
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=MaxNutrition2026!
```

⚠️ **IMPORTANTE**: Anote essa senha! Você vai precisar depois.

### Passo 1.5: Configurar Portas
Clique em **"Ports"** e adicione:

| Container Port | Protocol |
|----------------|----------|
| 9000           | HTTP     |
| 9001           | HTTP     |

### Passo 1.6: Configurar Volume (Persistência)
Clique em **"Mounts"** e adicione:

| Type   | Name        | Mount Path |
|--------|-------------|------------|
| Volume | minio-data  | /data      |

### Passo 1.7: Configurar Domínios
Clique em **"Domains"** e adicione:

| Domain                              | Port |
|-------------------------------------|------|
| minio.0sw627.easypanel.host         | 9000 |
| minio-console.0sw627.easypanel.host | 9001 |

(Substitua `0sw627` pelo seu ID do EasyPanel)

### Passo 1.8: Deploy
1. Clique em **"Deploy"**
2. Aguarde o status ficar **"Running"** (verde)
3. Pode levar 1-2 minutos

### Passo 1.9: Criar Bucket no MinIO
1. Acesse: `https://minio-console.0sw627.easypanel.host`
2. Login:
   - **Username**: `minioadmin`
   - **Password**: `MaxNutrition2026!`
3. No menu lateral, clique em **"Buckets"**
4. Clique em **"Create Bucket"**
5. Nome: `images`
6. Clique em **"Create Bucket"**
7. Clique no bucket `images` → **"Access Policy"** → Selecione **"Public"** → **"Set"**

---

## 🔧 PARTE 2: Criar Backend VPS no EasyPanel

O backend já existe na pasta `vps-backend/` do projeto. Vamos fazer deploy dele.

### Passo 2.1: Criar Serviço Backend
1. No EasyPanel, clique em **"+ Create Service"**
2. Selecione **"App"**
3. Escolha **"GitHub"** (recomendado) ou **"Docker"**

### Passo 2.2: Se escolher GitHub
1. Conecte seu repositório GitHub
2. Configure:
   - **Branch**: `main`
   - **Build Path**: `vps-backend`
   - **Dockerfile Path**: `vps-backend/Dockerfile`

### Passo 2.3: Se escolher Docker (manual)
1. No seu terminal local, faça build e push:
```bash
cd vps-backend
docker build -t seu-registry/maxnutrition-backend:latest .
docker push seu-registry/maxnutrition-backend:latest
```
2. No EasyPanel, use a imagem: `seu-registry/maxnutrition-backend:latest`

### Passo 2.4: Configurar Variáveis de Ambiente
Clique em **"Environment"** e adicione TODAS estas variáveis:

```env
# Servidor
PORT=3000
NODE_ENV=production

# Chave de API (GERE UMA NOVA - use: openssl rand -hex 32)
API_SECRET_KEY=cole-aqui-uma-chave-de-64-caracteres

# MinIO (use os mesmos dados do Passo 1)
MINIO_ENDPOINT=minio.0sw627.easypanel.host
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=MaxNutrition2026!
MINIO_BUCKET=images
MINIO_PUBLIC_URL=https://minio.0sw627.easypanel.host

# Supabase (copie do seu projeto)
SUPABASE_URL=https://hlrkoyywjpckdotimtik.supabase.co
SUPABASE_SERVICE_KEY=sua-service-role-key-aqui

# Rate Limit
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
```

### Passo 2.5: Gerar API_SECRET_KEY
No terminal, execute:
```bash
openssl rand -hex 32
```
Copie o resultado e cole em `API_SECRET_KEY`.

**ANOTE ESSA CHAVE!** Você vai usar no frontend também.

### Passo 2.6: Configurar Porta
Clique em **"Ports"**:

| Container Port | Protocol |
|----------------|----------|
| 3000           | HTTP     |

### Passo 2.7: Configurar Domínio
Clique em **"Domains"**:

| Domain                              | Port |
|-------------------------------------|------|
| backend.0sw627.easypanel.host       | 3000 |

### Passo 2.8: Deploy
1. Clique em **"Deploy"**
2. Aguarde o build (pode levar 2-5 minutos)
3. Status deve ficar **"Running"**

### Passo 2.9: Testar Backend
Acesse no navegador:
```
https://backend.0sw627.easypanel.host/health
```

Deve retornar algo como:
```json
{
  "status": "ok",
  "timestamp": "2026-01-16T...",
  "uptime": 123.456
}
```

---

## ⚙️ PARTE 3: Configurar Frontend

### Passo 3.1: Criar arquivo .env
Na raiz do projeto (onde está `package.json`), crie um arquivo chamado `.env`:

```env
# Supabase (já deve existir)
VITE_SUPABASE_URL=https://hlrkoyywjpckdotimtik.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui

# VPS Backend (NOVO)
VITE_VPS_API_URL=https://backend.0sw627.easypanel.host
VITE_VPS_API_KEY=cole-aqui-a-mesma-chave-do-API_SECRET_KEY

# MinIO URL pública
VITE_MINIO_PUBLIC_URL=https://minio.0sw627.easypanel.host/images
```

### Passo 3.2: Importante sobre as chaves
- `VITE_VPS_API_KEY` deve ser **IGUAL** a `API_SECRET_KEY` do backend
- Se forem diferentes, vai dar erro "Unauthorized"

### Passo 3.3: Reiniciar o Dev Server
```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

### Passo 3.4: Testar Upload
1. Acesse: `http://localhost:8080/admin`
2. Vá em **"Gestão de Produtos"**
3. Clique em **"Novo Produto"**
4. O aviso amarelo "VPS não configurada" deve ter sumido
5. Clique em **"Selecionar Imagem"**
6. Escolha uma imagem
7. Deve fazer upload e mostrar preview ✅

---

## 🔍 PARTE 4: Troubleshooting (Problemas Comuns)

### Erro: "VPS não configurada"
**Causa**: Falta variáveis no `.env`
**Solução**:
1. Verifique se `.env` existe na raiz do projeto
2. Verifique se tem `VITE_VPS_API_URL` e `VITE_VPS_API_KEY`
3. Reinicie o dev server (`npm run dev`)

### Erro: "Unauthorized" ou "API Key inválida"
**Causa**: Chaves diferentes no frontend e backend
**Solução**:
1. No EasyPanel, copie o valor de `API_SECRET_KEY`
2. Cole em `VITE_VPS_API_KEY` no `.env` do frontend
3. Devem ser EXATAMENTE iguais

### Erro: "MinIO não inicializado" ou "ECONNREFUSED"
**Causa**: Backend não consegue conectar no MinIO
**Solução**:
1. Verifique se MinIO está rodando no EasyPanel
2. Verifique `MINIO_ENDPOINT` (sem https://, só o domínio)
3. Verifique `MINIO_ACCESS_KEY` e `MINIO_SECRET_KEY`

### Erro: "Bucket not found"
**Causa**: Bucket `images` não existe no MinIO
**Solução**:
1. Acesse o console MinIO
2. Crie o bucket `images`
3. Configure como público

### Erro de CORS
**Causa**: Backend não permite requisições do frontend
**Solução**: O backend já tem CORS configurado para Lovable. Se usar outro domínio, edite `vps-backend/src/index.js`

### Imagem não aparece após upload
**Causa**: URL pública do MinIO incorreta
**Solução**:
1. Verifique `MINIO_PUBLIC_URL` no backend
2. Deve ser `https://minio.seudominio.com` (sem /images no final)
3. O bucket deve estar como "Public"

---

## 📁 Estrutura de Pastas no MinIO

```
images/                      ← Bucket
├── product-images/          ← Imagens de produtos
├── avatars/                 ← Fotos de perfil
├── feed/                    ← Posts da comunidade
├── stories/                 ← Stories
├── food-analysis/           ← Análises de alimentos (Sofia)
├── medical-exams/           ← Exames médicos (Dr. Vital)
├── weight-photos/           ← Fotos de pesagem
├── whatsapp/                ← Imagens do WhatsApp
├── course-thumbnails/       ← Capas de cursos
└── exercise-media/          ← Vídeos de exercícios
```

---

## 💰 Custos Estimados

| Serviço | Custo |
|---------|-------|
| MinIO | Gratuito (self-hosted) |
| Backend Node.js | Gratuito no EasyPanel |
| Storage | Depende do disco da VPS |

**Comparação com Supabase Storage:**
- Supabase: $0.021/GB após 1GB gratuito
- MinIO: Gratuito (ilimitado, depende do disco)

Para 100GB de imagens:
- Supabase: ~$2/mês
- MinIO: $0

---

## ✅ Checklist Final

- [ ] MinIO rodando no EasyPanel
- [ ] Bucket `images` criado e público
- [ ] Backend rodando no EasyPanel
- [ ] `/health` retorna status ok
- [ ] `.env` criado no frontend
- [ ] `VITE_VPS_API_KEY` igual a `API_SECRET_KEY`
- [ ] Upload de imagem funcionando

---

## 🔗 Links Úteis

- [MinIO Docs](https://min.io/docs/minio/linux/index.html)
- [EasyPanel Docs](https://easypanel.io/docs)
- Backend do projeto: `vps-backend/`
- Componente de upload: `src/components/admin/ImageUpload.tsx`


---

## 🔄 PARTE 5: Migração de Storage (Supabase → MinIO)

### Buckets Migrados para MinIO

Os seguintes buckets agora usam MinIO via VPS:

| Bucket Original | Pasta MinIO | Uso |
|-----------------|-------------|-----|
| community-media | feed/ | Posts da comunidade |
| community-media | stories/ | Stories |
| chat-images | whatsapp/ | Imagens do WhatsApp |
| - | profiles/ | Fotos de perfil (novo) |
| - | food-analysis/ | Análises de alimentos |
| - | weight-photos/ | Fotos de pesagem |

### Buckets RETIDOS no Supabase (Dados Sensíveis)

⚠️ **IMPORTANTE**: Estes buckets NÃO foram migrados por conterem dados sensíveis:

| Bucket | Motivo |
|--------|--------|
| medical-documents | Documentos médicos - dados sensíveis |
| avatars | Fotos de perfil - dados pessoais |
| medical-documents-reports | Relatórios médicos - dados sensíveis |

### Biblioteca externalMedia.ts

Nova biblioteca centralizada para uploads externos:

```typescript
import { uploadToExternalStorage, validateMediaFile } from '@/lib/externalMedia';

// Upload de arquivo
const result = await uploadToExternalStorage(file, {
  folder: 'feed',
  userId: 'user-123',
  maxSizeMB: 50
});

if (result.success) {
  console.log('URL:', result.url);
  console.log('Path:', result.path);
} else {
  console.error('Erro:', result.error);
}

// Validação prévia
const validation = validateMediaFile(file, 50);
if (!validation.valid) {
  alert(validation.error);
}
```

### Tipos de Arquivo Permitidos

```typescript
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];
```

### Códigos de Erro

| Código | Descrição | Mensagem |
|--------|-----------|----------|
| INVALID_TYPE | MIME type não permitido | "Formato não suportado. Use JPEG, PNG, GIF, WebP, MP4, MOV ou WebM." |
| FILE_TOO_LARGE | Arquivo maior que limite | "Arquivo muito grande. Máximo {X}MB." |
| CONFIG_ERROR | MEDIA_API_URL não configurada | "Configuração de upload não encontrada." |
| NETWORK_ERROR | Erro de conexão | "Erro de conexão. Tente novamente." |
| UPLOAD_FAILED | Erro no servidor | "Erro ao fazer upload. Tente novamente." |

### Variáveis de Ambiente para Edge Functions

Configure no Supabase Dashboard → Settings → Edge Functions → Secrets:

```bash
MEDIA_API_URL=https://media-api-yolo-service.0sw627.easypanel.host
MEDIA_API_KEY=sua-chave-secreta-aqui
```

### Graceful Degradation

O sistema implementa fallback automático:

1. **WhatsApp Images**: Tenta MinIO primeiro, fallback para Supabase se falhar
2. **Community Media**: Usa MinIO diretamente (sem fallback)
3. **Medical Documents**: Sempre usa Supabase (não migrado)

---

## 📊 API Endpoints do Media API

### POST /storage/upload

Upload via multipart/form-data:

```bash
curl -X POST https://media-api.../storage/upload \
  -H "X-API-Key: sua-chave" \
  -F "file=@imagem.jpg" \
  -F "folder=feed" \
  -F "userId=user-123"
```

### POST /storage/upload-base64

Upload via JSON (base64):

```bash
curl -X POST https://media-api.../storage/upload-base64 \
  -H "X-API-Key: sua-chave" \
  -H "Content-Type: application/json" \
  -d '{
    "data": "base64-encoded-data",
    "folder": "whatsapp",
    "userId": "user-123",
    "mimeType": "image/jpeg"
  }'
```

### Resposta de Sucesso

```json
{
  "success": true,
  "url": "https://minio.../images/user-123/feed/1234567890-uuid.webp",
  "path": "user-123/feed/1234567890-uuid.webp",
  "size": 123456,
  "mimeType": "image/webp"
}
```

### Resposta de Erro

```json
{
  "success": false,
  "error": "Formato não suportado. Use JPEG, PNG, GIF, WebP, MP4, MOV ou WebM.",
  "code": "INVALID_TYPE"
}
```

---

*Última atualização: Janeiro 2026*
