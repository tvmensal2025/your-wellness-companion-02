import React from 'react';
import { motion } from 'framer-motion';
import { Scale, Bot, Apple, Trophy, FileText, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsGridProps {
  onWeightClick: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ onWeightClick }) => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Scale,
      label: 'Registrar Peso',
      description: 'Acompanhe sua evolução',
      gradient: 'from-emerald-500 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      onClick: onWeightClick,
      primary: true
    },
    {
      icon: Bot,
      label: 'Sofia IA',
      description: 'Tire suas dúvidas',
      gradient: 'from-violet-500 to-purple-600',
      shadow: 'shadow-violet-500/20',
      onClick: () => navigate('/sofia')
    },
    {
      icon: Apple,
      label: 'Nutrição',
      description: 'Plano alimentar',
      gradient: 'from-rose-500 to-pink-600',
      shadow: 'shadow-rose-500/20',
      onClick: () => navigate('/nutricao')
    },
    {
      icon: Trophy,
      label: 'Desafios',
      description: 'Ganhe pontos',
      gradient: 'from-amber-500 to-orange-600',
      shadow: 'shadow-amber-500/20',
      onClick: () => navigate('/goals')
    },
    {
      icon: FileText,
      label: 'Anamnese',
      description: 'Atualize seu perfil',
      gradient: 'from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/20',
      onClick: () => navigate('/anamnesis')
    }
  ];

  return (
    <div className="space-y-3">
      {/* Primary CTA - Registrar Peso */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileTap={{ scale: 0.98 }}
        onClick={onWeightClick}
        className={`w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r ${actions[0].gradient} ${actions[0].shadow} shadow-lg text-white`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
            <Scale className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold">{actions[0].label}</p>
            <p className="text-xs text-white/70">{actions[0].description}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-white/70" />
      </motion.button>

      {/* Secondary actions grid */}
      <div className="grid grid-cols-2 gap-3">
        {actions.slice(1).map((action, index) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={action.onClick}
            className="flex flex-col items-start p-4 rounded-2xl bg-card border border-border/50 hover:border-border transition-colors text-left"
          >
            <div className={`flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${action.gradient} ${action.shadow} shadow-md mb-3`}>
              <action.icon className="h-4 w-4 text-white" />
            </div>
            <p className="text-sm font-medium text-foreground">{action.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
