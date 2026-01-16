/**
 * Cron Jobs - Tarefas agendadas
 */

import cron from 'node-cron';
import { sendMessage, sendButtons, templates } from './whatsapp.js';
import { 
  getUsersForWaterReminder, 
  getUsersForWeightReminder,
  getLastWeight,
  getTodayWater
} from './supabase.js';

export function initCronJobs() {
  console.log('⏰ Iniciando cron jobs...');
  
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
        
        await sendButtons(user.phone, template.message, template.buttons);
        
        // Delay para não sobrecarregar
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
        
        const lastWeight = await getLastWeight(user.id);
        const daysSince = lastWeight 
          ? Math.floor((Date.now() - new Date(lastWeight.measurement_date)) / (1000 * 60 * 60 * 24))
          : 0;
        
        const template = templates.weightReminder(
          user.full_name?.split(' ')[0] || 'Amigo',
          lastWeight?.weight_kg,
          daysSince
        );
        
        await sendButtons(user.phone, template.message, template.buttons);
        
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
      // Buscar usuários ativos (que interagiram nos últimos 7 dias)
      // Por enquanto, simplificado
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
      // TODO: Implementar resumo diário
      console.log('📊 Resumo enviado');
    } catch (error) {
      console.error('❌ Erro no resumo:', error);
    }
  }, {
    timezone: 'America/Sao_Paulo'
  });
  
  console.log('✅ Cron jobs configurados:');
  console.log('   💧 Água: 9h, 12h, 15h, 18h');
  console.log('   ⚖️ Peso: Segunda 8h');
  console.log('   ☀️ Bom dia: 7h');
  console.log('   📊 Resumo: 21h');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
