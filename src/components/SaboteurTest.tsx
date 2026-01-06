import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Brain, Target, AlertTriangle, CheckCircle, Clock, TrendingUp, BarChart3, Lightbulb, Heart, Zap, Shield, Eye, ArrowRight, ArrowLeft, Star, Award, BookOpen, Users, MessageSquare, UserCheck, Settings, Download, Image } from 'lucide-react';
import { saboteurQuestions, Question } from '@/data/saboteurQuestions';
import html2canvas from 'html2canvas';
import SaboteurReportImage from './SaboteurReportImage';

interface SaboteurType {
  name: string;
  description: string;
  characteristics: string[];
  impact: string;
  strategies: string[];
  color: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
}
const saboteurTypes: Record<string, SaboteurType> = {
  perfeccionismo: {
    name: "O Perfeccionista",
    description: "O sabotador que exige perfeição absoluta em tudo, criando padrões impossíveis de atingir.",
    characteristics: ["Estabelece padrões extremamente altos", "Foca em detalhes irrelevantes", "Tem dificuldade em aceitar resultados 'bons o suficiente'", "Procrastina por medo de imperfeição", "Revisa trabalho repetidamente"],
    impact: "Pode levar à paralisia, procrastinação e burnout, impedindo progresso real.",
    strategies: ["Estabeleça padrões realistas e flexíveis", "Celebre progresso, não apenas perfeição", "Pratique o conceito de 'bom o suficiente'", "Foque no processo, não apenas no resultado", "Defina prazos para finalizar projetos"],
    color: "text-purple-600",
    icon: Star
  },
  procrastinacao: {
    name: "O Procrastinador",
    description: "O sabotador que sempre encontra desculpas para adiar ações importantes.",
    characteristics: ["Sempre encontra razões para adiar", "Trabalha melhor 'sob pressão'", "Distrai-se facilmente", "Tem dificuldade em priorizar", "Começa muitas coisas mas não termina"],
    impact: "Resulta em estresse desnecessário, prazos apertados e qualidade comprometida.",
    strategies: ["Quebre tarefas grandes em partes menores", "Use a técnica Pomodoro (25min focados)", "Elimine distrações durante períodos de foco", "Estabeleça prazos intermediários", "Crie rotinas consistentes"],
    color: "text-orange-600",
    icon: Clock
  },
  comparacao: {
    name: "O Comparador",
    description: "O sabotador que constantemente se compara com outros, perdendo foco no próprio progresso.",
    characteristics: ["Compara-se constantemente com outros", "Foca no que outros têm ou fazem", "Perde perspectiva do próprio progresso", "Sente-se inadequado facilmente", "Fica desmotivado com sucessos alheios"],
    impact: "Reduz autoestima, motivação e foco no próprio desenvolvimento.",
    strategies: ["Foque no seu próprio progresso", "Celebre conquistas pessoais", "Use comparação como inspiração, não desmotivação", "Pratique gratidão pelo que você tem", "Desenvolva sua própria métrica de sucesso"],
    color: "text-blue-600",
    icon: Users
  },
  autocritica: {
    name: "O Autocrítico",
    description: "O sabotador que tem uma voz interna extremamente negativa e crítica.",
    characteristics: ["Voz interna muito negativa", "Foca mais em erros que acertos", "Tem dificuldade em aceitar elogios", "Espera o pior de si mesmo", "É mais duro consigo que com outros"],
    impact: "Reduz confiança, motivação e pode levar à depressão e ansiedade.",
    strategies: ["Pratique autocompaixão diariamente", "Reconheça e celebre pequenas conquistas", "Trate-se como trataria um amigo", "Desenvolva uma voz interna mais gentil", "Foque nos seus pontos fortes"],
    color: "text-red-600",
    icon: Heart
  },
  medo_falha: {
    name: "O Medroso",
    description: "O sabotador que tem tanto medo de falhar que evita tentar coisas novas.",
    characteristics: ["Evita situações desconhecidas", "Prefere não tentar do que tentar e falhar", "Fica ansioso com mudanças", "Tem medo de julgamento dos outros", "Fica paralisado por possíveis falhas"],
    impact: "Limita crescimento pessoal e profissional, mantendo a pessoa na zona de conforto.",
    strategies: ["Reenquadre falhas como oportunidades de aprendizado", "Comece com desafios pequenos", "Pratique aceitação da imperfeição", "Foque no processo, não apenas no resultado", "Desenvolva resiliência emocional"],
    color: "text-yellow-600",
    icon: Shield
  },
  pensamento_binario: {
    name: "O Binário",
    description: "O sabotador que vê tudo como preto ou branco, sem nuances.",
    characteristics: ["Vê situações como 'tudo ou nada'", "Tem dificuldade com nuances", "É muito rígido em suas opiniões", "Não aceita resultados intermediários", "É inflexível em suas decisões"],
    impact: "Cria expectativas irreais e dificulta flexibilidade e adaptação.",
    strategies: ["Pratique ver nuances nas situações", "Aceite que a vida tem tons de cinza", "Desenvolva flexibilidade de pensamento", "Foque em progresso gradual", "Pratique aceitação de diferentes perspectivas"],
    color: "text-gray-600",
    icon: Eye
  },
  vitima: {
    name: "A Vítima",
    description: "O sabotador que sempre se vê como vítima das circunstâncias.",
    characteristics: ["Sempre acha que a vida é injusta", "Culpa outros pelos seus problemas", "Sente que não tem controle", "Acha que outros têm mais sorte", "Evita assumir responsabilidade"],
    impact: "Reduz autonomia, motivação e capacidade de mudança.",
    strategies: ["Assuma responsabilidade pelas suas escolhas", "Foque no que você pode controlar", "Desenvolva mentalidade de crescimento", "Pratique gratidão pelas oportunidades", "Aceite que você tem poder de mudança"],
    color: "text-pink-600",
    icon: UserCheck
  },
  controle: {
    name: "O Controlador",
    description: "O sabotador que precisa controlar tudo ao seu redor.",
    characteristics: ["Precisa controlar tudo", "Fica ansioso com imprevistos", "Tem dificuldade em delegar", "Precisa saber de tudo", "Fica frustrado quando outros não seguem seu jeito"],
    impact: "Cria estresse desnecessário e dificulta relacionamentos e colaboração.",
    strategies: ["Pratique aceitação do que não pode controlar", "Aprenda a delegar e confiar", "Desenvolva flexibilidade", "Foque no que realmente importa", "Pratique mindfulness e presença"],
    color: "text-indigo-600",
    icon: Settings
  },
  aprovacao: {
    name: "O Aprovador",
    description: "O sabotador que precisa da aprovação dos outros para se sentir bem.",
    characteristics: ["Precisa da aprovação dos outros", "Fica ansioso com rejeição", "Tem dificuldade em tomar decisões sozinho", "Preocupa-se com o que outros pensam", "Precisa agradar todos"],
    impact: "Reduz autenticidade, confiança e capacidade de tomar decisões independentes.",
    strategies: ["Desenvolva autoconfiança", "Pratique tomar decisões independentes", "Aceite que não pode agradar todos", "Foque em seus próprios valores", "Desenvolva autoestima interna"],
    color: "text-green-600",
    icon: MessageSquare
  }
};
const SaboteurTest: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const handleAnswer = async (value: number) => {
    const questionId = saboteurQuestions[currentQuestion].id;

    // Atualiza resposta localmente
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));

    // Avança imediatamente para a próxima pergunta (fluxo rápido tipo Missão do Dia)
    if (currentQuestion < saboteurQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Se for a última pergunta, finaliza o teste
      await handleFinish();
      return;
    }

    // Salva resposta individual no banco (em background)
    await saveAnswer(questionId, value);
  };
  const saveAnswer = async (questionId: number, answer: number) => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const today = new Date().toISOString().split('T')[0];

      // Salvar na tabela daily_responses com seção saboteurs
      const {
        error
      } = await supabase.from('daily_responses').upsert({
        user_id: user.id,
        date: today,
        section: 'saboteurs',
        question_id: `saboteur_${questionId}`,
        answer: answer.toString(),
        points_earned: 5,
        // Pontos por resposta
        created_at: new Date().toISOString()
      });
      if (error) {
        console.error('Erro ao salvar resposta do sabotador:', error);
      } else {
        console.log(`Resposta do sabotador salva: ${questionId} = ${answer}`);
      }
    } catch (error) {
      console.error('Erro ao salvar resposta do sabotador:', error);
    }
  };
  const calculateScores = () => {
    const categoryScores: Record<string, number> = {};
    Object.keys(saboteurTypes).forEach(category => {
      const categoryQuestions = saboteurQuestions.filter(q => q.category === category);
      let totalScore = 0;
      let maxScore = 0;
      categoryQuestions.forEach(question => {
        const answer = answers[question.id] || 0;
        totalScore += answer * question.weight;
        maxScore += 5 * question.weight; // 5 é o valor máximo da escala
      });
      categoryScores[category] = totalScore / maxScore * 100;
    });
    setScores(categoryScores);
  };
  const handleFinish = async () => {
    setIsLoading(true);
    calculateScores();
    await saveTestResults();
    setShowResults(true);
    setIsLoading(false);
  };
  const saveTestResults = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;
      const today = new Date().toISOString().split('T')[0];
      const categoryScores: Record<string, number> = {};

      // Calcular scores por categoria
      Object.keys(saboteurTypes).forEach(category => {
        const categoryQuestions = saboteurQuestions.filter(q => q.category === category);
        let totalScore = 0;
        let maxScore = 0;
        categoryQuestions.forEach(question => {
          const answer = answers[question.id] || 0;
          totalScore += answer * question.weight;
          maxScore += 5 * question.weight;
        });
        categoryScores[category] = totalScore / maxScore * 100;
      });

      // Salvar resultados do teste de sabotadores
      const {
        error
      } = await supabase.from('daily_responses').upsert({
        user_id: user.id,
        date: today,
        section: 'saboteurs_results',
        question_id: 'saboteur_test_complete',
        answer: JSON.stringify(categoryScores),
        text_response: `Teste de sabotadores concluído com ${Object.keys(answers).length} respostas`,
        points_earned: 50,
        // Pontos por completar o teste
        created_at: new Date().toISOString()
      });
      if (error) {
        console.error('Erro ao salvar resultados do teste:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar os resultados do teste",
          variant: "destructive"
        });
      } else {
        console.log('Resultados do teste de sabotadores salvos:', categoryScores);

        // Determinar nível de risco
        const averageScore = Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.keys(categoryScores).length;
        const riskLevel = averageScore > 70 ? 'alto' : averageScore > 40 ? 'médio' : 'baixo';
        toast({
          title: "Teste Concluído! 🎯",
          description: `Seus resultados foram salvos. Nível de risco: ${riskLevel}`,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao salvar resultados:', error);
    }
  };
  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScores({});
  };
  const getTopSaboteurs = () => {
    return Object.entries(scores).sort(([, a], [, b]) => b - a).slice(0, 3);
  };
  const getOverallScore = () => {
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return totalScore / Object.keys(scores).length;
  };
  const getScoreLevel = (score: number) => {
    if (score < 30) return {
      level: "Baixo",
      color: "text-green-600",
      bgColor: "bg-green-100"
    };
    if (score < 60) return {
      level: "Médio",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    };
    return {
      level: "Alto",
      color: "text-red-600",
      bgColor: "bg-red-100"
    };
  };
  const progress = (currentQuestion + 1) / saboteurQuestions.length * 100;
  if (showResults) {
    const topSaboteurs = getTopSaboteurs();
    const overallScore = getOverallScore();
    const overallLevel = getScoreLevel(overallScore);
    const totalAnswered = Object.keys(answers).length;
    return <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
        {/* Hero Header com Gradiente */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background p-8 md:p-12 text-center space-y-6 border border-primary/20">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-gradient(white,transparent_70%)]" />
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Brain className="h-16 w-16 md:h-20 md:w-20 text-primary animate-pulse" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent mb-4">
              Parabéns! Teste Concluído! 🎉
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Você completou {totalAnswered} perguntas e deu um passo importante para o autoconhecimento
            </p>
          </div>
        </div>

        {/* Score Geral com Animação */}
        <Card className="health-card border-2">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <BarChart3 className="h-7 w-7 text-primary" />
              Seu Score Geral de Sabotadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-6">
              <div className="relative inline-block">
                <div className={`text-7xl md:text-8xl font-bold ${overallLevel.color} drop-shadow-lg`}>
                  {overallScore.toFixed(0)}%
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent blur-2xl" />
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <Badge className={`text-xl px-6 py-3 ${overallLevel.bgColor} ${overallLevel.color} shadow-lg`}>
                  Nível {overallLevel.level}
                </Badge>
                
                <div className="max-w-xl space-y-3">
                  {overallScore < 30 ? <>
                      <p className="text-lg font-semibold text-green-600">🌟 Resultado Excepcional!</p>
                      <p className="text-muted-foreground">
                        Você demonstra excelente consciência dos seus padrões mentais. Continue cultivando
                        essa autoconsciência e use-a para alcançar seus objetivos com mais facilidade.
                      </p>
                    </> : overallScore < 60 ? <>
                      <p className="text-lg font-semibold text-yellow-600">⚡ Momento de Transformação!</p>
                      <p className="text-muted-foreground">
                        Você identificou alguns sabotadores que podem estar limitando seu potencial. 
                        A boa notícia? Agora você tem clareza sobre onde focar sua energia para crescer ainda mais!
                      </p>
                    </> : <>
                      <p className="text-lg font-semibold text-orange-600">🎯 Grande Oportunidade de Crescimento!</p>
                      <p className="text-muted-foreground">
                        Seus sabotadores estão bastante ativos, mas isso significa que você tem um 
                        enorme potencial de transformação à sua frente. Cada insight é um passo rumo à sua melhor versão!
                      </p>
                    </>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Sabotadores com Design Melhorado */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
              <AlertTriangle className="h-7 w-7 text-orange-500" />
              Seus 3 Principais Sabotadores
            </h2>
            <p className="text-muted-foreground">
              Conheça os padrões que mais impactam sua jornada e como superá-los
            </p>
          </div>
          
          {topSaboteurs.map(([category, score], index) => {
          const saboteur = saboteurTypes[category];
          const Icon = saboteur.icon;
          const level = getScoreLevel(score);
          const medals = ['🥇', '🥈', '🥉'];
          return <Card key={category} className="health-card border-2 hover:shadow-xl transition-all duration-300">
                <CardHeader className="bg-gradient-to-r from-muted/30 to-transparent">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="relative">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${saboteur.color.replace('text-', 'from-')}/20 to-transparent border-2 ${saboteur.color.replace('text-', 'border-')}/30`}>
                          <Icon className={`h-8 w-8 ${saboteur.color}`} />
                        </div>
                        <span className="absolute -top-2 -right-2 text-2xl">{medals[index]}</span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-xl">
                            {saboteur.name}
                          </CardTitle>
                          <Badge className={`${level.bgColor} ${level.color} text-sm`}>
                            {level.level}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">{saboteur.description}</p>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <div className={`text-4xl md:text-5xl font-bold ${saboteur.color}`}>
                        {score.toFixed(0)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">intensidade</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  {/* Características */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-base">
                      <Eye className="h-4 w-4 text-blue-500" />
                      Como ele se manifesta:
                    </h4>
                    <div className="grid gap-2">
                      {saboteur.characteristics.slice(0, 3).map((char, i) => <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg">
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${saboteur.color.replace('text-', 'bg-')}`} />
                          {char}
                        </div>)}
                    </div>
                  </div>
                  
                  {/* Impacto */}
                  <div className="space-y-2 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold flex items-center gap-2 text-base text-orange-700 dark:text-orange-400">
                      <AlertTriangle className="h-4 w-4" />
                      Impacto na sua vida:
                    </h4>
                    <p className="text-sm text-orange-800 dark:text-orange-300">{saboteur.impact}</p>
                  </div>
                  
                  {/* Estratégias */}
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2 text-base">
                      <Lightbulb className="h-4 w-4 text-yellow-500" />
                      Estratégias Práticas de Transformação:
                    </h4>
                    <div className="space-y-2">
                      {saboteur.strategies.map((strategy, i) => <div key={i} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                          <span className="text-green-800 dark:text-green-300">{strategy}</span>
                        </div>)}
                    </div>
                  </div>
                </CardContent>
              </Card>;
        })}
        </div>

        {/* All Scores */}
        <Card className="health-card">
          <CardHeader>
            <CardTitle>Análise Completa por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(scores).map(([category, score]) => {
              const saboteur = saboteurTypes[category];
              const Icon = saboteur.icon;
              const level = getScoreLevel(score);
              return <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${saboteur.color}`} />
                      <div>
                        <p className="font-medium">{saboteur.name}</p>
                        <p className="text-sm text-muted-foreground">{score.toFixed(0)}%</p>
                      </div>
                    </div>
                    <Badge className={`${level.bgColor} ${level.color}`}>
                      {level.level}
                    </Badge>
                  </div>;
            })}
            </div>
          </CardContent>
        </Card>


        {/* Plano de Ação Personalizado */}
        <Card className="health-card bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Target className="h-7 w-7 text-primary" />
              Seu Plano de Ação Personalizado
            </CardTitle>
            <p className="text-muted-foreground">Comece sua transformação hoje mesmo com estes passos práticos</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Ação Imediata */}
              <div className="space-y-3 p-4 rounded-lg bg-card border-2 border-primary/30">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <h4 className="font-semibold">Ação Imediata (Esta Semana)</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Escolha UMA estratégia do seu sabotador #1 e pratique por 7 dias consecutivos. 
                  Pequenas ações consistentes geram grandes transformações!
                </p>
              </div>

              {/* Prática Diária */}
              <div className="space-y-3 p-4 rounded-lg bg-card border-2 border-blue-500/30">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <h4 className="font-semibold">Prática Diária</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Reserve 5 minutos pela manhã para identificar quando seus sabotadores aparecem. 
                  A consciência é o primeiro passo para a mudança!
                </p>
              </div>

              {/* Apoio */}
              <div className="space-y-3 p-4 rounded-lg bg-card border-2 border-green-500/30">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <h4 className="font-semibold">Busque Apoio</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Compartilhe seus insights com alguém de confiança. O apoio social 
                  potencializa sua jornada de transformação!
                </p>
              </div>

              {/* Acompanhamento */}
              <div className="space-y-3 p-4 rounded-lg bg-card border-2 border-purple-500/30">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <h4 className="font-semibold">Acompanhe Sua Evolução</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Refaça este teste mensalmente para acompanhar seu progresso e 
                  celebrar suas conquistas!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insights e Estatísticas */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="health-card text-center">
            <CardContent className="pt-6">
              <Award className="h-12 w-12 text-primary mx-auto mb-3" />
              <div className="text-3xl font-bold text-primary mb-2">{totalAnswered}</div>
              <p className="text-sm text-muted-foreground">Perguntas Respondidas</p>
            </CardContent>
          </Card>

          <Card className="health-card text-center">
            <CardContent className="pt-6">
              <Brain className="h-12 w-12 text-purple-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-purple-500 mb-2">{Object.keys(saboteurTypes).length}</div>
              <p className="text-sm text-muted-foreground">Sabotadores Analisados</p>
            </CardContent>
          </Card>

          <Card className="health-card text-center">
            <CardContent className="pt-6">
              <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {topSaboteurs.filter(([_, score]) => score < 30).length}
              </div>
              <p className="text-sm text-muted-foreground">Áreas de Força</p>
            </CardContent>
          </Card>
        </div>

        {/* All Scores - Análise Completa */}
        <Card className="health-card">
          <CardHeader>
            <CardTitle className="text-xl">Análise Completa por Categoria</CardTitle>
            <p className="text-muted-foreground">Veja seu desempenho em todas as áreas avaliadas</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(scores).sort(([, a], [, b]) => b - a).map(([category, score]) => {
              const saboteur = saboteurTypes[category];
              const Icon = saboteur.icon;
              const level = getScoreLevel(score);
              return <div key={category} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className={`h-5 w-5 ${saboteur.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{saboteur.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div className={`h-full ${saboteur.color.replace('text-', 'bg-')}/50 transition-all duration-500`} style={{
                          width: `${score}%`
                        }} />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">{score.toFixed(0)}%</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${level.bgColor} ${level.color} ml-2 shrink-0`}>
                        {level.level}
                      </Badge>
                    </div>;
            })}
            </div>
          </CardContent>
        </Card>

        {/* Mensagem Final Motivacional */}
        <Card className="health-card bg-gradient-to-r from-primary/10 via-primary/5 to-background border-2 border-primary/20">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                <div className="relative bg-primary/10 p-4 rounded-full">
                  <Zap className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>
            <div className="space-y-2 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold">
                Lembre-se: Consciência é o Primeiro Passo!
              </h3>
              <p className="text-muted-foreground text-lg">
                Você acabou de dar um passo corajoso em direção ao autoconhecimento. 
                Cada sabotador identificado é uma oportunidade de crescimento e transformação.
              </p>
              <p className="text-primary font-semibold text-lg">
                Continue investindo em si mesmo - você merece! 💪✨
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button onClick={handleRestart} variant="outline" size="lg" className="w-full sm:w-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Refazer Teste
          </Button>
          <Button
            className="btn-gradient w-full sm:w-auto"
            size="lg"
            onClick={() => {
              toast({
                title: "Em breve! 📚",
                description: "Estamos preparando conteúdos exclusivos para você!",
                duration: 3000,
              });
            }}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Explorar Estratégias
          </Button>
          <Button
            variant="default"
            size="lg"
            disabled={isGeneratingImage}
            className="w-full sm:w-auto"
            onClick={async () => {
              if (!reportRef.current) {
                toast({
                  title: "Erro",
                  description: "Componente de relatório não encontrado.",
                  variant: "destructive",
                });
                return;
              }

              try {
                setIsGeneratingImage(true);
                
                toast({
                  title: "Gerando imagem...",
                  description: "Aguarde um momento.",
                });

                const canvas = await html2canvas(reportRef.current, {
                  scale: 2,
                  backgroundColor: '#ffffff',
                  useCORS: true,
                  logging: false,
                });

                const dataUrl = canvas.toDataURL('image/png');
                
                // Trigger download
                const link = document.createElement('a');
                link.download = `relatorio-sabotadores-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();

                toast({
                  title: "Imagem gerada com sucesso! 🎉",
                  description: "O arquivo PNG foi baixado.",
                });
              } catch (err) {
                console.error("Erro ao gerar imagem:", err);
                toast({
                  title: "Erro ao gerar imagem",
                  description: "Tente novamente.",
                  variant: "destructive",
                });
              } finally {
                setIsGeneratingImage(false);
              }
            }}
          >
            <Image className="h-4 w-4 mr-2" />
            {isGeneratingImage ? "Gerando..." : "Baixar Relatório (PNG)"}
          </Button>
        </div>

        {/* Hidden component for screenshot - only render when scores exist */}
        {Object.keys(scores).length > 0 && (
          <div 
            style={{ 
              position: 'absolute', 
              left: '-9999px', 
              top: 0,
              pointerEvents: 'none',
            }}
          >
            <div ref={reportRef}>
              <SaboteurReportImage 
                scores={scores}
                totalAnswered={totalAnswered}
                date={new Date().toLocaleDateString('pt-BR')}
              />
            </div>
          </div>
        )}
      </div>;
  }
  const currentQ = saboteurQuestions[currentQuestion];
  
  // Guard against undefined question (safety check)
  if (!currentQ) {
    return null;
  }
  
  return <div className="mobile-padding space-y-4">
      {/* Header ultra compacto: só progresso da pergunta */}
      <div className="flex items-center justify-end mobile-text-sm text-muted-foreground">
        <span className="font-semibold">
          Pergunta {currentQuestion + 1} de {saboteurQuestions.length}
        </span>
      </div>

      {/* Progress */}
      <Card className="health-card">
        <CardContent className="pt-6">
          <div className="space-y-4">
            
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Question no formato da Missão do Dia */}
      <Card className="health-card">
        <CardHeader className="pb-3 md:pb-4">
          {/* Badges superiores */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-primary-foreground bg-gradient-to-r from-primary to-accent shadow-sm">
                🌱 Ritual de Autoconsciência
              </span>
              <span className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-medium text-primary bg-primary/10 border border-primary/20">
                📊 Tracking Emocional
              </span>
            </div>
            <span className="inline-flex items-center rounded-full px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-100">
              🏆 10 pontos
            </span>
          </div>

          {/* Pergunta principal */}
          <CardTitle className="text-lg md:text-xl leading-snug">
            {currentQ.text}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-1">
          <RadioGroup
            value={answers[currentQ.id]?.toString() || ""}
            onValueChange={(value) => handleAnswer(parseInt(value))}
            className="space-y-1"
          >
            {/* Mantemos o RadioGroupItem para acessibilidade, mas estilizamos como linhas compactas */}
            <div
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border bg-background hover:bg-primary/5 hover:border-primary/40 cursor-pointer transition-colors text-xs"
              onClick={() => handleAnswer(1)}
            >
              <RadioGroupItem value="1" id={`q${currentQ.id}-1`} className="sr-only" />
              <Label
                htmlFor={`q${currentQ.id}-1`}
                className="cursor-pointer flex-1 leading-snug"
              >
                Discordo Totalmente
              </Label>
            </div>
            <div
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border bg-background hover:bg-primary/5 hover:border-primary/40 cursor-pointer transition-colors text-xs"
              onClick={() => handleAnswer(2)}
            >
              <RadioGroupItem value="2" id={`q${currentQ.id}-2`} className="sr-only" />
              <Label
                htmlFor={`q${currentQ.id}-2`}
                className="cursor-pointer flex-1 leading-snug"
              >
                Discordo
              </Label>
            </div>
            <div
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border bg-background hover:bg-primary/5 hover:border-primary/40 cursor-pointer transition-colors text-xs"
              onClick={() => handleAnswer(3)}
            >
              <RadioGroupItem value="3" id={`q${currentQ.id}-3`} className="sr-only" />
              <Label
                htmlFor={`q${currentQ.id}-3`}
                className="cursor-pointer flex-1 leading-snug"
              >
                Neutro
              </Label>
            </div>
            <div
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border bg-background hover:bg-primary/5 hover:border-primary/40 cursor-pointer transition-colors text-xs"
              onClick={() => handleAnswer(4)}
            >
              <RadioGroupItem value="4" id={`q${currentQ.id}-4`} className="sr-only" />
              <Label
                htmlFor={`q${currentQ.id}-4`}
                className="cursor-pointer flex-1 leading-snug"
              >
                Concordo
              </Label>
            </div>
            <div
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl border bg-background hover:bg-primary/5 hover:border-primary/40 cursor-pointer transition-colors text-xs"
              onClick={() => handleAnswer(5)}
            >
              <RadioGroupItem value="5" id={`q${currentQ.id}-5`} className="sr-only" />
              <Label
                htmlFor={`q${currentQ.id}-5`}
                className="cursor-pointer flex-1 leading-snug"
              >
                Concordo Totalmente
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>;
};
export default SaboteurTest;