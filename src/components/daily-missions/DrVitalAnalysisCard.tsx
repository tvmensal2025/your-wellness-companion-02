import React from 'react';

interface DrVitalAnalysisCardProps {
  userName: string;
  analysis: string;
  recommendation: string;
  totalPoints: number;
  streakDays: number;
  answers: Record<string, string>;
}

export const DrVitalAnalysisCard: React.FC<DrVitalAnalysisCardProps> = ({
  userName,
  analysis,
  recommendation,
  totalPoints,
  streakDays,
  answers
}) => {
  const firstName = userName?.split(' ')[0] || 'Amigo(a)';
  
  return (
    <div 
      className="w-[400px] min-h-[500px] p-6 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header - Dr. Vital Branding */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-2xl shadow-lg">
          🩺
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Dr. Vital</h1>
          <p className="text-xs text-emerald-400/80">MaxNutrition</p>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-5">
        <p className="text-lg text-white">
          Olá, <span className="font-semibold text-emerald-400">{firstName}</span>! 👋
        </p>
      </div>

      {/* Analysis Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">📊</span>
          <h2 className="text-sm font-bold text-white uppercase tracking-wide">
            Análise do Seu Dia
          </h2>
        </div>
        <div className="bg-white/5 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">
            {analysis}
          </p>
        </div>
      </div>

      {/* Recommendation Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💡</span>
          <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
            Recomendação para Amanhã
          </h2>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/20">
          <p className="text-sm text-amber-100 leading-relaxed">
            {recommendation}
          </p>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-auto pt-4 border-t border-white/10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xl">✨</span>
              <span className="text-lg font-bold text-white">+{totalPoints}</span>
              <span className="text-xs text-gray-400">pontos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl">🔥</span>
              <span className="text-lg font-bold text-orange-400">{streakDays}</span>
              <span className="text-xs text-gray-400">dias</span>
            </div>
          </div>
          <span className="text-2xl">💪</span>
        </div>
        <p className="text-center text-xs text-emerald-400/60 mt-3">
          Continue assim! Seu corpo agradece.
        </p>
      </div>
    </div>
  );
};
