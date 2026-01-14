import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Award,
  Users,
  Image as ImageIcon,
  Flame,
  Zap,
  Star,
  MoreHorizontal,
  Play,
  Edit,
  Share2
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { UpdateGoalProgressModal } from "./UpdateGoalProgressModal";

interface ModernGoalCardProps {
  goal: {
    id: string;
    title: string;
    description?: string;
    category: string;
    difficulty: 'facil' | 'medio' | 'dificil';
    status: string;
    target_value: number;
    current_value: number;
    unit: string;
    target_date?: string;
    estimated_points: number;
    participants?: any[];
    evidence_count?: number;
    streak_days?: number;
  };
  onUpdate?: () => void;
  onViewDetails?: () => void;
}

export const ModernGoalCard = ({ goal, onUpdate, onViewDetails }: ModernGoalCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  // Calcular progresso
  const progress = goal.target_value > 0 
    ? Math.min((goal.current_value / goal.target_value) * 100, 100) 
    : 0;

  // Cores por dificuldade
  const difficultyConfig = {
    facil: {
      gradient: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50',
      text: 'text-green-700',
      icon: '😊',
      label: 'Fácil'
    },
    medio: {
      gradient: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-50',
      text: 'text-yellow-700',
      icon: '😐',
      label: 'Médio'
    },
    dificil: {
      gradient: 'from-red-500 to-pink-500',
      bg: 'bg-red-50',
      text: 'text-red-700',
      icon: '😤',
      label: 'Difícil'
    }
  };

  const config = difficultyConfig[goal.difficulty] || difficultyConfig.medio;

  // Ícones por categoria
  const categoryIcons: Record<string, string> = {
    peso: '⚖️',
    exercicio: '🏃',
    alimentacao: '🥗',
    habitos: '📝',
    sono: '😴',
    agua: '💧'
  };

  const categoryIcon = goal.category ? categoryIcons[goal.category.toLowerCase()] || '🎯' : '🎯';

  // Status da meta
  const isCompleted = progress >= 100;
  const isNearComplete = progress >= 80 && progress < 100;
  const isAtRisk = goal.target_date && new Date(goal.target_date) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <Card className={cn(
        "relative overflow-hidden border-2 transition-all duration-300",
        isCompleted && "border-green-400 bg-green-50/30",
        isNearComplete && "border-orange-400",
        isAtRisk && !isCompleted && "border-red-400",
        isHovered && "shadow-2xl"
      )}>
        {/* Gradient Background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-5",
          config.gradient
        )} />

        {/* Streak Badge */}
        {goal.streak_days && goal.streak_days > 0 && (
          <motion.div
            className="absolute top-3 right-3 z-10"
            animate={{
              scale: isHovered ? [1, 1.1, 1] : 1,
              rotate: isHovered ? [0, 5, -5, 0] : 0
            }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              <Flame className="w-3 h-3" />
              {goal.streak_days}
            </div>
          </motion.div>
        )}

        <CardHeader className="pb-3 relative z-10">
          <div className="flex items-start justify-between gap-3">
            {/* Ícone e Título */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <motion.div
                className="text-3xl flex-shrink-0"
                animate={isHovered ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                transition={{ duration: 0.2 }}
              >
                {categoryIcon}
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-1">
                  {goal.title}
                </h3>
                
                {goal.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {goal.description}
                  </p>
                )}
                
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs font-medium",
                      config.bg,
                      config.text
                    )}
                  >
                    {config.icon} {config.label}
                  </Badge>
                  
                  <Badge variant="outline" className="text-xs">
                    <Award className="w-3 h-3 mr-1" />
                    {goal.estimated_points} pts
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Actions Menu */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowQuickActions(!showQuickActions)}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10">
          {/* Progress Ring */}
          <div className="flex items-center justify-center py-2">
            <div className="relative">
              {/* SVG Progress Ring */}
              <svg className="w-32 h-32 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 56 * (1 - progress / 100)
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={isCompleted ? "#10b981" : "#6366f1"} />
                    <stop offset="100%" stopColor={isCompleted ? "#34d399" : "#8b5cf6"} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  className="text-3xl font-bold"
                  animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {Math.round(progress)}%
                </motion.div>
                <div className="text-xs text-muted-foreground">
                  {goal.current_value}/{goal.target_value}
                </div>
                <div className="text-xs font-medium text-muted-foreground">
                  {goal.unit}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar (alternativa mobile) */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-semibold">
                {goal.current_value} / {goal.target_value} {goal.unit}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {goal.target_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">
                  {format(new Date(goal.target_date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}
            
            {goal.participants && goal.participants.length > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span className="text-xs">
                  {goal.participants.length} participante{goal.participants.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
            
            {goal.evidence_count && goal.evidence_count > 0 && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <ImageIcon className="w-4 h-4" />
                <span className="text-xs">
                  {goal.evidence_count} evidência{goal.evidence_count > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Completion Badge */}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg"
            >
              <Star className="w-5 h-5" />
              <span className="font-bold">Meta Concluída! 🎉</span>
            </motion.div>
          )}

          {/* Near Complete Badge */}
          {isNearComplete && !isCompleted && (
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg"
            >
              <Flame className="w-5 h-5" />
              <span className="font-bold">Quase lá! Continue assim! 🔥</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
              className="gap-2"
            >
              <Target className="w-4 h-4" />
              Detalhes
            </Button>
            
            <Button
              size="sm"
              onClick={() => setUpdateModalOpen(true)}
              className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
            >
              <Edit className="w-4 h-4" />
              Atualizar
            </Button>
          </div>

          {/* Quick Actions (quando hover) */}
          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-3 gap-2"
              >
                <Button variant="outline" size="sm" className="gap-1">
                  <Zap className="w-3 h-3" />
                  +1
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Star className="w-3 h-3" />
                  +5
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <Share2 className="w-3 h-3" />
                  Compartilhar
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Glow Effect for Completed Goals */}
        {isCompleted && (
          <motion.div
            className="absolute inset-0 border-2 border-green-400 rounded-lg pointer-events-none"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.02, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </Card>

      {/* Update Progress Modal */}
      <UpdateGoalProgressModal
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        goal={goal}
        onSuccess={() => {
          if (onUpdate) onUpdate();
        }}
      />
    </motion.div>
  );
};
