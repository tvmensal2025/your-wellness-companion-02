import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { SessionCard } from './SessionCard';

interface SessionContentData {
  questions?: unknown[];
  sections?: unknown[];
  intro_text?: string;
  outro_text?: string;
  [key: string]: unknown;
}

interface Session {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimated_time: number;
  content: SessionContentData;
  target_saboteurs: string[];
  tools: string[];
  tools_data: Record<string, unknown>;
}

interface UserSession {
  id: string;
  session_id: string;
  status: string;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  progress: number;
  feedback?: string;
  notes?: string;
  sessions: Session;
  auto_save_data: Record<string, unknown>;
  tools_data: Record<string, unknown>;
  last_activity: string;
  cycle_number: number;
  next_available_date?: string;
  is_locked: boolean;
  review_count: number;
}

interface SessionListProps {
  userSessions: UserSession[];
  onStartSession: (sessionId: string) => void;
  onCompleteSession: (sessionId: string) => void;
  onOpenReview: (userSession: UserSession) => void;
  onRequestEarlyRelease: (userSession: UserSession) => void;
  onOpenTools: (userSession: UserSession) => void;
  onSendDrVital: (userSession: UserSession) => void;
  sendingDrVital: string | null;
  getStatusBadge: (userSession: UserSession) => React.ReactNode;
}

export const SessionList: React.FC<SessionListProps> = ({
  userSessions,
  onStartSession,
  onCompleteSession,
  onOpenReview,
  onRequestEarlyRelease,
  onOpenTools,
  onSendDrVital,
  sendingDrVital,
  getStatusBadge,
}) => {
  if (userSessions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma sessão disponível</h3>
          <p className="text-muted-foreground">
            Você ainda não tem sessões atribuídas. Elas aparecerão aqui quando estiverem disponíveis.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-2 print:gap-4">
      {userSessions.map((userSession) => (
        <SessionCard
          key={userSession.id}
          userSession={userSession}
          onStartSession={onStartSession}
          onCompleteSession={onCompleteSession}
          onOpenReview={onOpenReview}
          onRequestEarlyRelease={onRequestEarlyRelease}
          onOpenTools={onOpenTools}
          onSendDrVital={onSendDrVital}
          sendingDrVital={sendingDrVital}
          getStatusBadge={getStatusBadge}
        />
      ))}
    </div>
  );
};
