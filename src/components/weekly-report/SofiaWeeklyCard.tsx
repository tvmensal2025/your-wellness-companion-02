import React from 'react';

interface SofiaWeeklyCardProps {
  userName: string;
  weekStart: string;
  weekEnd: string;
  nutritionScore: number;
  analysis: string;
  recommendations: string[];
  data: {
    mealsCount?: number;
    avgCalories?: number;
    avgProtein?: number;
    avgCarbs?: number;
    avgFats?: number;
    waterAverage?: number;
    topFoods?: string[];
  };
}

export const SofiaWeeklyCard: React.FC<SofiaWeeklyCardProps> = ({
  userName,
  weekStart,
  weekEnd,
  nutritionScore,
  analysis,
  recommendations,
  data
}) => {
  const firstName = userName?.split(' ')[0] || 'Amigo(a)';
  
  const getScoreColor = () => {
    if (nutritionScore >= 80) return 'from-green-400 to-emerald-500';
    if (nutritionScore >= 60) return 'from-lime-400 to-green-500';
    if (nutritionScore >= 40) return 'from-yellow-400 to-lime-500';
    return 'from-orange-400 to-yellow-500';
  };

  const getScoreEmoji = () => {
    if (nutritionScore >= 80) return '🌟';
    if (nutritionScore >= 60) return '💚';
    if (nutritionScore >= 40) return '🌱';
    return '🍀';
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}`;
  };

  return (
    <div 
      className="w-[500px] min-h-[700px] p-6 rounded-3xl relative overflow-hidden"
      style={{
        background: 'linear-gradient(165deg, #134e4a 0%, #115e59 35%, #0f766e 60%, #14532d 100%)',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-green-400/20 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-40 h-40 bg-gradient-to-tr from-lime-500/15 to-transparent rounded-full blur-2xl" />
      <div className="absolute top-1/2 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-400/10 to-transparent rounded-full blur-xl" />

      {/* Header - Sofia Branding */}
      <div className="relative flex items-center gap-4 mb-4 pb-4 border-b border-green-500/20">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center text-4xl shadow-lg shadow-green-500/30">
          🥗
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white tracking-tight">Sofia</h1>
          <p className="text-xs text-green-400/90 font-medium tracking-wide">Sua Nutricionista Pessoal</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">📅 Semana</p>
          <p className="text-sm text-white font-semibold">{formatDate(weekStart)} - {formatDate(weekEnd)}</p>
        </div>
      </div>

      {/* Greeting */}
      <div className="mb-5">
        <p className="text-xl text-white">
          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-lime-400">{firstName}</span>, vamos falar sobre nutrição! 🍎
        </p>
      </div>

      {/* Nutrition Score - Featured */}
      <div className="relative mb-5 p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">Score Nutricional</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${getScoreColor()}`}>
                {nutritionScore}
              </span>
              <span className="text-xl text-gray-500">/100</span>
              <span className="text-3xl ml-2">{getScoreEmoji()}</span>
            </div>
          </div>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-lime-500/20 flex items-center justify-center border-4 border-green-500/30">
            <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${getScoreColor()} flex items-center justify-center shadow-lg`}>
              <span className="text-white text-lg font-bold">{nutritionScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Refeições */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🍽️</span>
            <span className="text-xs text-gray-400">Refeições</span>
          </div>
          <p className="text-xl font-bold text-white">{data.mealsCount || 0}</p>
          <p className="text-xs text-gray-500">registradas</p>
        </div>

        {/* Calorias */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🔥</span>
            <span className="text-xs text-gray-400">Calorias</span>
          </div>
          <p className="text-xl font-bold text-orange-400">{data.avgCalories || 0}</p>
          <p className="text-xs text-gray-500">kcal/dia média</p>
        </div>

        {/* Proteínas */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🥩</span>
            <span className="text-xs text-gray-400">Proteínas</span>
          </div>
          <p className="text-xl font-bold text-red-400">{data.avgProtein || 0}g</p>
          <p className="text-xs text-gray-500">/dia média</p>
        </div>

        {/* Carboidratos */}
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">🍞</span>
            <span className="text-xs text-gray-400">Carboidratos</span>
          </div>
          <p className="text-xl font-bold text-yellow-400">{data.avgCarbs || 0}g</p>
          <p className="text-xs text-gray-500">/dia média</p>
        </div>
      </div>

      {/* Hydration */}
      <div className="mb-5 p-4 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/10 border border-cyan-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💧</span>
            <div>
              <p className="text-sm text-gray-300">Hidratação Média</p>
              <p className="text-2xl font-bold text-cyan-400">
                {data.waterAverage ? (data.waterAverage / 1000).toFixed(1) : '0'}L/dia
              </p>
            </div>
          </div>
          <div className="text-3xl">
            {(data.waterAverage || 0) >= 2000 ? '✅' : '📊'}
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <span className="text-base">📊</span>
          </div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Análise Nutricional
          </h2>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-green-500/20">
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-line line-clamp-5">
            {analysis}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center shadow-lg">
              <span className="text-base">💡</span>
            </div>
            <h2 className="text-sm font-bold text-lime-400 uppercase tracking-wider">
              Dicas da Semana
            </h2>
          </div>
          <div className="space-y-2">
            {recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} className="bg-gradient-to-r from-lime-500/10 to-green-500/5 rounded-xl p-3 border border-lime-500/20">
                <p className="text-sm text-lime-100">
                  <span className="font-bold text-lime-400 mr-2">•</span>
                  {rec.length > 70 ? rec.substring(0, 67) + '...' : rec}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="relative pt-4 border-t border-green-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
              <span className="text-xl">💚</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Sofia</p>
              <p className="text-xs text-gray-400">Sua nutricionista</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-400/70 font-medium">Instituto dos Sonhos</p>
            <p className="text-xs text-gray-500">Alimentação consciente 🌱</p>
          </div>
        </div>
      </div>
    </div>
  );
};
