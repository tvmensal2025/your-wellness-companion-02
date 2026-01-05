// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Clock, Target, Brain, DollarSign, Star, Zap, Send, CheckCircle, Database, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserSelector } from './UserSelector';

interface Template {
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

interface SessionStats {
  totalSessions: number;
  totalAssignments: number;
  sessionsByType: Record<string, { count: number; assignments: number }>;
}

const SessionTemplates: React.FC = () => {
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

  // Carregar estatísticas reais do banco
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        
        // Buscar todas as sessões
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('id, title, type, is_active');
        
        if (sessionsError) throw sessionsError;
        
        // Buscar todas as atribuições
        const { data: assignments, error: assignmentsError } = await supabase
          .from('user_sessions')
          .select('session_id');
        
        if (assignmentsError) throw assignmentsError;
        
        // Processar estatísticas por tipo
        const sessionsByType: Record<string, { count: number; assignments: number }> = {};
        
        sessions?.forEach(session => {
          const typeKey = getTemplateKeyFromTitle(session.title);
          if (!sessionsByType[typeKey]) {
            sessionsByType[typeKey] = { count: 0, assignments: 0 };
          }
          sessionsByType[typeKey].count++;
        });
        
        // Contar atribuições por sessão
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
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchStats();
  }, []);

  const getTemplateKeyFromTitle = (title: string): string => {
    if (title.includes('12 Áreas') || title.includes('12 áreas')) return '12-areas';
    if (title.includes('147')) return '147-perguntas';
    if (title.includes('8 Pilares') || title.includes('Financeiro')) return '8-pilares';
    if (title.includes('8 Competências') || title.includes('Competências')) return '8-competencias';
    return 'other';
  };

  const templates: Template[] = [
    {
      id: '12-areas',
      title: 'Avaliação das 12 Áreas da Vida',
      description: 'Avalie o equilíbrio das 12 áreas fundamentais da vida através de uma interface interativa com emojis. Receba análises personalizadas e um plano de ação para melhorar seu bem-estar geral.',
      duration: '10-15 minutos',
      category: 'Avaliação Geral',
      icon: <Target className="w-6 h-6" />,
      features: ['Seleção por Emojis', 'Roda Radar Visual', 'Plano de Ação'],
      color: 'bg-blue-500',
      areas: 12,
      dbCount: stats.sessionsByType['12-areas']?.count || 0,
      assignedCount: stats.sessionsByType['12-areas']?.assignments || 0
    },
    {
      id: '147-perguntas',
      title: 'Mapeamento de Sintomas (147 Perguntas)',
      description: 'Mapeamento completo de sintomas em 12 sistemas corporais com avaliação de frequência e intensidade. Sistema adaptativo que coleta dados para visualização em roda e evolução temporal.',
      duration: '12-15 minutos',
      category: 'Sintomas',
      icon: <Brain className="w-6 h-6" />,
      features: ['Frequência + Intensidade', 'Roda Visual de Resultados', 'Evolução Temporal'],
      color: 'bg-purple-500',
      questions: 147,
      dbCount: stats.sessionsByType['147-perguntas']?.count || 0,
      assignedCount: stats.sessionsByType['147-perguntas']?.assignments || 0
    },
    {
      id: '8-pilares',
      title: '8 Pilares Financeiros',
      description: 'Avaliação dos 8 pilares fundamentais da prosperidade financeira. Interface interativa com análise personalizada e plano de ação para impulsionar sua abundância.',
      duration: '10-15 minutos',
      category: 'Financeiro',
      icon: <DollarSign className="w-6 h-6" />,
      features: ['8 Pilares Financeiros', 'Roda Visual de Resultados', 'Plano de Ação Personalizado'],
      color: 'bg-yellow-500',
      areas: 8,
      dbCount: stats.sessionsByType['8-pilares']?.count || 0,
      assignedCount: stats.sessionsByType['8-pilares']?.assignments || 0
    },
    {
      id: '8-competencias',
      title: 'Roda das 8 Competências',
      description: 'Avaliação das 8 competências profissionais fundamentais. Interface interativa com análise personalizada e plano de desenvolvimento para impulsionar sua carreira.',
      duration: '9-15 minutos',
      category: 'Profissional',
      icon: <Star className="w-6 h-6" />,
      features: ['8 Competências Profissionais', 'Roda Visual de Resultados', 'Plano de Desenvolvimento'],
      color: 'bg-red-500',
      areas: 8,
      dbCount: stats.sessionsByType['8-competencias']?.count || 0,
      assignedCount: stats.sessionsByType['8-competencias']?.assignments || 0
    }
  ];

  const buildSessionPayload = useMemo(() => {
    return (templateId: string) => {
      const emojiOptions = [
        { value: 1, emoji: '😟', label: 'Muito baixa' },
        { value: 2, emoji: '😕', label: 'Baixa' },
        { value: 3, emoji: '😐', label: 'Média' },
        { value: 4, emoji: '🙂', label: 'Boa' },
        { value: 5, emoji: '😄', label: 'Excelente' }
      ];

      switch (templateId) {
        case '12-areas': {
          const areas = [
            { id: 'saude', name: 'Saúde', icon: '🏥', color: '#0ea5e9' },
            { id: 'familia', name: 'Família', icon: '👨‍👩‍👧‍👦', color: '#22c55e' },
            { id: 'carreira', name: 'Carreira', icon: '💼', color: '#6366f1' },
            { id: 'financas', name: 'Finanças', icon: '💰', color: '#f59e0b' },
            { id: 'relacionamentos', name: 'Relacionamentos', icon: '🤝', color: '#ec4899' },
            { id: 'diversao', name: 'Diversão', icon: '🎉', color: '#a78bfa' },
            { id: 'crescimento', name: 'Crescimento', icon: '📈', color: '#10b981' },
            { id: 'espiritual', name: 'Espiritual', icon: '🧘‍♀️', color: '#14b8a6' },
            { id: 'ambiente', name: 'Ambiente', icon: '🏡', color: '#84cc16' },
            { id: 'proposito', name: 'Propósito', icon: '🎯', color: '#ef4444' },
            { id: 'contribuicao', name: 'Contribuição', icon: '🙌', color: '#06b6d4' },
            { id: 'autoconhecimento', name: 'Autoconhecimento', icon: '🧠', color: '#8b5cf6' }
          ].map(area => ({
            ...area,
            question: { id: `${area.id}_q1`, text: `Como você avalia sua área de ${area.name} hoje?`, type: 'emoji_scale' },
            emoji_options: emojiOptions
          }));
          return {
            title: 'Avaliação das 12 Áreas da Vida',
            description: 'Avaliação do equilíbrio nas 12 áreas fundamentais com perguntas e visual final em roda.',
            type: 'life_wheel_assessment',
            content: { areas },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 15
          };
        }
        case '147-perguntas':
          return {
            title: 'Mapeamento de Sintomas (147 Perguntas)',
            description: 'Questionário adaptativo de sintomas com frequência e intensidade em 12 sistemas.',
            type: 'symptoms_assessment',
            content: {
              systems: [
                { system: 'Digestivo', icon: '🍽️', color: '#f59e0b', questions: ['Sente azia?', 'Inchaço frequente?', 'Refluxo?'] },
                { system: 'Respiratório', icon: '🫁', color: '#60a5fa', questions: ['Falta de ar?', 'Tosse frequente?', 'Chiado no peito?'] },
                { system: 'Cardiovascular', icon: '❤️', color: '#ef4444', questions: ['Palpitações?', 'Pressão alta?', 'Cansaço fácil?'] },
                { system: 'Neurológico', icon: '🧠', color: '#a78bfa', questions: ['Dores de cabeça?', 'Tonturas?', 'Insônia?'] },
                { system: 'Musculoesquelético', icon: '💪', color: '#22c55e', questions: ['Dores musculares?', 'Rigidez?', 'Cãibras?'] },
                { system: 'Imunológico', icon: '🛡️', color: '#10b981', questions: ['Infecções recorrentes?', 'Alergias?', 'Cansaço prolongado?'] }
              ]
            },
            target_saboteurs: [],
            difficulty: 'intermediate',
            estimated_time: 15
          };
        case '8-pilares':
          return {
            title: '8 Pilares Financeiros',
            description: 'Avaliação dos 8 pilares da prosperidade com pergunta por pilar e visual em roda.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'mindset', name: 'Mindset', icon: '🧭', color: '#8b5cf6' },
                { id: 'planejamento', name: 'Planejamento', icon: '🗂️', color: '#0ea5e9' },
                { id: 'investimentos', name: 'Investimentos', icon: '📈', color: '#22c55e' },
                { id: 'renda', name: 'Renda', icon: '💼', color: '#f59e0b' },
                { id: 'gastos', name: 'Gastos', icon: '🧾', color: '#ef4444' },
                { id: 'protecao', name: 'Proteção', icon: '🛡️', color: '#10b981' },
                { id: 'impostos', name: 'Impostos', icon: '🏛️', color: '#06b6d4' },
                { id: 'reserva', name: 'Reserva', icon: '🏦', color: '#84cc16' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu pilar de ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 15
          };
        case '8-competencias':
          return {
            title: 'Roda das 8 Competências',
            description: 'Avaliação de competências profissionais com pergunta por competência e visual final em roda.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'lideranca', name: 'Liderança', icon: '👑', color: '#f59e0b' },
                { id: 'comunicacao', name: 'Comunicação', icon: '💬', color: '#22c55e' },
                { id: 'inovacao', name: 'Inovação', icon: '💡', color: '#a78bfa' },
                { id: 'estrategia', name: 'Estratégia', icon: '🎯', color: '#ef4444' },
                { id: 'execucao', name: 'Execução', icon: '🏃‍♂️', color: '#0ea5e9' },
                { id: 'relacionamento', name: 'Relacionamento', icon: '🤝', color: '#ec4899' },
                { id: 'adaptabilidade', name: 'Adaptabilidade', icon: '🔄', color: '#06b6d4' },
                { id: 'aprendizado', name: 'Aprendizado', icon: '📚', color: '#84cc16' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como você avalia sua competência de ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 12
          };
        default:
          return null;
      }
    };
  }, []);

  const createSessionAndAssignToCurrentUser = async (templateId: string) => {
    try {
      setIsCreating(templateId);
      setSelectedTemplate(templateId);
      const { data: auth } = await supabase.auth.getUser();
      const currentUser = auth?.user;
      if (!currentUser) {
        toast({ title: 'Autenticação necessária', description: 'Faça login para criar a sessão.', variant: 'destructive' });
        return;
      }
      const payload = buildSessionPayload(templateId);
      if (!payload) {
        toast({ title: 'Template inválido', description: 'Template não encontrado.', variant: 'destructive' });
        return;
      }
      const sessionInsert = { ...payload, created_by: currentUser.id, is_active: true } as any;
      const { data: createdSession, error: createError } = await supabase.from('sessions').insert(sessionInsert).select().single();
      if (createError) throw createError;
      const assignment = { user_id: currentUser.id, session_id: createdSession.id, status: 'pending', progress: 0, assigned_at: new Date().toISOString() };
      const { error: assignError } = await supabase.from('user_sessions').upsert([assignment], { onConflict: 'user_id,session_id' });
      if (assignError) throw assignError;
      toast({ title: 'Sessão criada!', description: 'Template aplicado e sessão atribuída a você.' });
      
      // Atualizar estatísticas
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
    } catch (error: any) {
      console.error('Erro ao usar template:', error);
      toast({ title: 'Erro ao criar sessão', description: error?.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsCreating(null);
    }
  };

  const handleUseTemplate = (templateId: string) => {
    void createSessionAndAssignToCurrentUser(templateId);
  };

  const handleSendToAll = async (templateId: string) => {
    try {
      setIsCreating(templateId);
      const payload = buildSessionPayload(templateId);
      if (!payload) return;
      
      const { data: createdSession, error: createError } = await supabase.from('sessions').insert({ ...payload, is_active: true } as any).select().single();
      if (createError) throw createError;

      const { error: rpcError } = await supabase.rpc('assign_session_to_all_users', { session_id_param: createdSession.id });
      if (rpcError) throw rpcError;
      
      toast({ title: '✅ Sucesso!', description: 'Sessão criada e enviada para todos os usuários.' });
      
      // Atualizar estatísticas
      setStats(prev => ({ ...prev, totalSessions: prev.totalSessions + 1 }));
    } catch (error: any) {
      console.error('Erro ao enviar para todos:', error);
      toast({ title: 'Erro ao enviar', description: error?.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setIsCreating(null);
    }
  };

  const handleSendToSelected = async () => {
    if (!selectedTemplate || selectedUsers.length === 0) {
      toast({ title: "⚠️ Atenção", description: "Selecione pelo menos um usuário", variant: "destructive" });
      return;
    }
    try {
      setIsCreating(selectedTemplate);
      const payload = buildSessionPayload(selectedTemplate);
      if (!payload) return;
      
      const { data: createdSession, error: createError } = await supabase.from('sessions').insert({ ...payload, is_active: true } as any).select().single();
      if (createError) throw createError;

      const { error: rpcError } = await supabase.rpc('assign_session_to_users', { session_id_param: createdSession.id, user_ids_param: selectedUsers });
      if (rpcError) throw rpcError;
      
      toast({ title: "✅ Sucesso!", description: `Sessão criada e enviada para ${selectedUsers.length} usuário(s)` });
      setSelectedTemplate(null);
      setSelectedUsers([]);
    } catch (error: any) {
      console.error('Erro ao enviar para selecionados:', error);
      toast({ title: "❌ Erro", description: error.message || "Não foi possível enviar a sessão", variant: "destructive" });
    } finally {
      setIsCreating(null);
    }
  };

  const categoryTags: Record<string, { tags: string[]; bgColor: string; textColor: string }> = {
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
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Templates de Sessão</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Modelos pré-configurados para diferentes tipos de avaliação
          </p>
        </div>
        
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-3 flex items-center gap-3">
              <Database className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Sessões Criadas</p>
                <p className="text-xl font-bold text-primary">{isLoadingStats ? '...' : stats.totalSessions}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-500/10 border-green-500/20">
            <CardContent className="p-3 flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Atribuições</p>
                <p className="text-xl font-bold text-green-600">{isLoadingStats ? '...' : stats.totalAssignments}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grid de Templates */}
      <div className="grid gap-4">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-card border border-border/50 hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Info do Template */}
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-full ${template.color} text-white shrink-0`}>
                      {template.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <CardTitle className="text-lg text-foreground">
                          {template.title}
                        </CardTitle>
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                          {template.questions && `${template.questions} Perguntas`}
                          {template.areas && `${template.areas} ${template.areas === 12 ? 'Áreas' : template.id === '8-pilares' ? 'Pilares' : 'Competências'}`}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </div>

                  {/* Estatísticas e Ações */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 lg:shrink-0">
                    {/* Mini Stats */}
                    <div className="flex gap-2 text-xs">
                      <div className="flex items-center gap-1 px-2 py-1 bg-muted/50 rounded-md">
                        <Database className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium">{template.dbCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-500/10 rounded-md">
                        <Users className="w-3 h-3 text-green-600" />
                        <span className="font-medium text-green-600">{template.assignedCount || 0}</span>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUseTemplate(template.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-3"
                        disabled={isCreating === template.id}
                        size="sm"
                      >
                        <Zap className="w-3.5 h-3.5 mr-1" />
                        {isCreating === template.id ? 'Criando...' : 'Usar'}
                      </Button>
                      <Button
                        onClick={() => setSelectedTemplate(template.id)}
                        variant="outline"
                        disabled={isCreating === template.id}
                        className="text-xs h-8 px-3"
                        size="sm"
                      >
                        <Users className="w-3.5 h-3.5 mr-1" />
                        Selecionar
                      </Button>
                      <Button
                        onClick={() => handleSendToAll(template.id)}
                        variant="outline"
                        className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs h-8 px-3"
                        disabled={isCreating === template.id}
                        size="sm"
                      >
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Todos
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                {/* Info e Features */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs">{template.duration}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                  <div className="flex gap-2">
                    {template.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {categoryTags[template.id]?.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className={`text-xs ${categoryTags[template.id].bgColor} ${categoryTags[template.id].textColor}`}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Modal para seleção de usuários */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Enviar Template: {templates.find(t => t.id === selectedTemplate)?.title}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {selectedTemplate && (
              <div className="space-y-4">
                <UserSelector selectedUsers={selectedUsers} onSelectionChange={setSelectedUsers} />
                
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => { setSelectedTemplate(null); setSelectedUsers([]); }}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSendToSelected} disabled={isCreating === selectedTemplate || selectedUsers.length === 0}>
                    <Send className="w-4 h-4 mr-2" />
                    {isCreating === selectedTemplate ? 'Enviando...' : `Enviar para ${selectedUsers.length} usuário(s)`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionTemplates;
