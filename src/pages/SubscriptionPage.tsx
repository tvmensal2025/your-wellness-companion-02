import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Crown, Star, Settings } from 'lucide-react';
import { useStripeCheckout } from '@/hooks/useStripeCheckout';
import FeatureLockGuard from '@/components/FeatureLockGuard';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Acesso completo à Sofia IA e rastreamento',
    icon: Zap,
    features: [
      'Sofia IA: Análises ilimitadas',
      'Dr. Vital: Consultas ilimitadas',
      'Rastreamento completo de saúde',
      'Gamificação e desafios',
      'Protocolos personalizados',
      'Relatórios semanais',
      'Suporte por email'
    ],
    popular: false,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'vip',
    name: 'VIP Exclusivo',
    price: 'R$ 99,90',
    period: '/mês',
    description: 'Tudo do Premium + atendimento exclusivo',
    icon: Crown,
    features: [
      'Tudo do plano Premium',
      'Protocolo mensal com Dr. Vital',
      'Masterclasses exclusivas',
      'Relatórios detalhados avançados',
      'Suporte prioritário 24/7',
      'Acesso antecipado a novidades',
      'Consultoria personalizada',
      'Comunidade VIP exclusiva'
    ],
    popular: true,
    color: 'from-purple-500 to-purple-600'
  }
];

const benefits = [
  {
    title: 'Resultados Rápidos',
    description: 'Veja mudanças significativas em suas métricas de saúde em poucas semanas',
    icon: Zap
  },
  {
    title: 'Tecnologia Avançada',
    description: 'IA e análise de dados para insights personalizados sobre sua saúde',
    icon: Crown
  },
  {
    title: 'Suporte Especializado',
    description: 'Equipe de especialistas em saúde e bem-estar para te ajudar',
    icon: Star
  }
];

export default function SubscriptionPage() {
  const { createCheckout, checkSubscription, openCustomerPortal, isLoading } = useStripeCheckout();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    // Check for success/cancel from Stripe redirect
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Assinatura realizada!",
        description: "Bem-vindo ao Bem-Estar 360! Aproveite todos os recursos.",
      });
    } else if (searchParams.get('canceled') === 'true') {
      toast({
        title: "Checkout cancelado",
        description: "Você pode tentar novamente quando quiser.",
        variant: "destructive",
      });
    }

    // Check current subscription
    checkSubscription().then(data => {
      if (data) setCurrentSubscription(data);
    });
  }, [searchParams]);

  const handleSubscribe = async (planId: string) => {
    await createCheckout(planId);
  };

  return (
    <FeatureLockGuard feature="assinatura">
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          {/* Header - Mobile Optimized */}
          <div className="text-center mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-4">Bem-Estar 360</h1>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground">
              Transforme sua saúde com as ferramentas certas
            </p>
            
            {currentSubscription?.subscribed && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <Badge className="bg-green-500 text-white">
                  Plano Ativo: {currentSubscription.subscription_tier}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openCustomerPortal}
                  disabled={isLoading}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Gerenciar Assinatura
                </Button>
              </div>
            )}
          </div>

          {/* Planos - Mobile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-8 sm:mb-16 max-w-4xl mx-auto">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              return (
                <Card 
                  key={plan.id}
                  className={`relative transition-all duration-300 hover:shadow-xl ${
                    plan.popular ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs">
                      Mais Popular
                    </Badge>
                  )}
                  
                  <CardHeader className="text-center p-4 sm:p-6">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
                    <div className="text-center">
                      <div className="text-2xl sm:text-3xl font-bold">{plan.price}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground">{plan.period}</div>
                    </div>
                    
                    <div className="space-y-2 sm:space-y-3">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2 sm:gap-3">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs sm:text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <Button 
                      className={`w-full text-sm sm:text-base ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90' 
                          : 'bg-secondary hover:bg-secondary/90'
                      }`}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processando...' : `Escolher ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Benefícios - Mobile Grid */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-8">Por que escolher nossa plataforma?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-8">
              {benefits.map((benefit, index) => {
                const IconComponent = benefit.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-4 sm:pt-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <h3 className="text-base sm:text-xl font-semibold mb-1 sm:mb-2">{benefit.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* FAQ - Mobile Optimized */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-4 sm:mb-8">Perguntas Frequentes</h2>
            <div className="space-y-3 sm:space-y-4">
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-lg">Posso cancelar a qualquer momento?</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Sim! Cancele quando quiser pelo painel. Acesso mantido até o fim do período.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-lg">Existe período de teste?</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Oferecemos 7 dias grátis para experimentar todas as funcionalidades.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-3 sm:p-6">
                  <CardTitle className="text-sm sm:text-lg">Como funciona o suporte?</CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-6 pt-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Email para todos os planos. Premium tem suporte prioritário 24/7.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </FeatureLockGuard>
  );
}