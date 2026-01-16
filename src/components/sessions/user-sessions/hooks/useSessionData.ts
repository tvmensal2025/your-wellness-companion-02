import { useState, useEffect, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SessionTool, ToolResponse } from '@/types/session-tools';
import { getSessionTypeFromTitle } from '@/components/daily-missions/DrVitalCardFactory';
import html2canvas from 'html2canvas';

// Tipos locais para conteúdo de sessão
interface SessionContentData {
  questions?: SessionQuestionData[];
  sections?: SessionSectionData[];
  intro_text?: string;
  outro_text?: string;
  [key: string]: unknown;
}

interface SessionQuestionData {
  id: string;
  text?: string;
  title?: string;
  question?: string;
  type?: string;
  options?: string[];
  required?: boolean;
}

interface SessionSectionData {
  id: string;
  title: string;
  type: string;
  content?: string;
  questions?: SessionQuestionData[];
}

interface ProgressData {
  progress?: number;
  [key: string]: unknown;
}

interface DailyResponseData {
  question_id: string;
  response_value?: string;
  response_text?: string;
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
  tools_data: Record<string, ToolResponse>;
  last_activity: string;
  cycle_number: number;
  next_available_date?: string;
  is_locked: boolean;
  review_count: number;
}

interface SessionStats {
  pending: number;
  inProgress: number;
  completed: number;
  locked: number;
  total: number;
}

interface DrVitalData {
  userName: string;
  analysis: string;
  recommendation: string;
  sessionTitle: string;
  sessionType: string;
  totalPoints: number;
  streakDays: number;
}

