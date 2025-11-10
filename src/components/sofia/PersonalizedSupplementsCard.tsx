import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, ShoppingCart, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { iaRecomendacaoSuplementos } from '@/services/iaRecomendacaoSuplementos';
import { useToast } from '@/hooks/use-toast';

interface Supplement {
  id: string;
  name: string;
  active_ingredients: string[];
  benefits: string[];
  category: string;
  brand: string;
  image_url?: string;
  original_price?: number;
  discount_price?: number;
  description?: string;
}

interface SupplementRecommendation {
  supplement: Supplement;
  score: number;
  personalizedReason: string;
  specificBenefits: string[];
  priority: 'high' | 'medium' | 'low';
}

export const PersonalizedSupplementsCard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<SupplementRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAnamnesis, setHasAnamnesis] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar anamnese
      const { data: anamnesis } = await supabase
        .from('user_anamnesis')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!anamnesis) {
        setHasAnamnesis(false);
        setLoading(false);
        return;
      }

      setHasAnamnesis(true);

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Criar perfil do usuário para recomendação (usando dados disponíveis)
      const chronicDiseases = Array.isArray(anamnesis.chronic_diseases) 
        ? anamnesis.chronic_diseases.map(d => String(d))
        : [];
      
      // Buscar suplementos disponíveis (aprovados)
      const { data: supplements } = await supabase
        .from('supplements')
        .select('*')
        .eq('is_approved', true)
        .limit(20);

      if (!supplements || supplements.length === 0) {
        setLoading(false);
        return;
      }
      
      const userProfile = {
        id: user.id,
        age: profile?.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 30,
        gender: 'masculino', // Valor padrão, pode ser ajustado no perfil
        weight: 70, // Valor padrão, pode ser ajustado no perfil  
        height: 170, // Valor padrão, pode ser ajustado no perfil
        activity_level: anamnesis.physical_activity_frequency || 'moderado',
        goals: anamnesis.main_treatment_goals ? [anamnesis.main_treatment_goals] : [],
        health_conditions: [
          ...chronicDiseases,
          ...((anamnesis.daily_stress_level || 0) > 7 ? ['estresse'] : []),
          ...((anamnesis.sleep_quality_score || 0) < 5 ? ['problemas_sono'] : [])
        ]
      };

      // Gerar recomendações
      const recs = iaRecomendacaoSuplementos.recomendarProdutos(
        userProfile,
        anamnesis as any,
        [],
        4, // Top 4 recomendações
        supplements as any
      );

      setRecommendations(recs);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      toast({
        title: 'Erro ao carregar recomendações',
        description: 'Não foi possível gerar suas recomendações personalizadas.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border-0">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-sm text-muted-foreground">Analisando seu perfil...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAnamnesis) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="w-5 h-5 text-purple-600" />
            Suplementos Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              Complete sua anamnese para receber recomendações personalizadas de suplementos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="bg-white shadow-sm border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="w-5 h-5 text-emerald-600" />
            Suplementos Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma recomendação disponível no momento.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-emerald-100 text-emerald-700';
      case 'medium': return 'bg-blue-100 text-blue-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta Prioridade';
      case 'medium': return 'Média Prioridade';
      case 'low': return 'Baixa Prioridade';
      default: return 'Prioridade';
    }
  };

  return (
    <Card className="bg-white shadow-sm border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="w-5 h-5 text-emerald-600" />
            Suplementos Personalizados
          </CardTitle>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            <Sparkles className="w-3 h-3 mr-1" />
            IA
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground mb-4">
          Baseado na sua anamnese e objetivos, recomendamos:
        </p>

        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div 
              key={rec.supplement.id}
              className="p-3 rounded-lg border border-gray-100 hover:border-emerald-200 hover:shadow-sm transition-all bg-gradient-to-r from-white to-emerald-50/30"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {rec.supplement.image_url ? (
                    <img 
                      src={rec.supplement.image_url} 
                      alt={rec.supplement.name}
                      className="w-12 h-12 rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-md bg-emerald-100 flex items-center justify-center">
                      <Pill className="w-6 h-6 text-emerald-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {rec.supplement.name}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getPriorityColor(rec.priority)}`}
                    >
                      {getPriorityLabel(rec.priority)}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                    {rec.personalizedReason}
                  </p>

                  {rec.supplement.benefits && rec.supplement.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {rec.supplement.benefits.slice(0, 2).map((benefit, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline" 
                          className="text-xs bg-white"
                        >
                          {benefit}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    {rec.supplement.discount_price && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 line-through">
                          R$ {rec.supplement.original_price?.toFixed(2)}
                        </span>
                        <span className="text-sm font-bold text-emerald-600">
                          R$ {rec.supplement.discount_price.toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="text-xs h-7"
                      onClick={() => {
                        toast({
                          title: 'Em breve!',
                          description: 'A página de produtos estará disponível em breve.'
                        });
                      }}
                    >
                      Ver produto
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button 
          className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700"
          onClick={() => {
            toast({
              title: 'Em breve!',
              description: 'A loja de suplementos estará disponível em breve.'
            });
          }}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Ver Todos os Produtos
        </Button>
      </CardContent>
    </Card>
  );
};
