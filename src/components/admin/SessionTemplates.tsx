// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, Clock, Target, Brain, DollarSign, Star, Zap, Send, CheckCircle, Database, BarChart3, Moon, Heart, Sparkles, Scale, Utensils, Droplets, Calendar, Flag, Flame, ClipboardList, Activity } from 'lucide-react';
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
      category: 'Saúde',
      icon: <Brain className="w-6 h-6" />,
      features: ['Frequência + Intensidade', 'Roda Visual', 'Evolução Temporal'],
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
      features: ['8 Pilares', 'Roda Visual', 'Plano de Ação'],
      color: 'bg-yellow-500',
      areas: 8,
      dbCount: stats.sessionsByType['8-pilares']?.count || 0,
      assignedCount: stats.sessionsByType['8-pilares']?.assignments || 0
    },
    {
      id: '8-competencias',
      title: 'Roda das 8 Competências',
      description: 'Avaliação das 8 competências profissionais fundamentais. Interface interativa com análise personalizada e plano de desenvolvimento para impulsionar sua carreira.',
      duration: '9-12 minutos',
      category: 'Profissional',
      icon: <Star className="w-6 h-6" />,
      features: ['8 Competências', 'Roda Visual', 'Plano de Desenvolvimento'],
      color: 'bg-red-500',
      areas: 8,
      dbCount: stats.sessionsByType['8-competencias']?.count || 0,
      assignedCount: stats.sessionsByType['8-competencias']?.assignments || 0
    },
    {
      id: 'sabotadores',
      title: '24 Sabotadores do Emagrecimento',
      description: 'Identifique os 24 principais sabotadores mentais que impedem o emagrecimento. Baseado em psicologia comportamental, incluindo categorias: comportamentais, psicológicos, relacionais, físicos, temporais e socioeconômicos.',
      duration: '15-20 minutos',
      category: 'Emagrecimento',
      icon: <Scale className="w-6 h-6" />,
      features: ['24 Sabotadores', 'Análise Comportamental', 'Estratégias'],
      color: 'bg-orange-500',
      questions: 24,
      dbCount: stats.sessionsByType['sabotadores']?.count || 0,
      assignedCount: stats.sessionsByType['sabotadores']?.assignments || 0
    },
    {
      id: 'sono',
      title: 'Avaliação de Qualidade do Sono',
      description: 'Questionário completo para avaliar qualidade, duração e padrões de sono. Identifique fatores que afetam seu descanso e receba recomendações personalizadas.',
      duration: '8-10 minutos',
      category: 'Sono',
      icon: <Moon className="w-6 h-6" />,
      features: ['Qualidade do Sono', 'Padrões Noturnos', 'Recomendações'],
      color: 'bg-indigo-500',
      questions: 15,
      dbCount: stats.sessionsByType['sono']?.count || 0,
      assignedCount: stats.sessionsByType['sono']?.assignments || 0
    },
    {
      id: 'estresse',
      title: 'Avaliação de Estresse e Ansiedade',
      description: 'Avalie seus níveis de estresse e ansiedade através de escalas validadas. Identifique gatilhos e receba estratégias práticas de gerenciamento emocional.',
      duration: '10-12 minutos',
      category: 'Emocional',
      icon: <Heart className="w-6 h-6" />,
      features: ['Níveis de Estresse', 'Gatilhos', 'Estratégias'],
      color: 'bg-pink-500',
      questions: 18,
      dbCount: stats.sessionsByType['estresse']?.count || 0,
      assignedCount: stats.sessionsByType['estresse']?.assignments || 0
    },
    {
      id: 'bem-estar',
      title: 'Avaliação de Bem-estar e Mindfulness',
      description: 'Avalie seu nível de bem-estar geral, presença plena e práticas de autocuidado. Receba um plano personalizado para aumentar sua qualidade de vida.',
      duration: '10-15 minutos',
      category: 'Bem-estar',
      icon: <Sparkles className="w-6 h-6" />,
      features: ['Bem-estar Geral', 'Mindfulness', 'Autocuidado'],
      color: 'bg-teal-500',
      areas: 6,
      dbCount: stats.sessionsByType['bem-estar']?.count || 0,
      assignedCount: stats.sessionsByType['bem-estar']?.assignments || 0
    },
    {
      id: 'habitos-alimentares',
      title: 'Avaliação de Hábitos Alimentares',
      description: 'Analise seus padrões alimentares, preferências e comportamentos em relação à comida. Receba insights personalizados para melhorar sua nutrição.',
      duration: '12-15 minutos',
      category: 'Nutrição',
      icon: <Utensils className="w-6 h-6" />,
      features: ['Padrões Alimentares', 'Preferências', 'Comportamentos'],
      color: 'bg-amber-500',
      questions: 25,
      dbCount: stats.sessionsByType['habitos-alimentares']?.count || 0,
      assignedCount: stats.sessionsByType['habitos-alimentares']?.assignments || 0
    },
    {
      id: 'hidratacao',
      title: 'Avaliação de Hidratação',
      description: 'Avalie seus hábitos de hidratação e consumo de líquidos. Identifique padrões e receba recomendações para otimizar sua ingestão de água.',
      duration: '5-8 minutos',
      category: 'Saúde',
      icon: <Droplets className="w-6 h-6" />,
      features: ['Consumo de Água', 'Padrões Diários', 'Recomendações'],
      color: 'bg-cyan-500',
      questions: 12,
      dbCount: stats.sessionsByType['hidratacao']?.count || 0,
      assignedCount: stats.sessionsByType['hidratacao']?.assignments || 0
    },
    {
      id: 'rotina-diaria',
      title: 'Mapeamento de Rotina Diária',
      description: 'Mapeie sua rotina diária completa incluindo horários de acordar, refeições, trabalho e descanso. Otimize seu dia para máxima produtividade e bem-estar.',
      duration: '10-12 minutos',
      category: 'Produtividade',
      icon: <Calendar className="w-6 h-6" />,
      features: ['Horários', 'Hábitos Diários', 'Otimização'],
      color: 'bg-violet-500',
      questions: 20,
      dbCount: stats.sessionsByType['rotina-diaria']?.count || 0,
      assignedCount: stats.sessionsByType['rotina-diaria']?.assignments || 0
    },
    {
      id: 'objetivos-saude',
      title: 'Definição de Objetivos de Saúde',
      description: 'Defina e acompanhe seus objetivos de saúde de curto, médio e longo prazo. Crie metas SMART e receba um plano de ação personalizado.',
      duration: '15-20 minutos',
      category: 'Metas',
      icon: <Flag className="w-6 h-6" />,
      features: ['Metas SMART', 'Plano de Ação', 'Acompanhamento'],
      color: 'bg-emerald-500',
      questions: 18,
      dbCount: stats.sessionsByType['objetivos-saude']?.count || 0,
      assignedCount: stats.sessionsByType['objetivos-saude']?.assignments || 0
    },
    {
      id: 'motivacao',
      title: 'Avaliação de Motivação e Energia',
      description: 'Avalie seu nível de motivação, energia mental e disposição para mudanças. Identifique bloqueios e receba estratégias de ativação.',
      duration: '8-12 minutos',
      category: 'Psicológico',
      icon: <Flame className="w-6 h-6" />,
      features: ['Nível de Motivação', 'Energia Mental', 'Estratégias'],
      color: 'bg-rose-500',
      questions: 16,
      dbCount: stats.sessionsByType['motivacao']?.count || 0,
      assignedCount: stats.sessionsByType['motivacao']?.assignments || 0
    },
    {
      id: 'anamnese',
      title: 'Anamnese Completa de Saúde',
      description: 'Questionário completo de histórico de saúde incluindo doenças, medicamentos, alergias, cirurgias e histórico familiar. Essencial para acompanhamento profissional.',
      duration: '20-30 minutos',
      category: 'Histórico Médico',
      icon: <ClipboardList className="w-6 h-6" />,
      features: ['Histórico Completo', 'Medicamentos', 'Alergias'],
      color: 'bg-slate-500',
      questions: 50,
      dbCount: stats.sessionsByType['anamnese']?.count || 0,
      assignedCount: stats.sessionsByType['anamnese']?.assignments || 0
    },
    {
      id: 'atividade-fisica',
      title: 'Avaliação de Atividade Física',
      description: 'Avalie seu nível atual de atividade física, preferências de exercício e barreiras. Receba recomendações personalizadas para um estilo de vida mais ativo.',
      duration: '10-15 minutos',
      category: 'Exercício',
      icon: <Activity className="w-6 h-6" />,
      features: ['Nível de Atividade', 'Preferências', 'Plano de Exercícios'],
      color: 'bg-lime-500',
      questions: 22,
      dbCount: stats.sessionsByType['atividade-fisica']?.count || 0,
      assignedCount: stats.sessionsByType['atividade-fisica']?.assignments || 0
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
        case 'sabotadores':
          return {
            title: '24 Sabotadores do Emagrecimento',
            description: 'Identifique os sabotadores mentais que impedem o emagrecimento baseado em psicologia comportamental.',
            type: 'saboteurs_assessment',
            content: {
              categories: [
                {
                  id: 'comportamentais',
                  name: 'Comportamentais',
                  icon: '📦',
                  color: '#f59e0b',
                  saboteurs: [
                    { id: 'roupas', name: 'Sabotador das Roupas', question: 'Você mantém roupas antigas esperando emagrecer?' },
                    { id: 'dinheiro', name: 'Sabotador do Dinheiro', question: 'Você associa gastar dinheiro com comida como recompensa?' },
                    { id: 'escape', name: 'Válvula de Escape', question: 'Você usa comida para fugir de emoções negativas?' },
                    { id: 'prazer', name: 'Prazer da Comida', question: 'A comida é sua principal fonte de prazer?' }
                  ]
                },
                {
                  id: 'psicologicos',
                  name: 'Psicológicos',
                  icon: '🧠',
                  color: '#a78bfa',
                  saboteurs: [
                    { id: 'critico', name: 'Crítico Interno', question: 'Você costuma se criticar severamente?' },
                    { id: 'boazinha', name: 'Boazinha Demais', question: 'Você tem dificuldade em dizer não para os outros?' },
                    { id: 'crencas', name: 'Falta de Crenças', question: 'Você duvida da sua capacidade de emagrecer?' },
                    { id: 'autoimagem', name: 'Apego à Autoimagem', question: 'Você tem medo de como será sua vida após emagrecer?' }
                  ]
                },
                {
                  id: 'relacionais',
                  name: 'Relacionais',
                  icon: '👥',
                  color: '#ec4899',
                  saboteurs: [
                    { id: 'conjuge', name: 'Problemas com Cônjuge', question: 'Seu parceiro(a) demonstra ciúmes quando você emagrece?' },
                    { id: 'filhos', name: 'Proteção dos Filhos', question: 'Você negligencia sua saúde para cuidar da família?' },
                    { id: 'afetiva', name: 'Fuga Afetiva', question: 'Você usa o peso como barreira emocional?' },
                    { id: 'afeto', name: 'Comida como Afeto', question: 'Você associa comida com demonstração de amor?' }
                  ]
                },
                {
                  id: 'fisicos',
                  name: 'Físicos',
                  icon: '🏃',
                  color: '#22c55e',
                  saboteurs: [
                    { id: 'atividade', name: 'Aversão ao Exercício', question: 'Você tem aversão a atividades físicas?' },
                    { id: 'dieta', name: 'Crença Contrária', question: 'Você acredita que dieta é tortura?' },
                    { id: 'fortaleza', name: 'Tamanho como Fortaleza', question: 'Você sente que seu tamanho lhe dá proteção?' }
                  ]
                },
                {
                  id: 'temporais',
                  name: 'Temporais',
                  icon: '🕰️',
                  color: '#06b6d4',
                  saboteurs: [
                    { id: 'mudanca', name: 'Estranheza da Mudança', question: 'Você se sente desconfortável com mudanças?' },
                    { id: 'infancia_magra', name: 'Magreza da Infância', question: 'Você tem traumas relacionados à magreza na infância?' },
                    { id: 'perdas_presente', name: 'Perdas no Presente', question: 'Você está passando por luto ou tristeza?' },
                    { id: 'perdas_infancia', name: 'Perdas na Infância', question: 'Você teve perdas significativas na infância?' }
                  ]
                },
                {
                  id: 'socioeconomicos',
                  name: 'Socioeconômicos',
                  icon: '💰',
                  color: '#8b5cf6',
                  saboteurs: [
                    { id: 'riqueza', name: 'Obesidade como Riqueza', question: 'Na sua família, peso é associado a prosperidade?' },
                    { id: 'identidade', name: 'Biotipo e Identidade', question: 'Seu peso faz parte da sua identidade?' },
                    { id: 'beleza', name: 'Fuga da Beleza', question: 'Você tem medo de ser considerado(a) bonito(a)?' }
                  ]
                }
              ]
            },
            target_saboteurs: [],
            difficulty: 'intermediate',
            estimated_time: 20
          };
        case 'sono':
          return {
            title: 'Avaliação de Qualidade do Sono',
            description: 'Questionário para avaliar qualidade, duração e padrões de sono.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'duracao', name: 'Duração do Sono', icon: '⏰', color: '#6366f1' },
                { id: 'qualidade', name: 'Qualidade do Sono', icon: '😴', color: '#8b5cf6' },
                { id: 'latencia', name: 'Facilidade para Dormir', icon: '🛏️', color: '#a78bfa' },
                { id: 'despertar', name: 'Despertar', icon: '🌅', color: '#f59e0b' },
                { id: 'energia', name: 'Energia ao Acordar', icon: '⚡', color: '#22c55e' },
                { id: 'regularidade', name: 'Regularidade', icon: '📅', color: '#0ea5e9' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está sua ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 10
          };
        case 'estresse':
          return {
            title: 'Avaliação de Estresse e Ansiedade',
            description: 'Avalie seus níveis de estresse e ansiedade e identifique gatilhos.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'estresse_geral', name: 'Nível de Estresse', icon: '😰', color: '#ef4444' },
                { id: 'ansiedade', name: 'Ansiedade', icon: '😟', color: '#f97316' },
                { id: 'tensao', name: 'Tensão Muscular', icon: '💪', color: '#eab308' },
                { id: 'preocupacao', name: 'Preocupações', icon: '🤔', color: '#a78bfa' },
                { id: 'irritabilidade', name: 'Irritabilidade', icon: '😤', color: '#ec4899' },
                { id: 'concentracao', name: 'Concentração', icon: '🎯', color: '#0ea5e9' },
                { id: 'sono_estresse', name: 'Sono e Descanso', icon: '😴', color: '#6366f1' },
                { id: 'respiracao', name: 'Padrão Respiratório', icon: '🌬️', color: '#10b981' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 12
          };
        case 'bem-estar':
          return {
            title: 'Avaliação de Bem-estar e Mindfulness',
            description: 'Avalie seu nível de bem-estar geral e práticas de autocuidado.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'presenca', name: 'Presença Plena', icon: '🧘', color: '#14b8a6' },
                { id: 'gratidao', name: 'Gratidão', icon: '🙏', color: '#22c55e' },
                { id: 'autocuidado', name: 'Autocuidado', icon: '💆', color: '#ec4899' },
                { id: 'conexao', name: 'Conexão Social', icon: '🤝', color: '#0ea5e9' },
                { id: 'proposito', name: 'Propósito', icon: '🎯', color: '#f59e0b' },
                { id: 'paz', name: 'Paz Interior', icon: '☮️', color: '#8b5cf6' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 12
          };
        case 'habitos-alimentares':
          return {
            title: 'Avaliação de Hábitos Alimentares',
            description: 'Analise seus padrões alimentares, preferências e comportamentos em relação à comida.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'refeicoes', name: 'Regularidade das Refeições', icon: '🍽️', color: '#f59e0b' },
                { id: 'vegetais', name: 'Consumo de Vegetais', icon: '🥗', color: '#22c55e' },
                { id: 'proteinas', name: 'Consumo de Proteínas', icon: '🥩', color: '#ef4444' },
                { id: 'acucar', name: 'Controle de Açúcar', icon: '🍬', color: '#ec4899' },
                { id: 'processados', name: 'Evitar Processados', icon: '🍔', color: '#f97316' },
                { id: 'mastigacao', name: 'Mastigação Adequada', icon: '👄', color: '#8b5cf6' },
                { id: 'porcoes', name: 'Controle de Porções', icon: '📏', color: '#0ea5e9' },
                { id: 'emocional', name: 'Alimentação Consciente', icon: '🧠', color: '#14b8a6' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 15
          };
        case 'hidratacao':
          return {
            title: 'Avaliação de Hidratação',
            description: 'Avalie seus hábitos de hidratação e consumo de líquidos.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'quantidade', name: 'Quantidade de Água', icon: '💧', color: '#0ea5e9' },
                { id: 'frequencia', name: 'Frequência', icon: '⏰', color: '#6366f1' },
                { id: 'sinais', name: 'Atenção aos Sinais', icon: '👁️', color: '#22c55e' },
                { id: 'habito', name: 'Hábito Estabelecido', icon: '✅', color: '#14b8a6' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 8
          };
        case 'rotina-diaria':
          return {
            title: 'Mapeamento de Rotina Diária',
            description: 'Mapeie sua rotina diária completa incluindo horários e hábitos.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'acordar', name: 'Horário de Acordar', icon: '🌅', color: '#f59e0b' },
                { id: 'cafe', name: 'Café da Manhã', icon: '☕', color: '#8b5cf6' },
                { id: 'trabalho', name: 'Produtividade no Trabalho', icon: '💼', color: '#0ea5e9' },
                { id: 'almoco', name: 'Pausa para Almoço', icon: '🍽️', color: '#22c55e' },
                { id: 'exercicio', name: 'Tempo para Exercício', icon: '🏃', color: '#ef4444' },
                { id: 'jantar', name: 'Jantar em Família', icon: '👨‍👩‍👧', color: '#ec4899' },
                { id: 'lazer', name: 'Tempo de Lazer', icon: '🎮', color: '#a78bfa' },
                { id: 'dormir', name: 'Hora de Dormir', icon: '🌙', color: '#6366f1' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 12
          };
        case 'objetivos-saude':
          return {
            title: 'Definição de Objetivos de Saúde',
            description: 'Defina e acompanhe seus objetivos de saúde de curto, médio e longo prazo.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'peso', name: 'Meta de Peso', icon: '⚖️', color: '#22c55e' },
                { id: 'exercicio', name: 'Meta de Exercício', icon: '🏋️', color: '#ef4444' },
                { id: 'alimentacao', name: 'Meta Alimentar', icon: '🥗', color: '#f59e0b' },
                { id: 'sono', name: 'Meta de Sono', icon: '😴', color: '#6366f1' },
                { id: 'stress', name: 'Redução de Estresse', icon: '🧘', color: '#ec4899' },
                { id: 'exames', name: 'Exames em Dia', icon: '🩺', color: '#0ea5e9' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está sua ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 15
          };
        case 'motivacao':
          return {
            title: 'Avaliação de Motivação e Energia',
            description: 'Avalie seu nível de motivação, energia mental e disposição para mudanças.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'energia', name: 'Nível de Energia', icon: '⚡', color: '#f59e0b' },
                { id: 'motivacao', name: 'Motivação Geral', icon: '🔥', color: '#ef4444' },
                { id: 'foco', name: 'Capacidade de Foco', icon: '🎯', color: '#0ea5e9' },
                { id: 'resiliencia', name: 'Resiliência', icon: '💪', color: '#22c55e' },
                { id: 'otimismo', name: 'Otimismo', icon: '😊', color: '#ec4899' },
                { id: 'autodisciplina', name: 'Autodisciplina', icon: '📋', color: '#8b5cf6' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
                emoji_options: emojiOptions
              }))
            },
            target_saboteurs: [],
            difficulty: 'beginner',
            estimated_time: 10
          };
        case 'anamnese':
          return {
            title: 'Anamnese Completa de Saúde',
            description: 'Questionário completo de histórico de saúde incluindo doenças, medicamentos e histórico familiar.',
            type: 'anamnesis_assessment',
            content: {
              sections: [
                { id: 'historico_pessoal', name: 'Histórico Pessoal', icon: '📋', color: '#0ea5e9', questions: ['Possui alguma doença crônica?', 'Faz uso de medicamentos contínuos?', 'Possui alergias conhecidas?'] },
                { id: 'historico_familiar', name: 'Histórico Familiar', icon: '👨‍👩‍👧‍👦', color: '#22c55e', questions: ['Histórico de diabetes na família?', 'Histórico de hipertensão?', 'Histórico de câncer?'] },
                { id: 'cirurgias', name: 'Cirurgias', icon: '🏥', color: '#ef4444', questions: ['Já realizou alguma cirurgia?', 'Teve complicações em cirurgias?'] },
                { id: 'habitos', name: 'Hábitos de Vida', icon: '🍺', color: '#f59e0b', questions: ['Consome bebidas alcoólicas?', 'É fumante ou ex-fumante?', 'Pratica atividade física regular?'] }
              ]
            },
            target_saboteurs: [],
            difficulty: 'intermediate',
            estimated_time: 25
          };
        case 'atividade-fisica':
          return {
            title: 'Avaliação de Atividade Física',
            description: 'Avalie seu nível atual de atividade física, preferências de exercício e barreiras.',
            type: 'life_wheel_assessment',
            content: {
              areas: [
                { id: 'frequencia', name: 'Frequência de Treino', icon: '📅', color: '#22c55e' },
                { id: 'intensidade', name: 'Intensidade', icon: '💪', color: '#ef4444' },
                { id: 'variedade', name: 'Variedade de Exercícios', icon: '🎯', color: '#8b5cf6' },
                { id: 'alongamento', name: 'Alongamento', icon: '🧘', color: '#14b8a6' },
                { id: 'cardio', name: 'Exercício Cardiovascular', icon: '❤️', color: '#ec4899' },
                { id: 'forca', name: 'Treino de Força', icon: '🏋️', color: '#f59e0b' },
                { id: 'descanso', name: 'Descanso e Recuperação', icon: '😴', color: '#6366f1' },
                { id: 'motivacao_treino', name: 'Motivação para Treinar', icon: '🔥', color: '#0ea5e9' }
              ].map(area => ({
                ...area,
                question: { id: `${area.id}_q1`, text: `Como está seu(sua) ${area.name}?`, type: 'emoji_scale' },
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
