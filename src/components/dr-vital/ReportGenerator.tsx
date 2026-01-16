import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  FileText, 
  Download, 
  Share2, 
  Calendar, 
  Loader2, 
  Copy, 
  Check,
  Clock,
  Eye,
  Trash2,
  Link2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services/dr-vital/reportService';
import type { HealthReport, ReportType } from '@/types/dr-vital-revolution';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import DOMPurify from 'dompurify';

type PeriodOption = '7' | '30' | '90' | '180';

const PERIOD_OPTIONS: { value: PeriodOption; label: string }[] = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 3 meses' },
  { value: '180', label: 'Últimos 6 meses' },
];

const REPORT_TYPES: { value: ReportType; label: string; description: string }[] = [
  { value: 'complete', label: 'Completo', description: 'Todos os dados de saúde' },
  { value: 'summary', label: 'Resumo', description: 'Visão geral rápida' },
  { value: 'exam_focused', label: 'Exames', description: 'Foco em resultados de exames' },
];

export const ReportGenerator: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedType, setSelectedType] = useState<ReportType>('complete');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>('30');
  const [previewReport, setPreviewReport] = useState<HealthReport | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Buscar relatórios existentes
  const { data: reports, isLoading: loadingReports } = useQuery({
    queryKey: ['dr-vital-reports', user?.id],
    queryFn: () => reportService.getUserReports(user!.id),
    enabled: !!user?.id,
  });

  // Mutation para gerar relatório
  const generateMutation = useMutation({
    mutationFn: async () => {
      const days = parseInt(selectedPeriod);
      const period = {
        start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
        end: new Date(),
      };
      return reportService.generateReport(user!.id, selectedType, period);
    },
    onSuccess: (report) => {
      queryClient.invalidateQueries({ queryKey: ['dr-vital-reports'] });
      toast.success('Relatório gerado com sucesso!');
      setPreviewReport(report);
    },
    onError: () => {
      toast.error('Erro ao gerar relatório');
    },
  });

  // Mutation para criar link compartilhável
  const shareMutation = useMutation({
    mutationFn: (reportId: string) => reportService.createShareableLink(reportId),
    onSuccess: async (data) => {
      await navigator.clipboard.writeText(data.shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast.success('Link copiado para a área de transferência!');
      queryClient.invalidateQueries({ queryKey: ['dr-vital-reports'] });
    },
    onError: () => {
      toast.error('Erro ao criar link compartilhável');
    },
  });

  // Mutation para revogar link
  const revokeMutation = useMutation({
    mutationFn: (reportId: string) => reportService.revokeShareableLink(reportId),
    onSuccess: () => {
      toast.success('Link revogado com sucesso');
      queryClient.invalidateQueries({ queryKey: ['dr-vital-reports'] });
    },
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const getReportTypeLabel = (type: ReportType) => {
    return REPORT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Gerador de Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Gerar Novo Relatório
          </CardTitle>
          <CardDescription>
            Crie relatórios personalizados para compartilhar com profissionais de saúde
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tipo de Relatório */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Relatório</label>
              <Select value={selectedType} onValueChange={(v) => setSelectedType(v as ReportType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span>{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Período */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as PeriodOption)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="w-full"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando relatório...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Gerar Relatório
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            Relatórios Anteriores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingReports ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports && reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          Relatório {getReportTypeLabel(report.type)}
                        </span>
                        {report.shareableLink && (
                          <Badge variant="outline" className="text-xs">
                            <Link2 className="w-3 h-3 mr-1" />
                            Compartilhado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {formatDate(report.period.start)} - {formatDate(report.period.end)}
                        </span>
                        {report.downloadCount > 0 && (
                          <>
                            <span>•</span>
                            <Download className="w-3 h-3" />
                            <span>{report.downloadCount} downloads</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewReport(report)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    
                    {report.shareableLink ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeMutation.mutate(report.id)}
                        disabled={revokeMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareMutation.mutate(report.id)}
                        disabled={shareMutation.isPending}
                      >
                        {copiedLink ? (
                          <Check className="w-4 h-4 text-green-500" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum relatório gerado ainda</p>
              <p className="text-sm">Gere seu primeiro relatório acima</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Preview */}
      <Dialog open={!!previewReport} onOpenChange={() => setPreviewReport(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Relatório de Saúde
            </DialogTitle>
            <DialogDescription>
              {previewReport && (
                <>
                  {formatDate(previewReport.period.start)} - {formatDate(previewReport.period.end)}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {previewReport && (
            <div className="space-y-6">
              {/* Análise AI */}
              <div className="prose prose-sm max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(previewReport.aiAnalysis
                      .replace(/## /g, '<h2 class="text-lg font-semibold mt-4 mb-2">')
                      .replace(/### /g, '<h3 class="text-base font-medium mt-3 mb-1">')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br />'))
                  }} 
                />
              </div>

              {/* Recomendações */}
              {previewReport.recommendations.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recomendações</h3>
                  <ul className="space-y-2">
                    {previewReport.recommendations.map((rec, idx) => (
                      <li 
                        key={idx}
                        className="flex items-start gap-2 p-2 rounded-lg bg-primary/5"
                      >
                        <span className="text-primary">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ações */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    shareMutation.mutate(previewReport.id);
                  }}
                  disabled={shareMutation.isPending}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      Link Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Link
                    </>
                  )}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    // Implementar download PDF
                    toast.info('Download de PDF em desenvolvimento');
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Baixar PDF
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportGenerator;
