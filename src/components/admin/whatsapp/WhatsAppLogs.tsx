import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Eye, RefreshCw, CheckCircle, XCircle, Clock } from "lucide-react";

interface Log {
  id: string;
  user_id: string;
  phone: string;
  message_type: string;
  message_content: string;
  media_url: string | null;
  evolution_response: any;
  status: string;
  error_message: string | null;
  sent_at: string;
  profiles?: {
    full_name: string;
  };
}

const WhatsAppLogs = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const { data: logs, isLoading, refetch } = useQuery({
    queryKey: ["whatsapp-logs", search, statusFilter, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("whatsapp_evolution_logs")
        .select(`
          *,
          profiles!left(full_name)
        `)
        .order("sent_at", { ascending: false })
        .limit(100);

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (typeFilter !== "all") {
        query = query.eq("message_type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter by search term client-side
      if (search) {
        return data?.filter((log: Log) => 
          log.phone?.includes(search) ||
          log.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          log.message_content?.toLowerCase().includes(search.toLowerCase())
        );
      }

      return data as Log[];
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Enviado</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case "delivered":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Entregue</Badge>;
      case "read":
        return <Badge className="bg-purple-100 text-purple-800"><Eye className="h-3 w-3 mr-1" />Lido</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatMessageType = (type: string) => {
    const types: Record<string, string> = {
      "daily_motivation": "Motivação Diária",
      "weekly_report": "Relatório Semanal",
      "water_reminder": "Lembrete Água",
      "weight_reminder": "Lembrete Pesagem",
      "mission_reminder": "Lembrete Missões",
      "streak_alert": "Alerta Streak",
      "achievement_celebration": "Celebração",
      "goal_milestone": "Marco Meta",
      "welcome": "Boas-vindas",
      "test": "Teste"
    };
    return types[type] || type;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por telefone, nome ou mensagem..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="sent">Enviado</SelectItem>
                <SelectItem value="failed">Falhou</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="delivered">Entregue</SelectItem>
                <SelectItem value="read">Lido</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Tipos</SelectItem>
                <SelectItem value="welcome">Boas-vindas</SelectItem>
                <SelectItem value="daily_motivation">Motivação Diária</SelectItem>
                <SelectItem value="weekly_report">Relatório Semanal</SelectItem>
                <SelectItem value="water_reminder">Lembrete Água</SelectItem>
                <SelectItem value="weight_reminder">Lembrete Pesagem</SelectItem>
                <SelectItem value="mission_reminder">Lembrete Missões</SelectItem>
                <SelectItem value="streak_alert">Alerta Streak</SelectItem>
                <SelectItem value="achievement_celebration">Celebração</SelectItem>
                <SelectItem value="test">Teste</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Mensagens ({logs?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando logs...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prévia</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {format(new Date(log.sent_at), "dd/MM HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {log.profiles?.full_name || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.phone}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {formatMessageType(log.message_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.status)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                        {log.message_content?.substring(0, 50)}...
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!logs || logs.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum log encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Detail Modal */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Mensagem</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Usuário:</span>
                  <p className="font-medium">{selectedLog.profiles?.full_name || "—"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Telefone:</span>
                  <p className="font-medium">{selectedLog.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium">{formatMessageType(selectedLog.message_type)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Enviado em:</span>
                  <p className="font-medium">
                    {format(new Date(selectedLog.sent_at), "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-sm text-muted-foreground">Conteúdo:</span>
                <div className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap text-sm">
                  {selectedLog.message_content}
                </div>
              </div>

              {selectedLog.error_message && (
                <div>
                  <span className="text-sm text-red-500">Erro:</span>
                  <div className="mt-2 p-4 bg-red-50 rounded-lg text-sm text-red-800">
                    {selectedLog.error_message}
                  </div>
                </div>
              )}

              {selectedLog.evolution_response && (
                <div>
                  <span className="text-sm text-muted-foreground">Resposta Evolution API:</span>
                  <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.evolution_response, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppLogs;
