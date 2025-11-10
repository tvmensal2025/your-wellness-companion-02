import React from 'react';
import { motion } from 'framer-motion';
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
  Apple
} from 'lucide-react';
import { Link } from 'react-router-dom';
import butterflyLogo from '@/assets/logo-instituto.png';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <img src={butterflyLogo} alt="Instituto dos Sonhos" className="w-12 h-12" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Instituto dos Sonhos
              </span>
            </motion.div>
            
            <motion.div 
              className="flex gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Link to="/auth">
                <Button variant="ghost" className="text-foreground/70 hover:text-primary">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Começar Grátis
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Transforme sua vida em 30 dias</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                Sua jornada de{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  transformação
                </span>{' '}
                começa aqui
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Plataforma completa de emagrecimento e bem-estar com acompanhamento inteligente, 
                gamificação e suporte 24/7. Junte-se a mais de 1.200 pessoas que já transformaram suas vidas.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth" className="flex-1 sm:flex-none">
                  <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Começar Transformação
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                      <span className="text-xs">👤</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex items-center gap-1 text-primary font-semibold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>4.9/5</span>
                  </div>
                  <p className="text-muted-foreground">+1.200 vidas transformadas</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img 
                  src={butterflyLogo} 
                  alt="Transformação" 
                  className="w-full max-w-md mx-auto drop-shadow-2xl animate-float" 
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-3xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Tudo que você precisa para{' '}
              <span className="text-primary">transformar sua vida</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Método completo e cientificamente comprovado
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: 'Metas Personalizadas',
                description: 'Defina e acompanhe suas metas com sistema inteligente de progressão'
              },
              {
                icon: Brain,
                title: 'IA Sofia 24/7',
                description: 'Assistente virtual disponível sempre que você precisar de orientação'
              },
              {
                icon: Trophy,
                title: 'Gamificação',
                description: 'Sistema de pontos, níveis e conquistas para manter você motivado'
              },
              {
                icon: Dumbbell,
                title: 'Treinos Personalizados',
                description: 'Exercícios adaptados ao seu nível e objetivos específicos'
              },
              {
                icon: Apple,
                title: 'Nutrição Inteligente',
                description: 'Planos alimentares personalizados e acompanhamento nutricional'
              },
              {
                icon: TrendingUp,
                title: 'Análise de Progresso',
                description: 'Gráficos e relatórios detalhados da sua evolução'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: '1.200+', label: 'Vidas Transformadas', icon: Users },
              { number: '92%', label: 'Taxa de Sucesso', icon: TrendingUp },
              { number: '4.9/5', label: 'Avaliação Média', icon: Star }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-12 text-center text-primary-foreground"
          >
            <h2 className="text-4xl font-bold mb-4">
              Pronto para começar sua transformação?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Junte-se a milhares de pessoas que já transformaram suas vidas
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
                <Sparkles className="mr-2 h-5 w-5" />
                Começar Agora Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <div className="mt-8 flex items-center justify-center gap-8 text-sm opacity-80">
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
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={butterflyLogo} alt="Instituto dos Sonhos" className="w-8 h-8" />
              <span className="font-semibold">Instituto dos Sonhos</span>
            </div>
            
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/terms" className="hover:text-primary transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="hover:text-primary transition-colors">
                Privacidade
              </Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 Instituto dos Sonhos. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
