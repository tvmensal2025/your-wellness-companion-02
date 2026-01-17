/**
 * Camera Workout Metrics Service
 * 
 * Collects and monitors performance metrics for camera workout sessions.
 * Detects environment issues and provides alerts.
 */

import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetrics {
  fps: number;
  latency: number; // ms
  confidence: number; // 0-1
  timestamp: Date;
}

export interface EnvironmentIssue {
  type: 'lighting' | 'distance' | 'occlusion' | 'fps' | 'latency';
  severity: 'warning' | 'error';
  message: string;
  timestamp: Date;
}

export interface MetricsSnapshot {
  sessionId: string;
  avgFps: number;
  avgLatency: number;
  avgConfidence: number;
  minFps: number;
  maxLatency: number;
  minConfidence: number;
  issues: EnvironmentIssue[];
  timestamp: Date;
}

class MetricsService {
  private metrics: PerformanceMetrics[] = [];
  private issues: EnvironmentIssue[] = [];
  private maxMetricsHistory = 100; // Keep last 100 metrics
  private alertCallbacks: ((issue: EnvironmentIssue) => void)[] = [];

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetricsHistory) {
      this.metrics.shift();
    }

    // Check for issues
    this.detectIssues(metric);
  }

  /**
   * Detect environment and performance issues
   */
  private detectIssues(metric: PerformanceMetrics): void {
    const issues: EnvironmentIssue[] = [];

    // Low FPS
    if (metric.fps < 15) {
      issues.push({
        type: 'fps',
        severity: 'error',
        message: 'FPS muito baixo. Feche outros aplicativos ou reduza a qualidade.',
        timestamp: new Date(),
      });
    } else if (metric.fps < 20) {
      issues.push({
        type: 'fps',
        severity: 'warning',
        message: 'FPS abaixo do ideal. Considere fechar outros aplicativos.',
        timestamp: new Date(),
      });
    }

    // High latency
    if (metric.latency > 500) {
      issues.push({
        type: 'latency',
        severity: 'error',
        message: 'Latência muito alta. Verifique sua conexão com o servidor.',
        timestamp: new Date(),
      });
    } else if (metric.latency > 300) {
      issues.push({
        type: 'latency',
        severity: 'warning',
        message: 'Latência elevada. A detecção pode estar lenta.',
        timestamp: new Date(),
      });
    }

    // Low confidence (poor lighting or occlusion)
    if (metric.confidence < 0.5) {
      issues.push({
        type: 'lighting',
        severity: 'error',
        message: 'Confiança muito baixa. Melhore a iluminação ou ajuste a posição.',
        timestamp: new Date(),
      });
    } else if (metric.confidence < 0.7) {
      issues.push({
        type: 'lighting',
        severity: 'warning',
        message: 'Confiança baixa. Verifique a iluminação e posicionamento.',
        timestamp: new Date(),
      });
    }

    // Store and alert
    issues.forEach(issue => {
      this.issues.push(issue);
      this.alertCallbacks.forEach(callback => callback(issue));
    });

    // Keep only recent issues (last 50)
    if (this.issues.length > 50) {
      this.issues = this.issues.slice(-50);
    }
  }

  /**
   * Get current metrics snapshot
   */
  getSnapshot(): MetricsSnapshot | null {
    if (this.metrics.length === 0) {
      return null;
    }

    const recentMetrics = this.metrics.slice(-30); // Last 30 metrics

    const avgFps = recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;
    const avgLatency = recentMetrics.reduce((sum, m) => sum + m.latency, 0) / recentMetrics.length;
    const avgConfidence = recentMetrics.reduce((sum, m) => sum + m.confidence, 0) / recentMetrics.length;
    const minFps = Math.min(...recentMetrics.map(m => m.fps));
    const maxLatency = Math.max(...recentMetrics.map(m => m.latency));
    const minConfidence = Math.min(...recentMetrics.map(m => m.confidence));

    return {
      sessionId: '', // Will be set by caller
      avgFps: Math.round(avgFps * 10) / 10,
      avgLatency: Math.round(avgLatency),
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      minFps: Math.round(minFps * 10) / 10,
      maxLatency: Math.round(maxLatency),
      minConfidence: Math.round(minConfidence * 100) / 100,
      issues: this.issues.slice(-10), // Last 10 issues
      timestamp: new Date(),
    };
  }

  /**
   * Register alert callback
   */
  onAlert(callback: (issue: EnvironmentIssue) => void): () => void {
    this.alertCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Save metrics snapshot to database
   */
  async saveSnapshot(sessionId: string): Promise<void> {
    const snapshot = this.getSnapshot();
    if (!snapshot) return;

    snapshot.sessionId = sessionId;

    try {
      const { error } = await supabase
        .from('camera_metrics')
        .insert({
          session_id: sessionId,
          avg_fps: snapshot.avgFps,
          avg_latency: snapshot.avgLatency,
          avg_confidence: snapshot.avgConfidence,
          min_fps: snapshot.minFps,
          max_latency: snapshot.maxLatency,
          min_confidence: snapshot.minConfidence,
          issues: snapshot.issues,
          created_at: snapshot.timestamp.toISOString(),
        });

      if (error) {
        console.error('Error saving metrics snapshot:', error);
      }
    } catch (error) {
      console.error('Failed to save metrics snapshot:', error);
    }
  }

  /**
   * Clear all metrics and issues
   */
  clear(): void {
    this.metrics = [];
    this.issues = [];
  }

  /**
   * Get health status
   */
  getHealthStatus(): {
    status: 'good' | 'warning' | 'error';
    message: string;
  } {
    const snapshot = this.getSnapshot();
    if (!snapshot) {
      return { status: 'good', message: 'Aguardando dados...' };
    }

    // Check for critical issues
    const criticalIssues = snapshot.issues.filter(i => i.severity === 'error');
    if (criticalIssues.length > 0) {
      return {
        status: 'error',
        message: criticalIssues[0].message,
      };
    }

    // Check for warnings
    const warnings = snapshot.issues.filter(i => i.severity === 'warning');
    if (warnings.length > 0) {
      return {
        status: 'warning',
        message: warnings[0].message,
      };
    }

    // Check overall metrics
    if (snapshot.avgFps < 20 || snapshot.avgLatency > 300 || snapshot.avgConfidence < 0.7) {
      return {
        status: 'warning',
        message: 'Performance abaixo do ideal',
      };
    }

    return {
      status: 'good',
      message: 'Tudo funcionando bem!',
    };
  }
}

// Singleton instance
export const metricsService = new MetricsService();
