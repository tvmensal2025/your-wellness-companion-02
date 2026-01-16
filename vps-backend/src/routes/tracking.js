/**
 * Tracking Routes - Registro de peso, água, refeições
 */

import express from 'express';
import { 
  recordWeight, 
  recordWater, 
  recordMood,
  getLastWeight,
  getTodayWater,
  getUserById
} from '../services/supabase.js';
import { sendMessage, templates } from '../services/whatsapp.js';

const router = express.Router();

// ===========================================
// POST /tracking/weight
// Registrar peso
// ===========================================
router.post('/weight', async (req, res) => {
  try {
    const { userId, weightKg, notes, notifyWhatsApp } = req.body;
    
    if (!userId || !weightKg) {
      return res.status(400).json({ error: 'userId e weightKg são obrigatórios' });
    }
    
    // Buscar último peso para calcular diferença
    const lastWeight = await getLastWeight(userId);
    const diff = lastWeight ? weightKg - lastWeight.weight_kg : 0;
    
    // Registrar
    const result = await recordWeight(userId, weightKg, notes);
    
    // Notificar via WhatsApp se solicitado
    if (notifyWhatsApp) {
      const user = await getUserById(userId);
      if (user?.phone) {
        const template = templates.weightConfirmation(weightKg, diff);
        await sendMessage(user.phone, template.message);
      }
    }
    
    res.json({
      success: true,
      data: result,
      previousWeight: lastWeight?.weight_kg,
      diff
    });
  } catch (error) {
    console.error('Erro ao registrar peso:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// GET /tracking/weight/:userId
// Buscar histórico de peso
// ===========================================
router.get('/weight/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const { getSupabase } = await import('../services/supabase.js');
    const db = getSupabase();
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const { data, error } = await db
      .from('weight_measurements')
      .select('weight_kg, measurement_date, notes')
      .eq('user_id', userId)
      .gte('measurement_date', startDate.toISOString().split('T')[0])
      .order('measurement_date', { ascending: true });
    
    if (error) throw error;
    
    res.json({
      success: true,
      userId,
      days: parseInt(days),
      count: data.length,
      measurements: data
    });
  } catch (error) {
    console.error('Erro ao buscar peso:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// POST /tracking/water
// Registrar água
// ===========================================
router.post('/water', async (req, res) => {
  try {
    const { userId, amountMl, notifyWhatsApp } = req.body;
    
    if (!userId || !amountMl) {
      return res.status(400).json({ error: 'userId e amountMl são obrigatórios' });
    }
    
    const result = await recordWater(userId, amountMl);
    
    // Notificar via WhatsApp se solicitado
    if (notifyWhatsApp) {
      const user = await getUserById(userId);
      if (user?.phone) {
        const template = templates.waterConfirmation(amountMl, result.total, 2500);
        await sendMessage(user.phone, template.message);
      }
    }
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Erro ao registrar água:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// GET /tracking/water/:userId
// Buscar água do dia
// ===========================================
router.get('/water/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const total = await getTodayWater(userId);
    const goal = 2500;
    const percent = Math.round((total / goal) * 100);
    
    res.json({
      success: true,
      userId,
      total,
      goal,
      percent,
      remaining: Math.max(0, goal - total)
    });
  } catch (error) {
    console.error('Erro ao buscar água:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// POST /tracking/mood
// Registrar humor/energia
// ===========================================
router.post('/mood', async (req, res) => {
  try {
    const { userId, energyLevel, moodLevel } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' });
    }
    
    const result = await recordMood(
      userId, 
      energyLevel || 3, 
      moodLevel || 3
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Erro ao registrar humor:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// GET /tracking/summary/:userId
// Resumo do dia
// ===========================================
router.get('/summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { getSupabase } = await import('../services/supabase.js');
    const db = getSupabase();
    const today = new Date().toISOString().split('T')[0];
    
    // Buscar tracking do dia
    const { data: tracking } = await db
      .from('advanced_daily_tracking')
      .select('*')
      .eq('user_id', userId)
      .eq('tracking_date', today)
      .single();
    
    // Buscar peso mais recente
    const lastWeight = await getLastWeight(userId);
    
    // Buscar refeições do dia
    const { data: meals } = await db
      .from('food_analysis')
      .select('meal_type, calories, protein_g, carbs_g, fat_g')
      .eq('user_id', userId)
      .eq('status', 'confirmed')
      .gte('created_at', today);
    
    // Calcular totais
    const totalCalories = meals?.reduce((sum, m) => sum + (m.calories || 0), 0) || 0;
    const totalProtein = meals?.reduce((sum, m) => sum + (m.protein_g || 0), 0) || 0;
    const totalCarbs = meals?.reduce((sum, m) => sum + (m.carbs_g || 0), 0) || 0;
    const totalFat = meals?.reduce((sum, m) => sum + (m.fat_g || 0), 0) || 0;
    
    res.json({
      success: true,
      date: today,
      water: {
        total: tracking?.water_ml || 0,
        goal: 2500,
        percent: Math.round(((tracking?.water_ml || 0) / 2500) * 100)
      },
      weight: lastWeight ? {
        current: lastWeight.weight_kg,
        date: lastWeight.measurement_date
      } : null,
      mood: {
        energy: tracking?.energy_level || null,
        mood: tracking?.mood_level || null
      },
      nutrition: {
        meals: meals?.length || 0,
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      },
      sleep: {
        hours: tracking?.sleep_hours || null,
        quality: tracking?.sleep_quality || null
      },
      steps: tracking?.steps || 0
    });
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
