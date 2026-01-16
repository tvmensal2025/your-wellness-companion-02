// =====================================================
// PERSONALIZED SUPPLEMENTS CARD
// =====================================================

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pill, Sparkles, Info, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Supplement {
  name: string;
  dosage: string;
  timing: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface PersonalizedSupplementsCardProps {
  supplements?: Supplement[];
  isLoading?: boolean;
  className?: string;
}

const defaultSupplements: Supplement[] = [
  {
    name: 'Vitamina D3',
    dosage: '2000 UI',
    timing: 'Manhã, com café',
    reason: 'Otimização imunológica e energia',
    priority: 'high',
  },
  {
    name: 'Ômega 3',
    dosage: '1000mg',
    timing: 'Com almoço',
    reason: 'Saúde cardiovascular e cerebral',
    priority: 'high',
  },
  {
    name: 'Magnésio',
    dosage: '400mg',
    timing: 'Noite, antes de dormir',
    reason: 'Relaxamento e qualidade do sono',
    priority: 'medium',
  },
];

export const PersonalizedSupplementsCard: React.FC<PersonalizedSupplementsCardProps> = ({
  supplements = defaultSupplements,
  isLoading = false,
  className,
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Essencial';
      case 'medium':
        return 'Recomendado';
      case 'low':
        return 'Opcional';
      default:
        return priority;
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <Pill className="w-4 h-4 text-white" />
          </div>
          <span>Suplementação Personalizada</span>
          <Sparkles className="w-4 h-4 text-yellow-500 ml-auto" />
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {supplements.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              Complete sua anamnese para receber recomendações personalizadas
            </p>
          </div>
        ) : (
          supplements.map((supplement, index) => (
            <motion.div
              key={supplement.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-3 rounded-xl bg-muted/50 border border-border/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{supplement.name}</p>
                    <p className="text-xs text-muted-foreground">{supplement.dosage}</p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={cn("text-[10px]", getPriorityColor(supplement.priority))}
                >
                  {getPriorityLabel(supplement.priority)}
                </Badge>
              </div>
              
              <div className="pl-10 space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="text-foreground">⏰</span> {supplement.timing}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Info className="w-3 h-3" /> {supplement.reason}
                </p>
              </div>
            </motion.div>
          ))
        )}
        
        <p className="text-[10px] text-muted-foreground text-center pt-2">
          💡 Recomendações baseadas na sua anamnese e objetivos
        </p>
      </CardContent>
    </Card>
  );
};

export default PersonalizedSupplementsCard;
