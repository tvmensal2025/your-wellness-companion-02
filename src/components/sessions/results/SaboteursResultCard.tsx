import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Brain, Shield, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SessionResultData } from './SessionCompleteFactory';

interface SaboteursResultCardProps {
  data: SessionResultData;
  config: {
    emoji: string;
    color: string;
    gradient: string;
  };
}

// Sabotadores conhecidos
const saboteurTypes = [
  {
    id: 'judge',
    name: 'Crítico',
    emoji: '👨‍⚖️',
    color: '#ef4444',
    description: 'Julga a si mesmo e aos outros constantemente',
    strategy: 'Pratique autocompaixão e observe sem julgar'
  },
  {
    id: 'controller',
    name: 'Controlador',
    emoji: '🎮',
    color: '#f97316',
    description: 'Precisa controlar tudo e todos ao redor',
    strategy: 'Solte o controle em pequenas situações diárias'
  },
  {
    id: 'stickler',
    name: 'Perfeccionista',
    emoji: '📏',
    color: '#eab308',
    description: 'Busca perfeição em tudo, nunca está satisfeito',
    strategy: 'Aceite o "bom o suficiente" em tarefas menores'
  },
  {
    id: 'hyper_achiever',
    name: 'Hiper-realizador',
    emoji: '🏆',
    color: '#22c55e',
    description: 'Valor próprio depende de conquistas externas',
    strategy: 'Valorize quem você é, não só o que faz'
  },
  {
    id: 'pleaser',
    name: 'Prestativo',
    emoji: '🤗',
    color: '#ec4899',
    description: 'Busca aceitação agradando os outros',
    strategy: 'Diga "não" para algo pequeno hoje'
  },
  {
    id: 'victim',
    name: 'Vítima',
    emoji: '😢',
    color: '#8b5cf6',
    description: 'Foca em sentimentos negativos para atenção',
    strategy: 'Liste 3 coisas boas que aconteceram hoje'
  },
  {
    id: 'hyper_vigilant',
    name: 'Hipervigilante',
    emoji: '👀',
    color: '#06b6d4',
    description: 'Sempre alerta para perigos e ameaças',
    strategy: 'Pratique 5 minutos de respiração consciente'
  },
  {
    id: 'restless',
    name: 'Inquieto',
    emoji: '🏃',
    color: '#3b82f6',
    description: 'Sempre buscando a próxima coisa, nunca presente',
    strategy: 'Foque em uma tarefa por vez, sem multitasking'
  },
  {
    id: 'avoider',
    name: 'Evitador',
    emoji: '🙈',
    color: '#64748b',
    description: 'Evita conflitos e tarefas difíceis',
    strategy: 'Enfrente uma pequena tarefa adiada hoje'
  },
  {
    id: 'hyper_rational',
    name: 'Hiper-racional',
    emoji: '🧮',
    color: '#14b8a6',
    description: 'Analisa demais, ignora emoções',
    strategy: 'Pergunte "como me sinto?" antes de decidir'
  }
];

// Extrair sabotadores das respostas
const extractSaboteurs = (responses: Record<string, any>): Array<{
  saboteur: typeof saboteurTypes[0];
  intensity: number;
}> => {
  const detected: Array<{ saboteur: typeof saboteurTypes[0]; intensity: number }> = [];

  Object.entries(responses).forEach(([key, value]) => {
    const keyLower = key.toLowerCase();
    const valueStr = String(value).toLowerCase();

    // Tentar extrair intensidade
    let intensity = 50;
    const numMatch = String(value).match(/(\d+)/);
    if (numMatch) {
      intensity = parseInt(numMatch[1]);
      if (intensity <= 10) intensity *= 10;
    }

    // Mapear para sabotadores
    saboteurTypes.forEach(sab => {
      if (
        keyLower.includes(sab.id) ||
        keyLower.includes(sab.name.toLowerCase()) ||
        valueStr.includes(sab.name.toLowerCase())
      ) {
        detected.push({ saboteur: sab, intensity });
      }
    });

    // Detecção por palavras-chave
    if (valueStr.includes('critic') || valueStr.includes('julg')) {
      detected.push({ saboteur: saboteurTypes[0], intensity });
    }
    if (valueStr.includes('control')) {
      detected.push({ saboteur: saboteurTypes[1], intensity });
    }
    if (valueStr.includes('perfect')) {
      detected.push({ saboteur: saboteurTypes[2], intensity });
    }
  });

  // Remover duplicatas e ordenar por intensidade
  const unique = detected.reduce((acc, curr) => {
    const existing = acc.find(a => a.saboteur.id === curr.saboteur.id);
    if (!existing || existing.intensity < curr.intensity) {
      return [...acc.filter(a => a.saboteur.id !== curr.saboteur.id), curr];
    }
    return acc;
  }, [] as typeof detected);

  return unique.sort((a, b) => b.intensity - a.intensity);
};

