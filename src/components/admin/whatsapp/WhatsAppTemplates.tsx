import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Edit, 
  Copy, 
  Trash2, 
  Sparkles,
  Clock,
  MessageSquare,
  Plus
} from "lucide-react";
import WhatsAppTemplateEditor from "./WhatsAppTemplateEditor";

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

const WhatsAppTemplates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ["whatsapp-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("whatsapp_message_templates")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data as Template[];
    }
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("whatsapp_message_templates")
        .update({ is_active })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast({ title: "Template atualizado!" });
    }
  });

  const duplicateMutation = useMutation({
    mutationFn: async (template: Template) => {
      const { id, ...rest } = template;
      const newKey = `${template.template_key}_copy_${Date.now()}`;
      
      const { error } = await supabase
        .from("whatsapp_message_templates")
        .insert({
          ...rest,
          template_key: newKey,
          name: `${template.name} (Cópia)`
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast({ title: "Template duplicado!" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("whatsapp_message_templates")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp-templates"] });
      toast({ title: "Template removido!" });
    }
  });

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setIsEditorOpen(true);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      onboarding: "bg-blue-100 text-blue-800",
      engagement: "bg-green-100 text-green-800",
      report: "bg-purple-100 text-purple-800",
      reminder: "bg-yellow-100 text-yellow-800"
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      onboarding: "Onboarding",
      engagement: "Engajamento",
      report: "Relatórios",
      reminder: "Lembretes"
    };
    return labels[category] || category;
  };

  // Group templates by category
  const groupedTemplates = templates?.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  if (isLoading) {
    return <div className="text-center py-8">Carregando templates...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Templates de Mensagens</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {Object.entries(groupedTemplates || {}).map(([category, categoryTemplates]) => (
        <div key={category} className="space-y-3">
          <h3 className="font-medium text-lg flex items-center gap-2">
            <Badge className={getCategoryColor(category)}>
              {getCategoryLabel(category)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              ({categoryTemplates.length} templates)
            </span>
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {categoryTemplates.map((template) => (
              <Card key={template.id} className={!template.is_active ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        {template.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {template.use_ai_enhancement && (
                        <Badge variant="outline" className="text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          IA
                        </Badge>
                      )}
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={(checked) => 
                          toggleActiveMutation.mutate({ id: template.id, is_active: checked })
                        }
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/50 rounded-lg p-3 mb-3 max-h-32 overflow-y-auto">
                    <p className="text-xs whitespace-pre-wrap font-mono">
                      {template.content.substring(0, 200)}
                      {template.content.length > 200 && "..."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {template.schedule_time || "Manual"}
                    </span>
                    <span>
                      Variáveis: {Array.isArray(template.variables) ? template.variables.length : 0}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEdit(template)}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => duplicateMutation.mutate(template)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este template?")) {
                          deleteMutation.mutate(template.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Template Editor Modal */}
      <WhatsAppTemplateEditor
        template={selectedTemplate}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setSelectedTemplate(null);
        }}
      />
    </div>
  );
};

export default WhatsAppTemplates;
