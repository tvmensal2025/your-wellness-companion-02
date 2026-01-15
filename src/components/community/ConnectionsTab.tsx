/**
 * 💕 ConnectionsTab - Aba de Conexões Sociais (V2 - Melhorada)
 * 
 * Design inspirado em apps de conexão modernos.
 * Cards compactos, swipe-friendly, visual limpo.
 */

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  MapPin, 
  Heart, 
  MessageCircle, 
  Filter,
  X,
  ChevronDown,
  Flame,
  Target,
  Users,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRanking } from '@/hooks/useRanking';
import { useFollow } from '@/hooks/useFollow';
import { ConnectionProfileModal } from './ConnectionProfileModal';

interface ConnectionsTabProps {
  currentUserId: string | undefined;
  onProfileClick: (userId: string) => void;
  onMessageClick: (userId: string) => void;
}

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

// Dados mockados
const MOCK_PROFILES: Partial<UserProfile>[] = [
  { age: 28, city: 'São Paulo', objective: 'Ganhar massa', status: 'Solteiro(a)', bio: 'Apaixonado por treinos e vida saudável. Buscando pessoas para treinar junto! 💪', interests: ['Musculação', 'Corrida', 'Alimentação'], looking_for: ['Parceiro de treino', 'Amizade'] },
  { age: 25, city: 'Rio de Janeiro', objective: 'Perder peso', status: 'Solteiro(a)', bio: 'Nutricionista em formação, amo yoga e meditação 🥗🧘', interests: ['Nutrição', 'Yoga', 'Natação'], looking_for: ['Amizade', 'Relacionamento'] },
  { age: 32, city: 'Curitiba', objective: 'Condicionamento', status: 'Namorando', bio: 'Corredor amador, já fiz 3 maratonas! 🏃‍♂️', interests: ['Corrida', 'Ciclismo', 'Funcional'], looking_for: ['Parceiro de treino'] },
  { age: 27, city: 'Belo Horizonte', objective: 'Definição', status: 'Solteiro(a)', bio: 'Fitness lifestyle! Competidora bikini 👙💪', interests: ['Musculação', 'Dieta', 'Crossfit'], looking_for: ['Parceiro de treino', 'Relacionamento'] },
  { age: 30, city: 'Porto Alegre', objective: 'Saúde', status: 'Casado(a)', bio: 'Buscando qualidade de vida e bem-estar para a família 🏠❤️', interests: ['Funcional', 'Caminhada', 'Yoga'], looking_for: ['Amizade'] },
];

const OBJECTIVES = [
  { value: 'all', label: 'Todos' },
  { value: 'Ganhar massa', label: '💪 Massa' },
  { value: 'Perder peso', label: '⚖️ Emagrecer' },
  { value: 'Condicionamento', label: '🏃 Cardio' },
  { value: 'Definição', label: '🎯 Definir' },
];

