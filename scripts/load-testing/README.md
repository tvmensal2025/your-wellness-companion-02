# 🚀 MaxNutrition - Testes de Carga (k6/Grafana)

Script completo para testar todas as funcionalidades do app sob carga.

## 📋 Cobertura de Testes

### 1. Frontend
- Home page
- Auth page

### 2. YOLO Service (Crítico)
- Health check
- Detecção de alimentos (`/detect`)
- Estimativa de pose (`/pose`)

### 3. Ollama LLM
- API tags
- Generate (com limite de tokens)

### 4. MinIO Storage
- Health check
- Acesso ao bucket

### 5. VPS Backend
- Health check detalhado
- Storage list
- WhatsApp status

### 6. Database (Supabase)
- `profiles`
- `challenges`
- `user_goals`
- `sessions`
- `food_analysis`
- `weight_measurements` (pesagem)
- `advanced_daily_tracking`
- `user_points`
- `courses`
- `user_sessions`

### 7. Edge Functions
- `check-subscription`
- `sofia-text-analysis` (IA principal)
- `sofia-deterministic` (cálculos nutricionais)
- `sofia-image-analysis` (YOLO → Gemini)
- `dr-vital-chat`
- `generate-ai-workout`
- `generate-meal-plan-taco`
- `rate-limiter`
- `whatsapp-health-check`
- `analyze-medical-exam`

### 8. RPC Functions
- `is_admin_user`
- `get_user_ranking`

## 🔧 Instalação

```bash
# macOS
brew install k6

# Linux
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

## 🚀 Execução

### Teste Básico
```bash
k6 run scripts/load-testing/k6-load-test.js
```

### Com Variáveis de Ambiente
```bash
k6 run \
  -e SUPABASE_URL=https://ciszqtlaacrhfwsqnvjr.supabase.co \
  -e SUPABASE_ANON_KEY=sua-chave-aqui \
  -e VPS_URL=https://backend.maxnutrition.app \
  -e VPS_API_KEY=sua-api-key \
  scripts/load-testing/k6-load-test.js
```

### Integração com Grafana (InfluxDB)
```bash
k6 run --out influxdb=http://localhost:8086/k6 scripts/load-testing/k6-load-test.js
```

### Integração com Grafana Cloud
```bash
k6 run --out cloud scripts/load-testing/k6-load-test.js
```

## 📊 Cenários de Teste

| Cenário | VUs | Duração | Objetivo |
|---------|-----|---------|----------|
| Smoke | 1 | 1min | Verificação básica |
| Load | 50-100 | 16min | Carga normal |
| Stress | 200-1000 | 26min | Carga alta |
| Spike | 500-1000 | 4min | Picos repentinos |

## 📈 Métricas Monitoradas

### Taxas de Erro
- `auth_errors` - Erros de autenticação
- `database_errors` - Erros de banco
- `edge_function_errors` - Erros de edge functions
- `yolo_errors` - Erros do YOLO
- `ai_errors` - Erros de IA
- `ollama_errors` - Erros do Ollama
- `minio_errors` - Erros do MinIO
- `vps_errors` - Erros do VPS Backend
- `whatsapp_errors` - Erros do WhatsApp

### Tempos de Resposta
- `auth_duration` - Tempo de autenticação
- `db_query_duration` - Tempo de queries
- `edge_function_duration` - Tempo de edge functions
- `yolo_duration` - Tempo do YOLO
- `ai_duration` - Tempo de IA
- `ollama_duration` - Tempo do Ollama
- `minio_duration` - Tempo do MinIO
- `vps_duration` - Tempo do VPS
- `whatsapp_duration` - Tempo do WhatsApp

## 🎯 Thresholds (Limites Aceitáveis)

| Métrica | Limite |
|---------|--------|
| http_req_duration (p95) | < 2s |
| http_req_failed | < 5% |
| auth_errors | < 1% |
| database_errors | < 2% |
| edge_function_errors | < 5% |
| yolo_errors | < 10% |
| ai_errors | < 15% |
| ollama_errors | < 15% |
| minio_errors | < 5% |
| vps_errors | < 5% |
| whatsapp_errors | < 10% |

## 🔗 URLs Configuradas

| Serviço | URL |
|---------|-----|
| Supabase | https://ciszqtlaacrhfwsqnvjr.supabase.co |
| YOLO | https://yolo-service-yolo-detection.0sw627.easypanel.host |
| Ollama | https://yolo-service-ollama-web.0sw627.easypanel.host |
| MinIO | https://yolo-service-minio.0sw627.easypanel.host |
| App | https://your-wellness-companion-02.lovable.app |

## 📁 Arquivos

- `k6-load-test.js` - Script principal de testes
- `grafana-dashboard.json` - Dashboard para Grafana
- `README.md` - Esta documentação

## 🔐 Variáveis de Ambiente

```bash
# Obrigatórias
SUPABASE_URL=https://ciszqtlaacrhfwsqnvjr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Opcionais
YOLO_URL=https://yolo-service-yolo-detection.0sw627.easypanel.host
OLLAMA_URL=https://yolo-service-ollama-web.0sw627.easypanel.host
MINIO_URL=https://yolo-service-minio.0sw627.easypanel.host
VPS_URL=https://backend.maxnutrition.app
VPS_API_KEY=sua-api-key
APP_URL=https://your-wellness-companion-02.lovable.app
TEST_EMAIL=loadtest@maxnutrition.app
TEST_PASSWORD=LoadTest123!
```
