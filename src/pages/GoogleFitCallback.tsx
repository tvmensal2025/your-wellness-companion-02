import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, ArrowRight, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type CallbackStatus = 'loading' | 'success' | 'error';

export const GoogleFitCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState<string>('Processando autorização do Google Fit...');

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    document.title = 'Conectando Google Fit | Instituto dos Sonhos';

    const run = async () => {
      const code = params.get('code');
      const error = params.get('error');
      const state = params.get('state');

      if (error) {
        setStatus('error');
        setMessage(`Erro do Google: ${error}`);
        toast({
          title: '❌ Não foi possível conectar',
          description: `Erro do Google: ${error}`,
          variant: 'destructive',
        });
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('Código de autorização não encontrado.');
        return;
      }

      // A URI DE REDIRECIONAMENTO PRECISA SER A MESMA USADA NA AUTORIZAÇÃO.
      let redirectUri = `${window.location.origin}/google-fit-callback`;
      if (state) {
        try {
          const decoded = JSON.parse(decodeURIComponent(state));
          if (decoded?.redirectUri && typeof decoded.redirectUri === 'string') {
            redirectUri = decoded.redirectUri;
          }
        } catch {
          // ignore
        }
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          throw new Error('Você precisa estar logado para concluir a conexão.');
        }

        const { data, error: fnError } = await supabase.functions.invoke('google-fit-token', {
          body: { code, redirect_uri: redirectUri },
        });

        if (fnError) throw fnError;
        if (!data?.success) throw new Error(data?.error || 'Falha ao salvar tokens.');

        setStatus('success');
        setMessage('Google Fit conectado com sucesso!');
        toast({
          title: '✅ Google Fit conectado',
          description: 'Conexão concluída. Você já pode sincronizar seus dados.',
        });

        // Vai para o dashboard após concluir
        setTimeout(() => {
          navigate('/dashboard?tab=progress', { replace: true });
        }, 1200);
      } catch (e: any) {
        console.error('❌ Erro ao finalizar conexão Google Fit:', e);
        setStatus('error');
        setMessage(e?.message || 'Erro ao finalizar a conexão.');
        toast({
          title: '❌ Erro ao conectar Google Fit',
          description: e?.message || 'Tente novamente.',
          variant: 'destructive',
        });
      }
    };

    run();
  }, [navigate, params, toast]);

  const isLoading = status === 'loading';
  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            {isSuccess ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : status === 'error' ? (
              <XCircle className="w-8 h-8 text-destructive" />
            ) : (
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl text-gray-900">
            {isSuccess ? 'Google Fit Conectado!' : status === 'error' ? 'Falha na Conexão' : 'Conectando...'}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          {isLoading && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Finalizando autorização...</span>
            </div>
          )}

          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Ir para o Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
