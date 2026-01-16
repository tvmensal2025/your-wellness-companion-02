/**
 * VPS API Client
 * 
 * Integração com o backend VPS para:
 * - Storage de mídia (MinIO)
 * - WhatsApp (envio/recebimento)
 * - Tracking (peso, água)
 * - Notificações
 */

const VPS_API_URL = import.meta.env.VITE_VPS_API_URL || '';
const VPS_API_KEY = import.meta.env.VITE_VPS_API_KEY || '';

// ===========================================
// Helpers
// ===========================================

async function vpsRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (!VPS_API_URL) {
    throw new Error('VPS_API_URL não configurada');
  }

  const response = await fetch(`${VPS_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-API-Key': VPS_API_KEY,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ===========================================
// Storage
// ===========================================

export interface UploadResult {
  success: boolean;
  url: string;
  path: string;
  size: number;
  mimeType: string;
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

/**
 * Upload de arquivo para MinIO (VPS)
 * TODAS as imagens do app devem usar esta função
 */
export async function uploadToVPS(
  file: File,
  folder: MinIOFolder = 'feed'
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  return vpsRequest<UploadResult>('/storage/upload', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Upload de imagem com fallback para Supabase (migração gradual)
 * Use esta função durante a migração - ela tenta MinIO primeiro
 */
export async function uploadImage(
  file: File,
  folder: MinIOFolder,
  userId?: string
): Promise<{ url: string; path: string }> {
  // Sempre usar MinIO
  const result = await uploadToVPS(file, folder);
  return { url: result.url, path: result.path };
}

/**
 * Upload de base64 para VPS
 */
export async function uploadBase64ToVPS(
  base64Data: string,
  folder: string,
  mimeType: string,
  filename?: string
): Promise<UploadResult> {
  return vpsRequest<UploadResult>('/storage/upload-base64', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: base64Data,
      folder,
      mimeType,
      filename,
    }),
  });
}

/**
 * Listar arquivos de uma pasta
 */
export async function listVPSFiles(folder: string, limit = 100) {
  return vpsRequest<{
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
 * Deletar arquivo
 */
export async function deleteVPSFile(folder: string, filename: string) {
  return vpsRequest<{ success: boolean; deleted: string }>(
    `/storage/${folder}/${filename}`,
    { method: 'DELETE' }
  );
}

// ===========================================
// WhatsApp
// ===========================================

/**
 * Enviar mensagem de texto via WhatsApp
 */
export async function sendWhatsAppMessage(phone: string, message: string) {
  return vpsRequest<{ success: boolean; result: unknown }>('/whatsapp/send', {
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
  return vpsRequest<{ success: boolean; result: unknown }>('/whatsapp/buttons', {
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
  return vpsRequest<{ success: boolean; result: unknown }>('/whatsapp/image', {
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
  return vpsRequest<{ success: boolean; template: string }>('/whatsapp/template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, templateType, data }),
  });
}

// ===========================================
// Tracking
// ===========================================

/**
 * Registrar peso
 */
export async function recordWeight(
  userId: string,
  weightKg: number,
  options?: { notes?: string; notifyWhatsApp?: boolean }
) {
  return vpsRequest<{
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
  return vpsRequest<{
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
  return vpsRequest<{
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
  return vpsRequest<{
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
  return vpsRequest<{ success: boolean; data: unknown }>('/tracking/mood', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, energyLevel, moodLevel }),
  });
}

/**
 * Buscar resumo do dia
 */
export async function getDailySummary(userId: string) {
  return vpsRequest<{
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
// Notificações
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
  return vpsRequest<{ success: boolean; type: string; phone: string }>(
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
  return vpsRequest<{
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
 */
export async function checkVPSHealth() {
  return vpsRequest<{
    status: string;
    timestamp: string;
    uptime: number;
    checks: Record<string, { status: string; error?: string }>;
    memory?: { rss: number; heapUsed: number };
  }>('/health/detailed');
}

/**
 * Verificar se VPS está configurada
 */
export function isVPSConfigured(): boolean {
  return Boolean(VPS_API_URL && VPS_API_KEY);
}
