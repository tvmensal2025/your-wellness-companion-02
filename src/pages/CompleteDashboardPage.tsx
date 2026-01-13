// FORCE REFRESH - Sistema de Exercícios Implementado
// Timestamp: $(date)
// Este arquivo foi atualizado para incluir o botão "Exercícios Recomendados"

import React, { useState, useEffect, useRef, lazy, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserDataCache, invalidateUserDataCache } from '@/hooks/useUserDataCache';
import { useActiveSection } from '@/contexts/ActiveSectionContext';
import { useMenuStyleContext } from '@/contexts/MenuStyleContext';
import { Home, Activity, GraduationCap, FileText, Users, Target, Award, Settings, TrendingUp, Stethoscope, CreditCard, Utensils, Menu, LogOut, ChevronLeft, ChevronRight, User as UserIcon, Scale, MessageCircle, Lock, Play, Dumbbell, SlidersHorizontal } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { BottomNavigation, BottomNavItem } from '@/components/navigation/BottomNavigation';
import { MobileHeader } from '@/components/navigation/MobileHeader';
import { MoreMenuSheet, MenuSection } from '@/components/navigation/MoreMenuSheet';

// Lazy load heavy components for better performance
const DashboardOverview = lazy(() => import('@/components/dashboard/DashboardOverview'));
const DailyMissions = lazy(() => import('@/components/daily-missions/DailyMissionsLight').then(m => ({ default: m.DailyMissionsLight })));
const CoursePlatformNetflix = lazy(() => import('@/components/dashboard/CoursePlatformNetflix'));
const SessionsPage = lazy(() => import('@/components/SessionsPage'));
const UserSessionsCompact = lazy(() => import('@/components/sessions/UserSessionsCompact'));
const GoalsPageV2 = lazy(() => import('@/pages/GoalsPageV2'));
const DesafiosSection = lazy(() => import('@/components/dashboard/DesafiosSection'));
const ChallengesV2Dashboard = lazy(() => import('@/components/challenges-v2/ChallengesDashboard'));
const RankingCommunity = lazy(() => import('@/components/RankingCommunity'));
const ExerciseOnboardingModal = lazy(() => import('@/components/exercise/ExerciseOnboardingModal').then(m => ({ default: m.ExerciseOnboardingModal })));
const ExerciseDashboard = lazy(() => import('@/components/exercise/ExerciseDashboard').then(m => ({ default: m.ExerciseDashboard })));
const HealthFeedPage = lazy(() => import('@/pages/HealthFeedPage'));
const PaymentPlans = lazy(() => import('@/components/PaymentPlans'));
const UserDrVitalPage = lazy(() => import('@/pages/UserDrVitalPage'));
const SofiaNutricionalSection = lazy(() => import('@/components/sofia/SofiaNutricionalSection').then(m => ({ default: m.SofiaNutricionalSection })));
const UserProfile = lazy(() => import('@/components/UserProfile'));
const MyProgress = lazy(() => import('@/components/MyProgress'));
const SaboteurTest = lazy(() => import('@/components/SaboteurTest'));
const LayoutPreferencesModal = lazy(() => import('@/components/settings/LayoutPreferencesModal').then(m => ({ default: m.LayoutPreferencesModal })));
const WhatsAppSettingsModal = lazy(() => import('@/components/settings/WhatsAppSettingsModal').then(m => ({ default: m.WhatsAppSettingsModal })));

// Sidebar components
import { SidebarProfile } from '@/components/sidebar/SidebarProfile';
import { ProfileModal } from '@/components/sidebar/ProfileModal';
import { useDirectMessages } from '@/hooks/useDirectMessages';
import { DirectMessagesModal } from '@/components/community/DirectMessagesModal';

// Importar loader animado
import { SectionLoader as AnimatedSectionLoader, AnimatedLoader } from '@/components/ui/animated-loader';

// Lightweight loader component com animação
const SectionLoader = () => <AnimatedSectionLoader text="Carregando..." />;