export function ConnectionsTab({ currentUserId, onProfileClick, onMessageClick }: ConnectionsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterObjective, setFilterObjective] = useState('all');
  const [filterConnection, setFilterConnection] = useState<'all' | 'following' | 'discover'>('all');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showObjectiveMenu, setShowObjectiveMenu] = useState(false);

  const { ranking } = useRanking();
  const { isFollowing } = useFollow();

  // Combinar dados do ranking com perfis mockados
  const profiles = useMemo(() => {
    return ranking
      .filter(r => r.user_id !== currentUserId && r.total_points > 0)
      .slice(0, 20)
      .map((r, index) => {
        const mockData = MOCK_PROFILES[index % MOCK_PROFILES.length];
        return {
          ...r,
          ...mockData,
          is_online: Math.random() > 0.6,
        } as UserProfile;
      });
  }, [ranking, currentUserId]);

  // Filtrar perfis
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Filtro de busca
      if (searchTerm && !profile.user_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !profile.city?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Filtro de objetivo
      if (filterObjective !== 'all' && profile.objective !== filterObjective) {
        return false;
      }
      // Filtro de conexão (seguindo/descobrir)
      if (filterConnection === 'following' && !isFollowing(profile.user_id)) {
        return false;
      }
      if (filterConnection === 'discover' && isFollowing(profile.user_id)) {
        return false;
      }
      return true;
    });
  }, [profiles, searchTerm, filterObjective, filterConnection, isFollowing]);

  // Contadores para os filtros
  const followingCount = useMemo(() => {
    return profiles.filter(p => isFollowing(p.user_id)).length;
  }, [profiles, isFollowing]);

  const discoverCount = useMemo(() => {
    return profiles.filter(p => !isFollowing(p.user_id)).length;
  }, [profiles, isFollowing]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Solteiro(a)': return 'text-green-600 bg-green-50 dark:bg-green-950/50';
      case 'Namorando': return 'text-pink-600 bg-pink-50 dark:bg-pink-950/50';
      case 'Casado(a)': return 'text-purple-600 bg-purple-50 dark:bg-purple-950/50';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800';
    }
  };

  // Label do objetivo selecionado
  const selectedObjectiveLabel = OBJECTIVES.find(o => o.value === filterObjective)?.label || 'Objetivo';

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Search & Filter - Compacto */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Filtros em uma linha: Todos | Seguindo | Descobrir | [Objetivo ▼] */}
      <div className="flex items-center gap-2">
        {/* Segmented Control - Conexão */}
        <div className="flex bg-muted/40 rounded-lg p-0.5">
          <button
            onClick={() => setFilterConnection('all')}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
              filterConnection === 'all'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Todos
          </button>
          <button
            onClick={() => setFilterConnection('following')}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap",
              filterConnection === 'following'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Seguindo{followingCount > 0 && <span className="text-green-500 ml-0.5">({followingCount})</span>}
          </button>
          <button
            onClick={() => setFilterConnection('discover')}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap",
              filterConnection === 'discover'
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Descobrir{discoverCount > 0 && <span className="text-blue-500 ml-0.5">({discoverCount})</span>}
          </button>
        </div>

        {/* Dropdown de Objetivo */}
        <div className="relative">
          <button
            onClick={() => setShowObjectiveMenu(!showObjectiveMenu)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border",
              filterObjective !== 'all'
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-muted/40 text-muted-foreground border-transparent hover:bg-muted"
            )}
          >
            {filterObjective !== 'all' ? selectedObjectiveLabel : '🎯 Objetivo'}
            <ChevronDown className={cn("w-3 h-3 transition-transform", showObjectiveMenu && "rotate-180")} />
          </button>

          {/* Menu dropdown */}
          <AnimatePresence>
            {showObjectiveMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 mt-1 bg-background border rounded-lg shadow-lg z-50 min-w-[140px] py-1"
              >
                {OBJECTIVES.map(obj => (
                  <button
                    key={obj.value}
                    onClick={() => {
                      setFilterObjective(obj.value);
                      setShowObjectiveMenu(false);
                    }}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-xs hover:bg-muted transition-colors",
                      filterObjective === obj.value && "bg-primary/10 text-primary font-medium"
                    )}
                  >
                    {obj.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Limpar filtro de objetivo */}
        {filterObjective !== 'all' && (
          <button
            onClick={() => setFilterObjective('all')}
            className="p-1 rounded-full hover:bg-muted text-muted-foreground"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Results Count */}
      <p className="text-xs text-muted-foreground">
        {filteredProfiles.length} pessoas encontradas
      </p>

      {/* Profile Cards - Grid Compacto */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProfiles.map((profile, index) => (
          <motion.div
            key={profile.user_id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
          >
            <Card 
              className="overflow-hidden cursor-pointer hover:shadow-md transition-all border-0 shadow-sm bg-card"
              onClick={() => setSelectedProfile(profile)}
            >
              {/* Foto com overlay */}
              <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.user_name}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary/30">
                      {profile.user_name.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Online badge */}
                {profile.is_online && (
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" />
                )}

                {/* Streak badge */}
                {profile.streak_days > 0 && (
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Flame className="w-3 h-3" />
                    {profile.streak_days}
                  </div>
                )}
                
                {/* Info no bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5 text-white">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-sm truncate">{profile.user_name.split(' ')[0]}</span>
                    {profile.age && <span className="text-sm opacity-90">{profile.age}</span>}
                  </div>
                  {profile.city && (
                    <div className="flex items-center gap-1 text-[11px] text-white/80 mt-0.5">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{profile.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags compactas */}
              <div className="p-2 space-y-1.5">
                <div className="flex flex-wrap gap-1">
                  {profile.objective && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                      {profile.objective}
                    </span>
                  )}
                  {profile.status && (
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded", getStatusColor(profile.status))}>
                      {profile.status === 'Solteiro(a)' ? '💚' : profile.status === 'Namorando' ? '❤️' : '💍'}
                    </span>
                  )}
                </div>
                
                {/* Bio truncada */}
                {profile.bio && (
                  <p className="text-[11px] text-muted-foreground line-clamp-1">
                    {profile.bio}
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredProfiles.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Heart className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Nenhuma pessoa encontrada</p>
          <p className="text-sm text-muted-foreground/70">Tente ajustar os filtros</p>
        </div>
      )}

      {/* Profile Detail Modal - Novo componente completo */}
      <ConnectionProfileModal
        profile={selectedProfile}
        open={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onMessageClick={onMessageClick}
        onViewFullProfile={onProfileClick}
      />
    </div>
  );
}

export default ConnectionsTab;
