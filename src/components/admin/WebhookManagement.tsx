import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  RefreshCw, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Users,
  AlertTriangle
} from 'lucide-react';
import { useWebhookManagement } from '@/hooks/useWebhookManagement';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function WebhookManagement() {
  const {
    webhooks,
    stats,
    loading,
    sending,
    fetchWebhooks,
    triggerSendWebhooks,
    retryWebhook,
    exportToCSV,
  } = useWebhookManagement();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Enviado</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Falhou</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Send className="h-8 w-8 text-emerald-500" />
            Leads e Webhooks
          </h1>
          <p className="text-muted-foreground">
            Sincronização automática com financeiromaxnutrition.lovable.app
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchWebhooks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={triggerSendWebhooks} disabled={sending || stats.pending === 0}>
            {sending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Enviar Pendentes ({stats.pending})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Aguardando envio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Com Falha</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Precisam atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">{stats.sent} enviados com sucesso</p>
          </CardContent>
        </Card>
      </div>

      {/* Webhooks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fila de Webhooks</CardTitle>
        </CardHeader>
        <CardContent>
          {webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum lead na fila ainda</p>
              <p className="text-sm">Novos cadastros aparecerão aqui automaticamente</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tentativas</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {webhooks.map((webhook) => {
                  const lead = webhook.payload?.lead || {};
                  return (
                    <TableRow key={webhook.id}>
                      <TableCell className="font-medium">{lead.full_name || '-'}</TableCell>
                      <TableCell>{lead.email || '-'}</TableCell>
                      <TableCell>{lead.phone || '-'}</TableCell>
                      <TableCell>{getStatusBadge(webhook.status)}</TableCell>
                      <TableCell>
                        <span className={webhook.attempts > 2 ? 'text-red-500 font-bold' : ''}>
                          {webhook.attempts}/5
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(webhook.created_at).toLocaleString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        {webhook.status === 'failed' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => retryWebhook(webhook.id)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Reenviar
                          </Button>
                        )}
                        {webhook.last_error && (
                          <span className="text-xs text-red-500 ml-2" title={webhook.last_error}>
                            ⚠️
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <Send className="h-4 w-4 text-emerald-500" />
            Como funciona
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Novos cadastros são automaticamente adicionados à fila</li>
            <li>• Clique em "Enviar Pendentes" para sincronizar com financeiromaxnutrition</li>
            <li>• Falhas são retentadas até 5 vezes automaticamente</li>
            <li>• Use "Reenviar" para tentar novamente manualmente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
