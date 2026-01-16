/**
 * VPS API Client
 * 
 * Integração com o backend VPS para:
 * - Storage de mídia (MinIO) - via Edge Function
 * - WhatsApp (envio/recebimento)
 * - Tracking (peso, água)
 * - Notificações
 * 
 * IMPORTANTE: Upload de mídia agora usa Edge Function como proxy,
 * pois VITE_VPS_* não está disponível no frontend.
 */

import { supabase } from '@/integrations/supabase/client';

// ===========================================
// Storage Types
// ===========================================

export interface UploadResult {
  success: boolean;
  url: string;
  path: string;
  size: number;
  mimeType: string;
  source?: 'minio' | 'supabase';
}

// Todas as pastas disponíveis no MinIO
export type MinIOFolder = 
  | 'avatars'
  | 'chat-images'
  | 'exercise-videos'
  | 'feed'
  | 'food-analysis'
  | 'medical-exams'
  | 'medical-reports'
  | 'profiles'
  | 'stories'
  | 'weight-photos'
  | 'whatsapp'
  | 'course-thumbnails'
  | 'product-images'
  | 'exercise-media';

// ===========================================
// Storage Functions (via Edge Function)
// ===========================================

/**
 * Upload de arquivo para MinIO via Edge Function
 * A Edge Function tenta MinIO primeiro, com fallback para Supabase Storage.
 */
export async function uploadToVPS(
  file: File,
  folder: MinIOFolder = 'feed'
): Promise<UploadResult> {
  // Converter File para base64
  const base64Data = await fileToBase64(file);
  
  console.log(`[VPS API] Uploading via Edge Function: ${folder}`);
  
  const { data, error } = await supabase.functions.invoke('media-upload', {
    body: {
      data: base64Data,
      folder,
      mimeType: file.type,
      filename: file.name,
    },
  });

  if (error) {
    console.error('[VPS API] Edge Function error:', error);
    throw new Error(error.message || 'Erro no upload');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Erro no upload');
  }

  console.log(`[VPS API] Upload success via ${data.source}: ${data.url}`);

  return {
    success: true,
    url: data.url,
    path: data.path,
    size: data.size || file.size,
    mimeType: data.mimeType || file.type,
    source: data.source,
  };
}

/**
 * Upload de imagem com fallback automático (via Edge Function)
 */
export async function uploadImage(
  file: File,
  folder: MinIOFolder,
  userId?: string
): Promise<{ url: string; path: string }> {
  const result = await uploadToVPS(file, folder);
  return { url: result.url, path: result.path };
}

/**
 * Upload de base64 via Edge Function
 */
export async function uploadBase64ToVPS(
  base64Data: string,
  folder: string,
  mimeType: string,
  filename?: string
): Promise<UploadResult> {
  console.log(`[VPS API] Uploading base64 via Edge Function: ${folder}`);
  
  const { data, error } = await supabase.functions.invoke('media-upload', {
    body: {
      data: base64Data.replace(/^data:[^;]+;base64,/, ''),
      folder,
      mimeType,
      filename,
    },
  });

  if (error) {
    console.error('[VPS API] Edge Function error:', error);
    throw new Error(error.message || 'Erro no upload');
  }

  if (!data?.success) {
    throw new Error(data?.error || 'Erro no upload');
  }

  return {
    success: true,
    url: data.url,
    path: data.path,
    size: data.size,
    mimeType: data.mimeType || mimeType,
    source: data.source,
  };
}

// Helper: Convert File to base64
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

// ===========================================
// VPS Direct API (WhatsApp, Tracking, etc.)
// Estas funções chamam a VPS diretamente via Edge Function proxy
// ===========================================

/**
 * Chamar VPS API via Edge Function proxy (para WhatsApp, Tracking, etc.)
 */
async function vpsProxyRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { data, error } = await supabase.functions.invoke('vps-proxy', {
    body: {
      endpoint,
      method: options.method || 'GET',
      headers: options.headers,
      body: options.body ? JSON.parse(options.body as string) : undefined,
    },
  });

  if (error) {
    throw new Error(error.message || 'Erro na requisição VPS');
  }

  if (!data?.success && data?.error) {
    throw new Error(data.error);
  }

  return data as T;
}

/**
 * Listar arquivos de uma pasta (via Edge Function)
 */
export async function listVPSFiles(folder: string, limit = 100) {
  return vpsProxyRequest<{
    success: boolean;
    folder: string;
    count: number;
    files: Array<{
      name: string;
      size: number;
      lastModified: string;
      url: string;
    }>;
  }>(`/storage/list/${folder}?limit=${limit}`);
}

/**
 * Deletar arquivo (via Edge Function)
 */
export async function deleteVPSFile(folder: string, filename: string) {
  return vpsProxyRequest<{ success: boolean; deleted: string }>(
    `/storage/${folder}/${filename}`,
    { method: 'DELETE' }
  );
}

// ===========================================
// WhatsApp (via Edge Function proxy)
// ===========================================

/**
 * Enviar mensagem de texto via WhatsApp
 */
export async function sendWhatsAppMessage(phone: string, message: string) {
  return vpsProxyRequest<{ success: boolean; result: unknown }>('/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message }),
  });
}

