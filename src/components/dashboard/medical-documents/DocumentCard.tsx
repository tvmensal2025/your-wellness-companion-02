import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Calendar, 
  Eye, 
  Download, 
  Trash2,
  FileImage,
  File,
  FileArchive
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MedicalDocument {
  id: string;
  title: string;
  type: string;
  file_url?: string;
  file_name?: string;
  description?: string;
  doctor_name?: string;
  exam_date?: string;
  status: 'normal' | 'alterado' | 'critico' | 'pendente';
  created_at: string;
  report_path?: string | null;
  didactic_report_path?: string | null;
}

interface DocumentCardProps {
  document: MedicalDocument;
  onViewReport: (doc: MedicalDocument) => void;
  onDownloadPdf: (doc: MedicalDocument) => void;
  onDownloadPng: (doc: MedicalDocument) => void;
  onDelete: (doc: MedicalDocument) => void;
  onTriggerAnalysis: (doc: MedicalDocument) => void;
  onRestartAnalysis: (doc: MedicalDocument) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  document,
  onViewReport,
  onDownloadPdf,
  onDownloadPng,
  onDelete,
  onTriggerAnalysis,
  onRestartAnalysis
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'alterado': return 'bg-yellow-100 text-yellow-800';
      case 'critico': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exame_imagem': return <FileImage className="w-4 h-4" />;
      case 'exame_laboratorial': return <FileArchive className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'exame_laboratorial': 'Exame Laboratorial',
      'exame_imagem': 'Exame de Imagem',
      'relatorio_medico': 'Relatório Médico',
      'prescricao': 'Prescrição',
      'historico_clinico': 'Histórico Clínico',
      'certificado_medico': 'Certificado Médico'
    };
    return labels[type] || type;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon(document.type)}
              <h3 className="font-semibold text-sm truncate">{document.title}</h3>
            </div>
            
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {getTypeLabel(document.type)}
              </p>
              {document.exam_date && (
                <p className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(document.exam_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              )}
              {document.doctor_name && (
                <p className="truncate">Dr(a). {document.doctor_name}</p>
              )}
            </div>

            <div className="mt-2">
              <Badge className={getStatusColor(document.status)}>
                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-2">
            {(document.didactic_report_path || document.report_path) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewReport(document)}
                className="text-xs"
              >
                <Eye className="w-3 h-3 mr-1" />
                Relatório
              </Button>
            )}
            
            {document.file_url && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewReport(document)}
                  className="text-xs"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Ver
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownloadPdf(document)}
                  className="text-xs"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Baixar
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(document)}
              className="text-xs text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Excluir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
