/**
 * Cron Jobs - Tarefas agendadas
 * Sistema centralizado de notificações via WhatsApp
 */

import cron from 'node-cron';
import axios from 'axios';
import { sendMessage, sendButtons, templates } from './whatsapp.js';
import { 
  getUsersForWaterReminder, 
  getUsersForWeightReminder,
  getLastWeight,
  getTodayWater,
  getPendingNotifications,
  markNotificationSent,
  markNotificationFailed,
  getUserById,
  getUsersWithPhone
} from './supabase.js';

export function initCronJobs() {
  console.log('⏰ Iniciando cron jobs...');
  
  // ===========================================
  // PRINCIPAL: Processar fila de notificações - A cada 5 minutos
  // ===========================================
  cron.schedule('*/5 * * * *', async () => {
    console.log('📬 Processando fila de notificações...');
    
    try {
      const notifications = await getPendingNotifications(50);
      console.log(`📬 ${notifications.length} notificações para processar`);
      
      let sent = 0;
      let failed = 0;
      
      for (const notification of notifications) {
        try {
          const user = await getUserById(notification.user_id);
          
          if (!user?.phone) {
            await markNotificationFailed(notification.id, 'Usuário sem telefone');
            failed++;
            continue;
          }
          
          const name = user.full_name?.split(' ')[0] || 'Amigo';
          const message = formatNotificationMessage(notification, name);
          
          await sendMessage(user.phone, message);
          await markNotificationSent(notification.id, 'whatsapp');
          sent++;
          
          // Delay para não sobrecarregar
          await sleep(500);
          
        } catch (error) {
          console.error(`❌ Erro na notificação ${notification.id}:`, error.message);
          await markNotificationFailed(notification.id, error.message);
          failed++;
        }
      }
      
      if (notifications.length > 0) {
        console.log(`✅ Fila processada: ${sent} enviadas, ${failed} falhas`);
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar fila:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo'
  });
  
  // ===========================================
  // Lembrete de água - A cada 3 horas (9h, 12h, 15h, 18h)
  // ===========================================
  cron.schedule('0 9,12,15,18 * * *', async () => {
    console.log('💧 Executando lembrete de água...');
    
    try {
      const users = await getUsersForWaterReminder();
      console.log(`💧 ${users.length} usuários para lembrar`);
      
      for (const user of users) {
        if (!user.phone) continue;
        
        const currentWater = user.advanced_daily_tracking?.[0]?.water_ml || 0;
        const template = templates.waterReminder(
          user.full_name?.split(' ')[0] || 'Amigo',
          currentWater,
          2500
        );
        
        try {
          await sendButtons(user.phone, template.message, template.buttons);
        } catch (error) {
          console.error(`❌ Erro ao enviar para ${user.phone}:`, error.message);
        }
        
        await sleep(1000);
      }
      
      console.log('💧 Lembretes de água enviados');
    } catch (error) {
      console.error('❌ Erro no lembrete de água:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo'
  });
  
  // ===========================================
  // Lembrete de peso - Segunda-feira 8h
  // ===========================================
  cron.schedule('0 8 * * 1', async () => {
    console.log('⚖️ Executando lembrete de peso semanal...');
    
    try {
      const users = await getUsersForWeightReminder();
      console.log(`⚖️ ${users.length} usuários para lembrar`);
      
      for (const user of users) {
        if (!user.phone) continue;
        
        const userId = user.user_id || user.id;
        const lastWeight = await getLastWeight(userId);
        const daysSince = lastWeight 
          ? Math.floor((Date.now() - new Date(lastWeight.measurement_date)) / (1000 * 60 * 60 * 24))
          : 0;
        
        const template = templates.weightReminder(
          user.full_name?.split(' ')[0] || 'Amigo',
          lastWeight?.weight_kg,
          daysSince
        );
        
        try {
          await sendButtons(user.phone, template.message, template.buttons);
        } catch (error) {
          console.error(`❌ Erro ao enviar para ${user.phone}:`, error.message);
        }
        
        await sleep(1000);
      }
      
      console.log('⚖️ Lembretes de peso enviados');
    } catch (error) {
      console.error('❌ Erro no lembrete de peso:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo'
  });
  
  // ===========================================
  // Bom dia - Todos os dias 7h
  // ===========================================
  cron.schedule('0 7 * * *', async () => {
    console.log('☀️ Enviando bom dia...');
    
    try {
      const users = await getUsersWithPhone(500);
      console.log(`☀️ ${users.length} usuários ativos`);
      
      for (const user of users) {
        if (!user.phone) continue;
        
        const template = templates.goodMorning(
          user.full_name?.split(' ')[0] || 'Amigo'
        );
        
        try {
          await sendButtons(user.phone, template.message, template.buttons);
        } catch (error) {
          console.error(`❌ Erro ao enviar para ${user.phone}:`, error.message);
        }
        
        await sleep(1000);
      }
      
      console.log('☀️ Bom dia enviado');
    } catch (error) {
      console.error('❌ Erro no bom dia:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo'
  });
  
  // ===========================================
  // Resumo do dia - Todos os dias 21h
  // ===========================================
  cron.schedule('0 21 * * *', async () => {
    console.log('📊 Enviando resumo do dia...');
    
    try {
      const users = await getUsersWithPhone(500);
      console.log(`📊 ${users.length} usuários para resumo`);
      
      for (const user of users) {
        if (!user.phone) continue;
        
        const userId = user.user_id || user.id;
        const water = await getTodayWater(userId);
        
        const template = templates.dailySummary(
          user.full_name?.split(' ')[0] || 'Amigo',
          {
            water: water || 0,
            steps: 0, // TODO: integrar com tracking
            calories: 0,
            mood: '-',
            message: water >= 2000 
              ? 'Parabéns pela hidratação! 🎉' 
              : 'Lembre-se de beber mais água amanhã!'
          }
        );
        
        try {
          await sendMessage(user.phone, template.message);
        } catch (error) {
          console.error(`❌ Erro ao enviar para ${user.phone}:`, error.message);
        }
        
        await sleep(1000);
      }
      
      console.log('📊 Resumo enviado');
    } catch (error) {
      console.error('❌ Erro no resumo:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo'
  });
  
  console.log('✅ Cron jobs configurados:');
  console.log('   📬 Fila de notificações: a cada 5 minutos');
  console.log('   💧 Água: 9h, 12h, 15h, 18h');
  console.log('   ⚖️ Peso: Segunda 8h');
  console.log('   ☀️ Bom dia: 7h');
  console.log('   📊 Resumo: 21h');
}

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
  
  if (action_url) {
    message += `\n\n📱 Acesse o app para mais detalhes!`;
  }
  
  return message;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
