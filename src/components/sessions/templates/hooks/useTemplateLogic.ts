/**
 * Custom hook for session template logic
 * Extracted from SessionTemplates.tsx as part of refactoring
 * **Validates: Requirements 1.4**
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { buildSessionPayload } from './sessionPayloadBuilder';

export interface Template {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  questions?: number;
  areas?: number;
  dbCount?: number;
  assignedCount?: number;
}

export interface SessionStats {
  totalSessions: number;
  totalAssignments: number;
  sessionsByType: Record<string, { count: number; assignments: number }>;
}

export const useTemplateLogic = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    totalAssignments: 0,
    sessionsByType: {}
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { toast } = useToast();

  const getTemplateKeyFromTitle = useCallback((title: string): string => {
    if (title.includes('12 Áreas') || title.includes('12 áreas')) return '12-areas';
    if (title.includes('147')) return '147-perguntas';
    if (title.includes('8 Pilares') || title.includes('Financeiro')) return '8-pilares';
    if (title.includes('8 Competências') || title.includes('Competências')) return '8-competencias';
    if (title.includes('Sabotadores') || title.includes('24 Sabotadores')) return 'sabotadores';
    if (title.includes('Sono') || title.includes('Sleep')) return 'sono';
    if (title.includes('Estresse') || title.includes('Ansiedade')) return 'estresse';
    if (title.includes('Bem-estar') || title.includes('Mindfulness')) return 'bem-estar';
    if (title.includes('Hábitos Alimentares') || title.includes('Alimentar')) return 'habitos-alimentares';
    if (title.includes('Hidratação') || title.includes('Água')) return 'hidratacao';
    if (title.includes('Rotina') || title.includes('Diária')) return 'rotina-diaria';
    if (title.includes('Objetivos') || title.includes('Metas de Saúde')) return 'objetivos-saude';
    if (title.includes('Motivação') || title.includes('Energia Mental')) return 'motivacao';
    if (title.includes('Anamnese') || title.includes('Histórico')) return 'anamnese';
    if (title.includes('Atividade Física') || title.includes('Exercício')) return 'atividade-fisica';
    return 'other';
  }, []);

  // Fetch statistics from database
  const fetchStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      
      // Fetch all sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('id, title, type, is_active')
        .limit(1000);
      
      if (sessionsError) throw sessionsError;
      
      // Fetch all assignments
      const { data: assignments, error: assignmentsError } = await supabase
        .from('user_sessions')
        .select('session_id')
        .limit(5000);
      
      if (assignmentsError) throw assignmentsError;
      
      // Process statistics by type
      const sessionsByType: Record<string, { count: number; assignments: number }> = {};
      
      sessions?.forEach(session => {
        const typeKey = getTemplateKeyFromTitle(session.title);
        if (!sessionsByType[typeKey]) {
          sessionsByType[typeKey] = { count: 0, assignments: 0 };
        }
        sessionsByType[typeKey].count++;
      });
      
      // Count assignments per session
      assignments?.forEach(assignment => {
        const session = sessions?.find(s => s.id === assignment.session_id);
        if (session) {
          const typeKey = getTemplateKeyFromTitle(session.title);
          if (sessionsByType[typeKey]) {
            sessionsByType[typeKey].assignments++;
          }
        }
      });
      
      setStats({
        totalSessions: sessions?.length || 0,
        totalAssignments: assignments?.length || 0,
        sessionsByType
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: 'Erro ao carregar estatísticas',
        description: 'Não foi possível carregar as estatísticas das sessões.',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, [getTemplateKeyFromTitle, toast]);

  // Load statistics on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Create session and assign to current user
  const createSessionAndAssignToCurrentUser = useCallback(async (templateId: string) => {
    try {
      setIsCreating(templateId);
      setSelectedTemplate(templateId);
      
      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth?.user;
      
      if (!currentUser) {
        toast({ 
          title: 'Autenticação necessária', 
          description: 'Faça login para criar a sessão.', 
          variant: 'destructive' 
        });
        return;
      }
      
      const payload = buildSessionPayload(templateId);
      
      if (!payload) {
        toast({ 
          title: 'Template inválido', 
          description: 'Template não encontrado.', 
          variant: 'destructive' 
        });
        return;
      }
      
      const sessionInsert = { 
        ...payload, 
        created_by: currentUser.id, 
        is_active: true 
      };
      
      const { data: createdSession, error: createError } = await supabase
        .from('sessions')
        .insert(sessionInsert)
        .select()
        .single();
      
      if (createError) throw createError;
      
      const assignment = { 
        user_id: currentUser.id, 
        session_id: createdSession.id, 
        status: 'pending' as const, 
        progress: 0, 
        assigned_at: new Date().toISOString() 
      };
      
      const { error: assignError } = await supabase
        .from('user_sessions')
        .upsert([assignment], { onConflict: 'user_id,session_id' });
      
      if (assignError) throw assignError;
      
      toast({ 
        title: 'Sessão criada!', 
        description: 'Template aplicado e sessão atribuída a você.' 
      });
      
      // Update statistics
      setStats(prev => ({
        ...prev,
        totalSessions: prev.totalSessions + 1,
        totalAssignments: prev.totalAssignments + 1,
        sessionsByType: {
          ...prev.sessionsByType,
          [templateId]: {
            count: (prev.sessionsByType[templateId]?.count || 0) + 1,
            assignments: (prev.sessionsByType[templateId]?.assignments || 0) + 1
          }
        }
      }));
    } catch (error) {
      console.error('Erro ao usar template:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente.';
      toast({ 
        title: 'Erro ao criar sessão', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsCreating(null);
    }
  }, [toast]);

  // Handle use template action
  const handleUseTemplate = useCallback((templateId: string) => {
    void createSessionAndAssignToCurrentUser(templateId);
  }, [createSessionAndAssignToCurrentUser]);

  // Send template to all users
  const handleSendToAll = useCallback(async (templateId: string) => {
    try {
      setIsCreating(templateId);
      const payload = buildSessionPayload(templateId);
      
      if (!payload) return;
      
      const { data: createdSession, error: createError } = await supabase
        .from('sessions')
        .insert({ ...payload, is_active: true })
        .select()
        .single();
      
      if (createError) throw createError;

      const { error: rpcError } = await supabase.rpc('assign_session_to_all_users', { 
        session_id_param: createdSession.id 
      });
      
      if (rpcError) throw rpcError;
      
      toast({ 
        title: '✅ Sucesso!', 
        description: 'Sessão criada e enviada para todos os usuários.' 
      });
      
      // Update statistics
      setStats(prev => ({ 
        ...prev, 
        totalSessions: prev.totalSessions + 1 
      }));
    } catch (error) {
      console.error('Erro ao enviar para todos:', error);
      const errorMessage = error instanceof Error ? error.message : 'Tente novamente.';
      toast({ 
        title: 'Erro ao enviar', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setIsCreating(null);
    }
  }, [toast]);

  // Send template to selected users
  const handleSendToSelected = useCallback(async () => {
    if (!selectedTemplate || selectedUsers.length === 0) {
      toast({ 
        title: "⚠️ Atenção", 
        description: "Selecione pelo menos um usuário", 
        variant: "destructive" 
      });
      return;
    }
    
    try {
      setIsCreating(selectedTemplate);
      const payload = buildSessionPayload(selectedTemplate);
      
      if (!payload) return;
      
      const { data: createdSession, error: createError } = await supabase
        .from('sessions')
        .insert({ ...payload, is_active: true })
        .select()
        .single();
      
      if (createError) throw createError;

      const { error: rpcError } = await supabase.rpc('assign_session_to_users', { 
        session_id_param: createdSession.id, 
        user_ids_param: selectedUsers 
      });
      
      if (rpcError) throw rpcError;
      
      toast({ 
        title: "✅ Sucesso!", 
        description: `Sessão criada e enviada para ${selectedUsers.length} usuário(s)` 
      });
      
      setSelectedTemplate(null);
      setSelectedUsers([]);
    } catch (error) {
      console.error('Erro ao enviar para selecionados:', error);
      const errorMessage = error instanceof Error ? error.message : 'Não foi possível enviar a sessão';
      toast({ 
        title: "❌ Erro", 
        description: errorMessage, 
        variant: "destructive" 
      });
    } finally {
      setIsCreating(null);
    }
  }, [selectedTemplate, selectedUsers, toast]);

  return {
    // State
    selectedTemplate,
    isCreating,
    selectedUsers,
    stats,
    isLoadingStats,
    
    // Actions
    setSelectedTemplate,
    setSelectedUsers,
    handleUseTemplate,
    handleSendToAll,
    handleSendToSelected,
    
    // Utilities
    getTemplateKeyFromTitle,
    buildSessionPayload
  };
};


// Category tags for template visualization
export const categoryTags: Record<string, { tags: string[]; bgColor: string; textColor: string }> = {
  '12-areas': {
    tags: ['Saúde', 'Família', 'Carreira', 'Finanças', 'Relacionamentos', 'Diversão', 'Crescimento'],
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800'
  },
  '147-perguntas': {
    tags: ['Digestivo', 'Respiratório', 'Cardiovascular', 'Neurológico', 'Musculoesquelético', 'Imunológico'],
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800'
  },
  '8-pilares': {
    tags: ['Mindset', 'Planejamento', 'Investimentos', 'Renda', 'Gastos', 'Proteção', 'Impostos'],
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800'
  },
  '8-competencias': {
    tags: ['Liderança', 'Comunicação', 'Inovação', 'Estratégia', 'Execução', 'Relacionamento', 'Adaptabilidade'],
    bgColor: 'bg-red-100',
    textColor: 'text-red-800'
  },
  'sabotadores': {
    tags: ['Comportamentais', 'Psicológicos', 'Relacionais', 'Físicos', 'Temporais', 'Socioeconômicos'],
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800'
  },
  'sono': {
    tags: ['Duração', 'Qualidade', 'Facilidade', 'Despertar', 'Energia', 'Regularidade'],
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-800'
  },
  'estresse': {
    tags: ['Estresse', 'Ansiedade', 'Tensão', 'Preocupações', 'Irritabilidade', 'Concentração'],
    bgColor: 'bg-pink-100',
    textColor: 'text-pink-800'
  },
  'bem-estar': {
    tags: ['Presença', 'Gratidão', 'Autocuidado', 'Conexão', 'Propósito', 'Paz'],
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-800'
  }
};
