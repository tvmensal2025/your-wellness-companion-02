import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import MedicalDocumentsSection from '@/components/dashboard/MedicalDocumentsSection';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText,
  Upload,
  Clock,
  Eye,
  ChevronRight,
  Heart,
  Activity,
  Sparkles,
  Shield,
  Zap,
  Brain,
  Stethoscope,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

// Componentes Premium do Dr. Vital (já existentes)
import { HealthScoreCard } from '@/components/dr-vital/HealthScoreCard';
import { HealthTimeline } from '@/components/dr-vital/HealthTimeline';
import { HealthOraclePanel } from '@/components/dr-vital/HealthOraclePanel';
import { ReportGenerator } from '@/components/dr-vital/ReportGenerator';

// Usar path público direto (imagem WebP existe em public/images/)
const drVitalImage = '/images/dr-vital-full.webp';

type ViewType = 'home' | 'exams' | 'timeline' | 'oracle' | 'reports';

// =====================================================
// HERO HEALTH SCORE - Design Premium
// =====================================================
const HeroHealthScore = ({ score = 78, onTap }: { score?: number; onTap?: () => void }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0;
      const interval = setInterval(() => {
        current += 2;
        if (current >= score) {
          setAnimatedScore(score);
          clearInterval(interval);
        } else {
          setAnimatedScore(current);
        }
      }, 20);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  const getScoreColor = () => {
    if (score >= 80) return { ring: 'stroke-emerald-500', glow: 'shadow-emerald-500/50', text: 'text-emerald-400' };
    if (score >= 60) return { ring: 'stroke-amber-500', glow: 'shadow-amber-500/50', text: 'text-amber-400' };
    return { ring: 'stroke-red-500', glow: 'shadow-red-500/50', text: 'text-red-400' };
  };

  const colors = getScoreColor();
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", duration: 0.8 }}
      className="relative"
      onClick={onTap}
    >
      {/* Glow Background */}
      <div className={cn(
        "absolute inset-0 rounded-full blur-2xl opacity-30",
        score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500"
      )} />
      
      {/* SVG Ring */}
      <svg className="w-36 h-36 transform -rotate-90 relative z-10" viewBox="0 0 120 120">
        {/* Background ring */}
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/20"
        />
        {/* Progress ring */}
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={colors.ring}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      
      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.span 
          className={cn("text-4xl font-bold", colors.text)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {animatedScore}
        </motion.span>
        <span className="text-xs text-muted-foreground">Health Score</span>
      </div>

      {/* Pulse effect */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-full border-2",
          score >= 80 ? "border-emerald-500/50" : score >= 60 ? "border-amber-500/50" : "border-red-500/50"
        )}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.div>
  );
};

// =====================================================
// QUICK INSIGHT CARDS - Métricas Rápidas
// =====================================================
const QuickInsightCard = ({ 
  icon: Icon, 
  label, 
  value, 
  status,
  delay = 0 
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  status: 'good' | 'warning' | 'alert';
  delay?: number;
}) => {
  const statusConfig = {
    good: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: 'text-emerald-500' },
    warning: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: 'text-amber-500' },
    alert: { bg: 'bg-red-500/10', border: 'border-red-500/30', icon: 'text-red-500' },
  };

  const config = statusConfig[status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border",
        config.bg, config.border
      )}
    >
      <div className={cn("p-2 rounded-lg", config.bg)}>
        <Icon className={cn("w-4 h-4", config.icon)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </motion.div>
  );
};

// =====================================================
// FEATURE CARD - Cards de Funcionalidades
// =====================================================
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient,
  badge,
  onClick,
  delay = 0
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  badge?: string;
  onClick: () => void;
  delay?: number;
}) => (
  <motion.button
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.02, x: 4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full relative overflow-hidden rounded-2xl p-4 text-left bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all group"
  >
    {/* Gradient accent */}
    <div className={cn(
      "absolute top-0 left-0 w-1 h-full rounded-l-2xl bg-gradient-to-b",
      gradient
    )} />
    
    <div className="flex items-center gap-4 pl-2">
      <div className={cn(
        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
        gradient
      )}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">{title}</h3>
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary/20 text-primary">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
    </div>
  </motion.button>
);

