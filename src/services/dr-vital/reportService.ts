// =====================================================
// REPORT SERVICE - Dr. Vital
// =====================================================

import { supabase } from '@/integrations/supabase/client';
import { fromTable, callRpc } from '@/lib/supabase-helpers';
import type { HealthReport, ReportType, DateRange } from '@/types/dr-vital-revolution';

const SHAREABLE_LINK_EXPIRY_DAYS = 7;
const DEFAULT_REPORT_PERIOD_DAYS = 30;

export async function generateReport(userId: string, type: ReportType, period?: DateRange): Promise<HealthReport> {
  const reportPeriod = period || {
    start: new Date(Date.now() - DEFAULT_REPORT_PERIOD_DAYS * 24 * 60 * 60 * 1000),
    end: new Date(),
  };

  const [healthScores, missions, timeline, predictions] = await Promise.all([
    getHealthScoresForPeriod(userId, reportPeriod),
    getMissionsForPeriod(userId, reportPeriod),
    getTimelineForPeriod(userId, reportPeriod),
    getPredictionsForUser(userId),
  ]);

  const aiAnalysis = generateAIAnalysis(healthScores, missions, timeline);
  const recommendations = generateRecommendations(healthScores, predictions);

  const { data, error } = await fromTable('shared_reports')
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
    .single() as any;

  if (error) throw error;
  return rowToReport(data);
}

export async function getUserReports(userId: string, limit: number = 10): Promise<HealthReport[]> {
  const { data, error } = await fromTable('shared_reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit) as any;

  if (error) throw error;
  return (data || []).map(rowToReport);
}

export async function getReportById(reportId: string): Promise<HealthReport | null> {
  const { data, error } = await fromTable('shared_reports')
    .select('*')
    .eq('id', reportId)
    .maybeSingle() as any;

  if (error) throw error;
  if (!data) return null;
  return rowToReport(data);
}

export async function createShareableLink(reportId: string): Promise<{ shareUrl: string; accessToken: string; expiresAt: Date }> {
  const accessToken = generateAccessToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SHAREABLE_LINK_EXPIRY_DAYS);

  await fromTable('shared_reports')
    .update({ access_token: accessToken, expires_at: expiresAt.toISOString() })
    .eq('id', reportId);

  const shareUrl = `${window.location.origin}/report/${reportId}?token=${accessToken}`;
  return { shareUrl, accessToken, expiresAt };
}

export async function validateShareableAccess(reportId: string, accessToken: string): Promise<{ valid: boolean; report?: HealthReport; error?: string }> {
  const { data, error } = await fromTable('shared_reports')
    .select('*')
    .eq('id', reportId)
    .eq('access_token', accessToken)
    .maybeSingle() as any;

  if (error || !data) return { valid: false, error: 'Relatório não encontrado ou token inválido' };
  if (data.expires_at && new Date(data.expires_at) < new Date()) return { valid: false, error: 'Link expirado' };
  return { valid: true, report: rowToReport(data) };
}

export async function revokeShareableLink(reportId: string): Promise<void> {
  await fromTable('shared_reports').update({ access_token: null, expires_at: null }).eq('id', reportId);
}

export async function trackDownload(reportId: string): Promise<void> {
  try {
    await callRpc('increment_report_download', { report_id: reportId });
  } catch {
    const { data: report } = await fromTable('shared_reports').select('download_count').eq('id', reportId).single() as any;
    if (report) {
      await fromTable('shared_reports').update({ download_count: (report.download_count || 0) + 1 }).eq('id', reportId);
    }
  }
}

async function getHealthScoresForPeriod(userId: string, period: DateRange) {
  const { data } = await fromTable('health_scores')
    .select('*')
    .eq('user_id', userId)
    .gte('calculated_at', period.start.toISOString())
    .lte('calculated_at', period.end.toISOString())
    .order('calculated_at', { ascending: true })
    .limit(100) as any;
  return data || [];
}

async function getMissionsForPeriod(userId: string, period: DateRange) {
  const { data } = await fromTable('health_missions')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', period.start.toISOString())
    .lte('created_at', period.end.toISOString())
    .limit(200) as any;
  return data || [];
}

async function getTimelineForPeriod(userId: string, period: DateRange) {
  const { data } = await fromTable('health_timeline_events')
    .select('*')
    .eq('user_id', userId)
    .gte('event_date', period.start.toISOString())
    .lte('event_date', period.end.toISOString())
    .order('event_date', { ascending: true })
    .limit(200) as any;
  return data || [];
}

async function getPredictionsForUser(userId: string) {
  const { data } = await fromTable('health_predictions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(20) as any;
  return data || [];
}

function generateAIAnalysis(healthScores: any[], missions: any[], timeline: any[]): string {
  const avgScore = healthScores.length > 0 ? Math.round(healthScores.reduce((sum, s) => sum + s.score, 0) / healthScores.length) : 0;
  const completedMissions = missions.filter(m => m.is_completed).length;
  const totalMissions = missions.length;
  const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
  const milestones = timeline.filter(e => e.is_milestone).length;

  let analysis = `## Resumo do Período\n\nDurante este período, você manteve um **Health Score médio de ${avgScore}/100**. `;
  analysis += avgScore >= 70 ? `Excelente!\n\n` : avgScore >= 50 ? `Há espaço para melhorias.\n\n` : `Recomendamos atenção.\n\n`;
  analysis += `### Missões\nVocê completou **${completedMissions} de ${totalMissions} missões** (${completionRate}%).\n\n`;
  if (milestones > 0) analysis += `### Marcos\nVocê alcançou **${milestones} marcos importantes**.\n\n`;
  return analysis;
}

function generateRecommendations(healthScores: any[], predictions: any[]): string[] {
  const recommendations: string[] = [];
  if (healthScores.length > 0) {
    const latest = healthScores[healthScores.length - 1];
    if (latest.nutrition_score < 15) recommendations.push('Melhore sua alimentação');
    if (latest.exercise_score < 15) recommendations.push('Aumente sua atividade física');
    if (latest.sleep_score < 15) recommendations.push('Priorize 7-9 horas de sono');
    if (latest.mental_score < 15) recommendations.push('Pratique técnicas de relaxamento');
  }
  predictions.filter(p => p.probability > 50).forEach(p => recommendations.push(`Atenção ao risco de ${p.risk_type}`));
  if (recommendations.length === 0) recommendations.push('Continue mantendo seus bons hábitos');
  return recommendations;
}

function generateAccessToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 32 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

function rowToReport(row: any): HealthReport {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.report_type,
    period: { start: new Date(row.period_start), end: new Date(row.period_end) },
    pdfUrl: row.pdf_url || undefined,
    shareableLink: row.access_token ? `${window.location.origin}/report/${row.id}?token=${row.access_token}` : undefined,
    accessToken: row.access_token || undefined,
    expiresAt: row.expires_at ? new Date(row.expires_at) : undefined,
    downloadCount: row.download_count || 0,
    aiAnalysis: row.ai_analysis || '',
    recommendations: row.recommendations || [],
    createdAt: new Date(row.created_at),
  };
}

export const reportService = { generateReport, getUserReports, getReportById, createShareableLink, validateShareableAccess, revokeShareableLink, trackDownload };
export default reportService;
