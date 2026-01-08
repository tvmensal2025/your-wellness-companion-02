import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Loader2, 
  Share2, 
  Calendar,
  Activity,
  Heart,
  Moon,
  Flame,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

interface GoogleFitMetrics {
  steps: number;
  calories: number;
  activeMinutes: number;
  sleepHours: number;
  heartRateAvg: number;
  distance: number;
  weight?: number;
}

interface HealthReportData {
  metrics: GoogleFitMetrics;
  period: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
  userName?: string;
  analysis?: {
    summary: string;
    insights: Array<{ type: string; title: string; description: string }>;
    recommendations: string[];
    score: number;
  };
}

interface HealthReportExportProps {
  data: HealthReportData;
  onExportComplete?: () => void;
}

export const HealthReportExport: React.FC<HealthReportExportProps> = ({
  data,
  onExportComplete
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const { toast } = useToast();

  const getPeriodLabel = () => {
    switch (data.period) {
      case 'day': return 'Diário';
      case 'week': return 'Semanal';
      case 'month': return 'Mensal';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Header
      pdf.setFillColor(46, 125, 50); // Verde Instituto
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório de Saúde', margin, 25);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Período: ${getPeriodLabel()} | ${formatDate(data.startDate)} - ${formatDate(data.endDate)}`, margin, 35);

      yPos = 55;

      // User info
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Paciente:', margin, yPos);
      pdf.setFont('helvetica', 'normal');
      pdf.text(data.userName || 'Não informado', margin + 25, yPos);
      
      yPos += 15;

      // Score section
      if (data.analysis?.score) {
        pdf.setFillColor(240, 253, 244); // Verde claro
        pdf.roundedRect(margin, yPos - 5, pageWidth - (margin * 2), 30, 3, 3, 'F');
        
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(46, 125, 50);
        pdf.text(`Score de Saúde: ${data.analysis.score}/100`, margin + 5, yPos + 8);
        
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.setFont('helvetica', 'normal');
        pdf.text(data.analysis.summary || '', margin + 5, yPos + 20, { maxWidth: pageWidth - margin * 2 - 10 });
        
        yPos += 40;
      }

      // Metrics section
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Métricas de Atividade', margin, yPos);
      yPos += 10;

      // Metrics grid
      const metrics = [
        { label: 'Passos', value: data.metrics.steps.toLocaleString('pt-BR'), icon: '🚶' },
        { label: 'Calorias Ativas', value: `${data.metrics.calories.toLocaleString('pt-BR')} kcal`, icon: '🔥' },
        { label: 'Minutos Ativos', value: `${data.metrics.activeMinutes} min`, icon: '⏱️' },
        { label: 'Sono', value: `${data.metrics.sleepHours.toFixed(1)}h`, icon: '😴' },
        { label: 'FC Média', value: `${data.metrics.heartRateAvg} BPM`, icon: '❤️' },
        { label: 'Distância', value: `${(data.metrics.distance / 1000).toFixed(2)} km`, icon: '📍' },
      ];

      const colWidth = (pageWidth - margin * 2) / 3;
      metrics.forEach((metric, index) => {
        const col = index % 3;
        const row = Math.floor(index / 3);
        const x = margin + (col * colWidth);
        const y = yPos + (row * 25);

        pdf.setFillColor(249, 250, 251);
        pdf.roundedRect(x, y, colWidth - 5, 20, 2, 2, 'F');

        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`${metric.icon} ${metric.label}`, x + 5, y + 8);

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text(metric.value, x + 5, y + 16);
        pdf.setFont('helvetica', 'normal');
      });

      yPos += 60;

      // Insights section
      if (data.analysis?.insights && data.analysis.insights.length > 0) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Insights de Saúde', margin, yPos);
        yPos += 10;

        data.analysis.insights.forEach((insight, index) => {
          if (yPos > 250) {
            pdf.addPage();
            yPos = 20;
          }

          const bgColor = insight.type === 'success' ? [220, 252, 231] : 
                         insight.type === 'warning' ? [254, 243, 199] : [240, 249, 255];
          
          pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
          pdf.roundedRect(margin, yPos, pageWidth - margin * 2, 18, 2, 2, 'F');

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.setTextColor(0, 0, 0);
          pdf.text(insight.title, margin + 5, yPos + 7);

          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(80, 80, 80);
          pdf.setFontSize(9);
          pdf.text(insight.description, margin + 5, yPos + 14, { maxWidth: pageWidth - margin * 2 - 10 });

          yPos += 22;
        });
      }

      // Recommendations section
      if (data.analysis?.recommendations && data.analysis.recommendations.length > 0) {
        yPos += 10;
        
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 0, 0);
        pdf.text('Recomendações', margin, yPos);
        yPos += 10;

        data.analysis.recommendations.forEach((rec, index) => {
          if (yPos > 270) {
            pdf.addPage();
            yPos = 20;
          }

          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(60, 60, 60);
          pdf.text(`${index + 1}. ${rec}`, margin + 5, yPos);
          yPos += 8;
        });
      }

      // Footer
      const footerY = pdf.internal.pageSize.getHeight() - 15;
      pdf.setFillColor(46, 125, 50);
      pdf.rect(0, footerY - 5, pageWidth, 20, 'F');
      
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text('MaxNutrition - Relatório gerado automaticamente', margin, footerY);
      pdf.text(new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }), pageWidth - margin - 50, footerY);

      // Save
      const fileName = `relatorio-saude-${data.period}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      setIsGenerated(true);
      toast({
        title: "✅ Relatório gerado!",
        description: `Arquivo ${fileName} baixado com sucesso`
      });
      onExportComplete?.();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 p-1" />
        
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-semibold">Relatório Médico</span>
                <p className="text-sm text-muted-foreground font-normal">
                  Exportar para compartilhar com profissionais
                </p>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Calendar className="w-3 h-3" />
              {getPeriodLabel()}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Preview cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
              <Activity className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <p className="text-lg font-bold text-blue-700">{data.metrics.steps.toLocaleString()}</p>
              <p className="text-xs text-blue-600">Passos</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center">
              <Flame className="w-5 h-5 mx-auto mb-1 text-orange-600" />
              <p className="text-lg font-bold text-orange-700">{data.metrics.calories.toLocaleString()}</p>
              <p className="text-xs text-orange-600">Calorias</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center">
              <Moon className="w-5 h-5 mx-auto mb-1 text-purple-600" />
              <p className="text-lg font-bold text-purple-700">{data.metrics.sleepHours.toFixed(1)}h</p>
              <p className="text-xs text-purple-600">Sono</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-center">
              <Heart className="w-5 h-5 mx-auto mb-1 text-red-600" />
              <p className="text-lg font-bold text-red-700">{data.metrics.heartRateAvg}</p>
              <p className="text-xs text-red-600">FC Média</p>
            </div>
          </div>

          {/* Export info */}
          <div className="p-4 rounded-xl bg-muted/50 border border-muted">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              O relatório incluirá:
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-success" />
                Todas as métricas de atividade física
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-success" />
                Score de saúde e análise de IA
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-success" />
                Insights e recomendações personalizadas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-success" />
                Histórico do período selecionado
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={generatePDF}
              disabled={isGenerating}
              className="flex-1 gap-2"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando PDF...
                </>
              ) : isGenerated ? (
                <>
                  <Download className="w-4 h-4" />
                  Baixar Novamente
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Gerar Relatório PDF
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              className="gap-2"
              size="lg"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Relatório de Saúde',
                    text: `Meu score de saúde: ${data.analysis?.score || 'N/A'}/100`,
                  });
                } else {
                  toast({
                    title: "Compartilhamento",
                    description: "Gere o PDF e compartilhe manualmente"
                  });
                }
              }}
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
          </div>

          {isGenerated && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-success/10 border border-success/20 text-center"
            >
              <p className="text-sm text-success flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Relatório gerado com sucesso! Verifique sua pasta de downloads.
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
