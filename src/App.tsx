import { lazy, Suspense } from "react";
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import SofiaFloatingButton from "@/components/SofiaFloatingButton";
import { createQueryClient } from "@/lib/queryConfig";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ActiveSectionProvider } from "@/contexts/ActiveSectionContext";

import { SplashScreen, useSplashScreen } from "@/components/pwa/SplashScreen";

// Core pages
import AuthPage from "./pages/AuthPage";
import AutoRedirect from "@/components/AutoRedirect";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";

// Lazy-loaded pages
const CompleteDashboardPage = lazy(() => import("./pages/CompleteDashboardPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const SofiaPage = lazy(() => import("./pages/SofiaPage"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
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

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground text-sm">Carregando...</p>
    </div>
  </div>
);

// Optimized query client for mobile performance
const queryClient = createQueryClient();

const App: React.FC = () => {
  const { showSplash, hideSplash } = useSplashScreen();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <ActiveSectionProvider>
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            
            <InstallPrompt delay={60000} />
            {showSplash && <SplashScreen onComplete={hideSplash} />}
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={<AutoRedirect />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/termos" element={<TermsPage />} />
                <Route path="/privacidade" element={<TermsPage />} />
                <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><CompleteDashboardPage /></Suspense>} />
                <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
                <Route path="/sofia" element={<Suspense fallback={<PageLoader />}><SofiaPage /></Suspense>} />
                <Route path="/anamnesis" element={<Suspense fallback={<PageLoader />}><AnamnesisPage /></Suspense>} />
                <Route path="/app/goals" element={<Suspense fallback={<PageLoader />}><GoalsPage /></Suspense>} />
                <Route path="/app/courses" element={<Suspense fallback={<PageLoader />}><CoursePlatform /></Suspense>} />
                <Route path="/app/progress" element={<Suspense fallback={<PageLoader />}><ProgressPage /></Suspense>} />
                <Route path="/nutricao" element={<Suspense fallback={<PageLoader />}><NutritionTrackingPage /></Suspense>} />
                <Route path="/challenges/:id" element={<Suspense fallback={<PageLoader />}><ChallengeDetailPage /></Suspense>} />
                <Route path="/google-fit-oauth" element={<Suspense fallback={<PageLoader />}><GoogleFitPage /></Suspense>} />
                <Route path="/google-fit-callback" element={<Suspense fallback={<PageLoader />}><GoogleFitCallbackPage /></Suspense>} />
                <Route path="/google-fit-test" element={<Suspense fallback={<PageLoader />}><GoogleFitTestPage /></Suspense>} />
                <Route path="/google-fit-dashboard" element={<Suspense fallback={<PageLoader />}><GoogleFitPremiumDashboard /></Suspense>} />
                <Route path="/dr-vital-enhanced" element={<Suspense fallback={<PageLoader />}><DrVitalEnhancedPage /></Suspense>} />
                <Route path="/sofia-nutricional" element={<Suspense fallback={<PageLoader />}><SofiaNutricionalPage /></Suspense>} />
                <Route path="/professional-evaluation" element={<Suspense fallback={<PageLoader />}><ProfessionalEvaluationPage /></Suspense>} />
                <Route path="/auto-login" element={<Suspense fallback={<PageLoader />}><AutoLoginPage /></Suspense>} />
                <Route path="/install" element={<Suspense fallback={<PageLoader />}><InstallPage /></Suspense>} />
                <Route path="/community/post/:postId" element={<Suspense fallback={<PageLoader />}><PublicPostPage /></Suspense>} />
                <Route path="*" element={<NotFound />} />
                </Routes>
                <SofiaFloatingButton />
              </Suspense>
            </BrowserRouter>
          </ActiveSectionProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;