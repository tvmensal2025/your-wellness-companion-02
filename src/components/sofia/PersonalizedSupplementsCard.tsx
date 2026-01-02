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
      const { data } = await supabase
        .from('supplement_protocols')
        .select('id, name, description')
        .eq('is_active', true)
        .order('name');
      
      if (data) {
        setProtocols(data);
      }
    } catch (error) {
      console.error('Erro ao carregar protocolos:', error);
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

      const { data: supplements } = await supabase
        .from('supplements')
        .select('*')
        .eq('is_approved', true);

      if (!supplements || supplements.length === 0) {
        setLoading(false);
        return;
      }

      const recs = iaRecomendacaoSuplementos.recomendarProdutos(
        userProfile,
        anamnesis as any,
        [],
        4, // Top 4 produtos
        supplements as any
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            Vitrine Personalizada Nema's Way
          </h2>
          <p className="text-sm text-muted-foreground">
            Produtos selecionados especificamente para seu metabolismo e objetivos.
          </p>
        </div>

        <div className="w-full md:w-72">
          <Select value={selectedProtocolId} onValueChange={setSelectedProtocolId}>
            <SelectTrigger className="w-full border-emerald-200 bg-white text-emerald-800 font-medium shadow-sm">
              <SelectValue placeholder="Selecione um protocolo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ia_recommendation" className="font-bold text-emerald-700">
                ✨ Recomendação da IA (Personalizado)
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
              className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300 group bg-white relative flex flex-col"
            >
              {/* Badge de Score/Match */}
              <div className={`absolute top-3 right-3 z-10 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1 ${viewMode === 'ia' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                {viewMode === 'ia' ? <Sparkles className="w-3 h-3" /> : <ListFilter className="w-3 h-3" />}
                {viewMode === 'ia' ? `${Math.round(rec.score)}% Match` : 'Protocolo'}
              </div>

              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="flex flex-col h-full">
                  {/* Cabeçalho do Produto */}
                  <div className="p-4 flex gap-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center border border-gray-100 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                      {rec.supplement.image_url ? (
                        <img 
                          src={rec.supplement.image_url} 
                          alt={rec.supplement.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Pill className="w-10 h-10 text-emerald-200" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <p className="text-xs font-medium text-emerald-600 mb-1 uppercase tracking-wider">
                            {rec.supplement.category || 'Suplemento'}
                          </p>
                          <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                            {rec.supplement.name}
                          </h3>
                          <div className="flex flex-wrap gap-1 mb-2">
                            {rec.specificBenefits.slice(0, 2).map((b, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] px-1.5 h-5 bg-gray-100 text-gray-600 border border-gray-200">
                                {b}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Motivo Personalizado (A "Inteligência") */}
                  <div className="px-4 pb-3">
                    <div className="bg-emerald-50/50 rounded-md p-3 border border-emerald-100/50">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-emerald-800">
                            {viewMode === 'ia' ? 'Por que indicamos para você?' : 'Neste protocolo:'}
                          </p>
                          <p className="text-xs text-emerald-700 leading-relaxed">
                            {rec.personalizedReason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dosagem Inteligente */}
                  <div className="px-4 pb-3">
                     <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                        <AlertCircle className="w-3 h-3 text-blue-500" />
                        <span className="font-medium text-gray-700">Modo de uso:</span>
                        {rec.dosage}
                     </div>
                  </div>

                  {/* Link Científico (PubMed) */}
                  {rec.supplement.scientific_studies && rec.supplement.scientific_studies.length > 0 && (
                    <div className="px-4 pb-3">
                      <a 
                        href={rec.supplement.scientific_studies[0]} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors p-2 rounded border border-blue-100 bg-blue-50/50"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span className="font-medium">Ver artigo científico na PubMed</span>
                        <ExternalLink className="w-3 h-3 ml-auto" />
                      </a>
                    </div>
                  )}

                  <div className="mt-auto border-t border-gray-100 p-4 bg-gray-50/30">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through">
                          R$ {rec.supplement.original_price?.toFixed(2)}
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-bold text-emerald-700">
                            R$ {rec.supplement.discount_price?.toFixed(2)}
                          </span>
                          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-100 px-1 rounded">
                            -50%
                          </span>
                        </div>
                      </div>
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200 transition-all hover:scale-105">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Comprar
                      </Button>
                    </div>
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
