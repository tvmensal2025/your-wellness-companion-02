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
  Gift
} from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState({
    hours: 2,
    minutes: 47,
    seconds: 33
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
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: Sparkles, title: 'IA Sofia 24h', desc: 'Sua coach pessoal sempre disponível', color: 'from-pink-500 to-rose-500' },
    { icon: Target, title: 'Plano Personalizado', desc: 'Cardápios feitos para você', color: 'from-violet-500 to-purple-500' },
    { icon: Trophy, title: 'Gamificação', desc: 'Ganhe pontos e conquistas', color: 'from-amber-500 to-orange-500' },
    { icon: Heart, title: 'Suporte Humano', desc: 'Nutricionistas reais te apoiando', color: 'from-emerald-500 to-teal-500' },
  ];

  const testimonials = [
    { name: 'Ana Paula', result: '-12kg em 8 semanas', avatar: '👩‍🦰' },
    { name: 'Carlos Eduardo', result: '-18kg em 3 meses', avatar: '👨' },
    { name: 'Juliana Santos', result: '-8kg em 6 semanas', avatar: '👩' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Urgency Banner */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="relative z-10 bg-gradient-to-r from-pink-600 via-purple-600 to-violet-600 py-3"
      >
        <div className="container mx-auto px-4 flex items-center justify-center gap-4 flex-wrap">
          <Flame className="w-5 h-5 text-yellow-300 animate-bounce" />
          <span className="text-white font-bold text-sm md:text-base">
            🔥 MEGA PROMOÇÃO: 85% OFF apenas hoje!
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
      <header className="relative z-10 container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
              Instituto dos Sonhos
            </span>
          </div>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-600 hover:to-violet-700 text-white border-0 shadow-lg shadow-pink-500/25"
          >
            Entrar
          </Button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500/20 to-violet-500/20 border border-pink-500/30 rounded-full px-4 py-2 mb-8"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-pink-300 text-sm font-medium">+15.000 vidas transformadas</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight"
          >
            <span className="text-white">Transforme seu corpo</span>
            <br />
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              em 30 dias
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto"
          >
            Com nossa <span className="text-pink-400 font-semibold">IA Sofia</span> você recebe um plano 100% personalizado, 
            acompanhamento diário e motivação constante para alcançar seus objetivos.
          </motion.p>

          {/* Price Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="relative max-w-lg mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-600 rounded-3xl blur-xl opacity-50" />
            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              {/* Discount Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-pink-500 to-violet-600 text-white text-sm font-bold px-6 py-2 rounded-full shadow-lg">
                  ECONOMIZE R$ 168
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6 mt-2">
                <span className="text-slate-500 line-through text-xl">R$ 197/mês</span>
                <div className="text-center">
                  <span className="text-5xl font-black bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                    R$ 29
                  </span>
                  <span className="text-slate-400">/mês</span>
                </div>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['IA Sofia 24h', 'Cardápios ilimitados', 'Gamificação', 'Suporte humano', 'App exclusivo', 'Comunidade VIP'].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-slate-300 text-sm">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button 
                onClick={() => navigate('/auth')}
                size="lg"
                className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 hover:from-pink-600 hover:via-purple-600 hover:to-violet-700 text-white text-lg font-bold py-6 rounded-2xl shadow-xl shadow-pink-500/30 group transition-all"
              >
                <span>QUERO COMEÇAR AGORA</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>7 dias de garantia</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Acesso imediato</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative p-6 rounded-2xl bg-slate-900/50 backdrop-blur border border-white/10 hover:border-white/20 transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Resultados <span className="bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">reais</span>
          </h2>
          <p className="text-slate-400">Veja o que nossos membros conquistaram</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-slate-900 to-slate-900/50 backdrop-blur border border-white/10 rounded-2xl p-6 text-center hover:border-pink-500/30 transition-all"
            >
              <div className="text-5xl mb-3">{t.avatar}</div>
              <h4 className="text-white font-semibold mb-1">{t.name}</h4>
              <p className="text-transparent bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text font-bold text-lg">
                {t.result}
              </p>
              <div className="flex justify-center gap-1 mt-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bonus Section */}
      <section className="relative z-10 container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl" />
          <div className="relative bg-slate-900/80 backdrop-blur border border-amber-500/30 rounded-3xl p-8">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Gift className="w-8 h-8 text-amber-400" />
              <h3 className="text-2xl font-bold text-white">BÔNUS EXCLUSIVOS</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'E-book: 100 Receitas Fit', value: 'R$ 97' },
                { title: 'Grupo VIP no Telegram', value: 'R$ 47' },
                { title: 'Planilha de Metas', value: 'R$ 27' },
                { title: 'Aulas de Mindfulness', value: 'R$ 67' },
              ].map((bonus, i) => (
                <div key={i} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="text-white">{bonus.title}</span>
                  </div>
                  <span className="text-amber-400 font-bold">{bonus.value}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-amber-300 font-semibold mt-6">
              Todos os bônus inclusos no plano! 🎁
            </p>
          </div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Pronto para transformar sua vida?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">
            Junte-se a milhares de pessoas que já conquistaram seus objetivos com nosso método.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-600 hover:from-pink-600 hover:via-purple-600 hover:to-violet-700 text-white text-xl font-bold px-12 py-7 rounded-2xl shadow-2xl shadow-pink-500/30 group"
          >
            <span>COMEÇAR AGORA COM 85% OFF</span>
            <Zap className="w-6 h-6 ml-2 group-hover:animate-pulse" />
          </Button>
          <div className="flex items-center justify-center gap-6 mt-6 text-slate-400">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>+15.000 membros</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>97% de aprovação</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2026 Instituto dos Sonhos. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
