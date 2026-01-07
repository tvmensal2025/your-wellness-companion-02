import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const WhatsAppDashboard = () => {
  // Fetch messages by type
  const { data: messagesByType } = useQuery({
    queryKey: ["whatsapp-messages-by-type"],
    queryFn: async () => {
      const { data } = await supabase
        .from("whatsapp_evolution_logs")
        .select("message_type")
        .gte("sent_at", subDays(new Date(), 30).toISOString());

      const counts: Record<string, number> = {};
      data?.forEach((msg: any) => {
        counts[msg.message_type] = (counts[msg.message_type] || 0) + 1;
      });

      return Object.entries(counts).map(([name, value]) => ({
        name: formatMessageType(name),
        value
      }));
    }
  });

  // Fetch daily messages for chart
  const { data: dailyMessages } = useQuery({
    queryKey: ["whatsapp-daily-messages"],
    queryFn: async () => {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const startOfDayStr = startOfDay(date).toISOString();
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const { count: sent } = await supabase
          .from("whatsapp_evolution_logs")
          .select("*", { count: "exact", head: true })
          .eq("status", "sent")
          .gte("sent_at", startOfDayStr)
          .lte("sent_at", endOfDay.toISOString());

        const { count: failed } = await supabase
          .from("whatsapp_evolution_logs")
          .select("*", { count: "exact", head: true })
          .eq("status", "failed")
          .gte("sent_at", startOfDayStr)
          .lte("sent_at", endOfDay.toISOString());

        days.push({
          day: format(date, "EEE", { locale: ptBR }),
          enviadas: sent || 0,
          falhas: failed || 0
        });
      }
      return days;
    }
  });

  // Fetch top users receiving messages
  const { data: topUsers } = useQuery({
    queryKey: ["whatsapp-top-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("whatsapp_evolution_logs")
        .select(`
          user_id,
          profiles!inner(full_name)
        `)
        .gte("sent_at", subDays(new Date(), 30).toISOString())
        .limit(100);

      const userCounts: Record<string, { name: string; count: number }> = {};
      data?.forEach((msg: any) => {
        const userId = msg.user_id;
        if (!userCounts[userId]) {
          userCounts[userId] = { 
            name: msg.profiles?.full_name || "Usuário",
            count: 0
          };
        }
        userCounts[userId].count++;
      });

      return Object.values(userCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }
  });

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Messages by Type - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Mensagens por Tipo (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={messagesByType || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {messagesByType?.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Messages - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Envios Diários (Última Semana)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyMessages || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enviadas" fill="#22c55e" name="Enviadas" />
                <Bar dataKey="falhas" fill="#ef4444" name="Falhas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Usuários (30 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topUsers?.map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    #{index + 1}
                  </span>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {user.count} mensagens
                </span>
              </div>
            ))}
            {(!topUsers || topUsers.length === 0) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum dado disponível
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hourly Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Horários de Envio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center py-2 border-b">
              <span>🌅 Motivação Diária</span>
              <span className="text-muted-foreground">07:00 BRT</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>💧 Lembrete de Água</span>
              <span className="text-muted-foreground">10:00, 14:00, 18:00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>⚖️ Lembrete de Pesagem</span>
              <span className="text-muted-foreground">08:00 BRT</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span>📋 Lembrete de Missões</span>
              <span className="text-muted-foreground">15:00, 20:00</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span>📊 Relatório Semanal</span>
              <span className="text-muted-foreground">Sexta 09:00 BRT</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function formatMessageType(type: string): string {
  const types: Record<string, string> = {
    "daily_motivation": "Motivação",
    "weekly_report": "Relatório",
    "water_reminder": "Água",
    "weight_reminder": "Pesagem",
    "mission_reminder": "Missões",
    "streak_alert": "Streak",
    "achievement_celebration": "Conquista",
    "goal_milestone": "Meta",
    "welcome": "Boas-vindas"
  };
  return types[type] || type;
}

export default WhatsAppDashboard;
