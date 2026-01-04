import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GoogleFitData {
  steps: number;
  calories: number;
  activeMinutes: number;
  sleep: number;
  heartRate: {
    min: number;
    avg: number;
    max: number;
  };
}

export const useGoogleFit = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fitData, setFitData] = useState<GoogleFitData | null>(null);
  const { toast } = useToast();

  const checkConnectionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profileError) {
          console.error('❌ Erro ao buscar profile:', profileError);
          setIsConnected(false);
          return;
        }
        
        // Verificar se o campo google_fit_enabled existe e está true
        // Usando type assertion pois o campo existe na tabela mas não está nos tipos
        const profileWithGoogleFit = profile as any;
        if (profileWithGoogleFit && profileWithGoogleFit.google_fit_enabled) {
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
      } else {
        setIsConnected(false);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      setIsConnected(false);
    }
  };

  const connectGoogleFit = async () => {
    setIsLoading(true);
    try {
      // Garantir sessão válida (evita 401 por token expirado)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const session = sessionData.session;
      if (!session) {
        toast({
          title: "❌ Erro de autenticação",
          description: "Por favor, faça login primeiro",
          variant: "destructive",
        });
        return;
      }

      // Se estiver perto de expirar, tenta renovar
      if (session.expires_at && session.expires_at * 1000 < Date.now() + 60_000) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) throw refreshError;
      }

      // Chamar função do backend (o client injeta Authorization automaticamente quando logado)
      const { data, error } = await supabase.functions.invoke('google-fit-token', {
        body: { action: 'connect' },
      });

      if (error) {
        const status = (error as any)?.status;
        if (status === 401) {
          await supabase.auth.signOut();
          toast({
            title: "Sessão expirada",
            description: "Faça login novamente para conectar o Google Fit.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      if (data?.authUrl) {
        console.log('🔗 Redirecionando para autorização Google Fit...');
        window.location.href = data.authUrl;
      } else {
        toast({
          title: "❌ Erro",
          description: "Não foi possível obter a URL de autorização do Google Fit",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao conectar Google Fit:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao conectar com Google Fit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGoogleFit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Atualizar profile para desabilitar Google Fit
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ google_fit_enabled: false } as any)
          .eq('user_id', user.id);
        
        if (updateError) {
          console.error('❌ Erro ao atualizar profile:', updateError);
          toast({
            title: "❌ Erro",
            description: "Erro ao desconectar Google Fit",
            variant: "destructive"
          });
          return;
        }
        
        // Remover tokens do Google Fit
        const { error: deleteError } = await supabase
          .from('google_fit_tokens')
          .delete()
          .eq('user_id', user.id);
        
        if (deleteError) {
          console.error('❌ Erro ao remover tokens:', deleteError);
        }
        
        setIsConnected(false);
        toast({
          title: "✅ Desconectado",
          description: "Google Fit desconectado com sucesso"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao desconectar Google Fit",
        variant: "destructive"
      });
    }
  };

  const syncGoogleFitData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-fit-sync', {
        body: { action: 'sync' }
      });

      if (error) {
        console.error('❌ Erro na Edge Function sync:', error);
        throw error;
      }

      if (data?.success) {
        setFitData(data.fitData);
        toast({
          title: "✅ Sincronizado!",
          description: "Dados do Google Fit atualizados"
        });
      } else {
        console.error('❌ Sincronização falhou:', data);
        toast({
          title: "❌ Erro",
          description: "Falha na sincronização dos dados",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao sincronizar dados do Google Fit",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isConnected,
    isLoading,
    fitData,
    connectGoogleFit,
    disconnectGoogleFit,
    syncGoogleFitData,
    checkConnectionStatus
  };
};
