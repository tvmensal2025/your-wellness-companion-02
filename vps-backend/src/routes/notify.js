/**
 * Notify Routes - Notificações e lembretes via WhatsApp
 * Sistema centralizado de notificações
 */

import express from 'express';
import { sendMessage, sendButtons, templates } from '../services/whatsapp.js';
import { 
  getUserById, 
  getUserByPhone, 
  getTodayWater, 
  getLastWeight,
  getPendingNotifications,
  markNotificationSent,
  markNotificationFailed,
  getUsersWithPhone
} from '../services/supabase.js';

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
// POST /notify/process
// Processar fila de notificações unificada
// ===========================================
router.post('/process', async (req, res) => {
  try {
    const { limit = 50 } = req.body;
    
    // Buscar notificações pendentes
    const notifications = await getPendingNotifications(limit);
    
    console.log(`📬 ${notifications.length} notificações para processar`);
    
    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      noPhone: 0,
      errors: []
    };
    
    for (const notification of notifications) {
      results.processed++;
      
      try {
        // Buscar dados do usuário
        const user = await getUserById(notification.user_id);
        
        if (!user?.phone) {
          results.noPhone++;
          await markNotificationFailed(notification.id, 'Usuário sem telefone');
          continue;
        }
        
        const name = user.full_name?.split(' ')[0] || 'Amigo';
        
        // Formatar mensagem baseada na categoria
        const message = formatNotificationMessage(notification, name);
        
        // Enviar via WhatsApp
        await sendMessage(user.phone, message);
        
        // Marcar como enviada
        await markNotificationSent(notification.id, 'whatsapp');
        results.sent++;
        
        // Delay entre mensagens para não sobrecarregar
        await sleep(500);
        
      } catch (error) {
        results.failed++;
        results.errors.push({ id: notification.id, error: error.message });
        await markNotificationFailed(notification.id, error.message);
      }
    }
    
    console.log(`✅ Processamento concluído: ${results.sent} enviadas, ${results.failed} falhas`);
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('Erro ao processar fila:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// GET /notify/pending/:userId
// Buscar notificações pendentes do usuário
// ===========================================
router.get('/pending/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await getPendingNotifications(50, userId);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Erro ao buscar pendentes:', error);
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
// Status dos cron jobs e fila
// ===========================================
router.get('/status', async (req, res) => {
  try {
    const pendingCount = await getPendingNotifications(1000);
    
    res.json({
      success: true,
      queue: {
        pending: pendingCount.length
      },
      cronJobs: {
        notificationProcessor: {
          schedule: '*/5 * * * *',
          description: 'Processa fila de notificações a cada 5 minutos'
        },
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// HELPERS
// ===========================================

function formatNotificationMessage(notification, name) {
  const { category, title, body, action_url } = notification;
  
  // Emojis por categoria
  const categoryEmojis = {
    general: '🔔',
    dr_vital: '👨‍⚕️',
    exercise: '💪',
    community: '👥',
    water: '💧',
    weight: '⚖️',
    achievement: '🏆',
    session: '🧘',
    reminder: '⏰',
    tip: '💡',
    health: '❤️',
    alert: '⚠️',
    system: '📱'
  };
  
  const emoji = categoryEmojis[category] || '🔔';
  
  // Montar mensagem
  let message = `${emoji} *${title}*\n\n`;
  message += `Olá ${name}!\n\n`;
  message += body;
  
  // Adicionar call to action se houver URL
  if (action_url) {
    message += `\n\n📱 Acesse o app para mais detalhes!`;
  }
  
  return message;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default router;
