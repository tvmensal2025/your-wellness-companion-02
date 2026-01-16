/**
 * Health Routes - Status e monitoramento
 */

import express from 'express';
import { getMinioClient } from '../services/minio.js';
import { getSupabase } from '../services/supabase.js';

const router = express.Router();

// ===========================================
// GET /health
// Health check básico
// ===========================================
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// ===========================================
// GET /health/detailed
// Health check detalhado
// ===========================================
router.get('/detailed', async (req, res) => {
  const checks = {
    server: { status: 'ok' },
    minio: { status: 'unknown' },
    supabase: { status: 'unknown' },
    whatsapp: { status: 'unknown' }
  };
  
  // Verificar MinIO
  try {
    const client = getMinioClient();
    const bucket = process.env.MINIO_BUCKET || 'images';
    await client.bucketExists(bucket);
    checks.minio = { status: 'ok', bucket };
  } catch (error) {
    checks.minio = { status: 'error', error: error.message };
  }
  
  // Verificar Supabase
  try {
    const db = getSupabase();
    const { error } = await db.from('profiles').select('id').limit(1);
    if (error) throw error;
    checks.supabase = { status: 'ok' };
  } catch (error) {
    checks.supabase = { status: 'error', error: error.message };
  }
  
  // Verificar WhatsApp
  try {
    const provider = process.env.EVOLUTION_API_URL ? 'evolution' : 
                     process.env.WHAPI_API_URL ? 'whapi' : 'none';
    checks.whatsapp = { status: provider !== 'none' ? 'ok' : 'not_configured', provider };
  } catch (error) {
    checks.whatsapp = { status: 'error', error: error.message };
  }
  
  // Status geral
  const allOk = Object.values(checks).every(c => c.status === 'ok');
  
  res.status(allOk ? 200 : 503).json({
    status: allOk ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks
  });
});

// ===========================================
// GET /health/metrics
// Métricas do sistema
// ===========================================
router.get('/metrics', (req, res) => {
  const mem = process.memoryUsage();
  
  res.json({
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      rss: formatBytes(mem.rss),
      heapTotal: formatBytes(mem.heapTotal),
      heapUsed: formatBytes(mem.heapUsed),
      external: formatBytes(mem.external)
    },
    cpu: process.cpuUsage(),
    pid: process.pid,
    nodeVersion: process.version,
    platform: process.platform
  });
});

function formatBytes(bytes) {
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(2)} MB`;
}

export default router;
