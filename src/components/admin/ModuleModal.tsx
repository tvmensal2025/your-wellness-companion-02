import { useState } from "react";
import { uploadToVPS } from "@/lib/vpsApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  FileText, 
  X, 
  Save, 
  AlertCircle,
  CheckCircle,
  ImageIcon
} from "lucide-react";

interface ModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moduleData: ModuleFormData) => void;
  courses: Array<{ id: string; title: string }>;
}

interface ModuleFormData {
  title: string;
  description: string;
  course_id?: string; // Opcional para módulos independentes
  order_index: number;
  is_active: boolean;
  thumbnail_url?: string;
}

export const ModuleModal = ({ isOpen, onClose, onSubmit, courses }: ModuleModalProps) => {
  const [formData, setFormData] = useState<ModuleFormData>({
    title: "",
    description: "",
    course_id: "",
    order_index: 1,
    is_active: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const handleInputChange = (field: keyof ModuleFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    // Description validation removed

    // Curso é obrigatório
    if (!formData.course_id) {
      newErrors.course_id = "Curso é obrigatório";
    }

    if (formData.order_index < 1) {
      newErrors.order_index = "Ordem deve ser maior que 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let finalThumb: string | undefined = imageUrl || undefined;
      if (!imageUrl && file) {
        // Upload para MinIO via VPS
        const result = await uploadToVPS(file, 'course-thumbnails');
        finalThumb = result.url;
      }

      const moduleData = {
        ...formData,
        description: formData.description || "Módulo criado automaticamente",
        thumbnail_url: finalThumb
      };
      await onSubmit(moduleData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        course_id: "",
        order_index: 1,
        is_active: true
      });
      setErrors({});
      setImageUrl("");
      setFile(null);
      onClose();
    } catch (error) {
      console.error("Erro ao criar módulo:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: "",
        description: "",
        course_id: "",
        order_index: 1,
        is_active: true
      });
      setErrors({});
      setImageUrl("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border text-foreground max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FileText className="h-6 w-6 text-blue-500" />
            CRIAR NOVO MÓDULO
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Título do Módulo */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-muted-foreground">
              📝 Título do Módulo
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Digite o título do módulo..."
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
            {errors.title && (
              <div className="flex items-center gap-1 text-red-400 text-sm">
                <AlertCircle className="h-4 w-4" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Description field removed to prevent the UI from becoming too large */}

          {/* Curso e Ordem */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course_id" className="text-sm font-medium text-muted-foreground">
                📚 Curso
              </Label>
              <Select 
                value={formData.course_id} 
                onValueChange={(value) => handleInputChange("course_id", value)}
              >
                <SelectTrigger className="bg-muted border-border text-foreground">
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id} className="text-foreground hover:bg-muted">
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.course_id && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.course_id}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="order_index" className="text-sm font-medium text-muted-foreground">
                🔢 Ordem
              </Label>
              <Input
                id="order_index"
                type="number"
                value={formData.order_index}
                onChange={(e) => handleInputChange("order_index", parseInt(e.target.value) || 1)}
                placeholder="1"
                min="1"
                className="bg-muted border-border text-foreground"
              />
              {errors.order_index && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.order_index}
                </div>
              )}
            </div>
          </div>

          {/* Imagem de Capa */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium text-muted-foreground">
              🖼️ URL da Imagem de Capa
            </Label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/imagem.jpg"
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-muted-foreground text-xs">
              URL direta da imagem para ser usada como capa do módulo
            </p>
            <div className="mt-2">
              <Label className="text-sm font-medium text-muted-foreground">ou Upload de arquivo</Label>
              <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
            {imageUrl && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                <div className="w-32 h-20 bg-muted rounded-lg overflow-hidden border border-border">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const nextElement = target.nextElementSibling as HTMLElement;
                      if (nextElement) {
                        nextElement.style.display = 'flex';
                      }
                    }}
                  />
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs" style={{display: 'none'}}>
                    Erro ao carregar
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Módulo Ativo */}
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active" className="text-sm font-medium text-muted-foreground">
              ✅ Módulo Ativo
            </Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>

          {/* Informações do Curso Selecionado */}
          {formData.course_id && (
            <div className="p-4 bg-muted rounded-lg border border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Módulo será adicionado ao curso: </span>
                <span className="font-medium text-foreground">
                  {courses.find(c => c.id === formData.course_id)?.title}
                </span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-border text-foreground hover:bg-muted"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "💾 Salvar Módulo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 