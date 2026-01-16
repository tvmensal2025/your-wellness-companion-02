import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react';
import { uploadToVPS, isVPSConfigured, deleteVPSFile } from '@/lib/vpsApi';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageChange: (url: string | null) => void;
  productId: string;
  productName: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageChange,
  productId,
  productName
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Use JPG, PNG, WebP ou GIF.');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setError(null);
    uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      // Verificar se VPS está configurada
      if (!isVPSConfigured()) {
        throw new Error('VPS não configurada. Configure VITE_VPS_API_URL e VITE_VPS_API_KEY.');
      }

      // Simular progresso inicial
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            clearInterval(progressInterval);
            return 80;
          }
          return prev + 10;
        });
      }, 100);

      // Upload para MinIO via VPS
      const result = await uploadToVPS(file, 'product-images');

      // Completar progresso
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      const publicUrl = result.url;
      setPreviewUrl(publicUrl);
      onImageChange(publicUrl);
      
      setTimeout(() => {
        setUploading(false);
      }, 300);

    } catch (err) {
      console.error('Erro no upload:', err);
      setError(err instanceof Error ? err.message : 'Erro no upload da imagem');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeImage = async () => {
    try {
      if (currentImageUrl) {
        // Extrair nome do arquivo da URL
        const urlParts = currentImageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // Tentar deletar do MinIO
        try {
          await deleteVPSFile('product-images', fileName);
        } catch (deleteErr) {
          console.warn('Não foi possível deletar arquivo do storage:', deleteErr);
        }
      }

      setPreviewUrl(null);
      onImageChange(null);
      setError(null);

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Erro ao remover imagem:', err);
      setError('Erro ao remover imagem');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Verificar se VPS está configurada
  const vpsConfigured = isVPSConfigured();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Imagem do Produto</h3>
        {previewUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={removeImage}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4 mr-1" />
            Remover
          </Button>
        )}
      </div>

      {/* Aviso se VPS não configurada */}
      {!vpsConfigured && (
        <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-500" />
          <span className="text-yellow-700 text-sm">
            VPS não configurada. Configure VITE_VPS_API_URL e VITE_VPS_API_KEY no .env
          </span>
        </div>
      )}

      {/* Preview da imagem */}
      {previewUrl ? (
        <Card className="border-2 border-dashed border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt={productName}
                  className="w-20 h-20 object-cover rounded-lg border"
                />
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-medium text-green-800">Imagem carregada com sucesso!</p>
                <p className="text-sm text-green-600">
                  {productName} - {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
          <CardContent className="p-8 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Nenhuma imagem selecionada</p>
            <p className="text-sm text-gray-500 mb-4">
              Formatos aceitos: JPG, PNG, WebP, GIF (máx. 5MB)
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={openFileDialog}
              disabled={uploading || !vpsConfigured}
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Enviando...' : 'Selecionar Imagem'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Progress bar durante upload */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Enviando imagem...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Input file oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Dicas de uso */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 <strong>Dicas para melhor resultado:</strong></p>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Use imagens quadradas (300x300px ou 500x500px)</li>
          <li>Fundo branco ou transparente funciona melhor</li>
          <li>Evite imagens com muito texto</li>
          <li>Qualidade alta mas arquivo otimizado</li>
        </ul>
      </div>
    </div>
  );
};
