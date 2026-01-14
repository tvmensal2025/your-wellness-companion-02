/**
 * DrVitalConsultModal - Modal de Consulta Virtual com Dr. Vital
 * Usa TODOS os dados disponíveis na plataforma para análise completa
 * Design estilo consultório médico com animação criativa
 */

import { useState, useMemo, useEffect } from 'react';
import { X, Heart, Activity, Zap, TrendingUp, TrendingDown, Minus, Stethoscope, FileText, AlertCircle, CheckCircle2, Clock, Pill, Footprints, Moon, Droplets, Flame, Dumbbell, Apple, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useHealthData } from '@/hooks/useHealthData';
import { useHeartRate } from '@/hooks/cardio/useHeartRate';
import { useCardioPoints } from '@/hooks/cardio/useCardioPoints';
import { useCardioTrend } from '@/hooks/cardio/useCardioTrend';
import { useGoogleFitData } from '@/hooks/useGoogleFitData';
import { useNutritionData } from '@/hooks/useNutritionData';
import { useExerciseData } from '@/hooks/useExerciseData';

interface DrVitalConsultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToDrVital?: () => void;
}

type ConsultPhase = 'opening' | 'vitals' | 'lifestyle' | 'diagnosis';

// Classificação médica do BPM
function classifyHeartRate(bpm: number | null): { status: 'normal' | 'attention' | 'alert'; label: string } {
  if (!bpm) return { status: 'normal', label: 'Sem leitura' };
  if (bpm < 50) return { status: 'attention', label: 'Bradicardia' };
  if (bpm <= 60) return { status: 'normal', label: 'Atlético' };
  if (bpm <= 80) return { status: 'normal', label: 'Normal' };
  if (bpm <= 100) return { status: 'attention', label: 'Elevada' };
  return { status: 'alert', label: 'Taquicardia' };
}

// Classificação de passos
function classifySteps(steps: number): { status: 'good' | 'moderate' | 'low'; label: string } {
  if (steps >= 10000) return { status: 'good', label: 'Excelente' };
  if (steps >= 7000) return { status: 'good', label: 'Bom' };
  if (steps >= 5000) return { status: 'moderate', label: 'Moderado' };
  if (steps >= 2000) return { status: 'low', label: 'Baixo' };
  return { status: 'low', label: 'Sedentário' };
}

// Classificação de sono
function classifySleep(hours: number): { status: 'good' | 'moderate' | 'low'; label: string } {
  if (hours >= 7 && hours <= 9) return { status: 'good', label: 'Ideal' };
  if (hours >= 6) return { status: 'moderate', label: 'Aceitável' };
  if (hours >= 5) return { status: 'low', label: 'Insuficiente' };
  return { status: 'low', label: 'Crítico' };
}

// Classificação de hidratação
function classifyHydration(ml: number): { status: 'good' | 'moderate' | 'low'; label: string } {
  if (ml >= 2000) return { status: 'good', label: 'Adequada' };
  if (ml >= 1500) return { status: 'moderate', label: 'Moderada' };
  if (ml >= 1000) return { status: 'low', label: 'Baixa' };
  return { status: 'low', label: 'Crítica' };
}