export const SaboteursResultCard: React.FC<SaboteursResultCardProps> = ({ data, config }) => {
  const saboteurs = extractSaboteurs(data.responses);
  const firstName = data.userName?.split(' ')[0] || 'Você';

  // Se não detectou nenhum, usar exemplo
  const displaySaboteurs = saboteurs.length > 0 ? saboteurs : [
    { saboteur: saboteurTypes[0], intensity: 70 },
    { saboteur: saboteurTypes[1], intensity: 55 },
    { saboteur: saboteurTypes[7], intensity: 40 }
  ];

  const mainSaboteur = displaySaboteurs[0];
  const otherSaboteurs = displaySaboteurs.slice(1, 3);

  return (
    <Card className="border-0 shadow-xl bg-card overflow-hidden">
      {/* Header */}
      <div className={cn("p-5 text-white bg-gradient-to-r", config.gradient)}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Seus Sabotadores</h2>
            <p className="text-white/80 text-sm">{firstName}, conheça sua mente</p>
          </div>
          <div className="text-4xl">{config.emoji}</div>
        </div>
      </div>

      <CardContent className="p-5 space-y-5">
        {/* Sabotador Principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-5 rounded-2xl border-2"
          style={{
            borderColor: mainSaboteur.saboteur.color,
            background: `linear-gradient(135deg, ${mainSaboteur.saboteur.color}10, ${mainSaboteur.saboteur.color}05)`
          }}
        >
          <div className="flex items-start gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-5xl"
            >
              {mainSaboteur.saboteur.emoji}
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-lg text-foreground">
                  {mainSaboteur.saboteur.name}
                </h3>
                <Badge
                  className="text-xs"
                  style={{
                    backgroundColor: `${mainSaboteur.saboteur.color}20`,
                    color: mainSaboteur.saboteur.color
                  }}
                >
                  Principal
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {mainSaboteur.saboteur.description}
              </p>

              {/* Barra de intensidade */}
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Intensidade</span>
                  <span className="font-bold" style={{ color: mainSaboteur.saboteur.color }}>
                    {mainSaboteur.intensity}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: mainSaboteur.saboteur.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${mainSaboteur.intensity}%` }}
                    transition={{ duration: 1, delay: 0.4 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Outros Sabotadores */}
        {otherSaboteurs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-sm text-foreground">Outros Identificados</span>
            </div>
            <div className="space-y-2">
              {otherSaboteurs.map((item, i) => (
                <motion.div
                  key={item.saboteur.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50"
                >
                  <span className="text-2xl">{item.saboteur.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm text-foreground">
                        {item.saboteur.name}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: item.saboteur.color }}
                      >
                        {item.intensity}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.saboteur.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${item.intensity}%` }}
                        transition={{ duration: 0.8, delay: 0.7 + i * 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Estratégia de Superação */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="font-semibold text-green-700 dark:text-green-400 text-sm">
              Estratégia de Superação
            </span>
          </div>
          <p className="text-sm text-green-800 dark:text-green-300">
            💡 {mainSaboteur.saboteur.strategy}
          </p>
        </motion.div>

        {/* Mensagem Motivacional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center p-4 rounded-xl bg-muted/50"
        >
          <p className="text-sm text-muted-foreground">
            🧠 Conhecer seus sabotadores é o primeiro passo para superá-los.
            <br />
            <span className="font-medium text-foreground">Você é mais forte que eles!</span>
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};
