import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Search, 
  User,
  Heart,
  Scale,
  Brain,
  Pill,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Eye,
  Activity,
  Utensils
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

import AnamnesisDetailModal from './AnamnesisDetailModal';

interface AnamnesisData {
  id: string;
  user_id: string;
  user_name: string;
  profession?: string;
  marital_status?: string;
  city_state?: string;
  how_found_method?: string;
  
  // Histórico Familiar
  family_obesity_history?: boolean;
  family_diabetes_history?: boolean;
  family_heart_disease_history?: boolean;
  family_eating_disorders_history?: boolean;
  family_depression_anxiety_history?: boolean;
  family_thyroid_problems_history?: boolean;
  family_other_chronic_diseases?: string;
  
  // Histórico de Peso
  weight_gain_started_age?: number;
  lowest_adult_weight?: number;
  highest_adult_weight?: number;
  major_weight_gain_periods?: string;
  emotional_events_during_weight_gain?: string;
  weight_fluctuation_classification?: string;
  
  // Tratamentos Anteriores
  previous_weight_treatments?: any;
  most_effective_treatment?: string;
  least_effective_treatment?: string;
  had_rebound_effect?: boolean;
  
  // Medicações e Saúde
  current_medications?: any;
  chronic_diseases?: any;
  supplements?: any;
  herbal_medicines?: any;
  
  // Relacionamento com Comida
  food_relationship_score?: number;
  has_compulsive_eating?: boolean;
  compulsive_eating_situations?: string;
  problematic_foods?: any;
  forbidden_foods?: any;
  feels_guilt_after_eating?: boolean;
  eats_in_secret?: boolean;
  eats_until_uncomfortable?: boolean;
  
  // Qualidade de Vida
  sleep_hours_per_night?: number;
  sleep_quality_score?: number;
  daily_stress_level?: string | null;
  physical_activity_type?: string;
  physical_activity_frequency?: string;
  daily_energy_level?: number;
  general_quality_of_life?: number;
  
  // Objetivos
  main_treatment_goals?: string;
  ideal_weight_goal?: number;
  timeframe_to_achieve_goal?: string;
  biggest_weight_loss_challenge?: string;
  treatment_success_definition?: string;
  motivation_for_seeking_treatment?: string;
  
  created_at?: string;
  updated_at?: string;
}

