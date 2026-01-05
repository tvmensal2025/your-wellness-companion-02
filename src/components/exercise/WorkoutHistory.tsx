import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, CheckCircle2 } from "lucide-react";

type WorkoutLog = {
  id: string;
  workout_name?: string | null;
  exercises_completed?: any;
  duration_minutes?: number | null;
  created_at: string;
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;

  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const WorkoutHistory: React.FC<{
  logs: WorkoutLog[] | null | undefined;
}> = ({ logs }) => {
  const safeLogs = (logs || []).slice(0, 12);

  return (
    <section aria-labelledby="workout-history-title" className="space-y-3">
      <header className="flex items-center justify-between gap-3">
        <h3
          id="workout-history-title"
          className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2"
        >
          <Calendar className="w-4 h-4 text-orange-500" />
          Histórico de treinos
        </h3>
        <Badge variant="outline" className="text-xs">
          {safeLogs.length} registros
        </Badge>
      </header>

      {safeLogs.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-4 text-sm text-muted-foreground">
            Nenhum treino registrado ainda. Conclua um treino para aparecer aqui.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="max-h-64">
              <ul className="divide-y">
                {safeLogs.map((log) => {
                  const meta = log.exercises_completed || {};
                  const exercises =
                    meta?.exercises || meta?.exercise_ids || meta?.exercises_completed || [];
                  const exerciseCount = Array.isArray(exercises) ? exercises.length : 0;

                  const week = meta?.week_number;
                  const day = meta?.day_number;

                  return (
                    <li
                      key={log.id}
                      className="p-4 flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {log.workout_name || "Treino"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(log.created_at)}
                          {typeof week === "number" ? ` • Semana ${week}` : ""}
                          {typeof day === "number" ? ` • Dia ${day}` : ""}
                          {exerciseCount ? ` • ${exerciseCount} exercícios` : ""}
                        </p>
                      </div>

                      <Badge variant="secondary" className="shrink-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Concluído
                      </Badge>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </section>
  );
};
