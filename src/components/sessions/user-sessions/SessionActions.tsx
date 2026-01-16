import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Lock, PlayCircle, BookOpen, CheckCircle, Send, Eye, Download,
  Wrench, Loader2, Stethoscope
} from 'lucide-react';

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

interface SessionActionsProps {
  userSession: UserSession;
  onStartSession: (sessionId: string) => void;
  onCompleteSession: (sessionId: string) => void;
  onOpenReview: (userSession: UserSession) => void;
  onRequestEarlyRelease: (userSession: UserSession) => void;
  onOpenTools: (userSession: UserSession) => void;
  onSendDrVital: (userSession: UserSession) => void;
  sendingDrVital: string | null;
}

export const SessionActions: React.FC<SessionActionsProps> = ({
  userSession,
  onStartSession,
  onCompleteSession,
  onOpenReview,
  onRequestEarlyRelease,
  onOpenTools,
  onSendDrVital,
  sendingDrVital,
}) => {
  // Sessão Bloqueada - Ciclo de 30 dias
  if (userSession.is_locked) {
    return (
      <div className="space-y-3">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full rounded-full bg-gray-50/50 border-gray-300 text-gray-600 
                   hover:bg-gray-100 transition-all duration-300 shadow-sm"
          disabled
        >
          <Lock className="w-4 h-4 mr-2" />
          Sessão Bloqueada
        </Button>
        {userSession.next_available_date && (
          <div className="text-xs text-center p-2 bg-gray-50 rounded-lg text-gray-600">
            📅 Disponível em: {new Date(userSession.next_available_date).toLocaleDateString('pt-BR')}
          </div>
        )}
        <Button 
          onClick={() => onRequestEarlyRelease(userSession)}
          variant="outline"
          size="sm"
          className="w-full rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 
                   transition-all duration-300 shadow-sm"
        >
          <Send className="w-4 h-4 mr-2" />
          Solicitar Liberação
        </Button>
      </div>
    );
  }

  // Sessão Pendente
  if (userSession.status === 'pending') {
    return (
      <Button 
        onClick={() => onStartSession(userSession.id)}
        size="sm"
        className="w-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 
                 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold
                 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        <PlayCircle className="w-4 h-4 mr-2" />
        Iniciar Sessão
      </Button>
    );
  }
  
  // Sessão em Progresso
  if (userSession.status === 'in_progress') {
    return (
      <div className="space-y-2">
        <Button 
          onClick={() => onStartSession(userSession.id)}
          variant="default" 
          size="sm"
          className="w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 
                   hover:from-blue-600 hover:to-indigo-600 text-white font-semibold
                   shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Continuar
        </Button>
        {userSession.auto_save_data && Object.keys(userSession.auto_save_data).length > 0 && (
          <div className="text-xs text-center p-2 bg-green-50 rounded-lg text-green-600 font-medium">
            💾 Auto-save ativo
          </div>
        )}
        {userSession.progress < 100 && (
          <Button 
            onClick={() => onCompleteSession(userSession.id)}
            variant="secondary"
            size="sm"
            className="w-full rounded-full border-green-200 text-green-600 hover:bg-green-50 
                     transition-all duration-300 shadow-sm"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizar Ciclo
          </Button>
        )}
      </div>
    );
  }
  
  // Sessão Completa - Modo Revisão
  if (userSession.status === 'completed') {
    return (
      <div className="space-y-2">
        {/* BOTÃO DR. VITAL - DESTAQUE */}
        <Button 
          onClick={() => onSendDrVital(userSession)}
          disabled={sendingDrVital === userSession.id}
          size="sm"
          className="w-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 
                   hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-semibold
                   shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          {sendingDrVital === userSession.id ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando Análise...
            </>
          ) : (
            <>
              <Stethoscope className="w-4 h-4 mr-2" />
              🩺 Dr. Vital no WhatsApp
            </>
          )}
        </Button>
        
        <Button 
          onClick={() => onOpenReview(userSession)}
          variant="outline" 
          size="sm"
          className="w-full rounded-full border-green-200 text-green-600 hover:bg-green-50 
                   transition-all duration-300 shadow-sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          Revisar Sessão
        </Button>
        <Button 
          onClick={() => {
            // Trigger print for this specific session
            const sessionCard = document.getElementById(`session-${userSession.id}`);
            if (sessionCard) {
              sessionCard.classList.add('print-single-session');
              window.print();
              sessionCard.classList.remove('print-single-session');
            }
          }}
          variant="outline" 
          size="sm"
          className="w-full rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 
                   transition-all duration-300 shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Baixar Respostas
        </Button>
        {userSession.review_count > 0 && (
          <div className="text-xs text-center p-2 bg-blue-50 rounded-lg text-blue-600">
            👁️ Revisada {userSession.review_count}x
          </div>
        )}
        <div className="text-xs text-center p-2 bg-green-50 rounded-lg text-green-600 font-medium">
          ✅ Ciclo {userSession.cycle_number} completo
        </div>
      </div>
    );
  }
  
  // Botão para Ferramentas (disponível em qualquer status)
  if (userSession.sessions.tools && userSession.sessions.tools.length > 0) {
    return (
      <Button 
        onClick={() => onOpenTools(userSession)}
        variant="outline"
        size="sm"
        className="w-full rounded-full border-purple-200 text-purple-600 hover:bg-purple-50 
                 transition-all duration-300 shadow-sm"
      >
        <Wrench className="w-4 h-4 mr-2" />
        Ferramentas ({userSession.sessions.tools.length})
      </Button>
    );
  }

  return null;
};
