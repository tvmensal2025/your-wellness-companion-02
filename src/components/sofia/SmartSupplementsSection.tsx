/**
 * Smart Supplements Section - STORIES CAROUSEL STYLE
 * Carrossel horizontal estilo Instagram Stories
 * Cache de 1 semana para dados do usuário
 */

import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Brain, 
  RefreshCw,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Target,
  Package,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Services
import { analyzeUserProfile, hasCompletedAnamnesis } from '@/services/userProfileAnalyzer';
import { sortByMatchScore, Supplement, MatchScoreResult } from '@/services/matchScoreCalculator';
import { generatePersonalizedArgument, PersonalizedArgument } from '@/services/personalizedArgumentGenerator';
import { selectBestArticle, ScientificArticle } from '@/services/scientificEvidenceSelector';

// Components
import { SmartSupplementCard } from './SmartSupplementCard';
import { ScientificArticleModal } from './ScientificArticleModal';

// Cache duration: 1 week in milliseconds
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface SmartRecommendation {
  product: Supplement;
  matchScore: MatchScoreResult;
  argument: PersonalizedArgument;
  article: ScientificArticle | null;
}

interface SmartSupplementsSectionProps {
  maxProducts?: number;
  showTitle?: boolean;
  className?: string;
}

export const SmartSupplementsSection: React.FC<SmartSupplementsSectionProps> = ({
  maxProducts = 6,
  showTitle = true,
  className,
}) => {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<ScientificArticle | null>(null);
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  // Queries com cache de 1 semana para dados do usuário
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
    staleTime: ONE_WEEK_MS, // Cache 1 semana
    gcTime: ONE_WEEK_MS,
  });

  const userId = user?.id;
  const enabled = !!userId;

  const { data: hasAnamnesis, isLoading: isCheckingAnamnesis } = useQuery({
    queryKey: ['has-anamnesis', userId],
    queryFn: () => hasCompletedAnamnesis(userId!),
    enabled,
    staleTime: ONE_WEEK_MS, // Cache 1 semana
    gcTime: ONE_WEEK_MS,
  });

  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user-health-profile', userId],
    queryFn: () => analyzeUserProfile(userId!),
    enabled: enabled && hasAnamnesis === true,
    staleTime: ONE_WEEK_MS, // Cache 1 semana - não precisa ler toda vez
    gcTime: ONE_WEEK_MS,
  });

  const { data: supplements, isLoading: isLoadingSupplements } = useQuery({
    queryKey: ['available-supplements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('is_approved', true);
      if (error) throw error;
      return data as Supplement[];
    },
    enabled: enabled && hasAnamnesis === true,
    staleTime: ONE_WEEK_MS, // Cache 1 semana
    gcTime: ONE_WEEK_MS,
  });

  const { data: recommendations, isLoading: isGenerating, refetch } = useQuery({
    queryKey: ['smart-recommendations', userId, userProfile?.userId],
    queryFn: async (): Promise<SmartRecommendation[]> => {
      if (!userProfile || !supplements || supplements.length === 0) return [];

      const validCategories = [
        'vitaminas', 'minerais', 'aminoacidos', 'proteinas', 'emagrecimento',
        'energia', 'cardiovascular', 'sono', 'digestao', 'imunidade', 'colageno',
        'beleza', 'performance', 'saude', 'suplemento', 'nutricional', 'terapeutico',
        'antioxidante', 'anti-inflamatorio', 'detox', 'metabolismo'
      ];
      const invalidCategories = ['perfumaria', 'perfume', 'fragrancia', 'cosmetico'];
      const invalidProducts = ['CAR_BLACK', 'GOLD_MONEY', 'MADAME_X', 'VIP_GLAMOUR_KIT'];

      const validSupplements = supplements.filter((sup) => {
        const category = (sup.category || '').toLowerCase();
        const externalId = (sup.external_id || '').toUpperCase();
        if (invalidProducts.includes(externalId)) return false;
        if (invalidCategories.some(inv => category.includes(inv))) return false;
        const hasValidCategory = validCategories.some(val => category.includes(val));
        const hasIngredients = sup.active_ingredients && sup.active_ingredients.length > 0;
        const hasBenefits = sup.benefits && sup.benefits.length > 0;
        return hasValidCategory && (hasIngredients || hasBenefits);
      });

      if (validSupplements.length === 0) return [];

      const scored = sortByMatchScore(validSupplements, userProfile);
      const topProducts = scored.slice(0, maxProducts);

      return topProducts.map(({ product, matchScore }) => ({
        product,
        matchScore,
        argument: generatePersonalizedArgument(product, userProfile, matchScore),
        article: selectBestArticle(product, userProfile),
      }));
    },
    enabled: enabled && !!userProfile && !!supplements && supplements.length > 0,
    staleTime: ONE_WEEK_MS, // Cache 1 semana
    gcTime: ONE_WEEK_MS,
  });

  // Scroll handlers
  const scrollToIndex = (index: number) => {
    if (!scrollRef.current || !recommendations) return;
    const cardWidth = 280 + 16; // card width + gap
    scrollRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth'
    });
    setActiveIndex(index);
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const cardWidth = 280 + 16;
    const newIndex = Math.round(scrollRef.current.scrollLeft / cardWidth);
    setActiveIndex(newIndex);
  };

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      return () => ref.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handlePurchase = (product: Supplement) => {
    toast({
      title: 'Redirecionando...',
      description: `Você será direcionado para comprar ${product.name}`,
    });
  };

  const handleArticleClick = (article: ScientificArticle | null, productName: string) => {
    if (article) {
      setSelectedArticle(article);
      setSelectedProductName(productName);
      setIsArticleModalOpen(true);
    }
  };

  const isLoading = isCheckingAnamnesis || isLoadingProfile || isLoadingSupplements || isGenerating;

  // Render: Sem anamnese
  if (!isLoading && hasAnamnesis === false) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6">
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Descubra seus Suplementos Ideais
            </h3>
            <p className="text-white/80 text-sm mb-4 max-w-sm mx-auto">
              Complete sua anamnese para recomendações personalizadas da Sofia.
            </p>
            <Button className="bg-white text-emerald-700 hover:bg-white/90 font-semibold">
              <ClipboardList className="w-4 h-4 mr-2" />
              Preencher Anamnese
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Render: Loading
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 mx-auto mb-3"
            />
            <p className="text-sm text-muted-foreground flex items-center gap-2 justify-center">
              <Brain className="w-4 h-4" />
              Analisando seu perfil...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render: Sem recomendações
  if (!recommendations || recommendations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={className}
      >
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 p-6">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 text-center">
            <motion.div 
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur flex items-center justify-center mx-auto mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Package className="w-8 h-8 text-emerald-400" />
            </motion.div>
            <h3 className="text-lg font-bold text-white mb-2">
              Em Breve: Suplementos Personalizados
            </h3>
            <p className="text-white/60 text-sm mb-4 max-w-sm mx-auto">
              Estamos preparando recomendações especiais baseadas no seu perfil de saúde.
            </p>
            <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>Novidades chegando</span>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Se tiver apenas 1-2 produtos, usar layout diferente (cards maiores)
  const isFewProducts = recommendations.length <= 2;

  // Render: Stories Carousel (ou layout especial para poucos produtos)
  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <div>
              <h2 className="text-base font-bold text-foreground">Para Você</h2>
              <p className="text-xs text-muted-foreground">
                {userProfile?.primaryGoal === 'lose_weight' ? 'Foco: Emagrecimento' : 
                 userProfile?.primaryGoal === 'gain_mass' ? 'Foco: Massa Muscular' :
                 'Baseado no seu perfil'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => refetch()}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Layout adaptativo baseado na quantidade de produtos */}
      {isFewProducts ? (
        // Layout para 1-2 produtos: Cards centralizados e maiores (full width)
        <div className="flex flex-col items-center gap-6 py-4">
          {recommendations.map((rec, index) => (
            <motion.div
              key={rec.product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="w-full"
            >
              <SmartSupplementCard
                product={rec.product}
                matchScore={rec.matchScore}
                personalizedArgument={rec.argument}
                scientificArticle={rec.article}
                rank={index + 1}
                isActive={true}
                onPurchase={() => handlePurchase(rec.product)}
                onArticleClick={() => handleArticleClick(rec.article, rec.product.name)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        // Layout carousel para 3+ produtos
        <>
          <div className="relative">
            {/* Navigation Arrows */}
            {activeIndex > 0 && (
              <button
                onClick={() => scrollToIndex(activeIndex - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur shadow-lg flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {activeIndex < recommendations.length - 1 && (
              <button
                onClick={() => scrollToIndex(activeIndex + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur shadow-lg flex items-center justify-center hover:bg-background transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Scrollable Container */}
            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-4 -mx-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Spacer for centering first card */}
              <div className="flex-shrink-0 w-[calc(50vw-156px)] md:w-8" />
              
              {recommendations.map((rec, index) => (
                <SmartSupplementCard
                  key={rec.product.id}
                  product={rec.product}
                  matchScore={rec.matchScore}
                  personalizedArgument={rec.argument}
                  scientificArticle={rec.article}
                  rank={index + 1}
                  isActive={index === activeIndex}
                  onPurchase={() => handlePurchase(rec.product)}
                  onArticleClick={() => handleArticleClick(rec.article, rec.product.name)}
                />
              ))}
              
              {/* Spacer for centering last card */}
              <div className="flex-shrink-0 w-[calc(50vw-156px)] md:w-8" />
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2">
            {recommendations.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={cn(
                  "transition-all duration-300",
                  index === activeIndex 
                    ? "w-6 h-2 rounded-full bg-emerald-500" 
                    : "w-2 h-2 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          {/* Quick Info */}
          <AnimatePresence mode="wait">
            {recommendations[activeIndex] && (
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center px-4"
              >
                <p className="text-xs text-muted-foreground">
                  <Target className="w-3 h-3 inline mr-1" />
                  {recommendations[activeIndex].matchScore.totalScore}% compatível com seu perfil
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Ver Todos */}
      <div className="flex justify-center">
        <Button variant="ghost" className="text-muted-foreground text-sm">
          Ver catálogo completo
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      {/* Article Modal */}
      <ScientificArticleModal
        article={selectedArticle}
        isOpen={isArticleModalOpen}
        onClose={() => setIsArticleModalOpen(false)}
        productName={selectedProductName}
      />
    </div>
  );
};

export default SmartSupplementsSection;
