import React from 'react';

interface DrVitalWeeklyCardProps {
  userName: string;
  weekStart: string;
  weekEnd: string;
  healthScore: number;
  analysis: string;
  recommendations: string[];
  data: {
    weight?: { change: number; trend: string };
    water?: { average: number; consistency: number };
    sleep?: { average: number; quality: number };
    mood?: { average: number; energy: number; stress: number };
    exercise?: { totalMinutes: number; days: number };
    missions?: { completed: number; streak: number; points: number };
  };
}

export const DrVitalWeeklyCard: React.FC<DrVitalWeeklyCardProps> = ({
  userName,
  weekStart,
  weekEnd,
  healthScore,
  analysis,
  recommendations,
  data
}) => {
  const firstName = userName?.split(' ')[0] || 'Amigo(a)';
  
  const getScoreColor = () => {
    if (healthScore >= 80) return 'from-emerald-400 to-green-500';
    if (healthScore >= 60) return 'from-blue-400 to-cyan-500';
    if (healthScore >= 40) return 'from-yellow-400 to-orange-500';
    return 'from-orange-400 to-red-500';
  };

  const getScoreEmoji = () => {
    if (healthScore >= 80) return '🌟';
    if (healthScore >= 60) return '✨';
    if (healthScore >= 40) return '💪';
    return '🎯';
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  // Dados formatados
  const weightChange = data.weight?.change ?? 0;
  const waterAvg = data.water?.average ? (data.water.average / 1000).toFixed(1) : '0';
  const sleepAvg = data.sleep?.average?.toFixed(1) || '0';
  const moodAvg = data.mood?.average?.toFixed(1) || '0';
  const exerciseDays = data.exercise?.days || 0;
  const exerciseMinutes = data.exercise?.totalMinutes || 0;
  const missionsCompleted = data.missions?.completed || 0;
  const streak = data.missions?.streak || 0;

  return (
    <div 
      className="w-[500px] min-h-[800px] p-6 rounded-3xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, #0f172a 0%, #1e3a5f 35%, #0f4c75 60%, #1a365d 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-40 h-40 bg-gradient-to-tr from-blue-500/15 to-transparent rounded-full blur-2xl" />
      <div className="absolute top-1/3 right-0 w-32 h-32 bg-gradient-to-bl from-teal-400/10 to-transparent rounded-full blur-xl" />

      {/* Header - Dr. Vital Branding */}
      <div className="relative flex items-center gap-4 mb-4 pb-4 border-b border-emerald-500/20">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/30">
          🩺
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Dr. Vital</h1>
          <p className="text-xs text-emerald-400/90 font-medium tracking-wide">Relatório Semanal Premium</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">📅 Semana</p>
          <p className="text-sm text-white font-semibold">{formatDate(weekStart)} - {formatDate(weekEnd)}</p>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-5">
        <p className="text-xl text-white">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">{firstName}</span>, sua semana foi assim! 📊
        </p>
      </div>

      {/* Health Score - Featured */}
      <div className="relative mb-5 p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Health Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${getScoreColor()}`}>
                {healthScore}
              </span>
              <span className="text-xl text-gray-500">/100</span>
              <span className="text-3xl ml-2">{getScoreEmoji()}</span>
            </div>
          </div>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border-4 border-emerald-500/30">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getScoreColor()} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-xl font-bold">{healthScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* Peso */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-lg">⚖️</span>
            <span className="text-xs text-gray-400">Peso</span>
          </div>
          <p className="text-lg font-bold text-white">
            {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}kg
          </p>
          <p className="text-xs text-gray-500">{weightChange < 0 ? '📉 Perda' : weightChange > 0 ? '📈 Ganho' : '➡️ Estável'}</p>
        </div>

        {/* Água */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-lg">💧</span>
            <span className="text-xs text-gray-400">Água</span>
          </div>
          <p className="text-lg font-bold text-cyan-400">{waterAvg}L</p>
          <p className="text-xs text-gray-500">/dia média</p>
        </div>

        {/* Sono */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-lg">😴</span>
            <span className="text-xs text-gray-400">Sono</span>
          </div>
          <p className="text-lg font-bold text-indigo-400">{sleepAvg}h</p>
          <p className="text-xs text-gray-500">/noite média</p>
        </div>

        {/* Humor */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-lg">😊</span>
            <span className="text-xs text-gray-400">Humor</span>
          </div>
          <p className="text-lg font-bold text-yellow-400">{moodAvg}/10</p>
          <p className="text-xs text-gray-500">média semanal</p>
        </div>

        {/* Exercícios */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-lg">🏃</span>
            <span className="text-xs text-gray-400">Exercício</span>
          </div>
          <p className="text-lg font-bold text-green-400">{exerciseDays}d</p>
          <p className="text-xs text-gray-500">{exerciseMinutes}min total</p>
        </div>

        {/* Missões */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-lg">🎯</span>
            <span className="text-xs text-gray-400">Missões</span>
          </div>
          <p className="text-lg font-bold text-purple-400">{missionsCompleted}/7</p>
          <p className="text-xs text-gray-500">🔥 {streak} streak</p>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <span className="text-base">📋</span>
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Análise Médica
          </h2>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-emerald-500/20">
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line line-clamp-6">
            {analysis}
          </p>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
              <span className="text-base">💡</span>
            </div>
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
              Foco da Semana
            </h2>
          </div>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-xl p-3 border border-amber-500/20">
                <p className="text-sm text-amber-100">
                  <span className="font-bold text-amber-400 mr-2">{i + 1}.</span>
                  {rec.length > 80 ? rec.substring(0, 77) + '...' : rec}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative pt-4 border-t border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
              <span className="text-xl">🩺</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Dr. Vital</p>
              <p className="text-xs text-gray-400">Seu médico pessoal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-400/70 font-medium">Instituto dos Sonhos</p>
            <p className="text-xs text-gray-500">Cuidando da sua saúde ✨</p>
          </div>
        </div>
      </div>
    </div>
  );
};
