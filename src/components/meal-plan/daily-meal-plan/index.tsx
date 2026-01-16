import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Leaf, Download, Globe, FileText, TestTube } from 'lucide-react';
import { CompactMealPlanModal } from '../CompactMealPlanModal';
import sofiaImage from '@/assets/sofia.png';
import logoInstituto from '@/assets/logo-instituto.png';

// Hooks
import { useDailyPlanLogic } from './hooks/useDailyPlanLogic';
import type { DayPlan, Meal } from './hooks/useDailyPlanLogic';

// Sub-componentes
import { DailyMealList } from './DailyMealList';
import { DailyTotals } from './DailyTotals';

export interface DailyMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayPlan: DayPlan;
  title?: string;
}

/**
 * DailyMealPlanModal - Orchestrator
 * 
 * Modal para exibição de plano alimentar diário com:
 * - Totais nutricionais do dia
 * - Lista de refeições com macros
 * - Exportação para PDF, PNG e HTML
 * - Visualização compacta
 */
export const DailyMealPlanModal: React.FC<DailyMealPlanModalProps> = ({
  open,
  onOpenChange,
  dayPlan,
  title
}) => {
  const {
    compactModalOpen,
    setCompactModalOpen,
    handleDownloadPDF,
    handleDownloadPNG,
    handleOpenDetailed,
    handleTestDetailed,
  } = useDailyPlanLogic({ dayPlan });

  if (!dayPlan) return null;

  const dayTitle = title || `Plano Alimentar — Dia ${dayPlan.day}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background">
        {/* Header */}
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-center text-2xl font-bold text-primary flex items-center justify-center gap-2">
              <Leaf className="w-6 h-6 text-emerald-600" />
              {dayTitle}
            </DialogTitle>
            <div className="flex gap-2">
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handleDownloadPNG} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PNG
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenDetailed} className="print:hidden">
                <Globe className="w-4 h-4 mr-2" />
                Abrir Detalhado
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCompactModalOpen(true)} className="print:hidden" title="Visualização compacta com abas">
                <FileText className="w-4 h-4 mr-2" />
                Compacto
              </Button>
              <Button variant="outline" size="sm" onClick={handleTestDetailed} className="print:hidden" title="Testar com dados de exemplo">
                <TestTube className="w-4 h-4 mr-2" />
                Teste
              </Button>
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-lg text-emerald-600 font-semibold">PLANO ALIMENTAR CLÍNICO</div>
            <div className="text-sm text-muted-foreground">
              Dieta com meta diária {dayPlan.dailyTotals?.calories || 2000} kcal
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div id="daily-meal-plan-content" className="space-y-6 relative">
          {/* Logo transparente de fundo */}
          <div 
            className="fixed inset-0 pointer-events-none z-0 opacity-5 print:opacity-10"
            style={{ backgroundImage: `url(${logoInstituto})`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: '40%' }}
          />
          
          {/* Header para impressão */}
          <div className="hidden print:block text-center border-b pb-4 mb-6 relative z-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src={sofiaImage} alt="Sofia Nutricional" className="w-16 h-16 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-primary">{dayTitle}</h1>
                <p className="text-sm text-muted-foreground">Sofia Nutricional — MaxNutrition</p>
              </div>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
            {/* Totais do Dia */}
            {dayPlan.dailyTotals && <DailyTotals totals={dayPlan.dailyTotals} />}

            {/* Lista de Refeições */}
            <DailyMealList meals={dayPlan.meals} />

            {/* Footer */}
            <div className="text-center text-sm text-muted-foreground border-t pt-6 mt-8 relative z-10">
              <div className="flex items-center justify-center gap-2 text-emerald-600">
                <img src={sofiaImage} alt="Sofia" className="w-6 h-6 rounded-full" />
                <span className="font-semibold">Sofia Nutricional — MaxNutrition</span>
              </div>
              <p className="mt-1">Documento educativo • Consulte sempre um nutricionista</p>
              <p className="text-xs mt-2">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Modal Compacto */}
      <CompactMealPlanModal open={compactModalOpen} onOpenChange={setCompactModalOpen} dayPlan={dayPlan} title={dayTitle} />
    </Dialog>
  );
};

// Re-exports para compatibilidade
export type { DayPlan, Meal };
export default DailyMealPlanModal;
