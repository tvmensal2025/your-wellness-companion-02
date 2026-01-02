import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, ShoppingCart, ExternalLink, Sparkles, CheckCircle2, AlertCircle, BookOpen, ListFilter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { iaRecomendacaoSuplementos } from '@/services/iaRecomendacaoSuplementos';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Supplement {
  id: string;
  name: string;
  external_id?: string;
  active_ingredients: string[];
  benefits: string[];
  category: string;
  brand: string;
  image_url?: string;
  original_price?: number;
  discount_price?: number;
  description?: string;
  recommended_dosage?: string;
  scientific_studies?: string[];
}

interface SupplementRecommendation {
  supplement: Supplement;
  score: number;
  personalizedReason: string;
  specificBenefits: string[];
  priority: 'high' | 'medium' | 'low';
  dosage: string;
}

interface Protocol {
  id: string;
  name: string;
  description?: string;
}

export const PersonalizedSupplementsCard: React.FC = () => {
  const [recommendations, setRecommendations] = useState<SupplementRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAnamnesis, setHasAnamnesis] = useState(false);
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedProtocolId, setSelectedProtocolId] = useState<string>('ia_recommendation');
  const [viewMode, setViewMode] = useState<'ia' | 'protocol'>('ia');
  
  const { toast } = useToast();

  useEffect(() => {
    checkAnamnesisAndLoadData();
  }, []);

  useEffect(() => {
    if (selectedProtocolId === 'ia_recommendation') {
      setViewMode('ia');
      loadIARecommendations();
    } else {
      setViewMode('protocol');
      loadProtocolProducts(selectedProtocolId);
    }
  }, [selectedProtocolId]);

  const checkAnamnesisAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Verificar anamnese
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
      
      // Carregar lista de protocolos disponíveis
      loadProtocols();
      
      // Carregar recomendação inicial (IA)
      loadIARecommendations();

    } catch (error) {
      console.error('Erro ao verificar dados:', error);
      setLoading(false);
    }
  };

  const loadProtocols = async () => {
    try {
      // Primeiro, buscar condições de saúde de nutrição
      const { data: nutritionConditions } = await supabase
        .from('health_conditions')
        .select('id')
        .eq('category', 'nutrição')
        .eq('is_active', true);
      
      if (!nutritionConditions || nutritionConditions.length === 0) {
        // Se não houver categoria, carregar todos (fallback)
        const { data } = await supabase
          .from('supplement_protocols')
          .select('id, name, description')
          .eq('is_active', true)
          .order('name');
        
        if (data) {
          setProtocols(data);
        }
        return;
      }
      
      const nutritionConditionIds = nutritionConditions.map(c => c.id);
      
      // Buscar protocolos apenas das condições de nutrição
      const { data } = await supabase
        .from('supplement_protocols')
        .select('id, name, description')
        .eq('is_active', true)
        .in('health_condition_id', nutritionConditionIds)
        .order('name');
      
      if (data) {
        setProtocols(data);
      }
    } catch (error) {
      console.error('Erro ao carregar protocolos:', error);
      // Fallback: tentar sem filtro de categoria caso a coluna não exista ainda
      try {
        const { data } = await supabase
          .from('supplement_protocols')
          .select('id, name, description')
          .eq('is_active', true)
          .order('name');
        
        if (data) {
          setProtocols(data);
        }
      } catch (fallbackError) {
        console.error('Erro ao carregar protocolos (fallback):', fallbackError);
      }
    }
  };

  const loadIARecommendations = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: anamnesis } = await supabase
        .from('user_anamnesis')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const chronicDiseases = Array.isArray(anamnesis?.chronic_diseases) 
        ? anamnesis.chronic_diseases.map((d: any) => String(d))
        : [];
      
      const userProfile = {
        id: user.id,
        age: profile?.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 30,
        gender: profile?.gender || 'masculino',
        weight: profile?.current_weight || 70,
        height: profile?.height || 170,
        activity_level: anamnesis?.physical_activity_frequency || 'moderado',
        goals: anamnesis?.main_treatment_goals ? [anamnesis.main_treatment_goals] : [],
        health_conditions: [
          ...chronicDiseases,
          ...((anamnesis?.daily_stress_level || 0) > 7 ? ['estresse'] : []),
          ...((anamnesis?.sleep_quality_score || 0) < 5 ? ['problemas_sono'] : []),
          ...((profile?.current_weight || 0) > 90 ? ['sobrepeso'] : [])
        ]
      };

      // Filtrar apenas produtos de saúde/suplementos (excluir perfumaria, cosméticos não relacionados)
      const categoriasValidas = [
        'vitaminas', 'minerais', 'aminoacidos', 'proteinas', 'emagrecimento',
        'energia', 'cardiovascular', 'sono', 'digestao', 'imunidade', 'colageno',
        'beleza', 'performance', 'saude', 'suplemento', 'nutricional', 'terapeutico',
        'antioxidante', 'anti-inflamatorio', 'detox', 'metabolismo', 'hormonal',
        'osseo', 'articular', 'muscular', 'cognitivo', 'estresse', 'ansiedade'
      ];

      const categoriasInvalidas = [
        'perfumaria', 'perfume', 'fragrancia', 'cosmetico', 'cosmético',
        'beleza_externa', 'higiene', 'limpeza'
      ];

      const { data: supplements } = await supabase
        .from('supplements')
        .select('*')
        .eq('is_approved', true);

      if (!supplements || supplements.length === 0) {
        setLoading(false);
        return;
      }

      // Filtrar produtos válidos - apenas suplementos de saúde
      const suplementosValidos = supplements.filter((sup: any) => {
        const categoria = (sup.category || '').toLowerCase();
        const nome = (sup.name || '').toLowerCase();
        const descricao = (sup.description || '').toLowerCase();
        const tags = (sup.tags || []).map((t: string) => t.toLowerCase());
        const externalId = (sup.external_id || '').toUpperCase();
        
        // Excluir perfumes e produtos não relacionados por external_id
        const produtosInvalidos = ['CAR_BLACK', 'GOLD_MONEY', 'MADAME_X', 'VIP_GLAMOUR_KIT'];
        if (produtosInvalidos.includes(externalId)) {
          return false;
        }
        
        // Excluir perfumes e produtos não relacionados por categoria/nome/descrição
        if (categoriasInvalidas.some(inv => 
          categoria.includes(inv) || 
          nome.includes(inv) || 
          descricao.includes(inv)
        )) {
          return false;
        }
        
        // Excluir se todas as tags forem de perfumaria
        if (tags.length > 0 && tags.every((tag: string) => 
          categoriasInvalidas.some(inv => tag.includes(inv))
        )) {
          return false;
        }
        
        // Validar que é um produto de saúde: deve ter categoria válida E (ingredientes ativos OU benefícios)
        const temCategoriaValida = categoriasValidas.some(val => categoria.includes(val));
        const temIngredientes = sup.active_ingredients && Array.isArray(sup.active_ingredients) && sup.active_ingredients.length > 0;
        const temBeneficios = sup.benefits && Array.isArray(sup.benefits) && sup.benefits.length > 0;
        
        // Produto válido se: tem categoria válida E (tem ingredientes OU tem benefícios)
        return temCategoriaValida && (temIngredientes || temBeneficios);
      });

      if (suplementosValidos.length === 0) {
        setLoading(false);
        toast({
          title: 'Nenhum produto disponível',
          description: 'Não há suplementos adequados para recomendação no momento.',
          variant: 'default'
        });
        return;
      }

      const recs = iaRecomendacaoSuplementos.recomendarProdutos(
        userProfile,
        anamnesis as any,
        [],
        4, // Top 4 produtos
        suplementosValidos as any
      );

      setRecommendations(recs);
    } catch (error) {
      console.error('Erro ao carregar recomendações IA:', error);
      toast({
        title: 'Erro ao carregar vitrine',
        description: 'Tente recarregar a página.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProtocolProducts = async (protocolId: string) => {
    setLoading(true);
    try {
      // Buscar produtos do protocolo
      const { data: protocolItems } = await supabase
        .from('protocol_supplements')
        .select(`
          dosage,
          notes,
          supplement:supplements (
            id, name, category, brand, image_url, 
            original_price, discount_price, description, 
            benefits, scientific_studies
          )
        `)
        .eq('protocol_id', protocolId)
        .order('display_order');

      if (!protocolItems) {
        setRecommendations([]);
        return;
      }

      // Transformar em formato SupplementRecommendation
      const protocolRecs: SupplementRecommendation[] = protocolItems.map((item: any) => ({
        supplement: item.supplement,
        score: 100, // Protocolo tem match total pois foi selecionado
        personalizedReason: item.notes || "Produto essencial deste protocolo selecionado.",
        specificBenefits: item.supplement.benefits?.slice(0, 3) || [],
        priority: 'high',
        dosage: item.dosage
      }));

      setRecommendations(protocolRecs);
    } catch (error) {
      console.error('Erro ao carregar produtos do protocolo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !recommendations.length) {
    return (
      <Card className="bg-white shadow-sm border-0 h-full">
        <CardContent className="p-8 h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="text-sm text-muted-foreground">A Sofia está selecionando os melhores produtos para você...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasAnamnesis) {
    return (
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-emerald-800">
            <Sparkles className="w-5 h-5" />
            Vitrine Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-sm text-emerald-700 mb-4">
            Complete sua anamnese para que a Sofia possa montar seu protocolo personalizado de suplementação.
          </p>
          <Button variant="outline" className="border-emerald-600 text-emerald-700 hover:bg-emerald-100">
            Preencher Anamnese
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Vitrine Personalizada Nema's Way
          </h2>
          <p className="text-sm text-gray-600">
            Produtos específicos para seu metabolismo e objetivos
          </p>
        </div>

        <div className="w-full md:w-64">
          <Select value={selectedProtocolId} onValueChange={setSelectedProtocolId}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Selecione um protocolo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ia_recommendation">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Recomendação da IA (Personalizado)</span>
                </div>
              </SelectItem>
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-gray-50">
                Protocolos Específicos
              </div>
              {protocols.map((protocol) => (
                <SelectItem key={protocol.id} value={protocol.id}>
                  {protocol.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-6 text-center text-muted-foreground">
            Nenhum suplemento encontrado para esta seleção.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <Card 
              key={rec.supplement.id}
              className="overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white"
            >
              <CardContent className="p-0">
                {/* Header com Badge */}
                <div className="relative p-4 pb-3 border-b border-gray-100">
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-600 text-white text-xs px-2 py-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {Math.round(rec.score)}% Match
                    </Badge>
                  </div>
                  
                  <div className="flex gap-4 pr-20">
                    {/* Imagem do Produto */}
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {rec.supplement.image_url ? (
                        <img 
                          src={rec.supplement.image_url} 
                          alt={rec.supplement.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Pill className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Nome e Categoria */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">
                        {rec.supplement.category || 'Suplemento'}
                      </p>
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {rec.supplement.name}
                      </h3>
                      {rec.specificBenefits.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {rec.specificBenefits.slice(0, 2).map((b, i) => (
                            <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-600">
                              {b}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Motivo Personalizado */}
                <div className="p-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900 mb-1">
                        Por que é ideal para você:
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {rec.personalizedReason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modo de Uso */}
                {rec.dosage && (
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                      <span className="font-medium">Modo de uso:</span>
                      <span>{rec.dosage}</span>
                    </div>
                  </div>
                )}

                {/* Link PubMed */}
                {rec.supplement.scientific_studies && rec.supplement.scientific_studies.length > 0 && (
                  <div className="px-4 py-2 border-b border-gray-100">
                    <a 
                      href={rec.supplement.scientific_studies[0]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Ver artigo científico</span>
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </div>
                )}

                {/* Footer com Preço e Botão */}
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div>
                      {rec.supplement.original_price && (
                        <span className="text-xs text-gray-400 line-through block">
                          R$ {rec.supplement.original_price.toFixed(2)}
                        </span>
                      )}
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-lg font-bold text-gray-900">
                          R$ {rec.supplement.discount_price?.toFixed(2) || rec.supplement.original_price?.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Comprar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-center pt-4">
        <Button variant="outline" className="border-dashed text-muted-foreground hover:text-emerald-600 hover:border-emerald-300">
            Ver todo o catálogo Nema's Way
        </Button>
      </div>
    </div>
  );
};
