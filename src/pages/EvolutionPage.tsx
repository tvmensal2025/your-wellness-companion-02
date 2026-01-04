import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EvolutionHistory } from '@/components/user-history/EvolutionHistory';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, TrendingUp, User } from 'lucide-react';

export default function EvolutionPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);

      // Carregar perfil do usuário
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setProfile(profileData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Mobile Optimized */}
      <div className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="px-2 sm:px-3 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Voltar</span>
              </Button>
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                <h1 className="text-lg sm:text-2xl font-bold truncate">Minha Evolução</h1>
              </div>
            </div>
            
            {profile && (
              <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px]">
                  {profile.full_name || user.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal - Mobile Optimized */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24">
        <div className="mb-4 sm:mb-6">
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                Acompanhe Sua Jornada
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
              <p className="text-xs sm:text-sm text-muted-foreground">
                Visualize o histórico das suas respostas e atividades. 
                Use os filtros para explorar por seção ou data.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Componente de Histórico */}
        <EvolutionHistory userId={user.id} />
      </div>
    </div>
  );
}