export function DrVitalConsultModal({ isOpen, onClose, onNavigateToDrVital }: DrVitalConsultModalProps) {
  const { healthData } = useHealthData();
  const { currentBpm } = useHeartRate();
  const { todayPoints, progressPercent: cardioProgress } = useCardioPoints({ dailyGoal: 150 });
  const { trend } = useCardioTrend();
  const { data: googleFitData, calculateStats, isConnected: hasGoogleFit } = useGoogleFitData();
  const { nutritionData } = useNutritionData();
  const { exerciseData } = useExerciseData();
  
  const [phase, setPhase] = useState<ConsultPhase>('opening');
  const [showContent, setShowContent] = useState(false);

  // Calcular estatísticas do Google Fit (hoje)
  const todayStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayData = googleFitData.filter(d => d.date === today);
    return calculateStats(todayData);
  }, [googleFitData, calculateStats]);

  // Classificações
  const hrClass = classifyHeartRate(currentBpm);
  const stepsClass = classifySteps(todayStats.totalSteps);
  const sleepClass = classifySleep(todayStats.avgSleepHours);
  
  // Gerar diagnóstico completo
  const diagnosis = useMemo(() => {
    const issues: string[] = [];
    const positives: string[] = [];
    const prescriptions: { icon: string; text: string; priority: 'high' | 'medium' | 'low' }[] = [];

    // Análise Cardíaca
    if (currentBpm) {
      if (hrClass.status === 'normal') {
        positives.push(`Frequência cardíaca em ${currentBpm} bpm - dentro dos parâmetros ideais`);
      } else if (hrClass.status === 'attention') {
        issues.push(`FC em ${currentBpm} bpm requer monitoramento`);
        prescriptions.push({ icon: '🧘', text: 'Técnicas de respiração 4-7-8, 2x ao dia', priority: 'medium' });
      } else {
        issues.push(`FC elevada: ${currentBpm} bpm - avaliar fatores de estresse`);
        prescriptions.push({ icon: '🚨', text: 'Repouso e hidratação imediata', priority: 'high' });
      }
    }

    // Análise de Atividade Física
    if (todayStats.totalSteps > 0) {
      if (stepsClass.status === 'good') {
        positives.push(`${todayStats.totalSteps.toLocaleString()} passos hoje - excelente mobilidade`);
      } else if (stepsClass.status === 'moderate') {
        issues.push(`${todayStats.totalSteps.toLocaleString()} passos - abaixo do ideal`);
        prescriptions.push({ icon: '🚶', text: 'Caminhada de 20 min após almoço', priority: 'medium' });
      } else {
        issues.push(`Apenas ${todayStats.totalSteps.toLocaleString()} passos - sedentarismo`);
        prescriptions.push({ icon: '🚶', text: 'Meta: 2.000 passos adicionais hoje', priority: 'high' });
      }
    }

    // Análise de Sono
    if (todayStats.avgSleepHours > 0) {
      if (sleepClass.status === 'good') {
        positives.push(`${todayStats.avgSleepHours}h de sono - recuperação adequada`);
      } else if (sleepClass.status === 'moderate') {
        issues.push(`${todayStats.avgSleepHours}h de sono - pode melhorar`);
        prescriptions.push({ icon: '😴', text: 'Evitar telas 1h antes de dormir', priority: 'medium' });
      } else {
        issues.push(`Apenas ${todayStats.avgSleepHours}h de sono - déficit crítico`);
        prescriptions.push({ icon: '😴', text: 'Priorizar 7-8h de sono esta noite', priority: 'high' });
      }
    }

    // Análise Nutricional
    if (nutritionData.caloriesConsumed > 0) {
      const calPercent = Math.round((nutritionData.caloriesConsumed / nutritionData.caloriesTarget) * 100);
      if (calPercent >= 80 && calPercent <= 110) {
        positives.push(`Ingestão calórica em ${calPercent}% da meta - equilibrada`);
      } else if (calPercent < 80) {
        issues.push(`Apenas ${calPercent}% das calorias diárias consumidas`);
        prescriptions.push({ icon: '🍎', text: 'Não pular refeições - manter metabolismo ativo', priority: 'medium' });
      } else {
        issues.push(`${calPercent}% das calorias - acima do recomendado`);
      }
    }

    // Análise de Treinos
    if (exerciseData.workoutsThisMonth > 0) {
      if (exerciseData.workoutsThisMonth >= 12) {
        positives.push(`${exerciseData.workoutsThisMonth} treinos este mês - consistência exemplar`);
      } else if (exerciseData.workoutsThisMonth >= 8) {
        positives.push(`${exerciseData.workoutsThisMonth} treinos - boa frequência`);
      } else {
        issues.push(`Apenas ${exerciseData.workoutsThisMonth} treinos este mês`);
        prescriptions.push({ icon: '💪', text: 'Agendar próximo treino para amanhã', priority: 'medium' });
      }
    }

    // Análise de Tendência
    if (trend.direction === 'improving') {
      positives.push('Tendência cardiovascular em melhora progressiva');
    } else if (trend.direction === 'declining') {
      issues.push('Tendência cardiovascular em declínio');
      prescriptions.push({ icon: '📊', text: 'Avaliar fatores de estresse e qualidade do sono', priority: 'high' });
    }

    // Pontos Cardio
    if (cardioProgress >= 100) {
      positives.push(`Meta de pontos cardio atingida (${todayPoints} pts)`);
    } else if (cardioProgress >= 50) {
      issues.push(`${cardioProgress}% da meta de pontos cardio`);
    }

    // Prescrição padrão se tudo ok
    if (prescriptions.length === 0) {
      prescriptions.push({ icon: '✨', text: 'Manter rotina atual. Próxima avaliação em 7 dias.', priority: 'low' });
    }

    // Determinar severidade geral
    let severity: 'good' | 'moderate' | 'attention' = 'good';
    const highPriority = prescriptions.filter(p => p.priority === 'high').length;
    if (highPriority >= 2) severity = 'attention';
    else if (highPriority >= 1 || issues.length >= 3) severity = 'moderate';

    return { issues, positives, prescriptions, severity };
  }, [currentBpm, hrClass, todayStats, stepsClass, sleepClass, nutritionData, exerciseData, trend, cardioProgress, todayPoints]);

  // Animação de fases
  useEffect(() => {
    if (!isOpen) {
      setPhase('opening');
      setShowContent(false);
      return;
    }

    const timers: NodeJS.Timeout[] = [];
    timers.push(setTimeout(() => setShowContent(true), 300));
    timers.push(setTimeout(() => setPhase('vitals'), 1200));
    timers.push(setTimeout(() => setPhase('lifestyle'), 2400));
    timers.push(setTimeout(() => setPhase('diagnosis'), 3600));

    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      
      <div className={cn(
        "relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-blue-500/30 transform transition-all duration-500",
        showContent ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}>
        {/* Efeito de scan */}
        {phase === 'opening' && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 via-transparent to-transparent animate-pulse" />
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" style={{ animation: 'scanLine 1.2s ease-in-out infinite', top: '50%' }} />
          </div>
        )}

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-4">
          <div className="relative flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
                <img src="/images/dr-vital-avatar.webp" alt="Dr. Vital" className="w-10 h-10 rounded-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-blue-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-white">Dr. Vital</h3>
              <p className="text-[10px] text-blue-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Análise Completa em Andamento
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-4 space-y-4 max-h-[55vh] overflow-y-auto">
          
          {/* SINAIS VITAIS */}
          <div className={cn("transform transition-all duration-500", phase !== 'opening' ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Sinais Vitais</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className={cn("bg-slate-800/50 rounded-lg p-2 border text-center", hrClass.status === 'normal' ? "border-emerald-500/30" : hrClass.status === 'attention' ? "border-yellow-500/30" : "border-red-500/30")}>
                <Heart className={cn("w-4 h-4 mx-auto mb-0.5", hrClass.status === 'normal' ? "text-emerald-500" : hrClass.status === 'attention' ? "text-yellow-500" : "text-red-500")} />
                <div className="text-lg font-bold text-white">{currentBpm || '--'}</div>
                <div className="text-[9px] text-slate-400">BPM</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 border border-amber-500/30 text-center">
                <Zap className="w-4 h-4 mx-auto mb-0.5 text-amber-500" />
                <div className="text-lg font-bold text-white">{todayPoints}</div>
                <div className="text-[9px] text-slate-400">Cardio Pts</div>
              </div>
              <div className={cn("bg-slate-800/50 rounded-lg p-2 border text-center", healthData.score >= 70 ? "border-emerald-500/30" : healthData.score >= 40 ? "border-yellow-500/30" : "border-red-500/30")}>
                {trend.direction === 'improving' ? <TrendingUp className="w-4 h-4 mx-auto mb-0.5 text-emerald-500" /> : trend.direction === 'declining' ? <TrendingDown className="w-4 h-4 mx-auto mb-0.5 text-red-500" /> : <Minus className="w-4 h-4 mx-auto mb-0.5 text-yellow-500" />}
                <div className="text-lg font-bold text-white">{healthData.score}</div>
                <div className="text-[9px] text-slate-400">Score</div>
              </div>
            </div>
          </div>

          {/* ESTILO DE VIDA - Google Fit + Nutrição + Exercício */}
          <div className={cn("transform transition-all duration-500", (phase === 'lifestyle' || phase === 'diagnosis') ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-purple-400" />
              <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Estilo de Vida</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div className={cn("bg-slate-800/50 rounded-lg p-2 border text-center", stepsClass.status === 'good' ? "border-emerald-500/20" : stepsClass.status === 'moderate' ? "border-yellow-500/20" : "border-red-500/20")}>
                <Footprints className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-400" />
                <div className="text-sm font-bold text-white">{todayStats.totalSteps > 0 ? (todayStats.totalSteps / 1000).toFixed(1) + 'k' : '--'}</div>
                <div className="text-[8px] text-slate-500">Passos</div>
              </div>
              <div className={cn("bg-slate-800/50 rounded-lg p-2 border text-center", sleepClass.status === 'good' ? "border-emerald-500/20" : sleepClass.status === 'moderate' ? "border-yellow-500/20" : "border-red-500/20")}>
                <Moon className="w-3.5 h-3.5 mx-auto mb-0.5 text-indigo-400" />
                <div className="text-sm font-bold text-white">{todayStats.avgSleepHours > 0 ? todayStats.avgSleepHours + 'h' : '--'}</div>
                <div className="text-[8px] text-slate-500">Sono</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 border border-orange-500/20 text-center">
                <Flame className="w-3.5 h-3.5 mx-auto mb-0.5 text-orange-400" />
                <div className="text-sm font-bold text-white">{todayStats.totalCalories > 0 ? todayStats.totalCalories : '--'}</div>
                <div className="text-[8px] text-slate-500">Cal Ativas</div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-2 border border-cyan-500/20 text-center">
                <Dumbbell className="w-3.5 h-3.5 mx-auto mb-0.5 text-cyan-400" />
                <div className="text-sm font-bold text-white">{exerciseData.workoutsThisMonth}</div>
                <div className="text-[8px] text-slate-500">Treinos</div>
              </div>
            </div>
            
            {/* Nutrição */}
            {nutritionData.caloriesConsumed > 0 && (
              <div className="mt-2 bg-slate-800/30 rounded-lg p-2 border border-green-500/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Apple className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] text-slate-400">Nutrição Hoje</span>
                  </div>
                  <span className="text-xs font-medium text-white">{nutritionData.caloriesConsumed} / {nutritionData.caloriesTarget} kcal</span>
                </div>
                <div className="mt-1.5 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all" style={{ width: `${Math.min(100, (nutritionData.caloriesConsumed / nutritionData.caloriesTarget) * 100)}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* DIAGNÓSTICO */}
          <div className={cn("transform transition-all duration-500", phase === 'diagnosis' ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Parecer Clínico</span>
            </div>
            
            <div className={cn("bg-slate-800/50 rounded-xl p-3 border", diagnosis.severity === 'good' ? "border-emerald-500/30" : diagnosis.severity === 'moderate' ? "border-yellow-500/30" : "border-red-500/30")}>
              {/* Pontos Positivos */}
              {diagnosis.positives.length > 0 && (
                <div className="space-y-1 mb-2">
                  {diagnosis.positives.slice(0, 2).map((p, i) => (
                    <p key={i} className="text-[11px] text-emerald-400 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {p}
                    </p>
                  ))}
                </div>
              )}
              
              {/* Pontos de Atenção */}
              {diagnosis.issues.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-700/50">
                  {diagnosis.issues.slice(0, 2).map((issue, i) => (
                    <p key={i} className="text-[11px] text-yellow-400 flex items-start gap-1.5">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {issue}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Prescrições */}
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Pill className="w-4 h-4 text-pink-400" />
                <span className="text-[10px] font-semibold text-pink-400 uppercase tracking-wider">Recomendações</span>
              </div>
              <div className="space-y-1.5">
                {diagnosis.prescriptions.slice(0, 3).map((rx, i) => (
                  <div key={i} className={cn("bg-slate-800/50 rounded-lg p-2 border flex items-center gap-2", rx.priority === 'high' ? "border-red-500/30" : rx.priority === 'medium' ? "border-yellow-500/30" : "border-emerald-500/30")}>
                    <span className="text-base">{rx.icon}</span>
                    <p className="text-[11px] text-slate-300 flex-1">{rx.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2 mb-3 text-[9px] text-slate-500">
            <Clock className="w-3 h-3" />
            <span>Consulta: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            {hasGoogleFit && <span className="ml-auto text-emerald-500">● Google Fit conectado</span>}
          </div>
          
          <button onClick={onNavigateToDrVital} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-3 flex items-center justify-center gap-2 font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25">
            <Stethoscope className="w-4 h-4" />
            Prontuário Completo
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          50% { top: 100%; opacity: 1; }
          60% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export default DrVitalConsultModal;
