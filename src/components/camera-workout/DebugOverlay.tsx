/**
 * Debug Overlay Component
 * 
 * Displays detailed debug information for camera workout sessions.
 * Shows keypoints, angles, metrics, and system decisions in real-time.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Activity, Zap, Target } from 'lucide-react';
import { metricsService, type PerformanceMetrics } from '@/services/camera-workout/metricsService';
import { cn } from '@/lib/utils';

interface DebugOverlayProps {
  keypoints?: Array<{ x: number; y: number; confidence: number }>;
  angles?: Record<string, number>;
  currentPhase?: 'up' | 'down' | 'transition';
  formScore?: number;
  repCount?: number;
}

export function DebugOverlay({
  keypoints = [],
  angles = {},
  currentPhase,
  formScore,
  repCount,
}: DebugOverlayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    // Update metrics every second
    const interval = setInterval(() => {
      const snapshot = metricsService.getSnapshot();
      if (snapshot) {
        setMetrics({
          fps: snapshot.avgFps,
          latency: snapshot.avgLatency,
          confidence: snapshot.avgConfidence,
          timestamp: new Date(),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-background/80 backdrop-blur"
      >
        <Eye className="h-4 w-4 mr-2" />
        Debug
      </Button>
    );
  }

  const getPhaseColor = (phase?: string) => {
    switch (phase) {
      case 'up':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'down':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'transition':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getFormScoreColor = (score?: number) => {
    if (!score) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getMetricColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'text-green-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <Card className="fixed top-4 right-4 z-50 w-80 bg-background/95 backdrop-blur border-border">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">Debug Mode</span>
          </div>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Zap className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Performance</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="space-y-1">
              <div className="text-muted-foreground">FPS</div>
              <div className={cn('font-mono font-bold', metrics && getMetricColor(metrics.fps, { good: 25, warning: 20 }))}>
                {metrics?.fps.toFixed(1) || '--'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Latency</div>
              <div className={cn('font-mono font-bold', metrics && getMetricColor(500 - metrics.latency, { good: 200, warning: 100 }))}>
                {metrics?.latency.toFixed(0) || '--'}ms
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Confidence</div>
              <div className={cn('font-mono font-bold', metrics && getMetricColor(metrics.confidence * 100, { good: 80, warning: 70 }))}>
                {metrics ? (metrics.confidence * 100).toFixed(0) : '--'}%
              </div>
            </div>
          </div>
        </div>

        {/* Rep Counter */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Rep Counter</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="space-y-1">
              <div className="text-muted-foreground">Count</div>
              <div className="font-mono font-bold text-foreground">
                {repCount ?? '--'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Phase</div>
              <Badge className={getPhaseColor(currentPhase)}>
                {currentPhase || 'idle'}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Form</div>
              <div className={cn('font-mono font-bold', getFormScoreColor(formScore))}>
                {formScore?.toFixed(0) || '--'}
              </div>
            </div>
          </div>
        </div>

        {/* Angles */}
        {Object.keys(angles).length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">Angles</div>
            <div className="space-y-1">
              {Object.entries(angles).map(([name, value]) => (
                <div key={name} className="flex justify-between text-xs">
                  <span className="text-muted-foreground capitalize">
                    {name.replace('_', ' ')}
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {value.toFixed(1)}°
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keypoints */}
        {keypoints.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Keypoints ({keypoints.length})
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {keypoints.map((kp, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Point {index}</span>
                  <span className="font-mono text-foreground">
                    ({kp.x.toFixed(0)}, {kp.y.toFixed(0)})
                    <span className={cn('ml-2', getMetricColor(kp.confidence * 100, { good: 80, warning: 70 }))}>
                      {(kp.confidence * 100).toFixed(0)}%
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Health Status */}
        <div className="pt-2 border-t border-border">
          <div className="text-xs text-muted-foreground">
            {metricsService.getHealthStatus().message}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
