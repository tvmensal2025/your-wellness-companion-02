import React from 'react';
import { Star, Flame, CheckCircle, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DailyResponsesCardProps {
  userName: string;
  answers: Record<string, string>;
  questions: Array<{ id: string; question: string }>;
  totalPoints: number;
  streakDays: number;
}

export const DailyResponsesCard: React.FC<DailyResponsesCardProps> = ({
  userName,
  answers,
  questions,
  totalPoints,
  streakDays,
}) => {
  const today = format(new Date(), "dd 'de' MMMM", { locale: ptBR });
  const firstName = userName.split(' ')[0] || 'Amigo(a)';

  return (
    <div 
      className="w-[400px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden shadow-2xl"
      style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            🩺
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Dr. Vital</h1>
            <p className="text-emerald-100 text-xs">Instituto dos Sonhos</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Greeting */}
        <div className="text-center space-y-1">
          <p className="text-white text-lg font-semibold">
            Olá, {firstName}! 👋
          </p>
          <p className="text-slate-400 text-sm">
            📋 Suas Respostas • {today}
          </p>
        </div>

        {/* Responses List */}
        <div className="space-y-2 max-h-[280px] overflow-hidden">
          {questions.slice(0, 6).map((question, index) => (
            <div
              key={question.id}
              className="flex items-start gap-3 bg-slate-700/50 rounded-xl px-3 py-2.5"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-300 text-xs font-medium leading-snug truncate">
                  {question.question}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-semibold truncate">
                    {answers[question.id] || 'Respondido'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-6 py-3 bg-slate-700/30 rounded-2xl">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-white font-bold text-lg">+{totalPoints}</span>
            <span className="text-slate-400 text-xs">pts</span>
          </div>
          <div className="w-px h-6 bg-slate-600" />
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            <span className="text-white font-bold text-lg">{streakDays}</span>
            <span className="text-slate-400 text-xs">dias</span>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-2xl p-4 text-center border border-emerald-500/30">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-pink-400" />
            <span className="text-white font-bold text-sm">Missão Concluída!</span>
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            Continue construindo hábitos incríveis! Cada dia você está mais perto dos seus objetivos. 💪
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-slate-500 text-[10px]">
            institutodossonhos.com.br
          </p>
        </div>
      </div>
    </div>
  );
};
