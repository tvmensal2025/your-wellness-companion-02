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
import { 
  Send, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  User, 
  MessageSquare, 
  Zap, 
  List, 
  Link, 
  Phone as PhoneIcon, 
  Copy,
  Webhook
} from "lucide-react";

interface ButtonType {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  hasWebhook: boolean;
  preview: React.ReactNode;
}

const WhatsAppTestSend = () => {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ success: boolean; message: string } | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; details?: any }>>({});
  const { toast } = useToast();

  // Button types configuration
  const buttonTypes: ButtonType[] = [
    {
      id: "quick_reply",
      name: "Quick Reply",
      description: "Até 3 botões de resposta rápida",
      icon: <Zap className="h-5 w-5" />,
      hasWebhook: true,
      preview: (
        <div className="bg-[#1f2c34] rounded-lg p-3 text-white text-sm space-y-2">
          <p className="font-medium">⚡ Resposta Rápida</p>
          <p className="text-xs text-gray-300">Escolha uma das opções:</p>
          <div className="space-y-1.5 pt-1">
            <div className="w-full py-1.5 text-center text-xs border border-[#00a884] text-[#00a884] rounded">
              ✅ Confirmar
            </div>
            <div className="w-full py-1.5 text-center text-xs border border-[#00a884] text-[#00a884] rounded">
              ✏️ Corrigir
            </div>
            <div className="w-full py-1.5 text-center text-xs border border-[#00a884] text-[#00a884] rounded">
              ❌ Cancelar
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "list",
      name: "Lista Menu",
      description: "Menu expansível com seções",
      icon: <List className="h-5 w-5" />,
      hasWebhook: true,
      preview: (
        <div className="bg-[#1f2c34] rounded-lg p-3 text-white text-sm space-y-2">
          <p className="font-medium">📋 Menu de Opções</p>
          <p className="text-xs text-gray-300">Clique para ver as opções:</p>
          <div className="pt-1">
            <div className="w-full py-2 text-center text-xs bg-[#00a884] text-white rounded flex items-center justify-center gap-2">
              <List className="h-3 w-3" />
              Ver Opções
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "url",
      name: "Botão URL",
      description: "Abre link externo no navegador",
      icon: <Link className="h-5 w-5" />,
      hasWebhook: false,
      preview: (
        <div className="bg-[#1f2c34] rounded-lg p-3 text-white text-sm space-y-2">
          <p className="font-medium">🔗 Link Externo</p>
          <p className="text-xs text-gray-300">Acesse nosso site:</p>
          <div className="pt-1">
            <div className="w-full py-1.5 text-center text-xs border border-[#00a884] text-[#00a884] rounded flex items-center justify-center gap-1">
              🌐 Acessar Site
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "call",
      name: "Botão Ligação",
      description: "Inicia chamada telefônica",
      icon: <PhoneIcon className="h-5 w-5" />,
      hasWebhook: false,
      preview: (
        <div className="bg-[#1f2c34] rounded-lg p-3 text-white text-sm space-y-2">
          <p className="font-medium">📞 Ligação</p>
          <p className="text-xs text-gray-300">Precisa de ajuda?</p>
          <div className="pt-1">
            <div className="w-full py-1.5 text-center text-xs border border-[#00a884] text-[#00a884] rounded flex items-center justify-center gap-1">
              📞 Ligar Agora
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "copy",
      name: "Botão Copiar",
      description: "Copia código para clipboard",
      icon: <Copy className="h-5 w-5" />,
      hasWebhook: false,
      preview: (
        <div className="bg-[#1f2c34] rounded-lg p-3 text-white text-sm space-y-2">
          <p className="font-medium">📋 Copiar Código</p>
          <p className="text-xs text-gray-300">Código: <span className="font-mono">MAX2024</span></p>
          <div className="pt-1">
            <div className="w-full py-1.5 text-center text-xs border border-[#00a884] text-[#00a884] rounded flex items-center justify-center gap-1">
              📋 Copiar Código
            </div>
          </div>
        </div>
      ),
    },
  ];

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

  const handleSendInteractiveTest = async (type: string) => {
    if (!phone) {
      toast({ title: "Informe o telefone", variant: "destructive" });
      return;
    }

    setLoadingType(type);
    setTestResults(prev => ({ ...prev, [type]: undefined as any }));

    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-test-interactive", {
        body: { phone, type }
      });

      if (error) throw error;

      if (data?.success) {
        setTestResults(prev => ({ 
          ...prev, 
          [type]: { 
            success: true, 
            message: data.message || "✅ Enviado!",
            details: data.whapi_response 
          } 
        }));
        toast({ title: `Teste ${type} enviado!` });
      } else {
        throw new Error(data?.error || data?.tip || "Erro no envio");
      }
    } catch (error: any) {
      console.error(`Erro ao enviar ${type}:`, error);
      setTestResults(prev => ({ 
        ...prev, 
        [type]: { 
          success: false, 
          message: error.message || "Falha no envio",
          details: error 
        } 
      }));
      toast({ 
        title: `Erro no teste ${type}`, 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoadingType(null);
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
      {/* Interactive Buttons Test Section */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-green-600" />
            Teste de Mensagens Interativas
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              Whapi
            </Badge>
          </CardTitle>
          <CardDescription>
            Teste os 5 tipos de botões interativos disponíveis no WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Shared Phone Input */}
          <div className="space-y-2">
            <Label htmlFor="phone-interactive" className="flex items-center gap-2">
              <PhoneIcon className="h-4 w-4" />
              Telefone para Teste
            </Label>
            <div className="flex gap-2">
              <Input
                id="phone-interactive"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="5511999999999"
                className="flex-1"
              />
              <Select value={selectedUser} onValueChange={handleUserChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Ou selecione usuário..." />
                </SelectTrigger>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {user.full_name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Button Types Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {buttonTypes.map((buttonType) => (
              <Card key={buttonType.id} className="relative overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-green-100 text-green-700">
                        {buttonType.icon}
                      </div>
                      <div>
                        <CardTitle className="text-base">{buttonType.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {buttonType.description}
                        </CardDescription>
                      </div>
                    </div>
                    {buttonType.hasWebhook ? (
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300 text-[10px]">
                        <Webhook className="h-3 w-3 mr-1" />
                        Webhook
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        Sem Callback
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Preview */}
                  <div className="rounded-lg overflow-hidden">
                    {buttonType.preview}
                  </div>

                  {/* Send Button */}
                  <Button
                    onClick={() => handleSendInteractiveTest(buttonType.id)}
                    disabled={loadingType !== null || !phone}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    {loadingType === buttonType.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Enviar Teste
                  </Button>

                  {/* Result */}
                  {testResults[buttonType.id] && (
                    <div className={`p-2 rounded-lg text-xs ${
                      testResults[buttonType.id].success 
                        ? "bg-green-50 text-green-800 border border-green-200" 
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      <div className="flex items-center gap-1.5">
                        {testResults[buttonType.id].success ? (
                          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 flex-shrink-0" />
                        )}
                        <span className="font-medium truncate">
                          {testResults[buttonType.id].message}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Manual Test */}
        <Card>
          <CardHeader>
            <CardTitle>Teste Manual de Texto</CardTitle>
            <CardDescription>
              Envie uma mensagem de texto simples para qualquer número
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                rows={4}
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
              Enviar Texto
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
                Selecione um usuário no campo acima para testar as funções
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppTestSend;
