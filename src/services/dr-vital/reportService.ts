// =====================================================
// REPORT SERVICE - Dr. Vital
// =====================================================
// Sistema de geração e compartilhamento de relatórios
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import type {
  HealthReport,
  ReportType,
  SharedReportRow,
  DateRange,
} from '@/types/dr-vital-revolution';

// =====================================================
// CONSTANTS
// =====================================================

const SHAREABLE_LINK_EXPIRY_DAYS = 7;
const DEFAULT_REPORT_PERIOD_DAYS = 30;

// =====================================================
// REPORT GENERATION
// =====================================================

/**
 * Gera um relatório de saúde
 */
export async function generateReport(
  userId: string,
  type: ReportType,
  period?: DateRange
): Promise<HealthReport> {
  // Definir período padrão se não fornecido
  const reportPeriod = period || {
    start: new Date(Date.now() - DEFAULT_REPORT_PERIOD_DAYS * 24 * 60 * 60 * 1000),
    end: new Date(),
  };

  // Coletar dados para o relatório
  const [healthScores, missions, timeline, predictions] = await Promise.all([
    getHealthScoresForPeriod(userId, reportPeriod),
    getMissionsForPeriod(userId, reportPeriod),
    getTimelineForPeriod(userId, reportPeriod),
    getPredictionsForUser(userId),
  ]);

  // Gerar análise AI
  const aiAnalysis = generateAIAnalysis(healthScores, missions, timeline);
  const recommendations = generateRecommendations(healthScores, predictions);

  // Salvar relatório
  const { data, error } = await supabase
    .from('shared_reports')
    .insert({
      user_id: userId,
      report_type: type,
      period_start: reportPeriod.start.toISOString(),
      period_end: reportPeriod.end.toISOString(),
      ai_analysis: aiAnalysis,
      recommendations,
      download_count: 0,
    })
    .select()
    .single();

  if (error) throw error;

  return rowToReport(data as SharedReportRow);
}

/**
 * Busca relatórios do usuário
 */
export async function getUserReports(
  userId: string,
  limit: number = 10
): Promise<HealthReport[]> {
  const { data, error } = await supabase
    .from('shared_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data as SharedReportRow[]).map(rowToReport);
}

/**
 * Busca relatório por ID
 */
export async function getReportById(reportId: string): Promise<HealthReport | null> {
  const { data, error } = await supabase
    .from('shared_reports')
    .select('*')
    .eq('id', reportId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return rowToReport(data as SharedReportRow);
}

// =====================================================
// SHAREABLE LINKS
// =====================================================

/**
 * Cria link compartilhável para um relatório
 */
export async function createShareableLink(reportId: string): Promise<{
  shareUrl: string;
  accessToken: string;
  expiresAt: Date;
}> {
  // Gerar token único
  const accessToken = generateAccessToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SHAREABLE_LINK_EXPIRY_DAYS);

  // Atualizar relatório com token
  const { error } = await supabase
    .from('shared_reports')
    .update({
      access_token: accessToken,
      expires_at: expiresAt.toISOString(),
    })
    .eq('id', reportId);

  if (error) throw error;

  const shareUrl = `${window.location.origin}/report/${reportId}?token=${accessToken}`;

  return { shareUrl, accessToken, expiresAt };
}

/**
 * Valida acesso a relatório compartilhado
 */
export async function validateShareableAccess(
  reportId: string,
  accessToken: string
): Promise<{ valid: boolean; report?: HealthReport; error?: string }> {
  const { data, error } = await supabase
    .from('shared_reports')
    .select('*')
    .eq('id', reportId)
    .eq('access_token', accessToken)
    .single();

  if (error || !data) {
    return { valid: false, error: 'Relatório não encontrado ou token inválido' };
  }

  const report = data as SharedReportRow;

  // Verificar expiração
  if (report.expires_at && new Date(report.expires_at) < new Date()) {
    return { valid: false, error: 'Link expirado' };
  }

  return { valid: true, report: rowToReport(report) };
}

/**
 * Revoga link compartilhável
 */
export async function revokeShareableLink(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('shared_reports')
    .update({
      access_token: null,
      expires_at: null,
    })
    .eq('id', reportId);

  if (error) throw error;
}

// =====================================================
// DOWNLOAD TRACKING
// =====================================================

/**
 * Registra download do relatório
 */
export async function trackDownload(reportId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_report_download', {
    report_id: reportId,
  });

  // Fallback se RPC não existir
  if (error) {
    const { data: report } = await supabase
      .from('shared_reports')
      .select('download_count')
      .eq('id', reportId)
      .single();

    if (report) {
      await supabase
        .from('shared_reports')
        .update({ download_count: (report.download_count || 0) + 1 })
        .eq('id', reportId);
    }
  }
}

// =====================================================
// DATA COLLECTION HELPERS
// =====================================================

