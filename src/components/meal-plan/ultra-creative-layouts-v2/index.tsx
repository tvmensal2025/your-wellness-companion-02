import React, { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load each layout component
const MusicPlayerLayout = lazy(() => import('./layouts/MusicPlayerLayout').then(m => ({ default: m.MusicPlayerLayout })));
const ZenNatureLayout = lazy(() => import('./layouts/ZenNatureLayout').then(m => ({ default: m.ZenNatureLayout })));
const CinemaLayout = lazy(() => import('./layouts/CinemaLayout').then(m => ({ default: m.CinemaLayout })));
const AdventureMapLayout = lazy(() => import('./layouts/AdventureMapLayout').then(m => ({ default: m.AdventureMapLayout })));
const SmartphoneLayout = lazy(() => import('./layouts/SmartphoneLayout').then(m => ({ default: m.SmartphoneLayout })));
const LuxuryLayout = lazy(() => import('./layouts/LuxuryLayout').then(m => ({ default: m.LuxuryLayout })));

// Loading fallback component
const LayoutLoadingFallback: React.FC = () => (
  <div className="relative min-h-[550px] rounded-3xl overflow-hidden bg-background">
    <div className="p-6 space-y-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-48 w-full" />
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <Skeleton className="h-16 w-full" />
    </div>
  </div>
);

// Layout configuration
const layouts = [
  { name: 'Spotify', component: MusicPlayerLayout, emoji: '🎵' },
  { name: 'Zen', component: ZenNatureLayout, emoji: '🌿' },
  { name: 'Cinema', component: CinemaLayout, emoji: '🎬' },
  { name: 'Aventura', component: AdventureMapLayout, emoji: '🗺️' },
  { name: 'iOS', component: SmartphoneLayout, emoji: '📱' },
  { name: 'Luxo', component: LuxuryLayout, emoji: '💎' },
];

export const UltraCreativeLayoutsPreviewV2: React.FC = () => {
  const [activeLayout, setActiveLayout] = useState(0);
  
  const ActiveComponent = layouts[activeLayout].component;
  
  return (
    <div className="space-y-4 p-4 bg-background min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-1">🎨 Layouts V2 - Mais Criativos!</h1>
        <p className="text-muted-foreground text-sm">6 novos estilos premium</p>
      </div>
      
      {/* Layout selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {layouts.map((layout, idx) => (
          <Button
            key={layout.name}
            variant={activeLayout === idx ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveLayout(idx)}
            className="flex-shrink-0"
          >
            <span className="mr-1">{layout.emoji}</span>
            {layout.name}
          </Button>
        ))}
      </div>
      
      {/* Layout preview with lazy loading */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLayout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Suspense fallback={<LayoutLoadingFallback />}>
            <ActiveComponent />
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default UltraCreativeLayoutsPreviewV2;