// =====================================================
// AI INSIGHT BANNER - Banner de Insights da IA
// =====================================================
const AIInsightBanner = ({ onClick }: { onClick?: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    onClick={onClick}
    className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20 border border-violet-500/30 cursor-pointer group"
  >
    {/* Animated gradient background */}
    <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-purple-600/10 to-fuchsia-600/10 animate-pulse" />
    
    <div className="relative flex items-start gap-3">
      <div className="p-2 rounded-xl bg-violet-500/20">
        <Sparkles className="w-5 h-5 text-violet-400" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-violet-400">Insight da IA</span>
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
          </span>
        </div>
        <p className="text-sm font-medium">
          Seus níveis de vitamina D estão 15% abaixo do ideal. Considere 15min de sol pela manhã.
        </p>
      </div>
      
      <ChevronRight className="w-5 h-5 text-violet-400 group-hover:translate-x-1 transition-transform" />
    </div>
  </motion.div>
);

// =====================================================
// DR VITAL AVATAR - Avatar Animado
// =====================================================
const DrVitalAvatar = () => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 0.2, type: "spring" }}
    className="fixed bottom-4 right-4 z-50"
  >
    {/* Glow */}
    <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-2xl scale-150" />
    
    {/* Badge Online */}
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 }}
      className="absolute -top-2 -right-2 z-20"
    >
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
        <span className="text-[10px] font-bold text-white">Online</span>
      </div>
    </motion.div>

    {/* Avatar Image */}
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/50 shadow-xl cursor-pointer"
    >
      <img 
        src={drVitalImage}
        alt="Dr. Vital"
        className="w-full h-full object-cover object-top scale-150 translate-y-2"
      />
    </motion.div>

    {/* Chat bubble */}
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2 }}
      className="absolute -left-32 top-1/2 -translate-y-1/2"
    >
      <div className="relative bg-card border rounded-xl px-3 py-2 shadow-lg">
        <p className="text-xs font-medium">Olá! Como posso ajudar?</p>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-card border-r border-b rotate-[-45deg]" />
      </div>
    </motion.div>
  </motion.div>
);

// =====================================================
// MAIN COMPONENT
// =====================================================
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

  // HOME VIEW - REDESIGNED
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-emerald-500/5 via-primary/5 to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-emerald-500" />
                Dr. Vital
              </h1>
              <p className="text-xs text-muted-foreground">Seu médico virtual</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="relative px-4 py-6 space-y-6 pb-32">
        {/* Hero Section - Health Score */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center text-center py-4"
        >
          <HeroHealthScore score={78} />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-4 flex items-center gap-2"
          >
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-xs font-medium text-emerald-500">+5 esta semana</span>
            </div>
          </motion.div>
          
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            Sua saúde está em bom caminho! Continue assim.
          </p>
        </motion.section>

        {/* Quick Insights Grid */}
        <section className="grid grid-cols-2 gap-3">
          <QuickInsightCard 
            icon={Heart} 
            label="Freq. Cardíaca" 
            value="72 bpm" 
            status="good"
            delay={0.2}
          />
          <QuickInsightCard 
            icon={Activity} 
            label="Pressão" 
            value="120/80" 
            status="good"
            delay={0.25}
          />
          <QuickInsightCard 
            icon={Brain} 
            label="Estresse" 
            value="Moderado" 
            status="warning"
            delay={0.3}
          />
          <QuickInsightCard 
            icon={Shield} 
            label="Imunidade" 
            value="Boa" 
            status="good"
            delay={0.35}
          />
        </section>

        {/* AI Insight Banner */}
        <AIInsightBanner onClick={() => setActiveView('oracle')} />

        {/* Features Section */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground px-1">Funcionalidades</h2>
          
          <FeatureCard
            icon={Upload}
            title="Enviar Exames"
            description="Upload e análise inteligente com IA"
            gradient="from-emerald-500 to-teal-600"
            badge="IA"
            onClick={() => setActiveView('exams')}
            delay={0.4}
          />
          
          <FeatureCard
            icon={Eye}
            title="Previsões de Saúde"
            description="Análise preditiva de riscos futuros"
            gradient="from-violet-500 to-purple-600"
            badge="Novo"
            onClick={() => setActiveView('oracle')}
            delay={0.45}
          />
          
          <FeatureCard
            icon={Clock}
            title="Linha do Tempo"
            description="Histórico completo da sua saúde"
            gradient="from-amber-500 to-orange-600"
            onClick={() => setActiveView('timeline')}
            delay={0.5}
          />
          
          <FeatureCard
            icon={FileText}
            title="Gerar Relatório"
            description="PDF profissional para seu médico"
            gradient="from-rose-500 to-pink-600"
            onClick={() => setActiveView('reports')}
            delay={0.55}
          />
        </section>

        {/* Recent Activity Preview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-sm font-semibold text-muted-foreground">Atividade Recente</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => setActiveView('timeline')}
            >
              Ver tudo
              <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
          </div>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                <ActivityItem 
                  icon={CheckCircle2}
                  iconColor="text-emerald-500"
                  title="Exame de sangue analisado"
                  time="Há 2 dias"
                />
                <ActivityItem 
                  icon={AlertTriangle}
                  iconColor="text-amber-500"
                  title="Vitamina D abaixo do ideal"
                  time="Há 3 dias"
                />
                <ActivityItem 
                  icon={TrendingUp}
                  iconColor="text-blue-500"
                  title="Health Score aumentou +3"
                  time="Há 1 semana"
                />
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>

      {/* Dr. Vital Avatar */}
      <DrVitalAvatar />
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ 
  icon: Icon, 
  iconColor, 
  title, 
  time 
}: { 
  icon: React.ElementType;
  iconColor: string;
  title: string;
  time: string;
}) => (
  <div className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors">
    <Icon className={cn("w-4 h-4", iconColor)} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{title}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  </div>
);

export default UserDrVitalPage;
