/**
 * Scientific Article Modal Component
 * Modal elegante para exibir detalhes de artigos científicos
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ExternalLink, 
  Beaker, 
  Calendar, 
  BookOpen,
  CheckCircle,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScientificArticle } from '@/services/scientificEvidenceSelector';

interface ScientificArticleModalProps {
  article: ScientificArticle | null;
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
}

export const ScientificArticleModal: React.FC<ScientificArticleModalProps> = ({
  article,
  isOpen,
  onClose,
  productName,
}) => {
  if (!article) return null;

  const sourceLabels: Record<string, string> = {
    pubmed: 'PubMed - National Library of Medicine',
    scielo: 'SciELO - Scientific Electronic Library',
    other: 'Fonte Científica Verificada',
  };

  const handleOpenArticle = () => {
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:max-w-lg z-50"
          >
            <div className="bg-background rounded-2xl shadow-2xl overflow-hidden border border-border">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <Beaker className="w-7 h-7" />
                </div>

                {/* Title */}
                <h2 className="text-lg font-bold leading-tight mb-2">
                  Evidência Científica
                </h2>
                {productName && (
                  <p className="text-sm text-white/80">
                    Estudo relacionado a {productName}
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Verification Badge */}
                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-800">
                      Fonte Verificada
                    </p>
                    <p className="text-[10px] text-emerald-600">
                      {sourceLabels[article.source]}
                    </p>
                  </div>
                </div>

                {/* Article Title */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                    Título do Estudo
                  </p>
                  <h3 className="text-sm font-semibold text-foreground leading-snug">
                    {article.titlePt}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 italic">
                    {article.title}
                  </p>
                </div>

                {/* Summary */}
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
                    Resumo em Português
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">
                    {article.summaryPt}
                  </p>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {article.publishedYear}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {article.source.toUpperCase()}
                  </Badge>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {article.relatedIngredient.replace(/_/g, ' ')}
                  </Badge>
                </div>

                {/* Related Conditions */}
                {article.relatedConditions.length > 0 && (
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                      Condições Estudadas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {article.relatedConditions.map((condition, i) => (
                        <div 
                          key={i}
                          className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span className="capitalize">{condition.replace(/_/g, ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 bg-muted/30 border-t border-border flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button
                  onClick={handleOpenArticle}
                  className={cn(
                    "flex-1 bg-gradient-to-r from-blue-600 to-indigo-600",
                    "hover:from-blue-700 hover:to-indigo-700"
                  )}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver Artigo Original
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ScientificArticleModal;
