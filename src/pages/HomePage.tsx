import React, { useState, useEffect, memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Target, 
  TrendingUp, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  Trophy,
  Brain,
  Dumbbell,
  MessageCircle,
  Calendar,
  ChevronDown,
  Activity,
  Utensils,
  Shield,
  BarChart3,
  Quote,
  Play,
  Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import butterflyLogo from '@/assets/logo-instituto.png';

// Memoized components for better performance
const MemoCard = memo(Card);
const MemoCardContent = memo(CardContent);

const HomePage = memo(() => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [0, 50]);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Advogada",
      result: "-18kg em 3 meses",
      content: "O Instituto dos Sonhos trouxe a organização que eu precisava. A Sofia é incrível, parece que ela realmente me entende. Nunca me senti tão bem comigo mesma.",
      rating: 5,
      image: "👩‍💼"
    },
    {
      name: "João Santos",
      role: "Empresário",
      result: "-25kg em 4 meses",
      content: "A praticidade da plataforma é surreal. Consigo acompanhar minha dieta e treinos entre reuniões. A gamificação me mantém focado como nenhum outro app conseguiu.",
      rating: 5,
      image: "👨‍💼"
    },
    {
      name: "Ana Costa",
      role: "Médica",
      result: "-12kg em 2 meses",
      content: "Como médica, sou cética com promessas de emagrecimento. Mas a abordagem científica e integral do Instituto me conquistou. Resultados reais e sustentáveis.",
      rating: 5,
      image: "👩‍⚕️"
    }
  ];

  const benefits = [
    {
      icon: Brain,
      title: "Inteligência Artificial Sofia",
      description: "Sua nutricionista pessoal disponível 24h. Tira dúvidas, analisa pratos por foto e ajusta seu plano em tempo real.",
      bg: "bg-purple-50 text-purple-600"
    },
    {
      icon: Utensils,
      title: "Nutrição Personalizada",
      description: "Cardápios deliciosos adaptados ao seu paladar e rotina, sem restrições malucas. Redescubra o prazer de comer bem.",
      bg: "bg-emerald-50 text-emerald-600"
    },
    {
      icon: Trophy,
      title: "Gamificação Envolvente",
      description: "Transforme sua jornada em um jogo. Ganhe recompensas, suba de nível e celebre cada pequena vitória.",
      bg: "bg-amber-50 text-amber-600"
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
      
      {/* Navbar Elegante */}
      <motion.header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={butterflyLogo} alt="Logo" className="w-10 h-10 drop-shadow-sm" />
            <span className={`font-bold text-xl tracking-tight ${isScrolled ? 'text-slate-800' : 'text-slate-800'}`}>
              Instituto dos Sonhos
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/auth" className="hidden sm:block font-medium text-slate-600 hover:text-emerald-600 transition-colors">
              Entrar
            </Link>
            <Link to="/auth">
              <Button className="rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 transition-all hover:scale-105">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero Section Premium */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[100px] mix-blend-multiply animate-blob" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-100/50 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000" />
          <div className="absolute -bottom-32 left-1/2 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-4000" />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-full px-4 py-1.5 shadow-sm mb-8"
          >
            <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
               ))}
            </div>
            <span className="text-sm font-medium text-slate-600">
              Junte-se a <span className="text-emerald-600 font-bold">+1.200</span> membros
            </span>
          </motion.div>

          <motion.h1 
            style={{ y, opacity }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-8 max-w-4xl mx-auto leading-[1.1]"
          >
            Transforme seu corpo e <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              sua vida por completo
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            A primeira plataforma que une Inteligência Artificial, Nutricionistas especializados e Ciência Comportamental para um emagrecimento definitivo e saudável.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" className="w-full h-14 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1">
                Começar Transformação Grátis
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-2 sm:mt-0">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>7 dias grátis</span>
              <span className="mx-1">•</span>
              <span>Sem cartão necessário</span>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats UI Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-20 container mx-auto px-4 max-w-5xl relative"
        >
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden aspect-[16/9] md:aspect-[21/9]">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100/50" />
             <div className="absolute inset-0 flex items-center justify-center">
                {/* Abstract Representation of the Dashboard */}
                <div className="grid grid-cols-3 gap-4 w-3/4 opacity-90 transform scale-95 hover:scale-100 transition-transform duration-700">
                   <div className="col-span-2 bg-white p-4 rounded-xl shadow-lg border border-slate-100 space-y-3">
                      <div className="h-4 w-1/3 bg-slate-100 rounded animate-pulse" />
                      <div className="h-32 bg-emerald-50/50 rounded-lg border border-emerald-100 flex items-end p-2 gap-2">
                         {[40, 60, 50, 70, 55, 80, 75].map((h, i) => (
                           <div key={i} className="w-full bg-emerald-200 rounded-t-sm" style={{ height: `${h}%` }} />
                         ))}
                      </div>
                   </div>
                   <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-2xl">🏆</div>
                      <div className="text-center">
                        <div className="h-4 w-16 bg-slate-100 rounded mx-auto mb-1" />
                        <div className="h-3 w-12 bg-slate-100 rounded mx-auto" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-y border-slate-50">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm font-medium text-slate-400 mb-8 uppercase tracking-wider">Resultados Comprovados</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Logos fictícios ou placeholders elegantes */}
             {["Vitalidade", "Saúde+", "BemEstar", "VidaLeve"].map((brand) => (
               <span key={brand} className="text-xl md:text-2xl font-serif font-bold text-slate-300">{brand}</span>
             ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Tudo que você precisa para vencer</h2>
            <p className="text-lg text-slate-600">Uma abordagem completa que integra todas as facetas do emagrecimento saudável em um só lugar.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100"
              >
                <div className={`w-14 h-14 rounded-xl ${benefit.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Modern */}
      <section className="py-20 md:py-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
                Histórias reais de <br />
                <span className="text-emerald-600">transformação</span>
              </h2>
              <p className="text-lg text-slate-600 mb-8">
                Não é mágica, é ciência e consistência. Veja o que acontece quando você tem as ferramentas certas.
              </p>
              <div className="flex gap-8">
                <div>
                  <p className="text-4xl font-bold text-slate-900">92%</p>
                  <p className="text-sm text-slate-500">Taxa de Sucesso</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-slate-900">4.9/5</p>
                  <p className="text-sm text-slate-500">Avaliação Média</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent rounded-3xl -rotate-6 -z-10" />
              <div className="space-y-6">
                {testimonials.map((t, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border-none shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur">
                      <CardContent className="p-6">
                        <div className="flex gap-4 mb-4">
                           <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                             {t.image}
                           </div>
                           <div>
                             <h4 className="font-bold text-slate-900">{t.name}</h4>
                             <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide">{t.result}</p>
                           </div>
                           <div className="ml-auto flex text-amber-400">
                             {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                           </div>
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">"{t.content}"</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="bg-slate-900 rounded-3xl p-12 md:p-24 text-center relative overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Comece sua jornada hoje
              </h2>
              <p className="text-slate-300 text-lg mb-10">
                Experimente o método completo por 7 dias gratuitos. <br />
                Sem compromisso, cancele quando quiser.
              </p>
              <Link to="/auth">
                <Button className="h-16 px-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 text-lg font-bold transition-all hover:scale-105 shadow-2xl">
                  Criar Conta Gratuita
                </Button>
              </Link>
              <p className="mt-6 text-sm text-slate-500">
                Não requer cartão de crédito para iniciar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Simples e Elegante */}
      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-80">
            <img src={butterflyLogo} alt="Logo" className="w-6 h-6 grayscale" />
            <span className="font-semibold text-slate-700">Instituto dos Sonhos</span>
          </div>
          <div className="text-sm text-slate-500">
            © 2025 Instituto dos Sonhos. Todos os direitos reservados.
          </div>
          <div className="flex gap-6 text-sm text-slate-500">
            <Link to="/privacidade" className="hover:text-emerald-600">Privacidade</Link>
            <Link to="/terms" className="hover:text-emerald-600">Termos</Link>
          </div>
        </div>
      </footer>
    </div>
  );
});

export default HomePage;
