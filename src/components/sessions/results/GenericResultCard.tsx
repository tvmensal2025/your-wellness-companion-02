import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { CheckCircle, Star, Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionResultData } from './SessionCompleteFactory';

interface GenericResultCardProps {
  data: SessionResultData;
  config: {
    emoji: string;
    color: string;
    gradient: string;
  };
}

export const GenericResultCard: React.FC<GenericResultCardProps> = ({ data, config }) => {
  const firstName = data.userName?.split(' ')[0] || 'Você';
  const responseCount = Object.keys(data.responses).length;

  // Calcular score baseado nas respostas
  const calculateScore = () => {
    let score = 70;
    const values = Object.values(data.responses);
    
    values.forEach(value => {
      const str = String(value).toLowerCase();
      if (str.includes('sim') || str.includes('yes') || str.includes('ótimo') || str.includes('excelente')) {
        score += 5;
      } else if (str.includes('não') || str.includes('no') || str.includes('ruim')) {
        score -= 3;
      }
    });

    return Math.max(0, Math.min(100, score));
  };

  const score = data.score || calculateScore();

  return (
    <Card className="border-0 shadow-xl bg-card overflow-hidden">
      {/* Header */}
      <div className={cn("p-5 text-white bg-gradient-to-r", config.gradient)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold line-clamp-1">{data.sessionTitle}</h2>
            <p className="text-white/80 text-sm">{firstName}, sessão concluída!</p>
          </div>
          <div className="text-4xl">{config.emoji}</div>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Score Central */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-6"
        >
          <div className="relative inline-block">
            <motion.div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(${config.color} ${score}%, #e5e7eb ${score}%)`
              }}
            >
              <div className="w-24 h-24 rounded-full bg-card flex flex-col items-center justify-center shadow-inner">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-bold"
                  style={{ color: config.color }}
                >
                  {score}%
                </motion.span>
                <span className="text-xs text-muted-foreground">Completo</span>
              </div>
            </motion.div>

            {/* Estrelas decorativas */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.6, type: 'spring' }}
              className="absolute -top-2 -right-2"
            >
              <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Estatísticas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <CheckCircle className="w-5 h-5 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold text-foreground">{responseCount}</div>
            <div className="text-xs text-muted-foreground">Respostas</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <Trophy className="w-5 h-5 mx-auto mb-1 text-amber-500" />
            <div className="text-lg font-bold text-foreground">+{data.totalPoints || responseCount * 10}</div>
            <div className="text-xs text-muted-foreground">Pontos</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-muted/50">
            <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-500" />
            <div className="text-lg font-bold text-foreground">100%</div>
            <div className="text-xs text-muted-foreground">Progresso</div>
          </div>
        </motion.div>

        {/* Resumo das Respostas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 rounded-xl bg-muted/30 border border-border"
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4" style={{ color: config.color }} />
            <span className="font-semibold text-sm text-foreground">Suas Respostas</span>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(data.responses).slice(0, 8).map(([key, value], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-start gap-2 p-2 rounded-lg bg-background/50"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ backgroundColor: config.color }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground truncate">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {String(value)}
                  </p>
                </div>
              </motion.div>
            ))}
            {Object.keys(data.responses).length > 8 && (
              <p className="text-xs text-center text-muted-foreground pt-2">
                +{Object.keys(data.responses).length - 8} respostas adicionais
              </p>
            )}
          </div>
        </motion.div>

        {/* Mensagem de Conclusão */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center p-4 rounded-xl"
          style={{ backgroundColor: `${config.color}10` }}
        >
          <p className="text-sm" style={{ color: config.color }}>
            🎉 Parabéns, {firstName}! Você completou esta sessão com sucesso.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Continue assim para alcançar seus objetivos!
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};
