import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CommunityIntegrationProps {
  totalUsers: number;
  totalPoints: number;
  totalMissions: number;
}

export function CommunityIntegration({ totalUsers, totalPoints, totalMissions }: CommunityIntegrationProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'position' | 'points' | 'missions' | 'streak'>('position');

  return (
    <Card className="border-0 bg-background shadow-md animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Users className="w-5 h-5 text-primary" />
            <span>Comunidade</span>
          </CardTitle>

          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-border/60"
            onClick={() => navigate('/health-feed')}
            aria-label="Ir para comunidade"
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-4">
        {/* Banner Top 10 */}
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">
          Top 10 membros mais engajados
        </div>

        {/* Busca membro */}
        <div className="relative mt-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 5a6 6 0 100 12 6 6 0 000-12z"
              />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar membro..."
            className="h-9 w-full rounded-full border border-border bg-background px-9 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Abas de filtro (somente UI por enquanto) */}
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          {[
            { id: 'position', label: 'Posição' },
            { id: 'points', label: 'Pontos' },
            { id: 'missions', label: 'Missões' },
            { id: 'streak', label: 'Sequência' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`rounded-full px-4 py-1.5 transition-all text-xs ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover-scale'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Card do primeiro colocado (placeholder) */}
        <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-500">
              <span className="text-sm font-semibold">1º</span>
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Seu destaque da semana</p>
              <p className="text-xs text-muted-foreground">
                Mantenha suas missões em dia para aparecer aqui
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div className="font-semibold text-foreground">{totalPoints.toLocaleString()} pts</div>
            <div>Média da comunidade</div>
          </div>
        </div>

        {/* Resumo da comunidade */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-2xl bg-card px-2 py-3 shadow-sm">
            <div className="text-base font-bold text-primary">{totalUsers}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">Membros</div>
          </div>
          <div className="rounded-2xl bg-card px-2 py-3 shadow-sm">
            <div className="text-base font-bold text-emerald-600">{totalMissions}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">Missões</div>
          </div>
          <div className="rounded-2xl bg-card px-2 py-3 shadow-sm">
            <div className="text-base font-bold text-amber-500">{totalPoints.toLocaleString()}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">Pontos</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
