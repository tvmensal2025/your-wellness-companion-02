import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Share, Plus, Check, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Detectar plataforma
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Capturar evento de instalação
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
              <Check className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl text-emerald-600">App Instalado!</CardTitle>
            <CardDescription>
              O Instituto dos Sonhos já está instalado no seu dispositivo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Ir para o Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-md mx-auto pt-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Smartphone className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-2xl">Instalar App</CardTitle>
            <CardDescription>
              Tenha acesso rápido ao Instituto dos Sonhos direto da tela inicial do seu celular!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Botão de instalação nativo (Android Chrome) */}
            {deferredPrompt && (
              <Button 
                onClick={handleInstall}
                className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <Download className="w-5 h-5 mr-2" />
                Instalar Agora
              </Button>
            )}

            {/* Instruções para iOS */}
            {isIOS && !deferredPrompt && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    📱 Como instalar no iPhone/iPad:
                  </h3>
                  <ol className="space-y-3 text-sm text-blue-700 dark:text-blue-400">
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-200 dark:bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span>Toque no botão <Share className="w-4 h-4 inline mx-1" /> <strong>Compartilhar</strong> na barra do Safari</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-200 dark:bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span>Role para baixo e toque em <Plus className="w-4 h-4 inline mx-1" /> <strong>"Adicionar à Tela de Início"</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-blue-200 dark:bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <span>Toque em <strong>"Adicionar"</strong> no canto superior direito</span>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* Instruções para Android sem prompt */}
            {isAndroid && !deferredPrompt && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                  <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                    📱 Como instalar no Android:
                  </h3>
                  <ol className="space-y-3 text-sm text-green-700 dark:text-green-400">
                    <li className="flex items-start gap-3">
                      <span className="bg-green-200 dark:bg-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                      <span>Toque no menu <strong>⋮</strong> (três pontos) do Chrome</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-green-200 dark:bg-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                      <span>Toque em <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="bg-green-200 dark:bg-green-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                      <span>Confirme tocando em <strong>"Instalar"</strong></span>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {/* Desktop */}
            {!isIOS && !isAndroid && !deferredPrompt && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Acesse este site pelo seu celular para instalar o app, ou use o Chrome/Edge para instalar no computador.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Benefícios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">✨ Benefícios do App</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                <span>Acesso rápido pela tela inicial</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                <span>Funciona mesmo offline</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                <span>Carrega mais rápido</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                <span>Experiência de app nativo</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="w-5 h-5 text-emerald-500" />
                <span>Sem ocupar espaço na loja</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Install;
