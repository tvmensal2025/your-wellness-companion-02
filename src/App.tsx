import { lazy, Suspense } from "react";
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import FloatingMessagesButton from "@/components/FloatingMessagesButton";
import { createQueryClient } from "@/lib/queryConfig";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { UpdatePrompt, ChunkErrorHandler } from "@/components/pwa/UpdatePrompt";
import { ActiveSectionProvider } from "@/contexts/ActiveSectionContext";
import { UserThemeProvider } from "@/contexts/ThemeContext";
import { PageLoader as AnimatedPageLoader } from "@/components/ui/animated-loader";
import { MenuStyleProvider } from "@/contexts/MenuStyleContext";
import { CharacterGate } from "@/components/character-selector";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

import { SplashScreen, useSplashScreen } from "@/components/pwa/SplashScreen";

// Core pages
import AuthPage from "./pages/AuthPage";
import AutoRedirect from "@/components/AutoRedirect";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";

// Lazy-loaded pages
const AdminPage = lazy(() => import("./pages/AdminPage"));
const SofiaPage = lazy(() => import("./pages/SofiaPage"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const GoalsPageV2 = lazy(() => import("./pages/GoalsPageV2"));
const NutritionTrackingPage = lazy(() => import("./pages/NutritionTrackingPage").then(module => ({ default: module.NutritionTrackingPage })));
const ChallengeDetailPage = lazy(() => import("./pages/ChallengeDetailPage"));
const CoursePlatform = lazy(() => import("./components/CoursePlatform"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const AnamnesisPage = lazy(() => import("./pages/AnamnesisPage"));
const GoogleFitPage = lazy(() => import("./pages/GoogleFitPage").then(module => ({ default: module.GoogleFitPage })));
const GoogleFitCallbackPage = lazy(() => import("./pages/GoogleFitCallback").then(module => ({ default: module.GoogleFitCallback })));
const GoogleFitTestPage = lazy(() => import("./pages/GoogleFitTestPage"));
const GoogleFitPremiumDashboard = lazy(() => import("./pages/GoogleFitPremiumDashboard"));
const DrVitalEnhancedPage = lazy(() => import("./pages/DrVitalEnhancedPage"));
const SofiaNutricionalPage = lazy(() => import("./pages/SofiaNutricionalPage").then(module => ({ default: module.SofiaNutricionalPage })));
const ProfessionalEvaluationPage = lazy(() => import("./pages/ProfessionalEvaluationPage"));
const AutoLoginPage = lazy(() => import("./pages/AutoLoginPage"));
const InstallPage = lazy(() => import("./pages/Install"));
const PublicPostPage = lazy(() => import("./pages/PublicPostPage"));
const PublicReport = lazy(() => import("./pages/PublicReport"));
const SystemHealth = lazy(() => import("./pages/admin/SystemHealth"));
const ChallengesV2Page = lazy(() => import("./pages/ChallengesV2Page"));

// Loader animado global com branding
const PageLoader = () => <AnimatedPageLoader />;

// Optimized query client for mobile performance
const queryClient = createQueryClient();

const App: React.FC = () => {
  const { showSplash, hideSplash } = useSplashScreen();

  return (
    <>
      {/* Handler global para erros de chunk - evita tela branca */}
      <ChunkErrorHandler />
      
      <QueryClientProvider client={queryClient}>
      <ErrorBoundary
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔄</span>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-foreground">Algo deu errado</h2>
              <p className="text-muted-foreground mb-4">Tente recarregar a página</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Recarregar
              </button>
            </div>
          </div>
        }
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <UserThemeProvider>
            <TooltipProvider>
              <MenuStyleProvider>
                <ActiveSectionProvider>
                  <Toaster />
                  <Sonner />
                  <OfflineIndicator />
                  
                  {/* PWA: Atualização automática + Prompt de instalação */}
                  <UpdatePrompt />
                  <InstallPrompt delay={3000} showOnlyOnce={false} />
                  
                  {showSplash && <SplashScreen onComplete={hideSplash} />}
                  <BrowserRouter>
                    <CharacterGate>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<AutoRedirect />} />
                          <Route path="/auth" element={<AuthPage />} />
                          <Route path="/terms" element={<TermsPage />} />
                          <Route path="/termos" element={<TermsPage />} />
                          <Route path="/privacidade" element={<TermsPage />} />
                          <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><SofiaPage /></Suspense>} />
                          <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
                          <Route path="/sofia" element={<Suspense fallback={<PageLoader />}><SofiaPage /></Suspense>} />
                          <Route path="/anamnesis" element={<Suspense fallback={<PageLoader />}><AnamnesisPage /></Suspense>} />
                          <Route path="/app/goals" element={<Suspense fallback={<PageLoader />}><GoalsPageV2 /></Suspense>} />
                          <Route path="/app/courses" element={<Suspense fallback={<PageLoader />}><CoursePlatform /></Suspense>} />
                          <Route path="/app/progress" element={<Suspense fallback={<PageLoader />}><ProgressPage /></Suspense>} />
                          <Route path="/nutricao" element={<Suspense fallback={<PageLoader />}><NutritionTrackingPage /></Suspense>} />
                          <Route path="/challenges/:id" element={<Suspense fallback={<PageLoader />}><ChallengeDetailPage /></Suspense>} />
                          <Route path="/desafios" element={<Suspense fallback={<PageLoader />}><ChallengesV2Page /></Suspense>} />
                          <Route path="/challenges" element={<Suspense fallback={<PageLoader />}><ChallengesV2Page /></Suspense>} />
                          <Route path="/google-fit-oauth" element={<Suspense fallback={<PageLoader />}><GoogleFitPage /></Suspense>} />
                          <Route path="/google-fit-callback" element={<Suspense fallback={<PageLoader />}><GoogleFitCallbackPage /></Suspense>} />
                          <Route path="/google-fit-test" element={<Suspense fallback={<PageLoader />}><GoogleFitTestPage /></Suspense>} />
                          <Route path="/google-fit-dashboard" element={<Suspense fallback={<PageLoader />}><GoogleFitPremiumDashboard /></Suspense>} />
                          <Route path="/dr-vital-enhanced" element={<Suspense fallback={<PageLoader />}><DrVitalEnhancedPage /></Suspense>} />
                          <Route path="/sofia-nutricional" element={<Suspense fallback={<PageLoader />}><SofiaNutricionalPage /></Suspense>} />
                          {/* DESABILITADO TEMPORARIAMENTE - Avaliação Profissional */}
                          {/* <Route path="/professional-evaluation" element={<Suspense fallback={<PageLoader />}><ProfessionalEvaluationPage /></Suspense>} /> */}
                          <Route path="/auto-login" element={<Suspense fallback={<PageLoader />}><AutoLoginPage /></Suspense>} />
                          <Route path="/install" element={<Suspense fallback={<PageLoader />}><InstallPage /></Suspense>} />
                          <Route path="/community/post/:postId" element={<Suspense fallback={<PageLoader />}><PublicPostPage /></Suspense>} />
                          <Route path="/relatorio/:token" element={<Suspense fallback={<PageLoader />}><PublicReport /></Suspense>} />
                          <Route path="/admin/system-health" element={<Suspense fallback={<PageLoader />}><SystemHealth /></Suspense>} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                        <FloatingMessagesButton />
                      </Suspense>
                    </CharacterGate>
                  </BrowserRouter>
                </ActiveSectionProvider>
              </MenuStyleProvider>
            </TooltipProvider>
          </UserThemeProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </QueryClientProvider>
    </>
  );
};

export default App;