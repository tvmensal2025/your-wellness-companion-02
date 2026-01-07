import React from 'react';

interface DrVitalSaboteursCardProps {
  userName: string;
  analysis: string;
  recommendation: string;
  totalPoints: number;
  streakDays: number;
  sessionTitle?: string;
}

export const DrVitalSaboteursCard: React.FC<DrVitalSaboteursCardProps> = ({
  userName,
  analysis,
  recommendation,
  totalPoints,
  streakDays,
  sessionTitle = "Sabotadores Mentais"
}) => {
  const firstName = userName?.split(' ')[0] || 'Amigo(a)';
  
  return (
    <div 
      className="w-[420px] min-h-[580px] p-6 rounded-3xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #2d1b4e 0%, #4a1d6e 40%, #6b2d5b 70%, #2d1b4e 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/15 to-transparent rounded-full blur-2xl" />
      
      {/* Header - Dr. Vital Branding */}
      <div className="relative flex items-center gap-4 mb-5 pb-4 border-b border-orange-500/20">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 via-red-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-orange-500/30">
          🩺
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dr. Vital</h1>
          <p className="text-xs text-orange-400/90 font-medium tracking-wide">Instituto dos Sonhos</p>
        </div>
        <div className="text-3xl">🧠</div>
      </div>

      {/* Session Title */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30">
          <span className="text-sm">⚡</span>
          <span className="text-xs font-semibold text-orange-300">{sessionTitle}</span>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-5">
        <p className="text-xl text-white">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">{firstName}</span>, conheça sua mente! 🔍
        </p>
        <p className="text-sm text-gray-400 mt-1">Análise dos seus padrões mentais</p>
      </div>

      {/* Analysis Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <span className="text-base">🎭</span>
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Sabotadores Identificados
          </h2>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-orange-500/20">
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
            {analysis}
          </p>
        </div>
      </div>

      {/* Recommendation Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <span className="text-base">🛡️</span>
          </div>
          <h2 className="text-sm font-bold text-green-400 uppercase tracking-wider">
            Estratégia de Superação
          </h2>
        </div>
        <div className="bg-gradient-to-r from-green-500/15 to-emerald-500/10 rounded-2xl p-4 border border-green-500/30">
          <p className="text-sm text-green-100 leading-relaxed font-medium">
            {recommendation}
          </p>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="relative mt-auto pt-4 border-t border-orange-500/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-xl">🏆</span>
              </div>
              <div>
                <div className="text-xl font-bold text-white">+{totalPoints}</div>
                <div className="text-xs text-gray-400">pontos</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-xl">🧠</span>
              </div>
              <div>
                <div className="text-xl font-bold text-purple-400">{streakDays}</div>
                <div className="text-xs text-gray-400">insights</div>
              </div>
            </div>
          </div>
          <div className="text-4xl">💪</div>
        </div>
        <p className="text-center text-xs text-orange-400/70 mt-4 font-medium">
          Você é mais forte que seus sabotadores! 🌟
        </p>
      </div>
    </div>
  );
};
