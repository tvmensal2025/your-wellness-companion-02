import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Stethoscope, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  ChevronDown,
  ChevronUp,
  Activity,
  Heart,
  Brain
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DrVitalImage } from '@/components/shared/CharacterImage';
import { getCharacterImageUrls } from '@/lib/character-images';

interface PreventiveAnalysis {
  id: string;
  analysis_type: string;
  user_id: string;
  risk_level?: string;
  analysis_data?: any;
  recommendations?: string[];
  created_at: string;
  updated_at?: string;
  // Campos adicionais extraídos de analysis_data
  dr_vital_analysis?: string;
  risk_score?: number;
  health_risks?: string[];
  positive_points?: string[];
  urgent_warnings?: string[];
  metrics?: any;
}

const DrVitalAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = useState<PreventiveAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  useEffect(() => {
    loadLatestAnalysis();
  }, []);

  const loadLatestAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // const { data, error } = await supabase
      //   .from('preventive_health_analyses')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .order('created_at', { ascending: false })
      //   .limit(1)
      //   .maybeSingle();
      const data = null;
      const error = null;

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar análise:', error);
        return;
      }

      setAnalysis({
        ...data,
        analysis_type: 'preventive'
      } as PreventiveAnalysis);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewAnalysis = async (type: 'quinzenal' | 'mensal') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('preventive-health-analysis', {
        body: {
          userId: user.id,
          analysisType: type
        }
      });

      if (error) {
        console.error('Erro ao gerar análise:', error);
        return;
      }

      // Recarregar análise após geração
      setTimeout(() => {
        loadLatestAnalysis();
      }, 2000);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'BAIXO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERADO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ALTO':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'CRÍTICO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level?: string) => {
    switch (level) {
      case 'BAIXO':
        return Shield;
      case 'MODERADO':
        return Activity;
      case 'ALTO':
        return AlertTriangle;
      case 'CRÍTICO':
        return Heart;
      default:
        return Shield;
    }
  };

  const handlePrint = () => {
    if (!analysis?.dr_vital_analysis) return;
    // Logo em base64 para garantir que apareça no PDF (imagens externas não carregam em window.open)
    const logoBase64 = 'data:image/jpeg;base64,/9j/4gJASUNDX1BST0ZJTEUAAQEAAAIwQURCRQIQAABtbnRyUkdCIFhZWiAHzwAGAAMAAAAAAABhY3NwQVBQTAAAAABub25lAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLUFEQkUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApjcHJ0AAAA/AAAADJkZXNjAAABMAAAAGt3dHB0AAABnAAAABRia3B0AAABsAAAABRyVFJDAAABxAAAAA5nVFJDAAAB1AAAAA5iVFJDAAAB5AAAAA5yWFlaAAAB9AAAABRnWFlaAAACCAAAABRiWFlaAAACHAAAABR0ZXh0AAAAAENvcHlyaWdodCAxOTk5IEFkb2JlIFN5c3RlbXMgSW5jb3Jwb3JhdGVkAAAAZGVzYwAAAAAAAAARQWRvYmUgUkdCICgxOTk4KQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWFlaIAAAAAAAAPNRAAEAAAABFsxYWVogAAAAAAAAAAAAAAAAAAAAAGN1cnYAAAAAAAAAAQIzAABjdXJ2AAAAAAAAAAECMwAAY3VydgAAAAAAAAABAjMAAFhZWiAAAAAAAACcGAAAT6UAAAT8WFlaIAAAAAAAADSNAACgLAAAD5VYWVogAAAAAAAAJjEAABAvAAC+nP/bAIQACgcHBwgHCggICg8KCAoPEg0KCg0SFBAQEhAQFBQPEREREQ8UFBcYGhgXFB8fISEfHy0sLCwtMjIyMjIyMjIyMgELCgoLDAsODAwOEg4ODhIUDg4ODhQZERESEREZIBcUFBQUFyAcHhoaGh4cIyMgICMjKyspKysyMjIyMjIyMjIy/90ABAAL/+4ADkFkb2JlAGTAAAAAAf/AABEIALEAowMAIgABEQECEQH/xAGiAAEAAwACAQUAAAAAAAAAAAAABgcIBAUCAQMJCgsBAQAABAcAAAAAAAAAAAAAAAABAgMEBQYHCAkKCxAAAAQCAgQFCihfAAAAAAAAAAECAwQFBhEHNnSyEiE1QbMTFiIxQkNRc3WBCAkKFBUXGBkaIyQlJicoKSoyMzQ3ODk6REVGR0hJSlJVYWJykZOx0VNUVldYWVpjZGVmZ2hpanF2d3h5eoKDhIWGh4iJipKUlZaXmJmaoaKjpKWmp6ipqrS1tre4ubrBwsPExcbHyMnK0tPU1dbX2Nna4eLj5OXm5+jp6vDx8vP09fb3+Pn6EQABAAAAAB6DAAAAAAAAAAAAAQIDBAUGBwgJChESExQVFhcYGRohIiMkJSYnKCkqMTIzNDU2Nzg5OkFCQ0RFRkdISUpRUlNUVVZXWFlaYWJjZGVmZ2hpanFyc3R1dnd4eXqBgoOEhYaHiImKkZKTlJWWl5iZmqGio6SlpqeoqaqxsrO0tba3uLm6wcLDxMXGx8jJytHS09TV1tfY2drh4uPk5ebn6Onq8PHy8/T19vf4+fr/2gAMAwAAARECEQA/ALmAAAAAAAAAAAAAAAAHXxs9lUE7lKIfInMdKSNRlhV5lgSOoQQUMgIVAVUMgoCBSSCCgoCA0oKCqUk7ABF36bwqXKmIZbiMOtSlEg68aoiwQ6uJpjNXVmbGAYRVUkiSSjLDLDrXXh6YUUMjpEkCGqtIQCmgouiaBDVWkExiJnBQ0SzCvOkl586m0+MKvQVnhEOWKofdfdeU6+pS3V4alKzZ6AWbLYtMZAMRKc04gjMqzOpRYSirPQGQgiCLrIhkMgKioqNKBSAiSKq9BQUBUVFR8HKAAFwVQAAAAAAAAAAD/0LmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9G5gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAH//Z';
    const drVitalUrl = `${window.location.origin}/images/dr-vital.png`;
    const currentDate = new Date().toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const printable = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dr. Vital IA - MaxNutrition - Análise Preventiva</title>
  <style>
    @page { size: A4; margin: 12mm; }
    :root { --primary:#6366f1; --secondary:#06b6d4; --accent:#f59e0b; --success:#10b981; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color:#1e293b; background: white; font-size: 11px; }
    .container { max-width: 100%; padding: 15px; }
    
    /* Header Premium */
    .header { 
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%); 
      color: white; 
      padding: 16px 20px; 
      border-radius: 12px; 
      display: flex; 
      align-items: center; 
      gap: 14px; 
      margin-bottom: 15px;
    }
    .header .dr-img { 
      width: 50px; 
      height: 50px; 
      border-radius: 50%; 
      background: rgba(255,255,255,.2); 
      padding: 4px; 
      border: 2px solid rgba(255,255,255,0.4); 
    }
    .header-text { flex: 1; }
    .header h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; }
    .header .subtitle { opacity: .95; font-size: 11px; font-weight: 500; }
    .header .logo { height: 32px; width: auto; }
    
    /* Content */
    .content { 
      background: #ffffff; 
      border: 1px solid #e2e8f0; 
      border-radius: 12px; 
      padding: 20px; 
      margin-bottom: 15px;
    }
    .content pre { 
      white-space: pre-wrap; 
      line-height: 1.7; 
      font-size: 11px; 
      color: #334155; 
      font-family: inherit;
    }
    
    /* Tips Section */
    .tips { 
      background: linear-gradient(135deg, #fef3c7, #fde68a); 
      border-radius: 10px; 
      padding: 12px 15px; 
      margin-bottom: 15px; 
      border: 1px solid #fbbf24; 
    }
    .tips-header { 
      font-size: 12px; 
      font-weight: 700; 
      color: #92400e; 
      margin-bottom: 8px; 
      display: flex; 
      align-items: center; 
      gap: 6px; 
    }
    .tip { 
      font-size: 10px; 
      color: #78350f; 
      padding: 4px 0; 
      border-bottom: 1px dashed #fbbf24; 
    }
    .tip:last-child { border-bottom: none; }
    
    /* Footer Premium */
    .footer { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      padding: 12px 15px; 
      background: linear-gradient(135deg, #eef2ff, #e0e7ff); 
      border-radius: 10px; 
      border: 2px solid #a5b4fc; 
    }
    .footer-left { display: flex; align-items: center; gap: 10px; }
    .footer-logo { height: 20px; width: auto; }
    .footer-brand { font-size: 14px; font-weight: 800; color: #4f46e5; }
    .footer-right { text-align: right; }
    .footer-dr { font-size: 10px; color: #6366f1; font-weight: 600; }
    .footer-warning { font-size: 9px; color: #64748b; margin-top: 2px; }
    .footer-slogan { font-size: 8px; color: #94a3b8; font-style: italic; margin-top: 2px; }
    
    @media print {
      .container { max-width: none; }
      .content { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header Premium -->
    <div class="header">
      <img src="${drVitalUrl}" alt="Dr. Vital" class="dr-img" onerror="this.style.display='none'" />
      <div class="header-text">
        <h1>Dr. Vital IA - Análise Preventiva</h1>
        <div class="subtitle">📋 ${analysis.analysis_type} • 📅 ${format(new Date(analysis.created_at), 'dd/MM/yyyy', { locale: ptBR })} • ${currentDate}</div>
      </div>
      <img src="${logoBase64}" alt="MaxNutrition" class="logo" />
    </div>
    
    <!-- Content -->
    <div class="content">
      <pre>${analysis.dr_vital_analysis.replace(/</g,'&lt;')}</pre>
    </div>
    
    <!-- Tips -->
    <div class="tips">
      <div class="tips-header">💡 Recomendações do Dr. Vital</div>
      <div class="tip">🩺 Mantenha suas consultas médicas em dia para acompanhamento</div>
      <div class="tip">📊 Atualize seus dados de saúde regularmente no app</div>
      <div class="tip">🏃 Pratique atividades físicas conforme orientação profissional</div>
    </div>
    
    <!-- Footer Premium -->
    <div class="footer">
      <div class="footer-left">
        <img src="${logoBase64}" alt="MaxNutrition" class="footer-logo" />
        <div class="footer-brand">MaxNutrition</div>
      </div>
      <div class="footer-right">
        <div class="footer-dr">🤖 Dr. Vital IA</div>
        <div class="footer-warning">⚠️ Material educativo - não substitui consulta médica</div>
        <div class="footer-slogan">Sua jornada para uma vida mais saudável</div>
      </div>
    </div>
  </div>
  <script>window.onload = () => { setTimeout(() => window.print(), 200); };</script>
</body>
</html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(printable);
    w.document.close();
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center overflow-hidden">
              <DrVitalImage size="sm" />
            </div>
            <CardTitle className="text-lg">Dr. Vital - Análise Preventiva</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card className="w-full border-dashed">
        <CardHeader className="p-4 xs:p-5 sm:p-6">
          <div className="flex items-center space-x-2 xs:space-x-3">
            <div className="w-8 h-8 xs:w-10 xs:h-10 bg-blue-500/20 rounded-full flex items-center justify-center overflow-hidden">
              <DrVitalImage size="sm" className="xs:w-10 xs:h-10" />
            </div>
            <CardTitle className="text-lg xs:text-xl">Dr. Vital - Análise Preventiva</CardTitle>
          </div>
          <CardDescription className="text-base xs:text-lg">
            Nenhuma análise disponível ainda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 xs:space-y-5 p-4 xs:p-5 sm:p-6">
          <p className="text-muted-foreground text-base xs:text-lg">
            O Dr. Vital ainda não realizou uma análise preventiva dos seus dados de saúde.
            Gere sua primeira análise para receber insights personalizados.
          </p>
          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <Button 
              onClick={() => generateNewAnalysis('quinzenal')}
              variant="outline"
              size="sm"
              className="h-12 xs:h-14 text-base xs:text-lg"
            >
              <Brain className="w-5 h-5 xs:w-6 xs:h-6 mr-2" />
              Análise Quinzenal
            </Button>
            <Button 
              onClick={() => generateNewAnalysis('mensal')}
              variant="outline"
              size="sm"
              className="h-12 xs:h-14 text-base xs:text-lg"
            >
              <Calendar className="w-5 h-5 xs:w-6 xs:h-6 mr-2" />
              Análise Mensal
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const RiskIcon = getRiskIcon(analysis.risk_level);

  return (
    <Card className="w-full">
      <CardHeader className="p-4 xs:p-5 sm:p-6">
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4">
          <div className="flex items-center space-x-2 xs:space-x-3">
            <div className="w-8 h-8 xs:w-10 xs:h-10 bg-blue-500/20 rounded-full flex items-center justify-center overflow-hidden">
              <DrVitalImage size="md" />
            </div>
            <div>
              <CardTitle className="text-lg xs:text-xl">Dr. Vital - Análise Preventiva</CardTitle>
              <CardDescription className="flex items-center space-x-2 mt-1 xs:mt-2 text-base xs:text-lg">
                <Calendar className="w-4 h-4 xs:w-5 xs:h-5" />
                <span>
                  {analysis.created_at ? (
                    format(new Date(analysis.created_at), 'dd \'de\' MMMM \'de\' yyyy', { locale: ptBR })
                  ) : (
                    'Data não disponível'
                  )}
                  {' '}({analysis.analysis_type})
                </span>
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsPopupOpen(true)} className="h-10 xs:h-12 text-base xs:text-lg">
              Abrir em Pop-up
            </Button>
            {analysis.risk_level && (
              <Badge className={`${getRiskColor(analysis.risk_level)} text-sm xs:text-base px-3 xs:px-4 py-2`}>
                <RiskIcon className="w-4 h-4 xs:w-5 xs:h-5 mr-1 xs:mr-2" />
                Risco {analysis.risk_level}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 xs:space-y-5 p-4 xs:p-5 sm:p-6">
        {/* Score de Risco */}
        {analysis.risk_score && (
          <div className="flex flex-col xs:flex-row xs:items-center justify-between p-4 xs:p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg gap-3 xs:gap-4">
            <div className="text-center xs:text-left">
              <p className="text-base xs:text-lg font-medium text-blue-900">Score de Risco</p>
              <p className="text-2xl xs:text-3xl font-bold text-blue-600">{analysis.risk_score}/100</p>
            </div>
            <TrendingUp className="w-8 h-8 xs:w-10 xs:h-10 text-blue-500" />
          </div>
        )}

        {/* Análise do Dr. Vital */}
        {analysis.dr_vital_analysis && (
          <div className="space-y-3 xs:space-y-4">
            <div className="flex items-center space-x-2 xs:space-x-3">
              <Brain className="w-5 h-5 xs:w-6 xs:h-6 text-blue-600" />
              <h4 className="font-semibold text-base xs:text-lg">Análise do Dr. Vital</h4>
            </div>
            <div className="bg-blue-50 p-4 xs:p-5 rounded-lg border-l-4 border-blue-400">
              <p className="text-blue-900 italic leading-relaxed text-base xs:text-lg">
                "{analysis.dr_vital_analysis}"
              </p>
            </div>
          </div>
        )}

        {/* Pontos Positivos */}
        {analysis.positive_points && analysis.positive_points.length > 0 && (
          <div className="space-y-2 xs:space-y-3">
            <h4 className="font-semibold text-green-700 flex items-center space-x-2 text-base xs:text-lg">
              <Shield className="w-5 h-5 xs:w-6 xs:h-6" />
              <span>Pontos Positivos</span>
            </h4>
            <div className="space-y-2 xs:space-y-3">
              {analysis.positive_points.map((point, index) => (
                <div key={index} className="flex items-center space-x-2 xs:space-x-3">
                  <div className="w-2 h-2 xs:w-3 xs:h-3 bg-green-500 rounded-full"></div>
                  <span className="text-base xs:text-lg text-green-700">{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avisos Urgentes */}
        {analysis.urgent_warnings && analysis.urgent_warnings.length > 0 && (
          <div className="space-y-2 xs:space-y-3">
            <h4 className="font-semibold text-orange-700 flex items-center space-x-2 text-base xs:text-lg">
              <AlertTriangle className="w-5 h-5 xs:w-6 xs:h-6" />
              <span>Recomendações Importantes</span>
            </h4>
            <div className="space-y-2 xs:space-y-3">
              {analysis.urgent_warnings.map((warning, index) => (
                <div key={index} className="flex items-center space-x-2 xs:space-x-3">
                  <div className="w-2 h-2 xs:w-3 xs:h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-base xs:text-lg text-orange-700">{warning}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detalhes Expandíveis */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between h-12 xs:h-14 text-base xs:text-lg">
              Ver detalhes completos
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 xs:w-6 xs:h-6" />
              ) : (
                <ChevronDown className="w-5 h-5 xs:w-6 xs:h-6" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 xs:space-y-5 mt-4 xs:mt-5">
            {/* Métricas */}
            {analysis.metrics && (
              <div className="grid grid-cols-2 gap-3 xs:gap-4">
                <div className="text-center p-3 xs:p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm xs:text-base text-muted-foreground">Adesão</p>
                  <p className="text-lg xs:text-xl font-bold text-primary">{analysis.metrics.compliance_score || 0}%</p>
                </div>
                <div className="text-center p-3 xs:p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm xs:text-base text-muted-foreground">Exercício</p>
                  <p className="text-lg xs:text-xl font-bold text-primary">{analysis.metrics.exercise_frequency || 0}x</p>
                </div>
                <div className="text-center p-3 xs:p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm xs:text-base text-muted-foreground">Sono</p>
                  <p className="text-lg xs:text-xl font-bold text-primary">{analysis.metrics.sleep_quality || 0}/10</p>
                </div>
                <div className="text-center p-3 xs:p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm xs:text-base text-muted-foreground">Nutrição</p>
                  <p className="text-lg xs:text-xl font-bold text-primary">{analysis.metrics.nutrition_score || 0}%</p>
                </div>
              </div>
            )}

            {/* Riscos Identificados */}
            {analysis.health_risks && analysis.health_risks.length > 0 && (
              <div className="space-y-2 xs:space-y-3">
                <h4 className="font-semibold text-red-700 flex items-center space-x-2 text-base xs:text-lg">
                  <AlertTriangle className="w-5 h-5 xs:w-6 xs:h-6" />
                  <span>Riscos Identificados</span>
                </h4>
                <div className="space-y-2 xs:space-y-3">
                  {analysis.health_risks.map((risk, index) => (
                    <div key={index} className="flex items-center space-x-2 xs:space-x-3">
                      <div className="w-2 h-2 xs:w-3 xs:h-3 bg-red-500 rounded-full"></div>
                      <span className="text-base xs:text-lg text-red-700">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Ação para Nova Análise */}
        <div className="flex gap-2 pt-2 xs:pt-3">
          <Button 
            onClick={() => generateNewAnalysis('quinzenal')}
            variant="outline"
            size="sm"
            className="flex-1 h-12 xs:h-14 text-base xs:text-lg"
          >
            <Brain className="w-5 h-5 xs:w-6 xs:h-6 mr-2" />
            Nova Análise
          </Button>
        </div>
      </CardContent>

      {/* Modal elegante colorido */}
      <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden">
          {/* Cabeçalho colorido com gradiente */}
          <div className="bg-gradient-to-r from-indigo-600 via-cyan-500 to-amber-500 p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 p-2 border-2 border-white/30">
                <DrVitalImage size="lg" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold mb-1">Dr. Vital IA do Instituto dos Sonhos</h1>
                <p className="text-sm opacity-95 font-medium">🩺 Análise Preventiva - {analysis.analysis_type}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button size="sm" variant="secondary" onClick={handlePrint} className="bg-white/90 text-indigo-700 hover:bg-white shadow-lg">
                  📄 Imprimir
                </Button>
                <img src="/images/maxnutrition-logo.png" alt="MaxNutrition" className="w-10 h-10 rounded-lg bg-white/20 p-1" />
              </div>
            </div>
          </div>

          {/* Conteúdo com cores */}
          <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700 max-h-[60vh] overflow-y-auto">
                {analysis.dr_vital_analysis}
              </div>
            </div>
            
            {/* Footer com logo */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 bg-white/60 rounded-lg p-3">
              <img src="/images/maxnutrition-logo.png" alt="MaxNutrition" className="w-4 h-4" />
              <span>⚠️ Este material é educativo e não substitui consulta médica presencial.</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default DrVitalAnalysis;