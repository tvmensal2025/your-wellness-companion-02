import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Heart, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  Star, 
  Check, 
  Clock, 
  Shield,
  Users,
  TrendingUp,
  Target,
  Flame,
  Gift,
  Apple,
  Brain,
  Dumbbell,
  Salad,
  Scale,
  Activity,
  MessageCircle,
  Video,
  BookOpen,
  Award,
  Phone,
  Mail,
  MapPin,
  ChevronDown,
  Play,
  Calendar,
  Headphones,
  FileText
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const mainFeatures = [
    { icon: Brain, title: 'IA Sofia 24h', desc: 'Inteligência artificial que te conhece e orienta a qualquer momento', color: 'bg-sky-500' },
    { icon: Salad, title: 'Cardápios Personalizados', desc: 'Refeições deliciosas adaptadas ao seu paladar e objetivos', color: 'bg-emerald-500' },
    { icon: Trophy, title: 'Gamificação Completa', desc: 'Ganhe pontos, medalhas e suba no ranking da comunidade', color: 'bg-amber-500' },
    { icon: MessageCircle, title: 'Suporte Humanizado', desc: 'Nutricionistas reais disponíveis para tirar suas dúvidas', color: 'bg-rose-500' },
    { icon: Activity, title: 'Monitoramento Diário', desc: 'Acompanhe peso, medidas, humor e evolução completa', color: 'bg-violet-500' },
    { icon: Users, title: 'Comunidade Exclusiva', desc: 'Conecte-se com milhares de pessoas na mesma jornada', color: 'bg-cyan-500' },
  ];

  const howItWorks = [
    { step: '01', title: 'Cadastre-se', desc: 'Crie sua conta gratuita em menos de 2 minutos', icon: FileText },
    { step: '02', title: 'Responda a Anamnese', desc: 'Nossa IA conhece seu perfil, rotina e preferências', icon: Brain },
    { step: '03', title: 'Receba seu Plano', desc: 'Cardápio personalizado gerado instantaneamente', icon: Salad },
    { step: '04', title: 'Evolua Diariamente', desc: 'Registre progresso e receba orientações em tempo real', icon: TrendingUp },
  ];

  const testimonials = [
    { name: 'Ana Paula M.', result: '-12kg em 8 semanas', text: 'A Sofia é incrível! Parece que ela realmente me conhece. Os cardápios são deliciosos!', avatar: '👩‍🦰', location: 'São Paulo, SP' },
    { name: 'Carlos Eduardo', result: '-18kg em 3 meses', text: 'Finalmente um programa que entende minha rotina corrida. Perdi peso sem sofrer!', avatar: '👨', location: 'Rio de Janeiro, RJ' },
    { name: 'Juliana Santos', result: '-8kg em 6 semanas', text: 'Os desafios e a gamificação me mantêm motivada todos os dias. Amo!', avatar: '👩', location: 'Belo Horizonte, MG' },
    { name: 'Roberto Lima', result: '-15kg em 10 semanas', text: 'O suporte da equipe é excepcional. Sempre respondem rápido e com carinho.', avatar: '👨‍🦱', location: 'Curitiba, PR' },
  ];

  const bonuses = [
    { title: 'E-book: 100 Receitas Fit', value: 'R$ 97', desc: 'Receitas práticas e deliciosas para o dia a dia' },
    { title: 'Grupo VIP no Telegram', value: 'R$ 47', desc: 'Comunidade exclusiva com dicas diárias' },
    { title: 'Planilha de Metas', value: 'R$ 27', desc: 'Organize seus objetivos de forma visual' },
    { title: 'Aulas de Mindfulness', value: 'R$ 67', desc: '10 aulas para controlar ansiedade e compulsão' },
    { title: 'Guia de Supermercado', value: 'R$ 37', desc: 'Lista inteligente para compras saudáveis' },
    { title: 'Workshop de Meal Prep', value: 'R$ 57', desc: 'Aprenda a preparar suas refeições da semana' },
  ];

  const faqs = [
    { q: 'O programa funciona para qualquer pessoa?', a: 'Sim! Nossa IA Sofia cria planos 100% personalizados para seu perfil, seja você iniciante ou avançado, com qualquer tipo de restrição alimentar.' },
    { q: 'Preciso fazer exercícios físicos?', a: 'Não é obrigatório! Nosso foco é na reeducação alimentar. Porém, temos módulos opcionais de exercícios para quem desejar potencializar os resultados.' },
    { q: 'E se eu não gostar de algum alimento do cardápio?', a: 'A Sofia aprende suas preferências! Você pode indicar alimentos que não gosta e ela automaticamente substituirá por opções equivalentes.' },
    { q: 'Como funciona a garantia?', a: 'Oferecemos 7 dias de garantia incondicional. Se por qualquer motivo não ficar satisfeito, devolvemos 100% do valor.' },
    { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Não há fidelidade. Você pode cancelar quando quiser diretamente pelo app ou entrando em contato conosco.' },
    { q: 'O programa é aprovado por nutricionistas?', a: 'Sim! Todo nosso conteúdo é desenvolvido e supervisionado por uma equipe de nutricionistas registrados no CRN.' },
  ];

  const stats = [
    { value: '15.847', label: 'Vidas Transformadas' },
    { value: '97%', label: 'Satisfação' },
    { value: '4.9', label: 'Avaliação' },
    { value: '50.000+', label: 'Kg Eliminados' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 overflow-hidden">
      {/* Urgency Banner */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-50 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 py-3"
      >
        <div className="container mx-auto px-4 flex items-center justify-center gap-4 flex-wrap">
          <Flame className="w-5 h-5 text-yellow-300 animate-bounce" />
          <span className="text-white font-bold text-sm md:text-base">
            🎉 OFERTA ESPECIAL: 85% OFF - Vagas Limitadas!
          </span>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full">
            <Clock className="w-4 h-4 text-white" />
            <span className="text-white font-mono font-bold">
              {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-sky-100">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                  Instituto dos Sonhos
                </span>
                <p className="text-xs text-slate-500">Transformação com ciência</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="hidden md:flex text-slate-600 hover:text-sky-600"
              >
                Entrar
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                className="bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white shadow-lg shadow-sky-200"
              >
                Começar Agora
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 -left-32 w-96 h-96 bg-sky-200/50 rounded-full blur-3xl" />
          <div className="absolute top-40 -right-32 w-96 h-96 bg-emerald-200/50 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 w-[800px] h-[400px] bg-gradient-to-t from-cyan-100/30 to-transparent rounded-full blur-3xl -translate-x-1/2" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-sky-100 to-emerald-100 border border-sky-200 rounded-full px-5 py-2.5 mb-8"
            >
              <div className="flex -space-x-2">
                {['👩‍🦰', '👨', '👩', '👨‍🦱'].map((emoji, i) => (
                  <span key={i} className="text-lg">{emoji}</span>
                ))}
              </div>
              <span className="text-sky-700 text-sm font-semibold">+15.000 pessoas já transformaram suas vidas</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
            >
              <span className="text-slate-800">Emagreça de forma</span>
              <br />
              <span className="bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 bg-clip-text text-transparent">
                saudável e definitiva
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              Com a <span className="text-sky-600 font-semibold">IA Sofia</span>, você recebe um plano alimentar 
              100% personalizado, acompanhamento diário e uma comunidade que te apoia em cada passo da sua jornada.
            </motion.p>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12"
            >
              {stats.map((stat, i) => (
                <div key={i} className="bg-white/80 backdrop-blur rounded-2xl p-4 border border-sky-100 shadow-sm">
                  <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white text-lg font-bold px-10 py-7 rounded-2xl shadow-xl shadow-sky-300/50 group"
              >
                <span>COMEÇAR MINHA TRANSFORMAÇÃO</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="w-full sm:w-auto border-2 border-sky-200 text-sky-700 hover:bg-sky-50 px-8 py-7 rounded-2xl"
              >
                <Play className="w-5 h-5 mr-2" />
                Ver como funciona
              </Button>
            </motion.div>

            {/* Trust Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-8 text-slate-500"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span className="text-sm">7 dias de garantia</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span className="text-sm">Acesso imediato</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-sky-500" />
                <span className="text-sm">Aprovado por nutricionistas</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-sky-100 text-sky-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              TUDO QUE VOCÊ PRECISA
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
              Um programa completo para sua <span className="text-emerald-500">transformação</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Desenvolvemos uma metodologia única que combina tecnologia, ciência nutricional e acompanhamento humano.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {mainFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-100 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-b from-sky-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              SIMPLES E EFICIENTE
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
              Como funciona?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Em apenas 4 passos simples você começa sua transformação
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-sky-300 to-emerald-300" />
                )}
                <div className="relative z-10 w-24 h-24 mx-auto bg-gradient-to-br from-sky-400 to-emerald-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-sky-200/50">
                  <item.icon className="w-10 h-10 text-white" />
                </div>
                <span className="inline-block bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  PASSO {item.step}
                </span>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-block bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-2 rounded-full mb-4">
              OFERTA POR TEMPO LIMITADO
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Invista em você por menos de R$1 por dia
            </h2>
          </div>

          <div className="max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-8 shadow-2xl relative"
            >
              {/* Discount Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                  🔥 ECONOMIZE R$ 168
                </span>
              </div>

              <div className="text-center mb-8 mt-4">
                <p className="text-slate-500 line-through text-xl mb-2">De R$ 197/mês</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-2xl text-slate-600">R$</span>
                  <span className="text-7xl font-black bg-gradient-to-r from-sky-600 to-emerald-600 bg-clip-text text-transparent">29</span>
                  <span className="text-slate-500">/mês</span>
                </div>
                <p className="text-emerald-600 font-semibold mt-2">ou R$ 290/ano (economize 2 meses!)</p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3 mb-8">
                {[
                  'Acesso ilimitado à IA Sofia 24h',
                  'Cardápios personalizados diários',
                  'Sistema de gamificação completo',
                  'Suporte com nutricionistas reais',
                  'Comunidade VIP exclusiva',
                  'Rastreamento de progresso',
                  'Desafios semanais com prêmios',
                  'App mobile exclusivo',
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="w-full bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white text-lg font-bold py-7 rounded-2xl shadow-xl shadow-sky-300/50 group"
              >
                <span>QUERO COMEÇAR AGORA</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>7 dias de garantia</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Acesso imediato</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bonuses Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-amber-100 text-amber-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              BÔNUS EXCLUSIVOS
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
              Você ainda leva <span className="text-amber-500">+R$ 332</span> em bônus
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Materiais extras para potencializar ainda mais seus resultados
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {bonuses.map((bonus, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Gift className="w-8 h-8 text-amber-500" />
                  <span className="text-amber-600 font-bold text-lg">{bonus.value}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{bonus.title}</h3>
                <p className="text-slate-600 text-sm">{bonus.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-sky-100 text-sky-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              RESULTADOS REAIS
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
              Veja quem já transformou sua vida
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-4xl">{t.avatar}</div>
                  <div>
                    <h4 className="font-bold text-slate-800">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.location}</p>
                  </div>
                </div>
                <p className="text-emerald-600 font-bold text-lg mb-3">{t.result}</p>
                <p className="text-slate-600 text-sm italic">"{t.text}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
              TIRE SUAS DÚVIDAS
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-slate-800 mb-4">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="border border-slate-200 rounded-2xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-800 pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-slate-600">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Pronto para transformar sua vida?
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg">
              Junte-se a mais de 15.000 pessoas que já alcançaram seus objetivos com nosso método comprovado.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-white text-sky-600 hover:bg-sky-50 text-xl font-bold px-12 py-7 rounded-2xl shadow-2xl group"
            >
              <span>COMEÇAR AGORA COM 85% OFF</span>
              <Zap className="w-6 h-6 ml-2 text-amber-500 group-hover:animate-pulse" />
            </Button>
            <p className="text-white/60 mt-6 text-sm">
              Garantia de 7 dias • Cancele quando quiser • Acesso imediato
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-lg font-bold">Instituto dos Sonhos</span>
              </div>
              <p className="text-slate-400 text-sm">
                Transformando vidas através da tecnologia e ciência nutricional desde 2020.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Links Rápidos</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Depoimentos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <ul className="space-y-3 text-slate-400 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>contato@institutodossonhos.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(11) 99999-9999</span>
                </li>
                <li className="flex items-center gap-2">
                  <Headphones className="w-4 h-4" />
                  <span>Seg-Sex: 8h às 18h</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-500 text-sm">
            <p>© 2026 Instituto dos Sonhos. Todos os direitos reservados. CNPJ: 00.000.000/0001-00</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
