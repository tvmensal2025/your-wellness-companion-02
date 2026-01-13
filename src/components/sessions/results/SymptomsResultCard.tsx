import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Heart, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionResultData } from './SessionCompleteFactory';

interface SymptomsResultCardProps {
  data: SessionResultData;
  config: {
    emoji: string;
    color: string;
    gradient: string;
  };
}

// Sistemas do corpo
const bodySystems = [
  { id: 'digestive', name: 'Digestivo', icon: '🫃', color: '#22c55e' },
  { id: 'cardiovascular', name: 'Cardiovascular', icon: '❤️', color: '#ef4444' },
  { id: 'respiratory', name: 'Respiratório', icon: '🫁', color: '#3b82f6' },
  { id: 'nervous', name: 'Nervoso', icon: '🧠', color: '#8b5cf6' },
  { id: 'muscular', name: 'Muscular', icon: '💪', color: '#f97316' },
  { id: 'immune', name: 'Imunológico', icon: '🛡️', color: '#06b6d4' },
  { id: 'hormonal', name: 'Hormonal', icon: '⚡', color: '#eab308' },
  { id: 'skin', name: 'Pele', icon: '🧴', color: '#ec4899' }
];

// Extrair sintomas das respostas
const extractSymptoms = (responses: Record<string, any>): {
  frequent: Array<{ name: string; system: string; intensity: string }>;
  occasional: Array<{ name: string; system: string }>;
  healthy: string[];
} => {
  const result = {
    frequent: [] as Array<{ name: string; system: string; intensity: string }>,
    occasional: [] as Array<{ name: string; system: string }>,
    healthy: [] as string[]
  };

  Object.entries(responses).forEach(([key, value]) => {
    const valueStr = String(value).toLowerCase();
    const keyLower = key.toLowerCase();

    // Detectar frequência
    if (valueStr.includes('frequent') || valueStr.includes('sempre') || valueStr.includes('diário')) {
      // Detectar sistema
      let system = 'Geral';
      bodySystems.forEach(s => {
        if (keyLower.includes(s.id) || keyLower.includes(s.name.toLowerCase())) {
          system = s.name;
        }
      });

      // Detectar intensidade
      let intensity = 'Moderada';
      if (valueStr.includes('leve')) intensity = 'Leve';
      if (valueStr.includes('intens') || valueStr.includes('forte')) intensity = 'Intensa';

      result.frequent.push({
        name: key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()),
        system,
        intensity
      });
    } else if (valueStr.includes('ocasional') || valueStr.includes('às vezes')) {
      let system = 'Geral';
      bodySystems.forEach(s => {
        if (keyLower.includes(s.id) || keyLower.includes(s.name.toLowerCase())) {
          system = s.name;
        }
      });

      result.occasional.push({
        name: key.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()),
        system
      });
    } else if (valueStr.includes('não') || valueStr.includes('nunca') || valueStr === 'no') {
      // Sistema saudável
      bodySystems.forEach(s => {
        if (keyLower.includes(s.id) || keyLower.includes(s.name.toLowerCase())) {
          if (!result.healthy.includes(s.name)) {
            result.healthy.push(s.name);
          }
        }
      });
    }
  });

  return result;
};

export const SymptomsResultCard: React.FC<SymptomsResultCardProps> = ({ data, config }) => {
  const symptoms = extractSymptoms(data.responses);
  const firstName = data.userName?.split(' ')[0] || 'Você';

  // Calcular score de saúde
  const healthScore = Math.max(0, Math.min(100,
    100 - (symptoms.frequent.length * 15) - (symptoms.occasional.length * 5) + (symptoms.healthy.length * 10)
  ));

  return (
    <Card className="border-0 shadow-xl bg-card overflow-hidden">
      {/* Header */}
      <div className={cn("p-5 text-white bg-gradient-to-r", config.gradient)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Mapa de Sintomas</h2>
            <p className="text-white/80 text-sm">{firstName}, seu panorama de saúde</p>
          </div>
          <div className="text-4xl">{config.emoji}</div>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Score de Saúde */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center py-4"
        >
          <div className="relative inline-block">
            <motion.div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: `conic-gradient(${config.color} ${healthScore}%, #e5e7eb ${healthScore}%)`
              }}
              initial={{ rotate: -90 }}
              animate={{ rotate: -90 }}
            >
              <div className="w-20 h-20 rounded-full bg-card flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-2xl font-bold"
                  style={{ color: config.color }}
                >
                  {healthScore}%
                </motion.span>
                <span className="text-xs text-muted-foreground">Saúde</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Sintomas Frequentes */}
        {symptoms.frequent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="font-semibold text-red-700 dark:text-red-400 text-sm">
                Sintomas Frequentes
              </span>
            </div>
            <div className="space-y-2">
              {symptoms.frequent.slice(0, 4).map((symptom, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-black/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-red-500">🔴</span>
                    <span className="text-sm text-foreground">{symptom.name}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      symptom.intensity === 'Intensa' && "bg-red-100 text-red-700",
                      symptom.intensity === 'Moderada' && "bg-amber-100 text-amber-700",
                      symptom.intensity === 'Leve' && "bg-green-100 text-green-700"
                    )}
                  >
                    {symptom.intensity}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sintomas Ocasionais */}
        {symptoms.occasional.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-amber-700 dark:text-amber-400 text-sm">
                Sintomas Ocasionais
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {symptoms.occasional.slice(0, 6).map((symptom, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + i * 0.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300"
                  >
                    🟡 {symptom.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sistemas Saudáveis */}
        {symptoms.healthy.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-semibold text-green-700 dark:text-green-400 text-sm">
                Sistemas Saudáveis
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {symptoms.healthy.map((system, i) => {
                const sysData = bodySystems.find(s => s.name === system);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.05 }}
                  >
                    <Badge
                      variant="secondary"
                      className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                    >
                      {sysData?.icon || '✅'} {system}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Recomendação */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="p-4 rounded-xl bg-muted/50 text-center"
        >
          <p className="text-sm text-muted-foreground">
            {symptoms.frequent.length > 2
              ? '⚠️ Recomendamos consultar um profissional de saúde sobre os sintomas frequentes.'
              : symptoms.frequent.length > 0
              ? '💡 Monitore os sintomas e observe se há padrões ou gatilhos.'
              : '🌟 Ótimo! Continue cuidando da sua saúde assim!'}
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};
