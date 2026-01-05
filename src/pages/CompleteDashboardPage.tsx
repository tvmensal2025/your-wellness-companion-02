// FORCE REFRESH - Sistema de Exercícios Implementado
// Timestamp: $(date)
// Este arquivo foi atualizado para incluir o botão "Exercícios Recomendados"

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Home, Activity, GraduationCap, FileText, Users, Target, Award, Settings, TrendingUp, Stethoscope, CreditCard, Utensils, Menu, LogOut, ChevronLeft, ChevronRight, User as UserIcon, Scale, MessageCircle, Lock, Play, Dumbbell, SlidersHorizontal } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSofiaAnalysis } from '@/hooks/useSofiaAnalysis';
import { useExerciseProgram } from '@/hooks/useExerciseProgram';
import { useLayoutPreferences } from '@/hooks/useLayoutPreferences';
import { cn } from '@/lib/utils';

// Lazy load heavy components for better performance
const DashboardOverview = lazy(() => import('@/components/dashboard/DashboardOverview'));
const DailyMissions = lazy(() => import('@/components/daily-missions/DailyMissionsFinal').then(m => ({ default: m.DailyMissionsFinal })));
const CoursePlatformNetflix = lazy(() => import('@/components/dashboard/CoursePlatformNetflix'));
const SessionsPage = lazy(() => import('@/components/SessionsPage'));
const UserSessions = lazy(() => import('@/components/UserSessions'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const DesafiosSection = lazy(() => import('@/components/dashboard/DesafiosSection'));
const RankingCommunity = lazy(() => import('@/components/RankingCommunity'));
const ExerciseOnboardingModal = lazy(() => import('@/components/exercise/ExerciseOnboardingModal').then(m => ({ default: m.ExerciseOnboardingModal })));
const ExerciseDashboard = lazy(() => import('@/components/exercise/ExerciseDashboard').then(m => ({ default: m.ExerciseDashboard })));
const HealthFeedPage = lazy(() => import('@/pages/HealthFeedPage'));
const PaymentPlans = lazy(() => import('@/components/PaymentPlans'));
const UserDrVitalPage = lazy(() => import('@/pages/UserDrVitalPage'));
const SofiaNutricionalPage = lazy(() => import('@/pages/SofiaNutricionalPage').then(m => ({ default: m.SofiaNutricionalPage })));
const UserProfile = lazy(() => import('@/components/UserProfile'));
const MyProgress = lazy(() => import('@/components/MyProgress'));
const SaboteurTest = lazy(() => import('@/components/SaboteurTest'));
const LayoutPreferencesModal = lazy(() => import('@/components/settings/LayoutPreferencesModal').then(m => ({ default: m.LayoutPreferencesModal })));

// Sidebar components
import { SidebarProfile } from '@/components/sidebar/SidebarProfile';
import { ProfileModal } from '@/components/sidebar/ProfileModal';

// Lightweight loader component
const SectionLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
  </div>
);

// Core dashboard components
import LockedMenuItem from '@/components/LockedMenuItem';
type DashboardSection = 'dashboard' | 'missions' | 'courses' | 'sessions' | 'comunidade' | 'goals' | 'challenges' | 'saboteur-test' | 'progress' | 'subscriptions' | 'sofia-nutricional' | 'dr-vital' | 'exercicios' | 'apps' | 'help' | 'profile';
const CompleteDashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [layoutPrefsModalOpen, setLayoutPrefsModalOpen] = useState(false);
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    profileData,
    loading: profileLoading,
    loadProfile,
    uploadAvatar
  } = useUserProfile(user);
  const {
    performAnalysis
  } = useSofiaAnalysis();
  const hasAutoAnalyzedRef = useRef(false);
  const {
    programs,
    activeProgram
  } = useExerciseProgram(user?.id);
  const {
    preferences,
    loading: prefsLoading,
    savePreferences,
    getVisibleSidebarItems
  } = useLayoutPreferences(user);
  
  // Definir seção inicial baseada nas preferências
  const hasSetDefaultSectionRef = useRef(false);
  useEffect(() => {
    if (!prefsLoading && preferences.defaultSection && !hasSetDefaultSectionRef.current) {
      hasSetDefaultSectionRef.current = true;
      setActiveSection(preferences.defaultSection as DashboardSection);
    }
  }, [preferences.defaultSection, prefsLoading]);
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // garante que não fique preso no loader em mudanças de auth
      if (!session) {
        navigate("/auth");
      }
    });
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
      await Promise.race([supabase.auth.signOut(), new Promise(resolve => setTimeout(resolve, 1500))]);
    } catch (e) {} finally {
      setLoading(false);
      navigate('/auth', {
        replace: true
      });
    }
  };
  const menuItems = [{
    id: 'dashboard',
    icon: Home,
    label: 'Dashboard',
    color: 'text-primary'
  }, {
    id: 'missions',
    icon: Activity,
    label: 'Missão do Dia',
    color: 'text-secondary'
  }, {
    id: 'progress',
    icon: TrendingUp,
    label: 'Meu Progresso',
    color: 'text-cyan-500'
  }, {
    id: 'goals',
    icon: Target,
    label: 'Minhas Metas',
    color: 'text-green-500'
  }, {
    id: 'courses',
    icon: GraduationCap,
    label: 'Plataforma dos Sonhos',
    color: 'text-accent'
  }, {
    id: 'sessions',
    icon: FileText,
    label: 'Sessões',
    color: 'text-muted-foreground'
  }, {
    id: 'comunidade',
    icon: Users,
    label: 'Comunidade',
    color: 'text-blue-500'
  }, {
    id: 'challenges',
    icon: Award,
    label: 'Desafios Individuais',
    color: 'text-orange-500'
  }, {
    id: 'saboteur-test',
    icon: Settings,
    label: 'Teste de Sabotadores',
    color: 'text-gray-500'
  }, {
    id: 'sofia-nutricional',
    icon: Utensils,
    label: 'Sofia Nutricional',
    color: 'text-emerald-600'
  }, {
    id: 'dr-vital',
    icon: Stethoscope,
    label: 'Dr.Vital',
    color: 'text-blue-600'
  }, {
    id: 'exercicios',
    icon: Dumbbell,
    label: 'Exercícios Recomendados',
    color: 'text-orange-600'
  },
  // NOVO!
  {
    id: 'subscriptions',
    icon: CreditCard,
    label: 'Assinaturas',
    color: 'text-purple-600'
  }];
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
      return <div key="locked-content" className="min-h-screen flex items-center justify-center p-6">
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
              <Button onClick={() => setActiveSection('subscriptions')} className="bg-primary hover:bg-primary/90">
                Ver Planos Premium
              </Button>
            </div>
          </div>
        </div>;
    }

    // Adicionar key para cada componente renderizado para evitar problemas de DOM
    // Wrap all lazy components with Suspense for better loading performance
    switch (activeSection) {
      case 'dashboard':
        return <Suspense fallback={<SectionLoader />}><DashboardOverview key="dashboard" /></Suspense>;
      case 'missions':
        return <Suspense fallback={<SectionLoader />}><DailyMissions key="missions" user={user} /></Suspense>;
      case 'progress':
        return <Suspense fallback={<SectionLoader />}><MyProgress key="progress" /></Suspense>;
      case 'saboteur-test':
        return <Suspense fallback={<SectionLoader />}><SaboteurTest key="saboteur-test" /></Suspense>;
      case 'goals':
        return <Suspense fallback={<SectionLoader />}><GoalsPage key="goals" /></Suspense>;
      case 'subscriptions':
        return <Suspense fallback={<SectionLoader />}><PaymentPlans key="subscriptions" /></Suspense>;
      case 'courses':
        return <Suspense fallback={<SectionLoader />}><CoursePlatformNetflix key="courses" user={user} /></Suspense>;
      case 'sessions':
        return <Suspense fallback={<SectionLoader />}><div key="sessions" className="p-6">
            <UserSessions user={user} />
          </div></Suspense>;
      case 'comunidade':
        return <Suspense fallback={<SectionLoader />}><div key="comunidade" className="p-6">
            <RankingCommunity user={user} />
          </div></Suspense>;
      case 'challenges':
        return <Suspense fallback={<SectionLoader />}><div key="challenges" className="p-6">
            <DesafiosSection user={user} />
          </div></Suspense>;
      case 'sofia-nutricional':
        return <Suspense fallback={<SectionLoader />}><SofiaNutricionalPage key="sofia-nutricional" /></Suspense>;
      case 'dr-vital':
        return <Suspense fallback={<SectionLoader />}><UserDrVitalPage key="dr-vital" /></Suspense>;
      case 'exercicios':
        return <Suspense fallback={<SectionLoader />}><div key="exercicios" className="p-4 space-y-4">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setExerciseModalOpen(true)}>
                Criar outro treino
              </Button>
            </div>
            <ExerciseDashboard user={user} />
          </div></Suspense>;
      case 'profile':
        return <Suspense fallback={<SectionLoader />}><div key="profile" className="p-6">
            <UserProfile />
          </div></Suspense>;
      default:
        return <div key={`default-${activeSection}`} className="p-6">
            <h1 className="text-3xl font-bold mb-4 capitalize">{activeSection.replace('-', ' ')}</h1>
            <p className="text-muted-foreground">Esta funcionalidade está em desenvolvimento...</p>
          </div>;
    }
  };
  const SidebarContent = ({
    isMobile = false
  }) => {
    // No mobile, sempre expandido
    const isExpanded = isMobile ? true : sidebarExpanded;
    
    // Ordenar itens do menu de acordo com as preferências
    const orderedMenuItems = React.useMemo(() => {
      const visibleIds = getVisibleSidebarItems();
      const orderedItems: typeof menuItems = [];
      
      // Primeiro, adicionar itens na ordem das preferências
      for (const id of preferences.sidebarOrder) {
        if (visibleIds.includes(id)) {
          const item = menuItems.find(m => m.id === id);
          if (item) orderedItems.push(item);
        }
      }
      
      // Adicionar itens que não estão nas preferências (novos itens)
      for (const item of menuItems) {
        if (visibleIds.includes(item.id) && !orderedItems.some(m => m.id === item.id)) {
          orderedItems.push(item);
        }
      }
      
      return orderedItems;
    }, [preferences.sidebarOrder, getVisibleSidebarItems]);
    
    return <div className="flex flex-col h-full bg-card">
        {/* Header com Perfil */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <SidebarProfile
              fullName={profileData?.fullName || ''}
              email={user?.email || ''}
              avatarUrl={profileData?.avatarUrl || ''}
              isExpanded={isExpanded}
              onAvatarUpload={uploadAvatar}
              onProfileClick={() => {
                setProfileModalOpen(true);
                if (isMobile) setSidebarOpen(false);
              }}
            />
          </div>
          
          {!isMobile && isExpanded && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarExpanded(!sidebarExpanded)} className="h-8 w-8 mr-2">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          {!isMobile && !isExpanded && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarExpanded(!sidebarExpanded)} className="h-8 w-8 absolute right-1 top-3">
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {orderedMenuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return <Button key={item.id} variant={isActive ? "secondary" : "ghost"} className={`w-full justify-start h-10 px-3 ${isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-muted'}`} onClick={() => {
              setActiveSection(item.id as DashboardSection);
              if (item.id === 'exercicios' && programs.length === 0) {
                setExerciseModalOpen(true);
              }
              if (isMobile) setSidebarOpen(false);
            }}>
                  <Icon className={`w-4 h-4 mr-3 ${item.color}`} />
                  {isExpanded && <span className="text-sm font-medium truncate">{item.label}</span>}
                </Button>;
          })}
          </div>
        </div>

        {/* Footer com Logout */}
        <div className="p-4 border-t">
          <Button variant="destructive" className="w-full justify-start h-10 px-3" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-3" />
            {isExpanded && <span className="text-sm font-medium">Sair</span>}
          </Button>
        </div>
      </div>;
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>;
  }
  if (!user) {
    return null;
  }
  return <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex flex-col transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-16'}`}>
          <SidebarContent />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0 max-w-[85vw]">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-background via-background to-muted/40 overflow-x-hidden">
          {/* Mobile Header - Sticky para melhor UX */}
          <div className="lg:hidden flex items-center justify-between px-3 py-2.5 border-b bg-card/95 backdrop-blur-sm sticky top-0 z-40">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="h-9 w-9">
              <Menu className="w-5 h-5" />
            </Button>
            
            <h1 className="text-sm font-semibold text-center truncate max-w-[40vw]">
              {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
            
            <NotificationBell />
          </div>

          {/* Content - Otimizado para mobile */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-6">
            <main className="w-full max-w-6xl mx-auto px-3 sm:px-4 pt-3 pb-6 lg:px-6 lg:pt-6 space-y-3 sm:space-y-4 animate-fade-in">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation removida conforme pedido do usuário */}

      {/* Modal de Exercícios */}
      <Suspense fallback={null}>
        <ExerciseOnboardingModal isOpen={exerciseModalOpen} onClose={() => setExerciseModalOpen(false)} user={user} />
      </Suspense>
      
      {/* Modal de Perfil */}
      <ProfileModal 
        open={profileModalOpen} 
        onOpenChange={setProfileModalOpen}
        onOpenLayoutPrefs={() => {
          setProfileModalOpen(false);
          setLayoutPrefsModalOpen(true);
        }}
      />
      
      {/* Modal de Preferências de Layout */}
      <Suspense fallback={null}>
        <LayoutPreferencesModal 
          open={layoutPrefsModalOpen} 
          onOpenChange={setLayoutPrefsModalOpen}
          preferences={preferences}
          menuItems={menuItems}
          onSave={savePreferences}
        />
      </Suspense>
    </div>;
};
export default CompleteDashboardPage;