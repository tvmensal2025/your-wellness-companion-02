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
import { Send, Loader2, CheckCircle, XCircle, User, MessageSquare } from "lucide-react";

const WhatsAppTestSend = () => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSendingButtons, setIsSendingButtons] = useState(false);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const [buttonResult, setButtonResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
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
      const { data, error } = await supabase.functions.invoke("whatsapp-nutrition-webhook", {
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

  const handleTestButtons = async () => {
    if (!phone) {
      toast({ title: "Informe o telefone", variant: "destructive" });
      return;
    }

    setIsSendingButtons(true);
    setButtonResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-test-buttons", {
        body: { phone }
      });

      if (error) throw error;

      if (data?.success) {
        setButtonResult({ 
          success: true, 
          message: "✅ Botões enviados via Whapi!",
          details: data.whapi_response 
        });
        toast({ title: "Mensagem com botões enviada!" });
      } else {
        throw new Error(data?.error || data?.tip || "Erro no Whapi");
      }
    } catch (error: any) {
      console.error("Erro ao enviar botões:", error);
      setButtonResult({ 
        success: false, 
        message: error.message || "Falha no envio",
        details: error 
      });
      toast({ 
        title: "Erro ao enviar botões", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsSendingButtons(false);
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
    <div className="space-y-6">
      {/* Interactive Buttons Test - Whapi */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Teste de Botões Interativos
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              Whapi
            </Badge>
          </CardTitle>
          <CardDescription>
            Envie uma mensagem com 3 botões clicáveis via Whapi para testar a integração
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview do template */}
          <div className="bg-background border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-lg">🔬</span>
              Teste Whapi
            </div>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-semibold">🧪 *TESTE DE BOTÕES WHAPI*</p>
              <p className="text-xs text-muted-foreground">
                Esta mensagem testa se os botões interativos estão funcionando.
              </p>
              <p className="text-xs text-muted-foreground">
                Clique em um botão abaixo:
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                ✅ Funciona!
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                🔄 Teste 2
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                ❌ Cancelar
              </Badge>
            </div>
            <p className="text-[10px] text-muted-foreground">MaxNutrition - Teste</p>
          </div>

          {/* Campo telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone-buttons">Telefone para Teste</Label>
            <Input
              id="phone-buttons"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="5511999999999"
            />
          </div>

          <Button 
            onClick={handleTestButtons} 
            disabled={isSendingButtons || !phone}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isSendingButtons ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar Teste com Botões
          </Button>

          {buttonResult && (
            <div className={`p-3 rounded-lg space-y-2 ${
              buttonResult.success ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"
            }`}>
              <div className="flex items-center gap-2">
                {buttonResult.success ? (
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 flex-shrink-0" />
                )}
                <span className="font-medium">{buttonResult.message}</span>
              </div>
              {buttonResult.details && (
                <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto">
                  {JSON.stringify(buttonResult.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Manual Test */}
        <Card>
          <CardHeader>
            <CardTitle>Teste Manual</CardTitle>
            <CardDescription>
              Envie uma mensagem de texto simples para qualquer número
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
    </div>
  );
};

export default WhatsAppTestSend;
