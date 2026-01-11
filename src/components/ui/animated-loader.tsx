import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Leaf } from 'lucide-react';

interface AnimatedLoaderProps {
  /** Texto a ser exibido */
  text?: string;
  /** Variante do loader */
  variant?: 'default' | 'minimal' | 'fullscreen' | 'inline';
  /** Tamanho */
  size?: 'sm' | 'md' | 'lg';
  /** Classe adicional */
  className?: string;
}

// Loader com folha animada (branding)
export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  text = 'Carregando...',
  variant = 'default',
  size = 'md',
  className
}) => {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-xs', container: 'p-3' },
    md: { icon: 'w-10 h-10', text: 'text-sm', container: 'p-4' },
    lg: { icon: 'w-14 h-14', text: 'text-base', container: 'p-6' }
  };

  const s = sizes[size];

  // Loader inline (dentro de botões, cards)
  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Leaf className={cn("text-primary", size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
        </motion.div>
        {text && <span className={cn("text-muted-foreground", s.text)}>{text}</span>}
      </div>
    );
  }

  // Loader minimal (só o ícone girando)
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center justify-center", s.container, className)}>
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity }
          }}
        >
          <Leaf className={cn("text-primary", s.icon)} />
        </motion.div>
      </div>
    );
  }

  // Loader fullscreen
  if (variant === 'fullscreen') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center",
          "bg-background/95 backdrop-blur-sm",
          className
        )}
      >
        <FullscreenLoaderContent text={text} />
      </motion.div>
    );
  }

  // Loader default (card centralizado)
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[200px]",
      className
    )}>
      <DefaultLoaderContent text={text} size={size} />
    </div>
  );
};

// Conteúdo do loader default
const DefaultLoaderContent: React.FC<{ text?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  text
}) => {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Círculos orbitando */}
      <div className="relative w-16 h-16">
        {/* Círculo externo */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>

        {/* Círculo interno */}
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-primary/30"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/70"
          />
        </motion.div>

        {/* Folha central */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Leaf className="w-6 h-6 text-primary" />
        </motion.div>
      </div>

      {/* Texto */}
      {text && (
        <motion.p
          className="text-sm text-muted-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
};

// Conteúdo do loader fullscreen
const FullscreenLoaderContent: React.FC<{ text?: string }> = ({ text }) => {
  const phrases = [
    { emoji: '🌱', text: 'Preparando tudo para você...' },
    { emoji: '✨', text: 'Quase lá...' },
    { emoji: '🚀', text: 'Carregando...' },
  ];

  const [phraseIndex, setPhraseIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex(prev => (prev + 1) % phrases.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Logo animado */}
      <div className="relative">
        {/* Glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        {/* Círculo principal */}
        <motion.div
          className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          {/* Partículas orbitando */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos(i * Math.PI / 2) * 40, 0],
                y: [0, Math.sin(i * Math.PI / 2) * 40, 0],
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />
          ))}
        </motion.div>

        {/* Folha central */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Leaf className="w-10 h-10 text-primary" />
        </motion.div>
      </div>

      {/* Texto animado */}
      <motion.div
        key={phraseIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex items-center gap-2"
      >
        <span className="text-2xl">{text ? '🌱' : phrases[phraseIndex].emoji}</span>
        <span className="text-muted-foreground">
          {text || phrases[phraseIndex].text}
        </span>
      </motion.div>

      {/* Barra de progresso infinita */}
      <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary via-emerald-400 to-primary rounded-full"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: '50%' }}
        />
      </div>
    </div>
  );
};

// Componente de loading para páginas
export const PageLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <AnimatedLoader variant="default" text={text} size="lg" />
  </div>
);

// Componente de loading para cards/seções
export const SectionLoader: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Carregando...', 
  className 
}) => (
  <div className={cn("flex items-center justify-center py-8", className)}>
    <AnimatedLoader variant="default" text={text} size="md" />
  </div>
);

// Componente de loading inline (para botões)
export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
  <AnimatedLoader variant="inline" text={text} size="sm" />
);

export default AnimatedLoader;
