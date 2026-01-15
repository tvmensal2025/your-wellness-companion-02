import { motion } from 'framer-motion';
import { Users, Target, Trophy, Flame, Scale, TrendingDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface RankingStatsProps {
  totalMembers: number;
  totalMissions: number;
  totalPoints: number;
  avgStreak: number;
  totalWeightLost?: number;
  // User info
  userName?: string;
  userAvatar?: string;
  userPosition?: number;
}

export function RankingStats({ 
  totalMembers, 
  totalMissions, 
  totalPoints, 
  avgStreak, 
  totalWeightLost = 0,
  userName,
  userAvatar,
  userPosition = 0,
}: RankingStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/80 via-primary/60 to-emerald-600/50 p-4 text-white shadow-xl"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative">
        {/* User Profile + Position */}
        {userName && (
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/20">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/30 shadow-lg">
                <AvatarImage src={userAvatar} />
                <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-base">{userName}</h3>
                <p className="text-xs text-white/70">Sua posição no ranking</p>
              </div>
            </div>
            
            {/* Position Badge */}
            <div className="text-center px-4 py-2 rounded-xl bg-yellow-500/30 border border-yellow-400/40">
              <Trophy className="w-5 h-5 mx-auto mb-0.5 text-yellow-300" />
              <span className="font-bold text-xl text-yellow-300">#{userPosition}</span>
            </div>
          </div>
        )}

        {/* Community Stats Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Impacto da Comunidade</h3>
            <p className="text-white/60 text-[10px]">Juntos somos mais fortes! 💪</p>
          </div>
        </div>
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Total Weight Lost */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <Scale className="w-5 h-5 mx-auto mb-1 text-white/90" />
            <p className="text-xl font-bold">{totalWeightLost.toFixed(1)}<span className="text-sm">kg</span></p>
            <p className="text-[9px] text-white/70 uppercase">Peso Eliminado</p>
          </div>
          
          {/* Total Members */}
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
            <Users className="w-5 h-5 mx-auto mb-1 text-white/90" />
            <p className="text-xl font-bold">{totalMembers}</p>
            <p className="text-[9px] text-white/70 uppercase">Engajados</p>
          </div>
        </div>

        {/* Secondary Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Target className="w-4 h-4 mx-auto mb-0.5 text-white/80" />
            <p className="text-sm font-bold">{totalMissions}</p>
            <p className="text-[8px] text-white/60">Missões</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Trophy className="w-4 h-4 mx-auto mb-0.5 text-white/80" />
            <p className="text-sm font-bold">{(totalPoints / 1000).toFixed(1)}k</p>
            <p className="text-[8px] text-white/60">Pontos</p>
          </div>
          
          <div className="bg-white/10 rounded-lg p-2 text-center">
            <Flame className="w-4 h-4 mx-auto mb-0.5 text-white/80" />
            <p className="text-sm font-bold">{avgStreak}</p>
            <p className="text-[8px] text-white/60">Média Streak</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
