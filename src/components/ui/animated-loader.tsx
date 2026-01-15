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

// Detecta se é dispositivo de baixa performance
const isLowEndDevice = () => {
  if (typeof navigator === 'undefined') return false;
  const memory = (navigator as any).deviceMemory;
  if (memory && memory < 4) return true;
  const connection = (navigator as any).connection;
  if (connection) {
    const slowTypes = ['slow-2g', '2g', '3g'];
    if (slowTypes.includes(connection.effectiveType)) return true;
    if (connection.saveData) return true;
  }
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) return true;
  return false;
};

// Loader CSS puro - funciona em qualquer dispositivo
const CSSLoader: React.FC<{ text?: string; size?: 'sm' | 'md' | 'lg' }> = ({ text, size = 'md' }) => {
  const sizes = {
    sm: { container: 'w-8 h-8', leaf: 'w-4 h-4' },
    md: { container: 'w-16 h-16', leaf: 'w-6 h-6' },
    lg: { container: 'w-20 h-20', leaf: 'w-8 h-8' }
  };
  const s = sizes[size];
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={cn("relative", s.container)}>
        {/* Círculo girando - CSS puro */}
        <div className={cn(
          "absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin",
          s.container
        )} />
        {/* Folha central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Leaf className={cn("text-primary animate-pulse", s.leaf)} />
        </div>
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Loader com folha animada (branding)
export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  text = 'Carregando...',
  variant = 'default',
  size = 'md',
  className
}) => {
  // Em dispositivos lentos, usar CSS puro
  const useCSSOnly = isLowEndDevice();
  
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
        <div className="animate-spin">
          <Leaf className={cn("text-primary", size === 'sm' ? 'w-4 h-4' : 'w-5 h-5')} />
        </div>
        {text && <span className={cn("text-muted-foreground", s.text)}>{text}</span>}
      </div>
    );
  }

  // Loader minimal (só o ícone girando)
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center justify-center", s.container, className)}>
        <div className="animate-spin">
          <Leaf className={cn("text-primary", s.icon)} />
        </div>
      </div>
    );
  }

  // Loader fullscreen - sempre usar CSS puro para garantir que aparece
  if (variant === 'fullscreen') {
    return (
      <div className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center",
        "bg-background/95 backdrop-blur-sm",
        className
      )}>
        {useCSSOnly ? (
          <CSSLoader text={text} size="lg" />
        ) : (
          <FullscreenLoaderContent text={text} />
        )}
      </div>
    );
  }

  // Loader default (card centralizado)
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[200px]",
      className
    )}>
      {useCSSOnly ? (
        <CSSLoader text={text} size={size} />
      ) : (
        <DefaultLoaderContent text={text} size={size} />
      )}
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

// Componente de loading para páginas - SEMPRE mostra algo
export const PageLoader: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <CSSLoader text={text || 'Carregando...'} size="lg" />
  </div>
);

// Componente de loading para cards/seções
export const SectionLoader: React.FC<{ text?: string; className?: string }> = ({ 
  text = 'Carregando...', 
  className 
}) => (
  <div className={cn("flex items-center justify-center py-8", className)}>
    <CSSLoader text={text} size="md" />
  </div>
);

// Componente de loading inline (para botões)
export const InlineLoader: React.FC<{ text?: string }> = ({ text }) => (
  <AnimatedLoader variant="inline" text={text} size="sm" />
);

export default AnimatedLoader;
