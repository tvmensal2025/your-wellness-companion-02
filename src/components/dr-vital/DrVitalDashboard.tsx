import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText,
  Upload,
  Clock,
  Eye,
  ChevronRight,
  ArrowLeft,
  Stethoscope,
  Activity,
  Heart,
  Brain,
  Camera,
  Sparkles,
  MessageCircle,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Componentes Premium do Dr. Vital
import { HealthScoreCard } from '@/components/dr-vital/HealthScoreCard';
import { HealthTimeline } from '@/components/dr-vital/HealthTimeline';
import { HealthOraclePanel } from '@/components/dr-vital/HealthOraclePanel';
import { ReportGenerator } from '@/components/dr-vital/ReportGenerator';
import { HealthMetricsModal } from '@/components/dr-vital/HealthMetricsModal';
import MedicalDocumentsSection from '@/components/dashboard/MedicalDocumentsSection';

type ViewType = 'home' | 'exams' | 'timeline' | 'oracle' | 'reports';

interface DrVitalDashboardProps {
  embedded?: boolean;
}

export const DrVitalDashboard: React.FC<DrVitalDashboardProps> = ({ embedded = true }) => {
  const [activeView, setActiveView] = useState<ViewType>('home');
  const [healthMetricsOpen, setHealthMetricsOpen] = useState(false);

  // Sub-views
  if (activeView !== 'home') {
    const viewConfig: Record<Exclude<ViewType, 'home'>, { title: string; component: React.ReactNode }> = {
      exams: { 
        title: 'Meus Exames', 
        component: <MedicalDocumentsSection hideStatsCards /> 
      },
      timeline: { 
        title: 'Linha do Tempo', 
        component: <HealthTimeline showFilters /> 
      },
      oracle: { 
        title: 'Previsões de Saúde', 
        component: <HealthOraclePanel /> 
      },
      reports: { 
        title: 'Gerar Relatório', 
        component: <ReportGenerator /> 
      },
    };

    const config = viewConfig[activeView];

    return (
      <div className="space-y-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3"
        >
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setActiveView('home')}
            className="rounded-full h-9 w-9"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">{config.title}</h2>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {config.component}
        </motion.div>
      </div>
    );
  }

  // HOME VIEW
  return (
    <div className="space-y-5">
      {/* HERO IMPACTANTE - Análise de Exames */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-500 p-5"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
        
        {/* Pulse Animation */}
        <div className="absolute top-4 right-4">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-white"
          />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">Dr. Vital</h1>
              <p className="text-sm text-white/80">Seu guardião de saúde com IA</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-xs font-semibold text-white">Online</span>
            </div>
          </div>

          {/* CTA Principal - Analisar Exame */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('exams')}
            className="w-full bg-white/95 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-4 shadow-xl shadow-black/10 mb-4"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Camera className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold text-gray-900 text-base">Analisar Exame</h3>
              <p className="text-sm text-gray-600">Tire foto ou faça upload do seu exame</p>
            </div>
            <div className="flex items-center gap-1 text-blue-600">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-semibold">IA</span>
            </div>
          </motion.button>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <Shield className="w-5 h-5 text-white mx-auto mb-1" />
              <p className="text-lg font-bold text-white">100%</p>
              <p className="text-[10px] text-white/70">Privado</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <TrendingUp className="w-5 h-5 text-white mx-auto mb-1" />
              <p className="text-lg font-bold text-white">24/7</p>
              <p className="text-[10px] text-white/70">Disponível</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <Brain className="w-5 h-5 text-white mx-auto mb-1" />
              <p className="text-lg font-bold text-white">IA</p>
              <p className="text-[10px] text-white/70">Avançada</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Health Score Card - Compacto e Clicável */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onClick={() => setHealthMetricsOpen(true)}
        className="cursor-pointer"
      >
        <HealthScoreCard showBreakdown={false} />
      </motion.section>

      {/* Modal de Métricas de Saúde */}
      <HealthMetricsModal 
        open={healthMetricsOpen} 
        onOpenChange={setHealthMetricsOpen} 
      />

      {/* Quick Actions Grid */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Acesso Rápido</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            icon={Upload}
            title="Meus Exames"
            subtitle="Histórico completo"
            gradient="from-emerald-500 to-teal-600"
            onClick={() => setActiveView('exams')}
          />
          <QuickActionCard
            icon={Eye}
            title="Previsões"
            subtitle="IA analisa riscos"
            gradient="from-violet-500 to-purple-600"
            onClick={() => setActiveView('oracle')}
          />
          <QuickActionCard
            icon={Clock}
            title="Timeline"
            subtitle="Histórico de saúde"
            gradient="from-amber-500 to-orange-600"
            onClick={() => setActiveView('timeline')}
          />
          <QuickActionCard
            icon={FileText}
            title="Relatório"
            subtitle="PDF para médico"
            gradient="from-rose-500 to-pink-600"
            onClick={() => setActiveView('reports')}
          />
        </div>
      </motion.section>

      {/* Oracle Preview - Compact */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-medium text-muted-foreground">Previsões de Saúde</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7"
            onClick={() => setActiveView('oracle')}
          >
            Ver todas
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        <HealthOraclePanel compact />
      </motion.section>

      {/* Timeline Preview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pb-4"
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-medium text-muted-foreground">Eventos Recentes</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs h-7"
            onClick={() => setActiveView('timeline')}
          >
            Ver todos
            <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
        <HealthTimeline maxEvents={3} showFilters={false} />
      </motion.section>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  gradient, 
  onClick 
}: { 
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient: string;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="relative overflow-hidden rounded-2xl p-4 text-left bg-card border border-border/50 hover:border-border hover:shadow-lg transition-all"
  >
    <div className={cn(
      "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3 shadow-lg",
      gradient
    )}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h3 className="font-semibold text-sm">{title}</h3>
    <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
  </motion.button>
);

export default DrVitalDashboard;
