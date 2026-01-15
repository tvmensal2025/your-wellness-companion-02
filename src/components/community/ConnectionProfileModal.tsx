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
      <DialogContent className="max-w-sm p-0 overflow-hidden max-h-[90vh] overflow-y-auto bg-card rounded-2xl border-0 shadow-2xl">
        {/* Header com foto - mais compacto */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/30 to-accent/30">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.user_name}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-6xl font-bold text-primary/40">
                {profile.user_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Streak badge */}
          {profile.streak_days > 0 && (
            <div className="absolute top-3 left-3 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3" />
              {profile.streak_days}d
            </div>
          )}

          {/* Info no bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{profile.user_name.split(' ')[0]}</h2>
              {profile.age && <span className="text-lg font-light">{profile.age}</span>}
              {profile.is_online && (
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
              )}
            </div>
            {profile.city && (
              <div className="flex items-center gap-1 text-white/80 text-xs mt-0.5">
                <MapPin className="w-3 h-3" />
                <span>{profile.city}</span>
              </div>
            )}
          </div>
        </div>

        {/* Content - mais compacto */}
        <div className="p-3 space-y-3">
          {/* Interesses */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Interesses
              </h3>
              <div className="flex flex-wrap gap-1">
                {profile.interests.map((interest) => {
                  const config = getInterestConfig(interest);
                  return (
                    <span
                      key={interest}
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-medium border",
                        config.color
                      )}
                    >
                      {config.emoji} {interest}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Objetivo + Status em linha */}
          <div className="grid grid-cols-2 gap-2">
            {/* Objetivo */}
            {profile.objective && (
              <div className={cn(
                "p-2 rounded-xl border",
                getObjectiveConfig(profile.objective).color
              )}>
                <h4 className="text-[9px] font-semibold text-muted-foreground uppercase mb-0.5">Objetivo</h4>
                <p className="text-xs font-medium truncate">{profile.objective}</p>
              </div>
            )}

            {/* Status */}
            <div className={cn(
              "p-2 rounded-xl border",
              profile.status ? getStatusConfig(profile.status).color : "bg-muted/50"
            )}>
              <h4 className="text-[9px] font-semibold text-muted-foreground uppercase mb-0.5">Status</h4>
              <p className="text-xs font-medium flex items-center gap-1">
                {profile.status ? (
                  <>
                    {getStatusConfig(profile.status).emoji}
                    <span className="truncate">{profile.status}</span>
                  </>
                ) : '—'}
              </p>
            </div>
          </div>

          {/* Stats - Pontos e Sequência */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
              <h4 className="text-[9px] font-semibold text-muted-foreground uppercase mb-0.5">🏆 Pontos</h4>
              <p className="text-lg font-bold text-primary">{profile.total_points.toLocaleString()}</p>
            </div>

            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <h4 className="text-[9px] font-semibold text-muted-foreground uppercase mb-0.5">🔥 Sequência</h4>
              <p className="text-lg font-bold text-orange-500">{profile.streak_days} dias</p>
            </div>
          </div>

          {/* Bio / Sobre mim */}
          {profile.bio && (
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Sobre mim
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-2">
                "{profile.bio}"
              </p>
            </div>
          )}

          {/* Buscando - inline */}
          {profile.looking_for && profile.looking_for.length > 0 && (
            <div>
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Buscando
              </h3>
              <div className="flex flex-wrap gap-1">
                {profile.looking_for.map((item) => {
                  const config = getLookingForConfig(item);
                  return (
                    <span
                      key={item}
                      className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/50 border"
                    >
                      {config.emoji} {item}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2 pt-1">
            <Button 
              className="flex-1 h-9 text-sm font-medium"
              onClick={() => {
                onMessageClick(profile.user_id);
                onClose();
              }}
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              Mensagem
            </Button>
            <Button 
              variant="outline"
              className="h-9 px-3 text-sm"
              onClick={() => {
                onViewFullProfile(profile.user_id);
                onClose();
              }}
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ConnectionProfileModal;
