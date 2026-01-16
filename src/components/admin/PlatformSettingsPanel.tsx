import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { uploadToVPS } from '@/lib/vpsApi';
import { 
  Settings, 
  Image as ImageIcon, 
  Save, 
  RefreshCw,
  AlertCircle,
  Eye,
  Upload,
  Link,
  Loader2
} from 'lucide-react';

interface DashboardSettings {
  banner_title: string;
  banner_subtitle: string;
  banner_image_url: string;
}

export const PlatformSettingsPanel = () => {
  const [settings, setSettings] = useState<DashboardSettings>({
    banner_title: 'PLATAFORMA DOS SONHOS',
    banner_subtitle: 'Transforme sua vida com nossos cursos exclusivos',
    banner_image_url: '/images/capa02.png'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [imageSource, setImageSource] = useState<'upload' | 'url'>('url');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await uploadToVPS(file, 'banners');
      handleChange('banner_image_url', result.url);
      toast({ title: '✅ Upload concluído!', description: 'Imagem enviada para o servidor.' });
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({ title: 'Erro no upload', description: 'Não foi possível enviar a imagem.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: 'Arquivo inválido', description: 'Selecione uma imagem.', variant: 'destructive' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: 'Arquivo muito grande', description: 'Máximo 10MB.', variant: 'destructive' });
        return;
      }
      handleFileUpload(file);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('dashboard_settings')
        .select('banner_title, banner_subtitle, banner_image_url')
        .eq('key', 'default')
        .single();

      if (!error && data) {
        setSettings({
          banner_title: data.banner_title || 'PLATAFORMA DOS SONHOS',
          banner_subtitle: data.banner_subtitle || 'Transforme sua vida com nossos cursos exclusivos',
          banner_image_url: data.banner_image_url || '/images/capa02.png'
        });
      }
    } catch (e) {
      console.error('Erro ao carregar configurações:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof DashboardSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('dashboard_settings')
        .upsert({
          key: 'default',
          banner_title: settings.banner_title,
          banner_subtitle: settings.banner_subtitle,
          banner_image_url: settings.banner_image_url,
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Configurações da plataforma atualizadas.",
      });
      setHasChanges(false);
    } catch (e) {
      console.error('Erro ao salvar:', e);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />
            Configurações da Plataforma
          </h2>
          <p className="text-muted-foreground">
            Configure o banner principal e informações da plataforma de cursos
          </p>
        </div>
        {hasChanges && (
          <Badge variant="outline" className="bg-amber-500/20 text-amber-500 border-amber-500/30">
            Alterações não salvas
          </Badge>
        )}
      </div>

      {/* Banner Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-500" />
            Banner Principal
          </CardTitle>
          <CardDescription>
            Configure o título, subtítulo e imagem de fundo do banner da plataforma de cursos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="banner_title" className="text-sm font-medium">
              📚 Título do Banner
            </Label>
            <Input
              id="banner_title"
              value={settings.banner_title}
              onChange={(e) => handleChange('banner_title', e.target.value)}
              placeholder="Ex: PLATAFORMA DOS SONHOS"
              className="bg-muted border-border"
            />
            <p className="text-xs text-muted-foreground">
              Este título aparece em destaque sobre a imagem de fundo
            </p>
          </div>

          {/* Subtítulo */}
          <div className="space-y-2">
            <Label htmlFor="banner_subtitle" className="text-sm font-medium">
              📝 Subtítulo
            </Label>
            <Textarea
              id="banner_subtitle"
              value={settings.banner_subtitle}
              onChange={(e) => handleChange('banner_subtitle', e.target.value)}
              placeholder="Ex: Transforme sua vida com nossos cursos exclusivos"
              rows={2}
              className="bg-muted border-border"
            />
          </div>

          {/* Imagem de Fundo - Upload ou URL */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">🖼️ Imagem de Fundo</Label>
            
            <Tabs value={imageSource} onValueChange={(v) => setImageSource(v as 'upload' | 'url')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  URL Externa
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="mt-3">
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFileSelect}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Enviando...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Clique para selecionar uma imagem
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG até 10MB</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="url" className="mt-3">
                <Input
                  id="banner_image_url"
                  value={settings.banner_image_url}
                  onChange={(e) => handleChange('banner_image_url', e.target.value)}
                  placeholder="Ex: /images/capa02.png ou https://..."
                  className="bg-muted border-border"
                />
              </TabsContent>
            </Tabs>
            
            <p className="text-xs text-muted-foreground">
              📱 Tamanho recomendado: <strong>1920 x 800px</strong> (Desktop) | <strong>750 x 500px</strong> (Mobile)
              <br />
              💡 Use uma imagem SEM texto embutido para melhor resultado
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Preview do Banner
            </Label>
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${settings.banner_image_url})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/30 to-transparent" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-end p-4">
                <h3 className="text-xl font-black text-foreground drop-shadow-lg">
                  {settings.banner_title || 'TÍTULO DO BANNER'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {settings.banner_subtitle || 'Subtítulo do banner'}
                </p>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={loadSettings}
              disabled={saving}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Recarregar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">Dicas para o Banner:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Use imagens de alta qualidade sem texto embutido</li>
                <li>• O título e subtítulo são renderizados por cima da imagem</li>
                <li>• Prefira imagens com áreas escuras na parte inferior para melhor legibilidade</li>
                <li>• As alterações são aplicadas imediatamente após salvar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSettingsPanel;
