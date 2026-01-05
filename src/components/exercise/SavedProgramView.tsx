import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronDown, 
  ChevronUp, 
  Play, 
  CheckCircle2, 
  Calendar,
  Target,
  Clock,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeekActivity {
  week: number;
  activities: string[];
  days: string;
}

interface SavedProgramData {
  description?: string;
  goal?: string;
  level?: string;
  location?: string;
  limitation?: string;
  weeks?: WeekActivity[];
}

interface SavedProgramProps {
  program: {
    id: string;
    plan_name?: string;
    name?: string;
    current_week: number;
    duration_weeks: number;
    completed_workouts: number;
    total_workouts: number;
    workouts_per_week: number;
    status: string;
    plan_data?: SavedProgramData;
    exercises?: SavedProgramData;
    goal?: string;
    difficulty?: string;
  };
  onStartWorkout: (weekNumber: number, dayActivities: string[]) => void;
  onCompleteWorkout: () => void;
}

export const SavedProgramView: React.FC<SavedProgramProps> = ({
  program,
  onStartWorkout,
  onCompleteWorkout
}) => {
  const [expandedWeek, setExpandedWeek] = useState<number | null>(program.current_week);
  
  // Extrair dados do programa
  const programData = program.plan_data || program.exercises || {};
  const weeks = programData.weeks || [];
  const programName = program.plan_name || program.name || 'Meu Programa';
  const limitation = programData.limitation;
  const goal = program.goal || programData.goal;
  const level = program.difficulty || programData.level;
  const location = programData.location;
  
  // Calcular progresso
  const progressPercentage = program.total_workouts > 0 
    ? Math.round((program.completed_workouts / program.total_workouts) * 100)
    : 0;
    
  const currentWeekData = weeks.find((w: WeekActivity) => w.week === program.current_week);
  
  // Mapear labels bonitos
  const goalLabels: Record<string, string> = {
    hipertrofia: '💪 Hipertrofia',
    emagrecer: '🔥 Emagrecimento',
    emagrecimento: '🔥 Emagrecimento',
    condicionamento: '🏃 Condicionamento',
    saude: '❤️ Saúde',
    estresse: '🧘 Anti-Estresse'
  };
  
  const locationLabels: Record<string, string> = {
    academia: '🏋️ Academia',
    casa_com: '🏠 Casa (Equipamentos)',
    casa_sem: '🏠 Casa (Peso Corporal)',
    outdoor: '🌳 Ao Ar Livre'
  };
  
  const limitationLabels: Record<string, string> = {
    nenhuma: '',
    joelho: '🦵 Proteção Joelhos',
    costas: '🔙 Proteção Coluna',
    ombro: '💪 Proteção Ombros',
    cardiaco: '❤️ Cuidado Cardíaco'
  };

  if (weeks.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
          <p className="text-amber-700 dark:text-amber-300">
            Programa sem plano semanal detalhado. 
            Considere criar um novo programa personalizado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Programa */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-bold">{programName}</h3>
              <div className="flex flex-wrap gap-2">
                {goal && goalLabels[goal] && (
                  <Badge variant="secondary" className="text-xs">
                    {goalLabels[goal]}
                  </Badge>
                )}
                {location && locationLabels[location] && (
                  <Badge variant="outline" className="text-xs">
                    {locationLabels[location]}
                  </Badge>
                )}
                {limitation && limitation !== 'nenhuma' && limitationLabels[limitation] && (
                  <Badge variant="destructive" className="text-xs bg-amber-500">
                    {limitationLabels[limitation]}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{program.current_week}</p>
                <p className="text-xs text-muted-foreground">de {program.duration_weeks} semanas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{progressPercentage}%</p>
                <p className="text-xs text-muted-foreground">concluído</p>
              </div>
            </div>
          </div>
          
          {/* Barra de Progresso */}
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">
              {program.completed_workouts} de {program.total_workouts} treinos completos
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Aviso de Limitação */}
      {limitation && limitation !== 'nenhuma' && (
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-amber-800 dark:text-amber-200">
                  Exercícios Adaptados
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Seu programa foi ajustado para proteger: {limitationLabels[limitation]?.replace(/^[^\s]+\s/, '')}. 
                  Exercícios de impacto ou risco foram substituídos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Semanas do Programa */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Plano Semanal
        </h4>
        
        {weeks.map((week: WeekActivity) => {
          const isCurrentWeek = week.week === program.current_week;
          const isPastWeek = week.week < program.current_week;
          const isExpanded = expandedWeek === week.week;
          
          return (
            <Card 
              key={week.week}
              className={`transition-all duration-300 ${
                isCurrentWeek 
                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                  : isPastWeek 
                    ? 'border-green-200 bg-green-50/50 dark:bg-green-950/20'
                    : 'border-muted'
              }`}
            >
              <CardContent className="p-0">
                {/* Header da Semana */}
                <button
                  onClick={() => setExpandedWeek(isExpanded ? null : week.week)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors rounded-t-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCurrentWeek 
                        ? 'bg-primary text-primary-foreground' 
                        : isPastWeek 
                          ? 'bg-green-500 text-white'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isPastWeek ? <CheckCircle2 className="w-5 h-5" /> : week.week}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold">
                        Semana {week.week}
                        {isCurrentWeek && (
                          <Badge className="ml-2 bg-primary text-primary-foreground text-xs">
                            Atual
                          </Badge>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{week.days}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {isCurrentWeek && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStartWorkout(week.week, week.activities);
                        }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Treinar
                      </Button>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
                
                {/* Atividades da Semana */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-2 border-t border-muted pt-3">
                        {week.activities.map((activity, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Flame className="w-3 h-3 text-primary" />
                            </div>
                            <p className="text-sm leading-relaxed">{activity}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
