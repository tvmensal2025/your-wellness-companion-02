import React from 'react';

interface DrVitalLifeWheelCardProps {
  userName: string;
  analysis: string;
  recommendation: string;
  totalPoints: number;
  streakDays: number;
  sessionTitle?: string;
}

export const DrVitalLifeWheelCard: React.FC<DrVitalLifeWheelCardProps> = ({
  userName,
  analysis,
  recommendation,
  totalPoints,
  streakDays,
  sessionTitle = "Roda da Vida"
}) => {
  const firstName = userName?.split(' ')[0] || 'Amigo(a)';
  
  return (
    <div 
      className="w-[420px] min-h-[580px] p-6 rounded-3xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0c1445 0%, #1e3a5f 40%, #0d4b6e 70%, #0c1445 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/15 to-transparent rounded-full blur-2xl" />
      
      {/* Header - Dr. Vital Branding */}
      <div className="relative flex items-center gap-4 mb-5 pb-4 border-b border-cyan-500/20">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/30">
          🩺
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dr. Vital</h1>
          <p className="text-xs text-cyan-400/90 font-medium tracking-wide">Instituto dos Sonhos</p>
        </div>
        <div className="text-3xl">🎯</div>
      </div>

      {/* Session Title */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/30">
          <span className="text-sm">🎡</span>
          <span className="text-xs font-semibold text-cyan-300">{sessionTitle}</span>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-5">
        <p className="text-xl text-white">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{firstName}</span>, sua Roda da Vida! 🌟
        </p>
        <p className="text-sm text-gray-400 mt-1">Análise dos 12 pilares da sua vida</p>
      </div>

      {/* Analysis Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <span className="text-base">🔮</span>
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Análise de Equilíbrio
          </h2>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-cyan-500/20">
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
            {analysis}
          </p>
        </div>
      </div>

      {/* Recommendation Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-base">🚀</span>
          </div>
          <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
            Foco Principal
          </h2>
        </div>
        <div className="bg-gradient-to-r from-indigo-500/15 to-purple-500/10 rounded-2xl p-4 border border-indigo-500/30">
          <p className="text-sm text-indigo-100 leading-relaxed font-medium">
            {recommendation}
          </p>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="relative mt-auto pt-4 border-t border-cyan-500/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg">
                <span className="text-xl">⭐</span>
              </div>
              <div>
                <div className="text-xl font-bold text-white">+{totalPoints}</div>
                <div className="text-xs text-gray-400">pontos</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-xl">🎯</span>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-400">12</div>
                <div className="text-xs text-gray-400">pilares</div>
              </div>
            </div>
          </div>
          <div className="text-4xl">🌈</div>
        </div>
        <p className="text-center text-xs text-cyan-400/70 mt-4 font-medium">
          Busque o equilíbrio em todas as áreas! ✨
        </p>
      </div>
    </div>
  );
};
