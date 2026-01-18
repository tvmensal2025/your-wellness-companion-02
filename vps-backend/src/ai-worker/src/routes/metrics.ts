import { Router } from 'express';
import { metrics } from '../utils/metrics.js';

export const metricsRouter = Router();

metricsRouter.get('/', async (req, res) => {
  try {
    res.set('Content-Type', metrics.register.contentType);
    const metricsData = await metrics.register.metrics();
    res.send(metricsData);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
