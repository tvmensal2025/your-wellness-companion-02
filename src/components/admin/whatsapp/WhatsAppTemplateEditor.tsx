import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Sparkles, Wand2, Loader2 } from "lucide-react";

interface Template {
  id: string;
  template_key: string;
  name: string;
  description: string | null;
  category: string;
  content: string;
  variables: any;
  is_active: boolean;
  use_ai_enhancement: boolean;
  ai_prompt: string | null;
  schedule_time: string | null;
  schedule_days: number[] | null;
}

interface Props {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_VARIABLES = [
  { key: "nome", description: "Nome do usuário" },
  { key: "email", description: "Email do usuário" },
  { key: "telefone", description: "Telefone do usuário" },
  { key: "peso", description: "Peso atual" },
  { key: "streak", description: "Dias consecutivos" },
  { key: "pontos", description: "Total de pontos" },
  { key: "missoes", description: "Lista de missões" },
  { key: "missoes_pendentes", description: "Missões não completadas" },
  { key: "progresso", description: "Percentual de progresso" },
  { key: "conquista", description: "Nome da conquista" },
  { key: "meta", description: "Nome da meta" },
  { key: "mensagem_motivacional", description: "Gerada por IA" },
  { key: "analise_semanal", description: "Análise do Dr. Vital" },
  { key: "recomendacoes", description: "Recomendações personalizadas" },
];

const WhatsAppTemplateEditor = ({ template, isOpen, onClose }: Props) => {
  const [formData, setFormData] = useState({
    template_key: "",
    name: "",
    description: "",
    category: "engagement",
    content: "",
    variables: [] as string[],
    is_active: true,
    use_ai_enhancement: false,
    ai_prompt: "",
    schedule_time: "",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (template) {
      setFormData({
        template_key: template.template_key,
        name: template.name,
        description: template.description || "",
        category: template.category,
        content: template.content,
        variables: Array.isArray(template.variables) ? template.variables : [],
        is_active: template.is_active,
        use_ai_enhancement: template.use_ai_enhancement,
        ai_prompt: template.ai_prompt || "",
        schedule_time: template.schedule_time || "",
      });
    } else {
      setFormData({
        template_key: "",
        name: "",
        description: "",
        category: "engagement",
        content: "",
        variables: [],
        is_active: true,
        use_ai_enhancement: false,
        ai_prompt: "",
        schedule_time: "",
      });
    }
  }, [template, isOpen]);

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById("content-textarea") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = 
        formData.content.substring(0, start) + 
        `{{${variable}}}` + 
        formData.content.substring(end);
      
      setFormData(prev => ({ ...prev, content: newContent }));
      
      // Add to variables list if not already there
      if (!formData.variables.includes(variable)) {
        setFormData(prev => ({ 
          ...prev, 
          variables: [...prev.variables, variable] 
        }));
      }
    }
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-generate-template", {
        body: {
          action: "generate",
          category: formData.category,
          name: formData.name,
          description: formData.description,
          existingPrompt: formData.ai_prompt,
        }
      });

      if (error) throw error;

      if (data?.content) {
        setFormData(prev => ({ ...prev, content: data.content }));
        toast({ title: "Template gerado com sucesso!" });
      }
    } catch (error) {
      console.error("Erro ao gerar template:", error);
      toast({ 
        title: "Erro ao gerar template", 
        variant: "destructive" 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImproveWithAI = async () => {
    if (!formData.content) {
      toast({ title: "Adicione um conteúdo primeiro", variant: "destructive" });
      return;
    }

    setIsImproving(true);
    try {
      const { data, error } = await supabase.functions.invoke("whatsapp-generate-template", {
        body: {
          action: "improve",
          content: formData.content,
          category: formData.category,
        }
      });

      if (error) throw error;

      if (data?.content) {
        setFormData(prev => ({ ...prev, content: data.content }));
        toast({ title: "Template melhorado com sucesso!" });
      }
    } catch (error) {
      console.error("Erro ao melhorar template:", error);
      toast({ 
        title: "Erro ao melhorar template", 
        variant: "destructive" 
      });
    } finally {
      setIsImproving(false);
    }
  };

  const handleSave = async () => {
    if (!formData.template_key || !formData.name || !formData.content) {
      toast({ title: "Preencha todos os campos obrigatórios", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    try {
      if (template) {
        const { error } = await supabase
          .from("whatsapp_message_templates")
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            content: formData.content,
            variables: formData.variables,
            is_active: formData.is_active,
            use_ai_enhancement: formData.use_ai_enhancement,
            ai_prompt: formData.ai_prompt || null,
            schedule_time: formData.schedule_time || null,
          })
          .eq("id", template.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("whatsapp_message_templates")
          .insert({
            template_key: formData.template_key,
            name: formData.name,
            description: formData.description,
            category: formData.category,
            content: formData.content,
            variables: formData.variables,
            is_active: formData.is_active,
            use_ai_enhancement: formData.use_ai_enhancement,
            ai_prompt: formData.ai_prompt || null,
            schedule_time: formData.schedule_time || null,
          });

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast({ title: template ? "Template atualizado!" : "Template criado!" });
      onClose();
    } catch (error: any) {
      console.error("Erro ao salvar template:", error);
      toast({ 
        title: "Erro ao salvar", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? `Editar: ${template.name}` : "Novo Template"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template_key">Chave do Template *</Label>
              <Input
                id="template_key"
                value={formData.template_key}
                onChange={(e) => setFormData(prev => ({ ...prev, template_key: e.target.value }))}
                placeholder="welcome, daily_motivation..."
                disabled={!!template}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Mensagem de Boas-vindas"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="onboarding">Onboarding</SelectItem>
                  <SelectItem value="engagement">Engajamento</SelectItem>
                  <SelectItem value="report">Relatórios</SelectItem>
                  <SelectItem value="reminder">Lembretes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule_time">Horário de Envio</Label>
              <Input
                id="schedule_time"
                type="time"
                value={formData.schedule_time}
                onChange={(e) => setFormData(prev => ({ ...prev, schedule_time: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Quando esta mensagem é enviada..."
            />
          </div>

          {/* Variables */}
          <div className="space-y-2">
            <Label>Variáveis Disponíveis</Label>
            <div className="flex flex-wrap gap-1">
              {AVAILABLE_VARIABLES.map((v) => (
                <Badge
                  key={v.key}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10"
                  onClick={() => insertVariable(v.key)}
                  title={v.description}
                >
                  {`{{${v.key}}}`}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content-textarea">Conteúdo da Mensagem *</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateWithAI}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  Gerar com IA
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImproveWithAI}
                  disabled={isImproving || !formData.content}
                >
                  {isImproving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Wand2 className="h-4 w-4 mr-1" />
                  )}
                  Melhorar
                </Button>
              </div>
            </div>
            <Textarea
              id="content-textarea"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="🎉 Olá {{nome}}! ..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {/* AI Enhancement */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <Label>Usar IA para Personalizar</Label>
                <p className="text-xs text-muted-foreground">
                  A IA irá personalizar a mensagem com dados do usuário
                </p>
              </div>
              <Switch
                checked={formData.use_ai_enhancement}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, use_ai_enhancement: checked }))
                }
              />
            </div>

            {formData.use_ai_enhancement && (
              <div className="space-y-2">
                <Label htmlFor="ai_prompt">Prompt para IA</Label>
                <Textarea
                  id="ai_prompt"
                  value={formData.ai_prompt}
                  onChange={(e) => setFormData(prev => ({ ...prev, ai_prompt: e.target.value }))}
                  placeholder="Gere uma mensagem motivacional curta e inspiradora..."
                  rows={3}
                />
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Template Ativo</Label>
              <p className="text-xs text-muted-foreground">
                Templates inativos não são enviados
              </p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, is_active: checked }))
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {template ? "Salvar Alterações" : "Criar Template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppTemplateEditor;
