import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Moon, Heart, Zap, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionResultData } from './SessionCompleteFactory';

interface DailyReflectionResultCardProps {
  data: SessionResultData;
  config: {
    emoji: string;
    color: string;
    gradient: string;
  };
}

// Extrair insights das respostas
const extractInsights = (responses: Record<string, any>): {
  mood: string;
  moodEmoji: string;
  energy: number;
  highlights: string[];
  gratitude: string[];
  challenges: string[];
} => {
  const result = {
    mood: 'Neutro',
    moodEmoji: '😐',
    energy: 50,
    highlights: [] as string[],
    gratitude: [] as string[],
    challenges: [] as string[]
  };

  Object.entries(responses).forEach(([key, value]) => {
    const keyLower = key.toLowerCase();
    const valueStr = String(value).toLowerCase();

    // Detectar humor
    if (keyLower.includes('humor') || keyLower.includes('mood') || keyLower.includes('sentindo')) {
      if (valueStr.includes('ótimo') || valueStr.includes('excelente') || valueStr.includes('feliz')) {
        result.mood = 'Ótimo';
        result.moodEmoji = '😄';
      } else if (valueStr.includes('bom') || valueStr.includes('bem')) {
        result.mood = 'Bom';
        result.moodEmoji = '🙂';
      } else if (valueStr.includes('neutro') || valueStr.includes('ok')) {
        result.mood = 'Neutro';
        result.moodEmoji = '😐';
      } else if (valueStr.includes('cansado') || valueStr.includes('baixo')) {
        result.mood = 'Baixo';
        result.moodEmoji = '😔';
      } else if (valueStr.includes('estressado') || valueStr.includes('ansioso')) {
        result.mood = 'Estressado';
        result.moodEmoji = '😰';
      }
    }

    // Detectar energia
    if (keyLower.includes('energia') || keyLower.includes('energy') || keyLower.includes('disposição')) {
      const num = parseInt(String(value));
      if (!isNaN(num)) {
        result.energy = num <= 10 ? num * 10 : num;
      }
    }

    // Detectar gratidão
    if (keyLower.includes('gratidão') || keyLower.includes('agradecer') || keyLower.includes('grateful')) {
      if (value && String(value).length > 3) {
        result.gratitude.push(String(value));
      }
    }

    // Detectar destaques
    if (keyLower.includes('destaque') || keyLower.includes('positivo') || keyLower.includes('conquista')) {
      if (value && String(value).length > 3) {
        result.highlights.push(String(value));
      }
    }

    // Detectar desafios
    if (keyLower.includes('desafio') || keyLower.includes('dificuldade') || keyLower.includes('challenge')) {
      if (value && String(value).length > 3) {
        result.challenges.push(String(value));
      }
    }
  });

  return result;
};

export const DailyReflectionResultCard: React.FC<DailyReflectionResultCardProps> = ({ data, config }) => {
  const insights = extractInsights(data.responses);
  const firstName = data.userName?.split(' ')[0] || 'Você';
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <Card className="border-0 shadow-xl bg-card overflow-hidden">
      {/* Header */}
      <div className={cn("p-5 text-white bg-gradient-to-r", config.gradient)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Reflexão do Dia</h2>
            <p className="text-white/80 text-sm capitalize">{today}</p>
          </div>
          <div className="text-4xl">{config.emoji}</div>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Humor e Energia */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          {/* Humor */}
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-4xl mb-2"
            >
              {insights.moodEmoji}
            </motion.div>
            <div className="text-sm font-medium text-foreground">{insights.mood}</div>
            <div className="text-xs text-muted-foreground">Humor</div>
          </div>

          {/* Energia */}
          <div className="text-center p-4 rounded-xl bg-muted/50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="relative w-16 h-16 mx-auto mb-2"
            >
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="none"
                  className="text-muted/30"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke={config.color}
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: '0 176' }}
                  animate={{ strokeDasharray: `${(insights.energy / 100) * 176} 176` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-6 h-6" style={{ color: config.color }} />
              </div>
            </motion.div>
            <div className="text-sm font-medium text-foreground">{insights.energy}%</div>
            <div className="text-xs text-muted-foreground">Energia</div>
          </div>
        </motion.div>

        {/* Gratidão */}
        {insights.gratitude.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-4 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200 dark:border-pink-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-pink-500" />
              <span className="font-semibold text-pink-700 dark:text-pink-400 text-sm">
                Gratidão
              </span>
            </div>
            <div className="space-y-2">
              {insights.gratitude.slice(0, 3).map((item, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-sm text-pink-800 dark:text-pink-200 flex items-start gap-2"
                >
                  <span>🙏</span>
                  <span className="line-clamp-2">{item}</span>
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Destaques */}
        {insights.highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
                Destaques do Dia
              </span>
            </div>
            <div className="space-y-2">
              {insights.highlights.slice(0, 3).map((item, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2"
                >
                  <span>⭐</span>
                  <span className="line-clamp-2">{item}</span>
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Desafios */}
        {insights.challenges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <Moon className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-blue-700 dark:text-blue-400 text-sm">
                Desafios a Superar
              </span>
            </div>
            <div className="space-y-2">
              {insights.challenges.slice(0, 2).map((item, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + i * 0.1 }}
                  className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2"
                >
                  <span>💪</span>
                  <span className="line-clamp-2">{item}</span>
                </motion.p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Resumo das Respostas */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-sm text-foreground">
              Reflexões Registradas
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(data.responses).slice(0, 6).map((key, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-xs bg-muted"
              >
                ✓ {key.replace(/_/g, ' ').substring(0, 20)}
              </Badge>
            ))}
            {Object.keys(data.responses).length > 6 && (
              <Badge variant="secondary" className="text-xs bg-muted">
                +{Object.keys(data.responses).length - 6} mais
              </Badge>
            )}
          </div>
        </motion.div>

        {/* Mensagem Motivacional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center p-4 rounded-xl bg-muted/50"
        >
          <p className="text-sm text-muted-foreground">
            {insights.mood === 'Ótimo' || insights.mood === 'Bom'
              ? `🌟 ${firstName}, que dia incrível! Continue assim!`
              : insights.mood === 'Estressado' || insights.mood === 'Baixo'
              ? `💚 ${firstName}, amanhã é um novo dia. Descanse bem!`
              : `✨ ${firstName}, cada reflexão te aproxima do seu melhor!`}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};
