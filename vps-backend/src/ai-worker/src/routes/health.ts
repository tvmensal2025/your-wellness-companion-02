import { Router } from 'express';

export const healthRouter = Router();

healthRouter.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

healthRouter.get('/detailed', async (req, res) => {
  // This will be populated by the worker instance
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    worker: {
      id: process.env.WORKER_ID || 'worker-1',
      concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5'),
      activeJobs: 0, // Will be updated by worker
      queueSize: 0 // Will be updated by worker
    },
    services: {
      yolo: process.env.YOLO_URL || 'not configured',
      ollama: process.env.OLLAMA_URL || 'not configured',
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not configured'
    }
  });
});
