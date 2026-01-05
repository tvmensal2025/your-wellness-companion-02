import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Target, 
  Calendar,
  Brain,
  FileText,
  Award,
  Dumbbell,
  MessageCircle,
  Activity,
  Utensils,
  Settings,
  ArrowLeft,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { motion } from 'framer-motion';
import UnifiedManagement from './UnifiedManagement';
import SaboteurManagement from './SaboteurManagement';
import SessionManagement from './SessionManagement';
import ChallengeManagement from './ChallengeManagement';
import { ExerciseLibraryManagement } from './ExerciseLibraryManagement';
import AIControlPanelUnified from './AIControlPanelUnified';
import { supabase } from '@/integrations/supabase/client';

type ToolType = 
  | 'overview' 
  | 'unified' 
  | 'saboteurs' 
  | 'sessions' 
  | 'challenges' 
  | 'exercises' 
  | 'ai-control';

interface Tool {
  id: ToolType;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  status: 'active' | 'beta' | 'new';
}

const ToolsManagement: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('overview');
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    getUser();
  }, []);

  const tools: Tool[] = [
    {
      id: 'unified',
      title: 'Gerenciamento Unificado',
      description: 'Visão geral de sabotadores e sessões em uma interface',
      icon: <LayoutGrid className="h-6 w-6" />,
      color: 'text-blue-500',
      gradient: 'from-blue-500/20 to-blue-600/10',
      status: 'active'
    },
    {
      id: 'saboteurs',
      title: 'Gestão de Sabotadores',
      description: 'Criar e gerenciar sabotadores personalizados',
      icon: <Brain className="h-6 w-6" />,
      color: 'text-purple-500',
      gradient: 'from-purple-500/20 to-purple-600/10',
      status: 'active'
    },
    {
      id: 'sessions',
      title: 'Gestão de Sessões',
      description: 'Templates e atribuição de sessões para usuários',
      icon: <Calendar className="h-6 w-6" />,
      color: 'text-cyan-500',
      gradient: 'from-cyan-500/20 to-cyan-600/10',
      status: 'active'
    },
    {
      id: 'challenges',
      title: 'Gestão de Desafios',
      description: 'Criar desafios individuais e em grupo',
      icon: <Award className="h-6 w-6" />,
      color: 'text-amber-500',
      gradient: 'from-amber-500/20 to-amber-600/10',
      status: 'active'
    },
    {
      id: 'exercises',
      title: 'Biblioteca de Exercícios',
      description: 'Gerenciar exercícios com vídeos e instruções',
      icon: <Dumbbell className="h-6 w-6" />,
      color: 'text-green-500',
      gradient: 'from-green-500/20 to-green-600/10',
      status: 'active'
    },
    {
      id: 'ai-control',
      title: 'Controle de IA',
      description: 'Configurações avançadas de Dr. Vital e Sofia',
      icon: <Sparkles className="h-6 w-6" />,
      color: 'text-pink-500',
      gradient: 'from-pink-500/20 to-pink-600/10',
      status: 'active'
    }
  ];

  const getStatusBadge = (status: Tool['status']) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Novo</Badge>;
      case 'beta':
        return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Beta</Badge>;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (activeTool) {
      case 'unified':
        return <UnifiedManagement />;
      case 'saboteurs':
        return <SaboteurManagement />;
      case 'sessions':
        return <SessionManagement />;
      case 'challenges':
        return <ChallengeManagement user={user} />;
      case 'exercises':
        return <ExerciseLibraryManagement />;
      case 'ai-control':
        return <AIControlPanelUnified />;
      default:
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-primary">{tools.length}</div>
                  <p className="text-sm text-muted-foreground">Ferramentas</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500/10 to-green-600/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-green-500">{tools.filter(t => t.status === 'active').length}</div>
                  <p className="text-sm text-muted-foreground">Ativas</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-amber-500">{tools.filter(t => t.status === 'beta').length}</div>
                  <p className="text-sm text-muted-foreground">Em Beta</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-pink-500/10 to-pink-600/5">
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold text-pink-500">{tools.filter(t => t.status === 'new').length}</div>
                  <p className="text-sm text-muted-foreground">Novas</p>
                </CardContent>
              </Card>
            </div>

            {/* Tools Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer border-0 shadow-lg bg-gradient-to-br ${tool.gradient} hover:shadow-xl transition-all duration-300 hover:scale-[1.02] group`}
                    onClick={() => setActiveTool(tool.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className={`p-3 rounded-xl bg-background/80 ${tool.color} group-hover:scale-110 transition-transform`}>
                          {tool.icon}
                        </div>
                        {getStatusBadge(tool.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <CardTitle className="text-lg mb-1">{tool.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                      <Button 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        variant="outline"
                      >
                        Acessar Ferramenta
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Ferramentas Administrativas
          </h2>
          <p className="text-muted-foreground mt-1">
            Central de gerenciamento de todas as ferramentas do sistema
          </p>
        </div>
        {activeTool !== 'overview' && (
          <Button 
            variant="outline" 
            onClick={() => setActiveTool('overview')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        )}
      </div>

      {/* Breadcrumb */}
      {activeTool !== 'overview' && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span 
            className="hover:text-foreground cursor-pointer"
            onClick={() => setActiveTool('overview')}
          >
            Ferramentas
          </span>
          <span>/</span>
          <span className="text-foreground font-medium">
            {tools.find(t => t.id === activeTool)?.title}
          </span>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default ToolsManagement;
