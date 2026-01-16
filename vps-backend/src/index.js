/**
 * MaxNutrition VPS Backend
 * 
 * Responsabilidades:
 * - Storage de mídia (MinIO)
 * - WhatsApp (envio/recebimento)
 * - Notificações agendadas (cron)
 * - Tracking (peso, água, refeições)
 * - Processamento de imagens
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

// Rotas
import storageRoutes from './routes/storage.js';
import whatsappRoutes from './routes/whatsapp.js';
import trackingRoutes from './routes/tracking.js';
import notifyRoutes from './routes/notify.js';
import healthRoutes from './routes/health.js';

// Serviços
import { initMinIO } from './services/minio.js';
import { initCronJobs } from './services/cron.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// Middlewares
// ===========================================

// Segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS - permitir Lovable Cloud
app.use(cors({
  origin: [
    'https://lovable.dev',
    'https://*.lovable.app',
    'https://*.supabase.co',
    /\.lovable\.app$/,
    /localhost/
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Muitas requisições, tente novamente em 1 minuto' }
});
app.use(limiter);

// Parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging
app.use(morgan('combined'));

// Autenticação simples via API Key
app.use((req, res, next) => {
  // Rotas públicas
  const publicPaths = ['/health', '/images'];
  if (publicPaths.some(p => req.path.startsWith(p))) {
    return next();
  }
  
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'API Key inválida' });
  }
  next();
});

// ===========================================
// Rotas
// ===========================================

app.use('/storage', storageRoutes);
app.use('/whatsapp', whatsappRoutes);
app.use('/tracking', trackingRoutes);
app.use('/notify', notifyRoutes);
app.use('/health', healthRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'MaxNutrition VPS Backend',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      storage: '/storage',
      whatsapp: '/whatsapp',
      tracking: '/tracking',
      notify: '/notify',
      health: '/health'
    }
  });
});

// ===========================================
// Inicialização
// ===========================================

async function start() {
  try {
    // Inicializar MinIO
    await initMinIO();
    console.log('✅ MinIO conectado');
    
    // Inicializar Cron Jobs
    initCronJobs();
    console.log('✅ Cron jobs iniciados');
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 MaxNutrition Backend rodando na porta ${PORT}`);
      console.log(`📦 Storage: ${process.env.MINIO_PUBLIC_URL}`);
      console.log(`📱 WhatsApp: ${process.env.EVOLUTION_API_URL || process.env.WHAPI_API_URL}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar:', error);
    process.exit(1);
  }
}

start();
