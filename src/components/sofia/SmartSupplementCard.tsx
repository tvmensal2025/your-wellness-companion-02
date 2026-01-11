/**
 * Smart Supplement Card - STORIES STYLE V2
 * Produto em destaque com visual vibrante
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  ExternalLink, 
  Beaker,
  Sparkles,
  Star,
  Flame,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MatchScoreResult, Supplement } from '@/services/matchScoreCalculator';
import { PersonalizedArgument } from '@/services/personalizedArgumentGenerator';
import { ScientificArticle } from '@/services/scientificEvidenceSelector';

// Imagens dos produtos
import dtoxImg from '@/assets/products/dtox.jpeg';
import moroComplexImg from '@/assets/products/moro-complex.jpeg';
import vitalGreenImg from '@/assets/products/vital-green.jpeg';
import creatinaImg from '@/assets/products/creatina.jpeg';
import amargoImg from '@/assets/products/amargo.jpeg';
import cromoMaxImg from '@/assets/products/cromo-max.jpeg';

const productImages: Record<string, string> = {
  'D-TOX 1000mg': dtoxImg,
  'Moro Complex 500mg': moroComplexImg,
  'Vital Green Spirulina': vitalGreenImg,
  'Creatina com Coenzima Q10': creatinaImg,
  'Amargo 500ml': amargoImg,
  'Cromo Max': cromoMaxImg,
};

interface SmartSupplementCardProps {
  product: Supplement;
  matchScore: MatchScoreResult;
  personalizedArgument: PersonalizedArgument;
  scientificArticle: ScientificArticle | null;
  onPurchase?: () => void;
  onArticleClick?: () => void;
  onView?: () => void;
  rank?: number;
  isActive?: boolean;
}

export const SmartSupplementCard: React.FC<SmartSupplementCardProps> = ({
  product,
  matchScore,
  personalizedArgument,
  scientificArticle,
  onPurchase,
  onArticleClick,
  onView,
  rank,
  isActive = false,
}) => {
  React.useEffect(() => {
    if (isActive) onView?.();
  }, [isActive]);

  const productImage = productImages[product.name] || product.image_url;
  const hasDiscount = product.discount_price && product.original_price && 
    product.discount_price < product.original_price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - product.discount_price! / product.original_price!) * 100)
    : 0;

  const isIdeal = matchScore.badge === 'ideal';
  const isRecommended = matchScore.badge === 'recommended';

  // Cores vibrantes baseadas no match
  const getAccentColor = () => {
    if (isIdeal) return { bg: 'bg-emerald-500', text: 'text-emerald-500', glow: 'shadow-emerald-500/50' };
    if (isRecommended) return { bg: 'bg-blue-500', text: 'text-blue-500', glow: 'shadow-blue-500/50' };
    return { bg: 'bg-violet-500', text: 'text-violet-500', glow: 'shadow-violet-500/50' };
  };

  const colors = getAccentColor();

  return (
    <motion.div 
      className={cn(
        "relative w-[300px] h-[480px] flex-shrink-0 rounded-[32px] overflow-hidden",
        "snap-center",
        "transition-all duration-500",
        isActive ? "scale-100" : "scale-[0.95] opacity-80"
      )}
      whileHover={{ scale: isActive ? 1.02 : 0.97 }}
    >
      {/* Background com gradiente vibrante */}
      <div className={cn(
        "absolute inset-0",
        "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900"
      )}>
        {/* Círculos decorativos de cor */}
        <div className={cn(
          "absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl opacity-30",
          isIdeal && "bg-emerald-500",
          isRecommended && "bg-blue-500",
          !isIdeal && !isRecommended && "bg-violet-500"
        )} />
        <div className={cn(
          "absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-3xl opacity-20",
          isIdeal && "bg-teal-500",
          isRecommended && "bg-indigo-500",
          !isIdeal && !isRecommended && "bg-pink-500"
        )} />
      </div>

      {/* Conteúdo */}
      <div className="relative h-full flex flex-col p-5">
        
        {/* Header: Ranking + Match */}
        <div className="flex items-center justify-between mb-2">
          {/* Ranking com ícone */}
          {rank === 1 ? (
            <motion.div
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
            >
              <Flame className="w-4 h-4 text-white" />
              <span className="text-xs font-bold text-white">TOP 1</span>
            </motion.div>
          ) : rank && rank <= 4 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur">
              <Star className="w-3.5 h-3.5 text-white/70" />
              <span className="text-xs font-semibold text-white/70">#{rank}</span>
            </div>
          ) : null}

          {/* Match Score animado */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-full",
              colors.bg
            )}
          >
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-bold text-white">{matchScore.totalScore}%</span>
            
            {/* Pulse effect */}
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn("absolute inset-0 rounded-full", colors.bg)}
            />
          </motion.div>
        </div>

        {/* PRODUTO EM DESTAQUE - Grande e vibrante */}
        <div className="flex-1 flex items-center justify-center py-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            {/* Glow atrás do produto */}
            <div className={cn(
              "absolute inset-0 blur-2xl opacity-60 scale-90",
              isIdeal && "bg-emerald-500",
              isRecommended && "bg-blue-500",
              !isIdeal && !isRecommended && "bg-violet-500"
            )} />
            
            {/* Imagem do produto */}
            <motion.div
              animate={isActive ? { 
                y: [0, -8, 0],
                rotateY: [0, 5, 0, -5, 0]
              } : {}}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {productImage ? (
                <img 
                  src={productImage} 
                  alt={product.name}
                  className={cn(
                    "w-44 h-44 object-contain drop-shadow-2xl",
                    `drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]`
                  )}
                />
              ) : (
                <div className={cn(
                  "w-44 h-44 rounded-3xl flex items-center justify-center",
                  "bg-gradient-to-br from-white/20 to-white/5"
                )}>
                  <Zap className="w-16 h-16 text-white/50" />
                </div>
              )}
            </motion.div>

            {/* Badge de desconto flutuante */}
            {hasDiscount && (
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="absolute -top-2 -right-2 px-3 py-1.5 rounded-full bg-red-500 shadow-lg shadow-red-500/50"
              >
                <span className="text-sm font-black text-white">-{discountPercent}%</span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Info do produto */}
        <div className="space-y-3">
          {/* Categoria */}
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "text-[10px] uppercase tracking-widest font-medium",
              "bg-white/10 text-white/70 border-0"
            )}>
              {product.category}
            </Badge>
            <Badge className={cn(
              "text-[10px] font-semibold border-0",
              isIdeal && "bg-emerald-500/20 text-emerald-300",
              isRecommended && "bg-blue-500/20 text-blue-300",
              !isIdeal && !isRecommended && "bg-violet-500/20 text-violet-300"
            )}>
              {matchScore.badgeLabel}
            </Badge>
          </div>

          {/* Nome do produto */}
          <h3 className="text-xl font-bold text-white leading-tight">
            {product.name}
          </h3>

          {/* Argumento personalizado */}
          <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
            {personalizedArgument.mainText}
          </p>

          {/* Link científico */}
          {scientificArticle && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArticleClick?.();
                window.open(scientificArticle.url, '_blank');
              }}
              className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors"
            >
              <Beaker className="w-3.5 h-3.5" />
              <span className="text-xs">Comprovado cientificamente</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}

          {/* Preço e CTA */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {hasDiscount && (
                <span className="text-sm text-white/30 line-through block">
                  R$ {product.original_price?.toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-black text-white">
                R$ {(product.discount_price || product.original_price || 0).toFixed(2)}
              </span>
            </div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={(e) => {
                  e.stopPropagation();
                  onPurchase?.();
                }}
                className={cn(
                  "rounded-full px-6 py-5 font-bold shadow-xl",
                  isIdeal && "bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/30",
                  isRecommended && "bg-blue-500 hover:bg-blue-400 shadow-blue-500/30",
                  !isIdeal && !isRecommended && "bg-violet-500 hover:bg-violet-400 shadow-violet-500/30"
                )}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Comprar
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SmartSupplementCard;
