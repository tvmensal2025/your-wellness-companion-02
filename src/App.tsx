import { useState, useEffect, lazy, Suspense } from "react";
import './App.css';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import SofiaFloatingButton from "@/components/SofiaFloatingButton";

// Core pages
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import TermsPage from "./pages/TermsPage";

// Lazy-loaded pages
const CompleteDashboardPage = lazy(() => import("./pages/CompleteDashboardPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const SofiaPage = lazy(() => import("./pages/SofiaPage"));
const GoalsPage = lazy(() => import("./pages/GoalsPage"));
const CoursePlatform = lazy(() => import("./components/CoursePlatform"));
const ProgressPage = lazy(() => import("./pages/ProgressPage"));
const GoogleFitPage = lazy(() => import("./pages/GoogleFitPage").then(module => ({ default: module.GoogleFitPage })));
const GoogleFitCallbackPage = lazy(() => import("./pages/GoogleFitCallback").then(module => ({ default: module.GoogleFitCallback })));
const GoogleFitTestPage = lazy(() => import("./pages/GoogleFitTestPage"));
const GoogleFitPremiumDashboard = lazy(() => import("./pages/GoogleFitPremiumDashboard"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="text-muted-foreground text-sm">Carregando...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
    mutations: { retry: 1 },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/termos" element={<TermsPage />} />
              <Route path="/privacidade" element={<TermsPage />} />
              <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><CompleteDashboardPage /></Suspense>} />
              <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPage /></Suspense>} />
              <Route path="/sofia" element={<Suspense fallback={<PageLoader />}><SofiaPage /></Suspense>} />
              <Route path="/app/goals" element={<Suspense fallback={<PageLoader />}><GoalsPage /></Suspense>} />
              <Route path="/app/courses" element={<Suspense fallback={<PageLoader />}><CoursePlatform /></Suspense>} />
              <Route path="/app/progress" element={<Suspense fallback={<PageLoader />}><ProgressPage /></Suspense>} />
              <Route path="/google-fit-oauth" element={<Suspense fallback={<PageLoader />}><GoogleFitPage /></Suspense>} />
              <Route path="/google-fit-callback" element={<Suspense fallback={<PageLoader />}><GoogleFitCallbackPage /></Suspense>} />
              <Route path="/google-fit-test" element={<Suspense fallback={<PageLoader />}><GoogleFitTestPage /></Suspense>} />
              <Route path="/google-fit-dashboard" element={<Suspense fallback={<PageLoader />}><GoogleFitPremiumDashboard /></Suspense>} />
            </Routes>
            <SofiaFloatingButton />
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;