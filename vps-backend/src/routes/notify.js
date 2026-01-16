/**
 * Notify Routes - Notificações e lembretes
 */

import express from 'express';
import { sendMessage, sendButtons, templates } from '../services/whatsapp.js';
import { getUserById, getUserByPhone, getTodayWater, getLastWeight } from '../services/supabase.js';

const router = express.Router();

// ===========================================
// POST /notify/send
// Enviar notificação imediata
// ===========================================
router.post('/send', async (req, res) => {
  try {
    const { userId, phone, type, data } = req.body;
    
    // Buscar telefone se não fornecido
    let targetPhone = phone;
    if (!targetPhone && userId) {
      const user = await getUserById(userId);
      targetPhone = user?.phone;
    }
    
    if (!targetPhone) {
      return res.status(400).json({ error: 'Telefone não encontrado' });
    }
    
    const user = await getUserByPhone(targetPhone);
    const name = user?.full_name?.split(' ')[0] || 'Amigo';
    
    let template;
    
    switch (type) {
      case 'water_reminder':
        const currentWater = user?.id ? await getTodayWater(user.id) : 0;
        template = templates.waterReminder(name, currentWater, data?.goal || 2500);
        break;
        
      case 'weight_reminder':
        const lastWeight = user?.id ? await getLastWeight(user.id) : null;
        const daysSince = lastWeight 
          ? Math.floor((Date.now() - new Date(lastWeight.measurement_date)) / (1000 * 60 * 60 * 24))
          : 0;
        template = templates.weightReminder(name, lastWeight?.weight_kg, daysSince);
        break;
        
      case 'good_morning':
        template = templates.goodMorning(name);
        break;
        
      case 'custom':
        if (!data?.message) {
          return res.status(400).json({ error: 'Mensagem não fornecida' });
        }
        template = { message: data.message, buttons: data.buttons };
        break;
        
      default:
        return res.status(400).json({ error: 'Tipo de notificação inválido' });
    }
    
    // Enviar
    if (template.buttons) {
      await sendButtons(targetPhone, template.message, template.buttons);
    } else {
      await sendMessage(targetPhone, template.message);
    }
    
    res.json({ success: true, type, phone: targetPhone });
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// POST /notify/broadcast
// Enviar para múltiplos usuários
// ===========================================
router.post('/broadcast', async (req, res) => {
  try {
    const { phones, type, data, delayMs = 1000 } = req.body;
    
    if (!phones || !Array.isArray(phones) || phones.length === 0) {
      return res.status(400).json({ error: 'Lista de telefones é obrigatória' });
    }
    
    const results = {
      success: [],
      failed: []
    };
    
    for (const phone of phones) {
      try {
        const user = await getUserByPhone(phone);
        const name = user?.full_name?.split(' ')[0] || 'Amigo';
        
        let template;
        
        switch (type) {
          case 'water_reminder':
            const currentWater = user?.id ? await getTodayWater(user.id) : 0;
            template = templates.waterReminder(name, currentWater, data?.goal || 2500);
            break;
            
          case 'good_morning':
            template = templates.goodMorning(name);
            break;
            
          case 'custom':
            template = { message: data.message, buttons: data.buttons };
            break;
            
          default:
            template = { message: data?.message || 'Olá!' };
        }
        
        if (template.buttons) {
          await sendButtons(phone, template.message, template.buttons);
        } else {
          await sendMessage(phone, template.message);
        }
        
        results.success.push(phone);
        
        // Delay entre mensagens
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        results.failed.push({ phone, error: error.message });
      }
    }
    
    res.json({
      success: true,
      total: phones.length,
      sent: results.success.length,
      failed: results.failed.length,
      results
    });
  } catch (error) {
    console.error('Erro no broadcast:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// GET /notify/status
// Status dos cron jobs
// ===========================================
router.get('/status', (req, res) => {
  res.json({
    success: true,
    cronJobs: {
      waterReminder: {
        schedule: '0 9,12,15,18 * * *',
        description: 'Lembrete de água às 9h, 12h, 15h, 18h'
      },
      weightReminder: {
        schedule: '0 8 * * 1',
        description: 'Lembrete de peso toda segunda às 8h'
      },
      goodMorning: {
        schedule: '0 7 * * *',
        description: 'Bom dia todos os dias às 7h'
      },
      dailySummary: {
        schedule: '0 21 * * *',
        description: 'Resumo do dia às 21h'
      }
    },
    timezone: 'America/Sao_Paulo'
  });
});

export default router;
