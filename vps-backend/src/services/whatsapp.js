/**
 * WhatsApp Service - Envio de mensagens
 * Suporta Evolution API e Whapi
 */

import axios from 'axios';

// ===========================================
// Detecção de Provider
// ===========================================

function getProvider() {
  if (process.env.EVOLUTION_API_URL) return 'evolution';
  if (process.env.WHAPI_API_URL) return 'whapi';
  throw new Error('Nenhum provider WhatsApp configurado');
}

// ===========================================
// Evolution API
// ===========================================

async function sendEvolutionMessage(phone, message, options = {}) {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  
  const response = await axios.post(
    `${baseUrl}/message/sendText/${instance}`,
    {
      number: formatPhone(phone),
      text: message,
      ...options
    },
    {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

async function sendEvolutionButtons(phone, message, buttons) {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  
  const response = await axios.post(
    `${baseUrl}/message/sendButtons/${instance}`,
    {
      number: formatPhone(phone),
      title: '',
      description: message,
      buttons: buttons.map((btn, i) => ({
        buttonId: btn.id,
        buttonText: { displayText: btn.text }
      }))
    },
    {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

async function sendEvolutionImage(phone, imageUrl, caption = '') {
  const baseUrl = process.env.EVOLUTION_API_URL;
  const apiKey = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;
  
  const response = await axios.post(
    `${baseUrl}/message/sendMedia/${instance}`,
    {
      number: formatPhone(phone),
      mediatype: 'image',
      media: imageUrl,
      caption
    },
    {
      headers: {
        'apikey': apiKey,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

// ===========================================
// Whapi
// ===========================================

async function sendWhapiMessage(phone, message) {
  const baseUrl = process.env.WHAPI_API_URL;
  const token = process.env.WHAPI_TOKEN;
  
  const response = await axios.post(
    `${baseUrl}/messages/text`,
    {
      to: formatPhone(phone) + '@s.whatsapp.net',
      body: message
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

async function sendWhapiButtons(phone, message, buttons) {
  const baseUrl = process.env.WHAPI_API_URL;
  const token = process.env.WHAPI_TOKEN;
  
  const response = await axios.post(
    `${baseUrl}/messages/interactive`,
    {
      to: formatPhone(phone) + '@s.whatsapp.net',
      type: 'button',
      body: { text: message },
      action: {
        buttons: buttons.map(btn => ({
          type: 'reply',
          reply: { id: btn.id, title: btn.text }
        }))
      }
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

async function sendWhapiImage(phone, imageUrl, caption = '') {
  const baseUrl = process.env.WHAPI_API_URL;
  const token = process.env.WHAPI_TOKEN;
  
  const response = await axios.post(
    `${baseUrl}/messages/image`,
    {
      to: formatPhone(phone) + '@s.whatsapp.net',
      media: imageUrl,
      caption
    },
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
}

// ===========================================
// API Pública
// ===========================================

/**
 * Enviar mensagem de texto
 */
export async function sendMessage(phone, message) {
  const provider = getProvider();
  
  if (provider === 'evolution') {
    return sendEvolutionMessage(phone, message);
  } else {
    return sendWhapiMessage(phone, message);
  }
}

/**
 * Enviar mensagem com botões
 */
export async function sendButtons(phone, message, buttons) {
  const provider = getProvider();
  
  if (provider === 'evolution') {
    return sendEvolutionButtons(phone, message, buttons);
  } else {
    return sendWhapiButtons(phone, message, buttons);
  }
}

/**
 * Enviar imagem
 */
export async function sendImage(phone, imageUrl, caption = '') {
  const provider = getProvider();
  
  if (provider === 'evolution') {
    return sendEvolutionImage(phone, imageUrl, caption);
  } else {
    return sendWhapiImage(phone, imageUrl, caption);
  }
}

// ===========================================
// Templates de Mensagem
// ===========================================

export const templates = {
  // Lembrete de água
  waterReminder: (name, currentMl, goalMl) => ({
    message: `💧 Olá ${name}!\n\nVocê bebeu ${currentMl}ml de água hoje.\nMeta: ${goalMl}ml\n\nBora hidratar? 🚰`,
    buttons: [
      { id: 'water_250ml', text: '🥤 +250ml' },
      { id: 'water_500ml', text: '🫗 +500ml' },
      { id: 'water_not_yet', text: '⏰ Depois' }
    ]
  }),
  
  // Lembrete de peso
  weightReminder: (name, lastWeight, daysSince) => ({
    message: `⚖️ Olá ${name}!\n\nFaz ${daysSince} dias desde sua última pesagem${lastWeight ? ` (${lastWeight}kg)` : ''}.\n\nQue tal se pesar hoje?`,
    buttons: [
      { id: 'weigh_now', text: '⚖️ Pesar agora' },
      { id: 'weigh_later', text: '⏰ Depois' },
      { id: 'weigh_view_evolution', text: '📊 Ver evolução' }
    ]
  }),
  
  // Confirmação de peso
  weightConfirmation: (weight, diff) => {
    const emoji = diff < 0 ? '📉' : diff > 0 ? '📈' : '➡️';
    const diffText = diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff.toFixed(1)}kg)` : '';
    return {
      message: `✅ Peso registrado: ${weight}kg${diffText} ${emoji}\n\nContinue assim! 💪`
    };
  },
  
  // Confirmação de água
  waterConfirmation: (added, total, goal) => {
    const percent = Math.round((total / goal) * 100);
    const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
    return {
      message: `💧 +${added}ml registrado!\n\n${bar} ${percent}%\n${total}ml / ${goal}ml\n\n${percent >= 100 ? '🎉 Meta atingida!' : 'Continue bebendo água!'}`
    };
  },
  
  // Bom dia
  goodMorning: (name) => ({
    message: `☀️ Bom dia, ${name}!\n\nComo você está se sentindo hoje?`,
    buttons: [
      { id: 'feeling_great', text: '😊 Ótimo!' },
      { id: 'feeling_ok', text: '😐 Normal' },
      { id: 'feeling_bad', text: '😔 Não muito bem' }
    ]
  }),
  
  // Análise de alimento confirmada
  foodConfirmed: (calories, protein, carbs, fat) => ({
    message: `✅ Refeição registrada!\n\n🔥 ${calories} kcal\n🥩 ${protein}g proteína\n🍞 ${carbs}g carboidratos\n🧈 ${fat}g gordura\n\nBoa escolha! 🥗`
  })
};

// ===========================================
// Helpers
// ===========================================

function formatPhone(phone) {
  // Remover caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Adicionar código do país se não tiver
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  return cleaned;
}
