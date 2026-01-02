// FORCE REFRESH - Sistema de Exercícios Implementado
// Timestamp: $(date)
// Este arquivo foi atualizado para incluir o botão "Exercícios Recomendados"

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Home, Activity, GraduationCap, FileText, Users, Target, 
  Award, Settings, TrendingUp, Stethoscope, CreditCard, Utensils,
  Menu, LogOut, ChevronLeft, ChevronRight, User as UserIcon, Scale,
  MessageCircle, Lock, Play, Dumbbell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSofiaAnalysis } from '@/hooks/useSofiaAnalysis';

// Importações dos componentes
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { DailyMissionsFinal as DailyMissions } from '@/components/daily-missions/DailyMissionsFinal';
import CoursePlatformNetflix from '@/components/dashboard/CoursePlatformNetflix';
import SessionsPage from '@/components/SessionsPage';
import UserSessions from '@/components/UserSessions';
import GoalsPage from '@/pages/GoalsPage';
import DesafiosSection from '@/components/dashboard/DesafiosSection';
import RankingCommunity from '@/components/RankingCommunity';
import { ExerciseOnboardingModal } from '@/components/exercise/ExerciseOnboardingModal';
import { ExerciseDashboard } from '@/components/exercise/ExerciseDashboard';

import HealthFeedPage from '@/pages/HealthFeedPage';
import PaymentPlans from '@/components/PaymentPlans';
import UserDrVitalPage from '@/pages/UserDrVitalPage';
// Import correto da página Sofia (export: SofiaNutricionalPage)
import { SofiaNutricionalPage } from '@/pages/SofiaNutricionalPage';
import UserProfile from '@/components/UserProfile';
import MyProgress from '@/components/MyProgress';
import SaboteurTest from '@/components/SaboteurTest';

// Core dashboard components
import LockedMenuItem from '@/components/LockedMenuItem';

type DashboardSection = 
  | 'dashboard' 
  | 'missions' 
  | 'courses' 
  | 'sessions' 
  | 'comunidade' 
  | 'goals'
  | 'challenges'
  | 'saboteur-test'
  | 'progress'
  | 'subscriptions'
  | 'sofia-nutricional'
  | 'dr-vital'
  | 'exercicios'
  | 'apps'
  | 'help'
  | 'profile';

const CompleteDashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profileData, loading: profileLoading, loadProfile, uploadAvatar } = useUserProfile(user);
  const { performAnalysis } = useSofiaAnalysis();
  const hasAutoAnalyzedRef = useRef(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // garante que não fique preso no loader em mudanças de auth
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Auto-análise removida - agora executa de 15 em 15 dias via scheduler
  // useEffect(() => {
  //   // Auto-análise desabilitada para melhorar performance da interface
  // }, []);

  // Fallback adicional: se por algum motivo o estado "loading" persistir, force a saída após 3s
  useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => setLoading(false), 3000);
    return () => window.clearTimeout(id);
  }, [loading]);

  const handleLogout = async () => {
    try {
      // não travar se o signOut demorar
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch (e) {
    } finally {
      setLoading(false);
      navigate('/auth', { replace: true });
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', color: 'text-primary' },
    { id: 'missions', icon: Activity, label: 'Missão do Dia', color: 'text-secondary' },
    { id: 'progress', icon: TrendingUp, label: 'Meu Progresso', color: 'text-cyan-500' },
    { id: 'goals', icon: Target, label: 'Minhas Metas', color: 'text-green-500' },
    { id: 'courses', icon: GraduationCap, label: 'Plataforma dos Sonhos', color: 'text-accent' },
    { id: 'sessions', icon: FileText, label: 'Sessões', color: 'text-muted-foreground' },
    { id: 'comunidade', icon: Users, label: 'Comunidade', color: 'text-blue-500' },
    { id: 'challenges', icon: Award, label: 'Desafios Individuais', color: 'text-orange-500' },
    { id: 'saboteur-test', icon: Settings, label: 'Teste de Sabotadores', color: 'text-gray-500' },
    { id: 'sofia-nutricional', icon: Utensils, label: 'Sofia Nutricional', color: 'text-emerald-600' },
    { id: 'dr-vital', icon: Stethoscope, label: 'Dr.Vital', color: 'text-blue-600' },
    { id: 'exercicios', icon: Dumbbell, label: 'Exercícios Recomendados', color: 'text-orange-600' }, // NOVO!
    { id: 'subscriptions', icon: CreditCard, label: 'Assinaturas', color: 'text-purple-600' },
  ];

  const renderContent = () => {
    // Verificar se a seção é bloqueada
    const lockedSections = []; // ← TODOS OS BLOQUEIOS REMOVIDOS
    
    if (lockedSections.includes(activeSection)) {
      const sectionNames = {
        challenges: 'Desafios Individuais',
        comunidade: 'Comunidade', 
        sessions: 'Sessões',
        courses: 'Plataforma dos Sonhos',
        subscriptions: 'Assinaturas'
      };
      
      return (
        <div key="locked-content" className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                🔒 Conteúdo Premium
              </h2>
              <p className="text-muted-foreground mb-6">
                {sectionNames[activeSection as keyof typeof sectionNames]} está disponível apenas para usuários premium.
              </p>
              <Button 
                onClick={() => setActiveSection('subscriptions')}
                className="bg-primary hover:bg-primary/90"
              >
                Ver Planos Premium
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Adicionar key para cada componente renderizado para evitar problemas de DOM
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview key="dashboard" />;
      case 'missions':
        return <DailyMissions key="missions" user={user} />;
      case 'progress':
        return <MyProgress key="progress" />;
      case 'saboteur-test':
        return <SaboteurTest key="saboteur-test" />;
      case 'goals':
        return <GoalsPage key="goals" />;
      case 'subscriptions':
        return <PaymentPlans key="subscriptions" />;
      case 'courses':
        return <CoursePlatformNetflix key="courses" user={user} />;
      case 'sessions':
        return (
          <div key="sessions" className="p-6">
            <UserSessions user={user} />
          </div>
        );
      case 'comunidade':
        return (
          <div key="comunidade" className="p-6">
            <RankingCommunity user={user} />
          </div>
        );
      case 'challenges':
        return (
          <div key="challenges" className="p-6">
            <DesafiosSection user={user} />
          </div>
        );
      case 'sofia-nutricional':
        return <SofiaNutricionalPage key="sofia-nutricional" />;
      case 'dr-vital':
        return <UserDrVitalPage key="dr-vital" />;
      case 'exercicios':
        return <ExerciseDashboard key="exercicios" user={user} />;
      case 'profile':
        return (
          <div key="profile" className="p-6">
            <UserProfile />
          </div>
        );
      default:
        return (
          <div key={`default-${activeSection}`} className="p-6">
            <h1 className="text-3xl font-bold mb-4 capitalize">{activeSection.replace('-', ' ')}</h1>
            <p className="text-muted-foreground">Esta funcionalidade está em desenvolvimento...</p>
          </div>
        );
    }
  };

  const SidebarContent = ({ isMobile = false }) => {
    // No mobile, sempre expandido
    const isExpanded = isMobile ? true : sidebarExpanded;
    
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Header com Menu - só mostra botão de expansão no desktop */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            {isExpanded && (
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">
                  {profileData?.fullName || user?.email || 'Usuário'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            )}
          </div>
          
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="h-8 w-8"
            >
              {sidebarExpanded ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start h-10 px-3 ${
                    isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'
                  }`}
                  onClick={() => {
                    setActiveSection(item.id as DashboardSection);
                    if (isMobile) setSidebarOpen(false);
                  }}
                >
                  <Icon className={`w-4 h-4 mr-3 ${item.color}`} />
                  {isExpanded && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Footer com Logout */}
        <div className="p-4 border-t">
          <Button
            variant="destructive"
            className="w-full justify-start h-10 px-3"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            {isExpanded && <span className="text-sm font-medium">Sair</span>}
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex flex-col transition-all duration-300 ${
          sidebarExpanded ? 'w-64' : 'w-16'
        }`}>
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b bg-card">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <h1 className="text-lg font-semibold">
              {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
            
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Modal de Exercícios */}
      <ExerciseOnboardingModal
        isOpen={exerciseModalOpen}
        onClose={() => setExerciseModalOpen(false)}
        user={user}
      />
    </div>
  );
};

export default CompleteDashboardPage;
