import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DocumentCard } from './DocumentCard';
import { FileText } from 'lucide-react';

interface MedicalDocument {
  id: string;
  user_id: string;
  title: string;
  type: string;
  file_url?: string;
  file_name?: string;
  description?: string;
  doctor_name?: string;
  clinic_name?: string;
  exam_date?: string;
  status: 'normal' | 'alterado' | 'critico' | 'pendente';
  created_at: string;
  analysis_status?: 'processing' | 'ready' | 'error';
  report_path?: string | null;
  didactic_report_path?: string | null;
  processing_stage?: string | null;
  progress_pct?: number | null;
  images_processed?: number | null;
  images_total?: number | null;
}

interface DocumentListProps {
  documents: MedicalDocument[];
  loading: boolean;
  onViewReport: (doc: MedicalDocument) => void;
  onDownloadPdf: (doc: MedicalDocument) => void;
  onDownloadPng: (doc: MedicalDocument) => void;
  onDelete: (docId: string) => void;
  onTriggerAnalysis: (doc: MedicalDocument) => void;
  onRestartAnalysis: (doc: MedicalDocument) => void;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  loading,
  onViewReport,
  onDownloadPdf,
  onDownloadPng,
  onDelete,
  onTriggerAnalysis,
  onRestartAnalysis
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
          <p className="text-muted-foreground">
            Faça upload do seu primeiro documento médico para começar
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onViewReport={onViewReport}
          onDownloadPdf={onDownloadPdf}
          onDownloadPng={onDownloadPng}
          onDelete={onDelete}
          onTriggerAnalysis={onTriggerAnalysis}
          onRestartAnalysis={onRestartAnalysis}
        />
      ))}
    </div>
  );
};
