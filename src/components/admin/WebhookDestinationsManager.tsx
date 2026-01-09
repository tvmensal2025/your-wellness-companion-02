import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, TestTube, Globe, Key, RefreshCw, Loader2, Send, Play } from 'lucide-react';

interface WebhookDestination {
  id: string;
  name: string;
  url: string;
  secret_key: string | null;
  is_active: boolean;
  headers: Record<string, string>;
  events: string[];
  retry_count: number;
  timeout_seconds: number;
  created_at: string;
  updated_at: string;
}

const EVENT_OPTIONS = [
  { value: 'new_user', label: 'Novo Usuário' },
  { value: 'user_updated', label: 'Usuário Atualizado' },
];

export default function WebhookDestinationsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<WebhookDestination | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [processingQueue, setProcessingQueue] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    secret_key: '',
    headers: '{}',
    events: ['new_user', 'user_updated'],
    retry_count: 3,
    timeout_seconds: 30,
    is_active: true,
  });

  const { data: destinations, isLoading } = useQuery({
    queryKey: ['webhook-destinations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_destinations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as WebhookDestination[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<WebhookDestination> & { headers?: unknown }) => {
      let headers: Record<string, string> = {};

      // Prioriza headers já parseados (evita erro de tipo)
      if (data.headers && typeof data.headers === 'object') {
        headers = data.headers as Record<string, string>;
      } else {
        try {
          headers = JSON.parse(formData.headers || '{}');
        } catch {
          throw new Error('Headers JSON inválido');
        }
      }

      const payload = {
        name: data.name?.trim(),
        url: data.url?.trim(),
        secret_key: data.secret_key ? String(data.secret_key).trim() : null,
        headers,
        events: data.events,
        retry_count: data.retry_count,
        timeout_seconds: data.timeout_seconds,
        is_active: data.is_active,
      };

      if (editingDestination) {
        const { error } = await supabase
          .from('webhook_destinations')
          .update(payload)
          .eq('id', editingDestination.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('webhook_destinations')
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-destinations'] });
      toast({ title: 'Destino salvo com sucesso!' });
      resetForm();
    },
    onError: (error) => {
      const msg = error.message || 'Erro desconhecido';
      const friendly = msg.toLowerCase().includes('row-level security')
        ? 'Você precisa ser administrador para salvar destinos.'
        : msg;
      toast({ title: 'Erro ao salvar', description: friendly, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('webhook_destinations')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-destinations'] });
      toast({ title: 'Destino removido!' });
    },
    onError: (error) => {
      toast({ title: 'Erro ao remover', description: error.message, variant: 'destructive' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('webhook_destinations')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhook-destinations'] });
    },
  });

  const testWebhook = async (destination: WebhookDestination) => {
    setTestingId(destination.id);
    try {
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: { destination_id: destination.id },
      });

      if (error) throw error;

      const ok = (data as any)?.success;
      const status = (data as any)?.status;
      const timeMs = (data as any)?.time_ms;
      const responseBody = (data as any)?.response_body;

      if (ok) {
        toast({
          title: 'Teste enviado com sucesso!',
          description: `Status: ${status} (${timeMs}ms)`,
        });
      } else {
        toast({
          title: 'Erro no teste',
          description: `Status: ${status} - ${String(responseBody || '').slice(0, 120)}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao testar',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setTestingId(null);
    }
  };

  const bulkQueueLeads = async () => {
    setBulkLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-queue-leads');
      if (error) throw error;

      const result = data as { success: boolean; queued?: number; error?: string };
      if (result.success) {
        toast({
          title: 'Leads enfileirados!',
          description: `${result.queued} webhooks adicionados à fila`,
        });
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro ao enfileirar leads',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const processQueue = async () => {
    setProcessingQueue(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-lead-webhooks');
      if (error) throw error;

      const result = data as { processed?: number; success?: number; failed?: number };
      toast({
        title: 'Fila processada!',
        description: `${result.success || 0} enviados, ${result.failed || 0} falhas`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao processar fila',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    } finally {
      setProcessingQueue(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      secret_key: '',
      headers: '{}',
      events: ['new_user', 'user_updated'],
      retry_count: 3,
      timeout_seconds: 30,
      is_active: true,
    });
    setEditingDestination(null);
    setIsDialogOpen(false);
  };

  const openEdit = (destination: WebhookDestination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name,
      url: destination.url,
      secret_key: destination.secret_key || '',
      headers: JSON.stringify(destination.headers || {}, null, 2),
      events: destination.events || ['new_user', 'user_updated'],
      retry_count: destination.retry_count || 3,
      timeout_seconds: destination.timeout_seconds || 30,
      is_active: destination.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.url) {
      toast({ title: 'Nome e URL são obrigatórios', variant: 'destructive' });
      return;
    }
    
    let parsedHeaders: Record<string, string> = {};
    try {
      parsedHeaders = JSON.parse(formData.headers || '{}');
    } catch {
      toast({ title: 'Headers JSON inválido', variant: 'destructive' });
      return;
    }
    
    saveMutation.mutate({
      ...formData,
      headers: parsedHeaders,
    });
  };

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Destinos de Webhook</h2>
          <p className="text-muted-foreground">Configure para onde enviar os dados de leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={bulkQueueLeads} disabled={bulkLoading}>
            {bulkLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Enviar Leads Existentes
          </Button>
          <Button variant="outline" onClick={processQueue} disabled={processingQueue}>
            {processingQueue ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
            Processar Fila
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Adicionar Destino
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingDestination ? 'Editar Destino' : 'Novo Destino'}</DialogTitle>
              <DialogDescription>Configure a URL e autenticação do webhook</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="CRM Principal, N8N, Make..."
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="url">URL do Webhook</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://seu-crm.com/webhook"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="secret">Chave Secreta (opcional)</Label>
                <Input
                  id="secret"
                  type="password"
                  placeholder="Enviada no header X-Webhook-Secret"
                  value={formData.secret_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret_key: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="headers">Headers Customizados (JSON)</Label>
                <Textarea
                  id="headers"
                  placeholder='{"Authorization": "Bearer token123"}'
                  value={formData.headers}
                  onChange={(e) => setFormData(prev => ({ ...prev, headers: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <Label>Eventos que Disparam</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {EVENT_OPTIONS.map(opt => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={opt.value}
                        checked={formData.events.includes(opt.value)}
                        onCheckedChange={() => toggleEvent(opt.value)}
                      />
                      <Label htmlFor={opt.value} className="font-normal">{opt.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="retry">Tentativas</Label>
                  <Input
                    id="retry"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.retry_count}
                    onChange={(e) => setFormData(prev => ({ ...prev, retry_count: parseInt(e.target.value) || 3 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="timeout">Timeout (s)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    min={5}
                    max={120}
                    value={formData.timeout_seconds}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeout_seconds: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>Cancelar</Button>
              <Button onClick={handleSubmit} disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {destinations && destinations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhum destino configurado</p>
            <p className="text-sm text-muted-foreground">Adicione um destino para começar a enviar webhooks</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {destinations?.map((dest) => (
            <Card key={dest.id} className={!dest.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {dest.name}
                      {dest.is_active ? (
                        <Badge variant="default" className="text-xs">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Pausado</Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs break-all mt-1">{dest.url}</CardDescription>
                  </div>
                  <Switch
                    checked={dest.is_active}
                    onCheckedChange={(checked) => toggleMutation.mutate({ id: dest.id, is_active: checked })}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {dest.events?.map(event => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {EVENT_OPTIONS.find(e => e.value === event)?.label || event}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {dest.secret_key && <span className="flex items-center gap-1"><Key className="h-3 w-3" /> Autenticado</span>}
                  <span><RefreshCw className="h-3 w-3 inline" /> {dest.retry_count} tentativas</span>
                  <span>{dest.timeout_seconds}s timeout</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => testWebhook(dest)}
                    disabled={testingId === dest.id}
                  >
                    {testingId === dest.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    <span className="ml-1">Testar</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(dest)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-destructive"
                    onClick={() => deleteMutation.mutate(dest.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
