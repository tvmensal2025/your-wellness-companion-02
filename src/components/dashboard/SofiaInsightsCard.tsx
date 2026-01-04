import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, MessageCircle, ChevronRight, Lightbulb, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface Insight {
  id: string;
  type: 'tip' | 'alert' | 'celebration' | 'analysis';
  title: string;
  message: string;
  priority: number;
  icon: React.ElementType;
}

interface SofiaInsightsCardProps {
  healthScore?: number;
  weightChange?: number;
  currentStreak?: number;
  lastMeasurementDays?: number;
}

export const SofiaInsightsCard: React.FC<SofiaInsightsCardProps> = ({
  healthScore = 50,
  weightChange = 0,
  currentStreak = 0,
  lastMeasurementDays = 0
}) => {
  const navigate = useNavigate();
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [insights, setInsights] = useState<Insight[]>([]);

  // Generate insights based on user data
  useEffect(() => {
    const generatedInsights: Insight[] = [];

    // Weight progress insight
    if (weightChange < -0.5) {
      generatedInsights.push({
        id: 'weight-loss',
        type: 'celebration',
        title: 'Parabéns! Você está perdendo peso 🎉',
        message: `Você perdeu ${Math.abs(weightChange).toFixed(1)}kg recentemente. Continue com esse ritmo incrível!`,
        priority: 1,
        icon: CheckCircle2
      });
    } else if (weightChange > 0.5) {
      generatedInsights.push({
        id: 'weight-gain',
        type: 'tip',
        title: 'Atenção ao ganho de peso',
        message: 'Pequenas flutuações são normais, mas vamos manter o foco na sua meta!',
        priority: 2,
        icon: Lightbulb
      });
    }

    // Health score insight
    if (healthScore >= 80) {
      generatedInsights.push({
        id: 'health-excellent',
        type: 'celebration',
        title: 'Seu score de saúde está excelente!',
        message: 'Você está cuidando muito bem de si mesmo. Continue assim!',
        priority: 1,
        icon: TrendingUp
      });
    } else if (healthScore < 40) {
      generatedInsights.push({
        id: 'health-low',
        type: 'alert',
        title: 'Vamos melhorar juntos!',
        message: 'Pequenos ajustes diários podem fazer grande diferença no seu bem-estar.',
        priority: 1,
        icon: AlertTriangle
      });
    }

    // Streak insight
    if (currentStreak >= 7) {
      generatedInsights.push({
        id: 'streak-week',
        type: 'celebration',
        title: `${currentStreak} dias de sequência! 🔥`,
        message: 'Sua consistência é impressionante. Isso é o que traz resultados reais!',
        priority: 2,
        icon: CheckCircle2
      });
    }

    // Measurement reminder
    if (lastMeasurementDays >= 3) {
      generatedInsights.push({
        id: 'measurement-reminder',
        type: 'tip',
        title: 'Hora de pesar-se!',
        message: `Já faz ${lastMeasurementDays} dias desde sua última pesagem. Manter a frequência ajuda a acompanhar melhor.`,
        priority: 3,
        icon: Lightbulb
      });
    }

    // Default tip if no insights
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: 'default-tip',
        type: 'tip',
        title: 'Dica do dia',
        message: 'Beba água antes das refeições. Isso ajuda na saciedade e hidratação!',
        priority: 5,
        icon: Lightbulb
      });
    }

    // Sort by priority
    generatedInsights.sort((a, b) => a.priority - b.priority);
    setInsights(generatedInsights);
  }, [healthScore, weightChange, currentStreak, lastMeasurementDays]);

  // Auto-rotate insights
  useEffect(() => {
    if (insights.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentInsightIndex(prev => (prev + 1) % insights.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [insights.length]);

  const currentInsight = insights[currentInsightIndex];

  const getInsightStyles = (type: string) => {
    switch (type) {
      case 'celebration':
        return {
          gradient: 'from-emerald-500/10 via-green-500/5 to-teal-500/10',
          border: 'border-emerald-500/20',
          iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
          glow: 'shadow-emerald-500/20'
        };
      case 'alert':
        return {
          gradient: 'from-amber-500/10 via-orange-500/5 to-yellow-500/10',
          border: 'border-amber-500/20',
          iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
          glow: 'shadow-amber-500/20'
        };
      case 'analysis':
        return {
          gradient: 'from-blue-500/10 via-cyan-500/5 to-sky-500/10',
          border: 'border-blue-500/20',
          iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
          glow: 'shadow-blue-500/20'
        };
      default:
        return {
          gradient: 'from-violet-500/10 via-purple-500/5 to-fuchsia-500/10',
          border: 'border-violet-500/20',
          iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
          glow: 'shadow-violet-500/20'
        };
    }
  };

  if (!currentInsight) return null;

  const styles = getInsightStyles(currentInsight.type);
  const InsightIcon = currentInsight.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r ${styles.gradient} border ${styles.border} shadow-lg ${styles.glow}`}
    >
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
      />

      <div className="relative p-4">
        {/* Header with Sofia branding */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
            >
              <Brain className="h-4 w-4 text-white" />
            </motion.div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-foreground">Sofia IA</span>
                <Sparkles className="h-3 w-3 text-violet-500" />
              </div>
              <span className="text-[9px] text-muted-foreground">Insights Personalizados</span>
            </div>
          </div>

          {/* Insight pagination dots */}
          {insights.length > 1 && (
            <div className="flex gap-1">
              {insights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentInsightIndex(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentInsightIndex 
                      ? 'bg-primary w-4' 
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Insight content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentInsight.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-3"
          >
            <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${styles.iconBg} shadow-lg`}>
              <InsightIcon className="h-5 w-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground mb-0.5">{currentInsight.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{currentInsight.message}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* CTA */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/30">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => navigate('/sofia')}
          >
            <MessageCircle className="h-3.5 w-3.5 mr-1" />
            Falar com Sofia
            <ChevronRight className="h-3.5 w-3.5 ml-0.5" />
          </Button>

          {/* Online indicator */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Online</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
