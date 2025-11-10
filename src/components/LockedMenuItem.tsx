import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LockedMenuItemProps {
  children: React.ReactNode;
  feature: 'desafios' | 'comunidade' | 'sessoes' | 'assinatura' | 'courses';
  onClick?: () => void;
  className?: string;
}

// Componente simplificado: sem bloqueio nem rótulo "Em breve"

export const LockedMenuItem: React.FC<LockedMenuItemProps> = ({
  children,
  feature,
  onClick,
  className = ""
}) => {
  const { toast } = useToast();

  const featureNames = {
    desafios: 'Desafios Individuais',
    comunidade: 'Comunidade',
    sessoes: 'Sessões',
    assinatura: 'Assinaturas',
    courses: 'Plataforma dos Sonhos'
  };

  const handleClick = () => {
    // Permitir navegação normal - bloqueios removidos
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="ghost"
        className={`w-full justify-start ${className} relative`}
        onClick={handleClick}
      >
        {children}
      </Button>
    </motion.div>
  );
};

export default LockedMenuItem; 