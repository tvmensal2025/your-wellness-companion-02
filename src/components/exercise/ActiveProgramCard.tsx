import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Eye,
  Pause,
  Play,
  Dumbbell,
  Award,
  Flame
} from 'lucide-react';
import { WorkoutProgramModal } from './WorkoutProgramModal';

interface ActiveProgramCardProps {
  program: any;
  onPause?: () => void;
  onResume?: () => void;
}

export const ActiveProgramCard: React.FC<ActiveProgramCardProps> = ({
  program,
  onPause,
  onResume
}) => {
  const [showModal, setShowModal] = useState(false);

  if (!program) return null;

  const progress = Math.round((program.completed_workouts / program.total_workouts) * 100);

  return (
    <>
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800 shadow-xl hover:shadow-2xl transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {program.plan_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {program.description}
                </p>
              </div>
            </div>
            <Badge className="bg-green-500 text-white border-0">
              <Flame className="w-3 h-3 mr-1" />
              Ativo
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Métricas principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">Duração</span>
              </div>
              <div className="text-2xl font-bold">{program.duration_weeks}</div>
              <div className="text-xs text-muted-foreground">semanas</div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Frequência</span>
              </div>
              <div className="text-2xl font-bold">{program.frequency_per_week}x</div>
              <div className="text-xs text-muted-foreground">por semana</div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-medium">Duração</span>
              </div>
              <div className="text-lg font-bold">{program.time_per_session}</div>
              <div className="text-xs text-muted-foreground">por treino</div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Nível</span>
              </div>
              <div className="text-lg font-bold capitalize">{program.level}</div>
              <div className="text-xs text-muted-foreground">atual</div>
            </div>
          </div>

          {/* Progresso */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold text-lg">Progresso Geral</span>
              </div>
              <span className="text-3xl font-bold text-blue-600">{progress}%</span>
            </div>
            
            <Progress value={progress} className="h-4 mb-3" />
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {program.completed_workouts} de {program.total_workouts} treinos completos
              </span>
              <span className="font-medium text-primary">
                Semana {program.current_week}/{program.duration_weeks}
              </span>
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium"
              size="lg"
              onClick={() => setShowModal(true)}
            >
              <Eye className="w-5 h-5 mr-2" />
              Ver Programa Completo
            </Button>
            
            {program.status === 'active' ? (
              <Button 
                variant="outline"
                size="lg"
                onClick={onPause}
                className="border-2"
              >
                <Pause className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                variant="outline"
                size="lg"
                onClick={onResume}
                className="border-2"
              >
                <Play className="w-5 h-5" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <WorkoutProgramModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        program={program}
      />
    </>
  );
};
