import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Target, 
  Heart, 
  TrendingUp, 
  Users, 
  CheckCircle,
  ArrowRight,
  Star,
  Trophy,
  Brain,
  Dumbbell,
  Apple,
  MessageCircle,
  Calendar,
  ChevronDown,
  Award,
  Activity,
  Utensils,
  Moon,
  Zap,
  Shield,
  BarChart3,
  BookOpen,
  Smartphone,
  Clock,
  Quote
} from 'lucide-react';
import { Link } from 'react-router-dom';
import butterflyLogo from '@/assets/logo-instituto.png';

const HomePage = () => {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

  const [selectedTestimonial, setSelectedTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Maria Silva",
      role: "Perdeu 18kg em 3 meses",
      content: "O Instituto dos Sonhos mudou completamente minha vida. A Sofia me ajudou em cada etapa, e o sistema de gamificação me manteve motivada todos os dias!",
      rating: 5,
      image: "👩‍💼"
    },
    {
      name: "João Santos",
      role: "Perdeu 25kg em 4 meses",
      content: "Nunca imaginei que seria tão fácil e prazeroso emagrecer. O acompanhamento profissional e as ferramentas são incríveis!",
      rating: 5,
      image: "👨‍💼"
    },
    {
      name: "Ana Costa",
      role: "Perdeu 12kg em 2 meses",
      content: "Além de perder peso, aprendi a ter uma relação saudável com a comida. O método é transformador!",
      rating: 5,
      image: "👩"
    }
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Avaliação Inicial",
      description: "Análise completa do seu perfil, objetivos e histórico de saúde",
      icon: Clipboard
    },
    {
      step: "2", 
      title: "Plano Personalizado",
      description: "Receba seu plano de alimentação e exercícios feito especialmente para você",
      icon: Target
    },
    {
      step: "3",
      title: "Acompanhamento Diário",
      description: "Sofia, sua IA nutricional, está disponível 24/7 para te apoiar",
      icon: MessageCircle
    },
    {
      step: "4",
      title: "Evolução Constante",
      description: "Monitore seus resultados e ajuste seu plano conforme necessário",
      icon: TrendingUp
    }
  ];

  const benefits = [
    {
      icon: Brain,
      title: "IA Sofia - Sua Nutricionista 24/7",
      description: "Assistente inteligente que responde suas dúvidas, analisa fotos de refeições e oferece orientações personalizadas a qualquer momento.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Target,
      title: "Metas Inteligentes",
      description: "Sistema avançado que cria objetivos alcançáveis e adapta seu plano conforme você evolui.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Trophy,
      title: "Gamificação Motivadora",
      description: "Ganhe pontos, conquiste badges e participe de desafios para manter sua motivação nas alturas.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Activity,
      title: "Análise Corporal Completa",
      description: "Acompanhe peso, medidas, IMC e composição corporal com gráficos interativos.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Utensils,
      title: "Plano Alimentar Personalizado",
      description: "Cardápios adaptados às suas preferências, restrições e objetivos específicos.",
      color: "from-red-500 to-pink-500"
    },
    {
      icon: Dumbbell,
      title: "Treinos Personalizados",
      description: "Exercícios adaptados ao seu nível, com vídeos explicativos e progressão inteligente.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: Calendar,
      title: "Missão do Dia",
      description: "Tarefas diárias estruturadas para criar hábitos saudáveis de forma natural e sustentável.",
      color: "from-teal-500 to-cyan-500"
    },
    {
      icon: BarChart3,
      title: "Relatórios Profissionais",
      description: "Análises detalhadas da sua evolução com insights e recomendações personalizadas.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Users,
      title: "Comunidade Ativa",
      description: "Conecte-se com outras pessoas em transformação, compartilhe experiências e inspire-se.",
      color: "from-pink-500 to-rose-500"
    }
  ];

  const faq = [
    {
      question: "Como funciona o período gratuito?",
      answer: "Você tem 7 dias para experimentar todas as funcionalidades da plataforma sem custo. Não é necessário cadastrar cartão de crédito."
    },
    {
      question: "A IA Sofia substitui um nutricionista?",
      answer: "A Sofia é uma ferramenta complementar de apoio 24/7, mas não substitui o acompanhamento de um profissional de saúde. Recomendamos consultas regulares com nutricionista."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim! Você pode cancelar sua assinatura a qualquer momento, sem multas ou taxas adicionais."
    },
    {
      question: "O método funciona para todos?",
      answer: "Nosso método é baseado em ciência e funciona para a maioria das pessoas. Temos uma taxa de sucesso de 92% entre nossos usuários ativos."
    },
    {
      question: "Preciso seguir uma dieta restritiva?",
      answer: "Não! Nosso método é baseado em reeducação alimentar, não em dietas restritivas. Você aprenderá a fazer escolhas saudáveis de forma sustentável."
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
            >
              <img src={butterflyLogo} alt="Instituto dos Sonhos" className="w-10 h-10 sm:w-12 sm:h-12" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Instituto dos Sonhos
              </span>
            </motion.div>
            
            <div className="flex gap-2 sm:gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-foreground/70 hover:text-primary transition-colors">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Enhanced */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              style={{ opacity, scale }}
              className="space-y-6 sm:space-y-8"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-full px-4 py-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  +1.200 vidas transformadas
                </span>
              </motion.div>
              
              <motion.h1 
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Transforme seu corpo e sua{' '}
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  vida completa
                </span>
              </motion.h1>
              
              <motion.p 
                className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Plataforma completa de emagrecimento integral com acompanhamento por IA, 
                nutricionistas especializados, gamificação envolvente e comunidade inspiradora. 
                Alcance seus objetivos com ciência, tecnologia e suporte 24/7.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link to="/auth" className="flex-1 sm:flex-none">
                  <Button size="lg" className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-xl hover:shadow-2xl transition-all group">
                    <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                    Começar Transformação
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-2 hover:bg-accent/5">
                  <Activity className="mr-2 h-5 w-5" />
                  Ver Como Funciona
                </Button>
              </motion.div>

              <motion.div 
                className="flex flex-wrap items-center gap-6 pt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <span className="text-lg">👤</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-primary font-semibold mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                    <span className="ml-1">4.9/5</span>
                  </div>
                  <p className="text-muted-foreground">Baseado em 847 avaliações</p>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative lg:h-[600px] flex items-center justify-center"
            >
              <div className="relative z-10">
                <motion.img 
                  src={butterflyLogo} 
                  alt="Transformação" 
                  className="w-full max-w-md mx-auto drop-shadow-2xl" 
                  animate={{ 
                    y: [0, -20, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 blur-3xl animate-pulse" />
              
              {/* Floating Stats Cards */}
              <motion.div
                className="absolute top-8 -left-4 bg-card/90 backdrop-blur-lg p-4 rounded-2xl shadow-xl border border-border/50"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">-18kg</p>
                    <p className="text-xs text-muted-foreground">em 3 meses</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-8 -right-4 bg-card/90 backdrop-blur-lg p-4 rounded-2xl shadow-xl border border-border/50"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">92%</p>
                    <p className="text-xs text-muted-foreground">Taxa sucesso</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div 
            className="flex justify-center mt-12 sm:mt-16"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Descubra mais</p>
              <ChevronDown className="w-6 h-6 text-primary mx-auto" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { number: '1.200+', label: 'Vidas Transformadas', icon: Users, color: 'from-blue-500 to-cyan-500' },
              { number: '92%', label: 'Taxa de Sucesso', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
              { number: '4.9/5', label: 'Avaliação Média', icon: Star, color: 'from-yellow-500 to-orange-500' },
              { number: '24/7', label: 'Suporte Disponível', icon: MessageCircle, color: 'from-purple-500 to-pink-500' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform mb-4`}>
                  <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm sm:text-base text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Como funciona a{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                transformação
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Um método científico e comprovado em 4 passos simples
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 group">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                      {step.step}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 z-10">
                    <ArrowRight className="w-8 h-8 text-primary/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Enhanced */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-card/30 to-accent/5">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Tudo que você precisa para{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                alcançar seus objetivos
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Ferramentas profissionais e tecnologia de ponta ao seu alcance
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border hover:border-primary/30 group overflow-hidden">
                  <div className={`h-1 bg-gradient-to-r ${benefit.color}`} />
                  <CardContent className="pt-6">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <benefit.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
              Histórias de{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                transformação real
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Veja o que nossos membros têm a dizer sobre suas jornadas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="h-full hover:shadow-2xl transition-all duration-300 border hover:border-primary/30">
                  <CardContent className="pt-6">
                    <Quote className="w-10 h-10 text-primary/20 mb-4" />
                    <p className="text-muted-foreground mb-6 leading-relaxed italic">
                      "{testimonial.content}"
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl">
                        {testimonial.image}
                      </div>
                      <div>
                        <p className="font-bold">{testimonial.name}</p>
                        <p className="text-sm text-primary font-medium">{testimonial.role}</p>
                        <div className="flex gap-1 mt-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current text-yellow-500" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-card/30 to-accent/5">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Perguntas{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Frequentes
              </span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faq.map((item, index) => (
              <motion.div
                key={item.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="pt-6">
                    <h3 className="font-bold text-lg mb-2">{item.question}</h3>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-br from-primary via-primary/90 to-accent rounded-3xl p-8 sm:p-12 lg:p-16 text-center text-primary-foreground overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
            
            <div className="relative z-10">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="inline-block mb-6"
              >
                <Sparkles className="w-16 h-16 mx-auto" />
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">
                Pronto para transformar sua vida?
              </h2>
              <p className="text-lg sm:text-xl mb-8 sm:mb-10 opacity-90 max-w-2xl mx-auto">
                Junte-se a mais de 1.200 pessoas que já iniciaram sua jornada de transformação. 
                Comece hoje mesmo, totalmente grátis por 7 dias.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Link to="/auth">
                  <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90 shadow-xl">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Começar Agora Grátis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>7 dias grátis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 border-t border-border/40 bg-card/30">
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={butterflyLogo} alt="Instituto dos Sonhos" className="w-10 h-10" />
                <span className="font-bold text-lg">Instituto dos Sonhos</span>
              </div>
              <p className="text-muted-foreground mb-4">
                Transformando vidas através de um método integral de emagrecimento com tecnologia, 
                ciência e muito cuidado.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Links Rápidos</h4>
              <div className="space-y-2">
                <Link to="/auth" className="block text-muted-foreground hover:text-primary transition-colors">
                  Começar Grátis
                </Link>
                <Link to="/terms" className="block text-muted-foreground hover:text-primary transition-colors">
                  Termos de Uso
                </Link>
                <Link to="/privacidade" className="block text-muted-foreground hover:text-primary transition-colors">
                  Privacidade
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Contato</h4>
              <div className="space-y-2 text-muted-foreground">
                <p>Suporte 24/7</p>
                <p className="text-primary font-medium">contato@institutodossonhos.com</p>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/40 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © 2025 Instituto dos Sonhos. Todos os direitos reservados.
            </p>
            <div className="flex gap-4">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Pagamento Seguro</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