async function getHealthScoresForPeriod(userId: string, period: DateRange) {
  const { data } = await supabase
    .from('health_scores')
    .select('*')
    .eq('user_id', userId)
    .gte('calculated_at', period.start.toISOString())
    .lte('calculated_at', period.end.toISOString())
    .order('calculated_at', { ascending: true });

  return data || [];
}

async function getMissionsForPeriod(userId: string, period: DateRange) {
  const { data } = await supabase
    .from('health_missions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', period.start.toISOString())
    .lte('created_at', period.end.toISOString());

  return data || [];
}

async function getTimelineForPeriod(userId: string, period: DateRange) {
  const { data } = await supabase
    .from('health_timeline_events')
    .select('*')
    .eq('user_id', userId)
    .gte('event_date', period.start.toISOString())
    .lte('event_date', period.end.toISOString())
    .order('event_date', { ascending: true });

  return data || [];
}

async function getPredictionsForUser(userId: string) {
  const { data } = await supabase
    .from('health_predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true);

  return data || [];
}

// =====================================================
// AI ANALYSIS GENERATION
// =====================================================

function generateAIAnalysis(
  healthScores: any[],
  missions: any[],
  timeline: any[]
): string {
  const avgScore = healthScores.length > 0
    ? Math.round(healthScores.reduce((sum, s) => sum + s.score, 0) / healthScores.length)
    : 0;

  const completedMissions = missions.filter(m => m.is_completed).length;
  const totalMissions = missions.length;
  const completionRate = totalMissions > 0 
    ? Math.round((completedMissions / totalMissions) * 100) 
    : 0;

  const milestones = timeline.filter(e => e.is_milestone).length;

  let analysis = `## Resumo do Período\n\n`;
  analysis += `Durante este período, você manteve um **Health Score médio de ${avgScore}/100**. `;
  
  if (avgScore >= 70) {
    analysis += `Isso indica um excelente estado de saúde geral! Continue assim.\n\n`;
  } else if (avgScore >= 50) {
    analysis += `Há espaço para melhorias, mas você está no caminho certo.\n\n`;
  } else {
    analysis += `Recomendamos atenção especial aos seus hábitos de saúde.\n\n`;
  }

  analysis += `### Missões\n`;
  analysis += `Você completou **${completedMissions} de ${totalMissions} missões** (${completionRate}% de conclusão).\n\n`;

  if (milestones > 0) {
    analysis += `### Marcos Alcançados\n`;
    analysis += `Parabéns! Você alcançou **${milestones} marcos importantes** neste período.\n\n`;
  }

  return analysis;
}

function generateRecommendations(healthScores: any[], predictions: any[]): string[] {
  const recommendations: string[] = [];

  // Analisar scores
  if (healthScores.length > 0) {
    const latest = healthScores[healthScores.length - 1];
    
    if (latest.nutrition_score < 15) {
      recommendations.push('Melhore sua alimentação registrando refeições diariamente');
    }
    if (latest.exercise_score < 15) {
      recommendations.push('Aumente sua atividade física para pelo menos 30 minutos por dia');
    }
    if (latest.sleep_score < 15) {
      recommendations.push('Priorize 7-9 horas de sono por noite');
    }
    if (latest.mental_score < 15) {
      recommendations.push('Pratique técnicas de relaxamento para reduzir o estresse');
    }
  }

  // Analisar previsões de risco
  const highRiskPredictions = predictions.filter(p => p.probability > 50);
  for (const pred of highRiskPredictions) {
    recommendations.push(`Atenção ao risco de ${pred.risk_type}: siga as recomendações do Dr. Vital`);
  }

  // Recomendações gerais se não houver específicas
  if (recommendations.length === 0) {
    recommendations.push('Continue mantendo seus bons hábitos de saúde');
    recommendations.push('Faça check-ups regulares com seu médico');
    recommendations.push('Mantenha-se hidratado bebendo pelo menos 2L de água por dia');
  }

  return recommendations;
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function generateAccessToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function rowToReport(row: SharedReportRow): HealthReport {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.report_type,
    period: {
      start: new Date(row.period_start),
      end: new Date(row.period_end),
    },
    pdfUrl: row.pdf_url || undefined,
    shareableLink: row.access_token 
      ? `${window.location.origin}/report/${row.id}?token=${row.access_token}`
      : undefined,
    accessToken: row.access_token || undefined,
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    downloadCount: row.download_count,
    aiAnalysis: row.ai_analysis || '',
    recommendations: row.recommendations || [],
    createdAt: new Date(row.created_at),
  };
}

// =====================================================
// EXPORTS
// =====================================================

export const reportService = {
  generateReport,
  getUserReports,
  getReportById,
  createShareableLink,
  validateShareableAccess,
  revokeShareableLink,
  trackDownload,
};

export default reportService;
