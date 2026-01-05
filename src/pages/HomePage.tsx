import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Shield, 
  Trophy, 
  Star, 
  Check, 
  ArrowRight,
  Clock,
  Users,
  Sparkles,
  Heart,
  Brain,
  Target,
  Gift,
  Crown,
  Flame,
  Play,
  MessageCircle,
  Utensils,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

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
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const benefits = [
    { icon: Brain, text: "IA Nutricional Personalizada 24h", highlight: true },
    { icon: Target, text: "Planos Alimentares Sob Medida" },
    { icon: Heart, text: "Acompanhamento de Saúde Completo" },
    { icon: Trophy, text: "Sistema de Gamificação e Recompensas" },
    { icon: Users, text: "Comunidade Exclusiva de Membros" },
    { icon: Shield, text: "Suporte Prioritário VIP" },
  ];

  const bonuses = [
    { title: "E-book: 100 Receitas Fit", value: "R$197" },
    { title: "Planilha de Acompanhamento", value: "R$97" },
    { title: "Acesso ao Grupo VIP", value: "R$297" },
    { title: "Consultoria Inicial", value: "R$397" },
  ];

  const testimonials = [
    { name: "Maria Silva", result: "-12kg em 3 meses", avatar: "M", profession: "Advogada" },
    { name: "João Santos", result: "-8kg em 2 meses", avatar: "J", profession: "Empresário" },
    { name: "Ana Costa", result: "-15kg em 4 meses", avatar: "A", profession: "Médica" },
  ];

  const features = [
    { icon: Brain, title: "IA Sofia", desc: "Nutricionista virtual 24/7" },
    { icon: Utensils, title: "Cardápios Personalizados", desc: "Receitas do seu jeito" },
    { icon: Trophy, title: "Gamificação", desc: "Ganhe pontos e conquistas" },
    { icon: TrendingUp, title: "Acompanhamento", desc: "Gráficos de evolução" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl" />
      </div>

      {/* Urgency Banner */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-10 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-3 px-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap text-center">
          <Flame className="w-5 h-5 animate-pulse" />
          <span className="font-bold text-sm md:text-base">
            🔥 ÚLTIMA CHANCE! Oferta expira em:
          </span>
          <div className="flex gap-2">
            <div className="bg-black/30 px-3 py-1 rounded-lg font-mono font-bold">
              {String(timeLeft.hours).padStart(2, '0')}h
            </div>
            <div className="bg-black/30 px-3 py-1 rounded-lg font-mono font-bold">
              {String(timeLeft.minutes).padStart(2, '0')}m
            </div>
            <div className="bg-black/30 px-3 py-1 rounded-lg font-mono font-bold">
              {String(timeLeft.seconds).padStart(2, '0')}s
            </div>
          </div>
          <Flame className="w-5 h-5 animate-pulse" />
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">Instituto dos Sonhos</span>
        </div>
        <Link to="/auth">
          <Button variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10">
            Entrar
          </Button>
        </Link>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          {/* Trust Badge */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-full mb-6"
          >
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-emerald-300">+10.000 vidas transformadas</span>
            <div className="flex -space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
              Emagreça de Forma
            </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Inteligente e Definitiva
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            A primeira plataforma brasileira que combina <strong className="text-emerald-400">nutrição personalizada</strong>, 
            <strong className="text-emerald-400"> IA avançada</strong> e <strong className="text-emerald-400">gamificação</strong> para 
            você alcançar seus objetivos de forma definitiva.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-12">
            {[
              { value: "97%", label: "Taxa de Sucesso" },
              { value: "15kg", label: "Média de Perda" },
              { value: "30 dias", label: "Primeiros Resultados" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-emerald-400">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {features.map((feature, i) => (
            <div key={i} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-4 text-center hover:border-emerald-500/30 transition-colors">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center mx-auto mb-3">
                <feature.icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white mb-1">{feature.title}</h3>
              <p className="text-xs text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Main Offer Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-3xl blur-lg opacity-30 animate-pulse" />
            
            <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl rounded-3xl border border-emerald-500/20 overflow-hidden">
              {/* Discount Badge */}
              <div className="absolute -top-1 -right-1 z-20">
                <div className="bg-gradient-to-br from-red-500 to-orange-500 text-white font-black text-lg px-6 py-3 rounded-bl-2xl shadow-lg">
                  -85% OFF
                </div>
              </div>

              <div className="p-6 md:p-10">
                {/* Package Title */}
                <div className="text-center mb-8">
                  <Badge className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30 mb-4 px-4 py-1">
                    <Gift className="w-4 h-4 mr-2" />
                    PACOTE COMPLETO + BÔNUS EXCLUSIVOS
                  </Badge>
                  <h2 className="text-2xl md:text-4xl font-black text-white mb-2">
                    Acesso Vitalício Premium
                  </h2>
                  <p className="text-slate-400">Tudo que você precisa para transformar sua vida</p>
                </div>

                {/* Benefits Grid */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                  {benefits.map((benefit, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className={`flex items-center gap-3 p-4 rounded-xl ${
                        benefit.highlight 
                          ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30' 
                          : 'bg-slate-700/30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${benefit.highlight ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                        <benefit.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className={benefit.highlight ? 'text-emerald-300 font-semibold' : 'text-slate-300'}>
                        {benefit.text}
                      </span>
                      <Check className="w-5 h-5 text-emerald-500 ml-auto" />
                    </motion.div>
                  ))}
                </div>

                {/* Bonus Section */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="font-bold text-yellow-400">BÔNUS EXCLUSIVOS (Valor Total: R$988)</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3">
                    {bonuses.map((bonus, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Gift className="w-4 h-4 text-yellow-400" />
                          {bonus.title}
                        </div>
                        <span className="text-slate-500 line-through text-xs">{bonus.value}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-yellow-500/20 text-center">
                    <span className="text-emerald-400 font-bold">✓ TODOS INCLUSOS GRÁTIS NA SUA ASSINATURA</span>
                  </div>
                </div>

                {/* Price Section */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    <span className="text-slate-500 line-through text-2xl">R$ 397/mês</span>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      ECONOMIA DE R$338/MÊS
                    </Badge>
                  </div>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-slate-400 text-xl">Por apenas</span>
                    <span className="text-5xl md:text-7xl font-black bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                      R$59
                    </span>
                    <span className="text-slate-400 text-xl">/mês</span>
                  </div>
                  <p className="text-emerald-400 font-medium mt-2">
                    ou 12x de R$5,90 • Acesso imediato a tudo
                  </p>
                </div>

                {/* CTA Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="w-full py-8 text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 hover:from-emerald-400 hover:via-teal-400 hover:to-emerald-400 text-white rounded-2xl shadow-2xl shadow-emerald-500/30 transition-all duration-300 group"
                  >
                    <Zap className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                    QUERO TRANSFORMAR MINHA VIDA AGORA
                    <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>

                {/* Trust Elements */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-sm text-slate-400">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Garantia de 7 dias
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-500" />
                    Acesso imediato
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500" />
                    Suporte 24h
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-500" />
                    Cancele quando quiser
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Testimonials */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-white mb-8">Resultados Reais de Pessoas Reais</h3>
          <div className="flex flex-wrap justify-center gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 max-w-xs hover:border-emerald-500/30 transition-colors">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4">
                  {t.avatar}
                </div>
                <p className="font-bold text-white">{t.name}</p>
                <p className="text-xs text-slate-400 mb-2">{t.profession}</p>
                <p className="text-emerald-400 font-semibold text-lg">{t.result}</p>
                <div className="flex justify-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Perguntas Frequentes</h3>
          <div className="space-y-4">
            {[
              { q: "Funciona para qualquer pessoa?", a: "Sim! Nosso sistema é personalizado para seu perfil, objetivos e preferências alimentares." },
              { q: "Preciso de conhecimento técnico?", a: "Não! A plataforma é intuitiva e a Sofia te guia em cada passo." },
              { q: "Posso cancelar quando quiser?", a: "Sim, sem burocracia. E ainda tem 7 dias de garantia total." },
            ].map((faq, i) => (
              <div key={i} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
                <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                <p className="text-slate-400 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-16 pb-8"
        >
          <p className="text-slate-400 mb-4">Não perca essa oportunidade única</p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white px-12 py-6 text-lg rounded-full shadow-lg shadow-emerald-500/25"
          >
            Começar Minha Transformação
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
