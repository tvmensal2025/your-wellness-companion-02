/**
 * Dr. Vital Dashboard - Foco em Saúde
 * Dashboard com Dr. Vital falando, monitoramento cardíaco real, tendência e pontos cardio
 * Usa dados REAIS do Google Fit
 * 
 * Validates: Requirements 4.1, 4.2, 4.4
 */

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useHealthData } from '@/hooks/useHealthData';
import { useDashboardNavigation } from '@/hooks/useDashboardNavigation';
import { useGoogleFitData } from '@/hooks/useGoogleFitData';
import { Stethoscope, Loader2, Heart, Activity, Zap, Smartphone, Sparkles, MessageCircle } from 'lucide-react';
import { DrVitalConsultModal } from '@/components/dr-vital/DrVitalConsultModal';

// Novos componentes cardio
import { HeartRateCard } from '@/components/cardio/HeartRateCard';
import { CardioTrendCard } from '@/components/cardio/CardioTrendCard';
import { CardioPointsCard } from '@/components/cardio/CardioPointsCard';

interface DrVitalDashboardProps {
  className?: string;
}

export function DrVitalDashboard({ className }: DrVitalDashboardProps) {
  const { navigate } = useDashboardNavigation();
  const { healthData, loading } = useHealthData();
  const { isConnected, data: googleFitData } = useGoogleFitData();
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);

  // Verificar se tem dados reais
  const hasRealData = isConnected && googleFitData && googleFitData.length > 0;

  // Gerar mensagem personalizada do Dr. Vital baseada nos dados
  const drVitalMessage = useMemo(() => {
    if (!hasRealData) {
      return "Olá! Conecte seu Google Fit para eu acompanhar sua saúde em tempo real! 📱";
    }
    if (healthData.score >= 80) {
      return "Excelente! Seus indicadores estão ótimos. Continue assim! 💪";
    } else if (healthData.score >= 60) {
      return "Bom trabalho! Sua saúde está no caminho certo. Vamos melhorar ainda mais? 📈";
    } else if (healthData.score >= 40) {
      return "Atenção aos seus indicadores. Pequenas mudanças fazem grande diferença! 🎯";
    } else {
      return "Vamos cuidar melhor da sua saúde? Estou aqui para ajudar! 🩺";
    }
  }, [healthData.score, hasRealData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-[calc(100dvh-180px)] pb-4 gap-2", className)}>
      {/* Dr. Vital com Balão de Fala - Clicável para abrir modal */}
      <button
        onClick={() => setIsConsultModalOpen(true)}
        className="bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-2xl p-4 flex-shrink-0 text-left hover:border-blue-500/50 hover:from-blue-500/25 transition-all duration-200 group"
      >
        <div className="flex items-start gap-3">
          {/* Avatar do Dr. Vital */}
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <img 
                src="/images/dr-vital-avatar.webp" 
                alt="Dr. Vital"
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden text-2xl">👨‍⚕️</span>
            </div>
            {/* Indicador online */}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          
          {/* Balão de Fala */}
          <div className="flex-1 relative">
            {/* Seta do balão */}
            <div className="absolute left-0 top-3 -ml-2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-muted/50" />
            
            <div className="bg-muted/50 rounded-2xl rounded-tl-sm p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-blue-400">Dr. Vital</span>
                <span className="text-[10px] text-muted-foreground">agora</span>
                <MessageCircle className="w-3 h-3 text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {drVitalMessage}
              </p>
              
              {/* Score inline - só mostra se tem dados */}
              {hasRealData && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                  <div className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-bold",
                    healthData.score >= 70 ? "bg-emerald-500/20 text-emerald-500" :
                    healthData.score >= 50 ? "bg-blue-500/20 text-blue-500" :
                    healthData.score >= 30 ? "bg-amber-500/20 text-amber-500" : 
                    "bg-red-500/20 text-red-500"
                  )}>
                    Score: {healthData.score}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {healthData.scoreLabel}
                  </span>
                  <span className="text-[10px] text-blue-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    Toque para consulta →
                  </span>
                </div>
              )}
              
              {/* Hint para clicar quando não tem dados */}
              {!hasRealData && (
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                  <span className="text-[10px] text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Toque para conversar →
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Se não tem dados, mostrar onboarding atrativo */}
      {!hasRealData ? (
        <>
          {/* Card de Conexão Google Fit - Compacto */}
          <div className="bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 border border-emerald-500/30 rounded-xl p-3 relative overflow-hidden">
            <div className="relative flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm">Conecte o Google Fit</h3>
                <p className="text-[10px] text-muted-foreground truncate">Desbloqueie análises em tempo real</p>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg py-2 px-3 flex items-center gap-1 font-medium text-xs hover:opacity-90 transition-all flex-shrink-0"
              >
                <Sparkles className="w-3 h-3" />
                Conectar
              </button>
            </div>
          </div>

          {/* Preview dos recursos - 3 cards em linha */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/30 rounded-xl p-2 border border-border text-center">
              <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-1">
                <Heart className="w-3 h-3 text-red-500" />
              </div>
              <p className="text-[9px] font-medium">Batimentos</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-2 border border-border text-center">
              <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-1">
                <Activity className="w-3 h-3 text-purple-500" />
              </div>
              <p className="text-[9px] font-medium">Tendências</p>
            </div>
            <div className="bg-muted/30 rounded-xl p-2 border border-border text-center">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-1">
                <Zap className="w-3 h-3 text-amber-500" />
              </div>
              <p className="text-[9px] font-medium">Pontos</p>
            </div>
          </div>

          {/* Dica compacta */}
          <div className="bg-muted/30 rounded-xl p-3 border border-border">
            <p className="text-xs text-muted-foreground leading-relaxed">
              💡 Caminhar 30 min/dia reduz risco cardíaco em 35%. Conecte o Google Fit!
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Cards horizontais - distribuição igual, expandem para preencher */}
          <HeartRateCard showStats={false} compact className="flex-1 min-h-[60px]" />
          <CardioPointsCard dailyGoal={150} compact className="flex-1 min-h-[60px]" />
          <CardioTrendCard compact className="flex-1 min-h-[80px]" />
        </>
      )}

      {/* Quick Action - Ver Exames - sempre no final */}
      <button
        onClick={() => navigate('/dr-vital')}
        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-3 flex items-center justify-center gap-2 font-medium text-sm hover:opacity-90 transition-opacity flex-shrink-0 mt-auto"
      >
        <Stethoscope className="w-4 h-4" />
        Consultar Dr. Vital
      </button>

      {/* Modal de Consulta Virtual */}
      <DrVitalConsultModal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        onNavigateToDrVital={() => {
          setIsConsultModalOpen(false);
          navigate('/dr-vital');
        }}
      />
    </div>
  );
}

export default DrVitalDashboard;