// Core dashboard components
import LockedMenuItem from '@/components/LockedMenuItem';
type DashboardSection = 'dashboard' | 'missions' | 'courses' | 'sessions' | 'comunidade' | 'goals' | 'challenges' | 'saboteur-test' | 'progress' | 'subscriptions' | 'sofia-nutricional' | 'dr-vital' | 'exercicios' | 'apps' | 'help' | 'profile';
const CompleteDashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSectionState, setActiveSectionState] = useState<DashboardSection>('dashboard');
  const { setActiveSection: setActiveSectionContext } = useActiveSection();
  const { isMenuEnabled, selectedCharacter } = useMenuStyleContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [exerciseModalOpen, setExerciseModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [layoutPrefsModalOpen, setLayoutPrefsModalOpen] = useState(false);
  const [whatsappSettingsOpen, setWhatsappSettingsOpen] = useState(false);
  const [dmModalOpen, setDmModalOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { totalUnread } = useDirectMessages();

  // Sincroniza estado local com contexto global para ocultar Sofia na comunidade
  const activeSection = activeSectionState;
  const setActiveSection = (section: DashboardSection) => {
    setActiveSectionState(section);
    setActiveSectionContext(section);
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: Home,
      label: 'Dashboard',
      color: 'text-primary',
    },
    {
      id: 'missions',
      icon: Activity,
      label: 'Missão do Dia',
      color: 'text-secondary',
    },
    {
      id: 'progress',
      icon: TrendingUp,
      label: 'Meu Progresso',
      color: 'text-cyan-500',
    },
    {
      id: 'goals',
      icon: Target,
      label: 'Minhas Metas',
      color: 'text-green-500',
    },
    {
      id: 'courses',
      icon: GraduationCap,
      label: 'Plataforma dos Sonhos',
      color: 'text-accent',
    },
    {
      id: 'sessions',
      icon: FileText,
      label: 'Sessões',
      color: 'text-muted-foreground',
    },
    {
      id: 'comunidade',
      icon: Users,
      label: 'Comunidade',
      color: 'text-blue-500',
    },
    {
      id: 'challenges',
      icon: Award,
      label: 'Desafios Individuais',
      color: 'text-orange-500',
    },
    {
      id: 'saboteur-test',
      icon: Settings,
      label: 'Teste de Sabotadores',
      color: 'text-gray-500',
    },
    {
      id: 'sofia-nutricional',
      icon: Utensils,
      label: 'Sofia Nutricional',
      color: 'text-emerald-600',
    },
    {
      id: 'dr-vital',
      icon: Stethoscope,
      label: 'Dr.Vital',
      color: 'text-blue-600',
    },
    {
      id: 'exercicios',
      icon: Dumbbell,
      label: 'Exercícios Recomendados',
      color: 'text-orange-600',
    },
    // NOVO!
    {
      id: 'subscriptions',
      icon: CreditCard,
      label: 'Assinaturas',
      color: 'text-purple-600',
    },
  ];

  // Cache centralizado - única fonte de dados

  const { data: userData, loading: userDataLoading, refresh: refreshUserData } = useUserDataCache();
  
  // Dados derivados do cache
  const profileData = useMemo(() => ({
    fullName: userData.profile?.fullName || '',
    avatarUrl: userData.profile?.avatarUrl || '',
  }), [userData.profile]);
  
  const preferences = useMemo(() => ({
    sidebarOrder: userData.layoutPreferences?.sidebarOrder || [],
    hiddenSidebarItems: userData.layoutPreferences?.hiddenSidebarItems || [],
    defaultSection: userData.layoutPreferences?.defaultSection || 'dashboard',
    dashboardCardsOrder: [],
    hiddenDashboardCards: [],
  }), [userData.layoutPreferences]);

  // Filtrar menuItems baseado no personagem selecionado
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item => isMenuEnabled(item.id));
  }, [isMenuEnabled, selectedCharacter]);

  // Calcular itens visíveis para bottom navigation baseado nas preferências E personagem
  const bottomNavItems: BottomNavItem[] = useMemo(() => {
    // Primeiro filtrar pelos menus habilitados do personagem
    const enabledMenuIds = filteredMenuItems.map(m => m.id);
    
    const visibleIds = preferences.sidebarOrder.filter(
      id => !preferences.hiddenSidebarItems.includes(id) && enabledMenuIds.includes(id)
    );
    
    // Se não há preferências, usar ordem padrão dos primeiros 4 itens habilitados
    if (visibleIds.length === 0) {
      return filteredMenuItems.slice(0, 4).map(item => ({
        id: item.id,
        icon: item.icon,
        label: item.label,
      }));
    }
    
    // Pegar os primeiros 4 itens visíveis na ordem das preferências
    const items: BottomNavItem[] = [];
    for (const id of preferences.sidebarOrder) {
      if (visibleIds.includes(id)) {
        const menuItem = filteredMenuItems.find(m => m.id === id);
        if (menuItem) {
          items.push({
            id: menuItem.id,
            icon: menuItem.icon,
            label: menuItem.label,
          });
        }
      }
      if (items.length >= 4) break;
    }
    
    return items;
  }, [preferences.sidebarOrder, preferences.hiddenSidebarItems, filteredMenuItems]);

  // Lazy load exercise program apenas quando necessário
  const [programs, setPrograms] = useState<any[]>([]);
  const programsFetchedRef = useRef(false);
  
  const hasSetDefaultSectionRef = useRef(false);
  
  // Definir seção inicial baseada nas preferências
  useEffect(() => {
    if (!userDataLoading && preferences.defaultSection && !hasSetDefaultSectionRef.current) {
      hasSetDefaultSectionRef.current = true;
      setActiveSection(preferences.defaultSection as DashboardSection);
    }
  }, [preferences.defaultSection, userDataLoading]);
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
        return <Suspense fallback={<SectionLoader />}><GoalsPageV2 key="goals" /></Suspense>;
      case 'subscriptions':
        return <Suspense fallback={<SectionLoader />}><PaymentPlans key="subscriptions" /></Suspense>;
      case 'courses':
        return <Suspense fallback={<SectionLoader />}><CoursePlatformNetflix key="courses" user={user} /></Suspense>;
      case 'sessions':
        return <Suspense fallback={<SectionLoader />}><div key="sessions" className="px-4 pt-2">
            <UserSessionsCompact user={user} />
          </div></Suspense>;
      case 'comunidade':
        return <Suspense fallback={<SectionLoader />}><HealthFeedPage key="comunidade" /></Suspense>;
      case 'challenges':
        return <Suspense fallback={<SectionLoader />}><div key="challenges" className="px-4 pt-2 pb-20">
            <ChallengesV2Dashboard />
          </div></Suspense>;
      case 'sofia-nutricional':
        return <Suspense fallback={<SectionLoader />}>
          <div key="sofia-nutricional" className="p-2 sm:p-4">
            <SofiaNutricionalSection embedded={true} />
          </div>
        </Suspense>;
      case 'dr-vital':
        return <Suspense fallback={<SectionLoader />}><UserDrVitalPage key="dr-vital" /></Suspense>;
      case 'exercicios':
        return <Suspense fallback={<SectionLoader />}><div key="exercicios" className="px-2 sm:px-3 py-2 space-y-2 overflow-hidden">
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
    
    // Função para obter itens visíveis
    const getVisibleSidebarItems = () => {
      return preferences.sidebarOrder.filter(
        id => !preferences.hiddenSidebarItems.includes(id)
      );
    };
    
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
      
      // Se não há itens ordenados, retorna todos os itens
      if (orderedItems.length === 0) {
        return menuItems;
      }
      
      return orderedItems;
    }, [preferences.sidebarOrder, preferences.hiddenSidebarItems]);
    
    return <div className="flex flex-col h-full bg-gradient-to-b from-card via-card to-muted/30">
        {/* Header com Perfil */}
        <div className="flex items-center justify-between border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex-1">
            <SidebarProfile
              fullName={profileData?.fullName || ''}
              email={user?.email || ''}
              avatarUrl={profileData?.avatarUrl || ''}
              isExpanded={isExpanded}
              onAvatarUpload={async (file: File) => { return ''; }}
              onProfileClick={() => {
                setProfileModalOpen(true);
                if (isMobile) setSidebarOpen(false);
              }}
            />
          </div>
          
          {!isMobile && isExpanded && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarExpanded(!sidebarExpanded)} className="h-8 w-8 mr-2 hover:bg-primary/10">
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
          {!isMobile && !isExpanded && (
            <Button variant="ghost" size="icon" onClick={() => setSidebarExpanded(!sidebarExpanded)} className="h-8 w-8 absolute right-1 top-3 hover:bg-primary/10">
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1.5">
            {orderedMenuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  className={`
                    w-full flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary/20 via-primary/15 to-primary/5 text-primary shadow-sm border border-primary/20' 
                      : 'hover:bg-muted/80 text-muted-foreground hover:text-foreground'
                    }
                    ${!isExpanded ? 'justify-center px-0' : ''}
                  `}
                  onClick={() => {
                    setActiveSection(item.id as DashboardSection);
                    if (item.id === 'exercicios' && programs.length === 0) {
                      setExerciseModalOpen(true);
                    }
                    if (isMobile) setSidebarOpen(false);
                  }}
                  style={{
                    animationDelay: `${index * 30}ms`
                  }}
                >
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-primary/20 shadow-inner' 
                      : 'bg-muted/50 group-hover:bg-muted'
                    }
                  `}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : item.color}`} />
                  </div>
                  {isExpanded && (
                    <span className={`text-sm font-medium truncate flex-1 text-left ${isActive ? 'text-primary' : ''}`}>
                      {item.label}
                    </span>
                  )}
                  {isActive && isExpanded && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer com Personalizar + Logout */}
        <div className="p-3 border-t border-border/50 bg-gradient-to-t from-muted/20 to-transparent space-y-2">
          {/* Botão Personalizar Menu */}
          <button 
            className={`
              w-full flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200
              hover:bg-muted/80 text-muted-foreground hover:text-foreground
              ${!isExpanded ? 'justify-center px-0' : ''}
            `}
            onClick={() => {
              setLayoutPrefsModalOpen(true);
              if (isMobile) setSidebarOpen(false);
            }}
            title="Personalizar Menu"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            {isExpanded && <span className="text-sm font-medium">Personalizar Menu</span>}
          </button>
          
          {/* Botão Logout */}
          <button 
            className={`
              w-full flex items-center gap-3 h-11 px-3 rounded-xl transition-all duration-200
              bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20
              ${!isExpanded ? 'justify-center px-0' : ''}
            `}
            onClick={handleLogout}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive/20">
              <LogOut className="w-4 h-4" />
            </div>
            {isExpanded && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>
      </div>;
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
        <AnimatedSectionLoader text="Carregando dashboard..." />
      </div>;
  }
  if (!user) {
    return null;
  }
  // Handler para navegação inferior
  const handleBottomNavChange = (section: string) => {
    if (section !== 'more') {
      setActiveSection(section as DashboardSection);
    }
  };

  // Handler para menu "Mais"
  const { setShowSelector } = useMenuStyleContext();
  
  const handleMoreMenuNavigate = (section: MenuSection) => {
    if (section === 'whatsapp-settings') {
      setWhatsappSettingsOpen(true);
      return;
    }
    if (section === 'change-character') {
      setShowSelector(true);
      return;
    }
    setActiveSection(section as DashboardSection);
  };
  return <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className={`hidden lg:flex flex-col transition-all duration-300 ${sidebarExpanded ? 'w-64' : 'w-16'}`}>
          <SidebarContent />
        </div>

        {/* Mobile Sidebar - Otimizado para telas pequenas */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[280px] max-w-[85vw] p-0">
            <SidebarContent isMobile />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-b from-background via-background to-muted/40 overflow-hidden">
          {/* Mobile Header - Simplificado */}
          <MobileHeader 
            title={menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            onAvatarClick={() => setProfileModalOpen(true)}
            avatarUrl={profileData?.avatarUrl}
            userName={profileData?.fullName}
            userId={user?.id}
            unreadMessages={totalUnread}
            onMessageClick={() => setDmModalOpen(true)}
          />

          {/* Content - Otimizado para mobile com overflow controlado */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 lg:pb-0">
            <main className="w-full max-w-6xl mx-auto px-2 sm:px-4 pt-2 pb-4 lg:px-6 lg:pt-6 space-y-2 sm:space-y-4 animate-fade-in">
              {renderContent()}
            </main>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation 
        activeSection={activeSection}
        onSectionChange={handleBottomNavChange}
        onMoreClick={() => setMoreMenuOpen(true)}
        visibleItems={bottomNavItems}
      />

      {/* More Menu Sheet - Mobile Only */}
      <MoreMenuSheet
        open={moreMenuOpen}
        onOpenChange={setMoreMenuOpen}
        onNavigate={handleMoreMenuNavigate}
        onLogout={handleLogout}
        onOpenLayoutPrefs={() => setLayoutPrefsModalOpen(true)}
        userProfile={{
          fullName: profileData?.fullName,
          email: user?.email,
          avatarUrl: profileData?.avatarUrl,
        }}
      />

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
          onSave={async (newPrefs) => {
            // Salva preferências no banco
            if (!user) return false;
            try {
              const { error } = await supabase
                .from('user_layout_preferences')
                .upsert({
                  user_id: user.id,
                  sidebar_order: newPrefs.sidebarOrder || preferences.sidebarOrder,
                  hidden_sidebar_items: newPrefs.hiddenSidebarItems || preferences.hiddenSidebarItems,
                  default_section: newPrefs.defaultSection || preferences.defaultSection,
                  updated_at: new Date().toISOString(),
                }, { onConflict: 'user_id' });
              
              if (error) throw error;
              invalidateUserDataCache();
              refreshUserData();
              return true;
            } catch (err) {
              console.error('Erro ao salvar preferências:', err);
              return false;
            }
          }}
        />
      </Suspense>

      {/* Modal de Configurações do WhatsApp */}
      <Suspense fallback={null}>
        <WhatsAppSettingsModal 
          open={whatsappSettingsOpen} 
          onOpenChange={setWhatsappSettingsOpen}
        />
      </Suspense>

      {/* Modal de Mensagens Diretas */}
      <DirectMessagesModal
        open={dmModalOpen}
        onOpenChange={setDmModalOpen}
      />
    </div>;
};
export default CompleteDashboardPage;