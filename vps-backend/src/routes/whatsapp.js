/**
 * WhatsApp Routes - Envio e recebimento de mensagens
 */

import express from 'express';
import { sendMessage, sendButtons, sendImage, templates } from '../services/whatsapp.js';
import { 
  getUserByPhone, 
  recordWeight, 
  recordWater, 
  recordMood,
  getLastWeight,
  getTodayWater,
  getPendingAnalysis,
  confirmAnalysis
} from '../services/supabase.js';

const router = express.Router();

// ===========================================
// POST /whatsapp/send
// Enviar mensagem de texto
// ===========================================
router.post('/send', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!phone || !message) {
      return res.status(400).json({ error: 'phone e message são obrigatórios' });
    }
    
    const result = await sendMessage(phone, message);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// POST /whatsapp/buttons
// Enviar mensagem com botões
// ===========================================
router.post('/buttons', async (req, res) => {
  try {
    const { phone, message, buttons } = req.body;
    
    if (!phone || !message || !buttons) {
      return res.status(400).json({ error: 'phone, message e buttons são obrigatórios' });
    }
    
    const result = await sendButtons(phone, message, buttons);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao enviar botões:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// POST /whatsapp/image
// Enviar imagem
// ===========================================
router.post('/image', async (req, res) => {
  try {
    const { phone, imageUrl, caption } = req.body;
    
    if (!phone || !imageUrl) {
      return res.status(400).json({ error: 'phone e imageUrl são obrigatórios' });
    }
    
    const result = await sendImage(phone, imageUrl, caption);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Erro ao enviar imagem:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// POST /whatsapp/template
// Enviar template pré-definido
// ===========================================
router.post('/template', async (req, res) => {
  try {
    const { phone, templateType, data } = req.body;
    
    if (!phone || !templateType) {
      return res.status(400).json({ error: 'phone e templateType são obrigatórios' });
    }
    
    const user = await getUserByPhone(phone);
    const name = user?.full_name?.split(' ')[0] || 'Amigo';
    
    let template;
    
    switch (templateType) {
      case 'water_reminder':
        const currentWater = await getTodayWater(user?.id);
        template = templates.waterReminder(name, currentWater, data?.goal || 2500);
        break;
        
      case 'weight_reminder':
        const lastWeight = user?.id ? await getLastWeight(user.id) : null;
        const daysSince = lastWeight 
          ? Math.floor((Date.now() - new Date(lastWeight.measurement_date)) / (1000 * 60 * 60 * 24))
          : 0;
        template = templates.weightReminder(name, lastWeight?.weight_kg, daysSince);
        break;
        
      case 'weight_confirmation':
        template = templates.weightConfirmation(data.weight, data.diff || 0);
        break;
        
      case 'water_confirmation':
        template = templates.waterConfirmation(data.added, data.total, data.goal || 2500);
        break;
        
      case 'good_morning':
        template = templates.goodMorning(name);
        break;
        
      case 'food_confirmed':
        template = templates.foodConfirmed(
          data.calories,
          data.protein,
          data.carbs,
          data.fat
        );
        break;
        
      default:
        return res.status(400).json({ error: 'Template não encontrado' });
    }
    
    // Enviar mensagem
    if (template.buttons) {
      await sendButtons(phone, template.message, template.buttons);
    } else {
      await sendMessage(phone, template.message);
    }
    
    res.json({ success: true, template: templateType });
  } catch (error) {
    console.error('Erro ao enviar template:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// POST /whatsapp/webhook
// Receber webhook do WhatsApp (Evolution/Whapi)
// ===========================================
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    console.log('📱 Webhook recebido:', JSON.stringify(payload).substring(0, 500));
    
    // Detectar provider
    const isEvolution = payload.event || payload.instance;
    const isWhapi = payload.messages || payload.statuses;
    
    if (isEvolution) {
      await handleEvolutionWebhook(payload);
    } else if (isWhapi) {
      await handleWhapiWebhook(payload);
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Erro no webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// ===========================================
// Handlers de Webhook
// ===========================================

async function handleEvolutionWebhook(payload) {
  const event = payload.event;
  const data = payload.data;
  
  if (event !== 'messages.upsert' || !data) return;
  
  const message = data.message || data;
  const phone = message.key?.remoteJid?.replace('@s.whatsapp.net', '');
  
  if (!phone) return;
  
  // Verificar se é resposta de botão
  if (message.message?.buttonsResponseMessage) {
    const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
    await handleButtonResponse(phone, buttonId);
    return;
  }
  
  // Verificar se é texto (pode ser peso ou água)
  const text = message.message?.conversation || 
               message.message?.extendedTextMessage?.text;
  
  if (text) {
    await handleTextMessage(phone, text.trim());
  }
}

async function handleWhapiWebhook(payload) {
  const messages = payload.messages || [];
  
  for (const message of messages) {
    const phone = message.from?.replace('@s.whatsapp.net', '') || 
                  message.chat_id?.replace('@s.whatsapp.net', '');
    
    if (!phone) continue;
    
    // Resposta de botão
    if (message.type === 'interactive' && message.interactive?.button_reply) {
      const buttonId = message.interactive.button_reply.id;
      await handleButtonResponse(phone, buttonId);
      continue;
    }
    
    // Texto
    if (message.type === 'text') {
      const text = message.text?.body || message.body;
      if (text) {
        await handleTextMessage(phone, text.trim());
      }
    }
  }
}

// ===========================================
// Handlers de Ações
// ===========================================

async function handleButtonResponse(phone, buttonId) {
  console.log(`🔘 Botão: ${buttonId} de ${phone}`);
  
  const user = await getUserByPhone(phone);
  if (!user) {
    await sendMessage(phone, '❌ Usuário não encontrado. Por favor, cadastre-se no app.');
    return;
  }
  
  switch (buttonId) {
    // Água
    case 'water_250ml':
      const water250 = await recordWater(user.id, 250);
      const template250 = templates.waterConfirmation(250, water250.total, 2500);
      await sendMessage(phone, template250.message);
      break;
      
    case 'water_500ml':
      const water500 = await recordWater(user.id, 500);
      const template500 = templates.waterConfirmation(500, water500.total, 2500);
      await sendMessage(phone, template500.message);
      break;
      
    case 'water_not_yet':
      await sendMessage(phone, '⏰ Ok! Vou te lembrar mais tarde. Não esqueça de se hidratar! 💧');
      break;
      
    // Peso
    case 'weigh_now':
      await sendMessage(phone, '⚖️ Digite seu peso atual (ex: 75.5):');
      break;
      
    case 'weigh_later':
      await sendMessage(phone, '⏰ Ok! Vou te lembrar amanhã. Não esqueça de se pesar! ⚖️');
      break;
      
    case 'weigh_view_evolution':
      // TODO: Enviar gráfico de evolução
      await sendMessage(phone, '📊 Funcionalidade em desenvolvimento!');
      break;
      
    // Humor
    case 'feeling_great':
      await recordMood(user.id, 5, 5);
      await sendMessage(phone, '😊 Que ótimo! Continue assim! Tenha um excelente dia! ☀️');
      break;
      
    case 'feeling_ok':
      await recordMood(user.id, 3, 3);
      await sendMessage(phone, '😐 Entendi! Espero que seu dia melhore. Estou aqui se precisar! 💪');
      break;
      
    case 'feeling_bad':
      await recordMood(user.id, 1, 1);
      await sendMessage(phone, '😔 Sinto muito que não esteja bem. Lembre-se: dias difíceis passam. Cuide-se! ❤️');
      break;
      
    // Análise de alimento
    case 'sofia_confirm':
    case 'confirm_analysis':
      const analysis = await getPendingAnalysis(user.id);
      if (analysis) {
        await confirmAnalysis(analysis.id);
        await sendMessage(phone, '✅ Refeição confirmada e registrada!');
      }
      break;
      
    // Medicação
    case 'med_taken':
      await sendMessage(phone, '✅ Ótimo! Medicação registrada. Continue cuidando da sua saúde! 💊');
      break;
      
    case 'med_later':
      await sendMessage(phone, '⏰ Ok! Vou te lembrar novamente em 30 minutos. Não esqueça! 💊');
      break;
      
    // Desafios
    case 'accept_challenge':
      await sendMessage(phone, '🎯 Desafio aceito! Boa sorte! Você consegue! 💪');
      break;
      
    case 'decline_challenge':
      await sendMessage(phone, '👍 Tudo bem! Quando estiver pronto, te aviso de novos desafios.');
      break;
      
    // Treino
    case 'start_workout':
      await sendMessage(phone, '💪 Bora treinar! Registre seu treino no app quando terminar. Você consegue! 🏋️');
      break;
      
    case 'skip_today':
      await sendMessage(phone, '⏰ Ok! Descanse hoje, mas amanhã voltamos com tudo! 💪');
      break;
      
    // Missões do dia
    case 'start_missions':
      await sendMessage(phone, '🎯 Vamos lá! Suas missões te esperam no app. Abra e comece agora! 🚀');
      break;
      
    case 'view_app':
      await sendMessage(phone, '📱 Abra o app MaxNutrition para ver todos os detalhes!');
      break;
      
    // Re-engagement
    case 'return_now':
      await sendMessage(phone, '🎉 Que bom ter você de volta! Abra o app e continue sua jornada de saúde! 💪');
      break;
      
    case 'remind_later':
      await sendMessage(phone, '⏰ Ok! Vou te lembrar amanhã. Não desista dos seus objetivos! 🌟');
      break;
      
    // Ver relatório
    case 'view_report':
      await sendMessage(phone, '📊 Acesse o app para ver seu relatório semanal completo! 📱');
      break;
      
    // Menu
    case 'menu':
      const template = templates.goodMorning(user?.full_name?.split(' ')[0] || 'Amigo');
      if (template.buttons) {
        await sendButtons(phone, '📋 *Menu Principal*\n\nO que deseja fazer hoje?', [
          { id: 'water_250ml', text: '💧 +250ml Água' },
          { id: 'weigh_now', text: '⚖️ Pesar' },
          { id: 'start_missions', text: '🎯 Missões' }
        ]);
      } else {
        await sendMessage(phone, '📋 Menu disponível no app!');
      }
      break;
      
    // Help
    case 'help':
      await sendMessage(phone, 
        '👋 *Olá! Como posso ajudar?*\n\n' +
        '📸 *Enviar foto de refeição* → Analiso calorias\n' +
        '🩺 *Enviar foto de exame* → Analiso resultados\n' +
        '💧 *Registrar água* → Responda "água 250ml"\n' +
        '⚖️ *Registrar peso* → Envie o número (ex: 75.5)\n\n' +
        '_Sofia 🥗 | Dr. Vital 🩺_'
      );
      break;
      
    default:
      console.log(`⚠️ Botão desconhecido: ${buttonId}`);
      // Notificar que não reconheceu
      await sendMessage(phone, '🤔 Não reconheci esse comando. Digite *ajuda* para ver as opções.');
  }
}

async function handleTextMessage(phone, text) {
  console.log(`💬 Texto: "${text}" de ${phone}`);
  
  const user = await getUserByPhone(phone);
  if (!user) return;
  
  // Verificar se é um número (peso)
  const weightMatch = text.match(/^(\d+([.,]\d+)?)$/);
  if (weightMatch) {
    const weight = parseFloat(weightMatch[1].replace(',', '.'));
    
    if (weight >= 30 && weight <= 300) {
      // Registrar peso
      const lastWeight = await getLastWeight(user.id);
      await recordWeight(user.id, weight);
      
      const diff = lastWeight ? weight - lastWeight.weight_kg : 0;
      const template = templates.weightConfirmation(weight, diff);
      await sendMessage(phone, template.message);
    }
  }
}

export default router;
