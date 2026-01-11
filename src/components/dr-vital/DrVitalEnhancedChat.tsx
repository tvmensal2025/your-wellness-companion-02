import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Send, Loader2, Activity, User, Target, Brain, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DrVitalImage } from '@/components/shared/CharacterImage';
import { getCharacterImageUrls } from '@/lib/character-images';

interface DataAvailable {
  profile: boolean;
  physicalData: boolean;
  weightHistory: number;
  anamnesis: boolean;
  goals: number;
  nutrition: number;
  dailyResponses: number;
  missions: number;
  achievements: number;
}

interface DataCompleteness {
  completionPercentage: number;
  missingData: string[];
  canReceiveAnalysis: boolean;
}

interface DrVitalResponse {
  response: string;
  dataCompleteness: DataCompleteness;
  dataAvailable: DataAvailable;
}

export const DrVitalEnhancedChat: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<DrVitalResponse | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      if (!user) return;

      // Carregar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setUserProfile(profile);
      
      // Extrair e formatar nome do usuário
      if (profile) {
        // Tentar diferentes campos que podem conter o nome do usuário
        let displayName = '';
        
        if (profile.full_name) {
          displayName = profile.full_name;
        } else if ((profile as any).name) {
          displayName = (profile as any).name;
        } else if ((profile as any).first_name) {
          displayName = (profile as any).first_name;
        } else if (user.user_metadata?.name) {
          displayName = user.user_metadata.name;
        } else if (user.email) {
          // Extrair nome do email se necessário
          const emailName = user.email.split('@')[0];
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        
        // Usar apenas o primeiro nome para um tom mais pessoal
        const firstName = displayName.split(' ')[0];
        setUserName(firstName);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const generateTitle = (question: string) => {
    const q = question.toLowerCase();
    if (q.includes('análise completa') || q.includes('análise geral')) return '📊 Análise Completa de Saúde';
    if (q.includes('peso') || q.includes('imc') || q.includes('obesidade')) return '⚖️ Análise de Peso e Composição Corporal';
    if (q.includes('nutrição') || q.includes('alimentação') || q.includes('dieta')) return '🥗 Análise Nutricional';
    if (q.includes('risco') || q.includes('metabólico')) return '⚠️ Avaliação de Riscos Metabólicos';
    if (q.includes('exame') || q.includes('resultado')) return '🔬 Análise de Exames';
    if (q.includes('sintoma') || q.includes('sentindo') || q.includes('dor')) return '🩺 Avaliação de Sintomas';
    if (q.includes('meta') || q.includes('objetivo')) return '🎯 Análise de Metas e Objetivos';
    if (q.includes('evolução') || q.includes('progresso')) return '📈 Análise de Evolução';
    return '🩺 Consulta Médica Personalizada';
  };

  const formatResponse = (text: string) => {
    if (!text) return text;
    
    // Normalizar quebras de linha
    let personalizedText = text.replace(/\r\n/g, "\n");

    // Adicionar saudação personalizada com nome do usuário
    if (userName) {
      if (!personalizedText.match(/^(olá|oi|bom dia|boa tarde|boa noite|prezado|caro|estimado|saudações)/i)) {
        personalizedText = `Olá ${userName},\n\n${personalizedText}`;
      } else if (!personalizedText.match(/^(olá|oi|bom dia|boa tarde|boa noite|prezado|caro|estimado|saudações)[^,]*,/i)) {
        personalizedText = personalizedText.replace(/^(olá|oi|bom dia|boa tarde|boa noite|prezado|caro|estimado|saudações)/i, `$1 ${userName},`);
      }
    }

    // Limpeza e conversão de Markdown
    // 1) Blocos de código (remover)
    personalizedText = personalizedText.replace(/```[\s\S]*?```/g, "");
    // 2) Cabeçalhos markdown -> títulos elegantes
    personalizedText = personalizedText.replace(/^#{1,6}\s*(.+)$/gm, (m, p1) => `\n\nTÍTULO:${p1.trim()}\n`);
    // 3) Negrito markdown **texto** -> destaque elegante
    personalizedText = personalizedText.replace(/\*\*(.+?)\*\*/g, '<span class="important-text">$1<\/span>');
    // 4) Itálico markdown *texto* ou _texto_ -> leve ênfase
    personalizedText = personalizedText.replace(/(^|\s)[*_]([^*_][^*_]*?)[*_](?=\s|$)/g, '$1<span class="highlight-value">$2<\/span>');

    // Dividir em blocos por parágrafos
    const blocks = personalizedText.split("\n\n").filter(block => block.trim().length > 0);
    const formattedBlocks: string[] = [];
    
    for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i];

      // Converter marcador de título criado na etapa anterior
      if (/^TÍTULO:/i.test(block)) {
        const title = block.replace(/^TÍTULO:/i, '').trim();
        formattedBlocks.push(`<h3 class="section-title">${title}</h3>`);
        continue;
      }
      
      // Detectar o tipo de bloco para adicionar ícone apropriado
      let blockIcon = '';
      let blockType = '';
      
      if (/(peso|imc|obesidade|kg)/i.test(block)) {
        blockIcon = '<span class="block-icon weight">⚖️</span>';
        blockType = 'weight-block';
      } else if (/(meta|objetivo)/i.test(block)) {
        blockIcon = '<span class="block-icon goal">🎯</span>';
        blockType = 'goal-block';
      } else if (/(nutri[çc][ãa]o|alimenta[çc][ãa]o|dieta|caloria)/i.test(block)) {
        blockIcon = '<span class="block-icon nutrition">🥗</span>';
        blockType = 'nutrition-block';
      } else if (/(metabolismo|energia|basal)/i.test(block)) {
        blockIcon = '<span class="block-icon metabolism">⚡</span>';
        blockType = 'metabolism-block';
      } else if (/(risco|patologia|sa[úu]de|doen[çc]a)/i.test(block)) {
        blockIcon = '<span class="block-icon risk">⚠️</span>';
        blockType = 'risk-block';
      } else if (/(recomenda[çc][ãa]o|conselho|sugest[ãa]o)/i.test(block)) {
        blockIcon = '<span class="block-icon recommendation">💡</span>';
        blockType = 'recommendation-block';
      } else if (/(completu[dt]e|dados|informa[çc][ãa]o|hist[óo]ri[ck]o)/i.test(block)) {
        blockIcon = '<span class="block-icon data">📊</span>';
        blockType = 'data-block';
      } else {
        blockIcon = '<span class="block-icon general">🩺</span>';
        blockType = 'general-block';
      }

      // Formatações: listas e destaques
      let formatted = block
        // Listas numeradas
        .replace(/^(\d+)\.\s*(.+)$/gm, '<div class="numbered-item"><div class="number">$1<\/div><div class="text">$2<\/div><\/div>')
        // Pontos com traço
        .replace(/^\-\s*(.+)$/gm, '<div class="bullet-item"><span class="bullet-marker">•<\/span><span class="bullet-text">$1<\/span><\/div>')
        // Percentuais em badge
        .replace(/(\(?\s*)(\d+%)(\s*\)?)/g, '$1<span class="percentage-badge">$2<\/span>$3');

      formattedBlocks.push(`
        <div class="content-block ${blockType}">
          ${blockIcon}
          <div class="block-content">
            ${formatted}
          </div>
        </div>
      `);
    }
    
    return formattedBlocks.join('');
  };

  const handlePrint = () => {
    if (!response?.response) return;
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
  <title>Dr. Vital IA - MaxNutrition - Análise</title>
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
    
    .content { margin-top: 15px; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:20px; }
    
    /* Estilos dos blocos de conteúdo */
    .content-block {
      position: relative;
      margin-bottom: 16px;
      padding: 12px 12px 12px 38px;
      border-radius: 8px;
      background: white;
      border: 1px solid #e2e8f0;
      page-break-inside: avoid;
    }
                      
    .content-block:after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      border-radius: 8px 0 0 8px;
    }
                      
    .block-icon {
      position: absolute;
      left: 10px;
      top: 12px;
      font-size: 16px;
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
    }
                      
    /* Estilos específicos para cada tipo de bloco */
    .weight-block:after { background-color: #06b6d4; }
    .goal-block:after { background-color: #8b5cf6; }
    .nutrition-block:after { background-color: #10b981; }
    .metabolism-block:after { background-color: #f59e0b; }
    .risk-block:after { background-color: #ef4444; }
    .recommendation-block:after { background-color: #0ea5e9; }
    .data-block:after { background-color: #6366f1; }
    .general-block:after { background-color: #64748b; }
                      
    /* Títulos de seção */
    .section-title {
      color: #1e293b;
      font-size: 18px;
      font-weight: 700;
      margin: 18px 0 16px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
    }
                      
    /* Itens numerados */
    .numbered-item {
      display: flex;
      margin: 12px 0;
      padding: 14px;
      background: #f8fafc;
      border-radius: 10px;
    }
                      
    .numbered-item .number {
      background: #6366f1;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 12px;
      font-size: 12px;
      flex-shrink: 0;
    }
                      
    .numbered-item .text {
      flex: 1;
    }
                      
    /* Bullet points */
    .bullet-item {
      display: flex;
      align-items: flex-start;
      margin: 10px 0;
      padding: 10px 14px;
      background: #f0fdf4;
      border-radius: 8px;
    }
                      
    .bullet-marker {
      color: #10b981;
      font-size: 16px;
      margin-right: 10px;
    }
                      
    .bullet-text {
      flex: 1;
    }
                      
    /* Badge de porcentagem */
    .percentage-badge {
      background: #f97316;
      color: white;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.9em;
      display: inline-block;
    }
                      
    /* Valores destacados */
    .highlight-value {
      background: rgba(99,102,241,0.1);
      color: #4f46e5;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
                      
    /* Alertas de risco */
    .risk-badge {
      background: #fef2f2;
      color: #dc2626;
      padding: 2px 8px 2px 3px;
      border-radius: 6px;
      font-weight: 600;
      border: 1px solid #fecaca;
      display: inline-flex;
      align-items: center;
      margin: 0 2px;
    }
                      
    /* Box de alerta importante */
    .important-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 4px solid #f59e0b;
      border-radius: 6px;
      padding: 12px;
      margin: 14px 0;
      display: flex;
      align-items: center;
    }
                      
    /* Texto destacado importante */
    .important-text {
      color: #b45309;
      font-weight: 600;
    }
    
    .footer { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-top: 15px; 
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
    
    @page { margin: 12mm; }
    @media print {
      body { background: white; }
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
          <h1>Dr. Vital IA - Análise Personalizada</h1>
          <div class="subtitle">👤 ${userName || 'Paciente'} • 📋 ${generateTitle(currentQuestion)} • 📅 ${currentDate}</div>
        </div>
        <img src="${logoBase64}" alt="MaxNutrition" class="logo" />
      </div>
      <div class="content">
        ${formatResponse(response.response)}
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user?.id) return;

    setIsLoading(true);
    setCurrentQuestion(message.trim());
    try {
      const { data, error } = await supabase.functions.invoke('dr-vital-enhanced', {
        body: {
          message: message.trim(),
          userId: user.id
        }
      });

      if (error) throw error;

      setResponse(data);
      setIsPopupOpen(true);
      setMessage('');
      toast.success('Análise completa do Dr. Vital recebida!');
    } catch (error) {
      console.error('Erro ao consultar Dr. Vital:', error);
      toast.error('Erro ao comunicar com Dr. Vital. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDataCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDataCompletenessText = (percentage: number) => {
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Adequado';
    return 'Insuficiente';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-blue-600" />
          Dr. Vital - Análise Médica Completa
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Dr. Vital tem acesso a todos os seus dados: anamnese, peso, altura, gênero, IMC, metabolismo, 
          metas, histórico nutricional, respostas diárias e muito mais para análises precisas.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Formulário de consulta */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Como você está se sentindo? Conte sobre sua saúde, sintomas, dúvidas médicas, ou peça uma análise completa dos seus dados..."
            rows={4}
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            disabled={!message.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando dados completos...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Consultar Dr. Vital
              </>
            )}
          </Button>
        </form>

        {/* Resposta do Dr. Vital - Apenas notificação com botão para popup */}
        {response && (
          <div className="mt-8">
            <Card className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-indigo-100 overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 transform translate-x-8 -translate-y-8 opacity-10">
                <svg viewBox="0 0 100 100" fill="currentColor" className="text-indigo-500">
                  <path d="M50 0 L100 50 L50 100 L0 50 Z"></path>
                </svg>
              </div>
              <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 p-1 border border-indigo-200 flex items-center justify-center">
                      <DrVitalImage size="sm" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-1 text-indigo-900">
                        <span>Análise concluída</span>
                        <span className="ml-2 text-emerald-500">✓</span>
                      </CardTitle>
                      <p className="text-xs text-indigo-700/70">
                        Dr. Vital analisou {userName ? `seus dados, ${userName}` : "seus dados"} e preparou recomendações personalizadas
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3 pb-4 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-white/80">
                      <div className={`w-3 h-3 rounded-full ${getDataCompletenessColor(response.dataCompleteness.completionPercentage)}`} />
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className="font-semibold text-sm">{response.dataCompleteness.completionPercentage}% de dados disponíveis</span>
                      <Badge variant="outline" className="bg-white/40">
                        {getDataCompletenessText(response.dataCompleteness.completionPercentage)}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsPopupOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white border-0 shadow-md"
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Ver Análise Completa
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Modal elegante com o conteúdo completo */}
            <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
              <DialogContent className="w-[95vw] max-w-4xl p-0 overflow-hidden max-h-[90vh]">
                {/* Cabeçalho colorido com gradiente */}
                <div className="bg-gradient-to-r from-indigo-600 via-cyan-500 to-amber-500 p-3 sm:p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white/20 p-1.5 sm:p-2 border-2 border-white/30 flex-shrink-0">
                        <DrVitalImage size="lg" className="w-full h-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h1 className="text-base sm:text-xl font-bold mb-0.5 sm:mb-1 truncate">Dr. Vital IA</h1>
                        <p className="text-xs sm:text-sm opacity-95 font-medium line-clamp-2">
                          {userName ? `Análise para ${userName}` : generateTitle(currentQuestion)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                      <Button size="sm" variant="secondary" onClick={handlePrint} className="bg-white/90 text-indigo-700 hover:bg-white shadow-lg text-xs sm:text-sm px-2 sm:px-3">
                        📄 Imprimir
                      </Button>
                      <img src="/images/maxnutrition-logo.png" alt="MaxNutrition" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/20 p-1 hidden sm:block" />
                    </div>
                  </div>
                </div>

                {/* Conteúdo com cores */}
                <div className="p-3 sm:p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="bg-white rounded-xl p-3 sm:p-6 shadow-sm border border-slate-200">
                    <style>{`
                      /* Blocos de conteúdo com ícones temáticos */
                      .content-block {
                        position: relative;
                        margin-bottom: 16px;
                        padding: 12px 12px 12px 36px;
                        border-radius: 10px;
                        background: white;
                        border: 1px solid #e2e8f0;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                      }
                      
                      @media (min-width: 640px) {
                        .content-block {
                          margin-bottom: 24px;
                          padding: 14px 14px 14px 42px;
                        }
                      }
                      
                      .content-block:after {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        height: 100%;
                        width: 4px;
                        border-radius: 10px 0 0 10px;
                      }
                      
                      @media (min-width: 640px) {
                        .content-block:after {
                          width: 5px;
                        }
                      }
                      
                      .block-icon {
                        position: absolute;
                        left: 8px;
                        top: 12px;
                        font-size: 16px;
                        width: 20px;
                        height: 20px;
                        line-height: 20px;
                        text-align: center;
                      }
                      
                      @media (min-width: 640px) {
                        .block-icon {
                          left: 12px;
                          top: 14px;
                          font-size: 18px;
                          width: 22px;
                          height: 22px;
                          line-height: 22px;
                        }
                      }
                      
                      /* Estilos específicos para cada tipo de bloco */
                      .weight-block:after { background-color: #06b6d4; }
                      .goal-block:after { background-color: #8b5cf6; }
                      .nutrition-block:after { background-color: #10b981; }
                      .metabolism-block:after { background-color: #f59e0b; }
                      .risk-block:after { background-color: #ef4444; }
                      .recommendation-block:after { background-color: #0ea5e9; }
                      .data-block:after { background-color: #6366f1; }
                      .general-block:after { background-color: #64748b; }
                      
                      /* Títulos de seção */
                      .section-title {
                        color: #1e293b;
                        font-size: 15px;
                        font-weight: 700;
                        margin: 14px 0 12px;
                        padding-bottom: 6px;
                        border-bottom: 1px solid #e2e8f0;
                        display: flex;
                        align-items: center;
                        word-break: break-word;
                      }
                      
                      @media (min-width: 640px) {
                        .section-title {
                          font-size: 18px;
                          margin: 18px 0 16px;
                        }
                      }
                      
                      /* Itens numerados */
                      .numbered-item {
                        display: flex;
                        margin: 8px 0;
                        padding: 10px;
                        background: #f8fafc;
                        border-radius: 10px;
                      }
                      
                      @media (min-width: 640px) {
                        .numbered-item {
                          margin: 12px 0;
                          padding: 14px;
                        }
                      }
                      
                      .numbered-item .number {
                        background: #6366f1;
                        color: white;
                        width: 22px;
                        height: 22px;
                        min-width: 22px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        margin-right: 10px;
                        font-size: 11px;
                        flex-shrink: 0;
                      }
                      
                      @media (min-width: 640px) {
                        .numbered-item .number {
                          width: 24px;
                          height: 24px;
                          min-width: 24px;
                          margin-right: 12px;
                          font-size: 12px;
                        }
                      }
                      
                      .numbered-item .text {
                        flex: 1;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        min-width: 0;
                      }
                      
                      /* Bullet points */
                      .bullet-item {
                        display: flex;
                        align-items: flex-start;
                        margin: 8px 0;
                        padding: 8px 10px;
                        background: #f0fdf4;
                        border-radius: 8px;
                      }
                      
                      @media (min-width: 640px) {
                        .bullet-item {
                          margin: 10px 0;
                          padding: 10px 14px;
                        }
                      }
                      
                      .bullet-marker {
                        color: #10b981;
                        font-size: 14px;
                        margin-right: 8px;
                        flex-shrink: 0;
                      }
                      
                      @media (min-width: 640px) {
                        .bullet-marker {
                          font-size: 16px;
                          margin-right: 10px;
                        }
                      }
                      
                      .bullet-text {
                        flex: 1;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        min-width: 0;
                      }
                      
                      /* Badge de porcentagem */
                      .percentage-badge {
                        background: #f97316;
                        color: white;
                        font-weight: bold;
                        padding: 2px 6px;
                        border-radius: 10px;
                        font-size: 0.8em;
                        display: inline-block;
                      }
                      
                      @media (min-width: 640px) {
                        .percentage-badge {
                          padding: 3px 8px;
                          border-radius: 12px;
                          font-size: 0.9em;
                        }
                      }
                      
                      /* Valores destacados */
                      .highlight-value {
                        background: rgba(99,102,241,0.1);
                        color: #4f46e5;
                        padding: 1px 4px;
                        border-radius: 4px;
                        font-weight: 600;
                      }
                      
                      @media (min-width: 640px) {
                        .highlight-value {
                          padding: 2px 6px;
                        }
                      }
                      
                      /* Alertas de risco */
                      .risk-badge {
                        background: #fef2f2;
                        color: #dc2626;
                        padding: 2px 6px 2px 3px;
                        border-radius: 6px;
                        font-weight: 600;
                        border: 1px solid #fecaca;
                        display: inline-flex;
                        align-items: center;
                        margin: 0 2px;
                        font-size: 0.85em;
                      }
                      
                      @media (min-width: 640px) {
                        .risk-badge {
                          padding: 2px 8px 2px 3px;
                          font-size: 1em;
                        }
                      }
                      
                      /* Box de alerta importante */
                      .important-box {
                        background: #fffbeb;
                        border: 1px solid #fde68a;
                        border-left: 4px solid #f59e0b;
                        border-radius: 6px;
                        padding: 10px;
                        margin: 12px 0;
                        display: flex;
                        align-items: center;
                      }
                      
                      @media (min-width: 640px) {
                        .important-box {
                          padding: 12px;
                          margin: 14px 0;
                        }
                      }
                      
                      /* Texto destacado importante */
                      .important-text {
                        color: #b45309;
                        font-weight: 600;
                      }
                      
                      /* Conteúdo do bloco */
                      .block-content {
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                        min-width: 0;
                      }
                    `}</style>
                    <div 
                      className="text-xs sm:text-sm leading-relaxed text-slate-700"
                      dangerouslySetInnerHTML={{ __html: formatResponse(response.response) }}
                    />
                  </div>
                  
                  {/* Footer com logo */}
                  <div className="mt-3 sm:mt-4 flex items-center justify-center gap-2 text-[10px] sm:text-xs text-slate-500 bg-white/60 rounded-lg p-2 sm:p-3">
                    <img src="/images/maxnutrition-logo.png" alt="MaxNutrition" className="w-4 h-4" />
                    <span>⚠️ Este material é educativo e não substitui consulta médica presencial.</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dados faltantes */}
            {response.dataCompleteness.missingData.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-orange-800">
                    Dados Faltantes para Análise Mais Completa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {response.dataCompleteness.missingData.map((missing) => (
                      <Badge key={missing} variant="outline" className="text-xs">
                        {missing === 'profile' && 'Perfil Básico'}
                        {missing === 'physicalData' && 'Dados Físicos'}
                        {missing === 'weightHistory' && 'Histórico de Peso'}
                        {missing === 'anamnesis' && 'Anamnese'}
                        {missing === 'activeGoals' && 'Metas Ativas'}
                        {missing === 'nutritionHistory' && 'Histórico Nutricional'}
                        {missing === 'dailyResponses' && 'Respostas Diárias'}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Sugestões de perguntas */}
        {!response && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Sugestões de consultas:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Faça uma análise completa dos meus dados de saúde",
                "Como está minha evolução de peso e composição corporal?",
                "Analise meu padrão nutricional e dê sugestões",
                "Avalie meu risco metabólico baseado nos meus dados",
                "Que exames devo fazer considerando minha anamnese?",
                "Como posso melhorar minha qualidade de vida?"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(suggestion)}
                  className="text-left h-auto p-3 whitespace-normal"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};