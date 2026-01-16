import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const LoadingFallback = () => (
  <div className="p-4 space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-8 w-3/4" />
  </div>
);

export const FullPageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="space-y-4 w-full max-w-md p-4">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-12 w-2/3" />
    </div>
  </div>
);

export const withSuspense = (LazyComponent: any, fallback: any = null) => {
  const FallbackComponent = fallback || <LoadingFallback />;
  return (props: any) => (
    <Suspense fallback={FallbackComponent}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export const LazyDashboardOverview = lazy(() => import('@/components/dashboard/DashboardOverview'));
export const LazyCoursePlatformNetflix = lazy(() => import('@/components/dashboard/CoursePlatformNetflix'));
export const LazyExerciseOnboardingModal = lazy(() => import('@/components/exercise/onboarding'));
export const LazyChallengesDashboard = lazy(() => import('@/components/challenges-v2/ChallengesDashboard'));

export const DashboardOverview = withSuspense(LazyDashboardOverview, <FullPageLoadingFallback />);
export const CoursePlatformNetflix = withSuspense(LazyCoursePlatformNetflix, <FullPageLoadingFallback />);
export const ExerciseOnboardingModal = withSuspense(LazyExerciseOnboardingModal, <LoadingFallback />);
export const ChallengesDashboard = withSuspense(LazyChallengesDashboard, <FullPageLoadingFallback />);