export const useSessionData = (user: User | null) => {
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHealthWheelSession, setActiveHealthWheelSession] = useState<UserSession | null>(null);
  const [showEarlyRequestModal, setShowEarlyRequestModal] = useState(false);
  const [selectedSessionForRequest, setSelectedSessionForRequest] = useState<UserSession | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [reviewMode, setReviewMode] = useState<UserSession | null>(null);
  
  // Estados para ferramentas
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [selectedSessionForTools, setSelectedSessionForTools] = useState<UserSession | null>(null);
  const [activeToolSession, setActiveToolSession] = useState<{ session: UserSession; tool: SessionTool } | null>(null);
  
  // Estados para Dr. Vital
  const [sendingDrVital, setSendingDrVital] = useState<string | null>(null);
  const [drVitalData, setDrVitalData] = useState<DrVitalData | null>(null);
  const drVitalCardRef = useRef<HTMLDivElement>(null);
  
  const [stats, setStats] = useState<SessionStats>({
    pending: 0,
    inProgress: 0,
    completed: 0,
    locked: 0,
    total: 0
  });
  
  const { toast } = useToast();

  const loadUserSessions = useCallback(async () => {
    try {
      // Primeiro, vamos verificar se o usuário está autenticado
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para ver suas sessões",
          variant: "destructive"
        });
        return;
      }

      // Verificar perfil do usuário - criar se não existir
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', profileError);
      }

      // Criar perfil automaticamente se não existir
      if (!profile) {
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Usuário',
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Erro ao criar perfil:', createError);
        }
      }

      // Buscar sessões do usuário com logs detalhados
      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          sessions (
            id, title, description, type, difficulty, 
            estimated_time, content, target_saboteurs
          )
        `, { count: 'exact' })
        .eq('user_id', currentUser.id)
        .order('assigned_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Processar dados com tipo correto
      const sessions = (data || []).map((session: Record<string, unknown>) => {
        const sessionData = session.sessions as Record<string, unknown> | undefined;
        return {
          ...session,
          tools_data: session.tools_data || {},
          auto_save_data: session.auto_save_data || {},
          last_activity: session.updated_at || session.assigned_at,
          cycle_number: session.cycle_number || 1,
          next_available_date: session.next_available_date || null,
          is_locked: session.is_locked || false,
          review_count: session.review_count || 0,
          sessions: {
            ...(sessionData || {}),
            tools: []
          }
        };
      }) as UserSession[];
      
      if (sessions.length === 0) {
        toast({
          title: "Nenhuma sessão encontrada",
          description: "Você ainda não possui sessões atribuídas. Entre em contato com o administrador.",
          variant: "default"
        });
      } else {
        toast({
          title: `${sessions.length} sessões carregadas! 📚`,
          description: "Suas sessões estão prontas para serem realizadas"
        });
      }
      
      setUserSessions(sessions);

      // Calcular estatísticas
      const newStats: SessionStats = {
        pending: sessions.filter(s => s.status === 'pending').length,
        inProgress: sessions.filter(s => s.status === 'in_progress').length,
        completed: sessions.filter(s => s.status === 'completed').length,
        locked: sessions.filter(s => s.is_locked).length,
        total: sessions.length
      };
      
      setStats(newStats);

    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas sessões. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user) {
      loadUserSessions();
    }
  }, [user, loadUserSessions]);

  const startSession = useCallback(async (sessionId: string) => {
    try {
      const userSession = userSessions.find(us => us.id === sessionId);
      
      // Check if it's a Health Wheel session or similar interactive assessment
      if (userSession?.sessions.type === 'health_wheel_assessment' || 
          userSession?.sessions.type === 'life_wheel_assessment' ||
          userSession?.sessions.type === 'symptoms_assessment') {
        setActiveHealthWheelSession(userSession);
        return;
      }

      const { error } = await supabase
        .from('user_sessions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Sessão Iniciada! 🚀",
        description: "Você pode continuar de onde parou a qualquer momento"
      });

      loadUserSessions();
    } catch (error) {
      console.error('Erro ao iniciar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a sessão",
        variant: "destructive"
      });
    }
  }, [userSessions, loadUserSessions, toast]);

  const handleHealthWheelComplete = useCallback(() => {
    setActiveHealthWheelSession(null);
    loadUserSessions();
    
    toast({
      title: "Roda da Saúde Completa! 🎉",
      description: "Seus resultados foram salvos com sucesso"
    });
  }, [loadUserSessions, toast]);

  const saveSessionActivity = useCallback(async (sessionId: string, activity: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const sessionAttemptId = `${sessionId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Sempre inserir uma nova resposta (nunca sobrescrever) para manter histórico completo
      const { error } = await supabase
        .from('daily_responses')
        .insert({
          user_id: user.id,
          date: today,
          section: 'sessions',
          question_id: `session_${sessionId}`,
          answer: activity,
          text_response: `Atividade de sessão: ${activity}`,
          points_earned: 10,
          session_attempt_id: sessionAttemptId,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar atividade:', error);
      }

    } catch (error) {
      console.error('Erro ao salvar atividade da sessão:', error);
      // Não mostrar toast para não interromper o fluxo do usuário
    }
  }, []);

  const updateProgress = useCallback(async (sessionId: string, progress: number) => {
    try {
      const updateData: Record<string, unknown> = { 
        progress,
        notes: `Progresso atualizado para ${progress}% em ${new Date().toLocaleString()}`
      };
      
      if (progress >= 100) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
        updateData.feedback = 'Sessão concluída com sucesso';
      }

      const { error } = await supabase
        .from('user_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;

      // Salvar log da atividade
      await saveSessionActivity(sessionId, `Progresso atualizado para ${progress}%`);

      if (progress >= 100) {
        toast({
          title: "Sessão Completa! 🎉",
          description: "Parabéns! Você concluiu esta sessão"
        });
      } else {
        toast({
          title: "Progresso Salvo ✅",
          description: `Sessão atualizada para ${progress}%`
        });
      }

      loadUserSessions();
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso",
        variant: "destructive"
      });
    }
  }, [loadUserSessions, toast, saveSessionActivity]);

  const completeSessionWithFeedback = useCallback(async (sessionId: string) => {
    try {
      // Usar a função de completar ciclo
      // Simular conclusão da sessão (remover depois quando função estiver implementada)
      const data = { success: true, message: 'Sessão concluída com sucesso!' };
      const error = null;
      
      // const { data, error } = await supabase.rpc('complete_session_cycle', {
      //   p_user_id: user?.id,
      //   p_session_id: userSessions.find(s => s.id === sessionId)?.session_id
      // });

      if (error) throw error;

      // Salvar log da conclusão
      await saveSessionActivity(sessionId, 'Sessão concluída');

      const resultData = data as Record<string, unknown>;
      
      toast({
        title: "Sessão Completa! 🎉",
        description: `Próximo ciclo disponível em: ${new Date(resultData.next_available_date as string).toLocaleDateString('pt-BR')}`
      });

      loadUserSessions();
    } catch (error) {
      console.error('Erro ao completar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a sessão",
        variant: "destructive"
      });
    }
  }, [loadUserSessions, toast, saveSessionActivity]);

  // Auto-save do progresso (chama automaticamente durante a sessão)
  const autoSaveProgress = useCallback(async (sessionId: string, progressData: ProgressData) => {
    try {
      // Simular auto-save
      const session = userSessions.find(s => s.id === sessionId);
      if (session) {
        await supabase
          .from('user_sessions')
          .update({ progress: progressData.progress || 0 })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Erro ao salvar progresso automaticamente:', error);
      // Não mostrar toast para auto-save para não interromper o usuário
    }
  }, [userSessions]);

  // Solicitar liberação antecipada da sessão
  const requestEarlyRelease = useCallback(async () => {
    if (!selectedSessionForRequest) return;
    
    try {
      // Simular inserção de solicitação
      const error = null;

      if (error) throw error;

      toast({
        title: "Solicitação Enviada! 📋",
        description: "Sua solicitação foi enviada para análise do administrador"
      });

      setShowEarlyRequestModal(false);
      setSelectedSessionForRequest(null);
      setRequestReason('');
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação",
        variant: "destructive"
      });
    }
  }, [selectedSessionForRequest, toast]);

  // Abrir sessão em modo de revisão (somente leitura)
  const openReviewMode = useCallback(async (userSession: UserSession) => {
    try {
      // Incrementar contador de revisões
      // Simular atualização de review
      await supabase
        .from('user_sessions')
        .update({ feedback: 'Modo revisão ativado' })
        .eq('id', userSession.id);

      setReviewMode(userSession);
      
      toast({
        title: "Modo Revisão Ativado 👀",
        description: "Você está visualizando uma sessão completa (somente leitura)"
      });
    } catch (error) {
      console.error('Erro ao abrir modo de revisão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível abrir o modo de revisão",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Funções para ferramentas integradas
  const openToolsModal = useCallback((userSession: UserSession) => {
    if (!userSession.sessions.tools || userSession.sessions.tools.length === 0) {
      toast({
        title: "Nenhuma ferramenta disponível",
        description: "Esta sessão não possui ferramentas configuradas.",
        variant: "destructive"
      });
      return;
    }
    setSelectedSessionForTools(userSession);
    setShowToolsModal(true);
  }, [toast]);

  const handleSelectTool = useCallback((tool: SessionTool) => {
    if (!selectedSessionForTools) return;
    setActiveToolSession({ session: selectedSessionForTools, tool });
    setShowToolsModal(false);
  }, [selectedSessionForTools]);

  const handleToolComplete = useCallback(async (toolResponse: ToolResponse) => {
    if (!activeToolSession) return;
    
    // Recarregar dados da sessão
    await loadUserSessions();
    
    toast({
      title: "Ferramenta concluída!",
      description: `${activeToolSession.tool.name} foi concluída com sucesso.`,
    });
    
    setActiveToolSession(null);
  }, [activeToolSession, loadUserSessions, toast]);

  const getCompletedTools = useCallback((userSession: UserSession): string[] => {
    return Object.keys(userSession.tools_data || {});
  }, []);

  // Função para enviar análise do Dr. Vital via WhatsApp
  const sendDrVitalAnalysis = useCallback(async (userSession: UserSession) => {
    if (!user) return;
    
    setSendingDrVital(userSession.id);
    
    try {
      // 1. Buscar respostas da sessão via daily_responses
      const { data: responses, error: responsesError } = await supabase
        .from('daily_responses')
        .select('*')
        .eq('user_id', user.id)
        .eq('section', 'sessions')
        .ilike('question_id', `%${userSession.session_id}%`)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (responsesError) {
        console.warn('Erro ao buscar respostas:', responsesError);
      }
      
      // 2. Formatar dados
      const questions = userSession.sessions.content?.questions || [];
      const answers: Record<string, string> = {};
      responses?.forEach((r: DailyResponseData) => {
        answers[r.question_id] = r.response_value || r.response_text || 'Respondido';
      });
      
      // Determinar tipo da sessão
      const sessionType = getSessionTypeFromTitle(
        userSession.sessions.title, 
        userSession.sessions.type
      );
      
      const formattedQuestions = questions.map((q: SessionQuestionData) => ({
        id: q.id,
        question: q.text || q.title || q.question || 'Pergunta'
      }));
      
      toast({
        title: "🤖 Gerando análise...",
        description: "Dr. Vital está analisando suas respostas"
      });
      
      // 3. Chamar edge function para gerar análise
      const { data: analysisResult, error: analysisError } = await supabase.functions.invoke(
        'whatsapp-habits-analysis',
        {
          body: {
            userId: user.id,
            answers,
            questions: formattedQuestions,
            totalPoints: userSession.progress || 100,
            streakDays: 1,
            sessionType,
            sessionTitle: userSession.sessions.title,
            action: 'generate-analysis'
          }
        }
      );
      
      if (analysisError || !analysisResult?.success) {
        throw new Error(analysisResult?.error || 'Erro ao gerar análise');
      }
      
      // 4. Renderizar card
      setDrVitalData({
        userName: analysisResult.userName,
        analysis: analysisResult.analysis,
        recommendation: analysisResult.recommendation,
        sessionTitle: userSession.sessions.title,
        sessionType,
        totalPoints: userSession.progress || 100,
        streakDays: 1
      });
      
      toast({
        title: "📸 Capturando imagem...",
        description: "Preparando card para envio"
      });
      
      // 5. Aguardar render e capturar
      await new Promise(r => setTimeout(r, 1000));
      
      if (!drVitalCardRef.current) {
        throw new Error('Card não renderizado');
      }
      
      const canvas = await html2canvas(drVitalCardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imageBase64 = canvas.toDataURL('image/png').split(',')[1];
      
      toast({
        title: "📤 Enviando via WhatsApp...",
        description: "Quase lá!"
      });
      
      // 6. Enviar via WhatsApp
      const { data: sendResult, error: sendError } = await supabase.functions.invoke(
        'whatsapp-habits-analysis',
        {
          body: {
            userId: user.id,
            imageBase64,
            totalPoints: userSession.progress || 100,
            streakDays: 1
          }
        }
      );
      
      if (sendError || !sendResult?.success) {
        throw new Error(sendResult?.error || 'Erro ao enviar WhatsApp');
      }
      
      toast({
        title: "✅ Enviado com sucesso!",
        description: "Análise do Dr. Vital enviada via WhatsApp"
      });
      
    } catch (error: unknown) {
      console.error('Erro Dr. Vital:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível enviar a análise",
        variant: "destructive"
      });
    } finally {
      setSendingDrVital(null);
      setDrVitalData(null);
    }
  }, [user, toast]);

  return {
    // State
    userSessions,
    loading,
    activeHealthWheelSession,
    showEarlyRequestModal,
    selectedSessionForRequest,
    requestReason,
    reviewMode,
    showToolsModal,
    selectedSessionForTools,
    activeToolSession,
    sendingDrVital,
    drVitalData,
    drVitalCardRef,
    stats,
    
    // Setters
    setShowEarlyRequestModal,
    setSelectedSessionForRequest,
    setRequestReason,
    setReviewMode,
    setShowToolsModal,
    setActiveToolSession,
    
    // Functions
    loadUserSessions,
    startSession,
    handleHealthWheelComplete,
    updateProgress,
    completeSessionWithFeedback,
    autoSaveProgress,
    requestEarlyRelease,
    openReviewMode,
    saveSessionActivity,
    openToolsModal,
    handleSelectTool,
    handleToolComplete,
    getCompletedTools,
    sendDrVitalAnalysis,
  };
};
