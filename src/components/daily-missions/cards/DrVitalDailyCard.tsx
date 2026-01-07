import React from 'react';

interface DrVitalDailyCardProps {
  userName: string;
  analysis: string;
  recommendation: string;
  totalPoints: number;
  streakDays: number;
  sessionTitle?: string;
}

export const DrVitalDailyCard: React.FC<DrVitalDailyCardProps> = ({
  userName,
  analysis,
  recommendation,
  totalPoints,
  streakDays,
  sessionTitle = "Missões Diárias"
}) => {
  const firstName = userName?.split(' ')[0] || 'Amigo(a)';
  
  return (
    <div 
      className="w-[420px] min-h-[580px] p-6 rounded-3xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-emerald-500/15 to-transparent rounded-full blur-3xl" />
      
      {/* Header - Dr. Vital Branding */}
      <div className="relative flex items-center gap-4 mb-5 pb-4 border-b border-white/10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30">
          🩺
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dr. Vital</h1>
          <p className="text-xs text-emerald-400/90 font-medium tracking-wide">Instituto dos Sonhos</p>
        </div>
        <div className="text-3xl">💚</div>
      </div>

      {/* Session Title */}
      <div className="mb-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/30">
          <span className="text-sm">🎯</span>
          <span className="text-xs font-semibold text-purple-300">{sessionTitle}</span>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-5">
        <p className="text-xl text-white">
          Olá, <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{firstName}</span>! 👋
        </p>
        <p className="text-sm text-gray-400 mt-1">Aqui está sua análise personalizada</p>
      </div>

      {/* Analysis Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-base">📊</span>
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Análise do Seu Dia
          </h2>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
            {analysis}
          </p>
        </div>
      </div>

      {/* Recommendation Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <span className="text-base">💡</span>
          </div>
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
            Recomendação para Amanhã
          </h2>
        </div>
        <div className="bg-gradient-to-r from-amber-500/15 to-orange-500/10 rounded-2xl p-4 border border-amber-500/30">
          <p className="text-sm text-amber-100 leading-relaxed font-medium">
            {recommendation}
          </p>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="relative mt-auto pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <div className="text-xl font-bold text-white">+{totalPoints}</div>
                <div className="text-xs text-gray-400">pontos</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <span className="text-xl">🔥</span>
              </div>
              <div>
                <div className="text-xl font-bold text-orange-400">{streakDays}</div>
                <div className="text-xs text-gray-400">dias</div>
              </div>
            </div>
          </div>
          <div className="text-4xl">💪</div>
        </div>
        <p className="text-center text-xs text-emerald-400/70 mt-4 font-medium">
          Continue assim! Seu corpo agradece. 🌟
        </p>
      </div>
    </div>
  );
};
