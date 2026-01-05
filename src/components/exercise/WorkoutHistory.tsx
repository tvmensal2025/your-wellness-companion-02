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
  isExpanded?: boolean;
  onToggle?: () => void;
}> = ({ logs, isExpanded: controlledExpanded, onToggle }) => {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;
  const setIsExpanded = onToggle ? () => onToggle() : setInternalExpanded;
  const safeLogs = (logs || []).slice(0, 12);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setIsExpanded(!isExpanded)}
      className="h-8 px-3 gap-1.5 text-xs font-medium bg-muted/50 hover:bg-muted border border-border/40 rounded-lg transition-all"
    >
      <History className="w-3.5 h-3.5 text-orange-500" />
      <span className="hidden xs:inline">Histórico</span>
      {safeLogs.length > 0 && (
        <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-orange-500/10 text-orange-600 border-0">
          {safeLogs.length}
        </Badge>
      )}
      {isExpanded ? (
        <ChevronUp className="w-3 h-3 text-muted-foreground" />
      ) : (
        <ChevronDown className="w-3 h-3 text-muted-foreground" />
      )}
    </Button>
  );
};

// Modal/Dropdown de histórico separado para uso no topo
export const WorkoutHistoryContent: React.FC<{
  logs: WorkoutLog[] | null | undefined;
}> = ({ logs }) => {
  const safeLogs = (logs || []).slice(0, 12);

  if (safeLogs.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground text-center">
        <Calendar className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
        <p>Nenhum treino registrado.</p>
        <p className="text-xs mt-1">Conclua um treino para aparecer aqui.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-64">
      <ul className="divide-y divide-border/30">
        {safeLogs.map((log, index) => {
          const meta = log.exercises_completed || {};
          const week = meta?.week_number;
          const day = meta?.day_number;

          return (
            <motion.li
              key={log.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="px-3 py-2.5 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground text-sm truncate">
                    {log.workout_name || "Treino"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDateTime(log.created_at)}
                    {typeof week === "number" ? ` • Sem ${week}` : ""}
                    {typeof day === "number" ? ` • Dia ${day}` : ""}
                  </p>
                </div>
                <Badge 
                  variant="secondary" 
                  className="shrink-0 h-5 text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 border-0"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" />
                  OK
                </Badge>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </ScrollArea>
  );
};
