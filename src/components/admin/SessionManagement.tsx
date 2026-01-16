import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  Calendar,
  Clock,
  Target,
  CheckCircle,
  AlertCircle,
  Settings,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import SessionTemplates from './SessionTemplates';
import { NewSessionForm } from './NewSessionForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name?: string;
  email: string;
}

interface Session {
  id: string;
  title: string;
  description: string;
  content: string;
  estimated_time: number;
  target_saboteurs: string[];
  is_active: boolean;
  created_at: string;
  assigned_users?: number;
}

const SessionManagement: React.FC = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sendingAll, setSendingAll] = useState(false);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    content: '',
    estimated_time: 15,
    target_saboteurs: []
  });

  const [users, setUsers] = useState<User[]>([]);

  // Buscar sessões reais do Supabase
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setSessions(data?.map(session => ({
          id: session.id,
          title: session.title || '',
          description: session.description || '',
          content: typeof session.content === 'string' ? session.content : '',
          estimated_time: session.estimated_time || 15,
          target_saboteurs: session.target_saboteurs || [],
          is_active: session.is_active ?? true,
          created_at: session.created_at || '',
          assigned_users: 0
        })) || []);
      } catch (error) {
        console.error('Erro ao buscar sessões:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as sessões",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, [toast]);

  // Buscar usuários reais do Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, email');
        
        if (error) throw error;
        setUsers(data?.map(profile => ({
          id: profile.id,
          email: profile.email || '',
          name: profile.full_name || ''
        })) || []);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setUsers([]);
      }
    };
    
    fetchUsers();
  }, []);

  const handleAssignToUsers = (sessionId: string, userIds: string[]) => {
    console.log('Atribuindo sessão', sessionId, 'aos usuários:', userIds);
  };

  const handleAssignToAll = async (sessionId: string) => {
    try {
      setSending(sessionId);
      
      // Buscar título da sessão
      const session = sessions.find(s => s.id === sessionId);
      const sessionTitle = session?.title || 'Nova Sessão';
      
      const { error } = await supabase.rpc('assign_session_to_all_users', {
        session_id_param: sessionId
      });

      if (error) throw error;

      // Criar notificações para todos os usuários
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id');
      
      if (allUsers && allUsers.length > 0) {
        const notifications = allUsers.map(user => ({
          user_id: user.id,
          title: '📋 Nova Sessão Disponível!',
          message: `A sessão "${sessionTitle}" foi atribuída a você. Clique para começar!`,
          type: 'session',
          is_read: false,
          action_url: '/sessions'
        }));

        await supabase.from('health_feed_notifications').insert(notifications);
      }

      toast({
        title: "✅ Sucesso!",
        description: "Sessão enviada para todos os usuários"
      });
    } catch (error: any) {
      console.error('Erro ao enviar sessão:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Não foi possível enviar a sessão",
        variant: "destructive"
      });
    } finally {
      setSending(null);
    }
  };

  const handleAssignAllSessionsToAllUsers = async () => {
    try {
      setSendingAll(true);
      
      const activeSessions = sessions.filter(s => s.is_active);
      
      for (const session of activeSessions) {
        const { error } = await supabase.rpc('assign_session_to_all_users', {
          session_id_param: session.id
        });
        
        if (error) {
          console.error(`Erro ao enviar sessão ${session.title}:`, error);
        }
      }
      
      // Criar notificações para todos os usuários
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('id');
      
      if (allUsers && allUsers.length > 0) {
        const notifications = allUsers.map(user => ({
          user_id: user.id,
          title: '📋 Novas Sessões Disponíveis!',
          message: `${activeSessions.length} sessões foram atribuídas a você. Clique para ver!`,
          type: 'session',
          is_read: false,
          action_url: '/sessions'
        }));

        await supabase.from('health_feed_notifications').insert(notifications);
      }
      
      toast({
        title: "✅ Sucesso!",
        description: `${activeSessions.length} sessões enviadas para todos os usuários`
      });
    } catch (error: any) {
      console.error('Erro ao enviar sessões:', error);
      toast({
        title: "❌ Erro",
        description: error.message || "Não foi possível enviar as sessões",
        variant: "destructive"
      });
    } finally {
      setSendingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Gestão de Sessões</h2>
          <p className="text-muted-foreground mt-2">
            Gerencie sessões, templates e atribuições para usuários
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <NewSessionForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Target className="w-4 h-4 mr-2" />
            Templates Prontos
          </TabsTrigger>
          <TabsTrigger value="sessions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            Sessões Criadas
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Users className="w-4 h-4 mr-2" />
            Atribuições
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates">
          <SessionTemplates />
        </TabsContent>

        <TabsContent value="sessions">
          <div className="grid gap-6">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gradient-card border border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl text-foreground">
                            {session.title}
                          </CardTitle>
                          <Badge 
                            variant={session.is_active ? "default" : "secondary"}
                            className={session.is_active ? "bg-success text-success-foreground" : ""}
                          >
                            {session.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">
                          {session.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{session.estimated_time} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{session.assigned_users} usuários</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button 
                          onClick={() => handleAssignToAll(session.id)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          size="sm"
                          disabled={sending === session.id}
                        >
                          {sending === session.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          {sending === session.id ? 'Enviando...' : 'Enviar p/ Todos'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-foreground">Conteúdo:</Label>
                        <p className="text-sm text-muted-foreground mt-1">{session.content}</p>
                      </div>
                      
                      {session.target_saboteurs.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium text-foreground">Sabotadores Alvo:</Label>
                          <div className="flex gap-2 mt-1">
                            {session.target_saboteurs.map((saboteur, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {saboteur}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessões que serão atribuídas */}
            <Card className="bg-gradient-card border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-5 h-5" />
                  Sessões que serão atribuídas:
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{session.title}</p>
                      <p className="text-xs text-muted-foreground">{session.estimated_time} min</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Lista de usuários */}
            <Card className="bg-gradient-card border border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="w-5 h-5" />
                  Usuários Selecionados:
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Botão de Atribuição */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-center">
                <Button 
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8 py-4 text-lg"
                  onClick={handleAssignAllSessionsToAllUsers}
                  disabled={sendingAll || sessions.length === 0}
                >
                  {sendingAll ? (
                    <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  ) : (
                    <Send className="w-6 h-6 mr-3" />
                  )}
                  {sendingAll ? 'Enviando...' : 'Atribuir Todas as Sessões a Todos os Usuários'}
                </Button>
              </div>
              
              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Após executar, todos os usuários verão as sessões em suas dashboards</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionManagement;