// =====================================================
// HEALTH TIMELINE COMPONENT
// =====================================================
// Timeline visual de eventos de saúde
// Requirements: 8.1, 8.2, 8.3, 8.4
// =====================================================

import { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Clock, 
  Scale,
  FileText,
  Trophy,
  Target,
  Stethoscope,
  Pill,
  TrendingUp,
  Star,
  Flame,
  ChevronDown,
  Filter,
  Calendar,
} from 'lucide-react';
import { useHealthTimeline } from '@/hooks/dr-vital/useHealthTimeline';
import type { TimelineEvent, TimelineEventType } from '@/types/dr-vital-revolution';

// =====================================================
// EVENT ICON MAPPING
// =====================================================

const EVENT_ICONS: Record<TimelineEventType, React.ReactNode> = {
  weight_change: <Scale className="w-4 h-4" />,
  exam_result: <FileText className="w-4 h-4" />,
  achievement: <Trophy className="w-4 h-4" />,
  goal_reached: <Target className="w-4 h-4" />,
  consultation: <Stethoscope className="w-4 h-4" />,
  medication_change: <Pill className="w-4 h-4" />,
  level_up: <TrendingUp className="w-4 h-4" />,
  streak_milestone: <Flame className="w-4 h-4" />,
  prediction_improved: <Star className="w-4 h-4" />,
};

const EVENT_COLORS: Record<TimelineEventType, string> = {
  weight_change: 'bg-blue-500',
  exam_result: 'bg-purple-500',
  achievement: 'bg-yellow-500',
  goal_reached: 'bg-green-500',
  consultation: 'bg-cyan-500',
  medication_change: 'bg-orange-500',
  level_up: 'bg-primary',
  streak_milestone: 'bg-red-500',
  prediction_improved: 'bg-emerald-500',
};

const EVENT_LABELS: Record<TimelineEventType, string> = {
  weight_change: 'Peso',
  exam_result: 'Exame',
  achievement: 'Conquista',
  goal_reached: 'Meta',
  consultation: 'Consulta',
  medication_change: 'Medicação',
  level_up: 'Nível',
  streak_milestone: 'Streak',
  prediction_improved: 'Previsão',
};

// =====================================================
// TIMELINE EVENT CARD
// =====================================================

interface TimelineEventCardProps {
  event: TimelineEvent;
  isFirst?: boolean;
  isLast?: boolean;
  onClick?: () => void;
}

function TimelineEventCard({ event, isFirst, isLast, onClick }: TimelineEventCardProps) {
  const icon = EVENT_ICONS[event.type] || <Clock className="w-4 h-4" />;
  const color = EVENT_COLORS[event.type] || 'bg-muted';

  const formattedDate = new Date(event.eventDate).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const formattedTime = new Date(event.eventDate).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="relative flex gap-4">
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-white z-10',
          color,
          event.isMilestone && 'ring-4 ring-yellow-400/50'
        )}>
          {icon}
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-border min-h-[40px]" />
        )}
      </div>

      {/* Event Content */}
      <Card 
        className={cn(
          'flex-1 mb-4 cursor-pointer hover:shadow-md transition-shadow',
          event.isMilestone && 'border-yellow-400/50 bg-yellow-500/5'
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {event.isMilestone && (
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                )}
                <h4 className="font-medium truncate">{event.title}</h4>
              </div>
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>
              )}
            </div>
            <div className="text-right text-xs text-muted-foreground flex-shrink-0">
              <p>{formattedDate}</p>
              <p>{formattedTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// =====================================================
// TIMELINE FILTERS
// =====================================================

interface TimelineFiltersProps {
  selectedTypes: TimelineEventType[];
  onTypesChange: (types: TimelineEventType[]) => void;
  milestonesOnly: boolean;
  onMilestonesOnlyChange: (value: boolean) => void;
}

function TimelineFilters({ 
  selectedTypes, 
  onTypesChange, 
  milestonesOnly, 
  onMilestonesOnlyChange,
}: TimelineFiltersProps) {
  const allTypes: TimelineEventType[] = [
    'weight_change', 'exam_result', 'achievement', 'goal_reached',
    'consultation', 'medication_change', 'level_up', 'streak_milestone', 'prediction_improved',
  ];

  const toggleType = (type: TimelineEventType) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter(t => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
  };

  const selectAll = () => onTypesChange(allTypes);
  const clearAll = () => onTypesChange([]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Filtrar por tipo</span>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={selectAll} className="h-7 text-xs">
            Todos
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs">
            Limpar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {allTypes.map(type => (
          <Button
            key={type}
            variant={selectedTypes.includes(type) ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleType(type)}
            className="h-7 text-xs"
          >
            {EVENT_LABELS[type]}
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant={milestonesOnly ? 'default' : 'outline'}
          size="sm"
          onClick={() => onMilestonesOnlyChange(!milestonesOnly)}
          className="h-7"
        >
          <Star className="w-3 h-3 mr-1" />
          Apenas marcos
        </Button>
      </div>
    </div>
  );
}

// =====================================================
// MAIN COMPONENT
// =====================================================

interface HealthTimelineProps {
  className?: string;
  maxEvents?: number;
  showFilters?: boolean;
}

export function HealthTimeline({ 
  className, 
  maxEvents,
  showFilters = true,
}: HealthTimelineProps) {
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    events,
    milestones,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    filter,
    setFilter,
    error,
  } = useHealthTimeline();

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleTypesChange = useCallback((types: TimelineEventType[]) => {
    setFilter(prev => ({ ...prev, types: types.length > 0 ? types : undefined }));
  }, [setFilter]);

  const handleMilestonesOnlyChange = useCallback((value: boolean) => {
    setFilter(prev => ({ ...prev, milestonesOnly: value }));
  }, [setFilter]);

  const displayEvents = maxEvents ? events.slice(0, maxEvents) : events;

  if (isLoading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 h-20 bg-muted rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-medium">Erro ao carregar timeline</h3>
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar seus eventos de saúde.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Linha do Tempo
          </CardTitle>
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilterPanel(!showFilterPanel)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {milestones.length} marcos • {events.length} eventos
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filters */}
        {showFilters && showFilterPanel && (
          <TimelineFilters
            selectedTypes={filter.types || []}
            onTypesChange={handleTypesChange}
            milestonesOnly={filter.milestonesOnly || false}
            onMilestonesOnlyChange={handleMilestonesOnlyChange}
          />
        )}

        {/* Events */}
        {displayEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-medium">Nenhum evento encontrado</h3>
            <p className="text-sm text-muted-foreground">
              {filter.types?.length || filter.milestonesOnly
                ? 'Tente ajustar os filtros'
                : 'Seus eventos de saúde aparecerão aqui'}
            </p>
          </div>
        ) : (
          <div className="relative">
            {displayEvents.map((event, index) => (
              <TimelineEventCard
                key={event.id}
                event={event}
                isFirst={index === 0}
                isLast={index === displayEvents.length - 1}
                onClick={() => setSelectedEvent(event)}
              />
            ))}
          </div>
        )}

        {/* Load More */}
        {!maxEvents && hasNextPage && (
          <div ref={loadMoreRef} className="flex justify-center py-4">
            {isFetchingNextPage ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Carregando mais...
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => fetchNextPage()}>
                <ChevronDown className="w-4 h-4 mr-1" />
                Carregar mais
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HealthTimeline;
