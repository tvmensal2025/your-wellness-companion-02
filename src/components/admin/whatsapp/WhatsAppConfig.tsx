import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Settings,
  Clock,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

const WhatsAppConfig = () => {
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const { data: connectionStatus, refetch: checkConnection } = useQuery({
    queryKey: ["evolution-connection-status"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke("evolution-send-message", {
          body: { action: "checkConnection" }
        });
        
        if (error) throw error;
        return data;
      } catch (err) {
        return { connected: false, error: err };
      }
    }
  });

  const handleCheckConnection = async () => {
    setIsChecking(true);
    await checkConnection();
    setIsChecking(false);
    toast({
      title: connectionStatus?.connected ? "Conexão OK!" : "Falha na conexão",
      variant: connectionStatus?.connected ? "default" : "destructive"
    });
  };

  const cronJobs = [
    {
      name: "whatsapp-daily-motivation",
      schedule: "0 10 * * *",
      description: "Mensagem motivacional diária",
      time: "07:00 BRT (10:00 UTC)"
    },
    {
      name: "whatsapp-weekly-report",
      schedule: "0 12 * * 5",
      description: "Relatório semanal (sextas)",
      time: "09:00 BRT (12:00 UTC)"
    },
    {
      name: "whatsapp-smart-reminders",
      schedule: "0 13,17,21 * * *",
      description: "Lembretes de água, pesagem, missões",
      time: "10h, 14h, 18h BRT"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Status da Conexão Evolution API
          </CardTitle>
          <CardDescription>
            Verifique se a instância do WhatsApp está conectada e funcionando
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {connectionStatus?.connected ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
              <div>
                <p className="font-medium">
                  {connectionStatus?.connected ? "Conectado" : "Desconectado"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Instância: {connectionStatus?.instance || "dr-vita"}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleCheckConnection}
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Verificar
            </Button>
          </div>

          {!connectionStatus?.connected && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                A instância do WhatsApp não está conectada. Verifique o QR Code no painel da Evolution API.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">API URL</p>
              <p className="font-mono text-xs truncate">
                {connectionStatus?.apiUrl || "Configurado via secrets"}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">Instância</p>
              <p className="font-mono text-xs">
                {connectionStatus?.instance || "dr-vita"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cron Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Agendamentos Automáticos (Cron Jobs)
          </CardTitle>
          <CardDescription>
            Funções que são executadas automaticamente em horários definidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cronJobs.map((job) => (
              <div 
                key={job.name} 
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{job.description}</p>
                  <p className="text-sm text-muted-foreground">{job.time}</p>
                  <code className="text-xs text-muted-foreground font-mono">
                    {job.name}
                  </code>
                </div>
                <Badge variant="outline" className="font-mono">
                  {job.schedule}
                </Badge>
              </div>
            ))}
          </div>

          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Os cron jobs precisam ser configurados manualmente no Supabase. 
              Execute os comandos SQL na documentação para ativar os agendamentos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Secrets */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração de Secrets</CardTitle>
          <CardDescription>
            Variáveis de ambiente necessárias para o funcionamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: "EVOLUTION_API_URL", description: "URL da API Evolution" },
              { name: "EVOLUTION_API_KEY", description: "Chave de API Evolution" },
              { name: "EVOLUTION_INSTANCE", description: "Nome da instância (ex: dr-vita)" },
              { name: "LOVABLE_API_KEY", description: "Chave para IA Lovable (opcional)" },
            ].map((secret) => (
              <div 
                key={secret.name}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <code className="font-mono text-sm">{secret.name}</code>
                  <p className="text-xs text-muted-foreground">{secret.description}</p>
                </div>
                <Badge variant="secondary">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Configurado
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SQL for Cron Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>SQL para Configurar Cron Jobs</CardTitle>
          <CardDescription>
            Execute estes comandos no SQL Editor do Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg overflow-x-auto">
            <pre className="text-xs font-mono whitespace-pre-wrap">
{`-- Habilitar extensões
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Motivação Diária (07:00 BRT = 10:00 UTC)
SELECT cron.schedule(
  'whatsapp-daily-motivation',
  '0 10 * * *',
  $$
  SELECT net.http_post(
    url:='https://ciszqtlaacrhfwsqnvjr.supabase.co/functions/v1/whatsapp-daily-motivation',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpc3pxdGxhYWNyaGZ3c3FudmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODI0OTgsImV4cCI6MjA4MzA1ODQ5OH0.eyhrWnFzaGI3QWhXMEhRSnF1TGVSRk8tTDNIT2RqU0lyZ2pTRWdMTW8"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

-- Relatório Semanal (Sexta 09:00 BRT = 12:00 UTC)
SELECT cron.schedule(
  'whatsapp-weekly-report',
  '0 12 * * 5',
  $$
  SELECT net.http_post(
    url:='https://ciszqtlaacrhfwsqnvjr.supabase.co/functions/v1/whatsapp-weekly-report',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpc3pxdGxhYWNyaGZ3c3FudmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODI0OTgsImV4cCI6MjA4MzA1ODQ5OH0.eyhrWnFzaGI3QWhXMEhRSnF1TGVSRk8tTDNIT2RqU0lyZ2pTRWdMTW8"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);

-- Lembretes (10h, 14h, 18h BRT)
SELECT cron.schedule(
  'whatsapp-smart-reminders',
  '0 13,17,21 * * *',
  $$
  SELECT net.http_post(
    url:='https://ciszqtlaacrhfwsqnvjr.supabase.co/functions/v1/whatsapp-smart-reminders',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpc3pxdGxhYWNyaGZ3c3FudmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0ODI0OTgsImV4cCI6MjA4MzA1ODQ5OH0.eyhrWnFzaGI3QWhXMEhRSnF1TGVSRk8tTDNIT2RqU0lyZ2pTRWdMTW8"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppConfig;
