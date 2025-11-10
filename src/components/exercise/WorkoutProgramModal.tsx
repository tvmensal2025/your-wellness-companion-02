import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Printer,
  CheckCircle2,
  FileText
} from 'lucide-react';
// Removed WorkoutDetailModal import - not needed for this modal

interface WorkoutProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: any;
}

export const WorkoutProgramModal: React.FC<WorkoutProgramModalProps> = ({
  isOpen,
  onClose,
  program
}) => {
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  if (!program) return null;

  const handleOpenDetail = (day: any, activities: any[]) => {
    setSelectedDay({
      name: day.label,
      group: day.group,
      activities: activities.map(a => a.activity).join('\n')
    });
    setDetailModalOpen(true);
  };

  const weekDays = [
    { key: 'seg', label: 'Segunda', short: 'SEG', group: 'PEITO/TRÍCEPS' },
    { key: 'ter', label: 'Terça', short: 'TER', group: 'COSTAS/BÍCEPS' },
    { key: 'qua', label: 'Quarta', short: 'QUA', group: 'PERNAS' },
    { key: 'qui', label: 'Quinta', short: 'QUI', group: 'OMBRO/CORE' },
    { key: 'sex', label: 'Sexta', short: 'SEX', group: 'FULL BODY/FORÇA' }
  ];

  // Processar weekPlan para organizar por dia
  const organizeByDay = () => {
    if (!program.week_plan || !Array.isArray(program.week_plan)) return {};
    
    const organized: any = {};
    
    program.week_plan.forEach((week: any) => {
      if (week.activities && Array.isArray(week.activities)) {
        week.activities.forEach((activity: string, dayIndex: number) => {
          const dayKey = weekDays[dayIndex]?.key;
          if (dayKey && activity && activity.trim() !== '') {
            if (!organized[dayKey]) {
              organized[dayKey] = [];
            }
            organized[dayKey].push({
              week: week.week,
              activity: activity
            });
          }
        });
      }
    });
    
    return organized;
  };

  const workoutsByDay = organizeByDay();

  const handlePrint = () => {
    window.print();
  };

  // Gerar lista de dias da semana abreviados para o badge
  const activeDays = weekDays
    .filter(day => workoutsByDay[day.key] && workoutsByDay[day.key].length > 0)
    .map(day => day.short)
    .join(', ');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden print:max-w-full print:max-h-full print:overflow-visible">
        {/* Header */}
        <DialogHeader className="print:text-center print:mb-6 border-b pb-4 print:border-0">
          <div className="flex items-center justify-between print:justify-center">
            <DialogTitle className="flex items-center gap-3 text-3xl text-success print:text-4xl">
              <Calendar className="w-8 h-8 print:hidden" />
              <span>Seu Plano Semanal</span>
            </DialogTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              className="print:hidden gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>
        </DialogHeader>

        {/* Conteúdo */}
        <ScrollArea className="max-h-[calc(90vh-150px)] print:max-h-full print:overflow-visible">
          <div className="space-y-6 p-6 print:p-0">
            {/* Header da Semana */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-2xl p-6 print:bg-blue-50 print:rounded-lg print:border-2 print:border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center font-bold text-2xl shadow-lg print:w-16 print:h-16">
                    1
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-primary print:text-4xl">
                      Semana 1
                    </h2>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className="text-base px-4 py-2 bg-white dark:bg-slate-800 border-2 border-primary text-primary font-semibold print:text-lg"
                >
                  {activeDays}
                </Badge>
              </div>
            </div>

            {/* Lista de todos os dias */}
            <div className="space-y-6">
              {weekDays.map((day) => {
                const dayActivities = workoutsByDay[day.key] || [];
                
                // Pular dias sem atividades
                if (dayActivities.length === 0) return null;
                
                return (
                  <div 
                    key={day.key}
                    className="bg-card border-2 border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow print:border print:shadow-none print:mb-8 print:page-break-inside-avoid"
                  >
                    {/* Header do dia */}
                    <div className="bg-gradient-to-r from-success/10 to-success/5 p-4 border-b-2 border-success/20">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground">
                            {day.short} - {day.group}
                          </h3>
                        </div>
                      </div>
                    </div>
                    
                    {/* Exercícios do dia */}
                    <div className="p-6 space-y-4">
                      <div className="space-y-2">
                        {dayActivities.map((workout: any, index: number) => {
                          const activityText = workout.activity;
                          
                          return (
                            <div 
                              key={index}
                              className="text-base leading-relaxed text-foreground"
                            >
                              {activityText}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Botão Detalhado */}
                      <div className="flex justify-center pt-4 border-t border-border print:hidden">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDetail(day, dayActivities)}
                          className="gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Detalhado
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>

      {/* Detalhes inline - removido modal desnecessário */}
    </Dialog>
  );
};