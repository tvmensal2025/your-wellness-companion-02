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
  daily_stress_level?: number;
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
    <Card className="bg-white shadow-sm border-0">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Anamnese Completa
          </CardTitle>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
            Ativo
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          {anamnesis.profession && (
            <div>
              <p className="text-muted-foreground text-xs">Profissão</p>
              <p className="font-medium">{anamnesis.profession}</p>
            </div>
          )}
          {anamnesis.physical_activity_frequency && (
            <div>
              <p className="text-muted-foreground text-xs">Atividade Física</p>
              <p className="font-medium">{anamnesis.physical_activity_frequency}</p>
            </div>
          )}
          {anamnesis.sleep_hours_per_night && (
            <div>
              <p className="text-muted-foreground text-xs">Horas de Sono</p>
              <p className="font-medium">{anamnesis.sleep_hours_per_night}h por noite</p>
            </div>
          )}
          {anamnesis.daily_stress_level && (
            <div>
              <p className="text-muted-foreground text-xs">Nível de Estresse</p>
              <p className="font-medium">{anamnesis.daily_stress_level}/10</p>
            </div>
          )}
        </div>

        {anamnesis.main_treatment_goals && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Objetivo Principal</p>
            <p className="text-sm">{anamnesis.main_treatment_goals}</p>
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
          className="w-full mt-2"
        >
          <ExternalLink className="w-3 h-3 mr-2" />
          Ver/Editar Anamnese
        </Button>
      </CardContent>
    </Card>
  );
};
