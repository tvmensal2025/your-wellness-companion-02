import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Calendar,
  TrendingUp,
  BarChart3,
  Eye,
  Award,
  Activity,
  Clock,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryResponse {
  id: string;
  user_id: string;
  date: string;
  section: string;
  question_id: string;
  answer: string;
  text_response?: string;
  points_earned: number;
  session_attempt_id?: string;
  created_at: string;
}

interface EvolutionHistoryProps {
  userId: string;
}

export function EvolutionHistory({ userId }: EvolutionHistoryProps) {
  const [responses, setResponses] = useState<HistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar histórico de respostas
  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('daily_responses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResponses(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Agrupar respostas por data
  const responsesByDate = responses.reduce((acc, response) => {
    const date = response.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(response);
    return acc;
  }, {} as Record<string, HistoryResponse[]>);

  // Agrupar respostas por seção
  const responsesBySection = responses.reduce((acc, response) => {
    const section = response.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(response);
    return acc;
  }, {} as Record<string, HistoryResponse[]>);

  // Calcular estatísticas
  const stats = {
    totalResponses: responses.length,
    totalPoints: responses.reduce((sum, r) => sum + r.points_earned, 0),
    sectionsCompleted: Object.keys(responsesBySection).length,
    daysActive: Object.keys(responsesByDate).length,
    lastActivity: responses.length > 0 ? responses[0].created_at : null
  };

  // Filtrar respostas com base nas seleções
  const filteredResponses = responses.filter(response => {
    if (selectedSection && response.section !== selectedSection) return false;
    if (selectedDate && response.date !== selectedDate) return false;
    return true;
  });

  const sectionColors: Record<string, string> = {
    morning: 'bg-orange-500',
    habits: 'bg-green-500',
    mindset: 'bg-blue-500',
    sessions: 'bg-purple-500',
    health_wheel: 'bg-red-500',
    life_wheel: 'bg-indigo-500'
  };

  const getSectionName = (section: string) => {
    const names: Record<string, string> = {
      morning: 'Manhã',
      habits: 'Hábitos',
      mindset: 'Mindset',
      sessions: 'Sessões',
      health_wheel: 'Roda da Saúde',
      life_wheel: 'Roda da Vida'
    };
    return names[section] || section;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Estatísticas Gerais - Mobile Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Respostas</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.totalResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Pontos</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Seções</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.sectionsCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-sm text-muted-foreground truncate">Dias</p>
                <p className="text-lg sm:text-2xl font-bold">{stats.daysActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros - Mobile Optimized */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0 space-y-3">
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-1.5 sm:gap-2 pb-2 sm:pb-0 sm:flex-wrap min-w-max sm:min-w-0">
              <Button
                variant={selectedSection === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSection(null)}
                className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 flex-shrink-0"
              >
                Todas
              </Button>
              {Object.keys(responsesBySection).map(section => (
                <Button
                  key={section}
                  variant={selectedSection === section ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSection(section)}
                  className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 flex-shrink-0"
                >
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 ${sectionColors[section] || 'bg-gray-500'}`} />
                  {getSectionName(section)} <span className="hidden sm:inline ml-1">({responsesBySection[section].length})</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex gap-1.5 sm:gap-2 pb-2 sm:pb-0 sm:flex-wrap min-w-max sm:min-w-0">
              <Button
                variant={selectedDate === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(null)}
                className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 flex-shrink-0"
              >
                Todas Datas
              </Button>
              {Object.keys(responsesByDate).slice(0, 7).map(date => (
                <Button
                  key={date}
                  variant={selectedDate === date ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(date)}
                  className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 flex-shrink-0"
                >
                  {format(new Date(date), 'dd/MM', { locale: ptBR })}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Respostas - Mobile Optimized */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Histórico ({filteredResponses.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-3 sm:space-y-4">
            {filteredResponses.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Eye className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                <p className="text-xs sm:text-sm">Nenhuma resposta encontrada</p>
              </div>
            ) : (
              filteredResponses.map((response, index) => (
                <div key={response.id} className="border rounded-lg p-3 sm:p-4 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <Badge 
                        variant="secondary" 
                        className={`${sectionColors[response.section] || 'bg-gray-500'} text-white text-[10px] sm:text-xs`}
                      >
                        {getSectionName(response.section)}
                      </Badge>
                      <span className="text-[10px] sm:text-sm text-muted-foreground">
                        {format(new Date(response.created_at), 'dd/MM HH:mm', { locale: ptBR })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-500" />
                      <span className="text-xs sm:text-sm font-semibold">+{response.points_earned}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-medium truncate">Pergunta: {response.question_id}</p>
                    <p className="text-xs sm:text-sm">Resposta: <span className="font-semibold">{response.answer}</span></p>
                    {response.text_response && (
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2">{response.text_response}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}