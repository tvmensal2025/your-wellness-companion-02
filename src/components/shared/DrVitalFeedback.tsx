import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Stethoscope, 
  RefreshCw, 
  User, 
  Download, 
  Share2, 
  Mail, 
  MessageCircle, 
  Printer,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Brain,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getCharacterImageUrl } from '@/lib/character-images';
import { motion, AnimatePresence } from 'framer-motion';

interface DrVitalFeedbackProps {
  assessmentType: 'abundance' | 'competency' | 'health' | 'life';
  scores: Record<string, number>;
  areas: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  userProfile?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
  onResetToDefault: () => void;
  onNewAssessment: () => void;
  onShowResults: () => void;
}

export const DrVitalFeedback: React.FC<DrVitalFeedbackProps> = ({
  assessmentType,
  scores,
  areas,
  userProfile,
  onResetToDefault,
  onNewAssessment,
  onShowResults
}) => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const { toast } = useToast();

  const drVitalImageUrl = getCharacterImageUrl('dr-vital');

  // Calcular estatísticas - converter para escala 0-100
  const scoreValues = Object.values(scores);
  const maxPossible = assessmentType === 'abundance' ? 5 : 10;
  const normalizedScores = scoreValues.map(s => (s / maxPossible) * 100);
  const averageScore = normalizedScores.reduce((a, b) => a + b, 0) / normalizedScores.length;
  
  // Identificar áreas (usando threshold de 40% para críticas e 70% para fortes)
  const criticalAreas = areas.filter(area => {
    const score = (scores[area.id] / maxPossible) * 100;
    return score <= 40;
  });
  const strongAreas = areas.filter(area => {
    const score = (scores[area.id] / maxPossible) * 100;
    return score >= 70;
  });
  const mediumAreas = areas.filter(area => {
    const score = (scores[area.id] / maxPossible) * 100;
    return score > 40 && score < 70;
  });

  // Função para determinar classificação do score
  const getScoreClassification = (score: number) => {
    if (score >= 80) return { label: 'Excelente', color: 'from-emerald-500 to-green-600', icon: '🏆' };
    if (score >= 60) return { label: 'Bom', color: 'from-blue-500 to-indigo-600', icon: '👍' };
    if (score >= 40) return { label: 'Regular', color: 'from-amber-500 to-orange-600', icon: '📊' };
    return { label: 'Necessita Atenção', color: 'from-red-500 to-rose-600', icon: '⚠️' };
  };

  const classification = getScoreClassification(averageScore);

  // Gerar feedback personalizado
  const generateFeedback = () => {
    const assessmentNames = {
      abundance: 'Roda da Abundância Financeira',
      competency: 'Roda das 8 Competências',
      health: 'Avaliação de Saúde',
      life: 'Roda da Vida'
    };

    const name = userProfile?.full_name?.split(' ')[0] || 'você';
    const scoreText = Math.round(averageScore);
    
    const baseMessages = [
      `Olá, ${name}! 👋 Sou o Dr. Vital e acabei de analisar sua ${assessmentNames[assessmentType]} com todo carinho e atenção científica.`,
      
      `📊 Seu score geral é de ${scoreText}% - classificado como "${classification.label}". ${
        averageScore >= 70 
          ? 'Você está no caminho certo!' 
          : averageScore >= 50 
            ? 'Há oportunidades de melhoria que vamos trabalhar juntos.' 
            : 'Identifiquei algumas áreas prioritárias que precisamos focar.'
      }`,
      
      strongAreas.length > 0 
        ? `💪 Suas maiores forças são: ${strongAreas.slice(0, 3).map(a => a.name).join(', ')}. ${
            strongAreas.length > 3 ? `E mais ${strongAreas.length - 3} áreas!` : ''
          } Esses são pilares sólidos para seu crescimento!`
        : `💡 Vamos construir seus pontos fortes! Com as estratégias certas, você pode transformar qualquer área em um pilar de sucesso.`,
      
      criticalAreas.length > 0
        ? `🎯 Áreas para focar: ${criticalAreas.slice(0, 3).map(a => a.name).join(', ')}. ${
            criticalAreas.length > 1 
              ? 'Recomendo começar por uma de cada vez para resultados sustentáveis.' 
              : 'Com dedicação, você pode transformar isso rapidamente!'
          }`
        : `✨ Parabéns! Não há áreas críticas. Seu foco agora é manter e elevar ainda mais!`,
      
      `🚀 Vamos ver seus resultados detalhados? Preparei gráficos, insights e um plano de ação personalizado para você!`
    ];

    return baseMessages;
  };

  const messages = generateFeedback();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleNextMessage = () => {
    if (currentMessage < messages.length - 1) {
      setCurrentMessage(prev => prev + 1);
    } else {
      setShowActions(true);
    }
  };

  const handlePrevMessage = () => {
    if (currentMessage > 0) {
      setCurrentMessage(prev => prev - 1);
    }
  };

  const handleShare = (method: 'email' | 'whatsapp' | 'print') => {
    const assessmentName = {
      abundance: 'Roda da Abundância',
      competency: 'Roda das Competências', 
      health: 'Avaliação de Saúde',
      life: 'Roda da Vida'
    }[assessmentType];

    const score = Math.round(averageScore);
    
    switch (method) {
      case 'email':
        const emailSubject = encodeURIComponent(`Minha Avaliação - ${assessmentName}`);
        const emailBody = encodeURIComponent(
          `Olá! Acabei de fazer minha avaliação de ${assessmentName} e obtive um score de ${score}%.\n\n` +
          `Áreas fortes: ${strongAreas.map(a => a.name).join(', ')}\n` +
          `Áreas para melhorar: ${criticalAreas.map(a => a.name).join(', ')}\n\n` +
          `Quer fazer sua avaliação também? Acesse: ${window.location.origin}`
        );
        window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
        break;
        
      case 'whatsapp':
        const whatsappText = encodeURIComponent(
          `🌟 Acabei de fazer minha avaliação de ${assessmentName}!\n\n` +
          `📊 Score: ${score}%\n` +
          `💪 Áreas fortes: ${strongAreas.map(a => a.name).join(', ')}\n` +
          `🎯 Para melhorar: ${criticalAreas.map(a => a.name).join(', ')}\n\n` +
          `Quer fazer sua avaliação também? Acesse: ${window.location.origin}`
        );
        window.open(`https://wa.me/?text=${whatsappText}`);
        break;
        
      case 'print':
        window.print();
        break;
    }

    toast({
      title: "Compartilhado!",
      description: `Sua avaliação foi ${method === 'print' ? 'enviada para impressão' : 'compartilhada'}.`,
    });
  };

  const handleDownload = () => {
    const assessmentName = {
      abundance: 'Roda da Abundância',
      competency: 'Roda das Competências',
      health: 'Avaliação de Saúde', 
      life: 'Roda da Vida'
    }[assessmentType];

    const score = Math.round(averageScore);
    
    const reportContent = `
═══════════════════════════════════════════════════════════
                    ${assessmentName.toUpperCase()}
═══════════════════════════════════════════════════════════

📅 Data: ${new Date().toLocaleDateString('pt-BR')}
👤 Paciente: ${userProfile?.full_name || 'Não informado'}
📧 Email: ${userProfile?.email || 'Não informado'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                      SCORE GERAL: ${score}%
                    Classificação: ${classification.label}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💪 ÁREAS FORTES (${strongAreas.length}):
${strongAreas.length > 0 ? strongAreas.map(area => `   ✓ ${area.name}: ${Math.round((scores[area.id] / maxPossible) * 100)}%`).join('\n') : '   Nenhuma área acima de 70%'}

📊 ÁREAS INTERMEDIÁRIAS (${mediumAreas.length}):
${mediumAreas.length > 0 ? mediumAreas.map(area => `   ○ ${area.name}: ${Math.round((scores[area.id] / maxPossible) * 100)}%`).join('\n') : '   Nenhuma área entre 40-70%'}

🎯 ÁREAS PARA MELHORAR (${criticalAreas.length}):
${criticalAreas.length > 0 ? criticalAreas.map(area => `   ⚠ ${area.name}: ${Math.round((scores[area.id] / maxPossible) * 100)}%`).join('\n') : '   Nenhuma área abaixo de 40%'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    TODAS AS ÁREAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${areas.map(area => `   ${area.icon} ${area.name}: ${Math.round((scores[area.id] / maxPossible) * 100)}%`).join('\n')}

═══════════════════════════════════════════════════════════
              Instituto dos Sonhos - Dr. Vital
            Avaliação Personalizada de Saúde
═══════════════════════════════════════════════════════════
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avaliacao-${assessmentType}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode === document.body) {
        document.body.removeChild(a);
      }
      URL.revokeObjectURL(url);
    }, 100);

    toast({
      title: "Relatório baixado!",
      description: "Sua avaliação foi salva no seu dispositivo.",
    });
  };

  // Animated score ring
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (averageScore / 100) * circumference;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full my-4"
      >
        <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 shadow-2xl overflow-hidden">
          {/* Header decorativo */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-primary/30 via-blue-600/20 to-purple-600/20 blur-xl" />
          
          <CardHeader className="text-center pb-4 relative">
            {/* Avatar do Dr. Vital com glow effect */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-24 h-24 relative mb-4"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative w-full h-full bg-gradient-to-br from-emerald-500 to-green-600 rounded-full p-1">
                <img 
                  src={drVitalImageUrl}
                  alt="Dr. Vital"
                  className="w-full h-full object-cover rounded-full border-2 border-white/20"
                />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-1 -right-1 bg-green-500 text-white p-1.5 rounded-full shadow-lg"
              >
                <Stethoscope className="w-4 h-4" />
              </motion.div>
            </motion.div>

            <CardTitle className="text-2xl text-white flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              Dr. Vital - Análise Personalizada
            </CardTitle>
            
            {/* Badge do tipo de avaliação */}
            <Badge className={`mt-2 bg-gradient-to-r ${classification.color} text-white border-0`}>
              {classification.icon} {classification.label}
            </Badge>
            
            {/* Dados do Usuário */}
            {userProfile && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-white/5 backdrop-blur-sm rounded-xl text-sm text-slate-300 border border-white/10"
              >
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-400" />
                    {userProfile.full_name || 'Usuário'}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400">
                    {new Date().toLocaleDateString('pt-BR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </span>
                </div>
              </motion.div>
            )}
          </CardHeader>

          <CardContent className="space-y-6 relative">
            {/* Score Visual Principal */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <div className="relative">
                <svg className="w-36 h-36 transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="72"
                    cy="72"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-slate-700"
                  />
                  {/* Animated progress circle */}
                  <motion.circle
                    cx="72"
                    cy="72"
                    r="45"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeDasharray={circumference}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="50%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="text-4xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent"
                    >
                      {Math.round(averageScore)}%
                    </motion.span>
                    <p className="text-xs text-slate-400 mt-1">Score Geral</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Mensagem atual do Dr. Vital */}
            <motion.div 
              key={currentMessage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <img 
                    src={drVitalImageUrl}
                    alt="Dr. Vital"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white text-base leading-relaxed">
                    {messages[currentMessage]}
                  </p>
                </div>
              </div>
              
              {/* Progress dots and navigation */}
              <div className="mt-6 space-y-4">
                <div className="flex justify-center gap-2">
                  {messages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentMessage(index)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentMessage 
                          ? 'bg-gradient-to-r from-blue-400 to-purple-500 w-8' 
                          : index < currentMessage
                            ? 'bg-emerald-500/50 w-2'
                            : 'bg-slate-600 w-2'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between items-center">
                  <Button
                    onClick={handlePrevMessage}
                    disabled={currentMessage === 0}
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  
                  <span className="text-slate-500 text-sm">
                    {currentMessage + 1} / {messages.length}
                  </span>
                  
                  <Button
                    onClick={handleNextMessage}
                    disabled={currentMessage === messages.length - 1 && showActions}
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Resumo visual compacto */}
            {currentMessage >= 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-3"
              >
                <div className="text-center p-4 bg-gradient-to-br from-emerald-500/20 to-green-600/10 rounded-xl border border-emerald-500/20">
                  <div className="flex justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">
                    {strongAreas.length}
                  </div>
                  <div className="text-xs text-slate-400">Áreas Fortes</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-500/20 to-indigo-600/10 rounded-xl border border-blue-500/20">
                  <div className="flex justify-center mb-2">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    {mediumAreas.length}
                  </div>
                  <div className="text-xs text-slate-400">Em Progresso</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-xl border border-amber-500/20">
                  <div className="flex justify-center mb-2">
                    <TrendingDown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-amber-400">
                    {criticalAreas.length}
                  </div>
                  <div className="text-xs text-slate-400">A Melhorar</div>
                </div>
              </motion.div>
            )}

            {/* Ações */}
            <AnimatePresence>
              {(showActions || currentMessage === messages.length - 1) && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="space-y-4"
                >
                  {/* Ação principal */}
                  <Button
                    onClick={onShowResults}
                    className="w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 text-white py-6 text-lg font-semibold shadow-lg shadow-blue-500/25"
                    size="lg"
                  >
                    <Award className="w-5 h-5 mr-2" />
                    Ver Resultados Detalhados
                  </Button>
                  
                  {/* Opções de compartilhamento */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar
                    </Button>
                    
                    <Button
                      onClick={() => handleShare('email')}
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    
                    <Button
                      onClick={() => handleShare('whatsapp')}
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    
                    <Button
                      onClick={() => handleShare('print')}
                      variant="outline"
                      size="sm"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Imprimir
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão para mostrar ações */}
            {currentMessage === messages.length - 1 && !showActions && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center"
              >
                <Button
                  onClick={() => setShowActions(true)}
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ver Opções
                </Button>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
