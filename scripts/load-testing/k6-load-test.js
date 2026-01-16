/**
 * 🚀 MaxNutrition - Teste de Carga Completo para Grafana/k6
 * =========================================================
 * 
 * Este script testa todas as funcionalidades críticas do app
 * para validar se aguenta milhares de usuários simultâneos.
 * 
 * SERVIÇOS TESTADOS:
 * - Lovable Cloud (Supabase) - Database, Auth, Edge Functions
 * - YOLO Service - Detecção de alimentos/objetos
 * - Ollama - LLM local para IA
 * - MinIO - Storage de mídia
 * - Frontend - Páginas estáticas
 * 
 * INSTALAÇÃO:
 * 1. Instalar k6: brew install k6 (macOS) ou https://k6.io/docs/getting-started/installation/
 * 2. Configurar variáveis de ambiente (opcional)
 * 3. Executar: k6 run scripts/load-testing/k6-load-test.js
 * 
 * INTEGRAÇÃO GRAFANA:
 * k6 run --out influxdb=http://localhost:8086/k6 scripts/load-testing/k6-load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// ============================================================
// CONFIGURAÇÃO - URLs REAIS DO PROJETO
// ============================================================

const CONFIG = {
  // Lovable Cloud (Supabase por baixo)
  SUPABASE_URL: __ENV.SUPABASE_URL || 'https://ciszqtlaacrhfwsqnvjr.supabase.co',
  SUPABASE_ANON_KEY: __ENV.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpc3pxdGxhYWNyaGZ3c3FudmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODI0OTgsImV4cCI6MjA4MzA1ODQ5OH0.eyhrWnFshb7AhW0HQJquLeRFO-L3HOdjSIrgjSEgLMo',
  
  // YOLO Service (EasyPanel) - Detecção de alimentos
  YOLO_URL: __ENV.YOLO_URL || 'https://yolo-service-yolo-detection.0sw627.easypanel.host',
  
  // Ollama (EasyPanel) - LLM local
  OLLAMA_URL: __ENV.OLLAMA_URL || 'https://yolo-service-ollama-web.0sw627.easypanel.host',
  
  // MinIO (EasyPanel) - Storage de mídia
  MINIO_URL: __ENV.MINIO_URL || 'https://yolo-service-minio.0sw627.easypanel.host',
  
  // VPS Backend (WhatsApp, Tracking)
  VPS_URL: __ENV.VPS_URL || 'https://backend.maxnutrition.app',
  VPS_API_KEY: __ENV.VPS_API_KEY || '',
  
  // App Frontend (Lovable)
  APP_URL: __ENV.APP_URL || 'https://your-wellness-companion-02.lovable.app',
  
  // Usuário de teste (criar um usuário de teste no Supabase)
  TEST_EMAIL: __ENV.TEST_EMAIL || 'loadtest@maxnutrition.app',
  TEST_PASSWORD: __ENV.TEST_PASSWORD || 'LoadTest123!',
};

// ============================================================
// MÉTRICAS CUSTOMIZADAS
// ============================================================

// Taxas de erro por funcionalidade
const authErrorRate = new Rate('auth_errors');
const dbErrorRate = new Rate('database_errors');
const edgeFnErrorRate = new Rate('edge_function_errors');
const yoloErrorRate = new Rate('yolo_errors');
const aiErrorRate = new Rate('ai_errors');
const ollamaErrorRate = new Rate('ollama_errors');
const minioErrorRate = new Rate('minio_errors');
const vpsErrorRate = new Rate('vps_errors');
const whatsappErrorRate = new Rate('whatsapp_errors');

// Tempos de resposta por funcionalidade
const authDuration = new Trend('auth_duration');
const dbQueryDuration = new Trend('db_query_duration');
const edgeFnDuration = new Trend('edge_function_duration');
const yoloDuration = new Trend('yolo_duration');
const aiDuration = new Trend('ai_duration');
const ollamaDuration = new Trend('ollama_duration');
const minioDuration = new Trend('minio_duration');
const vpsDuration = new Trend('vps_duration');
const whatsappDuration = new Trend('whatsapp_duration');

// Contadores
const successfulLogins = new Counter('successful_logins');
const failedLogins = new Counter('failed_logins');
const totalRequests = new Counter('total_requests');

// ============================================================
// CENÁRIOS DE TESTE
// ============================================================

export const options = {
  scenarios: {
    // Cenário 1: Smoke Test (verificação básica)
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      tags: { test_type: 'smoke' },
      startTime: '0s',
    },
    
    // Cenário 2: Load Test (carga normal)
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 },   // Ramp up para 50 usuários
        { duration: '5m', target: 50 },   // Manter 50 usuários
        { duration: '2m', target: 100 },  // Ramp up para 100
        { duration: '5m', target: 100 },  // Manter 100 usuários
        { duration: '2m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'load' },
      startTime: '1m',
    },
    
    // Cenário 3: Stress Test (carga alta)
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 200 },  // Ramp up rápido
        { duration: '5m', target: 200 },  // Manter 200 usuários
        { duration: '2m', target: 500 },  // Ramp up para 500
        { duration: '5m', target: 500 },  // Manter 500 usuários
        { duration: '2m', target: 1000 }, // Ramp up para 1000
        { duration: '5m', target: 1000 }, // Manter 1000 usuários
        { duration: '5m', target: 0 },    // Ramp down
      ],
      tags: { test_type: 'stress' },
      startTime: '20m',
    },
    
    // Cenário 4: Spike Test (picos repentinos)
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 500 },  // Spike instantâneo
        { duration: '1m', target: 500 },   // Manter
        { duration: '10s', target: 0 },    // Drop
        { duration: '30s', target: 0 },    // Recuperação
        { duration: '10s', target: 1000 }, // Spike maior
        { duration: '1m', target: 1000 },  // Manter
        { duration: '10s', target: 0 },    // Drop
      ],
      tags: { test_type: 'spike' },
      startTime: '50m',
    },
  },
  
  // Thresholds (limites aceitáveis)
  thresholds: {
    http_req_duration: ['p(95)<2000'],     // 95% das requests < 2s
    http_req_failed: ['rate<0.05'],         // Menos de 5% de falhas
    auth_errors: ['rate<0.01'],             // Menos de 1% erro auth
    database_errors: ['rate<0.02'],         // Menos de 2% erro DB
    edge_function_errors: ['rate<0.05'],    // Menos de 5% erro Edge
    yolo_errors: ['rate<0.10'],             // Menos de 10% erro YOLO
    ai_errors: ['rate<0.15'],               // Menos de 15% erro AI
    ollama_errors: ['rate<0.15'],           // Menos de 15% erro Ollama
    minio_errors: ['rate<0.05'],            // Menos de 5% erro MinIO
    vps_errors: ['rate<0.05'],              // Menos de 5% erro VPS
    whatsapp_errors: ['rate<0.10'],         // Menos de 10% erro WhatsApp
  },
};

// ============================================================
// HELPERS
// ============================================================

function getHeaders(token = null) {
  const headers = {
    'Content-Type': 'application/json',
    'apikey': CONFIG.SUPABASE_ANON_KEY,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

function supabaseRest(endpoint, method = 'GET', body = null, token = null) {
  const url = `${CONFIG.SUPABASE_URL}/rest/v1/${endpoint}`;
  const params = {
    headers: getHeaders(token),
  };
  
  if (body) {
    params.body = JSON.stringify(body);
  }
  
  totalRequests.add(1);
  
  switch (method) {
    case 'POST':
      return http.post(url, JSON.stringify(body), { headers: params.headers });
    case 'PATCH':
      return http.patch(url, JSON.stringify(body), { headers: params.headers });
    case 'DELETE':
      return http.del(url, { headers: params.headers });
    default:
      return http.get(url, { headers: params.headers });
  }
}

function supabaseFunction(functionName, body = {}, token = null) {
  const url = `${CONFIG.SUPABASE_URL}/functions/v1/${functionName}`;
  const headers = getHeaders(token);
  
  totalRequests.add(1);
  
  return http.post(url, JSON.stringify(body), { headers });
}

// ============================================================
// TESTES POR FUNCIONALIDADE
// ============================================================

// 1. AUTENTICAÇÃO
function testAuth() {
  group('🔐 Autenticação', () => {
    // Login
    const loginStart = Date.now();
    const loginRes = http.post(
      `${CONFIG.SUPABASE_URL}/auth/v1/token?grant_type=password`,
      JSON.stringify({
        email: CONFIG.TEST_EMAIL,
        password: CONFIG.TEST_PASSWORD,
      }),
      { headers: getHeaders() }
    );
    authDuration.add(Date.now() - loginStart);
    
    const loginSuccess = check(loginRes, {
      'login status 200': (r) => r.status === 200,
      'login has access_token': (r) => r.json('access_token') !== undefined,
    });
    
    authErrorRate.add(!loginSuccess);
    
    if (loginSuccess) {
      successfulLogins.add(1);
      return loginRes.json('access_token');
    } else {
      failedLogins.add(1);
      return null;
    }
  });
}

// 2. QUERIES DO BANCO DE DADOS
function testDatabaseQueries(token) {
  group('🗃️ Database Queries', () => {
    // Profiles
    const profileStart = Date.now();
    const profileRes = supabaseRest('profiles?select=*&limit=1', 'GET', null, token);
    dbQueryDuration.add(Date.now() - profileStart);
    
    const profileSuccess = check(profileRes, {
      'profiles query success': (r) => r.status === 200,
    });
    dbErrorRate.add(!profileSuccess);
    
    // Challenges
    const challengesStart = Date.now();
    const challengesRes = supabaseRest('challenges?select=*&is_active=eq.true&limit=10', 'GET', null, token);
    dbQueryDuration.add(Date.now() - challengesStart);
    
    const challengesSuccess = check(challengesRes, {
      'challenges query success': (r) => r.status === 200,
    });
    dbErrorRate.add(!challengesSuccess);
    
    // User Goals
    const goalsStart = Date.now();
    const goalsRes = supabaseRest('user_goals?select=*&limit=5', 'GET', null, token);
    dbQueryDuration.add(Date.now() - goalsStart);
    
    const goalsSuccess = check(goalsRes, {
      'goals query success': (r) => r.status === 200,
    });
    dbErrorRate.add(!goalsSuccess);
    
    // Sessions
    const sessionsStart = Date.now();
    const sessionsRes = supabaseRest('sessions?select=*&is_active=eq.true&limit=10', 'GET', null, token);
    dbQueryDuration.add(Date.now() - sessionsStart);
    
    const sessionsSuccess = check(sessionsRes, {
      'sessions query success': (r) => r.status === 200,
    });
    dbErrorRate.add(!sessionsSuccess);
    
    // Food Analysis (histórico)
    const foodStart = Date.now();
    const foodRes = supabaseRest('food_analysis?select=*&order=created_at.desc&limit=10', 'GET', null, token);
    dbQueryDuration.add(Date.now() - foodStart);
    
    const foodSuccess = check(foodRes, {
      'food_analysis query success': (r) => r.status === 200,
    });
    dbErrorRate.add(!foodSuccess);
    
    // Weight Measurements (pesagem)
    const weightStart = Date.now();
    const weightRes = supabaseRest('weight_measurements?select=*&order=measurement_date.desc&limit=10', 'GET', null, token);
    dbQueryDuration.add(Date.now() - weightStart);
    
    const weightSuccess = check(weightRes, {
      'weight_measurements query success': (r) => r.status === 200,
    });
    dbErrorRate.add(!weightSuccess);
    
    // Advanced Daily Tracking
    const trackingStart = Date.now();
    const trackingRes = supabaseRest('advanced_daily_tracking?select=*&order=tracking_date.desc&limit=10', 'GET', null, token);
    dbQueryDuration.add(Date.now() - trackingStart);
    
    const trackingSuccess = check(trackingRes, {
      'advanced_daily_tracking query success': (r) => r.status === 200,
    });
    dbErrorRate.add(!trackingSuccess);
    
    // User Points (gamificação)
    const pointsStart = Date.now();
    const pointsRes = supabaseRest('user_points?select=*&limit=10', 'GET', null, token);
    dbQueryDuration.add(Date.now() - pointsStart);
    
    const pointsSuccess = check(pointsRes, {
      'user_points query success': (r) => r.status === 200,
    });
    dbErrorRate.add(!pointsSuccess);
    
    // Courses
    const coursesStart = Date.now();
    const coursesRes = supabaseRest('courses?select=*&is_active=eq.true&limit=10', 'GET', null, token);
    dbQueryDuration.add(Date.now() - coursesStart);
    
    const coursesSuccess = check(coursesRes, {
      'courses query success': (r) => r.status === 200,
    });
    dbErrorRate.add(!coursesSuccess);
    
    // User Sessions (atribuições)
    const userSessionsStart = Date.now();
    const userSessionsRes = supabaseRest('user_sessions?select=*&limit=10', 'GET', null, token);
    dbQueryDuration.add(Date.now() - userSessionsStart);
    
    const userSessionsSuccess = check(userSessionsRes, {
      'user_sessions query success': (r) => r.status === 200,
    });
    dbErrorRate.add(!userSessionsSuccess);
  });
}

// 3. EDGE FUNCTIONS
function testEdgeFunctions(token) {
  group('⚡ Edge Functions', () => {
    // Check subscription
    const subStart = Date.now();
    const subRes = supabaseFunction('check-subscription', {}, token);
    edgeFnDuration.add(Date.now() - subStart);
    
    const subSuccess = check(subRes, {
      'check-subscription success': (r) => r.status === 200 || r.status === 401,
    });
    edgeFnErrorRate.add(!subSuccess);
    
    // Sofia Text Analysis (IA principal)
    const sofiaStart = Date.now();
    const sofiaRes = supabaseFunction('sofia-text-analysis', {
      message: 'Olá, teste de carga',
      userId: 'test-user',
    }, token);
    edgeFnDuration.add(Date.now() - sofiaStart);
    aiDuration.add(Date.now() - sofiaStart);
    
    const sofiaSuccess = check(sofiaRes, {
      'sofia-text-analysis responds': (r) => r.status === 200 || r.status === 429,
    });
    edgeFnErrorRate.add(!sofiaSuccess && sofiaRes.status !== 429);
    aiErrorRate.add(!sofiaSuccess && sofiaRes.status !== 429);
    
    // Sofia Deterministic (cálculos nutricionais)
    const deterministicStart = Date.now();
    const deterministicRes = supabaseFunction('sofia-deterministic', {
      foods: ['arroz', 'feijão'],
      portions: [100, 80],
    }, token);
    edgeFnDuration.add(Date.now() - deterministicStart);
    
    const deterministicSuccess = check(deterministicRes, {
      'sofia-deterministic responds': (r) => r.status === 200 || r.status === 429,
    });
    edgeFnErrorRate.add(!deterministicSuccess && deterministicRes.status !== 429);
    
    // Dr. Vital Chat
    const drVitalStart = Date.now();
    const drVitalRes = supabaseFunction('dr-vital-chat', {
      message: 'Como está minha saúde?',
      userId: 'test-user',
    }, token);
    edgeFnDuration.add(Date.now() - drVitalStart);
    aiDuration.add(Date.now() - drVitalStart);
    
    const drVitalSuccess = check(drVitalRes, {
      'dr-vital-chat responds': (r) => r.status === 200 || r.status === 429,
    });
    edgeFnErrorRate.add(!drVitalSuccess && drVitalRes.status !== 429);
    aiErrorRate.add(!drVitalSuccess && drVitalRes.status !== 429);
    
    // Generate AI Workout
    const workoutStart = Date.now();
    const workoutRes = supabaseFunction('generate-ai-workout', {
      userId: 'test-user',
      type: 'strength',
      duration: 30,
    }, token);
    edgeFnDuration.add(Date.now() - workoutStart);
    aiDuration.add(Date.now() - workoutStart);
    
    const workoutSuccess = check(workoutRes, {
      'generate-ai-workout responds': (r) => r.status === 200 || r.status === 429,
    });
    edgeFnErrorRate.add(!workoutSuccess && workoutRes.status !== 429);
    
    // Generate Meal Plan TACO
    const mealPlanStart = Date.now();
    const mealPlanRes = supabaseFunction('generate-meal-plan-taco', {
      userId: 'test-user',
      calories: 2000,
      restrictions: [],
    }, token);
    edgeFnDuration.add(Date.now() - mealPlanStart);
    aiDuration.add(Date.now() - mealPlanStart);
    
    const mealPlanSuccess = check(mealPlanRes, {
      'generate-meal-plan-taco responds': (r) => r.status === 200 || r.status === 429,
    });
    edgeFnErrorRate.add(!mealPlanSuccess && mealPlanRes.status !== 429);
    
    // Rate Limiter
    const rateLimitStart = Date.now();
    const rateLimitRes = supabaseFunction('rate-limiter', {
      action: 'check',
      userId: 'test-user',
    }, token);
    edgeFnDuration.add(Date.now() - rateLimitStart);
    
    check(rateLimitRes, {
      'rate-limiter responds': (r) => r.status === 200 || r.status === 429,
    });
    
    // WhatsApp Health Check
    const whatsappHealthStart = Date.now();
    const whatsappHealthRes = supabaseFunction('whatsapp-health-check', {}, token);
    edgeFnDuration.add(Date.now() - whatsappHealthStart);
    whatsappDuration.add(Date.now() - whatsappHealthStart);
    
    const whatsappHealthSuccess = check(whatsappHealthRes, {
      'whatsapp-health-check responds': (r) => r.status === 200 || r.status === 429 || r.status === 500,
    });
    whatsappErrorRate.add(!whatsappHealthSuccess);
    
    // Sofia Image Analysis (YOLO → Gemini - função mais usada)
    const sofiaImageStart = Date.now();
    const sofiaImageRes = supabaseFunction('sofia-image-analysis', {
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
      userId: 'test-user',
      mealType: 'almoco',
    }, token);
    edgeFnDuration.add(Date.now() - sofiaImageStart);
    aiDuration.add(Date.now() - sofiaImageStart);
    yoloDuration.add(Date.now() - sofiaImageStart);
    
    const sofiaImageSuccess = check(sofiaImageRes, {
      'sofia-image-analysis responds': (r) => r.status === 200 || r.status === 429,
    });
    edgeFnErrorRate.add(!sofiaImageSuccess && sofiaImageRes.status !== 429);
    aiErrorRate.add(!sofiaImageSuccess && sofiaImageRes.status !== 429);
    
    // Analyze Medical Exam (Dr. Vital - usa YOLO)
    const medicalStart = Date.now();
    const medicalRes = supabaseFunction('analyze-medical-exam', {
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
      userId: 'test-user',
    }, token);
    edgeFnDuration.add(Date.now() - medicalStart);
    aiDuration.add(Date.now() - medicalStart);
    
    const medicalSuccess = check(medicalRes, {
      'analyze-medical-exam responds': (r) => r.status === 200 || r.status === 429,
    });
    edgeFnErrorRate.add(!medicalSuccess && medicalRes.status !== 429);
  });
}

// 4. YOLO SERVICE
function testYoloService() {
  group('🦾 YOLO Service', () => {
    // Health check
    const healthStart = Date.now();
    const healthRes = http.get(`${CONFIG.YOLO_URL}/health`);
    yoloDuration.add(Date.now() - healthStart);
    
    const healthSuccess = check(healthRes, {
      'YOLO health check': (r) => r.status === 200,
    });
    yoloErrorRate.add(!healthSuccess);
    
    // Detect endpoint (com imagem de teste)
    const detectStart = Date.now();
    const detectRes = http.post(
      `${CONFIG.YOLO_URL}/detect`,
      JSON.stringify({
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', // Imagem de comida
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    yoloDuration.add(Date.now() - detectStart);
    
    const detectSuccess = check(detectRes, {
      'YOLO detect responds': (r) => r.status === 200 || r.status === 429,
    });
    yoloErrorRate.add(!detectSuccess && detectRes.status !== 429);
    
    // Pose estimation (para exercícios)
    const poseStart = Date.now();
    const poseRes = http.post(
      `${CONFIG.YOLO_URL}/pose`,
      JSON.stringify({
        image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400', // Pessoa exercitando
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
    yoloDuration.add(Date.now() - poseStart);
    
    const poseSuccess = check(poseRes, {
      'YOLO pose responds': (r) => r.status === 200 || r.status === 429 || r.status === 404,
    });
    yoloErrorRate.add(!poseSuccess && poseRes.status !== 429 && poseRes.status !== 404);
  });
}

// 5. OLLAMA SERVICE (LLM Local)
function testOllamaService() {
  group('🤖 Ollama LLM', () => {
    // Health/API check
    const healthStart = Date.now();
    const healthRes = http.get(`${CONFIG.OLLAMA_URL}/api/tags`);
    ollamaDuration.add(Date.now() - healthStart);
    
    const healthSuccess = check(healthRes, {
      'Ollama API responds': (r) => r.status === 200,
    });
    ollamaErrorRate.add(!healthSuccess);
    
    // Generate endpoint (teste simples)
    const generateStart = Date.now();
    const generateRes = http.post(
      `${CONFIG.OLLAMA_URL}/api/generate`,
      JSON.stringify({
        model: 'llama2',
        prompt: 'Olá, teste de carga',
        stream: false,
        options: {
          num_predict: 10, // Limitar tokens para teste rápido
        }
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        timeout: '30s', // Ollama pode demorar
      }
    );
    ollamaDuration.add(Date.now() - generateStart);
    aiDuration.add(Date.now() - generateStart);
    
    const generateSuccess = check(generateRes, {
      'Ollama generate responds': (r) => r.status === 200 || r.status === 429 || r.status === 503,
    });
    ollamaErrorRate.add(!generateSuccess && generateRes.status !== 429 && generateRes.status !== 503);
    aiErrorRate.add(!generateSuccess && generateRes.status !== 429 && generateRes.status !== 503);
  });
}

// 6. MINIO STORAGE
function testMinioService() {
  group('📦 MinIO Storage', () => {
    // Health check (MinIO console)
    const healthStart = Date.now();
    const healthRes = http.get(`${CONFIG.MINIO_URL}/minio/health/live`);
    minioDuration.add(Date.now() - healthStart);
    
    const healthSuccess = check(healthRes, {
      'MinIO health check': (r) => r.status === 200,
    });
    minioErrorRate.add(!healthSuccess);
    
    // Tentar acessar bucket público (se existir)
    const bucketStart = Date.now();
    const bucketRes = http.get(`${CONFIG.MINIO_URL}/images/`);
    minioDuration.add(Date.now() - bucketStart);
    
    // MinIO pode retornar 403 se bucket não for público, isso é OK
    const bucketSuccess = check(bucketRes, {
      'MinIO bucket accessible': (r) => r.status === 200 || r.status === 403 || r.status === 404,
    });
    minioErrorRate.add(!bucketSuccess);
  });
}

// 7. VPS BACKEND (WhatsApp, Tracking, Storage)
function testVPSBackend() {
  group('🖥️ VPS Backend', () => {
    if (!CONFIG.VPS_URL) {
      console.log('⚠️ VPS_URL não configurada - pulando testes VPS');
      return;
    }
    
    const vpsHeaders = {
      'Content-Type': 'application/json',
      'X-API-Key': CONFIG.VPS_API_KEY,
    };
    
    // Health check detalhado
    const healthStart = Date.now();
    const healthRes = http.get(`${CONFIG.VPS_URL}/health/detailed`, {
      headers: vpsHeaders,
    });
    vpsDuration.add(Date.now() - healthStart);
    
    const healthSuccess = check(healthRes, {
      'VPS health check': (r) => r.status === 200,
    });
    vpsErrorRate.add(!healthSuccess);
    
    // Storage list (listar arquivos)
    const storageStart = Date.now();
    const storageRes = http.get(`${CONFIG.VPS_URL}/storage/list/feed?limit=5`, {
      headers: vpsHeaders,
    });
    vpsDuration.add(Date.now() - storageStart);
    
    const storageSuccess = check(storageRes, {
      'VPS storage list': (r) => r.status === 200 || r.status === 401,
    });
    vpsErrorRate.add(!storageSuccess);
    
    // WhatsApp status (se configurado)
    const whatsappStart = Date.now();
    const whatsappRes = http.get(`${CONFIG.VPS_URL}/whatsapp/status`, {
      headers: vpsHeaders,
    });
    whatsappDuration.add(Date.now() - whatsappStart);
    
    const whatsappSuccess = check(whatsappRes, {
      'WhatsApp status': (r) => r.status === 200 || r.status === 401 || r.status === 503,
    });
    whatsappErrorRate.add(!whatsappSuccess);
  });
}

// 5. FRONTEND (páginas estáticas)
function testFrontend() {
  group('🌐 Frontend', () => {
    // Home page
    const homeRes = http.get(CONFIG.APP_URL);
    check(homeRes, {
      'home page loads': (r) => r.status === 200,
    });
    
    // Auth page
    const authRes = http.get(`${CONFIG.APP_URL}/auth`);
    check(authRes, {
      'auth page loads': (r) => r.status === 200,
    });
  });
}

// 7. RPC FUNCTIONS
function testRPCFunctions(token) {
  group('📊 RPC Functions', () => {
    // is_admin_user
    const adminStart = Date.now();
    const adminRes = http.post(
      `${CONFIG.SUPABASE_URL}/rest/v1/rpc/is_admin_user`,
      '{}',
      { headers: getHeaders(token) }
    );
    dbQueryDuration.add(Date.now() - adminStart);
    
    check(adminRes, {
      'is_admin_user works': (r) => r.status === 200,
    });
    
    // get_user_ranking (se existir)
    const rankingStart = Date.now();
    http.post(
      `${CONFIG.SUPABASE_URL}/rest/v1/rpc/get_user_ranking`,
      '{}',
      { headers: getHeaders(token) }
    );
    dbQueryDuration.add(Date.now() - rankingStart);
  });
}

// ============================================================
// FLUXO PRINCIPAL
// ============================================================

export default function () {
  // 1. Testar frontend (sem auth)
  testFrontend();
  sleep(1);
  
  // 2. Testar YOLO (independente de auth) - CRÍTICO
  testYoloService();
  sleep(1);
  
  // 3. Testar Ollama LLM
  testOllamaService();
  sleep(1);
  
  // 4. Testar MinIO Storage
  testMinioService();
  sleep(1);
  
  // 5. Testar VPS Backend (WhatsApp, Tracking)
  testVPSBackend();
  sleep(1);
  
  // 6. Autenticar (se tiver chave configurada)
  let token = null;
  if (CONFIG.SUPABASE_ANON_KEY) {
    token = testAuth();
    sleep(1);
    
    if (token) {
      // 7. Testar queries do banco
      testDatabaseQueries(token);
      sleep(1);
      
      // 8. Testar edge functions
      testEdgeFunctions(token);
      sleep(1);
      
      // 9. Testar RPCs
      testRPCFunctions(token);
      sleep(1);
    }
  }
}

// ============================================================
// SETUP E TEARDOWN
// ============================================================

export function setup() {
  console.log('🚀 Iniciando testes de carga MaxNutrition');
  console.log(`📍 Supabase (Lovable): ${CONFIG.SUPABASE_URL}`);
  console.log(`📍 YOLO: ${CONFIG.YOLO_URL}`);
  console.log(`📍 Ollama: ${CONFIG.OLLAMA_URL}`);
  console.log(`📍 MinIO: ${CONFIG.MINIO_URL}`);
  console.log(`📍 VPS Backend: ${CONFIG.VPS_URL || 'não configurado'}`);
  console.log(`📍 App: ${CONFIG.APP_URL}`);
  
  if (!CONFIG.SUPABASE_ANON_KEY) {
    console.log('⚠️  SUPABASE_ANON_KEY não configurada - usando chave padrão');
  }
  
  // Verificar se serviços estão online
  const yoloHealth = http.get(`${CONFIG.YOLO_URL}/health`);
  const ollamaHealth = http.get(`${CONFIG.OLLAMA_URL}/api/tags`);
  const minioHealth = http.get(`${CONFIG.MINIO_URL}/minio/health/live`);
  
  let vpsOnline = false;
  if (CONFIG.VPS_URL) {
    const vpsHealth = http.get(`${CONFIG.VPS_URL}/health/detailed`, {
      headers: { 'X-API-Key': CONFIG.VPS_API_KEY },
    });
    vpsOnline = vpsHealth.status === 200;
  }
  
  return {
    yoloOnline: yoloHealth.status === 200,
    ollamaOnline: ollamaHealth.status === 200,
    minioOnline: minioHealth.status === 200,
    vpsOnline: vpsOnline,
    hasSupabaseKey: !!CONFIG.SUPABASE_ANON_KEY,
  };
}

export function teardown(data) {
  console.log('✅ Testes de carga finalizados');
  console.log(`📊 YOLO online: ${data.yoloOnline}`);
  console.log(`📊 Ollama online: ${data.ollamaOnline}`);
  console.log(`📊 MinIO online: ${data.minioOnline}`);
  console.log(`📊 VPS Backend online: ${data.vpsOnline}`);
  console.log(`📊 Supabase key configurada: ${data.hasSupabaseKey}`);
}
