import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dumbbell, Info, Play, Flame, Target, Zap, Clock, ChevronRight } from 'lucide-react';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { exerciseInstructions } from '@/data/exercise-instructions';
import { useExerciseProgram } from '@/hooks/useExerciseProgram';
import { motion } from 'framer-motion';

interface ExerciseDashboardProps {
  user: User | null;
}

// Novo dashboard de exercícios
// Foco: lista simples de exercícios + modal detalhado individual (estilo print)
export const ExerciseDashboard: React.FC<ExerciseDashboardProps> = ({ user }) => {
  const { activeProgram } = useExerciseProgram(user?.id);
  const [location, setLocation] = useState<'casa' | 'academia'>('casa');
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Define a localização com base no programa ativo salvo
  React.useEffect(() => {
    if (!activeProgram) return;

    // Alguns programas usam `exercises.location`, outros `plan_data.location`
    const rawLocation =
      (activeProgram as any).exercises?.location ||
      (activeProgram as any).plan_data?.location ||
      (activeProgram as any).planData?.location;

    if (!rawLocation) return;

    const loc = String(rawLocation).toLowerCase();

    // Qualquer coisa que comece com "casa" vira treino em casa (casa_sem, casa_equip, etc.)
    if (loc.startsWith('casa')) {
      setLocation('casa');
    } else if (loc.includes('academia')) {
      setLocation('academia');
    }
  }, [activeProgram]);

  const exerciseList =
    location === 'casa'
      ? Object.entries(exerciseInstructions.casa)
      : Object.entries(exerciseInstructions.academia);

  const openExercise = (name: string, details: any) => {
    setSelectedExercise({ name, ...details });
    setIsModalOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Hero Section - Design Premium */}
      <motion.section 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 px-5 py-8 md:px-8 md:py-10"
      >
        {/* Elementos decorativos de fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white shadow-xl"
          >
            <Flame className="w-8 h-8 md:w-10 md:h-10" />
          </motion.div>
          
          <div className="space-y-2 md:space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm text-[10px] md:text-xs font-semibold tracking-wide">
                <Zap className="w-3 h-3 mr-1" />
                TREINO DO DIA
              </Badge>
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-white leading-tight">
              Sua melhor versão começa agora! 💪
            </h2>
            <p className="text-sm md:text-base text-white/80 max-w-lg">
              Cada treino é uma conquista. Foco no movimento, não na perfeição.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex gap-3 md:flex-col">
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3">
              <Target className="w-4 h-4 text-white" />
              <div>
                <p className="text-[10px] text-white/70 uppercase tracking-wide">Exercícios</p>
                <p className="text-lg font-bold text-white">{exerciseList.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-xl px-3 py-2 md:px-4 md:py-3">
              <Clock className="w-4 h-4 text-white" />
              <div>
                <p className="text-[10px] text-white/70 uppercase tracking-wide">Duração</p>
                <p className="text-lg font-bold text-white">~30min</p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Location Badge */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-between items-center"
      >
        <div className="flex items-center gap-3">
          <Badge className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/50 dark:to-red-950/50 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 px-4 py-2 text-sm font-medium">
            {location === 'casa' ? '🏠 Treino em Casa' : '🏋️ Treino na Academia'}
          </Badge>
          <span className="text-sm text-muted-foreground hidden md:inline">
            {exerciseList.length} exercícios disponíveis
          </span>
        </div>
      </motion.section>

      {/* Lista de Exercícios - Design Premium */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-1"
      >
        {exerciseList.map(([name, details]: [string, any], index) => (
          <motion.div key={name} variants={itemVariants}>
            <Card
              className="group relative overflow-hidden border-0 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl"
              onClick={() => openExercise(name, details)}
            >
              {/* Hover Gradient Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-red-500/0 to-pink-500/0 group-hover:from-orange-500/5 group-hover:via-red-500/5 group-hover:to-pink-500/5 transition-all duration-500" />
              
              {/* Index Number */}
              <div className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-sm font-bold shadow-lg">
                {index + 1}
              </div>

              <CardContent className="p-5 pl-16 flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {details.descricao}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {details.nivel && (
                      <Badge variant="secondary" className="text-xs font-medium">
                        {details.nivel}
                      </Badge>
                    )}
                    {details.series && (
                      <Badge variant="outline" className="text-xs">
                        {details.series} séries
                      </Badge>
                    )}
                    {details.repeticoes && (
                      <Badge variant="outline" className="text-xs">
                        {details.repeticoes} reps
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-3 flex-shrink-0">
                  <Button
                    size="lg"
                    className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      openExercise(name, details);
                    }}
                  >
                    <Play className="w-5 h-5 md:w-6 md:h-6 text-white ml-0.5" fill="white" />
                  </Button>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                    Iniciar
                  </span>
                </div>
              </CardContent>

              {/* Bottom Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          </motion.div>
        ))}
      </motion.main>

      {selectedExercise && (
        <ExerciseDetailModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          exerciseData={selectedExercise}
          location={location}
        />
      )}
    </div>
  );
};
