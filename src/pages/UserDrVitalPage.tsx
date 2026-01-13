import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import MedicalDocumentsSection from '@/components/dashboard/MedicalDocumentsSection';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText,
  Upload,
  Clock,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Componentes Premium do Dr. Vital (já existentes)
import { HealthScoreCard } from '@/components/dr-vital/HealthScoreCard';
import { HealthTimeline } from '@/components/dr-vital/HealthTimeline';
import { HealthOraclePanel } from '@/components/dr-vital/HealthOraclePanel';
import { ReportGenerator } from '@/components/dr-vital/ReportGenerator';

// Usa imagem existente como placeholder até ter a imagem real
const drVitalImage = '/images/instituto-logo.png';

type ViewType = 'home' | 'exams' | 'timeline' | 'oracle' | 'reports';

const UserDrVitalPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('home');
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) navigate("/auth");
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session) navigate("/auth");
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent"
        />
      </div>
    );
  }

  if (!user) return null;

  // Sub-views com header consistente
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
      <div className="min-h-screen bg-background">
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-20 bg-background/95 backdrop-blur-lg border-b"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setActiveView('home')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold">{config.title}</h1>
          </div>
        </motion.header>
        
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4"
        >
          {config.component}
        </motion.main>
      </div>
    );
  }

  // HOME VIEW
  return (
    <div className="min-h-screen bg-background relative">
      {/* Header Simples */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-lg border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/dashboard')}
            className="rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">Dr. Vital</h1>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6 pb-72">
        {/* Health Score Card - Componente Premium */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <HealthScoreCard showBreakdown={false} />
        </motion.section>

        {/* Quick Actions Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Acesso Rápido</h2>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={Upload}
              title="Exames"
              subtitle="Upload e análise"
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
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.3 }}
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
      </main>

      {/* Dr. Vital FIXO - Grande e na frente de tudo */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6, type: "spring" }}
        className="fixed bottom-0 right-0 z-50 pointer-events-none"
      >
        {/* Glow effect atrás */}
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
        
        {/* Badge flutuante */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute top-8 right-4 pointer-events-auto"
        >
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/90 shadow-lg shadow-emerald-500/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-xs font-semibold text-white">Online</span>
          </div>
        </motion.div>

        {/* Imagem do Dr. Vital */}
        <img 
          src={drVitalImage}
          alt="Dr. Vital"
          className="w-56 h-auto object-contain drop-shadow-[0_-10px_40px_rgba(34,197,94,0.3)]"
        />
      </motion.div>
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

export default UserDrVitalPage;
