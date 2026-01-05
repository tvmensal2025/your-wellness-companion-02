import React, { useState, useEffect, memo } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Target, TrendingUp, Users, CheckCircle, ArrowRight, Star, Trophy, Brain, Dumbbell, MessageCircle, Calendar, ChevronDown, Activity, Utensils, Shield, BarChart3, Quote, Play, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import butterflyLogo from '@/assets/logo-instituto.png';

// Memoized components for better performance
const MemoCard = memo(Card);
const MemoCardContent = memo(CardContent);
const HomePage = memo(() => {
  const {
    scrollYProgress
  } = useScroll();
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
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const testimonials = [{
    name: "Maria Silva",
    role: "Advogada",
    result: "-18kg em 3 meses",
    content: "O Instituto dos Sonhos trouxe a organização que eu precisava. A Sofia é incrível, parece que ela realmente me entende. Nunca me senti tão bem comigo mesma.",
    rating: 5,
    image: "👩‍💼"
  }, {
    name: "João Santos",
    role: "Empresário",
    result: "-25kg em 4 meses",
    content: "A praticidade da plataforma é surreal. Consigo acompanhar minha dieta e treinos entre reuniões. A gamificação me mantém focado como nenhum outro app conseguiu.",
    rating: 5,
    image: "👨‍💼"
  }, {
    name: "Ana Costa",
    role: "Médica",
    result: "-12kg em 2 meses",
    content: "Como médica, sou cética com promessas de emagrecimento. Mas a abordagem científica e integral do Instituto me conquistou. Resultados reais e sustentáveis.",
    rating: 5,
    image: "👩‍⚕️"
  }];
  const benefits = [{
    icon: Brain,
    title: "Inteligência Artificial Sofia",
    description: "Sua nutricionista pessoal disponível 24h. Tira dúvidas, analisa pratos por foto e ajusta seu plano em tempo real.",
    bg: "bg-purple-50 text-purple-600"
  }, {
    icon: Utensils,
    title: "Nutrição Personalizada",
    description: "Cardápios deliciosos adaptados ao seu paladar e rotina, sem restrições malucas. Redescubra o prazer de comer bem.",
    bg: "bg-emerald-50 text-emerald-600"
  }, {
    icon: Trophy,
    title: "Gamificação Envolvente",
    description: "Transforme sua jornada em um jogo. Ganhe recompensas, suba de nível e celebre cada pequena vitória.",
    bg: "bg-amber-50 text-amber-600"
  }];
  return <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-100">
      
      {/* Navbar Elegante */}
      <motion.header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-6'}`}>
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

      {/* Hero Section Premium - Redesigned */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[150px] animate-pulse animation-delay-2000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[200px]" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]" />
        </div>

        <div className="container mx-auto px-6 py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              {/* Badge Promo */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-full px-5 py-2 mb-8"
              >
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <span className="text-amber-300 text-sm font-semibold">🔥 OFERTA LIMITADA - 70% OFF</span>
              </motion.div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
                Emagreça de forma
                <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                  inteligente e definitiva
                </span>
              </h1>

              <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed max-w-xl">
                A única plataforma com <span className="text-emerald-400 font-semibold">IA nutricional</span> que 
                cria seu plano personalizado, acompanha seu progresso e te motiva a cada passo.
              </p>

              {/* Pricing */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 max-w-md">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-slate-400 text-sm line-through">De R$ 197/mês</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">R$ 59</span>
                      <span className="text-slate-400">/mês</span>
                    </div>
                  </div>
                  <div className="ml-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                    ECONOMIZE R$138
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {[
                    'IA Sofia disponível 24h',
                    'Cardápios personalizados ilimitados',
                    'Acompanhamento por nutricionistas',
                    'Sistema de gamificação completo'
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                      <Check className="w-4 h-4 text-emerald-400" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="block">
                  <Button className="w-full h-14 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-lg font-bold shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-emerald-500/40">
                    Começar Agora com 70% OFF
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <p className="text-center text-slate-400 text-xs mt-3">
                  ✓ 7 dias de garantia • Cancele quando quiser
                </p>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {['😊', '💪', '🎯', '⭐'].map((emoji, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-900 flex items-center justify-center text-lg">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-slate-400 text-sm"><span className="text-white font-semibold">+2.500</span> transformações</p>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Stats Card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-3xl" />
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-slate-400 text-sm">Seu progresso</p>
                    <h3 className="text-white text-2xl font-bold">Maria Silva</h3>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
                    👩‍💼
                  </div>
                </div>

                {/* Progress Chart */}
                <div className="bg-slate-800/50 rounded-2xl p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-400 text-sm">Peso perdido</span>
                    <span className="text-emerald-400 font-bold">-18kg</span>
                  </div>
                  <div className="h-32 flex items-end gap-2">
                    {[85, 82, 78, 75, 72, 70, 67].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-sm transition-all"
                          style={{ height: `${(h / 85) * 100}%` }}
                        />
                        <span className="text-[10px] text-slate-500">S{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-1">🔥</div>
                    <p className="text-white text-xl font-bold">45</p>
                    <p className="text-slate-400 text-xs">Dias de sequência</p>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-1">🏆</div>
                    <p className="text-white text-xl font-bold">12</p>
                    <p className="text-slate-400 text-xs">Conquistas</p>
                  </div>
                </div>

                {/* Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl p-3">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <span className="text-amber-300 text-sm font-semibold">Top 5% do ranking</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="flex flex-col items-center gap-2 cursor-pointer"
          >
            <span className="text-slate-400 text-xs uppercase tracking-widest">Descubra mais</span>
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white border-y border-slate-50">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm font-medium text-slate-400 mb-8 uppercase tracking-wider">Resultados Comprovados</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
             {/* Logos fictícios ou placeholders elegantes */}
             {["Vitalidade", "Saúde+", "BemEstar", "VidaLeve"].map(brand => <span key={brand} className="text-xl md:text-2xl font-serif font-bold text-slate-300">{brand}</span>)}
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
            {benefits.map((benefit, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            delay: index * 0.2
          }} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                <div className={`w-14 h-14 rounded-xl ${benefit.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <benefit.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>)}
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
                {testimonials.map((t, i) => <motion.div key={i} initial={{
                opacity: 0,
                x: 50
              }} whileInView={{
                opacity: 1,
                x: 0
              }} viewport={{
                once: true
              }} transition={{
                delay: i * 0.1
              }}>
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
                  </motion.div>)}
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
    </div>;
});
export default HomePage;