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

  const ensureValidSession = async (): Promise<boolean> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    if (!sessionData.session) {
      toast({
        title: "⚠️ Faça login",
        description: "Você precisa estar logado para conectar o Google Fit.",
        variant: "destructive",
      });
      return false;
    }

    // Valida se o access token atual está aceito pelo backend. Se não estiver, força refresh.
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        await supabase.auth.signOut();
        toast({
          title: "Sessão expirada",
          description: "Faça login novamente para continuar.",
          variant: "destructive",
        });
        return false;
      }

      const { data: userData2, error: userError2 } = await supabase.auth.getUser();
      if (userError2 || !userData2.user) {
        await supabase.auth.signOut();
        toast({
          title: "Sessão inválida",
          description: "Faça login novamente para continuar.",
          variant: "destructive",
        });
        return false;
      }
    }

    return true;
  };

  const connectGoogleFit = async () => {
    setIsLoading(true);
    try {
      const ok = await ensureValidSession();
      if (!ok) return;

      // Obter sessão atualizada para garantir token válido
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        toast({
          title: "⚠️ Sessão inválida",
          description: "Faça login novamente para conectar o Google Fit.",
          variant: "destructive",
        });
        return;
      }

      const invokeConnect = async () =>
        supabase.functions.invoke('google-fit-token', {
          body: { action: 'connect' },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

      let { data, error } = await invokeConnect();

      // Se o backend rejeitar o JWT (401), tenta renovar a sessão e repetir 1x.
      const status = (error as any)?.status;
      if (error && status === 401) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError) {
          const { data: newSession } = await supabase.auth.getSession();
          const newToken = newSession.session?.access_token;
          if (newToken) {
            ({ data, error } = await supabase.functions.invoke('google-fit-token', {
              body: { action: 'connect' },
              headers: { Authorization: `Bearer ${newToken}` },
            }));
          }
        }
      }

      if (error) {
        const finalStatus = (error as any)?.status;
        if (finalStatus === 401) {
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
      const ok = await ensureValidSession();
      if (!ok) return;

      // Obter sessão atualizada para garantir token válido
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        toast({
          title: "⚠️ Sessão inválida",
          description: "Faça login novamente para sincronizar.",
          variant: "destructive",
        });
        return;
      }

      const invokeSync = async () =>
        supabase.functions.invoke('google-fit-sync', {
          body: { action: 'sync' },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

      let { data, error } = await invokeSync();

      const status = (error as any)?.status;
      if (error && status === 401) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError) {
          const { data: newSession } = await supabase.auth.getSession();
          const newToken = newSession.session?.access_token;
          if (newToken) {
            ({ data, error } = await supabase.functions.invoke('google-fit-sync', {
              body: { action: 'sync' },
              headers: { Authorization: `Bearer ${newToken}` },
            }));
          }
        }
      }

      if (error) {
        const finalStatus = (error as any)?.status;
        if (finalStatus === 401) {
          await supabase.auth.signOut();
          toast({
            title: "Sessão expirada",
            description: "Faça login novamente para sincronizar.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      if (data?.success) {
        setFitData(data.fitData);
        toast({
          title: "✅ Sincronizado!",
          description: "Dados do Google Fit atualizados",
        });
      } else {
        toast({
          title: "❌ Erro",
          description: data?.error || "Falha na sincronização dos dados",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao sincronizar:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao sincronizar dados do Google Fit",
        variant: "destructive",
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
