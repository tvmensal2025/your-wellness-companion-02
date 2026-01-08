import React, { useRef, useState } from 'react';
import { Camera, X, Check, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface QuickPhotoCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (data: any) => void;
}

const QuickPhotoCapture: React.FC<QuickPhotoCaptureProps> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview da imagem
    const reader = new FileReader();
    reader.onload = (e) => {
      setCapturedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Fazer upload e análise
    await analyzeImage(file);
  };

  const analyzeImage = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      // Normalizar nome do arquivo
      const safeBaseName = file.name
        .normalize('NFD')
        .replace(/[^a-zA-Z0-9.]+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
      const fileName = `quick-${Date.now()}-${safeBaseName}`;

      // Upload
      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Análise via Sofia
      const { data, error } = await supabase.functions.invoke('sofia-image-analysis', {
        body: {
          imageUrl,
          userId: user?.id || 'guest',
          userContext: {
            currentMeal: 'refeicao',
            userName: user?.user_metadata?.full_name || 'usuário',
          },
        },
      });

      if (error) throw error;

      if (data.success) {
        setAnalysisResult(data);
        toast.success('Refeição analisada!');
      } else {
        throw new Error(data.message || 'Erro na análise');
      }

    } catch (error) {
      console.error('Erro na análise:', error);
      toast.error('Erro ao analisar imagem');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = async () => {
    if (!analysisResult || !user) return;

    try {
      // Salvar no nutrition_tracking
      const foods = analysisResult.food_detection?.foods_detected || 
                    analysisResult.alimentos_identificados || [];
      
      const totalCalories = analysisResult.total_calorias || 
                           analysisResult.food_detection?.total_calorias || 0;
      const totalProtein = analysisResult.food_detection?.total_proteina || 0;
      const totalCarbs = analysisResult.food_detection?.total_carboidratos || 0;
      const totalFat = analysisResult.food_detection?.total_gordura || 0;

      // Determinar tipo de refeição baseado no horário
      const hour = new Date().getHours();
      let mealType = 'snack';
      if (hour >= 5 && hour < 11) mealType = 'breakfast';
      else if (hour >= 11 && hour < 15) mealType = 'lunch';
      else if (hour >= 18 && hour < 22) mealType = 'dinner';

      const { error } = await supabase.from('nutrition_tracking').insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        meal_type: mealType,
        food_items: foods.map((f: any) => typeof f === 'string' ? f : f.nome),
        calories: totalCalories,
        protein_g: totalProtein,
        carbs_g: totalCarbs,
        fat_g: totalFat,
        source: 'quick_photo'
      });

      if (error) throw error;

      toast.success(`${mealType === 'breakfast' ? 'Café' : mealType === 'lunch' ? 'Almoço' : mealType === 'dinner' ? 'Jantar' : 'Lanche'} registrado! 🎯`);
      
      onSuccess?.(analysisResult);
      handleReset();
      onClose();

    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar refeição');
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Foto Rápida da Refeição
          </DialogTitle>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="space-y-4">
          {!capturedImage ? (
            <div 
              onClick={handleCapture}
              className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            >
              <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Toque para tirar foto ou selecionar imagem
              </p>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={capturedImage} 
                alt="Refeição" 
                className="w-full rounded-lg max-h-64 object-cover"
              />
              
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Analisando com IA...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {analysisResult && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Alimentos identificados:</h4>
              <div className="flex flex-wrap gap-1">
                {(analysisResult.food_detection?.foods_detected || 
                  analysisResult.alimentos_identificados || []).map((food: any, i: number) => (
                  <span 
                    key={i} 
                    className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs"
                  >
                    {typeof food === 'string' ? food : food.nome}
                  </span>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                <div className="bg-background rounded p-2">
                  <span className="text-muted-foreground">Calorias:</span>
                  <span className="ml-1 font-medium">
                    {Math.round(analysisResult.total_calorias || analysisResult.food_detection?.total_calorias || 0)} kcal
                  </span>
                </div>
                <div className="bg-background rounded p-2">
                  <span className="text-muted-foreground">Proteína:</span>
                  <span className="ml-1 font-medium">
                    {Math.round(analysisResult.food_detection?.total_proteina || 0)}g
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {capturedImage && (
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex-1"
                disabled={isAnalyzing}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Nova Foto
              </Button>
            )}
            
            {analysisResult && (
              <Button 
                onClick={handleConfirm}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-1" />
                Confirmar
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              onClick={onClose}
              disabled={isAnalyzing}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickPhotoCapture;