const AnamnesisManagement: React.FC = () => {
  const [anamneses, setAnamneses] = useState<AnamnesisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAnamnesis, setSelectedAnamnesis] = useState<AnamnesisData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchAnamneses();
  }, []);

  const fetchAnamneses = async () => {
    try {
      setLoading(true);

      // Buscar todas as anamneses
      const { data: anamnesisData, error: anamnesisError } = await supabase
        .from('user_anamnesis')
        .select('*')
        .order('created_at', { ascending: false });

      if (anamnesisError) {
        console.error('Error fetching anamneses:', anamnesisError);
        return;
      }

      // Buscar nomes dos usuários
      const userIds = [...new Set((anamnesisData || []).map(a => a.user_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Criar mapa de user_id -> full_name
      const userNamesMap = new Map<string, string>();
      (profilesData || []).forEach(profile => {
        if (profile.user_id && profile.full_name) {
          userNamesMap.set(profile.user_id, profile.full_name);
        }
      });

      // Processar dados das anamneses
      const processedData: AnamnesisData[] = (anamnesisData || []).map(anamnesis => ({
        ...anamnesis,
        user_name: userNamesMap.get(anamnesis.user_id) || 'Usuário sem nome'
      }));

      setAnamneses(processedData);

    } catch (error) {
      console.error('Error fetching anamneses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAnamneses = anamneses.filter(anamnesis => {
    const matchesSearch = searchTerm === '' || 
      anamnesis.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anamnesis.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      anamnesis.city_state?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getRiskLevel = (anamnesis: AnamnesisData) => {
    let riskScore = 0;
    
    // Fatores de risco familiares
    if (anamnesis.family_obesity_history) riskScore++;
    if (anamnesis.family_diabetes_history) riskScore++;
    if (anamnesis.family_heart_disease_history) riskScore++;
    
    // BMI
    if (anamnesis.current_bmi && anamnesis.current_bmi >= 30) riskScore += 2;
    else if (anamnesis.current_bmi && anamnesis.current_bmi >= 25) riskScore++;
    
    // Relacionamento com comida
    if (anamnesis.has_compulsive_eating) riskScore++;
    if (anamnesis.feels_guilt_after_eating) riskScore++;
    
    // Qualidade de vida
    if (anamnesis.daily_stress_level && anamnesis.daily_stress_level >= 7) riskScore++;
    if (anamnesis.sleep_quality_score && anamnesis.sleep_quality_score <= 3) riskScore++;

    if (riskScore >= 5) return { level: 'Alto', color: 'bg-red-500' };
    if (riskScore >= 3) return { level: 'Moderado', color: 'bg-yellow-500' };
    return { level: 'Baixo', color: 'bg-green-500' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRisksAndRecommendations = (anamnesis: AnamnesisData) => {
    const risks = [];
    const recommendations = [];

    // Análise de riscos familiares
    if (anamnesis.family_diabetes_history) {
      risks.push('Histórico familiar de diabetes');
      recommendations.push('Monitorar glicemia regularmente');
    }
    if (anamnesis.family_heart_disease_history) {
      risks.push('Histórico familiar de doenças cardíacas');
      recommendations.push('Acompanhamento cardiológico preventivo');
    }
    if (anamnesis.family_obesity_history) {
      risks.push('Histórico familiar de obesidade');
      recommendations.push('Foco especial no controle de peso');
    }

    // Análise de IMC
    if (anamnesis.current_bmi && anamnesis.current_bmi >= 30) {
      risks.push('IMC indica obesidade');
      recommendations.push('Programa intensivo de perda de peso');
    }

    // Análise comportamental alimentar
    if (anamnesis.has_compulsive_eating) {
      risks.push('Compulsão alimentar');
      recommendations.push('Acompanhamento psicológico especializado');
    }
    if (anamnesis.eats_in_secret || anamnesis.feels_guilt_after_eating) {
      risks.push('Relação problemática com a comida');
      recommendations.push('Terapia comportamental alimentar');
    }

    // Análise de qualidade de vida
    if (anamnesis.daily_stress_level && anamnesis.daily_stress_level >= 7) {
      risks.push('Nível alto de estresse');
      recommendations.push('Técnicas de manejo de estresse e relaxamento');
    }
    if (anamnesis.sleep_quality_score && anamnesis.sleep_quality_score <= 3) {
      risks.push('Qualidade de sono ruim');
      recommendations.push('Higiene do sono e possível investigação médica');
    }

    return { risks, recommendations };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded w-48"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
                  </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Anamneses</h1>
          <p className="text-muted-foreground">
            Visualize todas as anamneses dos usuários para entender como ajudá-los - {anamneses.length} registros encontrados
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, profissão ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anamneses List */}
      <div className="space-y-4">
        {filteredAnamneses.map((anamnesis) => {
          const risk = getRiskLevel(anamnesis);
          const { risks, recommendations } = getRisksAndRecommendations(anamnesis);
          
          return (
            <Card key={anamnesis.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">
                          {anamnesis.user_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {anamnesis.profession && (
                          <span>{anamnesis.profession}</span>
                        )}
                        {anamnesis.city_state && (
                          <span>{anamnesis.city_state}</span>
                        )}
                        <span>{formatDate(anamnesis.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={`${risk.color} text-white`}>
                      Risco {risk.level}
                    </Badge>
                  </div>
                </div>

                {/* Métricas principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {anamnesis.current_bmi && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Scale className="h-4 w-4" />
                      <span className="text-sm">IMC: {anamnesis.current_bmi.toFixed(1)}</span>
                    </div>
                  )}
                  {anamnesis.food_relationship_score && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Utensils className="h-4 w-4" />
                      <span className="text-sm">Relação comida: {anamnesis.food_relationship_score}/10</span>
                    </div>
                  )}
                  {anamnesis.daily_stress_level && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Brain className="h-4 w-4" />
                      <span className="text-sm">Estresse: {anamnesis.daily_stress_level}/10</span>
                    </div>
                  )}
                  {anamnesis.sleep_quality_score && (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Sono: {anamnesis.sleep_quality_score}/10</span>
                    </div>
                  )}
                </div>

                {/* Principais riscos e recomendações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {risks.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        Principais Riscos:
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {risks.slice(0, 3).map((risk, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Recomendações:
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {recommendations.slice(0, 3).map((rec, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedAnamnesis(anamnesis);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes Completos
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Anamneses</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{anamneses.length}</div>
            <p className="text-xs text-muted-foreground">
              Registros completos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anamneses.filter(a => getRiskLevel(a).level === 'Alto').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Necessitam atenção especial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compulsão Alimentar</CardTitle>
            <Utensils className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anamneses.filter(a => a.has_compulsive_eating).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Casos identificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Histórico Familiar</CardTitle>
            <Heart className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {anamneses.filter(a => 
                a.family_diabetes_history || 
                a.family_heart_disease_history || 
                a.family_obesity_history
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Com fatores de risco
            </p>
          </CardContent>
        </Card>
      </div>

      <AnamnesisDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAnamnesis(null);
        }}
        anamnesis={selectedAnamnesis}
      />
    </div>
  );
};

export default AnamnesisManagement;
