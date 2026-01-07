import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, CheckCircle, XCircle, User } from "lucide-react";

const WhatsAppTestSend = () => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  // Fetch templates for selection
  const { data: templates } = useQuery({
    queryKey: ["whatsapp-templates-select"],
    queryFn: async () => {
      const { data } = await supabase
        .from("whatsapp_message_templates")
        .select("id, template_key, name, content")
        .eq("is_active", true)
        .order("name");
      return data;
    }
  });

  // Fetch users for selection
  const { data: users } = useQuery({
    queryKey: ["users-for-whatsapp"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name, phone")
        .not("phone", "is", null)
        .order("full_name")
        .limit(50);
      return data;
    }
  });

  const handleTemplateChange = (templateKey: string) => {
    setSelectedTemplate(templateKey);
    const template = templates?.find(t => t.template_key === templateKey);
    if (template) {
      setMessage(template.content);
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUser(userId);
    const user = users?.find(u => u.user_id === userId);
    if (user?.phone) {
      setPhone(user.phone);
    }
  };

  const handleSendTest = async () => {
    if (!phone || !message) {
      toast({ title: "Preencha telefone e mensagem", variant: "destructive" });
      return;
    }

    setIsSending(true);
    setLastResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("evolution-send-message", {
        body: {
          action: "sendText",
          phone: phone,
          message: message
        }
      });

      if (error) throw error;

      if (data?.success) {
        setLastResult({ success: true, message: "Mensagem enviada com sucesso!" });
        toast({ title: "Mensagem enviada!" });
      } else {
        throw new Error(data?.error || "Erro ao enviar");
      }
    } catch (error: any) {
      console.error("Erro ao enviar teste:", error);
      setLastResult({ success: false, message: error.message || "Falha no envio" });
      toast({ 
        title: "Erro ao enviar", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleTriggerFunction = async (functionName: string) => {
    if (!selectedUser) {
      toast({ title: "Selecione um usuário primeiro", variant: "destructive" });
      return;
    }

    setIsSending(true);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { userId: selectedUser }
      });

      if (error) throw error;

      toast({ 
        title: "Função executada!", 
        description: `${functionName} enviou ${data?.sent || 0} mensagem(ns)` 
      });
    } catch (error: any) {
      console.error(`Erro ao executar ${functionName}:`, error);
      toast({ 
        title: "Erro na execução", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Manual Test */}
      <Card>
        <CardHeader>
          <CardTitle>Teste Manual</CardTitle>
          <CardDescription>
            Envie uma mensagem de teste para qualquer número
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Selecionar Usuário (opcional)</Label>
            <Select value={selectedUser} onValueChange={handleUserChange}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um usuário..." />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.full_name} - {user.phone}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5511999999999"
            />
            <p className="text-xs text-muted-foreground">
              Formato: código do país + DDD + número (ex: 5511999999999)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Usar Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Mensagem Personalizada</SelectItem>
                {templates?.map((template) => (
                  <SelectItem key={template.id} value={template.template_key}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite a mensagem de teste..."
              rows={6}
            />
          </div>

          <Button 
            onClick={handleSendTest} 
            disabled={isSending || !phone || !message}
            className="w-full"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar Teste
          </Button>

          {lastResult && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              lastResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
            }`}>
              {lastResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              {lastResult.message}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Function Triggers */}
      <Card>
        <CardHeader>
          <CardTitle>Testar Funções Automáticas</CardTitle>
          <CardDescription>
            Execute as funções de WhatsApp para um usuário específico
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selectedUser && (
            <div className="p-4 bg-muted rounded-lg text-center text-sm text-muted-foreground">
              Selecione um usuário na seção ao lado para testar as funções
            </div>
          )}

          {selectedUser && (
            <>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Usuário selecionado: {users?.find(u => u.user_id === selectedUser)?.full_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {users?.find(u => u.user_id === selectedUser)?.phone}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleTriggerFunction("whatsapp-daily-motivation")}
                  disabled={isSending}
                >
                  🌅 Enviar Motivação Diária
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleTriggerFunction("whatsapp-weekly-report")}
                  disabled={isSending}
                >
                  📊 Enviar Relatório Semanal
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleTriggerFunction("whatsapp-smart-reminders")}
                  disabled={isSending}
                >
                  🔔 Enviar Lembretes Inteligentes
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleTriggerFunction("whatsapp-celebration")}
                  disabled={isSending}
                >
                  🎉 Enviar Celebração de Teste
                </Button>
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Variáveis de Teste</h4>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>• As funções usam dados reais do usuário selecionado</p>
              <p>• A IA personaliza as mensagens com o contexto atual</p>
              <p>• Verifique os logs após o envio para ver o resultado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppTestSend;
