import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationQueueRow {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  body: string;
  priority: string;
  scheduled_for: string;
  sent_at: string | null;
  action_url: string | null;
  metadata: Record<string, unknown>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, userId } = await req.json();

    switch (action) {
      case 'process_pending': {
        // Buscar notificações pendentes que devem ser enviadas
        const now = new Date().toISOString();
        
        const { data: pendingNotifications, error: fetchError } = await supabase
          .from('notification_queue')
          .select('*')
          .is('sent_at', null)
          .lte('scheduled_for', now)
          .order('priority', { ascending: false })
          .order('scheduled_for', { ascending: true })
          .limit(50);

        if (fetchError) throw fetchError;

        const processed: string[] = [];
        const failed: string[] = [];

        for (const notification of (pendingNotifications || []) as NotificationQueueRow[]) {
          try {
            // Buscar dados do usuário para envio
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('id', notification.user_id)
              .single();

            // Se tiver telefone, enviar via WhatsApp
            if (profile?.phone) {
              await sendWhatsAppNotification(supabase, notification, profile);
            }

            // Marcar como enviada
            await supabase
              .from('notification_queue')
              .update({ sent_at: new Date().toISOString() })
              .eq('id', notification.id);

            processed.push(notification.id);
          } catch (err) {
            console.error(`Failed to process notification ${notification.id}:`, err);
            failed.push(notification.id);
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            processed: processed.length,
            failed: failed.length,
            processedIds: processed,
            failedIds: failed,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'schedule_morning_briefing': {
        if (!userId) throw new Error('userId required');

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(8, 0, 0, 0);

        // Verificar se já existe briefing agendado
        const { data: existing } = await supabase
          .from('notification_queue')
          .select('id')
          .eq('user_id', userId)
          .eq('notification_type', 'morning_briefing')
          .is('sent_at', null)
          .gte('scheduled_for', new Date().toISOString())
          .single();

        if (existing) {
          return new Response(
            JSON.stringify({ success: true, message: 'Briefing already scheduled', id: existing.id }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: notification, error } = await supabase
          .from('notification_queue')
          .insert({
            user_id: userId,
            notification_type: 'morning_briefing',
            title: '☀️ Bom dia! Seu resumo de saúde',
            body: 'Confira suas missões do dia e acompanhe seu progresso.',
            priority: 'medium',
            scheduled_for: tomorrow.toISOString(),
            action_url: '/dr-vital',
            metadata: { type: 'daily_briefing' },
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, notification }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'check_inactivity': {
        // Buscar usuários inativos (sem missões completadas nos últimos 3 dias)
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

        const { data: activeUsers } = await supabase
          .from('health_missions')
          .select('user_id')
          .eq('is_completed', true)
          .gte('completed_at', threeDaysAgo.toISOString());

        const activeUserIds = new Set((activeUsers || []).map(u => u.user_id));

        // Buscar todos os usuários com streaks
        const { data: allUsers } = await supabase
          .from('health_streaks')
          .select('user_id, last_completed_date');

        const inactiveUsers: string[] = [];

        for (const user of (allUsers || [])) {
          if (!activeUserIds.has(user.user_id)) {
            // Verificar se já não tem notificação de re-engajamento pendente
            const { data: existingNotif } = await supabase
              .from('notification_queue')
              .select('id')
              .eq('user_id', user.user_id)
              .eq('notification_type', 're_engagement')
              .is('sent_at', null)
              .single();

            if (!existingNotif) {
              // Criar notificação de re-engajamento
              await supabase
                .from('notification_queue')
                .insert({
                  user_id: user.user_id,
                  notification_type: 're_engagement',
                  title: '🌟 Sentimos sua falta!',
                  body: 'Faz alguns dias que você não completa uma missão. Volte e mantenha seu streak!',
                  priority: 'medium',
                  scheduled_for: new Date().toISOString(),
                  action_url: '/dr-vital',
                  metadata: { reason: 'inactivity' },
                });

              inactiveUsers.push(user.user_id);
            }
          }
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            inactiveUsersNotified: inactiveUsers.length,
            userIds: inactiveUsers,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'schedule_weekly_reports': {
        // Agendar relatórios semanais para todos os usuários ativos
        const nextSunday = new Date();
        const daysUntilSunday = (7 - nextSunday.getDay()) % 7 || 7;
        nextSunday.setDate(nextSunday.getDate() + daysUntilSunday);
        nextSunday.setHours(10, 0, 0, 0);

        // Buscar usuários ativos (com streak)
        const { data: activeUsers } = await supabase
          .from('health_streaks')
          .select('user_id')
          .gt('current_streak', 0);

        let scheduled = 0;

        for (const user of (activeUsers || [])) {
          // Verificar se já não tem relatório agendado
          const { data: existing } = await supabase
            .from('notification_queue')
            .select('id')
            .eq('user_id', user.user_id)
            .eq('notification_type', 'weekly_report')
            .is('sent_at', null)
            .gte('scheduled_for', new Date().toISOString())
            .single();

          if (!existing) {
            await supabase
              .from('notification_queue')
              .insert({
                user_id: user.user_id,
                notification_type: 'weekly_report',
                title: '📊 Seu relatório semanal está pronto!',
                body: 'Veja como foi sua semana de saúde e descubra insights personalizados.',
                priority: 'low',
                scheduled_for: nextSunday.toISOString(),
                action_url: '/dr-vital?tab=reports',
                metadata: { reportType: 'weekly' },
              });

            scheduled++;
          }
        }

        return new Response(
          JSON.stringify({ success: true, scheduledReports: scheduled }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[dr-vital-notifications] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper para enviar notificação via WhatsApp
async function sendWhatsAppNotification(
  supabase: any,
  notification: NotificationQueueRow,
  profile: { full_name: string; phone: string }
) {
  const evolutionUrl = Deno.env.get('EVOLUTION_API_URL');
  const evolutionKey = Deno.env.get('EVOLUTION_API_KEY');
  const evolutionInstance = Deno.env.get('EVOLUTION_INSTANCE');

  if (!evolutionUrl || !evolutionKey || !evolutionInstance) {
    console.log('WhatsApp not configured, skipping');
    return;
  }

  // Formatar telefone
  let phone = profile.phone.replace(/\D/g, '');
  if (!phone.startsWith('55')) {
    phone = '55' + phone;
  }

  const message = `*${notification.title}*\n\n${notification.body}`;

  try {
    const response = await fetch(`${evolutionUrl}/message/sendText/${evolutionInstance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionKey,
      },
      body: JSON.stringify({
        number: phone,
        text: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`WhatsApp API error: ${response.status}`);
    }

    console.log(`WhatsApp notification sent to ${phone}`);
  } catch (err) {
    console.error('Failed to send WhatsApp notification:', err);
    // Não propagar erro - notificação ainda será marcada como enviada
  }
}
