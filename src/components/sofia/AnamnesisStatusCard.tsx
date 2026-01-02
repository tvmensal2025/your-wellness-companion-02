import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AnamnesisData {
  profession?: string;
  marital_status?: string;
  sleep_hours_per_night?: number;
  daily_stress_level?: string | null;
  physical_activity_frequency?: string;
  main_treatment_goals?: string;
  supplements?: any;
  chronic_diseases?: any;
  current_medications?: any;
  created_at?: string;
}

export const AnamnesisStatusCard: React.FC = () => {
  const [anamnesis, setAnamnesis] = useState<AnamnesisData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnamnesis();
  }, []);

  const fetchAnamnesis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_anamnesis')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setAnamnesis(data);
    } catch (error) {
      console.error('Erro ao buscar anamnese:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white shadow-sm border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!anamnesis) {
    return (
      <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Anamnese Pendente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Para receber recomendações personalizadas de suplementos e nutrição, 
            complete sua anamnese completa.
          </p>
          <Button 
            onClick={() => navigate('/anamnesis')}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            Preencher Anamnese
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-white to-emerald-50/30 shadow-md border border-emerald-100/50 hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500"></div>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-gray-900">
            <div className="p-1.5 bg-emerald-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            Anamnese Completa
          </CardTitle>
          <Badge variant="secondary" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm px-2.5 py-1">
            Ativo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {anamnesis.profession && (
            <div className="p-2.5 bg-white/60 rounded-lg border border-emerald-100 hover:bg-white transition-colors">
              <p className="text-muted-foreground text-xs font-medium mb-1">Profissão</p>
              <p className="font-semibold text-gray-900">{anamnesis.profession}</p>
            </div>
          )}
          {anamnesis.physical_activity_frequency && (
            <div className="p-2.5 bg-white/60 rounded-lg border border-emerald-100 hover:bg-white transition-colors">
              <p className="text-muted-foreground text-xs font-medium mb-1">Atividade Física</p>
              <p className="font-semibold text-gray-900">{anamnesis.physical_activity_frequency}</p>
            </div>
          )}
          {anamnesis.sleep_hours_per_night && (
            <div className="p-2.5 bg-white/60 rounded-lg border border-emerald-100 hover:bg-white transition-colors">
              <p className="text-muted-foreground text-xs font-medium mb-1">Horas de Sono</p>
              <p className="font-semibold text-gray-900">{anamnesis.sleep_hours_per_night}h por noite</p>
            </div>
          )}
          {anamnesis.daily_stress_level && (
            <div className="p-2.5 bg-white/60 rounded-lg border border-emerald-100 hover:bg-white transition-colors">
              <p className="text-muted-foreground text-xs font-medium mb-1">Nível de Estresse</p>
              <p className="font-semibold text-gray-900">{anamnesis.daily_stress_level}/10</p>
            </div>
          )}
        </div>

        {anamnesis.main_treatment_goals && (
          <div className="pt-3 border-t border-emerald-100">
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Objetivo Principal</p>
            <p className="text-sm font-semibold text-gray-900 bg-emerald-50/50 p-2 rounded-lg border border-emerald-100">{anamnesis.main_treatment_goals}</p>
          </div>
        )}

        {(anamnesis.supplements && Array.isArray(anamnesis.supplements) && anamnesis.supplements.length > 0) && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-2">Suplementos em Uso</p>
            <div className="flex flex-wrap gap-1">
              {anamnesis.supplements.map((sup: any, idx: number) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {String(sup)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={() => navigate('/anamnesis')}
          variant="outline"
          size="sm"
          className="w-full mt-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200 shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5 mr-2" />
          Ver/Editar Anamnese
        </Button>
      </CardContent>
    </Card>
  );
};
