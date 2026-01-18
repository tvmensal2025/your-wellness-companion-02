import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProfessionalEvaluation } from '@/hooks/useProfessionalEvaluation';
import { exportEvaluationToPDF } from '@/utils/exportEvaluationPDF';

// Novos componentes refatorados
import { EvaluationHeader } from '@/components/evaluation/EvaluationHeader';
import { MetricsForm } from '@/components/evaluation/MetricsForm';
import { ResultsDisplay } from '@/components/evaluation/ResultsDisplay';
import { EvaluationHistory } from '@/components/evaluation/EvaluationHistory';
import { ChartsPanel } from '@/components/evaluation/ChartsPanel';
import NewEvaluationWizard from '@/components/evaluation/NewEvaluationWizard';
import { ProfessionalWeighingSystem } from '@/components/evaluation/ProfessionalWeighingSystem';

// Tipos
import { UserProfile as UserProfileFromHook } from '@/hooks/useProfessionalEvaluation';
type UserProfile = UserProfileFromHook;

interface Measurements {
  weight: number;
  abdominalCircumference: number;
  waistCircumference: number;
  hipCircumference: number;
  triceps?: number;
  suprailiac?: number;
  thigh?: number;
  chest?: number;
  abdomen?: number;
}

interface CalculatedMetrics {
  bodyFatPercentage: number;
  fatMass: number;
  leanMass: number;
  muscleMass: number;
  bmi: number;
  bmr: number;
  waistToHeightRatio: number;
  waistToHipRatio: number;
  muscleToFatRatio: number;
  riskLevel: 'low' | 'moderate' | 'high';
}

const ProfessionalEvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    users,
    evaluations,
    loading,
    error,
    loadUsers,
    loadUserEvaluations,
    saveEvaluation,
    calculateMetricsFromHook
  } = useProfessionalEvaluation();

  // Estados
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [measurements, setMeasurements] = useState<Measurements>({
    weight: 0,
    abdominalCircumference: 0,
    waistCircumference: 0,
    hipCircumference: 0
  });
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics | null>(null);
  const [showNewEvaluation, setShowNewEvaluation] = useState(false);
  const [activeTab, setActiveTab] = useState('measurements');
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [showComparison, setShowComparison] = useState(false);
  const [evaluationsToCompare, setEvaluationsToCompare] = useState<any[]>([]);

  // Verificação de admin e carregamento de usuários
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('Usuário não autenticado');
          navigate('/auth');
          return;
        }

        console.log('Usuário autenticado:', user.email);

        // Verifica se é admin usando RPC seguro
        const { data: isUserAdmin, error: rpcError } = await supabase.rpc('is_admin_user');
        
        if (rpcError) {
          console.error('Erro ao verificar admin via RPC:', rpcError);
          // Fallback: verificar por email específico
          const isAdminFallback = user.email === 'v@gmail.com';
          if (!isAdminFallback) {
            navigate('/dashboard');
            return;
          }
          setIsAdmin(true);
          setIsLoading(false);
          // Carregar usuários após confirmar admin
          loadUsers();
          return;
        }

        console.log('É admin?', isUserAdmin);
        
        if (!isUserAdmin) {
          console.log('Usuário não é admin, redirecionando...');
          navigate('/dashboard');
          return;
        }

        console.log('Usuário é admin, permitindo acesso');
        setIsAdmin(true);
        // Carregar usuários após confirmar admin
        loadUsers();
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate, loadUsers]);

  // Carregar avaliações quando usuário é selecionado
  useEffect(() => {
    if (selectedUser) {
      const userId = selectedUser.user_id || selectedUser.id;
      if (userId) {
        loadUserEvaluations(userId);
      }
    }
  }, [selectedUser, loadUserEvaluations]);

  // Reset avaliação selecionada quando período mudar
  useEffect(() => {
    if (selectedEvaluation) {
      const filteredEvaluations = getFilteredEvaluations();
      const evaluationStillExists = filteredEvaluations.find(e => e.id === selectedEvaluation.id);
      if (!evaluationStillExists) {
        setSelectedEvaluation(null);
      }
    }
  }, [timeRange]);

  // Filtra avaliações baseadas no período selecionado
  const getFilteredEvaluations = () => {
    const allEvaluations = [...evaluations];
    const today = new Date();
    
    return allEvaluations.filter(evaluation => {
      const evalDate = new Date(evaluation.evaluation_date);
      const daysDiff = Math.floor((today.getTime() - evalDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (timeRange) {
        case 'week':
          return daysDiff <= 7;
        case 'month':
          return daysDiff <= 30;
        case 'quarter':
          return daysDiff <= 90;
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.evaluation_date).getTime() - new Date(a.evaluation_date).getTime());
  };

  // Dados para gráficos
  const getChartData = () => {
    const filteredEvaluations = getFilteredEvaluations();
    return filteredEvaluations.map(evaluation => ({
      date: new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR'),
      weight: evaluation.weight_kg,
      bodyFat: evaluation.body_fat_percentage,
      leanMass: evaluation.lean_mass_kg,
      muscleMass: evaluation.muscle_mass_kg,
      bmi: evaluation.bmi,
      waistRatio: evaluation.waist_to_height_ratio
    }));
  };

  // Calcula % de gordura usando Jackson & Pollock 3 dobras
  const calculateBodyFatPercentage = (user: UserProfile, measurements: Measurements): number => {
    let bodyDensity = 0;
    
    // Calcula idade a partir da data de nascimento
    const birthDate = user.birth_date ? new Date(user.birth_date) : new Date(1990, 0, 1);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const gender = user.gender || 'M';
    
    if (gender === 'M' || gender === 'male' || gender === 'masculino') {
      // Homens: Peitoral, Abdômen, Coxa
      const sumSkinfolds = (measurements.chest || 0) + (measurements.abdomen || 0) + (measurements.thigh || 0);
      bodyDensity = 1.10938 - (0.0008267 * sumSkinfolds) + (0.0000016 * sumSkinfolds * sumSkinfolds) - (0.0002574 * age);
    } else {
      // Mulheres: Tríceps, Supra-ilíaca, Coxa
      const sumSkinfolds = (measurements.triceps || 0) + (measurements.suprailiac || 0) + (measurements.thigh || 0);
      bodyDensity = 1.0994921 - (0.0009929 * sumSkinfolds) + (0.0000023 * sumSkinfolds * sumSkinfolds) - (0.0001392 * age);
    }
    
    // Fórmula de Siri
    const bodyFatPercentage = ((4.95 / bodyDensity) - 4.5) * 100;
    return Math.max(0, Math.min(50, bodyFatPercentage)); // Limita entre 0 e 50%
  };

  // Calcula TMB usando Mifflin-St Jeor
  const calculateBMR = (user: UserProfile, weight: number): number => {
    // Calcula idade a partir da data de nascimento
    const birthDate = user.birth_date ? new Date(user.birth_date) : new Date(1990, 0, 1);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const height = user.height_cm || 170; // Altura padrão se não informada
    const gender = user.gender || 'M';
    
    if (gender === 'M' || gender === 'male' || gender === 'masculino') {
      return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * height) - (5 * age) - 161;
    }
  };

  // Handler: Calcular métricas
  const handleCalculate = (): void => {
    if (!selectedUser || !measurements.weight) {
      console.log('Dados insuficientes para calcular métricas');
      return;
    }

    console.log('Calculando métricas para:', selectedUser.full_name);
    console.log('Medidas:', measurements);

    const bodyFatPercentage = calculateBodyFatPercentage(selectedUser, measurements);
    const fatMass = measurements.weight * (bodyFatPercentage / 100);
    const leanMass = measurements.weight - fatMass;
    const muscleMass = leanMass * 0.45; // Estimativa: 45% da massa magra é músculo
    const height = selectedUser.height_cm || 170; // Altura padrão se não informada
    const bmi = measurements.weight / Math.pow(height / 100, 2);
    const bmr = calculateBMR(selectedUser, measurements.weight);
    const waistToHeightRatio = measurements.waistCircumference / height;
    const waistToHipRatio = measurements.waistCircumference / measurements.hipCircumference;
    const muscleToFatRatio = muscleMass / fatMass;

    // Determina nível de risco
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (waistToHeightRatio > 0.6 || bmi > 30) {
      riskLevel = 'high';
    } else if (waistToHeightRatio > 0.5 || bmi > 25) {
      riskLevel = 'moderate';
    }

    const calculatedResults = {
      bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
      fatMass: Math.round(fatMass * 10) / 10,
      leanMass: Math.round(leanMass * 10) / 10,
      muscleMass: Math.round(muscleMass * 10) / 10,
      bmi: Math.round(bmi * 10) / 10,
      bmr: Math.round(bmr),
      waistToHeightRatio: Math.round(waistToHeightRatio * 100) / 100,
      waistToHipRatio: Math.round(waistToHipRatio * 100) / 100,
      muscleToFatRatio: Math.round(muscleToFatRatio * 100) / 100,
      riskLevel
    };

    console.log('Métricas calculadas:', calculatedResults);
    setCalculatedMetrics(calculatedResults);
    setActiveTab('results');
  };

  // Handler: Salvar avaliação
  const handleSave = async () => {
    if (!selectedUser || !calculatedMetrics) {
      console.error('Dados insuficientes para salvar');
      return;
    }

    const userId = selectedUser.user_id || selectedUser.id;
    if (!userId) {
      console.error('ID do usuário não encontrado');
      return;
    }

    try {
      await saveEvaluation({
        user_id: userId,
        evaluation_type: 'professional_assessment',
        evaluation_data: {
          measurements,
          calculatedMetrics,
          timestamp: new Date().toISOString()
        },
        notes: ''
      });
      console.log('Avaliação salva com sucesso');
      
      // Recarregar avaliações
      await loadUserEvaluations(userId);
      
      // Mudar para aba de histórico
      setActiveTab('history');
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    }
  };

  // Handler: Exportar PDF
  const handleExportPDF = () => {
    if (!selectedUser || !calculatedMetrics) {
      console.error('Dados insuficientes para exportar');
      return;
    }

    try {
      const height = selectedUser.height_cm || 170;
      const evaluationForPDF = {
        id: crypto.randomUUID(),
        user_id: selectedUser.user_id || selectedUser.id || '',
        evaluator_id: selectedUser.user_id || selectedUser.id || '',
        evaluation_type: 'professional_assessment',
        evaluation_data: { measurements, calculatedMetrics },
        created_at: new Date().toISOString(),
        evaluation_date: new Date().toISOString(),
        weight_kg: measurements.weight,
        height_cm: height,
        body_fat_percentage: calculatedMetrics.bodyFatPercentage,
        muscle_mass_kg: calculatedMetrics.muscleMass,
        lean_mass_kg: calculatedMetrics.leanMass,
        fat_mass_kg: calculatedMetrics.fatMass,
        bmi: calculatedMetrics.bmi,
        waist_circumference_cm: measurements.waistCircumference,
        hip_circumference_cm: measurements.hipCircumference,
        abdominal_circumference_cm: measurements.abdominalCircumference,
        waist_to_height_ratio: calculatedMetrics.waistToHeightRatio,
        waist_to_hip_ratio: calculatedMetrics.waistToHipRatio,
        risk_level: calculatedMetrics.riskLevel,
        bmr_kcal: calculatedMetrics.bmr,
        muscle_to_fat_ratio: calculatedMetrics.muscleToFatRatio,
      };
      exportEvaluationToPDF(selectedUser, evaluationForPDF);
      console.log('PDF exportado com sucesso');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    }
  };

  // Handler: Comparar avaliações
  const handleCompare = (evaluations: any[]) => {
    setEvaluationsToCompare(evaluations);
    setShowComparison(true);
    setActiveTab('charts');
  };

  // Handler: Selecionar usuário
  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    setCalculatedMetrics(null);
    setSelectedEvaluation(null);
    setMeasurements({
      weight: 0,
      abdominalCircumference: 0,
      waistCircumference: 0,
      hipCircumference: 0
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Não é admin
  if (!isAdmin) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            Erro ao carregar dados: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <EvaluationHeader
        users={users}
        selectedUser={selectedUser}
        onUserSelect={handleUserSelect}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onNewEvaluation={() => setShowNewEvaluation(true)}
        loading={loading}
      />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="measurements">Medidas</TabsTrigger>
          <TabsTrigger value="results">Resultados</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements" className="space-y-4">
          <MetricsForm
            measurements={measurements}
            onMeasurementsChange={setMeasurements}
            onCalculate={handleCalculate}
            disabled={!selectedUser}
          />
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <ResultsDisplay
            metrics={calculatedMetrics}
            onSave={handleSave}
            onExportPDF={handleExportPDF}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <EvaluationHistory
            evaluations={getFilteredEvaluations().map(ev => ({
              id: ev.id,
              user_id: ev.user_id,
              evaluation_date: ev.evaluation_date || ev.created_at,
              weight_kg: ev.weight_kg ?? 0,
              body_fat_percentage: ev.body_fat_percentage ?? 0,
              lean_mass_kg: ev.lean_mass_kg ?? 0,
              muscle_mass_kg: ev.muscle_mass_kg ?? 0,
              bmi: ev.bmi ?? 0,
              waist_to_height_ratio: ev.waist_to_height_ratio ?? 0,
              waist_to_hip_ratio: ev.waist_to_hip_ratio ?? 0,
              risk_level: (ev.risk_level as 'low' | 'moderate' | 'high') || 'low'
            }))}
            selectedEvaluation={selectedEvaluation}
            onEvaluationSelect={setSelectedEvaluation}
            onCompare={handleCompare}
            timeRange={timeRange}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <ChartsPanel
            chartData={getChartData()}
            selectedEvaluation={selectedEvaluation}
            showComparison={showComparison}
            evaluationsToCompare={evaluationsToCompare}
          />
        </TabsContent>
      </Tabs>

      {/* Modal: Nova Avaliação */}
      {showNewEvaluation && selectedUser && (
        <NewEvaluationWizard
          user={selectedUser}
          calculateMetrics={(u, m) => {
            const bodyFatPercentage = m.body_fat_percentage || 0;
            const weight = m.weight_kg || 0;
            const height = u.height_cm || 170;
            const fatMass = weight * (bodyFatPercentage / 100);
            const leanMass = weight - fatMass;
            const bmi = weight / Math.pow(height / 100, 2);
            const waistToHeightRatio = (m.waist_circumference_cm || 0) / height;
            const waistToHipRatio = (m.waist_circumference_cm || 0) / (m.hip_circumference_cm || 1);
            let riskLevel: 'low' | 'moderate' | 'high' = 'low';
            if (waistToHeightRatio > 0.6 || bmi > 30) riskLevel = 'high';
            else if (waistToHeightRatio > 0.5 || bmi > 25) riskLevel = 'moderate';
            return {
              body_fat_percentage: Math.round(bodyFatPercentage * 10) / 10,
              fat_mass_kg: Math.round(fatMass * 10) / 10,
              lean_mass_kg: Math.round(leanMass * 10) / 10,
              muscle_mass_kg: Math.round(leanMass * 0.45 * 10) / 10,
              bmi: Math.round(bmi * 10) / 10,
              waist_to_height_ratio: Math.round(waistToHeightRatio * 100) / 100,
              waist_to_hip_ratio: Math.round(waistToHipRatio * 100) / 100,
              risk_level: riskLevel
            };
          }}
          onPreview={(ev) => {
            setSelectedEvaluation(ev);
          }}
          onSave={async (ev) => {
            await saveEvaluation({
              user_id: ev.user_id,
              evaluation_type: 'professional_assessment',
              evaluation_data: ev,
            });
            setShowNewEvaluation(false);
            const userId = selectedUser.user_id || selectedUser.id;
            if (userId) await loadUserEvaluations(userId);
          }}
        />
      )}
    </div>
  );
};

export default ProfessionalEvaluationPage;
