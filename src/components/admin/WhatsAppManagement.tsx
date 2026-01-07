import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Settings, 
  Send,
  RefreshCw,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WhatsAppDashboard from "./whatsapp/WhatsAppDashboard";
import WhatsAppTemplates from "./whatsapp/WhatsAppTemplates";
import WhatsAppLogs from "./whatsapp/WhatsAppLogs";
import WhatsAppTestSend from "./whatsapp/WhatsAppTestSend";
import WhatsAppConfig from "./whatsapp/WhatsAppConfig";

const WhatsAppManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "disconnected">("checking");
  const { toast } = useToast();

  // Check Evolution API connection
  const { refetch: checkConnection } = useQuery({
    queryKey: ["evolution-connection"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke("evolution-send-message", {
          body: { action: "checkConnection" }
        });
        
        if (error) throw error;
        setConnectionStatus(data?.connected ? "connected" : "disconnected");
        return data;
      } catch (err) {
        setConnectionStatus("disconnected");
        return null;
      }
    },
    refetchInterval: 60000, // Check every minute
  });

  // Fetch stats for header
  const { data: stats } = useQuery({
    queryKey: ["whatsapp-stats"],
    queryFn: async () => {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const startOfWeek = new Date(today.setDate(today.getDate() - 7)).toISOString();
      
      const { count: todayCount } = await supabase
        .from("whatsapp_evolution_logs")
        .select("*", { count: "exact", head: true })
        .gte("sent_at", startOfDay);

      const { count: weekCount } = await supabase
        .from("whatsapp_evolution_logs")
        .select("*", { count: "exact", head: true })
        .gte("sent_at", startOfWeek);

      const { count: sentCount } = await supabase
        .from("whatsapp_evolution_logs")
        .select("*", { count: "exact", head: true })
        .eq("status", "sent")
        .gte("sent_at", startOfWeek);

      const { count: failedCount } = await supabase
        .from("whatsapp_evolution_logs")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed")
        .gte("sent_at", startOfWeek);

      return {
        today: todayCount || 0,
        week: weekCount || 0,
        sent: sentCount || 0,
        failed: failedCount || 0,
        deliveryRate: weekCount ? Math.round((sentCount || 0) / weekCount * 100) : 0
      };
    }
  });

  const handleRefreshConnection = async () => {
    setConnectionStatus("checking");
    await checkConnection();
    toast({
      title: "Conexão verificada",
      description: connectionStatus === "connected" ? "Evolution API conectada!" : "Falha na conexão"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-green-500" />
            WhatsApp Evolution API
          </h1>
          <p className="text-muted-foreground">
            Gerencie mensagens, templates e automações de WhatsApp
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={connectionStatus === "connected" ? "default" : connectionStatus === "checking" ? "secondary" : "destructive"}
            className="flex items-center gap-1"
          >
            {connectionStatus === "connected" && <CheckCircle className="h-3 w-3" />}
            {connectionStatus === "disconnected" && <XCircle className="h-3 w-3" />}
            {connectionStatus === "checking" && <RefreshCw className="h-3 w-3 animate-spin" />}
            {connectionStatus === "connected" ? "Conectado" : connectionStatus === "checking" ? "Verificando..." : "Desconectado"}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefreshConnection}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{stats?.today || 0}</p>
              </div>
              <Send className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Semana</p>
                <p className="text-2xl font-bold">{stats?.week || 0}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Entrega</p>
                <p className="text-2xl font-bold">{stats?.deliveryRate || 0}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Falhas</p>
                <p className="text-2xl font-bold text-red-500">{stats?.failed || 0}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-1">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-1">
            <Send className="h-4 w-4" />
            Teste
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-1">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="mt-4">
          <WhatsAppDashboard />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <WhatsAppTemplates />
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <WhatsAppLogs />
        </TabsContent>

        <TabsContent value="test" className="mt-4">
          <WhatsAppTestSend />
        </TabsContent>

        <TabsContent value="config" className="mt-4">
          <WhatsAppConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppManagement;
