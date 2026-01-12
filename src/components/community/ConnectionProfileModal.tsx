/**
 * ConnectionProfileModal - Modal completo de visualização de perfil em Conexões
 * 
 * Design moderno estilo app de conexões com todas as informações do usuário.
 */

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  MapPin, 
  MessageCircle, 
  User,
  Flame,
  Trophy,
  Target,
  Heart,
  Users,
  Dumbbell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface UserProfile {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  age?: number;
  city?: string;
  objective?: string;
  status?: string;
  bio?: string;
  interests?: string[];
  looking_for?: string[];
  total_points: number;
  streak_days: number;
  is_online?: boolean;
}

interface ConnectionProfileModalProps {
  profile: UserProfile | null;
  open: boolean;
  onClose: () => void;
  onMessageClick: (userId: string) => void;
  onViewFullProfile: (userId: string) => void;
}

// Configuração de interesses com emojis e cores
const INTERESTS_CONFIG: Record<string, { emoji: string; color: string }> = {
  'Musculação': { emoji: '💪', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  'Corrida': { emoji: '🏃', color: 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30' },
  'Alimentação': { emoji: '🥗', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  'Nutrição': { emoji: '🥗', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30' },
  'Yoga': { emoji: '🧘', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30' },
  'Natação': { emoji: '🏊', color: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  'Ciclismo': { emoji: '🚴', color: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  'Funcional': { emoji: '🏋️', color: 'bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30' },
  'Crossfit': { emoji: '💥', color: 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30' },
  'Dieta': { emoji: '🍎', color: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30' },
  'Caminhada': { emoji: '🚶', color: 'bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30' },
};

// Configuração de objetivos
const OBJECTIVES_CONFIG: Record<string, { emoji: string; color: string }> = {
  'Ganhar massa': { emoji: '💪', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  'Ganhar massa muscular': { emoji: '💪', color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400' },
  'Perder peso': { emoji: '⚖️', color: 'bg-green-500/20 text-green-600 dark:text-green-400' },
  'Condicionamento': { emoji: '🏃', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
  'Melhorar condicionamento': { emoji: '🏃', color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400' },
  'Definição': { emoji: '🎯', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  'Definição muscular': { emoji: '🎯', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  'Saúde': { emoji: '❤️', color: 'bg-red-500/20 text-red-600 dark:text-red-400' },
  'Bem-estar e saúde': { emoji: '🧘', color: 'bg-teal-500/20 text-teal-600 dark:text-teal-400' },
};

// Configuração de status
const STATUS_CONFIG: Record<string, { emoji: string; color: string }> = {
  'Solteiro(a)': { emoji: '💚', color: 'bg-green-500/20 text-green-600 dark:text-green-400' },
  'Namorando': { emoji: '❤️', color: 'bg-pink-500/20 text-pink-600 dark:text-pink-400' },
  'Casado(a)': { emoji: '💍', color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400' },
  'Não informar': { emoji: '🤐', color: 'bg-gray-500/20 text-gray-600 dark:text-gray-400' },
};

// Configuração de "buscando"
const LOOKING_FOR_CONFIG: Record<string, { emoji: string; color: string }> = {
  'Parceiro de treino': { emoji: '🏋️', color: 'text-blue-600 dark:text-blue-400' },
  'Amizade': { emoji: '🤝', color: 'text-green-600 dark:text-green-400' },
  'Relacionamento': { emoji: '💕', color: 'text-pink-600 dark:text-pink-400' },
};

export function ConnectionProfileModal({ 
  profile, 
  open, 
  onClose, 
  onMessageClick, 
  onViewFullProfile 
}: ConnectionProfileModalProps) {
  if (!profile) return null;

  const getInterestConfig = (interest: string) => {
    return INTERESTS_CONFIG[interest] || { emoji: '✨', color: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30' };
  };

  const getObjectiveConfig = (objective: string) => {
    return OBJECTIVES_CONFIG[objective] || { emoji: '🎯', color: 'bg-primary/20 text-primary' };
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || { emoji: '❓', color: 'bg-gray-500/20 text-gray-600' };
  };

  const getLookingForConfig = (item: string) => {
    return LOOKING_FOR_CONFIG[item] || { emoji: '🔍', color: 'text-muted-foreground' };
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden max-h-[95vh] overflow-y-auto bg-card rounded-3xl border-0 shadow-2xl">
        {/* Header com foto grande */}
        <div className="relative h-72 bg-gradient-to-br from-primary/30 to-accent/30">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.user_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl font-bold text-primary/40">
                {profile.user_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Close button */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Streak badge */}
          {profile.streak_days > 0 && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <Flame className="w-4 h-4" />
              {profile.streak_days} dias
            </div>
          )}

          {/* Info no bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold">{profile.user_name.split(' ')[0]}</h2>
              {profile.age && <span className="text-2xl font-light">{profile.age}</span>}
              {profile.is_online && (
                <span className="w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </div>
            {profile.city && (
              <div className="flex items-center gap-1.5 text-white/90 mt-2">
                <MapPin className="w-4 h-4" />
                <span className="text-base">{profile.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Interesses */}
          {profile.interests && profile.interests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Interesses
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => {
                  const config = getInterestConfig(interest);
                  return (
                    <motion.span
                      key={interest}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium border",
                        config.color
                      )}
                    >
                      {config.emoji} {interest}
                    </motion.span>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Objetivo */}
          {profile.objective && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                🎯 Objetivo
              </h3>
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-2xl border",
                getObjectiveConfig(profile.objective).color
              )}>
                <Target className="w-5 h-5" />
                <span className="font-medium">{profile.objective}</span>
              </div>
            </motion.div>
          )}

          {/* Idade e Status em grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3"
          >
            {/* Idade */}
            <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                🎂 Idade
              </h4>
              <p className="text-2xl font-bold">{profile.age || '—'}</p>
            </div>

            {/* Status */}
            <div className={cn(
              "p-4 rounded-2xl border",
              profile.status ? getStatusConfig(profile.status).color : "bg-muted/50"
            )}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                💑 Status
              </h4>
              <p className="text-lg font-semibold flex items-center gap-2">
                {profile.status ? (
                  <>
                    {getStatusConfig(profile.status).emoji}
                    <span className="truncate">{profile.status}</span>
                  </>
                ) : (
                  '—'
                )}
              </p>
            </div>
          </motion.div>

          {/* Stats - Pontos e Sequência */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                🏆 Pontos
              </h4>
              <p className="text-2xl font-bold text-primary">{profile.total_points.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                🔥 Sequência
              </h4>
              <p className="text-2xl font-bold text-orange-500">{profile.streak_days} dias</p>
            </div>
          </motion.div>

          {/* Bio / Sobre mim */}
          {profile.bio && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                📝 Sobre mim
              </h3>
              <div className="p-4 rounded-2xl bg-muted/50 border border-border/50">
                <p className="text-sm leading-relaxed text-foreground">
                  "{profile.bio}"
                </p>
              </div>
            </motion.div>
          )}

          {/* Buscando */}
          {profile.looking_for && profile.looking_for.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                🔍 Buscando
              </h3>
              <div className="space-y-2">
                {profile.looking_for.map((item, index) => {
                  const config = getLookingForConfig(item);
                  return (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30"
                    >
                      <div className={cn("w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center", config.color)}>
                        <span className="text-sm">{config.emoji}</span>
                      </div>
                      <span className="text-sm font-medium">{item}</span>
                      <div className="ml-auto w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-500 text-xs">✓</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Ações */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3 pt-3"
          >
            <Button 
              className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold text-base shadow-lg"
              onClick={() => {
                onMessageClick(profile.user_id);
                onClose();
              }}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Mensagem
            </Button>
            <Button 
              variant="outline"
              className="h-12 px-5 font-semibold"
              onClick={() => {
                onViewFullProfile(profile.user_id);
                onClose();
              }}
            >
              <User className="w-5 h-5 mr-2" />
              Perfil
            </Button>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectionProfileModal;
