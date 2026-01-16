import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[], metadata: DocumentMetadata) => Promise<void>;
  uploading: boolean;
}

export interface DocumentMetadata {
  title: string;
  type: 'exame_laboratorial' | 'exame_imagem' | 'relatorio_medico' | 'prescricao' | 'historico_clinico' | 'certificado_medico';
  description?: string;
  doctor_name?: string;
  clinic_name?: string;
  exam_date?: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  open,
  onClose,
  onUpload,
  uploading
}) => {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    title: '',
    type: 'exame_laboratorial',
    description: '',
    doctor_name: '',
    clinic_name: '',
    exam_date: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um arquivo",
        variant: "destructive"
      });
      return;
    }

    if (!metadata.title) {
      toast({
        title: "Erro",
        description: "Preencha o título do documento",
        variant: "destructive"
      });
      return;
    }

    try {
      await onUpload(files, metadata);
      
      // Reset form
      setFiles([]);
      setMetadata({
        title: '',
        type: 'exame_laboratorial',
        description: '',
        doctor_name: '',
        clinic_name: '',
        exam_date: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error uploading:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enviar Documento Médico</DialogTitle>
          <DialogDescription>
            Faça upload de exames, relatórios ou outros documentos médicos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label>Arquivos</Label>
            <div className="mt-2">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar ou arraste arquivos
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, PNG, JPG (máx. 10MB por arquivo)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Selected Files */}
            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={metadata.title}
              onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
              placeholder="Ex: Hemograma Completo"
              disabled={uploading}
            />
          </div>

          {/* Type */}
          <div>
            <Label htmlFor="type">Tipo de Documento *</Label>
            <Select
              value={metadata.type}
              onValueChange={(value: any) => setMetadata({ ...metadata, type: value })}
              disabled={uploading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="exame_laboratorial">Exame Laboratorial</SelectItem>
                <SelectItem value="exame_imagem">Exame de Imagem</SelectItem>
                <SelectItem value="relatorio_medico">Relatório Médico</SelectItem>
                <SelectItem value="prescricao">Prescrição</SelectItem>
                <SelectItem value="historico_clinico">Histórico Clínico</SelectItem>
                <SelectItem value="certificado_medico">Certificado Médico</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={metadata.description}
              onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
              placeholder="Observações adicionais..."
              rows={3}
              disabled={uploading}
            />
          </div>

          {/* Doctor Name */}
          <div>
            <Label htmlFor="doctor">Nome do Médico</Label>
            <Input
              id="doctor"
              value={metadata.doctor_name}
              onChange={(e) => setMetadata({ ...metadata, doctor_name: e.target.value })}
              placeholder="Dr(a)..."
              disabled={uploading}
            />
          </div>

          {/* Clinic Name */}
          <div>
            <Label htmlFor="clinic">Clínica/Hospital</Label>
            <Input
              id="clinic"
              value={metadata.clinic_name}
              onChange={(e) => setMetadata({ ...metadata, clinic_name: e.target.value })}
              placeholder="Nome da instituição"
              disabled={uploading}
            />
          </div>

          {/* Exam Date */}
          <div>
            <Label htmlFor="exam_date">Data do Exame</Label>
            <Input
              id="exam_date"
              type="date"
              value={metadata.exam_date}
              onChange={(e) => setMetadata({ ...metadata, exam_date: e.target.value })}
              disabled={uploading}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={uploading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={uploading || files.length === 0}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar Documento
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
