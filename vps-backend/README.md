# MaxNutrition VPS Backend

Backend Node.js para o MaxNutrition, rodando na VPS com EasyPanel.

## 🎯 Funcionalidades

| Módulo | Descrição |
|--------|-----------|
| **Storage** | Upload de imagens para MinIO (S3-compatible) |
| **WhatsApp** | Envio/recebimento de mensagens (Evolution/Whapi) |
| **Tracking** | Registro de peso, água, humor |
| **Notify** | Lembretes agendados via cron |

## 🚀 Deploy no EasyPanel

### 1. Criar App no EasyPanel

```bash
# No painel do EasyPanel:
# 1. Criar novo App → Docker
# 2. Conectar repositório ou fazer upload
# 3. Configurar variáveis de ambiente
```

### 2. Configurar MinIO

```bash
# No EasyPanel:
# 1. Criar novo App → MinIO
# 2. Configurar credenciais
# 3. Criar bucket "images"
# 4. Configurar política pública para leitura
```

### 3. Variáveis de Ambiente

```env
# Servidor
PORT=3000
NODE_ENV=production
API_SECRET_KEY=sua-chave-secreta

# MinIO
MINIO_ENDPOINT=minio.seudominio.com
MINIO_PORT=9000
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=seu-access-key
MINIO_SECRET_KEY=seu-secret-key
MINIO_BUCKET=images
MINIO_PUBLIC_URL=https://minio.seudominio.com

# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua-service-role-key

# WhatsApp (escolha um)
EVOLUTION_API_URL=https://evolution.seudominio.com
EVOLUTION_API_KEY=sua-api-key
EVOLUTION_INSTANCE=maxnutrition

# ou

WHAPI_API_URL=https://gate.whapi.cloud
WHAPI_TOKEN=seu-token
```

## 📡 Endpoints

### Storage

```bash
# Upload de arquivo
POST /storage/upload
Content-Type: multipart/form-data
X-API-Key: sua-chave

# Upload base64
POST /storage/upload-base64
{
  "data": "base64...",
  "folder": "whatsapp",
  "mimeType": "image/jpeg"
}

# Listar arquivos
GET /storage/list/:folder

# Deletar arquivo
DELETE /storage/:folder/:filename
```

### WhatsApp

```bash
# Enviar mensagem
POST /whatsapp/send
{
  "phone": "5511999999999",
  "message": "Olá!"
}

# Enviar botões
POST /whatsapp/buttons
{
  "phone": "5511999999999",
  "message": "Escolha uma opção:",
  "buttons": [
    { "id": "opt1", "text": "Opção 1" },
    { "id": "opt2", "text": "Opção 2" }
  ]
}

# Enviar template
POST /whatsapp/template
{
  "phone": "5511999999999",
  "templateType": "water_reminder"
}

# Webhook (receber mensagens)
POST /whatsapp/webhook
```

### Tracking

```bash
# Registrar peso
POST /tracking/weight
{
  "userId": "uuid",
  "weightKg": 75.5,
  "notifyWhatsApp": true
}

# Registrar água
POST /tracking/water
{
  "userId": "uuid",
  "amountMl": 250
}

# Resumo do dia
GET /tracking/summary/:userId
```

### Notificações

```bash
# Enviar notificação
POST /notify/send
{
  "phone": "5511999999999",
  "type": "water_reminder"
}

# Broadcast
POST /notify/broadcast
{
  "phones": ["5511999999999", "5511888888888"],
  "type": "good_morning"
}

# Status dos cron jobs
GET /notify/status
```

### Health

```bash
# Health check básico
GET /health

# Health check detalhado
GET /health/detailed

# Métricas
GET /health/metrics
```

## ⏰ Cron Jobs

| Job | Horário | Descrição |
|-----|---------|-----------|
| Água | 9h, 12h, 15h, 18h | Lembrete de hidratação |
| Peso | Segunda 8h | Lembrete de pesagem semanal |
| Bom dia | 7h | Mensagem de bom dia |
| Resumo | 21h | Resumo do dia |

## 🔗 Integração com Lovable

### No Lovable Cloud, criar `src/lib/vpsApi.ts`:

```typescript
const VPS_API_URL = import.meta.env.VITE_VPS_API_URL;
const VPS_API_KEY = import.meta.env.VITE_VPS_API_KEY;

export async function uploadToVPS(file: File, folder: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  
  const response = await fetch(`${VPS_API_URL}/storage/upload`, {
    method: 'POST',
    headers: { 'X-API-Key': VPS_API_KEY },
    body: formData
  });
  
  return response.json();
}

export async function sendWhatsAppMessage(phone: string, message: string) {
  const response = await fetch(`${VPS_API_URL}/whatsapp/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': VPS_API_KEY
    },
    body: JSON.stringify({ phone, message })
  });
  
  return response.json();
}
```

## 🐳 Docker

```bash
# Build
docker build -t maxnutrition-backend .

# Run
docker run -p 3000:3000 --env-file .env maxnutrition-backend

# Com docker-compose
docker-compose up -d
```

## 📊 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     LOVABLE CLOUD                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   React     │  │  Supabase   │  │    Auth     │        │
│  │   App       │  │   Client    │  │    JWT      │        │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘        │
└─────────┼────────────────┼──────────────────────────────────┘
          │                │
          │ API calls      │ Sync
          ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                     VPS BACKEND                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Express   │  │   MinIO     │  │  WhatsApp   │        │
│  │   API       │  │   Storage   │  │   Client    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   Cron      │  │  Supabase   │                          │
│  │   Jobs      │  │   Client    │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Licença

Proprietário - MaxNutrition
