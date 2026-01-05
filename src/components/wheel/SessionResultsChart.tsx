import React, { useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Printer, 
  Share2, 
  User, 
  Calendar, 
  Phone, 
  Mail,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  ChevronLeft,
  Sparkles,
  Heart,
  Brain,
  Shield,
  Activity,
  Zap,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip as RechartsTooltip
} from 'recharts';

interface SessionResultsChartProps {
  userProfile?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
  sessionData: {
    score: number;
    systems: Array<{
      name: string;
      score: number;
      color: string;
      icon: string;
      insights: string[];
    }>;
    timeline?: Array<{
      date: string;
      score: number;
    }>;
  };
  onBack?: () => void;
}

export const SessionResultsChart: React.FC<SessionResultsChartProps> = ({
  userProfile,
  sessionData,
  onBack
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Calcular estatísticas
  const stats = useMemo(() => {
    const scores = sessionData.systems.map(s => s.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const strongAreas = sessionData.systems.filter(s => s.score >= 8);
    const weakAreas = sessionData.systems.filter(s => s.score < 6);
    return { avg, strongAreas, weakAreas };
  }, [sessionData.systems]);

  const handlePrint = () => {
    window.print();
    toast({
      title: "Imprimindo",
      description: "Seu relatório está sendo preparado.",
    });
  };

  const handleDownload = async () => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      if (!chartRef.current) return;

      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#0f172a'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`relatorio-sessao-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Download concluído",
        description: "Seu relatório foi baixado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o relatório.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Meu Relatório de Sessão',
          text: `Confira meu score: ${sessionData.score.toFixed(1)}/10`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiado",
          description: "Link do relatório copiado para a área de transferência.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar o relatório.",
        variant: "destructive"
      });
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 8) return { level: 'EXCELENTE', color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-400', bgColor: 'bg-emerald-500' };
    if (score >= 7) return { level: 'BOM', color: 'from-blue-500 to-indigo-600', textColor: 'text-blue-400', bgColor: 'bg-blue-500' };
    if (score >= 6) return { level: 'REGULAR', color: 'from-amber-500 to-orange-600', textColor: 'text-amber-400', bgColor: 'bg-amber-500' };
    if (score >= 4) return { level: 'ATENÇÃO', color: 'from-orange-500 to-red-600', textColor: 'text-orange-400', bgColor: 'bg-orange-500' };
    return { level: 'CRÍTICO', color: 'from-red-500 to-rose-600', textColor: 'text-red-400', bgColor: 'bg-red-500' };
  };

  const scoreInfo = getScoreLevel(sessionData.score);

  // Preparar dados para gráficos
  const radarData = sessionData.systems.map(system => ({
    subject: system.name.replace('Sistema ', '').substring(0, 12),
    score: system.score,
    fullMark: 10
  }));

  const barData = [...sessionData.systems].sort((a, b) => b.score - a.score).map(system => ({
    name: system.name.substring(0, 15),
    score: system.score,
    color: system.color
  }));

  // Animated score ring
  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (sessionData.score / 10) * circumference;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header fixo */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button onClick={onBack} variant="ghost" className="text-white hover:bg-white/10">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              )}
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Resultados da Sessão
                </h1>
                <p className="text-sm text-slate-400">
                  {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShare} variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button onClick={handlePrint} variant="outline" size="sm" className="bg-white/5 border-white/20 text-white hover:bg-white/10">
                <Printer className="w-4 h-4" />
              </Button>
              <Button onClick={handleDownload} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div ref={chartRef} className="max-w-7xl mx-auto p-6">
        {/* Dados do Usuário */}
        {userProfile && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-white/10">
              <CardContent className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{userProfile.full_name || 'Usuário'}</h2>
                      <p className="text-sm text-slate-400">{userProfile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date().toLocaleDateString('pt-BR')}
                    </span>
                    {userProfile.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4" />
                        {userProfile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Grid Principal */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Score Principal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-white/10 h-full">
              <CardContent className="pt-6 text-center">
                <div className="relative inline-block mb-6">
                  <svg className="w-40 h-40 transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="10"
                      className="text-slate-700"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="60"
                      fill="none"
                      stroke="url(#mainScoreGradient)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      initial={{ strokeDashoffset: circumference }}
                      animate={{ strokeDashoffset }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeDasharray={circumference}
                    />
                    <defs>
                      <linearGradient id="mainScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
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
                        transition={{ delay: 0.5 }}
                        className="text-5xl font-bold text-white"
                      >
                        {sessionData.score.toFixed(1)}
                      </motion.span>
                      <p className="text-sm text-slate-400 mt-1">/10.0</p>
                    </div>
                  </div>
                </div>
                
                <Badge className={`bg-gradient-to-r ${scoreInfo.color} text-white border-0 px-4 py-1.5 text-sm`}>
                  {scoreInfo.level}
                </Badge>
                
                <p className="text-slate-400 text-sm mt-4">
                  Score geral calculado com base em {sessionData.systems.length} áreas avaliadas
                </p>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 mt-6">
                  <div className="p-3 bg-emerald-500/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <span className="text-lg font-bold text-emerald-400">{stats.strongAreas.length}</span>
                    <p className="text-xs text-slate-400">Fortes</p>
                  </div>
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Target className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                    <span className="text-lg font-bold text-blue-400">{sessionData.systems.length - stats.strongAreas.length - stats.weakAreas.length}</span>
                    <p className="text-xs text-slate-400">Regulares</p>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-lg">
                    <TrendingDown className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <span className="text-lg font-bold text-amber-400">{stats.weakAreas.length}</span>
                    <p className="text-xs text-slate-400">Melhorar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico Radar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-white/10 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Visão Geral por Área
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <PolarRadiusAxis 
                      domain={[0, 10]} 
                      tick={{ fill: '#64748b', fontSize: 10 }}
                      axisLine={false}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="url(#radarGradient)"
                      fillOpacity={0.5}
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráfico de Barras */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Ranking das Áreas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} layout="vertical">
                  <XAxis type="number" domain={[0, 10]} tick={{ fill: '#64748b' }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: '#94a3b8', fontSize: 12 }}
                    width={120}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #334155',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.score >= 8 ? '#10b981' :
                          entry.score >= 6 ? '#3b82f6' :
                          entry.score >= 4 ? '#f59e0b' : '#ef4444'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cards de Áreas Detalhadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Análise Detalhada por Área
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionData.systems.map((system, index) => {
              const level = getScoreLevel(system.score);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                >
                  <Card className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border-white/10 hover:border-white/20 transition-all duration-300 group">
                    <CardContent className="pt-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center text-lg`}>
                            {system.icon}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                              {system.name}
                            </h3>
                            <Badge className={`mt-1 text-xs ${level.bgColor} text-white border-0`}>
                              {level.level}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${level.textColor}`}>
                            {system.score.toFixed(1)}
                          </span>
                          <p className="text-xs text-slate-500">/10</p>
                        </div>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-4">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(system.score / 10) * 100}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className={`h-full bg-gradient-to-r ${level.color}`}
                        />
                      </div>
                      
                      {system.insights && system.insights.length > 0 && (
                        <div className="space-y-1.5">
                          {system.insights.slice(0, 2).map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                              <span className="text-emerald-400 mt-0.5">•</span>
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Resumo e Recomendações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid md:grid-cols-2 gap-6 mt-6"
        >
          {/* Pontos Fortes */}
          <Card className="bg-gradient-to-br from-emerald-900/30 to-green-900/20 border-emerald-500/30">
            <CardHeader>
              <CardTitle className="text-emerald-400 flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5" />
                Pontos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.strongAreas.length > 0 ? (
                <div className="space-y-3">
                  {stats.strongAreas.map((system, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{system.icon}</span>
                        <span className="text-white font-medium">{system.name}</span>
                      </div>
                      <span className="text-emerald-400 font-bold">{system.score.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">
                  Continue trabalhando para desenvolver seus pontos fortes!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Áreas de Melhoria */}
          <Card className="bg-gradient-to-br from-amber-900/30 to-orange-900/20 border-amber-500/30">
            <CardHeader>
              <CardTitle className="text-amber-400 flex items-center gap-2 text-lg">
                <Target className="w-5 h-5" />
                Foco de Melhoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.weakAreas.length > 0 ? (
                <div className="space-y-3">
                  {stats.weakAreas.map((system, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{system.icon}</span>
                        <span className="text-white font-medium">{system.name}</span>
                      </div>
                      <span className="text-amber-400 font-bold">{system.score.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-sm italic">
                  Excelente! Não há áreas críticas para melhorar.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-sm text-slate-500 border-t border-white/10 pt-6"
        >
          <p>Relatório gerado pela Plataforma de Saúde • {new Date().toLocaleString('pt-BR')}</p>
          <p className="mt-1">Para mais informações, consulte seu profissional responsável.</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SessionResultsChart;
