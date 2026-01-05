import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, CheckCircle2, ChevronDown, ChevronUp, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const safeLogs = (logs || []).slice(0, 12);

  return (
    <section aria-labelledby="workout-history-title" className="space-y-2">
      {/* Botão compacto para abrir/fechar histórico */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between bg-background/50 backdrop-blur-sm border-border/50 hover:bg-muted/50 transition-all"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <History className="w-4 h-4 text-orange-500" />
          Histórico de Treinos
          {safeLogs.length > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs px-1.5 py-0">
              {safeLogs.length}
            </Badge>
          )}
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </Button>

      {/* Conteúdo expandível */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {safeLogs.length === 0 ? (
              <Card className="border-dashed border-border/50">
                <CardContent className="p-4 text-sm text-muted-foreground text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  Nenhum treino registrado ainda.
                  <br />
                  <span className="text-xs">Conclua um treino para aparecer aqui.</span>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-0">
                  <ScrollArea className="max-h-56">
                    <ul className="divide-y divide-border/30">
                      {safeLogs.map((log, index) => {
                        const meta = log.exercises_completed || {};
                        const exercises =
                          meta?.exercises || meta?.exercise_ids || meta?.exercises_completed || [];
                        const exerciseCount = Array.isArray(exercises) ? exercises.length : 0;

                        const week = meta?.week_number;
                        const day = meta?.day_number;

                        return (
                          <motion.li
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-3 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground text-sm truncate">
                                {log.workout_name || "Treino"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDateTime(log.created_at)}
                                {typeof week === "number" ? ` • Sem ${week}` : ""}
                                {typeof day === "number" ? ` • Dia ${day}` : ""}
                              </p>
                            </div>

                            <Badge 
                              variant="secondary" 
                              className="shrink-0 text-xs bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            >
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Concluído
                            </Badge>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