/**
 * Enviar mensagem com botões via WhatsApp
 */
export async function sendWhatsAppButtons(
  phone: string,
  message: string,
  buttons: Array<{ id: string; text: string }>
) {
  return vpsProxyRequest<{ success: boolean; result: unknown }>('/whatsapp/buttons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, message, buttons }),
  });
}

/**
 * Enviar imagem via WhatsApp
 */
export async function sendWhatsAppImage(
  phone: string,
  imageUrl: string,
  caption?: string
) {
  return vpsProxyRequest<{ success: boolean; result: unknown }>('/whatsapp/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, imageUrl, caption }),
  });
}

/**
 * Enviar template pré-definido via WhatsApp
 */
export async function sendWhatsAppTemplate(
  phone: string,
  templateType: 'water_reminder' | 'weight_reminder' | 'good_morning' | 'weight_confirmation' | 'water_confirmation' | 'food_confirmed',
  data?: Record<string, unknown>
) {
  return vpsProxyRequest<{ success: boolean; template: string }>('/whatsapp/template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, templateType, data }),
  });
}

// ===========================================
// Tracking (via Edge Function proxy)
// ===========================================

/**
 * Registrar peso
 */
export async function recordWeight(
  userId: string,
  weightKg: number,
  options?: { notes?: string; notifyWhatsApp?: boolean }
) {
  return vpsProxyRequest<{
    success: boolean;
    data: unknown;
    previousWeight: number | null;
    diff: number;
  }>('/tracking/weight', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      weightKg,
      ...options,
    }),
  });
}

/**
 * Buscar histórico de peso
 */
export async function getWeightHistory(userId: string, days = 30) {
  return vpsProxyRequest<{
    success: boolean;
    userId: string;
    days: number;
    count: number;
    measurements: Array<{
      weight_kg: number;
      measurement_date: string;
      notes: string;
    }>;
  }>(`/tracking/weight/${userId}?days=${days}`);
}

/**
 * Registrar água
 */
export async function recordWater(
  userId: string,
  amountMl: number,
  notifyWhatsApp = false
) {
  return vpsProxyRequest<{
    success: boolean;
    previous: number;
    added: number;
    total: number;
  }>('/tracking/water', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amountMl, notifyWhatsApp }),
  });
}

/**
 * Buscar água do dia
 */
export async function getTodayWater(userId: string) {
  return vpsProxyRequest<{
    success: boolean;
    userId: string;
    total: number;
    goal: number;
    percent: number;
    remaining: number;
  }>(`/tracking/water/${userId}`);
}

/**
 * Registrar humor/energia
 */
export async function recordMood(
  userId: string,
  energyLevel: number,
  moodLevel: number
) {
  return vpsProxyRequest<{ success: boolean; data: unknown }>('/tracking/mood', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, energyLevel, moodLevel }),
  });
}

/**
 * Buscar resumo do dia
 */
export async function getDailySummary(userId: string) {
  return vpsProxyRequest<{
    success: boolean;
    date: string;
    water: { total: number; goal: number; percent: number };
    weight: { current: number; date: string } | null;
    mood: { energy: number | null; mood: number | null };
    nutrition: {
      meals: number;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    sleep: { hours: number | null; quality: number | null };
    steps: number;
  }>(`/tracking/summary/${userId}`);
}

// ===========================================
// Notificações (via Edge Function proxy)
// ===========================================

/**
 * Enviar notificação imediata
 */
export async function sendNotification(
  options: {
    userId?: string;
    phone?: string;
    type: 'water_reminder' | 'weight_reminder' | 'good_morning' | 'custom';
    data?: Record<string, unknown>;
  }
) {
  return vpsProxyRequest<{ success: boolean; type: string; phone: string }>(
    '/notify/send',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    }
  );
}

/**
 * Enviar broadcast para múltiplos usuários
 */
export async function sendBroadcast(
  phones: string[],
  type: string,
  data?: Record<string, unknown>
) {
  return vpsProxyRequest<{
    success: boolean;
    total: number;
    sent: number;
    failed: number;
    results: {
      success: string[];
      failed: Array<{ phone: string; error: string }>;
    };
  }>('/notify/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phones, type, data }),
  });
}

// ===========================================
// Health
// ===========================================

/**
 * Verificar status do backend VPS
 * Retorna dados mesmo quando status é "degraded" (alguns serviços offline)
 */
export async function checkVPSHealth() {
  const { data, error } = await supabase.functions.invoke('vps-proxy', {
    body: {
      endpoint: '/health/detailed',
      method: 'GET',
    },
  });

  if (error) {
    throw new Error(error.message || 'Erro ao verificar VPS');
  }

  return {
    status: data?.status || 'unknown',
    timestamp: data?.timestamp,
    uptime: data?.uptime,
    checks: data?.checks || {},
    memory: data?.memory,
    httpStatus: data?.httpStatus,
  };
}

/**
 * Verificar se VPS está configurada
 * Sempre retorna true pois usamos Edge Function com fallback
 */
export function isVPSConfigured(): boolean {
  return true; // Edge Function sempre disponível
}
