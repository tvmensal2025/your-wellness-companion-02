import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import UserPreventiveAnalytics from '@/components/user/UserPreventiveAnalytics';
import { DrVitalEnhancedChat } from '@/components/dr-vital/DrVitalEnhancedChat';
import MedicalDocumentsSection from '@/components/dashboard/MedicalDocumentsSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Calendar,
  Clock,
  Activity,
  Heart,
  Brain,
  MessageCircle,
  Target,
  TrendingUp,
  Stethoscope,
  Shield,
  AlertTriangle,
  FileText,
  Upload,
  History
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const UserDrVitalPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Gerar relatório completo
      const { data, error } = await supabase.functions.invoke('generate-dr-vital-report', {
        body: {
          userId: user.id,
          reportType: 'complete'
        }
      });

      if (error) throw error;

      // Criar arquivo para download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dr-vital-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      // Usar setTimeout para garantir que o click foi processado antes de remover
      setTimeout(() => {
        if (a.parentNode === document.body) {
          document.body.removeChild(a);
        }
      }, 100);

      toast({
        title: "Relatório exportado",
        description: "Seus dados foram exportados com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleShareReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Gerar link compartilhável
      const { data, error } = await supabase.functions.invoke('create-shareable-report', {
        body: {
          userId: user.id,
          reportType: 'dr-vital'
        }
      });

      if (error) throw error;

      // Copiar link para clipboard
      await navigator.clipboard.writeText(data.shareUrl);
      
      toast({
        title: "Link copiado",
        description: "Link do relatório copiado para a área de transferência!",
      });
    } catch (error) {
      console.error('Erro ao compartilhar relatório:', error);
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível gerar o link compartilhável.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-cyan-50 overflow-x-hidden">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToDashboard}
            className="flex items-center gap-1.5 px-2 sm:px-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar ao Dashboard</span>
          </Button>
          
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareReport}
              className="flex items-center gap-1.5 h-8 px-2.5 sm:px-3"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </Button>
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-3xl font-bold text-foreground leading-tight">
                Olá, <span className="break-words">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'}!</span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
                Bem-vindo ao seu consultório virtual do Dr. Vital
              </p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge variant="outline" className="flex items-center gap-1 text-xs px-2 py-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
              </Badge>
              
              <Badge variant="outline" className="flex items-center gap-1 text-xs px-2 py-1">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Cards de Resumo Rápido */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-1 sm:pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Análise Preventiva</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="text-lg sm:text-2xl font-bold">Ativa</div>
              <p className="text-[10px] sm:text-xs opacity-90">Dr. Vital disponível</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-1 sm:pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Score de Saúde</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="text-lg sm:text-2xl font-bold">85/100</div>
              <p className="text-[10px] sm:text-xs opacity-90">Excelente!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-1 sm:pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Conversas IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="text-lg sm:text-2xl font-bold">47</div>
              <p className="text-[10px] sm:text-xs opacity-90">Este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-1 sm:pb-2 px-3 pt-3 sm:px-4 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm flex items-center gap-1.5">
                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate">Última Análise</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 sm:px-4 sm:pb-4">
              <div className="text-lg sm:text-2xl font-bold">2 dias</div>
              <p className="text-[10px] sm:text-xs opacity-90">Atrás</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs do Consultório Virtual */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-10 sm:h-12 bg-muted p-0.5 sm:p-1">
            <TabsTrigger value="analytics" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium px-1.5 sm:px-3 py-1.5 sm:py-2">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Análises</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium px-1.5 sm:px-3 py-1.5 sm:py-2">
              <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dr. Vital</span>
            </TabsTrigger>
            <TabsTrigger value="exams" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium px-1.5 sm:px-3 py-1.5 sm:py-2">
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Exames</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium px-1.5 sm:px-3 py-1.5 sm:py-2">
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Histórico</span>
            </TabsTrigger>
          </TabsList>

          {/* Aba: Análises Preventivas */}
          <TabsContent value="analytics" className="space-y-6">
            <UserPreventiveAnalytics />
          </TabsContent>

          {/* Aba: Chat com Dr. Vital Enhanced */}
          <TabsContent value="chat" className="space-y-6">
            <DrVitalEnhancedChat />
          </TabsContent>

          {/* Aba: Upload e Gestão de Exames */}
          <TabsContent value="exams" className="space-y-6">
            <MedicalDocumentsSection />
          </TabsContent>

          {/* Aba: Histórico Médico */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Histórico Médico Completo
                </CardTitle>
                <CardDescription>
                  Acompanhe sua evolução de saúde ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Evolução de Peso */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Evolução de Peso
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">-5.2kg</div>
                      <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                      <div className="mt-2 h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Medidas Corporais */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        Medidas Corporais
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Cintura:</span>
                          <span className="font-semibold">85cm</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Braço:</span>
                          <span className="font-semibold">32cm</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Perna:</span>
                          <span className="font-semibold">58cm</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Atividades Físicas */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Atividades Físicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">4x</div>
                      <p className="text-xs text-muted-foreground">Esta semana</p>
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between">
                          <span>Meta:</span>
                          <span>5x/semana</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Qualidade do Sono */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Qualidade do Sono
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">7.5h</div>
                      <p className="text-xs text-muted-foreground">Média diária</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">Boa</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pressão Arterial */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Pressão Arterial
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">120/80</div>
                      <p className="text-xs text-muted-foreground">Última medição</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs text-green-600">Normal</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Glicemia */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Glicemia
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">95mg/dL</div>
                      <p className="text-xs text-muted-foreground">Em jejum</p>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs text-green-600">Normal</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Gráfico de Evolução */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Evolução dos Últimos 6 Meses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Gráfico de evolução em desenvolvimento</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Informações Adicionais */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Como Funciona</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Análise Preventiva</h4>
                <p className="text-xs text-muted-foreground">
                  O Dr. Vital analisa seus dados de saúde e fornece insights personalizados para melhorar seu bem-estar.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Conversas com Sofia</h4>
                <p className="text-xs text-muted-foreground">
                  Sofia é sua assistente virtual que acompanha sua jornada de saúde e oferece suporte emocional.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Tracking Automático</h4>
                <p className="text-xs text-muted-foreground">
                  Seus dados são coletados automaticamente para gerar análises mais precisas e personalizadas.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span>Próximos Passos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">1. Registre Dados Regularmente</h4>
                <p className="text-xs text-muted-foreground">
                  Mantenha seus dados atualizados para análises em tempo real.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">2. Interaja com Sofia</h4>
                <p className="text-xs text-muted-foreground">
                  Converse regularmente para receber suporte e motivação.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">3. Acompanhe seu Progresso</h4>
                <p className="text-xs text-muted-foreground">
                  Monitore suas métricas de saúde e veja sua evolução.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDrVitalPage; 