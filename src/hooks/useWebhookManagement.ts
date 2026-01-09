import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WebhookQueueItem {
  id: string;
  user_id: string;
  event_type: string;
  payload: any;
  status: string;
  attempts: number;
  last_error: string | null;
  destination_url: string;
  created_at: string;
  sent_at: string | null;
}

interface WebhookStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  successRate: number;
}

export function useWebhookManagement() {
  const [webhooks, setWebhooks] = useState<WebhookQueueItem[]>([]);
  const [stats, setStats] = useState<WebhookStats>({
    total: 0,
    pending: 0,
    sent: 0,
    failed: 0,
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const fetchWebhooks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setWebhooks(data || []);

      // Calcular estatísticas
      const total = data?.length || 0;
      const pending = data?.filter(w => w.status === 'pending').length || 0;
      const sent = data?.filter(w => w.status === 'sent').length || 0;
      const failed = data?.filter(w => w.status === 'failed').length || 0;
      const successRate = total > 0 ? Math.round((sent / total) * 100) : 0;

      setStats({ total, pending, sent, failed, successRate });
    } catch (error) {
      console.error('Erro ao buscar webhooks:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os webhooks',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const triggerSendWebhooks = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-lead-webhooks');

      if (error) throw error;

      const sent = (data as any)?.sent ?? (data as any)?.succeeded ?? 0;
      const failed = (data as any)?.failed ?? 0;

      toast({
        title: 'Webhooks processados',
        description: `${sent} enviados, ${failed} falharam`,
      });

      await fetchWebhooks();
    } catch (error) {
      console.error('Erro ao enviar webhooks:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao processar webhooks',
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const retryWebhook = async (id: string) => {
    try {
      // Resetar status para pending
      const { error } = await supabase
        .from('webhook_queue')
        .update({ status: 'pending', attempts: 0, last_error: null })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Webhook resetado',
        description: 'Será reenviado na próxima execução',
      });

      await fetchWebhooks();
    } catch (error) {
      console.error('Erro ao resetar webhook:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível resetar o webhook',
        variant: 'destructive',
      });
    }
  };

  const exportToCSV = () => {
    if (webhooks.length === 0) {
      toast({
        title: 'Sem dados',
        description: 'Não há webhooks para exportar',
        variant: 'destructive',
      });
      return;
    }

    const headers = ['Nome', 'Email', 'Telefone', 'Cidade', 'Status', 'Data', 'Enviado em'];
    const rows = webhooks.map(w => {
      const contact = w.payload?.contact || w.payload?.lead || {};
      const location = w.payload?.location || {};
      return [
        contact.full_name || '',
        contact.email || '',
        contact.phone || '',
        location.city || contact.city || '',
        w.status,
        new Date(w.created_at).toLocaleString('pt-BR'),
        w.sent_at ? new Date(w.sent_at).toLocaleString('pt-BR') : '',
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_webhook_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'CSV exportado',
      description: `${webhooks.length} leads exportados`,
    });
  };

  return {
    webhooks,
    stats,
    loading,
    sending,
    fetchWebhooks,
    triggerSendWebhooks,
    retryWebhook,
    exportToCSV,
  };
}
