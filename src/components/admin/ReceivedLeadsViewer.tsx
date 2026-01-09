import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, Inbox, CheckCircle, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReceivedLead {
  id: string;
  source_url: string | null;
  source_name: string | null;
  lead_data: Record<string, unknown>;
  received_at: string;
  processed: boolean;
  processed_at: string | null;
  notes: string | null;
  created_at: string;
}

export const ReceivedLeadsViewer = () => {
  const [leads, setLeads] = useState<ReceivedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<ReceivedLead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("received_leads")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setLeads((data as ReceivedLead[]) || []);
    } catch (error) {
      console.error("Error fetching received leads:", error);
      toast.error("Erro ao carregar leads recebidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Realtime subscription
    const channel = supabase
      .channel("received_leads_changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "received_leads" },
        (payload) => {
          setLeads((prev) => [payload.new as ReceivedLead, ...prev]);
          toast.success("Novo lead recebido!");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const markAsProcessed = async (id: string) => {
    try {
      const { error } = await supabase
        .from("received_leads")
        .update({ processed: true, processed_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id
            ? { ...lead, processed: true, processed_at: new Date().toISOString() }
            : lead
        )
      );
      toast.success("Lead marcado como processado");
    } catch (error) {
      console.error("Error marking lead as processed:", error);
      toast.error("Erro ao atualizar lead");
    }
  };

  const deleteLead = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este lead?")) return;
    
    try {
      const { error } = await supabase
        .from("received_leads")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      toast.success("Lead excluído");
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast.error("Erro ao excluir lead");
    }
  };

  const getLeadEmail = (lead: ReceivedLead): string => {
    const data = lead.lead_data as Record<string, unknown>;
    const contact = data.contact as Record<string, unknown> | undefined;
    const leadObj = data.lead as Record<string, unknown> | undefined;
    return (contact?.email as string) || (leadObj?.email as string) || "Email não informado";
  };

  const getLeadName = (lead: ReceivedLead): string => {
    const data = lead.lead_data as Record<string, unknown>;
    const contact = data.contact as Record<string, unknown> | undefined;
    const leadObj = data.lead as Record<string, unknown> | undefined;
    return (contact?.full_name as string) || (leadObj?.full_name as string) || "Nome não informado";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Inbox className="h-5 w-5" />
          Leads Recebidos via Webhook
        </CardTitle>
        <Button onClick={fetchLeads} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum lead recebido ainda</p>
            <p className="text-sm mt-2">
              Configure um destino de webhook em outro sistema para enviar leads para cá
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{getLeadName(lead)}</span>
                        {lead.processed ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Processado
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{getLeadEmail(lead)}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>
                          Recebido em{" "}
                          {format(new Date(lead.received_at), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                        {lead.source_name && (
                          <>
                            <span>•</span>
                            <span>Origem: {lead.source_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedLead(lead)}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!lead.processed && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => markAsProcessed(lead.id)}
                          title="Marcar como processado"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteLead(lead.id)}
                        title="Excluir"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Modal de detalhes */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Lead Recebido</DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Origem:</span>
                    <p className="font-medium">{selectedLead.source_name || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">URL de Origem:</span>
                    <p className="font-medium truncate">{selectedLead.source_url || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recebido em:</span>
                    <p className="font-medium">
                      {format(new Date(selectedLead.received_at), "dd/MM/yyyy 'às' HH:mm:ss", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <p className="font-medium">
                      {selectedLead.processed ? "Processado" : "Pendente"}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Dados Recebidos (JSON):</span>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-auto max-h-[300px]">
                    {JSON.stringify(selectedLead.lead_data, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
