import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Timer } from 'lucide-react';
import { SessionActions } from './SessionActions';

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

interface SessionCardProps {
  userSession: UserSession;
  onStartSession: (sessionId: string) => void;
  onCompleteSession: (sessionId: string) => void;
  onOpenReview: (userSession: UserSession) => void;
  onRequestEarlyRelease: (userSession: UserSession) => void;
  onOpenTools: (userSession: UserSession) => void;
  onSendDrVital: (userSession: UserSession) => void;
  sendingDrVital: string | null;
  getStatusBadge: (userSession: UserSession) => React.ReactNode;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  userSession,
  onStartSession,
  onCompleteSession,
  onOpenReview,
  onRequestEarlyRelease,
  onOpenTools,
  onSendDrVital,
  sendingDrVital,
  getStatusBadge,
}) => {
  return (
    <Card 
      id={`session-${userSession.id}`}
      className={`
        group relative overflow-hidden cursor-pointer transition-all duration-300 
        hover:scale-[1.02] hover:shadow-2xl border-0 shadow-lg backdrop-blur-sm
        print:shadow-none print:border print:hover:scale-100 print:break-inside-avoid
        ${userSession.status === 'pending' ? 'bg-gradient-to-br from-yellow-50/90 via-amber-50/80 to-orange-50/70 print:bg-yellow-50 print:border-yellow-300' : ''}
        ${userSession.status === 'in_progress' ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-violet-50/70 print:bg-blue-50 print:border-blue-300' : ''}
        ${userSession.status === 'completed' ? 'bg-gradient-to-br from-green-50/90 via-emerald-50/80 to-teal-50/70 print:bg-green-50 print:border-green-300' : ''}
        ${userSession.is_locked ? 'bg-gradient-to-br from-gray-50/90 via-slate-50/80 to-zinc-50/70 print:bg-gray-50 print:border-gray-300' : ''}
      `}
    >
      {/* Status Badge flutuante */}
      <div className="absolute top-3 right-3 z-20">
        {getStatusBadge(userSession)}
      </div>

      {/* Overlay sutil - Hidden on print */}
      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 print:hidden" />

      <CardContent className="relative p-6 h-full flex flex-col z-10 print:p-4">
        {/* Header com ícone e título */}
        <div className="text-center mb-4 print:mb-2">
          <div className="relative w-16 h-16 mx-auto mb-4 print:w-12 print:h-12 print:mb-2">
            <div className={`
              w-full h-full rounded-full flex items-center justify-center shadow-lg print:shadow-none
              ${userSession.status === 'pending' ? 'bg-gradient-to-br from-yellow-100 to-amber-200 print:bg-yellow-100' : ''}
              ${userSession.status === 'in_progress' ? 'bg-gradient-to-br from-blue-100 to-indigo-200 print:bg-blue-100' : ''}
              ${userSession.status === 'completed' ? 'bg-gradient-to-br from-green-100 to-emerald-200 print:bg-green-100' : ''}
              ${userSession.is_locked ? 'bg-gradient-to-br from-gray-100 to-slate-200 print:bg-gray-100' : ''}
            `}>
              <BookOpen className={`
                w-8 h-8 transition-transform duration-300 group-hover:scale-110 print:w-6 print:h-6
                ${userSession.status === 'pending' ? 'text-yellow-600' : ''}
                ${userSession.status === 'in_progress' ? 'text-blue-600' : ''}
                ${userSession.status === 'completed' ? 'text-green-600' : ''}
                ${userSession.is_locked ? 'text-gray-500' : ''}
              `} />
            </div>
          </div>
          <h3 className="font-bold text-base text-center leading-tight mb-2 line-clamp-2 text-gray-800 print:text-sm print:mb-1">
            {userSession.sessions.title}
          </h3>
        </div>

        {/* Progresso com animação */}
        <div className="mb-4 print:mb-2">
          <div className="flex justify-between items-center mb-2 print:mb-1">
            <span className="text-sm font-medium text-gray-600 print:text-xs">Progresso</span>
            <span className="text-sm font-bold text-gray-800 print:text-xs">{userSession.progress}%</span>
          </div>
          <div className="relative">
            <Progress 
              value={userSession.progress} 
              className="h-3 bg-gray-200/50 print:h-2" 
            />
            {userSession.progress > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                             transform -skew-x-12 animate-pulse opacity-50 print:hidden" />
            )}
          </div>
        </div>

        {/* Badges informativos */}
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          <Badge 
            variant="secondary" 
            className={`
              text-xs font-semibold px-3 py-1 rounded-full shadow-sm
              ${userSession.sessions.difficulty === 'beginner' ? 'bg-green-100 text-green-700 border-green-200' : ''}
              ${userSession.sessions.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
              ${userSession.sessions.difficulty === 'advanced' ? 'bg-red-100 text-red-700 border-red-200' : ''}
            `}
          >
            {userSession.sessions.difficulty}
          </Badge>
          <Badge 
            variant="secondary" 
            className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700 border-purple-200 shadow-sm"
          >
            <Timer className="w-3 h-3 mr-1" />
            {userSession.sessions.estimated_time}min
          </Badge>
        </div>

        {/* Botões de Ação */}
        <div className="mt-auto space-y-3 print:hidden">
          <SessionActions
            userSession={userSession}
            onStartSession={onStartSession}
            onCompleteSession={onCompleteSession}
            onOpenReview={onOpenReview}
            onRequestEarlyRelease={onRequestEarlyRelease}
            onOpenTools={onOpenTools}
            onSendDrVital={onSendDrVital}
            sendingDrVital={sendingDrVital}
          />

          {/* Data de atribuição */}
          <div className="text-xs text-center p-2 bg-gray-50/50 rounded-lg text-gray-500 print:block print:p-1 print:bg-transparent">
            📅 {new Date(userSession.assigned_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
        
        {/* Print-only: Status text */}
        <div className="hidden print:block text-center mt-2 pt-2 border-t border-gray-200">
          <span className={`text-xs font-medium ${
            userSession.status === 'pending' ? 'text-yellow-700' : 
            userSession.status === 'in_progress' ? 'text-blue-700' : 
            userSession.status === 'completed' ? 'text-green-700' : 'text-gray-600'
          }`}>
            {userSession.status === 'pending' ? '⏳ Pendente' : 
             userSession.status === 'in_progress' ? '▶️ Em Progresso' : 
             userSession.status === 'completed' ? '✅ Completa' : 'Status: ' + userSession.status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
